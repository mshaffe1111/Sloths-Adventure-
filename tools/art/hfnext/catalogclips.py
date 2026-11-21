"""ART-NEXT-d (R-165.354, R-165.370): keep the master catalog's per-frame rows of Pokey's idle clips equal to the sheets that ship.
A clip re-baked by bridgebake.py changes its frame count, box and anchor; its rows (B4:hero/clips/<clip>#<clip>.<k>) are rebuilt from
its own frame-0 row as the template (id, file, w, h, footing, engine_slot, draw_cost, file_kb from the sheet), and a clip that left
the game (--drop) loses its rows. Then run `python3 tools/art/catalog_master.py --emit` for the engine copy.
    python3 -I tools/art/hfnext/catalogclips.py idle-yawn,look-around,wave,belly-scratch [--drop doze]
"""
import csv, io, json, os, re, subprocess, sys

CSV = 'reference/art/CATALOG-MASTER.csv'
clips = sys.argv[1].split(',')
drop = sys.argv[sys.argv.index('--drop') + 1].split(',') if '--drop' in sys.argv else []
CL = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {HERO_CLIPS} from './src/game/heroClipsData.ts'; console.log(JSON.stringify(HERO_CLIPS))"],
                               capture_output=True, text=True, check=True).stdout)
text = open(CSV, newline='').read()
rd = csv.DictReader(io.StringIO(text)); cols = rd.fieldnames; rows = list(rd)
mine = lambda r, c: r['id'].startswith(f'B4:hero/clips/{c}#{c}.')
out, done = [], set()
for r in rows:
    c = next((c for c in clips + drop if mine(r, c)), None)
    if c is None:
        out.append(r); continue
    if c in drop or c in done:
        continue                                   # dropped, or this clip's rows were already written at its first row
    done.add(c); e = CL[c]; kb = os.path.getsize(f'src/assets/hero/clips/{c}.webp') / 1024
    ratio = float(r['file_kb_ship']) / float(r['file_kb']) if r['file_kb'] and r['file_kb_ship'] else None
    for k in range(e['n']):
        t = dict(r)
        t['id'] = f'B4:hero/clips/{c}#{c}.{k}'; t['file'] = f'src/assets/hero/clips/{c}.webp#{c}.{k}'
        t['w'], t['h'] = str(e['w']), str(e['h'])
        t['footing'] = f"anchor ax={e['ax']:g} ay={e['ay']:g} (from heroClipsData.ts)"
        t['engine_slot'] = re.sub(r'\[[^\]]*\]$', f'[{c}.{k}]', r['engine_slot'])
        t['draw_cost'] = re.sub(r'of \d+ frames', f"of {e['n']} frames", r['draw_cost'])
        t['file_kb'] = f'{kb / e["n"]:.1f}'
        if ratio is not None: t['file_kb_ship'] = f'{kb / e["n"] * ratio:.1f}'
        out.append(t)
missing = [c for c in clips if c not in done]
assert not missing, f'no rows found for {missing}'
lt = '\r\n' if '\r\n' in text[:2000] else '\n'
buf = io.StringIO(); w = csv.DictWriter(buf, fieldnames=cols, lineterminator=lt); w.writeheader(); w.writerows(out)
open(CSV, 'w', newline='').write(buf.getvalue())
print({c: CL[c]['n'] for c in clips}, 'dropped', drop, 'rows', len(rows), '->', len(out))
