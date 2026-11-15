(() => {
  if (document.body.dataset.researchPage !== 'suppress') return;
  const svg = document.getElementById('research-visual');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const toolbar = document.createElement('div');
  toolbar.className = 'simulation-toolbar';
  const note = document.createElement('span');
  note.textContent = 'Compare the mechanism · no extinguishment threshold is calculated';
  const toggle = document.createElement('button');
  toggle.type = 'button';toggle.id='scene-motion';
  toolbar.append(note, toggle);
  svg.before(toolbar);
  const reading = document.createElement('div');
  reading.className = 'simulation-reading';
  reading.setAttribute('aria-live', 'polite');
  svg.after(reading);
  const scenarios = {
    mist: {
      description: 'Follow the fine droplets from the nozzle into the hot region. Water heats up and evaporates, taking energy from its surroundings. The orange arrows mark heat transfer; the animation does not show a measured cooling rate or promise that the flame goes out.',
      steps: [['Break water into droplets', 'The nozzle spreads a small amount of water over a large surface area.'], ['Take heat from the fire', 'Droplets warm and evaporate as they interact with the hot region.'], ['Check the remaining source', 'Cooling the gas and cooling the burning material are separate requirements.']],
    },
    ionic: {
      description: 'Gold positive charges move towards the negative electrode. Their collisions transfer motion to the surrounding gas, shown in blue. This changes gas flow near the flame. The diagram shows one direction of forcing; it does not calculate the electric field or demonstrate extinction.',
      steps: [['Apply an electric field', 'Two electrodes exert a force on charged particles in the gas.'], ['Charges move the gas', 'Collisions transfer momentum to neutral gas molecules: this is ionic wind.'], ['The flame responds to flow', 'Moving gas can alter mixing and heat loss. This remains an experimental suppression approach.']],
    },
    acoustic: {
      description: 'The curved lines show a travelling sound disturbance. Watch the blue gas markers move back and forth around fixed positions; the gas is not carried steadily away. The flame responds to that motion. This is a mechanism illustration, with no sound output or calculated frequency.',
      steps: [['The speaker oscillates', 'The moving cone creates pressure changes in the surrounding gas.'], ['Gas moves back and forth', 'A sound wave travels, while nearby gas oscillates over a much smaller distance.'], ['The flame is disturbed', 'The response depends on the conditions. Weak forcing may feed a flame, and residual heat can remain.']],
    },
  };
  const label = (x, y, value, color = '#b8ccd8', size = 14, anchor = 'middle') => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" text-anchor="${anchor}">${value}</text>`;
  function motion() {
    svg.classList.toggle('simulation-paused', paused);
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
  }
  function render() {
    const selected = document.querySelector('[data-scene][aria-pressed="true"]')?.dataset.scene;
    const mode = scenarios[selected] ? selected : 'mist';
    const scenario = scenarios[mode];
    let apparatus = '', effect = '', labels = '';
    if (mode === 'mist') {
      apparatus = `<rect x="91" y="170" width="64" height="104" rx="21" fill="url(#s-metal)" stroke="#9fb4c2"/><path d="M111 169V153H139V169M126 153Q183 134 203 179" fill="none" stroke="#93acbb" stroke-width="7"/><path d="M197 170L235 180V196L197 208Z" fill="#8099a7" stroke="#b6cbd5"/><path d="M104 211H143M104 215H143" stroke="#d8e4ea" stroke-width="3"/>
        <path d="M237 187L488 112M237 187L488 266" stroke="#436b80" stroke-dasharray="4 7" fill="none"/>`;
      effect = Array.from({length:42}, (_,i) => `<circle class="s-drop" cx="238" cy="187" r="${1.5+i%3*.5}" fill="#b7e5f6" style="--dx:${245+i%5*8}px;--dy:${(i%11-5)*12}px;animation-delay:-${i*.17}s;--still-x:${i%9*28}px;--still-y:${(i%7-3)*10}px"/>`).join('');
      effect += Array.from({length:7}, (_,i) => {const a=(i/7)*Math.PI*2,dx=Math.cos(a)*65,dy=Math.sin(a)*65;return `<path class="s-heat" d="M${525+dx*.6} ${201+dy*.6}l${dx*.3} ${dy*.3}" stroke="#ecb47d" stroke-width="2" marker-end="url(#s-heat-arrow)" style="--dx:${dx*.5}px;--dy:${dy*.5}px;animation-delay:-${i*.6}s;--still-x:${dx*.2}px;--still-y:${dy*.2}px"/>`;}).join('');
      labels = `${label(126,307,'Water reservoir')}${label(288,104,'Fine droplets')}${label(590,75,'Heat passes into the water')}${label(400,349,'Blue: water droplets     Orange arrows: heat transfer', '#8fabbc', 12)}`;
    } else if (mode === 'ionic') {
      apparatus = `<rect x="184" y="99" width="12" height="175" rx="4" fill="url(#s-metal)"/><rect x="681" y="99" width="12" height="175" rx="4" fill="url(#s-metal)"/><path d="M190 275V303H345M687 275V303H422" fill="none" stroke="#7795a6" stroke-width="2"/><rect x="345" y="286" width="77" height="33" rx="5" fill="#243846" stroke="#7996a7"/>${label(383,307,'Voltage', '#c4d5df', 12)}`;
      effect = Array.from({length:12}, (_,i) => `<g class="s-ion" style="--dx:445px;animation-delay:-${i*.43}s;--still-x:${i%6*68}px"><circle cx="211" cy="${136+i%3*47}" r="6" fill="#e7b070"/><path d="M208 ${136+i%3*47}h6m-3-3v6" stroke="#18252c" stroke-width="1.5"/></g>`).join('');
      effect += Array.from({length:18}, (_,i) => `<circle class="s-gas" cx="240" cy="${125+i%4*34}" r="2.5" fill="#a1d6eb" style="--dx:412px;animation-delay:-${i*.4}s;--still-x:${i%7*56}px"/>`).join('');
      effect += '<path d="M245 84H620" fill="none" stroke="#9ac5da" marker-end="url(#s-arrow)"/>';
      labels = `${label(147,79,'Positive (+)')}${label(687,79,'Negative (−)')}${label(432,64,'Field and positive-ion motion →')}${label(400,349,'Gold: positive ions     Blue: neutral gas     Motion is exaggerated', '#8fabbc', 12)}`;
    } else {
      apparatus = `<rect x="84" y="111" width="116" height="165" rx="10" fill="url(#s-metal)" stroke="#8da6b6"/><circle cx="142" cy="202" r="45" fill="#101a22" stroke="#6d8c9e" stroke-width="5"/><circle class="s-oscillation" cx="142" cy="202" r="25" fill="#395464" stroke="#9bb7c7"/><circle cx="142" cy="141" r="12" fill="#101a22" stroke="#607b8b"/>`;
      effect = Array.from({length:4}, (_,i) => `<path class="s-wave" d="M225 124Q285 194 225 264" fill="none" stroke="#79b7d4" stroke-width="2" style="animation-delay:-${i*.9}s;--still-x:${i*76}px"/>`).join('');
      effect += Array.from({length:18}, (_,i) => {const x=304+i%6*48,y=140+Math.floor(i/6)*51;return `<path d="M${x-11} ${y}H${x+11}" stroke="#496676"/><circle class="s-oscillation" cx="${x}" cy="${y}" r="3" fill="#c0e8f6" style="animation-delay:-${i%6*.12}s"/>`;}).join('');
      effect += '<path d="M280 97H650" stroke="#8ab5c9" marker-end="url(#s-arrow)"/>';
      labels = `${label(142,307,'Speaker')}${label(470,77,'The wave travels →')}${label(400,349,'Blue dots: gas oscillation     Curved lines: pressure disturbance', '#8fabbc', 12)}`;
    }
    svg.setAttribute('viewBox', '0 0 800 380');
    svg.setAttribute('aria-label', scenario.description);
    svg.classList.add('apparatus-scene');
    svg.innerHTML = `<defs><linearGradient id="s-fire" x2="0" y2="1"><stop stop-color="#ffd59b"/><stop offset=".48" stop-color="#efa25d"/><stop offset="1" stop-color="#9b482a" stop-opacity=".5"/></linearGradient><radialGradient id="s-glow"><stop stop-color="#e9a162" stop-opacity=".24"/><stop offset="1" stop-color="#e9a162" stop-opacity="0"/></radialGradient><linearGradient id="s-metal" x2="1" y2="0"><stop stop-color="#293e4b"/><stop offset=".4" stop-color="#577484"/><stop offset="1" stop-color="#233742"/></linearGradient><marker id="s-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#a1d6eb" stroke-width="2"/></marker><marker id="s-heat-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="#ecb47d" stroke-width="2"/></marker></defs>
      <rect x="24" y="22" width="752" height="342" rx="12" fill="#0b151c" stroke="#2d414d"/>
      <path d="M65 275H735" stroke="#3c5361" stroke-width="2"/>
      <ellipse cx="528" cy="206" rx="98" ry="78" fill="url(#s-glow)"/>
      <g class="${mode==='ionic'?'s-ionic-flame':mode==='acoustic'?'s-acoustic-flame':'s-cooling'}"><g class="s-flame"><path d="M484 250C450 222 476 179 497 166C482 201 513 198 512 172C514 146 529 136 535 124C535 166 577 182 572 217C588 204 588 192 586 185C609 234 573 258 545 263Z" fill="url(#s-fire)"/><path d="M510 253C488 230 510 201 521 194C518 220 540 216 542 198C562 226 554 249 542 260Z" fill="#ffe3b3" opacity=".65"/></g></g>
      <rect x="473" y="260" width="113" height="15" rx="2" fill="#849398"/>
      <path d="M482 263l12 9m8-9 12 9m8-9 12 9m8-9 12 9m8-9 12 9" stroke="#3d5059"/>
      ${apparatus}${effect}${label(530,307,'Heated fuel surface')}${labels}`;
    document.getElementById('scene-description').textContent = scenario.description;
    reading.innerHTML = scenario.steps.map(([title,description],i)=>`<div><strong><span class="reading-number">0${i+1}</span>${title}</strong><p>${description}</p></div>`).join('');
    motion();
  }
  toggle.addEventListener('click', () => { paused = !paused; motion(); });
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', render));
  reduced.addEventListener('change', () => { paused = reduced.matches; motion(); });
  new IntersectionObserver(entries => svg.classList.toggle('simulation-offscreen', !entries[0].isIntersecting)).observe(svg);
  document.addEventListener('visibilitychange', () => svg.classList.toggle('simulation-hidden', document.hidden));
  render();
})();
