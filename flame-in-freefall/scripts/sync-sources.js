import {readFile,writeFile} from 'node:fs/promises';
const data=JSON.parse(await readFile(new URL('../data/source-provenance.json',import.meta.url),'utf8'));
await writeFile(new URL('../dist/source-provenance.js',import.meta.url),'// Generated from data/source-provenance.json; run npm run sync:sources.\nglobalThis.SourceProvenance = '+JSON.stringify(data,null,2)+';\n');
console.log('Source provenance copied to the browser. This does not re-verify external sources.');
