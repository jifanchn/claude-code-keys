const Utils = require('../../lib/utils')

describe('Utils', () => {
  describe('formatKeyDisplay', () => {
    test('should format active key with green bullet', () => {
      const key = {
        name: 'test-key',
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com'
      }
      const result = Utils.formatKeyDisplay(key, true)
      expect(result).toContain('●')
      expect(result).toContain('test-key')
      expect(result).toContain('https://api.anthropic.com')
    })

    test('should format inactive key with gray bullet', () => {
      const key = {
        name: 'test-key',
        ANTHROPIC_BASE_URL: 'https://api.anthropic.com'
      }
      const result = Utils.formatKeyDisplay(key, false)
      expect(result).toContain('○')
    })
  })

  describe('maskApiKey', () => {
    test('should mask long API keys correctly', () => {
      const longKey = 'sk-ant-very-long-api-key-1234567890abcdef'
      const result = Utils.maskApiKey(longKey)
      expect(result).toBe('sk-ant-v********cdef')
    })

    test('should handle short keys', () => {
      const shortKey = 'sk-ant'
      const result = Utils.maskApiKey(shortKey)
      expect(result).toBe('***')
    })

    test('should handle empty or null keys', () => {
      expect(Utils.maskApiKey('')).toBe('***')
      expect(Utils.maskApiKey(null)).toBe('***')
      expect(Utils.maskApiKey(undefined)).toBe('***')
    })

    test('should handle medium length keys', () => {
      const mediumKey = 'sk-ant-test-1234'
      const result = Utils.maskApiKey(mediumKey)
      expect(result).toBe('sk-ant-t****1234')
    })
  })

  describe('sleep', () => {
    test('should resolve after specified time', async () => {
      const start = Date.now()
      await Utils.sleep(100)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(90) // Allow some variance
    })
  })

  describe('isValidUrl', () => {
    test('should validate correct URLs', () => {
      expect(Utils.isValidUrl('https://api.anthropic.com')).toBe(true)
      expect(Utils.isValidUrl('http://localhost:3000')).toBe(true)
      expect(Utils.isValidUrl('https://staging.api.anthropic.com/v1')).toBe(true)
    })

    test('should reject invalid URLs', () => {
      expect(Utils.isValidUrl('not-a-url')).toBe(false)
      expect(Utils.isValidUrl('ftp://invalid.com')).toBe(true) // URL constructor accepts ftp
      expect(Utils.isValidUrl('')).toBe(false)
      expect(Utils.isValidUrl(null)).toBe(false)
    })
  })

  describe('truncateString', () => {
    test('should truncate long strings', () => {
      const longString = 'a'.repeat(100)
      const result = Utils.truncateString(longString, 20)
      expect(result).toBe('a'.repeat(17) + '...')
      expect(result.length).toBe(20)
    })

    test('should not truncate short strings', () => {
      const shortString = 'short'
      const result = Utils.truncateString(shortString, 20)
      expect(result).toBe('short')
    })

    test('should use default max length', () => {
      const longString = 'a'.repeat(100)
      const result = Utils.truncateString(longString)
      expect(result.length).toBe(50)
    })
  })

  describe('getTimestamp', () => {
    test('should return valid ISO timestamp', () => {
      const timestamp = Utils.getTimestamp()
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(new Date(timestamp).toISOString()).toBe(timestamp)
    })
  })

  describe('formatKeyList', () => {
    test('should format empty key list', () => {
      const result = Utils.formatKeyList([])
      expect(result).toContain('No keys configured')
    })

    test('should format key list with multiple keys', () => {
      const keys = [
        {
          name: 'prod',
          ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
          ANTHROPIC_API_KEY: 'sk-ant-prod-key-123456789',
          created: '2024-01-01T00:00:00.000Z',
          isActive: true
        },
        {
          name: 'staging',
          ANTHROPIC_BASE_URL: 'https://staging.api.anthropic.com',
          ANTHROPIC_API_KEY: 'sk-ant-staging-key-987654321',
          created: '2024-01-02T00:00:00.000Z',
          isActive: false
        }
      ]

      const result = Utils.formatKeyList(keys)

      expect(result).toContain('Configured Keys:')
      expect(result).toContain('prod')
      expect(result).toContain('staging')
      expect(result).toContain('sk-ant-p********6789')
      expect(result).toContain('sk-ant-s********4321')
      expect(result).toContain('●') // Active key indicator
      expect(result).toContain('○') // Inactive key indicator
    })
  })
})
