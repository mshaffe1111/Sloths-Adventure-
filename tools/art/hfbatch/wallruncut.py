"""Pack World 7's temple wall run (hfb-w7wallrun: the base and its two variants, which share their left and right edges) into
src/assets/w7/temple-run.webp, stacked, graded to one mean tone (the strips' own grey-green), opaque, and write their frames into
src/game/w7TempleArt.ts (RUN).
    python3 -I tools/art/hfbatch/wallruncut.py <repo root> <take.webp>...
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(sys.argv[1])
takes = [np.asarray(Image.open(t).convert('RGB')).astype(np.float32) for t in sys.argv[2:]]
mean = np.mean([t.reshape(-1, 3).mean(0) for t in takes], 0)
takes = [np.clip(t * (mean / t.reshape(-1, 3).mean(0)), 0, 255) for t in takes]
H, W = takes[0].shape[:2]
sheet = np.concatenate(takes, 0).astype(np.uint8)
Image.fromarray(sheet).save(root / 'src/assets/w7/temple-run.webp', quality=88, method=6)
frames = [{'x': 0, 'y': i * H, 'w': W, 'h': H} for i in range(len(takes))]
ts = root / 'src/game/w7TempleArt.ts'
s = ts.read_text()
s = re.sub(r'const RUN: readonly F\[\] = [^;]*;', 'const RUN: readonly F[] = ' + json.dumps(frames).replace('"', '') + ';', s)
ts.write_text(s)
print((root / 'src/assets/w7/temple-run.webp').stat().st_size, frames)
