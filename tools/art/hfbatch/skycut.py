"""Cut skygpu.py's painted canvases into the game's sky files: src/assets/backdrops/<stem>-sky.webp, drawn above <stem>-far.webp upright
(scenery.ts drawStrip, SKY_OVERLAP).

    python3 -I tools/art/hfbatch/skycut.py <stem>=<canvas.webp> [...]

A canvas is E + O rows (skygpu.py: E = the new sky, O = the strip's top rows it was painted over). The sky file keeps the E rows and the
first SKY_OVERLAP x the strip's height of the O rows; over those last rows its alpha fades from 1 to 0, so it lies over the far strip's
top and melts into it. Before that the canvas is matched in colour to the strip (each channel's mean and spread over the overlap), so
the sky is the strip's own light even where the repaint drifted."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
BACK = ROOT / 'src/assets/backdrops'
SKY_OVERLAP = 0.12  # scenery.ts SKY_OVERLAP


def cut(stem, canvas):
    far = np.asarray(Image.open(BACK / f'{stem}-far.webp').convert('RGB')).astype(np.float32)
    H, W, _ = far.shape
    g = np.asarray(Image.open(canvas).convert('RGB')).astype(np.float32)
    if g.shape[1] != W:
        g = np.asarray(Image.fromarray(g.astype(np.uint8)).resize((W, round(g.shape[0] * W / g.shape[1])), Image.LANCZOS)).astype(np.float32)
    O = int(round(H * 0.16 / 16) * 16)  # skygpu.py
    E = g.shape[0] - O
    # colour match on the overlap (the strip's own top rows against what the model painted over them)
    a, b = g[E:E + O].reshape(-1, 3), far[:O].reshape(-1, 3)
    g = (g - a.mean(0)) / np.maximum(a.std(0), 1) * b.std(0) + b.mean(0)
    keep = int(round(H * SKY_OVERLAP))
    rgb = np.clip(g[:E + keep], 0, 255)
    alpha = np.ones((E + keep, W), np.float32)
    t = np.linspace(0, 1, keep, dtype=np.float32)
    alpha[E:] = (1 - t * t * (3 - 2 * t))[:, None]
    out = np.dstack([rgb, alpha * 255]).round().astype(np.uint8)
    p = BACK / f'{stem}-sky.webp'
    Image.fromarray(out, 'RGBA').save(p, 'WEBP', quality=85, method=6)
    print(p.name, out.shape[1], 'x', out.shape[0], p.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    for a in sys.argv[1:]:
        stem, canvas = a.split('=', 1)
        cut(stem, canvas)
