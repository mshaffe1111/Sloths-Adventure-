"""ART-HERO (R-165.378, D108): Pokey is one sloth in EVERY animation, not only the idles. For every hero sheet the game draws frames of
(every clip in src/game/heroClipsData.ts HERO_CLIPS, and the two-vine climb hero-climb2.webp by its frame rects), each frame's mean FUR
colour against the plain pose's: the same mask as regrade.py and clipde.py (solid px alpha > 200, not the outline L < 25, not the eyes'
whites L > 85 and chroma < 12; plain = hero-standard.webp's idle crop). Per sheet: frame_max (and where), and pooled (every fur px of
the sheet's frames together; an idle clip's bridges are left out, as clipde.py does). It writes src/game/heroBody.json, which
src/game/heroClipsBody.test.ts holds to the shipped sheets by SHA-256 and to the bar (frame_max <= 2.0, pooled <= 1.0) or, for a
sheet not regraded yet, to its row in src/game/heroBody.known.json (shrink-only: knowncheck.mjs). Also per sheet the fur-mean step
between frames (median, max) and the LOOP SEAM, last frame -> first: a clip the game loops or cycles (push, climb, walk, run) must not
pop there (the test: loop_seam <= max(2 x step_median, 0.5) and <= 1.0; push's was 3.3 dE before ART-HERO).
    python3 -I tools/art/hfnext/herobody.py            print the table
    python3 -I tools/art/hfnext/herobody.py --write    also write src/game/heroBody.json
    python3 -I tools/art/hfnext/herobody.py --check    exit 1 if that JSON is stale
"""
import hashlib, json, re, subprocess, sys
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
# ART-SHEETS (R-165.379): the non-clip sheets too, by the game's own frame tables, with sheetbody.py's frame mask (no water blue, no leaf
# green: a prop never counts as fur); the atlas's face_* close-ups (HeroFaceIcon) are faces, lighter by design, and are left out.
sys.path.insert(0, 'tools/art/hfnext'); import sheetbody as SB  # noqa: E402
PROPMASKED = set(); GROUPS = {}


def fam(k, n):   # ART-SHEETS-b: the move group a frame is graded and banded in (sheetgrade.py --group's): swim by move, rope/vine/climb2
    if k in ('rope', 'vine', 'climb2'):   # one group, atlas/story/studies by pose family; a clip is one group
        return 'all'
    return re.sub(r'\d+$', '', n) if k == 'swim' else re.sub(r'_(?:[a-z]|\d+|rec|blink|up|down)$', '', n)   # ART-SHEETS-c: sheetgrade.py's pose family


def bands(F):   # the BAND check (the lead, 11-21): FUR ONLY (L >= 72 out: the cream belly, face mask and bandages, whose share is pose),
    F = F[F[:, 0] < 72]   # split at its OWN median L, light half and dark half (a mean is fooled by a grade that squashes the range)
    m = np.median(F[:, 0]); return F[F[:, 0] >= m].mean(0), F[F[:, 0] < m].mean(0)
