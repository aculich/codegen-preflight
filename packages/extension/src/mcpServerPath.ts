/**
 * Helper to resolve mcp-server module paths
 * Works both in development (workspace) and packaged (VSIX) contexts
 */

import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Get the path to mcp-server dist directory
 * Tries multiple locations:
 * 1. Relative to extension (for packaged VSIX)
 * 2. Workspace relative (for development)
 */
export function getMcpServerPath(): string {
  // In packaged extension, mcp-server dist should be at ../mcp-server/dist relative to extension root
  // In development, it's at ../../packages/mcp-server/dist from extension/src
  
  // __dirname points to dist/ directory in packaged extension
  const extensionDistPath = __dirname; // e.g., /path/to/extension/dist
  const extensionRootPath = join(extensionDistPath, '..'); // e.g., /path/to/extension
  
  // Try extension-relative path first (packaged VSIX)
  // In VSIX, structure is: extension/dist/... and extension/mcp-server/dist/...
  const packagedPath = join(extensionRootPath, 'mcp-server', 'dist');
  
  // Try workspace-relative path (development)
  // From extension/dist, go up to packages/extension, then to packages/mcp-server
  const workspacePath = join(extensionRootPath, '..', 'mcp-server', 'dist');
  
  if (existsSync(packagedPath)) {
    return packagedPath;
  }
  if (existsSync(workspacePath)) {
    return workspacePath;
  }
  
  // Fallback: try node_modules (if installed as dependency)
  const nodeModulesPath = join(extensionRootPath, 'node_modules', '@codegen-preflight', 'mcp-server', 'dist');
  if (existsSync(nodeModulesPath)) {
    return nodeModulesPath;
  }
  
  throw new Error(`MCP server not found. Tried: ${packagedPath}, ${workspacePath}, ${nodeModulesPath}`);
}

/**
 * Get the full path to a specific mcp-server module
 */
export function getMcpServerModulePath(modulePath: string): string {
  const basePath = getMcpServerPath();
  return join(basePath, modulePath);
}
