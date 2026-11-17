#!/usr/bin/env python3
"""Generate butler-routes/data/pack-data.json from the pack repo.

Reads ONLY the pack repo's own files (pack.json, docs/quest-contracts.json,
docs/*-census.md, docs/*-companions-inventory.md, docs/guide-status.md,
*.guide). Never hand-types quest, rare, or NPC names, levels, or
coordinates: where a field cannot be extracted the record ships without it.
Rares-guide steps each yield exactly one record, kind 'rare' (kill line
present) or 'treasure'; rare names resolve against the inventory docs by
NPC id, then the step-title tail, then the full title.

How to re-run (regenerating the site's data AND docs after a pack release is
exactly one command):
    python tools/generate-pack-data.py
    # then commit butler-routes/data/pack-data.json and butler-routes/docs/

Options:
    --pack-url URL   pack repo to clone (default: the public pack repo)
    --pack-dir PATH  use a local clone instead of cloning to a temp dir
    --out PATH       output JSON (default: ../data/pack-data.json, i.e. next
                     to the app)

Requires: python3 (stdlib only) + git on PATH (only when cloning).
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile

PACK_URL = "https://github.com/cyork95/butler-routes-completionist"
DEFAULT_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "..", "data", "pack-data.json")

CENSUS_SUFFIXES = ("-mountains", "-highlands", "-foothills", "-forest",
                   "-vale", "-marsh", "-crater", "-glades", "-city",
                   "-druid", "-pass")


def census_candidates(contract_id):
    cands = [contract_id + "-census.md"]
    stem = contract_id
    for suf in CENSUS_SUFFIXES:
        if stem.endswith(suf):
            stem = stem[: -len(suf)]
            break
    if stem != contract_id:
        cands.append(stem + "-census.md")
    # known short names that suffix-stripping misses
    cands += {
        "zephras-isle": [],
        "elwynn-forest": [],
        "westfall": [],
        "silverpine-forest-alliance": ["silverpine-census.md"],
        "the-barrens": ["barrens-census.md"],
    }.get(contract_id, [])
    return cands


def short_stem(contract_id):
    stem = contract_id
    if stem.startswith("the-"):
        stem = stem[4:]
    for suf in CENSUS_SUFFIXES:
        if stem.endswith(suf):
            return stem[: -len(suf)]
    return stem


def guide_rest_name(rest):
    """Quest name fallback from an accept line's '-- Name - NPC' rest."""
    if " - " not in rest:
        return None
    name = rest.split(" - ", 1)[0].strip()
    if 1 <= len(name) <= 80 and re.search(r"[A-Za-z0-9]", name):
        return name
    return None


def parse_guide_file(path):
    """Parse one .guide file into {header, steps[{title, goals[]}]}.

    goals are raw dicts: {cmd, args} where cmd is the first token
    (goto/accept/complete/turnin/kill/collect/buy/vendor/when/note/tip/loop/...)
    """
    header = {}
    steps = []
    cur = None
    with open(path, encoding="utf-8", errors="replace") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            if cur is None and re.match(r"^[a-z][a-z0-9-]* ", s) and " " in s:
                key, _, val = s.partition(" ")
                if key in ("guide", "title", "levels", "zone", "faction",
                           "category", "folder", "keywords", "coords",
                           "version"):
                    header[key] = val.strip()
                    continue
            if s.startswith("step "):
                cur = {"title": s[5:].strip(), "goals": []}
                steps.append(cur)
                continue
            if cur is None:
                continue
            parts = s.split(None, 1)
            cmd = parts[0]
            cur["goals"].append({"cmd": cmd,
                                 "args": parts[1] if len(parts) > 1 else ""})
    return {"header": header, "steps": steps}


COORD_RE = re.compile(r"@?(\d{1,3}\.\d+)\s*,\s*(\d{1,3}\.\d+)")
POS_RE = re.compile(r"@?(\d{1,3}(?:\.\d+)?)\s*,\s*"
                    r"(\d{1,3}(?:\.\d+)?)")
POS_IN_PARENS_RE = re.compile(r"\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*"
                              r"(\d{1,3}(?:\.\d+)?)\s*\)")
QUEST_REF_RE = re.compile(r"quest\s+(\d+)(?:\.\d+)?")
QID_LEAD_RE = re.compile(r"^(\d+)\b\s*(.*)$")
GATES_RE = re.compile(r"^only\s+([A-Za-z,]+)\s*(.*)$")
VENDOR_RE = re.compile(r"^(\d+)\s*--\s*(.*?)\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*"
                       r"(\d{1,3}(?:\.\d+)?)\s*\)\s*(.*)$")
BUY_RE = re.compile(r"^(\d+)\s+\"([^\"]+)\"")
COLLECT_RE = re.compile(r"^(\d+)\s*(.*)$")
BULLET_RE = re.compile(r"^-\s+(\d+)\s+(.+?)\s+\(lvl(\d+)/min(\d+)\)")


def coords_in(text):
    m = COORD_RE.search(text or "")
    if m:
        return [float(m.group(1)), float(m.group(2))]
    return None


def pos_in(text):
    """Liberal position parse for `goto` lines (integer parts allowed)."""
    m = POS_RE.search(text or "")
    if m:
        return [float(m.group(1)), float(m.group(2))]
    return None


