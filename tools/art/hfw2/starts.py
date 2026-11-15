"""ART-W2 (11-15): the two img2img paste-up starts, from World 2's own painted pieces (inventory first).
  shallow.png: the deep river tile (w2-props#water) twice (so it wraps), lifted to a clear shallow green-teal, with the riverbed's
               painted stones (w2-new#stone-a/b/c) under a thin water veil and a sandy bed band at the bottom.
  loglong.png: w2-props#logLong lengthened to about 10:1 (its two ends and its middle bark repeated), on flat magenta.
Run from the repo root: python3 -I tools/art/hfw2/starts.py   (writes reference/art/hfw2/starts/)
"""
import numpy as np
from PIL import Image, ImageFilter

OUT = 'reference/art/hfw2/starts/'
W2 = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
NEW = Image.open('src/assets/w1to4art/w2-new.webp').convert('RGBA')
crop = lambda im, x, y, w, h: im.crop((x, y, x + w, y + h))

# --- the shallow backwater strip: 1792x400 (two tiles of the 640x286 water, same aspect) ---
water = crop(W2, 0, 1262, 640, 286).convert('RGB')
two = Image.new('RGB', (1280, 286)); two.paste(water, (0, 0)); two.paste(water, (640, 0))
a = np.asarray(two).astype(np.float32)
# lift the body: lighter, greener-clear (the deep is #264247); the crests stay white
lum = a.mean(axis=2, keepdims=True)
crest = np.clip((lum - 170) / 50, 0, 1)
body = a * 0.3 + np.array([118, 192, 168], np.float32) * 0.7 + 6
# lighter toward the bed (shallow water lets the light through)
body = body + np.clip((np.arange(286)[:, None, None] - 60) / 226, 0, 1) * np.array([18, 14, -4], np.float32)
a = body * (1 - crest) + a * crest
strip = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((1792, 400), Image.LANCZOS).convert('RGBA')
# the riverbed: a sandy band along the bottom with a soft top edge
bed = Image.new('RGBA', strip.size, (0, 0, 0, 0))
bm = np.zeros((400, 1792), np.float32)
ys = np.arange(400)[:, None]
edge = 262 + 14 * np.sin(np.arange(1792)[None, :] / 1792 * 2 * np.pi * 3)  # 3 whole waves: it still wraps
bm[:] = np.clip((ys - edge) / 18, 0, 1)
bedc = np.zeros((400, 1792, 4), np.uint8); bedc[..., :3] = (168, 158, 112); bedc[..., 3] = (bm * 235).astype(np.uint8)
strip.alpha_composite(Image.fromarray(bedc, 'RGBA'))
# the stones, from World 2's own river stones, sitting on the bed, under a thin water veil
stones = [crop(NEW, 0, 1000, 266, 142), crop(NEW, 1640, 727, 295, 143), crop(NEW, 707, 1000, 208, 119)]
rng = np.random.default_rng(7)
x = 30
k = 0
while x < 1792 - 120:
    s = stones[k % 3]; k += 1
    sc = rng.uniform(0.35, 0.8)
    s2 = s.resize((round(s.width * sc), round(s.height * sc)), Image.LANCZOS)
    y = int(rng.uniform(280, 345) - s2.height * rng.uniform(0.45, 0.75))
    strip.alpha_composite(s2, (x, y))
    x += s2.width + int(rng.uniform(-30, 60))
veil = Image.new('RGBA', strip.size, (90, 160, 150, 0))
vm = np.clip((ys - 170) / 150, 0, 1) * 0.22
va = np.asarray(veil).copy(); va[..., 3] = (np.broadcast_to(vm, (400, 1792)) * 255).astype(np.uint8)
strip.alpha_composite(Image.fromarray(va, 'RGBA'))
# re-lay the original crests on top so the surface line stays the deep river's own
top = Image.fromarray(np.clip(np.asarray(two), 0, 255)).resize((1792, 400), Image.LANCZOS)
ta = np.asarray(top).astype(np.float32)
cm = np.clip((ta.mean(axis=2) - 165) / 45, 0, 1); cm[120:] = 0
t4 = np.zeros((400, 1792, 4), np.uint8); t4[..., :3] = ta.astype(np.uint8); t4[..., 3] = (cm * 255).astype(np.uint8)
strip.alpha_composite(Image.fromarray(t4, 'RGBA'))
strip.convert('RGB').save(OUT + 'shallow.png')

# --- the long log: about 10:1, on magenta, 1792x288 ---
log = crop(W2, 304, 2035, 440, 106)
L, M, R = log.crop((0, 0, 150, 106)), log.crop((150, 0, 300, 106)), log.crop((300, 0, 440, 106))
Mf = M.transpose(Image.FLIP_LEFT_RIGHT)
parts = [L, M, Mf, M, Mf, M, R]
wsum = sum(p.width for p in parts) - 12 * (len(parts) - 1)
long_ = Image.new('RGBA', (wsum, 106), (0, 0, 0, 0))
x = 0
for p in parts:
    long_.alpha_composite(p, (x, 0)); x += p.width - 12
long_ = long_.resize((1720, round(106 * 1720 / wsum)), Image.LANCZOS)
can = Image.new('RGBA', (1792, 288), (255, 0, 255, 255))
can.alpha_composite(long_, (36, (288 - long_.height) // 2))
c = np.asarray(can).copy(); c[..., 3] = 255
# no half-clear pixels left against the key
can = Image.fromarray(c, 'RGBA').convert('RGB')
can.save(OUT + 'loglong.png')
print('shallow', strip.size, 'loglong', can.size, long_.size)
