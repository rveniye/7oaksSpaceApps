// Starting points fill the question; visitors decide when to send it.
(() => {
  const output=document.querySelector('.agent-output'),input=document.getElementById('question');
  if(!output||!input)return;
  const group=document.createElement('div');group.className='assistant-prompts';group.setAttribute('aria-label','Suggested research questions');
  for(const [label,question] of [
    ['Explain this view','Explain the current demonstration step by step. What should I look for, and what can it not tell me?'],
    ['Why does this matter?','How does this research help us understand fire safety in spacecraft?'],
    ['Connect the research','How does this topic connect to the other research areas on this website? Suggest where to continue.']
  ]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{input.value=question;input.focus();});group.append(button);}
  output.prepend(group);
})();
