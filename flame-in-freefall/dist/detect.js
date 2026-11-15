const {defaults,cleanState,flowLabel,snapshot,observation,transportEstimate}=window.DetectState;
const $=id=>document.getElementById(id),key='7oaks:detect:v1';
let state={...defaults},storage=true;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.version===1)state=cleanState(saved.state);}catch{storage=false;}
const methodSteps={"optical": ["A laser diode illuminates air inside the sampling region with near-infrared radiation.", "Particles redirect some of the light towards a photodetector positioned away from the direct beam. Forward scattering is measured at an angle below 90°.", "The photodetector converts received light into an electrical signal. Electronics compare this signal with calibrated alarm criteria."], "ionisation": ["A pump supplies a controlled air sample. The inlet flow divides into a sensing path and a bypass, favouring entry of smaller particles into the sensing path.", "Americium-241 produces ionisation inside the chamber. An electric field establishes an ion current.", "Aerosol particles attach to ions and reduce the current. Electronics evaluate the change against alarm criteria."], "multi": ["A light source illuminates the particle sample. Each photodetector receives light scattered in a different direction.", "The illustration compares a forward angle of 30° with a backward angle of 150°. These angles explain the geometry, rather than specify a particular instrument.", "The measured signals are compared. Their ratio depends on wavelength, particle composition, shape and size distribution; it is not a universal particle-size measurement."], "gas": ["A tunable laser scans selected infrared absorption features of the gas being measured.", "Gas molecules absorb some of this radiation. The detector measures the loss of light transmitted through the sample.", "Calibration relates the absorption signal to concentration, accounting for path length, temperature, pressure and interference from other gases."]};
const methods={
 optical:{title:'Laser-diode forward-scattering detection.',status:'DOCUMENTED US ISS DETECTOR PRINCIPLE',description:'NASA describes the US ISS smoke-detector design as a near-infrared, laser-diode forward-scattering system. It measures light scattered by airborne particles rather than the ion current used in the Shuttle detector. Detector response depends on the smoke properties.',measures:'Forward-scattered near-infrared light from particles in the sample.',limits:'Particle identity, toxic-gas levels or equal sensitivity to every material.',caption:'NEAR-INFRARED → FORWARD SCATTERING → SENSOR',url:'https://ntrs.nasa.gov/citations/20040053578'},
 ionisation:{title:'Brunswick incipient fire detection.',status:'HISTORICAL SPACE SHUTTLE HARDWARE',description:'The Space Shuttle used actively sampled ionisation smoke detectors made by Brunswick. A pump drew air into the instrument, and an aerodynamic separator diverted larger particles away from its sensing chamber. Small particles entering the chamber changed an electrical current, providing an early indication of possible overheating or fire.',measures:'Changes in ion current as aerosol enters the chamber.',limits:'A chemical distinction between smoke and dust, or a gas concentration.',caption:'SAMPLE → SEPARATOR → ION CURRENT',url:'https://ntrs.nasa.gov/api/citations/20080012612/downloads/20080012612.pdf'},
 multi:{title:'Multi-angle optical sensing.',status:'MULTI-ANGLE SENSING PRINCIPLE',description:'Multi-angle optical sensing compares light scattered by aerosol particles in different directions. Multiple photodetectors observe the same sample at different scattering angles. Comparing their measured intensities can help characterise the aerosol when interpreted with an appropriate scattering model and calibration.',measures:'Relative scattered-light intensities at selected angles.',limits:'A unique particle size or guaranteed false-alarm rejection.',caption:'MULTIPLE ANGLES / COMPLEMENTARY SIGNALS',url:'https://www.nist.gov/news-events/news/2018/05/nistnasa-study-shows-one-detector-doesnt-fit-all-smoke-spacecraft'},
 gas:{title:'Multi-gas monitoring.',status:'DOCUMENTED SAFFIRE RESEARCH INSTRUMENT',description:'Multi-gas monitoring measures selected gaseous compounds. A NASA/JPL record describes a Combustion Product Monitor developed for Saffire, using tunable laser absorption to measure carbon monoxide, hydrogen chloride, hydrogen cyanide, hydrogen fluoride, carbon dioxide and oxygen.',measures:'Selected gas species using calibrated absorption channels.',limits:'All possible toxic gases, or a safe-to-enter decision from this illustration.',caption:'SELECTED INFRARED FREQUENCIES → GAS ABSORPTION',url:'https://ntrs.nasa.gov/citations/20210012108'}
};
function sensorGraphic(method){
 const label=(x,y,t,fill='#ddd',size=13)=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-family="Arial, sans-serif">${t}</text>`;
 const box=(x,y,w,h,t)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#202326" stroke="#777"/>${label(x+10,y+h/2+4,t)}`;
 const arrow=(d,color='#ff9a53')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="3" marker-end="url(#signal-arrow)"/>`;
 const base=`<defs><marker id="signal-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#ff9a53"/></marker></defs><rect x="8" y="8" width="544" height="344" rx="15" fill="#101214" stroke="#333"/>`;
 const particles='<g fill="#e0d9cf"><circle cx="259" cy="160" r="8"/><circle cx="283" cy="179" r="5"/><circle cx="275" cy="139" r="4"/><circle cx="248" cy="185" r="3"/></g>';
 let drawing='';
 if(method==='optical')drawing=label(25,35,'1  Air carries smoke into the sensing chamber')+arrow('M270 52V116')+box(25,139,92,42,'IR laser')+arrow('M120 160H242')+particles+arrow('M267 167L391 228')+box(393,217,142,40,'Light sensor')+arrow('M290 160H430','#666')+label(374,145,'Direct beam','#888',12)+label(280,206,'Forward scattering','#ffab70',12)+label(215,105,'Smoke particles','#aaa',12)+label(25,279,'2  Forward scattering: less than 90° from the beam')+label(25,300,'Near-infrared is invisible; orange shows its path.','#aaa',12)+label(25,319,'3  More received light → a changed electrical signal','#ffab70',12);
 if(method==='multi')drawing=label(25,35,'Forward and backward scattering — illustrative angles')+box(20,140,88,40,'Laser')+arrow('M111 160H252')+particles+arrow('M270 160L400 85')+arrow('M270 160L140 85')+box(400,53,136,40,'A · forward')+box(24,53,116,40,'B · backward')+`<path d="M278 160H520" stroke="#777" stroke-dasharray="5 5"/><path d="M321 160A51 51 0 0 0 314.2 134.5" fill="none" stroke="#ffab70"/><path d="M305 160A35 35 0 0 0 239.7 142.5" fill="none" stroke="#d7c7b8"/>`+label(335,126,'30° · acute','#ffab70',12)+label(164,119,'150° · obtuse','#dfc6b3',12)+label(372,181,'0° · beam direction','#aaa',12)+label(26,230,'Angles are measured from the same forward direction.','#aaa',12)+label(26,270,'Compare forward signal A / backward signal B')+label(26,302,'30° and 150° explain the geometry, not hardware specifications.','#aaa',11)+label(26,326,'Interpretation needs wavelength-specific calibration.','#aaa',12);
 if(method==='ionisation')drawing=label(25,35,'1  Sampled air passes through a particle separator')+arrow('M26 115H125')+box(127,80,105,70,'Separator')+arrow('M233 105H299')+label(244,83,'Smaller','#aaa',12)+arrow('M179 151V200H70')+label(26,227,'Larger particles diverted','#aaa',12)+`<rect x="302" y="65" width="229" height="159" rx="12" fill="#181b1d" stroke="#777"/><path d="M324 99H509M324 192H509" stroke="#ddd" stroke-width="5"/>`+label(323,88,'Electrodes','#aaa',12)+label(326,131,'+     +     +     +','#ffab70',18)+label(320,161,'Smoke captures charge','#ddd',12)+label(323,181,'+          +','#ffab70',18)+label(26,267,'2  Americium-241 ionises air; charge flows between plates', '#ddd',12)+label(26,296,'Clean air  ━━━━━━━━━  higher current','#aaa',13)+label(26,323,'With smoke  ━━━━          lower current','#ffab70',13);
 if(method==='gas')drawing=label(25,35,'1  Tune infrared frequency to a gas absorption line')+box(22,130,106,44,'Tuned IR laser')+arrow('M130 152H225')+`<rect x="227" y="86" width="136" height="129" rx="14" fill="#22282a" stroke="#888"/>`+label(248,111,'Gas sample','#aaa',12)+[253,291,329].map((x,i)=>`<circle cx="${x}" cy="${146+i%2*35}" r="9" fill="#b6c9cd"/><circle cx="${x+9}" cy="${141+i%2*35}" r="6" fill="#e3a472"/>`).join('')+arrow('M365 152H413')+box(415,129,122,44,'Light sensor')+label(24,245,'2  Molecules absorb some of the selected light')+label(24,279,'Light in  ━━━━━━━━━    Light out  ━━━━━','#ffab70',13)+label(24,312,'3  Calibrated absorption → selected gas concentration','#ddd',12)+label(24,334,'No gas concentration is calculated in this diagram.','#aaa',12);
 return base+drawing;
}
let answerState=null,pendingState=null;
function sync(){
 for(const field of ['environment','source','placement'])$(field).value=state[field];
 $('airflow').value=state.airflow;$('show-flow').checked=state.showFlow;$('flow-label').value=flowLabel(state.airflow);
 $('environment-label').textContent=`${state.environment==='earth'?'EARTH':'MICROGRAVITY'} / CABIN SECTION`;
 $('source-step').textContent=state.source==='equipment'?'An overheating unit in the rack releases smoke.':'An overheating laptop releases smoke into the cabin.';
 $('travel-step').textContent=state.airflow===0?(state.environment==='earth'?'Warm smoke rises in the Earth comparison.':'Without the fan, there is no directed route to the vent.'):(state.environment==='earth'?'The fan carries smoke sideways while buoyancy lifts it.':'The fan carries smoke towards the air-return grille.');
 $('sample-step').textContent=state.placement==='return'?'The detector samples air beside the return vent. It still needs enough of the right signal to alarm.':'The detector samples air near the cabin ceiling. In space, smoke does not naturally rise to meet it.';
 document.querySelectorAll('[data-preset]').forEach(button=>{const preset=button.dataset.preset;button.setAttribute('aria-pressed',String(preset==='earth'?state.environment==='earth'&&state.airflow===0:preset==='still'?state.environment==='microgravity'&&state.airflow===0:state.environment==='microgravity'&&state.airflow===65));});
 updateCalculation();$('observation').textContent=observation(state);$('snapshot').textContent=JSON.stringify(snapshot(state),null,2);
 const method=methods[state.method];
 $('method-frequency').textContent=state.method==='ionisation'?'':'Frequency and wavelength are related by f = c / λ, where c is the speed of light in vacuum and λ is the vacuum wavelength. Infrared has a longer wavelength and lower frequency than visible red light. The operating wavelength depends on the instrument.';
 $('method-steps').replaceChildren();for(const step of methodSteps[state.method]){const li=document.createElement('li');li.textContent=step;$('method-steps').append(li);}
 $('method-definitions').replaceChildren();for(const [term,definition] of (window.ResearchDefinitions?.[state.method]||[])){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=term;dd.textContent=definition;$('method-definitions').append(dt,dd);}

 for(const [id,prop] of [['method-title','title'],['method-status','status'],['method-description','description'],['method-measures','measures'],['method-limits','limits'],['sensor-caption','caption']])$(id).textContent=method[prop];
 $('method-source').href=method.url;$('sensor-svg').innerHTML=sensorGraphic(state.method);$('sensor-svg').setAttribute('aria-label',`${method.title} ${method.description}`);
 document.querySelectorAll('[data-method]').forEach(button=>{const active=button.dataset.method===state.method;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
 $('detector-panel').setAttribute('aria-labelledby',`tab-${state.method}`);
 try{localStorage.setItem(key,JSON.stringify({version:1,state}));storage=true;}catch{storage=false;}
 $('save-status').textContent=storage?'SETTINGS SAVED ON THIS DEVICE':'STORAGE UNAVAILABLE / SETTINGS FOR THIS VISIT';
 if(answerState&&answerState!==JSON.stringify(snapshot(state)))$('ai-status').textContent='Settings changed. The answer below refers to an earlier scene; ask again to update it.';
 resetParticles();draw();
}
for(const id of ['environment','airflow','source','placement','show-flow'])$(id).addEventListener('input',()=>{state=cleanState({...state,[id==='show-flow'?'showFlow':id]:id==='airflow'?Number($(id).value):id==='show-flow'?$(id).checked:$(id).value});sync();});
const tabs=[...document.querySelectorAll('[data-method]')];
for(const button of tabs){button.addEventListener('click',()=>{state.method=button.dataset.method;sync();});button.addEventListener('keydown',event=>{let index=tabs.indexOf(button);if(event.key==='ArrowRight')index=(index+1)%tabs.length;else if(event.key==='ArrowLeft')index=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;else return;event.preventDefault();tabs[index].click();tabs[index].focus({preventScroll:true});});}
document.querySelectorAll('[data-preset]').forEach(button=>button.addEventListener('click',()=>{state={...state,environment:button.dataset.preset==='earth'?'earth':'microgravity',airflow:button.dataset.preset==='flow'?65:0};sync();}));
$('reset').addEventListener('click',()=>{state={...defaults};sync();});

// Hand-authored illustrative smoke paths, not a solved physical flow field.
const canvas=$('transport'),ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
let w=800,h=400,particles=[],seed=14,last=0,raf=0,paused=reduced.matches,visible=true;
const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
function step(dt){for(const p of particles)p.age=(p.age+dt*.08)%1;}
function resetParticles(){seed=14;particles=Array.from({length:65},()=>({age:random(),offset:random()*2-1,phase:random()*Math.PI*2,size:8+random()*8}));}
function resize(){const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
function draw(){
 ctx.clearRect(0,0,w,h);ctx.save();
 const scale=Math.min(w/860,h/400);ctx.translate((w-860*scale)/2,(h-400*scale)/2);ctx.scale(scale,scale);
 const rect=(x,y,width,height,fill,stroke,r=0)=>{ctx.beginPath();ctx.roundRect(x,y,width,height,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}};
 const line=(points,color,width=1)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
 const text=(label,x,y,color='#aaa',size=12,align='left')=>{ctx.font=`${size}px "Space Grotesk", Arial, sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(label,x,y);ctx.textAlign='left';};
 const badge=(n,x,y)=>{ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fillStyle='#24160c';ctx.fill();ctx.strokeStyle='#ff8a3d';ctx.lineWidth=1.3;ctx.stroke();text(n,x,y+4,'#ffd0a9',12,'center');};
 // Rounded pressure hull, ceiling strip, wall panels and floor establish a cabin.
 rect(37,54,787,287,'#101112','#545454',49);rect(49,66,763,262,null,'#25282a',39);
 line([[72,302],[788,302]],'#464646',2);rect(132,66,570,5,'#545454',null,2);
 for(const x of [287,539,685])line([[x,90],[x,292]],'#202224');
 for(const x of [100,314,528,742]){ctx.beginPath();ctx.arc(x,85,2,0,Math.PI*2);ctx.fillStyle='#565656';ctx.fill();}
 // A window makes the scale and location legible without a diagram legend.
 rect(370,105,110,77,'#050607','#43484d',26);rect(379,114,92,59,'#080b0e','#222b32',20);
 for(const [x,y] of [[400,130],[430,145],[455,127],[418,159]]){ctx.fillStyle='#7f8a94';ctx.fillRect(x,y,1.6,1.6);}
 // Equipment rack: stacked electronics, handles, status lamps and a hot unit.
 rect(86,127,154,175,'#191c1e','#575a5b',7);
 for(let i=0;i<4;i++){const y=140+i*37;rect(98,y,129,29,i===1&&state.source==='equipment'?'#422719':'#222628','#373d3e',3);rect(106,y+7,47,14,'#101416',null,2);for(let j=0;j<4;j++)line([[166+j*8,y+7],[166+j*8,y+21]],'#525859');ctx.fillStyle=i===1&&state.source==='equipment'?'#ff9344':'#aaa';ctx.beginPath();ctx.arc(214,y+14,2.3,0,Math.PI*2);ctx.fill();}
 // A laptop and shelf are the alternative cabin source.
 line([[352,282],[523,282]],'#777',3);line([[370,285],[370,302],[506,302],[506,285]],'#424649',2);
 rect(399,226,80,49,state.source==='cabin'?'#352218':'#151a1c','#737779',4);rect(407,233,64,33,'#111515',null,1);line([[390,277],[490,277],[479,270],[399,270],[390,277]],'#858585',2);
 // Return grille, air duct and fan blades identify where air is collected.
 rect(739,161,69,113,'#1c2022','#62686c',6);
 for(let i=0;i<10;i++)line([[748,171+i*9],[799,171+i*9]],'#6e7477',3);
 line([[775,274],[775,301]],'#51575a',2);
 const sx=state.source==='equipment'?225:445,sy=state.source==='equipment'?192:231;
 const flow=state.airflow/100;
 const path=t=>{if(flow===0){if(state.environment==='earth')return [sx+Math.sin(t*3)*12,sy-t*(sy-99)];return [sx+Math.sin(t*2)*26,sy-Math.sin(t*3)*8];}
 const x=sx+(745-sx)*t;
 const target=state.environment==='earth'?112:211;
 const y=sy+(target-sy)*(1-Math.exp(-t*4));return [x,y];};
 // Soft grey puffs are visibly smoke; orange is reserved for the explanation.
 for(const p of particles){const travel=flow===0?p.age:Math.min(1,p.age*(.45+flow*.75));const [x,y]=path(travel);const spread=flow===0&&state.environment==='microgravity'?30:8+travel*14;const radius=p.size*(.5+p.age);const px=x+p.offset*spread,py=y+Math.sin(p.phase+p.age*3)*spread;const gradient=ctx.createRadialGradient(px,py,0,px,py,radius);gradient.addColorStop(0,`rgba(210,211,209,${.12*(1-p.age*.55)})`);gradient.addColorStop(1,'rgba(150,150,150,0)');ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(px,py,radius,0,Math.PI*2);ctx.fill();}
 if(state.showFlow){
  if(flow>0||state.environment==='earth'){
   ctx.beginPath();for(let i=0;i<=45;i++){const [x,y]=path(i/45);i?ctx.lineTo(x,y-26):ctx.moveTo(x,y-26);}ctx.strokeStyle='#ffab6666';ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.stroke();ctx.setLineDash([]);
   for(const t of [.35,.7]){const [x,y]=path(t),[x2,y2]=path(t+.02),angle=Math.atan2(y2-y,x2-x);ctx.save();ctx.translate(x,y-26);ctx.rotate(angle);line([[-7,-4],[0,0],[-7,4]],'#ffb477',2);ctx.restore();}
  }
 }
 // Recognisable detector housing, with a small inlet and indicator (not an alarm).
 const dx=state.placement==='return'?705:550,dy=state.placement==='return'?205:96;
 if(state.placement==='return'){line([[dx+20,dy],[739,dy]],'#797979',2);rect(dx-22,dy-30,44,60,'#ddd','#fff',7);for(let i=0;i<5;i++)line([[dx-12,dy-14+i*6],[dx+12,dy-14+i*6]],'#737778',2);}
 else{rect(dx-33,dy-16,66,14,'#bfc2c2','#eee',7);ctx.beginPath();ctx.ellipse(dx,dy,27,12,0,0,Math.PI*2);ctx.fillStyle='#d8dada';ctx.fill();for(let i=0;i<4;i++)line([[dx-15+i*9,dy-5],[dx-15+i*9,dy+5]],'#747777',2);}
 badge('1',sx-12,sy+48);badge('2',flow===0?sx+65:(sx+745)/2,flow===0?sy-40:159);badge('3',dx,dy+(state.placement==='return'?53:36));
 // Text is kept outside the cloud. On narrow screens, numbered HTML steps carry it.
 if(w>510){text(state.source==='equipment'?'Overheating electronics':'Overheating laptop',sx-30,365,'#e5c6ae',13);text('Return vent',772,144,'#c5c5c5',13,'center');text('Detector',dx,dy+(state.placement==='return'?83:62),'#eee',13,'center');text(flow>0?'Fan moves cabin air →':state.environment==='earth'?'Warm smoke rises':'Fan off · no directed airflow',430,31,'#c7a98e',13,'center');}
 ctx.restore();
}
function animate(time){if(paused||!visible||document.hidden){raf=0;return;}if(last)step(Math.min((time-last)/1000,.05)*(window.AssistantChat?.running?0.6:1));last=time;draw();raf=requestAnimationFrame(animate);}
function resume(){cancelAnimationFrame(raf);last=0;draw();if(!paused&&visible&&!document.hidden)raf=requestAnimationFrame(animate);$('journey-marker').style.animationPlayState=paused||document.hidden||state.velocity===0?'paused':'running';$('pause').textContent=paused?'▶ PLAY':'Ⅱ PAUSE';$('pause').setAttribute('aria-pressed',String(paused));}
$('pause').addEventListener('click',()=>{paused=!paused;resume();});reduced.addEventListener('change',()=>{paused=reduced.matches;resume();});document.addEventListener('visibilitychange',resume);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(canvas);new ResizeObserver(resize).observe(canvas);

