"""Upscale game backdrops 4x with Real-ESRGAN (anime 6B, good for painted/illustrated art), CPU, tiled."""
import sys, time
import numpy as np
import torch
from PIL import Image
from spandrel import ModelLoader

model_path, *pairs = sys.argv[1:]
model = ModelLoader().load_from_file(model_path).eval()
torch.set_num_threads(max(1, torch.get_num_threads()))

def run(img: Image.Image, tile=256, pad=16) -> Image.Image:
    rgb = np.asarray(img.convert('RGB')).astype(np.float32) / 255.0
    t = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0)
    _, _, h, w = t.shape
    s = model.scale
    out = torch.zeros(1, 3, h * s, w * s)
    for y in range(0, h, tile):
        for x in range(0, w, tile):
            y0, x0 = max(0, y - pad), max(0, x - pad)
            y1, x1 = min(h, y + tile + pad), min(w, x + tile + pad)
            with torch.no_grad():
                o = model(t[:, :, y0:y1, x0:x1])
            oy, ox = (y - y0) * s, (x - x0) * s
            th, tw = min(tile, h - y) * s, min(tile, w - x) * s
            out[:, :, y * s:y * s + th, x * s:x * s + tw] = o[:, :, oy:oy + th, ox:ox + tw]
    arr = (out.squeeze(0).permute(1, 2, 0).clamp(0, 1).numpy() * 255).round().astype(np.uint8)
    return Image.fromarray(arr)

for i in range(0, len(pairs), 2):
    src, dst = pairs[i], pairs[i + 1]
    t0 = time.time()
    im = Image.open(src)
    alpha = im.getchannel('A') if im.mode == 'RGBA' else None
    big = run(im)
    if alpha is not None:
        big.putalpha(alpha.resize(big.size, Image.LANCZOS))
    big.save(dst, quality=90) if dst.endswith(('.jpg', '.webp')) else big.save(dst)
    print(src, im.size, '->', big.size, f'{time.time() - t0:.0f}s', flush=True)
