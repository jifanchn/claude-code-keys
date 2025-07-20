const Validators = require('../../lib/validators')

describe('Validators', () => {
  describe('validateKeyName', () => {
    test('should validate valid key names', () => {
      expect(Validators.validateKeyName('valid-name')).toBe('valid-name')
      expect(Validators.validateKeyName('valid_name')).toBe('valid_name')
      expect(Validators.validateKeyName('Valid123')).toBe('Valid123')
      expect(Validators.validateKeyName('  test  ')).toBe('test')
    })

    test('should reject invalid key names', () => {
      expect(() => Validators.validateKeyName('')).toThrow('Key name is required and must be a string')
      expect(() => Validators.validateKeyName('   ')).toThrow('Key name cannot be empty')
      expect(() => Validators.validateKeyName('a'.repeat(51))).toThrow('Key name must be 50 characters or less')
      expect(() => Validators.validateKeyName('invalid name')).toThrow('Key name can only contain letters, numbers, underscores, and hyphens')
      expect(() => Validators.validateKeyName('invalid@name')).toThrow('Key name can only contain letters, numbers, underscores, and hyphens')
      expect(() => Validators.validateKeyName(null)).toThrow('Key name is required and must be a string')
    })
  })

  describe('validateApiKey', () => {
    test('should validate valid API keys', () => {
      expect(Validators.validateApiKey('sk-ant-valid-key-here')).toBe('sk-ant-valid-key-here')
      expect(Validators.validateApiKey('  sk-ant-valid-key  ')).toBe('sk-ant-valid-key')
      expect(Validators.validateApiKey('kimi-api-key-123456')).toBe('kimi-api-key-123456')
      expect(Validators.validateApiKey('any-provider-key')).toBe('any-provider-key')
    })

    test('should reject invalid API keys', () => {
      expect(() => Validators.validateApiKey('')).toThrow('API key is required and must be a string')
      expect(() => Validators.validateApiKey('   ')).toThrow('API key cannot be empty')
      expect(() => Validators.validateApiKey(null)).toThrow('API key is required and must be a string')
    })
  })

  describe('validateBaseUrl', () => {
    test('should validate valid URLs', () => {
      expect(Validators.validateBaseUrl('https://api.anthropic.com')).toBe('https://api.anthropic.com')
      expect(Validators.validateBaseUrl('http://localhost:3000/')).toBe('http://localhost:3000')
      expect(Validators.validateBaseUrl('  https://api.anthropic.com  ')).toBe('https://api.anthropic.com')
    })

    test('should reject invalid URLs', () => {
      expect(() => Validators.validateBaseUrl('')).toThrow('Base URL is required and must be a string')
      expect(() => Validators.validateBaseUrl('ftp://invalid.com')).toThrow('Base URL must use HTTP or HTTPS protocol')
      expect(() => Validators.validateBaseUrl('not-a-url')).toThrow('Invalid URL format')
      expect(() => Validators.validateBaseUrl(null)).toThrow('Base URL is required and must be a string')
    })
  })

  describe('validateKeyConfiguration', () => {
    test('should validate complete key configuration', () => {
      const validConfig = {
        name: 'test-key',
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
        ANTHROPIC_API_KEY: 'sk-ant-valid-key-1234567890'
      }
      expect(Validators.validateKeyConfiguration(validConfig)).toBe(true)
    })

    test('should reject invalid configurations', () => {
      const invalidConfig = {
        name: 'invalid name',
        ANTHROPIC_BASE_URL: 'ftp://invalid.com',
        ANTHROPIC_API_KEY: 'invalid-key'
      }
      expect(() => Validators.validateKeyConfiguration(invalidConfig)).toThrow()
    })
  })

  describe('maskApiKey', () => {
    test('should mask API keys correctly', () => {
      expect(Validators.maskApiKey('sk-ant-very-long-key-1234567890')).toBe('sk-ant-v********7890')
      expect(Validators.maskApiKey('sk-ant-short')).toBe('sk-ant-s****hort')
      expect(Validators.maskApiKey('short')).toBe('***')
      expect(Validators.maskApiKey('')).toBe('***')
    })
  })
})
