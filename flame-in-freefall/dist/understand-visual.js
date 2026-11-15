(() => {
 if(document.body.dataset.researchPage!=='understand')return;
 const svg=document.getElementById('research-visual'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches;
 const toolbar=document.createElement('div');toolbar.className='simulation-toolbar';const note=document.createElement('span');note.textContent='Same kind of fuel, different gas motion · illustrative comparison';const toggle=document.createElement('button');toggle.type='button';toggle.id='scene-motion';toolbar.append(note,toggle);svg.before(toolbar);
 const reading=document.createElement('div');reading.className='simulation-reading';reading.setAttribute('aria-live','polite');svg.after(reading);
 const steps={earth:[['Fuel evaporates','A liquid droplet supplies fuel vapour to the reacting gas around it.'],['Hot gas rises','Buoyancy moves less-dense hot gas upwards and draws fresh air in.'],['The flame stretches','The upward flow creates an elongated reaction zone.']],microgravity:[['Fuel vapour moves out','Vapour leaves the droplet and mixes with its surroundings.'],['Oxygen moves in','In still air, diffusion supplies oxygen from all directions.'],['A shell can form','The reacting gas can surround the droplet. The flame is not the liquid itself.']],ventilation:[['The fan moves air','Directed flow is still possible without a strong buoyant rise.'],['The flame is displaced','Air carries oxygen, heat and reaction products along the flow.'],['Shape depends on flow','A roughly spherical flame is a still-air example, not a universal space flame.']]};
 function motion(){svg.classList.toggle('u-paused',paused);document.getElementById('flame-front')?.classList.toggle('u-paused',paused);toggle.textContent=paused?'Play animation':'Pause animation';toggle.setAttribute('aria-pressed',String(paused));}
 const text=(x,y,value,color='#a7bdca',size=14)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${color}" font-family="Arial" font-size="${size}">${value}</text>`;
 function render(){
 const scene=document.querySelector('[data-scene][aria-pressed="true"]')?.dataset.scene||'earth';
 svg.setAttribute('viewBox','0 0 800 390');svg.classList.add('understand-scene');
 let body='',paths='',caption='';
 reading.innerHTML=steps[scene].map(([title,description],i)=>`<div><strong><span class="reading-number">0${i+1}</span>${title}</strong><p>${description}</p></div>`).join('');
 const fuel='<circle cx="400" cy="225" r="17" fill="url(#u-droplet)"/><path d="M400 246V281" stroke="#809baa"/>'+text(400,302,'Liquid fuel droplet');
 if(scene==='earth'){
 body=`<g class="u-earth-flame"><path d="M400 60C388 99 357 121 369 153C340 137 346 120 349 111C317 169 336 220 368 244C384 258 415 262 438 242C480 203 449 146 427 120C437 159 415 165 411 145C400 122 419 93 400 60Z" fill="url(#u-hot)"/><path d="M399 147C382 180 367 198 380 232C388 249 416 254 426 231C436 210 414 181 399 147Z" fill="#ffe5b0" opacity=".8"/></g>${fuel}`;
 paths=[-1,1].map(side=>Array.from({length:8},(_,i)=>`<circle class="u-rise" cx="${400+side*(94+i%3*12)}" cy="240" r="2.6" fill="#99c6dc" style="animation-delay:-${i*.39}s"/>`).join('')).join('');
 paths+='<path d="M270 228Q250 165 282 95M530 228Q550 165 518 95" fill="none" stroke="#91b9cb" stroke-width="2" marker-end="url(#u-arrow)"/>';
 paths+=text(176,112,'Hot gas rises')+text(642,232,'Fresh air enters')+'<path d="M610 245Q527 270 455 236" fill="none" stroke="#91b9cb" stroke-width="2" marker-end="url(#u-arrow)"/>';
 caption='Earth gravity · buoyancy stretches the reaction zone upwards';
 svg.setAttribute('aria-label','An elongated flame surrounds a liquid fuel droplet. Arrows show hot gas rising and fresh air entering. The same fuel type is used in all three diagrams; the gas motion changes.');
 }else{
 const ventilated=scene==='ventilation';
 body=`<g class="${ventilated?'u-flow-flame':'u-round-flame'}"><ellipse cx="400" cy="185" rx="${ventilated?120:82}" ry="${ventilated?65:82}" fill="url(#u-cool)"/><ellipse cx="400" cy="185" rx="${ventilated?100:64}" ry="${ventilated?51:64}" fill="none" stroke="#a3dff2" stroke-width="3" opacity=".7"/></g><circle cx="400" cy="185" r="17" fill="url(#u-droplet)"/>`;
 if(ventilated){
 paths='<rect x="83" y="124" width="52" height="119" rx="8" fill="#253640" stroke="#6b8493"/>'+Array.from({length:7},(_,i)=>`<path d="M93 ${137+i*14}H125" stroke="#9ab2bf" stroke-width="3"/>`).join('');
 paths+=Array.from({length:27},(_,i)=>`<circle class="u-cross" cx="150" cy="${119+i%5*30}" r="2.5" fill="#9ec8d9" style="animation-delay:-${i*.21}s"/>`).join('');
 paths+='<path d="M180 95H585" stroke="#91b9cb" stroke-width="2" marker-end="url(#u-arrow)"/>'+text(108,274,'Vent')+text(400,77,'Directed airflow');
 caption='Microgravity with ventilation · directed flow deforms the reaction zone';
 }else{
 paths=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2;return `<circle class="u-diffuse" cx="${400+Math.cos(a)*135}" cy="${185+Math.sin(a)*135}" r="2.5" fill="#9ec8d9" style="--tx:${-Math.cos(a)*48}px;--ty:${-Math.sin(a)*48}px;animation-delay:-${i*.27}s"/>`;}).join('');
 paths+=text(650,182,'Oxygen arrives')+text(650,204,'from all directions');paths+='<path d="M570 185H496" stroke="#91b9cb" stroke-width="2" marker-end="url(#u-arrow)"/>'+text(150,173,'Fuel vapour moves out')+'<path d="M423 185H453" stroke="#e6b17f" stroke-width="2" marker-end="url(#u-fuel-arrow)"/>';caption='Microgravity in still air · diffusion supplies a surrounding reaction zone';
 }
 svg.setAttribute('aria-label',ventilated?'A blue flame surrounding a liquid fuel droplet is elongated by ventilation. Blue dots move from the air vent across the scene.':'A spherical blue flame surrounds a liquid fuel droplet. Blue dots illustrate net oxygen transport towards the flame from all directions, not molecular trajectories.');
 body+='<path d="M400 204V280" stroke="#809baa" stroke-width="1"/>'+text(400,299,'Liquid fuel droplet');
 }
 svg.innerHTML=`<defs><linearGradient id="u-hot" x2="0" y2="1"><stop stop-color="#ffe4ae"/><stop offset=".4" stop-color="#ffab58"/><stop offset="1" stop-color="#ad4629"/></linearGradient><radialGradient id="u-cool"><stop offset=".25" stop-color="#93d9f1" stop-opacity=".08"/><stop offset=".65" stop-color="#5eaacb" stop-opacity=".45"/><stop offset=".8" stop-color="#93d6e9" stop-opacity=".5"/><stop offset="1" stop-color="#548ba6" stop-opacity="0"/></radialGradient><radialGradient id="u-droplet" cx="30%" cy="25%"><stop stop-color="#effbff"/><stop offset="1" stop-color="#6f9bad"/></radialGradient><marker id="u-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#91b9cb" stroke-width="2"/></marker><marker id="u-fuel-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#e6b17f" stroke-width="2"/></marker></defs><rect x="20" y="12" width="760" height="366" rx="18" fill="#0c141a"/>${paths}${body}${text(400,352,caption,'#bbcbd4',13)}`;motion();
 }
 toggle.addEventListener('click',()=>{paused=!paused;motion();});document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',render));reduced.addEventListener('change',()=>{paused=reduced.matches;motion();});new IntersectionObserver(entries=>svg.classList.toggle('u-offscreen',!entries[0].isIntersecting)).observe(svg);const front=document.getElementById('flame-front');if(front)new IntersectionObserver(entries=>front.classList.toggle('u-offscreen',!entries[0].isIntersecting)).observe(front);document.addEventListener('visibilitychange',()=>{svg.classList.toggle('u-hidden',document.hidden);front?.classList.toggle('u-hidden',document.hidden);});render();
})();