def apos_in(text):
    """Liberal `@x,y` parse for inline args (`@` marks a coordinate)."""
    m = re.search(r"@(\d{1,3}(?:\.\d+)?)\s*,\s*"
                  r"(\d{1,3}(?:\.\d+)?)", text or "")
    if m:
        return [float(m.group(1)), float(m.group(2))]
    return None


def split_qid_gates_rest(args):
    """'603 only Alliance -- rest' -> (603, 'Alliance', 'rest')."""
    m = QID_LEAD_RE.match(args.strip())
    if not m:
        return None, None, args
    qid = int(m.group(1))
    tail = m.group(2).strip()
    gates = None
    rest = tail
    g = GATES_RE.match(tail)
    if g:
        gates = g.group(1)
        rest = g.group(2).strip()
    if rest.startswith("--"):
        rest = rest[2:].strip()
    return qid, gates, rest


def extract_zone_guides(pack_dir, contract_id):
    """Return {core, rares, recipes} parsed guides (or None)."""
    out = {"core": None, "rares": None, "recipes": None}
    short = short_stem(contract_id)
    slugs = {"core": [contract_id, short],
             "rares": [contract_id + "-rares", short + "-rares"],
             "recipes": [contract_id + "-recipes", short + "-recipes"]}
    # index header slugs once per call (cheap: stops at first header line)
    header_slugs = {}
    for fn in os.listdir(pack_dir):
        if not fn.endswith(".guide"):
            continue
        fp = os.path.join(pack_dir, fn)
        try:
            with open(fp, encoding="utf-8", errors="replace") as fh:
                for raw in fh:
                    s = raw.strip()
                    if s.startswith("guide "):
                        header_slugs[s.split("/")[-1].strip()] = fp
                        break
        except OSError:
            continue
    for kind, cands in slugs.items():
        path = None
        for slug in cands:
            cand = os.path.join(pack_dir, slug + ".guide")
            if os.path.exists(cand):
                path = cand
                break
            if slug in header_slugs:
                path = header_slugs[slug]
                break
        if path is None:
            continue
        try:
            out[kind] = parse_guide_file(path)
        except OSError:
            continue
    return out


def build_quest_journeys(core):
    """qid -> {accept, objectives[], turnin} with step titles + coords."""
    journeys = {}
    if core is None:
        return journeys
    for step in core["steps"]:
        last_xy = None
        for g in step["goals"]:
            cmd, args = g["cmd"], g["args"]
            if cmd == "goto":
                c = pos_in(args)
                if c:
                    last_xy = c
                continue
            if cmd in ("accept", "complete", "turnin"):
                qid, gates, rest = split_qid_gates_rest(args)
                if qid is None:
                    continue
                j = journeys.setdefault(
                    qid, {"accept": None, "objectives": [],
                          "turnin": None, "gates": []})
                xy = coords_in(args) or apos_in(args) or last_xy
                if gates and gates not in j["gates"]:
                    j["gates"].append(gates)
                if cmd == "accept":
                    if j["accept"] is None:
                        j["accept"] = {"step": step["title"], "xy": xy,
                                       "rest": rest, "gates": gates}
                elif cmd == "turnin":
                    j["turnin"] = {"step": step["title"], "xy": xy,
                                   "rest": rest, "gates": gates}
                else:
                    j["objectives"].append(
                        {"step": step["title"], "xy": xy, "kind": cmd,
                         "rest": rest, "gates": gates})
                continue
            if cmd in ("kill", "collect"):
                for qid in [int(x) for x in QUEST_REF_RE.findall(args)]:
                    j = journeys.setdefault(
                        qid, {"accept": None, "objectives": [],
                              "turnin": None, "gates": []})
                    xy = (coords_in(args) or apos_in(args)
                          or last_xy)
                    j["objectives"].append(
                        {"step": step["title"], "xy": xy, "kind": cmd,
                         "rest": args.strip(), "gates": None})
    return journeys


def parse_census_names(docs_dir, contract_id):
    """qid -> {name, level, minLevel} from the zone census ledger.

    Handles two ledger shapes the pack uses: markdown tables
    (`| ID | Quest | L/m | ...`) and bullets
    (`- <id> <Name> (lvl<L>/min<M>) - ...`). Lines marked OUT never
    override an IN record for the same id.
    """
    found = {}
    fname = None
    for cand in census_candidates(contract_id):
        if os.path.exists(os.path.join(docs_dir, cand)):
            fname = cand
            break
    if fname is None:
        return found, None

    def put(qid, name, level, min_level, disp):
        if not name:
            return
        prev = found.get(qid)
        if prev is not None and "OUT" not in prev.get("_d", ""):
            return
        if "OUT" in disp and prev is not None:
            return
        found[qid] = {"name": name, "level": level,
                      "minLevel": min_level, "_d": disp}

    with open(os.path.join(docs_dir, fname), encoding="utf-8",
              errors="replace") as fh:
        for raw in fh:
            line = raw.strip()
            if line.startswith("|"):
                cells = [c.strip() for c in line.strip("|").split("|")]
                if len(cells) < 3 or not re.fullmatch(r"\d+", cells[0]):
                    continue
                qid = int(cells[0])
                disp = cells[3] if len(cells) > 3 else ""
                level = min_level = None
                m = re.match(r"(\d+)\s*/\s*(?:m?(\d+)|-)?",
                             cells[2].strip())
                if m:
                    level = int(m.group(1))
                    if m.group(2):
                        min_level = int(m.group(2))
                put(qid, cells[1] or None, level, min_level, disp)
            elif line.startswith("- "):
                m = BULLET_RE.match(line)
                if m:
                    put(int(m.group(1)), m.group(2).strip(),
                        int(m.group(3)), int(m.group(4)), line)
    for v in found.values():
        v.pop("_d", None)
    return found, fname


