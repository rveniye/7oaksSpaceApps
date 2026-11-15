const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'../dist',file),'utf8');
function fixture({page='understand',local=new Map(),session=new Map(),reduced=true,broken=false}={}){
 const nodes=new Map(),events={},frames=new Map();let nextFrame=0,destination;
 class Element{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.handlers={};this.hidden=false;this.attrs={};this.scrollTop=0;this.scrollHeight=200;this.clientHeight=200;this.textContent='';this.classList={toggle(){}};}
  append(...values){this.children.push(...values);}
  prepend(...values){this.children.unshift(...values);}
  replaceChildren(...values){this.children=[...values];}
  setAttribute(k,v){this.attrs[k]=v;}
  addEventListener(k,fn){(this.handlers[k]??=[]).push(fn);}
  dispatchEvent(e){for(const fn of this.handlers[e.type]||[])fn(e);}
  click(){this.dispatchEvent({type:'click'});}
  focus(){}
  scrollIntoView(){this.scrolled=true;}
  get lastElementChild(){return this.children.at(-1);}
  querySelector(selector){return walk(this).find(n=>selector.startsWith('.')?n.className?.split(' ').includes(selector.slice(1)):n.tagName===selector.toUpperCase());}
 }
 function walk(el){return el.children.flatMap(n=>n instanceof Element?[n,...walk(n)]:[]);}
 const node=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);};
 const output=node('output');
 const document={body:{dataset:{researchPage:page}},querySelector:s=>s==='.agent-output'?output:null,getElementById:node,querySelectorAll:s=>s==='[data-stage]'?stages:s==='[data-scene]'?scenes:[],createElement:t=>new Element(t),createTextNode:text=>({textContent:text}),addEventListener:(e,fn)=>events[e]=fn};
 const stages=[0,1,2,3].map(i=>{const n=new Element('button');n.dataset.stage=String(i);n.addEventListener('click',()=>node('flame-stage').value=i);return n;});
 const scenes=['earth','microgravity','ventilation'].map(scene=>{const n=new Element('button');n.dataset.scene=scene;n.addEventListener('click',()=>node('active-scene').value=scene);return n;});
 node('agent-panel').hidden=true;node('agent-toggle').addEventListener('click',()=>node('agent-panel').hidden=!node('agent-panel').hidden);
 const storage=map=>({getItem:k=>{if(broken)throw Error('blocked');return map.get(k)||null;},setItem:(k,v)=>{if(broken)throw Error('blocked');map.set(k,v);},removeItem:k=>map.delete(k)});
 const context={document,localStorage:storage(local),sessionStorage:storage(session),location:{assign:url=>destination=url},matchMedia:()=>({matches:reduced}),requestAnimationFrame:fn=>{frames.set(++nextFrame,fn);return nextFrame;},cancelAnimationFrame:id=>frames.delete(id),Event:class{constructor(type){this.type=type;}},Date};context.window=context;
 vm.createContext(context);vm.runInContext(read('assistant-actions.js'),context);vm.runInContext(read('assistant-chat.js'),context);
 return {chat:context.AssistantChat,context,node,output,events,local,session,walk,frames,get destination(){return destination;}};
}
test('chat survives a page reload and sends bounded previous messages without replaying actions',async()=>{
 const f=fixture();const ticket=f.chat.begin('Explain **soot**.');assert.equal(ticket.history.length,0);
 await f.chat.complete({answer:'**Soot** can be *oxidised*.',sources:[{id:'A',title:'Research'}]},ticket);
 const restored=fixture({page:'applications',local:f.local,session:f.session});
 const next=restored.chat.begin('How does that help engines?');
 assert.equal(next.history.length,2);assert.equal(next.history[0].page,'understand');assert.equal(next.history[1].content,'**Soot** can be *oxidised*.');assert.equal(restored.destination,undefined);
 assert(restored.walk(restored.output).some(n=>n.tagName==='STRONG'&&n.textContent==='Soot'));
 assert(restored.walk(restored.output).some(n=>n.tagName==='EM'&&n.textContent==='oxidised'));
 const clear=restored.walk(restored.output).find(n=>n.tagName==='BUTTON'&&n.textContent==='Clear conversation');clear.click();assert.equal(restored.chat.history().length,0);
 assert.deepEqual(JSON.parse(restored.local.get('7oaks:conversation:v1')),[]);
});
test('typewriter reveals progressively, skip completes and clearing invalidates pending responses',async()=>{
 const f=fixture({reduced:false});const ticket=f.chat.begin('Explain');let ended=false;const waiting=f.chat.complete({answer:'Hello world',sources:[]},ticket).then(x=>{ended=x;});
 const [id,frame]=f.frames.entries().next().value;f.frames.delete(id);frame(0);assert.equal(ended,false);
 const body=f.walk(f.output).filter(n=>n.className==='chat-message-body').at(-1);assert.equal(body.children[0].children[0].textContent,'H');
 f.walk(f.output).find(n=>n.textContent==='Show full answer').click();await waiting;assert.equal(ended,true);
 const stale=f.chat.begin('Another question');f.walk(f.output).find(n=>n.textContent==='Clear conversation').click();assert.equal(await f.chat.complete({answer:'Too late'},stale),false);
});
test('navigation carries pending controls once, ignores supplied URLs and expires stale queues',async()=>{
 const f=fixture({page:'applications'});const ticket=f.chat.begin('Show cool flames');await f.chat.complete({answer:'Observe the faint reaction.',sources:[]},ticket);
 f.chat.execute([{type:'navigate',page:'understand',href:'https://attacker.invalid'},{type:'set',field:'stage',value:3},{type:'scroll',section:'flames'}]);
 assert.equal(f.destination,'understand.html');
 const target=fixture({page:'understand',local:f.local,session:f.session});target.events.DOMContentLoaded();assert.equal(target.node('flame-stage').value,3);assert(target.node('flames').scrolled);assert(!f.session.has('7oaks:assistant-navigation:v1'));
 const staleSession=new Map([['7oaks:assistant-navigation:v1',JSON.stringify({page:'understand',actions:[{type:'set',field:'stage',value:2}],created:Date.now()-180000})]]);
 const stale=fixture({session:staleSession});stale.events.DOMContentLoaded();assert.equal(stale.node('flame-stage').value,undefined);
});
test('unsafe Markdown never creates HTML, executable links or injected attributes',()=>{
 const f=fixture(),target=f.node('format-test');f.chat.markdown(target,'<img src=x onerror=alert(1)>\n**Bold** and *italic*\n[x](javascript:alert)\n- First\n- Second\n```js\n<script>evil()</script>\n```');
 const tags=f.walk(target).map(n=>n.tagName);assert(!tags.includes('IMG'));assert(!tags.includes('SCRIPT'));assert(!tags.includes('A'));assert(tags.includes('STRONG'));assert(tags.includes('EM'));assert(tags.includes('UL'));assert(tags.includes('PRE'));
});
test('blocked storage does not break chat or discard a conversation through navigation',async()=>{
 const f=fixture({broken:true});const ticket=f.chat.begin('Question');await f.chat.complete({answer:'Answer'},ticket);f.chat.execute([{type:'navigate',page:'detect'}]);assert.equal(f.destination,undefined);assert.match(f.node('agent-actions').textContent,/storage is unavailable/);
});
test('shared action contract validates cross-page parameters and section names',()=>{
 const f=fixture(),c=f.context.AssistantActions;
 const clean=c.clean([{type:'set',field:'stage',value:9},{type:'set',field:'formation',value:'low'},{type:'navigate',page:'applications'},{type:'set',field:'stage',value:2},{type:'set',field:'engine',value:2},{type:'scroll',section:'transfer'},{type:'scroll',section:'../../.env'},{type:'navigate',page:'detect'}],'understand');
 assert.equal(clean.length,4);assert.equal(clean[2].field,'engine');assert.equal(clean[3].section,'transfer');
});

 test('the screenshot-style response reaches the scene control and scroll target',async()=>{
 const {parseAgentResponse}=await import('../server/detect-context.js');
 const data=parseAgentResponse('Observe the spherical flame.\n```json\n'+JSON.stringify({answer:'I will switch the scene.',actions:[{type:'set',field:'scene',value:'microgravity'},{type:'scroll',section:'shape'}]})+'\n```',{page:'understand'});
 const f=fixture();const ticket=f.chat.begin('Show microgravity');await f.chat.complete(data,ticket);f.chat.execute(data.actions);
 assert.equal(f.node('active-scene').value,'microgravity');assert(f.node('shape').scrolled);assert.match(f.node('agent-actions').textContent,/Set scene to microgravity/);
 assert(!f.chat.history().at(-1).content.includes('"actions"'));
});

