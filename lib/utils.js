const chalk = require('chalk');

class Utils {
  static formatKeyDisplay(key, isActive = false) {
    const activeIcon = isActive ? chalk.green('●') : chalk.gray('○');
    const name = chalk.bold(key.name);
    const url = chalk.dim(key.ANTHROPIC_BASE_URL);
    return `${activeIcon} ${name} - ${url}`;
  }

  static formatKeyList(keys) {
    if (keys.length === 0) {
      return chalk.yellow('No keys configured. Use "cck add" to add a key.');
    }

    const output = [chalk.bold('\nConfigured Keys:'), '─'.repeat(50)];
    
    keys.forEach(key => {
      const active = key.isActive ? chalk.green('●') : chalk.gray('○');
      output.push(`${active} ${chalk.bold(key.name)}`);
      output.push(`  URL: ${key.ANTHROPIC_BASE_URL}`);
      output.push(`  Key: ${this.maskApiKey(key.ANTHROPIC_API_KEY)}`);
      output.push(`  Created: ${new Date(key.created).toLocaleString()}`);
      output.push('─'.repeat(50));
    });

    return output.join('\n');
  }

  static maskApiKey(apiKey) {
    if (!apiKey || apiKey.length <= 8) {
      return '***';
    }
    const prefix = apiKey.substring(0, 8);
    const suffix = apiKey.substring(apiKey.length - 4);
    const masked = '*'.repeat(Math.min(8, apiKey.length - 12));
    return `${prefix}${masked}${suffix}`;
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static truncateString(str, maxLength = 50) {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  static getTimestamp() {
    return new Date().toISOString();
  }
}

module.exports = Utils;