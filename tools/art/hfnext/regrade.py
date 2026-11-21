"""ART-REGRADE (R-165.377): Pokey is one sloth in every animation. The old idle clips (yawn, look-around, wave) were painted with his fur
less red and less yellow than his plain pose (fur mean a 12.7 vs 16.5, b 26.8 vs 29.6: about 5-7 dE, 'paler and beiger'). This moves each
clip's body colour onto the plain pose's palette with ONE transfer for every frame of the clip (no flicker), then bridgebake.py re-bakes
the bridges on the regraded frames (so the ramp has nothing left to carry).
The transfer, in Lab: an a/b offset that depends on the pixel's L (plain minus clip, per 5-L bin over the body's FUR px, smoothed), plus a
small global L shift, then 5 global passes that close the fur MEAN, measured through the q86 WebP encode that ships, onto the plain pose's, weighted per pixel so the outline (L < 18 none, full from L 28) and the eyes'
whites (L > 80 and chroma < 8 none, full from chroma 14) are not touched. Fur px: alpha > 200, L >= 25, not eye white (fur() below; the gate
heroClipsBody.test.ts measures the same mask through clipde.py).
    python3 -I tools/art/hfnext/regrade.py idle-yawn,look-around,wave [--from 6c157b2ba] [--dry]
    python3 -I tools/art/hfnext/regrade.py move-climb,cheer,push,hurt --from 700b4ef8d --ship     (ART-HERO, R-165.378: no bridges)
It reads each clip's ORIGINAL sheet (before any bridge) from git at --from, writes the regraded sheet LOSSLESS to
src/assets/hero/clips/<clip>.webp and puts back the clip's original entry in src/game/heroClipsData.ts, ready for bridgebake.py; the
transfer is recorded in tools/art/hfnext/regrade.json. --dry prints the before/after only. --ship (a clip with no bridges, so nothing
re-encodes it after this): writes the sheet as it ships, WebP q86 method 6, the same encode the fur mean was closed through. --even
(ART-HERO): then each frame's own small offset, smoothed over its neighbours, takes out the clip's colour drift across its frames.
    python3 -I tools/art/hfnext/regrade.py move-climb,cheer,push,hurt --from 700b4ef8d --ship --even
"""
import io, json, re, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image

clips = sys.argv[1].split(',')
REV = sys.argv[sys.argv.index('--from') + 1] if '--from' in sys.argv else '6c157b2ba'
DRY = '--dry' in sys.argv
SHIP = '--ship' in sys.argv
EVEN = '--even' in sys.argv
LOOPS = {'push', 'move-climb', 'move-walk', 'move-run'}   # clips the game loops or cycles through (heroClips.ts)
_M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]); _W = np.array([0.9505, 1.0, 1.089])


