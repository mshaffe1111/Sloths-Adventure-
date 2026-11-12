#!/usr/bin/env python3
# W1C: put the TEST-SIDE 1-3 roll (tools/engine/library13.ts) into a WORKTREE's page, so it can be looked at and played in the real
# game before 1-3's kit ships (engine-core.md 0f's recipe, as a script). NEVER run it on the work branch's own checkout: it edits
# src/game/stageGenerator.ts and adds two files under src/game/gen2/. Nothing it writes is ever committed.
#   git worktree add --detach .claude/worktrees/stills HEAD && ln -s ../../../node_modules .claude/worktrees/stills/node_modules
#   python3 tools/engine/runs/page13.py .claude/worktrees/stills      then, in the worktree:  npx vite --port 5199 --strictPort
# The page then builds 1-3 from kitLib13({ flown: true }) on the seed in `window.__SEED13` (default 1; trap-stills.mjs sets it with
# PAGE_SETUP='window.__SEED13=2').
import re, sys, pathlib
wt = pathlib.Path(sys.argv[1]).resolve()
here = pathlib.Path(__file__).resolve().parents[3]
assert wt != here and (wt / 'src/game/stageGenerator.ts').exists(), 'give a worktree, never the work checkout'
def lib(name, out):
    s = (here / 'tools/engine' / name).read_text()
    s = s[:s.index("if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])")]
    s = s.replace("import '../../src/game/headlessDom.ts';\n", '').replace("import { fileURLToPath } from 'node:url';\n", '')
    s = s.replace("'../../src/game/gen2/", "'./").replace("'../../src/game/", "'../").replace("'./library.ts'", "'./lib12.ts'")
    (wt / 'src/game/gen2' / out).write_text(s)
lib('library.ts', 'lib12.ts'); lib('library13.ts', 'lib13.ts')
p = wt / 'src/game/stageGenerator.ts'
s = p.read_text()
if 'lib13.ts' not in s:
    a = "export function generateStage(config: LevelConfig, difficulty: Difficulty = 'normal'): GeneratedStage {\n"
    assert a in s
    s = s.replace(a, a + "  // PAGE13 (never committed): 1-3 as the test-side roll\n  if (config.id === '1-3' && !config.secret) return w1Finish(buildGen2Stage({ config: config13({ flown: true }) as never, kit: kitLib13({ flown: true }), seed: (globalThis as { __SEED13?: number }).__SEED13 ?? 1, difficulty }) as never) as GeneratedStage;\n", 1)
    s = "import { config13, kitLib13 } from './gen2/lib13.ts';\nimport { buildGen2Stage } from './gen2/pipeline.ts';\n" + s
    p.write_text(s)
print('page13: the worktree at', wt, 'builds 1-3 from library13 (flown)')
