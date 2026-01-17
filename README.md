# Codegen Preflight Tool

A Cursor extension and MCP server that provides developers with an up-to-date "state-of-the-world" snapshot for greenfield projects, including latest package versions and LLM model IDs, with automatic daily caching and integration with Cursor Rules.

## Problem

Agentic coding IDEs generate "wrong-on-day-one" code because they lack current world-state awareness: latest SDK versions, valid model IDs, and current best practices. This tool creates a daily-refreshed context snapshot that Cursor injects into every codegen session.

## Features

- **Daily Snapshot Generation**: Automatically fetches latest package versions from npm and PyPI
- **LLM Model Discovery**: Queries OpenAI, Anthropic, and Gemini APIs for available models
- **Deterministic Model Selection**: Picks best models for reasoning, fast, and vision categories
- **Cursor Rules Integration**: Auto-generates `.cursor/rules/01-version-snapshot.mdc` with always-apply policy
- **MCP Server**: Provides tools and resources for version/model queries
- **Side Panel UI**: Visual display of current snapshot state
- **Auto-refresh**: Refreshes snapshot if older than 24 hours on session start

## Installation

### Prerequisites

- Node.js 20+
- Cursor IDE
- API keys (optional, for model discovery):
  - OpenAI API key
  - Anthropic API key
  - Google Gemini API key

### Setup

1. Install dependencies:
```bash
npm install
```

2. Build the packages:
```bash
npm run build
```

3. Install the extension:
   - Open the `packages/extension` folder in Cursor
   - Press F5 to run the extension in development mode
   - Or package it: `cd packages/extension && npm run package`

## Usage

### Configuring API Keys

To enable model discovery, you need to configure API keys. You have three options:

**Option 1: Extension Settings (Recommended)**
1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Run "Codegen Preflight: Configure API Keys"
3. Enter your API keys when prompted
4. Keys are stored securely in VS Code settings

**Option 2: VS Code Settings UI**
1. Open Settings (Cmd+, / Ctrl+,)
2. Search for "Codegen Preflight"
3. Set `codegenPreflight.openaiApiKey`, `codegenPreflight.anthropicApiKey`, and `codegenPreflight.geminiApiKey`

**Option 3: Environment Variables**
Set these in your shell or `.env` file:
```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AIza..."
```

### Automatic

The extension automatically:
- Refreshes the snapshot on startup if it's older than 24 hours
- Generates/updates `.cursor/rules/01-version-snapshot.mdc`
- Registers the MCP server with Cursor

### Manual

- **Command Palette**: 
  - "Codegen Preflight: Refresh Snapshot" - Refresh if stale
  - "Codegen Preflight: Force Refresh Snapshot" - Force refresh
  - "Codegen Preflight: Open Preflight Panel" - Open side panel
  - "Codegen Preflight: Configure API Keys" - Set API keys
- **Side Panel**: Open the Codegen Preflight view to see current state
- **Command**: Use `/preflight` or `/snapshot` in Cursor chat to refresh or get snapshot info
- **Copy Rule File**: Use "Copy Rule File to Clipboard" command to copy the generated rule file
- **Global Config**: Use "Generate Global Cursor Config" to create a global config at `~/.cursor/rules/01-version-snapshot.mdc`

### MCP Tools

The MCP server provides these tools (use in Cursor chat):
- `get_latest_versions` - Query npm/PyPI for package versions
- `list_llm_models` - List available models from providers
- `get_sdk_codegen_instructions` - Fetch codegen instructions from SDK repos
- `generate_snapshot` - Create complete state-of-the-world snapshot
- `analyze_sdk_with_repomix` - Analyze SDK repository using Repomix
- `get_context7_docs` - Fetch documentation using Context7
- `get_litellm_catalog` - Get LiteLLM model catalog

**Example usage in Cursor chat:**
- "Use the generate_snapshot tool to get the latest snapshot"
- "List all available Anthropic models"
- "Get the latest version of next.js"

### MCP Resources

Access these resources in Cursor:
- `preflight://snapshot/current` - Current day's cached snapshot
- `preflight://packages/npm` - Latest versions for npm packages
- `preflight://packages/pypi` - Latest versions for PyPI packages
- `preflight://models/openai` - Available models from OpenAI
- `preflight://models/anthropic` - Available models from Anthropic
- `preflight://models/google` - Available models from Google (Gemini)

## Configuration

### Watched Packages

Default packages are defined in `packages/mcp-server/src/tools/versions.ts`. You can customize this list.

### Model Selection Policy

Model selection patterns are in `packages/mcp-server/src/tools/models.ts`. The tool uses regex patterns to deterministically select the best model for each category.

## Project Structure

```
codegen-preflight/
  packages/
    mcp-server/          # MCP server implementation
    extension/           # VS Code/Cursor extension
  .cursor/
    rules/              # Cursor rules (auto-generated + static)
    commands/           # Cursor commands
    mcp.json           # MCP server configuration
```

## Development

### IDE Extension Recommendations

This project includes recommended IDE extensions in `.vscode/extensions.json`. These are **developer dependencies** that improve the development experience but are not required for the extension to function.

**Recommended Extensions**:
- **GitHub Pull Requests and Issues** - For workflow file editing and GitHub integration
- **GitHub Copilot** - AI pair programming assistance
- **TypeScript and JavaScript Language Features** - Enhanced TypeScript support
- **ESLint** - Code linting
- **Prettier** - Code formatting

**Note**: These extensions are optional but recommended for contributors. They do not affect the packaged extension or its runtime dependencies. VS Code/Cursor will prompt you to install these when you open the project.

### Building

```bash
# Build all packages
npm run build

# Watch mode
npm run dev

# Build MCP server only
cd packages/mcp-server && npm run build

# Build extension only
cd packages/extension && npm run build
```

## Architecture Decision Records

This project uses [Architecture Decision Records (ADRs)](docs/adr/) to document important architectural decisions and their rationale. ADRs help preserve context, avoid repeating mistakes, and onboard new contributors.

See [design/DEVX.md](design/DEVX.md) for details on how to create and manage ADRs using [adr-chronicle](https://github.com/aculich/adr-chronicle).

## License

MIT License - see [LICENSE](LICENSE) for details. See [docs/adr/0001-license-selection.md](docs/adr/0001-license-selection.md) for the rationale behind this choice.

