#!/usr/bin/env python3
"""New replaces old (0.9.5): delete old 1-1's builder and Matt's Old 1-1 / Rolls picker; 1-1 is gen2, always.
Run from the repo root on the merged candidate:  python3 -I reference/qa-reports/0.9.5/old11-delete.py
Every edit asserts its anchor is there exactly once, so a file that changed fails loudly instead of being half-edited. Rolls A/B/C stay as
QA seed pins (set only by tests and stage.ts --roll in a QA build; every pick is gen2), as the lead approved (11-06, 4:31 PM ET).
Afterwards: tsc, then grep for 'old' picks:  grep -rn "pick11() !== 'old'\\|skip11Spec\\|pickerOn\\|wm-pick11\\|Old 1-1" src  (must be empty).
"""
import sys

def load(p): return open(p, encoding='utf-8').read()
def save(p, s): open(p, 'w', encoding='utf-8').write(s)
def once(s, old, new, p):
    n = s.count(old)
    if n != 1: sys.exit(f'FAIL {p}: expected 1 of {old[:80]!r}, found {n}')
    return s.replace(old, new)
def cut(s, start, end_incl, p):
    if s.count(start) != 1: sys.exit(f'FAIL {p}: start {start[:80]!r} found {s.count(start)} times')
    a = s.index(start); b = s.find(end_incl, a)
    if b < 0: sys.exit(f'FAIL {p}: end {end_incl[:80]!r} not after start')
    return s[:a] + s[b + len(end_incl):]

# 1. WorldMap: the picker row and its import
p = 'src/components/WorldMap.tsx'; s = load(p)
s = cut(s, "            {pickedOpen && picked.id === '1-1' && pickerOn() && (", "              </div>\n            )}\n", p)
s = once(s, "import { newPlay11, pickerOn, setPick11 } from '../game/testlink1_1.ts';", "import { newPlay11, setPick11 } from '../game/testlink1_1.ts';", p)
save(p, s)

# 2. worldMap.css: the picker's comment and every .wm-pick11 rule
p = 'src/components/nav/worldMap.css'; s = load(p)
lines = s.split('\n')
keep = [l for l in lines if 'wm-pick11' not in l and not l.startswith("/* the test link's 1-1 picker")]
if len(lines) - len(keep) < 4: sys.exit(f'FAIL {p}: expected the picker comment and 4+ rules, removed {len(lines) - len(keep)}')
save(p, '\n'.join(keep))

# 3. protoStage.ts: old 1-1's builder block, and skip11Spec (1-5's keep-out stays)
p = 'src/game/protoStage.ts'; s = load(p)
s = cut(s, "  // TEST-LINK ONLY, REMOVE BEFORE ANY RELEASE (new replaces old; the lead, 11-05).", "      homeRun();\n    });\n  }\n", p)
s = once(s, "import { skip11Spec } from './testlink1_1.ts';\n", "", p)
s = once(s, "/** a stage's mixer spec, except 1-1 on the test link's 'Old 1-1' pick (testlink1_1.ts: main's builder as it is) */\n",
         "/** a stage's mixer spec (mixer/stages.ts) */\n", p)
s = once(s, "(skip11Spec(id) || id === '1-5' ? undefined", "(id === '1-5' ? undefined", p)
save(p, s)

# 4. stageGenerator.ts: 1-1 is gen2 always; skip11Spec gone; builtOnGen2 the same
p = 'src/game/stageGenerator.ts'; s = load(p)
s = once(s, "import { pick11, play11Seed, roll11Seed, skip11Spec, withPlaySeed } from './testlink1_1.ts';",
         "import { pick11, play11Seed, roll11Seed, withPlaySeed } from './testlink1_1.ts';", p)
s = once(s, "  // (1-1's Play is gen2 from the proven list: only Matt's Old 1-1 pick takes the hand-built path)\n  const gen2Roll11 = config.id === '1-1' && !config.secret && pick11() !== 'old';",
         "  // (1-1 is gen2 from the proven list, always: old 1-1's builder is deleted, new replaces old, 0.9.5)\n  const gen2Roll11 = config.id === '1-1' && !config.secret;", p)
s = once(s, "!skip11Spec(config.id) && ", "", p)
s = once(s, " * which rolls on gen2 from the proven list unless Matt's Old 1-1 pick is on (the same test buildStage makes, gen2Roll11).",
         " * which rolls on gen2 from the proven list, always (the same test buildStage makes, gen2Roll11).", p)
s = once(s, "  return isGen2Stage(config) || (config.id === '1-1' && !config.secret && pick11() !== 'old');",
         "  return isGen2Stage(config) || (config.id === '1-1' && !config.secret);", p)
save(p, s)

# 5. testlink1_1.ts: the 'old' pick, skip11Spec and pickerOn
p = 'src/game/testlink1_1.ts'; s = load(p)
a = s.index("/**\n * How 1-1 is built."); b = s.index(" */\n", a) + 4
s = s[:a] + """/**
 * How 1-1 is built: gen2 1-1 from the proven-seed list, always (old 1-1's builder and Matt's Old 1-1 / Rolls picker are deleted: new
 * replaces old, 0.9.5).
 *   - 'play': the card's own Play button, a fresh proven seed each press (every build);
 *   - 'A' | 'B' | 'C': QA measuring only (a QA build, set by the tests and stage.ts --roll, never a button): gen2 1-1 on the seed from
 *     testlink1_1.json, so a check measures a named roll. Not a switch between builders: every pick is gen2.
 */
""" + s[b:]
s = once(s, "export type Pick11 = 'play' | 'old' | 'A' | 'B' | 'C';", "export type Pick11 = 'play' | 'A' | 'B' | 'C';", p)
s = once(s, "/** whether 1-1's mixer spec is skipped (the old builder) */\nexport const skip11Spec = (id: string): boolean => id === '1-1' && pick11() === 'old';\n", "", p)
s = s.replace("/** set the pick ('play': the card's own Play button; the others only from Matt's picker in a QA build) */",
              "/** set the pick ('play': the card's own Play button; A/B/C only from the tests and tools, in a QA build) */")
a = s.index("/** Matt's picker (Old 1-1, Rolls A/B/C) shows only")
b = s.index("\n}\n", a) + 3
s = s[:a] + s[b:].lstrip('\n')
save(p, s)
print('old11-delete: done (5 files)')
