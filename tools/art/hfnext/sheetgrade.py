"""ART-SHEETS (R-165.379): the R-165.378 Lab transfer (regrade.py --ship --even, the exact same passes) for the hero sheets that are NOT
clips, by the game's own frame tables (sheetbody.py's FRAMES): each sheet's body colour moves onto the plain pose's palette, the outline
(L < 18 none, full from L 28) and the eyes' whites (L > 80 and chroma < 8 none, full from chroma 14) untouched, and no prop either (water
blue b < -2 or leaf green a < -4: weight 0, the same frame mask sheetbody.py measures with). One L-binned a/b curve + an L shift per sheet,
5 global passes closing the fur MEAN as it ships (WebP q86 method 6), then --even: each frame's own offset, smoothed [1 2 1] over its
neighbours in table order (10 passes), then 3 exact per-frame passes. Pixels outside every frame rect are not touched. Overlapping rects
(atlas idle_a / guard) are each graded from the ORIGINAL pixels, the later frame's grade kept there (nothing is graded twice).
    python3 -I tools/art/hfnext/sheetgrade.py rope,swim,vine,climb2 [--from 4f0853b96] [--dry]
Reads each sheet from git at --from, writes it to src/assets/hero/ (q86), records the transfer in tools/art/hfnext/sheetgrade.json.
"""
import io, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

NAMES = sys.argv[1].split(',')
REV = sys.argv[sys.argv.index('--from') + 1] if '--from' in sys.argv else '4f0853b96'
DRY = '--dry' in sys.argv
LHALF = '--lhalf' in sys.argv   # the lead (swim): a/b in full, HALF the L shift, no per-frame L (pose shading fooled the mean's L)
BANDS = '--bands' in sys.argv   # the lead (swim): L by BAND, the sheet's fur L quantiles mapped onto the plain pose's (light fur onto light
                                # fur, dark onto dark: keeps the tonal range), a/b per L as before; per-frame offsets a/b only
OUTDIR = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else None   # write the sheet there instead (a variant to compare)
JS = ("import {ROPE_FRAMES} from './src/game/heroRopeData.ts'; import {SWIM_MOVES} from './src/game/heroSwimData.ts';"
      "import {VINE_FRAMES} from './src/game/heroVineData.ts'; import {STORY_FRAMES} from './src/game/heroStoryData.ts';"
      "import {STUDY_FRAMES} from './src/game/heroStudiesData.ts'; import {HERO_FRAMES} from './src/game/heroAtlasData.ts';"
      "const swim = {}; for (const [n, m] of Object.entries(SWIM_MOVES)) m.at.forEach(([x, y], i) => (swim[n + i] = {x, y, w: m.w, h: m.h}));"
      "console.log(JSON.stringify({rope: ROPE_FRAMES, swim, vine: VINE_FRAMES, story: STORY_FRAMES, studies: STUDY_FRAMES, atlas: HERO_FRAMES}))")
FRAMES = json.loads(subprocess.run(['npx', 'tsx', '-e', JS], capture_output=True, text=True, check=True).stdout)
FRAMES['climb2'] = json.load(open('src/assets/hero/hero-climb2.json'))['frames']
SHEET = {'rope': 'hero-rope', 'swim': 'pokey-swim', 'vine': 'hero-vine', 'story': 'hero-story', 'studies': 'hero-studies',
         'atlas': 'hero-atlas', 'climb2': 'hero-climb2'}
LOOPS = {'rope', 'swim', 'vine', 'climb2'}   # sheets whose frames the game cycles through in table order (smoothing wraps)
_M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); _W = np.array([0.9505, 1.0, 1.089])