test('actions execute before typewriter finishes and repeat uses saved commands after reload',async()=>{
 const f=fixture({reduced:false});const ticket=f.chat.begin('Switch to microgravity');
 const pending=f.chat.complete({answer:'A detailed explanation follows.',actions:[{type:'set',field:'scene',value:'microgravity'},{type:'scroll',section:'shape'}]},ticket,{apply:true});
 assert.equal(f.node('active-scene').value,'microgravity');assert(f.node('shape').scrolled);
 f.walk(f.output).find(n=>n.textContent==='Show full answer').click();await pending;
 const restored=fixture({local:f.local});restored.node('active-scene').value='earth';
 assert.equal(await restored.chat.tryRepeat('can you redo your previous command?'),true);
 assert.equal(restored.node('active-scene').value,'microgravity');assert(restored.node('shape').scrolled);
 const saved=restored.chat.history().at(-1);assert.equal(saved.actions[0].value,'microgravity');assert.match(saved.status,/Set scene/);
});
test('repeat does not guess an action from legacy conversation text',async()=>{
 const f=fixture();await f.chat.complete({answer:'You should switch to microgravity.'},f.chat.begin('Show me'));
 assert.equal(await f.chat.tryRepeat('repeat the last action'),true);assert.equal(f.node('active-scene').value,undefined);assert.match(f.node('ai-status').textContent,/did not save action commands/);
});

