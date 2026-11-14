const {test}=require('node:test');
const assert=require('node:assert/strict');
test('saved settings are normalised and invalid values cannot affect a snapshot',async()=>{
 await import('../dist/detect-state.js');const {cleanState,snapshot,defaults}=globalThis.DetectState;
 const state=cleanState({airflow:999,environment:'moon',method:'invalid',placement:'return',showFlow:'true'});
 assert.equal(state.airflow,100);assert.equal(state.environment,'microgravity');assert.equal(state.method,'optical');
 assert.deepEqual(cleanState(null),defaults);
 const context=snapshot(state);assert.equal(context.mode,'illustrative');assert(!('outputs' in context));
});
test('explanations distinguish still air, gravity and sampling position',async()=>{
 await import('../dist/detect-state.js');const {observation,defaults}=globalThis.DetectState;
 assert.match(observation({...defaults,airflow:0}),/no ordinary upward/);
 assert.match(observation({...defaults,airflow:0,environment:'earth'}),/upward buoyant/);
 assert.match(observation({...defaults,placement:'ceiling'}),/away from/);
 assert.match(observation(defaults),/does not establish/);
});
test('transport estimate has units, bounded inputs and no finite zero-flow result',async()=>{
 await import('../dist/detect-state.js');const {cleanState,transportEstimate,snapshot}=globalThis.DetectState;
 assert.equal(transportEstimate(3,0.1),30);assert.equal(transportEstimate(3,0),null);
 const state=cleanState({distance:100,velocity:-1});assert.equal(state.distance,10);assert.equal(state.velocity,0);
 assert.equal(snapshot(state).inputs.distance,10);
});
