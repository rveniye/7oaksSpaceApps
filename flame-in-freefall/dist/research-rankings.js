(() => {
 const data=globalThis.ResearchRankings,page=document.body.dataset.researchPage,rows=data?.pages[page];
 if(!rows)return;
 const section=document.getElementById('research-ranking');if(!section)return;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 section.append(node('span','RESEARCH READING ORDER','mono eyebrow'),node('h2','Which investigations should I read first?'),node('p','Ranked by relevance to this page. Direct topic matches earn 3 points, related research earns 1, and background research earns 0. Equal scores share a rank. These scores guide reading; they do not measure safety or equipment performance.'));
 const list=node('ol',null,'page-ranking-list');
 for(const r of rows){
  const item=node('li',null,'page-ranking-item');item.value=r.rank;
  const head=node('div',null,'page-ranking-heading');head.append(node('span',`#${r.rank}${r.tied?' · tie':''}`,'mono'),node('h3',r.name),node('span',`${r.score}/3 · ${r.relevance}`,'page-ranking-score'));item.append(head);
  item.append(node('p',r.reason));
  const details=node('details');details.append(node('summary','Research question and sources'),node('p',r.objective));
  const refs=node('ul');for(const source of r.sources){const li=node('li'),a=node('a',source.title+' ↗');a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);refs.append(li);}details.append(refs);item.append(details);list.append(item);
 }
 section.append(list,node('p','Scope: all 12 investigation families in this dashboard’s catalogue. Broader research connections can be explored in the investigation finder.','model-note'));
 const link=node('a','Compare investigations ↗');link.href='index.html#investigations';section.append(link);
 // Keep the ranking after the dynamically inserted bibliography.
 document.querySelector('main').append(section);
})();
