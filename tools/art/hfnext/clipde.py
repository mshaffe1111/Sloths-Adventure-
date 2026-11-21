"""ART-NEXT-d/e (lead's polish point, R-165.354): colour steps between consecutive frames of each idle clip, mean Lab dE76, feet-anchored
as the game draws them. Two numbers per step: px = mean per-pixel dE over the pixels solid (alpha > 200) in both frames (motion shows
in it); MEAN = dE between the two frames' mean body colours (motion-free; the colour pop). The seams are the steps where a bridge meets
the plain pose or the clip (tools/art/hfnext/bridges.json, written by bridgebake.py, says where each clip's bridges are):
 bridged clip  plain -> bridge in (step 0), bridge in -> clip f0, clip LAST -> bridge out, bridge out -> plain (step N-2)
 --replace     plain -> take (step 0), take -> plain (step N-2)
The bar (ART-NEXT-e, D108 gate): each seam's MEAN step <= max(2 x the median MEAN step inside its clip's bridges, 0.5) and < 1.0.
    python3 -I tools/art/hfnext/clipde.py [clip,...]        print the table
    python3 -I tools/art/hfnext/clipde.py --write           also write src/game/heroClipsSeams.json (read by heroClipsSeams.test.ts)
    python3 -I tools/art/hfnext/clipde.py --check           exit 1 if that JSON is stale
"""
import hashlib, json, subprocess, sys
import numpy as np
from PIL import Image
CL = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {HERO_CLIPS} from './src/game/heroClipsData.ts'; console.log(JSON.stringify(HERO_CLIPS))"],
                               capture_output=True, text=True, check=True).stdout)
IDLE = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {IDLE_CLIPS} from './src/game/heroClips.ts'; console.log(JSON.stringify(IDLE_CLIPS))"],
                                 capture_output=True, text=True, check=True).stdout)
LAY = json.load(open('tools/art/hfnext/bridges.json'))
OUT = 'src/game/heroClipsSeams.json'
args = [a for a in sys.argv[1:] if not a.startswith('--')]
clips = args[0].split(',') if args else IDLE


def lab(rgb):
    c = rgb / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]).T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def seams(n, lay):
    """(seam steps, inner-bridge steps) for a clip of n frames; step k is frame k -> k+1."""
    if lay['replace']:
        assert lay['bridge'] == n, f"bridges.json says {lay['bridge']} frames, the sheet has {n}"
        return [0, n - 2], list(range(1, n - 2))
    b, o = lay['bridge'], lay['own']
    assert 2 * b + o == n, f"bridges.json says 2 x {b} + {o} frames, the sheet has {n}"
    return [0, b - 1, b + o - 1, n - 2], list(range(1, b - 1)) + list(range(b + o, n - 2))


res = {}
for nm in clips:
    c = CL[nm]; p = f'src/assets/hero/clips/{nm}.webp'
    im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
    fr = [im[(k // c['cols']) * c['h']:(k // c['cols'] + 1) * c['h'], (k % c['cols']) * c['w']:(k % c['cols'] + 1) * c['w']] for k in range(c['n'])]
    L = [lab(f[..., :3]) for f in fr]
    px = []
    for k in range(c['n'] - 1):
        m = (fr[k][..., 3] > 200) & (fr[k + 1][..., 3] > 200)
        px.append(float(np.linalg.norm(L[k][m] - L[k + 1][m], axis=1).mean()))
    mu = [L[k][fr[k][..., 3] > 200].mean(0) for k in range(c['n'])]          # each frame's mean body colour (motion-free)
    dm = [float(np.linalg.norm(mu[k + 1] - mu[k])) for k in range(c['n'] - 1)]
    sm, inn = seams(c['n'], LAY[nm])
    med = float(np.median([dm[k] for k in inn]))
    lim = min(max(2 * med, 0.5), 1.0)
    res[nm] = {'sheet_sha256': hashlib.sha256(open(p, 'rb').read()).hexdigest(), 'n': c['n'], 'bridge_median': round(med, 3),
               'seams': {str(k): round(dm[k], 3) for k in sm}}
    print(f"{nm:14s} n {c['n']} bridge median {med:4.2f} limit {lim:4.2f} | seams MEAN " +
          ' '.join(f"s{k} {dm[k]:4.2f}{'' if dm[k] <= lim else '!'}" for k in sm) +
          f" | px 0->1 {px[0]:4.2f} N-2->N-1 {px[-1]:4.2f} | inner max {max(dm[k] for k in inn):4.2f}; plain->mid-clip {float(np.linalg.norm(mu[c['n'] // 2] - mu[0])):4.2f}")
if '--write' in sys.argv or '--check' in sys.argv:
    assert clips == IDLE, 'write/check measure every idle clip'
    txt = json.dumps({'bar': {'times_median': 2, 'floor': 0.5, 'ceiling': 1.0}, 'clips': res}, indent=1) + '\n'
    if '--check' in sys.argv:
        sys.exit(0 if open(OUT).read() == txt else f'{OUT} is stale: re-run tools/art/hfnext/clipde.py --write')
    open(OUT, 'w').write(txt); print('wrote', OUT)