TITLE_SPLIT_RES = [re.compile(r"\s+-\s+"), re.compile(r"\s+—\s+"),
                   re.compile(r"\s+–\s+")]


def split_title_tail(title):
    """Segment after the LAST dash of any kind ('<place> - <Name>')."""
    best = None
    for rx in TITLE_SPLIT_RES:
        parts = rx.split(title.strip())
        if len(parts) > 1:
            best = parts[-1].strip()
    return best


def parse_inventory_npc_names(docs_dir):
    """Shared npcId -> name map from the companions inventory docs.

    Handles the pack's three line shapes:
      pipe   `- <Name> | npc<id> | ...`            (rare rows)
      buy    `... buy from <Vendor>, npc<id> ...`  (vendor rows)
      paren  `- <Name> (<id>, lvl ...)`            (rare rows)
      dash   `- <Name> <id>, lvl ...`              (rare rows)
    First mention wins; conflicts are counted, never overwritten.
    """
    npc_names = {}
    stats = {"pipe": 0, "buy": 0, "paren": 0, "dash": 0, "conflicts": 0}
    if not os.path.isdir(docs_dir):
        return npc_names, stats
    for fn in sorted(os.listdir(docs_dir)):
        if not fn.endswith("-inventory.md"):
            continue
        with open(os.path.join(docs_dir, fn), encoding="utf-8",
                  errors="replace") as fh:
            for raw in fh:
                line = raw.strip()
                pairs = []
                m = re.match(r"^-\s*([^|]+?)\s*\|\s*npc(\d+)\b", line)
                if m:
                    pairs.append((int(m.group(2)), m.group(1).strip(),
                                  "pipe"))
                for m in re.finditer(r"buy from ([^,]+?),\s*npc(\d+)\b",
                                     line):
                    pairs.append((int(m.group(2)), m.group(1).strip(),
                                  "buy"))
                m = re.match(r"^-\s*(.+?)\s*\(\s*(\d{3,6})\s*,\s*lvl\b",
                             line)
                if m:
                    pairs.append((int(m.group(2)), m.group(1).strip(),
                                  "paren"))
                m = re.match(r"^-\s*([^()]+?)\s+(\d{3,6})\s*,\s*lvl\b",
                             line)
                if m:
                    pairs.append((int(m.group(2)), m.group(1).strip(),
                                  "dash"))
                for nid, name, src in pairs:
                    if not name:
                        continue
                    if nid not in npc_names:
                        npc_names[nid] = name
                        stats[src] += 1
                    elif npc_names[nid] != name:
                        stats["conflicts"] += 1
    return npc_names, stats


def resolve_step_name(step_title, npc_id, npc_names):
    """(name, source): inventory hit, title tail, or full title."""
    if npc_id is not None and npc_id in npc_names:
        return npc_names[npc_id], "inventory"
    tail = split_title_tail(step_title)
    if tail:
        return tail, "title"
    return step_title.strip() or None, "full"


def parse_rares(rares_guide, zone_id, npc_names):
    """One record per rares-guide step: kind 'rare' (npcId) or 'treasure'.

    Returns (rares, treasures, name_sources, skipped) where skipped lists
    steps that yielded no record, with reasons (expected to be empty:
    every step carries at least its title).
    """
    rares = []
    treasures = []
    name_sources = {"inventory": 0, "title": 0, "full": 0}
    skipped = []
    if rares_guide is None:
        return rares, treasures, name_sources, skipped
    for step in rares_guide["steps"]:
        npc_id = None
        points = []
        loop = False
        level = None
        drops = []
        for g in step["goals"]:
            cmd, args = g["cmd"], g["args"]
            if cmd == "loop":
                loop = True
            elif cmd == "goto":
                c = pos_in(args)
                if c:
                    points.append(c)
            elif cmd == "kill":
                m = re.match(r"(\d+)", args.strip())
                if m and npc_id is None:
                    npc_id = int(m.group(1))
            elif cmd == "collect":
                m = COLLECT_RE.match(args.strip())
                if m:
                    item_id = int(m.group(1))
                    nm = re.search(r"\"([^\"]+)\"", m.group(2))
                    drops.append({"itemId": item_id,
                                  "name": nm.group(1) if nm else None})
            elif cmd == "note":
                m = re.search(r"[Ll]evel\s+(\d+)\s+rare", args)
                if m and level is None:
                    level = int(m.group(1))
        name, source = resolve_step_name(step["title"], npc_id, npc_names)
        if name is None:
            skipped.append({"step": step["title"], "zone": zone_id,
                            "reason": "empty title and no npc id"})
            continue
        name_sources[source] += 1
        rec = {"kind": "rare" if npc_id is not None else "treasure",
               "name": name, "nameSource": source, "npcId": npc_id,
               "zone": zone_id, "level": level, "points": points,
               "loop": loop, "signatureDrops": drops,
               "step": step["title"]}
        (rares if npc_id is not None else treasures).append(rec)
    return rares, treasures, name_sources, skipped


