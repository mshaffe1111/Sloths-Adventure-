"""Start pictures for World 10's painted HF pieces (2026-10-29), for img2img (tools/art/w6to10/img2imggpu.py, Qwen-Image + the style
model). Each start is pasted up from the World 10 kit's own painted pieces (kits/w10.webp: rusty iron post, cracked storm stone;
props-made/w10alt.webp: the riveted stone block of 'spout-b') plus plain shapes for what the kit has no piece of (bolts, rain, spikes),
on a flat key (magenta) or on black for light (bolts, bursts, rain: drawn additively in the game, alpha is taken from brightness).
    python3 -I tools/art/w10/starts.py <out dir>     (-> tools/art/hfbatch/starts/w10/start-w10-*.webp)
"""
import math, random, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

GAME = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else GAME / 'tools/art/hfbatch/starts/w10'
OUT.mkdir(parents=True, exist_ok=True)
KIT = Image.open(GAME / 'src/assets/kits/w10.webp').convert('RGBA')
ALT = Image.open(GAME / 'src/assets/w6to10/props-made/w10alt.webp').convert('RGBA')
MAG = (255, 0, 255, 255)
BLACK = (0, 0, 0, 255)
POST = KIT.crop((400, 0, 500, 540))          # the kit's rusty iron post
STONE = KIT.crop((1016, 610, 1576, 836))       # the kit's cracked storm-grey stone
BLOCK = ALT.crop((130, 433 + 210, 398, 849))   # the riveted stone block under 'spout-b'''s spout


def save(im, name):
    p = OUT / f'start-w10-{name}.webp'
    im.convert('RGB').save(p, 'WEBP', quality=95)
    print(p, im.size)


def shaft(w, h):
    """a rusty iron rod from the kit's post, narrowed"""
    return POST.crop((14, 14, 86, 524)).resize((w, h), Image.LANCZOS)


# ---------------------------------------------------------------- 1. lightning rods, two looks, dull (1024 x 1280, magenta)
def rods():
    im = Image.new('RGBA', (1024, 1280), MAG)
    d = ImageDraw.Draw(im)
    foot_y = 1220
    for i, cx in enumerate((256, 768)):
        blk = BLOCK.resize((250, 190), Image.LANCZOS)
        im.alpha_composite(blk, (cx - 125, foot_y - 190))
        # an iron collar plate on the block
        d.rounded_rectangle((cx - 52, foot_y - 222, cx + 52, foot_y - 186), 6, fill=(58, 56, 60), outline=(20, 18, 22), width=4)
        for rx in (cx - 38, cx + 38):
            d.ellipse((rx - 7, foot_y - 211, rx + 7, foot_y - 197), fill=(92, 88, 92), outline=(20, 18, 22), width=2)
        top = 170 if i == 0 else 230
        im.alpha_composite(shaft(34, foot_y - 222 - top), (cx - 17, top))
        # iron bands down the rod
        for by in range(top + 140, foot_y - 260, 170):
            d.rectangle((cx - 24, by, cx + 24, by + 16), fill=(64, 58, 56), outline=(20, 18, 22), width=3)
        if i == 0:
            # look A: a plain spear tip with two barbs
            d.polygon([(cx, 40), (cx + 26, top + 10), (cx - 26, top + 10)], fill=(70, 66, 70), outline=(20, 18, 22))
            d.line([(cx, 50), (cx - 12, top)], fill=(130, 126, 130), width=4)
            for s in (-1, 1):
                d.polygon([(cx + s * 17, top + 60), (cx + s * 62, top + 20), (cx + s * 17, top + 84)], fill=(66, 60, 60), outline=(20, 18, 22))
        else:
            # look B: a crown of four prongs and a copper coil wound round the upper rod
            d.rectangle((cx - 50, top - 6, cx + 50, top + 22), fill=(60, 56, 60), outline=(20, 18, 22), width=4)
            for px, ph in ((-44, 120), (-15, 170), (15, 170), (44, 120)):
                d.polygon([(cx + px - 9, top), (cx + px, top - ph), (cx + px + 9, top)], fill=(72, 68, 72), outline=(20, 18, 22))
            for k in range(11):
                y = top + 60 + k * 26
                d.rounded_rectangle((cx - 40, y, cx + 40, y + 22), 11, fill=(168, 94, 50), outline=(30, 16, 10), width=4)
                d.line([(cx - 30, y + 6), (cx + 6, y + 6)], fill=(222, 150, 96), width=4)
    save(im, 'rods')


