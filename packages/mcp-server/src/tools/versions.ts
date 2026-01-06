/**
 * Package version querying tools for npm and PyPI
 */

export interface PackageVersion {
  package: string;
  version: string;
  ecosystem: 'npm' | 'pypi';
}

/**
 * Fetch latest version from npm registry
 */
export async function getNpmVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json() as { 'dist-tags'?: { latest?: string } };
    return data['dist-tags']?.latest || null;
  } catch (error) {
    console.error(`Error fetching npm version for ${packageName}:`, error);
    return null;
  }
}

/**
 * Fetch latest version from PyPI
 */
export async function getPyPIVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://pypi.org/pypi/${packageName}/json`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json() as { info?: { version?: string } };
    return data.info?.version || null;
  } catch (error) {
    console.error(`Error fetching PyPI version for ${packageName}:`, error);
    return null;
  }
}

/**
 * Batch fetch versions for multiple packages
 */
export async function getLatestVersions(
  packages: { name: string; ecosystem: 'npm' | 'pypi' }[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  await Promise.all(
    packages.map(async ({ name, ecosystem }) => {
      const version =
        ecosystem === 'npm'
          ? await getNpmVersion(name)
          : await getPyPIVersion(name);
      if (version) {
        results[name] = version;
      }
    })
  );
  
  return results;
}

/**
 * Default watched packages
 */
export const DEFAULT_WATCHED_PACKAGES = {
  npm: [
    'next',
    'react',
    'react-dom',
    'openai',
    '@anthropic-ai/sdk',
    '@google/genai',
    'typescript',
    'zod',
    'tailwindcss',
  ],
  pypi: [
    'openai',
    'anthropic',
    'google-genai',
    'litellm',
    'fastapi',
    'pydantic',
    'httpx',
  ],
};

