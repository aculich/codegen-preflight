#!/usr/bin/env node
/**
 * Standalone preflight script
 * Can be run directly or via npm script
 */

import { createRequire } from 'module';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

async function main() {
  const workspaceRoot = process.cwd();
  console.log(`Generating snapshot for workspace: ${workspaceRoot}`);

  try {
    // Dynamic imports for ES modules
    const { generateSnapshot } = await import(
      `file://${join(__dirname, '..', 'packages', 'mcp-server', 'dist', 'resources', 'snapshot.js')}`
    );
    const { snapshotToRule } = await import(
      `file://${join(__dirname, '..', 'packages', 'mcp-server', 'dist', 'utils', 'snapshot-to-rule.js')}`
    );
    const { saveSnapshot, getRulePath } = await import(
      `file://${join(__dirname, '..', 'packages', 'mcp-server', 'dist', 'utils', 'cache.js')}`
    );

    // Generate snapshot
    const snapshot = await generateSnapshot(workspaceRoot);
    
    // Save to cache
    await saveSnapshot(workspaceRoot, snapshot);
    console.log('Snapshot saved to cache');

    // Generate and save rule file
    const ruleContent = snapshotToRule(snapshot);
    const rulePath = getRulePath(workspaceRoot);
    
    // Ensure .cursor/rules directory exists
    const rulesDir = join(workspaceRoot, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });
    
    await fs.writeFile(rulePath, ruleContent, 'utf-8');
    console.log(`Rule file updated: ${rulePath}`);

    console.log('\nSnapshot Summary:');
    console.log(`- Generated: ${snapshot.generated_at_iso}`);
    console.log(`- npm packages: ${Object.keys(snapshot.deps.npm_latest).length}`);
    console.log(`- PyPI packages: ${Object.keys(snapshot.deps.pypi_latest).length}`);
    console.log(`- Models discovered: ${snapshot.models.discovered.length}`);
    console.log('\nDone!');
  } catch (error) {
    console.error('Error generating snapshot:', error);
    process.exit(1);
  }
}

main();

