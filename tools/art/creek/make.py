"""1-1's deadly creek body and its muddy splash, from the er-creek1 takes (engine-render, 2026-11-05; the lead's option B).
    python3 -I tools/art/creek/make.py <body take> <splash take> <out dir>
Body: World 1's painted pit-water strip kept as the top (its own surface, ripples and alpha, already periodic), the take's murky depth
under it (cross-faded over rows 140-210), joined left to right over a 140 px band so it tiles. Splash: keyed off magenta, despilled.
"""
import sys
import numpy as np
from PIL import Image

body, splash, out = sys.argv[1:4]
strip = np.asarray(Image.open('src/assets/props/pitwater/w1.webp').convert('RGBA').crop((0, 0, 1024, 256)), np.float32)
t = np.asarray(Image.open(body).convert('RGB').resize((1024, 1232), Image.LANCZOS), np.float32)
H, W = t.shape[:2]
o = np.zeros((H, W, 4), np.float32)
o[..., :3] = t
o[..., 3] = 255
# (the left-right join: the last 140 columns cross-faded into the first, then dropped, so the right end runs into the left start)
B = 140
k = (np.arange(B, dtype=np.float32) + 0.5) / B
k = (k * k * (3 - 2 * k))[None, :, None]
o[:, :B] = k * o[:, :B] + (1 - k) * o[:, W - B:]
o = o[:, :W - B]
W2 = o.shape[1]
s = np.asarray(Image.fromarray(strip.astype(np.uint8), 'RGBA').resize((W2, 256), Image.LANCZOS), np.float32)
# (the top: the painted strip itself; from row 140 to 210 into the take)
f = np.clip((np.arange(256, dtype=np.float32) - 140) / 70, 0, 1)[:, None, None]
top = o[:256].copy()
top[..., :3] = f * o[:256, :, :3] + (1 - f) * s[..., :3]
top[..., 3] = np.where(np.arange(256)[:, None] < 140, s[..., 3], f[..., 0] * 255 + (1 - f[..., 0]) * s[..., 3])
o[:256] = top
Image.fromarray(np.clip(o + 0.5, 0, 255).astype(np.uint8), 'RGBA').save(f'{out}/w1-creek.webp', 'WEBP', quality=88, method=6)
# the splash
sp = np.asarray(Image.open(splash).convert('RGB'), np.float32)
key = np.array([255, 0, 255], np.float32)
a = np.clip((np.sqrt(((sp - key) ** 2).sum(-1)) - 60) / 110, 0, 1)
fg = (sp - (1 - a)[..., None] * key) / np.maximum(a, 0.05)[..., None]
fg[..., 2] = np.minimum(fg[..., 2], fg[..., 1] + 10)
fg[..., 0] = np.maximum(fg[..., 0], fg[..., 1])
im = Image.fromarray(np.concatenate([np.clip(fg, 0, 255), a[..., None] * 255], -1).astype(np.uint8), 'RGBA')
im = im.crop(im.getbbox())
im = im.resize((280, round(280 * im.height / im.width)), Image.LANCZOS)
im.save(f'{out}/w1-mud-splash.webp', 'WEBP', quality=90, method=6)
print('made', W2, H)