# ---------------------------------------------------------------- 2. bolts (1152 x 1408, black) and bursts (1584 x 336, black)
def bolt_path(rng, x0, y0, y1, wob):
    pts = [(x0, y0)]
    y = y0
    x = x0
    while y < y1:
        y += rng.uniform(40, 90)
        x += rng.uniform(-wob, wob)
        x = min(max(x, x0 - 80), x0 + 80)
        pts.append((x, min(y, y1)))
    return pts


def glow_line(layer, pts, core, halo):
    big = Image.new('L', layer.size, 0)
    ImageDraw.Draw(big).line(pts, fill=255, width=halo, joint='curve')
    big = big.filter(ImageFilter.GaussianBlur(halo * 0.9))
    mid = Image.new('L', layer.size, 0)
    ImageDraw.Draw(mid).line(pts, fill=255, width=core * 2 + 4, joint='curve')
    mid = mid.filter(ImageFilter.GaussianBlur(3))
    cor = Image.new('L', layer.size, 0)
    ImageDraw.Draw(cor).line(pts, fill=255, width=core, joint='curve')
    a = np.asarray(layer).astype(np.float32)
    b, m, c = (np.asarray(x).astype(np.float32)[..., None] / 255 for x in (big, mid, cor))
    a = a + b * np.array([40, 150, 230]) * 0.9
    a = a * (1 - m) + m * np.array([120, 210, 255])
    a = a * (1 - c) + c * np.array([248, 252, 255])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def bolts():
    rng = random.Random(10)
    lay = Image.new('RGB', (1152, 1408), (0, 0, 0))
    for i in range(4):
        cx = 144 + i * 288
        main = bolt_path(rng, cx + rng.uniform(-20, 20), 0, 1400, 40)
        lay = glow_line(lay, main, 14, 46)
        # forks: 2-3 per bolt, each from a different height, different lengths
        for f in range(2 + (i % 2)):
            k = rng.randrange(3, len(main) - 4)
            x, y = main[k]
            side = rng.choice((-1, 1))
            fp = [(x, y)]
            for _ in range(rng.randrange(3, 7)):
                x += side * rng.uniform(14, 40); y += rng.uniform(30, 70)
                x = min(max(x, cx - 112), cx + 112)
                fp.append((x, y))
            lay = glow_line(lay, fp, 6, 22)
    save(lay, 'bolts')


def bursts():
    rng = random.Random(4)
    lay = Image.new('RGB', (1584, 336), (0, 0, 0))
    for i in range(3):
        cx, cy = 264 + i * 528, 300
        if i == 0:   # flash: a bright dome of light with rays
            g = Image.new('L', lay.size, 0)
            ImageDraw.Draw(g).ellipse((cx - 170, cy - 150, cx + 170, cy + 60), fill=255)
            g = g.filter(ImageFilter.GaussianBlur(40))
            a = np.asarray(lay).astype(np.float32) + np.asarray(g)[..., None].astype(np.float32) / 255 * np.array([150, 220, 255])
            lay = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
            for k in range(11):
                ang = math.pi * (0.05 + 0.9 * k / 10) + rng.uniform(-0.08, 0.08)
                r = rng.uniform(110, 250)
                mid = (cx - math.cos(ang + rng.uniform(-0.15, 0.15)) * r * 0.5, cy - 10 - math.sin(ang) * r * 0.45)
                lay = glow_line(lay, [(cx, cy - 10), mid, (cx - math.cos(ang) * r, cy - 10 - math.sin(ang) * r * 0.9)], rng.choice((4, 6, 8)), 18)
            cg = Image.new('L', lay.size, 0)
            ImageDraw.Draw(cg).ellipse((cx - 80, cy - 50, cx + 80, cy + 20), fill=255)
            cg = cg.filter(ImageFilter.GaussianBlur(14))
            a = np.asarray(lay).astype(np.float32)
            m = np.asarray(cg).astype(np.float32)[..., None] / 255
            lay = Image.fromarray(np.clip(a * (1 - m) + m * np.array([250, 253, 255]), 0, 255).astype(np.uint8))
        elif i == 1:  # crackle: short jagged arcs along the floor and up, sparks
            for k in range(6):
                side = -1 if k % 2 else 1
                pts = [(cx, cy - 6)]
                x, y = cx, cy - 6
                for _ in range(5):
                    x += side * rng.uniform(25, 45); y -= rng.uniform(-8, 30)
                    pts.append((x, y))
                lay = glow_line(lay, pts, 5, 16)
            d = ImageDraw.Draw(lay)
            for _ in range(26):
                x = cx + rng.uniform(-200, 200); y = cy - rng.uniform(10, 200)
                d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=(200, 240, 255))
        else:        # fade: a dim glow, a few sparks, a thin curl of grey smoke
            g = Image.new('L', lay.size, 0)
            ImageDraw.Draw(g).ellipse((cx - 110, cy - 60, cx + 110, cy + 30), fill=150)
            g = g.filter(ImageFilter.GaussianBlur(30))
            a = np.asarray(lay).astype(np.float32) + np.asarray(g)[..., None].astype(np.float32) / 255 * np.array([60, 120, 170])
            lay = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
            d = ImageDraw.Draw(lay)
            for _ in range(10):
                x = cx + rng.uniform(-150, 150); y = cy - rng.uniform(20, 160)
                d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=(150, 210, 240))
            sm = Image.new('L', lay.size, 0)
            sd = ImageDraw.Draw(sm)
            for k in range(14):
                y = cy - 20 - k * 16
                x = cx + math.sin(k * 0.6) * 30
                sd.ellipse((x - 26 + k, y - 18, x + 26 - k, y + 18), fill=90)
            sm = sm.filter(ImageFilter.GaussianBlur(10))
            a = np.asarray(lay).astype(np.float32) + np.asarray(sm)[..., None].astype(np.float32) / 255 * np.array([120, 125, 135])
            lay = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    save(lay, 'bursts')


