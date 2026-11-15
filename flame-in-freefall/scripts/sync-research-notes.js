import { writeFile } from 'node:fs/promises';
import { researchDocuments } from '../server/research-context.js';
const pages = ['understand', 'prevent', 'detect', 'suppress', 'applications', 'experiments'];
const documents = Object.fromEntries(await Promise.all(pages.map(async page => [page, await researchDocuments(page)])));
const json = JSON.stringify(documents).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029');
await writeFile(new URL('../dist/research-notes-data.js', import.meta.url), `// Generated from context/*.md by scripts/sync-research-notes.js. Do not edit.\nwindow.ResearchNotesData = ${json};\n`);
console.log(`Synced ${Object.values(documents).flat().length} original Markdown notes.`);
