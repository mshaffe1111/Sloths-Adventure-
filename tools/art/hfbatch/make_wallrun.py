"""World 7's temple wall as one wide built wall (2026-10-29, the lead's round-5 review). The start is laid in courses that run the
whole width: each course is one course band of the kit's own strips (temple-walls.webp: its rows between two dark mortar joints), that
band repeated across at its own offset, so the courses line up everywhere and the rows sit in a running bond; no column joints. Then
hfground/groundgpu.py's "strip" kind repaints it, makes it periodic left to right (seam.wrap_x) and repaints two variants hard enough to
take out wrap_x's blend, keeping its edges. The wall is never more than one picture tall in the game, so it repeats left to right only.
    python3 tools/art/hfbatch/make_wallrun.py <commit>
"""
import json, random, sys
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sheet = np.asarray(Image.open(ROOT / 'src/assets/w7/temple-walls.webp').convert('RGB')).astype(np.float32)
xs = {0: 0, 1: 224, 4: 896}
strips = {s: sheet[:900, x:x + 220] for s, x in xs.items()}
mean = np.mean([a.reshape(-1, 3).mean(0) for a in strips.values()], 0)
strips = {s: np.clip(a * (mean / a.reshape(-1, 3).mean(0)), 0, 255) for s, a in strips.items()}
# course bands: rows between dark mortar joints (a row whose middle 80% is dark across), each 50-260 px tall
bands = []
for s, a in strips.items():
    lum = a[:, 22:198].mean(axis=(1, 2))
    joints = [y for y in range(2, 898) if lum[y] < lum.mean() * 0.62 and lum[y] <= lum[y - 1] and lum[y] <= lum[y + 1]]
    cuts = [0]
    for y in joints:
        if y - cuts[-1] >= 50:
            cuts.append(y)
    for y0, y1 in zip(cuts, cuts[1:]):
        if 50 <= y1 - y0 <= 260 and not (s == 0 and y0 < 345):  # (no band with wall-1's root)
            bands.append(a[y0:y1])
rnd = random.Random(7)
W, H = 2048, 1024
out = np.zeros((H, W, 3), np.float32)
y = 0
last = None
while y < H:
    b = rnd.choice([x for x in bands if x is not last] or bands)
    last = b
    row = np.tile(b, (1, W // 220 + 2, 1))
    off = rnd.randrange(0, 220)
    h = min(b.shape[0], H - y)
    out[y:y + h] = row[:h, off:off + W]
    y += h
Image.fromarray(out.astype(np.uint8)).save(HERE / 'starts/start-w7wallrun.webp', quality=95)
P = ("slothadv style, painted storybook illustration, a wide flat front-on texture for a side-scrolling platform game: the face of an "
     "old ruined jungle temple wall, weathered grey-green stone blocks of mixed sizes laid in long level courses with dark mortar joints, "
     "every block its own shape, a few carved key-pattern meander bands running the whole width, cracks and chipped corners, soft green "
     "moss creeping down over some block edges. Soft cel shading, thin dark outline, evenly lit, flat even light, no highlight band, no "
     "shadow band, the same all the way across, must tile seamlessly left to right")
NEG = ('border, frame, edge, horizon, sky, grass, highlight band, bright band, vignette, gradient, seam, text, letters, watermark, '
       'perspective, 3d render, photo, blurry, sloth, animal, face, statue, columns, pillars, vertical stripes, repeated identical blocks, '
       'ghosting, double image')
commit = sys.argv[1] if len(sys.argv) > 1 else 'gen2-w7'
spec = {'note': "World 7's temple wall as one wide built wall, from make_wallrun.py, 2026-10-29",
        'loras': {'style': ['mshaffe111/slothadv-style-lora', 'slothadv_style_v1.safetensors', 1.0]}, 'neg': NEG,
        'base': f'https://raw.githubusercontent.com/mshaffe1111/Sloths-Adventure-/{commit}/tools/art/hfbatch/starts/',
        'items': [{'kind': 'strip', 'name': f'w7wallrun-s{round(s1 * 100)}', 'start': 'start-w7wallrun.webp', 'prompt': P, 'neg': NEG,
                   's1': s1, 'seed': 17, 's2': 0.52, 'seeds2': [3, 5], 'w': W, 'h': H, 'band': 110} for s1 in (0.55, 0.65)]}
(HERE / 'spec-hfb-w7wallrun.json').write_text(json.dumps(spec, indent=1))
print('bands', len(bands))
