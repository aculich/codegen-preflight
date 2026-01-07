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

  // Create status bar item early so it can be referenced in ensurePreflightDone
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'codegenPreflight.openPanel';
  statusBarItem.tooltip = 'Codegen Preflight: Click to open panel';
  
  const updateStatusBar = async () => {
    try {
      const cacheInfo = await snapshotManager.getCacheInfo();
      if (cacheInfo.exists && cacheInfo.age_hours < 24) {
        statusBarItem.text = `$(airplane) Preflight: ${Math.round(cacheInfo.age_hours * 10) / 10}h ago`;
        statusBarItem.backgroundColor = undefined;
        statusBarItem.tooltip = `Codegen Preflight: Snapshot is fresh (${Math.round(cacheInfo.age_hours * 10) / 10} hours old). Click to open panel.`;
      } else {
        statusBarItem.text = `$(airplane) Preflight: Stale`;
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        statusBarItem.tooltip = 'Codegen Preflight: Snapshot is stale or missing. Click to refresh.';
      }
      statusBarItem.show();
    } catch (error) {
      // Silently fail - status bar is not critical
    }
  };

  // Auto-preflight check: ensure snapshot is fresh before any coding session
  async function ensurePreflightDone(force = false) {
    const needsRefresh = force || await snapshotManager.needsRefresh();
    if (needsRefresh) {
      outputChannel.appendLine(`[Auto-preflight] ${force ? 'Force refreshing' : 'Refreshing stale snapshot'}...`);
      try {
        await snapshotManager.getSnapshot(force);
        outputChannel.appendLine('[Auto-preflight] Snapshot refreshed successfully');
        await updateStatusBar();
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
      // Check if Cursor exposes slash command registration API
      if (cursorApi.registerSlashCommand) {
        outputChannel.appendLine('[Auto-preflight] Cursor slash command API available');
        // Note: Cursor may handle .cursor/commands/ files automatically
        // This is a placeholder for future programmatic registration if needed
      }
      
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
  } else {
    outputChannel.appendLine('[Auto-preflight] Cursor API not available, using fallback methods');
  }

  // Register commands
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
    openPanelCommand,
    configureApiKeysCommand,
    copyRuleFileCommand,
    generateGlobalConfigCommand
  );

  // Register tree data provider for side panel
  const treeDataProvider = new PreflightTreeDataProvider(snapshotManager, context.extensionUri);
  const treeView = vscode.window.createTreeView('codegenPreflight', {
    treeDataProvider,
  });

  // Refresh tree view when snapshot changes
  const refreshTreeView = () => {
    treeDataProvider.refresh();
  };

  // Register refresh commands that also update tree view and status bar
  const refreshCommand = vscode.commands.registerCommand(
    'codegenPreflight.refresh',
    async () => {
      try {
        await snapshotManager.getSnapshot(true);
        refreshTreeView();
        await updateStatusBar();
        vscode.window.showInformationMessage('Snapshot refreshed');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to refresh snapshot: ${error}`);
      }
    }
  );

  const forceRefreshCommand = vscode.commands.registerCommand(
    'codegenPreflight.forceRefresh',
    async () => {
      try {
        await snapshotManager.getSnapshot(true);
        refreshTreeView();
        await updateStatusBar();
        vscode.window.showInformationMessage('Snapshot force refreshed');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to refresh snapshot: ${error}`);
      }
    }
  );

  // Initialize status bar after a short delay to ensure snapshot manager is ready
  setTimeout(() => updateStatusBar(), 1000);
  // Update status bar periodically
  const statusBarInterval = setInterval(() => updateStatusBar(), 300000); // Every 5 minutes
  context.subscriptions.push({
    dispose: () => clearInterval(statusBarInterval),
  });

  context.subscriptions.push(
    treeView,
    refreshCommand,
    forceRefreshCommand,
    statusBarItem
  );
}

export function deactivate() {}

