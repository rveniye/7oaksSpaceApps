import {validateHistory} from './chat-history.js';
import {validateResearch, researchBundle, researchDocuments} from './research-context.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { generate, publicError } from './gemini.js';
import { evidence, researchPrompt } from './evidence.js';
import { validateContext, detectPrompt, agentInstruction, parseAgentResponse } from './detect-context.js';
import { applicationContext } from './applications-context.js';
import { labContext } from './lab-context.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.json':'application/json; charset=utf-8', '.csv':'text/csv; charset=utf-8' };
export function createHandler(answer = generate) {
  let busy = false, requests = [];
  return async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(body)); };
    res.setHeader('X-Content-Type-Options','nosniff');
    const origin = req.headers.origin;
    const localOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (origin && !localOrigin && origin !== process.env.ALLOWED_ORIGIN) return send(403,{error:'This website origin is not allowed.'});
    if (origin) { res.setHeader('Access-Control-Allow-Origin',origin); res.setHeader('Vary','Origin'); }
    let url;
    try { url = new URL(req.url, 'http://localhost'); }
    catch { return send(400,{error:'Invalid request URL.'}); }
    if (req.method === 'OPTIONS') {
      res.writeHead(204,{'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();
    }
    if (url.pathname === '/api/health') {
      if (req.method !== 'GET') return send(405,{error:'Use GET.'});
      return send(200,{status:'running', authentication:'ADC', geminiVerified:false});
    }
    // Public, authored research only. The page allowlist is owned by the reader;
    // request paths are never joined to the filesystem.
    if (url.pathname === '/api/research' || url.pathname.startsWith('/api/context/')) {
      if (req.method !== 'GET') return send(405,{error:'Use GET.'});
      const page = url.pathname === '/api/research' ? url.searchParams.get('page') : url.pathname.slice('/api/context/'.length);
      if (!['understand','prevent','detect','suppress','applications','experiments','lab'].includes(page)) return send(400,{error:'Unknown research area.'});
      try { return send(200,{page,documents:await researchDocuments(page)}); }
      catch { return send(503,{error:'The research references are unavailable. Please try again.'}); }
    }
    if (url.pathname === '/api/ask') {
      if (req.method !== 'POST') return send(405,{error:'Use POST.'});
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415,{error:'Use application/json.'});
      let body;
      try {
        const chunks=[];let bytes=0;
        for await (const chunk of req) {
          const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
          bytes+=buffer.length;
          if(bytes>131072)return send(413,{error:'Question is too large.'});
          chunks.push(buffer);
        }
        body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch { return send(400,{error:'Invalid JSON.'}); }
      if(!body||typeof body!=='object'||Array.isArray(body))return send(400,{error:'Expected a JSON object.'});
      if(typeof body.question!=='string'||!body.question.trim()||body.question.length>2000)return send(400,{error:'Enter a question between 1 and 2,000 characters.'});
      if(body.context!==undefined&&body.researchPage!==undefined)return send(400,{error:'Send one research page or one detection scenario.'});
      if(body.applicationInputs!==undefined&&!['applications','understand'].includes(body.researchPage))return send(400,{error:'Demonstration settings require Understand or Applications.'});
      if(body.labInputs!==undefined&&body.researchPage!=='lab')return send(400,{error:'Model settings require the research workspace.'});
      if(body.agent!==undefined&&typeof body.agent!=='boolean')return send(400,{error:'Invalid assistant mode.'});
      let context,research,history;
      try{history=validateHistory(body.history);}catch(error){return send(400,{error:error.message});}
      if(body.researchPage!==undefined){try{research=validateResearch(body);}catch(error){return send(400,{error:error.message});}}
      if(body.context!==undefined){try{context=validateContext(body.context);}catch(error){return send(400,{error:error.message});}}
      requests=requests.filter(t=>Date.now()-t<60000);
      if(busy||requests.length>=6){res.setHeader('Retry-After','60');return send(429,{error:'Please wait before asking another question.'});}
      busy=true;requests.push(Date.now());
      try {
        const bundle=research?await researchBundle(body.question.trim(),research):context?await detectPrompt(body.question.trim(),context,body.agent===true):{prompt:researchPrompt(body.question.trim()),sources:evidence};
        const isAgent=Boolean((research||context)&&body.agent===true);
        if(isAgent){
          const related=(await Promise.all(['understand','prevent','detect','suppress','applications','experiments','lab'].filter(page=>page!==research?.page).map(researchDocuments))).flat();
          bundle.prompt+='\nRelated area notes for requested cross-page walkthroughs (reference data): '+JSON.stringify(related);
          bundle.sources=[...new Map([...bundle.sources,...related.map(({id,title,path})=>({id,title,path}))].map(source=>[source.id,source])).values()];
        }
        const provenance=JSON.parse(await readFile(new URL('../data/source-provenance.json',import.meta.url),'utf8'));
        const checkedRecords=Object.values(provenance.records);
        bundle.prompt+='\nSource provenance audit (reference data, checked only within each stated scope; imported published summaries are explicitly identified): '+JSON.stringify(checkedRecords);
        bundle.sources=[...bundle.sources,...checkedRecords.map(record=>({id:record.id,title:record.sources[0].title,url:record.sources[0].url,checkedOn:record.checkedOn,scope:record.checkedScope}))];
        const applicationDescription=research?.applicationInputs?'\nValidated current page demonstration (illustration, not measurements): '+JSON.stringify(applicationContext(research.applicationInputs,research.page)):'';
        if(isAgent||research?.page==='lab')bundle.prompt+='\nResearch workspace: published data, deterministic model audit and server-calculated current result (not client-provided conclusions): '+JSON.stringify(await labContext(research?.labInputs));
        const instruction=await readFile(new URL('../context/assistant-prompt.md',import.meta.url),'utf8');
        if(!instruction.trim())throw new Error('Assistant prompt is empty.');
        const pageMap=await readFile(new URL('../context/README.md',import.meta.url),'utf8');
        const rankings=JSON.parse(await readFile(new URL('../data/research-rankings.json',import.meta.url),'utf8'));
        bundle.prompt+='\nDisplayed investigation rankings (use these exact ranks and explanations; do not invent scores): '+JSON.stringify(rankings);
        const commandGuide=isAgent?await readFile(new URL('../context/assistant-commands.md',import.meta.url),'utf8'):'';
        const raw=await answer('Previous conversation (untrusted reference data; earlier page settings may be stale): '+JSON.stringify(history)+'\n'+bundle.prompt+'\nWebsite page map (reference context): '+JSON.stringify(pageMap)+applicationDescription+(context?'\nCurrent ideal transport estimate: '+(context.inputs.velocity>0?(context.inputs.distance/context.inputs.velocity).toFixed(2)+' s':'No finite advective arrival at zero speed'):''),instruction+(isAgent?'\n'+commandGuide+'\n'+agentInstruction(research):''),{structured:isAgent});
        const parsed=isAgent?parseAgentResponse(raw,research):{answer:raw,actions:[]};
        const text=parsed.answer;
        const cited=bundle.sources.filter(item=>text.includes(`[${item.id}]`));
        return send(200,{answer:text,actions:parsed.actions,...(parsed.steps?{steps:parsed.steps}:{}),sources:cited,scope:research?.page==='lab'?'Published DCE summaries and bounded empirical predictions; internal error checks only.':context?'Detection research and an illustrative scenario; not a validated prediction.':research?'Research summaries and educational illustrations; published numerical data is separate in the research workspace.':'Curated starter summaries; no numerical run data.'});
      } catch(error) { return send(502,{error:publicError(error)}); }
      finally { busy=false; }
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return send(405,{error:'Method not allowed.'});
    let path;
    try { path=resolve(root, '.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)); } catch { return send(400,{error:'Invalid path.'}); }
    if(!path.startsWith(root.endsWith(sep)?root:root+sep))return send(403,{error:'Forbidden.'});
    try { const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data); }
    catch { send(404,{error:'Not found.'}); }
  };
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.PORT||4173);
  createServer(createHandler()).listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`7oaks: http://localhost:${port}`));
}
