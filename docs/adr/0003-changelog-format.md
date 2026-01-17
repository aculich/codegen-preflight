# ADR-0003: Changelog Format Adoption

## Status

Accepted

## Context

We need a consistent, readable format for documenting changes to the Codegen Preflight extension. Changelogs are essential for:
- Communicating changes to users
- Tracking project history
- Supporting upgrade decisions
- Providing context for bug reports
- Enabling automated tooling

The changelog should be human-readable, machine-parseable, and follow industry best practices. It should integrate well with our semantic versioning strategy and be suitable for both developers and end users.

## Decision

We will adopt the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format for our `CHANGELOG.md` file.

The format includes:
- Clear version sections with dates: `## [0.1.0] - 2026-01-XX`
- Categorized changes:
  - `### Added` - New features
  - `### Changed` - Changes in existing functionality
  - `### Deprecated` - Soon-to-be removed features
  - `### Removed` - Removed features
  - `### Fixed` - Bug fixes
  - `### Security` - Security vulnerabilities addressed
- `[Unreleased]` section for upcoming changes
- Links to version diffs (when using git tags)

## Consequences

### Positive

- **Human-readable**: Clear, organized format that's easy to scan
- **Machine-parseable**: Structured format enables tooling and automation
- **Widely adopted**: Many projects use this format, making it familiar
- **Comprehensive**: Covers all types of changes (added, changed, removed, fixed, security)
- **Version integration**: Works seamlessly with semantic versioning
- **User-friendly**: Non-technical users can understand the format
- **Tooling support**: Many tools can parse and generate Keep-a-changelog format

### Negative

- **Manual maintenance**: Requires discipline to update changelog with each change
- **Potential inconsistency**: Without automation, entries might be inconsistent
- **Time investment**: Writing good changelog entries takes time

## Alternatives Considered

### Git Log as Changelog

**Why not chosen**: Git commit messages are technical and not user-friendly. They don't categorize changes or provide context about impact. Users need curated, categorized information.

### Markdown with Custom Format

**Why not chosen**: While we could design a custom format, Keep-a-changelog is already established, well-documented, and has tooling support. Reinventing the wheel adds unnecessary complexity.

### No Changelog

**Why not chosen**: Without a changelog, users have no way to understand what changed between versions. This reduces trust and makes upgrades difficult.

### Automated Changelog Generation Only

**Why not chosen**: While automation is valuable (and we may add it later with Changesets), manual curation ensures quality, clarity, and user-focused descriptions. Pure automation often produces technical, less-readable entries.

## Implementation

- `CHANGELOG.md` in project root follows Keep-a-changelog format
- Each release includes a versioned section with date
- Changes are categorized appropriately
- `[Unreleased]` section tracks upcoming changes
- Future: Consider Changesets integration for automated changelog generation from changeset files

## References

- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Keep a Changelog Repository](https://github.com/olivierlacan/keep-a-changelog)
- Our CHANGELOG.md file in project root
