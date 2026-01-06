/**
 * LLM model discovery tools for OpenAI, Anthropic, and Gemini
 */

export interface ModelInfo {
  provider: string;
  model_id: string;
  display_name?: string;
}

/**
 * List available models from OpenAI
 */
export async function listOpenAIModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return [];
  }

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
  const url = `${baseUrl.replace(/\/$/, '')}/v1/models`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { data?: Array<{ id?: string; name?: string }> };
    const models: ModelInfo[] = [];

    for (const model of data.data || []) {
      if (model.id && typeof model.id === 'string') {
        models.push({
          provider: 'openai',
          model_id: model.id,
          display_name: model.name || undefined,
        });
      }
    }

    return models;
  } catch (error) {
    console.error('Error fetching OpenAI models:', error);
    return [];
  }
}

/**
 * List available models from Anthropic
 */
export async function listAnthropicModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { data?: Array<{ id?: string; display_name?: string }> };
    const models: ModelInfo[] = [];

    for (const model of data.data || []) {
      if (model.id && typeof model.id === 'string') {
        models.push({
          provider: 'anthropic',
          model_id: model.id,
          display_name: model.display_name || undefined,
        });
      }
    }

    return models;
  } catch (error) {
    console.error('Error fetching Anthropic models:', error);
    return [];
  }
}

/**
 * List available models from Gemini
 */
export async function listGeminiModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        headers: {
          'x-goog-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json() as { models?: Array<{ name?: string; displayName?: string }> };
    const models: ModelInfo[] = [];

    for (const model of data.models || []) {
      const name = model.name;
      if (name && typeof name === 'string') {
        // Remove "models/" prefix if present
        const modelId = name.replace(/^models\//, '');
        models.push({
          provider: 'google',
          model_id: modelId,
          display_name: model.displayName || undefined,
        });
      }
    }

    return models;
  } catch (error) {
    console.error('Error fetching Gemini models:', error);
    return [];
  }
}

/**
 * List all available models from all providers
 */
export async function listAllModels(): Promise<ModelInfo[]> {
  const [openai, anthropic, gemini] = await Promise.all([
    listOpenAIModels(),
    listAnthropicModels(),
    listGeminiModels(),
  ]);

  return [...openai, ...anthropic, ...gemini];
}

/**
 * Pick best model based on regex patterns
 * Returns the first match from the first matching pattern, sorted to prefer newer versions
 */
export function pickBestModel(
  models: ModelInfo[],
  provider: string,
  patterns: string[]
): string | null {
  const providerModels = models
    .filter((m) => m.provider === provider)
    .map((m) => m.model_id);

  for (const pattern of patterns) {
    const regex = new RegExp(pattern);
    const matches = providerModels.filter((id) => regex.test(id));
    if (matches.length > 0) {
      // Sort to prefer newer versions (higher numbers, more recent dates)
      // Reverse sort so newest comes first
      const sorted = matches.sort((a, b) => {
        // Extract version numbers and dates for better sorting
        // For Anthropic: claude-opus-4-5-20251101 should come before claude-opus-4-1-20250805
        // Sort in reverse to get newest first
        return b.localeCompare(a);
      });
      return sorted[0];
    }
  }

  return null;
}

/**
 * Select default models for each category
 */
export function selectDefaultModels(
  models: ModelInfo[]
): Record<string, Record<string, string | null>> {
  return {
    reasoning: {
      openai: pickBestModel(models, 'openai', [
        '^gpt-5\\.2.*thinking',
        '^gpt-5\\.2',
        '^gpt-5',
      ]),
      anthropic: pickBestModel(models, 'anthropic', [
        '^claude-opus-4-5-',
        '^claude-opus-4\\.5-',
        '^claude-opus-4-1-',
        '^claude-opus-4-',
      ]),
      google: pickBestModel(models, 'google', [
        '^gemini-3-pro',
        '^gemini-3',
        '^gemini-2\\.5-pro',
      ]),
    },
    fast: {
      openai: pickBestModel(models, 'openai', [
        '^gpt-5\\.2.*instant',
        '^gpt-5.*mini',
        '^gpt-4\\.1-mini',
      ]),
      anthropic: pickBestModel(models, 'anthropic', [
        '^claude-sonnet-4-5-',
        '^claude-sonnet-4\\.5-',
        '^claude-sonnet-4-',
        '^claude-3-5-sonnet-',
      ]),
      google: pickBestModel(models, 'google', [
        '^gemini-3-flash',
        '^gemini-2\\.5-flash',
      ]),
    },
    vision: {
      openai: pickBestModel(models, 'openai', ['^gpt-5\\.2', '^gpt-4\\.1']),
      anthropic: pickBestModel(models, 'anthropic', [
        '^claude-opus-4-5-',
        '^claude-opus-4\\.5-',
        '^claude-opus-4-1-',
        '^claude-sonnet-4-5-',
        '^claude-sonnet-4\\.5-',
        '^claude-sonnet-4-',
      ]),
      google: pickBestModel(models, 'google', [
        '^gemini-3-pro',
        '^gemini-2\\.5-pro',
      ]),
    },
  };
}

