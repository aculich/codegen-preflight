/**
 * SDK codegen instructions fetcher
 * Fetches code generation instructions from SDK repositories
 */

export interface CodegenInstruction {
  sdk: string;
  provider: string;
  content: string;
  source_url?: string;
}

/**
 * Fetch codegen instructions from Google's python-genai repo
 */
export async function getGoogleGenAICodegenInstructions(): Promise<CodegenInstruction | null> {
  try {
    // Try to fetch from GitHub raw content
    // Common locations: CONTRIBUTING.md, docs/LLM.md, or similar
    const possiblePaths = [
      'https://raw.githubusercontent.com/googleapis/python-genai/main/CONTRIBUTING.md',
      'https://raw.githubusercontent.com/googleapis/python-genai/main/docs/LLM.md',
      'https://raw.githubusercontent.com/googleapis/python-genai/main/README.md',
    ];

    for (const url of possiblePaths) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const content = await response.text();
          // Look for codegen-related sections
          if (
            content.toLowerCase().includes('codegen') ||
            content.toLowerCase().includes('llm') ||
            content.toLowerCase().includes('code generation')
          ) {
            return {
              sdk: 'google-genai',
              provider: 'google',
              content: content.substring(0, 5000), // Limit size
              source_url: url,
            };
          }
        }
      } catch (error) {
        // Try next path
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching Google codegen instructions:', error);
    return null;
  }
}

/**
 * Fetch codegen instructions from all known SDKs
 */
export async function getAllCodegenInstructions(): Promise<
  CodegenInstruction[]
> {
  const instructions: CodegenInstruction[] = [];

  const google = await getGoogleGenAICodegenInstructions();
  if (google) {
    instructions.push(google);
  }

  // Add more providers as needed
  // - Anthropic SDK
  // - OpenAI SDK
  // etc.

  return instructions;
}

