/* ─── Countdowns: public countdown grid + detail view ─────────
   One JSON registry (data/countdowns.json) drives everything: hero,
   filterable grouped grid, retired shelf, detail dialog, and themed
   event-day celebrations. Vanilla JS, no dependencies, no network
   calls beyond the single registry fetch.
------------------------------------------------------------------- */

(function () {
'use strict';

var DATA_URL = 'data/countdowns.json';
var NINETY_DAYS_MS = 90 * 86400 * 1000;
var DAY_MS = 86400 * 1000;

/* Image visuals are built by visualHTML below; no emoji imagery. */

var state = {
  events: [],
  statuses: {},   // id -> resolved occurrence
  filter: 'All',
  detailId: null,
  lastFocused: null,
  gridTimer: null,
  rafId: null,
  burstDone: {},  // id+ymd -> true once the crossing burst has fired
};

/* ─── Timezone-safe date math (all comparisons in the event's tz) ─ */

function tzParts(ms, tz) {
  var list = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(ms));
  var o = {};
  list.forEach(function (p) { o[p.type] = p.value; });
  var h = Number(o.hour);
  if (h === 24) h = 0;
  return { y: Number(o.year), mo: Number(o.month), d: Number(o.day), h: h, mi: Number(o.minute), s: Number(o.second) };
}

function tzOffsetMs(tz, utcMs) {
  var p = tzParts(utcMs, tz);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - utcMs;
}

function parseWall(str) {
  var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(str);
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5], s: m[6] ? +m[6] : 0 };
}

function parseDay(str) {
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (!m) return null;
  return { y: +m[1], mo: +m[2], d: +m[3], h: 0, mi: 0, s: 0 };
}

function wallToUtc(w, tz) {
  var approx = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s);
  var once = approx - tzOffsetMs(tz, approx);
  return approx - tzOffsetMs(tz, once);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function ymdInTz(ms, tz) {
  var p = tzParts(ms, tz);
  return p.y + '-' + pad2(p.mo) + '-' + pad2(p.d);
}

function addDaysYmd(ymd, n) {
  var a = ymd.split('-');
  var t = new Date(Date.UTC(+a[0], +a[1] - 1, +a[2]) + n * DAY_MS);
  return t.getUTCFullYear() + '-' + pad2(t.getUTCMonth() + 1) + '-' + pad2(t.getUTCDate());
}

function dayStartUtc(ymd, tz) {
  var a = ymd.split('-');
  return wallToUtc({ y: +a[0], mo: +a[1], d: +a[2], h: 0, mi: 0, s: 0 }, tz);
}

function dayBounds(ms, tz) {
  var ymd = ymdInTz(ms, tz);
  return { start: dayStartUtc(ymd, tz), end: dayStartUtc(addDaysYmd(ymd, 1), tz), ymd: ymd };
}

function clampPct(v) {
  if (!(v >= 0)) return 0;
  if (v > 100) return 100;
  return v;
}

/* Resolve one event against now: upcoming | today | retired, plus the
   instants the progress rules need (last/next occurrence). */
function resolveEvent(ev, nowMs) {
  var tz = ev.timezone;
  var base = parseWall(ev.datetime);
  if (!base) return null;
  var baseMs = wallToUtc(base, tz);
  if (ev.recurrence === 'yearly-recurring') {
    var year = Number(ymdInTz(nowMs, tz).slice(0, 4));
    var cand = wallToUtc({ y: year, mo: base.mo, d: base.d, h: base.h, mi: base.mi, s: base.s }, tz);
    var prev = wallToUtc({ y: year - 1, mo: base.mo, d: base.d, h: base.h, mi: base.mi, s: base.s }, tz);
    var next = wallToUtc({ y: year + 1, mo: base.mo, d: base.d, h: base.h, mi: base.mi, s: base.s }, tz);
    var b = dayBounds(cand, tz);
    if (nowMs < b.start) return { status: 'upcoming', target: cand, last: prev, next: cand };
    if (nowMs >= b.end) return { status: 'upcoming', target: next, last: cand, next: next };
    return { status: 'today', target: cand, last: prev, next: next };
  }
  var bounds = dayBounds(baseMs, tz);
  if (nowMs >= bounds.end) return { status: 'retired', target: baseMs, since: nowMs - baseMs };
  if (nowMs >= bounds.start) return { status: 'today', target: baseMs, last: null, next: null };
  return { status: 'upcoming', target: baseMs, last: null, next: null };
}

