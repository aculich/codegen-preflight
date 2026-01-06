# Codegen Preflight MCP Server

MCP server providing tools and resources for version and model discovery for greenfield projects.

## Tools

- `get_latest_versions` - Query npm/PyPI for latest package versions
- `list_llm_models` - Query provider APIs for available models
- `get_sdk_codegen_instructions` - Fetch codegen instructions from SDK repos
- `generate_snapshot` - Create complete state-of-the-world JSON
- `analyze_sdk_with_repomix` - Analyze SDK repository using Repomix
- `get_context7_docs` - Fetch documentation using Context7
- `get_litellm_catalog` - Get LiteLLM model catalog

## Resources

- `preflight://snapshot/current` - Current day's cached snapshot
- `preflight://packages/{ecosystem}` - Latest versions for npm/pypi packages
- `preflight://models/{provider}` - Available models per provider

## Environment Variables

- `OPENAI_API_KEY` - For OpenAI model discovery
- `ANTHROPIC_API_KEY` - For Anthropic model discovery
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` - For Gemini model discovery
- `ENABLE_ENHANCED_FEATURES` - Set to "true" to enable Repomix and LiteLLM integration

## Usage

```bash
# Build
npm run build

# Run directly
node dist/index.js
```

The server uses STDIO transport and communicates via the MCP protocol.

