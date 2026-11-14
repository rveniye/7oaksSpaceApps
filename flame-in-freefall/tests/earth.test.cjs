const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'../dist',name),'utf8');
test('Earth state rejects invalid inputs and illustrative soot accounting conserves tokens',()=>{
 const c={};vm.createContext(c);vm.runInContext(read('earth-model.js'),c);const m=c.EarthModel;
 assert.equal(m.clean({stage:99,engine:-1,formation:'unknown',enhance:'false'}).stage,0);
 assert.equal(m.clean(null).formation,'high');
 for(const f of ['low','medium','high'])for(const o of ['low','medium','high']){const b=m.soot(f,o);assert.equal(b.formed-b.oxidised,b.escaped);assert(b.escaped>=0);}
 assert(m.soot('high','low').escaped>m.soot('low','high').escaped);
 assert.equal(m.soot('high','low').formed,m.soot('high','high').formed);
 assert.match(m.snapshot(m.defaults).limitations.join(' '),/not measured/);
});
test('Earth controls initialise and update flame stages, soot presets, engine diagram and saved context',()=>{
 const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',checked:false,dataset:{},style:{},attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.handlers[k]=fn;},getBoundingClientRect(){return {width:800,height:330};},focus(){this.focused=true;},scrollIntoView(options){this.scrollOptions=options;}});return nodes.get(id);};
 const stages=[0,1,2,3].map(i=>Object.assign(node('s'+i),{dataset:{stage:String(i)}})),engine=[0,1,2].map(i=>Object.assign(node('e'+i),{dataset:{engine:String(i)}}));
 const ctx=new Proxy({createRadialGradient(){return {addColorStop(){}};},createLinearGradient(){return {addColorStop(){}};}},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 node('flame-canvas').getContext=()=>ctx;node('soot-canvas').getContext=()=>ctx;let saved;
 const c={document:{getElementById:node,querySelectorAll:s=>s==='[data-stage]'?stages:engine,addEventListener(){},hidden:false},localStorage:{getItem(){return null;},setItem(k,v){saved=JSON.parse(v);}},matchMedia:()=>({matches:true,addEventListener(){}}),requestAnimationFrame:()=>1,cancelAnimationFrame(){},devicePixelRatio:1,ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}}};c.window=c;vm.createContext(c);vm.runInContext(read('earth-model.js'),c);vm.runInContext(read('earth.js'),c);
 assert.match(node('stage-title').textContent,/not started/);stages[3].handlers.click();assert.match(node('stage-title').textContent,/faint reaction/);
 node('enhance-cool').checked=false;node('enhance-cool').handlers.change();assert.match(node('stage-description').textContent,/Enhancement is off/);
 node('soot-lower').handlers.click();assert.equal(node('soot-escaped').textContent,1);assert.match(node('soot-scenario-title').textContent,/Matches/);
 node('soot-higher').handlers.click();assert.equal(node('soot-escaped').textContent,31);
 node('reveal-cool').handlers.click();assert.equal(saved.inputs.stage,3);assert.equal(saved.inputs.enhance,true);assert(node('flame-canvas').focused);assert.equal(node('flame-canvas').scrollOptions.block,'center');
 engine[2].handlers.click();assert.match(node('engine-diagram').innerHTML,/Distributed ignition/);assert.equal(saved.inputs.engine,2);
});
