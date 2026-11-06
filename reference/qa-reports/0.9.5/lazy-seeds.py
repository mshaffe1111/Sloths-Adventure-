#!/usr/bin/env python3
"""Contingency (0.9.5 bundle headroom), ONLY if the candidate's main JS is over 4 MiB (the lead, 11-06 5:01 PM ET): gen2's curated rolls
(gen2/seeds.ts) and proven seeds (gen2/provenSeeds.ts) load as their own chunk at start-up, by a top-level await, before any stage is
built. Measured 11-06 on engine-core 5e221f9d: main JS 4,168,556 -> 3,892,798 B; first frame of 1-1 at CPU x4 unchanged (11.9 -> 11.5 s
median of 3); gen2 seeds/game/seedList/buildAhead/stage11gen2 tests 0 fail. Run from the repo root: python3 -I reference/qa-reports/0.9.5/lazy-seeds.py
"""
import sys
def edit(p, old, new):
    s = open(p, encoding='utf-8').read()
    if s.count(old) != 1: sys.exit(f'FAIL {p}: expected 1 of {old!r}, found {s.count(old)}')
    open(p, 'w', encoding='utf-8').write(s.replace(old, new))
edit('src/game/gen2/game.ts', "import { GEN2_SEEDS, type Gen2Seed } from './seeds.ts';\n", """import type { Gen2Seed } from './seeds.ts';
// (the curated rolls are data, about 220 KB: their own chunk, loaded while the app starts and before any stage is built, so the main
// bundle stays under the 4 MiB per-file cache limit; a top-level await, so every reader below sees it loaded: 0.9.5 bundle headroom)
const { GEN2_SEEDS } = await import('./seeds.ts');
""")
edit('src/game/gen2/seedList.ts', "import { PROVEN_SEEDS } from './provenSeeds.ts';\n", """// (the proven seeds and their packed plans are data: their own chunk, loaded at start-up before any stage is built, with the curated
// rolls (game.ts); a top-level await, so provenSeeds()/provenPlan() always see it)
const { PROVEN_SEEDS } = await import('./provenSeeds.ts');
""")
print('lazy-seeds: done (2 files)')
