"""ART-NEXT-d (lead's polish point): colour steps between consecutive frames of each idle clip, mean Lab dE76 over the pixels solid
(alpha > 200) in both frames, feet-anchored as the game draws them. Prints the plain-end steps (0->1, N-2->N-1) against the median and
max step inside the clip, so a colour pop at the plain pose reads as a number.
    python3 -I tools/art/hfnext/clipde.py [clip,...]
"""
import json, subprocess, sys
import numpy as np
from PIL import Image
CL = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {HERO_CLIPS} from './src/game/heroClipsData.ts'; console.log(JSON.stringify(HERO_CLIPS))"],
                               capture_output=True, text=True, check=True).stdout)
clips = sys.argv[1].split(',') if len(sys.argv) > 1 else ['idle-yawn', 'look-around', 'belly-scratch', 'wave']


def lab(rgb):
    c = rgb / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]).T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


for n in clips:
    c = CL[n]; im = np.asarray(Image.open(f'src/assets/hero/clips/{n}.webp').convert('RGBA')).astype(np.float32)
    fr = [im[(k // c['cols']) * c['h']:(k // c['cols'] + 1) * c['h'], (k % c['cols']) * c['w']:(k % c['cols'] + 1) * c['w']] for k in range(c['n'])]
    L = [lab(f[..., :3]) for f in fr]
    de = []
    for k in range(c['n'] - 1):
        m = (fr[k][..., 3] > 200) & (fr[k + 1][..., 3] > 200)
        de.append(float(np.linalg.norm(L[k][m] - L[k + 1][m], axis=1).mean()))
    inner = de[1:-1]
    mu = [L[k][fr[k][..., 3] > 200].mean(0) for k in range(c['n'])]          # each frame's mean body colour (motion-free)
    dm = [float(np.linalg.norm(mu[k + 1] - mu[k])) for k in range(c['n'] - 1)]
    print(f"{n:14s} px 0->1 {de[0]:5.2f} N-2->N-1 {de[-1]:5.2f} inner med {np.median(inner):5.2f} | MEAN-colour dE 0->1 {dm[0]:5.2f}"
          f" N-2->N-1 {dm[-1]:5.2f} inner med {np.median(dm[1:-1]):5.2f} max {max(dm[1:-1]):5.2f} (step {1 + int(np.argmax(dm[1:-1]))});"
          f" plain->mid-clip {float(np.linalg.norm(mu[c['n'] // 2] - mu[0])):5.2f}")