# ---------------------------------------------------------------- 3. spike bed (1536 x 352, magenta): strip 1120 wide (1024 period + 96
# of overlap for the seam blend) and the two end caps
def spike(d, x, base_y, h, w, lean, rng):
    tip = (x + lean, base_y - h)
    d.polygon([(x - w / 2, base_y), tip, (x + w / 2, base_y)], fill=(86, 70, 64), outline=(18, 14, 14))
    d.line([(x - w / 6, base_y - 4), (tip[0] - 2, tip[1] + 10)], fill=(150, 140, 136), width=3)
    for _ in range(3):  # rust patches
        t = rng.uniform(0.15, 0.7)
        px = x + lean * t + rng.uniform(-w * 0.25, w * 0.25) * (1 - t); py = base_y - h * t
        d.ellipse((px - 5, py - 7, px + 5, py + 7), fill=(150, 72, 36))


def spikebed():
    rng = random.Random(3)
    im = Image.new('RGBA', (1536, 352), MAG)
    d = ImageDraw.Draw(im)
    top, bot = 236, 316
    heights = [rng.uniform(120, 170) for _ in range(16)]
    leans = [rng.uniform(-14, 14) for _ in range(16)]
    widths = [rng.uniform(44, 56) for _ in range(16)]

    def base(x0, x1):
        d.rectangle((x0, top, x1, bot), fill=(46, 42, 46))
        d.rectangle((x0, top, x1, top + 12), fill=(84, 76, 74))
        d.line([(x0, bot - 10), (x1, bot - 10)], fill=(30, 26, 30), width=4)

    base(0, 1120)
    for k in range(18):  # periodic: spike k and k+16 are the same spike, so the overlap repeats the start of the strip
        x = 32 + k * 64
        if x > 1120 + 30:
            break
        j = k % 16
        spike(d, x, top + 4, heights[j], widths[j], leans[j], random.Random(j))
    for x in range(16, 1120, 64):  # rivets on the base
        d.ellipse((x - 7, top + 32, x + 7, top + 46), fill=(104, 98, 98), outline=(18, 14, 14), width=2)
    d.line([(0, top), (1120, top)], fill=(18, 14, 14), width=4)
    d.line([(0, bot), (1120, bot)], fill=(18, 14, 14), width=4)
    # end caps: a bolted iron bracket ending the base, two spikes stepping down
    for x0, s in ((1190, 1), (1530, -1)):  # left cap: base runs to the right; right cap: base runs to the left
        xa, xb = (x0, x0 + 150) if s == 1 else (x0 - 150, x0)
        d.rectangle((xa, top, xb, bot), fill=(46, 42, 46))
        d.rectangle((xa, top, xb, top + 12), fill=(84, 76, 74))
        end = xa if s == 1 else xb
        d.rounded_rectangle((end - 14, top - 18, end + 14, bot + 4), 6, fill=(60, 56, 58), outline=(18, 14, 14), width=4)
        d.ellipse((end - 7, top + 6, end + 7, top + 20), fill=(110, 104, 104), outline=(18, 14, 14), width=2)
        d.ellipse((end - 7, bot - 26, end + 7, bot - 12), fill=(110, 104, 104), outline=(18, 14, 14), width=2)
        for k, h in enumerate((70, 110)):
            spike(d, end + s * (42 + k * 52), top + 4, h, 46, s * 6, random.Random(40 + k + x0))
        d.line([(xa, top), (xb, top)], fill=(18, 14, 14), width=4)
        d.line([(xa, bot), (xb, bot)], fill=(18, 14, 14), width=4)
    save(im, 'spikes')


