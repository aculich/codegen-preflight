/**
 * MCP Server Registration for Cursor
 */

import * as vscode from 'vscode';
import { join } from 'path';
import { existsSync } from 'fs';
import { ApiKeyConfig } from './apiKeyConfig';

let outputChannel: vscode.OutputChannel | null = null;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Codegen Preflight');
  }
  return outputChannel;
}

function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const channel = getOutputChannel();
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '[ERROR]' : level === 'warn' ? '[WARN]' : '[INFO]';
  channel.appendLine(`${timestamp} ${prefix} ${message}`);
  
  // Also log to console for debugging
  if (level === 'error') {
    console.error(message);
  } else if (level === 'warn') {
    console.warn(message);
  } else {
    console.log(message);
  }
}

/**
 * Register the MCP server with Cursor by creating/updating .cursor/mcp.json
 * This is more reliable than using the programmatic API which appears to have issues
 */
export async function registerMCPServer(
  context: vscode.ExtensionContext,
  workspaceRoot: string
): Promise<void> {
  const channel = getOutputChannel();
  
  log('Starting MCP server configuration...');
  
  try {
    // Get the path to the MCP server executable
    // Try workspace-relative path first (for development)
    const workspaceMcpPath = join(workspaceRoot, 'packages', 'mcp-server', 'dist', 'index.js');
    
    // Fallback to extension path (for packaged extension)
    const extensionPath = context.extensionPath;
    const extensionMcpPath = join(extensionPath, '..', 'mcp-server', 'dist', 'index.js');
    
    // Determine which path to use
    let mcpServerPath: string;
    let useWorkspacePath = false;
    if (existsSync(workspaceMcpPath)) {
      mcpServerPath = workspaceMcpPath;
      useWorkspacePath = true;
      log(`Using workspace MCP server: ${mcpServerPath}`);
    } else if (existsSync(extensionMcpPath)) {
      mcpServerPath = extensionMcpPath;
      log(`Using extension MCP server: ${extensionMcpPath}`);
    } else {
      const errorMsg = `MCP server not found at ${workspaceMcpPath} or ${extensionMcpPath}. Please build the mcp-server package first.`;
      log(errorMsg, 'error');
      vscode.window.showWarningMessage(
        'Codegen Preflight: MCP server not found. Run "npm run build" in the root directory.'
      );
      return;
    }

    // Create .cursor directory if it doesn't exist
    const cursorDir = join(workspaceRoot, '.cursor');
    const mcpJsonPath = join(cursorDir, 'mcp.json');
    
    // Read existing mcp.json if it exists
    let existingConfig: any = { mcpServers: {} };
    if (existsSync(mcpJsonPath)) {
      try {
        const { readFileSync } = await import('fs');
        const existingContent = readFileSync(mcpJsonPath, 'utf-8');
        existingConfig = JSON.parse(existingContent);
        if (!existingConfig.mcpServers) {
          existingConfig.mcpServers = {};
        }
        log('Found existing .cursor/mcp.json, will merge configuration');
      } catch (e) {
        log(`Warning: Could not parse existing mcp.json: ${e}`, 'warn');
      }
    }

    // Determine the path to use in the config
    // Use workspace-relative path if possible, otherwise absolute
    const configPath = useWorkspacePath 
      ? '${workspaceFolder}/packages/mcp-server/dist/index.js'
      : mcpServerPath;

    // Update or add our server configuration
    existingConfig.mcpServers['codegen-preflight'] = {
      command: 'node',
      args: [configPath],
      env: {
        OPENAI_API_KEY: '${env:OPENAI_API_KEY}',
        ANTHROPIC_API_KEY: '${env:ANTHROPIC_API_KEY}',
        GEMINI_API_KEY: '${env:GEMINI_API_KEY}',
        GOOGLE_API_KEY: '${env:GOOGLE_API_KEY}',
        ENABLE_ENHANCED_FEATURES: '${env:ENABLE_ENHANCED_FEATURES}',
      },
    };

    // Write the updated configuration
    const { writeFileSync, mkdirSync } = await import('fs');
    mkdirSync(cursorDir, { recursive: true });
    writeFileSync(mcpJsonPath, JSON.stringify(existingConfig, null, 2) + '\n', 'utf-8');

    log('Successfully created/updated .cursor/mcp.json');
    log(`  Server path: ${configPath}`);
    log('  Note: Cursor will need to reload or restart to pick up the MCP configuration');
    
    // Show success message with option to reload
    vscode.window.showInformationMessage(
      'Codegen Preflight: MCP server configured in .cursor/mcp.json',
      'Reload Window',
      'Open mcp.json'
    ).then((selection) => {
      if (selection === 'Reload Window') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
      } else if (selection === 'Open mcp.json') {
        vscode.workspace.openTextDocument(vscode.Uri.file(mcpJsonPath))
          .then(doc => {
            vscode.window.showTextDocument(doc);
          });
      }
    });

  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    const errorStack = error?.stack || '';
    log(`Failed to configure MCP server: ${errorMessage}`, 'error');
    if (errorStack) {
      log(`Error stack: ${errorStack}`, 'error');
    }
    
    vscode.window.showErrorMessage(
      `Failed to configure Codegen Preflight MCP server: ${errorMessage}`,
      'View Logs'
    ).then((selection) => {
      if (selection === 'View Logs') {
        channel.show(true);
      }
    });
  }
}