function visibleText(element){return [element.textContent||'',...(element.children||[]).map(visibleText)].join('');}
function flushFrames(f){for(const [id,frame] of [...f.frames]){f.frames.delete(id);frame(0);}}
test('internal citation codes are hidden in new and saved replies while evidence and formatting remain',async()=>{
 const f=fixture();
 const answer='**Flames** change [UNDERSTAND-3]. Smoke matters [detect-2; DETECT-OPTICAL]. [DETECT-MULTI-GAS](https://example.org) Keep [ordinary text] and [research](https://example.org).';
 await f.chat.complete({answer,sources:[{id:'UNDERSTAND-3',title:'Flame shape'}]},f.chat.begin('Explain'));
 for(const view of [f,fixture({local:f.local})]){
  const text=visibleText(view.output);
  assert.doesNotMatch(text,/UNDERSTAND-3|detect-2|DETECT-OPTICAL|DETECT-MULTI-GAS/);
  assert.match(text,/Flame shape/);assert.match(text,/\[ordinary text\]/);
  assert(view.walk(view.output).some(n=>n.tagName==='STRONG'&&n.textContent==='Flames'));
  assert(view.walk(view.output).some(n=>n.tagName==='A'&&n.textContent==='research'));
  assert.match(view.chat.history().at(-1).content,/UNDERSTAND-3/);
 }
 assert.equal(f.chat.displayAnswer('Evidence [CUSTOM-1].',[{id:'CUSTOM-1'}]),'Evidence.');
});
test('action updates preserve transcript nodes and chat reading position while scrolling the page',async()=>{
 const f=fixture();await f.chat.complete({answer:'An explanation.'},f.chat.begin('Explain'));
 f.node('agent-panel').hidden=false;f.output.scrollHeight=1400;f.output.scrollTop=315;
 const transcript=f.output.querySelector('.chat-transcript'),article=transcript.lastElementChild;
 f.chat.execute([{type:'scroll',section:'shape'}]);
 assert(f.node('shape').scrolled);assert.equal(f.output.scrollTop,315);assert.equal(transcript.lastElementChild,article);
 f.chat.report('Updated again.');assert.equal(f.output.scrollTop,315);
 assert.equal(article.children.filter(n=>n.className==='chat-action-status').length,1);
});
test('navigation and reopening restore chat position, including following the bottom',async()=>{
 const f=fixture();await f.chat.complete({answer:'An explanation.'},f.chat.begin('Explain'));
 f.node('agent-panel').hidden=false;f.output.scrollHeight=1400;f.output.scrollTop=315;
 f.chat.execute([{type:'navigate',page:'detect'}]);
 const restored=fixture({page:'detect',local:f.local,session:f.session});restored.output.scrollHeight=1400;
 restored.events.DOMContentLoaded();flushFrames(restored);
 assert.equal(restored.output.scrollTop,315);assert.equal(restored.node('agent-panel').hidden,false);
 restored.node('agent-toggle').click();restored.output.scrollTop=0;restored.node('agent-toggle').click();flushFrames(restored);
 assert.equal(restored.output.scrollTop,315);
 restored.output.scrollTop=1200;restored.output.dispatchEvent({type:'scroll'});
 restored.output.scrollHeight=1600;restored.chat.restoreScroll();flushFrames(restored);
 assert.equal(restored.output.scrollTop,1600);
});
test('typewriter strips citations before revealing individual characters',async()=>{
 const f=fixture({reduced:false});const pending=f.chat.complete({answer:'A [UNDERSTAND-3] flame [DETECT-2].'},f.chat.begin('Explain'));
 flushFrames(f);
 f.walk(f.output).find(n=>n.textContent==='Show full answer').click();await pending;
 assert.doesNotMatch(visibleText(f.output),/UNDERSTAND-3|DETECT-2/);
});

