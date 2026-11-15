/* Curated from the supplied Space Apps challenge brief. No PSI run data is implied. */
(() => {
  const records = [
    {id:'bass',name:'BASS / BASS-II',area:'prevent',fuel:'Solid fabrics and plastics',hardware:'MSG · SPICE flow duct',objective:'Study how solid fuels burn and how flow affects burning and suppression.',variables:'Material, sample geometry, oxygen concentration and airflow; exact ranges need run records.',measurements:'Flame behaviour and material burning; instrument channels need run records.',reason:'Directly relevant to material flammability and ventilation around exposed solids.',gap:'Sample dimensions, test atmosphere, run-level results and uncertainty.',related:['understand','suppress']},
    {id:'saffire',name:'Saffire-I / II / III',area:'prevent',fuel:'Solid materials',hardware:'Spacecraft-scale fire experiment',objective:'Study solid-material fire behaviour at a larger scale than small laboratory samples.',variables:'Fuel configuration and test conditions differ across investigations; compare runs before combining results.',measurements:'Fire growth and spread; numerical measurements are not loaded.',reason:'Relevant to fire spread in crew-sized environments and to the limits of small-sample tests.',gap:'Per-run geometry, atmosphere, flow, measurement channels and scale comparison.',related:['understand','suppress']},
    {id:'same',name:'SAME / SAME-R',area:'detect',fuel:'Smoke from heated materials',hardware:'Smoke and aerosol measurement instruments',objective:'Characterise smoke and investigate fire detection in microgravity.',variables:'Smoke source and aerosol properties; source temperatures and ranges need run records.',measurements:'Aerosol characteristics and detector response.',reason:'Directly informs how different smoke sources affect a detector’s signal.',gap:'Particle distributions, concentrations, source conditions and response calibration.',related:['understand']},
    {id:'flex',name:'FLEX / FLEX-2',area:'suppress',fuel:'Liquid fuel droplets',hardware:'CIR · MDCA',objective:'Study droplet combustion and flame extinction, including atmosphere dilution in FLEX.',variables:'Liquid fuel and surrounding atmosphere; FLEX studied carbon dioxide and helium dilution.',measurements:'Droplet burning and extinction behaviour; numerical results are not loaded.',reason:'Direct evidence about extinction mechanisms. Droplet results need care when applied to burning solid materials.',gap:'Droplet size, fuel composition, diluent fractions, pressure and extinction data.',related:['understand','applications']},
    {id:'cfi',name:'Cool Flames Investigation (CFI)',area:'understand',fuel:'Liquid fuel droplets',hardware:'CIR · MDCA',objective:'Investigate lower-temperature combustion of droplets.',variables:'Fuel and atmosphere; exact conditions need run records.',measurements:'Droplet and flame behaviour during cool combustion.',reason:'Helps explain why disappearance of a visible hot flame may not mean all combustion has stopped.',gap:'Temperature measurements, chemical species and fuel-specific conditions.',related:['suppress','applications']},
    {id:'bre',name:'ACME · Burning Rate Emulator',area:'prevent',fuel:'Gaseous fuel used to emulate burning solids',hardware:'CIR · ACME hardware',objective:'Study material flammability in still atmospheres as a function of material properties.',variables:'Emulated material properties and atmosphere.',measurements:'Burning behaviour of the emulator; underlying data not loaded.',reason:'Relevant to solid-material flammability questions despite using a gaseous-fuel burner.',gap:'Emulator settings, mapping to solid properties and limits of that mapping.',related:['understand']},
    {id:'efield',name:'ACME · E-FIELD Flames',area:'understand',fuel:'Gaseous fuel',hardware:'CIR · ACME hardware',objective:'Study how an electric field moves ions and changes gas flow around a flame.',variables:'Electric field and flame conditions.',measurements:'Changes to flame behaviour under electric forcing.',reason:'Useful for studying transport effects. Electrically driven flow does not provide direct lunar-gravity combustion data.',gap:'Field strengths, burner conditions and validation of any gravity analogy.',related:['suppress']},
    {id:'cfig',name:'ACME · CFI-G',area:'understand',fuel:'Gaseous fuel, including propane',hardware:'CIR · ACME spherical burner',objective:'Investigate cool flames with gaseous fuels in an inverse flame arrangement.',variables:'Oxygen–nitrogen mixture through the burner, fuel–nitrogen surrounds it. Exact mixture limits still need primary-source verification.',measurements:'Gaseous cool-flame behaviour.',reason:'Explores oxygen-rich conditions, but an inverse burner is different from a crew cabin atmosphere.',gap:'Per-run mixtures, flow, pressure and geometry. The 85% value is not a habitat setting.',related:['prevent']},
    {id:'flamedesign',name:'ACME · Flame Design',area:'applications',fuel:'Gaseous fuel',hardware:'CIR · ACME hardware',objective:'Study flame conditions that affect soot production.',variables:'Flame configuration, fuel and surrounding gas conditions.',measurements:'Soot formation and flame behaviour; run measurements not loaded.',reason:'Connects combustion research to lower-soot combustion systems on Earth.',gap:'Soot measurements, fuel-flow conditions and model validation.',related:['understand']},
    {id:'spice',name:'SPICE / SLICE',area:'understand',fuel:'Gaseous fuel',hardware:'MSG · SPICE flow duct',objective:'Study smoke-point behaviour (SPICE) and flame structure and liftoff (SLICE).',variables:'Burner and flow conditions; exact settings need run records.',measurements:'Smoke point, flame structure and liftoff behaviour.',reason:'Provides related transport and soot research using hardware also used by BASS.',gap:'Burner dimensions, fuel flow, air speed and measurement uncertainty.',related:['applications']},
    {id:'daft',name:'DAFT / DAFT-2',area:'understand',fuel:'Dust aerosols · no burning fuel',hardware:'An instrument also used in SAME / SAME-R',objective:'Assess aerosol measurements for dust detection.',variables:'Dust and instrument conditions.',measurements:'Dust aerosol response.',reason:'Useful for understanding shared sensing hardware and non-fire aerosols; not a combustion investigation.',gap:'Dust size distributions, calibration and comparisons with smoke response.',related:['detect']},
    {id:'sofie',name:'SoFIE',area:'prevent',fuel:'Solid materials',hardware:'CIR · solid-fuel experiments',objective:'Study solid-fuel ignition, flame spread and extinction.',variables:'Materials and environment; detailed settings differ among experiments.',measurements:'Ignition and burning behaviour.',reason:'Relevant to material screening and the effects of installation conditions.',gap:'Individual experiment records, sample configuration and comparable outcome data.',related:['understand','applications']}
  ];
  for(const record of records){const p=globalThis.SourceProvenance?.records[record.id];record.provenance=p;record.sourceStatus=p?.status||'Source check pending';record.checkedOn=p?.checkedOn||'';record.sourceUrls=p?.sources.map(s=>s.url).join(' | ')||'';record.measurementsImported=false;}
  const areas = {all:'All research',understand:'Understand',prevent:'Prevent',detect:'Detect',suppress:'Suppress',applications:'Applications'};
  function findRecords(query='', area='all') {
    const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return records.filter(r=>terms.every(term=>Object.values(r).join(' ').toLowerCase().includes(term)))
      .map(r=>({...r, relevance:area==='all'?'Unranked':r.area===area?'Direct':r.related.includes(area)?'Related':'Background'}))
      .sort((a,b)=>({Direct:0,Related:1,Background:2,Unranked:0}[a.relevance]-{Direct:0,Related:1,Background:2,Unranked:0}[b.relevance])||a.name.localeCompare(b.name));
  }
  globalThis.Investigations={records,findRecords};
  if(typeof document==='undefined')return;
  const root=document.getElementById('investigation-results');if(!root)return;
  const $=id=>document.getElementById(id),selected=new Set();
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  function comparison(){
    const section=$('investigation-comparison');section.hidden=!selected.size;
    const head=$('investigation-compare-head'),body=$('investigation-compare-body');head.replaceChildren(el('th','Attribute'));body.replaceChildren();
    const chosen=records.filter(r=>selected.has(r.id));
    for(const r of chosen){const th=el('th',r.name);th.scope='col';head.append(th);}
    for(const [field,title] of [['objective','Question studied'],['fuel','Fuel / sample'],['hardware','Shared hardware'],['variables','Conditions to compare'],['measurements','Measurements'],['gap','Data still needed'],['sourceStatus','Source check'],['checkedOn','Checked on'],['sourceUrls','Source references']]){
      const row=el('tr'),th=el('th',title);th.scope='row';row.append(th);for(const r of chosen)row.append(el('td',r[field]));body.append(row);
    }
    $('compare-status').textContent=`${selected.size} of 3 selected`;$('clear-comparison').disabled=selected.size===0;
  }
  function render(){
    const area=$('investigation-area').value,items=findRecords($('investigation-search').value,area);root.replaceChildren();
    $('investigation-count').textContent=`${items.length} investigation families · ${area==='all'?'alphabetical order':`ordered by relevance to ${areas[area].toLowerCase()}`}`;
    if(!items.length)root.append(el('p','No matching investigations. Try a fuel, hardware name, or experiment acronym.','empty-state'));
    for(const r of items){
      const card=el('article',undefined,'investigation-record'),heading=el('div',undefined,'record-heading');
      const title=el('h3',r.name),badge=el('span',area==='all'?areas[r.area]:`${r.relevance} relevance`,'relevance-badge');heading.append(title,badge);card.append(heading,el('p',r.objective));
      const dl=el('dl');for(const [label,value] of [['Fuel / sample',r.fuel],['Hardware',r.hardware]]){const d=el('div');d.append(el('dt',label),el('dd',value));dl.append(d);}card.append(dl);
      card.append(el('p',r.reason,'record-reason'));card.append(el('p',`${r.sourceStatus} · No run measurements imported`,'record-provenance'));
      const detail=el('details');detail.append(el('summary','Conditions, measurements and missing data'));
      for(const [label,value] of [['Conditions',r.variables],['Measurements',r.measurements],['Needed before modelling',r.gap]]){detail.append(el('h4',label),el('p',value));}if(r.provenance){detail.append(el('h4','What the source check covers'),el('p',r.provenance.checkedScope),el('p',r.provenance.limits));for(const source of r.provenance.sources){const link=el('a',source.title+' ↗');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';const p=el('p');p.append(link);detail.append(p);}for(const issue of r.provenance.issues)detail.append(el('p','Source discrepancy: '+issue));}card.append(detail);
      const footer=el('div',undefined,'record-actions'),label=el('label'),checkbox=el('input');checkbox.type='checkbox';checkbox.id=`compare-${r.id}`;checkbox.checked=selected.has(r.id);checkbox.disabled=selected.size===3&&!checkbox.checked;checkbox.setAttribute('aria-label',`Compare ${r.name}`);checkbox.addEventListener('change',()=>{const scrollTop=root.scrollTop;checkbox.checked?selected.add(r.id):selected.delete(r.id);render();comparison();root.scrollTop=scrollTop;document.getElementById(`compare-${r.id}`)?.focus({preventScroll:true});});label.append(checkbox,document.createTextNode(' Compare'));
      const a=el('a','Search NASA PSI ↗');a.href=`https://psi.nasa.gov/physci/repo/search?q=${encodeURIComponent(r.name.split(' / ')[0])}&data_source=psi&data_type=investigation`;a.target='_blank';a.rel='noopener noreferrer';footer.append(label,a);card.append(footer);root.append(card);
    }
  }
  $('investigation-search').addEventListener('input',render);$('investigation-area').addEventListener('change',render);
  $('clear-comparison').addEventListener('click',()=>{selected.clear();render();comparison();});
  $('export-investigations').addEventListener('click',()=>{
    const fields=['name','area','relevance','objective','fuel','hardware','variables','measurements','gap','sourceStatus','checkedOn','sourceUrls','measurementsImported'];
    const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
    const rows=findRecords($('investigation-search').value,$('investigation-area').value);
    const csv=[fields,...rows.map(r=>fields.map(f=>r[f]))].map(row=>row.map(quote).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=el('a');a.href=url;a.download='investigation-reading-list.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();comparison();
})();
