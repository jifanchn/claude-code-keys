const KeyManager = require('../../src/keyManager')
const Storage = require('../../lib/storage')
const Validators = require('../../lib/validators')

jest.mock('../../lib/storage')
jest.mock('../../lib/validators')

describe('KeyManager', () => {
  let keyManager
  let mockStorage

  beforeEach(() => {
    mockStorage = {
      init: jest.fn().mockResolvedValue(),
      loadKeys: jest.fn().mockResolvedValue([]),
      saveKeys: jest.fn().mockResolvedValue(),
      getCurrentKey: jest.fn().mockResolvedValue(null),
      setCurrentKey: jest.fn().mockResolvedValue()
    }
    Storage.mockImplementation(() => mockStorage)
    Validators.validateKeyConfiguration = jest.fn().mockReturnValue(true)

    keyManager = new KeyManager()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('init', () => {
    test('should initialize storage', async () => {
      await keyManager.init()
      expect(mockStorage.init).toHaveBeenCalled()
    })
  })

  describe('addKey', () => {
    test('should add new key successfully', async () => {
      const mockKeys = []
      mockStorage.loadKeys.mockResolvedValue(mockKeys)
      mockStorage.setCurrentKey.mockResolvedValue()

      const result = await keyManager.addKey('test', 'https://api.test.com', 'sk-ant-test-key')

      expect(Validators.validateKeyConfiguration).toHaveBeenCalled()
      expect(mockStorage.saveKeys).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'test',
          ANTHROPIC_BASE_URL: 'https://api.test.com',
          ANTHROPIC_API_KEY: 'sk-ant-test-key',
          created: expect.any(String)
        })
      ])
      expect(mockStorage.setCurrentKey).toHaveBeenCalledWith('test')
      expect(result.name).toBe('test')
    })

    test('should throw error if key name already exists', async () => {
      const existingKeys = [{ name: 'test', ANTHROPIC_BASE_URL: 'url', ANTHROPIC_API_KEY: 'key' }]
      mockStorage.loadKeys.mockResolvedValue(existingKeys)

      await expect(keyManager.addKey('test', 'https://api.test.com', 'sk-ant-test-key'))
        .rejects.toThrow('Key with name "test" already exists')
    })

    test('should not set as current key if other keys exist', async () => {
      const existingKeys = [{ name: 'existing', ANTHROPIC_BASE_URL: 'url', ANTHROPIC_API_KEY: 'key' }]
      mockStorage.loadKeys.mockResolvedValue(existingKeys)

      await keyManager.addKey('test', 'https://api.test.com', 'sk-ant-test-key')

      expect(mockStorage.setCurrentKey).not.toHaveBeenCalled()
    })

    test('should throw validation error', async () => {
      Validators.validateKeyConfiguration.mockImplementation(() => {
        throw new Error('Invalid configuration')
      })

      await expect(keyManager.addKey('test', 'invalid', 'invalid'))
        .rejects.toThrow('Invalid configuration')
    })
  })

  describe('listKeys', () => {
    test('should return keys with active status', async () => {
      const mockKeys = [
        { name: 'test1', ANTHROPIC_BASE_URL: 'url1', ANTHROPIC_API_KEY: 'key1' },
        { name: 'test2', ANTHROPIC_BASE_URL: 'url2', ANTHROPIC_API_KEY: 'key2' }
      ]
      mockStorage.loadKeys.mockResolvedValue(mockKeys)
      mockStorage.getCurrentKey.mockResolvedValue('test1')

      const result = await keyManager.listKeys()

      expect(result).toEqual([
        { ...mockKeys[0], isActive: true },
        { ...mockKeys[1], isActive: false }
      ])
    })
  })

  describe('getKey', () => {
    test('should return specific key', async () => {
      const mockKeys = [
        { name: 'test1', ANTHROPIC_BASE_URL: 'url1', ANTHROPIC_API_KEY: 'key1' }
      ]
      mockStorage.loadKeys.mockResolvedValue(mockKeys)

      const result = await keyManager.getKey('test1')

      expect(result).toEqual(mockKeys[0])
    })

    test('should throw error if key not found', async () => {
      mockStorage.loadKeys.mockResolvedValue([])

      await expect(keyManager.getKey('nonexistent'))
        .rejects.toThrow('Key "nonexistent" not found')
    })
  })

  describe('getCurrentKey', () => {
    test('should return current key', async () => {
      const mockKey = { name: 'test', ANTHROPIC_BASE_URL: 'url', ANTHROPIC_API_KEY: 'key' }
      mockStorage.getCurrentKey.mockResolvedValue('test')
      mockStorage.loadKeys.mockResolvedValue([mockKey])

      const result = await keyManager.getCurrentKey()

      expect(result).toEqual(mockKey)
    })

    test('should return null if no current key', async () => {
      mockStorage.getCurrentKey.mockResolvedValue(null)

      const result = await keyManager.getCurrentKey()

      expect(result).toBe(null)
    })
  })

  describe('switchKey', () => {
    test('should switch to existing key', async () => {
      const mockKey = { name: 'test', ANTHROPIC_BASE_URL: 'url', ANTHROPIC_API_KEY: 'key' }
      mockStorage.loadKeys.mockResolvedValue([mockKey])

      const result = await keyManager.switchKey('test')

      expect(mockStorage.setCurrentKey).toHaveBeenCalledWith('test')
      expect(result).toEqual(mockKey)
    })

    test('should throw error if key does not exist', async () => {
      mockStorage.loadKeys.mockResolvedValue([])

      await expect(keyManager.switchKey('nonexistent'))
        .rejects.toThrow('Key "nonexistent" not found')
    })
  })

  describe('deleteKey', () => {
    test('should delete key and set new current key', async () => {
      const mockKeys = [
        { name: 'test1', ANTHROPIC_BASE_URL: 'url1', ANTHROPIC_API_KEY: 'key1' },
        { name: 'test2', ANTHROPIC_BASE_URL: 'url2', ANTHROPIC_API_KEY: 'key2' }
      ]
      mockStorage.loadKeys.mockResolvedValue(mockKeys)
      mockStorage.getCurrentKey.mockResolvedValue('test1')

      const result = await keyManager.deleteKey('test1')

      expect(mockStorage.saveKeys).toHaveBeenCalledWith([expect.objectContaining({
        name: 'test2',
        ANTHROPIC_BASE_URL: 'url2',
        ANTHROPIC_API_KEY: 'key2'
      })])
      expect(mockStorage.setCurrentKey).toHaveBeenCalledWith('test2')
      expect(result).toEqual({
        name: 'test1',
        ANTHROPIC_BASE_URL: 'url1',
        ANTHROPIC_API_KEY: 'key1'
      })
    })

    test('should set current key to null if no keys remain', async () => {
      const mockKeys = [{ name: 'test1', ANTHROPIC_BASE_URL: 'url1', ANTHROPIC_API_KEY: 'key1' }]
      mockStorage.loadKeys.mockResolvedValue(mockKeys)
      mockStorage.getCurrentKey.mockResolvedValue('test1')

      await keyManager.deleteKey('test1')

      expect(mockStorage.saveKeys).toHaveBeenCalledWith([])
      expect(mockStorage.setCurrentKey).toHaveBeenCalledWith(null)
    })

    test('should throw error if key not found', async () => {
      mockStorage.loadKeys.mockResolvedValue([])

      await expect(keyManager.deleteKey('nonexistent'))
        .rejects.toThrow('Key "nonexistent" not found')
    })
  })

  describe('hasKeys', () => {
    test('should return true if keys exist', async () => {
      mockStorage.loadKeys.mockResolvedValue([{ name: 'test' }])

      const result = await keyManager.hasKeys()

      expect(result).toBe(true)
    })

    test('should return false if no keys exist', async () => {
      mockStorage.loadKeys.mockResolvedValue([])

      const result = await keyManager.hasKeys()

      expect(result).toBe(false)
    })
  })

  describe('getKeyCount', () => {
    test('should return correct key count', async () => {
      mockStorage.loadKeys.mockResolvedValue([{}, {}, {}])

      const result = await keyManager.getKeyCount()

      expect(result).toBe(3)
    })
  })
})