for k, nm in SB.SHEET.items():
    if k == 'climb2':
        continue
    p = f'src/assets/hero/{nm}.webp'; im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
    FN = [n for n in SB.FRAMES[k] if not n.startswith('face_')]; GROUPS[nm] = [fam(k, n) for n in FN]
    sheets[nm] = (p, [im[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w']] for r in (SB.FRAMES[k][n] for n in FN)]); PROPMASKED.add(nm)

PFA = fur(np.asarray(Image.open(STDP).convert('RGBA')).astype(np.float32)[478:478 + 209, 674:674 + 127]); PLB, PDB = bands(PFA)
res = {}
for nm, (p, fr) in sheets.items():
    FU = [SB.fur(f) if nm in PROPMASKED else fur(f) for f in fr]; FU = [u for u in FU if len(u) > 50]; fd = [float(np.linalg.norm(u.mean(0) - PF)) for u in FU]
    pooled = np.concatenate(FU).mean(0)
    mu = [u.mean(0) for u in FU]; st = [float(np.linalg.norm(mu[k + 1] - mu[k])) for k in range(len(mu) - 1)]
    res[nm] = {'sheet': p, 'sheet_sha256': sha(p), 'frames': len(fr), 'frame_max': round(max(fd), 3), 'frame_max_at': int(np.argmax(fd)),
               'pooled': round(float(np.linalg.norm(pooled - PF)), 3), 'fur_lab': np.round(pooled, 2).tolist(),
               'step_median': round(float(np.median(st)), 3), 'step_max': round(max(st), 3), 'loop_seam': round(float(np.linalg.norm(mu[0] - mu[-1])), 3)}
    FA = [SB.fur(f) if nm in PROPMASKED else fur(f) for f in fr]; gr = GROUPS.get(nm, ['all'] * len(fr)); bd = {}
    for g in sorted(set(gr)):   # per move group: its light band vs the plain pose's light band, dark vs dark (dE)
        l, d = bands(np.concatenate([u for u, h in zip(FA, gr) if h == g]))
        bd[g] = {'light': round(float(np.linalg.norm(l - PLB)), 3), 'dark': round(float(np.linalg.norm(d - PDB)), 3)}
    res[nm]['bands'] = bd; res[nm]['band_max'] = max(max(v['light'], v['dark']) for v in bd.values())
    r = res[nm]
    print(f"{nm:14s} {r['frames']:3d} frames | fur L a b {pooled.round(1)} | pooled {r['pooled']:5.2f} dE, worst frame {r['frame_max']:5.2f} (#{r['frame_max_at']}) | fur steps median {r['step_median']:4.2f} max {r['step_max']:4.2f}, last->first {r['loop_seam']:4.2f} | band max {r['band_max']:4.2f}")
if '--write' in sys.argv or '--check' in sys.argv:
    txt = json.dumps({'bar': {'frame_max': 2.0, 'pooled': 1.0}, 'loop_bar': {'times_median': 2, 'floor': 0.5, 'ceiling': 1.0}, 'plain_sha256': sha(STDP), 'plain_fur_lab': np.round(PF, 2).tolist(), 'sheets': res},
                     indent=1) + '\n'
    if '--check' in sys.argv:
        sys.exit(0 if open(OUT).read() == txt else f'{OUT} is stale: re-run tools/art/hfnext/herobody.py --write')
    open(OUT, 'w').write(txt); print('wrote', OUT)

# ART-SHEETS-b (the lead's ruling, 11-21): the fur-only bands are a RATCHET, not a bar (pose lighting moves the brown fur's shading, so a
# fixed band bar contradicts the eye). --ratchet records every sheet's bands at its ACCEPTED state into src/game/heroBands.ratchet.json;
# heroClipsBody.test.ts fails any band more than 1.0 dE WORSE than recorded (a grade cannot squash silently). Re-record only a sheet the
# lead accepted; a recorded band may only go DOWN (this refuses a rise).
RAT = 'src/game/heroBands.ratchet.json'
if '--ratchet' in sys.argv:
    old = json.load(open(RAT))['sheets'] if __import__('os').path.exists(RAT) else {}
    only = sys.argv[sys.argv.index('--ratchet') + 1].split(',') if len(sys.argv) > sys.argv.index('--ratchet') + 1 else list(res)
    new = dict(old)
    for nm in only:
        for g, b in res[nm]['bands'].items():
            for side in ('light', 'dark'):
                if nm in old and g in old[nm] and b[side] > old[nm][g][side]:
                    sys.exit(f'{nm} {g} {side}: {b[side]} is worse than the recorded {old[nm][g][side]}; the ratchet only moves down')
        new[nm] = res[nm]['bands']
    open(RAT, 'w').write(json.dumps({'note': 'fur-only light/dark bands per move group at each sheet\'s accepted state (herobody.py --ratchet); '
                                      'heroClipsBody.test.ts fails a band > 1.0 dE worse', 'slack': 1.0, 'sheets': new}, indent=1) + '\n')
    print('wrote', RAT, len(new), 'sheets')
