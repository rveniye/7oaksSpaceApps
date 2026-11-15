const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const pages = ['index', 'understand', 'prevent', 'detect', 'suppress', 'earth'];

test('every page has the same research navigation and resolves its local assets', () => {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page + '.html'), 'utf8');
    const nav = html.match(/<nav aria-label="Research areas">([\s\S]*?)<\/nav>/)?.[1];
    assert(nav, `${page}: missing global navigation`);
    assert.deepEqual([...nav.matchAll(/>([^<]+)<\/a>/g)].map(m => m[1]), ['Understand', 'Prevent', 'Detect', 'Suppress', 'Applications']);
    if (page !== 'index') assert(nav.includes(`href="${page}.html" aria-current="page"`));
    for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if (/^(?:https?:|data:|mailto:)/.test(match[1])) continue;
      assert(fs.existsSync(path.join(root, match[1].split('#')[0])), `${page}: missing ${match[1]}`);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${page}: duplicate DOM id`);
    for (const match of html.matchAll(/href="#([^"]+)"/g)) {
      assert(ids.includes(match[1]), `${page}: broken section ${match[1]}`);
    }
    assert(!html.includes('research-notes.js'));
    assert(!html.includes('href="#research-notes"'));
    assert(html.includes('id="agent"'));
  }
});

test('investigation discovery ranks relevance, searches hardware and retains missing-data fields', async () => {
  await import('../dist/investigations.js');
  const { findRecords, records } = globalThis.Investigations;
  assert.equal(records.length, 12);
  assert.equal(findRecords('nonexistent experiment').length, 0);
  assert(findRecords('CIR').length >= 5);
  assert(findRecords('liquid droplet').every(r => r.fuel.includes('Liquid')));
  const detection = findRecords('', 'detect');
  assert.deepEqual(detection.filter(r => r.relevance === 'Direct').map(r => r.id).sort(), ['same']);
  for (const area of ['prevent','detect','suppress','understand','applications']) {
    const rows = findRecords('', area);
    assert.equal(rows[0].relevance, 'Direct');
    assert(rows.every(r => r.gap && r.variables && r.measurements));
  }
});

test('investigation controls search, compare up to three and clear the comparison', () => {
  const vm = require('node:vm');
  const nodes = new Map();
  class Node {
    constructor(tag='div') { this.tagName=tag.toUpperCase();this.children=[];this.listeners={};this.value='';this.textContent=''; }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children=children; }
    setAttribute(key,value) { this[key]=value; }
    addEventListener(event,handler) { this.listeners[event]=handler; }
    focus() { this.focused=true; }
  }
  const byId=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
  byId('investigation-area').value='all';
  const document={getElementById:byId,createElement:tag=>new Node(tag),createTextNode:text=>({textContent:text})};
  vm.runInNewContext(fs.readFileSync(path.join(root,'investigations.js'),'utf8'),{document,URL,Blob,setTimeout});
  const cards=()=>byId('investigation-results').children;
  const check=card=>card.children.at(-1).children[0].children[0];
  assert.equal(cards().length,12);
  for(let index=0;index<3;index++){const input=check(cards()[index]);input.checked=true;input.listeners.change();}
  assert(check(cards()[3]).disabled);
  assert.equal(byId('investigation-compare-head').children.length,4);
  assert.equal(byId('investigation-compare-body').children.length,7);
  assert.equal(byId('investigation-comparison').hidden,false);
  byId('investigation-search').value='missing research';byId('investigation-search').listeners.input();
  assert.match(cards()[0].textContent,/No matching/);
  assert.equal(byId('investigation-compare-head').children.length,4,'filtering must preserve selections');
  byId('clear-comparison').listeners.click();
  assert.equal(byId('investigation-comparison').hidden,true);
});

test('complete combustion lessons belong to Understand while Applications retains the engine', () => {
  const understand=fs.readFileSync(path.join(root,'understand.html'),'utf8');
  const applications=fs.readFileSync(path.join(root,'earth.html'),'utf8');
  for(const id of ['flames','soot','flame-canvas','soot-canvas','cool-closeup-svg']){
    assert(understand.includes(`id="${id}"`));assert(!applications.includes(`id="${id}"`));
  }
  assert(applications.includes('id="engine-diagram"'));
  assert(!understand.includes('id="engine-diagram"'));
  assert(applications.includes('id="findings"'));
  assert(!applications.includes('href="understand.html#flames"'));
  assert(!applications.includes('href="understand.html#soot"'));
});

test('relevance scores preserve ties and full-catalogue ranks when searching', async () => {
  await import('../dist/investigations.js');
  const { findRecords } = globalThis.Investigations;
  const overall = findRecords();
  assert.deepEqual(overall.slice(0,2).map(r=>[r.id,r.rank,r.score]), [['bass',1,4],['saffire',1,4]]);
  assert.equal(overall[2].rank,3);
  assert.equal(findRecords('Saffire')[0].rank,1);
  const detection=findRecords('','detect');
  assert.equal(detection[0].id,'same');
  assert.equal(detection[0].score,3);
  assert.equal(detection[1].id,'daft');
  assert.equal(detection[1].score,1);
  assert.equal(findRecords('','suppress')[0].id,'flex');
  for(const row of overall){
    assert.equal(row.score,row.breakdown.reduce((sum,item)=>sum+item.points,0));
    assert.equal(row.maxScore,9);
    assert(row.score>=0 && row.score<=row.maxScore);
  }
  assert.deepEqual(findRecords('','unknown').map(r=>r.id),overall.map(r=>r.id));
});
