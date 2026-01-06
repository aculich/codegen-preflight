/**
 * Cache management utilities for snapshots
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { Snapshot } from '../resources/snapshot.js';

const CACHE_DIR = '.codegen-preflight';
const SNAPSHOT_FILE = 'snapshot.json';
const RULE_FILE = '01-version-snapshot.mdc';

export interface CacheInfo {
  exists: boolean;
  age_hours: number;
  path: string;
}

/**
 * Get cache directory path
 */
export function getCacheDir(workspaceRoot: string): string {
  return join(workspaceRoot, CACHE_DIR);
}

/**
 * Get snapshot cache file path
 */
export function getSnapshotPath(workspaceRoot: string): string {
  return join(getCacheDir(workspaceRoot), SNAPSHOT_FILE);
}

/**
 * Get rule file path
 */
export function getRulePath(workspaceRoot: string): string {
  return join(workspaceRoot, '.cursor', 'rules', RULE_FILE);
}

/**
 * Check if snapshot is fresh (less than 24 hours old)
 */
export function isSnapshotFresh(snapshot: Snapshot): boolean {
  const ageMs = Date.now() - snapshot.generated_at_unix * 1000;
  const ageHours = ageMs / (1000 * 60 * 60);
  return ageHours < 24;
}

/**
 * Load cached snapshot
 */
export async function loadCachedSnapshot(
  workspaceRoot: string
): Promise<Snapshot | null> {
  try {
    const snapshotPath = getSnapshotPath(workspaceRoot);
    const content = await fs.readFile(snapshotPath, 'utf-8');
    const snapshot: Snapshot = JSON.parse(content);
    return snapshot;
  } catch (error) {
    return null;
  }
}

/**
 * Save snapshot to cache
 */
export async function saveSnapshot(
  workspaceRoot: string,
  snapshot: Snapshot
): Promise<void> {
  const cacheDir = getCacheDir(workspaceRoot);
  await fs.mkdir(cacheDir, { recursive: true });
  const snapshotPath = getSnapshotPath(workspaceRoot);
  await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
}

/**
 * Get cache info
 */
export async function getCacheInfo(
  workspaceRoot: string
): Promise<CacheInfo> {
  const snapshotPath = getSnapshotPath(workspaceRoot);
  try {
    const stats = await fs.stat(snapshotPath);
    const snapshot = await loadCachedSnapshot(workspaceRoot);
    if (snapshot) {
      const ageMs = Date.now() - snapshot.generated_at_unix * 1000;
      const ageHours = ageMs / (1000 * 60 * 60);
      return {
        exists: true,
        age_hours: ageHours,
        path: snapshotPath,
      };
    }
  } catch (error) {
    // File doesn't exist
  }
  return {
    exists: false,
    age_hours: Infinity,
    path: snapshotPath,
  };
}

