/* ─── Kitchen Guardrails: 8 items grouped by category ─────────
   Category order + labels mirror the source page. Bodies lazy-load
   from content/guardrails/ on first <details> open.
------------------------------------------------------------------- */

const GR_CATEGORY_LABELS = {
  accuracy: '🎯 Accuracy',
  trust: '🤝 Trust',
  privacy: '🔒 Privacy',
  bias: '⚖️ Bias',
  safety: '🛡️ Safety',
};

const GR_CATEGORY_COLORS = {
  accuracy: '#B45309',
  trust: '#D97706',
  privacy: '#2563EB',
  bias: '#7C3AED',
  safety: '#059669',
};

// Category order follows the source page's label record above.
const GR_CATEGORY_ORDER = ['accuracy', 'trust', 'privacy', 'bias', 'safety'];

const loadedBodies = {};

function loadBody(slug, target) {
  if (loadedBodies[slug]) return;
  loadedBodies[slug] = true;
  fetch(`content/guardrails/${slug}.md`)
    .then((res) => {
      if (!res.ok) throw new Error(`${slug}: ${res.status}`);
      return res.text();
    })
    .then((raw) => {
      target.innerHTML = marked.parse(stripFrontmatter(raw));
    })
    .catch((err) => {
      target.innerHTML = '<p class="pk-empty-state">Could not load this guardrail.</p>';
      console.error(err);
    });
}

fetch('data/guardrails.json')
  .then((res) => {
    if (!res.ok) throw new Error(`Failed to load registry: ${res.status}`);
    return res.json();
  })
  .then((items) => {
    const container = document.getElementById('guardrail-groups');
    if (!container) return;

    const byCategory = {};
    items.forEach((item) => {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item);
    });

    // Registry order within each category, categories in source order,
    // then any unexpected categories in first-appearance order.
    const extra = [...new Set(items.map((i) => i.category))].filter((c) => !GR_CATEGORY_ORDER.includes(c));
    const ordered = [...GR_CATEGORY_ORDER.filter((c) => byCategory[c]), ...extra];

    container.innerHTML = ordered.map((category) => {
      const label = GR_CATEGORY_LABELS[category] || category;
      const color = GR_CATEGORY_COLORS[category] || '#B85C20';
      const cards = byCategory[category].map((item) => {
        const slug = escapeHTML(item.slug);
        return `
          <div class="pk-detail-card pk-detail-card--colored" style="--pk-item-color: ${escapeHTML(color)}">
            <span class="pk-detail-card__eyebrow">${escapeHTML(label)}</span>
            <h3>${escapeHTML(item.title)}</h3>
            <p class="pk-detail-card__sub">🍳 ${escapeHTML(item.analogy)}</p>
            <details class="pk-lazy-detail" data-slug="${slug}">
              <summary>Read the guardrail</summary>
              <div class="pk-prose" data-body></div>
            </details>
          </div>`;
      }).join('');
      return `
        <section class="pk-shelf">
          <div class="pk-shelf__header">
            <h2 class="pk-shelf__label">${escapeHTML(label)}</h2>
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
    const container = document.getElementById('guardrail-groups');
    if (container) {
      container.innerHTML = '<p class="pk-empty-state">Could not load guardrails. Make sure you are running this from a local server.</p>';
    }
    console.error(err);
  });
