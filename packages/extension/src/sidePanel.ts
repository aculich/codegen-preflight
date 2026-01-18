/**
 * Side Panel Webview Provider
 */

import * as vscode from 'vscode';
import { SnapshotManager } from './snapshotManager';

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

export class PreflightPanel {
  public static readonly viewType = 'codegenPreflight';
  private static panels: Map<string, PreflightPanel> = new Map();

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _snapshotManager: SnapshotManager;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    snapshotManager: SnapshotManager
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    const existing = Array.from(this.panels.values()).find(
      (panel) => panel._panel.visible
    );
    if (existing) {
      existing._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      PreflightPanel.viewType,
      'Codegen Preflight',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      }
    );

    const preflightPanel = new PreflightPanel(panel, extensionUri, snapshotManager);
    this.panels.set(panel.viewColumn?.toString() || '0', preflightPanel);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    snapshotManager: SnapshotManager
  ) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._snapshotManager = snapshotManager;

    // Set the webview's initial html content
    this._update();

    // Listen for when the panel is disposed
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
      switch (message.command) {
        case 'refresh':
          await this._refresh(true);
          break;
        case 'forceRefresh':
          await this._refresh(false);
          break;
        case 'configureApiKeys':
          const { ApiKeyConfig } = await import('./apiKeyConfig');
          await ApiKeyConfig.showConfigurationDialog();
          // Refresh after configuring
          await this._refresh(false);
          break;
        case 'copyRuleFile':
          await this._copyRuleFile();
          break;
        case 'generateGlobalConfig':
          await this._generateGlobalConfig();
          break;
      }
      },
      null,
      this._disposables
    );
  }

  private async _update() {
    const snapshot = await this._snapshotManager.getSnapshot();
    const cacheInfo = await this._snapshotManager.getCacheInfo();
    this._panel.webview.html = this._getHtmlForWebview(snapshot, cacheInfo);
  }

  private async _refresh(useCache: boolean) {
    this._panel.webview.postMessage({ command: 'loading' });
    try {
      const snapshot = await this._snapshotManager.getSnapshot(!useCache);
      const cacheInfo = await this._snapshotManager.getCacheInfo();
      this._panel.webview.html = this._getHtmlForWebview(snapshot, cacheInfo);
      this._panel.webview.postMessage({ command: 'loaded' });
      vscode.window.showInformationMessage('Snapshot refreshed successfully');
    } catch (error) {
      this._panel.webview.postMessage({ command: 'error', error: String(error) });
      vscode.window.showErrorMessage(`Failed to refresh snapshot: ${error}`);
    }
  }

  private async _copyRuleFile() {
    const snapshot = await this._snapshotManager.getSnapshot();
    // Use the snapshot manager's method to get rule content
    const { promises: fs } = await import('fs');
    const { join } = await import('path');
    const { getMcpServerModulePath } = await import('./mcpServerPath');
    const cachePath = getMcpServerModulePath('utils/cache.js');
    const rulePath = getMcpServerModulePath('utils/snapshot-to-rule.js');
    const { getRulePath } = await import(cachePath);
    const { snapshotToRule } = await import(rulePath);
    
    const ruleContent = snapshotToRule(snapshot);
    
    await vscode.env.clipboard.writeText(ruleContent);
    vscode.window.showInformationMessage('Rule file copied to clipboard!');
  }

  private async _generateGlobalConfig() {
    const snapshot = await this._snapshotManager.getSnapshot();
    const { promises: fs } = await import('fs');
    const { join } = await import('path');
    const os = await import('os');
    const { getMcpServerModulePath } = await import('./mcpServerPath');
    const rulePath = getMcpServerModulePath('utils/snapshot-to-rule.js');
    const { snapshotToRule } = await import(rulePath);
    
    // Get global Cursor config directory
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

  private _getHtmlForWebview(snapshot: Snapshot, cacheInfo: any): string {
    const ageText =
      cacheInfo.exists && cacheInfo.age_hours < 24
        ? `${Math.round(cacheInfo.age_hours * 10) / 10} hours ago`
        : 'Stale or missing';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codegen Preflight</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .timestamp {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
        .refresh-btn {
            padding: 6px 12px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
            border-radius: 2px;
        }
        .refresh-btn:hover {
            background: var(--vscode-button-hoverBackground);
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--vscode-textLink-foreground);
        }
        .package-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
        }
        .package-item {
            padding: 8px;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
        }
        .package-name {
            font-weight: bold;
            margin-bottom: 4px;
        }
        .package-version {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
        }
        .model-category {
            margin-bottom: 15px;
        }
        .model-category-title {
            font-weight: bold;
            margin-bottom: 8px;
        }
        .model-provider {
            margin-left: 15px;
            margin-bottom: 5px;
        }
        .model-id {
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
            color: var(--vscode-textPreformat-foreground);
            background: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 2px;
        }
        .no-models {
            color: var(--vscode-errorForeground);
            font-style: italic;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.8em;
            margin-left: 6px;
            font-weight: bold;
        }
        .preview-badge {
            background: var(--vscode-textBlockQuote-background);
            color: var(--vscode-textBlockQuote-border);
        }
        .deprecated-badge {
            background: var(--vscode-errorForeground);
            color: var(--vscode-editor-background);
        }
        .release-date {
            color: var(--vscode-descriptionForeground);
            font-size: 0.9em;
        }
        .model-type-section {
            margin-bottom: 20px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 12px;
        }
        .model-type-header {
            font-weight: bold;
            margin-bottom: 10px;
            cursor: pointer;
            user-select: none;
        }
        .model-type-header:hover {
            color: var(--vscode-textLink-foreground);
        }
        .model-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 8px;
            margin-top: 10px;
        }
        .model-item {
            padding: 6px;
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 3px;
            font-size: 0.9em;
        }
        .model-item-id {
            font-family: var(--vscode-editor-font-family);
            font-weight: bold;
            margin-bottom: 4px;
        }
        .model-item-meta {
            font-size: 0.85em;
            color: var(--vscode-descriptionForeground);
        }
        .filter-controls {
            margin-bottom: 15px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .filter-btn {
            padding: 4px 8px;
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-button-border);
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.85em;
        }
        .filter-btn:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .filter-btn.active {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h2>Codegen Preflight</h2>
            <div class="timestamp">Last updated: ${snapshot.generated_at_iso} (${ageText})</div>
            ${snapshot.models.discovered.length === 0 ? '<div style="color: var(--vscode-errorForeground); margin-top: 8px; font-size: 0.9em;">⚠️ No models discovered. <a href="#" onclick="configureKeys()" style="color: var(--vscode-textLink-foreground);">Configure API keys</a> to enable model discovery.</div>' : ''}
            <div id="loading-indicator" style="display: none; color: var(--vscode-descriptionForeground); margin-top: 8px;">
              <span>🔄 Refreshing snapshot...</span>
            </div>
            <div id="error-indicator" style="display: none; color: var(--vscode-errorForeground); margin-top: 8px;">
              <span>❌ Error: <span id="error-message"></span></span>
            </div>
        </div>
        <div>
            <button class="refresh-btn" onclick="refresh(false)" style="margin-right: 8px;">Force Refresh</button>
            <button class="refresh-btn" onclick="configureKeys()" style="margin-right: 8px;">Configure API Keys</button>
            <button class="refresh-btn" onclick="copyRuleFile()" style="margin-right: 8px;">Copy Rule File</button>
            <button class="refresh-btn" onclick="generateGlobalConfig()">Generate Global Config</button>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Selected Default Models</div>
        ${Object.entries(snapshot.models.selected)
          .map(
            ([category, providers]) => {
              const getModelInfo = (modelId: string | null) => {
                if (!modelId) return null;
                return snapshot.models.discovered.find(m => m.model_id === modelId);
              };
              return `
            <div class="model-category">
                <div class="model-category-title">${category}</div>
                ${Object.entries(providers)
                  .map(
                    ([provider, modelId]) => {
                      const model = getModelInfo(modelId);
                      const dateInfo = model?.release_date ? ` <span class="release-date">(${model.release_date})</span>` : '';
                      const previewBadge = model?.is_preview ? '<span class="badge preview-badge">[preview]</span>' : '';
                      const deprecatedBadge = model?.is_deprecated ? '<span class="badge deprecated-badge">[deprecated]</span>' : '';
                      return `
                    <div class="model-provider">
                        <strong>${provider}:</strong>
                        <span class="model-id">${modelId || 'N/A'}</span>${dateInfo}${previewBadge}${deprecatedBadge}
                    </div>
                  `;
                    }
                  )
                  .join('')}
            </div>
          `;
            }
          )
          .join('')}
    </div>

    <div class="section">
        <div class="section-title">Latest SDK Versions (npm)</div>
        <div class="package-list">
            ${Object.entries(snapshot.deps.npm_latest)
              .map(
                ([pkg, version]) => `
                <div class="package-item">
                    <div class="package-name">${pkg}</div>
                    <div class="package-version">${version}</div>
                </div>
              `
              )
              .join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Latest SDK Versions (PyPI)</div>
        <div class="package-list">
            ${Object.entries(snapshot.deps.pypi_latest)
              .map(
                ([pkg, version]) => `
                <div class="package-item">
                    <div class="package-name">${pkg}</div>
                    <div class="package-version">${version}</div>
                </div>
              `
              )
              .join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Discovered Models</div>
        <div style="margin-bottom: 10px;">Total: ${snapshot.models.discovered.length}</div>
        ${snapshot.models.discovered.length === 0 ? '<div class="no-models">No models discovered. Set API keys to enable discovery.</div>' : ''}
        ${snapshot.models.discovered.length > 0 ? (() => {
          const byType: Record<string, typeof snapshot.models.discovered> = {};
          const byProvider: Record<string, typeof snapshot.models.discovered> = {};
          
          for (const model of snapshot.models.discovered) {
            const type = model.model_type || 'other';
            if (!byType[type]) byType[type] = [];
            byType[type].push(model);
            
            if (!byProvider[model.provider]) byProvider[model.provider] = [];
            byProvider[model.provider].push(model);
          }
          
          return `
          <div class="filter-controls">
            <button class="filter-btn active" onclick="filterModels('all')">All (${snapshot.models.discovered.length})</button>
            ${Object.entries(byType).map(([type, models]) => 
              `<button class="filter-btn" onclick="filterModels('${type}')">${type.charAt(0).toUpperCase() + type.slice(1)} (${models.length})</button>`
            ).join('')}
          </div>
          ${Object.entries(byType).map(([type, typeModels]) => {
            const previewCount = typeModels.filter(m => m.is_preview).length;
            const deprecatedCount = typeModels.filter(m => m.is_deprecated).length;
            return `
            <div class="model-type-section" data-type="${type}">
              <div class="model-type-header" onclick="toggleSection('${type}')">
                ${type.charAt(0).toUpperCase() + type.slice(1)} Models (${typeModels.length})
                ${previewCount > 0 ? `<span class="badge preview-badge">${previewCount} preview</span>` : ''}
                ${deprecatedCount > 0 ? `<span class="badge deprecated-badge">${deprecatedCount} deprecated</span>` : ''}
              </div>
              <div class="model-list" id="models-${type}">
                ${typeModels.slice(0, 20).map(model => {
                  const dateInfo = model.release_date ? ` <span class="release-date">(${model.release_date})</span>` : '';
                  const previewBadge = model.is_preview ? '<span class="badge preview-badge">preview</span>' : '';
                  const deprecatedBadge = model.is_deprecated ? '<span class="badge deprecated-badge">deprecated</span>' : '';
                  return `
                  <div class="model-item" data-provider="${model.provider}">
                    <div class="model-item-id">${model.model_id}${dateInfo}</div>
                    <div class="model-item-meta">
                      Provider: ${model.provider}${previewBadge}${deprecatedBadge}
                    </div>
                  </div>
                `;
                }).join('')}
                ${typeModels.length > 20 ? `<div style="margin-top: 8px; color: var(--vscode-descriptionForeground); font-size: 0.9em;">... and ${typeModels.length - 20} more</div>` : ''}
              </div>
            </div>
          `;
          }).join('')}
          `;
        })() : ''}
    </div>

    <div class="section">
        <div class="section-title">Actions</div>
        <div style="margin-bottom: 10px;">
            <strong>MCP Server:</strong> Use the MCP tool <code>generate_snapshot</code> or <code>list_llm_models</code> in Cursor chat.
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Cursor Commands:</strong> Use <code>/preflight</code> or <code>/snapshot</code> in Cursor chat to refresh or get snapshot info.
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function refresh(useCache) {
            vscode.postMessage({
                command: useCache ? 'refresh' : 'forceRefresh'
            });
        }
        
        function configureKeys() {
            vscode.postMessage({
                command: 'configureApiKeys'
            });
        }
        
        function copyRuleFile() {
            vscode.postMessage({
                command: 'copyRuleFile'
            });
        }
        
        function generateGlobalConfig() {
            vscode.postMessage({
                command: 'generateGlobalConfig'
            });
        }
        
        function filterModels(type) {
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Show/hide model sections
            document.querySelectorAll('.model-type-section').forEach(section => {
                if (type === 'all' || section.dataset.type === type) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        }
        
        function toggleSection(type) {
            const list = document.getElementById('models-' + type);
            if (list) {
                list.style.display = list.style.display === 'none' ? 'grid' : 'none';
            }
        }
        
        // Handle loading and error states
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'loading':
                    document.getElementById('loading-indicator').style.display = 'block';
                    document.getElementById('error-indicator').style.display = 'none';
                    break;
                case 'loaded':
                    document.getElementById('loading-indicator').style.display = 'none';
                    break;
                case 'error':
                    document.getElementById('loading-indicator').style.display = 'none';
                    document.getElementById('error-indicator').style.display = 'block';
                    document.getElementById('error-message').textContent = message.error || 'Unknown error';
                    break;
            }
        });
    </script>
</body>
</html>`;
  }

  public dispose() {
    PreflightPanel.panels.delete(
      this._panel.viewColumn?.toString() || '0'
    );

    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}

