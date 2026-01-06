/**
 * Snapshot resource provider for MCP
 */

export interface Provenance {
  data_source: string;
  source_type: 'api' | 'registry' | 'github' | 'file';
  source_url?: string;
  fetched_at?: string;
  method?: string;
}

export interface Snapshot {
  generated_at_unix: number;
  generated_at_iso: string;
  repo?: {
    root: string;
  };
  deps: {
    npm_latest: Record<string, string>;
    pypi_latest: Record<string, string>;
  };
  models: {
    discovered: Array<{
      provider: string;
      model_id: string;
      display_name?: string;
      release_date?: string;
      is_preview?: boolean;
      is_deprecated?: boolean;
      model_type?: 'chat' | 'image' | 'embedding' | 'audio' | 'other';
    }>;
    selected: Record<
      string,
      Record<string, string | null>
    >;
  };
  codegen_instructions?: Array<{
    sdk: string;
    provider: string;
    content: string;
    source_url?: string;
  }>;
  repomix_analyses?: Array<{
    sdk: string;
    repo_url: string;
    codegen_instructions?: string;
    key_files?: string[];
    summary?: string;
  }>;
  litellm_catalog?: Array<{
    model_id: string;
    provider: string;
    litellm_provider: string;
    supports_streaming?: boolean;
    supports_vision?: boolean;
    supports_function_calling?: boolean;
  }>;
  provenance?: {
    npm_registry?: Provenance;
    pypi_registry?: Provenance;
    openai_api?: Provenance;
    anthropic_api?: Provenance;
    gemini_api?: Provenance;
    codegen_instructions?: Provenance[];
  };
  notes?: string[];
}

/**
 * Generate a complete snapshot
 */
export async function generateSnapshot(
  workspaceRoot?: string
): Promise<Snapshot> {
  const { getLatestVersions, DEFAULT_WATCHED_PACKAGES } = await import(
    '../tools/versions.js'
  );
  const { listAllModels, selectDefaultModels } = await import(
    '../tools/models.js'
  );
  const { getAllCodegenInstructions } = await import(
    '../tools/codegen-instructions.js'
  );

  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000);
  const isoString = now.toISOString();

  // Fetch package versions
  const npmPackages = DEFAULT_WATCHED_PACKAGES.npm.map((name) => ({
    name,
    ecosystem: 'npm' as const,
  }));
  const pypiPackages = DEFAULT_WATCHED_PACKAGES.pypi.map((name) => ({
    name,
    ecosystem: 'pypi' as const,
  }));

  // Optionally include enhanced features
  const includeEnhanced = process.env.ENABLE_ENHANCED_FEATURES === 'true';
  
  const [npmVersions, pypiVersions, models, codegenInstructions, repomixAnalyses, litellmCatalog] =
    await Promise.all([
      getLatestVersions(npmPackages),
      getLatestVersions(pypiPackages),
      listAllModels(),
      getAllCodegenInstructions(),
      includeEnhanced ? (async () => {
        const { analyzeMultipleSDKs, KNOWN_SDK_REPOS } = await import('../tools/repomix.js');
        return analyzeMultipleSDKs(
          Object.entries(KNOWN_SDK_REPOS).map(([name, repo]) => ({ name, repo }))
        );
      })() : Promise.resolve([]),
      includeEnhanced ? (async () => {
        const { getLiteLLMModelCatalog } = await import('../tools/litellm.js');
        return getLiteLLMModelCatalog();
      })() : Promise.resolve([]),
    ]);

  const selected = selectDefaultModels(models);

  // Build provenance information
  const provenance: Snapshot['provenance'] = {
    npm_registry: {
      data_source: 'npm registry',
      source_type: 'registry',
      source_url: 'https://registry.npmjs.org',
      fetched_at: isoString,
      method: 'GET /{package} (dist-tags.latest)',
    },
    pypi_registry: {
      data_source: 'PyPI registry',
      source_type: 'registry',
      source_url: 'https://pypi.org/pypi',
      fetched_at: isoString,
      method: 'GET /{package}/json (info.version)',
    },
    openai_api: {
      data_source: 'OpenAI API',
      source_type: 'api',
      source_url: process.env.OPENAI_BASE_URL || 'https://api.openai.com',
      fetched_at: isoString,
      method: 'GET /v1/models (Bearer token)',
    },
    anthropic_api: {
      data_source: 'Anthropic API',
      source_type: 'api',
      source_url: 'https://api.anthropic.com',
      fetched_at: isoString,
      method: 'GET /v1/models (x-api-key header)',
    },
    gemini_api: {
      data_source: 'Google Gemini API',
      source_type: 'api',
      source_url: 'https://generativelanguage.googleapis.com',
      fetched_at: isoString,
      method: 'GET /v1beta/models (x-goog-api-key header)',
    },
    codegen_instructions: codegenInstructions.map((inst) => ({
      data_source: `${inst.sdk} codegen instructions`,
      source_type: 'github' as const,
      source_url: inst.source_url,
      fetched_at: isoString,
      method: 'GET (raw GitHub content)',
    })),
  };

  const snapshot: Snapshot = {
    generated_at_unix: timestamp,
    generated_at_iso: isoString,
    deps: {
      npm_latest: npmVersions,
      pypi_latest: pypiVersions,
    },
    models: {
      discovered: models.map((m) => ({
        provider: m.provider,
        model_id: m.model_id,
        display_name: m.display_name,
        release_date: m.release_date,
        is_preview: m.is_preview,
        is_deprecated: m.is_deprecated,
        model_type: m.model_type,
      })),
      selected,
    },
    codegen_instructions: codegenInstructions.length > 0 ? codegenInstructions : undefined,
    repomix_analyses: repomixAnalyses.length > 0 ? repomixAnalyses : undefined,
    litellm_catalog: litellmCatalog.length > 0 ? litellmCatalog : undefined,
    provenance,
    notes: [
      'If models.discovered is empty, set OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY then rerun.',
      'This snapshot is meant to be injected into Cursor via an always-apply rule.',
      includeEnhanced ? 'Enhanced features (Repomix, LiteLLM) are enabled.' : 'Set ENABLE_ENHANCED_FEATURES=true to enable Repomix and LiteLLM integration.',
    ],
  };

  if (workspaceRoot) {
    snapshot.repo = { root: workspaceRoot };
  }

  return snapshot;
}