function progressFor(ev, r, nowMs) {
  if (!r || r.status !== 'upcoming') return 100;
  if (ev.recurrence === 'yearly-recurring' && r.last != null && r.next != null && r.next > r.last) {
    return clampPct(((nowMs - r.last) / (r.next - r.last)) * 100);
  }
  if (ev.start_date) {
    var s = parseDay(ev.start_date);
    if (!s) return clampPct(((nowMs - (r.target - NINETY_DAYS_MS)) / NINETY_DAYS_MS) * 100);
    var startMs = wallToUtc(s, ev.timezone);
    if (r.target <= startMs) return nowMs >= r.target ? 100 : 0;
    return clampPct(((nowMs - startMs) / (r.target - startMs)) * 100);
  }
  return clampPct(((nowMs - (r.target - NINETY_DAYS_MS)) / NINETY_DAYS_MS) * 100);
}

/* ─── Formatting ─────────────────────────────────────────────── */

function esc(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>'"]/g, function (tag) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag];
  });
}

function fmtDate(ms, tz) {
  return new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ms));
}

function fmtDateTime(ms, tz) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(ms));
}

function splitCountdown(msLeft) {
  var total = Math.max(0, Math.floor(msLeft / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    ms: Math.max(0, Math.floor(msLeft % 1000)),
  };
}

function timerHTML(msLeft, withMs) {
  var p = splitCountdown(msLeft);
  var sec = withMs
    ? String(p.s).padStart(2, '0') + '.' + String(p.ms).padStart(3, '0')
    : String(p.s).padStart(2, '0');
  return '<span class="cd-seg"><span class="cd-seg__num">' + p.d + '</span><span class="cd-seg__label">Days</span></span>'
    + '<span class="cd-seg"><span class="cd-seg__num">' + String(p.h).padStart(2, '0') + '</span><span class="cd-seg__label">Hrs</span></span>'
    + '<span class="cd-seg"><span class="cd-seg__num">' + String(p.m).padStart(2, '0') + '</span><span class="cd-seg__label">Min</span></span>'
    + '<span class="cd-seg"><span class="cd-seg__num' + (withMs ? ' cd-seg__num--ms' : '') + '">' + sec + '</span><span class="cd-seg__label">Secs</span></span>';
}

function progressHTML(pct) {
  var whole = Math.floor(pct);
  return '<span class="cd-progress"><span class="cd-progress__bar"><span style="width:' + whole + '%"></span></span>'
    + '<span class="cd-progress__pct">' + whole + '%</span></span>';
}

function humanSince(ms) {
  var days = Math.floor(ms / DAY_MS);
  if (days < 1) {
    var h = Math.max(1, Math.floor(ms / 3600000));
    return h === 1 ? '1 hour since' : h + ' hours since';
  }
  if (days < 30) return days === 1 ? '1 day since' : days + ' days since';
  if (days < 365) {
    var mo = Math.floor(days / 30);
    return mo === 1 ? '1 month since' : mo + ' months since';
  }
  var y = Math.floor(days / 365);
  return y === 1 ? '1 year since' : y + ' years since';
}

function visualHTML(ev, cls, tag, eager) {
  tag = tag || 'span';
  var theme = themeClass(ev);
  var inner;
  if (ev.image) {
    inner = '<img src="' + esc(ev.image) + '" alt=""' + (eager ? '' : ' loading="lazy"') + '>';
  } else {
    var initial = ((ev.title || '?').trim().charAt(0) || '?').toUpperCase();
    inner = '<span class="cd-visual__initial">' + esc(initial) + '</span>';
  }
  return '<' + tag + ' class="' + cls + ' ' + theme + '" aria-hidden="true">' + inner + '</' + tag + '>';
}

function themeClass(ev) {
  var t = ev.celebration_theme || 'generic';
  return 'cd-theme-' + (/^(generic|wow|holiday|fallout)$/.test(t) ? t : 'generic');
}

/* ─── Rendering ──────────────────────────────────────────────── */

function cardHTML(ev, r, nowMs) {
  var retired = r.status === 'retired';
  var today = r.status === 'today';
  var timer = retired
    ? '<span class="cd-since">' + esc(humanSince(r.since)) + '</span>'
    : '<span class="cd-timer" data-timer="' + esc(ev.id) + '">' + timerHTML(r.target - nowMs, false) + '</span>';
  return '<button type="button" class="cd-card ' + themeClass(ev) + (retired ? ' is-retired' : '') + (today ? ' is-today' : '') + '" data-id="' + esc(ev.id) + '">'
    + visualHTML(ev, 'cd-card__visual', 'span', false)
    + '<span class="cd-card__body">'
    + '<span class="cd-today-badge">Today</span>'
    + '<span class="cd-card__title">' + esc(ev.title) + '</span>'
    + '<span class="cd-card__date">' + esc(fmtDate(r.target, ev.timezone)) + '</span>'
    + (ev.location ? '<span class="cd-card__loc">' + esc(ev.location) + '</span>' : '')
    + timer
    + progressHTML(progressFor(ev, r, nowMs))
    + '</span></button>';
}

function groupKey(ev, r, nowMs) {
  var tz = ev.timezone;
  var thisMonth = ymdInTz(nowMs, tz).slice(0, 7);
  var evMonth = ymdInTz(r.target, tz).slice(0, 7);
  if (evMonth === thisMonth) return 'month';
  var diffDays = (dayStartUtc(ymdInTz(r.target, tz), tz) - dayBounds(nowMs, tz).start) / DAY_MS;
  return diffDays <= 90 ? 'coming' : 'later';
}

var GROUP_TITLES = { month: 'This Month', coming: 'Coming Up', later: 'Later' };

function renderGroups(nowMs) {
  var host = document.getElementById('cd-groups');
  if (!host) return;
  var live = state.events
    .map(function (ev) { return { ev: ev, r: state.statuses[ev.id] }; })
    .filter(function (x) { return x.r && x.r.status !== 'retired'; })
    .filter(function (x) { return state.filter === 'All' || x.ev.category === state.filter; })
    .sort(function (a, b) { return a.r.target - b.r.target; });
  var html = '';
  ['month', 'coming', 'later'].forEach(function (g) {
    var cards = live.filter(function (x) { return groupKey(x.ev, x.r, nowMs) === g; });
    if (!cards.length) return;
    html += '<section class="cd-group" data-group="' + g + '"><h2>' + GROUP_TITLES[g] + '</h2><div class="cd-grid">'
      + cards.map(function (x) { return cardHTML(x.ev, x.r, nowMs); }).join('')
      + '</div></section>';
  });
  if (!html) html = '<p class="cd-empty">No countdowns in this category.</p>';
  host.innerHTML = html;
  host.querySelectorAll('.cd-card').forEach(function (btn) {
    btn.addEventListener('click', function () { openDetail(btn.dataset.id); });
  });
}

function renderRetired(nowMs) {
  var box = document.getElementById('cd-retired');
  var grid = document.getElementById('cd-retired-grid');
  var label = document.getElementById('cd-retired-label');
  if (!box || !grid) return;
  var items = state.events
    .map(function (ev) { return { ev: ev, r: state.statuses[ev.id] }; })
    .filter(function (x) { return x.r && x.r.status === 'retired'; })
    .filter(function (x) { return state.filter === 'All' || x.ev.category === state.filter; })
    .sort(function (a, b) { return b.r.target - a.r.target; });
  if (!items.length) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  if (label) label.textContent = 'Retired (' + items.length + ')';
  grid.innerHTML = items.map(function (x) { return cardHTML(x.ev, x.r, nowMs); }).join('');
  grid.querySelectorAll('.cd-card').forEach(function (btn) {
    btn.addEventListener('click', function () { openDetail(btn.dataset.id); });
  });
}

function pickHero() {
  var pool = state.events
    .map(function (ev) { return { ev: ev, r: state.statuses[ev.id] }; })
    .filter(function (x) { return x.r && x.r.status !== 'retired'; });
  if (!pool.length) return null;
  var pinned = pool
    .filter(function (x) { return x.ev.pinned && x.r.status === 'upcoming'; })
    .sort(function (a, b) { return a.r.target - b.r.target; });
  if (pinned.length) return pinned[0];
  return pool.slice().sort(function (a, b) { return a.r.target - b.r.target; })[0];
}

function renderHero(nowMs) {
  var hero = document.getElementById('cd-hero');
  if (!hero) return;
  var pick = pickHero();
  if (!pick) {
    hero.innerHTML = '<p class="cd-loading">No upcoming countdowns.</p>';
    return;
  }
  var ev = pick.ev, r = pick.r;
  var today = r.status === 'today';
  var timer = '<div class="cd-timer" data-timer="' + esc(ev.id) + '" data-ms="1">' + timerHTML(Math.max(0, r.target - nowMs), true) + '</div>';
  hero.innerHTML = ''
    + visualHTML(ev, 'cd-hero__bg', 'div', true)
    + '<div class="cd-hero__scrim" aria-hidden="true"></div>'
    + '<div class="cd-hero__body' + (today ? ' is-today' : '') + '" data-hero-body="' + esc(ev.id) + '">'
    + '<span class="cd-today-badge">Today</span>'
    + '<h2 class="cd-hero__title">' + esc(ev.title) + '</h2>'
    + '<p class="cd-hero__meta">' + esc(fmtDateTime(r.target, ev.timezone)) + (ev.location ? ' · ' + esc(ev.location) : '') + '</p>'
    + timer
    + progressHTML(progressFor(ev, r, nowMs))
    + '<div><button type="button" class="btn btn--outline" data-open="' + esc(ev.id) + '">Open details →</button></div>'
    + '</div>';
  var opener = hero.querySelector('[data-open]');
  if (opener) opener.addEventListener('click', function (e) { e.stopPropagation(); openDetail(opener.dataset.open); });
  var hbody = hero.querySelector('.cd-hero__body');
  if (hbody) {
    hbody.style.cursor = 'pointer';
    hbody.addEventListener('click', function () { openDetail(ev.id); });
  }
  if (today) celebrate(ev, 'render');
}

/* ─── Detail dialog ──────────────────────────────────────────── */

function findEvent(id) {
  for (var i = 0; i < state.events.length; i++) {
    if (state.events[i].id === id) return state.events[i];
  }
  return null;
}

function renderDetailBody(ev, r, nowMs) {
  var today = r.status === 'today';
  var timer = r.status === 'retired'
    ? '<p class="cd-detail-meta"><span class="cd-since">' + esc(humanSince(r.since)) + '</span></p>'
    : '<div class="cd-timer" data-timer="' + esc(ev.id) + '" data-ms="1">' + timerHTML(Math.max(0, r.target - nowMs), true) + '</div>';
  return visualHTML(ev, 'cd-dialog__visual', 'div', false)
    + '<div class="cd-dialog__body' + (today ? ' is-today' : '') + '" data-dialog-body="' + esc(ev.id) + '">'
    + '<span class="cd-today-badge">Today</span>'
    + '<span class="cd-cat">' + esc(ev.category) + (ev.recurrence === 'yearly-recurring' ? ' · Yearly' : '') + '</span>'
    + '<h2 id="cd-dialog-title">' + esc(ev.title) + '</h2>'
    + '<p class="cd-detail-meta">' + esc(fmtDateTime(r.target, ev.timezone)) + '</p>'
    + (ev.location ? '<p class="cd-detail-meta">' + esc(ev.location) + '</p>' : '')
    + timer
    + progressHTML(progressFor(ev, r, nowMs))
    + '<p class="cd-detail-text">' + esc(ev.details) + '</p>'
    + (ev.notes ? '<p class="cd-detail-text">' + esc(ev.notes) + '</p>' : '')
    + (ev.who_for ? '<p class="cd-detail-meta">For: ' + esc(ev.who_for) + '</p>' : '')
    + (ev.link_url ? '<p class="cd-detail-link"><a href="' + esc(ev.link_url) + '" target="_blank" rel="noopener">' + esc(ev.link_label || ev.link_url) + ' →</a></p>' : '')
    + '</div>';
}

function openDetail(id) {
  var ev = findEvent(id);
  if (!ev || !state.statuses[id]) return;
  var overlay = document.getElementById('cd-overlay');
  var body = document.getElementById('cd-dialog-body');
  if (!overlay || !body) return;
  state.detailId = id;
  state.lastFocused = document.activeElement;
  body.innerHTML = renderDetailBody(ev, state.statuses[id], Date.now());
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  var close = document.getElementById('cd-dialog-close');
  if (close) close.focus();
  if (state.statuses[id].status === 'today') celebrate(ev, 'open');
  ensureFrameLoop();
}

function closeDetail() {
  var overlay = document.getElementById('cd-overlay');
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  document.body.style.overflow = '';
  state.detailId = null;
  if (!document.querySelector('#cd-hero .is-today')) removeBurstCanvas();
  if (state.lastFocused && state.lastFocused.focus) state.lastFocused.focus();
  state.lastFocused = null;
}

/* ─── Celebration effects (local canvas, no assets) ──────────── */

var FX_THEMES = {
  generic: { colors: ['#00D4AA', '#F59E0B', '#E6EDF3', '#00F5C4'], glyphs: ['✦', '★', '●'] },
  wow: { colors: ['#F59E0B', '#FBBF24', '#00D4AA', '#E6EDF3'], glyphs: ['⚔️', '🛡️', '✨', '🐉', '🏆'] },
  holiday: { colors: ['#00D4AA', '#F59E0B', '#E6EDF3', '#00F5C4'], glyphs: ['❄️', '✦', '●', '★'] },
  fallout: { colors: ['#00D4AA', '#F59E0B', '#E6EDF3'], glyphs: ['☢️', '▲', '●'] },
};

function reducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

var burstAnim = null;

function removeBurstCanvas() {
  if (burstAnim) {
    cancelAnimationFrame(burstAnim);
    burstAnim = null;
  }
  var old = document.querySelector('canvas.cd-burst');
  if (old && old.parentNode) old.parentNode.removeChild(old);
}

function fireBurst(theme) {
  removeBurstCanvas();
  var fx = FX_THEMES[theme] || FX_THEMES.generic;
  var canvas = document.createElement('canvas');
  canvas.className = 'cd-burst';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  var ctx = null;
  try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
  if (!ctx) return;
  var parts = [];
  for (var i = 0; i < 140; i++) {
    parts.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.3,
      w: 5 + Math.random() * 7,
      vy: 1.5 + Math.random() * 3,
      vx: -1 + Math.random() * 2,
      rot: Math.random() * Math.PI * 2,
      vr: -0.1 + Math.random() * 0.2,
      color: fx.colors[i % fx.colors.length],
      glyph: fx.glyphs[i % fx.glyphs.length],
      shape: i % 3,
      size: 12 + Math.random() * 14,
    });
  }
  var start = performance.now();
  var DURATION = 4200;
  function frame(now) {
    var el = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts.forEach(function (p) {
      p.x += p.vx + Math.sin((now + p.y) / 300) * 0.6;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > canvas.height + 30) {
        p.y = -30;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 2) {
        ctx.font = p.size + 'px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.glyph, 0, 0);
      } else if (p.shape === 1) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.w * 0.3, p.w, p.w * 0.6);
      }
      ctx.restore();
    });
    if (el < DURATION && !document.hidden) {
      burstAnim = requestAnimationFrame(frame);
    } else {
      removeBurstCanvas();
    }
  }
  burstAnim = requestAnimationFrame(frame);
}

