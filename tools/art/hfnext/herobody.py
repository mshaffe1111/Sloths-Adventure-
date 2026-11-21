"""ART-HERO (R-165.378, D108): Pokey is one sloth in EVERY animation, not only the idles. For every hero sheet the game draws frames of
(every clip in src/game/heroClipsData.ts HERO_CLIPS, and the two-vine climb hero-climb2.webp by its frame rects), each frame's mean FUR
colour against the plain pose's: the same mask as regrade.py and clipde.py (solid px alpha > 200, not the outline L < 25, not the eyes'
whites L > 85 and chroma < 12; plain = hero-standard.webp's idle crop). Per sheet: frame_max (and where), and pooled (every fur px of
the sheet's frames together; an idle clip's bridges are left out, as clipde.py does). It writes src/game/heroBody.json, which
src/game/heroClipsBody.test.ts holds to the shipped sheets by SHA-256 and to the bar (frame_max <= 2.0, pooled <= 1.0) or, for a
sheet not regraded yet, to its row in src/game/heroBody.known.json (shrink-only: knowncheck.mjs).
    python3 -I tools/art/hfnext/herobody.py            print the table
    python3 -I tools/art/hfnext/herobody.py --write    also write src/game/heroBody.json
    python3 -I tools/art/hfnext/herobody.py --check    exit 1 if that JSON is stale
"""
import hashlib, json, subprocess, sys
import numpy as np
from PIL import Image

CL = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {HERO_CLIPS} from './src/game/heroClipsData.ts'; console.log(JSON.stringify(HERO_CLIPS))"],
                               capture_output=True, text=True, check=True).stdout)
LAY = json.load(open('tools/art/hfnext/bridges.json'))
C2 = json.load(open('src/assets/hero/hero-climb2.json'))
OUT = 'src/game/heroBody.json'
STDP = 'src/assets/hero/hero-standard.webp'


def lab(rgb):   # the same sRGB -> Lab (D65) as clipde.py and regrade.py
    c = rgb / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]).T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def fur(f):
    L = lab(f[..., :3])[f[..., 3] > 200]; C = np.hypot(L[:, 1], L[:, 2]); return L[(L[:, 0] >= 25) & ~((L[:, 0] > 85) & (C < 12))]


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


PF = fur(np.asarray(Image.open(STDP).convert('RGBA')).astype(np.float32)[478:478 + 209, 674:674 + 127]).mean(0)
sheets = {}
for nm, c in CL.items():
    p = f'src/assets/hero/clips/{nm}.webp'
    im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
    fr = [im[(k // c['cols']) * c['h']:(k // c['cols'] + 1) * c['h'], (k % c['cols']) * c['w']:(k % c['cols'] + 1) * c['w']] for k in range(c['n'])]
    lay = LAY.get(nm)
    own = range(c['n']) if not lay else (range(1, c['n'] - 1) if lay['replace'] else range(lay['bridge'], lay['bridge'] + lay['own']))
    sheets[nm] = (p, [fr[k] for k in own])
p = 'src/assets/hero/hero-climb2.webp'
im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
sheets['hero-climb2'] = (p, [im[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w']] for r in C2['frames'].values()])

res = {}
for nm, (p, fr) in sheets.items():
    FU = [fur(f) for f in fr]; fd = [float(np.linalg.norm(u.mean(0) - PF)) for u in FU]
    pooled = np.concatenate(FU).mean(0)
    res[nm] = {'sheet': p, 'sheet_sha256': sha(p), 'frames': len(fr), 'frame_max': round(max(fd), 3), 'frame_max_at': int(np.argmax(fd)),
               'pooled': round(float(np.linalg.norm(pooled - PF)), 3), 'fur_lab': np.round(pooled, 2).tolist()}
    r = res[nm]
    print(f"{nm:14s} {r['frames']:3d} frames | fur L a b {pooled.round(1)} | pooled {r['pooled']:5.2f} dE, worst frame {r['frame_max']:5.2f} (#{r['frame_max_at']})")
if '--write' in sys.argv or '--check' in sys.argv:
    txt = json.dumps({'bar': {'frame_max': 2.0, 'pooled': 1.0}, 'plain_sha256': sha(STDP), 'plain_fur_lab': np.round(PF, 2).tolist(), 'sheets': res},
                     indent=1) + '\n'
    if '--check' in sys.argv:
        sys.exit(0 if open(OUT).read() == txt else f'{OUT} is stale: re-run tools/art/hfnext/herobody.py --write')
    open(OUT, 'w').write(txt); print('wrote', OUT)
