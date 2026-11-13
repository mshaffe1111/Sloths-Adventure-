"""ART 11-13: 1-5's dusk starts. img2img at s0.55-0.62 from World 1's own far and sky kept the daytime blue (props4, dusk15-sheet.jpg),
so the strips are graded toward dusk in code first (a sky gradient deep violet -> rose -> orange-gold at the horizon line, the canopy
darker and cooler with warm light on its upper edges), then repainted at ~0.5 so the paint finishes the light.

    python3 -I tools/art/hf1113/duskstarts.py   -> reference/art/hf1113/starts/dusk-far.png, dusk-sky.png
"""
from pathlib import Path
import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parents[3]
OUT = GAME / 'reference/art/hf1113/starts'


def ramp(h, stops):
    ys = np.linspace(0, 1, h)
    out = np.zeros((h, 3), np.float32)
    for c in range(3):
        out[:, c] = np.interp(ys, [s for s, _ in stops], [col[c] for _, col in stops])
    return out


def grade_far():
    im = np.asarray(Image.open(GAME / 'src/assets/backdrops/w1-far.webp').convert('RGB')).astype(np.float32) / 255
    H, W, _ = im.shape
    lum = im @ np.array([0.3, 0.59, 0.11], np.float32)
    # the sky: bluish and bright above the canopy line (~45% down)
    # (a soft mask: bluish or very bright is sky, green is canopy; blurred so no step shows)
    from scipy import ndimage as ndi
    m = np.clip((im[..., 2] - im[..., 1] + 0.04) * 10, 0, 1) + np.clip((lum - 0.72) * 4, 0, 1)
    m = np.clip(m, 0, 1)
    m[int(H * 0.62):] = 0
    sky = ndi.gaussian_filter(m, 3)
    g = ramp(H, [(0, (0.22, 0.17, 0.42)), (0.25, (0.55, 0.32, 0.55)), (0.42, (0.95, 0.55, 0.40)), (0.5, (1.0, 0.78, 0.45)),
                 (1, (0.9, 0.6, 0.4))])[:, None, :]
    skyc = g * (0.55 + 0.6 * lum[..., None])  # clouds keep their shapes as lighter rose
    # the land: darker and cooler, a warm rim where it is bright (light from the low sun)
    land = im * np.array([0.62, 0.6, 0.7]) + np.array([0.05, 0.02, 0.07])
    rim = np.clip((lum - 0.45) * 2.2, 0, 1)[..., None] * np.array([0.30, 0.14, -0.02])
    land = land + rim
    out = sky[..., None] * skyc + (1 - sky[..., None]) * land
    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(OUT / 'dusk-far.png')


def grade_sky():
    src = Image.open(GAME / 'src/assets/backdrops/w1-sky.webp').convert('RGBA')
    im = np.asarray(src).astype(np.float32) / 255
    H, W, _ = im.shape
    lum = im[..., :3] @ np.array([0.3, 0.59, 0.11], np.float32)
    g = ramp(H, [(0, (0.16, 0.13, 0.36)), (0.6, (0.32, 0.22, 0.48)), (1, (0.55, 0.32, 0.55))])[:, None, :]
    rgb = g * (0.6 + 0.7 * lum[..., None]) + np.clip(lum - 0.75, 0, 1)[..., None] * np.array([1.2, 0.5, 0.3])
    # the sky strip is transparent at its foot: paint on the dusk colour there so img2img has no grey to repaint
    a = im[..., 3:4]
    rgb = rgb * a + g * (1 - a)
    Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).save(OUT / 'dusk-sky.png')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    grade_far(); grade_sky(); print('ok')
