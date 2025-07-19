# Claude Code Keys (cck)

A global CLI tool for managing Claude API key configurations with instant environment variable switching.

## Installation

```bash
npm install -g claude-code-keys
```

## Quick Start

1. **Add your first key:**
   ```bash
   cck add
   ```

2. **Switch keys:**
   ```bash
   eval $(cck)
   ```

3. **List keys:**
   ```bash
   cck list
   ```

## Usage

### Commands

| Command | Description |
|---------|-------------|
| `cck` | Interactive key selection and launch |
| `cck add` | Add new key configuration |
| `cck list` | List all keys |
| `cck delete [name]` | Delete key |
| `cck help` | Show help |

### Setting Environment Variables

To use a key immediately in your current shell session:

```bash
# Interactive selection and set env vars
eval $(cck)

# Or use a specific key
eval $(cck switch)
```

This will set:
- `ANTHROPIC_API_KEY` - Your Claude API key
- `ANTHROPIC_BASE_URL` - The base URL for the API

### Adding Keys

```bash
cck add
# Enter key name, base URL, and API key interactively
```

### Switching Keys

```bash
# Interactive selection
eval $(cck)

# Or use the full command
eval $(cck switch)
```

### Listing Keys

```bash
cck list
```

Output shows:
- Active key (●)
- Key names
- Base URLs
- Masked API keys for security

## Configuration

Configuration files are stored in `~/.claude-code-keys/`:
- `config.yaml` - Current active key
- `keys.yaml` - All key configurations

Files have 600 permissions for security.

## Key Structure

Each key contains:
- `name` - Unique identifier
- `ANTHROPIC_BASE_URL` - API base URL
- `ANTHROPIC_API_KEY` - Your API key
- `created` - Creation timestamp

## Shell Integration

Add to your `.bashrc`, `.zshrc`, or equivalent:

```bash
# Quick key switching
alias cck-switch='eval $(cck)'

# List keys
alias cck-l='cck list'
```

## Examples

```bash
# Add a production key
cck add
# Name: prod
# URL: https://api.anthropic.com
# Key: sk-ant-...

# Add a staging key
cck add
# Name: staging
# URL: https://api-staging.anthropic.com
# Key: sk-ant-...

# Switch to production
eval $(cck)
# Select "prod" from list

# Verify environment
echo $ANTHROPIC_API_KEY
```

## Security

- API keys are encrypted at rest with 600 file permissions
- Keys are masked in terminal output
- No keys are logged or transmitted
- Configuration is stored locally only

## Development

```bash
# Clone repository
git clone <repo-url>
cd claude-code-keys

# Install dependencies
npm install

# Link for local development
npm link

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Requirements

- Node.js >= 16.0.0
- NPM or Yarn

## License

MIT