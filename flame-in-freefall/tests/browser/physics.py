from playwright.sync_api import sync_playwright
import os
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');errors=[]
 page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto(os.environ.get('TEST_BASE_URL','http://localhost:4174')+'/understand.html')
 page.locator('#arrhenius').scroll_into_view_if_needed()
 assert page.locator('#arrhenius math').is_visible()
 assert page.locator('#arrhenius mfrac').bounding_box()['height']>20
 page.locator('#arrhenius').screenshot(path='/private/tmp/7oaks-arrhenius-desktop.png')
 page.locator('#droplet-physics').scroll_into_view_if_needed()
 page.wait_for_function("document.querySelector('.droplet-source-figure img').naturalWidth>0")
 page.locator('.droplet-source-figure').screenshot(path='/private/tmp/7oaks-droplet-desktop.png')
 page.evaluate("()=>AssistantChat.execute([{type:'scroll',section:'extinction-limits'}])")
 assert 'Opened extinction-limits' in page.locator('#agent-actions').text_content()
 page.set_viewport_size({'width':390,'height':844})
 page.locator('#arrhenius').scroll_into_view_if_needed()
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path='/private/tmp/7oaks-arrhenius-mobile.png')
 page.locator('#droplet-physics').scroll_into_view_if_needed()
 assert page.locator('.droplet-source-figure img').bounding_box()['width']<=390
 assert not errors,errors
 print('Physics: equation, diagram, source links, assistant target and mobile layout passed.')
 browser.close()
