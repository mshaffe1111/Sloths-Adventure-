"""ART 11-13: a still of each new piece beside Pokey at game scale (packet ART.md done-item 4; CLAUDE.md "To scale with Pokey").

    python3 -I tools/art/hf1113/beside.py <out.jpg> <piece.png>:<game units tall>[:<label>] ...

Pokey's standing frame (hero-standard 'idle') is drawn 89.1 units tall (heroSprite.ts:30, D41); each piece is scaled to the height in
game units it will be drawn at, both standing on one ground line, at 2 device px per unit (a phone), on World 1's own far backdrop.
"""
import re, sys
from pathlib import Path
from PIL import Image, ImageDraw

GAME = Path(__file__).resolve().parents[3]
PX = 2.0
POKEY_U = 89.1


def pokey():
    t = (GAME / 'src/game/heroStandardData.ts').read_text()
    x, y, w, h = map(int, re.search(r'idle: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', t).groups())
    im = Image.open(GAME / 'src/assets/hero/hero-standard.webp').convert('RGBA').crop((x, y, x + w, y + h))
    k = POKEY_U * PX / 200  # STD_STAND_H 200 sheet px = 89.1 units
    return im.resize((round(w * k), round(h * k)), Image.LANCZOS)


def main(out, specs):
    p = pokey()
    pieces = []
    for s in specs:
        f, u, *lab = s.split(':')
        im = Image.open(f).convert('RGBA')
        hh = round(float(u) * PX)
        pieces.append((im.resize((max(1, round(im.width * hh / im.height)), hh), Image.LANCZOS), lab[0] if lab else Path(f).stem, u))
    W = 40 + p.width + sum(im.width + 40 for im, _, _ in pieces) + 20
    H = max([p.height] + [im.height for im, _, _ in pieces]) + 90
    bg = Image.open(GAME / 'src/assets/backdrops/w1-far.webp').convert('RGBA')
    bg = bg.resize((round(bg.width * H / bg.height), H)).crop((0, 0, W, H)) if bg.width * H / bg.height >= W else bg.resize((W, H))
    c = bg.copy()
    ground = H - 40
    d = ImageDraw.Draw(c)
    d.rectangle((0, ground, W, H), fill=(70, 52, 34, 255))
    x = 20
    c.alpha_composite(p, (x, ground - p.height)); d.text((x, ground + 8), 'Pokey 89.1 u', fill=(255, 255, 255, 255)); x += p.width + 40
    for im, lab, u in pieces:
        c.alpha_composite(im, (x, ground - im.height)); d.text((x, ground + 8), f'{lab} {u} u', fill=(255, 255, 255, 255)); x += im.width + 40
    c.convert('RGB').save(out, quality=88)
    print(out, c.size)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2:])
