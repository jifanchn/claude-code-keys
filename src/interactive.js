const inquirer = require('inquirer')
const Validators = require('../lib/validators')

class Interactive {
  static async promptAddKey () {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Key name:',
        validate: (input) => {
          try {
            Validators.validateKeyName(input)
            return true
          } catch (error) {
            return error.message
          }
        }
      },
      {
        type: 'input',
        name: 'ANTHROPIC_BASE_URL',
        message: 'Anthropic base URL:',
        default: 'https://api.anthropic.com',
        validate: (input) => {
          try {
            Validators.validateBaseUrl(input)
            return true
          } catch (error) {
            return error.message
          }
        }
      },
      {
        type: 'password',
        name: 'ANTHROPIC_API_KEY',
        message: 'Anthropic API key:',
        mask: '*',
        validate: (input) => {
          try {
            Validators.validateApiKey(input)
            return true
          } catch (error) {
            return error.message
          }
        }
      }
    ]

    return inquirer.prompt(questions)
  }

  static async promptSelectKey (keys) {
    if (keys.length === 0) {
      console.log('No keys available. Use "cck add" to add a key.')
      return null
    }

    const choices = keys.map(key => ({
      name: `${key.isActive ? '●' : '○'} ${key.name} - ${key.ANTHROPIC_BASE_URL}`,
      value: key.name,
      short: key.name
    }))

    const { selectedKey } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedKey',
        message: 'Select a key:',
        choices,
        pageSize: 10
      }
    ])

    return selectedKey
  }

  static async promptDeleteKey (keys) {
    if (keys.length === 0) {
      console.log('No keys available to delete.')
      return null
    }

    const choices = keys.map(key => ({
      name: `${key.isActive ? '●' : '○'} ${key.name} - ${key.ANTHROPIC_BASE_URL}`,
      value: key.name,
      short: key.name
    }))

    const { keyToDelete } = await inquirer.prompt([
      {
        type: 'list',
        name: 'keyToDelete',
        message: 'Select a key to delete:',
        choices
      }
    ])

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete "${keyToDelete}"?`,
        default: false
      }
    ])

    return confirm ? keyToDelete : null
  }

  static async promptConfirm (message, defaultValue = false) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message,
        default: defaultValue
      }
    ])
    return confirm
  }
}

module.exports = Interactive
