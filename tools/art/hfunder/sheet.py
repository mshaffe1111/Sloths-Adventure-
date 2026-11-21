"""ART-UNDER (11-21): one takes sheet per piece. Each take: the raw take (small), then at GAME size (a strip 512 x 128 world px tiled
twice, the corner 200 x 300) hanging from World 2's own soil fill, Pokey's drawn height (89 px, D41) standing under it, on a LIGHT (day)
and a DARK (dusk) ground. Numbers per take, printed and on the sheet:
  FRAME EDGE  paint on an edge that must be clear (a strip: bottom; the corner: right and bottom), over 1% = reject before the pick
  shade       the overhang's brightness (median of the band 10-50 px above the edge, clear of the rim line) over the top band's median: the order asks 0.55-0.65
  wrap        a strip's left-vs-right column difference (mean abs RGB over the soil rows) before any wrap fix
  top         the top band's mean RGB against the fill's (143,103,70)
    python3 -I tools/art/hfunder/sheet.py <takes dir> <piece> <out.jpg>
"""
import glob
import os
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

d, piece, out = sys.argv[1], sys.argv[2], sys.argv[3]
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
SHEET = Image.open(os.path.join(ROOT, 'src/assets/ground/w2.webp')).convert('RGB')
FILL = SHEET.crop((3, 3, 1021, 1021)).resize((600, 600), Image.LANCZOS)  # a fill tile at game size
LIGHT, DARK = (176, 204, 196), (52, 70, 78)
CORNER = piece == 'corner'
GW, GH = (200, 300) if CORNER else (512, 128)


def key(raw, tol=24):
    a = np.asarray(raw).astype(float)
    bg = np.median(a[-1], axis=0)
    near = np.abs(a - bg).max(axis=2) < tol
    lab, _ = nd.label(near)
    seeds = set(lab[-1][near[-1]].tolist())
    if CORNER:
        seeds |= set(lab[:, -1][near[:, -1]].tolist())
    bgm = np.isin(lab, list(seeds - {0}))
    alpha = np.where(bgm, 0, 255).astype(np.uint8)
    alpha = np.asarray(Image.fromarray(alpha).filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(0.8)))
    rgba = np.dstack([a.astype(np.uint8), alpha])
    return Image.fromarray(rgba, 'RGBA'), bgm, bg


def numbers(raw, bgm, bg):
    a = np.asarray(raw).astype(float)
    h, w = bgm.shape
    paint = lambda e: float((np.abs(e - bg).max(axis=1) > 26).mean())
    edges = {'bottom': paint(a[-1])}
    if CORNER:
        edges['right'] = paint(a[:, -1])
    solid = ~bgm
    # the edge: per column, the last solid row of the main body (ignore thin roots: a run of 6+ solid rows from the top)
    lum = a.mean(axis=2)
    top = np.median(lum[: int(0.3 * h)][solid[: int(0.3 * h)]])
    tops = a[: int(0.3 * h)][solid[: int(0.3 * h)]].mean(axis=0)
    cols = range(0, int(w * (0.7 if CORNER else 1.0)))
    over = []
    edge_rows = []
    for x in cols:
        c = solid[:, x]
        run = np.where(~c)[0]
        e = run[0] if len(run) else h
        edge_rows.append(e)
        if e > 60:
            over.append(np.median(lum[e - 50:e - 10, x]))
    shade = float(np.mean(over) / top) if over else 0.0
    wrap = None
    if not CORNER:
        rows = slice(0, int(0.35 * h))
        wrap = float(np.abs(a[rows, 0] - a[rows, -1]).mean())
    return edges, shade, wrap, tops, float(np.mean(edge_rows)) / h


def game(cut, bgc):
    g = cut.resize((GW, round(GW * cut.height / cut.width)), Image.LANCZOS)
    reps = 1 if CORNER else 2
    W, H = GW * reps + 140, g.height + 170
    C = Image.new('RGBA', (W, H), bgc + (255,))
    # the bank's soil above, then the strip over it (as drawUnderside lays it), Pokey on the lower leg under it
    soil = None
    if not CORNER:
        soil = Image.new('RGB', (GW * reps, 70))
        for x in range(0, GW * reps, FILL.width):
            soil.paste(FILL.crop((0, 0, FILL.width, 70)), (x, 0))
    y0 = 40
    if soil:
        C.paste(soil, (20, 0))
    for i in range(reps):
        C.alpha_composite(g, (20 + i * GW, y0 if not CORNER else 0))
    dr = ImageDraw.Draw(C)
    gy = H - 12
    dr.rectangle((0, gy, W, H), fill=(92, 70, 48, 255))
    px = 20 + GW * reps - 80 if not CORNER else GW + 40
    dr.rectangle((px, gy - 89, px + 34, gy), fill=(240, 200, 60, 255))
    return C.convert('RGB')


files = sorted(glob.glob(f'{d}/{piece}-s*.webp')) or sorted(glob.glob(f'{d}/{piece}-s*.png'))
rows = []
for f in files:
    name = os.path.splitext(os.path.basename(f))[0]
    raw = Image.open(f).convert('RGB')
    cut, bgm, bg = key(raw)
    edges, shade, wrap, tops, er = numbers(raw, bgm, bg)
    # the game-size looks show the SHIP cut (cut.py --match --shade=0.60: the fill's colour, the overhang at 0.60, the wrap closed)
    import subprocess, tempfile
    cp = tempfile.mktemp(suffix='.png')
    r = subprocess.run([sys.executable, '-I', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cut.py'), f, cp,
                        'corner' if CORNER else 'strip', '--match', '--shade=0.60'], capture_output=True, text=True)
    cutline = r.stdout.strip().splitlines()[-1].split(' ', 1)[1]
    cut = Image.open(cp).convert('RGBA')
    bad = {k: v for k, v in edges.items() if v > 0.01}
    small = raw.resize((360, round(raw.height * 360 / raw.width)))
    L, D = game(cut, LIGHT), game(cut, DARK)
    R = Image.new('RGB', (360 + L.width * 2 + 30, max(small.height, L.height) + 20), (18, 18, 22))
    R.paste(small, (0, 20)); R.paste(L, (370, 20)); R.paste(D, (380 + L.width, 20))
    dr = ImageDraw.Draw(R)
    txt = (f"{name}  RAW shade {shade:.2f}" + (f" wrap {wrap:.1f}" if wrap is not None else '') +
           f" top {tuple(int(v) for v in tops)}  | SHIP CUT {cutline}   (yellow = Pokey 89 px)")
    dr.text((4, 4), txt, fill=(255, 230, 90))
    if bad:
        dr.rectangle((0, 0, R.width - 1, R.height - 1), outline=(230, 40, 40), width=4)
        dr.text((4, R.height - 14), 'FRAME EDGE: ' + ', '.join(f'{k} {v:.0%}' for k, v in bad.items()), fill=(255, 80, 80))
    print(txt, ('FRAME EDGE ' + str(bad)) if bad else '')
    rows.append(R)
S = Image.new('RGB', (max(r.width for r in rows), sum(r.height + 6 for r in rows)), (8, 8, 10))
y = 0
for r in rows:
    S.paste(r, (0, y)); y += r.height + 6
S.save(out, quality=84)
print(out, S.size)
