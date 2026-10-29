"""Cut skygpu.py's painted canvases into the game's sky files: src/assets/backdrops/<stem>-sky.webp, drawn above <stem>-far.webp upright
(scenery.ts drawStrip, SKY_OVERLAP).

    python3 -I tools/art/hfbatch/skycut.py <stem>=<canvas.webp> [...]     (<stem>:mid=<canvas> for a middle strip's midtop)

A canvas is E + O rows (skygpu.py: E = the new sky, O = the strip's top rows it was painted over). The sky file keeps the E rows and the
first SKY_OVERLAP x the strip's height of the O rows; over those last rows its alpha fades from 1 to 0, so it lies over the far strip's
top and melts into it. Before that the canvas is matched in colour to the strip (each channel's mean and spread over the overlap), so
the sky is the strip's own light even where the repaint drifted."""
import sys
from pathlib import Path

import importlib.util

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
sys.dont_write_bytecode = True
sys.path.insert(0, str(ROOT / 'tools/art/edges'))
from defringe import process  # noqa: E402
_spec = importlib.util.spec_from_file_location('bs', ROOT / 'scripts/backdrop-strip.py')
bs = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(bs)
# a middle strip's midtop gets the edge fix its strip got (tools/art/edges/run_all.py): the native-resolution mids an ink line at
# their scale, the W1 canopy at 2048, World 5's moods their own line kept
EDGE = {'w5': dict(keep_line=True), 'w1c': dict(ink=True, ring=3)}
HD_MID = dict(ink=True, ring=4.5, px=1.9)
BACK = ROOT / 'src/assets/backdrops'
SKY_OVERLAP = 0.05  # scenery.ts SKY_OVERLAP: the inpaint mask (skygpu.py) is binarized half way down its 11% ramp, so only the top 5.5% of the strip is repainted; the sky file ends there


def cut(stem, canvas):
    """stem 'w1' (a far strip's sky) or 'w1:mid' (a middle strip's midtop)"""
    mid = stem.endswith(':mid')
    stem = stem.split(':')[0]
    src = Image.open(BACK / f'{stem}-{"mid" if mid else "far"}.webp').convert('RGBA')
    strip = np.asarray(src).astype(np.float32)
    H, W, _ = strip.shape
    g = np.asarray(Image.open(canvas).convert('RGB')).astype(np.float32)
    if g.shape[1] != W:
        g = np.asarray(Image.fromarray(g.astype(np.uint8)).resize((W, round(g.shape[0] * W / g.shape[1])), Image.LANCZOS)).astype(np.float32)
    O = int(round(H * 0.16 / 16) * 16)  # skygpu.py
    E = g.shape[0] - O
    keep = int(round(H * SKY_OVERLAP))
    if mid:
        # painted on flat magenta: key it out (and its spill), then match the colour to the strip over its opaque top rows
        key = np.array([0, 255, 0] if stem.startswith('w5') else [255, 0, 255], np.float32)  # make_sky_spec.py KEY
        rgb, alpha = bs.key_out(g, key)
        sa = strip[:O, :, 3] > 230
        ga = alpha[E:E + O] > 0.9
        both = sa & ga
        if both.sum() > 500:
            a, b = rgb[E:E + O][both], strip[:O, :, :3][both]
            rgb = (rgb - a.mean(0)) / np.maximum(a.std(0), 1) * b.std(0) + b.mean(0)
        rgb, alpha = rgb[:E + keep], alpha[:E + keep].copy()
    else:
        # colour match on the overlap (the strip's own top rows against what the model painted over them)
        a, b = g[E:E + O].reshape(-1, 3), strip[:O, :, :3].reshape(-1, 3)
        g = (g - a.mean(0)) / np.maximum(a.std(0), 1) * b.std(0) + b.mean(0)
        rgb = g[:E + keep]
        alpha = np.ones((E + keep, W), np.float32)
    out = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 1) * 255]).round().astype(np.uint8)
    if mid:
        # the edge fix before the fade into the strip (after, it would ink the fade itself)
        o = EDGE.get('w5' if stem.startswith('w5') else stem, HD_MID)
        out, _ = process(out, scale=1, ring=o.get('ring', 1.5), ink=o.get('ink', False), keep_line=o.get('keep_line', False),
                         do_despill=True, px=o.get('px', 1.0))
    # the fade into the strip, over the rows that lie on it (above the strip's top nothing is behind the sky but the stand-in gradient)
    t = np.linspace(0, 1, keep, dtype=np.float32)
    out[E:, :, 3] = np.round(out[E:, :, 3] * (1 - t * t * (3 - 2 * t))[:, None]).astype(np.uint8)
    name = f'{stem}-{"midtop" if mid else "sky"}.webp'
    p = BACK / name
    Image.fromarray(out, 'RGBA').save(p, 'WEBP', quality=85, method=6)
    print(name, out.shape[1], 'x', out.shape[0], p.stat().st_size // 1024, 'KB')


if __name__ == '__main__':
    for a in sys.argv[1:]:
        stem, canvas = a.split('=', 1)
        cut(stem, canvas)
