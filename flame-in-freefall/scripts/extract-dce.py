"""Re-extract NASA Table 1. Requires pymupdf; never downloads silently.
Usage: python scripts/extract-dce.py
"""
from pathlib import Path
import hashlib,json,re,csv,io
import pymupdf
ROOT=Path(__file__).resolve().parent.parent
src=ROOT/'data/originals/20040000941.pdf'
doc=pymupdf.open(src)
columns=['test','pressure_bar','oxygen_percent','initial_diameter_mm','burn_time_s','k_initial_mm2_s','k_overall_mm2_s','k_final_mm2_s','extinction_flame_mm','extinction_droplet_mm','drift_flame_mm_s','drift_droplet_mm_s']
rows=[]
for page in [20,21]:
 text=doc[page].get_text()
 (ROOT/f'data/extracted/dce-table1-page-{page+1}.txt').write_text(text)
 lines=[s.strip() for s in text.splitlines() if s.strip()]
 starts=[i for i,s in enumerate(lines[:-1]) if re.fullmatch(r'\d+\s*[ah]?',s) and lines[i+1] in ['1.00','0.50','0.25']]
 for idx,start in enumerate(starts):
  end=starts[idx+1] if idx+1<len(starts) else next(i for i in range(start+1,len(lines)) if lines[i].startswith('aSTS-83') or lines[i].startswith('NASA/TM'))
  cells=lines[start:end];num=int(re.match(r'\d+',cells[0])[0])
  if num in [35,37]:cells[8:8]=['','']
  assert len(cells)==12,(num,cells)
  raw=dict(zip(columns,cells));values={}
  for key,cell in raw.items():
   if key=='test':continue
   values[key]=float(re.match(r'(?:\d+\.?\d*)',cell)[0]) if re.match(r'\d',cell) else None
  rows.append({'id':f'DCE-{num:02d}','test':num,'flight':'STS-83' if 'a' in cells[0] else 'STS-94','fuel':'n-heptane','gas':'air' if raw['oxygen_percent']=='Air' else 'oxygen/helium','support':'fibre' if 'h' in cells[0] else 'free','gravity':'microgravity','temperature_context':'Within a few kelvin of 300 K (report abstract)','source_page':page+1,'printed_page':page-3,'table':'1','source_row':num,'source_raw':raw,'approximate_diameter': '±' in raw['initial_diameter_mm'],**values})
assert len(rows)==38
# A separate visual transcription of the rendered table checks every value used by the models.
with (ROOT/'data/extracted/dce-visual-check.csv').open() as f:
 audit=list(csv.DictReader(f))
assert len(audit)==38
for r,a in zip(rows,audit):
 for col in a:assert str(r['source_raw'][col])==a[col],(r['id'],col,r['source_raw'][col],a[col])
sha=hashlib.sha256(src.read_bytes()).hexdigest()
data={'version':1,'id':'DCE-MSL1-TABLE1','title':'MSL-1 n-heptane droplet combustion — DCE Table 1','source':{'url':'https://ntrs.nasa.gov/api/citations/20040000941/downloads/20040000941.pdf','record':'https://ntrs.nasa.gov/citations/20040000941','report':'NASA/TM—2003-212553 (October 2003)','sha256':sha,'file':'20040000941.pdf','retrieved_on':'2026-11-15','locator':'Table 1, printed pp. 17–18 / PDF pp. 21–22','verification':'All 38 rows: automated PDF extraction compared with a separate visual transcription of pressure, atmosphere, diameter, burn time and overall K. Cross-checked against NASA record abstract and report discussion.','reviewer':'Codex extraction and visual cross-check','rights':'NTRS public distribution. Numerical facts transcribed; original report retained with attribution. No licence is inferred for other PSI datasets.'},'scope':'Published experimental summary values, not raw instrument time series. DCE aboard Spacelab MSL-1 (STS-83/94), not FLEX or ISS. No partial-gravity or solid-material data.','measurement':'Report uses backlit droplet imaging and OH flame imaging; see data-reduction discussion. No instrument calibration files imported.','uncertainty':'No per-cell uncertainty for burn time or K in Table 1. Initial-diameter estimates for tests 17, 27 and 33 retain their printed ± values. No missing or below-resolution value is treated as zero.','missing_codes':{'c':'Not reported because variation is minimal','d':'Not measurable: too small','e':'Not measurable: drift out of field of view','f':'No droplet view','blank':'Blank in original table','~0':'Approximately zero (not an exact measurement)','g':'Approximate value estimated from very dim view'},'units':{c:('bar' if c=='pressure_bar' else 'percent oxygen mole fraction' if c=='oxygen_percent' else 'mm²/s' if c.startswith('k_') else 'mm/s' if c.startswith('drift') else 's' if c=='burn_time_s' else 'mm') for c in columns[1:]},'rows':rows}
(ROOT/'data/extracted/dce-table1.json').write_text(json.dumps(data,indent=2)+'\n')
print('Verified and extracted',len(rows),'rows; SHA256',sha)
