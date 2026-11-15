import '../dist/assistant-actions.js';
// Browser history is conversational reference data, never a system instruction.
export function validateHistory(value) {
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>12)throw Error('Invalid conversation history.');
 let size=0;
 return value.map(message=>{
  if(!message||!['user','assistant'].includes(message.role)||typeof message.content!=='string'||message.content.length>12000)throw Error('Invalid conversation message.');
  size+=message.content.length;if(size>24000)throw Error('Conversation history is too large.');
  const actions=message.role==='assistant'?globalThis.AssistantActions.clean(message.actions,message.page):[];
  const status=typeof message.status==='string'?message.status.slice(0,1000):'';
  return {actions,status,role:message.role,content:message.content,page:['home','experiments','understand','prevent','detect','suppress','applications'].includes(message.page)?message.page:'unknown'};
 });
}
