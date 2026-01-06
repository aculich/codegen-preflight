#!/usr/bin/env node
/**
 * MCP Server for Codegen Preflight
 * Provides tools and resources for version and model discovery
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { generateSnapshot } from './resources/snapshot.js';
import { getLatestVersions, DEFAULT_WATCHED_PACKAGES } from './tools/versions.js';
import { listAllModels, selectDefaultModels } from './tools/models.js';
import { getAllCodegenInstructions } from './tools/codegen-instructions.js';

const server = new Server(
  {
    name: 'codegen-preflight',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_latest_versions',
      description:
        'Get the latest versions of packages from npm or PyPI registries',
      inputSchema: {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                ecosystem: {
                  type: 'string',
                  enum: ['npm', 'pypi'],
                },
              },
              required: ['name', 'ecosystem'],
            },
            description: 'List of packages to query',
          },
        },
        required: ['packages'],
      },
    },
    {
      name: 'list_llm_models',
      description:
        'List available models from LLM providers (OpenAI, Anthropic, Gemini). Requires API keys in environment.',
      inputSchema: {
        type: 'object',
        properties: {
          provider: {
            type: 'string',
            enum: ['openai', 'anthropic', 'google', 'all'],
            description: 'Which provider to query, or "all" for all providers',
          },
        },
      },
    },
    {
      name: 'get_sdk_codegen_instructions',
      description:
        'Fetch code generation instructions from SDK repositories (e.g., Google python-genai)',
      inputSchema: {
        type: 'object',
        properties: {
          sdk: {
            type: 'string',
            description: 'SDK name (e.g., "google-genai")',
          },
        },
      },
    },
    {
      name: 'generate_snapshot',
      description:
        'Generate a complete state-of-the-world snapshot with versions, models, and codegen instructions',
      inputSchema: {
        type: 'object',
        properties: {
          workspace_root: {
            type: 'string',
            description: 'Optional workspace root path',
          },
        },
      },
    },
    {
      name: 'analyze_sdk_with_repomix',
      description:
        'Analyze an SDK repository using Repomix to extract codegen instructions and key information',
      inputSchema: {
        type: 'object',
        properties: {
          repo_url: { type: 'string', description: 'GitHub repository URL' },
          sdk_name: { type: 'string', description: 'SDK name' },
        },
        required: ['repo_url', 'sdk_name'],
      },
    },
    {
      name: 'get_context7_docs',
      description:
        'Fetch up-to-date documentation for a library using Context7',
      inputSchema: {
        type: 'object',
        properties: {
          library: { type: 'string', description: 'Library name' },
          version: { type: 'string', description: 'Optional version' },
        },
        required: ['library'],
      },
    },
    {
      name: 'get_litellm_catalog',
      description:
        'Get LiteLLM model catalog with routing and capability information',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ],
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_latest_versions': {
        const packages = (args as any).packages || [];
        const versions = await getLatestVersions(packages);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(versions, null, 2),
            },
          ],
        };
      }

      case 'list_llm_models': {
        const provider = (args as any).provider || 'all';
        const allModels = await listAllModels();
        const filtered =
          provider === 'all'
            ? allModels
            : allModels.filter((m) => m.provider === provider);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(filtered, null, 2),
            },
          ],
        };
      }

      case 'get_sdk_codegen_instructions': {
        const instructions = await getAllCodegenInstructions();
        const sdk = (args as any).sdk;
        const filtered = sdk
          ? instructions.filter((i) => i.sdk === sdk)
          : instructions;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(filtered, null, 2),
            },
          ],
        };
      }

      case 'generate_snapshot': {
        const workspaceRoot = (args as any).workspace_root;
        const snapshot = await generateSnapshot(workspaceRoot);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(snapshot, null, 2),
            },
          ],
        };
      }

      case 'analyze_sdk_with_repomix': {
        const { analyzeSDKWithRepomix } = await import('./tools/repomix.js');
        const repoUrl = (args as any).repo_url;
        const sdkName = (args as any).sdk_name;
        const analysis = await analyzeSDKWithRepomix(repoUrl, sdkName);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'get_context7_docs': {
        const { getContext7Documentation } = await import('./tools/context7.js');
        const library = (args as any).library;
        const version = (args as any).version;
        const doc = await getContext7Documentation(library, version);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(doc, null, 2),
            },
          ],
        };
      }

      case 'get_litellm_catalog': {
        const { getLiteLLMModelCatalog } = await import('./tools/litellm.js');
        const catalog = await getLiteLLMModelCatalog();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(catalog, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'preflight://snapshot/current',
      name: 'Current Snapshot',
      description: 'The current day\'s cached snapshot',
      mimeType: 'application/json',
    },
    {
      uri: 'preflight://packages/npm',
      name: 'npm Packages',
      description: 'Latest versions for npm packages',
      mimeType: 'application/json',
    },
    {
      uri: 'preflight://packages/pypi',
      name: 'PyPI Packages',
      description: 'Latest versions for PyPI packages',
      mimeType: 'application/json',
    },
    {
      uri: 'preflight://models/openai',
      name: 'OpenAI Models',
      description: 'Available models from OpenAI',
      mimeType: 'application/json',
    },
    {
      uri: 'preflight://models/anthropic',
      name: 'Anthropic Models',
      description: 'Available models from Anthropic',
      mimeType: 'application/json',
    },
    {
      uri: 'preflight://models/google',
      name: 'Google Models',
      description: 'Available models from Google (Gemini)',
      mimeType: 'application/json',
    },
  ],
}));

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    if (uri === 'preflight://snapshot/current') {
      const snapshot = await generateSnapshot();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(snapshot, null, 2),
          },
        ],
      };
    }

    if (uri.startsWith('preflight://packages/')) {
      const ecosystem = uri.split('/').pop();
      if (ecosystem === 'npm' || ecosystem === 'pypi') {
        const packages =
          ecosystem === 'npm'
            ? DEFAULT_WATCHED_PACKAGES.npm.map((name) => ({
                name,
                ecosystem: 'npm' as const,
              }))
            : DEFAULT_WATCHED_PACKAGES.pypi.map((name) => ({
                name,
                ecosystem: 'pypi' as const,
              }));
        const versions = await getLatestVersions(packages);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(versions, null, 2),
            },
          ],
        };
      }
    }

    if (uri.startsWith('preflight://models/')) {
      const provider = uri.split('/').pop();
      const allModels = await listAllModels();
      const filtered =
        provider === 'all'
          ? allModels
          : allModels.filter((m) => m.provider === provider);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(filtered, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Codegen Preflight MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

