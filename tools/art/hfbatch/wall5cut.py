"""Cut World 7's wall-5 (the plain temple strip, hfb-w7wall5 take w7wall5-s58-17) into src/assets/w7/temple-walls.webp: 220 wide, made
to repeat top to bottom (its last FADE rows past 900 cross-faded into its top), graded to the mean tone of wall-2, set beside the
other four at x 896, and the sheet's json updated.
    python3 -I tools/art/hfbatch/wall5cut.py <take.webp> <repo root>
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

take, root = Path(sys.argv[1]), Path(sys.argv[2])
P, FADE, W = 900, 60, 220
src = np.asarray(Image.open(take).convert('RGB').resize((W, P + FADE), Image.LANCZOS)).astype(np.float32)
out = src[:P].copy()
a = np.linspace(1, 0, FADE)[:, None, None]
out[:FADE] = src[P:P + FADE] * a + src[:FADE] * (1 - a)
sheet_p = root / 'src/assets/w7/temple-walls.webp'
json_p = root / 'src/assets/w7/temple-walls.json'
sheet = Image.open(sheet_p).convert('RGBA')
meta = json.loads(json_p.read_text())
if 'wall-5' in meta['frames']:
    sheet = sheet.crop((0, 0, meta['frames']['wall-5']['x'] - 4, sheet.height))
ref = np.asarray(sheet.crop((224, 0, 444, 900)).convert('RGB')).astype(np.float32)
out = np.clip(out * (ref.reshape(-1, 3).mean(0) / out.reshape(-1, 3).mean(0)), 0, 255)
x = sheet.width + 4
big = Image.new('RGBA', (x + W, sheet.height), (0, 0, 0, 0))
big.paste(sheet, (0, 0))
big.paste(Image.fromarray(out.astype(np.uint8)).convert('RGBA'), (x, 0))
big.save(sheet_p, quality=92, method=6)
meta['size'] = {'w': big.width, 'h': big.height}
meta['takes']['wall-5'] = take.stem
meta['frames']['wall-5'] = {'x': x, 'y': 0, 'w': W, 'h': P, 'tile': 'vertical', 'note': 'plain, no root: the strip between the others'}
json_p.write_text(json.dumps(meta, indent=1))
print(sheet_p, big.size)
