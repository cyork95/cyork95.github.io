# Butler Routes data pipeline

`generate-pack-data.py` reads the public pack repo
`cyork95/butler-routes-completionist` (master) and emits the ONE static file
the app loads: `butler-routes/data/pack-data.json`.

It uses only the pack repo's own files — `pack.json`,
`docs/quest-contracts.json`, `docs/*-census.md`, `docs/guide-status.md`,
and the `*.guide` files. Quest names resolve census first, then the
contract entry, then the accept line's own `-- Name - NPC` rest text; a quest
with no parsed name ships as `"name": null` (never invented). Where a field
cannot be extracted the record ships without it.

## Re-running after a pack release

Regenerating the site's data is exactly this:

```bash
python butler-routes/tools/generate-pack-data.py
git add butler-routes/data/pack-data.json
git commit -m "Update Butler Routes pack data to vX.Y.Z"
```

The script clones the pack repo fresh to a temp dir by default. To reuse a
local clone instead:

```bash
python butler-routes/tools/generate-pack-data.py --pack-dir /path/to/butler-routes-completionist
```

Requires: python3 (stdlib only) + git on PATH (only when cloning).

## What the data file records

- `generatedFrom`: pack version (`pack.json`), short + full commit, pack
  date — the page renders this as
  "Pack data: vX.Y.Z · short-commit".
- `totals`: pack version, contract count, contracted quest count, guide
  file count.
- `zones`: one record per contract — id, display name, faction and level
  band (core guide header), quest count, which guides exist
  (core / rares / recipes), build status from `docs/guide-status.md` ticks,
  and the core guide's ordered steps with raw goals.
- `quests`: one record per contracted quest id — zone, name/level/minLevel
  where the census carries them, and the journey through the core guide:
  accept step + coordinates, every objective occurrence in file order, and
  the turn-in step + coordinates. `acceptOnly: true` where the data has no
  turn-in (the contracts' documented gaps are data, not errors).
- `rares`: name, zone, level, spawn points, loop flag, signature-drop
  collects, and the companion step title.
- `recipes`: name, item id, profession (from the companion step title),
  zone, and source — `{type: vendor, npcId, ...}` or `{type: drop, ...}` —
  as the recipes guide states it.
- `coverage`: honest extraction counts (names by source, rares/recipes
  parsed, guides matched per kind).
