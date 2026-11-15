(() => {
 'use strict';
 const $=id=>document.getElementById(id),contract=window.AssistantActions;
 const output=document.querySelector('.agent-output');if(!output||!contract)return;
 const page=contract.normalPage(document.body.dataset.researchPage||'home');
 const key='7oaks:conversation:v1',pendingKey='7oaks:assistant-navigation:v1',scrollKey='7oaks:chat-scroll:v1';
 let messages=[],storage=true,finishTyping=null,generation=0;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function normalise(items){return (Array.isArray(items)?items:[]).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-40).map(m=>({role:m.role,content:m.content.slice(0,12000),page:typeof m.page==='string'?m.page:'unknown',actions:contract.clean(m.actions,m.page),sources:Array.isArray(m.sources)?m.sources.filter(s=>typeof s?.id==='string'&&typeof s?.title==='string').slice(0,20).map(s=>({id:s.id,title:s.title,...(typeof s.url==='string'&&/^https:\/\//i.test(s.url)?{url:s.url}:{}),...(typeof s.checkedOn==='string'?{checkedOn:s.checkedOn}:{})})):[],steps:contract.cleanSteps(m.steps,m.page)||undefined,revealed:typeof m.revealed==='string'?m.revealed.slice(0,12000):undefined,status:typeof m.status==='string'?m.status.slice(0,1000):''}));}
 try{messages=normalise(JSON.parse(localStorage.getItem(key)));}catch{storage=false;}
 function save(){try{localStorage.setItem(key,JSON.stringify(messages));storage=true;}catch{storage=false;}repeat.disabled=!lastPlan();storageNote.textContent=storage?'Conversation saved in this browser. Recent messages are sent with your next question.':'Browser storage unavailable. This conversation lasts for this page visit.';}
 // Citation IDs remain available for evidence matching, but never enter visible chat.
 function displayAnswer(text,sources=[]){
  const known=new Set(sources.map(source=>String(source.id).toLowerCase()));
  return text.replace(/[ \t]*\[([^\]\n]+)\](?:\([^\s)]+\))?/g,(match,body)=>{
   const tokens=body.split(/[,;\s]+/).filter(Boolean);
   return tokens.length&&tokens.every(token=>known.has(token.toLowerCase())||/^(?:(?:understand|prevent|detect|suppress|applications|experiments|nasa|bass|flex)(?:-[a-z0-9]+)+|smoke)$/i.test(token))?'':match;
  });
 }
 let restoringScroll=false;
 function rememberScroll(){
  if(restoringScroll||$('agent-panel').hidden||!output.clientHeight)return;
  try{sessionStorage.setItem(scrollKey,JSON.stringify({top:output.scrollTop,bottom:output.scrollHeight-output.scrollTop-output.clientHeight<24}));}catch{}
 }
 function restoreScroll(){
  let saved;try{saved=JSON.parse(sessionStorage.getItem(scrollKey));}catch{}
  if($('agent-panel').hidden)return;
  restoringScroll=true;
  const apply=()=>{output.scrollTop=saved?.bottom||!saved?output.scrollHeight:Math.max(0,Number(saved.top)||0);};
  apply();requestAnimationFrame(()=>{apply();restoringScroll=false;});
 }
 output.addEventListener('scroll',rememberScroll);
 window.addEventListener?.('pagehide',rememberScroll);
 // Markdown is built with DOM nodes. Model HTML, attributes and scripts are never evaluated.
 function inline(parent,text){const re=/(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*\n]+)\*|_([^_\n]+)_|\[([^\]]+)\]\(([^\s)]+)\))/g;let last=0;for(const m of text.matchAll(re)){parent.append(document.createTextNode(text.slice(last,m.index)));if(m[2]||m[3])parent.append(node('strong',m[2]||m[3]));else if(m[4])parent.append(node('code',m[4]));else if(m[5]||m[6])parent.append(node('em',m[5]||m[6]));else if(/^https?:\/\//i.test(m[8])){const a=node('a',m[7]);a.href=m[8];a.target='_blank';a.rel='noopener noreferrer';parent.append(a);}else parent.append(document.createTextNode(m[7]));last=m.index+m[0].length;}parent.append(document.createTextNode(text.slice(last)));}
 function markdown(target,text){target.replaceChildren();let list=null,code=null;for(const line of text.split('\n')){if(/^```/.test(line)){if(code)code=null;else{const pre=node('pre');code=node('code');pre.append(code);target.append(pre);}list=null;continue;}if(code){code.textContent+=line+'\n';continue;}if(!line.trim()){list=null;continue;}const item=line.match(/^\s*(?:([-*])\s+|\d+[.)]\s+)(.*)$/);if(item){const type=item[1]?'ul':'ol';if(!list||list.tagName.toLowerCase()!==type){list=node(type);target.append(list);}const li=node('li');inline(li,item[2]);list.append(li);continue;}list=null;const heading=line.match(/^#{1,6}\s+(.+)/),p=node(heading?'h4':'p');inline(p,heading?heading[1]:line);target.append(p);}}
 const toolbar=node('div',undefined,'chat-toolbar'),clear=node('button','Clear conversation'),repeat=node('button','Repeat last action'),skip=node('button','Show full answer');clear.type=repeat.type=skip.type='button';skip.hidden=true;toolbar.append(clear,repeat,skip);
 const storageNote=node('p',undefined,'chat-storage');const transcript=node('div',undefined,'chat-transcript');transcript.setAttribute('aria-label','Conversation');
 output.prepend(toolbar,storageNote,transcript);
 function renderMessage(m){const article=node('article',undefined,`chat-message chat-${m.role}`);article.append(node('div',`${m.role==='user'?'You':'7oaks'} · ${m.page}`,'chat-message-label'));const body=node('div',undefined,'chat-message-body');markdown(body,m.role==='assistant'?displayAnswer(m.revealed??m.content,m.sources):m.content);article.append(body);if(m.sources?.length){const sources=node('ul',undefined,'chat-sources');for(const s of m.sources){const item=node('li');if(s.url){const link=node('a',s.title);link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';item.append(link);}else item.textContent=s.title;sources.append(item);}article.append(sources);}if(m.role==='assistant'&&!m.sources?.length)article.append(node('p','No supporting source references were returned; this answer is unverified.','chat-source-warning'));if(m.status)article.append(node('p',m.status,'chat-action-status'));transcript.append(article);return body;}
 function render(){const top=output.scrollTop;transcript.replaceChildren();messages.forEach(renderMessage);output.scrollTop=top;}
 function follow(){output.scrollTop=output.scrollHeight;rememberScroll();}
 render();save();
 clear.addEventListener('click',()=>{stopWalkthrough();generation++;finishTyping?.();messages=[];save();render();try{sessionStorage.removeItem(pendingKey);sessionStorage.removeItem(scrollKey);}catch{}follow();$('ai-status').textContent='Conversation cleared.';});
 repeat.addEventListener('click',()=>tryRepeat('repeat the last action'));
 skip.addEventListener('click',()=>finishTyping?.());
 function history(){let size=0;const out=[];for(const m of messages.slice(-12).reverse()){if(size+m.content.length>24000)break;size+=m.content.length;out.unshift({role:m.role,content:m.content,page:m.page,actions:m.actions||[],status:m.status||''});}return out;}
 function begin(question){stopWalkthrough();finishTyping?.();const previous=history();messages.push({role:'user',content:question,page,sources:[]});messages=messages.slice(-40);save();render();$('question').value='';$('ai-result').hidden=true;follow();return {history:previous,generation};}
 async function complete(data,ticket,options={}){if(ticket.generation!==generation)return false;if(data.steps)return completeGuided(data,ticket,options);const m={role:'assistant',content:String(data.answer||''),page,actions:contract.clean(data.actions,page),sources:normalise([{role:'assistant',content:'',sources:data.sources}])[0].sources,status:''};messages.push(m);messages=messages.slice(-40);save();render();if(options.apply){if(execute(m.actions))return true;}const body=transcript.lastElementChild.querySelector('.chat-message-body');$('ai-result').hidden=true;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const visibleAnswer=displayAnswer(m.content,m.sources),characters=Array.from(visibleAnswer);let start=null,frame=0;skip.hidden=false;transcript.setAttribute('aria-busy','true');await new Promise(resolve=>{const done=()=>{cancelAnimationFrame(frame);markdown(body,visibleAnswer);finishTyping=null;skip.hidden=true;transcript.setAttribute('aria-busy','false');resolve();};finishTyping=done;function tick(now){if(start===null)start=now;const count=Math.min(characters.length,Math.floor((now-start)/9)+1);const nearBottom=output.scrollHeight-output.scrollTop-output.clientHeight<90;markdown(body,characters.slice(0,count).join(''));if(nearBottom)follow();if(count===characters.length)done();else frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);});}
  return ticket.generation===generation;
 }
 function report(text){
  const top=output.scrollTop,last=messages.at(-1);
  if(last?.role==='assistant'){
   last.status=text;save();const article=transcript.lastElementChild;
   let status=article?.querySelector('.chat-action-status');
   if(status)status.textContent=text;else article?.append(node('p',text,'chat-action-status'));
  }
  $('agent-actions').textContent=text;output.scrollTop=top;rememberScroll();
 }
 function setControl(action){const {field,value}=action;if(!contract.valid(page,field,value))return false;
  if(['scene','front','stage','engine','method'].includes(field)){const button=[...document.querySelectorAll(`[data-${field}]`)].find(n=>n.dataset[field]===String(value));if(button){const same=button.getAttribute?.(field==='method'?'aria-selected':'aria-pressed')==='true';button.click();return same?'unchanged':true;}}
  const ids={enhance:'enhance-cool',formation:'soot-formation',oxidation:'soot-oxidation',showFlow:'show-flow'};
  const control=$(ids[field]||field);if(!control)return false;const same=typeof value==='boolean'?control.checked===value:String(control.value)===String(value);if(typeof value==='boolean')control.checked=value;else control.value=value;
  control.dispatchEvent(new Event(['enhance','formation','oxidation'].includes(field)?'change':'input',{bubbles:true}));return same?'unchanged':true;
 }
 function execute(actions){const safe=contract.clean(actions,page),done=[];
  for(let i=0;i<safe.length;i++){const a=safe[i];if(a.type==='navigate'){
    if(a.page===page)continue;
    try{if(!storage)throw Error('storage');sessionStorage.setItem(pendingKey,JSON.stringify({page:a.page,actions:safe.slice(i+1),created:Date.now()}));localStorage.setItem('7oaks:chat-open','true');}catch{done.push('Navigation skipped because browser storage is unavailable; conversation cannot be carried to the next page.');report(done.join(' '));return;}
    report([...done,`Opening ${a.page}.`].join(' '));rememberScroll();location.assign(contract.pages[a.page]);return true;
   }else if(a.type==='click'){const button=$(a.button);if(button&&!button.disabled&&!button.hidden){button.click();done.push(`Clicked ${button.textContent.trim()||a.button}.`);}else done.push(`Could not click ${a.button}.`);}
   else if(a.type==='set'){const result=setControl(a);done.push(result==='unchanged'?`${a.field} is already ${a.value}.`:result?`Set ${a.field} to ${a.value}.`:`Could not set ${a.field}.`);}
   else if(a.type==='scroll'){const target=$(a.section);if(target&&!target.hidden){target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});done.push(`Opened ${a.section}.`);}else done.push(`Section ${a.section} is not currently visible.`);}
  }
  if(done.length)report(done.join(' '));return false;
 }

 // Guided responses share one cancellable player. Only explicit navigation can
 // resume a pending plan; loading conversation history never executes commands.
 let playback=null;
 const stopButton=node('button','Stop walkthrough');stopButton.type='button';stopButton.hidden=true;toolbar.append(stopButton);
 stopButton.addEventListener('click',()=>stopWalkthrough('Walkthrough stopped. You can use the controls yourself.'));
 document.addEventListener('input',event=>{if(event.isTrusted&&event.target?.id!=='question')stopWalkthrough('Walkthrough stopped because you changed a control.');},true);
 document.addEventListener('click',event=>{if(event.isTrusted&&event.target?.closest?.('main button, main a'))stopWalkthrough('Walkthrough stopped because you used the page.');},true);
 function stopWalkthrough(message){
  if(!playback)return;
  const run=playback;run.cancelled=true;run.finish?.();run.release?.();playback=null;stopButton.hidden=true;skip.hidden=true;skip.textContent='Show full answer';
  try{sessionStorage.removeItem(pendingKey);}catch{}
  save();if(message)report(message);
 }
 function frameFor(run,duration,update){
  if(run.cancelled)return Promise.resolve();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){update(1);return Promise.resolve();}
  return new Promise(resolve=>{
   let start=null,id;
   const finish=()=>{cancelAnimationFrame(id);run.finish=null;resolve();};run.finish=finish;
   const tick=now=>{if(run.cancelled)return finish();if(start===null)start=now;
    const p=Math.min(1,(now-start)/duration);update(p);if(p===1)finish();else id=requestAnimationFrame(tick);
   };id=requestAnimationFrame(tick);
  });
 }
 function controlFor(action){
  if(action.type==='click')return $(action.button);
  if(action.type==='scroll')return $(action.section);
  if(action.type!=='set')return null;
  if(['scene','front','engine','method'].includes(action.field))return [...document.querySelectorAll(`[data-${action.field}]`)].find(n=>n.dataset[action.field]===String(action.value));
  return $(({stage:'flame-stage',enhance:'enhance-cool',formation:'soot-formation',oxidation:'soot-oxidation',showFlow:'show-flow'})[action.field]||action.field);
 }
 async function guidedAction(action,run){
  const target=controlFor(action);
  if(!target||target.hidden||target.disabled){report('Walkthrough stopped: the requested control is unavailable.');return false;}
  target.classList?.add?.('assistant-active-control');
  target.scrollIntoView?.({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
  await frameFor(run,700,()=>{});
  if(run.cancelled){target.classList?.remove?.('assistant-active-control');return false;}
  if(action.type==='set'&&typeof action.value==='number'&&target.type==='range'){
   const rule=contract.controls[page][action.field],from=Number(target.value);let prior=from;
   await frameFor(run,1800,p=>{
    const ease=p*p*(3-2*p),raw=from+(action.value-from)*ease;
    const value=p===1?action.value:Number((rule.min+Math.round((raw-rule.min)/rule.step)*rule.step).toFixed(6));
    if(value!==prior){target.value=value;target.dispatchEvent(new Event('input',{bubbles:true}));prior=value;}
   });
   if(!run.cancelled)report(`Set ${action.field} to ${action.value}.`);
  }else if(action.type!=='scroll')execute([action]);
  else report(`Opened ${action.section}.`);
  if(action.type!=='scroll'&&!matchMedia('(prefers-reduced-motion: reduce)').matches){target.closest?.('section')?.querySelector('svg,canvas')?.animate?.([{opacity:.5},{opacity:1}],{duration:850,easing:'ease-out'});}
  // Slow the authored CSS motion while the reader observes the new state.
  const animations=matchMedia('(prefers-reduced-motion: reduce)').matches?[]:(document.querySelector('main')?.getAnimations?.({subtree:true})||[]).filter(a=>a.effect?.getTiming?.().iterations===Infinity);
  const rates=animations.map(a=>a.playbackRate);animations.forEach(a=>a.playbackRate=.6);
  run.release=()=>{animations.forEach((a,i)=>a.playbackRate=rates[i]);target.classList?.remove?.('assistant-active-control');};
  await frameFor(run,action.type==='scroll'?350:1800,()=>{});run.release();run.release=null;
  return !run.cancelled;
 }
 async function runSteps(m,body,steps){
  stopWalkthrough();const run={cancelled:false};playback=run;stopButton.hidden=false;
  let shown=m.revealed||'';
  try{
   for(let i=0;i<steps.length;i++){
    if(run.cancelled)return false;
    const step=steps[i],prefix=shown+(shown&&step.text?'\n\n':''),text=displayAnswer(step.text,m.sources),chars=Array.from(text);
    skip.textContent='Show this step';skip.hidden=false;
    let skipped=false;finishTyping=()=>{skipped=true;};
    await frameFor(run,Math.max(1,chars.length*12),p=>{
     const top=output.scrollTop,near=output.scrollHeight-top-output.clientHeight<90;
     m.revealed=prefix+chars.slice(0,skipped?chars.length:Math.ceil(p*chars.length)).join('');markdown(body,m.revealed);
     if(near)follow();else output.scrollTop=top;
     if(skipped)run.finish?.();
    });
    finishTyping=null;skip.hidden=true;
    if(run.cancelled)return false;
    shown=prefix+text;m.revealed=shown;markdown(body,shown);save();
    for(let j=0;j<step.actions.length;j++){
     if(run.cancelled)return false;
     const action=step.actions[j];
     if(action.type==='navigate'&&action.page!==page){
      const remaining=[{text:'',actions:step.actions.slice(j+1)},...steps.slice(i+1)].filter(s=>s.text||s.actions.length);
      try{
       if(!storage)throw Error('storage');
       sessionStorage.setItem(pendingKey,JSON.stringify({page:action.page,steps:remaining,created:Date.now()}));
       localStorage.setItem('7oaks:chat-open','true');
      }catch{report('Navigation stopped because browser storage is unavailable.');return false;}
      report(`Opening ${action.page}.`);rememberScroll();location.assign(contract.pages[action.page]);return true;
     }
     if(action.type!=='navigate'&&!await guidedAction(action,run))return false;
    }
   }
   report('Walkthrough complete.');return true;
  }finally{
   run.release?.();if(playback===run){playback=null;stopButton.hidden=true;skip.hidden=true;skip.textContent='Show full answer';finishTyping=null;}
  }
 }
 async function completeGuided(data,ticket,options){
  const steps=contract.cleanSteps(data.steps,page);
  if(!steps){$('ai-status').textContent='The assistant returned an unsupported walkthrough. No controls were changed.';return false;}
  const m={role:'assistant',content:steps.map(s=>s.text).join('\n\n'),page,steps,actions:steps.flatMap(s=>s.actions),sources:normalise([{role:'assistant',content:'',sources:data.sources}])[0].sources,status:'',revealed:''};
  messages.push(m);messages=messages.slice(-40);save();const body=renderMessage(m);$('ai-result').hidden=true;
  if(!options.apply){m.revealed=m.content;markdown(body,displayAnswer(m.content,m.sources));report('Your selection changed; walkthrough actions were skipped.');return true;}
  return await runSteps(m,body,steps)&&ticket.generation===generation;
 }
 function lastPlan(){return [...messages].reverse().find(m=>m.role==='assistant'&&m.actions?.length);}
 async function tryRepeat(question){
  if(!/^(?:(?:can|could|would) you |please )?(?:repeat|redo|replay)(?: (?:your|the|its|my))? (?:last|previous) (?:action|actions|command|commands|step|steps|demonstration)(?: again)?[.!?]*$/i.test(question.trim()))return false;
  const prior=lastPlan();
  if(!prior){$('ai-status').textContent='The earlier conversation did not save action commands. Please name the change once (for example, “show near-limit flamelets”); I can repeat it after that.';return true;}
  if(prior.steps&&prior.page===page){const ticket=begin(question);await complete({steps:prior.steps,sources:prior.sources},ticket,{apply:true});return true;}
  let actions=contract.clean(prior.actions,prior.page);
  if(prior.page!==page){
   const nav=actions.findIndex(a=>a.type==='navigate');
   if(nav>=0)actions=actions.slice(nav);
   else actions=[{type:'navigate',page:prior.page},...actions];
  }
  const ticket=begin(question);
  await complete({answer:'Repeating the saved demonstration commands. The result below reports what the page applied.',actions,sources:prior.sources},ticket,{apply:true});
  $('ai-status').textContent='Repeated the saved commands locally; no new model interpretation was needed.';
  return true;
 }
 window.AssistantChat={begin,complete,execute,report,history,markdown,normalise,tryRepeat,displayAnswer,rememberScroll,restoreScroll,stopWalkthrough,get running(){return Boolean(playback);}};
 document.addEventListener('DOMContentLoaded',()=>{
  let open=false;try{open=localStorage.getItem('7oaks:chat-open')==='true';}catch{}
  if(open&&$('agent-panel').hidden)$('agent-toggle').click();
  $('agent-toggle').addEventListener('click',()=>{if(!$('agent-panel').hidden)restoreScroll();try{localStorage.setItem('7oaks:chat-open',String(!$('agent-panel').hidden));}catch{}});
  $('agent-close').addEventListener('click',()=>{try{localStorage.setItem('7oaks:chat-open','false');}catch{}});
  restoreScroll();
  try{const pending=JSON.parse(sessionStorage.getItem(pendingKey));sessionStorage.removeItem(pendingKey);if(pending?.page===page&&Number.isFinite(pending.created)&&Date.now()-pending.created>=0&&Date.now()-pending.created<120000){if(Array.isArray(pending.steps)){const steps=pending.steps.length?contract.cleanSteps(pending.steps,page):[];const m=messages.at(-1);if(steps&&m?.role==='assistant'){if(steps.length)runSteps(m,transcript.lastElementChild.querySelector('.chat-message-body'),steps).catch(()=>report('Walkthrough interrupted. Please try again.'));else report(`Opened ${page}.`);}}else{execute(pending.actions);if(!pending.actions?.length)report(`Opened ${page}.`);}if($('agent-panel').hidden)$('agent-toggle').click();}}catch{}
 });
})();
