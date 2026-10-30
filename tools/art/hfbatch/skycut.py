"""Cut skygpu.py's painted canvases into the game's sky files: src/assets/backdrops/<stem>-sky.webp, drawn above <stem>-far.webp upright
(scenery.ts drawStrip, SKY_OVERLAP).

    python3 -I tools/art/hfbatch/skycut.py <stem>=<canvas.webp> [...]
    python3 -I tools/art/hfbatch/skycut.py --tall <stem>=<take.webp> [...]   (round 4: a tallstart.py take, the sky above the whole strip)

A canvas is E + O rows (skygpu.py: E = the new sky, O = the strip's top rows below it). The sky file keeps the E rows and the first
SKY_OVERLAP x the strip's height of the O rows (the ones the model repainted); over those its alpha fades from 1 to 0, so it lies over the
far strip's top and melts into it. Before that the canvas is matched in colour to the strip (each channel's mean and spread over the
overlap), so the sky is the strip's own light even where the repaint drifted."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
BACK = ROOT / 'src/assets/backdrops'
SKY_OVERLAP = 0.05  # scenery.ts SKY_OVERLAP: the inpaint mask (skygpu.py) is binarized half way down its 11% ramp, so only the top 5.5% of the strip is repainted; the sky file ends there


# round 4 (2026-10-29): the takes the lead passed from the review sheets (reference/prop-sheets/qa-notes/polish-edges/skies-r4, column C,
# s38); the other 11 of the 16 (make_hdset_spec.py REDO) keep the far strip's cover fit (scenery.ts farScale)
PASSED4 = ['w2', 'w2evening', 'w6', 'w9', 'w9dawn']


def tall_canvas(stem, take):
    """a tallstart.py take (E rows of sky, then the whole strip) cut down to skygpu.py's canvas: E + O rows"""
    H = Image.open(BACK / f'{stem}-far.webp').height
    E, O = int(round(H * 0.35 / 16) * 16), int(round(H * 0.16 / 16) * 16)  # tallstart.py E_SHARE, skygpu.py
    im = Image.open(take).convert('RGB')
    return np.asarray(im.crop((0, 0, im.width, E + O))).astype(np.float32)


def cut(stem, canvas, tall=False):
    far = np.asarray(Image.open(BACK / f'{stem}-far.webp').convert('RGB')).astype(np.float32)
    H, W, _ = far.shape
    g = tall_canvas(stem, canvas) if tall else np.asarray(Image.open(canvas).convert('RGB')).astype(np.float32)
    if g.shape[1] != W:
        g = np.asarray(Image.fromarray(g.astype(np.uint8)).resize((W, round(g.shape[0] * W / g.shape[1])), Image.LANCZOS)).astype(np.float32)
    O = int(round(H * 0.16 / 16) * 16)  # skygpu.py
    E = g.shape[0] - O
    keep = int(round(H * SKY_OVERLAP))
    # colour match on the repainted rows of the strip's top (the strip's own rows against what the model painted over them)
    a, b = g[E:E + keep].reshape(-1, 3), far[:keep].reshape(-1, 3)
    g = (g - a.mean(0)) / np.maximum(a.std(0), 1) * b.std(0) + b.mean(0)
    rgb = g[:E + keep]
    alpha = np.ones((E + keep, W), np.float32)
    # the fade into the strip, over the rows that lie on it (above the strip's top nothing is behind the sky but the stand-in gradient)
    t = np.linspace(0, 1, keep, dtype=np.float32)
    alpha[E:] = (1 - t * t * (3 - 2 * t))[:, None]
    out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).round().astype(np.uint8)
    p = BACK / f'{stem}-sky.webp'
    Image.fromarray(out, 'RGBA').save(p, 'WEBP', quality=85, method=6)
    print(p.name, out.shape[1], 'x', out.shape[0], p.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    tall = sys.argv[1] == '--tall'
    for a in sys.argv[1 + tall:]:
        stem, canvas = a.split('=', 1)
        cut(stem, canvas, tall)
