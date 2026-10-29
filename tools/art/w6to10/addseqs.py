"""Fold re-run sequences (a cutpack.py group such as flicker2) into a group already cut (flicker), in the unpacked cut-in folder:
the re-run's sequences are added, or replace the ones of the same name, and every frame is shelf-packed again onto as few sheets as
fit 7000 px tall. Then run cutin.py as before.

    python3 -I tools/art/w6to10/addseqs.py <unpacked dir> <group> <re-run group>
"""
import json, sys
from pathlib import Path
from PIL import Image

D, A, B = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
ja, jb = json.loads((D / f'{A}.json').read_text()), json.loads((D / f'{B}.json').read_text())
assert ja['anchor'] == jb['anchor'] and ja.get('up') == jb.get('up') and ja.get('target') == jb.get('target'), 'the same scale and anchor'
sheets = {('a', i): Image.open(D / s['file']).convert('RGBA') for i, s in enumerate(ja['sheets'])}
sheets.update({('b', i): Image.open(D / s['file']).convert('RGBA') for i, s in enumerate(jb['sheets'])})
seq = {k: v for k, v in ja['seq'].items() if k not in jb['seq']}
seq.update({k: [f'{n}~' for n in v] for k, v in jb['seq'].items()})
src = {}
for k, v in seq.items():
    for n in v:
        f = jb['frames'][n[:-1]] if n.endswith('~') else ja['frames'][n]
        src[n] = (('b' if n.endswith('~') else 'a', f['s']), f)
# (names: the re-run's frames keep theirs, the old frames of a replaced sequence are dropped)
seq = {k: [n.rstrip('~') for n in v] for k, v in seq.items()}
src = {n.rstrip('~'): s for n, s in src.items()}
MAX_H, W = 7000, 2048
out, cur, x, y, row, frames = [], None, 0, 0, 0, {}
place = []
for n, (key, f) in src.items():
    if x + f['w'] > W:
        x, y, row = 0, y + row + 2, 0
    if y + f['h'] > MAX_H:
        out.append((place, y)); place, x, y, row = [], 0, 0, 0
    place.append((n, key, f, x, y))
    frames[n] = {'s': len(out), 'x': x, 'y': y, 'w': f['w'], 'h': f['h'], 'ax': f['ax'], 'ay': f['ay']}
    x, row = x + f['w'] + 2, max(row, f['h'])
out.append((place, y + row))
for old in ja['sheets']:
    (D / old['file']).unlink()
files = []
for k, (pl, h) in enumerate(out):
    pic = Image.new('RGBA', (W, max(1, max(py + f['h'] for _, _, f, _, py in pl))))
    for n, key, f, px, py in pl:
        pic.paste(sheets[key].crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])), (px, py))
    fn = f'{A}-anim{"" if len(out) == 1 else "-" + str(k)}.webp'
    q = 88
    while True:
        pic.save(D / fn, 'WEBP', quality=q, method=6)
        if (D / fn).stat().st_size < 3.9e6 or q <= 60:
            break
        q -= 6
    files.append({'file': fn, 'w': W, 'h': pic.height})
ja.update(sheets=files, seq=seq, frames=frames, source={**ja['source'], **jb['source']})
(D / f'{A}.json').write_text(json.dumps(ja))
print(A, '+', B, [(f['file'], f['h'], (D / f['file']).stat().st_size) for f in files], list(seq))
