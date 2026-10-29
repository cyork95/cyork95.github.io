/* ─── Recipe Book: browse + search ─────────────────────────────
   Mirrors the old /prompts/ index: cards render in registry order
   (featured first), live substring search across title / teaser /
   category / tags, category pills, count line, empty state.
------------------------------------------------------------------- */

let allRecipes = [];
let activeCategory = 'All';
let searchQuery = '';

function recipeCard(recipe) {
  const slug = encodeURIComponent(recipe.slug);
  const tags = (recipe.tags || []).slice(0, 3)
    .map((t) => `<span class="pk-recipe-card__tag">${escapeHTML(t)}</span>`)
    .join('');
  return `
    <a class="pk-recipe-card" href="recipe.html?slug=${slug}"
       data-category="${escapeHTML(recipe.category || '')}"
       data-title="${escapeHTML((recipe.title || '').toLowerCase())}"
       data-tags="${escapeHTML((recipe.tags || []).join(' ').toLowerCase())}"
       data-teaser="${escapeHTML((recipe.teaser || '').toLowerCase())}">
      <div class="pk-recipe-card__meta">
        <span class="pk-recipe-card__category">${escapeHTML(recipe.category)}</span>
        <span class="pk-recipe-card__difficulty">${escapeHTML(difficultyLabel(recipe.difficulty))}</span>
      </div>
      <h3>${recipe.community ? '<span title="Community Recipe">👵</span>' : ''}${escapeHTML(recipe.title)}</h3>
      <p class="pk-recipe-card__teaser">${escapeHTML(recipe.teaser)}</p>
      ${tags ? `<div class="pk-recipe-card__tags">${tags}</div>` : ''}
      <div class="pk-recipe-card__footer">
        <span class="pk-recipe-card__read">Read recipe →</span>
        <button class="pk-heart-btn" type="button"
          data-recipe-id="${escapeHTML(recipe.slug)}"
          data-recipe-title="${escapeHTML(recipe.title)}"
          data-recipe-category="${escapeHTML(recipe.category || '')}"
          data-recipe-url="recipe.html?slug=${slug}"
          aria-label="Save ${escapeHTML(recipe.title)}">🤍</button>
      </div>
    </a>`;
}

function filterRecipes() {
  const grid = document.getElementById('recipe-grid');
  const countEl = document.getElementById('results-count');
  const emptyState = document.getElementById('empty-state');
  if (!grid) return;

  let visible = 0;
  grid.querySelectorAll('.pk-recipe-card').forEach((card) => {
    const cardCategory = card.dataset.category ?? '';
    const searchText = [
      card.dataset.title,
      card.dataset.tags,
      card.dataset.teaser,
      cardCategory.toLowerCase(),
    ].join(' ');

    const matchesCategory = activeCategory === 'All' || cardCategory === activeCategory;
    const matchesSearch = searchQuery === '' || searchText.includes(searchQuery);
    const show = matchesCategory && matchesSearch;

    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  if (countEl) countEl.textContent = `${visible} recipe${visible !== 1 ? 's' : ''}`;
  if (emptyState) emptyState.hidden = visible > 0;
}

function setActivePill(pills, category) {
  pills.forEach((p) => p.classList.toggle('active', p.dataset.category === category));
}

function buildPills(categories) {
  const container = document.getElementById('filter-pills');
  if (!container) return [];
  container.innerHTML = '';
  const pills = categories.map((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pk-filter-pill${cat === 'All' ? ' active' : ''}`;
    btn.dataset.category = cat;
    btn.textContent = cat;
    container.appendChild(btn);
    return btn;
  });
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      activeCategory = pill.dataset.category;
      setActivePill(pills, activeCategory);
      filterRecipes();
    });
  });
  return pills;
}

function initHeartButtons() {
  document.querySelectorAll('.pk-heart-btn').forEach((btn) => {
    const id = btn.dataset.recipeId;
    btn.textContent = isFavorite(id) ? '❤️' : '🤍';
    btn.setAttribute('aria-label', `${isFavorite(id) ? 'Unsave' : 'Save'} ${btn.dataset.recipeTitle}`);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const saved = toggleFavorite(id, {
        title: btn.dataset.recipeTitle,
        category: btn.dataset.recipeCategory,
        url: btn.dataset.recipeUrl,
      });
      btn.textContent = saved ? '❤️' : '🤍';
      btn.setAttribute('aria-label', `${saved ? 'Unsave' : 'Save'} ${btn.dataset.recipeTitle}`);
    });
  });
}

fetch('data/recipes.json')
  .then((res) => {
    if (!res.ok) throw new Error(`Failed to load registry: ${res.status}`);
    return res.json();
  })
  .then((recipes) => {
    // Source sorts featured first, then by recency. The registry has no
    // dates, so featured-first is applied stably over registry order.
    allRecipes = [...recipes].sort((a, b) => Number(b.featured || false) - Number(a.featured || false));

    const grid = document.getElementById('recipe-grid');
    if (grid) grid.innerHTML = allRecipes.map(recipeCard).join('');

    const pills = buildPills(['All', ...new Set(allRecipes.map((r) => r.category))]);

    const searchInput = document.getElementById('recipe-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase().trim();
        filterRecipes();
      });
    }

    const clearBtn = document.getElementById('btn-clear-filters');
    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        activeCategory = 'All';
        searchQuery = '';
        searchInput.value = '';
        setActivePill(pills, 'All');
        filterRecipes();
      });
    }

    initHeartButtons();
    filterRecipes();
  })
  .catch((err) => {
    const grid = document.getElementById('recipe-grid');
    if (grid) {
      grid.innerHTML = '<p class="pk-empty-state">Could not load recipes. Make sure you are running this from a local server.</p>';
    }
    console.error(err);
  });
