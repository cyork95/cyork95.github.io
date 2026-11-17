/* Butler Routes companion app — maintained smoke check.
   node tools/smoke-check.js   (stdlib only, no dependencies)

   Guards the generator contract and the renderer contract:
   - data: totals internally consistent, every quest named, every
     rares-guide step yields exactly one rare/treasure record, Tirisfal
     ships its 12 named rares + 10 treasures (pack v0.95.0 shape).
   - app: every view renders; every non-plumbing goal renders (row or
     collapsed movement chip); rares/treasures search and lists are split;
     kill goals resolve names from the shared npc map.
   Run after regenerating pack-data.json or touching the renderer. */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'pack-data.json'), 'utf8'));

let failures = 0;
function check(label, ok, extra) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + label + (extra && !ok ? ' :: ' + extra : ''));
  if (!ok) failures++;
}

/* ---------- data invariants ---------- */

check('totals: 50 contracts', DATA.totals.contracts === 50, JSON.stringify(DATA.totals));
check('totals: 3496 contracted quests', DATA.totals.contractedQuests === 3496);
check('totals: 140 guides', DATA.totals.guides === 140);
check('stamp: pack v0.98.0', DATA.generatedFrom.packVersion === '0.98.0');
check('zones == contracts', DATA.zones.length === DATA.totals.contracts);
check('questCount sums to contractedQuests',
  DATA.zones.reduce((n, z) => n + z.questCount, 0) === DATA.totals.contractedQuests);
check('every quest named', DATA.quests.every((q) => q.name));
check('npcNames map present', Object.keys(DATA.npcNames || {}).length > 100);
check('rares all kind=rare+npcId',
  DATA.rares.every((r) => r.kind === 'rare' && r.npcId));
check('treasures all kind=treasure+no npcId',
  DATA.treasures.every((r) => r.kind === 'treasure' && !r.npcId));
check('every rares-guide step yields a record',
  DATA.rares.length + DATA.treasures.length === DATA.coverage.raresGuideSteps);
check('no step without a record', (DATA.coverage.stepsWithoutRecord || []).length === 0);

const TIRISFAL_RARES = ['Bayne', 'Blightsculler', 'Deeb', 'Decrepit Harvester',
  'Farmer Solliden', "Fellicent's Shade", 'Lost Soul', 'Muad',
  'Ressan the Needler', "Sri'skulk", 'The Condemned One', 'Tormented Spirit'];
const tirRares = DATA.rares.filter((r) => r.zone === 'tirisfal-glades').map((r) => r.name).sort();
check('tirisfal: exactly 12 rares', JSON.stringify(tirRares) === JSON.stringify(TIRISFAL_RARES.slice().sort()), JSON.stringify(tirRares));
check('tirisfal: exactly 10 treasures',
  DATA.treasures.filter((r) => r.zone === 'tirisfal-glades').length === 10);
check('tirisfal buried treasure has its point', DATA.treasures.some(
  (r) => r.zone === 'tirisfal-glades' && r.name === 'Buried Treasure' && r.points.length === 1));
check('durotar first rare is Warlord Kolkanis',
  DATA.rares.filter((r) => r.zone === 'durotar')[0].name === 'Warlord Kolkanis');
check('docs: curated set published', DATA.docs.length === 93, String(DATA.docs.length));
check('docs: no excluded files published',
  !DATA.docs.some((d) => ['guide-status.md', 'ZEPHRAS-5-CHECK.md', 'AUTHORING-NOTES-elwynn.md'].includes(d.file)));
check('docs: kind split sane',
  DATA.docs.filter((d) => d.kind === 'census').length === 47 &&
  DATA.docs.filter((d) => d.kind === 'inventory').length === 44 &&
  DATA.docs.filter((d) => d.kind === 'method').length === 2);
check('docs: every zone doc maps to a real zone',
  DATA.docs.filter((d) => d.zone).every((d) => DATA.zones.some((z) => z.id === d.zone)));
