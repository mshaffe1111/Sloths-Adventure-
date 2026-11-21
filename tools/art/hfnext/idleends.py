"""ART-NEXT-c (R-165.354): measure every idle clip's first and last frame against Pokey's plain pose, and write
src/game/heroClipsEnds.json for src/game/heroClipsEnds.test.ts (CI has no image decoder: the test checks each sheet's SHA-256 against
the one measured here, so a sheet re-cut without re-running this fails, then checks the numbers).
    python3 -I tools/art/hfnext/idleends.py [--check]
Frames are drawn feet-anchored on one canvas (the clip's ax/ay vs heroStandardData idle's 57/205), alpha > 128. Per end frame:
 box  the silhouette's top, bottom, left, right; feet  the left/right of the lowest 12 rows; head  the left/right of the top 30 rows;
 xor  silhouette px that differ from the plain frame's, as a share of the plain frame's solid px.
"""
import hashlib, json, subprocess, sys
import numpy as np
from PIL import Image

IDLE = ['idle-yawn', 'look-around', 'belly-scratch', 'wave', 'doze']      # heroClips.ts IDLE_CLIPS
OUT = 'src/game/heroClipsEnds.json'
CL = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {HERO_CLIPS} from './src/game/heroClipsData.ts'; console.log(JSON.stringify(HERO_CLIPS))"],
                               capture_output=True, text=True, check=True).stdout)
STD = 'src/assets/hero/hero-standard.webp'


def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def canvas(fr, ax, ay, W=320, H=280, AX=160, AY=250):
    c = np.zeros((H, W), bool); ox, oy = int(round(AX - ax)), int(round(AY - ay)); h, w = fr.shape
    c[oy:oy + h, ox:ox + w] = fr; return c


def stats(m):
    ys, xs = np.nonzero(m); t, b = int(ys.min()), int(ys.max())
    fx = np.nonzero(m[b - 11:b + 1].any(0))[0]; hx = np.nonzero(m[t:t + 30].any(0))[0]
    return {'box': [t, b, int(xs.min()), int(xs.max())], 'feet': [int(fx.min()), int(fx.max())], 'head': [int(hx.min()), int(hx.max())]}


std = np.asarray(Image.open(STD).convert('RGBA'))[..., 3] > 128
P = canvas(std[478:478 + 209, 674:674 + 127], 57.0, 205.0)
ps = stats(P)
res = {'plain': {'sheet_sha256': sha(STD), **ps, 'solid': int(P.sum())}, 'clips': {}}
for n in IDLE:
    c = CL[n]; f = f'src/assets/hero/clips/{n}.webp'
    im = np.asarray(Image.open(f).convert('RGBA'))[..., 3] > 128
    ends = {}
    for tag, k in (('first', 0), ('last', c['n'] - 1)):
        x, y = (k % c['cols']) * c['w'], (k // c['cols']) * c['h']
        m = canvas(im[y:y + c['h'], x:x + c['w']], c['ax'], c['ay'])
        s = stats(m)
        ends[tag] = {**s, 'xor': round(float((m ^ P).sum()) / int(P.sum()), 4),
                     'dmax': max(abs(a - b) for key in ('box', 'feet', 'head') for a, b in zip(s[key], ps[key]))}
    res['clips'][n] = {'sheet_sha256': sha(f), 'n': c['n'], **ends}
txt = json.dumps(res, indent=1) + '\n'
if '--check' in sys.argv:
    sys.exit(0 if open(OUT).read() == txt else 'heroClipsEnds.json is stale: re-run tools/art/hfnext/idleends.py')
open(OUT, 'w').write(txt)
for n, v in res['clips'].items():
    print(f"{n:14s} first dmax {v['first']['dmax']:3d} xor {v['first']['xor']:.3f} | last dmax {v['last']['dmax']:3d} xor {v['last']['xor']:.3f}")
