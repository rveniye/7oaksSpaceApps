(() => {
 'use strict';
 const main=document.querySelector('main');if(!main)return;
 const terms=new Map();
 const add=(term,description,extra={})=>terms.set(term.toLowerCase(),{term,description,...extra});
 for(const entries of Object.values(window.ResearchDefinitions||{}))for(const [term,description] of entries){
  add(term.replace(/ \(.+\)$/,''),description);
  const alias=term.match(/\(([^)]+)\)$/)?.[1];if(alias)add(alias,description);
  if(term.includes(' / '))for(const alias of term.split(' / '))add(alias,description);
 }
 for(const block of main.querySelectorAll('.inline-definitions,.definitions dl'))for(const dt of block.querySelectorAll('dt'))if(dt.nextElementSibling)add(dt.textContent,dt.nextElementSibling.textContent);
 // Existing page definitions, shared so terms also work away from Detect.
 for(const [term,description] of Object.entries({
  'activation energy':'A parameter describing how strongly a reaction rate constant depends on temperature in the Arrhenius equation.',
  'pre-exponential factor':'The multiplier A in the Arrhenius equation. Its units are the same as those of the reaction rate constant.',
  'free radicals':'Atoms or molecules containing an unpaired electron. They can take part in reaction chains.',
  'chain branching':'A reaction step that produces more reactive chain carriers than it consumes.',
  'thermal runaway':'A feedback process in which heat generation outpaces heat removal and rising temperature can accelerate further heat generation.',
  'VOCs':'Volatile organic compounds: organic substances that can enter the gas phase. Their presence alone does not establish a fire.',
  'residence time':'The time that reacting gases spend in the region where reactions occur.',
  'mass fraction':'The mass of one component divided by the total mass of a mixture.',
  'mole fractions':'The amount of each component, counted in moles, divided by the total amount in the mixture.',
  'flame sheet':'An idealised thin surface where fuel and oxidiser react in a simplified flame model.',
  microgravity:'A condition of near weightlessness, such as continuous free fall aboard an orbiting spacecraft. Gravity has not disappeared.',
  buoyancy:'The force caused by differences in density within a fluid. On Earth, hot gases tend to rise because they are less dense than the surrounding air.',
  diffusion:'The spreading and mixing of molecules through their random motion. Oxygen can reach a flame this way even without a directed airflow.',
  convection:'Transport of heat by moving gas or liquid. The movement may come from buoyancy or be driven by a fan or pump.',
  ventilation:'The movement of air through a space. It can carry heat, oxygen and smoke.',
  flammability:'How readily a material can ignite and keep burning under particular conditions.',
  ignition:'The start of a self-sustaining combustion reaction.',
  extinction:'The point at which a flame can no longer sustain itself. Disappearance of a visible hot flame does not always mean every reaction has stopped.',
  combustion:'A chemical reaction between a fuel and an oxidiser, such as oxygen, that releases heat.',
  pyrolysis:'Chemical decomposition caused by heating. It can release fuel vapour before a visible flame appears.',
  'thermal decomposition':'The breakdown of a substance into other substances when it is heated.',
  'cool flames':'Lower-temperature combustion that can produce very little visible light. It requires suitable fuel chemistry and conditions.',
  'cool flame':'Lower-temperature combustion that can produce very little visible light. It requires suitable fuel chemistry and conditions.',
  flamelets:'Small, separated flames that may remain when a broad flame front weakens.',
  'flame front':'The region where fuel reacts as a flame spreads.',
  soot:'Carbon-rich particles formed during incomplete combustion. Some can be consumed by further reactions before leaving the flame.',
  oxidation:'A chemical reaction with an oxidiser, often oxygen. In the soot illustration, it consumes some of the soot particles.',
  aerosol:'Solid particles or liquid droplets suspended in a gas. Smoke and dust are aerosols.',
  aerosols:'Solid particles or liquid droplets suspended in a gas. Smoke and dust are aerosols.',
  calibration:'Relating an instrument signal to a known reference under specified conditions.',
  photodetector:'A component that converts received light into an electrical signal.',
  scattering:'Light being redirected by particles. An optical smoke detector measures this redirected light.',
  'transport delay':'The time taken for smoke to reach a sampling point, separate from the sensor’s response once smoke arrives.',
  'ionic wind':'Gas motion produced when electrically driven ions transfer momentum to surrounding gas molecules.',
  ions:'Atoms or molecules that carry an electrical charge.',
  diluent:'A gas added to reduce the concentration of other components in a mixture.',
  dilution:'Adding another substance to reduce the concentration of a component in a mixture.',
  'partial gravity':'Gravity levels between near weightlessness and normal Earth gravity, such as at the lunar or Martian surface.',
  'non-premixed':'Fuel and oxidiser are supplied separately and mix while reacting.',
  'heat transfer':'Movement of thermal energy from one place or substance to another.',
  'heat release':'Thermal energy produced by a chemical reaction.',
  'fuel vapour':'Fuel in its gaseous form, rather than as a liquid or solid.',
  'radiative heat loss':'Energy leaving a hot object or gas as electromagnetic radiation.',
  'limiting oxygen index':'A measure of the minimum oxygen fraction that supports sustained burning under a specified test method and set of conditions.',
  'oxygen concentration':'The amount of oxygen in a gas mixture. Its effect on burning also depends on pressure and other conditions.',
  'HCCI':'Homogeneous charge compression ignition: an engine concept in which a mixed fuel–air charge ignites through compression heating.',
  'PSI':'NASA’s Physical Sciences Informatics repository, which provides access to physical-science investigation information and data.',
  'CIR':'Combustion Integrated Rack: an experimental facility aboard the International Space Station.',
  'MSG':'Microgravity Science Glovebox: an enclosed workspace aboard the International Space Station.'
 }))if(!terms.has(term.toLowerCase()))add(term,description);
 const known=['SoFIE','ACME','FLEX','FLEX-2','FIRES','BASS','BASS-II','Saffire','Saffire-I','Saffire-II','Saffire-III','SAME','SAME-R','CFI','CFI-G','BRE','E-FIELD Flames','Flame Design','SPICE','SLICE','DAFT','DAFT-2'];
 for(const term of known)add(term,'A description for this investigation has not been added yet.',{experiment:true,missing:true});
 for(const entry of window.ExperimentDefinitions||[])add(entry.term,entry.description||'A description for this investigation has not been added yet.',{experiment:true,draft:entry.draft,missing:!entry.description});
 for(const [key,entry] of terms)if(entry.missing)terms.delete(key);
 const popup=document.createElement('div');popup.id='term-explanation';popup.className='term-explanation';popup.setAttribute('role','tooltip');popup.hidden=true;document.body.append(popup);
 let showTimer,hideTimer,active;
 function close(){clearTimeout(showTimer);clearTimeout(hideTimer);popup.hidden=true;if(active){active.removeAttribute('aria-describedby');active.setAttribute('aria-expanded','false');}active=null;}
 function position(){if(!active)return;const r=active.getBoundingClientRect(),p=popup.getBoundingClientRect();popup.style.left=Math.max(12,Math.min(r.left,innerWidth-p.width-12))+'px';popup.style.top=(r.bottom+p.height+16<innerHeight?r.bottom+8:Math.max(12,r.top-p.height-8))+'px';}
 function show(button){close();if(!button.isConnected)return;active=button;const entry=terms.get(button.dataset.term);const title=document.createElement('strong'),body=document.createElement('p');title.textContent=entry.term;body.textContent=entry.description;popup.replaceChildren(title,body);
  if(entry.experiment){const note=document.createElement('small');note.textContent=entry.missing?'Experiment description pending.':entry.draft?'Draft experiment description.':'Experiment description';popup.append(note);}
  popup.hidden=false;button.setAttribute('aria-describedby',popup.id);button.setAttribute('aria-expanded','true');position();
 }
 const schedule=button=>{close();showTimer=setTimeout(()=>show(button),1000);};
 function attach(button){
  button.addEventListener('mouseenter',()=>schedule(button));
  button.addEventListener('mouseleave',()=>{clearTimeout(showTimer);hideTimer=setTimeout(close,220);});
  button.addEventListener('focus',()=>schedule(button));button.addEventListener('blur',close);
  button.addEventListener('click',()=>active===button?close():show(button));
 }
 popup.addEventListener('mouseenter',()=>clearTimeout(hideTimer));popup.addEventListener('mouseleave',close);
 document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 document.addEventListener('click',event=>{if(!event.target.closest('.glossary-term')&&!popup.contains(event.target))close();});
 window.addEventListener('scroll',event=>{if(!active||popup.contains(event.target))return;const r=active.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)close();else position();},{passive:true,capture:true});window.addEventListener('resize',close);
 const escape=text=>text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=new RegExp('(?<![\\w-])('+[...terms.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')+')(?![\\w-])','gi');
 const excluded='button,a,svg,canvas,script,style,input,textarea,select,option,label,summary,code,pre,[hidden],.definitions,.inline-definitions,#method-definitions,#research-sources';
 function decorate(){
  const walker=document.createTreeWalker(main,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement?.closest('p,li,dd,td,h2,h3,h4')&&!n.parentElement.closest(excluded))nodes.push(n);}
  for(const text of nodes){const matches=[...text.textContent.matchAll(pattern)];if(!matches.length)continue;const frag=document.createDocumentFragment();let offset=0;
   for(const match of matches){frag.append(text.textContent.slice(offset,match.index));const button=document.createElement('button');button.type='button';button.className='glossary-term';button.textContent=match[0];button.dataset.term=match[0].toLowerCase();button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',match[0]+': definition');attach(button);frag.append(button);offset=match.index+match[0].length;}
   frag.append(text.textContent.slice(offset));text.replaceWith(frag);
  }
 }
 let queued=false;
 const observer=new MutationObserver(changes=>{
  if(active&&!active.isConnected)close();
  if(queued||!changes.some(change=>!change.target.parentElement?.closest('svg,canvas')&&!change.target.closest?.('svg,canvas')&&(change.type==='characterData'||change.addedNodes.length)))return;
  queued=true;queueMicrotask(()=>{queued=false;observer.disconnect();decorate();observe();});
 });
 function observe(){observer.observe(main,{childList:true,characterData:true,subtree:true});}
 decorate();observe();
})();
