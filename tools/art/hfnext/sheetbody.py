"""ART-SHEETS (R-165.379): herobody.py's measure for the hero sheets that are NOT clips: rope, swim, vine, story, studies, atlas, and the
two-vine climb (herobody.py already holds climb2; it is listed here so every non-clip sheet sits in one table). Frames come from the
game's own frame tables (heroRopeData ROPE_FRAMES, heroSwimData SWIM_MOVES, heroVineData VINE_FRAMES, heroStoryData STORY_FRAMES,
heroStudiesData STUDY_FRAMES, heroAtlasData HERO_FRAMES, hero-climb2.json). The FRAME MASK: herobody.py's fur mask (alpha > 200, not the
outline L < 25, not the eye whites L > 85 and chroma < 12) and also not a prop: no water blue (b < -2) and no vine or leaf green (a < -4),
so the water or the rope never counts as fur (the rope and the vine are cut out of these sheets already: 0% of px fall to the prop mask;
the atlas's leaf pack and swim's splashes are the 1.8% / 0.2% it removes). Per sheet: pooled and worst frame against the plain pose.
    python3 -I tools/art/hfnext/sheetbody.py [--json OUT]
"""
import json, subprocess, sys
import numpy as np
from PIL import Image

JS = ("import {ROPE_FRAMES} from './src/game/heroRopeData.ts'; import {SWIM_MOVES} from './src/game/heroSwimData.ts';"
      "import {VINE_FRAMES} from './src/game/heroVineData.ts'; import {STORY_FRAMES} from './src/game/heroStoryData.ts';"
      "import {STUDY_FRAMES} from './src/game/heroStudiesData.ts'; import {HERO_FRAMES} from './src/game/heroAtlasData.ts';"
      "const swim = {}; for (const [n, m] of Object.entries(SWIM_MOVES)) m.at.forEach(([x, y], i) => (swim[n + i] = {x, y, w: m.w, h: m.h}));"
      "console.log(JSON.stringify({rope: ROPE_FRAMES, swim, vine: VINE_FRAMES, story: STORY_FRAMES, studies: STUDY_FRAMES, atlas: HERO_FRAMES}))")
FRAMES = json.loads(subprocess.run(['npx', 'tsx', '-e', JS], capture_output=True, text=True, check=True).stdout)
FRAMES['climb2'] = json.load(open('src/assets/hero/hero-climb2.json'))['frames']
SHEET = {'rope': 'hero-rope', 'swim': 'pokey-swim', 'vine': 'hero-vine', 'story': 'hero-story', 'studies': 'hero-studies',
         'atlas': 'hero-atlas', 'climb2': 'hero-climb2'}


def lab(rgb):   # the same sRGB -> Lab (D65) as herobody.py, clipde.py and regrade.py
    c = rgb / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]).T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def fur(f):
    L = lab(f[..., :3])[f[..., 3] > 200]; C = np.hypot(L[:, 1], L[:, 2])
    return L[(L[:, 0] >= 25) & ~((L[:, 0] > 85) & (C < 12)) & (L[:, 2] > -2) & (L[:, 1] > -4)]


def load(p):
    return np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)


PF = fur(load('src/assets/hero/hero-standard.webp')[478:478 + 209, 674:674 + 127]).mean(0)
res = {}
for k, fr in FRAMES.items():
    im = load(f'src/assets/hero/{SHEET[k]}.webp')
    FU = {n: fur(im[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w']]) for n, r in fr.items()}
    fd = {n: round(float(np.linalg.norm(u.mean(0) - PF)), 2) for n, u in FU.items() if len(u) > 50}
    pooled = np.concatenate(list(FU.values())).mean(0); w = max(fd, key=fd.get)
    res[k] = {'sheet': f'src/assets/hero/{SHEET[k]}.webp', 'frames': len(fr), 'pooled': round(float(np.linalg.norm(pooled - PF)), 2),
              'frame_max': fd[w], 'frame_max_at': w, 'fur_lab': pooled.round(2).tolist(), 'frame_de': fd}
    print(f"{k:8s} {len(fr):3d} frames | fur L a b {pooled.round(1)} | pooled {res[k]['pooled']:5.2f} dE, worst frame {fd[w]:5.2f} ({w}) | "
          f"over the clips' bar (frame 2.0 / pooled 1.0): {'YES' if fd[w] > 2.0 or res[k]['pooled'] > 1.0 else 'no'}")
print('plain fur L a b', PF.round(2))
if '--json' in sys.argv:
    json.dump(res, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=1)
