/**
 * Extension entry point
 */

import * as vscode from 'vscode';
import { SnapshotManager } from './snapshotManager';
import { PreflightPanel } from './sidePanel';
import { registerMCPServer } from './mcpRegistration';
import { ApiKeyConfig } from './apiKeyConfig';

export async function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  const outputChannel = vscode.window.createOutputChannel('Codegen Preflight');
  outputChannel.appendLine('Codegen Preflight extension is now active');
  console.log('Codegen Preflight extension is now active');

  // Get workspace root
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage(
      'Codegen Preflight: No workspace folder found'
    );
    return;
  }

  const workspaceRoot = workspaceFolders[0].uri.fsPath;
  const snapshotManager = new SnapshotManager(workspaceRoot);

  // Register MCP server (non-blocking - don't fail extension if MCP registration fails)
  registerMCPServer(context, workspaceRoot).catch((error) => {
    console.error('MCP server registration failed (non-fatal):', error);
    // Extension continues to work even if MCP registration fails
  });

  // Auto-preflight check: ensure snapshot is fresh before any coding session
  async function ensurePreflightDone(force = false) {
    const needsRefresh = force || await snapshotManager.needsRefresh();
    if (needsRefresh) {
      outputChannel.appendLine(`[Auto-preflight] ${force ? 'Force refreshing' : 'Refreshing stale snapshot'}...`);
      try {
        await snapshotManager.getSnapshot(force);
        outputChannel.appendLine('[Auto-preflight] Snapshot refreshed successfully');
      } catch (error) {
        outputChannel.appendLine(`[Auto-preflight] Failed to refresh: ${error}`);
        console.error('Failed to refresh snapshot:', error);
      }
    } else {
      outputChannel.appendLine('[Auto-preflight] Snapshot is fresh, skipping refresh');
    }
  }

  // Check if snapshot needs refresh on startup
  await ensurePreflightDone(false);

  // Register a command that can be called before plan mode or other coding workflows
  // This allows Cursor to trigger preflight checks automatically
  const preflightCheckCommand = vscode.commands.registerCommand(
    'codegenPreflight.checkBeforeCoding',
    async () => {
      await ensurePreflightDone(false);
    }
  );
  context.subscriptions.push(preflightCheckCommand);

  // Hook into Cursor's plan mode and other coding events
  // Listen for when user starts a new chat/composer session
  const cursorApi = (vscode as any).cursor;
  if (cursorApi) {
    // Try to hook into Cursor's composer/chat events
    // This is a best-effort approach since Cursor's API may vary
    try {
      // Check if there's a way to hook into plan mode
      // Cursor may expose events or we can use workspace events as fallback
      
      // Listen for workspace folder changes (new project opened)
      vscode.workspace.onDidChangeWorkspaceFolders(async () => {
        outputChannel.appendLine('[Auto-preflight] Workspace changed, checking snapshot...');
        await ensurePreflightDone(false);
      });

      // Periodic check: ensure snapshot is fresh at least once per day
      // This runs in the background and doesn't block the user
      const dailyCheckInterval = setInterval(async () => {
        const lastDailyCheck = context.globalState.get<string>('lastDailyPreflightCheck');
        const today = new Date().toDateString();
        if (lastDailyCheck !== today) {
          outputChannel.appendLine('[Auto-preflight] Daily check: ensuring snapshot is fresh...');
          await ensurePreflightDone(false);
          await context.globalState.update('lastDailyPreflightCheck', today);
        }
      }, 3600000); // Check every hour

      context.subscriptions.push({
        dispose: () => clearInterval(dailyCheckInterval),
      });
    } catch (error) {
      // Cursor API might not be available or might have changed
      outputChannel.appendLine(`[Auto-preflight] Could not register Cursor hooks: ${error}`);
    }
  }

  // Register commands
  const refreshCommand = vscode.commands.registerCommand(
    'codegenPreflight.refresh',
    async () => {
      await snapshotManager.getSnapshot(true);
      vscode.window.showInformationMessage('Snapshot refreshed');
    }
  );

  const forceRefreshCommand = vscode.commands.registerCommand(
    'codegenPreflight.forceRefresh',
    async () => {
      await snapshotManager.getSnapshot(true); // Force refresh
      vscode.window.showInformationMessage('Snapshot force refreshed');
    }
  );

  const openPanelCommand = vscode.commands.registerCommand(
    'codegenPreflight.openPanel',
    () => {
      PreflightPanel.createOrShow(context.extensionUri, snapshotManager);
    }
  );

  const configureApiKeysCommand = vscode.commands.registerCommand(
    'codegenPreflight.configureApiKeys',
    async () => {
      await ApiKeyConfig.showConfigurationDialog();
    }
  );

  const copyRuleFileCommand = vscode.commands.registerCommand(
    'codegenPreflight.copyRuleFile',
    async () => {
      const snapshot = await snapshotManager.getSnapshot();
      const { snapshotToRule } = await import('@codegen-preflight/mcp-server/dist/utils/snapshot-to-rule.js');
      const ruleContent = snapshotToRule(snapshot);
      await vscode.env.clipboard.writeText(ruleContent);
      vscode.window.showInformationMessage('Rule file copied to clipboard!');
    }
  );

  const generateGlobalConfigCommand = vscode.commands.registerCommand(
    'codegenPreflight.generateGlobalConfig',
    async () => {
      const snapshot = await snapshotManager.getSnapshot();
      const { promises: fs } = await import('fs');
      const { join } = await import('path');
      const os = await import('os');
      const { snapshotToRule } = await import('@codegen-preflight/mcp-server/dist/utils/snapshot-to-rule.js');
      
      const globalCursorDir = join(os.homedir(), '.cursor', 'rules');
      await fs.mkdir(globalCursorDir, { recursive: true });
      
      const globalRulePath = join(globalCursorDir, '01-version-snapshot.mdc');
      const ruleContent = snapshotToRule(snapshot);
      
      await fs.writeFile(globalRulePath, ruleContent, 'utf-8');
      
      vscode.window.showInformationMessage(
        `Global config created at: ${globalRulePath}`,
        'Open File'
      ).then((selection) => {
        if (selection === 'Open File') {
          vscode.window.showTextDocument(vscode.Uri.file(globalRulePath));
        }
      });
    }
  );

  context.subscriptions.push(
    refreshCommand,
    forceRefreshCommand,
    openPanelCommand,
    configureApiKeysCommand,
    copyRuleFileCommand,
    generateGlobalConfigCommand
  );

  // Register tree data provider for side panel
  const treeDataProvider = new PreflightTreeDataProvider(snapshotManager);
  const treeView = vscode.window.createTreeView('codegenPreflight', {
    treeDataProvider,
  });

  context.subscriptions.push(treeView);
}

export function deactivate() {}

class PreflightTreeDataProvider
  implements vscode.TreeDataProvider<PreflightTreeItem>
{
  constructor(private snapshotManager: SnapshotManager) {}

  getTreeItem(element: PreflightTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: PreflightTreeItem): Promise<PreflightTreeItem[]> {
    if (!element) {
      const cacheInfo = await this.snapshotManager.getCacheInfo();
      return [
        new PreflightTreeItem(
          `Snapshot: ${cacheInfo.exists ? 'Cached' : 'Missing'}`,
          vscode.TreeItemCollapsibleState.None
        ),
      ];
    }
    return [];
  }
}

class PreflightTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}

