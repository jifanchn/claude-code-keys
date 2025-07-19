const fs = require('fs-extra');
const path = require('path');
const YAML = require('yaml');
const os = require('os');

class Storage {
  constructor() {
    this.configDir = path.join(os.homedir(), '.claude-code-keys');
    this.configFile = path.join(this.configDir, 'config.yaml');
    this.keysFile = path.join(this.configDir, 'keys.yaml');
  }

  async init() {
    await fs.ensureDir(this.configDir, { mode: 0o700 });
    await this.ensureConfigFiles();
  }

  async ensureConfigFiles() {
    const configExists = await fs.pathExists(this.configFile);
    if (!configExists) {
      await fs.writeFile(this.configFile, YAML.stringify({ config: { current_key: null } }), { mode: 0o600 });
    }

    const keysExists = await fs.pathExists(this.keysFile);
    if (!keysExists) {
      await fs.writeFile(this.keysFile, YAML.stringify({ keys: [] }), { mode: 0o600 });
    }
  }

  async loadConfig() {
    try {
      const configContent = await fs.readFile(this.configFile, 'utf8');
      return YAML.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to load config: ${error.message}`);
    }
  }

  async saveConfig(config) {
    try {
      await fs.writeFile(this.configFile, YAML.stringify(config), { mode: 0o600 });
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }
  }

  async loadKeys() {
    try {
      const keysContent = await fs.readFile(this.keysFile, 'utf8');
      const parsed = YAML.parse(keysContent);
      return parsed.keys || [];
    } catch (error) {
      throw new Error(`Failed to load keys: ${error.message}`);
    }
  }

  async saveKeys(keys) {
    try {
      await fs.writeFile(this.keysFile, YAML.stringify({ keys }), { mode: 0o600 });
    } catch (error) {
      throw new Error(`Failed to save keys: ${error.message}`);
    }
  }

  async getCurrentKey() {
    const config = await this.loadConfig();
    return config.config?.current_key || null;
  }

  async setCurrentKey(keyName) {
    const config = await this.loadConfig();
    config.config.current_key = keyName;
    await this.saveConfig(config);
  }

  async getConfigDir() {
    return this.configDir;
  }
}

module.exports = Storage;