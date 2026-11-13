"""ART 11-13 (R-165.178): starts for Pokey's two-hand vine climb, for Qwen-Image-Edit-2511 + his character model (hfpokey/pokeygpu.py).

    python3 -I tools/art/hf1113/climbstarts.py   -> reference/art/hf1113/starts/climb-*.png

Pokey's standard 'hang_b' (both paws up) at 2.8x his sheet px, centred on flat grey, between two plain olive vines hung straight at the
vine field's spacing: 80 game units apart (t-lattice vineFieldArt/vineField: five vines 80 apart) against his 89.1 drawn units
(heroSprite.ts:30, STD_STAND_H 200 sheet px), so 180 sheet px = 504 start px. Each vine 60 px wide (FIELD_THICK 11 units). The vines
are there so the edit puts a paw on each; they are keyed out of the result (the game draws its own vine behind his paws).
"""
import re
from pathlib import Path
from PIL import Image, ImageDraw

GAME = Path(__file__).resolve().parents[3]
OUT = GAME / 'reference/art/hf1113/starts'
S = 2.8                      # start px per standard-sheet px
STAND = 200 * S              # his standing height in start px (= 89.1 game units)
GAP = round(80 / 89.1 * STAND)
VW = round(11 / 89.1 * STAND * 0.85)
GREY = (128, 128, 128)


def frame(name):
    t = (GAME / 'src/game/heroStandardData.ts').read_text()
    m = re.search(name + r': \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+)', t)
    x, y, w, h = map(int, m.groups())
    return Image.open(GAME / 'src/assets/hero/hero-standard.webp').convert('RGBA').crop((x, y, x + w, y + h))


def vine(d, cx, H):
    x0 = cx - VW // 2
    d.rectangle((x0, 0, x0 + VW, H), fill=(104, 118, 46))
    for y in range(-VW, H, 34):  # a twisted liana: diagonal light strands
        d.polygon([(x0, y), (x0 + VW, y + 22), (x0 + VW, y + 34), (x0, y + 12)], fill=(150, 160, 62))
    d.line((x0, 0, x0, H), fill=(60, 66, 26), width=4)
    d.line((x0 + VW, 0, x0 + VW, H), fill=(60, 66, 26), width=4)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    W = H = 1024
    for name, src in (('climb-hang', 'hang_b'),):
        im = Image.new('RGB', (W, H), GREY)
        d = ImageDraw.Draw(im)
        for cx in (W // 2 - GAP // 2, W // 2 + GAP // 2):
            vine(d, cx, H)
        p = frame(src)
        p = p.resize((round(p.width * S), round(p.height * S)), Image.LANCZOS)
        im.paste(p, ((W - p.width) // 2, 110), p)
        im.save(OUT / f'{name}.png')
        print(name, 'gap', GAP, 'vine', VW, p.size)


if __name__ == '__main__':
    main()
