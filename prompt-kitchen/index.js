/* ─── The Prompt Kitchen home ──────────────────────────────────
   Stats + featured recipes, rendered from the Phase 1A registries.
------------------------------------------------------------------- */

function featuredCard(recipe) {
  const slug = encodeURIComponent(recipe.slug);
  return `
    <a class="pk-recipe-card" href="recipe.html?slug=${slug}">
      <div class="pk-recipe-card__meta">
        <span class="pk-recipe-card__category">${escapeHTML(recipe.category)}</span>
        <span class="pk-recipe-card__difficulty">${escapeHTML(difficultyLabel(recipe.difficulty))}</span>
      </div>
      <h3>${escapeHTML(recipe.title)}</h3>
      <p class="pk-recipe-card__teaser">${escapeHTML(recipe.teaser)}</p>
      <div class="pk-recipe-card__footer">
        <span class="pk-recipe-card__read">Read recipe →</span>
      </div>
    </a>`;
}

function renderStats(counts) {
  const map = {
    recipes: counts.recipes,
    cookbooks: counts.cookbooks,
    'meal-prep': counts.mealPrep,
    pantry: counts.pantry,
  };
  Object.entries(map).forEach(([key, value]) => {
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (el && typeof value === 'number') el.textContent = value;
  });
}

Promise.all([
  fetch('data/recipes.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
  fetch('data/cookbooks.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
  fetch('data/meal-prep.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
  fetch('data/pantry.json').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
])
  .then(([recipes, cookbooks, mealPrep, pantry]) => {
    renderStats({
      recipes: recipes.length,
      cookbooks: cookbooks.length,
      mealPrep: mealPrep.length,
      pantry: pantry.length,
    });

    const featured = recipes.filter((r) => r.featured);
    const grid = document.getElementById('featured-grid');
    if (grid) {
      grid.innerHTML = featured.length
        ? featured.map(featuredCard).join('')
        : '<p class="pk-empty-state">No featured recipes yet.</p>';
    }
  })
  .catch((err) => {
    const grid = document.getElementById('featured-grid');
    if (grid) {
      grid.innerHTML = '<p class="pk-empty-state">Could not load featured recipes. Make sure you are running this from a local server.</p>';
    }
    console.error(err);
  });
