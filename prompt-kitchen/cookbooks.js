/* ─── Cookbook index: 18 book cards in registry order ────────── */

fetch('data/cookbooks.json')
  .then((res) => {
    if (!res.ok) throw new Error(`Failed to load registry: ${res.status}`);
    return res.json();
  })
  .then((books) => {
    const grid = document.getElementById('cookbooks-grid');
    if (!grid) return;
    grid.innerHTML = books.map((book) => {
      const slug = encodeURIComponent(book.slug);
      const chapters = book.chapters || [];
      const audience = (book.audience || []).join(' · ');
      return `
        <a class="pk-book-card" style="--pk-book: ${escapeHTML(book.color)}" href="cookbook.html?slug=${slug}">
          <div class="pk-book-card__icon">${escapeHTML(book.emoji)}</div>
          <h2>${escapeHTML(book.title)}</h2>
          <p class="pk-book-card__tagline">${escapeHTML(book.tagline)}</p>
          <p class="pk-book-card__desc">${escapeHTML(book.description)}</p>
          <p class="pk-book-card__meta">${audience ? `${escapeHTML(audience)} · ` : ''}${chapters.length} chapter${chapters.length !== 1 ? 's' : ''}</p>
          <span class="pk-book-card__cta">Browse recipes →</span>
        </a>`;
    }).join('');
  })
  .catch((err) => {
    const grid = document.getElementById('cookbooks-grid');
    if (grid) {
      grid.innerHTML = '<p class="pk-empty-state">Could not load cookbooks. Make sure you are running this from a local server.</p>';
    }
    console.error(err);
  });
