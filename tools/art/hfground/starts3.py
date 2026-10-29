"""World 10's soil start, redone (hf-art-ground, 2026-10-29): the first start, patches of World 10's old fill, was all tall pointed
shapes laid over each other, and both takes from it read as scales. This one is broken volcanic rock drawn from scratch: irregular
blocks wider than tall (a Voronoi on a torus, stretched across), dark cracks between them, shade varied per block, a few rusty
patches. Periodic on the torus (groundgpu.py brick-seals the repaint).
    python3 tools/art/hfground/starts3.py   ->  tools/art/hfground/starts/fill-w10c.webp
"""
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


S = 1024
rnd = random.Random(10)
# cells: a jittered grid, 7 across and 11 down, so blocks are about 146 x 93 (wider than tall)
pts = []
for j in range(11):
    for i in range(7):
        pts.append(((i + 0.5 + rnd.uniform(-0.38, 0.38)) * S / 7 + (j % 2) * S / 14, (j + 0.5 + rnd.uniform(-0.3, 0.3)) * S / 11))
P = np.array(pts, np.float32)
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
# a little noise in the distance field so the crack lines wander instead of running ruler-straight
def noise(scale, seed):
    r = np.random.RandomState(seed).rand(S // scale + 1, S // scale + 1).astype(np.float32)
    r[-1, :] = r[0, :]; r[:, -1] = r[:, 0]
    return np.asarray(Image.fromarray((r * 255).astype(np.uint8)).resize((S + scale, S + scale), Image.BICUBIC), np.float32)[:S, :S] / 255
wob = (noise(64, 1) - 0.5) * 22 + (noise(16, 2) - 0.5) * 7
d1 = np.full((S, S), 1e9, np.float32); d2 = d1.copy(); idx = np.zeros((S, S), np.int32)
for k, (px, py) in enumerate(P):
    dx = np.abs(xx - px); dx = np.minimum(dx, S - dx)
    dy = np.abs(yy - py); dy = np.minimum(dy, S - dy)
    d = np.sqrt((dx * 0.8) ** 2 + (dy * 1.25) ** 2) + wob
    closer = d < d1
    d2 = np.where(closer, d1, np.minimum(d2, d)); idx = np.where(closer, k, idx); d1 = np.where(closer, d, d1)
edge = d2 - d1
base = np.array([62, 58, 56], np.float32)
shade = np.array([rnd.uniform(0.78, 1.22) for _ in pts], np.float32)[idx]
warm = np.array([rnd.uniform(-6, 8) for _ in pts], np.float32)[idx]
a = base[None, None, :] * shade[..., None]
a[..., 0] += warm; a[..., 2] -= warm * 0.6
# each block lit from its upper left a touch, darker toward its lower right edge (soft cel bevel)
gy, gx = np.gradient(d1)
a *= (1 + 0.10 * np.clip(-(gx + gy) * 0.7, -1, 1))[..., None]
# texture inside the blocks: fine grain and a few thin hairline cracks
a *= (0.9 + 0.2 * noise(8, 3))[..., None]
hair = np.abs(noise(32, 4) - 0.5) < 0.012
a[hair] *= 0.72
# rusty patches
rust = noise(128, 5) * noise(32, 6)
m = np.clip((rust - 0.47) * 6, 0, 1)[..., None] * 0.35
a = a * (1 - m) + np.array([118, 62, 36], np.float32) * m
# the cracks: dark, wider where three blocks meet
crack = np.clip(1 - (edge - 1.5) / 6, 0, 1)
a = a * (1 - crack[..., None] * 0.78) + np.array([18, 14, 14], np.float32) * crack[..., None] * 0.78
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
out = Path(__file__).parent / 'starts' / 'fill-w10c.webp'
img.save(out, quality=92)  # (periodic on the torus; groundgpu.py brick-seals the repaint)
print(out)
