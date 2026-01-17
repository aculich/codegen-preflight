# ADR-0001: License Selection

## Status

Accepted

## Context

We need to select an open source license for the Codegen Preflight project. This is a VS Code/Cursor extension with an MCP server that provides developers with up-to-date package versions and LLM model information.

Key considerations:
- This is a VS Code extension (VS Code ecosystem standard is MIT)
- Developer tooling (maximize adoption, minimize friction)
- Not patent-heavy infrastructure
- Not a SaaS product requiring defensive licensing
- May have contributions from multiple organizations
- Part of the broader AI/ML tooling ecosystem

We consulted multiple LLM providers (Claude, ChatGPT, Gemini, Perplexity) and reviewed community best practices (Jupyter, UC Berkeley OSPO, corporate OSPOs) to inform this decision.

## Decision

We will use the **MIT License** for this project.

This decision is based on:

1. **Ecosystem alignment**: MIT is the overwhelming standard for VS Code extensions. Microsoft's own extensions and ecosystem samples use MIT, minimizing friction for developers who want to fork or contribute.

2. **Project characteristics**: This is developer tooling, not core infrastructure. The goal is maximum adoption with minimal legal friction.

3. **Community guidance**: 
   - UC Berkeley OSPO recommends MIT/BSD for "lightweight, low-risk" libraries
   - VS Code ecosystem standard is MIT
   - Corporate OSPOs (Google, Microsoft) use MIT for SDKs and web tooling to maximize adoption

4. **Simplicity**: MIT is the shortest, simplest permissive license with minimal restrictions (just attribution required).

## Consequences

### Positive

- **Maximum adoption**: Lowest friction for developers to use, fork, or contribute
- **Ecosystem alignment**: Matches VS Code extension community standards
- **Simple compliance**: Just requires keeping copyright and license notice
- **Widely understood**: Most developers are familiar with MIT
- **No legal review needed**: Most organizations can use MIT without legal review

### Negative

- **No explicit patent grant**: Unlike Apache-2.0, MIT doesn't explicitly grant patent rights. However, many organizations accept this tradeoff for lower friction.
- **Less preferred by some enterprises**: Some enterprises with strict IP lawyers prefer Apache-2.0 for its explicit patent protection.

## Alternatives Considered

### Apache-2.0 License

**Why not chosen**: While Apache-2.0 provides explicit patent grants and is preferred for infrastructure and AI/ML frameworks, it adds compliance overhead (NOTICE files, modification notices) that isn't necessary for a VS Code extension. The patent risk is low for developer tooling, and the ecosystem standard favors MIT.

**When we might reconsider**: If the project evolves to include core infrastructure components, multiple corporate contributors, or patent-sensitive AI/ML components, we would consider migrating those components to Apache-2.0 while keeping the extension as MIT.

### BSD-3-Clause

**Why not chosen**: BSD-3-Clause is similar to MIT but includes a non-endorsement clause. While this aligns with the Jupyter/scientific Python ecosystem, it's not necessary for our use case and MIT is more common in the VS Code ecosystem.

### AGPL-3.0

**Why not chosen**: AGPL is a copyleft license that requires sharing improvements when running as a network service. This is appropriate for SaaS products wanting to prevent cloud strip-mining, but:
- We're not a SaaS product
- AGPL would deter enterprise adoption
- It's not appropriate for developer tooling where frictionless embedding matters

## References

- [License Guidance Document](../design/LICENSE-GUIDANCE.md)
- [License Consensus Analysis](../design/LICENSE-CONSENSUS.md)
- [UC Berkeley OSPO Licensing Guidance](https://ospo.berkeley.edu/guidance/licensing/)
- [Project Jupyter License FAQ](https://github.com/jupyter/governance/blob/main/licensing.md)
- [Open Source Initiative: License Usage Trends](https://opensource.org/licenses)