def lab(rgb):   # the same sRGB -> Lab (D65) as clipde.py and bridgebake.py
    c = rgb / 255.0; c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    f = (c @ _M.T) / _W; f = np.where(f > 0.008856, np.cbrt(f), 7.787 * f + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def rgb(L):
    fy = (L[..., 0] + 16) / 116; f = np.stack([fy + L[..., 1] / 500, fy, fy - L[..., 2] / 200], -1)
    xyz = np.where(f > 0.206893, f ** 3, (f - 16 / 116) / 7.787) * _W
    c = np.clip(xyz @ np.linalg.inv(_M).T, 0, 1); c = np.where(c > 0.0031308, 1.055 * np.power(c, 1 / 2.4) - 0.055, 12.92 * c)
    return np.clip(c * 255, 0, 255)


def fur(L):
    """The fur mask over Lab px of SOLID pixels: not the outline, not the eyes' whites."""
    C = np.hypot(L[..., 1], L[..., 2]); return (L[..., 0] >= 25) & ~((L[..., 0] > 85) & (C < 12))


def git_bytes(path):
    return subprocess.run(['git', 'show', f'{REV}:{path}'], capture_output=True, check=True).stdout


ORIG_SRC = git_bytes('src/game/heroClipsData.ts').decode()
DATA = Path('src/game/heroClipsData.ts')
BINS = np.arange(25, 105, 5)                 # 5-L bins over the fur
std = np.asarray(Image.open('src/assets/hero/hero-standard.webp').convert('RGBA')).astype(np.float32)[478:478 + 209, 674:674 + 127]
PL = lab(std[..., :3])[std[..., 3] > 200]; PF = PL[fur(PL)]


def bin_means(F):
    idx = np.clip(np.digitize(F[:, 0], BINS) - 1, 0, len(BINS) - 2)
    n = np.bincount(idx, minlength=len(BINS) - 1).astype(float)
    a = np.bincount(idx, F[:, 1], len(BINS) - 1) / np.maximum(n, 1); b = np.bincount(idx, F[:, 2], len(BINS) - 1) / np.maximum(n, 1)
    return n, a, b


def smooth(v, w):   # a [1 2 1] smoothing weighted by the bins' px counts
    k = np.array([1, 2, 1.0]); vw = np.convolve(np.pad(v * w, 1, mode='edge'), k, 'valid'); ww = np.convolve(np.pad(w, 1, mode='edge'), k, 'valid')
    return vw / np.maximum(ww, 1e-9)


rec = json.loads(Path('tools/art/hfnext/regrade.json').read_text()) if Path('tools/art/hfnext/regrade.json').exists() else {}
src = DATA.read_text()
for name in clips:
    blk = re.compile(r'^ "' + re.escape(name) + r'": \{\n[^}]*\n \}', re.M)
    orig_ent = blk.findall(ORIG_SRC); assert len(orig_ent) == 1, f'{name}: no entry at {REV}'
    c = json.loads('{' + orig_ent[0] + '}')[name]
    sheet = np.asarray(Image.open(io.BytesIO(git_bytes(f'src/assets/hero/clips/{name}.webp'))).convert('RGBA')).astype(np.float32)
    fr = [sheet[(k // c['cols']) * c['h']:(k // c['cols'] + 1) * c['h'], (k % c['cols']) * c['w']:(k % c['cols'] + 1) * c['w']] for k in range(c['n'])]
    CF = np.concatenate([L[fur(L)] for L in (lab(f[..., :3])[f[..., 3] > 200] for f in fr)])
    pn, pa, pb = bin_means(PF); cn, ca, cb = bin_means(CF)
    w = np.minimum(pn, cn); ok = w >= 200                            # a bin counts where both have enough fur px
    ga, gb = PF[:, 1].mean() - CF[:, 1].mean(), PF[:, 2].mean() - CF[:, 2].mean()
    da = np.where(ok, pa - ca, ga); db = np.where(ok, pb - cb, gb)
    da, db = smooth(da, np.where(ok, w, 1.0)), smooth(db, np.where(ok, w, 1.0))
    dL = float(PF[:, 0].mean() - CF[:, 0].mean())
    ctr = (BINS[:-1] + BINS[1:]) / 2

    def apply(f, ev=(0.0, 0.0, 0.0)):   # reads dL, da, db as they stand; ev = this frame's own (L, a, b) offset (--even)
        out = f.copy(); vis = f[..., 3] > 0; L = lab(f[..., :3][vis]); C = np.hypot(L[:, 1], L[:, 2])
        wt = np.clip((L[:, 0] - 18) / 10, 0, 1)                           # the outline stays
        wt *= np.where(L[:, 0] > 80, np.clip((C - 8) / 6, 0, 1), 1)      # the eyes' whites stay
        L2 = L.copy(); L2[:, 0] += wt * (dL + ev[0])
        L2[:, 1] += wt * (np.interp(L[:, 0], ctr, da) + ev[1]); L2[:, 2] += wt * (np.interp(L[:, 0], ctr, db) + ev[2])
        out[..., :3][vis] = np.round(rgb(L2)); return out
    pm = PF.mean(0)
    def sheet_of(nf):
        out = sheet.copy()
        for k, f in enumerate(nf):
            out[(k // c['cols']) * c['h']:(k // c['cols'] + 1) * c['h'], (k % c['cols']) * c['w']:(k % c['cols'] + 1) * c['w']] = f
        return out

    def shipped_fur(nf, each=False):   # the fur as it SHIPS: through the q86 WebP encode bridgebake.py writes (its chroma loss is ~0.6 dE)
        b = io.BytesIO(); Image.fromarray(sheet_of(nf).astype(np.uint8), 'RGBA').save(b, 'WEBP', quality=86, method=6)
        s2 = np.asarray(Image.open(b).convert('RGBA')).astype(np.float32)
        f2 = [s2[(k // c['cols']) * c['h']:(k // c['cols'] + 1) * c['h'], (k % c['cols']) * c['w']:(k % c['cols'] + 1) * c['w']] for k in range(c['n'])]
        per = [L[fur(L)] for L in (lab(f[..., :3])[f[..., 3] > 200] for f in f2)]
        return per if each else np.concatenate(per)
    for _ in range(5):                            # the binned curve leaves a pose/mask residue and the encode its own: close the fur MEAN
        nf = [apply(f) for f in fr]               # as shipped with global passes
        NF = shipped_fur(nf)
        r = pm - NF.mean(0); dL += float(r[0]); da = da + r[1]; db = db + r[2]
    EV = np.zeros((c['n'], 3))
    if EVEN:
        # ART-HERO: a Wan clip drifts in colour across its frames (push: L 59 -> 62, so its loop popped 3.3 dE at last -> f0). Each frame
        # gets its own small offset onto the plain pose's fur mean, smoothed [1 2 1] over its neighbours (around the loop for a clip that
        # loops or cycles), so the frame-to-frame step only gets smaller: the drift goes, the pose's own colour stays.
        mode = 'wrap' if name in LOOPS else 'edge'
        for _ in range(10):                       # (4 passes left push's loop seam at 0.97 dE: a jump converges slowly under the smoothing)
            per = shipped_fur([apply(f, EV[k]) for k, f in enumerate(fr)], each=True)
            R = np.array([pm - u.mean(0) for u in per])
            Rp = np.pad(R, ((1, 1), (0, 0)), mode=mode); EV = EV + (Rp[:-2] + 2 * Rp[1:-1] + Rp[2:]) / 4
    nf = [apply(f, EV[k]) for k, f in enumerate(fr)]
    NF = shipped_fur(nf)
    print(f'{name}: fur mean {CF.mean(0).round(2)} -> {NF.mean(0).round(2)} (plain {pm.round(2)}); dE {np.linalg.norm(CF.mean(0) - pm):.2f} -> '
          f'{np.linalg.norm(NF.mean(0) - pm):.2f}; dL {dL:+.2f}; da by L {np.round(da, 1).tolist()}; db by L {np.round(db, 1).tolist()}')
    rec[name] = {'from': REV, 'written': 'q86' if SHIP else 'lossless (bridgebake.py encodes it)', 'dL': round(dL, 3), 'L_bin_centres': ctr.tolist(), 'da': np.round(da, 3).tolist(), 'db': np.round(db, 3).tolist(),
                 'even': np.round(EV, 3).tolist() if EVEN else None, 'fur_mean_before': np.round(CF.mean(0), 2).tolist(), 'fur_mean_after': np.round(NF.mean(0), 2).tolist(), 'plain_fur_mean': np.round(pm, 2).tolist()}
    if DRY:
        continue
    out = sheet_of(nf)
    if SHIP:
        Image.fromarray(out.astype(np.uint8), 'RGBA').save(f'src/assets/hero/clips/{name}.webp', 'WEBP', quality=86, method=6)
    else:
        Image.fromarray(out.astype(np.uint8), 'RGBA').save(f'src/assets/hero/clips/{name}.webp', 'WEBP', lossless=True, method=6)
    cur = blk.findall(src); assert len(cur) == 1, f'{name}: entry not found'
    src = blk.sub(lambda _m: orig_ent[0], src)
if not DRY:
    DATA.write_text(src)
    Path('tools/art/hfnext/regrade.json').write_text(json.dumps(rec, indent=1) + '\n')
