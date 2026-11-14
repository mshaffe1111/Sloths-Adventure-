"""ART-678: cut EVERY piece of a picked sheet take (run in the HF sandbox beside hfcut.py = hfprops/cut.py, as cutprops.py).

    python cutsheet.py <picks.json> <takes dir> <out dir>

picks.json: {"<take stem>": {"bg": "mag"|"grey", "pieces": [{"name", "units", "dest", "opaque"?: true}, ...] in reading order
(top-to-bottom bands, then left-to-right)}. Pieces are found as the take's separate blobs (distance from the border colour, specks
under 0.4% of the take dropped); each blob's padded box is keyed on its own by key_own (biggest piece kept), then sized to 3 px per game
unit of its height (never above the take). "opaque": the underlayer band (only the magenta above its top is keyed: cut by key_own on
the whole take). Colour under clear pixels zeroed. Writes <out>/<dest>/<name>.webp (lossless), <out>/sizes.json, <out>.tar.
"""
import json, runpy, sys, tarfile
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = Path(__file__).resolve().parent
key_own = runpy.run_path(str(HERE / 'hfcut.py'))['key_own']
PX = 3.0


def blobs(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(ring, 0)
    fg = np.sqrt(((a - bg) ** 2).sum(-1)) > 60
    fg = ndi.binary_opening(fg, iterations=2)
    fg = ndi.binary_closing(fg, iterations=6)
    lab, n = ndi.label(fg)
    H, W = fg.shape
    out = []
    for i, sl in enumerate(ndi.find_objects(lab), 1):
        if (lab[sl] == i).sum() < 0.004 * H * W:
            continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        out.append((x0, y0, x1, y1))
    # reading order: bands by vertical centre (a new band when a top starts below the band's mean bottom), then x
    out.sort(key=lambda b: (b[1] + b[3]) / 2)
    bands, cur = [], []
    for b in out:
        if cur and b[1] > np.mean([c[3] for c in cur]) - 20:
            bands.append(cur); cur = []
        cur.append(b)
    if cur:
        bands.append(cur)
    return [b for band in bands for b in sorted(band, key=lambda b: b[0])]


def main(pp, takes, od):
    picks = json.loads(Path(pp).read_text())
    od = Path(od); sizes = {}
    for stem, p in picks.items():
        im = Image.open(Path(takes) / f'{stem}.png').convert('RGB')
        W, H = im.size
        boxes = [(0, 0, W, H)] if p['pieces'][0].get('opaque') else blobs(im)
        print(stem, 'blobs', len(boxes), boxes, flush=True)
        for piece, (x0, y0, x1, y1) in zip(p['pieces'], boxes):
            if piece.get('skip'):
                continue
            pad = 24
            c = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)))
            cut = key_own(c)
            bb = cut.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
            cut = cut.crop(bb)
            k = min(1.0, piece['units'] * PX / cut.height)
            if k < 1:
                cut = cut.resize((round(cut.width * k), round(cut.height * k)), Image.LANCZOS)
            a = np.asarray(cut).copy(); a[a[..., 3] == 0, :3] = 0
            cut = Image.fromarray(a)
            f = od / piece['dest'] / f"{piece['name']}.webp"
            f.parent.mkdir(parents=True, exist_ok=True)
            cut.save(f, 'WEBP', lossless=True, method=6)
            sizes[piece['name']] = {'take': stem, 'box': [x0, y0, x1, y1], 'w': cut.width, 'h': cut.height, 'units': piece['units'],
                                    'dest': piece['dest']}
    (od / 'sizes.json').write_text(json.dumps(sizes, indent=1))
    with tarfile.open(f'{od}.tar', 'w') as t:
        t.add(od, arcname=od.name)
    print('cut', len(sizes))


if __name__ == '__main__':
    main(*sys.argv[1:4])
