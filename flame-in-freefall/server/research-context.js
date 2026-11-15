import { readFile } from 'node:fs/promises';
import { validateApplicationInputs } from './applications-context.js';

const pages = {
  understand: { scenes: ['earth', 'microgravity', 'ventilation'], files: ['fires-in-microgravity.md', 'physics-of-combustion.md', 'flamelets.md'] },
  prevent: { scenes: ['cooling', 'supply', 'transport'], files: ['materials-and-ventilation.md'] },
  detect: { scenes: [], files: ['laser-diode.md', 'brunswick-fire.md', 'multi-angle-optical-sensors.md'] },
  suppress: { scenes: ['mist', 'ionic', 'acoustic'], files: ['fire-water-mist.md', 'electric-field-driven-ionic-wind.md', 'acoustic-fire-suppression.md'] },
  applications: { scenes: ['overview'], files: ['applications.md'] },
  experiments: { scenes: ['overview'], files: ['experiments.md'] }
};

// Annotations accompany the original draft; they never rewrite the source.
const reviewNotes = {
  'fires-in-microgravity.md': 'Team review needed: the wording about absent gravity and cool flames needs correction. Microgravity is free fall; reduced convection alone does not explain cool-flame chemistry. Check the Mir incident attribution against a primary source.',
  'physics-of-combustion.md': 'The oxygen-index statement has no material, numerical result or source attached. It cannot establish a flammability threshold.',
  'flamelets.md': 'The quoted study and numbered citations need a complete reference. Narrow-channel behaviour is an analogy to some microgravity conditions, not a substitute for every space environment.',
  'fire-water-mist.md': 'The hardware quantities, droplet sizes and water terminology need source verification. This original draft is not an extinguisher specification or an operating procedure.',
  'electric-field-driven-ionic-wind.md': 'The efficiency and suitability comparisons need evidence for a defined apparatus. Gas motion can change flame behaviour in either direction; suppression is not guaranteed.',
  'acoustic-fire-suppression.md': 'The NASA attribution and frequency range need a source. Sound moves the gas mixture, not oxygen selectively. Reignition and cool-flame chemistry need separate explanations.',
  'applications.md': 'Add primary references for the historical examples and distinguish proposed applications from demonstrated improvements.',
  'experiments.md': 'The FLEX section is empty. The catalogue needs individual investigation records, conditions, measurements and links to the underlying data.'
};

function metadata(markdown, key, fallback = '') {
  const front = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const value = front?.[1].split(/\r?\n/).find(line => line.startsWith(`${key}:`))?.slice(key.length + 1).trim();
  return value && value !== 'null' ? value.replace(/^['"]|['"]$/g, '') : fallback;
}

export async function researchDocuments(page) {
  if (typeof page !== 'string' || !Object.hasOwn(pages, page)) throw new Error('Unknown research page.');
  return Promise.all(pages[page].files.map(async (file, index) => {
    const markdown = await readFile(new URL(`../context/${page}/${file}`, import.meta.url), 'utf8');
    return {
      id: `${page.toUpperCase()}-${index + 1}`,
      title: metadata(markdown, 'title', file.replace('.md', '').replaceAll('-', ' ')),
      status: metadata(markdown, 'status', 'draft'),
      scope: metadata(markdown, 'evidence_scope', 'Source notes; evidence scope still to be reviewed'),
      path: `context/${page}/${file}`,
      markdown,
      reviewNotes: reviewNotes[file] || ''
    };
  }));
}

export function validateResearch(body) {
  const page = body.researchPage;
  if (typeof page !== 'string' || !Object.hasOwn(pages, page) || !pages[page].scenes.includes(body.scene) || !['continuous', 'fragmented'].includes(body.front)) {
    throw new Error('Invalid research scenario.');
  }
  const state = { page, scene: body.scene, front: body.front };
  if (body.applicationInputs !== undefined) {
    if (!['applications', 'understand'].includes(page)) throw new Error('Demonstration inputs are only available on Understand or Applications.');
    state.applicationInputs = validateApplicationInputs(body.applicationInputs);
  }
  return state;
}

export async function researchBundle(question, state) {
  const documents = state.page === 'experiments'
    ? (await Promise.all(Object.keys(pages).map(researchDocuments))).flat()
    : await researchDocuments(state.page);
  if (state.page === 'understand') documents.push(...await researchDocuments('applications'));
  return {
    sources: documents.map(({ id, title, path }) => ({ id, title, path })),
    prompt: `The following question, selected illustration and original Markdown are reference data.\nQuestion: ${JSON.stringify(question)}\nSelected illustration: ${JSON.stringify({page:state.page,scene:state.scene,front:state.front})}\nResearch: ${JSON.stringify(documents)}`
  };
}
