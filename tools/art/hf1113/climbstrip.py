"""ART 11-13 (R-165.178): Pokey's two-hand climb at game timing, from the packed strip (climbpack.py), for the lead and Matt.

    python3 -I tools/art/hf1113/climbstrip.py <out dir>   -> climb2-strip.png (each frame on its two vines, labelled),
                                                              climb2-anim.webp (the cycle climbing up two vines, looped)
Scale: 2 device px per game unit (a phone); the vines 80 units apart, 11 thick (vineFieldArt FIELD_THICK), drawn BEHIND him as the game
draws its own; each frame is placed so its two grips sit on the vines. Timing: today's climb steps a frame every 22 px climbed
(heroSprite.ts CLIMB_STEP_PX) and two hands climb at 1.6 x 220 px/s (vineField FIELD_FEEL twoUp), so a frame every 62.5 ms.
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

GAME = Path(__file__).resolve().parents[3]
PX = 2.0
SPEED = 220 * 1.6
STEP = 22
GAP_U, THICK_U = 80, 11


def frames():
    meta = json.loads((GAME / 'src/assets/hero/hero-climb2.json').read_text())
    sheet = Image.open(GAME / 'src/assets/hero/hero-climb2.webp').convert('RGBA')
    k = 89.1 * PX / meta['stand_px']  # sheet px -> device px
    out = {}
    for n, f in meta['frames'].items():
        im = sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        out[n] = (im, [[g[0] * k, g[1] * k] for g in f['grips']])
    return meta, out


def vines(d, cx, H):
    for vx in (cx - GAP_U * PX / 2, cx + GAP_U * PX / 2):
        w = THICK_U * PX
        d.rectangle((vx - w / 2, 0, vx + w / 2, H), fill=(111, 125, 47, 255))
        for y in range(-20, H, 16):
            d.line((vx - w / 2, y, vx + w / 2, y + 9), fill=(150, 160, 62, 255), width=3)


def place(c, im, grips, cx, gy):
    # the grips' midpoint on the vines' midline, at height gy
    mx = (grips[0][0] + grips[1][0]) / 2
    my = min(grips[0][1], grips[1][1])
    c.alpha_composite(im, (round(cx - mx), round(gy - my)))


def main(od):
    od = Path(od); od.mkdir(parents=True, exist_ok=True)
    meta, fr = frames()
    order = meta['cycle'] + [meta['still']]
    tw, H = 260, 420
    S = Image.new('RGBA', (tw * len(order), H + 18), (52, 74, 44, 255))
    d = ImageDraw.Draw(S)
    for i, n in enumerate(order):
        vines(d, i * tw + tw / 2, H)
    for i, n in enumerate(order):
        im, g = fr[n]
        place(S, im, g, i * tw + tw / 2, 60)
        d.text((i * tw + 6, H + 3), n + (' (still)' if n == meta['still'] else ''), fill=(255, 255, 255, 255))
    S.convert('RGB').save(od / 'climb2-strip.png')
    ms = round(1000 * STEP / SPEED)
    W, AH = 300, 520
    anim = []
    y = AH - 40.0
    for t in range(len(meta['cycle']) * 4):
        n = meta['cycle'][t % len(meta['cycle'])]
        c = Image.new('RGBA', (W, AH), (52, 74, 44, 255))
        vines(ImageDraw.Draw(c), W / 2, AH)
        im, g = fr[n]
        place(c, im, g, W / 2, y - im.height * 0.0 - 220)
        y -= STEP * PX / 2  # the camera half follows, so the climb reads
        anim.append(c.convert('RGB'))
    anim[0].save(od / 'climb2-anim.webp', save_all=True, append_images=anim[1:], duration=ms, loop=0, quality=85)
    print(od, len(order), 'frames;', ms, 'ms a frame')


if __name__ == '__main__':
    main(sys.argv[1])
