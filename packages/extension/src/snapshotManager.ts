/**
 * Snapshot Manager - handles generation, caching, and rule file updates
 */

import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ApiKeyConfig } from './apiKeyConfig';

// Dynamic imports for ES module mcp-server
let snapshotModule: any;
let cacheModule: any;
let ruleModule: any;

async function loadModules() {
  if (!snapshotModule) {
    snapshotModule = await import('@codegen-preflight/mcp-server/dist/resources/snapshot.js');
  }
  if (!cacheModule) {
    cacheModule = await import('@codegen-preflight/mcp-server/dist/utils/cache.js');
  }
  if (!ruleModule) {
    ruleModule = await import('@codegen-preflight/mcp-server/dist/utils/snapshot-to-rule.js');
  }
  return { snapshotModule, cacheModule, ruleModule };
}

type Snapshot = {
  generated_at_unix: number;
  generated_at_iso: string;
  repo?: { root: string };
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
    selected: Record<string, Record<string, string | null>>;
  };
  codegen_instructions?: Array<{ sdk: string; provider: string; content: string; source_url?: string }>;
  notes?: string[];
};

export class SnapshotManager {
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
  }

  /**
   * Get current snapshot, using cache if fresh
   */
  async getSnapshot(forceRefresh = false): Promise<Snapshot> {
    const { snapshotModule, cacheModule } = await loadModules();
    
    // Set API keys from settings before generating snapshot
    const apiKeys = ApiKeyConfig.getApiKeys();
    if (apiKeys.openai) {
      process.env.OPENAI_API_KEY = apiKeys.openai;
    }
    if (apiKeys.anthropic) {
      process.env.ANTHROPIC_API_KEY = apiKeys.anthropic;
    }
    if (apiKeys.gemini) {
      process.env.GEMINI_API_KEY = apiKeys.gemini;
      process.env.GOOGLE_API_KEY = apiKeys.gemini;
    }
    
    if (!forceRefresh) {
      const cached = await cacheModule.loadCachedSnapshot(this.workspaceRoot);
      if (cached && cacheModule.isSnapshotFresh(cached)) {
        return cached;
      }
    }

    // Generate new snapshot
    const snapshot = await snapshotModule.generateSnapshot(this.workspaceRoot);
    await cacheModule.saveSnapshot(this.workspaceRoot, snapshot);
    await this.updateRuleFile(snapshot);
    return snapshot;
  }

  /**
   * Update the Cursor rule file with the snapshot
   */
  async updateRuleFile(snapshot: Snapshot): Promise<void> {
    const { cacheModule, ruleModule } = await loadModules();
    const rulePath = cacheModule.getRulePath(this.workspaceRoot);
    const ruleContent = ruleModule.snapshotToRule(snapshot);

    // Ensure .cursor/rules directory exists
    const rulesDir = join(this.workspaceRoot, '.cursor', 'rules');
    await fs.mkdir(rulesDir, { recursive: true });

    await fs.writeFile(rulePath, ruleContent, 'utf-8');
  }

  /**
   * Get cache information
   */
  async getCacheInfo() {
    const { cacheModule } = await loadModules();
    return cacheModule.getCacheInfo(this.workspaceRoot);
  }

  /**
   * Check if snapshot needs refresh
   */
  async needsRefresh(): Promise<boolean> {
    const { cacheModule } = await loadModules();
    const cached = await cacheModule.loadCachedSnapshot(this.workspaceRoot);
    if (!cached) {
      return true;
    }
    return !cacheModule.isSnapshotFresh(cached);
  }
}

