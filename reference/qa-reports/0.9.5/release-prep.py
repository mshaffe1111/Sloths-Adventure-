#!/usr/bin/env python3
"""0.9.5 release prep, after engine-core's final is merged and old11-delete.py has run. From the repo root:
    python3 -I reference/qa-reports/0.9.5/release-prep.py
1. funcheck's known list: tools/validate/funknown.json <- the list recorded from main 68b31e66 (R-165.44; funknown-main.json here,
   recorded 11-06 2:53 PM ET with FUNCHECK_WRITE=1 on main + engine-core's tools/validate, PASS 144 known twice).
2. roadmapcheck: R-165.1 cites qa-reports/engine-core/NEXT.md (engine-core's own notes), if no item cites it yet.
3. package.json 0.9.4 -> 0.9.5 and the What's New top entry (the lead approved 11-06 3:31 PM; line 3 his to change after Matt plays).
Every edit asserts its anchor; a changed file fails loudly.
"""
import json, re, shutil, sys
def die(m): sys.exit('FAIL ' + m)

shutil.copyfile('reference/qa-reports/0.9.5/funknown-main.json', 'tools/validate/funknown.json')

p = 'reference/ROADMAP.md'; s = open(p, encoding='utf-8').read()
if 'engine-core/NEXT.md' not in s:
    lines = s.split('\n'); hit = [i for i, l in enumerate(lines) if l.startswith('| R-165.1 |')]
    if len(hit) != 1: die(f'{p}: R-165.1 row found {len(hit)} times')
    l = lines[hit[0]].rstrip()
    if not l.endswith(' |'): die(f'{p}: R-165.1 row does not end in a cell')
    lines[hit[0]] = l[:-2] + '; its notes reference/qa-reports/engine-core/NEXT.md |'
    open(p, 'w', encoding='utf-8').write('\n'.join(lines))

p = 'package.json'; s = open(p, encoding='utf-8').read()
if s.count('"version": "0.9.4"') != 1: die(f'{p}: "version": "0.9.4" not found once')
open(p, 'w', encoding='utf-8').write(s.replace('"version": "0.9.4"', '"version": "0.9.5"'))

p = 'src/game/whatsNew.ts'; s = open(p, encoding='utf-8').read()
anchor = "export const WHATS_NEW: Release[] = [\n"
if s.count(anchor) != 1: die(f'{p}: list start not found once')
if "version: '0.9.5'" in s: die(f'{p}: 0.9.5 already there')
entry = """  {
    version: '0.9.5',
    date: '2026-11-06',
    title: 'A brand-new first stage',
    items: [
      'Into the Canopy, the very first stage, is built all over again.',
      'It’s laid out a little differently every time you play.',
      'Dot has new things to say as you climb.',
    ],
  },
"""
open(p, 'w', encoding='utf-8').write(s.replace(anchor, anchor + entry))
print("release-prep: done (funknown, roadmap, version 0.9.5, What's New)")
