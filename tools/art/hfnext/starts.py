"""ART-NEXT batch 1: paste-up starts for World 2's village pieces (2-7 mail boat, letter, reply, door OPEN, weir; 2-8 flood-line reeds;
2-9 the King's Barge), on flat grey, plus two style references cut from World 2's own painted pieces. Run from the repo root:
    python3 -I tools/art/hfnext/starts.py <w2-rocks.webp>   -> reference/art/hfnext/starts/*.png
<w2-rocks.webp> = `git show origin/t-eng-rock:src/assets/w2-rocks/w2-rocks.webp` (the lead 3:36 PM ET: the weir starts from World 2's
brown rock hand, never w2-new#stone-*). Geometry and colours only; Qwen-Image-Edit-2511 repaints in the painter's hand (ART-W2B method)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path('reference/art/hfnext/starts'); OUT.mkdir(parents=True, exist_ok=True)
GREY = (128, 128, 128)
LINE = (46, 30, 18)
props = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
dress = Image.open('src/assets/props/dressnew-w2.webp').convert('RGBA')
kit = Image.open('src/assets/kits/w2.webp').convert('RGBA')
cels3 = Image.open('src/assets/characters/cels-3.webp').convert('RGBA')
cels4 = Image.open('src/assets/characters/cels-4.webp').convert('RGBA')
rocks = Image.open(sys.argv[1]).convert('RGBA')
shallow = Image.open('src/assets/w2-1115/w2-shallow.webp').convert('RGBA')


def crop(im, x, y, w, h):
    return im.crop((x, y, x + w, y + h))


def fit(im, w=None, h=None):
    if w and h:
        return im.resize((w, h), Image.LANCZOS)
    s = (w / im.width) if w else (h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def canvas(w, h):
    return Image.new('RGBA', (w, h), GREY + (255,))


CANOE = crop(dress, 243, 1086, 499, 341)
DOOR = crop(props, 243, 624, 480, 318)
REED_T = crop(props, 195, 0, 231, 420)
REED_L = crop(props, 0, 624, 239, 330)
THRONE = crop(props, 430, 0, 226, 420)
BOULDER = crop(kit, 1307, 925, 388, 179)
ROCK_A = crop(rocks, 0, 0, 280, 129)
ROCK_B = crop(rocks, 284, 0, 280, 129)
MAILMAN = crop(cels4, 1216, 1232, 238, 392)   # po.carry_stand (storyCelData.ts:148)
MAILWALK = crop(cels4, 922, 1232, 292, 392)   # po.walk_parcel (:151)
LETTER = crop(cels3, 0, 1026, 466, 496)       # gv.letter (:58)

# --- style refs: World 2's wood + boat + door + reeds (ref-w2), and the court's gold and teal + the mailman (ref-court)
ref = canvas(1024, 1024)
ref.alpha_composite(fit(CANOE, w=560), (20, 20))
ref.alpha_composite(fit(DOOR, w=420), (590, 40))
ref.alpha_composite(fit(REED_T, h=420), (40, 420))
ref.alpha_composite(fit(BOULDER, w=420), (300, 640))
ref.alpha_composite(fit(MAILWALK, h=380), (720, 420))
ref.convert('RGB').save(OUT / 'ref-w2.png')
court = canvas(1024, 1024)
court.alpha_composite(fit(THRONE, h=700), (40, 40))
court.alpha_composite(fit(CANOE, w=560), (420, 80))
court.alpha_composite(fit(LETTER, h=420), (440, 520))
court.convert('RGB').save(OUT / 'ref-court.png')

# --- the mail boat: the canoe, the mailman's upper body seated in it at the oar (his lower half hidden by the hull), a post sack
B = canvas(1024, 640)
c = fit(CANOE, w=820); cx, cy = 100, 640 - c.height - 20
m = fit(MAILMAN, h=360); top = m.crop((0, 0, m.width, 230))
B.alpha_composite(top, (cx + 300, cy + round(c.height * 0.42) - 230))
B.alpha_composite(c, (cx, cy))
d = ImageDraw.Draw(B)
sy = cy + round(c.height * 0.36)
d.ellipse([cx + 520, sy - 70, cx + 630, sy + 20], fill=(150, 120, 80), outline=LINE, width=3)   # the post sack in the bow
d.polygon([(cx + 555, sy - 66), (cx + 575, sy - 96), (cx + 595, sy - 66)], fill=(150, 120, 80), outline=LINE)
B.convert('RGB').save(OUT / 'boat.png')

# --- letter and reply: a cream envelope, front-on, flap lines; red wax seal (letter) / green leaf seal on blue-grey paper (reply)
for name, paper, seal in [('letter', (236, 222, 190), (170, 40, 36)), ('reply', (206, 214, 214), (70, 120, 60))]:
    L = canvas(512, 512); d = ImageDraw.Draw(L)
    x0, y0, x1, y1 = 96, 146, 416, 366
    d.rectangle([x0, y0, x1, y1], fill=paper, outline=LINE, width=4)
    d.line([(x0, y0), (256, 270), (x1, y0)], fill=LINE, width=4)
    d.line([(x0, y1), (220, 250)], fill=LINE, width=3); d.line([(x1, y1), (292, 250)], fill=LINE, width=3)
    d.ellipse([228, 244, 284, 300], fill=seal, outline=LINE, width=3)
    L.convert('RGB').save(OUT / f'{name}.png')

# --- the door: as it is, bigger, on grey (the edit swings it open)
D = canvas(768, 512)
dd = fit(DOOR, w=700); D.alpha_composite(dd, (34, 512 - dd.height - 20))
D.convert('RGB').save(OUT / 'door.png')

# --- the weir: World 2's brown rocks in 3 steps across the river, the shallow-water strip pouring white over each lip
W = canvas(1024, 512)
water = fit(shallow, w=1024)
W.alpha_composite(water.crop((0, 0, 1024, min(200, water.height))), (0, 340))   # the pool below
rows = [(390, [BOULDER, ROCK_A, ROCK_B, BOULDER]), (280, [ROCK_B, BOULDER, ROCK_A]), (180, [ROCK_A, ROCK_B])]
for i, (y, rs) in enumerate(rows):
    x = 40 + i * 130
    for r in rs:
        rr = fit(r, h=130 - i * 10); W.alpha_composite(rr, (x, y - rr.height + 40)); x += rr.width - 30
sheet = Image.new('RGBA', W.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sheet)
for i, (y, rs) in enumerate(rows):   # a thin see-through sheet of water over each step's front, white streaks and foam at its foot
    x0 = 70 + i * 130; x1 = 1024 - 70 - i * 60; t = y - 92 + i * 10
    d.rectangle([x0, t, x1, y + 28], fill=(170, 214, 210, 90))
    for k in range(x0 + 4, x1 - 4, 15):
        d.line([(k, t + 6), (k + 3, y + 26)], fill=(240, 248, 246, 150), width=3)
    d.ellipse([x0 - 10, y + 14, x1 + 10, y + 44], fill=(244, 250, 248, 190))
W.alpha_composite(sheet)
W.convert('RGB').save(OUT / 'weir.png')

# --- flood-line reeds: the two reed clumps, a dark wet band with silt at mid-stem
R = canvas(512, 768)
rt = fit(REED_T, h=700); rl = fit(REED_L, h=560)
R.alpha_composite(rl, (10, 768 - rl.height - 20)); R.alpha_composite(rt, (220, 768 - rt.height - 20))
band = Image.new('RGBA', R.size, (0, 0, 0, 0)); d = ImageDraw.Draw(band)
d.rectangle([0, 470, 512, 520], fill=(60, 48, 30, 110))
d.line([(0, 470), (512, 470)], fill=(120, 104, 70, 200), width=5)
mask = R.split()[0].point(lambda v: 255)   # band only over the reeds (not the grey): use the reeds' alpha
reed_a = Image.new('L', R.size, 0); reed_a.paste(rl.split()[3], (10, 768 - rl.height - 20)); reed_a.paste(rt.split()[3], (220, 768 - rt.height - 20), rt.split()[3])
band.putalpha(Image.composite(band.split()[3], Image.new('L', R.size, 0), reed_a))
R.alpha_composite(band)
R.convert('RGB').save(OUT / 'reeds.png')

# --- the King's Barge: the canoe's hull stretched long and low, a flat plank deck (the walk line), a carved croc head at the prow
# (right), a reed canopy on four poles at the stern (left), gold and teal trim
G = canvas(1280, 512)
d = ImageDraw.Draw(G)
deck = 300
hull = [(90, deck), (1150, deck), (1110, deck + 70), (1020, deck + 110), (200, deck + 110), (120, deck + 70)]
d.polygon(hull, fill=(110, 82, 54), outline=LINE)                                               # a long low plank hull
for k in (deck + 36, deck + 72):
    d.line([(110, k), (1135, k)], fill=LINE, width=3)
d.rectangle([90, deck - 22, 1150, deck], fill=(150, 112, 70), outline=LINE, width=3)          # the flat deck (the walk line)
for k in range(90, 1150, 70):
    d.line([(k, deck - 22), (k, deck)], fill=LINE, width=2)
d.rectangle([96, deck + 4, 1146, deck + 16], fill=(56, 140, 140), outline=LINE, width=2)        # teal band
d.rectangle([100, deck + 18, 1140, deck + 26], fill=(214, 170, 60), outline=LINE, width=2)      # gold band
d.polygon([(1140, deck - 10), (1170, deck - 60), (1240, deck - 80), (1270, deck - 62), (1250, deck - 42), (1190, deck - 36), (1250, deck - 18), (1200, deck + 10), (1150, deck + 60)],
          fill=(92, 112, 60), outline=LINE)                                                     # the carved croc head
d.ellipse([1228, deck - 78, 1242, deck - 64], fill=(214, 170, 60), outline=LINE)                # its eye
for px in (120, 220, 330, 430):                                                                 # canopy poles
    d.rectangle([px, deck - 190, px + 12, deck - 22], fill=(120, 86, 50), outline=LINE)
d.polygon([(90, deck - 180), (470, deck - 180), (440, deck - 240), (130, deck - 240)], fill=(196, 168, 92), outline=LINE)  # reed roof
for k in range(100, 470, 18):
    d.line([(k, deck - 182), (k + 10, deck - 238)], fill=(150, 120, 60), width=2)
G.convert('RGB').save(OUT / 'barge.png')
print('ok', sorted(p.name for p in OUT.iterdir()))