check('docs: pages exist on disk',
  DATA.docs.every((d) => fs.existsSync(path.join(ROOT, 'docs', d.slug, 'index.html'))));

/* ---------- stub-DOM render harness ---------- */

const store = { app: { innerHTML: '' }, input: { value: '', addEventListener: () => {} } };
let domHandlers = {};
let hashHandlers = [];
global.window = {
  addEventListener: (ev, fn) => { if (ev === 'hashchange') hashHandlers.push(fn); },
  scrollTo: () => {},
};
global.location = { hash: '#/' };
global.document = {
  getElementById: (id) => {
    if (id === 'br-app') return store.app;
    if (id === 'br-search-input') return store.input;
    if (id === 'br-zone-q' || id === 'br-zone-faction') return null;
    if (String(id).startsWith('br-step-')) {
      return { classList: { add: () => {} }, scrollIntoView: () => {} };
    }
    return null;
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ innerHTML: '', querySelector: () => null }),
  addEventListener: (ev, fn) => { domHandlers[ev] = fn; },
};
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve(DATA) });

eval(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8')); // eslint-disable-line

function go(hash) {
  global.location.hash = hash;
  hashHandlers.forEach((fn) => fn());
  return store.app.innerHTML;
}
function count(html, sub) { return html.split(sub).length - 1; }

(async () => {
  domHandlers.DOMContentLoaded();
  await new Promise((r) => setTimeout(r, 50));

  /* overview + directory regression */
  let html = go('#/');
  check('overview: stamp', html.includes('Pack data: v' + DATA.generatedFrom.packVersion));
  check('overview: totals strip', html.includes('>50<') && html.includes('3,496') && html.includes('>140<'));
  html = go('#/zones');
  check('zones: 50 cards', count(html, 'br-zonecard') === 50, String(count(html, 'br-zonecard')));

  /* tirisfal detail: split kinds, names, structure */
  html = go('#/zone/tirisfal-glades');
  check('tirisfal: rares header (12)', html.includes('Rares (12)'));
  check('tirisfal: treasures header (10)', html.includes('Treasures (10)'));
  TIRISFAL_RARES.forEach((n) => check('tirisfal rare: ' + n, html.includes('>' + n + '<')));
  check('tirisfal: buried treasure', html.includes('Buried Treasure'));
  check('tirisfal: lead paragraph', html.includes('br-lead') && html.includes('Deathknell works'));
  check('tirisfal: step permalinks', html.includes('#/zone/tirisfal-glades/step/0'));
  check('tirisfal: per-step report links', html.includes('Report this step'));
  check('tirisfal: coord chip parsed out', html.includes('(30.7, 62.5)') && !html.includes('@30.70,62.50'));

  /* companion vocabulary visible */
  html = go('#/zone/mulgore');
  check('mulgore: tame task visible', html.includes('Tame it instead of killing it'));
  check('mulgore: mazzranache kill named', html.includes('Mazzranache'));
  html = go('#/zone/shendralas');
  check('shendralas: interact visible', html.includes('Interact') && html.includes('602101'));
  check('shendralas: patrol chip row', html.includes('Patrol loop') && html.includes('br-pt'));
  html = go('#/zone/stranglethorn-vale');
  check('recipe steps: buy + requires structured',
    html.includes('>Buy<') && html.includes('>Requires<'));
  html = go('#/zone/alterac-mountains');
  check('recipe steps: vendor structured',
    html.includes('>Vendor<') && html.includes('npc 3537'));
  html = go('#/zone/elwynn-forest');
  check('step-level only gate pill', html.includes('only Hunter'));
  html = go('#/zone/durotar');
  check('durotar: warlord kolkanis displayed', html.includes('Warlord Kolkanis'));

  /* quest path regression + kill names */
  html = go('#/quest/alterac-mountains/96783');
  check('quest: accept-only note', html.includes('Accept-only quest'));
  html = go('#/quest/durotar/784');
  check('quest: objectives render', html.includes('br-tl-kind'));

  /* search: split kinds */
  html = go('#/search?q=Bayne');
  check('search: rares group', html.includes('Rares ('));
  html = go('#/search?q=Buried%20Treasure');
  check('search: treasures group', html.includes('Treasures ('));
  html = go('#/search?q=Zixil');
  check('search: recipes group', html.includes('Recipes ('));
  html = go('#/search?q=Ansirem');
  check('search: quests group', html.includes('Quests ('));
  html = go('#/search?q=census');
  check('search: docs group', html.includes('Docs ('));
  html = go('#/docs');
  check('docs index: method group', html.includes('Method &amp; contributor notes'));
  check('docs index: display titles',
    html.includes('Authoring Notes') && html.includes('Unverified &amp; open questions'));
  check('docs index: zone groups', html.includes('By zone'));
  check('docs index: static page links', html.includes('/butler-routes/docs/teldrassil-census/'));
  html = go('#/zone/teldrassil');
  check('zone: paperwork card', html.includes('The paperwork'));
  check('zone: paperwork links resolve to docs',
    html.includes('/butler-routes/docs/teldrassil-census/') &&
    html.includes('/butler-routes/docs/teldrassil-companions-inventory/'));
  check('overview: docs teaser', go('#/').includes('#/docs'));

  /* goal-count acceptance: every non-plumbing goal renders */
  const excl = new Set(['zone', 'only', 'goto', 'loop']);
  let badZones = [];
  let moveChips = 0;
  let gotoGoals = 0;
  let onlyPills = 0;
  let onlyGoals = 0;
  DATA.zones.forEach((z) => {
    const zh = go('#/zone/' + z.id);
    const actual = {};
    const re = /<li class="br-row[^"]*" data-cmd="([^"]+)"/g;
    let m;
    while ((m = re.exec(zh))) actual[m[1]] = (actual[m[1]] || 0) + 1;
    const expected = {};
    z.steps.concat(z.companionSteps.rares, z.companionSteps.recipes).forEach((s) => {
      const vis = s.goals.filter((g) => g.cmd !== 'zone' && g.cmd !== 'only');
      if (vis.length && vis[0].cmd === 'note') vis.shift(); // lead paragraph
      vis.forEach((g) => {
        if (g.cmd === 'goto') return;
        expected[g.cmd] = (expected[g.cmd] || 0) + 1;
      });
    });
    Object.keys(expected).forEach((k) => {
      if ((actual[k] || 0) !== expected[k]) badZones.push(z.id + ':' + k);
    });
    Object.keys(actual).forEach((k) => {
      if (!(k in expected) && k !== 'goto' && k !== 'loop') badZones.push(z.id + ':extra-' + k);
    });
    if (actual.zone) badZones.push(z.id + ':zone-leaked');
    // goto goals -> chips inside move/patrol rows
    const rows = zh.match(/<li class="br-row br-(move|patrol)"[^>]*>.*?<\/li>/g) || [];
    let chips = 0;
    rows.forEach((r) => { chips += count(r, 'br-pt'); });
    let gg = 0;
    z.steps.concat(z.companionSteps.rares, z.companionSteps.recipes).forEach((s) => {
      s.goals.forEach((g) => { if (g.cmd === 'goto') gg++; });
    });
    moveChips += chips;
    gotoGoals += gg;
    if (chips !== gg) badZones.push(z.id + ':goto-chips ' + chips + '!=' + gg);
    onlyPills += count(zh, 'br-headgates"><span class="br-pill">only ');
    z.steps.concat(z.companionSteps.rares, z.companionSteps.recipes).forEach((s) => {
      s.goals.forEach((g) => { if (g.cmd === 'only') onlyGoals++; });
    });
  });
  check('all zones: every goal renders (no drops)', badZones.length === 0, badZones.slice(0, 5).join(';'));
  check('all goto goals collapse to chips', moveChips === gotoGoals, moveChips + '!=' + gotoGoals);
  check('step-level only lines become pills', onlyPills === onlyGoals, onlyPills + '!=' + onlyGoals);

  console.log(failures === 0 ? 'SMOKE PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(1); });
