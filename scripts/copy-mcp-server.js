#!/usr/bin/env node

/**
 * Copy mcp-server dist files to extension directory before packaging
 * This ensures the mcp-server modules are available in the VSIX
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const mcpServerDist = join(rootDir, 'packages', 'mcp-server', 'dist');
const extensionDir = join(rootDir, 'packages', 'extension');
const targetDir = join(extensionDir, 'mcp-server', 'dist');

if (!existsSync(mcpServerDist)) {
  console.error('Error: mcp-server/dist not found. Run "npm run build" first.');
  process.exit(1);
}

// Remove existing copy if it exists
if (existsSync(join(extensionDir, 'mcp-server'))) {
  rmSync(join(extensionDir, 'mcp-server'), { recursive: true, force: true });
}

// Create target directory
mkdirSync(join(extensionDir, 'mcp-server'), { recursive: true });

// Copy dist directory
console.log(`Copying mcp-server/dist to extension/mcp-server/dist...`);
cpSync(mcpServerDist, targetDir, { recursive: true });

console.log('✓ mcp-server dist files copied successfully');
