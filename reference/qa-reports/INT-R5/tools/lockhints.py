#!/usr/bin/env python3
# INT-R5c: lockall's --intended is per STAGE; this judges the PARTS. Every moved stage in HINTS (WARN-412's 22 + TEACH-11's 18, the
# union) must have moved ONLY proto.hints; 2-7 and 1-4 may move anything (the new level, the fill); any other moved stage is a FAIL
# (lockall itself already exits 1 on it). Prints each moved stage and its parts, so the gate table names every move.
#   python3 lockhints.py <g-lockall.log>
import re, sys

WARN412 = '1-1 1-2 1-7 1-8 1-9 2-1 2-2 2-4 2-5 6-1 6-2 6-3 6-5 6-6 6-7 6-9 7-1 7-3 7-5 7-6 7-7 7-9'.split()
TEACH11 = '1-1 5-9 6-2 6-4 6-5 6-6 6-9 7-1 7-3 7-5 7-7 7-9 8-1 8-2 8-5 8-6 8-8 8-9'.split()
HINTS = sorted(set(WARN412) | set(TEACH11))
FREE = {'2-7', '1-4'}

moved = {}
for line in open(sys.argv[1]):
    m = re.match(r'^\s+(\d+-\d+)(?: \(intended\))?: (.+)$', line.rstrip('\n'))
    if m:
        moved.setdefault(m.group(1), set()).update(p.strip() for p in m.group(2).split(','))
bad = []
for s in sorted(moved, key=lambda k: tuple(int(x) for x in k.split('-'))):
    parts = sorted(moved[s])
    if s in FREE:
        why = 'free (the new level / the fill)'
    elif s in HINTS:
        ok = parts == ['proto.hints']
        why = ('hint-only, ' + ('WARN-412' if s in WARN412 else '') + ('+' if s in WARN412 and s in TEACH11 else '')
               + ('TEACH-11' if s in TEACH11 else '')) if ok else 'NOT hint-only'
        if not ok: bad.append(s)
    else:
        why = 'NOT intended'
        bad.append(s)
    print(f'{s}: {", ".join(parts)}  [{why}]')
print(f'moved {len(moved)} stages; hint list {len(HINTS)}; bad {len(bad)}: {" ".join(bad) or "none"}')
sys.exit(1 if bad else 0)
