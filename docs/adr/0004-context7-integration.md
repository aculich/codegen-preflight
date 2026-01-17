# ADR-0004: Context7 Integration

## Status

Accepted (Planned)

## Context

Our extension needs to provide up-to-date documentation and code examples for AI-assisted development. Traditional documentation can become stale, and LLMs often rely on outdated training data when generating code. We need a way to fetch fresh, version-specific documentation dynamically.

Context7 is an MCP server that provides up-to-date, version-specific documentation and code examples directly from library sources. It's designed specifically for AI-assisted development workflows.

## Decision

We will integrate Context7 as an optional enhancement feature for fetching up-to-date documentation. The integration will:

1. **Use Context7 MCP server** when available in the user's MCP configuration
2. **Enhance snapshot generation** by including fresh documentation for key libraries
3. **Provide documentation fetching** as an MCP tool in our server
4. **Make it optional** via environment variable or configuration (not required for core functionality)

**Integration Approach:**
- Context7 is already available as an MCP server (`@upstash/context7-mcp`)
- Users can configure Context7 separately in their MCP setup
- Our extension can leverage Context7 when it's available
- We provide a tool (`get_context7_docs`) that uses Context7 if configured
- Enhanced features are gated behind `ENABLE_ENHANCED_FEATURES` environment variable

## Consequences

### Positive

- **Fresh documentation**: Always up-to-date, version-specific docs
- **Better code generation**: AI assistants get current API information
- **Reduced hallucinations**: Less reliance on outdated training data
- **User choice**: Optional feature, doesn't break core functionality
- **MCP ecosystem**: Leverages existing MCP infrastructure
- **Version-specific**: Can fetch docs for specific library versions

### Negative

- **Additional dependency**: Requires Context7 MCP server to be configured
- **API key required**: Context7 may require API key for higher rate limits
- **Network dependency**: Requires internet connection for documentation fetching
- **Complexity**: Adds another integration point to maintain
- **Optional feature**: May not be used by all users

## Alternatives Considered

### Static Documentation Bundling

**Why not chosen**: Static docs become stale quickly and increase package size. Dynamic fetching ensures freshness.

### Manual Documentation Updates

**Why not chosen**: Manual updates are time-consuming and error-prone. Automated fetching is more reliable.

### No Documentation Integration

**Why not chosen**: While our core functionality (version/model discovery) doesn't require docs, providing fresh documentation significantly enhances the value proposition for AI-assisted development.

### Build Our Own Documentation Fetcher

**Why not chosen**: Context7 already solves this problem well and is actively maintained. Building our own would be reinventing the wheel.

## Implementation

**Current State:**
- Context7 tool placeholder exists in `packages/mcp-server/src/tools/context7.ts`
- Tool is listed in MCP server but returns placeholder data
- Enhanced features are gated behind environment variable

**Future Implementation:**
1. Detect if Context7 MCP server is available in user's configuration
2. Integrate Context7 MCP client calls when available
3. Use Context7 to fetch docs for libraries in snapshot
4. Include fresh documentation in snapshot generation
5. Provide `get_context7_docs` tool that actually calls Context7

**User Configuration:**
- Users install Context7 MCP server separately
- Configure in `.cursor/mcp.json` or global MCP config
- Our extension detects and uses it when available

## References

- [Context7 Repository](https://github.com/upstash/context7)
- [Context7 MCP Server](https://www.npmjs.com/package/@upstash/context7-mcp)
- [Context7 Documentation](https://context7.com)
- Our Context7 tool implementation in `packages/mcp-server/src/tools/context7.ts`
