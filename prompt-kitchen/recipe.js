/* ─── Recipe page (?slug=) ──────────────────────────────────────
   Metadata from data/recipes.json, body from content/recipes/<slug>.md
   (frontmatter stripped, rendered with the vendored marked). Vote bar is
   local-only in this phase: three toggles, no counts, no backend.
------------------------------------------------------------------- */

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

function renderError(message) {
  const article = document.getElementById('recipe-article');
  if (article) {
    article.innerHTML = `
      <p style="color:var(--text-secondary);padding:2rem 0">${escapeHTML(message)}</p>
      <a href="recipes.html" class="pk-back-link" style="margin-top:1rem">← Back to Recipe Book</a>`;
  }
  document.title = 'Recipe Not Found — The Prompt Kitchen';
}

function renderRecipe(meta, body) {
  const article = document.getElementById('recipe-article');
  if (!article) return;

  document.title = `${meta.title} — The Prompt Kitchen`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', meta.teaser || meta.title);

  const quickInfo = (meta.bestFor || meta.whenToUse)
    ? `<div class="pk-quick-info">
        ${meta.bestFor ? `<div class="pk-quick-info__item"><span class="pk-quick-info__label">Best for</span><span class="pk-quick-info__value">${escapeHTML(meta.bestFor)}</span></div>` : ''}
        ${meta.whenToUse ? `<div class="pk-quick-info__item"><span class="pk-quick-info__label">When to use</span><span class="pk-quick-info__value">${escapeHTML(meta.whenToUse)}</span></div>` : ''}
      </div>`
    : '';

  const tags = (meta.tags || []).length
    ? `<div class="pk-article-tags">${meta.tags.map((t) => `<span class="pk-recipe-card__tag">${escapeHTML(t)}</span>`).join('')}</div>`
    : '';

  const contributor = meta.contributor
    ? `<p class="pk-contributor">Submitted by <strong>${escapeHTML(meta.contributor)}</strong></p>`
    : '';

  const saved = isFavorite(slug);

  article.innerHTML = `
    <header class="pk-article-header">
      <div class="pk-article-meta">
        <span class="pk-recipe-card__category">${escapeHTML(meta.category)}</span>
        <span class="pk-recipe-card__difficulty">${escapeHTML(difficultyLabel(meta.difficulty))}</span>
        ${meta.community ? '<span class="pk-community-badge">👵 Community Recipe</span>' : ''}
      </div>
      <h1 class="pk-article-title">${escapeHTML(meta.title)}</h1>
      <p class="pk-article-teaser">${escapeHTML(meta.teaser)}</p>
      ${quickInfo}
      ${tags}
      ${contributor}
    </header>
    <div class="pk-vote-bar" id="vote-bar">
      <button class="pk-vote-btn" type="button" data-emoji="fire" aria-label="Love this prompt">🔥 Love it</button>
      <button class="pk-vote-btn" type="button" data-emoji="chef" aria-label="Cooked using this prompt">👨‍🍳 Used it</button>
      <button class="pk-vote-btn" type="button" data-emoji="star" aria-label="Found this useful">⭐ Useful</button>
      <button class="pk-save-btn${saved ? ' saved' : ''}" type="button" id="save-btn"
        aria-label="${saved ? 'Remove from My Kitchen' : 'Save to My Kitchen'}"
        title="${saved ? 'Remove from My Kitchen' : 'Save to My Kitchen'}">${saved ? '❤️ Saved!' : '🤍 Save'}</button>
    </div>
    <div class="pk-prose" id="recipe-body"></div>
    <p style="margin-top:2.5rem"><a href="recipes.html" class="pk-back-link">← Back to Recipe Book</a></p>`;

  document.getElementById('recipe-body').innerHTML = marked.parse(body);
  addCopyButtons(document.getElementById('recipe-body'));

  // Votes: pressed state reflects getMyVotes, toggling writes pk-votes-<slug>
  const myVotes = getMyVotes(slug);
  article.querySelectorAll('.pk-vote-btn').forEach((btn) => {
    const emoji = btn.dataset.emoji;
    if (myVotes.has(emoji)) btn.classList.add('voted');
    btn.addEventListener('click', () => {
      const voted = toggleVote(slug, emoji);
      btn.classList.toggle('voted', voted);
    });
  });

  // Favorite toggle
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const nowSaved = toggleFavorite(slug, {
        title: meta.title,
        category: meta.category,
        url: `recipe.html?slug=${slug}`,
      });
      saveBtn.classList.toggle('saved', nowSaved);
      saveBtn.textContent = nowSaved ? '❤️ Saved!' : '🤍 Save';
      saveBtn.setAttribute('aria-label', nowSaved ? 'Remove from My Kitchen' : 'Save to My Kitchen');
      saveBtn.setAttribute('title', nowSaved ? 'Remove from My Kitchen' : 'Save to My Kitchen');
    });
  }
}

if (!slug) {
  window.location.replace('recipes.html');
} else {
  fetch('data/recipes.json')
    .then((res) => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then((recipes) => {
      const meta = recipes.find((r) => r.slug === slug);
      if (!meta) {
        renderError('Recipe not found. It may have moved or the link might be wrong.');
        return null;
      }
      return fetch(`content/recipes/${slug}.md`)
        .then((res) => {
          if (!res.ok) throw new Error('404');
          return res.text();
        })
        .then((raw) => renderRecipe(meta, stripFrontmatter(raw)));
    })
    .catch((err) => {
      if (err.message === '404') {
        renderError('Recipe not found. It may have moved or the link might be wrong.');
      } else {
        renderError('Could not load this recipe. Make sure you are running from a local server.');
      }
      console.error(err);
    });
}
