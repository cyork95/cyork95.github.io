/* ============================================================
   Butler Routes - Completionist companion app
   yorkdevelops.com/butler-routes/

   Static, vanilla, no dependencies. One generated data file
   (data/pack-data.json, see tools/README.md) drives every view:
   overview, zone directory, zone detail (the pack's own path),
   global search, and per-quest path timelines.

   EDITABLE STATUS LINE (single string, one place):
   ============================================================ */
'use strict';

var STATUS_LINE =
  "In development — v1.0.0 publishes when every zone is built and has passed the pack's QA gate.";

var PACK_REPO = 'https://github.com/cyork95/butler-routes-completionist';
var ISSUES_NEW = PACK_REPO + '/issues/new';
var POLESTAR_URL = 'https://polestar.guide';
var DATA_URL = 'data/pack-data.json';

(function () {
  /* ---------- small helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function xyHTML(xy) {
    if (!xy) return '';
    return '<span class="br-xy">(' + xy[0] + ', ' + xy[1] + ')</span>';
  }

  function gatesHTML(gates) {
    if (!gates) return '';
    return '<span class="tech-tag">' + esc(gates) + '</span>';
  }

  function reportURL(guideName, zoneName, stepTitle) {
    var title = '[butler-routes] ' + guideName + ' — ' + zoneName;
    var body = 'Zone: ' + zoneName + '\n' +
      'Guide: ' + guideName + '\n' +
      'Step title: ' + (stepTitle || '(which step?)') + '\n\n' +
      'What happened:\n\n' +
      'What I expected instead:\n';
    return ISSUES_NEW + '?title=' + encodeURIComponent(title) +
      '&body=' + encodeURIComponent(body);
  }

  /* ---------- state ---------- */

  var PACK = null;
  var zoneById = {};
  var questNameById = {};
  var questIndex = []; // {zone, id, name}

  function questName(id) {
    return questNameById[id] || ('Quest #' + id);
  }

  function zoneName(id) {
    return (zoneById[id] && zoneById[id].name) || id;
  }

  function bandOf(zoneId) {
    var z = zoneById[zoneId];
    return (z && z.band) || '';
  }

  /* ---------- goal parsing (mirrors the generator's reading) ---------- */

  function splitQuestGoal(args) {
    var m = /^\s*(\d+)\b\s*(.*)$/.exec(args || '');
    if (!m) return { qid: null, gates: null, rest: args || '' };
    var tail = (m[2] || '').trim();
    var gates = null;
    var g = /^only\s+([A-Za-z,]+)\s*(.*)$/.exec(tail);
    if (g) {
      gates = g[1];
      tail = (g[2] || '').trim();
    }
    if (tail.indexOf('--') === 0) tail = tail.slice(2).trim();
    return { qid: parseInt(m[1], 10), gates: gates, rest: tail };
  }

  function vendorGoal(args) {
    var m = /^\s*(\d+)\s*--\s*(.*?)\(\s*(\d{1,3}\.\d+)\s*,\s*(\d{1,3}\.\d+)\s*\)\s*(.*)$/.exec(args || '');
    if (!m) return null;
    return { npc: m[1], name: m[2].trim().replace(/,$/, ''), x: m[3], y: m[4], extra: m[5].trim() };
  }

  function buyGoal(args) {
    var m = /^\s*(\d+)\s+"([^"]+)"/.exec(args || '');
    return m ? { item: m[1], name: m[2] } : null;
  }

  function collectGoal(args) {
    var m = /^\s*(\d+)\s*(.*)$/.exec((args || '').trim());
    if (!m) return null;
    var nm = /"([^"]+)"/.exec(m[2] || '');
    return { item: m[1], name: nm ? nm[1] : null, rest: (m[2] || '').trim() };
  }

  /* ---------- human-form goal rendering ---------- */

  function goalHTML(g, zoneId, questAnchor) {
    var cmd = g.cmd;
    var args = g.args || '';
    if (cmd === 'goto') {
      var c = /@?(\d{1,3}\.\d+)\s*,\s*(\d{1,3}\.\d+)/.exec(args);
      if (c) return '<span class="br-go br-goto">Go to <span class="br-xy">(' + c[1] + ', ' + c[2] + ')</span></span>';
      return '';
    }
    if (cmd === 'loop') {
      return '<span class="br-go br-loop">Patrol loop — checks each point below in turn</span>';
    }
    if (cmd === 'accept' || cmd === 'complete' || cmd === 'turnin') {
      var q = splitQuestGoal(args);
      var verb = cmd === 'accept' ? 'Accept' : (cmd === 'turnin' ? 'Turn in' : 'Complete');
      var qid = q.qid;
      var link = '';
      if (qid != null && questAnchor) {
        link = ' <a class="br-qlink" href="#/quest/' + zoneId + '/' + qid + '">quest path &rarr;</a>';
      }
      return '<span class="br-go br-' + cmd + '"><strong>' + verb + '</strong> ' +
        '<span class="br-qname">' + esc(qid != null ? questName(qid) : q.rest) + '</span>' +
        (qid != null ? ' <span class="br-qid">#' + qid + '</span>' : '') +
        (q.gates ? ' ' + gatesHTML(q.gates) : '') +
        (q.rest ? ' <span class="br-rest">' + esc(q.rest) + '</span>' : '') +
        link + '</span>';
    }
    if (cmd === 'kill') {
      var k = /^\s*(\d+)\s*(.*)$/.exec(args.trim());
      return '<span class="br-go br-kill">Kill NPC ' + (k ? esc(k[1]) : esc(args)) +
        (k && k[2] ? ' <span class="br-rest">' + esc(k[2]) + '</span>' : '') + '</span>';
    }
    if (cmd === 'collect') {
      var col = collectGoal(args);
      if (!col) return '';
      return '<span class="br-go br-collect">Collect ' +
        (col.name ? '<span class="br-qname">' + esc(col.name) + '</span> ' : '') +
        '<span class="br-qid">item ' + esc(col.item) + '</span></span>';
    }
    if (cmd === 'buy') {
      var b = buyGoal(args);
      if (!b) return '';
      return '<span class="br-go br-buy">Buy <span class="br-qname">' + esc(b.name) + '</span> ' +
        '<span class="br-qid">item ' + esc(b.item) + '</span></span>';
    }
    if (cmd === 'vendor') {
      var v = vendorGoal(args);
      if (!v) return '<span class="br-go">Vendor: ' + esc(args) + '</span>';
      return '<span class="br-go br-vendor">Vendor <span class="br-qname">' + esc(v.name) + '</span> ' +
        '<span class="br-qid">npc ' + esc(v.npc) + '</span> ' +
        '<span class="br-xy">(' + v.x + ', ' + v.y + ')</span>' +
        (v.extra ? ' <span class="br-rest">' + esc(v.extra) + '</span>' : '') + '</span>';
    }
    if (cmd === 'when') {
      return '<span class="br-go br-when">Requires: ' + esc(args) + '</span>';
    }
    if (cmd === 'note' || cmd === 'tip') {
      return '<span class="br-go br-note">' + esc(args) + '</span>';
    }
    return '';
  }

  function stepHTML(step, idx, zoneId, guideLabel) {
    var goals = [];
    (step.goals || []).forEach(function (g) {
      var h = goalHTML(g, zoneId, true);
      if (h) goals.push('<li>' + h + '</li>');
    });
    return '<article class="br-step" id="br-step-' + idx + '">' +
      '<div class="br-step-head"><span class="br-step-num">' + (idx + 1) + '</span>' +
      '<h4 class="br-step-title">' + esc(step.title) + '</h4></div>' +
      (goals.length ? '<ul class="br-goals">' + goals.join('') + '</ul>' : '') +
      '</article>';
  }

  /* ---------- views ---------- */

  function stampHTML() {
    var g = PACK.generatedFrom;
    return '<p class="br-stamp">Pack data: v' + esc(PACK.totals.packVersion) +
      ' · <span class="br-mono">' + esc(g.commit) + '</span> · ' + esc(g.packDate) + '</p>';
  }

  function heroHTML() {
    var t = PACK.totals;
    return '<section class="card br-hero">' +
      '<div class="card__tag card__tag--accent">Companion app</div>' +
      '<h2 class="card__title">Butler Routes - Completionist</h2>' +
      '<p class="card__desc">Completionist (all-quests) guide pack for Polestar in WoW Forever — ' +
      'every quest in every zone, both factions, with rares, recipes, and profession tracking you choose.</p>' +
      '<p class="br-byline">By Butler Muse, for Cody · License CC-BY-4.0</p>' +
      '<div class="card__links">' +
      '<a href="' + POLESTAR_URL + '" target="_blank" rel="noopener" class="btn btn--primary btn--sm">Get it on polestar.guide &#x2197;</a>' +
      '<a href="' + PACK_REPO + '" target="_blank" rel="noopener" class="btn btn--outline btn--sm">GitHub repo &#x2197;</a>' +
      '</div>' +
      '<div class="br-totals">' +
      '<div class="br-total"><span class="br-total-num">' + t.contracts + '</span><span class="br-total-label">zone contracts</span></div>' +
      '<div class="br-total"><span class="br-total-num">' + t.contractedQuests.toLocaleString('en-US') + '</span><span class="br-total-label">contracted quests</span></div>' +
      '<div class="br-total"><span class="br-total-num">' + t.guides + '</span><span class="br-total-label">guides</span></div>' +
      '</div>' +
      stampHTML() +
      '<p class="br-status">' + esc(STATUS_LINE) + '</p>' +
      '</section>';
  }

  function meaningTilesHTML() {
    var tiles = [
      ['Every quest in the zone', 'Completionist means all of them — including the ones a leveling route would skip as inefficient.'],
      ['Efficiency shapes order, never content', 'The route orders the zone well; the contract decides what is in it.'],
      ['Chains followed to their real ends', 'Quest chains are traced across zones until they genuinely finish.'],
      ['Honest about the data', 'Where the game data has no turn-in, no spawn, or no source, the guide says so instead of inventing one.'],
      ['Per-zone contracts', 'Each zone carries its own quest contract. Accept-only quests say so on the tin.']
    ];
    return '<section data-reveal><div class="section-header">' +
      '<p class="section-label">The promise</p>' +
      '<h2 class="section-title">What completionist means</h2></div>' +
      '<div class="grid-3">' +
      tiles.map(function (t) {
        return '<div class="card"><h3 class="card__title">' + esc(t[0]) + '</h3>' +
          '<p class="card__desc">' + esc(t[1]) + '</p></div>';
      }).join('') + '</div></section>';
  }

  function partsTilesHTML() {
    var tiles = [
      ['Core guides', 'The all-quests route through each zone, in the order Polestar walks it. One fact in one place; the path never re-sorts.'],
      ['Rares & Treasures companions', 'An opportunistic sweep for confirmed in-band rares and fixed world containers. Every goal optional — a rare that is not up never holds the route.'],
      ['Recipes companions', 'Only recipes whose source is physically in the zone: vendor buys with the pinned vendor, or genuine in-zone drops.'],
      ['City guides', 'Stormwind, Ironforge, and Darnassus: smaller guides for city quests, plus each city\u2019s recipes.'],
      ['Moonglade Druid class guide', 'The Druid class guide for Moonglade, gated per class like every other class quest.'],
      ['How gating works', 'Class quests are gated per class; profession content is opt-in by skill; companion goals are always optional.']
    ];
    return '<section data-reveal><div class="section-header">' +
      '<p class="section-label">Inside the pack</p>' +
      '<h2 class="section-title">The parts of the pack</h2></div>' +
      '<div class="grid-3">' +
      tiles.map(function (t) {
        return '<div class="card"><h3 class="card__title">' + esc(t[0]) + '</h3>' +
          '<p class="card__desc">' + esc(t[1]) + '</p></div>';
      }).join('') + '</div></section>';
  }

  function reportCardHTML(contextGuide, contextZone) {
    var url = reportURL(contextGuide || 'Butler Routes - Completionist', contextZone || 'general');
    return '<section class="card br-report"><h3 class="card__title">Report a problem</h3>' +
      '<p class="card__desc">Found a wrong step, a missing quest, or a bad coordinate? ' +
      'Reports open on the pack repo with the guide and zone prefilled — just add the step title and what happened.</p>' +
      '<div class="card__links"><a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="' + url + '">Report a problem &#x2197;</a></div></section>';
  }

  function renderOverview() {
    return heroHTML() + meaningTilesHTML() + partsTilesHTML() +
      '<section data-reveal><div class="section-header">' +
      '<p class="section-label">Browse</p><h2 class="section-title">Start with a zone</h2>' +
      '<p class="section-desc">The full directory holds every contracted zone with faction, level band, and build status.</p></div>' +
      '<p><a class="btn btn--primary" href="#/zones">Open the zone directory &rarr;</a></p></section>' +
      reportCardHTML('Butler Routes - Completionist', 'general');
  }

  function guideTicks(z) {
    function tick(on, label) {
      return '<span class="br-tick' + (on ? ' on' : '') + '">' + (on ? '●' : '○') + ' ' + label + '</span>';
    }
    return '<span class="br-ticks">' + tick(z.guides.core, 'Core') + tick(z.guides.rares, 'Rares') +
      tick(z.guides.recipes, 'Recipes') + '</span>';
  }

  function zoneCardHTML(z) {
    return '<a class="card br-zonecard" href="#/zone/' + esc(z.id) + '">' +
      '<div class="card__tag card__tag--accent">' + esc(z.faction || '—') + '</div>' +
      '<h3 class="card__title">' + esc(z.name) + '</h3>' +
      '<p class="card__desc">Level band ' + esc(z.band || '—') + ' · ' + z.questCount + ' contracted quests</p>' +
      '<div class="card__tech"><span class="tech-tag">' + esc(z.status.label) + '</span>' +
      '<span class="tech-tag">' + z.status.done + '/' + z.status.total + ' checks</span></div>' +
      '<div class="br-tickrow">' + guideTicks(z) + '</div>' +
      '</a>';
  }

  var zoneFilter = { q: '', faction: 'All' };

  function renderZones() {
    var factions = ['All'];
    PACK.zones.forEach(function (z) {
      if (z.faction && factions.indexOf(z.faction) === -1) factions.push(z.faction);
    });
    var q = zoneFilter.q.trim().toLowerCase();
    var cards = PACK.zones.filter(function (z) {
      if (zoneFilter.faction !== 'All' && z.faction !== zoneFilter.faction) return false;
      if (q && (z.name + ' ' + z.id + ' ' + (z.band || '')).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).map(zoneCardHTML).join('');
    return '<section><div class="section-header">' +
      '<p class="section-label">Directory</p><h2 class="section-title">Zone directory</h2>' +
      '<p class="section-desc">' + PACK.zones.length + ' contracted zones. Pick one to walk its path.</p></div>' +
      '<div class="br-filters"><input id="br-zone-q" type="search" placeholder="Filter zones…" aria-label="Filter zones" value="' + esc(zoneFilter.q) + '">' +
      '<select id="br-zone-faction" aria-label="Filter by faction">' +
      factions.map(function (f) {
        return '<option value="' + esc(f) + '"' + (f === zoneFilter.faction ? ' selected' : '') + '>Faction: ' + esc(f) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="grid-3" id="br-zone-grid">' + (cards || '<p>No zones match.</p>') + '</div></section>';
  }

  function rareCardHTML(r) {
    var pts = (r.points || []).map(function (p) {
      return '<span class="br-xy">(' + p[0] + ', ' + p[1] + ')</span>';
    }).join(' ');
    var drops = (r.signatureDrops || []).map(function (d) {
      return '<span class="br-drop">' + esc(d.name || ('item ' + d.itemId)) + '</span>';
    }).join(', ');
    return '<div class="card br-small"><h4 class="card__title">' + esc(r.name || ('NPC ' + r.npcId)) + '</h4>' +
      '<p class="card__desc">' +
      (r.level ? 'Level ' + r.level + ' rare · ' : '') +
      (r.loop ? 'patrol loop · ' : '') +
      (pts || 'no placed point') + '</p>' +
      (drops ? '<p class="card__desc">Signature drop: ' + drops + '</p>' : '') +
      '<p class="card__desc br-muted">Companion step: ' + esc(r.step) + '</p></div>';
  }

  function recipeCardHTML(r) {
    var src = r.source || {};
    var where;
    if (src.type === 'vendor') {
      where = 'Vendor buy — ' + (src.name ? esc(src.name) + ' ' : '') +
        (src.npcId ? '<span class="br-qid">npc ' + src.npcId + '</span> ' : '') +
        (src.xy ? '<span class="br-xy">(' + src.xy[0] + ', ' + src.xy[1] + ')</span>' : '');
    } else {
      where = 'Drop collect — <span class="br-qid">item ' + r.itemId + '</span>';
    }
    return '<div class="card br-small"><h4 class="card__title">' + esc(r.name || ('item ' + r.itemId)) + '</h4>' +
      '<p class="card__desc">' + esc(r.profession || '') + ' · ' + where + '</p>' +
      '<p class="card__desc br-muted">Companion step: ' + esc(src.step || '') + '</p></div>';
  }

  function stepIndexByTitle(steps, title) {
    for (var i = 0; i < steps.length; i++) {
      if (steps[i].title === title) return i;
    }
    return -1;
  }

  function renderZoneDetail(zoneId, anchorStep) {
    var z = zoneById[zoneId];
    if (!z) return '<section><h2>Unknown zone</h2><p>No contract with id “' + esc(zoneId) + '”.</p></section>';
    var guideName = z.name + ' - Completionist';
    var coreSteps = (z.steps || []).map(function (s, i) { return stepHTML(s, i, zoneId); }).join('');
    var rares = PACK.rares.filter(function (r) { return r.zone === zoneId; });
    var recipes = PACK.recipes.filter(function (r) { return r.zone === zoneId; });
    var raresComp = ((z.companionSteps || {}).rares || []).map(function (s, i) { return stepHTML(s, i, zoneId); }).join('');
    var recipesComp = ((z.companionSteps || {}).recipes || []).map(function (s, i) { return stepHTML(s, i, zoneId); }).join('');

    var html = '<p class="br-crumb"><a href="#/zones">&larr; Zone directory</a></p>' +
      '<section class="card br-hero br-zonehead">' +
      '<div class="card__tag card__tag--accent">' + esc(z.faction || '') + ' · ' + esc(z.band || '') + '</div>' +
      '<h2 class="card__title">' + esc(z.name) + '</h2>' +
      '<p class="card__desc">' + z.questCount + ' contracted quests · ' + esc(z.status.label) + ' (' + z.status.done + '/' + z.status.total + ' checks)</p>' +
      '<div class="br-tickrow">' + guideTicks(z) + '</div>' +
      '<div class="card__links"><a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="' +
      reportURL(guideName, z.name) + '">Report a problem with this guide &#x2197;</a></div>' +
      '</section>';

    html += '<section><div class="section-header"><p class="section-label">The path</p>' +
      '<h2 class="section-title">Core route — in walk order</h2>' +
      '<p class="section-desc">The pack\u2019s own order, exactly as Polestar walks it. Never re-sorted.</p></div>' +
      '<div class="br-path">' + coreSteps + '</div></section>';

    if (rares.length || raresComp) {
      html += '<section><div class="section-header"><p class="section-label">Companion</p>' +
        '<h2 class="section-title">Rares &amp; Treasures (' + rares.length + ')</h2></div>' +
        '<div class="grid-3">' + rares.map(rareCardHTML).join('') + '</div>' +
        (raresComp ? '<details class="br-details"><summary>Full companion steps (' +
          ((z.companionSteps.rares || []).length) + ')</summary><div class="br-path">' + raresComp + '</div></details>' : '') +
        '</section>';
    }
    if (recipes.length || recipesComp) {
      html += '<section><div class="section-header"><p class="section-label">Companion</p>' +
        '<h2 class="section-title">Recipes &amp; Patterns (' + recipes.length + ')</h2></div>' +
        '<div class="grid-3">' + recipes.map(recipeCardHTML).join('') + '</div>' +
        (recipesComp ? '<details class="br-details"><summary>Full companion steps (' +
          ((z.companionSteps.recipes || []).length) + ')</summary><div class="br-path">' + recipesComp + '</div></details>' : '') +
        '</section>';
    }
    html += reportCardHTML(guideName, z.name);
    return { html: html, anchorStep: anchorStep };
  }

  function findQuest(zoneId, qid) {
    for (var i = 0; i < PACK.quests.length; i++) {
      var q = PACK.quests[i];
      if (q.zone === zoneId && q.id === qid) return q;
    }
    return null;
  }

  function journeyStepLink(zoneId, steps, title) {
    var idx = stepIndexByTitle(steps, title);
    if (idx < 0) return esc(title);
    return '<a href="#/zone/' + esc(zoneId) + '/step/' + idx + '">' + esc(title) + '</a>';
  }

  function renderQuest(zoneId, qid) {
    var q = findQuest(zoneId, qid);
    if (!q) return '<section><h2>Unknown quest</h2><p>No contracted quest #' + esc(String(qid)) + ' in ' + esc(zoneName(zoneId)) + '.</p></section>';
    var z = zoneById[zoneId];
    var steps = (z && z.steps) || [];
    var lvl = q.level != null ? 'Level ' + q.level + (q.minLevel != null ? ' (min ' + q.minLevel + ')' : '') : 'Level unknown';
    var html = '<p class="br-crumb"><a href="#/zone/' + esc(zoneId) + '">&larr; ' + esc(zoneName(zoneId)) + '</a></p>' +
      '<section class="card br-hero"><div class="card__tag card__tag--accent">Quest path</div>' +
      '<h2 class="card__title">' + esc(q.name || ('Quest #' + q.id)) + '</h2>' +
      '<p class="card__desc">' + esc(zoneName(zoneId)) + ' · ' + esc(bandOf(zoneId)) + ' · ' + esc(lvl) +
      (q.gates && q.gates.length ? ' · gated: ' + esc(q.gates.join(', ')) : '') + '</p>' +
      '<div class="card__links"><a class="btn btn--outline btn--sm" target="_blank" rel="noopener" href="' +
      reportURL(zoneName(zoneId) + ' - Completionist', zoneName(zoneId), q.accept ? q.accept.step : '') +
      '">Report a problem with this guide &#x2197;</a></div></section>';

    html += '<section><ol class="br-timeline">';
    if (q.accept) {
      html += '<li class="br-tl"><span class="br-tl-kind">Accept</span>' +
        journeyStepLink(zoneId, steps, q.accept.step) + ' ' + xyHTML(q.accept.xy) +
        (q.accept.rest ? '<br><span class="br-rest">' + esc(q.accept.rest) + '</span>' : '') + '</li>';
    }
    (q.objectives || []).forEach(function (o) {
      html += '<li class="br-tl"><span class="br-tl-kind">' + esc(o.kind) + '</span>' +
        journeyStepLink(zoneId, steps, o.step) + ' ' + xyHTML(o.xy) +
        (o.rest ? '<br><span class="br-rest">' + esc(o.rest) + '</span>' : '') + '</li>';
    });
    if (q.turnin) {
      html += '<li class="br-tl"><span class="br-tl-kind">Turn in</span>' +
        journeyStepLink(zoneId, steps, q.turnin.step) + ' ' + xyHTML(q.turnin.xy) +
        (q.turnin.rest ? '<br><span class="br-rest">' + esc(q.turnin.rest) + '</span>' : '') + '</li>';
    } else if (q.acceptOnly) {
      html += '<li class="br-tl br-acceptonly"><span class="br-tl-kind">No turn-in</span>' +
        'Accept-only quest — the data carries no turn-in for this one, and the guide says so honestly.</li>';
    } else if (!q.accept) {
      html += '<li class="br-tl br-acceptonly"><span class="br-tl-kind">Unrouted</span>' +
        'This contracted quest does not appear in the core guide\u2019s steps yet.</li>';
    }
    html += '</ol></section>';
    return html;
  }

  /* ---------- search ---------- */

  function searchAll(query) {
    var q = query.trim().toLowerCase();
    var out = { quests: [], rares: [], recipes: [], zones: [] };
    if (!q) return out;
    var isNum = /^\d+$/.test(q);
    PACK.zones.forEach(function (z) {
      if ((z.name + ' ' + z.id).toLowerCase().indexOf(q) !== -1) out.zones.push(z);
    });
    PACK.quests.forEach(function (quest) {
      var name = quest.name || ('Quest #' + quest.id);
      if (name.toLowerCase().indexOf(q) !== -1 || (isNum && quest.id === parseInt(q, 10))) {
        if (out.quests.length < 40) out.quests.push(quest);
      }
    });
    PACK.rares.forEach(function (r) {
      var name = (r.name || '') + ' ' + (r.npcId || '');
      if (name.toLowerCase().indexOf(q) !== -1 || (isNum && r.npcId === parseInt(q, 10))) {
        if (out.rares.length < 40) out.rares.push(r);
      }
    });
    PACK.recipes.forEach(function (r) {
      var src = r.source || {};
      var name = (r.name || '') + ' ' + (r.profession || '') + ' ' + r.itemId +
        ' ' + (src.name || '') + ' ' + (src.npcId || '');
      if (name.toLowerCase().indexOf(q) !== -1 || (isNum && r.itemId === parseInt(q, 10))) {
        if (out.recipes.length < 40) out.recipes.push(r);
      }
    });
    return out;
  }

  function questResultHTML(quest) {
    var acc = quest.accept ? xyHTML(quest.accept.xy) : '';
    var turn = quest.turnin ? xyHTML(quest.turnin.xy) : '';
    return '<a class="card br-result" href="#/quest/' + esc(quest.zone) + '/' + quest.id + '">' +
      '<h4 class="card__title">' + esc(quest.name || ('Quest #' + quest.id)) + '</h4>' +
      '<p class="card__desc">' + esc(zoneName(quest.zone)) +
      (bandOf(quest.zone) ? ' · ' + esc(bandOf(quest.zone)) : '') +
      (quest.level != null ? ' · lvl ' + quest.level : '') + '</p>' +
      '<p class="card__desc">Accept' + (acc || ' (no point)') +
      (quest.turnin ? ' · Turn in' + turn : (quest.acceptOnly ? ' · <em>accept-only, no turn-in</em>' : '')) + '</p>' +
      '</a>';
  }

  function rareResultHTML(r) {
    var pts = (r.points || []).slice(0, 3).map(function (p) {
      return '<span class="br-xy">(' + p[0] + ', ' + p[1] + ')</span>';
    }).join(' ');
    var drops = (r.signatureDrops || []).map(function (d) { return esc(d.name || ('item ' + d.itemId)); }).join(', ');
    return '<a class="card br-result" href="#/zone/' + esc(r.zone) + '">' +
      '<h4 class="card__title">' + esc(r.name || ('NPC ' + r.npcId)) + '</h4>' +
      '<p class="card__desc">' + esc(zoneName(r.zone)) + (r.level ? ' · lvl ' + r.level : '') + '</p>' +
      '<p class="card__desc">' + (pts || 'no placed point') + (drops ? ' · drop: ' + drops : '') + '</p></a>';
  }

  function recipeResultHTML(r) {
    var src = r.source || {};
    var where = src.type === 'vendor'
      ? 'Vendor' + (src.npcId ? ' npc ' + src.npcId : '') + (src.xy ? ' (' + src.xy[0] + ', ' + src.xy[1] + ')' : '')
      : 'Drop';
    return '<a class="card br-result" href="#/zone/' + esc(r.zone) + '">' +
      '<h4 class="card__title">' + esc(r.name || ('item ' + r.itemId)) + '</h4>' +
      '<p class="card__desc">' + esc(r.profession || '') + ' · ' + esc(zoneName(r.zone)) + ' · ' + esc(where) + '</p></a>';
  }

  function renderSearch(query) {
    var res = searchAll(query || '');
    var total = res.quests.length + res.rares.length + res.recipes.length + res.zones.length;
    var html = '<section><div class="section-header"><p class="section-label">Search</p>' +
      '<h2 class="section-title">Results' + (query ? ' for “' + esc(query) + '”' : '') + '</h2>' +
      '<p class="section-desc">' + (query ? total + ' matches across quests, rares, recipes, and zones.' : 'Type above to search every quest, rare, recipe, and zone in the pack.') + '</p></div>';
    function group(title, items, fn) {
      if (!items.length) return '';
      return '<h3 class="br-group">' + title + ' (' + items.length + ')</h3>' +
        '<div class="grid-3">' + items.map(fn).join('') + '</div>';
    }
    html += group('Quests', res.quests, questResultHTML) +
      group('Rares', res.rares, rareResultHTML) +
      group('Recipes', res.recipes, recipeResultHTML) +
      group('Zones', res.zones, zoneCardHTML);
    if (query && !total) html += '<p>No matches. Try a quest name, an NPC or item id, or a zone.</p>';
    return html + '</section>';
  }

  /* ---------- router ---------- */

  var app = null;

  function setTab(name) {
    var tabs = document.querySelectorAll('[data-br-tab]');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle('active', tabs[i].getAttribute('data-br-tab') === name);
    }
  }

  function route() {
    var raw = (location.hash || '#/').replace(/^#/, '');
    var parts = raw.split('?')[0].split('/');
    // parts[0] === '' then view
    var view = parts[1] || '';
    if (view === 'zones') {
      setTab('zones');
      app.innerHTML = renderZones();
      wireZoneFilters();
      window.scrollTo(0, 0);
    } else if (view === 'zone' && parts[2]) {
      setTab('zones');
      var stepIdx = (parts[3] === 'step' && parts[4] != null) ? parseInt(parts[4], 10) : null;
      var res = renderZoneDetail(decodeURIComponent(parts[2]), stepIdx);
      app.innerHTML = typeof res === 'string' ? res : res.html;
      window.scrollTo(0, 0);
      if (res && res.anchorStep != null && !isNaN(res.anchorStep)) {
        var el = document.getElementById('br-step-' + res.anchorStep);
        if (el) {
          el.classList.add('br-flash');
          el.scrollIntoView({ block: 'center' });
        }
      }
    } else if (view === 'quest' && parts[2] && parts[3]) {
      setTab('search');
      app.innerHTML = renderQuest(decodeURIComponent(parts[2]), parseInt(parts[3], 10));
      window.scrollTo(0, 0);
    } else if (view === 'search') {
      setTab('search');
      var m = /[?&]q=([^&]*)/.exec(raw);
      var query = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
      var input = document.getElementById('br-search-input');
      if (input && input.value !== query) input.value = query;
      app.innerHTML = renderSearch(query);
      window.scrollTo(0, 0);
    } else {
      setTab('overview');
      app.innerHTML = renderOverview();
      window.scrollTo(0, 0);
    }
  }

  function wireZoneFilters() {
    var q = document.getElementById('br-zone-q');
    var f = document.getElementById('br-zone-faction');
    if (q) {
      q.addEventListener('input', function () {
        zoneFilter.q = q.value;
        var grid = document.getElementById('br-zone-grid');
        if (grid) {
          var tmp = document.createElement('div');
          tmp.innerHTML = renderZones();
          var ng = tmp.querySelector('#br-zone-grid');
          if (ng) grid.innerHTML = ng.innerHTML;
        }
      });
    }
    if (f) {
      f.addEventListener('change', function () {
        zoneFilter.faction = f.value;
        route();
      });
    }
  }

  function wireGlobalSearch() {
    var input = document.getElementById('br-search-input');
    if (!input) return;
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        location.hash = '#/search?q=' + encodeURIComponent(input.value.trim());
      }
    });
  }

  /* ---------- init ---------- */

  function fail(msg) {
    if (app) app.innerHTML = '<section><h2>Couldn\u2019t load pack data</h2><p>' + esc(msg) + '</p></section>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    app = document.getElementById('br-app');
    wireGlobalSearch();
    fetch(DATA_URL).then(function (resp) {
      if (!resp.ok) throw new Error('HTTP ' + resp.status + ' for ' + DATA_URL);
      return resp.json();
    }).then(function (data) {
      PACK = data;
      (PACK.zones || []).forEach(function (z) { zoneById[z.id] = z; });
      (PACK.quests || []).forEach(function (quest) {
        questIndex.push(quest);
        if (quest.name && questNameById[quest.id] == null) {
          questNameById[quest.id] = quest.name;
        }
      });
      window.addEventListener('hashchange', route);
      route();
    }).catch(function (err) {
      fail(err && err.message ? err.message : 'fetch failed');
    });
  });
})();
