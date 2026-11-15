// Applications owns the engine illustration; droplet and soot lessons live in Understand.
(() => {
 const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!$('engine-diagram'))return;
 let state={engine:0},engineFrame=0,engineY=235;
 try{const saved=JSON.parse(localStorage.getItem('7oaks:engine:v1'));if(Number.isInteger(saved?.engine)&&saved.engine>=0&&saved.engine<=2)state.engine=saved.engine;}catch{}
 function sync(){engine();try{localStorage.setItem('7oaks:engine:v1',JSON.stringify(state));}catch{}if(typeof CustomEvent!=='undefined')document.dispatchEvent?.(new CustomEvent('applicationstatechange'));}
 document.querySelectorAll('[data-engine]').forEach(b=>b.addEventListener('click',()=>{state.engine=Number(b.dataset.engine);sync();}));
 function engine(){
  const descriptions=['Fuel and air form a mixture in the cylinder above the piston. HCCI stands for Homogeneous Charge Compression Ignition: the fuel and air are mixed before ignition. The dots represent this mixture, not measured molecules.','As the piston rises, it compresses the fuel–air mixture, increasing its temperature and pressure. Low-temperature chemical reactions can begin during this process and influence the timing of subsequent ignition.','Under suitable conditions, the compressed mixture autoignites without a spark. The orange dots represent combustion occurring throughout the charge. Understanding the earlier low-temperature chemistry helps engineers control when this happens; the diagram does not calculate ignition timing.'];
  $('engine-description').textContent=descriptions[state.engine];document.querySelectorAll('[data-engine]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.engine)===state.engine)));
  const target=state.engine===0?235:state.engine===1?157:180;
  cancelAnimationFrame(engineFrame);
  const from=engineY;let began=null;
  function renderEngine(y){engineY=y;
  $('engine-diagram').innerHTML=`<rect x="80" y="40" width="260" height="250" rx="18" fill="#141b20" stroke="#7c919d" stroke-width="3"/><rect x="96" y="55" width="228" height="${y-55}" fill="${state.engine===2?'#46291b':'#172a34'}"/><path d="M96 65V${y}M324 65V${y}" stroke="#a4c4d3" stroke-width="2"/><rect x="98" y="${y}" width="224" height="22" rx="3" fill="#8b999f"/><path d="M210 ${y+22}V315" stroke="#54646c" stroke-width="19"/>${Array.from({length:28},(_,i)=>{const x=116+(i%7)*31,py=72+Math.floor(i/7)*(y-83)/4;return `<circle cx="${x}" cy="${py}" r="${state.engine===2?7:4}" fill="${state.engine===2?'#ffb36d':i%2?'#83b9d3':'#dcad7e'}" opacity=".85"/>`;}).join('')}<text x="210" y="28" text-anchor="middle" fill="#ccdce3" font-family="Arial" font-size="14">${['Mixed charge','Compression','Distributed ignition'][state.engine]}</text><path d="M324 ${y+11}H376" stroke="#839ead"/><text x="378" y="${y+15}" fill="#bdcdd6" font-family="Arial" font-size="12">Piston</text><path d="M96 94H43" stroke="#839ead"/><text x="8" y="85" fill="#bdcdd6" font-family="Arial" font-size="11">Cylinder</text><text x="210" y="329" text-anchor="middle" fill="#8e9ca3" font-family="Arial" font-size="11">ILLUSTRATIVE ENGINE CYCLE · NOT TO SCALE</text>`;
  }
  if(reduced.matches){renderEngine(target);return;}
  renderEngine(from);
  function transition(now){if(began===null)began=now;const progress=Math.min(1,(now-began)/650),ease=1-Math.pow(1-progress,3);renderEngine(from+(target-from)*ease);if(progress<1)engineFrame=requestAnimationFrame(transition);}
  engineFrame=requestAnimationFrame(transition);
 }

 reduced.addEventListener('change',sync);sync();
})();
