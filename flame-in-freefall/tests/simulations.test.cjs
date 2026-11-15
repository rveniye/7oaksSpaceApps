const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function figure(page, scenes, reduced = false) {
  const nodes = new Map();
  const created = [];
  function node(id) {
    if (!nodes.has(id)) {
      const classes = new Set();
      nodes.set(id, { id, innerHTML: '', textContent: '', attrs: {}, handlers: {}, children: [],
        setAttribute(name, value) { this.attrs[name] = value; },
        addEventListener(name, fn) { this.handlers[name] = fn; },
        append(...items) { this.children.push(...items); }, before() {}, after() {},
        classList: {add(...names) { names.forEach(n => classes.add(n)); }, toggle(name, value) { if(value) classes.add(name); else classes.delete(name); }, contains(name) { return classes.has(name); }},
      });
    }
    return nodes.get(id);
  }
  const buttons = scenes.map(scene => Object.assign(node(scene), {dataset: {scene}}));
  let selected = buttons[0];
  const media = {matches: reduced, addEventListener(name, fn) {this.change = fn;}};
  const context = {document: {
    body: {dataset: {researchPage: page}}, hidden: false,
    getElementById: node,
    createElement(tag) {const result = node(tag + created.length); created.push(result); return result;},
    querySelector() {return selected;}, querySelectorAll() {return buttons;}, addEventListener() {},
  }, matchMedia: () => media, IntersectionObserver: class {observe() {}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, `../dist/${page === 'suppress' ? 'suppression' : page}-visual.js`), 'utf8'), context);
  return {node, created, media, choose(scene) { selected = buttons.find(b => b.dataset.scene === scene); selected.handlers.click(); }};
}

test('Prevention modes explain separate cooling, oxygen supply and smoke transport mechanisms', () => {
  const f = figure('prevent', ['cooling', 'supply', 'transport']);
  assert.match(f.node('research-visual').innerHTML, /Supply fan/);
  assert.match(f.node('scene-description').textContent, /heat carried away/);
  f.choose('supply');
  assert.match(f.node('scene-description').textContent, /More airflow is not a universal/);
  f.choose('transport');
  assert.match(f.node('research-visual').innerHTML, /p-smoke/);
  assert.match(f.node('research-visual').attrs['aria-label'], /detector can only respond/);
  const pause = f.created.find(n => n.textContent === 'Pause motion');
  pause.handlers.click();
  assert(f.node('research-visual').classList.contains('simulation-paused'));
  f.choose('cooling');
  assert(f.node('research-visual').classList.contains('simulation-paused'));
});

test('Suppression shows mechanism, limitations and motion controls in every mode', () => {
  const f = figure('suppress', ['mist', 'ionic', 'acoustic'], true);
  assert(f.node('research-visual').classList.contains('simulation-paused'));
  assert.match(f.node('scene-description').textContent, /does not show a measured cooling rate/);
  f.choose('ionic');
  assert.match(f.node('research-visual').innerHTML, /positive ions/);
  f.choose('acoustic');
  assert.match(f.node('scene-description').textContent, /back and forth around fixed positions/);
  assert.match(f.node('research-visual').innerHTML, /s-oscillation/);
  const reading = f.created.find(n => n.className === 'simulation-reading');
  assert.match(reading.innerHTML, /Weak forcing may feed a flame/);
});

test('Understanding comparison keeps fuel type constant and exposes the transport mechanism', () => {
  const f = figure('understand', ['earth', 'microgravity', 'ventilation'], true);
  for (const scene of ['earth', 'microgravity', 'ventilation']) {
    f.choose(scene);
    assert.match(f.node('research-visual').innerHTML, /Liquid fuel droplet/);
    assert(f.node('research-visual').classList.contains('u-paused'));
  }
  const reading = f.created.find(n => n.className === 'simulation-reading');
  assert.match(reading.innerHTML, /Shape depends on flow/);
});
