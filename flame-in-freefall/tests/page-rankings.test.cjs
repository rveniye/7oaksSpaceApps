const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('all page rankings exactly match the catalogue and AI data',()=>{
 const sandbox={};vm.runInNewContext(read('dist/source-provenance.js'),sandbox);vm.runInNewContext(read('dist/investigations.js'),sandbox);vm.runInNewContext(read('dist/research-rankings-data.js'),sandbox);
 const data=JSON.parse(read('data/research-rankings.json'));
 assert.deepEqual(JSON.parse(JSON.stringify(sandbox.ResearchRankings)),data);
 for(const [page,rows] of Object.entries(data.pages)){
  assert.equal(rows.length,12);
  const current=sandbox.Investigations.findRecords('',page);
  assert.deepEqual(rows.map(r=>[r.id,r.rank,r.score,r.reason]),JSON.parse(JSON.stringify(current.map(r=>[r.id,r.rank,r.score,r.reason]))));
  assert(rows.every(r=>r.sources.length&&r.checkedScope&&r.limits));
 }
});
test('each research page renders all ranked entries at the bottom and permits assistant scrolling',()=>{
 class Node{constructor(tag){this.tagName=tag;this.children=[];}append(...children){this.children.push(...children);}}
 for(const [page,file] of Object.entries({understand:'understand',prevent:'prevent',detect:'detect',suppress:'suppress',applications:'earth'})){
  const section=new Node('section'),main=new Node('main');
  const sandbox={document:{body:{dataset:{researchPage:page}},getElementById:id=>id==='research-ranking'?section:null,createElement:tag=>new Node(tag),querySelector:()=>main}};
  vm.runInNewContext(read('dist/research-rankings-data.js'),sandbox);vm.runInNewContext(read('dist/research-rankings.js'),sandbox);
  assert.equal(main.children.at(-1),section);
  assert.equal(section.children.find(n=>n.tagName==='ol').children.length,12);
  vm.runInNewContext(read('dist/assistant-actions.js'),sandbox);
  const html=read('dist/'+file+'.html');assert(html.includes('href="#research-ranking"'));assert(html.includes('src="research-rankings.js"'));
 }
});
test('backend sends displayed rankings to Gemini',async()=>{
 const {createHandler}=await import('../server/index.js');let prompt,status;
 const handler=createHandler(async text=>{prompt=text;return 'SAME is a direct detection match.';});
 await handler({method:'POST',url:'/api/ask',headers:{'content-type':'application/json'},async *[Symbol.asyncIterator](){yield JSON.stringify({question:'Rank the studies',researchPage:'understand',scene:'earth',front:'continuous'});}}, {setHeader(){},writeHead(code){status=code;},end(){}});
 assert.equal(status,200);assert(prompt.includes('Displayed investigation rankings'));assert(prompt.includes('"same"'));assert(prompt.includes('"rank":1'));
});
