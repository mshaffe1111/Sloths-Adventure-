"""Game-speed preview GIF of every move of a packed creature sheet (2026-10-29): frames placed by their anchors on one canvas per move,
8 fps, on the dark night ground, moves one after another (loops played twice).
    python3 -I tools/art/hfbatch/gif.py <creature json> <out.gif> [scale 0.4]
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

J = Path(sys.argv[1]); OUT = sys.argv[2]; K = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
d = json.loads(J.read_text())
sheets = [Image.open(J.parent / s).convert('RGBA') for s in d['sheets']]
fs = {n: (sheets[f.get('s', 0)].crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])), f['ax'], f['ay']) for n, f in d['frames'].items()}
L = max(ax for _, ax, _ in fs.values()); T = max(ay for _, _, ay in fs.values())
R = max(im.width - ax for im, ax, _ in fs.values()); B = max(im.height - ay for im, _, ay in fs.values())
W, H = int(L + R) + 8, int(T + B) + 24
out = []
for seq, names in d['seq'].items():
    reps = 2 if seq in d.get('loop', []) else 1
    for _ in range(reps):
        for n in names:
            im, ax, ay = fs[n]
            c = Image.new('RGBA', (W, H), (24, 26, 40, 255))
            c.alpha_composite(im, (int(round(4 + L - ax)), int(round(20 + T - ay))))
            ImageDraw.Draw(c).text((4, 4), seq, fill=(255, 255, 0, 255))
            out.append(c.convert('RGB').resize((round(W * K), round(H * K)), Image.LANCZOS))
out[0].save(OUT, save_all=True, append_images=out[1:], duration=125, loop=0, optimize=True)
print(OUT, len(out), Path(OUT).stat().st_size)
