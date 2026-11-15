// Each step is spoken before its actions execute. The browser owns timing.
const actionSchema={type:'object',additionalProperties:false,required:['type'],properties:{
 type:{type:'string',enum:['set','click','scroll','navigate']},
 field:{type:'string'},value:{anyOf:[{type:'string'},{type:'number'},{type:'boolean'}]},
 button:{type:'string'},page:{type:'string',enum:['home','understand','prevent','detect','suppress','applications','lab']},section:{type:'string'}
}};
export const agentResponseSchema={type:'object',additionalProperties:false,required:['steps'],properties:{
 steps:{type:'array',minItems:1,maxItems:8,items:{type:'object',additionalProperties:false,required:['text','actions'],properties:{
  text:{type:'string',description:'Markdown to display before this step’s actions. Explain what to watch for; never embed action JSON.'},
  actions:{type:'array',maxItems:2,items:actionSchema}
 }}}
}};

// Compatibility for older model replies: a single fenced response envelope can
// follow prose. Never execute code blocks; only parse JSON, then validate actions.
export function decodeAgentEnvelope(text) {
 if(typeof text!=='string')throw Error('INVALID_AGENT_RESPONSE');
 const raw=text.trim();let data;
 try{data=JSON.parse(raw);}catch{
  const blocks=[...raw.matchAll(/```(?:json)?\s*\n?([\s\S]*?)```/g)];
  const envelopes=blocks.flatMap(match=>{try{const value=JSON.parse(match[1]);return typeof value?.answer==='string'&&Array.isArray(value.actions)?[{value,match}]:[];}catch{return [];}});
  if(envelopes.length!==1)throw Error('INVALID_AGENT_RESPONSE');
  const {value,match}=envelopes[0];
  // Only narrative before/after one envelope is retained, never its JSON block.
  const narrative=(raw.slice(0,match.index)+raw.slice(match.index+match[0].length)).trim();
  data={...value,answer:narrative||value.answer};
 }
 if(Array.isArray(data?.steps))return data;
 if(!data||typeof data.answer!=='string'||!data.answer.trim()||!Array.isArray(data.actions))throw Error('INVALID_AGENT_RESPONSE');
 // Catch accidentally nested envelopes rather than displaying unexecuted JSON.
 if(/```(?:json)?\s*[\s\S]*?"actions"\s*:/.test(data.answer))throw Error('INVALID_AGENT_RESPONSE');
 return data;
}
