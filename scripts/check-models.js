#!/usr/bin/env node
/**
 * Manual script to check what models are actually available from each provider
 */

import { listOpenAIModels, listAnthropicModels, listGeminiModels } from '../packages/mcp-server/dist/tools/models.js';

async function main() {
  console.log('Checking available models from all providers...\n');

  console.log('=== OpenAI Models ===');
  const openai = await listOpenAIModels();
  if (openai.length === 0) {
    console.log('No models found. Set OPENAI_API_KEY environment variable.');
  } else {
    console.log(`Found ${openai.length} models:`);
    openai.forEach(m => console.log(`  - ${m.model_id}${m.display_name ? ` (${m.display_name})` : ''}`));
  }

  console.log('\n=== Anthropic Models ===');
  const anthropic = await listAnthropicModels();
  if (anthropic.length === 0) {
    console.log('No models found. Set ANTHROPIC_API_KEY environment variable.');
  } else {
    console.log(`Found ${anthropic.length} models:`);
    anthropic.forEach(m => console.log(`  - ${m.model_id}${m.display_name ? ` (${m.display_name})` : ''}`));
    
    // Show 4.5 models specifically
    const v45 = anthropic.filter(m => m.model_id.includes('4-5') || m.model_id.includes('4.5'));
    if (v45.length > 0) {
      console.log('\n  Version 4.5 models:');
      v45.forEach(m => console.log(`    - ${m.model_id}`));
    }
  }

  console.log('\n=== Google/Gemini Models ===');
  const gemini = await listGeminiModels();
  if (gemini.length === 0) {
    console.log('No models found. Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.');
  } else {
    console.log(`Found ${gemini.length} models:`);
    gemini.forEach(m => console.log(`  - ${m.model_id}${m.display_name ? ` (${m.display_name})` : ''}`));
  }

  console.log('\n=== Summary ===');
  console.log(`Total models discovered: ${openai.length + anthropic.length + gemini.length}`);
}

main().catch(console.error);

