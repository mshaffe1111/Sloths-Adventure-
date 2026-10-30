"""The edit model paints "magenta" as a dull pink or plum: every pixel near the take's own background colour (the median of its border)
is pulled to pure magenta, softly by distance, so bosscut_lib.cut keys it like any other take."""
import numpy as np
from PIL import Image


def flatten_key(im, near=48, far=96):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(axis=2))
    k = np.clip((far - dist) / (far - near), 0, 1)[..., None]
    out = a * (1 - k) + np.array([255, 0, 255], np.float32) * k
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
