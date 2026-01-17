# License Selection Guidance

This document provides guidance for selecting an open source license for this project, based on consensus from multiple LLM providers (Claude, ChatGPT, Gemini, Perplexity) and community best practices as of January 2026.

## Quick Decision Matrix

| Scenario | Recommended License | Rationale |
|----------|-------------------|-----------|
| **VS Code Extension** | **MIT** | Standard for VS Code ecosystem, minimal friction |
| **Jupyter Extension** | **BSD-3-Clause** | Aligns with scientific Python/Jupyter ecosystem |
| **SaaS Startup (Defensive)** | **AGPLv3** (Core) + **MIT** (SDKs) | Protects against cloud strip-mining |
| **SaaS Startup (Modern)** | **FSL** (Functional Source License) | Protects revenue for 2 years, then becomes Open Source |
| **Corporate/Patent Heavy** | **Apache-2.0** | Explicit patent grant, enterprise-friendly |
| **AI/ML Infrastructure** | **Apache-2.0** | Patent protection critical for AI work |

## MIT vs Apache-2.0

### MIT License
**Best for:**
- VS Code extensions (most common in ecosystem)
- Fast-moving developer tools
- Front-end packages and smaller libraries
- Projects prioritizing maximum adoption with minimal friction

**Pros:**
- Very short, simple, plain language
- Minimal restrictions (just attribution required)
- Widely understood and accepted
- Lowest onboarding friction

**Cons:**
- No explicit patent grant (some orgs accept this tradeoff)
- Less preferred by enterprises with strict IP lawyers

### Apache-2.0 License
**Best for:**
- Cloud infrastructure
- Machine learning frameworks
- Code expected to be widely commercialized
- Projects with multiple contributors or downstream commercial interest

**Pros:**
- Explicit patent grant and termination clause
- Protects both contributors and users from patent aggression
- Preferred by many OSPOs and legal teams for foundational projects
- Enterprise-friendly compliance story

**Cons:**
- Slightly more paperwork (NOTICE files, modification notices)
- Less "hands-off" than MIT (though toolchains handle much of this)

## Community Recommendations

### Jupyter Community
- Uses **BSD-3-Clause** (similar to MIT, with non-endorsement clause)
- Aligns with scientific Python ecosystem precedent
- Encourages academic/industry adoption

### UC Berkeley OSPO
- **Apache-2.0** preferred for new infrastructure projects
- Especially those with multiple contributors or downstream commercial interest
- MIT/BSD still fine for "lightweight, low-risk" libraries
- AGPL only for very specific niche copyleft use-cases with legal review

### Corporate OSPOs (Google, Microsoft, Meta)
- New major code drops are **Apache-2.0** unless specific ecosystem reasons exist
- MIT still popular for extensions/tools when onboarding friction is paramount
- Cloud infra/AI: Apache-2.0 is the "safe, default, enterprise-friendly" choice

## Startup Strategies

### Open Core Model
- Core product: **AGPLv3** (forces improvements to be shared)
- SDKs/Starter kits: **MIT** (maximize adoption, no friction)
- Commercial license: Offered for enterprises wanting to avoid AGPL obligations

### Functional Source License (FSL)
- Source available for 2 years (not OSI-approved during this period)
- Automatically converts to Apache-2.0 or MIT after 2 years
- Protects startup's fragile early years while guaranteeing future freedom

## AGPL Considerations

### When to Use AGPL
- Infrastructure that could be "strip-mined" by cloud providers
- SaaS products where code is the main asset
- You explicitly want hosted deployers to share modifications
- You're okay trading off some adoption (some enterprises have "no AGPL" policies)

### When NOT to Use AGPL
- Developer tools/libraries where "frictionless embedding" matters most
- You want broadest enterprise uptake with minimal review cycles
- You don't have resources/cultural appetite for copyleft debates

## AI Era Considerations (2026)

### Permissive Licenses Win
- Maximize adoption, especially for foundational AI models/tools
- Network effects are critical in AI ecosystem

### Apache-2.0 Preferred When
- Patent concerns exist (AI, ML, enterprise cloud adoption)
- Project expects contributions from multiple orgs
- Downstream embedding by companies expected

### MIT Preferred When
- Fast prototyping, low risk, or small extension/library
- You prioritize onboarding contributors over legal details

## Recommendation for This Project

**For Codegen Preflight (VS Code Extension + MCP Server):**

Given that this is:
- A VS Code/Cursor extension (VS Code ecosystem standard is MIT)
- Developer tooling (maximize adoption, minimize friction)
- Not patent-heavy infrastructure
- Not a SaaS product requiring defensive licensing

**Recommended: MIT License**

This aligns with:
- VS Code ecosystem standards
- UC Berkeley OSPO guidance for "lightweight, low-risk" libraries
- Community best practices for developer tools
- Maximum adoption and contributor onboarding

If the project evolves to include:
- Core infrastructure components
- Multiple corporate contributors
- Patent-sensitive AI/ML components

Then consider migrating to **Apache-2.0** for those components while keeping the extension as MIT.

## References

- [OSPO UC Berkeley Licensing Guidance](https://ospo.berkeley.edu/guidance/licensing/)
- [Project Jupyter License FAQ](https://github.com/jupyter/governance/blob/main/licensing.md)
- [Open Source Initiative: License Usage Trends](https://opensource.org/licenses)
- [Full Consensus Document](./LICENSE-CONSENSUS.md) - Detailed analysis from multiple LLM providers
