"""World 5 at night, for Meeca's stage (5-M, "On the March North", Matt 2026-10-28): the night camp painting as the far strip, and
night versions of World 5's middle and near strips baked from the twilight take (they are RGBA with see-through backgrounds).

    python3 -I tools/art/w5puzzle/night.py

Writes src/assets/backdrops/w5night-far.webp (Matt's reference/prop-sheets/w5puzzle/backdrop-night-camp.jpg, 2048 x 868, opaque),
w5night-mid.webp and w5night-near.webp (src/assets/backdrops/w5twi1-mid/near.webp graded to moonlight: a little of the colour taken
out, everything darkened and cooled toward the camp painting's blue, the warm sunset highlights pulled down hardest, the alpha kept).
A grade baked once here costs nothing at 30 fps on a phone; a draw-time tint would be a full-screen composite every frame.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
BACK = ROOT / 'src/assets/backdrops'
REF = ROOT / 'reference/prop-sheets/w5puzzle'
SIZE = (2048, 868)
# moonlight: what each channel keeps, and a small blue lift in the shadows (the night camp painting's ink is a deep blue, not black)
KEEP = np.array([0.40, 0.50, 0.80])
LIFT = np.array([6, 10, 26])


def night(rgb: np.ndarray, desat: float, dark: float) -> np.ndarray:
    lum = rgb @ np.array([0.299, 0.587, 0.114])
    grey = np.repeat(lum[..., None], 3, -1)
    out = rgb * (1 - desat) + grey * desat
    # warm highlights (the low sun painted on the trunks) come down hardest: red over blue
    warm = np.clip((rgb[..., 0] - rgb[..., 2]) / 120.0, 0, 1)[..., None]
    out = out * (1 - 0.35 * warm)
    out = out * KEEP * dark + LIFT
    return np.clip(out, 0, 255)


def main():
    far = Image.open(REF / 'backdrop-night-camp.jpg').convert('RGB').resize(SIZE, Image.LANCZOS)
    far.save(BACK / 'w5night-far.webp', quality=84, method=6)
    for part, desat, dark in (('mid', 0.38, 1.0), ('near', 0.30, 0.92)):
        im = Image.open(BACK / f'w5twi1-{part}.webp').convert('RGBA')
        a = np.asarray(im).astype(np.float32)
        a[..., :3] = night(a[..., :3], desat, dark)
        Image.fromarray(a.astype(np.uint8), 'RGBA').save(BACK / f'w5night-{part}.webp', quality=84, method=6)
    for p in ('far', 'mid', 'near'):
        f = BACK / f'w5night-{p}.webp'
        print(f.name, f.stat().st_size)


if __name__ == '__main__':
    main()
