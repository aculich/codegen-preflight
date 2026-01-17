# Developer Experience (DevX) Guide

This document describes the developer experience tools and workflows used in this project, with a focus on Architecture Decision Records (ADRs) and decision tracking.

## Architecture Decision Records (ADRs)

We use [adr-chronicle](https://github.com/aculich/adr-chronicle) to track architectural decisions and their rationale. This ensures that the "why" behind decisions is preserved for future reference.

### What are ADRs?

Architecture Decision Records (ADRs) are documents that capture important architectural decisions made along with their context and consequences. They help:

- **Preserve context**: Understand why decisions were made, not just what was decided
- **Avoid repetition**: Learn from past decisions and avoid repeating mistakes
- **Onboard new contributors**: Quickly understand the project's architectural history
- **Compliance**: Maintain audit trails for regulatory or organizational requirements
- **AI-assisted development**: Provide context to AI assistants about project decisions

### Why adr-chronicle?

We chose adr-chronicle because it:

- **Low friction**: Create ADRs in under 2 minutes
- **AI-assisted**: LLMs help generate ADRs from context
- **Standards-based**: Built on [MADR 4.0](https://adr.github.io/madr/) format
- **Local-first**: ADRs live in your repo, version-controlled with your code
- **Future-ready**: Designed for AI-everywhere development workflows

### How to Use adr-chronicle

#### Installation

The tool is available in the `upstream/adr-chronicle` directory. You can either:

1. **Use directly from upstream** (recommended for now):
   ```bash
   cd upstream/adr-chronicle
   python3 -m adr_chronicle.cli <command>
   ```

2. **Install globally** (when available on PyPI):
   ```bash
   pip install adr-chronicle
   ```

#### Initialization

If this is your first time using ADRs in this repo:

```bash
# From the repo root
python3 -m adr_chronicle.cli init --adr-dir docs/adr
```

This will:
- Create the `docs/adr/` directory if it doesn't exist
- Set up ADR templates (MADR 4.0 format)
- Create an index for tracking ADRs

#### Creating a New ADR

When you make an architectural decision, create an ADR:

```bash
# Basic usage
python3 -m adr_chronicle.cli new "Why we chose MIT license"

# With AI assistance (if configured)
python3 -m adr_chronicle.cli new "Why we chose MIT license" --ai
```

This will:
1. Create a new ADR file (e.g., `docs/adr/0002-why-we-chose-mit-license.md`)
2. Open it in your editor for you to fill in
3. Use the MADR 4.0 template format

#### ADR Structure

Each ADR follows the MADR 4.0 format:

```markdown
# ADR-XXXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Describe the issue or situation that motivates this decision]

## Decision
[Describe the architectural decision being made]

## Consequences
### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

## Alternatives Considered
### [Alternative 1]
[Description and why it was not chosen]

## References
- [Link to related discussions, documents, or resources]
```

#### Listing ADRs

View all ADRs:

```bash
python3 -m adr_chronicle.cli list
```

#### Validating ADRs

Check that ADRs follow the correct format:

```bash
python3 -m adr_chronicle.cli validate
```

#### Superseding ADRs

When a decision is replaced by a new one, mark it as superseded:

```bash
python3 -m adr_chronicle.cli supersede <old-adr-number> <new-adr-number>
```

### When to Create an ADR

Create an ADR when you make decisions about:

- **Technology choices**: Why we chose X over Y
- **Architecture patterns**: How we structure the codebase
- **Dependencies**: Why we use certain libraries
- **Licensing**: License selection and rationale
- **Tooling**: Development tools and workflows
- **API design**: Interface and contract decisions
- **Data models**: Schema and data structure decisions
- **Security**: Security-related architectural choices

**Don't create ADRs for:**
- Implementation details (those go in code comments)
- Temporary decisions (only document decisions that will have lasting impact)
- Obvious choices (only document when there were meaningful alternatives)

### ADR Workflow

1. **Make a decision**: During development, you encounter a choice
2. **Create ADR**: Run `chronicle new "Decision title"`
3. **Fill in context**: Document the situation and constraints
4. **Document decision**: Explain what you chose and why
5. **List consequences**: Both positive and negative impacts
6. **Consider alternatives**: Document what else was considered
7. **Mark as Accepted**: Once the decision is finalized
8. **Commit**: Include the ADR in your PR/commit

### Integration with Development Workflow

ADRs are:
- **Version controlled**: Committed alongside code changes
- **Reviewed in PRs**: ADRs should be reviewed like code
- **Referenced in code**: Link to ADRs in code comments when relevant
- **Indexed**: The tool maintains an index for easy discovery

### Example: License Decision ADR

See `docs/adr/0001-license-selection.md` for an example ADR documenting our license choice.

### Future Enhancements

As adr-chronicle evolves, we'll gain access to:

- **AI-assisted drafting**: LLMs help generate ADRs from context
- **Semantic search**: Find similar past decisions instantly
- **GitHub integration**: Sync with Discussions for async review
- **CI/CD enforcement**: Block merges without ADRs for major changes

### References

- [adr-chronicle Repository](https://github.com/aculich/adr-chronicle)
- [MADR 4.0 Specification](https://adr.github.io/madr/)
- [Architecture Decision Records (ADR) Guide](https://adr.github.io/)
