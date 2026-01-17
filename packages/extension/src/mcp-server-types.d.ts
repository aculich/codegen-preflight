/**
 * Type declarations for dynamic imports from @codegen-preflight/mcp-server
 * These are runtime imports, so we just need to declare the module structure
 */

declare module '@codegen-preflight/mcp-server/dist/utils/snapshot-to-rule.js' {
  export function snapshotToRule(snapshot: any): string;
}

declare module '@codegen-preflight/mcp-server/dist/utils/cache.js' {
  export function loadCachedSnapshot(workspaceRoot: string): Promise<any | null>;
  export function saveSnapshot(workspaceRoot: string, snapshot: any): Promise<void>;
  export function isSnapshotFresh(snapshot: any): boolean;
  export function getRulePath(workspaceRoot: string): string;
  export function getCacheInfo(workspaceRoot: string): any;
}

declare module '@codegen-preflight/mcp-server/dist/resources/snapshot.js' {
  export function generateSnapshot(workspaceRoot: string): Promise<any>;
}

