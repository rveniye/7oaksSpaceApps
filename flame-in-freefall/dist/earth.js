(() => {
 const $=id=>document.getElementById(id),M=window.EarthModel,key='7oaks:earth:v1',reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let state={...M.defaults},flamePlaying=false,sootPaused=reduced.matches,elapsed=0,t=0,sootTime=0,last=0,raf=0;
 try{const stored=JSON.parse(localStorage.getItem(key));if(stored?.version===1)state=M.clean(stored.inputs);}catch{}
 const flame=$('flame-canvas'),sootCanvas=$('soot-canvas'),fc=flame.getContext('2d'),sc=sootCanvas.getContext('2d');
 let flameVisible=true,sootVisible=true;
 function save(){try{localStorage.setItem(key,JSON.stringify(M.snapshot(state)));$('earth-save-status').textContent='Your demonstration settings are saved on this device.';}catch{$('earth-save-status').textContent='Storage unavailable. Settings last for this visit.';}}
 function sync(){
  const stage=M.stages[state.stage];$('flame-stage').value=state.stage;$('stage-name').value=stage.name;$('stage-title').textContent=stage.title;$('stage-description').textContent=state.stage===3&&!state.enhance?stage.description.replace('The right-hand ring is enhanced to make the reaction zone understandable.','Enhancement is off: the right-hand reaction is deliberately drawn very faintly.'):stage.description;
  $('enhance-cool').checked=state.enhance;$('visibility-note').textContent=state.enhance?'Enhanced view: the cyan outline is an explanatory overlay, not the appearance or size recorded by a camera.':'Faint view: reduced visibility does not mean the reaction is absent. This is not a calibrated camera image.';
  document.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===state.stage)));
  $('flame-play').textContent=flamePlaying?'Ⅱ Pause sequence':state.stage===3?'↺ Replay sequence':'▶ Play sequence';$('flame-play').setAttribute('aria-pressed',String(flamePlaying));
  $('soot-formation').value=state.formation;$('soot-oxidation').value=state.oxidation;
  const balance=M.soot(state.formation,state.oxidation);for(const f of ['formed','oxidised','escaped'])$('soot-'+f).textContent=balance[f];
  const reference=M.soot('low','high');$('soot-scenario-title').textContent=balance.escaped===reference.escaped?'Matches the comparison':balance.escaped>reference.escaped?'More soot escapes':'Less soot escapes';
  $('soot-observation').textContent=`In this illustration, ${balance.formed} dots represent soot formation. Oxidation consumes ${balance.oxidised}, leaving ${balance.escaped} to reach the exhaust, compared with ${reference.escaped} in the fixed example. Oxidation is chemical consumption of soot, not filtration. The counts describe the animation rather than measured emissions.`;
  $('soot-pause').textContent=sootPaused?'▶ Play motion':'Ⅱ Pause motion';$('soot-pause').setAttribute('aria-pressed',String(sootPaused));
  coolCloseup();engine();save();draw();
 }
 function stopSequence(){flamePlaying=false;elapsed=0;}
 $('flame-stage').addEventListener('input',()=>{stopSequence();state.stage=Number($('flame-stage').value);sync();});
 document.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>{stopSequence();state.stage=Number(b.dataset.stage);sync();}));
 $('flame-play').addEventListener('click',()=>{flamePlaying=!flamePlaying;if(flamePlaying&&state.stage===3)state.stage=0;elapsed=0;sync();start();});
 $('reveal-cool').addEventListener('click',()=>{stopSequence();state.stage=3;state.enhance=true;sync();start();flame.focus({preventScroll:true});flame.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});});
 $('enhance-cool').addEventListener('change',()=>{state.enhance=$('enhance-cool').checked;sync();});
 for(const field of ['formation','oxidation'])$('soot-'+field).addEventListener('change',()=>{state[field]=$('soot-'+field).value;sync();});
 for(const [id,formation,oxidation] of [['soot-lower','low','high'],['soot-higher','high','low']])$(id).addEventListener('click',()=>{state.formation=formation;state.oxidation=oxidation;sync();});
 $('soot-pause').addEventListener('click',()=>{sootPaused=!sootPaused;sync();start();});
 document.querySelectorAll('[data-engine]').forEach(b=>b.addEventListener('click',()=>{state.engine=Number(b.dataset.engine);sync();}));
 function coolCloseup(){
  const active=state.stage>0,cool=state.stage>=2,color=cool?'#91e0ed':'#ffb176';
  $('light-state').textContent=['No flame light','Bright hot flame','Visible flame fades','Very faint / hard to see'][state.stage];
  $('reaction-state').textContent=['Not burning','Hot combustion','Low-temperature route','Cool chemistry continues'][state.stage];
  $('light-indicator').style.background=state.stage===1?'#ffb176':state.stage>=2?'#344553':'#25313a';
  $('reaction-indicator').style.background=active?color:'#25313a';
  $('closeup-explanation').textContent=[
   'The liquid droplet is fuel, not a flame. No reaction zone is shown before ignition.',
   'Ignition establishes a hot reaction zone around the droplet. Fuel vapour travels outwards and oxygen travels inwards to meet it.',
   'Heat loss extinguishes the hot flame in this selected pathway. The dashed orange outline marks the former hot zone; it is no longer a burning shell.',
   'Fuel vapour and oxygen still meet in a lower-temperature reaction zone. Less visible light does not mean the fuel has stopped reacting.'
  ][state.stage];
  const arrow=(d,c)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="2.5" marker-end="url(#${c==='#ffbd8b'?'fuel-arrow':'oxygen-arrow'})"/>`;
  $('cool-closeup-svg').innerHTML=`<defs><radialGradient id="liquid-shade" cx="35%" cy="30%"><stop stop-color="#e6f4fb"/><stop offset=".4" stop-color="#84b2ca"/><stop offset="1" stop-color="#284b61"/></radialGradient><radialGradient id="zone-glow"><stop offset=".55" stop-color="${color}" stop-opacity="0"/><stop offset=".8" stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><marker id="fuel-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#ffbd8b"/></marker><marker id="oxygen-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#9ad5f1"/></marker></defs>
  <rect x="1" y="1" width="598" height="418" rx="14" fill="#0b141c" stroke="#293c4a"/>
  <g fill="#829aa9" font-family="Arial" font-size="12"><text x="24" y="29">EXPLANATORY CLOSE-UP</text><text x="24" y="397">Geometry and colour are illustrative, not measured.</text></g>
  ${cool?'<circle cx="300" cy="205" r="131" fill="none" stroke="#a67853" stroke-dasharray="5 9" opacity=".5"/><path d="M414 137L459 103" stroke="#a67853"/><text x="422" y="86" fill="#bc997d" font-size="12" font-family="Arial">Former hot zone</text>':''}
  ${active?`<circle cx="300" cy="205" r="${cool?116:145}" fill="url(#zone-glow)"/><circle class="reaction-halo" cx="300" cy="205" r="${cool?91:115}" fill="none" stroke="${color}" stroke-width="${cool?3:7}" ${cool?'stroke-dasharray="3 6"':''}/>`:''}
  <circle cx="300" cy="205" r="29" fill="url(#liquid-shade)"/><circle cx="291" cy="195" r="6" fill="#e3f2fa" opacity=".5"/>
  <path d="M300 236V290" stroke="#829ba9"/><text x="300" y="310" text-anchor="middle" fill="#d5e7f0" font-family="Arial" font-size="14">Liquid fuel droplet</text>
  ${active?`${arrow('M335 205H384','#ffbd8b')}${arrow('M265 205H216','#ffbd8b')}${arrow('M300 169V123','#ffbd8b')}${arrow('M503 205H404','#9ad5f1')}${arrow('M97 205H196','#9ad5f1')}${arrow('M300 53V93','#9ad5f1')}<g font-family="Arial" font-size="14"><text x="407" y="186" fill="#9ad5f1">Oxygen in</text><text x="313" y="153" fill="#ffbd8b">Fuel vapour out</text><text x="300" y="351" text-anchor="middle" fill="${color}">${cool?'LOW-TEMPERATURE REACTION CONTINUES':'HOT REACTION AROUND THE DROPLET'}</text></g>`:'<text x="300" y="350" text-anchor="middle" fill="#91a5b3" font-family="Arial" font-size="14">BEFORE IGNITION · NO FLAME</text>'}`;
 }
 function engine(){
  const descriptions=['Fuel and air form a mixture in the cylinder above the piston. HCCI stands for Homogeneous Charge Compression Ignition: the fuel and air are mixed before ignition. The dots represent this mixture, not measured molecules.','As the piston rises, it compresses the fuel–air mixture, increasing its temperature and pressure. Low-temperature chemical reactions can begin during this process and influence the timing of subsequent ignition.','Under suitable conditions, the compressed mixture autoignites without a spark. The orange dots represent combustion occurring throughout the charge. Understanding the earlier low-temperature chemistry helps engineers control when this happens; the diagram does not calculate ignition timing.'];
  $('engine-description').textContent=descriptions[state.engine];document.querySelectorAll('[data-engine]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.engine)===state.engine)));
  const y=state.engine===0?235:state.engine===1?157:180;
  $('engine-diagram').innerHTML=`<rect x="80" y="40" width="260" height="250" rx="18" fill="#141b20" stroke="#7c919d" stroke-width="3"/><rect x="96" y="55" width="228" height="${y-55}" fill="${state.engine===2?'#46291b':'#172a34'}"/><path d="M96 65V${y}M324 65V${y}" stroke="#a4c4d3" stroke-width="2"/><rect x="98" y="${y}" width="224" height="22" rx="3" fill="#8b999f"/><path d="M210 ${y+22}V315" stroke="#54646c" stroke-width="19"/>${Array.from({length:28},(_,i)=>{const x=116+(i%7)*31,py=72+Math.floor(i/7)*(y-83)/4;return `<circle cx="${x}" cy="${py}" r="${state.engine===2?7:4}" fill="${state.engine===2?'#ffb36d':i%2?'#83b9d3':'#dcad7e'}" opacity=".85"/>`;}).join('')}<text x="210" y="28" text-anchor="middle" fill="#ccdce3" font-family="Arial" font-size="14">${['Mixed charge','Compression','Distributed ignition'][state.engine]}</text><text x="210" y="329" text-anchor="middle" fill="#8e9ca3" font-family="Arial" font-size="11">ILLUSTRATIVE ENGINE CYCLE · NOT TO SCALE</text>`;
 }
 function surface(canvas,ctx){if(!ctx)return false;const box=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);if(box.width===0)return false;const width=Math.round(box.width*ratio),height=Math.round(box.height*ratio);if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}ctx.setTransform(width/800,0,0,height/330,0,0);ctx.clearRect(0,0,800,330);return true;}
 function text(ctx,label,x,y,color='#a2aeb6',size=13){const width=(ctx===fc?flame:sootCanvas).getBoundingClientRect().width;ctx.font=`${Math.max(size,800/Math.max(width,300)*9)}px Arial`;ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(label,x,y);}
 function glow(ctx,x,y,r,color,alpha){ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,3,x,y,r);g.addColorStop(0,color);g.addColorStop(.55,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.restore();}
 function drawFlames(){if(!surface(flame,fc))return;fc.strokeStyle='#26313a';fc.beginPath();fc.moveTo(400,0);fc.lineTo(400,330);fc.stroke();
  for(let side=0;side<2;side++){const x=side?600:200,y=160;fc.strokeStyle='#34414a';fc.beginPath();fc.arc(x,y,116,0,Math.PI*2);fc.stroke();
   const hot=state.stage>0&&(side===0||state.stage===1),cool=side===1&&state.stage>=2;
   // Layered translucent ribbons suggest a spherical flame rather than a solid ring.
   if(hot){
    const r=68+(reduced.matches?0:Math.sin(t*2)*2);glow(fc,x,y,r+43,'#e96b27',.2);
    for(let layer=0;layer<9;layer++){fc.beginPath();for(let i=0;i<=120;i++){const angle=i/120*Math.PI*2;const ripple=Math.sin(angle*5+t*1.5+layer*.6)*3+Math.sin(angle*9-t)*1.5;const radius=r+layer*1.7+ripple;const px=x+Math.cos(angle)*radius,py=y+Math.sin(angle)*radius;i?fc.lineTo(px,py):fc.moveTo(px,py);}fc.closePath();fc.strokeStyle=`rgba(255,${178-layer*8},${106-layer*7},${.45-layer*.045})`;fc.lineWidth=3;fc.stroke();}
    glow(fc,x,y,55,'#82bfe8',.07);
   }
   if(cool){
    const opacity=state.enhance?.75:.045;
    if(state.enhance){fc.strokeStyle='#9e6c4666';fc.lineWidth=1;fc.setLineDash([4,7]);fc.beginPath();fc.arc(x,y,78,0,Math.PI*2);fc.stroke();fc.setLineDash([]);}
    glow(fc,x,y,83,'#71cde8',opacity*.16);
    for(let layer=0;layer<5;layer++){fc.beginPath();for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,rad=56+layer*2+Math.sin(a*4+t*.7+layer)*2;const px=x+Math.cos(a)*rad,py=y+Math.sin(a)*rad;i?fc.lineTo(px,py):fc.moveTo(px,py);}fc.closePath();fc.strokeStyle=`rgba(124,218,240,${opacity*(.25-layer*.04)})`;fc.lineWidth=3;fc.stroke();}
    if(state.enhance){
     for(let j=0;j<12;j++){const a=j/12*Math.PI*2,phase=(t*.18+j*.137)%1;
      for(const inward of [false,true]){const radius=inward?112-phase*51:20+phase*40;fc.fillStyle=inward?'#a5d9ed':'#edb98e';fc.globalAlpha=.4+.4*Math.sin(phase*Math.PI);fc.beginPath();fc.arc(x+Math.cos(a)*radius,y+Math.sin(a)*radius,1.8,0,Math.PI*2);fc.fill();fc.globalAlpha=1;}
     }
    }
   }
   const drop=state.stage===0?18:state.stage===1?16:side===0?13:15;glow(fc,x-3,y-4,drop,'#c1e3ec',1);fc.fillStyle='#b4d3df';fc.beginPath();fc.arc(x,y,drop*.7,0,Math.PI*2);fc.fill();
   if(state.stage===1){fc.strokeStyle='#d9a586';fc.lineWidth=3;fc.beginPath();fc.moveTo(x-115,y+65);fc.lineTo(x-35,y+15);fc.stroke();text(fc,'Heated igniter',x-55,265,'#dfad86',12);}
   text(fc,'Liquid droplet',x,205,'#bccbd5',12);text(fc,hot?'HOT REACTION ZONE':cool?state.enhance?'COOL ZONE · ENHANCED':'COOL ZONE · VERY FAINT':'FUEL + OXYGEN / UNLIT',x,303,hot?'#ffb16c':cool?'#95d5e9':'#8c9ca8',12);
  }
 }
 function drawSoot(){if(!surface(sootCanvas,sc))return;sc.strokeStyle='#26313a';sc.beginPath();sc.moveTo(400,0);sc.lineTo(400,330);sc.stroke();
  for(let side=0;side<2;side++){const x=side?600:200,balance=side?M.soot(state.formation,state.oxidation):M.soot('low','high');
   sc.fillStyle='#1e282f';sc.fillRect(x-33,274,66,42);sc.strokeStyle='#7f909a';sc.strokeRect(x-33,274,66,42);text(sc,'Fuel inlet',x,328,'#9babb6',11);
   const g=sc.createLinearGradient(x,270,x,66);g.addColorStop(0,'#4e90cb');g.addColorStop(.4,side&&state.formation==='high'?'#d88739':'#4284b7');g.addColorStop(1,'#13232e');sc.fillStyle=g;sc.beginPath();sc.moveTo(x-30,273);sc.bezierCurveTo(x-100,173,x-48,98,x,64);sc.bezierCurveTo(x+48,98,x+100,173,x+30,273);sc.closePath();sc.fill();
   sc.setLineDash([4,5]);sc.strokeStyle='#68777f';sc.beginPath();sc.moveTo(x-145,72);sc.lineTo(x+145,72);sc.stroke();sc.setLineDash([]);text(sc,'Exhaust boundary',x,23,'#8f9da7',11);
   for(let i=0;i<balance.formed;i++){const phase=(sootTime*.11+i/balance.formed)%1;const py=252-phase*226;const survives=i>=balance.oxidised;const px=x+Math.sin(i*13.7)*Math.sin(phase*Math.PI)*48;
    if(!survives&&phase>.65)continue;
    const oxidation= !survives&&phase>.5;sc.globalAlpha=oxidation?Math.max(0,1-(phase-.5)/.15):1;sc.fillStyle=oxidation?'#83c8df':phase>.8?'#c2c8cc':'#e7b37d';sc.beginPath();sc.arc(px,py,oxidation?5:3,0,Math.PI*2);sc.fill();sc.globalAlpha=1;
   }
   text(sc,`${balance.escaped} example dots escape / cycle`,x,48,'#c6d0d6',12);
  }
 }
 function draw(){drawFlames();drawSoot();}
 function tick(now){raf=0;if(document.hidden)return;const dt=last?Math.min((now-last)/1000,.1):0;last=now;
  if(!reduced.matches)t+=dt;if(!sootPaused&&!reduced.matches&&sootVisible)sootTime+=dt;
  if(flamePlaying&&flameVisible){elapsed+=dt;if(elapsed>=2.5){elapsed=0;if(state.stage<3)state.stage++;else flamePlaying=false;sync();}}
  if(flameVisible)drawFlames();if(sootVisible&&!sootPaused)drawSoot();
  if((flamePlaying&&flameVisible)||(!reduced.matches&&(flameVisible||(!sootPaused&&sootVisible))))raf=requestAnimationFrame(tick);
 }
 function start(){cancelAnimationFrame(raf);last=0;raf=0;if(!document.hidden)raf=requestAnimationFrame(tick);}
 new ResizeObserver(draw).observe(flame);new ResizeObserver(draw).observe(sootCanvas);
 new IntersectionObserver(entries=>{for(const e of entries){if(e.target===flame)flameVisible=e.isIntersecting;else sootVisible=e.isIntersecting;}start();}).observe(flame);
 new IntersectionObserver(entries=>{sootVisible=entries[0].isIntersecting;start();}).observe(sootCanvas);
 document.addEventListener('visibilitychange',start);reduced.addEventListener('change',()=>{sootPaused=reduced.matches;stopSequence();sync();start();});sync();start();
})();
