const {test}=require('node:test');const assert=require('node:assert/strict');
test('team ranking applies weights, handles ties, and avoids a winner with no priorities',async()=>{
 await import('../dist/detect-ranking.js');const {rank}=globalThis.DetectRanking;
 assert.deepEqual(rank({}).map(d=>[d.id,d.score]),[['combined',87.5],['optical',37.5],['brunswick',25]]);
 assert.equal(rank({particles:0,power:5,durability:0,sensitivity:0})[0].id,'optical');
 assert(rank({particles:0,power:0,durability:0,sensitivity:0}).every(d=>d.score===null));
 const tied=rank({particles:1,power:0,durability:1,sensitivity:0});assert.equal(tied[1].score,tied[2].score);
});
