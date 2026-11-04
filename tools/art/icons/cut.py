"""Key a painted icon take (an HF still on flat grey) into a cut-out webp, the satchel's way (tools/art/satchelcut.py), plus:
  - the pale "sticker" rim some takes paint outside their dark outline is peeled off (up to RIM px, only light low-colour pixels
    that touch the background), so every icon ends on its own dark outline like the satchel;
  - the alpha edge is anti-aliased from a 2x mask, then the piece is trimmed and centred in a square of PX (2x the largest size
    on screen; 192 for the start screen's objects, like the satchel).

  python3 -I tools/art/icons/cut.py <take> <out.webp> [px] [rim]
  python3 -I tools/art/icons/cut.py picks <picks.json> <takes dir> <out dir>      every pick in a picks file
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def cut(src, dst, px=192, rim=10, q=90):
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    edge = np.concatenate([im[:24].reshape(-1, 3), im[-24:].reshape(-1, 3), im[:, :24].reshape(-1, 3), im[:, -24:].reshape(-1, 3)])
    bg = np.median(edge, axis=0)
    d = np.sqrt(((im - bg) ** 2).sum(-1))
    sat = im.max(-1) - im.min(-1)
    lum = im.mean(-1)
    fg = (d > 24) | (sat > 30)
    lab, n = ndimage.label(~fg)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = ndimage.sum(np.ones_like(lab), lab, index=np.arange(1, n + 1))
    big = {i + 1 for i, a in enumerate(sizes) if a > 0.004 * lab.size}
    bgm = np.isin(lab, list(border | big))
    # peel the pale rim: light, low-colour pixels touching the background, a layer at a time
    pale = (lum > bg.mean() + 6) & (sat < 40)
    for _ in range(rim):
        grow = ndimage.binary_dilation(bgm) & pale & ~bgm
        if not grow.any():
            break
        bgm |= grow
    fgm = ~bgm
    fgm = ndimage.binary_opening(fgm, iterations=2)
    fgm = ndimage.binary_fill_holes(fgm) & ~np.isin(lab, list(big - border)) if big - border else ndimage.binary_fill_holes(fgm)
    # keep the biggest piece and anything sizeable near it (a leaf beside the object), drop specks
    lab2, n2 = ndimage.label(fgm)
    if n2 > 1:
        s2 = ndimage.sum(np.ones_like(lab2), lab2, index=np.arange(1, n2 + 1))
        keep = [i + 1 for i, a in enumerate(s2) if a > 0.01 * s2.max()]
        fgm = np.isin(lab2, keep)
    a = Image.fromarray((fgm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
    rgba = Image.fromarray(im.astype(np.uint8)).convert('RGBA')
    rgba.putalpha(a)
    rgba = rgba.crop(rgba.getbbox())
    w, h = rgba.size
    s = px / max(w, h)
    rgba = rgba.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    c = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    c.paste(rgba, ((px - rgba.width) // 2, (px - rgba.height) // 2))
    # colour under fully clear pixels set to the nearby paint (no grey bleeding in when the browser scales it)
    arr = np.asarray(c).copy()
    clear = arr[..., 3] == 0
    if clear.any() and (~clear).any():
        idx = ndimage.distance_transform_edt(clear, return_distances=False, return_indices=True)
        arr[..., :3] = arr[idx[0], idx[1], :3]
    Image.fromarray(arr).save(dst, 'WEBP', quality=q, method=6, exact=False)
    return Path(dst).stat().st_size


if __name__ == '__main__':
    if sys.argv[1] == 'picks':
        picks = json.loads(Path(sys.argv[2]).read_text())
        tk, out = Path(sys.argv[3]), Path(sys.argv[4])
        out.mkdir(parents=True, exist_ok=True)
        for name, p in picks.items():
            if name.startswith('_'):
                continue
            take = p['take'] if isinstance(p, dict) else p
            px = p.get('px', 192) if isinstance(p, dict) else 192
            rim = p.get('rim', 10) if isinstance(p, dict) else 10
            src = next(iter(sorted(tk.glob(take + '.*'))))
            print(name, take, px, cut(src, out / f'{name}.webp', px, rim))
    else:
        print(cut(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 192, int(sys.argv[4]) if len(sys.argv) > 4 else 10))
