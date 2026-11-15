(() => {
  'use strict';
  const $=id=>document.getElementById(id),data=globalThis.LabData,model=globalThis.LabModel;
  if(!data||!model||document.body.dataset.researchPage!=='lab')return;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=(value,n=3)=>Number.isFinite(value)?value.toFixed(n):'—';
  let current=null,selection=data.rows;
  const inputs=()=>({cohort:$('lab-cohort').value,diameter:$('lab-size').value.trim()===''?null:Number($('lab-size').value),metric:$('lab-metric').value,filter:$('lab-filter').value,equipmentFocus:$('equipment-focus').value});
  const labels={pressure_bar:'Pressure',oxygen_percent:'Oxygen mole fraction',initial_diameter_mm:'Initial droplet diameter',burn_time_s:'Burn duration',k_initial_mm2_s:'Initial K',k_overall_mm2_s:'Overall K',k_final_mm2_s:'Final K',extinction_flame_mm:'Flame diameter at extinction',extinction_droplet_mm:'Droplet diameter at extinction',drift_flame_mm_s:'Flame drift speed',drift_droplet_mm_s:'Droplet drift speed'};
  window.LabWorkspace={inputs};
  function download(name,contents,type){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function inspect(id){const r=data.rows.find(r=>r.id===id);if(!r)return;
    $('row-detail').innerHTML=`<h3>${r.id} · ${r.flight} · ${r.support==='free'?'free droplet':'fibre-supported droplet'}</h3><p>${esc(model.eligibility(r)||'Used in the '+model.definitions.find(c=>c.oxygen===r.oxygen_percent).label+' model.')}</p><dl class="lab-datum">${Object.entries(data.units).map(([key,unit])=>`<div><dt>${esc(labels[key])} (${key==='oxygen_percent'?'%':esc(unit)})</dt><dd>${esc(r.source_raw[key]||'Blank in source')}</dd></div>`).join('')}</dl><p><a href="${data.source.url}#page=${r.source_page}" target="_blank" rel="noopener">Table 1, test ${r.test} · printed p. ${r.printed_page} / PDF p. ${r.source_page} ↗</a></p>`;
  }
  function table(){const filter=$('lab-filter').value;selection=data.rows.filter(r=>filter==='all'||(filter==='eligible'?!model.eligibility(r):!!model.eligibility(r)));
    $('lab-count').textContent=`${selection.length} of ${data.rows.length} tests`;
    $('lab-rows').innerHTML=selection.map(r=>`<tr><td><button type="button" data-test="${r.id}" aria-label="Inspect ${r.id}">${r.id}</button></td><td>${r.gas==='air'?'Air':'O₂ / He'}</td>${['oxygen_percent','pressure_bar','initial_diameter_mm','burn_time_s','k_overall_mm2_s'].map(k=>`<td>${esc(r.source_raw[k])}</td>`).join('')}<td>${model.eligibility(r)?`<button type="button" data-test="${r.id}" aria-label="Why ${r.id} is excluded">View reason</button>`:'<span class="lab-tag">Included</span>'}</td></tr>`).join('');
    inspect(selection[0]?.id);document.dispatchEvent(new Event('labstatechange'));
  }
  $('lab-rows').addEventListener('click',e=>{const button=e.target.closest('[data-test]');if(button){inspect(button.dataset.test);$('row-detail').closest('details').open=true;}});
  $('lab-filter').addEventListener('input',table);
  $('export-filtered').addEventListener('click',()=>{
    const keys=Object.keys(data.units),headers=['id','flight','fuel','gas','support','gravity',...keys,...keys.map(k=>'original_'+k),'source_page','printed_page','table','source_row','model_exclusion','source_url','source_sha256','retrieved_on'];
    const values=selection.map(r=>[r.id,r.flight,r.fuel,r.gas,r.support,r.gravity,...keys.map(k=>r[k]),...keys.map(k=>r.source_raw[k]),r.source_page,r.printed_page,r.table,r.source_row,model.eligibility(r)||'',data.source.url,data.source.sha256,data.source.retrieved_on]);
    download('dce-'+$('lab-filter').value+'.csv',[headers,...values].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n','text/csv');
  });
  function plot(m,result){const left=68,right=690,top=25,bottom=296,width=right-left,height=bottom-top;
    const margin=(m.domain.max-m.domain.min)*.09,xmin=m.domain.min-margin,xmax=m.domain.max+margin;
    const curve=d=>m.coefficients.intercept+m.coefficients.slope*d**m.power;
    const ymax=Math.max(...m.points.map(p=>p.y),curve(m.domain.min),curve(m.domain.max))*1.18;
    const x=d=>left+(d-xmin)/(xmax-xmin)*width,y=value=>bottom-value/ymax*height;
    const title=`${m.label} against initial diameter`,description=`Five published experiments and their fitted trend. ${result?`Selected diameter ${result.inputs.diameter} mm; predicted ${fmt(m.value)} ${m.unit}.`:'No selected prediction outside the measured range.'} Exact measurements and error checks are in the adjacent tables.`;
    let svg=`<title id="plot-title">${esc(title)}</title><desc id="plot-description">${esc(description)}</desc>`;
    for(let i=0;i<=4;i++){const v=ymax*i/4;svg+=`<line x1="${left}" x2="${right}" y1="${y(v)}" y2="${y(v)}" stroke="#2c414d"/><text x="${left-12}" y="${y(v)+4}" text-anchor="end">${fmt(v,m.metric==='burn_time_s'?1:2)}</text>`;}
    for(let i=0;i<=4;i++){const d=m.domain.min+(m.domain.max-m.domain.min)*i/4;svg+=`<text x="${x(d)}" y="${bottom+23}" text-anchor="middle">${fmt(d,2)}</text>`;}
    svg+=`<text x="${left}" y="14">${esc(m.label)} (${esc(m.unit)})</text><text x="380" y="348" text-anchor="middle">Initial droplet diameter (mm)</text>`;
    const path=Array.from({length:61},(_,i)=>{const d=m.domain.min+(m.domain.max-m.domain.min)*i/60;return `${i?'L':'M'}${x(d).toFixed(2)},${y(curve(d)).toFixed(2)}`;}).join(' ');
    svg+=`<path d="${path}" fill="none" stroke="#f0bc94" stroke-width="2.5"/>`;
    for(const p of m.points)svg+=`<circle cx="${x(p.diameter)}" cy="${y(p.y)}" r="5" fill="#83bbd0" stroke="#11232d" stroke-width="1.5"><title>${p.id}: ${p.diameter} mm, ${p.y} ${esc(m.unit)}</title></circle>`;
    if(result){const px=x(result.inputs.diameter),py=y(m.value);svg+=`<line x1="${px}" x2="${px}" y1="${py}" y2="${bottom}" stroke="#f4d3ae" stroke-dasharray="5 5"/><path d="M${px},${py-8} l8,8 l-8,8 l-8,-8 Z" fill="#f8dcc0" stroke="#080d10" stroke-width="2"/>`;}
    $('model-plot').innerHTML=svg;
    $('plot-reading').textContent=`Dots show experiments; their distance from the line shows how much the fitted trend misses each result. Only ${m.domain.min}–${m.domain.max} mm is modelled. ${m.metric==='burn_time_s'?'Duration ends when the reported flame burning ends, not necessarily when the droplet is consumed.':'K comes from the report’s diameter-squared histories; it can change during an experiment.'}`;
  }
  function update(){const input=inputs(),group=model.cohort(data,input.cohort);
    $('lab-domain').textContent=`Supported range: ${group.min}–${group.max} mm · 5 experiments`;
    $('lab-size').min=group.min;$('lab-size').max=group.max;
    try{current=model.predict(data,input);$('model-error').hidden=true;}catch(e){current=null;$('model-error').textContent=e.message;$('model-error').hidden=false;}
    $('model-results').hidden=!current;$('export-model').disabled=!current;
    if(current)$('model-results').innerHTML=Object.values(current.results).map(m=>`<article class="lab-result"><h3>${esc(m.label)} · model estimate</h3><strong>${fmt(m.value,m.metric==='burn_time_s'?2:3)} <span>${esc(m.unit)}</span></strong><p class="lab-small">Withheld-test mean absolute error: ${fmt(m.mae,m.metric==='burn_time_s'?2:3)} ${esc(m.unit)}. ${m.beatsBaseline?'Lower error than the mean-only baseline.':'The mean-only baseline has lower error for this quantity.'}</p></article>`).join('');
    const metric=$('lab-metric').value,m=current?.results[metric]||model.model(data,input.cohort,metric);plot(m,current);
    $('validation-summary').innerHTML=[['Mean absolute error',m.mae],['Root-mean-square error',m.rmse],['Mean-only baseline error',m.baselineMAE]].map(([label,v])=>`<div class="lab-stat"><span>${label}</span><strong>${fmt(v,metric==='burn_time_s'?2:3)} <small>${esc(m.unit)}</small></strong></div>`).join('')+`<p>${m.beatsBaseline?'The fitted trend predicts the withheld tests better on average than the mean-only baseline.':'For this group, predicting the average gives a lower error than fitting a size trend. There is little evidence here that size improves the K prediction.'}</p>`;
    $('validation-caption').textContent=`${group.label} · ${m.label} (${m.unit}). Difference = predicted − reported.`;
    $('validation-rows').innerHTML=m.validation.map(v=>`<tr><td>${v.id}</td><td>${fmt(v.diameter,2)}</td><td>${fmt(v.observed)}</td><td>${fmt(v.predicted)}</td><td>${v.error>0?'+':''}${fmt(v.error)}</td><td>${v.withinTrainingRange?'Yes':'No · withheld endpoint'}</td></tr>`).join('');
    $('model-method').innerHTML=`<p><strong>${metric==='burn_time_s'?'t (s)':'K (mm²/s)'} = ${fmt(m.coefficients.intercept,5)} ${m.coefficients.slope<0?'−':'+'} ${fmt(Math.abs(m.coefficients.slope),5)} × ${m.power===2?'d₀²':'d₀'}</strong>, with d₀ in mm.</p><p>Training tests: ${m.training.join(', ')}. Model ${m.version}. The plotted fit uses all five; each error-check fit uses only its four training tests. <a href="lab-data/model-audit.json" download>Inspect every split and coefficient.</a></p>`;
    document.dispatchEvent(new Event('labstatechange'));
  }
  $('lab-diameter').addEventListener('input',()=>{$('lab-size').value=$('lab-diameter').value;update();});
  $('lab-size').addEventListener('input',()=>{if($('lab-size').value!=='')$('lab-diameter').value=$('lab-size').value;update();});
  $('lab-cohort').addEventListener('input',update);$('lab-metric').addEventListener('input',update);
  $('lab-reset').addEventListener('click',()=>{$('lab-cohort').value='he30';$('lab-size').value='2.5';$('lab-diameter').value='2.5';$('lab-metric').value='burn_time_s';update();});
  $('export-model').addEventListener('click',()=>{if(current)download('dce-prediction.json',JSON.stringify({source:data.source,uncertainty:data.uncertainty,...current},null,2),'application/json');});
  const equipment=[
    {area:'detect',stage:'SAME · FLIGHT EXPERIMENT RESULTS',title:'Test detectors against the materials on board.',evidence:'Two spacecraft detectors were tested with smoke from five materials. Neither detected every smoke type.',connection:'Use material-specific smoke tests to develop complementary sensing methods, rather than assuming one signal covers every source.',question:'How often is each smoke type missed, and how does dust affect false alarms? Test the inlet and ventilation path with the sensing system.',scope:'2018 study and associated NIST account; no universal detector-performance ranking.',url:'https://www.nist.gov/publications/evaluation-spacecraft-smoke-detector-performance-low-gravity-environment',source:'NIST · study abstract',second:'https://www.nist.gov/news-events/news/2018/05/nistnasa-study-shows-one-detector-doesnt-fit-all-smoke-spacecraft'},
    {area:'detect',stage:'CPM · INSTRUMENT DEVELOPMENT / PREPRINT',title:'Read combustion gases alongside smoke.',evidence:'The Saffire CPM instrument was designed to measure six gases using laser absorption: CO, HCl, HCN, HF, CO₂ and O₂.',connection:'Gas measurements can inform warning and post-fire assessment, complementing the particles seen by smoke sensors.',question:'What sampling delay, calibration drift and gas interference would an alarm system need to account for?',scope:'2019 preprint abstract only. Full text was unavailable; no sensitivity or response-time figures are imported.',url:'https://ntrs.nasa.gov/citations/20210012108',source:'NASA · CPM preprint record'},
    {area:'suppress',stage:'WATER MIST · PROOF OF CONCEPT',title:'Deliver suppressant in any orientation.',evidence:'A water/nitrogen extinguisher was designed for discharge in different orientations. Proof-of-concept tests extinguished open fires and fires in baffled enclosures.',connection:'Orientation-independent delivery addresses liquid handling in low gravity and could help in overturned vehicles on Earth.',question:'Does mist reach the hidden fuel? Check enclosure coverage, cooling, re-ignition and equipment compatibility for the intended use.',scope:'2010 NASA Tech Brief and PDF; proof of concept, not certification for every enclosure or fuel.',url:'https://ntrs.nasa.gov/citations/20100001376',source:'NASA · extinguisher development',second:'https://ntrs.nasa.gov/api/citations/20100001376/downloads/20100001376.pdf'},
    {area:'applications',stage:'E-FIELD FLAMES · COMBUSTION CONTROL RESEARCH',title:'Use electric fields to alter flame behaviour.',evidence:'Electric fields act on flame ions. The resulting gas motion can change flame shape, soot, stability and heat transfer.',connection:'The stated research direction is better control of gaseous flames, including cleaner and more efficient combustion on Earth.',question:'How do electrode layout and field strength change stability? A field can sustain burning as well as disrupt it.',scope:'NASA objectives and experiment description; this is not a qualified spacecraft suppression device.',url:'https://science.nasa.gov/biological-physical/investigations/e-field-flames/',source:'NASA · E-FIELD Flames'}
  ];
  function equipmentView(){const selected=equipment.filter(e=>$('equipment-focus').value==='all'||e.area===$('equipment-focus').value);$('equipment-cards').innerHTML=selected.map(e=>`<article class="lab-equipment"><span class="mono">${e.stage}</span><h3>${e.title}</h3><p>${e.evidence}</p><h4>Design connection</h4><p>${e.connection}</p><h4>Question for the next design</h4><p>${e.question}</p><p class="lab-small">${e.scope}</p><a href="${e.url}" target="_blank" rel="noopener">${e.source} ↗</a>${e.second?` · <a href="${e.second}" target="_blank" rel="noopener">Supporting source ↗</a>`:''}</article>`).join('');$('equipment-count').textContent=`${selected.length} design directions · evidence checked 15 November 2026`;}
  $('equipment-focus').addEventListener('input',()=>{equipmentView();document.dispatchEvent(new Event('labstatechange'));});
  $('lab-dictionary').innerHTML=Object.entries(data.missing_codes).map(([code,description])=>`<dt>${esc(code)}</dt><dd>${esc(description)}</dd>`).join('');$('source-checksum').textContent=data.source.sha256;
  table();update();equipmentView();
})();
