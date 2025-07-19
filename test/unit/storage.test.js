const fs = require('fs-extra')
const path = require('path')
const YAML = require('yaml')
const Storage = require('../../lib/storage')

jest.mock('fs-extra')
jest.mock('os', () => ({
  homedir: () => '/mock/home'
}))

describe('Storage', () => {
  let storage
  const mockConfigDir = '/mock/home/.claude-code-keys'
  const mockConfigFile = path.join(mockConfigDir, 'config.yaml')
  const mockKeysFile = path.join(mockConfigDir, 'keys.yaml')

  beforeEach(() => {
    storage = new Storage()
    jest.clearAllMocks()
  })

  describe('init', () => {
    test('should create config directory and files', async () => {
      fs.ensureDir.mockResolvedValue()
      fs.pathExists.mockResolvedValue(false)
      fs.writeFile.mockResolvedValue()

      await storage.init()

      expect(fs.ensureDir).toHaveBeenCalledWith(mockConfigDir, { mode: 0o700 })
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigFile,
        expect.stringContaining('current_key: null'),
        { mode: 0o600 }
      )
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockKeysFile,
        expect.stringContaining('keys: []'),
        { mode: 0o600 }
      )
    })

    test('should not overwrite existing files', async () => {
      fs.ensureDir.mockResolvedValue()
      fs.pathExists.mockResolvedValue(true)

      await storage.init()

      expect(fs.writeFile).not.toHaveBeenCalled()
    })
  })

  describe('loadConfig', () => {
    test('should load config from file', async () => {
      const mockConfig = { config: { current_key: 'test' } }
      fs.readFile.mockResolvedValue(YAML.stringify(mockConfig))

      const result = await storage.loadConfig()

      expect(result).toEqual(mockConfig)
      expect(fs.readFile).toHaveBeenCalledWith(mockConfigFile, 'utf8')
    })

    test('should throw error if config loading fails', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'))

      await expect(storage.loadConfig()).rejects.toThrow('Failed to load config')
    })
  })

  describe('saveConfig', () => {
    test('should save config to file', async () => {
      const mockConfig = { config: { current_key: 'test' } }
      fs.writeFile.mockResolvedValue()

      await storage.saveConfig(mockConfig)

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigFile,
        YAML.stringify(mockConfig),
        { mode: 0o600 }
      )
    })

    test('should throw error if config saving fails', async () => {
      fs.writeFile.mockRejectedValue(new Error('Permission denied'))

      await expect(storage.saveConfig({})).rejects.toThrow('Failed to save config')
    })
  })

  describe('loadKeys', () => {
    test('should load keys from file', async () => {
      const mockKeys = [{ name: 'test', ANTHROPIC_API_KEY: 'key' }]
      fs.readFile.mockResolvedValue(YAML.stringify({ keys: mockKeys }))

      const result = await storage.loadKeys()

      expect(result).toEqual(mockKeys)
    })

    test('should return empty array if no keys', async () => {
      fs.readFile.mockResolvedValue(YAML.stringify({}))

      const result = await storage.loadKeys()

      expect(result).toEqual([])
    })
  })

  describe('saveKeys', () => {
    test('should save keys to file', async () => {
      const mockKeys = [{ name: 'test' }]
      fs.writeFile.mockResolvedValue()

      await storage.saveKeys(mockKeys)

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockKeysFile,
        YAML.stringify({ keys: mockKeys }),
        { mode: 0o600 }
      )
    })
  })

  describe('getCurrentKey', () => {
    test('should return current key name', async () => {
      const mockConfig = { config: { current_key: 'test' } }
      fs.readFile.mockResolvedValue(YAML.stringify(mockConfig))

      const result = await storage.getCurrentKey()

      expect(result).toBe('test')
    })

    test('should return null if no current key', async () => {
      const mockConfig = { config: {} }
      fs.readFile.mockResolvedValue(YAML.stringify(mockConfig))

      const result = await storage.getCurrentKey()

      expect(result).toBe(null)
    })
  })

  describe('setCurrentKey', () => {
    test('should set current key', async () => {
      const mockConfig = { config: { current_key: 'old' } }
      fs.readFile.mockResolvedValue(YAML.stringify(mockConfig))
      fs.writeFile.mockResolvedValue()

      await storage.setCurrentKey('new')

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigFile,
        expect.stringContaining('current_key: new'),
        { mode: 0o600 }
      )
    })
  })
})
