"""ART-NEXT-b: the batch 1 cuts at game size beside Pokey (his idle frame drawn 89.1 world px tall: heroStandardData STD_STAND_H 200 =
HERO_UNITS x HERO_SPRITE_SCALE) and his yellow height bar, at D screen px a world px, on World 2's day sky and on dark.
    python3 -I tools/art/hfnext/contact.py <out.jpg> [D 1.5]
Sizes are the catalog's on_screen_px (world px): change them here and in catalog.py together.
"""
import sys
from PIL import Image, ImageDraw
OUT = sys.argv[1]; D = float(sys.argv[2]) if len(sys.argv) > 2 else 1.5
C = 'reference/art/hfnext/cut/'
P = 89.1
SIZE = {'barge': 505, 'weir': 921, 'door-open': 130, 'boat': 241, 'boatB': 241, 'letter': 28, 'letterB': 32, 'reply': 28, 'replyB': 32.7}
hero = Image.open('src/assets/hero/hero-standard.webp').convert('RGBA').crop((674, 478, 674 + 127, 478 + 209))
door = Image.open('src/assets/props/w2-props.webp').convert('RGBA').crop((243, 624, 243 + 480, 624 + 318))
def at(im, w):  # an image drawn w world px wide, at D
    k = w * D / im.width; return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
def pokey(): return at(hero, 127 * P / 200)
def piece(n): return at(Image.open(C + n + '.png').convert('RGBA'), SIZE[n])
def sheet(bgc, ink):
    W = int(1000 * D); s = Image.new('RGBA', (W, int((P + 141 + 30 + P + 346 + 20) * D) + 40), bgc); d = ImageDraw.Draw(s)
    def bar(x, base):
        d.rectangle([x, base - P * D, x + 6, base], fill=(255, 210, 40, 255))
    def label(x, y, t): d.text((x, y), t, fill=ink)
    # row 1: the barge, Pokey ON its deck (deck line 222 of 357 cut px), then the boat A and B
    b = piece('barge'); x, y = 10, int(10 * D + P * D); s.alpha_composite(b, (x, y))
    deck = y + round(222 * b.height / 357); pk = pokey(); s.alpha_composite(pk, (x + int(200 * D), deck - pk.height)); bar(x + int(190 * D), deck)
    label(x, y + b.height + 2, 'barge (s41) 505 x 141: deck = walk line, 384 px of it')
    for i, n in enumerate(('boat', 'boatB')):
        bt = piece(n); bx = x + b.width + 20 + i * (bt.width + 10); s.alpha_composite(bt, (bx, y + b.height - bt.height)); label(bx, y + b.height + 2, n)
    bar(x + b.width + 8, y + b.height)
    # row 2: the weir, Pokey on its middle step top, and the door closed / open + the letters, each beside Pokey
    y2 = y + b.height + int(30 * D)
    w = piece('weir'); s.alpha_composite(w, (10, y2 + int(P * D)))
    step = y2 + int(P * D) + round(96 * w.height / 371); s.alpha_composite(pokey(), (10 + int(215 * D), step - pokey().height)); bar(10 + int(205 * D), step)
    label(10, y2 + int(P * D) + w.height + 2, 'weir (s41) 921 x 346: a tier = 1 Pokey, him on the left middle rock (the foot fades: the river is drawn over it)')
    return s
def row3(bgc, ink):
    s = Image.new('RGBA', (int(1000 * D), int(150 * D)), bgc); d = ImageDraw.Draw(s); base = int(130 * D); x = 10
    pk = pokey(); s.alpha_composite(pk, (x, base - pk.height)); d.rectangle([x + pk.width + 2, base - P * D, x + pk.width + 8, base], fill=(255, 210, 40, 255)); x += pk.width + 20
    for im, t in ((at(door, 130), 'door (in game)'), (piece('door-open'), 'door-open')):
        s.alpha_composite(im, (x, base - im.height)); d.text((x, base + 4), t, fill=ink); x += im.width + 15
    for n in ('letter', 'letterB', 'reply', 'replyB'):
        im = piece(n); s.alpha_composite(im, (x, base - int(50 * D) - im.height)); d.text((x, base + 4), n, fill=ink); x += im.width + 25
    return s
parts = [sheet((178, 206, 214, 255), (20, 20, 20)), row3((178, 206, 214, 255), (20, 20, 20)), row3((24, 24, 30, 255), (230, 230, 230))]
H = sum(p.height for p in parts); out = Image.new('RGB', (parts[0].width, H), 'white'); yy = 0
for p in parts: out.paste(p.convert('RGB'), (0, yy)); yy += p.height
out.save(OUT, quality=88)
print(OUT, out.size)
