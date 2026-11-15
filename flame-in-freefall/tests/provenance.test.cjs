const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.join(__dirname,'..');
test('source register matches the generated browser copy and covers every catalogue family without invented measurements',()=>{
 const data=JSON.parse(fs.readFileSync(path.join(root,'data/source-provenance.json'),'utf8')),scope={};
 vm.runInNewContext(fs.readFileSync(path.join(root,'dist/source-provenance.js'),'utf8'),scope);
 assert.deepEqual(JSON.parse(JSON.stringify(scope.SourceProvenance)),data);
 vm.runInNewContext(fs.readFileSync(path.join(root,'dist/investigations.js'),'utf8'),scope);
 for(const record of scope.Investigations.records){assert(record.provenance,record.id);assert.equal(record.measurementsImported,false);assert(record.sourceUrls.startsWith('https://'));}
 for(const record of Object.values(data.records)){assert.equal(record.measurementsImported,false);assert(record.checkedScope&&record.limits&&record.checkedOn);for(const source of record.sources){assert.equal(new URL(source.url).protocol,'https:');assert(source.locator&&source.kind);}}
 assert(data.records.bass.issues.length);assert(data.records.saffire.issues.length);assert.equal(data.records.spice.status,'Identity checked only');
});
test('all pages load the source register before their source renderer and catalogue',()=>{
 for(const file of ['index','understand','prevent','detect','suppress','earth']){
  const html=fs.readFileSync(path.join(root,'dist',file+'.html'),'utf8');assert(html.indexOf('src="source-provenance.js"')<html.indexOf('src="provenance-view.js"'));
  if(file==='index')assert(html.indexOf('src="source-provenance.js"')<html.indexOf('src="investigations.js"'));
 }
});
test('unsupported detector specifications do not reappear in the comparison',()=>{
 const js=fs.readFileSync(path.join(root,'dist/detect-ranking.js'),'utf8');assert.doesNotMatch(js,/15\+ years|1\.5 W|9 W|few months|0\.4–0\.7/);assert.match(js,/Preliminary assessments/);
});
