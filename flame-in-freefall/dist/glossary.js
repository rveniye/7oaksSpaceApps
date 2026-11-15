(() => {
 const terms=new Map();
 for(const entries of Object.values(window.ResearchDefinitions||{}))for(const [term,definition] of entries)terms.set(term.replace(/ \(.+\)$/,'').split(' / ')[0],definition);
 for(const block of document.querySelectorAll('.inline-definitions')){for(const item of block.querySelectorAll('div'))terms.set(item.querySelector('dt').textContent,item.querySelector('dd').textContent);block.hidden=true;}
 for(const block of document.querySelectorAll('.definitions dl')){for(const dt of block.querySelectorAll('dt'))terms.set(dt.textContent,dt.nextElementSibling.textContent);block.closest('details').hidden=true;}
 terms.set('photodetector','A component that converts received light into an electrical signal.');
 const popup=document.createElement('div');popup.id='term-explanation';popup.className='term-explanation';popup.setAttribute('role','tooltip');popup.hidden=true;document.body.append(popup);
 let timer,active;
 function close(){clearTimeout(timer);popup.hidden=true;if(active){active.removeAttribute('aria-describedby');active.setAttribute('aria-expanded','false');}active=null;}
 function show(button){close();active=button;popup.textContent=terms.get(button.dataset.term);popup.hidden=false;button.setAttribute('aria-describedby',popup.id);button.setAttribute('aria-expanded','true');const r=button.getBoundingClientRect(),p=popup.getBoundingClientRect();popup.style.left=Math.max(12,Math.min(r.left,innerWidth-p.width-12))+'px';popup.style.top=(r.bottom+p.height+16<innerHeight?r.bottom+8:Math.max(12,r.top-p.height-8))+'px';}
 function attach(button){button.addEventListener('mouseenter',()=>{clearTimeout(timer);timer=setTimeout(()=>show(button),1000);});button.addEventListener('mouseleave',()=>{clearTimeout(timer);timer=setTimeout(close,180);});button.addEventListener('focus',()=>{clearTimeout(timer);timer=setTimeout(()=>show(button),1000);});button.addEventListener('blur',close);button.addEventListener('click',()=>active===button?close():show(button));}
 popup.addEventListener('mouseenter',()=>clearTimeout(timer));popup.addEventListener('mouseleave',close);document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});document.addEventListener('click',e=>{if(!e.target.closest('.glossary-term')&&!popup.contains(e.target))close();});window.addEventListener('scroll',close,{passive:true});window.addEventListener('resize',close);
 const keys=[...terms.keys()].sort((a,b)=>b.length-a.length),pattern=new RegExp('\\b('+keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
 function decorate(root){
  // Rebuild in document order so changed tabs and captions still have one link per term.
  for(const button of root.querySelectorAll('.glossary-term'))button.replaceWith(document.createTextNode(button.textContent));
  root.normalize();
  const seen=new Set();
  for(const el of root.querySelectorAll('p,li,dd')){
   if(el.closest('button,a,svg,.definitions,.inline-definitions,#ai-result,#agent,#method-definitions'))continue;
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
   while(walker.nextNode())if(!walker.currentNode.parentElement.closest('button,a,svg'))nodes.push(walker.currentNode);
   for(const node of nodes){
    const matches=[...node.textContent.matchAll(pattern)];if(!matches.length)continue;
    const frag=document.createDocumentFragment();let offset=0;
    for(const m of matches){
     const term=keys.find(k=>k.toLowerCase()===m[0].toLowerCase());
     if(seen.has(term))continue;
     seen.add(term);frag.append(node.textContent.slice(offset,m.index));
     const button=document.createElement('button');button.type='button';button.className='glossary-term';button.textContent=m[0];button.dataset.term=term;button.setAttribute('aria-expanded','false');attach(button);frag.append(button);offset=m.index+m[0].length;
    }
    if(offset){frag.append(node.textContent.slice(offset));node.replaceWith(frag);}
   }
  }
 }
 let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;observer.disconnect();if(active&&!active.isConnected)close();decorate(document.querySelector('main'));observe();});});
 function observe(){observer.observe(document.querySelector('main'),{childList:true,subtree:true});}
 decorate(document.querySelector('main'));observe();
})();
