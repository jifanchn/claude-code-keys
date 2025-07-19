const fs = require('fs-extra')
const path = require('path')
const os = require('os')

// Global test setup
global.createTempDir = () => {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cck-test-'))
}

global.createTestConfig = (tempDir) => ({
  configDir: tempDir,
  configFile: path.join(tempDir, 'config.yaml'),
  keysFile: path.join(tempDir, 'keys.yaml')
})

// Clean up temp directories after tests
afterEach(() => {
  jest.clearAllMocks()
})
