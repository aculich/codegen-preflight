/**
 * Convert snapshot JSON to Cursor rule format (.mdc)
 */

import type { Snapshot } from '../resources/snapshot.js';

/**
 * Generate Cursor rule content from snapshot
 */
export function snapshotToRule(snapshot: Snapshot): string {
  const { generated_at_iso, deps, models, codegen_instructions, provenance } = snapshot;

  // Build provenance section
  let provenanceSection = '';
  if (provenance) {
    provenanceSection = `## Data Provenance

This snapshot was generated from the following sources:

### Package Registries

${provenance.npm_registry ? `- **npm**: ${provenance.npm_registry.source_url} (${provenance.npm_registry.method})` : ''}
${provenance.pypi_registry ? `- **PyPI**: ${provenance.pypi_registry.source_url} (${provenance.pypi_registry.method})` : ''}

### LLM Provider APIs

${provenance.openai_api ? `- **OpenAI**: ${provenance.openai_api.source_url}${provenance.openai_api.source_url ? ` (${provenance.openai_api.method})` : ''}` : ''}
${provenance.anthropic_api ? `- **Anthropic**: ${provenance.anthropic_api.source_url} (${provenance.anthropic_api.method})` : ''}
${provenance.gemini_api ? `- **Google Gemini**: ${provenance.gemini_api.source_url} (${provenance.gemini_api.method})` : ''}

${provenance.codegen_instructions && provenance.codegen_instructions.length > 0 ? `### Codegen Instructions Sources

${provenance.codegen_instructions.map((p) => `- **${p.data_source}**: ${p.source_url || 'N/A'} (${p.method})`).join('\n')}` : ''}

---
`;
  }

  const rule = `---
alwaysApply: true
description: "AUTO-GENERATED: Version + model snapshot for codegen freshness. Run /preflight to refresh."
---

# Version & Model Snapshot (AUTO-GENERATED)

Generated: ${generated_at_iso}

${provenanceSection}## Selected Default Models (deterministic)

\`\`\`json
${JSON.stringify(models.selected, null, 2)}
\`\`\`

## SDK Latest Versions (registry)

### npm

\`\`\`json
${JSON.stringify(deps.npm_latest, null, 2)}
\`\`\`

### PyPI

\`\`\`json
${JSON.stringify(deps.pypi_latest, null, 2)}
\`\`\`

## Discovered Models

Total models discovered: ${models.discovered.length}

${models.discovered.length > 0 ? `\`\`\`json
${JSON.stringify(models.discovered.slice(0, 20), null, 2)}
${models.discovered.length > 20 ? `\n... and ${models.discovered.length - 20} more` : ''}
\`\`\`` : '*No models discovered. Set OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY to enable model discovery.*'}

${codegen_instructions && codegen_instructions.length > 0 ? `## SDK Codegen Instructions

${codegen_instructions.map((inst) => `### ${inst.sdk} (${inst.provider})

${inst.source_url ? `Source: ${inst.source_url}\n\n` : ''}${inst.content.substring(0, 2000)}${inst.content.length > 2000 ? '...' : ''}`).join('\n\n---\n\n')}` : ''}

## Rules for Codegen

* Use the **Selected default models** above unless the user explicitly pins something else.
* When writing provider code, use **canonical discovered model IDs** (or these selections).
* When writing install snippets, prefer the **latest versions** above unless repo policy pins older versions.
* Never invent model IDs. Only use model IDs that appear in the discovered models list above.
* Never recommend deprecated SDKs if the snapshot indicates replacements.
`;

  return rule;
}

