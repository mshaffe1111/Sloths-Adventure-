"""Round 2 starts for 7-4 (2026-10-29), after the w7-slide builder's art list (origin/w7-slide,
reference/prop-sheets/qa-notes/7-4-slide-mockup/README.md): three lanes, so a floor with two grooves; a ceiling; the bright way out; the
obstacles it still needs (a lintel to duck under, low wide rubble, a gap's near and far lip); the floor crumbling side-on in four frames;
the chamber with the chute's mouth in its wall.

    python3 -I tools/art/w7slide/envstarts2.py <out dir>

The floor and ceiling starts are laid out on a torus (every shape drawn again one picture over), so only the paint can bring a seam.
"""
import random, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, str(Path(__file__).resolve().parent))
from envstarts import KIT, MAG, A, frame, quad, rgba, stone_fill, warm  # noqa: E402

S = 1024


def wrap_fill(seed, k=0.55, tint=(196, 170, 128)):
    a = np.asarray(stone_fill((S, S), seed)).astype(np.float32)
    r = np.roll(np.roll(a, S // 2, 0), S // 2, 1)
    x = np.minimum(np.arange(S), np.arange(S)[::-1]) / (S * 0.25)
    w = np.clip(np.minimum.outer(x, x), 0, 1)[..., None]
    a = a * w + r * (1 - w)
    return Image.fromarray((a * (1 - k) + np.array(tint) * k).clip(0, 255).astype(np.uint8))


def torus_rects(d, rects, **kw):
    for x0, y0, x1, y1 in rects:
        for dx in (-S, 0, S):
            for dy in (-S, 0, S):
                d.rectangle((x0 + dx, y0 + dy, x1 + dx, y1 + dy), **kw)


def slabs(d, rng, joint, moss, courses=(200, 168, 224, 176, 256)):
    y = 0
    rects = []
    for h in courses:  # sums to 1024: the courses wrap top to bottom
        x = rng.randrange(0, 200)
        start = x
        while x < start + S:
            w = rng.randrange(230, 360)
            w = min(w, start + S - x)
            rects.append((x, y, x + w, y + h))
            x += w
        y += h
    torus_rects(d, rects, outline=joint, width=6)
    for x0, y0, x1, y1 in rects:
        for _ in range(4):
            mx = rng.randrange(x0, x1)
            for dx in (-S, 0, S):
                d.ellipse((mx - 18 + dx, y0 - 7, mx + 18 + dx, y0 + 7), fill=moss)


def floor2():
    im = wrap_fill(11)
    d = ImageDraw.Draw(im)
    slabs(d, random.Random(4), (78, 62, 44), (104, 128, 56))
    for gx in (S // 3, 2 * S // 3):  # two grooves: the joins between the three lanes
        d.rectangle((gx - 30, 0, gx + 30, S), fill=(150, 126, 92))
        d.rectangle((gx - 30, 0, gx - 22, S), fill=(92, 74, 52))
        d.rectangle((gx + 22, 0, gx + 30, S), fill=(214, 190, 146))
    return im.filter(ImageFilter.GaussianBlur(1.5))


def ceiling():
    im = wrap_fill(23, 0.7, (78, 64, 50))
    d = ImageDraw.Draw(im)
    slabs(d, random.Random(9), (34, 26, 20), (70, 92, 44), courses=(256, 256, 256, 256))
    rng = random.Random(5)
    for _ in range(7):  # roots running across the ceiling, wrapped
        x, y = rng.randrange(S), rng.randrange(S)
        pts = []
        for i in range(14):
            pts.append((x, y))
            x += rng.randrange(40, 90); y += rng.randrange(-40, 40)
        for dx in (-S, 0, S):
            for dy in (-S, 0, S):
                d.line([(px + dx - S // 2, py + dy) for px, py in pts], fill=(92, 60, 38), width=rng.choice((10, 14, 18)), joint='curve')
    return im.filter(ImageFilter.GaussianBlur(1.2))


def mouth_bright(fl, wr):
    out = Image.new('RGBA', (S, S), (40, 30, 22, 255))
    vx, vy, hw, hh = S // 2, 430, 130, 120
    out.alpha_composite(quad(fl.resize((512, 2048)), [(vx - hw, vy + hh), (vx + hw, vy + hh), (S + 260, S), (-260, S)], (S, S)))
    out.alpha_composite(quad(wr.resize((1024, 512)), [(-260, -120), (vx - hw, vy - hh), (vx - hw, vy + hh), (-260, S)], (S, S)))
    out.alpha_composite(quad(wr.transpose(Image.FLIP_LEFT_RIGHT).resize((1024, 512)), [(vx + hw, vy - hh), (S + 260, -120), (S + 260, S), (vx + hw, vy + hh)], (S, S)))
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(c).polygon([(-260, -120), (S + 260, -120), (vx + hw, vy - hh), (vx - hw, vy - hh)], fill=(58, 44, 32, 255))
    out.alpha_composite(c)
    d = ImageDraw.Draw(out)
    # the way out: bright daylight, green leaves round its edge
    d.rectangle((vx - hw, vy - hh, vx + hw, vy + hh), fill=(255, 248, 214))
    rng = random.Random(3)
    for _ in range(40):
        ex = vx + rng.choice((-1, 1)) * rng.randrange(hw - 30, hw + 10)
        ey = vy + rng.randrange(-hh, hh)
        if rng.random() < 0.4:
            ex, ey = vx + rng.randrange(-hw, hw), vy - hh + rng.randrange(-10, 30)
        d.ellipse((ex - 22, ey - 12, ex + 22, ey + 12), fill=rng.choice([(84, 150, 52), (120, 180, 60), (60, 120, 44)]))
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(glow).polygon([(vx - hw, vy + hh), (vx + hw, vy + hh), (vx + 320, S), (vx - 320, S)], fill=(255, 230, 160, 110))
    ImageDraw.Draw(glow).ellipse((vx - 330, vy - 300, vx + 330, vy + 300), fill=(255, 236, 170, 90))
    out.alpha_composite(glow.filter(ImageFilter.GaussianBlur(50)))
    return out.convert('RGB')


def obstacles2(fl):
    W, H = 1536, 1024
    out = Image.new('RGBA', (W, H), MAG + (255,))
    cw, ch = W // 3, H // 2

    def put(im, i, fill=0.8, base=0.88):
        k = min(cw * fill / im.width, ch * fill / im.height)
        im = warm(im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS))
        cx, cy = (i % 3) * cw + cw // 2, (i // 3) * ch
        out.alpha_composite(im, (cx - im.width // 2, cy + round(ch * base) - im.height))

    slab = KIT.crop((1370, 904, 1940, 994))  # the kit's plain carved slab (the other one is cracked)
    pillar = KIT.crop((1432, 6, 1548, 388))  # the kit's column with the fig vine
    for i, (pw, ph) in enumerate(((70, 260), (90, 230))):  # 0, 3: a lintel on two posts, open below (duck under it)
        g = Image.new('RGBA', (600, 420), (0, 0, 0, 0))
        p = pillar.resize((pw, ph), Image.LANCZOS)
        g.alpha_composite(p, (40, 420 - ph)); g.alpha_composite(p, (600 - 40 - pw, 420 - ph))
        g.alpha_composite(slab.resize((600, 110 if i == 0 else 130), Image.LANCZOS), (0, 420 - ph - (100 if i == 0 else 120)))
        put(g, 0 if i == 0 else 3)
    blk, stump = frame('w7b', 'push-block'), frame('w7var', 'stump-b')
    for i, seed in ((1, 2), (4, 8)):  # 1, 4: low wide rubble across the chute
        rng = random.Random(seed)
        g = Image.new('RGBA', (900, 300), (0, 0, 0, 0))
        for _ in range(11):
            src = rng.choice((blk, stump))
            s = rng.uniform(0.6, 0.95)
            b = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS).rotate(rng.uniform(-18, 18), expand=True)
            g.alpha_composite(b, (rng.randrange(0, 900 - b.width), 300 - b.height - rng.randrange(0, 40)))
        put(g, i, 0.9)
    # 2: the near lip, the floor ending in a broken edge with the dark beyond; 5: the far lip, the broken front face of the floor
    near = Image.new('RGBA', (600, 260), (0, 0, 0, 0))
    near.alpha_composite(quad(fl.convert('RGBA').crop((0, 0, 1024, 600)), [(70, 40), (530, 40), (600, 260), (0, 260)], (600, 260)))
    nd = ImageDraw.Draw(near)
    rng = random.Random(6)
    edge = [(0, 0), (600, 0)] + [(x, 40 + rng.randrange(0, 46)) for x in range(600, -1, -40)]
    nd.polygon(edge, fill=(0, 0, 0, 0))
    put(near, 2, 0.9)
    far = Image.new('RGBA', (600, 260), (0, 0, 0, 0))
    far.alpha_composite(quad(fl.convert('RGBA').crop((0, 300, 1024, 700)), [(40, 0), (560, 0), (600, 90), (0, 90)], (600, 260)))
    fd = ImageDraw.Draw(far)
    top = [(x, 80 + rng.randrange(0, 26)) for x in range(0, 601, 30)]
    fd.polygon(top + [(600, 260), (0, 260)], fill=(96, 80, 60, 255))
    for _ in range(14):
        x = rng.randrange(0, 600)
        fd.line([(x, 100), (x + rng.randrange(-30, 30), 250)], fill=(52, 42, 32, 255), width=4)
    fd.polygon([(0, 200), (600, 200), (600, 260), (0, 260)], fill=(28, 20, 14, 255))
    put(far, 5, 0.9)
    return out.convert('RGB')


def crumble():
    """the hall's floor side-on: whole, cracked, breaking, falling (four cells on magenta)"""
    W, H = 1536, 512
    out = Image.new('RGBA', (W, H), MAG + (255,))
    piece = warm(KIT.crop((0, 668, 560, 1000)))
    solid = Image.new('RGBA', piece.size, (92, 78, 60, 255)); solid.alpha_composite(piece); piece = solid  # no see-through slivers
    piece = piece.resize((300, 178), Image.LANCZOS)
    rng = random.Random(2)
    cuts = [0, 96, 204, 300]
    for f in range(4):
        cx = f * 384 + 42
        y0 = 110
        if f == 0:
            out.alpha_composite(piece, (cx, y0)); continue
        if f == 1:
            p = piece.copy(); d = ImageDraw.Draw(p)
            for x in (96, 204):
                pts = [(x + rng.randrange(-8, 8), yy) for yy in range(0, 179, 22)]
                d.line(pts, fill=(30, 20, 14, 255), width=5)
            out.alpha_composite(p, (cx, y0)); continue
        for j in range(3):
            chunk = piece.crop((cuts[j], 0, cuts[j + 1], 178))
            ang = (j - 1) * (8 if f == 2 else 22) + rng.uniform(-4, 4)
            drop = (12 + 10 * j) if f == 2 else (60 + 22 * j)
            gapx = (j - 1) * (8 if f == 2 else 14)
            ch = chunk.rotate(ang, expand=True)
            out.alpha_composite(ch, (cx + cuts[j] + gapx - (ch.width - chunk.width) // 2, y0 + drop - (ch.height - 178) // 2))
        for _ in range(8 if f == 2 else 14):  # small stones falling with it
            s = rng.randrange(10, 26)
            x, y = cx + rng.randrange(20, 290), y0 + 190 + rng.randrange(0, 50 if f == 2 else 80)
            ImageDraw.Draw(out).ellipse((x, y, x + s, y + s * 0.8), fill=(150, 136, 110, 255), outline=(50, 40, 30, 255), width=2)
    return out.convert('RGB')


def chamber2():
    W, H = 1792, 768
    mid = rgba(A / 'backdrops/w7-mid.webp').resize((W, round(868 * W / 2048)), Image.LANCZOS)
    out = Image.new('RGBA', (W, H), (40, 28, 20, 255))
    from envstarts import tile
    wall = tile(warm(KIT.crop((508, 18, 916, 424)), 0.3).resize((384, 384), Image.LANCZOS), (W, H))
    out.alpha_composite(Image.blend(wall, Image.new('RGBA', (W, H), (60, 40, 26, 255)), 0.35))
    out.alpha_composite(warm(mid, 0.35), (0, H - mid.height + 40))
    rays = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(rays)
    for x in (760, 1100, 1420):
        rd.polygon([(x - 50, 0), (x + 50, 0), (x + 230, H), (x - 10, H)], fill=(255, 214, 140, 90))
    out.alpha_composite(rays.filter(ImageFilter.GaussianBlur(24)))
    d = ImageDraw.Draw(out)
    # the chute's mouth high in the left wall: a dark round-topped opening with a carved stone spout under it
    d.rectangle((60, 250, 400, 560), fill=(70, 56, 42, 255))
    d.rounded_rectangle((100, 280, 360, 540), radius=120, fill=(14, 9, 6, 255))
    spout = KIT.crop((1370, 904, 1940, 994)).resize((420, 70), Image.LANCZOS)
    out.alpha_composite(spout, (40, 530))
    d.polygon([(70, 600), (450, 600), (520, 640), (70, 640)], fill=(96, 80, 62, 255))
    fl = stone_fill((W, 130), 31)
    fa = (np.asarray(fl).astype(np.float32) * 0.55 + np.array([196, 170, 128]) * 0.45).clip(0, 255).astype(np.uint8)
    out.alpha_composite(Image.fromarray(fa).convert('RGBA'), (0, H - 112))
    return out.convert('RGB')


if __name__ == '__main__':
    o = Path(sys.argv[1]); o.mkdir(parents=True, exist_ok=True)
    f2 = floor2(); f2.save(o / 'floor2.jpg', quality=92)
    ceiling().save(o / 'ceiling.jpg', quality=92)
    wr = Image.open(Path(__file__).resolve().parents[3] / 'reference/prop-sheets/qa-notes/7-4-slide-art/starts/wall-roots.jpg').convert('RGB')
    mouth_bright(f2, wr).save(o / 'mouth-bright.jpg', quality=92)
    obstacles2(f2).save(o / 'obstacles2.jpg', quality=92)
    crumble().save(o / 'crumble.jpg', quality=92)
    chamber2().save(o / 'chamber2.jpg', quality=92)
    print('ok')
