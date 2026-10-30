"""Starts for two story plates (HF shopping list row 9, 2026-10-30; ART-TO-GET #19, #20; STORY-ART-PROMPTS 19, 20), in the story plate
shape (2560 x 2720 at the end; painted at 1280 x 1360), each a collage of the game's own painted pieces for img2img with the style model:

  start-plate-gorge.webp  Dot holding on to Pokey's claw over the gorge (World 4, the start of Act II): the World 4 mist gorge
                          (w4mist-far), a broken cliff ledge (dot-far-1), the vine, Pokey's painted vine hang (hero-vine 'still'),
                          Dot's story picture (dot-0 'cheer', her wings up, pulling)
  start-plate-raft.webp   the village building the raft (World 2, halfway), no characters: World 2's river and its bank village
                          (w2-far, w2-mid), with a barely started
                          raft of two lashed logs on the bank, a pile of logs, a coil of rope, a stone hammer on a stump

    python3 -I tools/art/hfstory/platestarts.py <game checkout> <out dir>
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

G, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1280, 1360


def cover(im, w, h, fx=0.5, fy=0.5):
    k = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    x, y = round((im.width - w) * fx), round((im.height - h) * fy)
    return im.crop((x, y, x + w, y + h))


# ───── the gorge ─────
mist = Image.open(G / 'src/assets/backdrops/w4mist-far.webp').convert('RGB')
# (above its rope bridge and waterfall: only the spires standing in the sea of mist)
bg = cover(mist.crop((1000, 0, 1800, 850)), W, H, 0.5, 0.5).convert('RGBA')
# (below him only deep mist: the long white nothing where the ledge used to be)
fog = Image.new('L', (W, H), 0)
ImageDraw.Draw(fog).rectangle((0, int(H * 0.55), W, H), fill=255)
bg.paste((236, 232, 236), (0, 0), fog.filter(ImageFilter.GaussianBlur(120)))
# the broken ledge, top left: the gorge's own dark cliffs, their edge broken off in a jagged line
cliff = mist.crop((0, 260, 640, 960)).convert('RGBA').resize((760, 832), Image.LANCZOS)
m = Image.new('L', cliff.size, 0)
d = ImageDraw.Draw(m)
d.polygon([(0, 0), (600, 0), (660, 120), (590, 210), (640, 330), (520, 470), (430, 620), (300, 832), (0, 832)], fill=255)
cliff.putalpha(m.filter(ImageFilter.GaussianBlur(2)))
bg.alpha_composite(cliff, (-180, -60))
d = ImageDraw.Draw(bg)
# the vine from the broken lip down to Pokey's hand
lip = (450, 140)
hand = (560, 560)
pts = [(lip[0] + (hand[0] - lip[0]) * u + 30 * math.sin(u * math.pi), lip[1] + (hand[1] - lip[1]) * u) for u in [i / 30 for i in range(31)]]
d.line(pts, fill=(58, 82, 34), width=14)
d.line(pts, fill=(90, 120, 50), width=6)
for k in range(5):
    x, y = pts[k * 6]
    d.ellipse((x - 18, y - 8, x + 14, y + 10), fill=(72, 120, 48))
# Pokey hanging from it by one arm (his painted vine hang), his grip on the vine's end
vine = Image.open(G / 'src/assets/hero/hero-vine.webp').convert('RGBA')
still = vine.crop((0, 0, 195, 431))
k = 560 / 431
po = still.resize((round(195 * k), 560), Image.LANCZOS)
bg.alpha_composite(po, (round(hand[0] - 171.6 * k), round(hand[1] - 7.6 * k)))
# Dot above his hand, wings up, pulling
hd = Image.open(G / 'src/assets/story/hd/dot-0.webp').convert('RGBA')
dot = hd.crop((0, 0, 369, 396)).resize((220, 236), Image.LANCZOS)
bg.alpha_composite(dot, (hand[0] - 150, hand[1] - 250))
bg.convert('RGB').save(OUT / 'start-plate-gorge.webp', quality=93)

# ───── the raft ─────
# World 2's own river (sky and slow water, w2-far) above its bank village with round doors dug into the bank (w2-mid)
river = Image.open(G / 'src/assets/backdrops/w2-far.webp').convert('RGB')
rb = cover(river.crop((400, 0, 1700, 1302)), W, H, 0.5, 0.3).convert('RGBA')
bank = Image.open(G / 'src/assets/backdrops/w2-mid.webp').convert('RGBA')
bank = bank.crop((0, 0, 1700, 1302))
k = W / bank.width * 1.25
bank = bank.resize((round(bank.width * k), round(bank.height * k)), Image.LANCZOS)
rb.alpha_composite(bank, (-180, H - bank.height + 80))
d = ImageDraw.Draw(rb)
by = 1200  # the bank, in the lower part (the plate leaves its lower third open for the cast; the raft sits to one side)


def log(x0, y0, length, r, tone=(122, 84, 50)):
    d.rounded_rectangle((x0, y0 - r, x0 + length, y0 + r), r, fill=tone, outline=(52, 34, 20), width=4)
    d.ellipse((x0 + length - r, y0 - r, x0 + length + r, y0 + r), fill=(196, 160, 110), outline=(52, 34, 20), width=4)
    d.ellipse((x0 + length - r * 0.5, y0 - r * 0.5, x0 + length + r * 0.5, y0 + r * 0.5), outline=(150, 112, 70), width=3)


log(780, by, 330, 30)            # the two lashed logs
log(780, by + 52, 330, 30)
for x in (830, 960, 1070):     # vine rope round them
    d.line((x, by - 32, x + 6, by + 84), fill=(70, 100, 44), width=9)
for k, (x, y) in enumerate([(1020, by - 70), (1060, by - 122), (1100, by - 70)]):  # the pile waiting
    log(x, y, 200, 26, (110 + k * 8, 76, 46))
d.ellipse((680, by + 20, 760, by + 66), outline=(70, 100, 44), width=10)   # a coil of rope
d.ellipse((694, by + 30, 746, by + 56), outline=(70, 100, 44), width=8)
d.rectangle((1180, by - 70, 1260, by + 70), fill=(96, 66, 40), outline=(52, 34, 20), width=4)  # a stump
d.ellipse((1176, by - 90, 1264, by - 50), fill=(176, 140, 96), outline=(52, 34, 20), width=4)
d.rounded_rectangle((1190, by - 120, 1250, by - 86), 10, fill=(130, 130, 124), outline=(40, 40, 40), width=3)  # a stone hammer
d.line((1220, by - 100, 1268, by - 150), fill=(110, 80, 50), width=8)
for k in range(14):  # wood shavings
    x = 790 + (k * 37) % 380
    d.arc((x, by + 92, x + 22, by + 110), 180, 360, fill=(220, 190, 140), width=4)
rb.convert('RGB').save(OUT / 'start-plate-raft.webp', quality=93)
print('ok')
