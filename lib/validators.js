class Validators {
  static validateKeyName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Key name is required and must be a string');
    }
    if (name.trim().length === 0) {
      throw new Error('Key name cannot be empty');
    }
    if (name.length > 50) {
      throw new Error('Key name must be 50 characters or less');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error('Key name can only contain letters, numbers, underscores, and hyphens');
    }
    return name.trim();
  }

  static validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is required and must be a string');
    }
    if (!apiKey.startsWith('sk-ant-')) {
      throw new Error('API key must start with "sk-ant-"');
    }
    if (apiKey.length < 20) {
      throw new Error('API key appears to be too short');
    }
    return apiKey.trim();
  }

  static validateBaseUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('Base URL is required and must be a string');
    }
    
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Base URL must use HTTP or HTTPS protocol');
      }
      if (!parsedUrl.hostname) {
        throw new Error('Base URL must have a valid hostname');
      }
      return url.trim().replace(/\/$/, '');
    } catch (error) {
      throw new Error(`Invalid URL format: ${error.message}`);
    }
  }

  static validateKeyConfiguration(config) {
    const errors = [];

    try {
      Validators.validateKeyName(config.name);
    } catch (error) {
      errors.push(error.message);
    }

    try {
      Validators.validateBaseUrl(config.ANTHROPIC_BASE_URL);
    } catch (error) {
      errors.push(error.message);
    }

    try {
      Validators.validateApiKey(config.ANTHROPIC_API_KEY);
    } catch (error) {
      errors.push(error.message);
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }

  static maskApiKey(apiKey) {
    if (!apiKey || apiKey.length <= 8) {
      return '***';
    }
    const prefix = apiKey.substring(0, 8);
    const suffix = apiKey.substring(apiKey.length - 4);
    const maskedLength = Math.min(8, Math.max(4, apiKey.length - 12));
    const masked = '*'.repeat(maskedLength);
    return `${prefix}${masked}${suffix}`;
  }
}

module.exports = Validators;