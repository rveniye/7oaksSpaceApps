(() => {
 const data=window.SourceProvenance;if(!data)return;
 const page=document.body.dataset.researchPage||'home',main=document.querySelector('main');if(!main)return;
 const node=(tag,text)=>{const n=document.createElement(tag);if(text)n.textContent=text;return n;};
 const section=node('section');section.id='research-sources';section.className='provenance-section';
 section.append(node('h2','Where the information comes from'),node('p','Explore the research publications and NASA investigations behind these explanations.'));
 const guide=node('details');guide.append(node('summary','Research references'));
 for(const record of Object.values(data.records).filter(r=>['home','experiments'].includes(page)||r.pages.includes(page))){
  const article=node('article');article.className='provenance-record';
  article.append(node('h3',record.sources[0].title),node('p',`References checked ${record.checkedOn}`));
  const list=node('ul');for(const source of record.sources){const li=node('li'),a=node('a',source.title);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,node('span',` — ${source.kind}. Check: ${source.locator}.`));if(source.doi)li.append(node('span',` DOI: ${source.doi}.`));list.append(li);}article.append(list);
  guide.append(article);
 }
 section.append(guide);main.append(section);
})();
