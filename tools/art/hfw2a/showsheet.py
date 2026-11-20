"""ART-W2A show-first contact sheet, read from the PACKED sheets (what the game will draw): (1) each little one's Happy | walk A | walk B |
paddle at sheet px; the heron plain | looking; (2) game size on 2-3's real stills (ENG-23 1-walk), sideways (1.526 px a unit) and upright
(1.873 px a unit): a line of five waddling (A/B alternating), the paddlers sunk to the chest, the heron plain and looking; (3) 3x edge crops.
    python3 -I tools/art/hfw2a/showsheet.py <out.jpg> <base label>
"""
import re, sys
from PIL import Image, ImageDraw
out, label = sys.argv[1], sys.argv[2]
wp = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
dn = Image.open('src/assets/props/dressnew-w2.webp').convert('RGBA')
F = {m[0]: tuple(map(int, m[1:])) for m in re.findall(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', open('src/game/w2PropsData.ts').read())}
D = {m[0]: (int(m[1]), int(m[2]), int(m[3]), int(m[4]), float(m[5])) for m in re.findall(r'"(\w+)": \{\s*"x": (\d+),\s*"y": (\d+),\s*"w": (\d+),\s*"h": (\d+),\s*"units": ([\d.]+)', open('src/game/dressNewData.ts').read())}
def p(n):
    x, y, w, h = F[n]; return wp.crop((x, y, x + w, y + h))
def d(n):
    x, y, w, h, u = D[n]; return dn.crop((x, y, x + w, y + h)), u
GREEN = (150, 168, 132, 255)
KINDS = ['duck', 'otter', 'capy']
# (1) sheet px
row = []
for k in KINDS:
    row += [(k + 'Happy', p(k + 'Happy')), (k + 'WalkA', p(k + 'WalkA')), (k + 'WalkB', p(k + 'WalkB')), (k + 'Paddle', p(k + 'Paddle'))]
H1 = 300
top = Image.new('RGBA', (sum(im.width + 12 for _, im in row[:8]) + 12, 2 * H1 + 20), GREEN)
dr = ImageDraw.Draw(top)
x = y = 12
for i, (n, im) in enumerate(row):
    if i == 8: x, y = 12, H1 + 20
    top.alpha_composite(im, (x, y + H1 - 30 - im.height)); dr.text((x, y), n, fill=(0, 0, 0)); x += im.width + 12
hp, hu = d('w2Heron'); hl, lu = d('w2HeronLook')
k = 0.62
her = Image.new('RGBA', (int((hp.width + hl.width) * k) + 40, top.height), GREEN)
a = hp.resize((int(hp.width * k), int(hp.height * k))); b = hl.resize((int(hl.width * k), int(hl.height * k)))
her.alpha_composite(a, (10, her.height - 10 - a.height)); her.alpha_composite(b, (20 + a.width, her.height - 10 - b.height))
ImageDraw.Draw(her).text((10, 4), 'w2Heron | w2HeronLook (same px a unit)', fill=(0, 0, 0))
# (2) game size on 2-3
def scene(still, pxu, box, ground, look):
    st = Image.open(still).convert('RGBA').crop(box)
    g = ground - box[1]
    def put(im, w_units, cx, sink=0.0):
        w = w_units * pxu; t = im.resize((max(1, round(w)), max(1, round(im.height * w / im.width))), Image.LANCZOS)
        if sink:
            t = t.crop((0, 0, t.width, round(t.height * (1 - sink))))
        st.alpha_composite(t, (round(cx - t.width / 2), g - t.height))
        return t.width
    cx = 30
    for i, kd in enumerate(['duck', 'otter', 'capy', 'duck', 'otter']):
        n = kd + ('WalkA' if i % 2 == 0 else 'WalkB')
        w = 33 * F[n][2] / F[kd + 'Happy'][2]
        put(p(n), w, cx + w * pxu / 2); cx += w * pxu + 34 * pxu * 0.35
    cx += 20
    for kd in KINDS:  # (paddlers: sunk to the chest, as followArt draws them: the top 60% shows)
        n = kd + 'Paddle'; w = 33 * F[n][2] / F[kd + 'Happy'][2]
        put(p(n), w, cx + w * pxu / 2, sink=0.4); cx += w * pxu + 6
    im, u = (hl, lu) if look else (hp, hu)
    put(im, u, st.width - 12 - u * pxu / 2)  # (the heron at the crop's right edge, wholly inside it)
    return st.convert('RGB')
L = [scene('reference/qa-reports/ENG-23/stills/1-walk-land.webp', 1.526, (560, 230, 1400, 500), 478, lk) for lk in (False, True)]
P = [scene('reference/qa-reports/ENG-23/stills/1-walk-port.webp', 1.873, (0, 860, 824, 1170), 1132, lk) for lk in (False, True)]
# (3) edges at 3x on light and dark
def zoom(im, box):
    c = im.crop(box); out = Image.new('RGBA', (c.width * 2, c.height), (235, 235, 225, 255))
    out.alpha_composite(c, (0, 0)); dk = Image.new('RGBA', c.size, (40, 50, 40, 255)); dk.alpha_composite(c); out.paste(dk, (c.width, 0))
    return out.resize((out.width * 3, out.height * 3), Image.NEAREST).convert('RGB')
Z = [zoom(p('duckWalkB'), (20, 170, 150, 255)), zoom(p('otterWalkA'), (0, 160, 120, 262)), zoom(hl, (100, hl.height - 160, 300, hl.height - 90))]
W = max(top.width + her.width, max(L[0].width, P[0].width) * 2 + 10, sum(z.width for z in Z) + 20)
Hh = 30 + top.height + 10 + L[0].height + 10 + P[0].height + 10 + max(z.height for z in Z)
S = Image.new('RGB', (W, Hh), (30, 30, 30)); dd = ImageDraw.Draw(S)
dd.text((8, 8), f'ART-W2A show-first ({label}) | top: sheet px, colour-matched | middle: game size on 2-3, sideways then upright, heron plain (left) / looking (right) | bottom: edges 3x on light and dark', fill=(255, 255, 0))
y = 30; S.paste(top.convert('RGB'), (0, y)); S.paste(her.convert('RGB'), (top.width, y)); y += top.height + 10
S.paste(L[0], (0, y)); S.paste(L[1], (L[0].width + 10, y)); y += L[0].height + 10
S.paste(P[0], (0, y)); S.paste(P[1], (P[0].width + 10, y)); y += P[0].height + 10
x = 0
for z in Z: S.paste(z, (x, y)); x += z.width + 10
S.save(out, quality=90); print(out, S.size)
