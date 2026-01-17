# ADR-0002: Semantic Versioning Strategy

## Status

Accepted

## Context

We need to establish a consistent versioning strategy for the Codegen Preflight extension. Version numbers are critical for:
- Extension marketplace compatibility
- User communication about changes
- Dependency management
- Release tracking
- Compatibility guarantees

The extension is distributed as a VS Code/Cursor extension and follows standard extension versioning practices. We need to ensure our versioning is clear, predictable, and follows industry standards.

## Decision

We will follow the [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) specification strictly for all releases.

Version format: `MAJOR.MINOR.PATCH`

- **MAJOR** version increments when we make incompatible API changes or breaking changes to extension behavior
- **MINOR** version increments when we add functionality in a backward compatible manner
- **PATCH** version increments when we make backward compatible bug fixes

We will use the format `0.1.0` for initial releases (pre-1.0.0), where:
- `0.x.y` indicates initial development
- Breaking changes can occur in MINOR versions during `0.x.y` phase
- Once we reach `1.0.0`, we commit to semantic versioning strictly

## Consequences

### Positive

- **Industry standard**: Semver is widely understood and expected in the VS Code extension ecosystem
- **Clear communication**: Version numbers convey meaning about the nature of changes
- **Tooling support**: Many tools (npm, vsce, marketplace) understand and work with semver
- **User trust**: Following established standards builds confidence
- **Dependency management**: Clear versioning helps with extension dependencies and compatibility
- **Automation**: Semver enables automated version bumping and changelog generation

### Negative

- **Strict discipline required**: Must carefully consider whether changes are MAJOR, MINOR, or PATCH
- **Learning curve**: Team must understand semver rules
- **Pre-1.0.0 ambiguity**: During `0.x.y` phase, breaking changes can occur in MINOR versions (per semver spec)

## Alternatives Considered

### Calendar Versioning (CalVer)

**Why not chosen**: While CalVer (e.g., `2026.01.15`) is useful for some projects, it doesn't convey information about the nature of changes. For an extension that users depend on, semantic meaning is more valuable than calendar dates.

### Unstructured Versioning

**Why not chosen**: Random or unstructured version numbers (e.g., `v1`, `v2`, `v2.1`) don't provide clear information about compatibility or change types. This would reduce user trust and make dependency management difficult.

### Always-Incrementing Numbers

**Why not chosen**: Simply incrementing a single number (e.g., `1`, `2`, `3`) doesn't communicate whether changes are breaking, additive, or fixes. This is insufficient for a production extension.

## Implementation

- All `package.json` files use semantic version format
- CHANGELOG.md entries reference semantic versions
- GitHub releases use semantic version tags (e.g., `v0.1.0`)
- Extension manifest (`packages/extension/package.json`) version field follows semver
- MCP server version (`packages/mcp-server/package.json`) follows semver independently

## References

- [Semantic Versioning 2.0.0 Specification](https://semver.org/spec/v2.0.0.html)
- [Semver.org](https://semver.org/)
- [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
