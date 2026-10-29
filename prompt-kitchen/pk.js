/* ─── Prompt Kitchen shared helpers ────────────────────────────
   Favorites + votes use the exact localStorage contracts of the old
   Prompt Kitchen site so returning visitors keep their saved data:
   - favorites: key 'pk-favorites', value {<slug>: {title, category, url}}
   - votes:     key `pk-votes-<slug>`, value JSON array of
                'fire' | 'chef' | 'star'
------------------------------------------------------------------- */

'use strict';

/* ─── Front-matter ─────────────────────────────────────────────── */

function stripFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return raw;
  return match[2];
}

/* ─── HTML escaping (mirrors the old site's escapeHTML util) ──── */

function escapeHTML(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>'"]/g, (tag) => {
    const chars = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return chars[tag] || tag;
  });
}

/* ─── Difficulty labels (copied from the old recipe page) ──────── */

const DIFFICULTY_LABELS = {
  'beginner': '🌱 Beginner',
  'home-cook': '🍳 Home Cook',
  'sous-chef': '🔪 Sous Chef',
};

function difficultyLabel(difficulty) {
  return DIFFICULTY_LABELS[difficulty] || difficulty || '';
}

/* ─── Favorites ────────────────────────────────────────────────── */

const FAVORITES_KEY = 'pk-favorites';

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '{}') || {};
  } catch {
    return {};
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function isFavorite(slug) {
  return Boolean(getFavorites()[slug]);
}

/* Toggle a favorite. Returns true when the recipe is now saved. */
function toggleFavorite(slug, meta) {
  const favs = getFavorites();
  const saved = !favs[slug];
  if (saved) {
    favs[slug] = {
      title: meta.title,
      category: meta.category,
      url: meta.url,
    };
  } else {
    delete favs[slug];
  }
  saveFavorites(favs);
  return saved;
}

/* ─── Votes ────────────────────────────────────────────────────── */

function votesKey(recipeId) {
  return `pk-votes-${recipeId}`;
}

function getMyVotes(recipeId) {
  try {
    const raw = JSON.parse(localStorage.getItem(votesKey(recipeId)) ?? '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function saveMyVotes(recipeId, votes) {
  const arr = Array.isArray(votes) ? votes : [...votes];
  localStorage.setItem(votesKey(recipeId), JSON.stringify(arr));
}

/* Toggle one emoji vote. Returns true when the emoji is now voted. */
function toggleVote(recipeId, emoji) {
  const votes = getMyVotes(recipeId);
  const voted = !votes.has(emoji);
  if (voted) {
    votes.add(emoji);
  } else {
    votes.delete(emoji);
  }
  saveMyVotes(recipeId, votes);
  return voted;
}
