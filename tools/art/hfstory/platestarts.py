"""Starts for two story plates (HF shopping list row 9, 2026-10-30; ART-TO-GET #19, #20; STORY-ART-PROMPTS 19, 20), in the story plate
shape (2560 x 2720 at the end; painted at 1280 x 1360), each a collage of the game's own painted pieces for img2img with the style model:

  start-plate-gorge.webp  Dot holding on to Pokey's claw over the gorge (World 4, the start of Act II): World 4's misty gorge
                          (w4-far), its broken ledge with a vine end (w4-mid), the vine, Pokey's painted vine hang (hero-vine
                          'still'), Dot's story picture (dot-0 'cheer', her wings up, pulling) at his free paw
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
# World 4's own misty gorge of waterfalls (w4-far) and, above, its broken ledge with a vine end on it (w4-mid, keyed)
far = Image.open(G / 'src/assets/backdrops/w4-far.webp').convert('RGB')
bg = cover(far.crop((700, 0, 1900, 1302)), W, H, 0.5, 0.4).convert('RGBA')
mid = Image.open(G / 'src/assets/backdrops/w4-mid.webp').convert('RGBA')
ledge = mid.crop((0, 560, 1220, 1302))
k = 1.05
ledge = ledge.resize((round(ledge.width * k), round(ledge.height * k)), Image.LANCZOS)
lx, ly = -420, -180
# (its foot was cut straight by the crop: fade it into the mist)
fade = Image.new('L', ledge.size, 255)
fd = ImageDraw.Draw(fade)
for i in range(220):
    fd.line((0, ledge.height - 1 - i, ledge.width, ledge.height - 1 - i), fill=round(255 * i / 220))
ledge.putalpha(Image.composite(ledge.getchannel('A'), Image.new('L', ledge.size, 0), fade))
bg.alpha_composite(ledge, (lx, ly))
d = ImageDraw.Draw(bg)
# the vine, from the ledge's broken tip (its own vine end) down to Pokey's hand
lip = (round(lx + 1160 * k), round(ly + 470 * k))  # the foot of the ledge's own painted vine end
hand = (lip[0] + 12, 660)
pts = [(lip[0] + (hand[0] - lip[0]) * u + 22 * math.sin(u * math.pi), lip[1] + (hand[1] - lip[1]) * u) for u in [i / 30 for i in range(31)]]
d.line(pts, fill=(48, 56, 40), width=12)
d.line(pts, fill=(84, 100, 60), width=5)
# Pokey hanging from it by one arm (his painted vine hang), his grip on the vine's end
vine = Image.open(G / 'src/assets/hero/hero-vine.webp').convert('RGBA')
still = vine.crop((0, 0, 195, 431))
kp = 560 / 431
po = still.resize((round(195 * kp), 560), Image.LANCZOS)
px, py = round(hand[0] - 171.6 * kp), round(hand[1] - 7.6 * kp)
bg.alpha_composite(po, (px, py))
# Dot at his free paw (low on his near side), wings up, pulling
hd = Image.open(G / 'src/assets/story/hd/dot-0.webp').convert('RGBA')
dot = hd.crop((0, 0, 369, 396)).resize((200, 215), Image.LANCZOS)
bg.alpha_composite(dot, (px - 120, py + 250))
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
