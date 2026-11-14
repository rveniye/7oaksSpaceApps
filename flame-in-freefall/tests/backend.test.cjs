const {test}=require('node:test');
const assert=require('node:assert/strict');
async function request(handler, body, options={}){
  const req={method:options.method||'POST',url:options.url||'/api/ask',headers:{'content-type':'application/json',...options.headers},async *[Symbol.asyncIterator](){yield typeof body==='string'?body:JSON.stringify(body);}};
  const result={headers:{}};
  const res={setHeader(k,v){result.headers[k]=v;},writeHead(status,headers){result.status=status;Object.assign(result.headers,headers);},end(data){result.data=data;}};
  await handler(req,res);return result;
}
test('rejects invalid questions and foreign origins before model calls',async()=>{
  const {createHandler}=await import('../server/index.js');let calls=0;
  const handler=createHandler(async()=>{calls++;return 'answer';});
  assert.equal((await request(handler,{question:''})).status,400);
  assert.equal((await request(handler,'{bad')).status,400);
  assert.equal((await request(handler,{question:'x'.repeat(9000)})).status,413);
  assert.equal((await request(handler,{question:'hello'},{headers:{origin:'https://untrusted.example'}})).status,403);
  assert.equal(calls,0);
});
test('returns only known cited sources and passes evidence to the model',async()=>{
  const {createHandler}=await import('../server/index.js');
  const handler=createHandler(async(prompt,instruction)=>{
    assert(prompt.includes('BASS-II'));assert(instruction.includes('Do not invent'));
    return 'Solid fuel research [BASS-II]. Unknown citation [FAKE].';
  });
  const response=await request(handler,{question:'What did BASS study?'});
  assert.equal(response.status,200);
  assert.deepEqual(JSON.parse(response.data).sources.map(s=>s.id),['BASS-II']);
});
test('upstream failures never expose credentials or raw error bodies',async()=>{
  const {createHandler}=await import('../server/index.js');
  const handler=createHandler(async()=>{throw new Error('secret-token-do-not-expose');});
  const result=await request(handler,{question:'hello'});
  assert.equal(result.status,502);assert(!result.data.includes('secret-token'));
});
test('credentials and backend code cannot be served as static files',async()=>{
  const {createHandler}=await import('../server/index.js');
  const handler=createHandler();
  for(const url of ['/server/gemini.js','/.env','/..%2fserver/gemini.js']){
    const response=await request(handler,{}, {method:'GET',url});
    assert([403,404].includes(response.status));
  }
});
