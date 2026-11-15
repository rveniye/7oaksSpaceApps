(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const page = document.body.dataset.researchPage;
  // The Detect explorer owns its more detailed simulation state and assistant.
  if (!page || page === 'detect') return;
  let scene = { understand: 'earth', prevent: 'cooling', suppress: 'mist' }[page] || 'overview';
  let front = 'continuous';
  let revision = 0;
  function applicationInputs() {
    if (!['applications', 'understand'].includes(page)) return undefined;
    const engine = [...document.querySelectorAll('[data-engine]')].find(button => button.getAttribute('aria-pressed') === 'true');
    return {
      stage: Number($('flame-stage')?.value || 0),
      enhance: $('enhance-cool')?.checked ?? true,
      formation: $('soot-formation')?.value || 'high',
      oxidation: $('soot-oxidation')?.value || 'low',
      engine: Number(engine?.dataset.engine || 0)
    };
  }
  let applicationFingerprint = JSON.stringify(applicationInputs());
  function markEarlierAnswer() {
    if ($('ai-result') && !$('ai-result').hidden) {
      $('ai-status').textContent = 'The demonstration has changed. This answer describes an earlier selection; ask again to explain the current view.';
    }
  }
  if (['applications', 'understand'].includes(page)) document.addEventListener('applicationstatechange', () => {
    const next = JSON.stringify(applicationInputs());
    if (next !== applicationFingerprint) {
      revision++;
      applicationFingerprint = next;
      markEarlierAnswer();
    }
  });
  const descriptions = {
    earth: 'Hot gases expand and become less dense than the surrounding air. Buoyancy carries them upwards, drawing fresh air towards the flame and stretching it into a teardrop.',
    microgravity: 'Without strong buoyant rise, oxygen reaches a small flame mainly through diffusion in a still atmosphere. The idealised reaction zone surrounds the fuel instead of extending upwards.',
    ventilation: 'Ventilation supplies a directed flow even in microgravity. This flow transports oxygen, fuel vapour and heat, changing the flame shape. Spherical flames are therefore not universal.',
    cooling: 'Air passes through the equipment space and carries heat towards the return. Actual cooling depends on heat load and airflow distribution.',
    supply: 'The same airflow also brings oxygen to a potential combustion region. Increasing ventilation does not automatically reduce fire risk.',
    transport: 'Smoke travels with the air towards the return-side detector. Real paths depend on the cabin geometry; transport to a detector must be evaluated.',
    mist: 'Water breaks into small droplets. As they heat and evaporate, they absorb energy from the combustion region. The blue dots represent mist, not measured droplet sizes or an extinguishment prediction.',
    ionic: 'An electric field acts on charged particles. Collisions transfer momentum to neutral gas molecules, producing ionic wind. The arrows show gas motion, not a guarantee of suppression.',
    acoustic: 'Sound produces oscillating disturbances in the surrounding gas. These disturbances can change flame behaviour. The expanding arcs represent sound; no sound is played and no suppression threshold is calculated.'
  };
  function selectScene(value) {
    if (scene !== value) { revision++; markEarlierAnswer(); }
    scene = value;
    if ($('scene-description')) $('scene-description').textContent = descriptions[scene] || '';
    document.querySelectorAll('[data-scene]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.scene === scene)));
  }
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => selectScene(button.dataset.scene)));
  if ($('flame-front')) {
    $('flame-front').replaceChildren(...Array.from({ length: 7 }, () => document.createElement('i')));
    document.querySelectorAll('[data-front]').forEach(button => button.addEventListener('click', () => {
      if (front !== button.dataset.front) { revision++; markEarlierAnswer(); }
      front = button.dataset.front;
      $('channel').classList.toggle('fragmented', front === 'fragmented');
      document.querySelectorAll('[data-front]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      $('front-description').textContent = front === 'fragmented'
        ? 'Heat loss or limited oxygen can weaken a broad flame front until separate small flames remain. The spaces between these flamelets are non-burning regions.'
        : 'A connected flame front spreads along the fuel surface. Select the near-limit example to see the front separated into smaller flames.';
    }));
  }
  selectScene(scene);
  // Each visual script draws its own apparatus. This module only owns state/copy.
  if (!$('agent-toggle') || !$('explain-form')) return;
  function open(value) {
    $('agent-panel').hidden = !value;
    $('agent').classList.toggle('is-open', value);
    $('agent-toggle').setAttribute('aria-expanded', String(value));
    $('agent-toggle').setAttribute('aria-label', value ? 'Close research assistant' : 'Open research assistant');
    (value ? $('question') : $('agent-toggle')).focus({preventScroll:true});
  }
  $('agent-toggle').addEventListener('click', () => open($('agent-panel').hidden));
  $('agent-close').addEventListener('click', () => open(false));
  $('agent').addEventListener('keydown', event => { if (event.key === 'Escape') open(false); });
  const destinations = {
    home: ['index.html', 'Research overview'], understand: ['understand.html', 'Understand'],
    prevent: ['prevent.html', 'Prevent'], detect: ['detect.html', 'Detect'],
    suppress: ['suppress.html', 'Suppress'], applications: ['earth.html', 'Applications']
  };
  function showActions(actions, allowMutations) {
    const output = $('agent-actions');
    if (!output) return;
    output.replaceChildren();
    for (const action of Array.isArray(actions) ? actions.slice(0, 6) : []) {
      if (action?.type === 'navigate' && Object.hasOwn(destinations, action.page)) {
        const [href, label] = destinations[action.page];
        const link = document.createElement('a');
        link.href = href;
        link.textContent = `Open ${label} →`;
        link.className = 'assistant-navigation';
        output.append(link);
      } else if (allowMutations && action?.type === 'set' && ['scene', 'front'].includes(action.field)) {
        const control = [...document.querySelectorAll(`[data-${action.field}]`)].find(button => button.dataset[action.field] === action.value);
        if (control) {
          control.click();
          const update = document.createElement('span');
          update.textContent = `Showing: ${control.textContent.trim()}. `;
          output.append(update);
        }
      }
    }
  }
  $('explain-form').addEventListener('submit', async event => {
    event.preventDefault();
    const question = $('question').value.trim();
    if (!question) return;
    if (window.AssistantChat && await window.AssistantChat.tryRepeat(question)) return;
    const button = event.currentTarget.querySelector('[type=submit]');
    button.disabled = true;
    $('ai-result').hidden = true;
    $('agent-actions')?.replaceChildren();
    $('ai-status').textContent = 'Preparing your explanation…';
    const chatTicket = window.AssistantChat?.begin(question);
    const sentRevision = revision;
    const sentApplicationInputs = applicationInputs();
    try {
      if (location.protocol === 'file:' && !window.SEVENOAKS_API_BASE) throw Error('The research assistant needs the local server. Open this page at http://localhost:4173 after running npm start.');
      const response = await fetch((window.SEVENOAKS_API_BASE || '').replace(/\/$/, '') + '/api/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, researchPage: page, scene, front, agent: true, applicationInputs: sentApplicationInputs, history: chatTicket?.history }),
        signal: AbortSignal.timeout(60000)
      });
      if (!response.headers.get('content-type')?.includes('application/json')) throw Error('The research assistant is not connected. Please check the backend connection.');
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Unable to answer.');
      if (window.AssistantChat) {
        const stale = sentRevision !== revision || JSON.stringify(sentApplicationInputs) !== JSON.stringify(applicationInputs());
        const active = await window.AssistantChat.complete(data, chatTicket, {apply:!stale});
        if (!active) return;
        $('ai-status').textContent = stale ? 'Your selection changed; the answer refers to the earlier view. Actions were skipped.' : 'Response complete. Action results are shown with the answer.';
        if (stale) window.AssistantChat.report('Actions skipped because the demonstration changed while the response was being prepared.');
        return;
      }
      $('ai-answer').textContent = data.answer;
      $('ai-sources').replaceChildren();
      for (const source of Array.isArray(data.sources) ? data.sources : []) {
        const li = document.createElement('li');
        li.textContent = source.title;
        $('ai-sources').append(li);
      }
      const stale = sentRevision !== revision || JSON.stringify(sentApplicationInputs) !== JSON.stringify(applicationInputs());
      showActions(data.actions, !stale);
      $('ai-result').hidden = false;
      $('ai-status').textContent = (stale
        ? 'The demonstration changed while this answer was prepared. It describes your earlier selection; suggested control changes were skipped.'
        : 'Response complete.');
    } catch (error) {
      $('ai-status').textContent = error.name === 'TimeoutError' ? 'The request timed out. Please try again.' : error.message;
    } finally { button.disabled = false; }
  });
})();
