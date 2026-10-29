/* ─── My Kitchen: saved recipes ────────────────────────────────
   Reads pk-favorites and renders a card per saved recipe. Card links
   are derived from the record KEY (the slug) — stored `url` values
   from the old site point at retired .fyi paths and are not trusted.
------------------------------------------------------------------- */

function recipeUrlFor(key) {
  return `recipe.html?slug=${encodeURIComponent(key)}`;
}

function renderFavorites() {
  const favs = getFavorites();
  const keys = Object.keys(favs);
  const grid = document.getElementById('favorites-grid');
  const empty = document.getElementById('empty-state');
  const countEl = document.getElementById('favorites-count');
  if (!grid || !empty) return;

  if (countEl) {
    countEl.textContent = keys.length === 1 ? '1 saved recipe' : `${keys.length} saved recipes`;
  }

  if (keys.length === 0) {
    grid.hidden = true;
    grid.innerHTML = '';
    empty.hidden = false;
    return;
  }

  grid.hidden = false;
  empty.hidden = true;
  grid.innerHTML = '';

  keys.forEach((id) => {
    const fav = favs[id] || {};
    const url = recipeUrlFor(id);

    const card = document.createElement('div');
    card.className = 'pk-recipe-card';
    card.style.position = 'relative';

    const meta = document.createElement('div');
    meta.className = 'pk-recipe-card__meta';
    const category = document.createElement('span');
    category.className = 'pk-recipe-card__category';
    category.textContent = fav.category || '';
    meta.appendChild(category);

    const titleH3 = document.createElement('h3');
    const titleA = document.createElement('a');
    titleA.href = url;
    titleA.style.color = 'inherit';
    titleA.style.textDecoration = 'none';
    titleA.textContent = fav.title || id;
    titleH3.appendChild(titleA);

    const footer = document.createElement('div');
    footer.className = 'pk-recipe-card__footer';
    const readA = document.createElement('a');
    readA.href = url;
    readA.className = 'pk-recipe-card__read';
    readA.textContent = 'Read recipe →';
    const removeBtn = document.createElement('button');
    removeBtn.className = 'pk-heart-btn';
    removeBtn.type = 'button';
    removeBtn.setAttribute('data-id', id);
    removeBtn.setAttribute('aria-label', 'Remove from saved');
    removeBtn.textContent = '❤️';
    footer.appendChild(readA);
    footer.appendChild(removeBtn);

    card.appendChild(meta);
    card.appendChild(titleH3);
    card.appendChild(footer);

    removeBtn.addEventListener('click', () => {
      const current = getFavorites();
      delete current[id];
      saveFavorites(current);
      renderFavorites();
    });

    grid.appendChild(card);
  });
}

renderFavorites();
