"""Footing lines for the World 1 cuts 1-1 can place (art director, 2026-11-06; the lead 10:36 AM ET: get the cuts READY TO INTEGRATE).

    python3 tools/art/w1keepers/footing.py      -> reference/art/cut/footing.json + footing-sheet-*.jpg

For each piece: the standable top as a line (y px from the image top, x0..x1 px), measured on the cut PNG itself:
- auto: the first row whose longest run of opaque pixels (alpha > 200) is at least FRAC of the piece's width (so moss tufts, grass
  blades and leaves above the real top don't count); the span is that run, narrowed by 6% each end (the shoulder of a rounded top);
- walls and set pieces: one line per ledge, measured by eye on a ruler sheet then checked by a column scan (WALLS below).
A scale is given as the piece's drawn HEIGHT in Pokey heights (Pokey's collider is 48 game px tall, engine.ts player.height), so
drawn game px = pokey * 48 and the footing in game px = footing_y / image_h * drawn height. A rough spot is named in `note`.
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[3]
CUT = ROOT / 'reference/art/cut'
POKEY = 48
# name: (kind, pokey heights, frac, note)
PIECES = {
    # stones: 3+ kinds (round boulders, blocks, stacked slabs, grey boulders)
    'w1-rock-boulder-moss': ('stone', 1.4, 0.45, 'round top: stand span is the flat middle only'),
    'w1-rock-boulder-moss-big': ('stone', 1.9, 0.45, 'round top'),
    'w1-boulder-grey-moss': ('stone', 1.3, 0.45, 'round top; grey, a little cooler than the kit'),
    'w1-boulder-grey-moss-b': ('stone', 1.0, 0.45, 'small: dressing or a low step'),
    'w1-rock-block-big': ('stone', 1.8, 0.6, 'flat top: the best stone platform'),
    'w1-rock-root-block': ('stone', 2.0, 0.6, 'flat top'),
    'w1-rock-slabs-stacked': ('stone', 1.4, 0.5, 'flat top'),
    'w1-rock-slabs-stacked-big': ('stone', 1.6, 0.5, 'flat top'),
    'w1-rock-slabs-low': ('stone', 0.8, 0.5, 'low step'),
    'w1-rock-roots': ('stone', 1.5, 0.45, 'uneven top: short stand span'),
    # stumps: 3+ heights including the wide one
    'w1-stump-wide': ('stump', 1.6, 0.6, 'the wide flat stump (Matt\'s favourite)'),
    'w1-hide-stump-hollow': ('stump', 2.4, 0.3, 'PERCH only (narrow top, lead 11-06); the gap at its base is a hide spot'),
    'w1-hide-stump-hollow-tall': ('stump', 3.0, 0.25, 'PERCH only (narrow ragged top, lead 11-06)'),
    'w1-post-tall-vine': ('stump', 4.0, 0.6, 'tall cut log standing up: a pillar with a flat top'),
    # thin logs and branches
    'w1-log-plank-a': ('log', 0.5, 0.6, 'thin log platform'),
    'w1-log-plank-b': ('log', 0.55, 0.6, 'thin log platform'),
    'w1-log-lashed-short': ('log', 0.7, 0.55, 'W2 ONLY: rope-lashed, a made thing (lead 11-06: not in the home forest)'),
    'w1-plank-ledge-a': ('log', 0.3, 0.6, 'mossy plank ledge'),
    'w1-plank-ledge-b': ('log', 0.3, 0.6, 'mossy plank ledge'),
    'w1-plank-ledge-c': ('log', 0.3, 0.6, 'mossy plank ledge'),
    'w1-branch-long-a': ('branch', 0.0, 0.0, 'DIAGONAL in the cut (drawn at an angle): not a flat platform; dressing, or rotate in code and re-check'),
    'w1-branch-knotted': ('branch', 0.0, 0.0, 'DIAGONAL: same as above'),
    'w1-branch-leafy': ('branch', 0.0, 0.0, 'slightly angled: dressing'),
    # earth ledges: floating is pending Matt (lead 11-06 11:31 AM ET); until he answers, used from the floor up only
    'w1-ledge-earth-long': ('ledge', 0.8, 0.6, 'earth ledge, grass top. may float: pending Matt; use from the floor up only'),
    'w1-ledge-earth-a': ('ledge', 0.8, 0.6, 'earth ledge (small cut: upscale before use). may float: pending Matt; use from the floor up only'),
    'w1-ledge-overhang-big': ('ledge', 1.2, 0.6, 'big overhang ledge with roots under. may float: pending Matt; use from the floor up only'),
    'w1-ground-chunk': ('ledge', 0.9, 0.6, 'ground chunk. may float: pending Matt; use from the floor up only'),
}
# set by eye where the auto line takes a high grass tuft or half the top (checked on the footing sheet)
OVERRIDE = {'w1-ground-chunk': (10, 8, 210)}
# walls: measured on a ruler sheet (cut PNG px), checked by a column scan (2026-11-06). (y, x0, x1) per standable top
WALLS = {
    'w1-wall-earth-A': (5.0, 'master', [(44, 20, 440), (180, 10, 225), (287, 215, 448), (412, 10, 240), (521, 222, 460), (642, 5, 235), (745, 220, 462)]),
    'w1-wall-earth-B': (5.0, 'variant, more roots', [(46, 20, 440), (183, 10, 225), (289, 220, 448), (418, 10, 235), (524, 222, 458), (640, 5, 235), (750, 220, 458)]),
    'w1-wall-earth-C': (5.0, 'variant with two small middle ledges (y 250, 367): check them in a still; right ledge tips re-cut whole 11-06', [(46, 20, 440), (181, 10, 210), (250, 175, 270), (288, 220, 447), (367, 160, 280), (420, 10, 235), (523, 222, 462), (645, 5, 235), (750, 220, 460)]),
}


def auto(a, frac):
    H, W = a.shape
    for y in range(H):
        r = a[y]
        best, run, s0, bs = 0, 0, 0, 0
        for x in range(W):
            if r[x]:
                if run == 0:
                    s0 = x
                run += 1
                if run > best:
                    best, bs = run, s0
            else:
                run = 0
        if best >= frac * W:
            k = round(best * 0.06)
            return y, bs + k, bs + best - k
    return None


def main():
    out = {}
    tiles = []
    for n, (kind, ph, frac, note) in PIECES.items():
        im = Image.open(CUT / f'{n}.png').convert('RGBA')
        a = np.asarray(im)[..., 3] > 200
        rec = {'kind': kind, 'size': list(im.size), 'note': note}
        if frac:
            y, x0, x1 = OVERRIDE.get(n) or auto(a, frac)
            gh = ph * POKEY
            rec.update({'footing': [{'y': y, 'x0': x0, 'x1': x1}], 'pokey_h': ph, 'drawn_game_h': round(gh),
                        'drawn_game_w': round(gh * im.width / im.height), 'footing_game_y': round(y / im.height * gh, 1)})
        out[n] = rec
        tiles.append((n, im, rec))
    for n, (ph, note, tops) in WALLS.items():
        im = Image.open(CUT / f'{n}.png').convert('RGBA')
        gh = ph * POKEY
        out[n] = {'kind': 'wall', 'size': list(im.size), 'note': note + '; a SET PIECE: one platform per ledge at exactly these heights',
                  'footing': [{'y': y, 'x0': x0, 'x1': x1} for y, x0, x1 in tops], 'pokey_h': ph, 'drawn_game_h': round(gh),
                  'drawn_game_w': round(gh * im.width / im.height),
                  'footing_game_y': [round(y / im.height * gh, 1) for y, _, _ in tops]}
        tiles.append((n, im, out[n]))
    (CUT / 'footing.json').write_text(json.dumps({'pokey_game_px': POKEY, 'pieces': out}, indent=1))
    # contact sheets: each piece on dusk purple, its footing line(s) in yellow, name and scale under it
    S = 300
    per = 6
    for part in range(0, len(tiles), 18):
        grp = tiles[part:part + 18]
        rows = (len(grp) + per - 1) // per
        sheet = Image.new('RGBA', (per * S, rows * (S + 30)), (38, 34, 52, 255))
        d = ImageDraw.Draw(sheet)
        for i, (n, im, rec) in enumerate(grp):
            k = min((S - 20) / im.width, (S - 20) / im.height)
            t = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
            ox, oy = (i % per) * S + (S - t.width) // 2, (i // per) * (S + 30) + (S - t.height) // 2
            sheet.alpha_composite(t, (ox, oy))
            for f in rec.get('footing', []):
                yy = oy + f['y'] * k
                d.line([(ox + f['x0'] * k, yy), (ox + f['x1'] * k, yy)], fill=(255, 235, 0, 255), width=2)
            tx, ty = (i % per) * S + 4, (i // per) * (S + 30) + S
            d.text((tx, ty), n, fill=(255, 255, 255, 255))
            d.text((tx, ty + 13), f"{rec['kind']}  {rec.get('pokey_h', '-')} P" + ('' if rec.get('footing') else '  NO FOOTING'), fill=(255, 230, 90, 255))
        sheet.convert('RGB').save(CUT / f'footing-sheet-{part // 18}.jpg', quality=85)
    print(len(out), 'pieces')


if __name__ == '__main__':
    main()