function updateCalculation(){
 for(const field of ['distance','velocity'])$(field).value=state[field];
 $('distance-label').textContent=`${state.distance.toFixed(1)} m`;$('velocity-label').textContent=`${state.velocity.toFixed(2)} m/s`;
 const seconds=transportEstimate(state.distance,state.velocity);
 $('transport-formula').textContent=seconds===null?'u = 0 → no advective arrival':`${state.distance.toFixed(1)} m ÷ ${state.velocity.toFixed(2)} m/s = ${seconds.toFixed(1)} s`;
 $('calculation-note').textContent=seconds===null?'No finite L/u estimate at zero speed. Diffusion and other motion are outside this model.':'Ideal travel time to a sampling inlet on this path — not the time until an alarm sounds. The dot shows one illustrative journey.';
 $('journey-marker').style.animationDuration=`${seconds||1}s`;$('journey-marker').style.animationPlayState=seconds===null||paused||document.hidden?'paused':'running';
}
for(const field of ['distance','velocity'])$(field).addEventListener('input',()=>{state=cleanState({...state,[field]:Number($(field).value)});sync();});
function openAgent(open){$('agent').classList.toggle('is-open',open);$('agent-panel').hidden=!open;$('agent-toggle').setAttribute('aria-expanded',String(open));$('agent-toggle').setAttribute('aria-label',open?'Close research assistant':'Open research assistant');if(open)$('question').focus({preventScroll:true});else $('agent-toggle').focus({preventScroll:true});}
$('agent-toggle').addEventListener('click',()=>openAgent($('agent-panel').hidden));$('agent-close').addEventListener('click',()=>openAgent(false));
$('agent').addEventListener('keydown',e=>{if(e.key==='Escape')openAgent(false);});
const sections=['workspace','methods','calculations','comparison','evidence'];
function applyActions(actions){
 const applied=[];
 document.querySelectorAll?.('.assistant-navigation').forEach?.(link=>link.remove?.());
 for(const action of actions.slice(0,5)){
  if(action.type==='navigate'){const routes={home:'index.html',understand:'understand.html',prevent:'prevent.html',detect:'detect.html',suppress:'suppress.html',applications:'earth.html'};if(Object.hasOwn(routes,action.page)){const link=document.createElement('a');link.className='assistant-navigation';link.href=routes[action.page];link.textContent=`Open ${action.page==='home'?'investigation finder':action.page} →`;$('agent-actions').parentNode.append(link);}}
  if(action.type==='scroll'&&sections.includes(action.section)){$(action.section).scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});applied.push(`Opened ${action.section}`);}
  if(action.type==='set'&&Object.keys(defaults).includes(action.field)){
   const candidate=cleanState({...state,[action.field]:action.value});
   if(candidate[action.field]!==action.value)continue;
   state=candidate;sync();applied.push(`${action.field}: ${action.value}`);
  }
 }
 $('agent-actions').textContent=applied.length?`Updated demonstration · ${applied.join(' · ')}`:'';
}
function runLocalCommand(command){
 const parts=command.trim().split(/\s+/);let action;
 if(parts[0]==='/go'&&parts.length===2&&sections.includes(parts[1]))action={type:'scroll',section:parts[1]};
 if(parts[0]==='/set'&&parts.length===3&&Object.keys(defaults).includes(parts[1])){
  const field=parts[1],value=typeof defaults[field]==='number'?Number(parts[2]):typeof defaults[field]==='boolean'?(parts[2]==='true'?true:parts[2]==='false'?false:null):parts[2];
  if(cleanState({...state,[field]:value})[field]===value)action={type:'set',field,value};
 }
 if(action){applyActions([action]);$('ai-status').textContent='Command applied locally. No Gemini request was needed.';}else $('ai-status').textContent='Unknown command or out-of-range value. Open Commands & context for examples. Distance: 0.5–10 m, velocity: 0–0.5 m/s, airflow: 0–100 in steps of 5.';
}
$('explain-form').addEventListener('submit',async event=>{
 event.preventDefault();const question=$('question').value.trim();if(!question)return;if(window.AssistantChat&&await window.AssistantChat.tryRepeat(question))return;if(question.startsWith('/')){runLocalCommand(question);return;}const button=event.currentTarget.querySelector('[type=submit]');button.disabled=true;
 const chatTicket=window.AssistantChat?.begin(question);const context=snapshot(state);pendingState=JSON.stringify(context);$('ai-status').textContent='Analysing the selected scenario and detection research…';$('ai-result').hidden=true;
 try{
  if(location.protocol==='file:'&&!window.SEVENOAKS_API_BASE)throw Error('To use Gemini, start the backend with npm start and open http://localhost:4173/detect.html. The explorer itself works from this local file.');
  const response=await fetch(`${(window.SEVENOAKS_API_BASE||'').replace(/\/$/,'')}/api/ask`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context,agent:true,history:chatTicket?.history}),signal:AbortSignal.timeout(60000)});
  if(!response.headers.get('content-type')?.includes('application/json'))throw Error('The AI backend is not connected. Run this page with npm start, or connect a hosted backend for GitHub Pages.');
  const data=await response.json();if(!response.ok)throw Error(data.error||'The request could not be completed.');
  if(window.AssistantChat){
   const stale=pendingState!==JSON.stringify(snapshot(state));
   const active=await window.AssistantChat.complete(data,chatTicket,{apply:!stale});if(!active)return;
   $('ai-status').textContent=stale?'Your selection changed; actions were skipped.':'Response complete. References are included in the conversation.';
   if(stale)window.AssistantChat.report('Actions skipped because the demonstration changed while the response was being prepared.');
   answerState=pendingState;return;
  }
  $('ai-answer').textContent=data.answer;$('ai-sources').replaceChildren();
  for(const source of data.sources){const li=document.createElement('li'),a=document.createElement('a');a.textContent=source.title;a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);$('ai-sources').append(li);}
  if(!data.sources.length){const li=document.createElement('li');li.textContent='No supporting source was cited. Treat this answer as unsupported.';$('ai-sources').append(li);}
  if(pendingState===JSON.stringify(snapshot(state))){applyActions(data.actions||[]);}else{$('agent-actions').textContent='Suggested actions skipped because the scene changed while I was answering.';}
  answerState=pendingState;$('ai-result').hidden=false;$('ai-status').textContent=answerState===JSON.stringify(snapshot(state))?'Explanation based on the selected scene and detection research.':'Settings changed while Gemini was answering. This response refers to the previous scene.';
 }catch(error){$('ai-status').textContent=error.name==='TimeoutError'?'Gemini took too long to respond. Try again.':error.message;}
 finally{button.disabled=false;pendingState=null;}
});
sync();resize();resume();
