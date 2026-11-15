(() => {
 const criteria=[['particles','Particle coverage'],['power','Power consumption'],['durability','Durability'],['sensitivity','Detection sensitivity']];
 const missingPower='No verified power specification attached. Rating pending evidence review.';
 const missingLife='No verified service-life evidence attached. Rating pending evidence review.';
 const detectors=[
 {id:'combined',name:'Multi-angle + multi-gas sensor',values:[2,1,2,2],claims:['Conceptual combination, not a verified instrument specification.',missingPower,missingLife,'No measured sensitivity comparison attached.']},
 {id:'optical',name:'Laser-diode forward-scattering detector',values:[0,2,1,0],claims:['SAME reports material-dependent response; no universal size threshold is established here.',missingPower,missingLife,'Response depends on aerosol properties. Draft rating is not a calibration.']},
 {id:'brunswick',name:'Brunswick incipient fire detector',values:[1,0,0,1],claims:['Historical ionisation detector; no universal particle-size interval is established here.',missingPower,missingLife,'No matched performance dataset supports this draft sensitivity rating.']}
 ];
 function rank(weights){const w=criteria.map(([id])=>Number.isFinite(weights?.[id])?Math.min(5,Math.max(0,weights[id])):1),total=w.reduce((a,b)=>a+b,0);return detectors.map(d=>({...d,score:total?100*d.values.reduce((sum,value,i)=>sum+value*w[i],0)/(2*total):null})).sort((a,b)=>(b.score??0)-(a.score??0));}
 globalThis.DetectRanking={criteria,detectors,rank};
 if(typeof document==='undefined')return;
 const weights=Object.fromEntries(criteria.map(([id])=>[id,1])),labels=['Con','Moderate','Good'];
 const tbody=document.getElementById('comparison-body');
 for(let i=0;i<criteria.length;i++){
  const row=document.createElement('tr'),heading=document.createElement('th');heading.scope='row';heading.textContent=criteria[i][1];row.append(heading);
  for(const d of [detectors[1],detectors[2],detectors[0]]){const cell=document.createElement('td'),rating=document.createElement('span'),claim=document.createElement('p');rating.className=`rating rating-${d.values[i]}`;rating.textContent=`${labels[d.values[i]]} · ${d.values[i]} / 2`;claim.textContent=d.claims[i];cell.append(rating,claim);row.append(cell);}tbody.append(row);
 }
 function render(){
  const list=document.getElementById('ranking-results');list.replaceChildren();const results=rank(weights);let previous=null,position=0;
  results.forEach((d,i)=>{const item=document.createElement('li'),number=document.createElement('span'),name=document.createElement('strong'),score=document.createElement('span');if(d.score!==previous||i===0)position=i+1;const tied=results.filter(x=>x.score===d.score).length>1;number.textContent=d.score===null?'—':`${position}${tied?' =':''}`;number.className='rank-position';name.textContent=d.name;score.textContent=d.score===null?'No score':`${Number(d.score.toFixed(1))} / 100`;score.className='rank-score';item.append(number,name,score);list.append(item);previous=d.score;});
  document.getElementById('ranking-status').textContent=results[0].score===null?'Choose at least one priority to calculate a ranking.':'Preliminary assessments weighted by your priorities. No validated performance ranking is available.';
 }
 for(const [id] of criteria){const input=document.getElementById('weight-'+id);input.addEventListener('input',()=>{weights[id]=Number(input.value);document.getElementById('weight-label-'+id).textContent=input.value;render();});}
 document.getElementById('reset-weights').addEventListener('click',()=>{for(const [id] of criteria){weights[id]=1;document.getElementById('weight-'+id).value=1;document.getElementById('weight-label-'+id).textContent='1';}render();});render();
})();
