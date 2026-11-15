const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const root=path.join(__dirname,'..');
test('experiment descriptions exactly match the Markdown sections and retain draft status',()=>{
 const md=fs.readFileSync(path.join(root,'context/experiments/experiments.md'),'utf8'),sandbox={window:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'dist/experiment-definitions.js'),'utf8'),sandbox);
 const sections=md.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/,'').split(/^#\s+/m).filter(Boolean);
 assert.equal(sandbox.window.ExperimentDefinitions.length,sections.length);
 for(const section of sections){const [term,...body]=section.split('\n');const entry=sandbox.window.ExperimentDefinitions.find(e=>e.term===term.trim());assert(entry);assert.equal(entry.description,body.join('\n').trim());assert.equal(entry.source,'context/experiments/experiments.md');assert.equal(entry.draft,true);}
});
test('all pages load the shared glossary and generated experiments in order',()=>{
 for(const name of ['index','understand','prevent','detect','suppress','earth']){
  const html=fs.readFileSync(path.join(root,'dist',name+'.html'),'utf8');
  for(const asset of ['research-definitions.js','experiment-definitions.js','glossary.js','glossary.css'])assert(html.includes('"'+asset+'"'),name+' '+asset);
  assert(html.indexOf('src="experiment-definitions.js"')<html.indexOf('src="glossary.js"'));
  assert.equal((html.match(/src="glossary.js"/g)||[]).length,1);
 }
});
