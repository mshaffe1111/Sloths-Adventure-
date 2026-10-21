"""Cut the 4x4 story sheets into keyed cells.

For each sheet: find the grid gutters (lighter/darker lines Gemini draws between cells), take the cell windows between them, key the grey
background out of each window, keep the figure (plus nearby bits like notes, tears, sparkles), crop, and record where the crop sat in
the window and whether the figure touches a window edge (a cut-off pose).
"""
import json, os, sys, warnings
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

warnings.filterwarnings('ignore')
D = '/tmp/claude-0/-home-claude/a720f6f4-ce5b-546c-a91e-36541dcf18f6/scratchpad/story'
os.makedirs(f'{D}/cells', exist_ok=True)

INSET = 12   # when no gutter is found, stay this far from the nominal 256 grid line
GINSET = 4   # when a gutter is found, stay this far from it


def gutters(gray, axis):
    """for the 5 grid lines (0,256,512,768,1024) return (lo, hi) of the clear band at each (hi==lo when no gutter line is seen)"""
    med = np.median(gray)
    dev = np.abs(gray - med) > 9
    prof = dev.mean(axis=1 - axis)  # axis 0: columns -> mean over rows
    out = []
    for k in range(5):
        c = k * 256
        lo, hi = max(0, c - 26), min(1023, c + 26)
        idx = [i for i in range(lo, hi + 1) if prof[i] > 0.88]
        if k in (0, 4):
            # outer edges: only a band hugging the picture edge counts
            idx = [i for i in idx if (i < 20 if k == 0 else i > 1003)]
        if idx:
            # the biggest run
            runs, cur = [], [idx[0]]
            for i in idx[1:]:
                if i == cur[-1] + 1: cur.append(i)
                else: runs.append(cur); cur = [i]
            runs.append(cur)
            r = max(runs, key=len)
            out.append((r[0], r[-1], True))
        else:
            out.append((c, c, False))
    return out


def windows(gray):
    gx, gy = gutters(gray, 0), gutters(gray, 1)

    def spans(g):
        s = []
        for k in range(4):
            a, b = g[k], g[k + 1]
            lo = (a[1] + 1 + GINSET) if a[2] else (a[0] + INSET)
            hi = (b[0] - GINSET) if b[2] else (b[0] - INSET)
            if k == 0 and not a[2]: lo = 3
            if k == 3 and not b[2]: hi = 1021
            s.append((lo, hi))
        return s
    return spans(gx), spans(gy), gx, gy


def key_window(arr, lo=14.0, hi=38.0, minpart=40, reach=45, chroma=0.0, raw=False):
    h, w, _ = arr.shape
    ring = np.concatenate([arr[:5].reshape(-1, 3), arr[-5:].reshape(-1, 3), arr[:, :5].reshape(-1, 3), arr[:, -5:].reshape(-1, 3)])
    bg = np.median(ring, 0)
    if raw:
        out = np.dstack([arr, np.full(arr.shape[:2], 255.0)]).astype(np.uint8)
        return Image.fromarray(out, 'RGBA'), (0, 0, w, h), dict(l=True, r=True, t=True, b=True), [float(v) for v in bg]
    d = np.sqrt(((arr - bg) ** 2).sum(-1))
    if chroma:
        dc = arr - bg
        cd = np.sqrt((dc[..., 0] - dc[..., 1]) ** 2 + (dc[..., 1] - dc[..., 2]) ** 2)
        d = np.maximum(d, cd * chroma)
    a = np.clip((d - lo) / (hi - lo), 0, 1)
    solid = d > hi * 0.75
    solid = ndi.binary_opening(solid, structure=np.ones((2, 2)))
    lab, n = ndi.label(ndi.binary_dilation(solid, iterations=1), structure=np.ones((3, 3)))
    if n == 0: return None
    areas = ndi.sum(solid, lab, range(1, n + 1))
    k = int(np.argmax(areas)) + 1
    keep = lab == k
    near = ndi.binary_dilation(keep, iterations=reach)
    for j in range(1, n + 1):
        if j != k and areas[j - 1] >= minpart and (near & (lab == j)).any(): keep |= (lab == j)
    keep = ndi.binary_dilation(keep, iterations=3)
    a = a * keep
    filled = ndi.binary_fill_holes(a > 0.5)
    a = np.where(filled & (a < 1), 1.0, a)
    al = a[..., None]
    col = np.where(al > 0.02, (arr - (1 - al) * bg) / np.maximum(al, 0.05), arr)
    col = np.clip(col, 0, 255)
    out = np.dstack([col, a * 255]).astype(np.uint8)
    ys, xs = np.where(a > 0.04)
    if len(xs) == 0: return None
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    edge = dict(l=bool(x0 <= 1), r=bool(x1 >= w - 1), t=bool(y0 <= 1), b=bool(y1 >= h - 1))
    return Image.fromarray(out, 'RGBA').crop((x0, y0, x1, y1)), (x0, y0, w, h), edge, [float(v) for v in bg]


