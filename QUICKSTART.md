# Quick Start Guide

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build all packages:**
   ```bash
   npm run build
   ```

3. **Set up MCP config (optional, for manual MCP setup):**
   ```bash
   ./scripts/setup-mcp-config.sh
   ```

4. **Set API keys (optional, for model discovery):**
   
   **Easiest way:** After installing the extension, run "Codegen Preflight: Configure API Keys" from the Command Palette.
   
   **Or via environment variables:**
   ```bash
   export OPENAI_API_KEY="your-key"
   export ANTHROPIC_API_KEY="your-key"
   export GEMINI_API_KEY="your-key"
   ```
   
   **Or via VS Code Settings:**
   - Open Settings (Cmd+,)
   - Search for "Codegen Preflight"
   - Enter your API keys in the settings

## Usage

### Option 1: Use the Extension

1. Open `packages/extension` in Cursor
2. Press F5 to run in development mode
3. The extension will:
   - Auto-refresh snapshot on startup if stale
   - Generate `.cursor/rules/01-version-snapshot.mdc`
   - Register MCP server
   - Show side panel with current state

### Option 2: Use Standalone Script

```bash
npm run preflight
```

This will:
- Generate snapshot
- Save to `.codegen-preflight/snapshot.json`
- Update `.cursor/rules/01-version-snapshot.mdc`

### Option 3: Use MCP Server Directly

The MCP server can be used directly via Cursor's MCP integration. Configure in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "codegen-preflight": {
      "command": "node",
      "args": ["${workspaceFolder}/packages/mcp-server/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}",
        "ANTHROPIC_API_KEY": "${env:ANTHROPIC_API_KEY}",
        "GEMINI_API_KEY": "${env:GEMINI_API_KEY}"
      }
    }
  }
}
```

## Commands

- **Command Palette:**
  - `Codegen Preflight: Refresh Snapshot`
  - `Codegen Preflight: Force Refresh Snapshot`
  - `Codegen Preflight: Open Preflight Panel`

- **Cursor Chat:**
  - `/preflight` - Refresh snapshot and show status

## Enhanced Features

To enable Repomix and LiteLLM integration:

```bash
export ENABLE_ENHANCED_FEATURES=true
npm run preflight
```

## Troubleshooting

- **No models discovered:** Set API keys in environment
- **Extension not loading:** Check that packages are built (`npm run build`)
- **MCP server not found:** Ensure path in config is correct
- **Rule file not updating:** Check `.cursor/rules` directory permissions

