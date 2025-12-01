#!/usr/bin/env node

const { Command } = require('commander')
const KeyManager = require('../src/keyManager')
const Interactive = require('../src/interactive')
const Validators = require('../lib/validators')
const chalk = require('chalk')

const program = new Command()
const keyManager = new KeyManager()

async function initKeyManager () {
  try {
    await keyManager.init()
  } catch (error) {
    console.error(chalk.red('Failed to initialize key manager:'), error.message)
    process.exit(1)
  }
}

program
  .name('cck')
  .description('Claude Code Keys - Manage Claude API key configurations')
  .version('1.0.0')

async function handleSwitch () {
  await initKeyManager()

  const hasKeys = await keyManager.hasKeys()
  if (!hasKeys) {
    console.log(chalk.yellow('No keys available. Use "cck add" to add a key.'))
    return
  }

  const keys = await keyManager.listKeys()
  const selectedKey = await Interactive.promptSelectKey(keys)

  if (selectedKey) {
    try {
      const key = await keyManager.switchKey(selectedKey)

      console.log(chalk.green(`✓ Activated key: ${selectedKey}`))

      // Add 0.5 second delay before launching
      await new Promise(resolve => setTimeout(resolve, 500))

      // Launch Claude Code with the selected key
      const { spawn } = require('child_process')

      // Check if claude command exists
      const claudeCommand = process.platform === 'win32' ? 'claude.cmd' : 'claude'

      // Create new env object, cck keys will override existing ones
      const env = {
        ...process.env,
        ANTHROPIC_BASE_URL: key.ANTHROPIC_BASE_URL,
        ...key.environmentVariables
      }

      // Only set ANTHROPIC_API_KEY if it exists in the key configuration
      if (key.ANTHROPIC_API_KEY) {
        env.ANTHROPIC_API_KEY = key.ANTHROPIC_API_KEY
      } else {
        // Remove ANTHROPIC_API_KEY from environment if not in key config
        delete env.ANTHROPIC_API_KEY
      }

      // Prepare arguments for claude command
      const args = [...process.argv.slice(2)]
      const hasMcpConfig = args.some(arg => arg.startsWith('--mcp-config'))

      // Add default MCP config if not specified
      if (!hasMcpConfig) {
        args.push('--mcp-config', '.mcp.json')
      }

      const child = spawn(claudeCommand, args, {
        stdio: 'inherit',
        env
      })

      child.on('error', (error) => {
        console.error(chalk.red('Failed to launch Claude Code:'), error.message)
        console.log(chalk.yellow('Make sure Claude Code is installed and in PATH'))
        process.exit(1)
      })

      child.on('exit', (code) => {
        process.exit(code)
      })
    } catch (error) {
      console.error(chalk.red('Failed to switch key:'), error.message)
      process.exit(1)
    }
  }
}

program
  .command('add')
  .description('Add a new key configuration')
  .action(async () => {
    await initKeyManager()
    try {
      const answers = await Interactive.promptAddKey()
      await keyManager.addKey(
        answers.name,
        answers.ANTHROPIC_BASE_URL,
        answers.ANTHROPIC_API_KEY,
        answers.environmentVariables
      )
      console.log(chalk.green(`✓ Added key: ${answers.name}`))
    } catch (error) {
      console.error(chalk.red('Failed to add key:'), error.message)
    }
  })

program
  .command('list')
  .description('List all key configurations')
  .action(async () => {
    await initKeyManager()
    try {
      const keys = await keyManager.listKeys()

      if (keys.length === 0) {
        console.log(chalk.yellow('No keys configured. Use "cck add" to add a key.'))
        return
      }

      console.log(chalk.bold('\nConfigured Keys:'))
      console.log('─'.repeat(50))

      keys.forEach(key => {
        const active = key.isActive ? chalk.green('●') : chalk.gray('○')
        const maskedKey = Validators.maskApiKey(key.ANTHROPIC_API_KEY)
        console.log(`${active} ${chalk.bold(key.name)}`)
        console.log(`  URL: ${key.ANTHROPIC_BASE_URL}`)
        console.log(`  Key: ${maskedKey}`)
        console.log(`  Created: ${new Date(key.created).toLocaleString()}`)
        if (key.environmentVariables && Object.keys(key.environmentVariables).length > 0) {
          console.log(`  Environment Variables: ${Object.keys(key.environmentVariables).length}`)
          Object.entries(key.environmentVariables).forEach(([name, value]) => {
            console.log(`    ${name}: ${value}`)
          })
        }
        console.log('─'.repeat(50))
      })
    } catch (error) {
      console.error(chalk.red('Failed to list keys:'), error.message)
    }
  })

program
  .command('delete')
  .description('Delete a key configuration')
  .argument('[name]', 'Name of the key to delete')
  .action(async (name) => {
    await initKeyManager()

    try {
      if (name) {
        const confirmed = await Interactive.promptConfirm(`Delete key "${name}"?`)
        if (confirmed) {
          await keyManager.deleteKey(name)
          console.log(chalk.green(`✓ Deleted key: ${name}`))
        }
      } else {
        const keys = await keyManager.listKeys()
        const keyToDelete = await Interactive.promptDeleteKey(keys)
        if (keyToDelete) {
          await keyManager.deleteKey(keyToDelete)
          console.log(chalk.green(`✓ Deleted key: ${keyToDelete}`))
        }
      }
    } catch (error) {
      console.error(chalk.red('Failed to delete key:'), error.message)
    }
  })

// Default action: switch or help
program.action(async () => {
  await initKeyManager()
  const hasKeys = await keyManager.hasKeys()

  if (hasKeys) {
    await handleSwitch()
  } else {
    console.log(chalk.yellow('No keys configured.'))
    console.log()
    program.help()
  }
})

program.parseAsync(process.argv).catch(error => {
  console.error(chalk.red('Error:'), error.message)
  process.exit(1)
})
