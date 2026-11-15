const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(page = 'understand') {
  class Element {
    constructor(dataset = {}) { this.dataset = dataset; this.handlers = {}; this.attributes = {}; this.children = []; this.hidden = false; this.textContent = ''; this.classList = { toggle() {} }; }
    addEventListener(name, handler) { this.handlers[name] = handler; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name]; }
    append(value) { this.children.push(value); }
    replaceChildren(...values) { this.children = values; }
    click() { return this.handlers.click?.({}); }
    focus() {}
  }
  const ids = Object.fromEntries(['agent', 'agent-panel', 'agent-toggle', 'agent-close', 'explain-form', 'question', 'ai-result', 'agent-actions', 'ai-status', 'ai-answer', 'ai-sources', 'scene-description', 'flame-stage', 'enhance-cool', 'soot-formation', 'soot-oxidation'].map(id => [id, new Element()]));
  ids['flame-stage'].value = '0';
  ids['enhance-cool'].checked = true;
  ids['soot-formation'].value = 'high';
  ids['soot-oxidation'].value = 'low';
  ids['ai-result'].hidden = true;
  ids['agent-panel'].hidden = true;
  ids.question.value = 'Show the flame in microgravity.';
  const submit = new Element();
  ids['explain-form'].querySelector = () => submit;
  const buttons = ['earth', 'microgravity', 'ventilation'].map(scene => { const button = new Element({ scene }); button.textContent = scene; return button; });
  const engine = new Element({ engine: '1' });
  engine.setAttribute('aria-pressed', 'true');
  const documentEvents = {};
  let deliver;
  let sentBody;
  const sandbox = {
    document: {
      body: { dataset: { researchPage: page } },
      getElementById: id => ids[id] || null,
      querySelectorAll: selector => selector === '[data-scene]' ? buttons : selector === '[data-engine]' ? [engine] : [],
      addEventListener: (name, handler) => { documentEvents[name] = handler; },
      createElement: () => new Element()
    },
    window: {}, location: { protocol: 'http:' }, AbortSignal,
    fetch: (_url, options) => { sentBody = JSON.parse(options.body); return new Promise(resolve => { deliver = data => resolve({ ok: true, headers: { get: () => 'application/json' }, json: async () => data }); }); }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/research-page.js'), 'utf8'), sandbox);
  return { ids, buttons, submit, snapshot: () => sentBody, changeApplications: () => documentEvents.applicationstatechange?.(), answer: data => deliver(data), send: () => ids['explain-form'].handlers.submit({ preventDefault() {}, currentTarget: ids['explain-form'] }) };
}

test('a delayed assistant response cannot overwrite a newer demonstration selection', async () => {
  const f = fixture();
  const pending = f.send();
  f.buttons[2].click();
  f.answer({ answer: 'Earlier explanation.', sources: [], actions: [{ type: 'set', field: 'scene', value: 'microgravity' }, { type: 'navigate', page: 'detect', href: 'javascript:alert(1)' }] });
  await pending;
  assert.equal(f.buttons[2].attributes['aria-pressed'], 'true');
  assert.equal(f.buttons[1].attributes['aria-pressed'], 'false');
  assert.match(f.ids['ai-status'].textContent, /control changes were skipped/);
  assert.match(f.ids['ai-status'].textContent, /suggested control changes were skipped/);
  assert.equal(f.ids['agent-actions'].children[0].href, 'detect.html');
  assert.equal(f.submit.disabled, false);
});

test('later user selection marks an earlier answer stale and toggle label follows state', async () => {
  const f = fixture();
  const pending = f.send();
  f.answer({ answer: 'The current flame.', sources: [{ id: 'UNDERSTAND-1', title: 'Source note', path: 'context/understand/fires-in-microgravity.md' }], actions: [] });
  await pending;
  f.buttons[1].click();
  assert.match(f.ids['ai-status'].textContent, /earlier selection/);
  f.ids['agent-toggle'].click();
  assert.equal(f.ids['agent-toggle'].attributes['aria-label'], 'Close research assistant');
  f.ids['agent-close'].click();
  assert.equal(f.ids['agent-toggle'].attributes['aria-label'], 'Open research assistant');
});

test('Understand sends fresh combustion inputs and detects playback changes during a request', async () => {
  const f = fixture('understand');
  f.ids['flame-stage'].value = '2';
  f.ids['soot-formation'].value = 'medium';
  const pending = f.send();
  assert.deepEqual(f.snapshot().applicationInputs, { stage: 2, enhance: true, formation: 'medium', oxidation: 'low', engine: 1 });
  f.ids['flame-stage'].value = '3';
  f.answer({ answer: 'Earlier stage.', sources: [], actions: [] });
  await pending;
  assert.match(f.ids['ai-status'].textContent, /demonstration changed/);
  f.ids['flame-stage'].value = '0';
  f.changeApplications();
  assert.match(f.ids['ai-status'].textContent, /earlier selection/);
});
