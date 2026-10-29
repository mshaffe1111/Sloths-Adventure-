"""World 7-4 "The Slide" (2026-10-29): start pictures for the img2img run (slidegpu.py), pasted up from World 7's own art so the paint
and colours match: the kit (src/assets/kits/w7.webp), the made props (src/assets/w6to10/props-made/w7c/w7var/w7b), the near strip's
fallen stone head (backdrops/w7-near.webp) and the far/mid strips.

    python3 -I tools/art/w7slide/envstarts.py <out dir>

  floor.png        1024 sq   the chute floor from straight above: flagstones of kit stone, a groove down the middle, moss in the joints
  wall-roots.png   1024 sq   the kit's carved wall with fig roots, tiled
  wall-glyph.png   1024 sq   the kit's carved wall with glyph tablets from Matt's w7a puzzle door, no roots
  mouth.png        1024 sq   the chute seen from behind Pokey, vanishing into a dark tunnel mouth with two torches
  obstacles.png    1536x1024 six obstacles seen from the front on flat magenta, 3 x 2
  chamber.png      1792x768  the chamber he shoots out into, side-on
"""
import json, random, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

REPO = Path(__file__).resolve().parents[3]
A = REPO / 'src/assets'
MAG = (255, 0, 255)


def rgba(p):
    return Image.open(p).convert('RGBA')


KIT = rgba(A / 'kits/w7.webp')


def frame(sheet, name):
    j = json.loads((A / f'w6to10/props-made/{sheet}.json').read_text())['frames'][name]
    return rgba(A / f'w6to10/props-made/{sheet}.webp').crop((j['x'], j['y'], j['x'] + j['w'], j['y'] + j['h']))


def warm(im, k=0.18):
    """nudge the kit's grey stone toward World 7's amber light"""
    a = np.asarray(im).astype(np.float32)
    rgb = a[..., :3]
    tint = np.array([255, 196, 120], np.float32)
    rgb = rgb * (1 - k) + (rgb * tint / 255) * k * 1.25
    a[..., :3] = rgb.clip(0, 255)
    return Image.fromarray(a.astype(np.uint8), im.mode)


def tile(src, size):
    out = Image.new('RGBA', size)
    for y in range(0, size[1], src.height):
        for x in range(0, size[0], src.width):
            out.alpha_composite(src, (x, y))
    return out


def stone_fill(size, seed=1):
    """kit stone texture (the root-free brick wall) stretched into one continuous fill"""
    src = KIT.crop((960, 40, 1100, 380)).convert('RGB')
    rng = random.Random(seed)
    out = Image.new('RGB', size)
    for y in range(0, size[1], 120):
        for x in range(0, size[0], 120):
            sx, sy = rng.randrange(0, src.width - 120), rng.randrange(0, src.height - 120)
            out.paste(src.crop((sx, sy, sx + 120, sy + 120)).rotate(rng.choice([0, 90, 180, 270])), (x, y))
    return out.filter(ImageFilter.GaussianBlur(3))