function celebrate(ev, where) {
  var theme = (/^(generic|wow|holiday|fallout)$/.test(ev.celebration_theme)) ? ev.celebration_theme : 'generic';
  if (reducedMotion()) return;
  var key = ev.id + '|' + ymdInTz(Date.now(), ev.timezone);
  if (where !== 'open') {
    if (state.burstDone[key]) return;
    state.burstDone[key] = true;
  }
  fireBurst(theme);
}

/* ─── Timers ─────────────────────────────────────────────────── */

function refreshStatuses(nowMs) {
  var changed = false;
  state.events.forEach(function (ev) {
    var prev = state.statuses[ev.id];
    var next = resolveEvent(ev, nowMs);
    if (!next) return;
    state.statuses[ev.id] = next;
    if (!prev || prev.status !== next.status || prev.target !== next.target) changed = true;
    if (prev && prev.status === 'upcoming' && next.status === 'today') {
      var heroPick = pickHero();
      var isHero = heroPick && heroPick.ev.id === ev.id;
      if (isHero || state.detailId === ev.id) celebrate(ev, 'crossing');
    }
  });
  return changed;
}

function tickGrid() {
  var nowMs = Date.now();
  if (refreshStatuses(nowMs)) {
    renderAll(nowMs);
    return;
  }
  document.querySelectorAll('[data-timer]').forEach(function (el) {
    if (el.dataset.ms) return;
    var r = state.statuses[el.dataset.timer];
    if (!r || r.status === 'retired') return;
    el.innerHTML = timerHTML(Math.max(0, r.target - nowMs), false);
  });
  document.querySelectorAll('.cd-card.is-retired').forEach(function (card) {
    var rr = state.statuses[card.dataset.id];
    if (!rr) return;
    rr.since = nowMs - rr.target;
    var sinceEl = card.querySelector('.cd-since');
    if (sinceEl) sinceEl.textContent = humanSince(rr.since);
  });
  if (state.detailId) {
    var dr = state.statuses[state.detailId];
    if (dr && dr.status === 'retired') {
      dr.since = nowMs - dr.target;
      var dlgSince = document.querySelector('#cd-dialog-body .cd-since');
      if (dlgSince) dlgSince.textContent = humanSince(dr.since);
    }
  }
  updateProgress(nowMs);
}

