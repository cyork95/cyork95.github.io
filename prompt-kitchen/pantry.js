/* ─── The Pantry: items grouped by shelf ───────────────────────
   Shelf order + labels mirror the source page: shelves appear in the
   order their first item appears in the registry (registry is sorted
   by `order`). Bodies lazy-load on first <details> open.
------------------------------------------------------------------- */

const SHELF_META = {
  role: { label: 'Role Frames', emoji: '👤', desc: 'Who the AI should be' },
  context: { label: 'Context Setters', emoji: '📋', desc: 'Background the AI needs' },
  chain: { label: 'Chain Starters', emoji: '🔗', desc: 'Multi-step prompt structures' },
  format: { label: 'Format Specifiers', emoji: '📐', desc: 'How to structure the output' },
  tone: { label: 'Tone Adjusters', emoji: '🎭', desc: 'The voice and register' },
  constraint: { label: 'Constraints', emoji: '🚧', desc: 'What to avoid or limit' },
};

const loadedBodies = {};

function loadBody(slug, target) {
  if (loadedBodies[slug]) return;
  loadedBodies[slug] = true;
  fetch(`content/pantry/${slug}.md`)
    .then((res) => {
      if (!res.ok) throw new Error(`${slug}: ${res.status}`);
      return res.text();
    })
    .then((raw) => {
      target.innerHTML = marked.parse(stripFrontmatter(raw));
    })
    .catch((err) => {
      target.innerHTML = '<p class="pk-empty-state">Could not load this ingredient.</p>';
      console.error(err);
    });
}

fetch('data/pantry.json')
  .then((res) => {
    if (!res.ok) throw new Error(`Failed to load registry: ${res.status}`);
    return res.json();
  })
  .then((items) => {
    const container = document.getElementById('pantry-shelves');
    if (!container) return;

    // Group by shelf, preserving first-appearance order (as the source does)
    const shelfOrder = [];
    const shelves = {};
    items.forEach((item) => {
      if (!shelves[item.shelf]) {
        shelves[item.shelf] = [];
        shelfOrder.push(item.shelf);
      }
      shelves[item.shelf].push(item);
    });

    container.innerHTML = shelfOrder.map((shelf) => {
      const meta = SHELF_META[shelf] || { label: shelf, emoji: '🫙', desc: '' };
      const cards = shelves[shelf].map((item) => {
        const slug = escapeHTML(item.slug);
        const combines = (item.combineWith || []).length
          ? `<div class="pk-combines"><span class="pk-combines__label">Pairs with:</span>${item.combineWith.map((c) => `<span class="pk-combines__tag">${escapeHTML(c)}</span>`).join('')}</div>`
          : '';
        return `
          <div class="pk-detail-card">
            <h3>${escapeHTML(item.title)}</h3>
            <p class="pk-detail-card__sub">${escapeHTML(item.whenToUse)}</p>
            ${combines}
            <details class="pk-lazy-detail" data-slug="${slug}">
              <summary>View ingredient</summary>
              <div class="pk-prose" data-body></div>
            </details>
          </div>`;
      }).join('');
      return `
        <section class="pk-shelf">
          <div class="pk-shelf__header">
            <span class="pk-shelf__emoji">${escapeHTML(meta.emoji)}</span>
            <div>
              <h2 class="pk-shelf__label">${escapeHTML(meta.label)}</h2>
              ${meta.desc ? `<p class="pk-shelf__desc">${escapeHTML(meta.desc)}</p>` : ''}
            </div>
          </div>
          <div class="pk-detail-grid">${cards}</div>
        </section>`;
    }).join('');

    container.querySelectorAll('details.pk-lazy-detail').forEach((details) => {
      details.addEventListener('toggle', () => {
        if (details.open) {
          loadBody(details.dataset.slug, details.querySelector('[data-body]'));
        }
      });
    });
  })
  .catch((err) => {
    const container = document.getElementById('pantry-shelves');
    if (container) {
      container.innerHTML = '<p class="pk-empty-state">Could not load the pantry. Make sure you are running this from a local server.</p>';
    }
    console.error(err);
  });
