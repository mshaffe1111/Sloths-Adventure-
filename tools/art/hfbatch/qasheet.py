"""QA contact sheet of a packed creature sheet (2026-10-29), read back from the game files exactly as the game would: every frame of
every move placed by its anchor on one fixed canvas per move (a red cross marks the anchor, so a jumping anchor shows), on a dark night
background; the last column of each row repeats the move's middle frame at game size (scale G) for the at-a-glance check.
    python3 -I tools/art/hfbatch/qasheet.py <creature json> <out.jpg> [tile scale 0.45] [game scale 0.3] [step 2]
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

J = Path(sys.argv[1]); OUT = sys.argv[2]
K = float(sys.argv[3]) if len(sys.argv) > 3 else 0.45
G = float(sys.argv[4]) if len(sys.argv) > 4 else 0.3
STEP = int(sys.argv[5]) if len(sys.argv) > 5 else 2
d = json.loads(J.read_text())
sheets = [Image.open(J.parent / s).convert('RGBA') for s in d['sheets']]


def fr(n):
    f = d['frames'][n]
    return sheets[f.get('s', 0)].crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])), f['ax'], f['ay']


BG = (24, 26, 40, 255)
rows = []
for seq, names in d['seq'].items():
    fs = [fr(n) for n in names]
    L = max(ax for _, ax, _ in fs); T = max(ay for _, _, ay in fs)
    R = max(im.width - ax for im, ax, _ in fs); B = max(im.height - ay for im, _, ay in fs)
    W, H = int(L + R) + 8, int(T + B) + 8
    tiles = []
    for i, (im, ax, ay) in enumerate(fs[::STEP]):
        c = Image.new('RGBA', (W, H), BG)
        c.alpha_composite(im, (int(round(4 + L - ax)), int(round(4 + T - ay))))
        dr = ImageDraw.Draw(c); x, y = 4 + L, 4 + T
        dr.line((x - 8, y, x + 8, y), fill=(255, 60, 60, 255), width=2); dr.line((x, y - 8, x, y + 8), fill=(255, 60, 60, 255), width=2)
        tiles.append(c.resize((max(1, round(W * K)), max(1, round(H * K))), Image.LANCZOS))
    im, _, _ = fs[len(fs) // 2]
    g = Image.new('RGBA', (round(W * K), round(H * K)), BG)
    gi = im.resize((max(1, round(im.width * G)), max(1, round(im.height * G))), Image.LANCZOS)
    g.alpha_composite(gi, ((g.width - gi.width) // 2, max(0, (g.height - gi.height) // 2)))
    ImageDraw.Draw(g).text((3, 3), f'game size x{G}', fill=(140, 200, 255))
    rows.append((f'{seq} ({len(names)} frames)', tiles + [g]))
cols = 7
lines = []
for label, tiles in rows:
    for k in range(0, len(tiles), cols):
        lines.append((label if k == 0 else '', tiles[k:k + cols]))
TW = max(t.width for _, ts in lines for t in ts); TH = max(t.height for _, ts in lines for t in ts)
S = Image.new('RGB', (cols * TW, sum(TH + 14 for _ in lines) + 20), (60, 60, 60))
dr = ImageDraw.Draw(S)
dr.text((4, 4), f'{J.name}  anchor: {d.get("anchor", "")}', fill=(255, 255, 255))
y = 20
for label, ts in lines:
    dr.text((4, y), label, fill=(255, 255, 0))
    for i, t in enumerate(ts):
        S.paste(t.convert('RGB'), (i * TW, y + 14))
    y += TH + 14
S.save(OUT, quality=86)
print(OUT, S.size)
