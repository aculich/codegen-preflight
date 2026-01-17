# ADR-0006: Marketplace Publication Strategy

## Status

Proposed

## Context

We need to determine how to publish the Codegen Preflight extension to marketplaces for broader distribution. Key considerations:

- VS Code Marketplace is the primary marketplace for VS Code extensions
- Cursor uses Open VSX as its extension registry
- Different marketplaces have different requirements and processes
- We want maximum reach for our extension
- Automation vs manual publishing

## Decision

We will publish to **both** VS Code Marketplace and Open VSX to maximize reach and compatibility.

**Dual Publication Strategy:**
- **VS Code Marketplace**: Primary marketplace for VS Code users
- **Open VSX**: Required for Cursor and other VS Code forks

**Publication Timeline:**
- **v0.1**: GitHub Releases only (manual VSIX distribution)
- **v0.6-v0.9**: Prepare for marketplace publication
- **v1.0+**: Publish to both marketplaces via automated CI/CD

**Automation:**
- Use GitHub Actions for automated publishing
- Store marketplace credentials securely as GitHub Secrets
- Publish to both marketplaces on version tags

## Consequences

### Positive

- **Maximum reach**: Available to both VS Code and Cursor users
- **Ecosystem alignment**: Open VSX is the standard for Cursor
- **User convenience**: Users can install from their IDE's marketplace
- **Automatic updates**: Marketplace provides update mechanism
- **Discovery**: Users can find extension via marketplace search
- **Credibility**: Marketplace publication adds legitimacy

### Negative

- **Dual maintenance**: Must maintain accounts and credentials for both marketplaces
- **Different processes**: Each marketplace has slightly different requirements
- **Review processes**: Both marketplaces may have review processes
- **Compliance**: Must meet requirements of both marketplaces

## Alternatives Considered

### VS Code Marketplace Only

**Why not chosen**: Cursor users wouldn't be able to easily install the extension. Since our extension is specifically designed for Cursor (with MCP integration), we need Open VSX support.

### Open VSX Only

**Why not chosen**: VS Code Marketplace has the largest user base. Publishing only to Open VSX would limit our reach to VS Code users.

### GitHub Releases Only

**Why not chosen**: While GitHub Releases work for v0.1, they don't provide automatic updates, discovery, or the convenience of marketplace installation. This is acceptable for early releases but not for long-term distribution.

## Implementation

**Accounts Required:**
- VS Code Marketplace publisher account
- Open VSX namespace and publishing token

**CI/CD Workflow:**
- GitHub Actions workflow triggers on version tags
- Builds extension and creates VSIX
- Publishes to VS Code Marketplace using `vsce publish`
- Publishes to Open VSX using `ovsx publish`
- Stores credentials as GitHub Secrets

**Timeline:**
- v0.6-v0.8: Set up accounts and test publishing
- v0.9: Final testing and preparation
- v1.0: Public launch on both marketplaces

## References

- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Open VSX Publishing](https://github.com/eclipse/openvsx/wiki/Publishing-Extensions)
- [Changesets Action for Publishing](https://github.com/changesets/action)
