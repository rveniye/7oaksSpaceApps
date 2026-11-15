(() => {
  'use strict';
  const page = document.body.dataset.researchPage;
  const main = document.querySelector('main');
  if (!page || !main) return;
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const section = element('section', '', 'research-notes');
  section.id = 'research-notes';
  section.setAttribute('aria-labelledby', 'research-notes-title');
  section.append(element('span', 'RESEARCH REFERENCES', 'mono eyebrow'));
  const heading = element('h2', 'Research background.');
  heading.id = 'research-notes-title';
  section.append(heading, element('p', 'Explore the research background and supporting references. Annotations identify claims that still need checking.', 'notes-intro'));
  const list = element('div', '', 'notes-list');
  const status = element('p', 'Loading research references…', 'notes-status');
  status.setAttribute('role', 'status');
  section.append(status, list);
  main.append(section);

  // Only text and explicitly supported Markdown become DOM; raw HTML stays text.
  function inline(parent, text) {
    const token = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>]+))/g;
    let cursor = 0;
    for (const match of text.matchAll(token)) {
      parent.append(document.createTextNode(text.slice(cursor, match.index)));
      if (match[2]) parent.append(element('strong', match[2]));
      else {
        let url = match[4] || match[5];
        const trailing = match[5] ? url.match(/[.,;]+$/)?.[0] || '' : '';
        if (trailing) url = url.slice(0, -trailing.length);
        const link = element('a', match[3] || url);
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        parent.append(link);
        if (trailing) parent.append(document.createTextNode(trailing));
      }
      cursor = match.index + match[0].length;
    }
    parent.append(document.createTextNode(text.slice(cursor)));
  }
  function markdownContent(markdown) {
    const article = element('div', '', 'notes-prose');
    const lines = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').split(/\r?\n/);
    let paragraph = [], listNode;
    const flush = () => {
      if (paragraph.length) { const p = element('p'); inline(p, paragraph.join('\n')); article.append(p); paragraph = []; }
      listNode = null;
    };
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (!line.trim()) { flush(); continue; }
      if (/^\|/.test(line) && /^\|[\s:|\-]+\|\s*$/.test(lines[index + 1] || '')) {
        flush();
        const wrap = element('div', '', 'notes-table-wrap');
        wrap.tabIndex = 0;
        wrap.setAttribute('role', 'region');
        wrap.setAttribute('aria-label', 'Research reference table');
        const table = element('table');
        const row = (value, header) => {
          const tr = element('tr');
          value.replace(/^\||\|\s*$/g, '').split('|').forEach(cell => {
            const td = element(header ? 'th' : 'td');
            if (header) td.scope = 'col';
            inline(td, cell.trim()); tr.append(td);
          });
          return tr;
        };
        const head = element('thead'); head.append(row(line, true)); table.append(head);
        const body = element('tbody'); index += 2;
        while (index < lines.length && /^\|/.test(lines[index])) body.append(row(lines[index++], false));
        index--; table.append(body); wrap.append(table); article.append(wrap); continue;
      }
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) { flush(); const h = element(heading[1].length === 1 ? 'h3' : 'h4'); inline(h, heading[2]); article.append(h); continue; }
      const item = line.match(/^\s*(?:([-*])\s+|\d+[.)]\s+)(.*)$/);
      if (item) {
        if (paragraph.length) flush();
        const type = item[1] ? 'ul' : 'ol';
        if (!listNode || listNode.tagName.toLowerCase() !== type) { listNode = element(type); article.append(listNode); }
        const li = element('li'); inline(li, item[2]); listNode.append(li); continue;
      }
      if (listNode) listNode = null;
      paragraph.push(line);
    }
    flush();
    return article;
  }
  let rendered = '';
  function render(documents, live) {
    if (!Array.isArray(documents) || !documents.length) return;
    const signature = JSON.stringify(documents);
    status.textContent = live ? 'Reading the current Markdown files from this server.' : 'Included with this website. Source text is available without the assistant.';
    if (rendered === signature) return;
    rendered = signature;
    list.replaceChildren();
    for (const doc of documents) {
      const details = element('details', '', 'source-note');
      details.id = `note-${doc.id.toLowerCase()}`;
      const summary = element('summary');
      summary.append(element('span', doc.title), element('span', doc.status || 'draft', 'note-state'));
      const content = element('div', '', 'source-note-body');
      content.append(element('p', doc.path, 'note-path mono'), element('p', doc.scope, 'note-scope'));
      if (doc.reviewNotes) content.append(element('p', doc.reviewNotes, 'note-review'));
      content.append(markdownContent(doc.markdown));
      const raw = element('details', '', 'note-raw');
      raw.append(element('summary', 'View exact Markdown, including metadata'), element('pre', doc.markdown));
      const download = element('button', 'Download original .md', 'note-download');
      download.type = 'button';
      download.addEventListener('click', () => {
        const url = URL.createObjectURL(new Blob([doc.markdown], { type: 'text/markdown;charset=utf-8' }));
        const anchor = element('a'); anchor.href = url; anchor.download = doc.path.split('/').pop();
        anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
      content.append(raw, download); details.append(summary, content); list.append(details);
    }
    revealLinkedNote();
  }
  function revealLinkedNote() {
    if (!location.hash.startsWith('#note-')) return;
    const note = [...list.children].find(item => `#${item.id}` === location.hash);
    if (note) { note.open = true; note.scrollIntoView({ block: 'start' }); }
  }
  window.addEventListener('hashchange', revealLinkedNote);
  const cached = document.createElement('script');
  cached.src = 'research-notes-data.js';
  cached.onload = () => { if (!rendered) render(window.ResearchNotesData?.[page], false); };
  cached.onerror = () => { if (!rendered) status.textContent = 'Source notes could not be loaded. The repository’s context folder contains the originals.'; };
  document.head.append(cached);
  if (location.protocol !== 'file:') {
    const base = (window.SEVENOAKS_API_BASE || '').replace(/\/$/, '');
    fetch(`${base}/api/research?page=${encodeURIComponent(page)}`, { signal: AbortSignal.timeout(5000) })
      .then(response => response.ok && response.headers.get('content-type')?.includes('application/json') ? response.json() : null)
      .then(data => { if (data?.documents) render(data.documents, true); })
      .catch(() => {}); // Static hosting uses the bundled original notes.
  }
})();
