import {readFile} from 'node:fs/promises';
import '../dist/lab-model.js';
export function validateLabInputs(inputs) {
  if(!inputs||typeof inputs!=='object'||Array.isArray(inputs)||!['he25','he30'].includes(inputs.cohort)||!Number.isFinite(inputs.diameter))throw Error('Invalid research workspace inputs.');
  const result={cohort:inputs.cohort,diameter:inputs.diameter};
  for(const [field,allowed] of Object.entries({metric:['burn_time_s','k_overall_mm2_s'],filter:['all','eligible','excluded'],equipmentFocus:['all','detect','suppress','applications']})){
    if(inputs[field]!==undefined){if(!allowed.includes(inputs[field]))throw Error('Invalid workspace view.');result[field]=inputs[field];}
  }
  return result;
}
export async function labContext(inputs) {
  const data=JSON.parse(await readFile(new URL('../data/extracted/dce-table1.json',import.meta.url),'utf8'));
  const models=Object.fromEntries(globalThis.LabModel.definitions.map(c=>[c.id,Object.fromEntries(Object.keys(globalThis.LabModel.metrics).map(metric=>{
    const {coefficients,domain,mae,rmse,baselineMAE,beatsBaseline,power,training,unit}=globalThis.LabModel.model(data,c.id,metric);
    return [metric,{coefficients,domain,mae,rmse,baselineMAE,beatsBaseline,power,training,unit}];
  }))]));
  let current=null;
  if(inputs){try{current=globalThis.LabModel.predict(data,validateLabInputs(inputs));}catch(error){current={inputs,error:error.message,predictionAvailable:false};}}
  return {data,models,selection:inputs?validateLabInputs(inputs):null,current};
}
