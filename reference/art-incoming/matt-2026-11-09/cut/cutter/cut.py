import sys, os, json, glob
ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib'); sys.path.insert(0, ROOT + '/cutcode')
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
from keylib import *

OUT = ROOT + '/artcut'
CFG = json.load(open(ROOT + '/cutcode/config.json'))
sheets = sys.argv[2:] if len(sys.argv) > 2 else None
os.makedirs(OUT + '/pieces', exist_ok=True); os.makedirs(OUT + '/_debug', exist_ok=True)
font = ImageFont.load_default(size=40) if hasattr(ImageFont, 'load_default') else None

def run(path):
    name = os.path.basename(path).split('.')[0]          # W1-sheet-07
    sid = name.replace('-sheet', '')                     # W1-07
    cfg = CFG.get(sid, {})
    if sheets and sid not in sheets: return None
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    h, w, _ = rgb.shape
    lab = srgb_to_lab(rgb)
    excl = np.zeros((h, w), bool)
    for x0, y0, x1, y1 in cfg.get('exclude', []):
        excl[y0:y1, x0:x1] = True
    bm = border_mask(h, w) & ~excl
    c0 = np.median(lab[bm], 0)
    d0 = np.linalg.norm(lab - c0, axis=-1)
    Ts = cfg.get('seed', 14)
    seedm = (d0 < Ts)
    if cfg.get('hueseed'):
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        seedm |= (r - g > 35) & (b - g > 35) & (np.abs(r - b) < 45) & (g > 120)
    seed = connected_to(seedm | excl, bm | excl) & ~excl
    sig = float(np.median(np.abs(d0[bm & seed] - np.median(d0[bm & seed])))) * 1.4826
    t0 = cfg.get('t0', max(6.0, 3.5 * sig)); t1 = t0 + cfg.get('ramp', 12.0)
    for it in range(2):
        bgl = tile_bg(lab, seed)
        d = np.linalg.norm(lab - bgl, axis=-1)
        seed = connected_to((d < t0) | excl, bm | excl) & ~excl
    bgl = tile_bg(lab, seed); bgr = tile_bg(rgb, seed)
    d = np.linalg.norm(lab - bgl, axis=-1)
    m = np.clip((d - t0) / (t1 - t0), 0, 1)
    DBG = os.environ.get('DBGSTAGE') == sid
    def snap(tag):
        if DBG: Image.fromarray((m * 255).astype(np.uint8)).save(f'{OUT}/_debug/stage_{tag}.png')
    snap('0lab')
    if cfg.get('shadow', True):
        sr = rgb.sum(-1) + 1; sb = bgr.sum(-1) + 1
        cd = np.linalg.norm(rgb / sr[..., None] - bgr / sb[..., None], axis=-1)
        ratio = sr / sb
        if cfg.get('keyall'):
            sh = (ratio > 0.3) & (ratio < 1.35)
            ms = np.clip((cd - 0.05) / 0.03, 0, 1)
        else:
            near = ndi.distance_transform_edt(~seed) < 90
            sh = near & (ratio > 0.3) & (ratio < 1.08)
            ms = np.clip((cd - 0.025) / 0.03, 0, 1)
        m = np.where(sh, np.minimum(m, ms), m)
    snap('1key')
    sr = rgb.sum(-1) + 1; sb = bgr.sum(-1) + 1
    cdist = np.linalg.norm(rgb / sr[..., None] - bgr / sb[..., None], axis=-1)
    if cfg.get('refine', cfg.get('shadow', True)):
        ctol = cfg.get('ctol', 0.09)
        dfg = ndi.distance_transform_edt(m >= 0.5)
        trusted = (m >= 0.99) & (cdist > ctol) & (dfg >= 3)
        dT, idx = ndi.distance_transform_edt(~trusted, return_indices=True)
        Fe = rgb[idx[0], idx[1]]
        FB = Fe - bgr; CB = rgb - bgr
        nfb = (FB * FB).sum(-1)
        a = np.clip((CB * FB).sum(-1) / np.maximum(nfb, 1), 0, 1)
        resid = np.linalg.norm(CB - a[..., None] * FB, axis=-1)
        ok = (dT > 0) & (dT <= cfg.get('refinedist', 12)) & (resid < cfg.get('resid', 14)) & (nfb > 1600) & ((dfg <= 4) | (cdist < cfg.get('pocketc', 0.07)))
        m = np.where(ok, np.minimum(m, a), m)
    if cfg.get('speckkill'):
        sp = np.minimum(rgb[..., 0] - rgb[..., 1], rgb[..., 2] - rgb[..., 1])
        m = m * np.clip(1 - (sp - 15) / 15, 0, 1)
    snap('2refine')
    m[excl] = 0
    # holes: enclosed background-ish regions
    hard = m >= 0.5
    bgreg = ~hard
    outside = connected_to(bgreg, bm | excl)
    holes = bgreg & ~outside
    hl, hn = ndi.label(holes)
    filled = 0
    if hn:
        areas = ndi.sum(np.ones_like(d), hl, range(1, hn + 1))
        medd = ndi.mean(cdist, hl, np.arange(1, hn + 1))
        holemax = cfg.get('holemax', 0.00025 * h * w)
        fill_ids = [i + 1 for i in range(hn) if areas[i] < 8 or areas[i] < holemax and medd[i] > cfg.get('holectol', 0.07)]
        if cfg.get('speckkill') and fill_ids:
            spm = ndi.mean(np.minimum(rgb[..., 0] - rgb[..., 1], rgb[..., 2] - rgb[..., 1]), hl, np.arange(1, hn + 1))
            fill_ids = [i for i in fill_ids if spm[i - 1] < 12]
        if fill_ids:
            fm = np.isin(hl, fill_ids); m[fm] = 1.0; filled = int(fm.sum())
    # (M batch) Matt's printed labels: find glyph-sized low-chroma blobs on the ground, group them into text lines,
    # and clear the low-chroma pixels inside each padded line box (green or brown art in the box survives).
    labelboxes = []
    if cfg.get('labels', True):
        chroma = np.hypot(lab[..., 1], lab[..., 2])
        hard0 = (m >= 0.5)
        gl, gn = ndi.label(hard0, structure=np.ones((3, 3)))
        gobj = ndi.find_objects(gl)
        gl_area = ndi.sum(hard0, gl, range(1, gn + 1))
        gl_chr = ndi.mean(chroma, gl, np.arange(1, gn + 1))
        glyphs = []
        for i, sl in enumerate(gobj):
            gh = sl[0].stop - sl[0].start; gw = sl[1].stop - sl[1].start
            if 6 <= gh <= cfg.get('glyphmax', 70) and gw <= 90 and gl_area[i] < 3000 and gl_chr[i] < cfg.get('glyphchroma', 48):
                glyphs.append((sl[0].start, sl[0].stop, sl[1].start, sl[1].stop))
        glyphs.sort(key=lambda g: ((g[0] + g[1]) / 2, g[2]))
        lines = []
        for g in glyphs:
            cy = (g[0] + g[1]) / 2
            for L in lines:
                if abs(L['cy'] - cy) < 22 and g[2] - L['x1'] < 60 and L['x0'] - g[3] < 60:
                    L['y0'] = min(L['y0'], g[0]); L['y1'] = max(L['y1'], g[1]); L['x0'] = min(L['x0'], g[2]); L['x1'] = max(L['x1'], g[3]); L['n'] += 1
                    break
            else:
                lines.append(dict(cy=cy, y0=g[0], y1=g[1], x0=g[2], x1=g[3], n=1))
        pad = cfg.get('labelpad', 10)
        for L in lines:
            if L['n'] < 4: continue
            y0, y1, x0, x1 = max(0, L['y0'] - pad), min(h, L['y1'] + pad), max(0, L['x0'] - pad - 40), min(w, L['x1'] + pad + 40)
            box = np.zeros((h, w), bool); box[y0:y1, x0:x1] = True
            kill = box & (chroma < cfg.get('labelchroma', 44))
            m[ndi.binary_dilation(kill, iterations=2) & box] = 0
            labelboxes.append([int(x0), int(y0), int(x1), int(y1)])
        for x0, y0, x1, y1 in cfg.get('labelbox', []):
            m[y0:y1, x0:x1] = 0; labelboxes.append([x0, y0, x1, y1])
    # colour: unmix where partly transparent
    mm = np.maximum(m, 1e-3)[..., None]
    F = (rgb - (1 - mm) * bgr) / mm
    F = np.where(m[..., None] > 0.97, rgb, F)
    F = np.clip(F, 0, 255)
    trusted = m >= 0.6
    _, idx = ndi.distance_transform_edt(~trusted, return_indices=True)
    ext = F[idx[0], idx[1]]
    F = np.where((m < 0.6)[..., None], ext, F)
    # spill suppression near the edge for pink/magenta backgrounds
    bgc = np.median(bgr[seed], 0)
    if bgc[0] - bgc[1] > 25 and bgc[2] - bgc[1] > 25 and not cfg.get('nospill'):
        dist = ndi.distance_transform_edt(m >= 0.5)
        sb = cfg.get('spillband', 3.0)
        k = np.clip(1 - (dist - sb) / 3.0, 0, 1) * cfg.get('spill', 1.0)
        R, G, B = F[..., 0], F[..., 1], F[..., 2]
        s = np.clip(np.minimum(R - G, B - G), 0, None)
        F[..., 0] = R - s * k; F[..., 2] = B - s * k
    er = cfg.get('erode', 3 if (bgc[0] - bgc[1] > 120 and bgc[2] - bgc[1] > 120) else 0)
    ma = ndi.minimum_filter(m, size=er) if er else m
    alpha = ndi.gaussian_filter(ma, 0.85)
    alpha = np.where(m >= 0.99, np.maximum(alpha, 0.0), alpha)
    alpha[alpha < 0.04] = 0; alpha[excl] = 0
    # components
    hard = alpha > 0.5
    sep = np.zeros((h, w), bool)
    for x0, y0, x1, y1 in cfg.get('seps', []):
        sep[y0:y1, x0:x1] = True
    hard_all = hard.copy(); hard = hard & ~sep
    dil = ndi.maximum_filter(hard, size=cfg.get('join', 9)) & ~sep
    cl, cn = ndi.label(dil)
    area = ndi.sum(hard, cl, range(1, cn + 1))
    big_min = cfg.get('bigmin', 6000)
    big = [i + 1 for i in range(cn) if area[i] >= big_min]
    owner = {i: i for i in big}
    if big:
        bigmask = np.isin(cl, big)
        dist, bidx = ndi.distance_transform_edt(~bigmask, return_indices=True)
        objs = ndi.find_objects(cl)
        for i in range(cn):
            lid = i + 1
            if lid in owner: continue
            sl = objs[i]; reg = cl[sl] == lid
            dd = dist[sl][reg]; j = np.argmin(dd)
            ys, xs = np.nonzero(reg)
            ny, nx = bidx[0][sl][reg][j], bidx[1][sl][reg][j]
            near = cl[ny, nx]
            if dd[j] < cfg.get('mergedist', 60) and area[i] < 0.08 * area[near - 1]:
                owner[lid] = near
            elif area[i] >= cfg.get('dust', 2500):
                owner[lid] = lid
            # else dust
    for a, b in cfg.get('merge', []):   # manual merges by first-pass id order (handled after naming)
        pass
    lut = np.zeros(cn + 1, np.int32)
    for k_, v in owner.items(): lut[k_] = v
    own = lut[cl]
    if sep.any():
        _, ii = ndi.distance_transform_edt(own == 0, return_indices=True)
        fillsep = sep & (alpha > 0)
        own[fillsep] = own[ii[0][fillsep], ii[1][fillsep]]
    groups = sorted(set(owner.values()))
    # order by reading order (row bands then x)
    objs2 = {g: ndi.find_objects((own == g).astype(np.int32))[0] for g in groups}
    def key(g):
        sl = objs2[g]; cy = (sl[0].start + sl[0].stop) / 2; cx = (sl[1].start + sl[1].stop) / 2
        return (round(cy / (h / cfg.get('rows', 4))), cx)
    groups.sort(key=key)
    pieces = []
    letters = 'abcdefghijklmnopqrstuvwxyz'
    RGBA = np.dstack([F, alpha * 255]).astype(np.float32)
    for n, g in enumerate(groups):
        reg = ndi.maximum_filter(own == g, size=5) & (alpha > 0)
        ys, xs = np.nonzero(reg)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        crop = RGBA[y0:y1, x0:x1].copy()
        crop[..., 3] *= reg[y0:y1, x0:x1]
        pid = f'{sid}-{letters[n]}'
        im = Image.fromarray(np.clip(crop + 0.5, 0, 255).astype(np.uint8), 'RGBA')
        im.save(f'{OUT}/pieces/{pid}.png', optimize=False, compress_level=6)
        # sharpness: mean abs high-pass of L inside eroded mask, and edge contrast
        inner = ndi.binary_erosion(reg[y0:y1, x0:x1] & (alpha[y0:y1, x0:x1] > 0.9), iterations=6)
        L = lab[y0:y1, x0:x1, 0]
        hp = np.abs(L - ndi.gaussian_filter(L, 2.0))
        sharp = float(hp[inner].mean()) if inner.sum() > 100 else 0.0
        touch = []
        if y0 <= 2: touch.append('top')
        if x0 <= 2: touch.append('left')
        if y1 >= h - 2: touch.append('bottom')
        if x1 >= w - 2: touch.append('right')
        pieces.append(dict(id=pid, sheet=sid, x=int(x0), y=int(y0), w=int(x1 - x0), h=int(y1 - y0),
                           sharp=round(sharp, 2), touch=touch, area=int((crop[..., 3] > 128).sum())))
    # debug overview
    ov = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).convert('RGB')
    dr = ImageDraw.Draw(ov)
    for p in pieces:
        dr.rectangle([p['x'], p['y'], p['x'] + p['w'], p['y'] + p['h']], outline=(0, 255, 0), width=6)
        dr.text((p['x'] + 10, p['y'] + 10), p['id'][-1], fill=(255, 255, 0), font=font, stroke_width=3, stroke_fill=(0, 0, 0))
    ov.thumbnail((1400, 1400)); ov.save(f'{OUT}/_debug/{sid}_boxes.jpg', quality=85)
    info = dict(sheet=sid, size=[w, h], bg=[round(float(v), 1) for v in np.median(bgr[seed], 0)], sig=round(sig, 2),
                t0=round(t0, 2), holes_filled=filled, labels=labelboxes, pieces=pieces)
    print(sid, 'bg', info['bg'], 'sig', info['sig'], 't0', info['t0'], 'filled', filled, 'n', len(pieces), 'labels', len(labelboxes),
          [(p['id'][-1], p['w'], p['h'], p['sharp']) for p in pieces], flush=True)
    return info

res = []
for f in sorted(glob.glob(ROOT + '/artraw/*/*-sheet-*')):
    sid = os.path.basename(f).split('.')[0].replace('-sheet', '')
    if CFG.get(sid, {}).get('skip'): continue
    r = run(f)
    if r: res.append(r)
old = {}
if os.path.exists(OUT + '/_cutinfo.json') and sheets:
    old = {r['sheet']: r for r in json.load(open(OUT + '/_cutinfo.json'))}
for r in res: old[r['sheet']] = r
json.dump(sorted(old.values(), key=lambda r: r['sheet']), open(OUT + '/_cutinfo.json', 'w'), indent=1)
