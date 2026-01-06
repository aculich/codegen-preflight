/**
 * LLM model discovery tools for OpenAI, Anthropic, and Gemini
 */

export interface ModelInfo {
  provider: string;
  model_id: string;
  display_name?: string;
  release_date?: string; // ISO date string (YYYY-MM-DD) or date from model ID
  is_preview?: boolean; // true if model name contains "preview", "beta", "exp"
  is_deprecated?: boolean; // true if model is marked as deprecated
  model_type?: 'chat' | 'image' | 'embedding' | 'audio' | 'other'; // Type of model
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
        const modelId = model.id;
        const metadata = extractModelMetadata(modelId, 'openai');
        models.push({
          provider: 'openai',
          model_id: modelId,
          display_name: model.name || undefined,
          ...metadata,
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
        const modelId = model.id;
        const metadata = extractModelMetadata(modelId, 'anthropic');
        models.push({
          provider: 'anthropic',
          model_id: modelId,
          display_name: model.display_name || undefined,
          ...metadata,
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
        const metadata = extractModelMetadata(modelId, 'google');
        models.push({
          provider: 'google',
          model_id: modelId,
          display_name: model.displayName || undefined,
          ...metadata,
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
 * Extract metadata from model ID (release date, preview status, model type)
 */
function extractModelMetadata(
  modelId: string,
  provider: string
): Partial<ModelInfo> {
  const metadata: Partial<ModelInfo> = {};

  // Detect preview/beta status
  metadata.is_preview =
    modelId.includes('preview') ||
    modelId.includes('beta') ||
    modelId.includes('exp') ||
    modelId.includes('experimental');

  // Detect model type
  if (modelId.includes('image') || modelId.includes('dall-e') || modelId.includes('gpt-image')) {
    metadata.model_type = 'image';
  } else if (modelId.includes('embedding') || modelId.includes('text-embedding')) {
    metadata.model_type = 'embedding';
  } else if (modelId.includes('tts') || modelId.includes('whisper') || modelId.includes('audio')) {
    metadata.model_type = 'audio';
  } else {
    metadata.model_type = 'chat';
  }

  // Extract release date from model ID
  // Anthropic: claude-opus-4-5-20251101 -> 2025-11-01
  // OpenAI: gpt-4o-2024-05-13 -> 2024-05-13
  // Google: gemini-2.5-pro (no date in ID, would need API response)
  
  // Anthropic format: claude-opus-4-5-20251101
  const anthropicDateMatch = modelId.match(/(\d{8})$/);
  if (anthropicDateMatch) {
    const dateStr = anthropicDateMatch[1];
    metadata.release_date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }

  // OpenAI format: gpt-4o-2024-05-13 or gpt-5.2-pro-2025-12-11
  const openaiDateMatch = modelId.match(/(\d{4}-\d{2}-\d{2})$/);
  if (openaiDateMatch) {
    metadata.release_date = openaiDateMatch[1];
  }

  // Detect deprecated models (common patterns)
  if (
    modelId.includes('deprecated') ||
    modelId.includes('retired') ||
    (provider === 'openai' && modelId.includes('davinci-002')) ||
    (provider === 'openai' && modelId.includes('babbage-002'))
  ) {
    metadata.is_deprecated = true;
  }

  return metadata;
}

/**
 * List OpenAI image generation models (separate endpoint)
 */
export async function listOpenAIImageModels(): Promise<ModelInfo[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return [];
  }

  // OpenAI image models are typically listed in the main /v1/models endpoint
  // but we can also check for known image generation models
  const knownImageModels = [
    'dall-e-2',
    'dall-e-3',
    'gpt-image-1',
    'gpt-image-1-mini',
    'gpt-image-1.5',
  ];

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
    const imageModels: ModelInfo[] = [];

    for (const model of data.data || []) {
      if (model.id && typeof model.id === 'string') {
        const modelId = model.id.toLowerCase();
        // Check if it's an image generation model
        if (
          knownImageModels.some((known) => modelId.includes(known)) ||
          modelId.includes('image') ||
          modelId.includes('dall-e')
        ) {
          const metadata = extractModelMetadata(model.id, 'openai');
          imageModels.push({
            provider: 'openai',
            model_id: model.id,
            display_name: model.name || undefined,
            model_type: 'image',
            ...metadata,
          });
        }
      }
    }

    return imageModels;
  } catch (error) {
    console.error('Error fetching OpenAI image models:', error);
    return [];
  }
}

/**
 * List all available models from all providers
 */
export async function listAllModels(): Promise<ModelInfo[]> {
  const [openai, anthropic, gemini, openaiImages] = await Promise.all([
    listOpenAIModels(),
    listAnthropicModels(),
    listGeminiModels(),
    listOpenAIImageModels(),
  ]);

  // Combine all models, avoiding duplicates
  const allModels = [...openai, ...anthropic, ...gemini];
  const imageModelIds = new Set(openaiImages.map((m) => m.model_id));
  
  // Add image models that aren't already in the main list
  for (const imgModel of openaiImages) {
    if (!imageModelIds.has(imgModel.model_id) || !allModels.some((m) => m.model_id === imgModel.model_id)) {
      allModels.push(imgModel);
    }
  }

  return allModels;
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

