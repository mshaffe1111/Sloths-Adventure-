"""Cut 4x4 boss sheets (flat grey, no gutter lines) into keyed figures.
usage: python3 cut_boss.py <outdir> <sheet1.jpg> [sheet2.jpg ...]
Writes <outdir>/s<N>_<cell>.png (cell 0..15, reading order), <outdir>/meta.json (crop box in the sheet, whether it touches the cell edge)
and <outdir>/contact_s<N>.png, a numbered contact sheet to name the cells by eye."""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

def key(arr, lo=16.0, hi=40.0):
    h, w, _ = arr.shape
    ring = np.concatenate([arr[:4].reshape(-1, 3), arr[-4:].reshape(-1, 3), arr[:, :4].reshape(-1, 3), arr[:, -4:].reshape(-1, 3)])
    bg = np.median(ring, 0)
    d = np.sqrt(((arr - bg) ** 2).sum(-1))
    a = np.clip((d - lo) / (hi - lo), 0, 1)
    solid = ndi.binary_opening(d > hi * 0.75, structure=np.ones((2, 2)))
    lab, n = ndi.label(ndi.binary_dilation(solid, iterations=2), structure=np.ones((3, 3)))
    if n == 0: return None
    areas = ndi.sum(solid, lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(areas) if s >= 0.06 * areas.max() and s >= 60]
    m = np.isin(lab, keep)
    a = a * ndi.binary_dilation(m, iterations=2)
    out = np.dstack([arr, a * 255]).astype(np.uint8)
    ys, xs = np.where(a > 0.3)
    return Image.fromarray(out, 'RGBA'), (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)

def main(outdir, sheets):
    os.makedirs(outdir, exist_ok=True); meta = {}
    for si, path in enumerate(sheets, 1):
        im = Image.open(path).convert('RGB').resize((1024, 1024)); arr = np.asarray(im).astype(np.float32)
        cs = Image.new('RGB', (1024, 1024), (110, 110, 120)); dr = ImageDraw.Draw(cs)
        for c in range(16):
            cx, cy = (c % 4) * 256, (c // 4) * 256
            r = key(arr[cy:cy + 256, cx:cx + 256])
            if r is None: continue
            img, (x0, y0, x1, y1) = r
            fig = img.crop((x0, y0, x1, y1)); fig.save(f'{outdir}/s{si}_{c:02d}.png')
            meta[f's{si}_{c:02d}'] = dict(sheet=si, cell=c, x0=int(x0), y0=int(y0), x1=int(x1), y1=int(y1),
                edge=dict(l=bool(x0 <= 1), r=bool(x1 >= 255), t=bool(y0 <= 1), b=bool(y1 >= 255)))
            cs.paste(img, (cx, cy), img); dr.text((cx + 4, cy + 2), f'{si}.{c}', fill=(255, 255, 0))
        cs.save(f'{outdir}/contact_s{si}.png')
    json.dump(meta, open(f'{outdir}/meta.json', 'w'), indent=0)
    print(len(meta), 'figures')

if __name__ == '__main__': main(sys.argv[1], sys.argv[2:])