RAW = {(7, '01'), (8, '01'), (16, '30')}
# sheet -> (row set, key params, extra gutter inset)
PARAMS = {
    18: [({2, 3}, dict(lo=7.0, hi=20.0, chroma=2.4), 9), ({0, 1}, dict(lo=12.0, hi=32.0, chroma=1.2), 9)],
}


def cut(sheet, **kw):
    im = np.asarray(Image.open(f'{D}/s{sheet:02d}.jpg').convert('RGB')).astype(np.float32)
    gray = im.mean(-1)
    xs, ys, gx, gy = windows(gray)
    meta = {'gutters': {'x': gx, 'y': gy}, 'cells': {}}
    for r in range(4):
        for c in range(4):
            x0, x1 = xs[c]; y0, y1 = ys[r]
            kw2, extra = dict(kw), 0
            for rows, pk, ex in PARAMS.get(sheet, []):
                if r in rows: kw2.update(pk); extra = ex
            if (sheet, f'{r}{c}') in RAW: kw2['raw'] = True
            if extra:
                x0 += extra; x1 -= extra; y0 += extra; y1 -= extra
            res = key_window(im[y0:y1, x0:x1], **kw2)
            if res is None: continue
            img, (ox, oy, ww, hh), edge, bg = res
            img.save(f'{D}/cells/s{sheet:02d}_{r}{c}.png')
            meta['cells'][f'{r}{c}'] = dict(win=[x0, y0, x1, y1], off=[ox, oy], size=list(img.size), edge=edge, bg=[round(v) for v in bg])
    json.dump(meta, open(f'{D}/cells/s{sheet:02d}.json', 'w'))
    return meta


def contact(sheet, bgc=(70, 62, 92)):
    meta = json.load(open(f'{D}/cells/s{sheet:02d}.json'))
    pic = Image.new('RGB', (1024, 1024), bgc)
    dr = ImageDraw.Draw(pic)
    for r in range(4):
        for c in range(4):
            p = f'{D}/cells/s{sheet:02d}_{r}{c}.png'
            if os.path.exists(p):
                t = Image.open(p)
                s = min(1.0, 244 / max(t.size))
                if s < 1: t = t.resize((max(1, int(t.width * s)), max(1, int(t.height * s))), Image.LANCZOS)
                pic.paste(t, (c * 256 + (256 - t.width) // 2, r * 256 + (256 - t.height) - 6), t)
                e = meta['cells'][f'{r}{c}']['edge']
                flag = ''.join(k for k in 'lrtb' if e[k])
                dr.text((c * 256 + 4, r * 256 + 3), f'{r*4+c+1} {flag}', fill=(255, 255, 120))
            dr.rectangle([c * 256, r * 256, c * 256 + 255, r * 256 + 255], outline=(110, 100, 140))
    pic.save(f'{D}/cells/contact_s{sheet:02d}.png')


if __name__ == '__main__':
    sheets = [int(x) for x in sys.argv[1:]] or list(range(1, 19))
    for s in sheets:
        m = cut(s)
        contact(s)
        g = m['gutters']
        print(s, 'x', [(a, b) for a, b, f in g['x'] if f], 'y', [(a, b) for a, b, f in g['y'] if f], 'cells', len(m['cells']))
