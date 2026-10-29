"""Phone-size check for the Worlds 5-10 clips (2026-10-28): does each figure still read on a phone, in portrait and landscape?

    python3 -I tools/art/w6to10/phonecheck.py <unpacked dir> <gallery img dir>

For every character with clips, three of its moves (a middle frame of each preview WebP) are cut off the grey and drawn at the size the
game draws them (the boss's painted frame height x its sprite k, in world units; the engine shows ~540 units of height in landscape and
~440 units of width in portrait, engine.ts WORLD_VIEW_H / PORTRAIT_VIEW_W), and again at half that size (the brief's 0.5x check), over the
world's own far strip, inside a 390x844 portrait and an 844x390 landscape phone frame (CSS px). Writes phone-<who>.webp.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageSequence

REPO = Path(__file__).resolve().parents[3]
# world units tall in the game (painted idle frame height x sprite k), and the world whose far strip is behind it
UNITS = {'ironclaw': (141, 10), 'golem': (131, 7), 'drake': (82, 9), 'reaver': (131, 6), 'thornbark': (124, 7), 'monarch': (76, 8),
         'dangler': (60, 5), 'seamstress': (60, 5), 'mantis': (60, 5), 'dozer': (55, 5)}
LAND, PORT = 390 / 540, 390 / 440  # CSS px per world unit


def cut(frame):
    a = np.asarray(frame.convert('RGB')).astype(np.int16)
    bg = np.median(np.concatenate([a[:4, :4].reshape(-1, 3), a[:4, -4:].reshape(-1, 3)]), 0)
    m = (np.abs(a - bg).max(-1) > 30)
    ys, xs = np.nonzero(m)
    rgba = np.dstack([a.astype(np.uint8), (m * 255).astype(np.uint8)])
    im = Image.fromarray(rgba, 'RGBA')
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)) if len(xs) else im


def frame_of(p, k=0.5):
    fr = [f.copy() for f in ImageSequence.Iterator(Image.open(p))]
    return fr[int(len(fr) * k)]


def phone(bg, figs, w, h, ppu, units):
    S = bg.resize((round(bg.width * h / bg.height), h), Image.LANCZOS).crop((0, 0, w, h)).convert('RGBA')
    d = ImageDraw.Draw(S)
    ground = int(h * 0.82)
    d.rectangle([0, ground, w, h], fill=(40, 34, 28, 255))
    x = 12
    for i, f in enumerate(figs):
        for half in (False, True):
            th = units * ppu * (0.5 if half else 1.0)
            s = th / f.height
            g = f.resize((max(1, round(f.width * s)), max(1, round(th))), Image.LANCZOS)
            if x + g.width > w - 8:
                break
            S.alpha_composite(g, (x, ground - g.height))
            x += g.width + 10
    return S


def main(src, out):
    src, out = Path(src), Path(out)
    who = sorted({p.name.split('-')[1] for p in src.glob('w6t-*.webp')})
    for wname in who:
        clips = sorted(p for p in src.glob(f'w6t-{wname}-*-s3.webp'))[:3]
        if not clips or wname not in UNITS:
            continue
        units, world = UNITS[wname]
        figs = [cut(frame_of(c)) for c in clips]
        bg = Image.open(REPO / f'src/assets/backdrops/w{world}-far.webp').convert('RGB')
        P = phone(bg, figs, 390, 844, PORT, units)
        L = phone(bg, figs, 844, 390, LAND, units)
        S = Image.new('RGB', (390 + 16 + 844, 844), (20, 20, 20))
        S.paste(P.convert('RGB'), (0, 0)); S.paste(L.convert('RGB'), (406, 0))
        ImageDraw.Draw(S).text((410, 400), f'{wname}: game size, then 0.5x. Left portrait 390x844, right landscape 844x390 (CSS px)', fill=(255, 255, 0))
        S.save(out / f'phone-{wname}.webp', 'WEBP', quality=78, method=6)
        print('phone', wname)


if __name__ == '__main__':
    main(*sys.argv[1:3])
