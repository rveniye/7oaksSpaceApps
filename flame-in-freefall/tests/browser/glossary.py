"""Check glossary timing, content, dynamic updates and accessible interaction."""
from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1280,'height':900},reduced_motion='reduce');errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 base=os.environ.get('TEST_BASE_URL','http://localhost:4174')
 for name in ['index','understand','prevent','detect','suppress','earth']:
  page.goto(base+'/'+name+'.html');page.wait_for_selector('.glossary-term')
  assert page.locator('#term-explanation').count()==1
  assert page.locator('button button,a button').count()==0
  term=page.locator('.glossary-term').first;term.scroll_into_view_if_needed();term.hover();page.wait_for_timeout(500)
  assert page.locator('#term-explanation').is_hidden(),name+' opened too early'
  page.wait_for_timeout(650);assert page.locator('#term-explanation').is_visible(),name
  page.keyboard.press('Escape');assert page.locator('#term-explanation').is_hidden()
  term.focus();page.wait_for_timeout(1100);assert page.locator('#term-explanation').is_visible()
  page.keyboard.press('Escape');page.locator('body').click(position={'x':1,'y':1});term.hover();page.wait_for_timeout(150);page.mouse.move(0,0);page.wait_for_timeout(1100);assert page.locator('#term-explanation').is_hidden()
  print(name,'hover delay, cancellation, keyboard and markup passed',flush=True)
 page.goto(base+'/understand.html');flex=page.locator('.glossary-term[data-term="flex"]').first;flex.click()
 expected=page.evaluate('ExperimentDefinitions.find(e=>e.term==="FLEX").description')
 assert page.locator('#term-explanation p').inner_text()==expected
 page.keyboard.press('Escape')
 page.locator('[data-scene="microgravity"]').click()
 page.wait_for_selector('#scene-description .glossary-term')
 assert page.locator('#scene-description .glossary-term[data-term="diffusion"]').count()==1
 page.set_viewport_size({'width':390,'height':844})
 flex.click();page.wait_for_timeout(350);assert page.locator('#term-explanation').is_visible()
 box=page.locator('#term-explanation').bounding_box();assert box['x']>=0 and box['x']+box['width']<=390
 page.screenshot(path='/private/tmp/7oaks-glossary-mobile.png')
 assert not errors,errors
 print('Markdown content, dynamic captions and mobile popup passed',flush=True)
 browser.close()
