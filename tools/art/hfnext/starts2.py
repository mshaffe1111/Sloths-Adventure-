"""ART-NEXT-b batch 2 (no spend until the lead's go): paste-up starts for World 3's grotto floor kit (3-1) and 2-8's flood-line reeds
REDO, on flat grey, plus one style reference cut from World 3's own painted pieces. Run from the repo root:
    python3 -I tools/art/hfnext/starts2.py <w1-fungus-shelf-big.png>   -> reference/art/hfnext/starts2/*.png + starts2-sheet.jpg
<w1-fungus-shelf-big.png> = `git show origin/art-director:reference/art/cut/w1-fungus-shelf-big.png`. Geometry and colours only;
Qwen-Image-Edit-2511 repaints in the painter's hand. Sizes: WORLD-3-PLAN.md §2 (origin/t-plan-w3); Pokey 89.1 px drawn.
"""
import sys, random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import numpy as np

OUT = Path('reference/art/hfnext/starts2'); OUT.mkdir(parents=True, exist_ok=True)
GREY = (128, 128, 128)
LINE = (30, 34, 34)
w3n = Image.open('src/assets/w1to4art/w3-new.webp').convert('RGBA')
w3p = Image.open('src/assets/props/w3-props.webp').convert('RGBA')
w2p = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
FUNGUS = Image.open(sys.argv[1]).convert('RGBA')
def crop(im, x, y, w, h): return im.crop((x, y, x + w, y + h))
def fit(im, w=None, h=None):
    if w and h: return im.resize((w, h), Image.LANCZOS)
    s = (w / im.width) if w else (h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
def canvas(w, h): return Image.new('RGBA', (w, h), GREY + (255,))
SH_S = crop(w3n, 1588, 614, 348, 168)       # w3-new#shelf-short, walk_y 53
SH_L = crop(w3n, 655, 614, 582, 178)        # w3-new#shelf-long, walk_y 58
MUSH = crop(w3p, 639, 1988, 300, 185)       # w3-props#mushrooms
GLOW = crop(w3p, 1115, 0, 251, 420)         # w3-props#glowLit
FERN = crop(w3p, 0, 1749, 380, 235)
REED_T = crop(w2p, 195, 0, 231, 420)
REED_L = crop(w2p, 0, 624, 239, 330)
# the shelf stone's own colours, sampled from shelf-short's slab face (top lit, front mid, underside dark)
a = np.asarray(SH_S).astype(int)
def tone(y0, y1):
    p = a[y0:y1, 120:300].reshape(-1, 4); p = p[p[:, 3] > 200][:, :3]; return tuple(int(v) for v in np.median(p, axis=0))
TOP, FRONT, UNDER = tone(50, 58), tone(64, 80), tone(110, 140)

# --- style reference: World 3's stone shelves, the mushrooms and a glowworm light, on grey
ref = canvas(1024, 1024)
ref.alpha_composite(fit(SH_L, w=900), (60, 40)); ref.alpha_composite(fit(SH_S, w=520), (40, 380))
ref.alpha_composite(fit(MUSH, w=380), (600, 330)); ref.alpha_composite(fit(GLOW, h=420), (120, 590)); ref.alpha_composite(fit(FERN, w=420), (520, 700))
ref.convert('RGB').save(OUT / 'ref-w3.png')

def slab(w, thick, under, seed, ends='round'):
    """a grotto stone slab: lit top face, a front face, a tapering rock underside, crack lines; w x (thick + under) px"""
    rnd = random.Random(seed)
    im = Image.new('RGBA', (w, thick + under + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    top = 10
    # underside: a ragged taper to a point a little left of middle
    tip = (int(w * 0.42), thick + under)
    pts = [(6, thick)] + [(int(w * f), thick + int(under * (f / 0.42) ** 1.4)) for f in (0.12, 0.25, 0.36)] + [tip] + \
          [(int(w * f), thick + int(under * ((1 - f) / 0.58) ** 1.6)) for f in (0.55, 0.7, 0.85)] + [(w - 6, thick)]
    d.polygon(pts, fill=UNDER + (255,), outline=LINE)
    d.rounded_rectangle([2, top, w - 3, thick], radius=12 if ends == 'round' else 3, fill=FRONT + (255,), outline=LINE, width=3)
    d.rounded_rectangle([2, top, w - 3, top + max(8, thick // 4)], radius=10 if ends == 'round' else 2, fill=TOP + (255,), outline=LINE, width=2)
    for _ in range(max(2, w // 120)):   # cracks in the front face
        x = rnd.randint(30, w - 30); d.line([(x, top + thick // 4), (x + rnd.randint(-12, 12), thick)], fill=LINE, width=2)
    if ends == 'broken':   # chip the two ends into broken rock
        for x0, sgn in ((0, 1), (w, -1)):
            d.polygon([(x0, top - 2), (x0 + sgn * 26, top - 2), (x0 + sgn * 10, top + thick // 2), (x0 + sgn * 22, thick + 4), (x0, thick + 6)], fill=(0, 0, 0, 0))
    return im

# 1 reeds REDO: the two clumps as batch 1; below a WAVY flood line each stem is multiplied to dark wet brown, a darker wet edge at
#   the line, pale silt specks on the stems below it (batch 1: a see-through dark band + a light line read as a grey collar)
R = canvas(512, 768)
rt = fit(REED_T, h=700); rl = fit(REED_L, h=560)
R.alpha_composite(rl, (10, 768 - rl.height - 20)); R.alpha_composite(rt, (220, 768 - rt.height - 20))
ra = Image.new('L', R.size, 0); ra.paste(rl.split()[3], (10, 768 - rl.height - 20)); ra.paste(rt.split()[3], (220, 768 - rt.height - 20), rt.split()[3])
A = np.asarray(R).astype(np.float32); M = np.asarray(ra).astype(np.float32) / 255
xs = np.arange(512)
line = 480 + 12 * np.sin(xs / 37.0) + 6 * np.sin(xs / 13.0 + 1.3)
yy = np.arange(768)[:, None]
below = (yy > line[None, :]).astype(np.float32) * M
wet = np.array([70, 48, 28], np.float32)
A[..., :3] = A[..., :3] * (1 - below[..., None]) + (A[..., :3] / 255 * wet * 1.7).clip(0, 255) * below[..., None]
edge = ((yy > line[None, :] - 2) & (yy < line[None, :] + 4)).astype(np.float32) * M
A[..., :3] = A[..., :3] * (1 - edge[..., None]) + np.array([46, 30, 16], np.float32) * edge[..., None]
rnd = np.random.default_rng(7)
for _ in range(260):
    x, y = int(rnd.integers(0, 512)), int(rnd.integers(486, 750))
    if below[y, x] > 0.5 and y > line[x] + 6:
        A[y:y + 2, x:x + 2, :3] = (176, 156, 112)
Image.fromarray(A.astype(np.uint8), 'RGBA').convert('RGB').save(OUT / 'reeds2.png')

# 2 shelf S: 120 x ~35 thick at 4 canvas px a world px (480 x 140), the underside below; a fern tuft from shelf-short's own
S = canvas(768, 384); s = slab(480, 140, 120, 3); S.alpha_composite(s, (144, 70))
S.alpha_composite(fit(crop(SH_S, 0, 0, 120, 60), w=170), (160, 20))
S.convert('RGB').save(OUT / 'shelfS.png')

# 4 soft fungus mat: ~130 x 18 at 4 px a unit (520 x 72): the W1 fungus shelf squashed flat and cooled toward the grotto's dim glow
F = fit(FUNGUS, w=520, h=96)
fa = np.asarray(F).astype(np.float32); lum = fa[..., :3].mean(axis=2, keepdims=True)
cool = np.array([96, 120, 150], np.float32)
fa[..., :3] = (fa[..., :3] * 0.45 + lum / 255 * cool * 1.25 * 0.55).clip(0, 255)
Mt = canvas(768, 384); Mt.alpha_composite(Image.fromarray(fa.astype(np.uint8), 'RGBA'), (124, 150)); Mt.convert('RGB').save(OUT / 'mat.png')

# 5 sleepy-mushroom shelf: 200 wide x 35 thick at 3 px a unit (600 x 105), the mushroom clump at its back (left), caps to droop in the edit
SL = canvas(768, 512); s = slab(600, 105, 120, 5); SL.alpha_composite(s, (84, 250))
m = fit(crop(MUSH, 0, 0, 300, 150), w=280); SL.alpha_composite(m, (110, 260 - m.height + 14))
SL.convert('RGB').save(OUT / 'sleepy.png')

# 6 lit rims: the in-game shelves themselves (the edit lights their rims)
RS = canvas(768, 384); RS.alpha_composite(fit(SH_S, w=620), (74, 384 // 2 - fit(SH_S, w=620).height // 2)); RS.convert('RGB').save(OUT / 'rimShort.png')
RL = canvas(1024, 384); RL.alpha_composite(fit(SH_L, w=940), (42, 384 // 2 - fit(SH_L, w=940).height // 2)); RL.convert('RGB').save(OUT / 'rimLong.png')

# 7 floor lips: 400 x ~26 at 2.2 canvas px a unit (880 x 58), a short rock skirt under it; A rounded ends, B broken ends
for n, ends in (('lipA', 'round'), ('lipB', 'broken')):
    L = canvas(1024, 320); s = slab(880, 70, 46, 9 if ends == 'round' else 11, ends); L.alpha_composite(s, (72, 110))
    L.alpha_composite(fit(crop(SH_L, 0, 0, 160, 60), w=150), (110, 64))
    L.convert('RGB').save(OUT / f'{n}.png')

# the show-first sheet: every start beside Pokey's bar at its game size (yellow = 89 px), the canvas in grey
GAME = {'reeds2': ('h', 130), 'shelfS': ('w', 120 * 768 / 480), 'mat': ('w', 130 * 768 / 520), 'sleepy': ('w', 200 * 768 / 600),
        'rimShort': ('w', 130 * 768 / 620), 'rimLong': ('w', 220 * 1024 / 940), 'lipA': ('w', 400 * 1024 / 880), 'lipB': ('w', 400 * 1024 / 880)}
tiles = []
for n, (side, L_) in GAME.items():
    im = Image.open(OUT / f'{n}.png').convert('RGB')
    big = fit(im, w=420) if im.width >= im.height else fit(im, h=420)
    k = L_ / (im.width if side == 'w' else im.height) * 2      # x2 a game px, as a phone shows it
    g = fit(im, w=max(1, round(im.width * k)))
    T = Image.new('RGB', (big.width + g.width + 60, max(big.height, g.height) + 24), (24, 24, 28)); T.paste(big, (0, 20)); T.paste(g, (big.width + 50, 20))
    dd = ImageDraw.Draw(T); dd.rectangle((big.width + 30, 20 + g.height - 178, big.width + 40, 20 + g.height), fill=(240, 200, 60))
    dd.text((3, 3), f'{n}  (left: the start; right: the canvas at game size x2, yellow = Pokey)', fill=(255, 230, 90)); tiles.append(T)
W = 1900; x = y = rh = 0; pos = []
for t in tiles:
    if x + t.width > W: x = 0; y += rh + 6; rh = 0
    pos.append((x, y)); x += t.width + 6; rh = max(rh, t.height)
Sh = Image.new('RGB', (W, y + rh), (10, 10, 12))
for t, p in zip(tiles, pos): Sh.paste(t, p)
Sh.save('reference/art/hfnext/starts2-sheet.jpg', quality=82); print('starts2-sheet.jpg', Sh.size, 'tones', TOP, FRONT, UNDER)
