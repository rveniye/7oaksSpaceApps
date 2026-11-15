const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const vm = require('node:vm');
const pages = ['understand', 'prevent', 'detect', 'suppress', 'applications', 'experiments'];

test('public research notes preserve original Markdown byte for byte', async () => {
  const { researchDocuments } = await import('../server/research-context.js');
  for (const page of pages) {
    const documents = await researchDocuments(page);
    assert(documents.length > 0);
    for (const doc of documents) {
      const source = await readFile(resolve(__dirname, '..', doc.path), 'utf8');
      assert.equal(doc.markdown, source);
      assert.equal(doc.status, source.match(/^status: (.+)$/m)?.[1] || 'draft');
    }
  }
  for (const page of ['../../.env', '__proto__', 'constructor', null]) {
    await assert.rejects(researchDocuments(page), /Unknown research page/);
  }
});

test('static source notes match the live Markdown library', async () => {
  const { researchDocuments } = await import('../server/research-context.js');
  const sandbox = { window: {} };
  vm.runInNewContext(await readFile(resolve(__dirname, '../dist/research-notes-data.js'), 'utf8'), sandbox);
  for (const page of pages) {
    assert.equal(JSON.stringify(sandbox.window.ResearchNotesData[page]), JSON.stringify(await researchDocuments(page)), 'Run node scripts/sync-research-notes.js after changing context notes.');
  }
});

test('home research context spans sections and keeps draft review boundaries', async () => {
  const { researchBundle, validateResearch } = await import('../server/research-context.js');
  const state = validateResearch({ researchPage: 'experiments', scene: 'overview', front: 'continuous' });
  const result = await researchBundle('Compare detection and suppression.', state);
  assert(result.sources.some(source => source.id === 'DETECT-1'));
  assert(result.sources.some(source => source.id === 'SUPPRESS-1'));
  assert.match(result.prompt, /reviewNotes/);
  const systemPrompt = await readFile(resolve(__dirname, '../context/assistant-prompt.md'), 'utf8');
  assert.match(systemPrompt, /Do not invent numerical results/);
  assert.match(systemPrompt, /Sound moves the gas mixture/);
  assert.throws(() => validateResearch({ researchPage: 'applications', scene: 'mist', front: 'continuous' }), /Invalid research scenario/);
});