def floor():
    S = 1024
    base = stone_fill((S, S), 3)
    a = np.asarray(base).astype(np.float32)
    a = a * 0.55 + np.array([196, 170, 128]) * 0.45  # worn smooth, pale amber stone
    im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    rng = random.Random(7)
    y = 0
    while y < S:  # flagstone courses across the chute, staggered joints
        h = rng.randrange(150, 230)
        x = rng.randrange(-200, 0)
        while x < S:
            w = rng.randrange(220, 380)
            d.rectangle((x, y, x + w, y + h), outline=(78, 62, 44), width=6)
            for _ in range(5):  # moss in the joints
                mx = x + rng.randrange(0, w); d.ellipse((mx - 18, y - 7, mx + 18, y + 7), fill=(104, 128, 56))
            x += w
        y += h
    # the groove down the middle, a shallow carved channel
    d.rectangle((S // 2 - 46, 0, S // 2 + 46, S), fill=(150, 126, 92))
    d.rectangle((S // 2 - 46, 0, S // 2 - 36, S), fill=(92, 74, 52))
    d.rectangle((S // 2 + 36, 0, S // 2 + 46, S), fill=(214, 190, 146))
    return im.filter(ImageFilter.GaussianBlur(1.5))


def wall_roots():
    p = warm(KIT.crop((508, 18, 916, 424)))
    return tile(p.resize((512, 512), Image.LANCZOS), (1024, 1024)).convert('RGB')


def wall_glyph():
    base = warm(KIT.crop((508, 18, 916, 424))).convert('RGB')
    # the kit wall's carving shows between the roots in its lower band: use the root-free ground panel's carved blocks instead
    panel = warm(KIT.crop((10, 700, 300, 1100))).convert('RGB')
    out = Image.new('RGB', (1024, 1024))
    for y in range(0, 1024, 256):
        for x in range(0, 1024, 256):
            out.paste(stone_fill((256, 256), x + y).point(lambda v: min(255, int(v * 1.05))), (x, y))
    door = Image.open(REPO / 'reference/prop-sheets/gemini-batch-2026-10-28/w7a-puzzle-take2.jpg').convert('RGB')
    tablet = door.crop((452, 418, 578, 632)).resize((200, 340), Image.LANCZOS)
    tablet = warm(tablet.convert('RGBA'), 0.35).convert('RGB')
    d = ImageDraw.Draw(out)
    for x in (56, 568):
        for y in (40, 552):
            d.rectangle((x - 12, y - 12, x + 212, y + 352), fill=(96, 82, 62))
            out.paste(tablet, (x, y))
    for y in (0, 512):  # carved bands between the tablets
        band = warm(KIT.crop((320, 906, 890, 994))).convert('RGB').resize((1024, 60), Image.LANCZOS)
        out.paste(band, (0, y + 440 - 30 if y == 0 else y - 50))
    _ = base, panel
    return out


def quad(src, dst_quad, size):
    """paste src into the quadrilateral dst_quad (tl, tr, br, bl) of a size canvas"""
    W, H = src.size
    # PIL's QUAD maps a destination box back to source corners; solve with a perspective transform instead
    import numpy.linalg as la
    srcq = [(0, 0), (W, 0), (W, H), (0, H)]
    M = []
    for (x, y), (u, v) in zip(dst_quad, srcq):
        M.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); M.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    coef = la.solve(np.array(M, float), np.array([c for p in srcq for c in p], float))
    return src.convert('RGBA').transform(size, Image.PERSPECTIVE, tuple(coef), Image.BICUBIC)


def mouth(fl, wr):
    S = 1024
    out = Image.new('RGBA', (S, S), (30, 20, 14, 255))
    vx, vy = S // 2, 430  # the tunnel mouth's middle
    hw, hh = 120, 110
    # floor, left wall, right wall, ceiling arch converging on the dark mouth
    out.alpha_composite(quad(fl.resize((512, 2048)), [(vx - hw, vy + hh), (vx + hw, vy + hh), (S + 260, S), (-260, S)], (S, S)))
    out.alpha_composite(quad(wr.resize((1024, 512)), [(-260, -120), (vx - hw, vy - hh), (vx - hw, vy + hh), (-260, S)], (S, S)))
    out.alpha_composite(quad(ImageOps.mirror(wr).resize((1024, 512)), [(vx + hw, vy - hh), (S + 260, -120), (S + 260, S), (vx + hw, vy + hh)], (S, S)))
    ceil = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    cd = ImageDraw.Draw(ceil)
    cd.polygon([(-260, -120), (S + 260, -120), (vx + hw, vy - hh), (vx - hw, vy - hh)], fill=(62, 46, 32, 255))
    out.alpha_composite(ceil)
    d = ImageDraw.Draw(out)
    # the dark beyond, fading in
    dark = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dark)
    for i in range(14):
        k = i / 13
        dd.rectangle((vx - hw * (1 - k * 0.6), vy - hh * (1 - k * 0.6), vx + hw * (1 - k * 0.6), vy + hh * (1 - k * 0.6)),
                     fill=(int(40 * (1 - k)), int(24 * (1 - k)), int(14 * (1 - k)), 255))
    out.alpha_composite(dark)
    # two torches on the walls, warm glow
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for tx, ty, r in ((vx - 250, 330, 120), (vx + 250, 330, 120), (vx - 150, 380, 60), (vx + 150, 380, 60)):
        gd.ellipse((tx - r, ty - r, tx + r, ty + r), fill=(255, 170, 70, 120))
    out.alpha_composite(glow.filter(ImageFilter.GaussianBlur(40)))
    for tx, ty, r in ((vx - 250, 330, 120), (vx + 250, 330, 120), (vx - 150, 380, 60), (vx + 150, 380, 60)):
        s = r / 120
        d.rectangle((tx - 8 * s, ty, tx + 8 * s, ty + 60 * s), fill=(70, 44, 26))
        d.ellipse((tx - 18 * s, ty - 40 * s, tx + 18 * s, ty + 4 * s), fill=(255, 200, 90))
        d.ellipse((tx - 9 * s, ty - 26 * s, tx + 9 * s, ty), fill=(255, 245, 200))
    return out.convert('RGB')


def obstacles():
    W, H = 1536, 1024
    out = Image.new('RGBA', (W, H), MAG + (255,))
    cw, ch = W // 3, H // 2

    def put(im, i, fill=0.78, base=0.86, oval=False):
        if oval:  # a crop out of a painted strip: keep an oval of it so no square corner of its background survives
            m = Image.new('L', im.size, 0)
            ImageDraw.Draw(m).ellipse((0, 0, im.width, im.height * 1.35), fill=255)
            im = im.copy(); im.putalpha(Image.fromarray(np.minimum(np.asarray(im.getchannel('A')), np.asarray(m.filter(ImageFilter.GaussianBlur(3))))))
        k = min(cw * fill / im.width, ch * fill / im.height)
        im = warm(im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS))
        cx, cy = (i % 3) * cw + cw // 2, (i // 3) * ch
        out.alpha_composite(im, (cx - im.width // 2, cy + round(ch * base) - im.height))

    # 0 fallen column lying across the chute (side-on is also how it reads from behind, looking down the chute)
    put(frame('w7c', 'fallen-column'), 0)
    # 1 toppled statue head, from the near strip
    near = rgba(A / 'backdrops/w7-near.webp')
    put(near.crop((1100, 440, 1420, 700)), 1, 0.7, oval=True)
    # 2 low stone beam on two blocks
    beam = Image.new('RGBA', (600, 300), (0, 0, 0, 0))
    blk = frame('w7b', 'push-block').resize((150, 105), Image.LANCZOS)
    beam.alpha_composite(blk, (30, 195)); beam.alpha_composite(blk, (420, 195))
    slab = KIT.crop((320, 906, 890, 994)).resize((600, 92), Image.LANCZOS)
    beam.alpha_composite(slab, (0, 110))
    put(beam, 2)
    # 3 a broken gap with a lip: a band of chute floor, cracked through, dark chasm, the far lip raised
    gap = Image.new('RGBA', (600, 300), (0, 0, 0, 0))
    fl = floor().convert('RGBA')
    gap.alpha_composite(quad(fl.crop((0, 0, 1024, 300)), [(60, 0), (540, 0), (600, 110), (0, 110)], (600, 300)))
    gap.alpha_composite(quad(fl.crop((0, 400, 1024, 700)), [(0, 190), (600, 190), (600, 300), (0, 300)], (600, 300)))
    gd = ImageDraw.Draw(gap)
    pts = [(0, 110)] + [(x, 110 + (12 if (x // 40) % 2 else -6)) for x in range(40, 600, 40)] + [(600, 110), (600, 190)] + \
          [(x, 190 + (10 if (x // 50) % 2 else -8)) for x in range(560, 0, -50)] + [(0, 190)]
    gd.polygon(pts, fill=(18, 10, 6, 255))
    lip = KIT.crop((320, 906, 890, 994)).resize((600, 44), Image.LANCZOS)
    gap.alpha_composite(lip, (0, 70))
    put(gap, 3, 0.9)
    # 4 a small rubble pile, from the kit's crumbled wall
    rub = KIT.crop((1100, 230, 1400, 410))
    put(rub, 4, 0.7, oval=True)
    # 5 a fig-roots tangle on one side
    put(frame('w7c', 'fig-roots'), 5, 0.82)
    return out.convert('RGB')


def chamber():
    W, H = 1792, 768
    far = rgba(A / 'backdrops/w7dusk-far.webp').resize((W, round(868 * W / 2048)), Image.LANCZOS)
    mid = rgba(A / 'backdrops/w7-mid.webp').resize(far.size, Image.LANCZOS)
    out = Image.new('RGBA', (W, H), (40, 28, 20, 255))
    # the chamber's back wall: kit carved wall, darkened, with a lit opening in the roof
    wall = tile(warm(KIT.crop((508, 18, 916, 424)), 0.3).resize((384, 384), Image.LANCZOS), (W, H))
    wall = Image.blend(wall, Image.new('RGBA', (W, H), (60, 40, 26, 255)), 0.35)
    out.alpha_composite(wall)
    out.alpha_composite(warm(mid, 0.35), (0, H - mid.height + 40))
    # golden light shafts from the roof
    rays = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rays)
    for x in (520, 900, 1260):
        rd.polygon([(x - 50, 0), (x + 50, 0), (x + 230, H), (x - 10, H)], fill=(255, 214, 140, 90))
    out.alpha_composite(rays.filter(ImageFilter.GaussianBlur(24)))
    # stone floor
    fl = floor().resize((W, 140))
    out.alpha_composite(fl.convert('RGBA'), (0, H - 120))
    _ = far
    return out.convert('RGB')


if __name__ == '__main__':
    out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    fl, wr, wg = floor(), wall_roots(), wall_glyph()
    fl.save(out / 'floor.png'); wr.save(out / 'wall-roots.png'); wg.save(out / 'wall-glyph.png')
    mouth(fl, wr).save(out / 'mouth.png')
    obstacles().save(out / 'obstacles.png')
    chamber().save(out / 'chamber.png')
    print('ok')
