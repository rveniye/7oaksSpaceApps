"""Functional workspace, export and guided-action checks. Run with TEST_BASE_URL."""
import os,json,csv
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('TEST_BASE_URL','http://localhost:4176')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto(BASE+'/lab.html');page.wait_for_function('Boolean(window.LabWorkspace)')
 assert page.locator('#lab-rows tr').count()==38
 assert '5.60' in page.locator('#model-results').inner_text()
 page.select_option('#lab-filter','eligible');assert page.locator('#lab-rows tr').count()==10
 with page.expect_download() as download:page.locator('#export-filtered').click()
 rows=list(csv.DictReader(Path(download.value.path()).open()))
 assert len(rows)==10 and rows[0]['id']=='DCE-07' and rows[-1]['id']=='DCE-16'
 assert rows[0]['source_url'].endswith('20040000941.pdf') and len(rows[0]['source_sha256'])==64
 page.select_option('#lab-filter','excluded');assert page.locator('#lab-rows tr').count()==28
 page.get_by_role('button',name='Inspect DCE-17',exact=True).click()
 assert 'approximate' in page.locator('#row-detail').inner_text() and '±' in page.locator('#row-detail').inner_text()
 page.select_option('#lab-cohort','he25');page.select_option('#lab-metric','k_overall_mm2_s')
 assert 'lower error than fitting' in page.locator('#validation-summary').inner_text()
 page.fill('#lab-size','4.02');assert page.locator('#model-error').is_visible()
 assert page.locator('#model-results').is_hidden() and page.locator('#export-model').is_disabled()
 page.fill('#lab-size','3');assert page.locator('#model-error').is_hidden()
 with page.expect_download() as download:page.locator('#export-model').click()
 result=json.loads(Path(download.value.path()).read_text());assert result['inputs']=={'cohort':'he25','diameter':3}
 assert len(result['results']['burn_time_s']['training'])==5 and len(result['results']['burn_time_s']['validation'])==5
 page.select_option('#equipment-focus','suppress');assert page.locator('.lab-equipment').count()==1
 assert 'water/nitrogen' in page.locator('#equipment-cards').inner_text()
 # The real shared action executor must reach all new controls and actual chart handlers.
 page.evaluate('''async()=>{const t=AssistantChat.begin('Explore the model');await AssistantChat.complete({steps:[{text:'Choose 30% oxygen.',actions:[{type:'set',field:'lab-cohort',value:'he30'}]},{text:'Change size.',actions:[{type:'set',field:'lab-diameter',value:3.5}]},{text:'Compare duration.',actions:[{type:'set',field:'lab-metric',value:'burn_time_s'}]},{text:'Check predictions.',actions:[{type:'scroll',section:'validation'}]}]},t,{apply:true});}''')
 assert page.locator('#lab-size').input_value()=='3.5'
 assert page.locator('#lab-cohort').input_value()=='he30'
 assert 'Burn duration' in page.locator('#validation-caption').inner_text()
 # Form sends the validated live settings. Backend-specific numerical checks are in node tests.
 sent=[]
 def reply(route):
  sent.append(route.request.post_data_json)
  route.fulfill(json={'steps':[{'text':'The source measurements are ready.','actions':[]}],'sources':[]})
 page.route('**/api/ask',reply)
 if page.locator('#agent-panel').is_hidden():page.locator('#agent-toggle').click()
 page.fill('#question','Explain this model selection');page.locator('#explain-form [type=submit]').click()
 page.wait_for_function("document.getElementById('ai-status').textContent.includes('Response complete')")
 assert sent[-1]['labInputs']=={'cohort':'he30','diameter':3.5,'metric':'burn_time_s','filter':'excluded','equipmentFocus':'suppress'}
 page.unroute('**/api/ask')
 # A navigation from an established page must resume controls and narrative exactly once.
 page.goto(BASE+'/understand.html')
 page.evaluate('''()=>{const t=AssistantChat.begin('Open the data workspace');void AssistantChat.complete({steps:[{text:'Opening the workspace.',actions:[{type:'navigate',page:'lab'}]},{text:'Choose 25% oxygen.',actions:[{type:'set',field:'lab-cohort',value:'he25'}]},{text:'Select 3 mm.',actions:[{type:'set',field:'lab-diameter',value:3}]},{text:'WORKSPACE WALKTHROUGH COMPLETE','actions':[]}]},t,{apply:true});}''')
 page.wait_for_url('**/lab.html');page.wait_for_function("document.getElementById('lab-size').value==='3' && !AssistantChat.running")
 assert page.locator('#lab-cohort').input_value()=='he25'
 assert 'WORKSPACE WALKTHROUGH COMPLETE' in page.locator('.chat-transcript').inner_text()
 assert page.evaluate("sessionStorage.getItem('7oaks:assistant-navigation:v1')") is None
 page.locator('#agent-close').click() if page.locator('#agent-panel').is_visible() else None
 page.set_viewport_size({'width':390,'height':844});page.locator('#model').scroll_into_view_if_needed()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path='/private/tmp/7oaks-lab-mobile-model.png')
 assert not errors,errors
 print('Lab: 38 rows, filters, qualified cells, CSV/JSON downloads, domain refusal, baseline warning, equipment, assistant controls, cross-page walkthrough and mobile passed.')
 browser.close()
