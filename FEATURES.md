# Codegen Preflight Features

## ✅ Implemented Features

### 1. Model Selection (Fixed)
- ✅ Now correctly selects Anthropic 4.5 models:
  - **Reasoning**: `claude-opus-4-5-20251101`
  - **Fast**: `claude-sonnet-4-5-20250929`
  - **Vision**: `claude-opus-4-5-20251101`
- ✅ Model selection uses reverse sorting to prefer newer versions
- ✅ Test script available: `npm run check-models`

### 2. API Key Configuration
- ✅ Command Palette: "Codegen Preflight: Configure API Keys"
- ✅ Side Panel: "Configure API Keys" button
- ✅ VS Code Settings UI
- ✅ Environment variables support
- ✅ Keys stored securely in VS Code settings

### 3. Copy Rule File
- ✅ "Copy Rule File to Clipboard" command
- ✅ Button in side panel
- ✅ Copies the generated `.cursor/rules/01-version-snapshot.mdc` content

### 4. Global Cursor Config
- ✅ "Generate Global Cursor Config" command
- ✅ Button in side panel
- ✅ Creates `~/.cursor/rules/01-version-snapshot.mdc` for all projects

### 5. MCP Server Integration
- ✅ MCP server with tools and resources
- ✅ Programmatic registration (with fallback)
- ✅ Manual configuration via `.cursor/mcp.json`
- ✅ Available tools:
  - `get_latest_versions`
  - `list_llm_models`
  - `get_sdk_codegen_instructions`
  - `generate_snapshot`
  - `analyze_sdk_with_repomix`
  - `get_context7_docs`
  - `get_litellm_catalog`

### 6. Cursor Commands
- ✅ `/preflight` - Refresh snapshot and show status
- ✅ `/snapshot` - Get current snapshot info via MCP

### 7. Side Panel UI
- ✅ Shows current snapshot state
- ✅ Latest SDK versions (npm & PyPI)
- ✅ Selected default models
- ✅ Discovered models count
- ✅ Force refresh button
- ✅ Configure API keys button
- ✅ Copy rule file button
- ✅ Generate global config button

## How to Use

### Check Available Models
```bash
npm run check-models
```

### Test Model Selection
```bash
node scripts/test-model-selection.js
```

### Use MCP Server in Cursor Chat
- "Use the `generate_snapshot` tool"
- "List all Anthropic models using `list_llm_models`"
- "Get latest version of next.js using `get_latest_versions`"

### Use Slash Commands
- `/preflight` - Refresh and show status
- `/snapshot` - Get snapshot info

### Copy Rule File
1. Command Palette → "Codegen Preflight: Copy Rule File to Clipboard"
2. Or click "Copy Rule File" button in side panel
3. Paste wherever you need it

### Generate Global Config
1. Command Palette → "Codegen Preflight: Generate Global Cursor Config"
2. Or click "Generate Global Config" button in side panel
3. Config created at `~/.cursor/rules/01-version-snapshot.mdc`
4. Available to all Cursor projects

