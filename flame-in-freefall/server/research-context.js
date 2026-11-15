import { readFile } from 'node:fs/promises';
import { validateApplicationInputs } from './applications-context.js';
import { validateLabInputs } from './lab-context.js';

const pages = {
  understand: { scenes: ['earth', 'microgravity', 'ventilation'], files: ['fires-in-microgravity.md', 'physics-of-combustion.md', 'flamelets.md'] },
  prevent: { scenes: ['cooling', 'supply', 'transport'], files: ['materials-and-ventilation.md'] },
  detect: { scenes: [], files: ['laser-diode.md', 'brunswick-fire.md', 'multi-angle-optical-sensors.md'] },
  suppress: { scenes: ['mist', 'ionic', 'acoustic'], files: ['fire-water-mist.md', 'electric-field-driven-ionic-wind.md', 'acoustic-fire-suppression.md', 'ventilation-and-flamelets.md'] },
  applications: { scenes: ['overview'], files: ['applications.md'] },
  experiments: { scenes: ['overview'], files: ['experiments.md'] },
  lab: { scenes: ['overview'], files: ['research-workspace.md'] }
};

// Annotations accompany the original draft; they never rewrite the source.
const reviewNotes = {
  'fires-in-microgravity.md': 'Team review needed: the wording about absent gravity and cool flames needs correction. Microgravity is free fall; reduced convection alone does not explain cool-flame chemistry. Check the Mir incident attribution against a primary source.',
  'physics-of-combustion.md': 'The published FLEX summary supports approximately 12% methanol and 15% heptane LOI in oxygen/nitrogen, not universal or safe cabin limits. Diffusive extinction involves insufficient residence time, not just lack of oxygen. Do not repeat claims that lower-temperature flames are inherently less dangerous or that radical chains are never-ending. Pyrolysis is thermal decomposition; the six-stage list is conceptual rather than a mandatory sequence. The IIT diagram labels r_s as diameter but draws a radius. The page includes these clarifications.',
  'flamelets.md': 'The quoted study and numbered citations need a complete reference. Narrow-channel behaviour is an analogy to some microgravity conditions, not a substitute for every space environment.',
  'fire-water-mist.md': 'The hardware quantities, droplet sizes and water terminology need source verification. This original draft is not an extinguisher specification or an operating procedure.',
  'electric-field-driven-ionic-wind.md': 'The efficiency and suitability comparisons need evidence for a defined apparatus. Gas motion can change flame behaviour in either direction; suppression is not guaranteed.',
  'acoustic-fire-suppression.md': 'The NASA attribution and frequency range need a source. Sound moves the gas mixture, not oxygen selectively. Reignition and cool-flame chemistry need separate explanations.',
  'applications.md': 'Add primary references for the historical examples and distinguish proposed applications from demonstrated improvements.',
  'experiments.md': 'Experiment descriptions are drafts. Verify dates and programme status against primary references. The catalogue still needs individual run records, conditions, measurements and links to underlying data.'
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
  if (body.labInputs !== undefined) {
    if (page !== 'lab') throw new Error('Model settings require the research workspace.');
    state.labInputs = validateLabInputs(body.labInputs);
  }
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
