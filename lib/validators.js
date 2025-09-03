class Validators {
  static validateKeyName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Key name is required and must be a string');
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      throw new Error('Key name cannot be empty');
    }
    if (trimmedName.length > 50) {
      throw new Error('Key name must be 50 characters or less');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      throw new Error('Key name can only contain letters, numbers, underscores, and hyphens');
    }
    return trimmedName;
  }

  static validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('API key is required and must be a string');
    }
    if (apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty');
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

  static validateEnvironmentVariables(envVars) {
    if (!envVars || typeof envVars !== 'object') {
      throw new Error('Environment variables must be an object');
    }
    
    for (const [key, value] of Object.entries(envVars)) {
      if (!key || typeof key !== 'string') {
        throw new Error('Environment variable names must be non-empty strings');
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        throw new Error(`Invalid environment variable name: ${key}`);
      }
      if (value !== null && value !== undefined && typeof value !== 'string') {
        throw new Error(`Environment variable ${key} must be a string or null`);
      }
    }
    return true;
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

    // Allow either ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN in environmentVariables
    const hasApiKey = config.ANTHROPIC_API_KEY && config.ANTHROPIC_API_KEY.trim().length > 0;
    const hasAuthToken = config.environmentVariables && 
                         config.environmentVariables.ANTHROPIC_AUTH_TOKEN && 
                         config.environmentVariables.ANTHROPIC_AUTH_TOKEN.trim().length > 0;

    if (!hasApiKey && !hasAuthToken) {
      errors.push('Either ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN in environmentVariables is required');
    }

    if (hasApiKey) {
      try {
        Validators.validateApiKey(config.ANTHROPIC_API_KEY);
      } catch (error) {
        errors.push(error.message);
      }
    }

    try {
      if (config.environmentVariables) {
        Validators.validateEnvironmentVariables(config.environmentVariables);
      }
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