def parse_recipes(recipes_guide, zone_id):
    """Recipe records from a recipes companion guide."""
    recipes = []
    if recipes_guide is None:
        return recipes
    for step in recipes_guide["steps"]:
        prof = re.split(r"\s+[—–-]\s+", step["title"], maxsplit=1)[0].strip()
        vendor = None
        for g in step["goals"]:
            if g["cmd"] == "vendor":
                m = VENDOR_RE.match(g["args"].strip())
                if m:
                    vendor = {"npcId": int(m.group(1)),
                              "name": m.group(2).strip().rstrip(","),
                              "xy": [float(m.group(3)),
                                     float(m.group(4))],
                              "extra": m.group(5).strip()}
                break
        for g in step["goals"]:
            cmd, args = g["cmd"], g["args"]
            if cmd == "buy":
                m = BUY_RE.match(args.strip())
                if not m:
                    continue
                src = {"type": "vendor", "step": step["title"]}
                if vendor:
                    src.update(vendor)
                recipes.append({"name": m.group(2),
                                "itemId": int(m.group(1)),
                                "profession": prof or None, "zone": zone_id,
                                "source": src})
            elif cmd == "collect":
                m = COLLECT_RE.match(args.strip())
                if not m:
                    continue
                nm = re.search(r"\"([^\"]+)\"", m.group(2))
                recipes.append({"name": nm.group(1) if nm else None,
                                "itemId": int(m.group(1)),
                                "profession": prof or None, "zone": zone_id,
                                "source": {"type": "drop",
                                           "step": step["title"],
                                           "detail": args.strip()}})
    return recipes


def parse_guide_status(docs_dir, contracts):
    """contract_id -> {done, total, label} from docs/guide-status.md ticks."""
    status = {}
    path = os.path.join(docs_dir, "guide-status.md")
    sections = []
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            cur = None
            for raw in fh:
                line = raw.rstrip("\n")
                if line.startswith("### "):
                    cur = {"head": line[4:].strip(), "ticks": []}
                    sections.append(cur)
                elif cur is not None:
                    m = re.match(r"\s*-\s*\[(x| )\]\s*(.*)", line)
                    if m:
                        cur["ticks"].append(
                            (m.group(1) == "x", m.group(2).strip()))
    except OSError:
        return status

    def norm(s):
        return re.sub(r"[^a-z0-9]+", " ",
                      s.lower()).strip()

    for c in contracts:
        cn = norm(re.sub(r"\s*\(.*?\)\s*", " ", c["name"]))
        best = None
        for s in sections:
            hn = norm(re.sub(r"\s*[—–-].*$", "", s["head"]))
            hn = norm(re.sub(r"\s*\(.*?\)\s*", " ", hn))
            cw = set(cn.split()) - {"the"}
            hw = set(hn.split()) - {"the"}
            if cw and cw <= hw or hw and hw <= cw:
                best = s
                break
        if best is None or not best["ticks"]:
            status[c["id"]] = {"done": 0, "total": 0, "label": "Planned"}
            continue
        done = sum(1 for t, _ in best["ticks"] if t)
        total = len(best["ticks"])
        pilot = any(("pilot" in label.lower() and tick)
                    for tick, label in best["ticks"])
        fixes = any(("fix" in label.lower() and tick)
                    for tick, label in best["ticks"])
        if done == total and total > 0:
            label = "Complete"
        elif pilot and fixes:
            label = "Piloted"
        elif pilot:
            label = "Built — pilot pending"
        elif done > 0:
            label = "Built — pilot pending"
        else:
            label = "Planned"
        if done > 0 and not pilot and total > done:
            label = "In progress"
        status[c["id"]] = {"done": done, "total": total, "label": label}
    return status


DOCS_EXCLUDED = {"guide-status.md", "ZEPHRAS-5-CHECK.md",
                   "AUTHORING-NOTES-elwynn.md"}
GITHUB_BLOB = ("https://github.com/cyork95/butler-routes-completionist"
               "/blob/master/")
SITE_DOCS_BASE = "/butler-routes/docs/"

EXTRA_ZONE_STEMS = {"zephras": "zephras-isle", "barrens": "the-barrens",
                    "silverpine": "silverpine-forest-alliance"}


def md_escape(text):
    return (text.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;"))


def md_inline(text, slug_set):
    """Inline markdown: code, bold, italic, links, bare doc/guide refs."""
    parts = []
    out = []
    idx = 0
    for m in re.finditer(r"(`+)(.+?)\1", text):
        out.append(text[idx:m.start()])
        code = md_escape(m.group(2))
        code = linkify_bare_refs(code, slug_set)
        out.append("\x00" + str(len(parts)) + "\x00")
        parts.append("<code>" + code + "</code>")
        idx = m.end()
    out.append(text[idx:])
    text = "".join(out)

    def restore(s):
        def sub(m):
            return parts[int(m.group(1))]
        return re.sub("\x00(\\d+)\x00", sub, s)

    text = md_escape(text)
    # placeholders survive escaping (\x00 stays); code content is escaped
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*\n]+)\*", r"<em>\1</em>", text)
    text = re.sub(r"\\([*_`\[\]#.!-])", r"\1", text)
    text = md_linkify(text, slug_set)
    text = restore(text)
    return text


