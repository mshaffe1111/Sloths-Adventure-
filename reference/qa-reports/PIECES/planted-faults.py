#!/usr/bin/env python3
"""PIECES: every rule's test is proven by a planted fault (level.md rule 12). Each row breaks one line of the code, runs the test that
should catch it, and puts the line back. All must print CAUGHT.   python3 reference/qa-reports/PIECES/planted-faults.py [name-filter]"""
import subprocess, sys

FAULTS = [
    # (name, file, the line as it is, the line broken, the test that must go red)
    ('still: a scare run is clipped like any stretch', 'src/game/gen2/stillLay.ts', "    if (z.setback !== undefined) return [z];\n    const inside", "    const inside", 'src/game/gen2/stillLay.test.ts'),
    ('still: a stretch with no hide is kept', 'src/game/gen2/stillLay.ts', "    if (!inside.length) return [];", "    if (!inside.length) return [z];", 'src/game/gen2/stillLay.test.ts'),
    ('still: the stretch is not cut past its last hide', 'src/game/gen2/stillLay.ts', "inside.map((b) => b.x + b.w)) + past))", "inside.map((b) => b.x + b.w)) + past + 4000))", 'src/game/gen2/stillLay.test.ts'),
    ('still: the lesson calm is ignored', 'src/game/gen2/stillLay.ts', "  if (lesson) return [band.teach[0], band.teach[1]];", "", 'src/game/gen2/stillLay.test.ts'),
    ('still: a world\'s lead on the band is ignored', 'src/game/gen2/stillLay.ts', "stage + (band.lead ?? 0)", "stage", 'src/game/gen2/stillLay.test.ts'),
    ('still: a watcher reaches across a gap', 'src/game/gen2/stillLay.ts', "if (Math.abs(p.x - x1) <= 2 && p.x + p.width > x1)", "if (p.x + p.width > x1)", 'src/game/gen2/stillLay.test.ts'),
    ('still: own-bank sockets watch the whole run', 'src/game/gen2/stillLay.ts', "starts(f.socket, row.own) || scare", "scare", 'src/game/gen2/stillLay.test.ts'),
    ('still: a scare run gets no set-back', 'src/game/gen2/stillLay.ts', "...(scare ? { setback: R(run[0] + STILL.setback) } : {}),", "", 'src/game/gen2/stillLay.test.ts'),
    ('still: two watchers on one stretch make two zones', 'src/game/gen2/stillLay.ts', "      if (zones.some((q) => q.x0 < z.x1 && z.x0 < q.x1)) return;", "", 'src/game/gen2/stillLay.test.ts'),
    ('still: the hide is laid off its spot', 'src/game/gen2/stillLay.ts', "x: R(f.x - row.w / 2), w: row.w", "x: R(f.x), w: row.w", 'src/game/gen2/stillLay.test.ts'),
    ('still: the check misses open ground', 'src/game/gen2/stillLay.ts', "if (b - a > far + 1e-6)", "if (b - a > far + 1e9)", 'src/game/gen2/stillLay.test.ts'),
    ('still: the check misses a short calm', 'src/game/gen2/stillLay.ts', "if (z.calm[0] < rule.calmMin - 1e-6)", "if (z.calm[0] < -1)", 'src/game/gen2/stillLay.test.ts'),
    ('still: the check counts a secret bush as a hide', 'src/game/gen2/stillLay.ts', "(st.bushes ?? []).filter((b) => !b.secret)", "(st.bushes ?? []).filter(() => true)", 'src/game/gen2/stillLay.test.ts'),
    ('still: World 8 loses its scare sockets', 'src/game/gen2/worlds/w8.ts', "own: ['roostHere'], scare: ['batRun'] }", "own: ['roostHere'] }", 'src/game/gen2/stillLay.test.ts'),
]

def main():
    pick = sys.argv[1] if len(sys.argv) > 1 else ''
    missed = 0
    for name, path, old, new, test in FAULTS:
        if pick not in name:
            continue
        src = open(path).read()
        if src.count(old) != 1:
            print(f'STALE   {name}: the line is in {path} {src.count(old)} times'); missed += 1; continue
        open(path, 'w').write(src.replace(old, new))
        try:
            r = subprocess.run(['npx', 'tsx', '--test', test], capture_output=True, text=True)
        finally:
            open(path, 'w').write(src)
        caught = r.returncode != 0
        missed += 0 if caught else 1
        print(f"{'CAUGHT ' if caught else 'MISSED '} {name}")
    print('all CAUGHT' if not missed else f'{missed} NOT caught')
    sys.exit(1 if missed else 0)

main()
