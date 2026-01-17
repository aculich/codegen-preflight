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

- **VS Code** (v1.85.0+) or **Cursor IDE** (any version)
- API keys (optional, for model discovery):
  - OpenAI API key
  - Anthropic API key
  - Google Gemini API key

### Installation

#### Option 1: Install from VSIX (Recommended)

Download and install the latest VSIX from the [GitHub Releases](https://github.com/aculich/codegen-preflight/releases) page.

**For VS Code:**
```bash
# Download the latest VSIX file
# Note: Replace v0.1.0 with the latest version from the releases page
curl -L -o codegen-preflight.vsix \
  https://github.com/aculich/codegen-preflight/releases/download/v0.1.0/codegen-preflight-0.1.0.vsix

# Install using the code command
code --install-extension codegen-preflight.vsix
```

**For Cursor:**
```bash
# Download the latest VSIX file
# Note: Replace v0.1.0 with the latest version from the releases page
curl -L -o codegen-preflight.vsix \
  https://github.com/aculich/codegen-preflight/releases/download/v0.1.0/codegen-preflight-0.1.0.vsix

# Install using the cursor command
cursor --install-extension codegen-preflight.vsix
```

**Quick Install (Latest Version):**
```bash
# Automatically get the latest release version and install
# For VS Code:
LATEST=$(curl -s https://api.github.com/repos/aculich/codegen-preflight/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
curl -L -o codegen-preflight.vsix "https://github.com/aculich/codegen-preflight/releases/download/${LATEST}/codegen-preflight-${LATEST#v}.vsix"
code --install-extension codegen-preflight.vsix

# For Cursor:
LATEST=$(curl -s https://api.github.com/repos/aculich/codegen-preflight/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
curl -L -o codegen-preflight.vsix "https://github.com/aculich/codegen-preflight/releases/download/${LATEST}/codegen-preflight-${LATEST#v}.vsix"
cursor --install-extension codegen-preflight.vsix
```

**Note**: On some systems, Cursor may override the `code` command. If `code` points to Cursor, you can use either command. To check which IDE a command points to:
```bash
which code    # Shows the actual binary location
code --version  # Shows version info
```

**Alternative: Manual Installation via UI**
1. Download the VSIX file from the [releases page](https://github.com/aculich/codegen-preflight/releases)
2. Open VS Code/Cursor
3. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
4. Run "Extensions: Install from VSIX..."
5. Select the downloaded VSIX file

#### Option 2: Development Setup

For development or contributing:

1. Install dependencies:
```bash
npm install
```

2. Build the packages:
```bash
npm run build
```

3. Run in development mode:
   - Open the `packages/extension` folder in Cursor/VS Code
   - Press F5 to run the extension in development mode
   - Or package it: `cd packages/extension && npm run package`

## Usage

### Cursor-Specific Features

This extension is designed to work seamlessly with **Cursor IDE** and includes several Cursor-specific features:

**MCP Server Integration:**
- Automatically registers the MCP server in `.cursor/mcp.json`
- Provides MCP tools accessible in Cursor chat (e.g., `generate_snapshot`, `list_llm_models`)
- Exposes MCP resources (e.g., `preflight://snapshot/current`)

**Cursor Rules Integration:**
- Auto-generates `.cursor/rules/01-version-snapshot.mdc` with always-apply policy
- Updates the rule file when snapshot refreshes
- Supports global Cursor config at `~/.cursor/rules/01-version-snapshot.mdc`

**Cursor Commands:**
- Supports `/preflight` and `/snapshot` slash commands in Cursor chat
- Commands are defined in `.cursor/commands/preflight.md`

**Cursor API Hooks:**
- Hooks into Cursor's workspace events for automatic snapshot checks
- Detects workspace changes and ensures snapshot freshness
- Runs daily background checks to keep snapshot up-to-date

**VS Code Compatibility:**
- The extension also works in VS Code, but Cursor-specific features (MCP, Rules, slash commands) are only available in Cursor
- Core functionality (snapshot generation, side panel, commands) works in both IDEs

### Configuring API Keys

To enable model discovery, you need to configure API keys. You have three options:

**Option 1: Extension Settings (Recommended)**
1. Open Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
2. Run "Codegen Preflight: Configure API Keys"
3. Enter your API keys when prompted
4. Keys are stored securely in VS Code settings

**Option 2: Settings UI**
1. Open Settings (Cmd+, / Ctrl+,)
2. Search for "Codegen Preflight"
3. Set `codegenPreflight.openaiApiKey`, `codegenPreflight.anthropicApiKey`, and `codegenPreflight.geminiApiKey`

**Note**: Settings are stored in VS Code/Cursor settings and are shared between both IDEs if you use the same settings file.

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
- Generates/updates `.cursor/rules/01-version-snapshot.mdc` (Cursor only)
- Registers the MCP server in `.cursor/mcp.json` (Cursor only)
- Runs daily background checks to ensure snapshot freshness
- Detects workspace changes and triggers snapshot refresh when needed

### Manual

- **Command Palette**: 
  - "Codegen Preflight: Refresh Snapshot" - Refresh if stale
  - "Codegen Preflight: Force Refresh Snapshot" - Force refresh
  - "Codegen Preflight: Open Preflight Panel" - Open side panel
  - "Codegen Preflight: Configure API Keys" - Set API keys
- **Side Panel**: Open the Codegen Preflight view to see current state
- **Cursor Slash Commands** (Cursor only): Use `/preflight` or `/snapshot` in Cursor chat to refresh or get snapshot info
- **Copy Rule File**: Use "Copy Rule File to Clipboard" command to copy the generated rule file
- **Global Config** (Cursor only): Use "Generate Global Cursor Config" to create a global config at `~/.cursor/rules/01-version-snapshot.mdc`

### MCP Tools (Cursor Only)

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

### MCP Resources (Cursor Only)

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

## Cursor-Specific Implementation Details

### Extension Engine Support

The extension declares support for both VS Code and Cursor in `package.json`:
```json
"engines": {
  "vscode": "^1.85.0",
  "cursor": "*"
}
```

This allows the extension to:
- Install and run in both VS Code and Cursor
- Use Cursor-specific APIs when available
- Gracefully degrade when Cursor APIs are not available

### Cursor API Detection

The extension detects Cursor by checking for the `cursor` property on the `vscode` namespace:
```typescript
const cursorApi = (vscode as any).cursor;
if (cursorApi) {
  // Cursor-specific features
}
```

### MCP Server Registration

The extension automatically creates/updates `.cursor/mcp.json` to register the MCP server:
- Location: `.cursor/mcp.json` (workspace) or `~/.cursor/mcp.json` (global)
- Merges with existing MCP configurations
- Uses workspace-relative paths when possible
- Requires Cursor restart/reload to take effect

### Cursor Rules Generation

The extension generates Cursor Rules files:
- **Workspace**: `.cursor/rules/01-version-snapshot.mdc`
- **Global**: `~/.cursor/rules/01-version-snapshot.mdc`
- Format: Markdown with frontmatter (`.mdc`)
- Policy: Always-apply (injected into every codegen session)

### Cursor Commands

Slash commands are defined in `.cursor/commands/preflight.md`:
- `/preflight` - Trigger snapshot refresh
- `/snapshot` - Get current snapshot info

These are automatically available in Cursor chat when the extension is installed.

### Installation Command Differences

**VS Code:**
- Uses `code --install-extension <file.vsix>`
- Command: `code`

**Cursor:**
- Uses `cursor --install-extension <file.vsix>`
- Command: `cursor`
- On some systems, `code` may be aliased to Cursor

**Checking which IDE a command points to:**
```bash
which code          # Shows binary location
code --version      # Shows version and IDE info
which cursor        # Shows Cursor binary location
cursor --version    # Shows Cursor version
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