def md_linkify(text, slug_set):
    """[text](url) links, autolinked URLs, and bare doc/guide references."""
    def repl_link(m):
        label, url = m.group(1), m.group(2).strip()
        if url.startswith("#"):
            return '<a href="' + url + '">' + label + "</a>"
        if re.match(r"https?://", url):
            return ('<a href="' + url + '" target="_blank" rel="noopener">'
                    + label + "</a>")
        if url.endswith(".md"):
            stem = url.split("/")[-1][:-3].lower()
            if stem in slug_set:
                return ('<a href="' + SITE_DOCS_BASE + stem + '/">' + label
                        + "</a>")
            return ('<a href="' + GITHUB_BLOB + "docs/" + stem + '.md'
                    + '" target="_blank" rel="noopener">' + label + "</a>")
        return '<a href="' + url + '">' + label + "</a>"

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", repl_link, text)
    text = re.sub(r"(https?://[^\s<>\)\]]+)",
                  r'<a href="\1" target="_blank" rel="noopener">\1</a>',
                  text)
    return linkify_bare_refs(text, slug_set)


def linkify_bare_refs(text, slug_set):
    def repl_docs(m):
        fname = m.group(1)
        stem = fname[:-3].lower()
        if stem in slug_set:
            return ('<a href="' + SITE_DOCS_BASE + stem + '/">docs/'
                    + fname + "</a>")
        return ('<a href="' + GITHUB_BLOB + "docs/" + fname
                + '" target="_blank" rel="noopener">docs/' + fname + "</a>")

    text = re.sub(r"docs/([\w.,-]+\.md)", repl_docs, text)

    def repl_guide(m):
        return ('<a href="' + GITHUB_BLOB + m.group(1)
                + '" target="_blank" rel="noopener">' + m.group(1) + "</a>")

    text = re.sub(r"\b([\w.,-]+\.guide)\b", repl_guide, text)
    return text


