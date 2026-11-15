(() => {
 const data=window.SourceProvenance;if(!data)return;
 const page=document.body.dataset.researchPage||'home',main=document.querySelector('main');if(!main)return;
 const node=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
 const section=node('section');section.id='research-sources';section.className='provenance-section';
 section.append(node('h2','Where the information comes from'),node('p','The explanations use research publications and NASA investigation descriptions. The animations use authored examples; experimental run files have not been imported. The comparisons use preliminary assessments, not measured detector performance.'));
 const guide=node('details');guide.append(node('summary','Sources, checks and limits'));
 guide.append(node('p','Each check below applies only to the stated topic. A repository record can contain inconsistent metadata. A second source helps catch those differences; it does not certify every result.'));
 for(const record of Object.values(data.records).filter(r=>['home','experiments'].includes(page)||r.pages.includes(page))){
  const article=node('article');article.className='provenance-record';
  article.append(node('h3',record.sources[0].title),node('p',`${record.status} · checked ${record.checkedOn}`),node('p',record.checkedScope));
  const list=node('ul');for(const source of record.sources){const li=node('li'),a=node('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,node('span',` — ${source.kind}. Check: ${source.locator}.`));if(source.doi)li.append(node('span',` DOI: ${source.doi}.`));list.append(li);}article.append(list,node('p','Limits: '+record.limits));
  for(const issue of record.issues){const note=node('p','Source discrepancy: '+issue);note.className='provenance-issue';article.append(note);}guide.append(article);
 }
 section.append(guide);main.append(section);
})();