function updateProgress(nowMs) {
  state.events.forEach(function (ev) {
    var r = state.statuses[ev.id];
    if (!r) return;
    var pct = Math.floor(progressFor(ev, r, nowMs));
    document.querySelectorAll('[data-timer="' + ev.id + '"]').forEach(function (el) {
      var root = el.closest('.cd-card__body, .cd-hero__body, .cd-dialog__body');
      if (!root) return;
      var bar = root.querySelector('.cd-progress__bar > span');
      var label = root.querySelector('.cd-progress__pct');
      if (bar) bar.style.width = pct + '%';
      if (label) label.textContent = pct + '%';
    });
  });
}

function heroLoop() {
  if (state.rafId) cancelAnimationFrame(state.rafId);
  var step = function () {
    var nowMs = Date.now();
    document.querySelectorAll('[data-timer][data-ms]').forEach(function (el) {
      var r = state.statuses[el.dataset.timer];
      if (!r || r.status === 'retired') return;
      el.innerHTML = timerHTML(Math.max(0, r.target - nowMs), true);
    });
    state.rafId = requestAnimationFrame(step);
  };
  state.rafId = requestAnimationFrame(step);
}

function ensureFrameLoop() {
  if (!state.rafId) heroLoop();
}

function stopFrameLoop() {
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }
}