# ---------------------------------------------------------------- 4. rampart slab, rubble and the scorch decal (1024 x 640, magenta)
def rampart():
    rng = random.Random(7)
    im = Image.new('RGBA', (1024, 640), MAG)
    d = ImageDraw.Draw(im)
    x0, y0, w, h = 30, 40, 660, 280
    face = STONE.resize((w, h), Image.LANCZOS)
    im.alpha_composite(face, (x0, y0))
    # dressed blocks: two courses of cut stone
    for yy in (y0 + 30, y0 + 160):
        d.line([(x0, yy), (x0 + w, yy)], fill=(26, 24, 28), width=5)
    for xx in (x0 + 170, x0 + 390, x0 + 560):
        d.line([(xx, y0 + 30), (xx, y0 + 160)], fill=(26, 24, 28), width=5)
    for xx in (x0 + 90, x0 + 300, x0 + 480):
        d.line([(xx, y0 + 160 + 40), (xx, y0 + h)], fill=(26, 24, 28), width=5)
    # the cap course on top (where Pokey stands): a lighter worn top
    d.rectangle((x0, y0, x0 + w, y0 + 30), fill=(122, 120, 124))
    d.line([(x0, y0 + 6), (x0 + w, y0 + 6)], fill=(150, 148, 150), width=4)
    # the iron band with rivets
    d.rectangle((x0, y0 + 160, x0 + w, y0 + 200), fill=(58, 52, 52), outline=(20, 16, 18), width=4)
    for xx in range(x0 + 30, x0 + w, 70):
        d.ellipse((xx - 8, y0 + 172, xx + 8, y0 + 188), fill=(110, 100, 98), outline=(20, 16, 18), width=2)
    for _ in range(7):
        xx = x0 + rng.uniform(20, w - 20)
        d.line([(xx, y0 + 196), (xx + rng.uniform(-3, 3), y0 + 196 + rng.uniform(16, 50))], fill=(120, 66, 40), width=rng.choice((3, 4, 5)))
    d.rectangle((x0, y0, x0 + w, y0 + h), outline=(20, 16, 18), width=5)
    # rubble: four chunks of the same stone
    for k, (cx, cy, r) in enumerate(((790, 110, 70), (930, 120, 52), (800, 270, 48), (930, 280, 62))):
        pts = [(cx + math.cos(a) * r * rng.uniform(0.65, 1.0), cy + math.sin(a) * r * rng.uniform(0.6, 0.95))
               for a in sorted(rng.uniform(0, 2 * math.pi) for _ in range(7))]
        m = Image.new('L', im.size, 0); ImageDraw.Draw(m).polygon(pts, fill=255)
        tex = Image.new('RGBA', im.size, (0, 0, 0, 0)); tex.paste(STONE.crop((k * 120, 20, k * 120 + 200, 200)), (cx - 100, cy - 90))
        im.paste(tex, (0, 0), Image.fromarray(np.minimum(np.asarray(m), np.asarray(tex.getchannel('A')))))
        d.polygon(pts, outline=(20, 16, 18), width=4)
        if k % 2 == 0:
            d.line([pts[0], pts[1]], fill=(140, 138, 142), width=4)
    # scorch decal: dark soot burnt onto a plain patch of storm stone (cut later by how much darker than the stone it is), embers
    pw, ph = 560, 170
    patch = STONE.crop((0, 40, 560, 210)).convert('RGBA')
    pa = np.asarray(patch).astype(np.float32)
    pa[..., :3] = pa[..., :3] * 0.35 + np.array([104, 102, 106]) * 0.65  # a pale even stone, so the soot reads against it
    patch = Image.fromarray(pa.astype(np.uint8))
    m = Image.new('L', (pw, ph), 0)
    md = ImageDraw.Draw(m)
    md.ellipse((50, 60, 510, 140), fill=255)
    for _ in range(14):
        x = rng.uniform(70, 490); md.ellipse((x - 40, rng.uniform(50, 80), x + 40, rng.uniform(120, 145)), fill=200)
    for _ in range(8):  # streaks thrown out sideways
        x = rng.uniform(80, 480); md.line([(x, 100), (x + rng.uniform(-90, 90), 100 + rng.uniform(-30, 30))], fill=180, width=8)
    m = m.filter(ImageFilter.GaussianBlur(10))
    patch.paste((40, 34, 36, 255), (0, 0), m)
    core = m.point(lambda v: max(0, v * 2 - 255)).filter(ImageFilter.GaussianBlur(10))
    patch.paste((14, 12, 14, 255), (0, 0), core)
    sd = ImageDraw.Draw(patch)
    for _ in range(18):
        x = rng.uniform(170, 390); y = rng.uniform(85, 115)
        sd.ellipse((x - 3, y - 2, x + 3, y + 2), fill=(240, 120, 40, 255))
    im.alpha_composite(patch, (40, 420))
    d.rectangle((40, 420, 40 + pw, 420 + ph), outline=(20, 16, 18), width=4)
    save(im, 'rampart')


