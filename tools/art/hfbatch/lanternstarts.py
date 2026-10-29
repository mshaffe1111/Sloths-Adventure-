"""Starts for 8-4 Lantern Run's Hugging Face art (2026-10-29): flat side-on sketches on magenta that lanterngpu.py repaints by img2img.
    python3 -I tools/art/hfbatch/lanternstarts.py <out dir> [frames...]
  jar.png         a glass jar of fireflies: cork, twine round the neck and a twine handle, glowing dots inside
  jar-dim.png     the same, nearly out (two faint dots)
  moth-open.png   a pale night moth seen from the side and a little above, wings spread
  moth-up.png     the same, wings raised
  pokey-<f>.png   Pokey's standard frame <f> (src/assets/hero/hero-standard.webp) on magenta, the jar pasted at his chest between his
                  paws (the repaint wraps his arms round it)
"""
import math, re, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
MAG = (255, 0, 255)


def jar(size=512, lit=1.0):
    im = Image.new('RGB', (size, size), MAG)
    d = ImageDraw.Draw(im)
    s = size / 512
    x0, y0, x1, y1 = 136 * s, 150 * s, 376 * s, 440 * s
    # glow inside (warm yellow, brighter in the middle)
    glow = Image.new('L', (size, size), 0)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((x0 + 20 * s, y0 + 40 * s, x1 - 20 * s, y1 - 20 * s), fill=int(255 * lit))
    glow = glow.filter(ImageFilter.GaussianBlur(40 * s))
    body = Image.new('RGB', (size, size), (200, 225, 235) if lit < 0.5 else (250, 236, 150))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((x0, y0, x1, y1), radius=60 * s, fill=255)
    pane = Image.new('RGB', (size, size), (150, 180, 200))
    pane = Image.composite(body, pane, glow)
    im.paste(pane, (0, 0), mask)
    d.rounded_rectangle((x0, y0, x1, y1), radius=60 * s, outline=(40, 40, 60), width=int(6 * s))
    # glass highlight
    d.rounded_rectangle((x0 + 22 * s, y0 + 40 * s, x0 + 44 * s, y1 - 60 * s), radius=10 * s, fill=(245, 250, 255))
    # neck, cork and twine
    d.rectangle((180 * s, 118 * s, 332 * s, 156 * s), fill=(150, 180, 200), outline=(40, 40, 60), width=int(5 * s))
    d.rounded_rectangle((192 * s, 78 * s, 320 * s, 122 * s), radius=10 * s, fill=(176, 128, 80), outline=(60, 40, 30), width=int(5 * s))
    d.rectangle((176 * s, 128 * s, 336 * s, 144 * s), fill=(196, 160, 100), outline=(80, 60, 30), width=int(3 * s))
    d.arc((170 * s, 20 * s, 342 * s, 200 * s), 190, 350, fill=(196, 160, 100), width=int(8 * s))
    # fireflies
    n = 9 if lit > 0.5 else 2
    for k in range(n):
        a = k * 2.399
        fx = 256 * s + math.cos(a) * (40 + 12 * k) * s * 0.9
        fy = 300 * s + math.sin(a) * (30 + 9 * k) * s
        r = 9 * s
        d.ellipse((fx - r, fy - r, fx + r, fy + r), fill=(255, 255, 210) if lit > 0.5 else (230, 220, 140))
    return im


def moth(up=False, size=512):
    im = Image.new('RGB', (size, size), MAG)
    d = ImageDraw.Draw(im)
    cx, cy = 256, 280
    lift = -120 if up else 0
    for sx in (-1, 1):
        # forewing and hindwing, pale cream-lilac with darker veins and an eye spot
        fw = [(cx, cy - 10), (cx + sx * 200, cy - 110 + lift), (cx + sx * 220, cy - 30 + lift * 0.6), (cx + sx * 60, cy + 10)]
        hw = [(cx, cy + 5), (cx + sx * 150, cy + 40 + lift * 0.4), (cx + sx * 120, cy + 120 + lift * 0.2), (cx + sx * 30, cy + 60)]
        d.polygon(hw, fill=(214, 200, 220), outline=(50, 40, 70))
        d.polygon(fw, fill=(236, 228, 210), outline=(50, 40, 70))
        ex, ey = cx + sx * 130, cy - 55 + lift * 0.7
        d.ellipse((ex - 22, ey - 22, ex + 22, ey + 22), fill=(170, 150, 190), outline=(60, 50, 80), width=3)
        d.ellipse((ex - 9, ey - 9, ex + 9, ey + 9), fill=(70, 55, 90))
    d.ellipse((cx - 22, cy - 50, cx + 22, cy + 90), fill=(150, 125, 100), outline=(50, 40, 30), width=4)
    d.ellipse((cx - 20, cy - 80, cx + 20, cy - 40), fill=(165, 140, 110), outline=(50, 40, 30), width=4)
    for sx in (-1, 1):
        d.line((cx + sx * 8, cy - 76, cx + sx * 50, cy - 140), fill=(80, 60, 40), width=5)
    return im


