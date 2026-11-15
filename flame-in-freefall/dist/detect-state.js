(() => {
const defaults={environment:'microgravity',airflow:50,source:'equipment',placement:'return',showFlow:true,method:'optical',distance:3,velocity:0.1};
function cleanState(value={}) {
 const state={...defaults};
 for(const [key,allowed] of Object.entries({environment:['microgravity','earth'],source:['equipment','cabin'],placement:['return','ceiling'],method:['optical','ionisation','multi','gas']}))if(allowed.includes(value?.[key]))state[key]=value[key];
 if(Number.isFinite(value?.airflow))state.airflow=Math.round(Math.max(0,Math.min(100,value.airflow))/5)*5;
 if(typeof value?.showFlow==='boolean')state.showFlow=value.showFlow;
 for(const [field,min,max,step] of [['distance',0.5,10,0.5],['velocity',0,0.5,0.01]])if(Number.isFinite(value?.[field]))state[field]=Number((Math.round(Math.max(min,Math.min(max,value[field]))/step)*step).toFixed(2));
 return state;
}
const flowLabel=value=>value===0?'Still':value<35?'Low':value<75?'Moderate':'Strong';
function snapshot(state){return {simulationId:'detect-transport',modelVersion:'1.0',mode:'illustrative',inputs:{environment:state.environment,airflow:state.airflow,source:state.source,placement:state.placement,method:state.method,showFlow:state.showFlow,distance:state.distance,velocity:state.velocity},assumptions:['Airflow is a qualitative 0–100 control, not a measured velocity.','Tracers illustrate transport, not combustion, CFD or sensor response.','Distance in metres and velocity in m/s are separate idealised transport inputs; t=L/u, steady connected path. They do not calibrate the cabin animation.','No alarm time, gas concentration or detection probability is calculated.']};}
function observation(state){
 if(state.airflow===0)return state.environment==='microgravity'?'Without a directed ventilation flow, this illustration spreads tracers around their source. Microgravity provides no ordinary upward buoyant route to the upper-cabin sampling point.':'The Earth illustration includes upward buoyant transport. This simplified plume is a comparison, not a prediction for a particular material or cabin.';
 const transport=state.environment==='earth'?'Upward buoyancy and ventilation compete in this illustration.':'Ventilation carries smoke across the cabin; there is no buoyant rise towards a ceiling.';
 return transport+(state.placement==='return'?' The sampling point is in the illustrated return path. That does not establish an alarm threshold or time.':' The upper-cabin sampling point is away from the illustrated return path. Placement matters as well as detector sensitivity.');
}

function transportEstimate(distance,velocity){return velocity>0?distance/velocity:null;}
globalThis.DetectState={defaults,cleanState,flowLabel,snapshot,observation,transportEstimate};
})();
