"""Refresh reference/art/catalog-rows-w1traps.csv from the atlas as packed (ART-W1B, 2026-11-12): each row's frame, size and file kb
from src/game/w1TrapsData.ts; changed pieces re-sourced; rows for the new pieces (second sapling, shimmy tree) appended.
    python3 -I tools/art/w1traps/rows.py
"""
import csv, io, json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
CSV = ROOT / 'reference/art/catalog-rows-w1traps.csv'
ts = (ROOT / 'src/game/w1TrapsData.ts').read_text()
F = json.loads(re.search(r'W1_TRAP_FRAMES = (\{.*?\n\}) as const', ts, re.S).group(1))
picks = json.loads((ROOT / 'tools/art/w1traps/picks.json').read_text())
atlas = Image.open(ROOT / 'src/assets/props/w1-traps.webp')
B = 'ART-W1B Hugging Face 2026-11-12'
NEW = {  # id: (source, kind, made_thing, status, notes)
    'tendril': (f'{B} (r4 rootSet-5)', 'tendril handle, set (knotted round a living root)', 'n', None, 'the tendril handle, set: taut, knotted round a living root on its earth mound (no stake: World 1 has no made things)'),
    'stake': (f'{B} (r4 rootCut-17)', 'tendril handle, cut (snapped living root, knot and curl)', 'n', None, 'the tendril handle, cut: a living root arching from the earth, snapped (a natural break, no saw cut), the knot and the torn curl on it'),
    'stoneHang': (f'ART-W1 Hugging Face 2026-11-12 (r1 stoneHang-17, A; re-cut ART-W1B)', None, 'n', None, 'stone A: the mossy stone with vines wrapped round it, hanging (the knotted net B is out)'),
    'stoneDown': (f'ART-W1 Hugging Face 2026-11-12 (r3 stoneDown-down-stoneHang-17-s42-31, A)', None, 'n', None, 'the same stone A landed, its vines slack'),
    'hiveHang': ('ART-W1 Hugging Face 2026-11-12 (r2 hiveHang-67, hive A)', 'hive A, hanging', 'n', None, "hive A: the painted hanging hive with its dark doorway (the lead's pick over Matt's sheet frame, which read as a brown cocoon at phone size)"),
    'hiveDown': ('ART-W1 Hugging Face 2026-11-12 (r3 hiveDown-down-hiveHang-67-s42-7, hive A)', 'hive A, landed whole on its side', 'n', None, 'hive A landed on its side, whole'),
}
STATUS = 'in game on t-w1-art2 (not merged)'
rows = list(csv.DictReader(open(CSV)))
cols = list(rows[0].keys())
by = {r['id'].split('#')[1]: r for r in rows}


def kb(n):
    f = F[n]
    b = io.BytesIO(); atlas.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])).save(b, 'WEBP', quality=90, method=6)
    return round(len(b.getvalue()) / 1024, 1)


for n, base in (('sapling2', 'sapling'), ('trunk', 'sapling')):
    if n not in by:
        r = dict(by[base]); r['id'] = f'w1-traps#{n}'; rows.append(r); by[n] = r
by['sapling2'].update(source=f'{B} (r3b anchorArch-41)', kind='second bent sapling (behind the handle)',
                      engine_slot='cast trap second sapling (castArt.ts drawTraps, layoutTrap behind())',
                      notes="the vine's corner over the handle hangs from its crown (nothing floats)", made_thing='n')
by['trunk'].update(source=f'{B} (r3b anchorArm-41)', kind='living tree with a level arm (shimmy vine end)',
                   engine_slot="1-3's shimmy span: a tree each end, the vine tied at its arm (F13 wires it: ropeArt.ts)",
                   notes='World 1 has no rope or posts: a liana strung between two living trees', made_thing='n', used_in='1-3 (to wire)',
                   float_class='grounded')
for n, r in by.items():
    f = F[n]
    if n in NEW:
        src, kind, made, st, notes = NEW[n]
        r['source'] = src
        if kind: r['kind'] = kind
        r['made_thing'] = made; r['notes'] = notes
    r['file'] = f"src/assets/props/w1-traps.webp#{n} ({f['x']},{f['y']} {f['w']}x{f['h']})"
    r['w'], r['h'] = str(f['w']), str(f['h'])
    r['ship_px'] = f"{f['w']}x{f['h']}"
    u = f['units'] / (f['h'] if f['axis'] == 'h' else f['w'])
    r['on_screen_px'] = f"{round(f['w'] * u)}x{round(f['h'] * u)} (units)"
    r['file_kb'] = r['file_kb_ship'] = str(kb(n))
    r['status'] = STATUS
with open(CSV, 'w', newline='') as fh:
    w = csv.DictWriter(fh, cols); w.writeheader(); w.writerows(rows)
print(len(rows), 'rows')