def frames():
    src = (ROOT / 'src/game/heroStandardData.ts').read_text()
    fr = {m[0]: tuple(float(v) for v in m[1:]) for m in re.findall(r"(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+), ax: ([\d.]+), ay: ([\d.]+), hx: ([\d.]+)", src)}
    return fr


def pokey(name, fr, size=768, arms=True):
    x, y, w, h, ax, ay, hx = fr[name]
    atlas = Image.open(ROOT / 'src/assets/hero/hero-standard.webp').convert('RGBA')
    c = atlas.crop((int(x), int(y), int(x + w), int(y + h)))
    k = (size * 0.86) / 250  # every frame the same scale (the tallest frames are ~250 atlas px)
    c = c.resize((round(w * k), round(h * k)), Image.LANCZOS)
    im = Image.new('RGBA', (size, size), MAG + (255,))
    # feet anchor at 90% down, the anchor x in the middle
    ox, oy = round(size / 2 - ax * k), round(size * 0.92 - ay * k)
    im.alpha_composite(c, (ox, oy))
    # the painted jar (round 1's pick) if it is there, else the sketch; its magenta keyed out
    pj = OUT / 'jar-painted.png'
    j = (Image.open(pj) if pj.exists() else jar(512)).convert('RGBA')
    px = j.load()
    for yy in range(j.height):
        for xx in range(j.width):
            r, g, b, _ = px[xx, yy]
            if r > 200 and b > 200 and g < 90:
                px[xx, yy] = (0, 0, 0, 0)
    js = round(0.40 * 130 * k)
    j = j.resize((js, js), Image.LANCZOS)
    # at his belly: across from the middle of the torso, a little forward (he faces right)
    jx = round(ox + hx * k + 0.10 * w * k - js / 2)
    jy = round(oy + 0.56 * h * k - js / 2)
    if arms:
        # rough arms round it (fur brown, cream wrist wraps, paws on the jar): the repaint makes them his
        d = ImageDraw.Draw(im)
        fur, wrap, paw = (150, 95, 55), (235, 215, 180), (110, 70, 40)
        bw = 110 * k  # his body's width
        sh_far = (ox + hx * k + 0.25 * bw, oy + 0.36 * h * k)
        hand_far = (jx + js * 0.92, jy + js * 0.55)
        d.line([sh_far, hand_far], fill=fur, width=round(26 * k))
        d.ellipse((hand_far[0] - 13 * k, hand_far[1] - 13 * k, hand_far[0] + 13 * k, hand_far[1] + 13 * k), fill=paw)
    im.alpha_composite(j, (jx, jy))
    if arms:
        sh_near = (ox + hx * k - 0.30 * bw, oy + 0.37 * h * k)
        elbow = (jx - 0.05 * js, jy + js * 0.95)
        hand = (jx + js * 0.35, jy + js * 0.78)
        d = ImageDraw.Draw(im)
        d.line([sh_near, elbow, hand], fill=fur, width=round(28 * k), joint='curve')
        d.line([(elbow[0] + (hand[0] - elbow[0]) * 0.55, elbow[1] + (hand[1] - elbow[1]) * 0.55), (elbow[0] + (hand[0] - elbow[0]) * 0.75, elbow[1] + (hand[1] - elbow[1]) * 0.75)], fill=wrap, width=round(30 * k))
        d.ellipse((hand[0] - 15 * k, hand[1] - 13 * k, hand[0] + 15 * k, hand[1] + 13 * k), fill=paw)
    return im.convert('RGB')


if __name__ == '__main__' and not (len(sys.argv) > 2 and sys.argv[2] in ('--carry', '--r3')):
    jar().save(OUT / 'jar.png')
    jar(lit=0.15).save(OUT / 'jar-dim.png')
    moth().save(OUT / 'moth-open.png')
    moth(up=True).save(OUT / 'moth-up.png')
    fr = frames()
    for n in sys.argv[2:]:
        pokey(n, fr).save(OUT / f'pokey-{n}.png')
    print(sorted(p.name for p in OUT.iterdir()))