# ---------------------------------------------------------------- 5. storm wind: three sheets of wind-driven rain (1280 x 1584, black)
def wind():
    """three sheets, each 1408 wide: a 1280 period and 128 of overlap (the streaks wrap), so the cut can blend the seam away"""
    rng = random.Random(21)
    W, P = 1408, 1280
    lay = Image.new('RGB', (W, 1584), (0, 0, 0))
    for row in range(3):
        y0 = row * 528
        g = Image.new('L', lay.size, 0)
        d = ImageDraw.Draw(g)
        n = (150, 100, 200)[row]
        slant = (0.42, 0.55, 0.35)[row]
        for _ in range(n):
            # streaks bunch into gusts: most of them near a few wavy bands
            band = rng.choice((0.25, 0.5, 0.8, rng.random()))
            x = rng.uniform(0, P); y = y0 + 20 + band * 470 + rng.gauss(0, 50) + math.sin(x / 200 + row) * 30
            y = min(max(y, y0 + 10), y0 + 510)
            ln = rng.choice((rng.uniform(30, 70), rng.uniform(70, 180)))
            curve = rng.uniform(-0.25, 0.25)
            pts = [(x + ln * t / 6, y + ln * (slant + curve * t / 6) * t / 6) for t in range(7)]
            for off in (0, P, -P):
                d.line([(px + off, py) for px, py in pts], fill=int(rng.uniform(80, 230)), width=rng.choice((1, 2, 3, 3, 4, 5)))
        g = g.filter(ImageFilter.GaussianBlur(1.4))
        a = np.asarray(lay).astype(np.float32) + np.asarray(g)[..., None].astype(np.float32) / 255 * np.array([190, 215, 235])
        lay = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        dd = ImageDraw.Draw(lay)
        for k in range((3, 2, 4)[row]):  # blown leaves and a scrap of red cloth, kept out of the overlap
            cx, cy = rng.uniform(200, P - 100), rng.uniform(y0 + 80, y0 + 450)
            ang = rng.uniform(-0.6, 0.6)
            if k == 0 and row != 1:
                pts = [(cx - 40, cy - 8), (cx - 5, cy - 16 + ang * 10), (cx + 42, cy - 4), (cx + 30, cy + 6), (cx - 4, cy + 4 - ang * 8),
                       (cx - 36, cy + 10)]
                dd.polygon(pts, fill=(150, 40, 36), outline=(30, 10, 10))
            else:
                r = rng.uniform(14, 24)
                dd.polygon([(cx - r, cy + ang * r), (cx, cy - r * 0.45), (cx + r, cy - ang * r), (cx, cy + r * 0.45)],
                           fill=rng.choice(((110, 120, 50), (130, 96, 44), (90, 110, 50))), outline=(24, 26, 10))
    save(lay, 'wind')


if __name__ == '__main__':
    rods(); bolts(); bursts(); spikebed(); rampart(); wind()
