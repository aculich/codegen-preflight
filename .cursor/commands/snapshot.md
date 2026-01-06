# Snapshot: get current state-of-the-world

You are the Cursor Agent. Use the Codegen Preflight MCP server to get the current snapshot.

1) Use the MCP tool `generate_snapshot` to get the latest state-of-the-world snapshot.

2) Show me:
   - Latest SDK versions (npm and PyPI)
   - Selected default models for reasoning, fast, and vision
   - Total number of discovered models

3) If the user wants to copy the rule file or generate global config, use the extension commands:
   - `codegenPreflight.copyRuleFile` - Copy rule file to clipboard
   - `codegenPreflight.generateGlobalConfig` - Generate global Cursor config

Then proceed with the user's request.

