#!/usr/bin/env node
/**
 * Test model selection logic
 */

import { listAllModels, selectDefaultModels } from '../packages/mcp-server/dist/tools/models.js';

async function main() {
  console.log('Testing model selection...\n');
  
  const models = await listAllModels();
  const selected = selectDefaultModels(models);
  
  console.log('Selected Models:');
  console.log(JSON.stringify(selected, null, 2));
  
  console.log('\nAnthropic models available:');
  const anthropic = models.filter(m => m.provider === 'anthropic');
  anthropic.forEach(m => {
    const isSelected = 
      Object.values(selected.reasoning).includes(m.model_id) ||
      Object.values(selected.fast).includes(m.model_id) ||
      Object.values(selected.vision).includes(m.model_id);
    console.log(`  ${m.model_id}${isSelected ? ' ✓ SELECTED' : ''}`);
  });
}

main().catch(console.error);

