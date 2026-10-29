"""World 7's temple wall as one seamless texture (2026-10-29, the lead's round-5 review: strips butted side by side showed hard joins,
their courses stepping and their tones apart, however they were cross-faded). The start is a 1024 square of the kit's own strips
(temple-walls.webp: wall-5, wall-2, wall-1 (its root once), wall-5, wall-2, graded to one mean tone); hfground/groundgpu.py's "tile"
kind repaints it, makes it periodic on the brick lattice the game lays it on (seam.brick), then paints two variants that share its
edges. Low strengths keep the start's courses.
    python3 tools/art/hfbatch/make_walltile.py <commit>
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sheet = Image.open(ROOT / 'src/assets/w7/temple-walls.webp').convert('RGB')
xs = {0: 0, 1: 224, 4: 896}
order = [4, 1, 0, 4, 1]
strips = [np.asarray(sheet.crop((xs[s], 0, xs[s] + 220, 900))).astype(np.float32) for s in order]
mean = np.mean([s.reshape(-1, 3).mean(0) for s in strips], 0)
strips = [np.clip(s * (mean / s.reshape(-1, 3).mean(0)), 0, 255) for s in strips]
col = np.concatenate(strips, 1)  # 1100 x 900
col = np.concatenate([col, col[:124]], 0)[:1024, :1024]
Image.fromarray(col.astype(np.uint8)).save(HERE / 'starts/start-w7walltile.webp', quality=95)
P = ("slothadv style, painted storybook illustration, a seamless tileable square texture for a side-scrolling platform game: the face "
     "of an old ruined jungle temple wall, weathered grey-green stone blocks of mixed sizes laid in courses with dark mortar joints, "
     "a few carved key-pattern meander bands running across, cracks and chipped corners, soft green moss creeping down over some block "
     "edges, one thin dry brown root. Flat front-on wall, the same density all over, no top, no bottom, no border, soft cel shading, "
     "thin dark outline, evenly lit, flat even light, no highlight band, no shadow band, must tile seamlessly in all four directions")
NEG = ('border, frame, edge, horizon, sky, grass, highlight band, bright band, vignette, gradient, seam, text, letters, watermark, '
       'perspective, 3d render, photo, blurry, sloth, animal, face, statue, vertical stripes, columns, pillars')
commit = sys.argv[1] if len(sys.argv) > 1 else 'gen2-w7'
spec = {'note': "World 7's temple wall as one seamless tile, from make_walltile.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/',
        'items': [{'kind': 'tile', 'name': f'w7walltile-s{round(s1 * 100)}', 'start': 'start-w7walltile.webp', 'prompt': P, 'neg': NEG,
                   's1': s1, 'seed': 17, 's2': 0.38, 'seeds2': [3, 5], 'w': 1024, 'h': 1024, 'band': 80} for s1 in (0.5, 0.6)]}
(HERE / 'spec-hfb-w7walltile.json').write_text(json.dumps(spec, indent=1))
print('ok')
