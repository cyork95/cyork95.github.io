/* ─── Lesson page (?slug=) ───────────────────────────────────────
   Metadata from data/lessons.json, body from content/lessons/<slug>.md
   (rendered with the vendored marked). Mirrors the recipe page pattern:
   same shared chrome, registry-driven head, prev/next nav in track order.
------------------------------------------------------------------- */

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

function renderNotFound() {
  const article = document.getElementById('lesson-article');
  if (article) {
    article.innerHTML = `
      <p style="color:var(--text-secondary);padding:2rem 0">Lesson not found.</p>
      <a href="lessons.html" class="pk-back-link" style="margin-top:1rem">← All lessons</a>`;
  }
  document.title = 'Lesson Not Found — The Prompt Kitchen';
}

function renderLesson(entry, body, index, lessons) {
  const article = document.getElementById('lesson-article');
  if (!article) return;

  document.title = `${entry.title} — The Prompt Kitchen`;

  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;

  const prevLink = prev
    ? `<a href="lesson.html?slug=${prev.slug}" class="pk-lesson-nav__link">← Previous: ${escapeHTML(prev.title)}</a>`
    : `<a href="lessons.html" class="pk-lesson-nav__link">← All lessons</a>`;
  const nextLink = next
    ? `<a href="lesson.html?slug=${next.slug}" class="pk-lesson-nav__link">Next: ${escapeHTML(next.title)} →</a>`
    : `<a href="lessons.html" class="pk-lesson-nav__link">All lessons →</a>`;

  article.innerHTML = `
    <header class="pk-article-header">
      <p class="pk-lesson-kicker">LESSON ${entry.number} OF 6 · CONTEXT MATTERS</p>
      <h1 class="pk-article-title">${escapeHTML(entry.title)}</h1>
      <p class="pk-article-teaser">${escapeHTML(entry.subtitle)}</p>
    </header>
    <div class="pk-prose" id="lesson-body"></div>
    <nav class="pk-lesson-nav" aria-label="Lesson navigation">
      ${prevLink}
      ${nextLink}
    </nav>`;

  document.getElementById('lesson-body').innerHTML = marked.parse(body);
  addCopyButtons(document.getElementById('lesson-body'));
}

fetch('data/lessons.json')
  .then((res) => {
    if (!res.ok) throw new Error(res.status);
    return res.json();
  })
  .then((lessons) => {
    const index = lessons.findIndex((l) => l.slug === slug);
    if (index < 0) {
      renderNotFound();
      return null;
    }
    return fetch(`content/lessons/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error('404');
        return res.text();
      })
      .then((raw) => renderLesson(lessons[index], stripFrontmatter(raw), index, lessons));
  })
  .catch((err) => {
    renderNotFound();
    console.error(err);
  });
