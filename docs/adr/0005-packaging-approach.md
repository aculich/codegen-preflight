# ADR-0005: Packaging and Distribution Strategy

## Status

Accepted

## Context

We need to package the Codegen Preflight extension for distribution. The extension is built as a VS Code/Cursor extension and needs to be distributed as a VSIX file. Key considerations:

- Extension must be packaged correctly with all required files
- Unnecessary files (source, tests, dev configs) should be excluded
- Distribution method for v0.1 (GitHub Releases) vs future marketplace
- Workspace/monorepo structure considerations
- File size optimization

## Decision

We will use the VSIX format for packaging, distributed via GitHub Releases for v0.1, with plans for marketplace distribution in future versions.

**Packaging Approach:**
- Use `vsce package` (VS Code Extension Manager) to create VSIX files
- Use `.vscodeignore` to exclude unnecessary files from the package
- Include only: `dist/`, `media/`, `package.json`, `README.md`
- Exclude: source files, tests, dev configs, parent directory files

**Distribution Method:**
- **v0.1**: GitHub Releases with VSIX file attachment (manual distribution)
- **Future versions**: VS Code Marketplace + Open VSX (automated via CI/CD)

**File Exclusion Strategy:**
- Source TypeScript files excluded (only compiled JS in dist/)
- Test files excluded
- Development configuration files excluded
- Documentation from parent directories excluded
- Upstream reference repositories excluded

## Consequences

### Positive

- **Standard format**: VSIX is the standard VS Code extension format
- **Easy distribution**: GitHub Releases provides simple distribution mechanism
- **Small package size**: Excluding source and dev files keeps VSIX small
- **User-friendly**: Users can install directly from VSIX file
- **Marketplace-ready**: VSIX format is required for marketplace publication

### Negative

- **Workspace complexity**: Monorepo structure can cause vsce to include parent directory files (known issue to resolve)
- **Manual process for v0.1**: GitHub Releases require manual upload (automation planned for future)
- **No automatic updates**: GitHub Releases don't provide automatic update mechanism (marketplace does)

## Alternatives Considered

### Include Source Files

**Why not chosen**: Including source files would significantly increase package size without benefit. End users don't need source files, only compiled JavaScript.

### Separate Packaging Directory

**Why not chosen**: While creating a clean directory with only packaged files would work, it adds complexity and maintenance overhead. Using `.vscodeignore` is the standard approach.

### Marketplace-Only Distribution

**Why not chosen**: For v0.1, we want to allow early adopters to install before marketplace publication. GitHub Releases provide this flexibility.

### ZIP Instead of VSIX

**Why not chosen**: VSIX is the standard format that VS Code/Cursor expects. ZIP would require manual installation steps and wouldn't work with marketplace.

## Implementation

- `.vscodeignore` file in `packages/extension/` excludes unnecessary files
- `package.json` includes `"package": "vsce package"` script
- VSIX files excluded from git via `.gitignore`
- GitHub Release workflow (future) will automate VSIX generation on tags

## Known Issues

- **Workspace path resolution**: vsce may try to include files from parent directories in monorepo setup. This needs to be resolved with proper `.vscodeignore` patterns or packaging script adjustments.

## References

- [VS Code Extension Packaging](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)
- Our `.vscodeignore` file in `packages/extension/`
