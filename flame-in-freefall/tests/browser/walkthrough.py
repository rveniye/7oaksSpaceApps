"""Browser checks against a running local server. Requires Python Playwright."""
import os
import sys
from playwright.sync_api import sync_playwright
BASE=os.environ.get('TEST_BASE_URL','http://localhost:4174')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(reduced_motion='reduce', viewport={'width':1440,'height':1000})
 page=context.new_page();errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 # Exercise every control against the actual page handlers, not DOM stand-ins.
 for name,file in [('understand','understand.html'),('prevent','prevent.html'),('detect','detect.html'),('suppress','suppress.html'),('applications','earth.html')]:
  page.goto(BASE+'/'+file);page.wait_for_function('Boolean(window.AssistantChat)')
  assert page.locator('#research-sources').count()==1
  assert page.locator('#research-sources a').count()>0
  results=page.evaluate('''async name=>{
   const results=[];
   for(const [field,rule] of Object.entries(AssistantActions.controls[name])){
    const values=Array.isArray(rule)?rule:rule==='boolean'?[false,true]:[rule.min,rule.max];
    for(const value of values){
     const ticket=AssistantChat.begin('Browser command check');
     await AssistantChat.complete({steps:[{text:'Change the control.',actions:[{type:'set',field,value}]},{text:'Observe the result.',actions:[]}]},ticket,{apply:true});
     const id=({stage:'flame-stage',enhance:'enhance-cool',formation:'soot-formation',oxidation:'soot-oxidation',showFlow:'show-flow'})[field]||field;
     const button=['scene','front','engine','method'].includes(field)?[...document.querySelectorAll(`[data-${field}]`)].find(b=>b.dataset[field]===String(value)):null;
     const control=document.getElementById(id);
     const actual=button?button.getAttribute(field==='method'?'aria-selected':'aria-pressed'):typeof value==='boolean'?control?.checked:control?.value;
     results.push({field,value,actual,ok:button?actual==='true':String(actual)===String(value)});
    }
   }
   return results;
  }''',name)
  assert all(r['ok'] for r in results), (name,results)
  for button in page.evaluate('name=>AssistantActions.buttons[name]',name):
   assert page.locator('#'+button).count()==1,(name,button)
   result=page.evaluate('''async button=>{const t=AssistantChat.begin('Click');return AssistantChat.complete({steps:[{text:'Press the button.',actions:[{type:'click',button}]}]},t,{apply:true});}''',button)
   assert result,(name,button)
  print(name,':',len(results),'control values and buttons passed',flush=True)
 # Overview button has a real selection to clear.
 page.goto(BASE+'/index.html');page.locator('input[type=checkbox]').first.check();page.evaluate("()=>AssistantChat.execute([{type:'click',button:'clear-comparison'}])")
 assert page.locator('input[type=checkbox]:checked').count()==0
 # Cross-page queue: remaining narrative and controls must resume exactly once.
 page.goto(BASE+'/understand.html')
 page.evaluate('''()=>{const t=AssistantChat.begin('Navigate and demonstrate');void AssistantChat.complete({steps:[{text:'Opening detection.',actions:[{type:'navigate',page:'detect'}]},{text:'Now increase airflow.',actions:[{type:'set',field:'airflow',value:65}]},{text:'Destination explanation.',actions:[]}]},t,{apply:true});}''')
 page.wait_for_url('**/detect.html');page.wait_for_function("document.getElementById('airflow').value==='65' && !AssistantChat.running")
 assert 'Destination explanation.' in page.locator('.chat-transcript').inner_text()
 assert page.evaluate("sessionStorage.getItem('7oaks:assistant-navigation:v1')") is None
 # Normal motion: sample actual slider movement and ensure next text waits.
 page.emulate_media(reduced_motion='no-preference')
 page.evaluate('''()=>{document.getElementById('airflow').value=0;document.getElementById('airflow').dispatchEvent(new Event('input',{bubbles:true}));window.samples=[];document.getElementById('airflow').addEventListener('input',()=>samples.push({value:Number(document.getElementById('airflow').value),time:performance.now(),text:document.querySelector('.chat-transcript').lastElementChild.innerText}));const t=AssistantChat.begin('Smooth transition');void AssistantChat.complete({steps:[{text:'Watch the fan.',actions:[{type:'set',field:'airflow',value:100}]},{text:'AFTER THE ANIMATION',actions:[]}]},t,{apply:true});}''')
 page.wait_for_function('!AssistantChat.running',timeout=20000)
 samples=page.evaluate('samples')
 assert len(samples)>10 and samples[-1]['value']==100,samples
 assert all('AFTER THE ANIMATION' not in sample['text'] for sample in samples)
 assert samples[-1]['time']-samples[0]['time']>1200
 # Reader takeover cancels later commands.
 page.evaluate('''()=>{const t=AssistantChat.begin('Stop test');void AssistantChat.complete({steps:[{text:'A deliberately long explanation before any actions are allowed to execute.',actions:[{type:'set',field:'airflow',value:0}]}]},t,{apply:true});}''')
 page.locator('#agent-toggle').click() if page.locator('#agent-panel').is_hidden() else None
 page.get_by_role('button',name='Stop walkthrough',exact=True).click()
 page.wait_for_function('!AssistantChat.running')
 assert page.locator('#airflow').input_value()=='100'
 if '--live' in sys.argv:
  page.emulate_media(reduced_motion='reduce')
  page.goto(BASE+'/understand.html')
  page.get_by_role('button',name='Clear conversation',exact=True).click() if page.locator('#agent-panel').is_visible() else None
  if page.locator('#agent-panel').is_hidden():page.locator('#agent-toggle').click()
  page.locator('#question').fill('Show hot ignition at stage 1, then change to cool combustion at stage 3 and enable the faint-reaction overlay. Explain each change in a short paragraph after applying it.')
  page.locator('#explain-form [type=submit]').click()
  page.wait_for_function("document.getElementById('ai-status').textContent.includes('Response complete')",timeout=90000)
  assert page.locator('#flame-stage').input_value()=='3'
  assert page.locator('#enhance-cool').is_checked()
  assert page.evaluate("AssistantChat.history().at(-1).actions.filter(a=>a.type==='set'&&a.field==='stage').length")>=2
  page.locator('#question').fill('Go to Detect, set microgravity and airflow to 65, then explain the smoke transport drawing in two sentences.')
  page.locator('#explain-form [type=submit]').click()
  page.wait_for_url('**/detect.html',timeout=90000)
  page.wait_for_function("document.getElementById('airflow').value==='65' && !AssistantChat.running",timeout=90000)
  assert page.locator('#environment').input_value()=='microgravity'
  print('Live Gemini: stage sequence, checkbox, cross-page navigation and airflow applied through chat.',flush=True)
 # Mobile smoke test and screenshot artifact.
 page.set_viewport_size({'width':390,'height':844})
 page.screenshot(path='/private/tmp/7oaks-walkthrough-mobile.png')
 assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth'), 'Mobile horizontal overflow'
 assert not errors,errors
 print('Navigation, paced slider, stop, mobile layout and browser error checks passed.',flush=True)
 browser.close()
