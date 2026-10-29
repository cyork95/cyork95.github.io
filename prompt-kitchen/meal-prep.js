/* ─── Meal Prep: 10 system prompts in registry order ───────────
   Bodies lazy-load from content/meal-prep/ on first <details> open.
------------------------------------------------------------------- */

const MP_CATEGORY_LABELS = {
  writing: '✍️ Writing',
  coding: '💻 Coding',
  learning: '📚 Learning',
  productivity: '⚡ Productivity',
  business: '💼 Business',
};

function categoryLabel(cat) {
  return MP_CATEGORY_LABELS[cat] || cat || '';
}

const loadedBodies = {};

function loadBody(details, slug, target) {
  if (loadedBodies[slug]) return;
  loadedBodies[slug] = true;
  fetch(`content/meal-prep/${slug}.md`)
    .then((res) => {
      if (!res.ok) throw new Error(`${slug}: ${res.status}`);
      return res.text();
    })
    .then((raw) => {
      target.innerHTML = marked.parse(stripFrontmatter(raw));
    })
    .catch((err) => {
      target.innerHTML = '<p class="pk-empty-state">Could not load this prompt.</p>';
      console.error(err);
    });
}

fetch('data/meal-prep.json')
  .then((res) => {
    if (!res.ok) throw new Error(`Failed to load registry: ${res.status}`);
    return res.json();
  })
  .then((items) => {
    const grid = document.getElementById('mp-grid');
    if (!grid) return;

    const countEl = document.getElementById('mp-count');
    if (countEl) countEl.textContent = `${items.length} system prompt${items.length !== 1 ? 's' : ''}`;

    grid.innerHTML = items.map((item) => {
      const slug = escapeHTML(item.slug);
      const badges = (item.bestOn || [])
        .map((p) => `<span class="pk-platform-badge">${escapeHTML(p)}</span>`)
        .join('');
      return `
        <div class="pk-detail-card">
          <span class="pk-detail-card__eyebrow">${escapeHTML(categoryLabel(item.category))}</span>
          <h3>${escapeHTML(item.title)}</h3>
          <p class="pk-detail-card__text">${escapeHTML(item.tagline)}</p>
          ${badges ? `<div class="pk-platform-badges">${badges}</div>` : ''}
          <details class="pk-lazy-detail" data-slug="${slug}">
            <summary>View system prompt</summary>
            <div class="pk-prose" data-body></div>
          </details>
        </div>`;
    }).join('');

    grid.querySelectorAll('details.pk-lazy-detail').forEach((details) => {
      details.addEventListener('toggle', () => {
        if (details.open) {
          loadBody(details, details.dataset.slug, details.querySelector('[data-body]'));
        }
      }, { once: false });
    });
  })
  .catch((err) => {
    const grid = document.getElementById('mp-grid');
    if (grid) {
      grid.innerHTML = '<p class="pk-empty-state">Could not load system prompts. Make sure you are running this from a local server.</p>';
    }
    console.error(err);
  });
