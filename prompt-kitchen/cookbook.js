/* ─── Cookbook page (?slug=) ───────────────────────────────────
   Hero from the registry meta, a chapter jump-list, then each chapter
   in registry order: <h2 id="<slug>"> + rendered body.
------------------------------------------------------------------- */

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

function renderError(message) {
  const article = document.getElementById('cookbook-article');
  if (article) {
    article.innerHTML = `
      <p style="color:var(--text-secondary);padding:2rem 0">${escapeHTML(message)}</p>
      <a href="cookbooks.html" class="pk-back-link" style="margin-top:1rem">← Back to all cookbooks</a>`;
  }
  document.title = 'Cookbook Not Found — The Prompt Kitchen';
}

function renderCookbook(book) {
  const article = document.getElementById('cookbook-article');
  if (!article) return;

  document.title = `${book.title} — The Prompt Kitchen`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', book.description || book.title);

  const chapters = book.chapters || [];
  const pills = (book.audience || [])
    .map((a) => `<span class="pk-book-hero__pill">👤 ${escapeHTML(a)}</span>`)
    .join('');
  const countPill = `<span class="pk-book-hero__pill">📋 ${chapters.length} chapter${chapters.length !== 1 ? 's' : ''}</span>`;

  const jumpList = chapters.length
    ? `<nav class="pk-jump-list" aria-label="Chapters">
         <h2>Chapters</h2>
         <ol>${chapters.map((c) => `<li><a href="#${escapeHTML(c.slug)}">${escapeHTML(c.title)}</a></li>`).join('')}</ol>
       </nav>`
    : '';

  article.innerHTML = `
    <header class="pk-book-hero" style="--pk-book: ${escapeHTML(book.color)}">
      <span class="pk-book-hero__icon">${escapeHTML(book.emoji)}</span>
      <h1>${escapeHTML(book.title)}</h1>
      <p class="pk-book-hero__tagline">${escapeHTML(book.tagline)}</p>
      <p class="pk-book-hero__desc">${escapeHTML(book.description)}</p>
      <div class="pk-book-hero__pills">${pills}${countPill}</div>
    </header>
    ${jumpList}
    <div id="chapters"><p class="pk-loading">Loading chapters…</p></div>
    <p style="margin-top:2.5rem"><a href="cookbooks.html" class="pk-back-link">← All Cookbooks</a></p>`;

  // Fetch + render each chapter body in registry order
  const container = document.getElementById('chapters');
  Promise.all(chapters.map((chapter) =>
    fetch(`content/cookbooks/${chapter.slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error(`chapter ${chapter.slug}: ${res.status}`);
        return res.text();
      })
      .then((raw) => ({
        slug: chapter.slug,
        title: chapter.title,
        html: marked.parse(stripFrontmatter(raw)),
      }))
  ))
    .then((rendered) => {
      container.innerHTML = rendered.map((c) => `
        <section class="pk-chapter">
          <h2 id="${escapeHTML(c.slug)}">${escapeHTML(c.title)}</h2>
          <div class="pk-prose">${c.html}</div>
        </section>`).join('');
    })
    .catch((err) => {
      container.innerHTML = '<p class="pk-empty-state">Could not load chapters. Make sure you are running this from a local server.</p>';
      console.error(err);
    });
}

if (!slug) {
  window.location.replace('cookbooks.html');
} else {
  fetch('data/cookbooks.json')
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then((books) => {
      const book = books.find((b) => b.slug === slug);
      if (!book) {
        renderError('Cookbook not found. It may have moved or the link might be wrong.');
        return;
      }
      renderCookbook(book);
    })
    .catch((err) => {
      renderError('Could not load this cookbook. Make sure you are running from a local server.');
      console.error(err);
    });
}
