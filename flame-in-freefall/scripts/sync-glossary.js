import {readFile,writeFile} from 'node:fs/promises';
export function parseExperiments(markdown){
 const text=markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/,''),entries=[];
 for(const match of text.matchAll(/^#\s+(.+)\r?\n([\s\S]*?)(?=^#\s|$(?![\s\S]))/gm)){
  const title=match[1].trim(),description=match[2].trim().replace(/\r?\n\s*\r?\n/g,'\n\n');
  entries.push({term:title,description,source:'context/experiments/experiments.md',draft:/^status:\s*draft\s*$/m.test(markdown)});
 }
 return entries;
}
const markdown=await readFile(new URL('../context/experiments/experiments.md',import.meta.url),'utf8');
const entries=parseExperiments(markdown);
const json=JSON.stringify(entries,null,2).replaceAll('<','\\u003c');
await writeFile(new URL('../dist/experiment-definitions.js',import.meta.url),`// Generated from context/experiments/experiments.md. Run npm run sync:glossary.\nwindow.ExperimentDefinitions = ${json};\n`);
console.log(`Synced ${entries.length} experiment descriptions from experiments.md.`);
