#!/bin/bash
# Setup MCP config file for Cursor

CURSOR_DIR=".cursor"
MCP_CONFIG="$CURSOR_DIR/mcp.json"

mkdir -p "$CURSOR_DIR"

cat > "$MCP_CONFIG" << 'EOF'
{
  "mcpServers": {
    "codegen-preflight": {
      "command": "node",
      "args": [
        "${workspaceFolder}/packages/mcp-server/dist/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "${env:OPENAI_API_KEY}",
        "ANTHROPIC_API_KEY": "${env:ANTHROPIC_API_KEY}",
        "GEMINI_API_KEY": "${env:GEMINI_API_KEY}",
        "GOOGLE_API_KEY": "${env:GOOGLE_API_KEY}",
        "ENABLE_ENHANCED_FEATURES": "${env:ENABLE_ENHANCED_FEATURES}"
      }
    }
  }
}
EOF

echo "Created $MCP_CONFIG"
echo "You may need to adjust the path to the MCP server based on your setup."

