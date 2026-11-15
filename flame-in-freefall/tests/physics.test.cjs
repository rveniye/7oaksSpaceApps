const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const root=path.join(__dirname,'..');
test('Understand contains the complete physics lesson, accessible equation and attributed diagram',()=>{
 const html=fs.readFileSync(path.join(root,'dist/understand.html'),'utf8');
 for(const id of ['arrhenius','radical-reactions','thermal-decomposition','heat-balance','droplet-physics','extinction-limits'])assert(html.includes(`id="${id}"`),id);
 assert.match(html,/<math[^>]*aria-label=/);assert.match(html,/<mfrac>/);assert.match(html,/Absolute temperature, in kelvin/);
 assert.match(html,/12% for methanol/);assert.match(html,/15% for n-heptane/);assert.match(html,/10\.1007\/s12217-014-9372-2/);
 assert.match(html,/picture|droplet-combustion-iit-kanpur\.jpg/);assert.match(html,/IIT Kanpur Virtual Labs/);assert.match(html,/legend’s “droplet diameter” label is incorrect/);
 assert.doesNotMatch(html,/the notes say|the team showed|significantly less dangerous|never ending chain/i);
 const file=fs.readFileSync(path.join(root,'dist/assets/droplet-combustion-iit-kanpur.jpg'));assert.equal(file[0],0xff);assert.equal(file[1],0xd8);
});
test('assistant can scroll to every physics topic and receives the scoped reference record',async()=>{
 await import('../dist/assistant-actions.js');
 for(const section of ['arrhenius','radical-reactions','thermal-decomposition','heat-balance','droplet-physics','extinction-limits'])assert.equal(globalThis.AssistantActions.clean([{type:'scroll',section}],'understand').length,1);
 const data=JSON.parse(fs.readFileSync(path.join(root,'data/source-provenance.json'),'utf8'));assert.equal(data.records.physics.measurementsImported,false);assert(data.records.physics.issues.length);
});