def lab(rgb_):   # the same sRGB -> Lab (D65) as regrade.py
    c = rgb_ / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    f = (c @ _M.T) / _W; f = np.where(f > 0.008856, np.cbrt(f), 7.787 * f + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def rgb(L):
    fy = (L[..., 0] + 16) / 116; f = np.stack([fy + L[..., 1] / 500, fy, fy - L[..., 2] / 200], -1)
    xyz = np.where(f > 0.206893, f ** 3, (f - 16 / 116) / 7.787) * _W
    c = np.clip(xyz @ np.linalg.inv(_M).T, 0, 1); c = np.where(c > 0.0031308, 1.055 * np.power(c, 1 / 2.4) - 0.055, 12.92 * c)
    return np.clip(c * 255, 0, 255)


def furm(L):   # sheetbody.py's frame mask over Lab px of SOLID pixels
    C = np.hypot(L[..., 1], L[..., 2]); return (L[..., 0] >= 25) & ~((L[..., 0] > 85) & (C < 12)) & (L[..., 2] > -2) & (L[..., 1] > -4)


BINS = np.arange(25, 105, 5)


def bin_means(F):
    idx = np.clip(np.digitize(F[:, 0], BINS) - 1, 0, len(BINS) - 2)
    n = np.bincount(idx, minlength=len(BINS) - 1).astype(float)
    a = np.bincount(idx, F[:, 1], len(BINS) - 1) / np.maximum(n, 1); b = np.bincount(idx, F[:, 2], len(BINS) - 1) / np.maximum(n, 1)
    return n, a, b


def smooth(v, w):
    k = np.array([1, 2, 1.0]); vw = np.convolve(np.pad(v * w, 1, mode='edge'), k, 'valid'); ww = np.convolve(np.pad(w, 1, mode='edge'), k, 'valid')
    return vw / np.maximum(ww, 1e-9)


std = np.asarray(Image.open('src/assets/hero/hero-standard.webp').convert('RGBA')).astype(np.float32)[478:478 + 209, 674:674 + 127]
PL = lab(std[..., :3])[std[..., 3] > 200]; PF = PL[furm(PL)]; pm = PF.mean(0)
rec = json.loads(Path('tools/art/hfnext/sheetgrade.json').read_text()) if Path('tools/art/hfnext/sheetgrade.json').exists() else {}
for name in NAMES:
    path = f'src/assets/hero/{SHEET[name]}.webp'
    sheet = np.asarray(Image.open(io.BytesIO(subprocess.run(['git', 'show', f'{REV}:{path}'], capture_output=True, check=True).stdout)).convert('RGBA')).astype(np.float32)
    R = list(FRAMES[name].values())
    FACE = [n.startswith('face_') for n in FRAMES[name]]   # atlas face close-ups (HeroFaceIcon): the face is lighter than the body by design,
                                                           # so they take the sheet's curve but no per-frame pull and do not steer the mean
    crop = lambda s, r: s[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w']]
    fr = [crop(sheet, r) for r in R]
    CF = np.concatenate([L[furm(L)] for k, L in enumerate(lab(f[..., :3])[f[..., 3] > 200] for f in fr) if not FACE[k]])
    pn, pa, pb = bin_means(PF); cn, ca, cb = bin_means(CF)
    w = np.minimum(pn, cn); ok = w >= 200
    ga, gb = pm[1] - CF[:, 1].mean(), pm[2] - CF[:, 2].mean()
    da = np.where(ok, pa - ca, ga); db = np.where(ok, pb - cb, gb)
    da, db = smooth(da, np.where(ok, w, 1.0)), smooth(db, np.where(ok, w, 1.0))
    dL = float(pm[0] - CF[:, 0].mean()); ctr = (BINS[:-1] + BINS[1:]) / 2

    QS = np.linspace(2, 98, 25); qx = np.percentile(CF[:, 0], QS); qd = np.percentile(PF[:, 0], QS) - qx
    if BANDS:
        dL = 0.0

    def apply(f, ev=(0.0, 0.0, 0.0)):
        out = f.copy(); vis = f[..., 3] > 0; L = lab(f[..., :3][vis]); C = np.hypot(L[:, 1], L[:, 2])
        wt = np.clip((L[:, 0] - 18) / 10, 0, 1)                           # the outline stays
        wt *= np.where(L[:, 0] > 80, np.clip((C - 8) / 6, 0, 1), 1)      # the eyes' whites stay
        wt *= ((L[:, 2] > -2) & (L[:, 1] > -4))                           # no prop (water, leaves)
        L2 = L.copy(); L2[:, 0] += wt * (dL + ev[0] + (np.interp(L[:, 0], qx, qd) if BANDS else 0))
        L2[:, 1] += wt * (np.interp(L[:, 0], ctr, da) + ev[1]); L2[:, 2] += wt * (np.interp(L[:, 0], ctr, db) + ev[2])
        out[..., :3][vis] = np.round(rgb(L2)); return out

    def sheet_of(nf):
        out = sheet.copy()
        for r, f in zip(R, nf):
            out[r['y']:r['y'] + r['h'], r['x']:r['x'] + r['w']] = f
        return out

    def shipped_fur(nf, each=False):   # the fur as it SHIPS: through the q86 WebP encode
        b = io.BytesIO(); Image.fromarray(sheet_of(nf).astype(np.uint8), 'RGBA').save(b, 'WEBP', quality=86, method=6)
        s2 = np.asarray(Image.open(b).convert('RGBA')).astype(np.float32)
        per = [L[furm(L)] for L in (lab(crop(s2, r)[..., :3])[crop(s2, r)[..., 3] > 200] for r in R)]
        return per if each else np.concatenate([u for k, u in enumerate(per) if not FACE[k]])
    for _ in range(5):
        NF = shipped_fur([apply(f) for f in fr]); r_ = pm - NF.mean(0); dL += float(r_[0]); da = da + r_[1]; db = db + r_[2]
    if LHALF:
        dL *= 0.5
    EV = np.zeros((len(fr), 3)); mode = 'wrap' if name in LOOPS else 'edge'
    big = [len(L) > 50 and not FACE[k] for k, L in enumerate(shipped_fur(fr, each=True))]
    for _ in range(10):
        per = shipped_fur([apply(f, EV[k]) for k, f in enumerate(fr)], each=True)
        Rr = np.array([pm - u.mean(0) if big[k] else np.zeros(3) for k, u in enumerate(per)])
        if LHALF or BANDS:
            Rr[:, 0] = 0
        Rp = np.pad(Rr, ((1, 1), (0, 0)), mode=mode); EV = (EV + (Rp[:-2] + 2 * Rp[1:-1] + Rp[2:]) / 4) * ~np.array(FACE)[:, None]
    for _ in range(3):
        per = shipped_fur([apply(f, EV[k]) for k, f in enumerate(fr)], each=True)
        EV = EV + np.array([pm - u.mean(0) if big[k] else np.zeros(3) for k, u in enumerate(per)]) * ([0, 1, 1] if LHALF or BANDS else 1)
    nf = [apply(f, EV[k]) for k, f in enumerate(fr)]
    per = shipped_fur(nf, each=True); NF = shipped_fur(nf)
    fd = [float(np.linalg.norm(u.mean(0) - pm)) for k, u in enumerate(per) if big[k]]
    print(f'{name}: fur mean {CF.mean(0).round(2)} -> {NF.mean(0).round(2)} (plain {pm.round(2)}); pooled dE {np.linalg.norm(CF.mean(0) - pm):.2f} -> '
          f'{np.linalg.norm(NF.mean(0) - pm):.2f}; worst frame after {max(fd):.2f}; dL {dL:+.2f}; |even| max {np.abs(EV).max():.2f}')
    rec[name] = {'sheet': path, 'from': REV, 'written': 'q86 method 6', 'dL': round(dL, 3), 'L_bin_centres': ctr.tolist(), 'da': np.round(da, 3).tolist(),
                 'db': np.round(db, 3).tolist(), 'even': np.round(EV, 3).tolist(), 'fur_mean_before': np.round(CF.mean(0), 2).tolist(),
                 'fur_mean_after': np.round(NF.mean(0), 2).tolist(), 'plain_fur_mean': np.round(pm, 2).tolist()}
    if DRY:
        continue
    Image.fromarray(sheet_of(nf).astype(np.uint8), 'RGBA').save(f'{OUTDIR}/{SHEET[name]}.webp' if OUTDIR else path, 'WEBP', quality=86, method=6)
    if OUTDIR:
        continue
if not DRY and not OUTDIR:
    Path('tools/art/hfnext/sheetgrade.json').write_text(json.dumps(rec, indent=1) + '\n')
