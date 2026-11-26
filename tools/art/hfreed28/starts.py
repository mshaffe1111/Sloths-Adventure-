"""ART-REED-28: the start images for 2-8's reed island (Qwen-Image-Edit img2img from World 2's own painted banks and reeds).
python3 tools/art/hfreed28/starts.py -> reference/art/hfreed28/starts/{isleA,isleB,ref-w2bank}.png
Scale: 2.1 start px a game px (the island's stand line ~340 game px = ~714 start px; Pokey 89.1 game px = 187 start px)."""
from PIL import Image, ImageDraw, ImageFilter
import os
OUT = 'reference/art/hfreed28/starts/'; os.makedirs(OUT, exist_ok=True)
GREY = (128, 128, 128, 255)
k = Image.open('src/assets/kits/w2.webp').convert('RGBA')
bank = k.crop((713, 661, 713 + 560, 661 + 250)); bankEnd = k.crop((1542, 0, 1542 + 204, 420))
p = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
reedT = p.crop((195, 0, 195 + 231, 420)); reedS = p.crop((424, 1552, 424 + 294, 1552 + 240))
W, H = 1024, 768; X0, X1 = 92, 932; TOP = 380  # island box (840 px = 400 game px), the grass top line

def body_mask(base):
    """the island's outline: flat top, rounded shoulders, sides tapering in; base 'fade' fades out, 'water' ends in a wet foot"""
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    bot = TOP + 250
    pts = [(X0 + 30, TOP - 6), (X1 - 30, TOP - 6), (X1, TOP + 30), (X1 - 40, TOP + 140), (X1 - 90, bot), (X0 + 90, bot), (X0 + 40, TOP + 140), (X0, TOP + 30)]
    d.polygon(pts, fill=255); m = m.filter(ImageFilter.GaussianBlur(3))
    if base == 'fade':
        g = Image.linear_gradient('L').resize((W, H)); px = m.load(); gp = g.load()
        for y in range(TOP + 120, H):
            f = max(0.0, 1 - (y - TOP - 120) / 130)
            for x in range(W):
                px[x, y] = int(px[x, y] * f)
    return m

def island(base):
    c = Image.new('RGBA', (W, H), GREY)
    # reeds BEHIND, at the two ends only (the middle ~700 px clear for him and the cage)
    rt = reedT.resize((int(231 * 0.75), int(420 * 0.75)), Image.LANCZOS)
    c.alpha_composite(rt, (X0 + 10, TOP - rt.height + 40)); c.alpha_composite(rt.transpose(Image.FLIP_LEFT_RIGHT).resize((rt.width - 30, rt.height - 50)), (X0 + 120, TOP - rt.height + 90))
    rs = reedS.resize((int(294 * 0.9), int(240 * 0.9)), Image.LANCZOS)
    c.alpha_composite(rs, (X1 - rs.width - 10, TOP - rs.height + 40))
    # the body: the bank's soil stretched, cut by the outline
    soil = bank.crop((0, 70, 560, 250)).resize((X1 - X0, 300), Image.LANCZOS)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); layer.paste(soil, (X0, TOP))
    if base == 'water':  # a darker wet foot where the water stands
        d = ImageDraw.Draw(layer); d.rectangle((X0, TOP + 190, X1, H), fill=(78, 58, 40, 255))
    m = body_mask(base); a = Image.new('RGBA', (W, H), (0, 0, 0, 0)); a.paste(layer, (0, 0), m); c.alpha_composite(a)
    # the grass top: the bank's mossy cap, stretched flat across
    cap = bank.crop((0, 0, 560, 80)).resize((X1 - X0 - 40, 86), Image.LANCZOS)
    c.alpha_composite(cap, (X0 + 20, TOP - 40))
    if base == 'water':  # ripple rings at the waterline
        d = ImageDraw.Draw(c)
        for i, (dx, dy) in enumerate([(0, 0), (40, 18), (80, 34)]):
            d.ellipse((X0 + 40 - dx, TOP + 200 - dy // 3, X1 - 40 + dx, TOP + 240 + dy), outline=(170, 215, 220, 255), width=4)
    return c.convert('RGB')

island('fade').save(OUT + 'isleA.png'); island('water').save(OUT + 'isleB.png')
r = Image.new('RGBA', (1024, 512), GREY)
r.alpha_composite(bank, (10, 20)); r.alpha_composite(bankEnd.resize((150, 310)), (600, 20)); r.alpha_composite(reedT.resize((170, 310)), (780, 20))
r.alpha_composite(reedS, (20, 280)); r.alpha_composite(Image.open('src/assets/w1to4art/w2-new.webp').convert('RGBA').crop((533, 727, 867, 935)), (400, 290))
r.convert('RGB').save(OUT + 'ref-w2bank.png')
print('ok')
