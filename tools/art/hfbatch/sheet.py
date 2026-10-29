"""Check sheet of clips keyed off the grey, on a dark background (2026-10-29): one row per clip, every given frame step, numbered.
    python3 -I tools/art/hfbatch/sheet.py <frames dir> <out.jpg> <step> <thumb w> <clip> [<clip> ...]
Frames are <clip>_<NNN>.webp (unpacked carriers). The key is w6to10/cutpack.py's key_default (key_tight for a clip given as name:tight).
"""
import os, sys, tempfile
from pathlib import Path
os.environ.setdefault('PIPINSTALL', '0')
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
_tmp = Path(tempfile.mkdtemp()); (_tmp / 'spec.json').write_text('{"groups": {}}')
os.environ.update(OUT=str(_tmp), SPEC='spec.json', GROUPS='')
sys.path.insert(0, str(HERE.parent / 'w6to10'))
import cutpack  # noqa: E402

SRC, OUT, STEP, TW = Path(sys.argv[1]), Path(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
rows = []
for arg in sys.argv[5:]:
    clip, _, mode = arg.partition(':')
    fs = sorted(SRC.glob(f'{clip}_[0-9][0-9][0-9].webp'))[::STEP]
    ims = []
    for f in fs:
        rgb = np.asarray(Image.open(f).convert('RGB'))
        a = (cutpack.key_tight if mode == 'tight' else cutpack.key_default)(rgb)
        im = Image.fromarray(np.dstack([rgb, a]), 'RGBA')
        bg = Image.new('RGBA', im.size, (22, 22, 30, 255)); bg.alpha_composite(im)
        ims.append((f.stem.rsplit('_', 1)[1], bg.convert('RGB')))
    for k in range(0, len(ims), 9):
        rows.append((clip if k == 0 else '', ims[k:k + 9]))
th = round(TW * 480 / 832)
cols = max(len(r[1]) for r in rows)
S = Image.new('RGB', (cols * TW, len(rows) * (th + 16)), (60, 60, 60))
d = ImageDraw.Draw(S)
for r, (clip, ims) in enumerate(rows):
    y = r * (th + 16)
    d.text((4, y + 2), clip, fill=(255, 255, 255))
    for i, (n, im) in enumerate(ims):
        S.paste(im.resize((TW, th), Image.LANCZOS), (i * TW, y + 16))
        d.text((i * TW + 3, y + 18), n, fill=(255, 255, 0))
S.save(OUT, quality=85)
print(OUT, S.size)