test('guided text and commands alternate, slider input events reach the selected value, and buttons click',async()=>{
 const f=fixture({page:'detect'}),slider=f.node('airflow');slider.type='range';slider.value='0';let observed=false;
 slider.addEventListener('input',()=>{const text=visibleText(f.output);assert.match(text,/First change/);assert.doesNotMatch(text,/Now observe/);observed=true;});
 let clicked=0;f.node('pause').addEventListener('click',()=>clicked++);
 const result=await f.chat.complete({steps:[{text:'First change',actions:[{type:'set',field:'airflow',value:65}]},{text:'Now observe',actions:[{type:'click',button:'pause'}]},{text:'Finished explanation',actions:[]}]},f.chat.begin('Demonstrate'),{apply:true});
 assert(result);assert(observed);assert.equal(slider.value,65);assert.equal(clicked,1);assert.match(visibleText(f.output),/Finished explanation/);assert.equal(f.chat.running,false);
});
test('invalid later commands reject the entire guided plan before earlier commands can run',async()=>{
 const f=fixture();const result=await f.chat.complete({steps:[{text:'Start',actions:[{type:'set',field:'stage',value:1}]},{text:'Invalid',actions:[{type:'click',button:'agent-send'}]}]},f.chat.begin('Show'),{apply:true});
 assert.equal(result,false);assert.equal(f.node('flame-stage').value,undefined);
});
test('stop cancels pending typing and actions without revealing future paragraphs',async()=>{
 const f=fixture({reduced:false});const pending=f.chat.complete({steps:[{text:'Before the change',actions:[{type:'set',field:'stage',value:3}]},{text:'Future observation',actions:[]}]},f.chat.begin('Show'),{apply:true});
 flushFrames(f);assert(f.chat.running);f.chat.stopWalkthrough('Stopped.');assert.equal(await pending,false);
 assert.equal(f.node('flame-stage').value,undefined);assert.doesNotMatch(visibleText(f.output),/Future observation/);assert.equal(f.frames.size,0);
});
test('guided navigation resumes remaining text and commands once on the destination page',async()=>{
 const f=fixture();await f.chat.complete({steps:[{text:'Opening detection',actions:[{type:'navigate',page:'detect'}]},{text:'Change airflow',actions:[{type:'set',field:'airflow',value:65}]},{text:'Observe the smoke path',actions:[]}]},f.chat.begin('Show'),{apply:true});
 assert.equal(f.destination,'detect.html');assert.doesNotMatch(visibleText(f.output),/Observe the smoke path/);
 const dest=fixture({page:'detect',local:f.local,session:f.session});dest.node('airflow').type='range';dest.node('airflow').value=0;
 dest.events.DOMContentLoaded();for(let i=0;i<30;i++)await Promise.resolve();
 assert.equal(dest.node('airflow').value,65);assert.match(visibleText(dest.output),/Observe the smoke path/);assert(!f.session.has('7oaks:assistant-navigation:v1'));
 const reload=fixture({page:'detect',local:f.local,session:f.session});reload.events.DOMContentLoaded();assert.equal(reload.node('airflow').value,undefined);
});
test('manual user input interrupts a walkthrough but synthetic command events do not',async()=>{
 const f=fixture({reduced:false});const pending=f.chat.complete({steps:[{text:'Before',actions:[{type:'set',field:'stage',value:3}]}]},f.chat.begin('Show'),{apply:true});
 f.events.input({isTrusted:false,target:{id:'flame-stage'}});assert(f.chat.running);
 f.events.input({isTrusted:true,target:{id:'flame-stage'}});assert.equal(await pending,false);assert.equal(f.chat.running,false);
});
