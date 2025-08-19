const Storage = require('../lib/storage')
const Validators = require('../lib/validators')

class KeyManager {
  constructor () {
    this.storage = new Storage()
  }

  async init () {
    await this.storage.init()
  }

  async addKey (name, anthropicBaseUrl, anthropicApiKey, environmentVariables = {}) {
    const keyConfig = {
      name: name.trim(),
      ANTHROPIC_BASE_URL: anthropicBaseUrl.trim(),
      ANTHROPIC_API_KEY: anthropicApiKey.trim(),
      created: new Date().toISOString(),
      environmentVariables: environmentVariables || {}
    }

    Validators.validateKeyConfiguration(keyConfig)

    const keys = await this.storage.loadKeys()

    if (keys.some(key => key.name === keyConfig.name)) {
      throw new Error(`Key with name "${keyConfig.name}" already exists`)
    }

    keys.push(keyConfig)
    await this.storage.saveKeys(keys)

    if (keys.length === 1) {
      await this.storage.setCurrentKey(keyConfig.name)
    }

    return keyConfig
  }

  async listKeys () {
    const keys = await this.storage.loadKeys()
    const currentKey = await this.storage.getCurrentKey()

    return keys.map(key => ({
      ...key,
      isActive: key.name === currentKey
    }))
  }

  async getKey (name) {
    const keys = await this.storage.loadKeys()
    const key = keys.find(k => k.name === name)

    if (!key) {
      throw new Error(`Key "${name}" not found`)
    }

    return key
  }

  async getCurrentKey () {
    const currentKeyName = await this.storage.getCurrentKey()
    if (!currentKeyName) {
      return null
    }

    return this.getKey(currentKeyName)
  }

  async switchKey (name) {
    const keys = await this.storage.loadKeys()
    const keyExists = keys.some(key => key.name === name)

    if (!keyExists) {
      throw new Error(`Key "${name}" not found`)
    }

    await this.storage.setCurrentKey(name)
    return await this.getKey(name)
  }

  async deleteKey (name) {
    const keys = await this.storage.loadKeys()
    const keyIndex = keys.findIndex(key => key.name === name)

    if (keyIndex === -1) {
      throw new Error(`Key "${name}" not found`)
    }

    const currentKey = await this.storage.getCurrentKey()
    const deletedKey = keys[keyIndex]

    keys.splice(keyIndex, 1)
    await this.storage.saveKeys(keys)

    if (currentKey === name) {
      if (keys.length > 0) {
        await this.storage.setCurrentKey(keys[0].name)
      } else {
        await this.storage.setCurrentKey(null)
      }
    }

    return deletedKey
  }

  async hasKeys () {
    const keys = await this.storage.loadKeys()
    return keys.length > 0
  }

  async getKeyCount () {
    const keys = await this.storage.loadKeys()
    return keys.length
  }
}

module.exports = KeyManager