def carry(name, size=768):
    """Pokey's carry pose <name> (the puzzle kit's p3, p5-p8: an acorn hugged at his chest) on magenta, the painted jar over the acorn"""
    src = (ROOT / 'src/game/puzzleAtlasData.ts').read_text()
    m = re.search(rf"  {name}: \{{ x: (\d+), y: (\d+), w: (\d+), h: (\d+), ax: (\d+), k: ([\d.]+), hx: (\d+), hy: (\d+)", src)
    x, y, w, h, ax, kk, hx, hy = (float(v) for v in m.groups())
    kit = Image.open(ROOT / 'src/assets/props/puzzle-kit.webp').convert('RGBA')
    c = kit.crop((int(x), int(y), int(x + w), int(y + h)))
    k = (size * 0.80) / 170
    c = c.resize((round(w * k), round(h * k)), Image.LANCZOS)
    im = Image.new('RGBA', (size, size), MAG + (255,))
    ox, oy = round(size / 2 - ax * k), round(size * 0.92 - h * k)
    im.alpha_composite(c, (ox, oy))
    pj = OUT / 'jar-painted.png'
    j = Image.open(pj).convert('RGBA')
    px = j.load()
    for yy in range(j.height):
        for xx in range(j.width):
            r, g, b, _ = px[xx, yy]
            if r > 200 and b > 200 and g < 90:
                px[xx, yy] = (0, 0, 0, 0)
    j = j.crop(j.getchannel('A').getbbox())
    jh = round(36 * k)
    j = j.resize((round(j.width * jh / j.height), jh), Image.LANCZOS)
    im.alpha_composite(j, (round(ox + hx * k - j.width / 2), round(oy + hy * k - jh * 0.45)))
    return im.convert('RGB')


if __name__ == '__main__' and len(sys.argv) > 2 and sys.argv[2] == '--carry':
    for n in sys.argv[3:]:
        carry(n).save(OUT / f'carry-{n}.png')


def gauge(lit=True, size=(512, 640)):
    """the HUD's jar gauge: the painted HUD's wooden number plate hung on its tendril, the painted jar standing on it (lit or empty)"""
    hud = Image.open(ROOT / 'src/assets/hud/hud-atlas.webp').convert('RGBA')
    plate = hud.crop((4, 1068, 4 + 188, 1068 + 96)).resize((376, 192), Image.LANCZOS)
    tendril = hud.crop((912, 226, 912 + 24, 226 + 182)).resize((36, 200), Image.LANCZOS)
    im = Image.new('RGBA', size, MAG + (255,))
    im.alpha_composite(tendril, (size[0] // 2 - 18, 0))
    im.alpha_composite(plate, (size[0] // 2 - 188, 400))
    j = Image.open(OUT / ('jar-painted.png' if lit else 'jar-dim-painted.png')).convert('RGBA')
    px = j.load()
    for yy in range(j.height):
        for xx in range(j.width):
            r, g, b, _ = px[xx, yy]
            if r > 200 and b > 200 and g < 90:
                px[xx, yy] = (0, 0, 0, 0)
    j = j.crop(j.getchannel('A').getbbox())
    jh = 330
    j = j.resize((round(j.width * jh / j.height), jh), Image.LANCZOS)
    im.alpha_composite(j, (size[0] // 2 - j.width // 2, 470 - jh + 30))
    return im.convert('RGB')


def tree(size=(1024, 1536)):
    """the firefly tree: World 8's kit trunk, tall, under a round crown of dark leaves with a hollow at its heart"""
    kit = Image.open(ROOT / 'src/assets/kits/w8.webp').convert('RGBA')
    trunk = kit.crop((140, 0, 512, 600))
    trunk = trunk.resize((480, 1100), Image.LANCZOS)
    im = Image.new('RGBA', size, MAG + (255,))
    d = ImageDraw.Draw(im)
    cx = size[0] // 2
    for k, (dx, dy, r) in enumerate([(0, 360, 330), (-260, 470, 230), (260, 470, 230), (-150, 260, 220), (160, 250, 220), (0, 180, 220)]):
        col = (40 + k * 6, 62 + k * 5, 110 + k * 4)
        d.ellipse((cx + dx - r, dy - r, cx + dx + r, dy + r), fill=col, outline=(20, 25, 50), width=6)
    im.alpha_composite(trunk, (cx - 240, size[1] - 1100))
    d = ImageDraw.Draw(im)
    d.ellipse((cx - 70, 900, cx + 70, 1060), fill=(25, 20, 30), outline=(15, 10, 20), width=6)
    return im.convert('RGB')


if __name__ == '__main__' and len(sys.argv) > 2 and sys.argv[2] == '--r3':
    gauge(True).save(OUT / 'gauge-lit.png')
    gauge(False).save(OUT / 'gauge-dim.png')
    tree().save(OUT / 'tree.png')
    pokey('tuck', frames(), arms=False).save(OUT / 'pokey-tuck.png')