function startTimers() {
  stopTimers();
  state.gridTimer = setInterval(tickGrid, 1000);
  heroLoop();
}

function stopTimers() {
  if (state.gridTimer) {
    clearInterval(state.gridTimer);
    state.gridTimer = null;
  }
  stopFrameLoop();
}

function renderAll(nowMs) {
  renderHero(nowMs);
  renderGroups(nowMs);
  renderRetired(nowMs);
  if (state.detailId && !document.getElementById('cd-overlay').hidden) {
    var ev = findEvent(state.detailId);
    if (ev && state.statuses[state.detailId]) {
      var body = document.getElementById('cd-dialog-body');
      var focused = document.activeElement;
      var refocus = focused && (focused.id === 'cd-dialog-close');
      body.innerHTML = renderDetailBody(ev, state.statuses[state.detailId], nowMs);
      if (refocus) document.getElementById('cd-dialog-close').focus();
      if (state.statuses[state.detailId].status === 'today') celebrate(ev, 'render');
    }
  }
}

/* ─── Init ───────────────────────────────────────────────────── */

function validEvent(ev) {
  return ev && typeof ev.id === 'string' && /^[a-z0-9-]+$/i.test(ev.id) && typeof ev.title === 'string'
    && typeof ev.datetime === 'string' && typeof ev.timezone === 'string'
    && typeof ev.category === 'string' && typeof ev.recurrence === 'string';
}

