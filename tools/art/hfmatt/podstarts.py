"""ART-MATT: img2img starts for 1-4's seed pods (R-165.227) from Matt's sheet2 pods (his design kept). Each pod is cut off white
(distance from white), given the game's bold dark outline (a 9 px ring of dark brown round its edge, so img2img keeps a line at a
moderate strength), centred on flat magenta (255,0,255) at 768x1024. Starts go to reference/art/hfmatt/starts/ (tools/ ignores pictures).

    python3 -I tools/art/hfmatt/podstarts.py
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

G = Path(__file__).resolve().parents[3]
SRC = G / 'reference/art/matt/2026-11-14/sheet2-pods-dust.webp'
OUT = G / 'reference/art/hfmatt/starts'
BOX = {'pod-hang': (100, 30, 420, 490), 'pod-fall': (615, 95, 945, 485)}  # sheet px

im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
for name, (x0, y0, x1, y1) in BOX.items():
    a = im[y0:y1, x0:x1]
    d = np.linalg.norm(255 - a, axis=-1)
    m = Image.fromarray(((d > 28) * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))
    ring = m.filter(ImageFilter.MaxFilter(9))
    mm, rr = np.asarray(m) > 0, np.asarray(ring) > 0
    W, H = 768, 1024
    s = min(W * 0.62 / a.shape[1], H * 0.62 / a.shape[0])
    canvas = np.zeros((a.shape[0], a.shape[1], 3), np.uint8); canvas[:] = (255, 0, 255)
    canvas[rr] = (52, 30, 20)
    canvas[mm] = a[mm].astype(np.uint8)
    piece = Image.fromarray(canvas).resize((round(a.shape[1] * s), round(a.shape[0] * s)), Image.LANCZOS)
    st = Image.new('RGB', (W, H), (255, 0, 255)); st.paste(piece, ((W - piece.width) // 2, (H - piece.height) // 2))
    OUT.mkdir(parents=True, exist_ok=True); st.save(OUT / f'{name}.png'); print(name, piece.size)
