"""Take the vertical bands out of each world's soil textures (hf-art-ground, 2026-10-30; the lead's W3 report: columns of a slightly
different shade meeting edge to edge, the same on live drawing and in the morning's build, so in the art). Each texture's brightness,
blurred hard up and down and lightly across (what a column of a different shade is), is brought to the world's one mean: the four
textures end up equally bright and none has a darker or lighter column in it. The blur is taken on the texture laid in the game's brick
bond (rows half a tile on), so the correction tiles as the texture does; in the border band the four textures share, all four take the
same (averaged) correction, so they still meet with no seam. Rewrites the fills in src/assets/ground/w<N>.webp in place.
    python3 tools/art/hfground/flatten.py [worlds...]
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ROOT = Path(__file__).resolve().parents[3]
G = json.loads(re.search(r'GROUND_FRAMES: Record<number, GroundSheet> = (\{.*\});', (ROOT / 'src/game/groundAtlasData.ts').read_text(), re.S).group(1))
SX, SY = 20, 260  # the blur, px of a 1024 texture: light across, hard up and down
BAND = 110        # the shared border band, px


def low(lum):
    """the texture's blurred brightness, the blur taken on a 3 x 3 brick-bond mosaic of itself (each row half a tile on)"""
    n = lum.shape[1]
    row = np.concatenate([lum] * 3, 1)
    half = np.roll(row, n // 2, 1)
    m = np.concatenate([half, row, half], 0)
    return gaussian_filter(m, (SY, SX), mode='wrap')[lum.shape[0]:2 * lum.shape[0], n:2 * n]


def flatten(w):
    g = G[str(w)]
    path = ROOT / f'src/assets/ground/w{w}.webp'
    S = np.asarray(Image.open(path).convert('RGBA'), np.float32).copy()
    tiles = [S[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w'], :3] for f in g['fills']]
    lums = [t @ np.array([0.299, 0.587, 0.114], np.float32) for t in tiles]
    target = float(np.mean([l.mean() for l in lums]))
    gains = [np.clip(target / np.maximum(low(l), 1), 0.8, 1.25) for l in lums]
    # the border band: the four share it, so they take one gain there (the mean of theirs), feathered into each one's own inside
    h, n = gains[0].shape
    yy, xx = np.mgrid[0:h, 0:n]
    d = np.minimum(np.minimum(xx, n - 1 - xx), np.minimum(yy, h - 1 - yy)).astype(np.float32)
    k = np.clip((d - BAND * 0.5) / (BAND * 0.5), 0, 1)
    k = k * k * (3 - 2 * k)
    mean_gain = np.mean(gains, 0)
    for f, t, gn in zip(g['fills'], tiles, gains):
        gg = mean_gain * (1 - k) + gn * k
        S[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w'], :3] = np.clip(t * gg[..., None], 0, 255)
    Image.fromarray(S.astype(np.uint8), 'RGBA').save(path, 'WEBP', quality=82, method=6)
    print(f'w{w}: target {target:.1f}, gain {min(x.min() for x in gains):.2f}-{max(x.max() for x in gains):.2f}')


if __name__ == '__main__':
    for w in (sys.argv[1:] or [k for k in G]):
        flatten(int(w))