function init() {
  var chips = document.getElementById('cd-chips');
  var overlay = document.getElementById('cd-overlay');
  var closeBtn = document.getElementById('cd-dialog-close');

  if (chips) {
    chips.hidden = false;
    chips.querySelectorAll('.cd-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.filter = chip.dataset.category;
        chips.querySelectorAll('.cd-chip').forEach(function (c) {
          c.classList.toggle('active', c === chip);
        });
        renderAll(Date.now());
      });
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDetail);
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeDetail();
    });
  }
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && state.detailId) {
      e.preventDefault();
      closeDetail();
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopTimers();
      removeBurstCanvas();
    } else {
      renderAll(Date.now());
      startTimers();
    }
  });

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('countdowns registry: ' + res.status);
      return res.json();
    })
    .then(function (data) {
      state.events = (Array.isArray(data) ? data : []).filter(validEvent);
      var nowMs = Date.now();
      state.events.forEach(function (ev) {
        var r = resolveEvent(ev, nowMs);
        if (r) state.statuses[ev.id] = r;
      });
      renderAll(nowMs);
      startTimers();
    })
    .catch(function (err) {
      var hero = document.getElementById('cd-hero');
      if (hero) hero.innerHTML = '<p class="cd-empty">Could not load countdowns. Make sure you are running this from a local server.</p>';
      console.error(err);
    });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