def md_render_blocks(lines, slug_set):
    """Compact block renderer. Returns (html, fallback_count).

    Handles: fenced code, ATX headings, hr, blockquotes, tables,
    ordered/unordered (nested) lists with lazy continuation, paragraphs.
    Anything else (raw HTML lines, footnotes) renders escaped in <pre>
    so content never drops.
    """
    html = []
    fallbacks = 0
    i = 0
    n = len(lines)

    def is_hr(s):
        return re.match(r"^\s*([-*_]\s*){3,}$", s) is not None

    def is_table_delim(s):
        cells = [c.strip() for c in s.strip().strip("|").split("|")]
        return (len(cells) > 0 and
                all(re.match(r"^:?-+:?$", c) for c in cells))

    def is_list_item(s):
        return re.match(r"^(\s*)([-+*]|\d+[.)])(?:\s+\S|\s*$)", s)

    while i < n:
        line = lines[i].rstrip("\n")
        s = line.strip()
        if not s:
            i += 1
            continue
        if s.startswith("```"):
            buf = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                buf.append(lines[i].rstrip("\n"))
                i += 1
            i += 1
            html.append("<pre><code>" + md_escape("\n".join(buf))
                        + "</code></pre>")
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            html.append("<h" + str(len(m.group(1))) + ">"
                        + md_inline(m.group(2).strip(), slug_set)
                        + "</h" + str(len(m.group(1))) + ">")
            i += 1
            continue
        if is_hr(s):
            html.append("<hr>")
            i += 1
            continue
        if s.startswith(">"):
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].lstrip())
                i += 1
            html.append("<blockquote><p>"
                        + "<br>".join(md_inline(b, slug_set) for b in buf)
                        + "</p></blockquote>")
            continue
        if "|" in s and i + 1 < n and is_table_delim(lines[i + 1]):
            header = [c.strip() for c in s.strip().strip("|").split("|")]
            aligns = []
            for c in [c.strip() for c in lines[i + 1].strip()
                      .strip("|").split("|")]:
                if c.startswith(":") and c.endswith(":"):
                    aligns.append(' style="text-align:center"')
                elif c.endswith(":"):
                    aligns.append(' style="text-align:right"')
                else:
                    aligns.append("")
            rows = []
            i += 2
            while i < n and "|" in lines[i] and lines[i].strip():
                rows.append([c.strip() for c in lines[i].strip()
                             .strip("|").split("|")])
                i += 1
            t = ["<table><thead><tr>"]
            for j, cell in enumerate(header):
                t.append("<th" + (aligns[j] if j < len(aligns) else "")
                         + ">" + md_inline(cell, slug_set) + "</th>")
            t.append("</tr></thead><tbody>")
            for row in rows:
                t.append("<tr>")
                for j in range(len(header)):
                    cell = row[j] if j < len(row) else ""
                    t.append("<td" + (aligns[j] if j < len(aligns) else "")
                             + ">" + md_inline(cell, slug_set) + "</td>")
                t.append("</tr>")
            t.append("</tbody></table>")
            html.append("".join(t))
            continue
        if is_list_item(line):
            items = []
            while i < n:
                lm = re.match(r"^(\s*)([-+*]|\d+[.)])(?:\s+(.*))?$",
                              lines[i].rstrip("\n"))
                if not lm:
                    if lines[i].strip() and items:
                        # lazy continuation of the open item
                        items[-1][2].append(lines[i].strip())
                        i += 1
                        continue
                    break
                indent = len(lm.group(1).replace("\t", "    "))
                first = (lm.group(3) or "").strip()
                items.append([indent, lm.group(2), [first] if first
                              else []])
                i += 1
                while i < n and lines[i].strip() and not \
                        is_list_item(lines[i].rstrip("\n")) and not \
                        lines[i].strip().startswith(("```", "#", ">")) \
                        and "|" not in lines[i] and not \
                        is_hr(lines[i].strip()):
                    items[-1][2].append(lines[i].strip())
                    i += 1
            html.append(render_md_list(items, slug_set))
            continue
        if s.startswith("<") or s.startswith("[^"):
            html.append("<pre>" + md_escape(s) + "</pre>")
            fallbacks += 1
            i += 1
            continue
        buf = [s]
        i += 1
        while i < n and lines[i].strip() and not \
                is_list_item(lines[i].rstrip("\n")) and not \
                lines[i].strip().startswith(("```", "#", ">")) \
                and "|" not in lines[i] and not \
                is_hr(lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        html.append("<p>" + md_inline(" ".join(buf), slug_set) + "</p>")
    return "".join(html), fallbacks


def render_md_list(items, slug_set):
    """Nested (un)ordered list from [indent, marker, text-lines] items."""
    out = []
    stack = []  # (indent, ordered); the innermost <li> stays open
    for indent, marker, textlines in items:
        ordered = re.match(r"\d+[.)]", marker) is not None
        tag = "ol" if ordered else "ul"
        while stack and indent < stack[-1][0]:
            top = stack.pop()
            out.append("</li></" + ("ol" if top[1] else "ul") + ">")
        if not stack or indent > stack[-1][0]:
            stack.append((indent, ordered))
            out.append("<" + tag + "><li>")
        elif ordered != stack[-1][1]:
            top = stack.pop()
            out.append("</li></" + ("ol" if top[1] else "ul") + ">")
            stack.append((indent, ordered))
            out.append("<" + tag + "><li>")
        else:
            out.append("</li><li>")
        out.append(md_inline(" ".join(textlines), slug_set))
    while stack:
        top = stack.pop()
        out.append("</li></" + ("ol" if top[1] else "ul") + ">")
    return "".join(out)


def doc_zone_and_kind(fname, contracts):
    """(zone_id|None, kind) for a published docs/*.md file."""
    if fname in ("AUTHORING-NOTES.md", "companion-unverified.md"):
        return None, "method"
    if fname == "city-recipes-inventory.md":
        return None, "inventory"
    stem = fname[:-3]
    if stem.endswith("-census"):
        base = stem[:-len("-census")]
        kind = "census"
    elif stem.endswith("-companions-inventory"):
        base = stem[:-len("-companions-inventory")]
        kind = "inventory"
    else:
        return None, "method"
    ids = [c["id"] for c in contracts]
    for cid in ids:
        if cid == base or short_stem(cid) == base:
            return cid, kind
    if base in EXTRA_ZONE_STEMS:
        return EXTRA_ZONE_STEMS[base], kind
    for cid in ids:
        cands = [c[:-3] if c.endswith(".md") else c
                 for c in census_candidates(cid)]
        if base in cands:
            return cid, kind
    return None, kind


def publish_docs(pack_dir, app_dir, contracts, stamp_txt):
    """Render the curated docs set to static HTML pages.

    Returns (docs_meta, published_count, fallback_count).
    """
    docs_dir = os.path.join(pack_dir, "docs")
    out_base = os.path.join(app_dir, "docs")
    names = sorted(f for f in os.listdir(docs_dir)
                   if f.endswith(".md") and f not in DOCS_EXCLUDED)
    slug_set = {f[:-3].lower() for f in names}
    metas = []
    for fname in names:
        with open(os.path.join(docs_dir, fname), encoding="utf-8",
                  errors="replace") as fh:
            text = fh.read()
        body, fb = md_render_blocks(text.splitlines(), slug_set)
        m = re.search(r"^#\s+(.+)$", text, re.M)
        title = m.group(1).strip() if m else fname[:-3]
        zone, kind = doc_zone_and_kind(fname, contracts)
        slug = fname[:-3].lower()
        metas.append({"slug": slug, "title": title, "file": fname,
                      "kind": kind, "zone": zone, "fallbacks": fb,
                      "body": body})
    total_fallbacks = sum(m["fallbacks"] for m in metas)
    for meta in metas:
        zone = meta["zone"]
        zone_name = None
        zone_link = ""
        if zone:
            znames = {c["id"]: c.get("name") for c in contracts}
            zone_name = znames.get(zone)
            zone_link = ('<p class="br-crumb"><a href="/butler-routes/#/zone/'
                         + zone + '">&larr; ' + zone_name + "</a></p>")
        else:
            zone_link = ('<p class="br-crumb"><a href="/butler-routes/#/docs">'
                         '&larr; Documentation index</a></p>')
        page = DOC_PAGE_TEMPLATE.replace("{{TITLE}}",
                                                 md_escape(meta["title"])) \
            .replace("{{ZONE_LINK}}", zone_link) \
            .replace("{{BODY}}", meta["body"]) \
            .replace("{{STAMP}}", stamp_txt) \
            .replace("{{SOURCE}}", GITHUB_BLOB + "docs/" + meta["file"]) \
            .replace("{{CRUMB}}", ("Zone: " + zone_name) if zone_name
                     else "Pack document")
        dest = os.path.join(out_base, meta["slug"], "index.html")
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as fh:
            fh.write(page)
    for meta in metas:
        del meta["body"]
    return metas, len(metas), total_fallbacks


DOC_PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}} — Butler Routes docs — York Develops</title>
  <meta name="description" content="{{TITLE}}: pack paperwork for the Butler Routes - Completionist guide pack.">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/butler-routes/styles.css">
  <script src="/js/site-chrome.js"></script>
  <script src="/js/main.js"></script>
