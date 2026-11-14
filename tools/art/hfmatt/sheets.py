"""ART-MATT: one contact sheet per Matt sheet (packet done-item 5, D62): each piece on LIGHT and DARK at ship size (3 px a unit), then
pasted at true scale into a real game frame beside Pokey (tools/art/hfmatt/frame.mjs: the frame's own json says what the game built and
its zoom), standing on Pokey's ground line. Every label prints the piece, its ship px, its units and its height in Pokeys (89.1 u, D41).

    python3 -I tools/art/hfmatt/sheets.py <cut dir> <frames dir> <out dir>
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

PX, POKEY = 3.0, 89.1
SHEETS = {
    'sheet3-pits': ('1-1', ['w1m-pit-floor', 'w1m-pit-boulder', 'w1m-pit-lip-l', 'w1m-pit-lip-r'], ['w1m-pit-lip-r', 'w1m-pit-boulder']),
    'sheet1-tie-lid': ('1-4', ['w1m-tie-taut', 'w1m-tie-strain', 'w1m-tie-snap', 'w1m-leaf-lid'], ['w1m-tie-taut', 'w1m-leaf-lid']),
    'sheet2-pods-dust': ('1-4', ['w1m-pod-hang', 'w1m-pod-fall', 'w1m-dust-puff', 'w1m-bark-chips', 'alt/alt-pod-hang-b', 'alt/alt-pod-fall-b'],
                         ['w1m-pod-hang', 'w1m-pod-fall', 'w1m-dust-puff']),
}


def load(cut, n):
    return Image.open(Path(cut) / ('' if '/' in n else 'w1-matt') / f'{n}.webp').convert('RGBA')


def label(n, im):
    return f"{n.split('/')[-1]}  {im.width}x{im.height}px  {im.width / PX:.0f}x{im.height / PX:.0f}u  {im.height / PX / POKEY:.2f} Pokey"


def row(pieces, bg, cut):
    ims = [(n, load(cut, n)) for n in pieces]
    W = sum(max(im.width, 210) + 16 for _, im in ims) + 16; H = max(im.height for _, im in ims) + 40
    R = Image.new('RGB', (W, H), bg); d = ImageDraw.Draw(R); x = 16
    fg = (20, 20, 20) if sum(bg) > 300 else (240, 240, 210)
    for n, im in ims:
        R.paste(im, (x, H - 8 - im.height), im)
        d.text((x, 4), label(n, im), fill=fg); x += max(im.width, 210) + 16
    return R


def framed(fr, pieces, cut):
    meta = json.loads(Path(fr).with_suffix('.json').read_text())
    F = Image.open(fr).convert('RGB'); d = ImageDraw.Draw(F)
    k = meta['zoom'] * meta['dsf'] / PX  # file px per piece px
    fx, fy = meta['feet']['x'] * meta['dsf'], meta['feet']['y'] * meta['dsf']
    x = fx + 70 * meta['dsf']; u = meta['zoom'] * meta['dsf']  # file px per game unit
    for n in pieces:
        im = load(cut, n); im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        a = SIZES.get(n.split('/')[-1], {}).get('anchor')
        if a:  # the tie: its knot centre on the bough's centre line (a 22 u bough whose top is the ground line here)
            y = fy + 11 * u - a[1] * k
        elif 'lid' in n:  # the lid: its pole on the bough top, the leaves hanging in front
            y = fy - 4 * u
        else:
            y = fy - im.height
        F.paste(im, (round(x), round(y)), im); x += im.width + 10 * meta['dsf']
    hdr = (f"REAL FRAME: stage {meta['stage']} built, difficulty {meta['difficulty']} (easy={meta['easy']}), layout {meta['layout']}, "
           f"{meta['orient']} {meta['viewport']['width']}x{meta['viewport']['height']} dsf {meta['dsf']}, zoom {meta['zoom']:.3f}; "
           f"pieces pasted at true scale on Pokey's ground line, right of him")
    d.rectangle((0, 0, F.width, 18), fill=(0, 0, 0)); d.text((4, 3), hdr[:F.width // 6], fill=(255, 255, 0))
    return F


def _pokey(px_per_u):
    import re
    G = Path(__file__).resolve().parents[3]
    t = (G / 'src/game/heroStandardData.ts').read_text()
    x, y, w, h = map(int, re.search(r'idle: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', t).groups())
    im = Image.open(G / 'src/assets/hero/hero-standard.webp').convert('RGBA').crop((x, y, x + w, y + h))
    k = 89.1 * px_per_u / 200  # STD_STAND_H 200 sheet px = 89.1 units (beside.py)
    return im.resize((round(w * k), round(h * k)), Image.LANCZOS)


def pit(cut, out, gap=300, depth=130, U=2.0):
    """the pit put together at true scale (2 px a unit, a phone): left lip, the floor `depth` u down (a soft pit, w1Pits.ts SOFT_FLOOR
    1-3's 130), the right lip `gap` u on; the floor's mossy ends tuck under the lips; Pokey (89.1 u) on the left lip; boulder on the right"""
    L, Fl, Rr, B = (load(cut, n) for n in ('w1m-pit-lip-l', 'w1m-pit-floor', 'w1m-pit-lip-r', 'w1m-pit-boulder'))
    sc = lambda im: im.resize((round(im.width / PX * U), round(im.height / PX * U)), Image.LANCZOS)
    L, Fl, Rr, B = map(sc, (L, Fl, Rr, B))
    import runpy
    walk = runpy.run_path(str(Path(__file__).resolve().parents[1] / 'hf1113/rows.py'))['walk']
    wl, wr = (walk(Path(cut) / 'w1-matt' / f'{n}.webp')[0] / PX * U for n in ('w1m-pit-lip-l', 'w1m-pit-lip-r'))  # walk lines (catalog rows)
    top = 230; x0 = 40
    S = Image.new('RGB', (x0 + L.width + round(gap * U) + Rr.width + 40, top + round(depth * U) + Fl.height + 60), (34, 52, 40))
    gx0, gx1 = x0 + L.width, x0 + L.width + round(gap * U)
    fw = round((gap + 40) * U); F2 = Fl.resize((fw, Fl.height), Image.LANCZOS)  # the floor stretched 1.13x to the gap + 20 u tuck a side
    S.paste(F2, (gx0 - round(20 * U), top + round(depth * U)), F2)
    S.paste(L, (x0, top), L); S.paste(Rr, (gx1, top), Rr)
    P = _pokey(U); S.paste(P, (x0 + 20, round(top + wl - P.height)), P)
    S.paste(B, (gx1 + Rr.width - B.width - 4, round(top + wr - B.height + 2 * U)), B)  # 2 u sunk in the moss
    d = ImageDraw.Draw(S)
    d.text((6, 6), f'PIT ASSEMBLY at true scale (2 px/unit): gap {gap} u, floor {depth} u down; lips 140 u; floor stretched to gap+40 u; Pokey 89.1 u on the lip walk line', fill=(255, 255, 0))
    d.text((6, 20), 'mock only: not the engine. The lips outer edges (straight sheet edge) join the bank; boulder wholly on the right lip', fill=(255, 255, 0))
    S.save(Path(out) / 'pit-assembly.jpg', quality=90); print('pit-assembly', S.size)


def main(cut, frames, out):
    global SIZES
    SIZES = json.loads((Path(cut) / 'sizes.json').read_text())
    pit(cut, out)
    Path(out).mkdir(parents=True, exist_ok=True)
    for name, (stage, pieces, beside) in SHEETS.items():
        parts = [row(pieces, (236, 236, 226), cut), row(pieces, (26, 30, 34), cut),
                 framed(Path(frames) / f'{stage}-sideways.png', pieces[:4], cut), framed(Path(frames) / f'{stage}-upright.png', beside, cut)]
        W = max(p.width for p in parts[:3]) + parts[3].width + 12
        H = max(parts[0].height + parts[1].height + parts[2].height + 24, parts[3].height)
        S = Image.new('RGB', (W, H), (60, 60, 60)); y = 0
        for p in parts[:3]:
            S.paste(p, (0, y)); y += p.height + 12
        S.paste(parts[3], (max(p.width for p in parts[:3]) + 12, 0))
        S.save(Path(out) / f'{name}.jpg', quality=88); print(name, S.size)


if __name__ == '__main__':
    main(*sys.argv[1:4])
