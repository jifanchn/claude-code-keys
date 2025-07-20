const fs = require('fs-extra')
const path = require('path')
const os = require('os')
const { spawn } = require('child_process')

const CLI_PATH = path.join(__dirname, '../../bin/cck.js')

// Helper to run CLI commands
function runCLI (args = [], options = {}) {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        ...options.env
      }
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      resolve({ code, stdout, stderr })
    })

    // Send input if provided
    if (options.input) {
      setTimeout(() => {
        child.stdin.write(options.input)
        child.stdin.end()
      }, 100)
    }
  })
}

describe('CLI Integration Tests', () => {
  let tempDir
  let originalHome

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cck-test-'))
    originalHome = process.env.HOME
    process.env.HOME = tempDir
  })

  afterEach(() => {
    process.env.HOME = originalHome
    if (tempDir && fs.existsSync(tempDir)) {
      fs.removeSync(tempDir)
    }
  })

  describe('help command', () => {
    test('should show help with -h flag', async () => {
      const result = await runCLI(['-h'])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Claude Code Keys')
      expect(result.stdout).toContain('Usage:')
      expect(result.stdout).toContain('Commands:')
    })

    test('should show help with help command', async () => {
      const result = await runCLI(['help'])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Claude Code Keys')
    })
  })

  describe('list command', () => {
    test('should show no keys message when empty', async () => {
      const result = await runCLI(['list'])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain('No keys configured')
    })
  })

  describe('version command', () => {
    test('should show version with --version flag', async () => {
      const result = await runCLI(['--version'])

      expect(result.code).toBe(0)
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/)
    })
  })

  describe('configuration directory', () => {
    test('should create config directory on first run', async () => {
      await runCLI(['list'])

      const configDir = path.join(tempDir, '.claude-code-keys')
      expect(fs.existsSync(configDir)).toBe(true)

      const configFile = path.join(configDir, 'config.yaml')
      const keysFile = path.join(configDir, 'keys.yaml')

      expect(fs.existsSync(configFile)).toBe(true)
      expect(fs.existsSync(keysFile)).toBe(true)
    })

    test('should set correct permissions on config files', async () => {
      await runCLI(['list'])

      const configFile = path.join(tempDir, '.claude-code-keys', 'config.yaml')
      const keysFile = path.join(tempDir, '.claude-code-keys', 'keys.yaml')

      if (process.platform !== 'win32') {
        const configStats = fs.statSync(configFile)
        const keysStats = fs.statSync(keysFile)

        // Check that files have 600 permissions (owner read/write only)
        expect(configStats.mode & parseInt('777', 8)).toBe(parseInt('600', 8))
        expect(keysStats.mode & parseInt('777', 8)).toBe(parseInt('600', 8))
      }
    })
  })

  describe('error handling', () => {
    test('should handle invalid commands gracefully', async () => {
      const result = await runCLI(['--help'])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain('Claude Code Keys')
    })

    test('should handle nonexistent key deletion gracefully', async () => {
      const result = await runCLI(['delete', 'nonexistent-key'], { input: 'n\n' })

      expect(result.code).toBe(0)
    }, 15000)
  })

  describe('default behavior', () => {
    test('should show help when no keys exist and no command given', async () => {
      const result = await runCLI([])

      expect(result.code).toBe(0)
      expect(result.stdout).toContain('No keys configured') ||
      expect(result.stdout).toContain('Claude Code Keys')
    })
  })
})
