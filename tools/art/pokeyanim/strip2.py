"""One before/after strip from two rec.mjs runs: frames cropped round Pokey, before above, after below (pokey-anim QA).

    python3 -I tools/art/pokeyanim/strip2.py <rec dir> <scene ('' for the moves)> <side|up> <first> <last> <step> <out.jpg> "<label>" [half css px] [dy css px]
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

rec, scene, ori, a, b, step, out, label = sys.argv[1:9]
half = float(sys.argv[9]) if len(sys.argv) > 9 else 55
dy = float(sys.argv[10]) if len(sys.argv) > 10 else 40
rec = Path(rec)
zoom = {'side': 0.7222222, 'up': 0.9377778}[ori]
tag = f'-{scene}' if scene else ''
frames = list(range(int(a), int(b) + 1, int(step)))
D, C = 2, 220
s = Image.new('RGB', (len(frames) * C, 2 * C + 30), (30, 30, 30))
d = ImageDraw.Draw(s)
for r, t in enumerate(('before', 'after')):
    cam = json.loads((rec / f'{t}{tag}-{ori}-cam.json').read_text())
    for k, i in enumerate(frames):
        x, y, cx, cy = cam[i][0], cam[i][1], cam[i][6], cam[i][7]
        sx, sy = (x - cx) * zoom, (y - cy - dy) * zoom
        im = Image.open(rec / f'{t}{tag}-{ori}-frames' / f'f{i:05d}.png')
        im = im.crop((int((sx - half) * D), int((sy - half) * D), int((sx + half) * D), int((sy + half) * D)))
        s.paste(im.resize((C, C)), (k * C, 15 + r * (C + 15)))
    d.text((4, r * (C + 15) + 2), ('BEFORE ' if r == 0 else 'AFTER ') + f'{label}, {ori}, frames {a}-{b} every {step} (30 fps)', fill=(255, 255, 0))
s.save(out, quality=85)
