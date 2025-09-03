# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the cck (claude-code-keys) package.

## Project Overview
The cck package is a global NPM CLI tool for managing Claude API keys with multiple configurations. It allows users to store, switch between, and manage different Claude API key configurations.

## Architecture Design

### Core Components
- **CLI Entry Point**: `bin/cck.js` - Main executable for global npm installation
- **Key Manager**: `src/keyManager.js` - Core functionality for key storage and retrieval
- **Interactive CLI**: `src/interactive.js` - Arrow key navigation for switch command
- **Storage**: JSON file at `~/.cck/keys.json` for secure key storage
- **Validation**: Input validation for URLs and API keys

### Key Structure
Each key configuration contains:
- `name`: Unique identifier for the configuration
- `ANTHROPIC_BASE_URL`: Base URL for Anthropic API
- `ANTHROPIC_API_KEY`: The API key for authentication
- `isActive`: Boolean flag for currently active configuration

### Commands
- `cck`: Interactive key selection and launch (default)
- `cck add`: Interactive prompt to add new key configuration
- `cck list`: Display all key configurations with current status
- `cck delete [name]`: Delete specific key configuration
- `cck help`: Show help information

### Command Behavior
- Running `cck` without arguments shows interactive selection
- If no keys exist, shows help with setup instructions
- All commands use full names only

### Security Features
- Keys stored in user's home directory with 600 permissions
- Input validation for API key format
- URL validation for base URLs
- No keys logged to console (masked display)

## Development Commands
```bash
# Install dependencies
npm install

# Link for local development
npm link

# Test CLI locally
cck --help

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm test -- keyManager

# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Build for distribution
npm run build

# Publish to official npm registry (switches registry temporarily)
npm run publish
```

## Testing Requirements
- **Unit Tests**: 100% coverage for core modules (keyManager, storage, validators, utils)
- **Integration Tests**: CLI command flows with mocked filesystem
- **Security Tests**: Key masking, file permissions, validation edge cases
- **Interactive Tests**: Arrow key navigation, input handling with mock stdin
- **Error Handling**: Invalid inputs, missing files, permission issues
- **Cross-platform**: Test on Linux, macOS, Windows paths and permissions

## File Structure
```
cck/
├── bin/
│   └── cck.js              # CLI entry point
├── src/
│   ├── keyManager.js       # Core key management
│   ├── interactive.js      # Interactive CLI utilities
├── lib/
│   ├── validators.js       # Input validation
│   ├── utils.js           # Helper functions
│   └── storage.js         # File system operations
├── test/
│   ├── unit/
│   │   ├── keyManager.test.js
│   │   ├── validators.test.js
│   │   ├── storage.test.js
│   │   └── utils.test.js
│   ├── integration/
│   │   └── cli.test.js
│   └── fixtures/          # Test data files
├── package.json           # NPM configuration
├── jest.config.js        # Jest testing configuration
└── README.md             # User documentation
```

## NPM Global Installation
The package is configured for global installation with:
```json
{
  "bin": {
    "cck": "./bin/cck.js"
  },
  "preferGlobal": true
}
```

## User Configuration Storage
- **Config Directory**: `~/.claude-code-keys/`
- **Config File**: `~/.claude-code-keys/config.yaml`
- **Key Storage**: `~/.claude-code-keys/keys.yaml`
- **File permissions**: 600 (read/write for owner only)

### YAML Structure
```yaml
# config.yaml - General configuration
config:
  current_key: "default"
  
# keys.yaml - Key configurations
keys:
  - name: "default"
    ANTHROPIC_BASE_URL: "https://api.anthropic.com"
    ANTHROPIC_API_KEY: "sk-ant-..."
    created: "2024-07-19T21:57:00Z"
  - name: "staging"
    ANTHROPIC_BASE_URL: "https://api-staging.anthropic.com"
    ANTHROPIC_API_KEY: "sk-ant-..."
    created: "2024-07-19T22:00:00Z"
```