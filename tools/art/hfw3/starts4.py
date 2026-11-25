"""ART-W3 batch 2 (R-165.449; 2-9 the River King's Court, design 2-9.md:83-86 on origin/t-design-29): paste-up starts on flat grey
for the court bell (still; the swung frame is an edit OF the picked still, ART-W2B's route) and the throne-island far layer (an edit
of World 2's evening far layer: the middle replaced by the island; the cut keeps the original's edges so the strip still tiles).
The King's Barge is NOT here: w2-next#barge (ART-NEXT, reference/art/hfnext/cut/barge.png) is that piece. Run from the repo root:
    python3 -I tools/art/hfw3/starts4.py   -> reference/art/hfw3/starts4/*.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('reference/art/hfw3/starts4'); OUT.mkdir(parents=True, exist_ok=True)
GREY = (128, 128, 128)
LINE = (34, 26, 20)
w2p = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
GONG = w2p.crop((0, 1811, 202, 2031))       # w2-props#gong: World 2's lashed wood + a hung chime, the style
THRONE = w2p.crop((430, 0, 656, 420))       # w2-props#throne


def fit(im, w=None, h=None):
    s = (w / im.width) if w else (h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


# style reference: World 2's gong frame + throne on grey
ref = Image.new('RGBA', (1024, 1024), GREY + (255,))
ref.alpha_composite(fit(GONG, h=520), (40, 60)); ref.alpha_composite(fit(THRONE, h=700), (560, 160))
ref.convert('RGB').save(OUT / 'ref-w2court.png')

# 1 bell (still): a carved wooden arch (two posts, a curved crossbeam with a croc-head end each side), a bronze bell hung from the
#   middle on a short rope; posts on a small plank foot. 768 square canvas, the arch ~560 tall, the bell ~220 tall.
WOOD, WOOD_L, GOLD, TEAL = (110, 70, 40), (160, 110, 64), (205, 160, 60), (40, 140, 140)
B = Image.new('RGBA', (768, 768), GREY + (255,)); d = ImageDraw.Draw(B)
d.rectangle([150, 700, 618, 728], fill=WOOD, outline=LINE, width=4)                       # foot plank
for x in (190, 548):
    d.rectangle([x, 200, x + 34, 700], fill=WOOD_L, outline=LINE, width=4)               # posts
    for y in (300, 460, 620):
        d.rectangle([x - 4, y, x + 38, y + 14], fill=TEAL, outline=LINE, width=2)        # teal lashings
d.arc([120, 110, 648, 420], 200, 340, fill=LINE, width=46); d.arc([120, 110, 648, 420], 200, 340, fill=WOOD, width=36)  # crossbeam
d.polygon([(146, 198), (80, 188), (86, 220), (146, 232)], fill=WOOD, outline=LINE)       # croc-head ends
d.polygon([(622, 198), (688, 188), (682, 220), (622, 232)], fill=WOOD, outline=LINE)
for x in (300, 384, 468):
    d.ellipse([x - 8, 152, x + 8, 168], fill=GOLD, outline=LINE)                          # gold studs
d.line([(384, 165), (384, 300)], fill=(90, 70, 40), width=8)                              # rope
d.polygon([(384, 290), (326, 330), (310, 470), (290, 510), (478, 510), (458, 470), (442, 330)], fill=(176, 116, 52), outline=LINE)  # bell
d.line([(300, 500), (468, 500)], fill=GOLD, width=10); d.line([(330, 360), (438, 360)], fill=GOLD, width=6)
d.ellipse([370, 505, 398, 533], fill=(120, 80, 36), outline=LINE)                         # clapper
B.convert('RGB').save(OUT / 'bell.png')

# 2 the throne island far layer: World 2's evening far layer, the middle (the far hut, the bridge, the sun) covered by a paste-up of
#   the island: a low dark island, the root throne on it, a log drum beside it, a croc tail over the drum, lantern dots. The edit works
#   at 1664 x 1004 (the far layer is 2160 x 1302, alpha 255 everywhere); the cut scales it back and keeps the original's outer 22% each side.
far = Image.open('src/assets/backdrops/w2evening-far.webp').convert('RGBA').resize((1664, 1004), Image.LANCZOS)
d = ImageDraw.Draw(far)
d.ellipse([560, 600, 1120, 720], fill=(48, 30, 60))                                        # the island, a dusk silhouette
th = fit(THRONE, h=300); th = Image.eval(th, lambda v: v)                                    # the root throne
thd = Image.new('RGBA', th.size, (70, 40, 50, 0)); thd.putalpha(th.split()[3])
far.alpha_composite(Image.blend(th, thd, 0.8), (760, 340))
d.rounded_rectangle([900, 560, 1040, 640], radius=24, fill=(80, 46, 40), outline=(30, 18, 24), width=4)   # the log drum
d.line([(1040, 570), (1100, 600), (1160, 650)], fill=(60, 70, 50), width=26)              # the croc tail over the drum
for x, y in ((640, 600), (720, 560), (1080, 560), (1160, 600)):                           # lanterns on poles
    d.line([(x, y), (x, y + 60)], fill=(30, 18, 24), width=5); d.ellipse([x - 12, y - 14, x + 12, y + 10], fill=(255, 170, 70))
far.convert('RGB').save(OUT / 'courtFar.png')
print('ok')
