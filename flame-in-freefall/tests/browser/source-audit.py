"""Read public PSI record metadata; never downloads experiment files."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page()
 for record in ['PSI-25','PSI-98','PSI-69','PSI-101']:
  url='https://psi.nasa.gov/physci/repo/data/investigations/'+record
  page.goto(url,wait_until='domcontentloaded',timeout=60000)
  page.get_by_text('Objectives',exact=True).first.wait_for(timeout=45000)
  text=page.locator('body').inner_text()
  start=text.find(record)
  print('\n'+url+'\n'+text[start:start+2400],flush=True)
 browser.close()
