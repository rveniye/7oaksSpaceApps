import { generate, project, model, publicError } from './gemini.js';
console.log(`Testing ADC with project ${project} and model ${model}…`);
try {
  if(process.argv.includes('--sources')){
    const {createHandler}=await import('./index.js');let status,result;
    await createHandler()({method:'POST',url:'/api/ask',headers:{'content-type':'application/json'},async *[Symbol.asyncIterator](){yield JSON.stringify({question:'Where does the BASS-II description come from? Use the EVID-BASS provenance record. Explain what was checked and whether numerical run data are loaded, in two sentences.',researchPage:'prevent',scene:'cooling',front:'continuous',agent:true});}},{setHeader(){},writeHead(code){status=code;},end(body){result=JSON.parse(body);}});
    if(status!==200||!result.sources?.some(s=>s.id==='EVID-BASS'&&s.url.endsWith('/PSI-25')))throw Error('Source provenance integration check failed.');
    console.log('Gemini source provenance verified: registered BASS-II reference returned.');
  }else if(process.argv.includes('--agent')){
    const {createHandler}=await import('./index.js');
    const handler=createHandler();
    const payload={question:'Set the flame scene to microgravity and scroll to the flame shape section. Briefly explain the change.',researchPage:'understand',scene:'earth',front:'continuous',agent:true};
    let status,result;
    await handler({method:'POST',url:'/api/ask',headers:{'content-type':'application/json'},async *[Symbol.asyncIterator](){yield JSON.stringify(payload);}},{setHeader(){},writeHead(code){status=code;},end(body){result=JSON.parse(body);}});
    if(status!==200)throw Error(result?.error||'Agent request failed.');
    if(!result.actions.some(a=>a.type==='set'&&a.field==='scene'&&a.value==='microgravity')||!result.actions.some(a=>a.type==='scroll'&&a.section==='shape'))throw Error('Agent did not return the requested actions.');
    if(!result.steps?.length)throw Error('Agent did not return ordered walkthrough steps.');
    if(result.answer.includes('"actions":'))throw Error('Action envelope leaked into answer.');
    console.log('Gemini ordered walkthrough verified: set scene=microgravity; scroll=shape.');
  }else console.log(await generate('Reply with exactly: Gemini connected.', 'This is a connection test.'));
} catch(error) {
  console.error(publicError(error));
  process.exitCode=1;
}
