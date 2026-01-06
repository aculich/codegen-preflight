/**
 * API Key Configuration Management
 */

import * as vscode from 'vscode';

export class ApiKeyConfig {
  private static readonly OPENAI_KEY = 'codegenPreflight.openaiApiKey';
  private static readonly ANTHROPIC_KEY = 'codegenPreflight.anthropicApiKey';
  private static readonly GEMINI_KEY = 'codegenPreflight.geminiApiKey';

  /**
   * Get API keys from settings or environment
   */
  static getApiKeys(): {
    openai?: string;
    anthropic?: string;
    gemini?: string;
  } {
    const config = vscode.workspace.getConfiguration();
    
    return {
      openai: config.get<string>(this.OPENAI_KEY) || process.env.OPENAI_API_KEY,
      anthropic: config.get<string>(this.ANTHROPIC_KEY) || process.env.ANTHROPIC_API_KEY,
      gemini: config.get<string>(this.GEMINI_KEY) || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    };
  }

  /**
   * Set API keys in settings
   */
  static async setApiKeys(keys: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
  }): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    
    if (keys.openai !== undefined) {
      await config.update(this.OPENAI_KEY, keys.openai, vscode.ConfigurationTarget.Global);
    }
    if (keys.anthropic !== undefined) {
      await config.update(this.ANTHROPIC_KEY, keys.anthropic, vscode.ConfigurationTarget.Global);
    }
    if (keys.gemini !== undefined) {
      await config.update(this.GEMINI_KEY, keys.gemini, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * Show API key configuration dialog
   */
  static async showConfigurationDialog(): Promise<void> {
    const currentKeys = this.getApiKeys();
    
    const openaiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenAI API key (leave empty to use environment variable)',
      value: currentKeys.openai || '',
      password: true,
      placeHolder: 'sk-...',
      ignoreFocusOut: true,
    });

    if (openaiKey === undefined) {
      return; // User cancelled
    }

    const anthropicKey = await vscode.window.showInputBox({
      prompt: 'Enter your Anthropic API key (leave empty to use environment variable)',
      value: currentKeys.anthropic || '',
      password: true,
      placeHolder: 'sk-ant-...',
      ignoreFocusOut: true,
    });

    if (anthropicKey === undefined) {
      return; // User cancelled
    }

    const geminiKey = await vscode.window.showInputBox({
      prompt: 'Enter your Google Gemini API key (leave empty to use environment variable)',
      value: currentKeys.gemini || '',
      password: true,
      placeHolder: 'AIza...',
      ignoreFocusOut: true,
    });

    if (geminiKey === undefined) {
      return; // User cancelled
    }

    await this.setApiKeys({
      openai: openaiKey || undefined,
      anthropic: anthropicKey || undefined,
      gemini: geminiKey || undefined,
    });

    vscode.window.showInformationMessage(
      'API keys configured. Run "Refresh Snapshot" to discover models.',
      'Refresh Now'
    ).then((selection) => {
      if (selection === 'Refresh Now') {
        vscode.commands.executeCommand('codegenPreflight.forceRefresh');
      }
    });
  }

  /**
   * Get API keys as environment variables for MCP server
   */
  static getEnvForMcp(): Record<string, string> {
    const keys = this.getApiKeys();
    const env: Record<string, string> = {};
    
    if (keys.openai) {
      env.OPENAI_API_KEY = keys.openai;
    }
    if (keys.anthropic) {
      env.ANTHROPIC_API_KEY = keys.anthropic;
    }
    if (keys.gemini) {
      env.GEMINI_API_KEY = keys.gemini;
      env.GOOGLE_API_KEY = keys.gemini;
    }
    
    return env;
  }
}

