const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
function harness(){
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{id,value:'',hidden:false,style:{},dataset:{},listeners:{},attrs:{},classList:{toggle(){}},addEventListener(event,fn){this.listeners[event]=fn;},setAttribute(k,v){this.attrs[k]=v;},getBoundingClientRect(){return {width:860,height:400};},replaceChildren(){},append(){},focus(){this.focused=true;},contains(){return false;},scrollIntoView(){this.scrolled=true;},querySelector(){return node('submit');}});return nodes.get(id);};
 const methods=['optical','ionisation','multi','gas'].map(m=>Object.assign(node('tab-'+m),{dataset:{method:m}}));
 const presets=['earth','still','flow'].map(p=>Object.assign(node('preset-'+p),{dataset:{preset:p}}));
 const ctx=new Proxy({createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 node('transport').getContext=()=>ctx;
 const document={hidden:false,activeElement:null,getElementById:node,querySelector:node,querySelectorAll:s=>s==='[data-method]'?methods:presets,addEventListener(){},createElement:node};
 const sandbox={document,localStorage:{getItem(){return null;},setItem(){}},matchMedia:()=>({matches:false,addEventListener(){}}),devicePixelRatio:1,requestAnimationFrame:()=>1,cancelAnimationFrame(){},IntersectionObserver:class{observe(){}},ResizeObserver:class{observe(){}},location:{protocol:'file:'},setTimeout,clearTimeout,AbortSignal};sandbox.window=sandbox;
 vm.createContext(sandbox);for(const file of ['detect-state.js','detect.js'])vm.runInContext(fs.readFileSync(new URL('../dist/'+file,'file://'+__filename),'utf8'),sandbox);
 return {sandbox,node,methods,vm:code=>vm.runInContext(code,sandbox)};
}
test('Detect initialises diagrams, calculator and floating assistant; commands operate controls',()=>{
 const h=harness();assert.match(h.node('transport-formula').textContent,/30.0 s/);
 for(const tab of h.methods){tab.listeners.click();assert.match(h.node('sensor-svg').innerHTML,/<text/);assert(h.node('sensor-svg').innerHTML.length>1000);}
 h.vm("runLocalCommand('/set velocity 0.2')");assert.match(h.node('transport-formula').textContent,/15.0 s/);
 h.vm("runLocalCommand('/go calculations')");assert(h.node('calculations').scrolled);
 h.vm("runLocalCommand('/set velocity -2')");assert.match(h.node('ai-status').textContent,/out-of-range/);
 h.vm('openAgent(true)');assert.equal(h.node('agent-panel').hidden,false);assert(h.node('question').focused);
 h.node('agent-close').listeners.click();assert.equal(h.node('agent-panel').hidden,true);assert(h.node('agent-toggle').focused);
});
