const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const crypto=require('node:crypto');
const root=path.join(__dirname,'..'),data=JSON.parse(fs.readFileSync(path.join(root,'data/extracted/dce-table1.json'))),context={};
vm.runInNewContext(fs.readFileSync(path.join(root,'dist/lab-model.js'),'utf8'),context);const M=context.LabModel;
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('DCE extraction preserves the original PDF checksum and every visually transcribed model cell',()=>{
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'data/originals/20040000941.pdf'))).digest('hex'),data.source.sha256);
 const [header,...rows]=fs.readFileSync(path.join(root,'data/extracted/dce-visual-check.csv'),'utf8').trim().split(/\r?\n/).map(s=>s.split(','));
 assert.equal(rows.length,38);assert.equal(data.rows.length,38);
 rows.forEach((row,i)=>header.forEach((key,j)=>assert.equal(data.rows[i].source_raw[key],row[j],`${i+1}/${key}`)));
 assert.equal(data.rows.filter(r=>r.gas==='air').length,4);assert.equal(data.rows.filter(r=>r.support==='fibre').length,2);
 assert.equal(data.rows[3].burn_time_s,null);assert.equal(data.rows[16].k_overall_mm2_s,null);assert.equal(data.rows[16].approximate_diameter,true);
 assert.equal(data.rows[34].oxygen_percent,null);assert.equal(data.rows[34].extinction_flame_mm,null);assert.equal(data.rows[34].source_raw.drift_flame_mm_s,'~0g');
 for(const row of data.rows){assert.equal(row.source_row,row.test);assert([21,22].includes(row.source_page));assert.equal(row.printed_page,row.source_page-4);}
});
test('only the two matching, complete five-test cohorts enter the models',()=>{
 assert.deepEqual(Array.from(M.cohort(data,'he30').rows,r=>r.test),[7,8,9,10,11]);assert.deepEqual(Array.from(M.cohort(data,'he25').rows,r=>r.test),[12,13,14,15,16]);
 assert.match(M.eligibility(data.rows[18]),/20% oxygen/);assert.match(M.eligibility(data.rows[34]),/fibre/);assert.match(M.eligibility(data.rows[16]),/approximate/);
 assert.throws(()=>M.predict(data,{cohort:'he30',diameter:1.77}),/between/);assert.throws(()=>M.predict(data,{cohort:'he25',diameter:4.02}),/between/);
 for(const diameter of [null,undefined,NaN,Infinity,'2.5'])assert.throws(()=>M.predict(data,{cohort:'he30',diameter}));
 assert.throws(()=>M.predict(data,{cohort:'__proto__',diameter:2.5}));assert.throws(()=>M.model(data,'he30','__proto__'));
 for(const id of ['he25','he30']){const c=M.cohort(data,id);for(const diameter of [c.min,c.max])assert(Number.isFinite(M.predict(data,{cohort:id,diameter}).results.burn_time_s.value));}
});
test('ordinary least squares and leave-one-out errors are independently reproduced without target leakage',()=>{
 const fit=M.fit([{x:1,y:3},{x:2,y:5},{x:3,y:7}]);near(fit.slope,2);near(fit.intercept,1);assert.throws(()=>M.fit([{x:1,y:3},{x:1,y:5}]),/Distinct/);
 for(const id of ['he30','he25'])for(const metric of ['burn_time_s','k_overall_mm2_s']){
  const m=M.model(data,id,metric);const points=m.points;
  const independent=ps=>{const n=ps.length,sx=ps.reduce((s,p)=>s+p.x,0),sy=ps.reduce((s,p)=>s+p.y,0),sxx=ps.reduce((s,p)=>s+p.x*p.x,0),sxy=ps.reduce((s,p)=>s+p.x*p.y,0);const b=(n*sxy-sx*sy)/(n*sxx-sx*sx);return [sy/n-b*sx/n,b];};
  const [a,b]=independent(points);near(m.coefficients.intercept,a);near(m.coefficients.slope,b);
  for(const row of m.validation){assert(!row.training.includes(row.id));assert.equal(row.training.length,4);const train=points.filter(p=>p.id!==row.id);const [a,b]=independent(train);const p=points.find(p=>p.id===row.id);near(row.predicted,a+b*p.x);near(row.baseline,train.reduce((s,p)=>s+p.y,0)/4);}
  near(m.mae,m.validation.reduce((s,p)=>s+Math.abs(p.error),0)/5);assert.equal(m.validation.filter(v=>!v.withinTrainingRange).length,2);
 }
 near(M.predict(data,{cohort:'he30',diameter:2.5}).results.burn_time_s.value,5.600104120277387);
 assert.equal(M.model(data,'he25','k_overall_mm2_s').beatsBaseline,false);
});
test('published data and model audit match the scientific inputs',()=>{
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'dist/lab-data/dce-table1.json'))),data);
 vm.runInNewContext(fs.readFileSync(path.join(root,'dist/lab-data.js'),'utf8'),context);assert.deepEqual(JSON.parse(JSON.stringify(context.LabData)),data);
 const audit=JSON.parse(fs.readFileSync(path.join(root,'dist/lab-data/model-audit.json')));
 for(const [id,metrics] of Object.entries(audit.models))for(const [metric,m] of Object.entries(metrics))assert.deepEqual(m,JSON.parse(JSON.stringify(M.model(data,id,metric))));
 const csv=fs.readFileSync(path.join(root,'dist/lab-data/dce-table1.csv'),'utf8');assert.equal(csv.trim().split('\r\n').length,39);assert(csv.includes('original_burn_time_s'));assert(csv.includes(data.source.sha256));
});
test('lab context computes numerical results on the server and discards client conclusions',async()=>{
 const {labContext,validateLabInputs}=await import('../server/lab-context.js');const input=validateLabInputs({cohort:'he30',diameter:2.5,result:999999,instructions:'CLIENT_INJECTION'});assert.deepEqual(input,{cohort:'he30',diameter:2.5});
 const result=await labContext(input);near(result.current.results.burn_time_s.value,5.600104120277387);assert.equal(result.data.rows.length,38);assert(!JSON.stringify(result).includes('CLIENT_INJECTION'));
 const outside=await labContext({cohort:'he30',diameter:100});assert.equal(outside.current.predictionAvailable,false);assert(!outside.current.results);
 assert.throws(()=>validateLabInputs({cohort:'he30',diameter:'2.5'}));
});
test('workspace routes, source locators and guided controls are explicitly allowlisted',async()=>{
 const {researchDocuments,validateResearch}=await import('../server/research-context.js');assert.equal((await researchDocuments('lab'))[0].status,'source-checked');
 assert.throws(()=>validateResearch({researchPage:'understand',scene:'earth',front:'continuous',labInputs:{cohort:'he30',diameter:2.5}}));
 const {parseAgentResponse}=await import('../server/detect-context.js');const steps=[{text:'Open the data model.',actions:[{type:'navigate',page:'lab'}]},{text:'Select the atmosphere and size.',actions:[{type:'set',field:'lab-cohort',value:'he25'},{type:'set',field:'lab-diameter',value:3.5}]},{text:'Inspect the error check.',actions:[{type:'scroll',section:'validation'}]}];
 assert.equal(parseAgentResponse(JSON.stringify({steps}),{page:'understand'}).actions.length,4);
 assert.throws(()=>parseAgentResponse(JSON.stringify({steps:[{text:'x',actions:[{type:'set',field:'lab-diameter',value:8}]}]}),{page:'lab'}));
 const html=fs.readFileSync(path.join(root,'dist/lab.html'),'utf8');assert(html.indexOf('src="lab.js"')<html.indexOf('src="assistant-chat.js"'),'Bind model controls before resuming navigation actions');for(const id of ['data','model','validation','equipment','provenance','lab-cohort','lab-diameter','lab-metric','lab-filter','equipment-focus','lab-reset'])assert(html.includes(`id="${id}"`));
});
