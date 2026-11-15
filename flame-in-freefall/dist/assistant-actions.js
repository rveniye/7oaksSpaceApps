// One action contract shared by the browser and Node server. No arbitrary selectors or URLs.
(() => {
 const pages={home:'index.html',understand:'understand.html',prevent:'prevent.html',detect:'detect.html',suppress:'suppress.html',applications:'earth.html',lab:'lab.html'};
 const sections={home:['top','research','investigations','investigation-comparison','research-status'],understand:['shape','chemistry','arrhenius','radical-reactions','thermal-decomposition','heat-balance','droplet-physics','extinction-limits','flamelets','flames','soot'],prevent:['materials','ventilation','environments','missing-data'],detect:['workspace','methods','calculations','comparison','evidence'],suppress:['extinction','ventilation','mechanisms','approaches'],applications:['findings','transfer','sources'],lab:['data','model','validation','equipment','provenance']};
 for(const [page,values] of Object.entries(sections)){if(page!=='lab')values.push('research-sources');if(!['home','lab'].includes(page))values.push('research-ranking');}
 const controls={
  lab:{'lab-cohort':['he30','he25'],'lab-diameter':{min:1.61,max:4.01,step:.01},'lab-metric':['burn_time_s','k_overall_mm2_s'],'lab-filter':['all','eligible','excluded'],'equipment-focus':['all','detect','suppress','applications']},
  home:{},understand:{scene:['earth','microgravity','ventilation'],front:['continuous','fragmented'],stage:{min:0,max:3,step:1},enhance:'boolean',formation:['low','medium','high'],oxidation:['low','medium','high']},
  prevent:{scene:['cooling','supply','transport']},suppress:{scene:['mist','ionic','acoustic']},applications:{engine:{min:0,max:2,step:1}},
  detect:{'weight-particles':{min:0,max:5,step:1},'weight-power':{min:0,max:5,step:1},'weight-durability':{min:0,max:5,step:1},'weight-sensitivity':{min:0,max:5,step:1},environment:['earth','microgravity'],method:['optical','ionisation','multi','gas'],source:['equipment','cabin'],placement:['return','ceiling'],airflow:{min:0,max:100,step:5},distance:{min:.5,max:10,step:.5},velocity:{min:0,max:.5,step:.01},showFlow:'boolean'}
 };
 const buttons={lab:['lab-reset'],home:['clear-comparison'],understand:['flame-play','reveal-cool','soot-pause','soot-lower','soot-higher','scene-motion'],prevent:['scene-motion'],detect:['pause','reset','reset-weights'],suppress:['scene-motion'],applications:[]};
 const normalPage=page=>page==='experiments'?'home':page;
 function valid(page,field,value){const rule=controls[normalPage(page)];if(!rule||!Object.hasOwn(rule,field))return false;const r=rule[field];return Array.isArray(r)?r.includes(value):r==='boolean'?typeof value==='boolean':Number.isFinite(value)&&value>=r.min&&value<=r.max&&Math.abs((value-r.min)/r.step-Math.round((value-r.min)/r.step))<1e-8;}
 function clean(actions,current){let page=normalPage(current),navigated=false;const out=[];for(const a of (Array.isArray(actions)?actions:[]).slice(0,8)){if(!a||typeof a!=='object')continue;
  if(a.type==='navigate'&&!navigated&&Object.hasOwn(pages,a.page)){navigated=true;page=a.page;out.push({type:'navigate',page,href:pages[page]});}
  else if(a.type==='scroll'&&sections[page]?.includes(a.section))out.push({type:'scroll',section:a.section});
  else if(a.type==='click'&&buttons[page]?.includes(a.button))out.push({type:'click',button:a.button});
  else if(a.type==='set'&&valid(page,a.field,a.value))out.push({type:'set',field:a.field,value:a.value});
 }return out;}
 // Validate the entire ordered plan before executing any of it.
 function cleanSteps(steps,current){
  if(!Array.isArray(steps)||!steps.length||steps.length>8)return null;
  let page=normalPage(current),count=0,navigations=0,size=0;const out=[];
  for(const step of steps){
   if(!step||typeof step.text!=='string'||!Array.isArray(step.actions)||step.actions.length>2)return null;
   size+=step.text.length;count+=step.actions.length;if(size>12000||count>8)return null;
   const actions=[];
   for(const action of step.actions){
    const safe=clean([action],page);if(safe.length!==1)return null;
    if(safe[0].type==='navigate'){if(++navigations>1)return null;page=safe[0].page;}
    actions.push(safe[0]);
   }
   if(!step.text.trim()&&!actions.length)return null;
   out.push({text:step.text,actions});
  }
  return out;
 }
 globalThis.AssistantActions={pages,sections,controls,buttons,normalPage,valid,clean,cleanSteps};
})();
