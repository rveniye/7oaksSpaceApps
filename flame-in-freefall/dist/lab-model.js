// Deterministic numerical model shared by browser and server; no language model arithmetic.
(() => {
  'use strict';
  const version = 'dce-ols-1';
  const definitions = [
    {id:'he30', oxygen:30, label:'30% oxygen / 70% helium · 1 bar'},
    {id:'he25', oxygen:25, label:'25% oxygen / 75% helium · 1 bar'}
  ];
  const metrics = {
    burn_time_s: {label:'Burn duration', unit:'s', power:2},
    k_overall_mm2_s: {label:'Overall burning constant K', unit:'mm²/s', power:1}
  };
  const mean = values => values.reduce((a,b)=>a+b,0)/values.length;
  function eligibility(row) {
    if(row.gas!=='oxygen/helium'||row.support!=='free')return 'Air or fibre-supported: separate physical conditions.';
    if(row.oxygen_percent===20)return '20% oxygen: report attributes burning mainly to the ignition vapour cloud (printed pp. 7, 15).';
    if(row.approximate_diameter)return 'Initial diameter is an approximate camera estimate.';
    if(![row.initial_diameter_mm,row.burn_time_s,row.k_overall_mm2_s].every(v=>Number.isFinite(v)&&v>0))return 'Diameter, burn duration or overall K is missing.';
    if(row.pressure_bar!==1||![25,30].includes(row.oxygen_percent))return 'Fewer than four complete tests at these same conditions.';
    return null;
  }
  function cohort(data,id) {
    const definition=definitions.find(c=>c.id===id);
    if(!definition)throw Error('Choose a supported atmosphere.');
    const rows=data.rows.filter(r=>r.oxygen_percent===definition.oxygen&&!eligibility(r));
    if(rows.length<4)throw Error('At least four complete matching tests are required.');
    return {...definition,rows,min:Math.min(...rows.map(r=>r.initial_diameter_mm)),max:Math.max(...rows.map(r=>r.initial_diameter_mm))};
  }
  function fit(points) {
    if(points.length<2||!points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)))throw Error('Fit requires finite paired measurements.');
    const mx=mean(points.map(p=>p.x)),my=mean(points.map(p=>p.y));
    const variance=points.reduce((s,p)=>s+(p.x-mx)**2,0);
    if(variance<1e-12)throw Error('Distinct droplet sizes are required.');
    const slope=points.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/variance;
    return {intercept:my-slope*mx,slope};
  }
  const evaluate=(fit,x)=>fit.intercept+fit.slope*x;
  function model(data,id,metric) {
    if(!Object.hasOwn(metrics,metric))throw Error('Choose burn duration or overall K.');const config=metrics[metric];
    const group=cohort(data,id),points=group.rows.map(r=>({id:r.id,x:r.initial_diameter_mm**config.power,y:r[metric],diameter:r.initial_diameter_mm}));
    const coefficients=fit(points);
    // Each experiment is excluded from both the fitted model and its mean-only baseline.
    const validation=points.map((p,i)=>{
      const training=points.filter((_,j)=>i!==j),prediction=evaluate(fit(training),p.x),baseline=mean(training.map(p=>p.y));
      return {id:p.id,diameter:p.diameter,observed:p.y,predicted:prediction,error:prediction-p.y,baseline,withinTrainingRange:p.x>=Math.min(...training.map(p=>p.x))&&p.x<=Math.max(...training.map(p=>p.x)),training:training.map(p=>p.id)};
    });
    const mae=mean(validation.map(p=>Math.abs(p.error))),rmse=Math.sqrt(mean(validation.map(p=>p.error**2)));
    const baselineMAE=mean(validation.map(p=>Math.abs(p.baseline-p.observed)));
    return {version,cohort:id,metric,label:config.label,unit:config.unit,power:config.power,domain:{min:group.min,max:group.max},coefficients,training:group.rows.map(r=>r.id),points,validation,mae,rmse,baselineMAE,beatsBaseline:mae<baselineMAE};
  }
  function predict(data,inputs) {
    const {cohort:id,diameter}=inputs||{};
    const group=cohort(data,id);
    if(!Number.isFinite(diameter)||diameter<group.min||diameter>group.max)throw Error(`Use an initial diameter between ${group.min} and ${group.max} mm for this atmosphere.`);
    const results=Object.fromEntries(Object.keys(metrics).map(metric=>{const m=model(data,id,metric);const value=evaluate(m.coefficients,diameter**m.power);if(value<=0)throw Error('The fitted value is not physically admissible.');return [metric,{...m,value}];}));
    return {version,inputs:{cohort:id,diameter},conditions:{fuel:'n-heptane',oxygen_percent:group.oxygen,diluent:'helium',pressure_bar:1,support:'free',gravity:'microgravity',temperature:'near 300 K'},results,scope:'Empirical interpolation of published DCE summary measurements. Internal leave-one-out checks, not independent validation. Not a cabin, solid-material, partial-gravity or extinguishment model.'};
  }
  globalThis.LabModel={version,definitions,metrics,eligibility,cohort,fit,model,predict};
})();
