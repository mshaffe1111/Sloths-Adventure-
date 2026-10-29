"""Cut frames of a rope clip (ropegpu.py) the way cut.py cuts the Gemini cells: the clip's own rope painted out except under his paws,
the grey keyed off, the grip (`gy`) and torso middle (`ax`) kept. The clip shows him `prep_start.FIG_H` of its height from rope to toes,
from Gemini cell 1 scaled by S; `scale` in the meta brings the frames back to the Gemini sheet's px (pack.py sizes him from that sheet).

    python3 -I tools/art/rope/cutclip.py <clip name> <first> <last>    (frames from raw/<clip>/, unpacked with w5/unpack_carrier.py)
"""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H))
from cut import cut_cell  # noqa: E402
from prep_start import FIG_H, HH, ROPE_Y  # noqa: E402

TOP = 50  # the clip's rope sits at ROPE_Y of its height (82 px): the cut starts a little above it, so the rope lies in the cutter's band

if __name__ == '__main__':
    clip, a, b = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    gm = json.loads((H / 'frames/meta.json').read_text())
    s = FIG_H * HH / gm['f1']['h']  # Gemini px -> clip px
    out = H / 'clipframes'
    out.mkdir(exist_ok=True)
    mp = out / 'meta.json'
    meta = json.loads(mp.read_text()) if mp.exists() else {}
    meta['scale'] = round(1 / s, 5)
    assert abs(ROPE_Y * HH - 82) < 2
    for n in range(a, b + 1):
        rgb = np.asarray(Image.open(H / f'raw/{clip}/{clip}_{n:03d}.webp').convert('RGB'))[TOP:]
        im, m = cut_cell(rgb, band=60)
        name = f'c{n:02d}'
        im.save(out / f'{name}.png')
        meta[name] = m
        print(name, m)
    mp.write_text(json.dumps(meta, indent=1))