class PreflightTreeDataProvider
  implements vscode.TreeDataProvider<PreflightTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<PreflightTreeItem | undefined | null | void> = new vscode.EventEmitter<PreflightTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<PreflightTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(
    private snapshotManager: SnapshotManager,
    private extensionUri: vscode.Uri
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: PreflightTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: PreflightTreeItem): Promise<PreflightTreeItem[]> {
    if (!element) {
      // Root level: show main sections
      const cacheInfo = await this.snapshotManager.getCacheInfo();
      let snapshot: any = null;
      try {
        snapshot = await this.snapshotManager.getSnapshot();
      } catch (error) {
        // If snapshot fails, still show basic info
      }

      const items: PreflightTreeItem[] = [];

      // Snapshot status
      const ageText = cacheInfo.exists && cacheInfo.age_hours < 24
        ? `${Math.round(cacheInfo.age_hours * 10) / 10}h ago`
        : 'Stale or missing';
      const statusIcon = cacheInfo.exists && cacheInfo.age_hours < 24 ? '$(check)' : '$(warning)';
      items.push(new PreflightTreeItem(
        `Snapshot: ${cacheInfo.exists ? 'Fresh' : 'Missing'} (${ageText})`,
        vscode.TreeItemCollapsibleState.None,
        statusIcon,
        undefined,
        {
          command: 'codegenPreflight.forceRefresh',
          title: 'Refresh Snapshot'
        }
      ));

      if (snapshot) {
        // Models section
        const modelCount = snapshot.models?.discovered?.length || 0;
        const modelsByType = this.groupModelsByType(snapshot.models?.discovered || []);
        items.push(new PreflightTreeItem(
          `Models (${modelCount})`,
          vscode.TreeItemCollapsibleState.Collapsed,
          '$(symbol-class)',
          'models'
        ));

        // SDKs section
        const npmCount = Object.keys(snapshot.deps?.npm_latest || {}).length;
        const pypiCount = Object.keys(snapshot.deps?.pypi_latest || {}).length;
        items.push(new PreflightTreeItem(
          `SDKs (npm: ${npmCount}, PyPI: ${pypiCount})`,
          vscode.TreeItemCollapsibleState.Collapsed,
          '$(package)',
          'sdks'
        ));

        // Selected models section
        if (snapshot.models?.selected) {
          items.push(new PreflightTreeItem(
            'Selected Models',
            vscode.TreeItemCollapsibleState.Collapsed,
            '$(star)',
            'selected'
          ));
        }
      }

      return items;
    }

    // Handle expanded sections
    if (element.contextValue === 'models') {
      const snapshot = await this.snapshotManager.getSnapshot();
      const models = snapshot.models?.discovered || [];
      const byType = this.groupModelsByType(models);
      
      return Object.entries(byType).map(([type, typeModels]) => {
        return new PreflightTreeItem(
          `${type.charAt(0).toUpperCase() + type.slice(1)} (${typeModels.length})`,
          vscode.TreeItemCollapsibleState.None,
          this.getModelTypeIcon(type),
          undefined,
          undefined,
          `${typeModels.length} ${type} models`
        );
      });
    }

    if (element.contextValue === 'sdks') {
      const snapshot = await this.snapshotManager.getSnapshot();
      const npmCount = Object.keys(snapshot.deps?.npm_latest || {}).length;
      const pypiCount = Object.keys(snapshot.deps?.pypi_latest || {}).length;
      
      return [
        new PreflightTreeItem(
          `npm (${npmCount} packages)`,
          vscode.TreeItemCollapsibleState.None,
          '$(package)',
          undefined,
          undefined,
          `${npmCount} npm packages`
        ),
        new PreflightTreeItem(
          `PyPI (${pypiCount} packages)`,
          vscode.TreeItemCollapsibleState.None,
          '$(package)',
          undefined,
          undefined,
          `${pypiCount} PyPI packages`
        ),
      ];
    }

    if (element.contextValue === 'selected') {
      const snapshot = await this.snapshotManager.getSnapshot();
      const selected = snapshot.models?.selected || {};
      const items: PreflightTreeItem[] = [];
      
      for (const [category, providers] of Object.entries(selected)) {
        for (const [provider, modelId] of Object.entries(providers)) {
          if (modelId) {
            const model = snapshot.models?.discovered?.find(m => m.model_id === modelId);
            const dateInfo = model?.release_date ? ` (${model.release_date})` : '';
            const previewInfo = model?.is_preview ? ' [preview]' : '';
            items.push(new PreflightTreeItem(
              `${category}: ${modelId}${dateInfo}${previewInfo}`,
              vscode.TreeItemCollapsibleState.None,
              this.getProviderIcon(provider),
              undefined,
              undefined,
              `Provider: ${provider}`
            ));
          }
        }
      }
      
      return items;
    }

    return [];
  }

  private groupModelsByType(models: any[]): Record<string, any[]> {
    const byType: Record<string, any[]> = {};
    for (const model of models) {
      const type = model.model_type || 'other';
      if (!byType[type]) {
        byType[type] = [];
      }
      byType[type].push(model);
    }
    return byType;
  }

  private getModelTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      chat: '$(comment-discussion)',
      image: '$(file-media)',
      audio: '$(unmute)',
      embedding: '$(database)',
      other: '$(symbol-misc)'
    };
    return icons[type] || icons.other;
  }

  private getProviderIcon(provider: string): string {
    const icons: Record<string, string> = {
      openai: '$(symbol-class)',
      anthropic: '$(symbol-class)',
      google: '$(symbol-class)'
    };
    return icons[provider] || '$(symbol-class)';
  }
}

class PreflightTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly iconId?: string,
    public readonly contextValue?: string,
    public readonly command?: vscode.Command,
    public readonly tooltip?: string
  ) {
    super(label, collapsibleState);
    this.iconPath = iconId ? new vscode.ThemeIcon(iconId) : undefined;
    this.contextValue = contextValue;
    this.command = command;
    this.tooltip = tooltip || label;
  }
}