</head>
<body>

  <!-- Navigation -->
  <div id="site-nav"></div>

  <main>
    <div class="page-header">
      <div class="container">
        <div class="page-header__content">
          <p class="page-header__eyebrow">// docs / {{CRUMB}}</p>
          <h1 class="page-header__title">{{TITLE}}</h1>
        </div>
      </div>
    </div>

    <div class="container">
      {{ZONE_LINK}}
      <div class="card br-doc">
      {{BODY}}
      </div>
      <p class="br-stamp">{{STAMP}} &middot; <a href="{{SOURCE}}" target="_blank" rel="noopener">Source on GitHub &#x2197;</a></p>
    </div>
  </main>

  <div id="site-footer"></div>

</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--pack-url", default=PACK_URL)
    ap.add_argument("--pack-dir", default=None)
    ap.add_argument("--out", default=DEFAULT_OUT)
    args = ap.parse_args()

    tmp = None
    if args.pack_dir:
        pack_dir = args.pack_dir
    else:
        tmp = tempfile.mkdtemp(prefix="butler-routes-pack-")
        subprocess.run(["git", "clone", "--depth", "1", args.pack_url, tmp],
                       check=True)
        pack_dir = tmp
    docs_dir = os.path.join(pack_dir, "docs")

    commit = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"], cwd=pack_dir,
        capture_output=True, text=True, check=True).stdout.strip()
    full_commit = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=pack_dir,
        capture_output=True, text=True, check=True).stdout.strip()
    pack_date = subprocess.run(
        ["git", "log", "-1", "--format=%cs"], cwd=pack_dir,
        capture_output=True, text=True, check=True).stdout.strip()

    with open(os.path.join(pack_dir, "pack.json"), encoding="utf-8") as fh:
        pack = json.load(fh)
    with open(os.path.join(docs_dir, "quest-contracts.json"),
              encoding="utf-8") as fh:
        contracts_doc = json.load(fh)
    contracts = contracts_doc["zones"]

    guide_files = [f for f in os.listdir(pack_dir) if f.endswith(".guide")]

    status = parse_guide_status(docs_dir, contracts)

    npc_names, npc_name_stats = parse_inventory_npc_names(docs_dir)

    zones = []
    quests = []
    all_rares = []
    all_treasures = []
    all_recipes = []
    names_from_census = 0
    names_from_contracts = 0
    names_from_guide = 0
    step_name_sources = {"inventory": 0, "title": 0, "full": 0}
    skipped_steps = []
    rares_guide_steps = 0
    for c in contracts:
        cid = c["id"]
        gz = extract_zone_guides(pack_dir, cid)
        core = gz["core"]
        header = core["header"] if core else {}
        census, census_file = parse_census_names(docs_dir, cid)
        journeys = build_quest_journeys(core)
        faction = header.get("faction")
        if not faction and gz["rares"]:
            faction = gz["rares"]["header"].get("faction")
        zones.append({
            "id": cid,
            "name": c.get("name") or header.get("zone") or cid,
            "faction": faction,
            "band": header.get("levels") or c.get("levelBand"),
            "questCount": len(c["quests"]),
            "guides": {"core": core is not None,
                       "rares": gz["rares"] is not None,
                       "recipes": gz["recipes"] is not None},
            "status": status.get(cid, {"done": 0, "total": 0,
                                       "label": "Planned"}),
            "steps": ([{"title": s["title"], "goals": s["goals"]}
                       for s in core["steps"]] if core else []),
            "companionSteps": {
                "rares": ([{"title": s["title"], "goals": s["goals"]}
                           for s in gz["rares"]["steps"]]
                          if gz["rares"] else []),
                "recipes": ([{"title": s["title"], "goals": s["goals"]}
                             for s in gz["recipes"]["steps"]]
                            if gz["recipes"] else []),
            },
        })
        for q in c["quests"]:
            qid = q["id"]
            j = journeys.get(qid, {"accept": None, "objectives": [],
                                   "turnin": None, "gates": []})
            name = None
            level = min_level = None
            source = None
            if qid in census and census[qid].get("name"):
                name = census[qid]["name"]
                level = census[qid]["level"]
                min_level = census[qid]["minLevel"]
                source = "census"
                names_from_census += 1
            elif q.get("name"):
                name = q["name"]
                source = "contract"
                names_from_contracts += 1
            if name is None and j["accept"]:
                gname = guide_rest_name(j["accept"]["rest"])
                if gname:
                    name = gname
                    source = "guide"
                    names_from_guide += 1
            quests.append({
                "id": qid, "zone": cid, "name": name,
                "level": level, "minLevel": min_level,
                "nameSource": source,
                "gates": j["gates"],
                "accept": j["accept"], "objectives": j["objectives"],
                "turnin": j["turnin"],
                "acceptOnly": j["accept"] is not None and
                j["turnin"] is None,
            })
        rr, tt, nsrc, skip = parse_rares(gz["rares"], cid, npc_names)
        all_rares.extend(rr)
        all_treasures.extend(tt)
        for k in step_name_sources:
            step_name_sources[k] += nsrc[k]
        skipped_steps.extend(skip)
        if gz["rares"]:
            rares_guide_steps += len(gz["rares"]["steps"])
        all_recipes.extend(parse_recipes(gz["recipes"], cid))

    kill_ids = set()
    kill_goals = 0
    for z in zones:
        step_lists = [z["steps"], z["companionSteps"].get("rares", []),
                      z["companionSteps"].get("recipes", [])]
        for steps in step_lists:
            for s in steps:
                for g in s["goals"]:
                    if g["cmd"] != "kill":
                        continue
                    m = re.match(r"(\d+)", g["args"].strip())
                    if m:
                        kill_ids.add(int(m.group(1)))
                        kill_goals += 1

    contracted_ids = {q["id"] for c in contracts for q in c["quests"]}

    app_dir = os.path.dirname(os.path.dirname(os.path.abspath(args.out)))
    stamp_txt = ("Pack data: v" + str(pack.get("version")) + " \u00b7 "
                 + commit)
    docs_meta, docs_published, docs_fallbacks = publish_docs(
        pack_dir, app_dir, contracts, stamp_txt)

    data = {
        "generatedFrom": {"packVersion": pack.get("version"),
                          "commit": commit, "fullCommit": full_commit,
                          "packDate": pack_date,
                          "source": "cyork95/butler-routes-completionist"
                          " master (public pack repo)"},
        "pack": {"title": pack.get("title"),
                 "author": pack.get("author"),
                 "license": pack.get("license")},
        "totals": {"packVersion": pack.get("version"),
                   "contracts": len(contracts),
                   "contractedQuests": sum(len(c["quests"])
                                           for c in contracts),
                   "guides": len(guide_files)},
        "zones": zones,
        "quests": quests,
        "rares": all_rares,
        "treasures": all_treasures,
        "npcNames": {str(k): v for k, v in npc_names.items()},
        "recipes": all_recipes,
        "docs": docs_meta,
        "coverage": {
            "contractedQuests": len(contracted_ids),
            "questNamesFromCensus": names_from_census,
            "questNamesFromContracts": names_from_contracts,
            "questNamesFromGuide": names_from_guide,
            "questNamesMissing": len(
                {q["id"] for q in quests if not q["name"]}),
            "raresParsed": len(all_rares),
            "treasuresParsed": len(all_treasures),
            "stepNamesFromInventory": step_name_sources["inventory"],
            "stepNamesFromTitle": step_name_sources["title"],
            "stepNamesFromFull": step_name_sources["full"],
            "raresGuideSteps": rares_guide_steps,
            "stepsWithoutRecord": skipped_steps,
            "npcNameMapSize": len(npc_names),
            "npcNameMapStats": npc_name_stats,
            "killGoals": kill_goals,
            "killNpcDistinct": len(kill_ids),
            "killNpcNamed": sum(1 for k in kill_ids if k in npc_names),
            "recipesParsed": len(all_recipes),
            "raresWithSignatureDrop": sum(
                1 for r in all_rares if r["signatureDrops"]),
            "recipesFromVendor": sum(
                1 for r in all_recipes
                if r["source"].get("type") == "vendor"),
            "recipesFromDrop": sum(
                1 for r in all_recipes
                if r["source"].get("type") == "drop"),
            "zonesWithCoreGuide": sum(1 for z in zones
                                      if z["guides"]["core"]),
            "zonesWithRaresGuide": sum(1 for z in zones
                                       if z["guides"]["rares"]),
            "zonesWithRecipesGuide": sum(1 for z in zones
                                         if z["guides"]["recipes"]),
        },
    }

    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))
    print("wrote %s" % args.out)
    print("pack v%s @ %s (%s)" % (pack.get("version"), commit, pack_date))
    print(json.dumps(data["totals"], indent=1))
    print(json.dumps(data["coverage"], indent=1))
    print("docs published: %d, renderer fallbacks: %d"
          % (docs_published, docs_fallbacks))
    for meta in docs_meta:
        if meta["fallbacks"]:
            print("  fallback in %s: %d" % (meta["file"],
                                            meta["fallbacks"]))


if __name__ == "__main__":
    sys.exit(main())
