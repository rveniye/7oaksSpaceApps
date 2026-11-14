import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { generate, publicError } from './gemini.js';
import { evidence, researchPrompt, instruction } from './evidence.js';
import { validateContext, detectPrompt, agentInstruction, parseAgentResponse } from './detect-context.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png' };
export function createHandler(answer = generate) {
  let busy = false, requests = [];
  return async (req, res) => {
    const send = (status, body) => { res.writeHead(status, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(body)); };
    res.setHeader('X-Content-Type-Options','nosniff');
    const origin = req.headers.origin;
    const localOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (origin && !localOrigin && origin !== process.env.ALLOWED_ORIGIN) return send(403,{error:'This website origin is not allowed.'});
    if (origin) { res.setHeader('Access-Control-Allow-Origin',origin); res.setHeader('Vary','Origin'); }
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') {
      res.writeHead(204,{'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();
    }
    if (url.pathname === '/api/health') return send(200,{status:'running', authentication:'ADC', geminiVerified:false});
    if (url.pathname === '/api/ask') {
      if (req.method !== 'POST') return send(405,{error:'Use POST.'});
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415,{error:'Use application/json.'});
      let body='';
      try {
        for await (const chunk of req) { body+=chunk; if(Buffer.byteLength(body)>8192)return send(413,{error:'Question is too large.'}); }
        body=JSON.parse(body);
      } catch { return send(400,{error:'Invalid JSON.'}); }
      if(!body||typeof body!=='object'||Array.isArray(body))return send(400,{error:'Expected a JSON object.'});
      if(typeof body.question!=='string'||!body.question.trim()||body.question.length>2000)return send(400,{error:'Enter a question between 1 and 2,000 characters.'});
      let context;
      if(body.context!==undefined){try{context=validateContext(body.context);}catch(error){return send(400,{error:error.message});}}
      requests=requests.filter(t=>Date.now()-t<60000);
      if(busy||requests.length>=6)return send(429,{error:'Please wait before asking another question.'});
      busy=true;requests.push(Date.now());
      try {
        const bundle=context?await detectPrompt(body.question.trim(),context,body.agent===true):{prompt:researchPrompt(body.question.trim()),sources:evidence};
        const isAgent=Boolean(context&&body.agent===true);
        const raw=await answer(bundle.prompt+(isAgent?'\nCurrent ideal transport estimate: '+(context.inputs.velocity>0?(context.inputs.distance/context.inputs.velocity).toFixed(2)+' s':'No finite advective arrival at zero speed'):''),instruction+(isAgent?'\n'+agentInstruction():''));
        const parsed=isAgent?parseAgentResponse(raw):{answer:raw,actions:[]};
        const text=parsed.answer;
        const cited=bundle.sources.filter(item=>text.includes(`[${item.id}]`));
        return send(200,{answer:text,actions:parsed.actions,sources:cited,scope:context?'Draft detection notes and illustrative scenario; not a validated prediction.':'Curated starter summaries; no numerical run data.'});
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
