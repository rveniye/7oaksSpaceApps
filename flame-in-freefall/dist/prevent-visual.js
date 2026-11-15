(() => {
  if (document.body.dataset.researchPage !== 'prevent') return;
  const svg = document.getElementById('research-visual');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const toolbar = document.createElement('div');
  toolbar.className = 'simulation-toolbar';
  const note = document.createElement('span');
  note.textContent = 'Follow the air through an equipment bay · illustrative flow';
  const toggle = document.createElement('button');
  toggle.type = 'button';toggle.id='scene-motion';
  toolbar.append(note, toggle);
  svg.before(toolbar);
  const reading = document.createElement('div');
  reading.className = 'simulation-reading';
  reading.setAttribute('aria-live', 'polite');
  svg.after(reading);
  const scenarios = {
    cooling: {
      description: 'Follow the blue air from the supply vent, past the warm equipment and towards the return. The orange marks represent heat carried away with that air. Actual cooling depends on heat load and where the air reaches.',
      steps: [['Air enters', 'The supply fan moves cabin air through the equipment space.'], ['Heat moves into the air', 'Air flowing over warm equipment can carry some of its heat away.'], ['Warm air leaves', 'A clear route to the return matters. Poorly ventilated pockets may remain hot.']],
    },
    supply: {
      description: 'The airflow that removes heat also brings oxygen towards combustible material. The blue dots trace that supply; the orange region marks a possible combustion site. More airflow is not a universal fire prevention setting.',
      steps: [['The air contains oxygen', 'Ventilation transports oxygen along with the rest of the cabin air.'], ['Oxygen reaches the material', 'If ignition occurs, this supply can help sustain a flame.'], ['Assess the whole arrangement', 'Material, oxygen concentration, pressure and flow must be considered together.']],
    },
    transport: {
      description: 'Grey particles leave a concealed source and follow the air to the return-side sampling inlet. A detector can only respond to smoke that reaches it. This sketch does not calculate a detection time or predict the paths in a real cabin.',
      steps: [['A source releases smoke', 'A concealed fault can produce smoke before the source is visible.'], ['Air carries the smoke', 'Particles travel with cabin flow; they do not simply rise to a ceiling.'], ['A sample reaches the detector', 'Location, obstructions and the flow path affect what the detector receives.']],
    },
  };
  const label = (x, y, value, color = '#b9ccd7', size = 14, anchor = 'middle') => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" text-anchor="${anchor}">${value}</text>`;
  function motion() {
    svg.classList.toggle('simulation-paused', paused);
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
  }
  function render() {
    const selected = document.querySelector('[data-scene][aria-pressed="true"]')?.dataset.scene;
    const mode = scenarios[selected] ? selected : 'cooling';
    const scenario = scenarios[mode];
    svg.setAttribute('viewBox', '0 0 800 400');
    svg.classList.add('apparatus-scene');
    svg.setAttribute('aria-label', scenario.description);
    const streams = [154, 196, 238].map(y => `<path d="M151 ${y}H255Q280 ${y} 308 ${y}H653" fill="none" stroke="#547789" stroke-width="1.3" marker-end="url(#p-arrow)" opacity=".7"/>`).join('');
    const air = Array.from({length: 24}, (_, i) => `<circle class="p-particle" cx="151" cy="${154 + i % 3 * 42}" r="${mode === 'supply' ? 3 : 2}" fill="#9bd2ed" style="animation-delay:-${i * .23}s;--still-x:${i % 8 * 62}px"/>`).join('');
    let effect = '';
    if (mode === 'cooling') effect = Array.from({length: 14}, (_, i) => `<path class="p-heat" d="M365 ${151 + i % 4 * 28}h19" fill="none" stroke="#e4a16e" stroke-width="2" style="animation-delay:-${i * .31}s;--still-x:${i % 5 * 40}px"/>`).join('');
    if (mode === 'supply') effect = '<ellipse cx="340" cy="207" rx="38" ry="46" fill="url(#p-warm)"/><path d="M338 239C312 224 327 210 328 190C341 211 350 192 346 177C369 206 373 227 351 240" fill="#efaa6e" opacity=".8"/>';
    if (mode === 'transport') effect = Array.from({length: 23}, (_, i) => `<circle class="p-smoke" cx="352" cy="${180 + i % 5 * 11}" r="${3 + i % 3}" fill="#d1c7b8" style="--drift:${i % 3 * 13 - 14}px;animation-delay:-${i * .23}s;--still-x:${i % 7 * 45}px"/>`).join('');
    svg.innerHTML = `<defs><marker id="p-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#9bd2ed" stroke-width="2"/></marker><radialGradient id="p-warm"><stop stop-color="#e8a064" stop-opacity=".5"/><stop offset="1" stop-color="#e8a064" stop-opacity="0"/></radialGradient><linearGradient id="p-casing" x2="1" y2="1"><stop stop-color="#344550"/><stop offset="1" stop-color="#17232b"/></linearGradient></defs>
      <rect x="24" y="25" width="752" height="340" rx="12" fill="#0b151c" stroke="#2d414d"/>
      ${label(50, 53, 'EQUIPMENT BAY / CUTAWAY', '#92a9b8', 11, 'start')}
      <path d="M70 115H728M70 276H728" stroke="#455a67" stroke-width="5"/>
      <path d="M70 119H728M70 280H728" stroke="#15232c" stroke-width="7"/>
      <rect x="83" y="141" width="56" height="110" rx="5" fill="#253a47" stroke="#6c899b"/>
      <circle cx="111" cy="196" r="22" fill="#101c24" stroke="#7793a4"/>
      <g class="p-fan" fill="#7793a4"><path d="M111 193Q92 169 98 191L108 199ZM114 196Q140 177 118 181L108 193ZM111 199Q129 225 125 203L114 193ZM108 196Q82 214 104 210L114 199Z"/><circle cx="111" cy="196" r="4"/></g>
      <rect x="264" y="134" width="92" height="139" rx="5" fill="url(#p-casing)" stroke="#708794"/>
      ${Array.from({length:6},(_,i)=>`<path d="M276 ${151+i*17}H342" stroke="#8498a3" stroke-width="3"/>`).join('')}
      <circle cx="337" cy="255" r="3" fill="#e4a16e"/>
      <rect x="670" y="139" width="38" height="114" rx="4" fill="#233440" stroke="#6a8392"/>
      ${Array.from({length:8},(_,i)=>`<path d="M679 ${150+i*13}H699" stroke="#8ca3b1" stroke-width="3"/>`).join('')}
      ${streams}${air}${effect}
      ${mode === 'transport' ? '<rect x="619" y="171" width="28" height="51" rx="4" fill="#c0ced5"/><path d="M626 185h14m-14 6h14m-14 6h14" stroke="#314c5a" stroke-width="2"/><circle class="p-sensor" cx="633" cy="210" r="3" fill="#e8bb79"/>' : ''}
      ${label(110,94,'Supply fan')}${label(310,94,mode==='cooling'?'Warm electronics':'Possible fire source')}${label(688,94,'Air return')}
      <path d="M110 253V301M310 274V301M689 255V301" stroke="#5b7483"/>
      ${label(110,321,'1 · Air enters')}${label(310,321,mode==='cooling'?'2 · Heat enters flow':mode==='supply'?'2 · Oxygen reaches fuel':'2 · Smoke enters flow')}${label(657,321,mode==='transport'?'3 · Detector samples air':'3 · Air leaves')}
      ${label(400,352,mode==='cooling'?'Blue: cabin air     Orange: heat transport':mode==='supply'?'Blue: oxygen-containing air     Orange: possible combustion':'Blue: cabin air     Grey: smoke particles', '#93aebb', 12)}
    `;
    document.getElementById('scene-description').textContent = scenario.description;
    reading.innerHTML = scenario.steps.map(([title, description], i) => `<div><strong><span class="reading-number">0${i+1}</span>${title}</strong><p>${description}</p></div>`).join('');
    motion();
  }
  toggle.addEventListener('click', () => { paused = !paused; motion(); });
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', render));
  reduced.addEventListener('change', () => { paused = reduced.matches; motion(); });
  new IntersectionObserver(entries => svg.classList.toggle('simulation-offscreen', !entries[0].isIntersecting)).observe(svg);
  document.addEventListener('visibilitychange', () => svg.classList.toggle('simulation-hidden', document.hidden));
  render();
})();
