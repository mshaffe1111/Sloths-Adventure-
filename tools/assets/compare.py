#!/usr/bin/env python3
"""Comparison stills for the six hard cases (task AS-1, test-side only).

    python3 tools/assets/compare.py <inventory.json> <stills dir> <cases.json out>

For each case: the original and each trial setting (trial.py: same resize rule, q90/82/75), as lossless PNG crops:
  1:1    a 300 px square of the stored picture (a resized version is scaled back up to the original grid: the pixel-peeping worst case)
  phone  a 720 px square window (a phone's width) scaled to the largest size the game draws it on a 3x phone
  diff   |version - original| x 8 at 1:1, to see where the codec spent its error
Sprites are laid over the game's dark forest green, so halos show. Writes PSNR (over visible pixels) and the worst 8x8 block error.
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from trial import QS, factor, resized, ROOT  # noqa: E402

CASES = [
    ('night-sky', 'src/assets/backdrops/w10-far.webp', 'smooth', 'Night sky gradient | World 10 far layer (storm clouds, a lightning glow): where banding shows first. The sky layers themselves are already about q83, so q82 leaves them as they are.'),
    ('fur-sheet', 'src/assets/enemies/jaguar-anim.webp', 'detail', 'Fur-heavy animation sheet | The jaguar: where smeared fur shows first.'),
    ('backdrop', 'src/assets/backdrops/w2-near.webp', 'detail', 'Backdrop | World 2 near layer, the biggest backdrop.'),
    ('story-frame', 'src/assets/story/hd/pokey-1.webp', 'detail', 'Story picture | Pokey, story HD. It stands in for a story video frame: the game ships no video.'),
    ('pokey-sheet', 'src/assets/hero/hero-standard.webp', 'detail', "Pokey's sheet | hero-standard: dark outlines, where ringing shows first."),
    ('ui-icon', 'src/assets/icons/gear.webp', 'detail', 'UI icon | The gear: small, flat colour and hard edges.'),
]
BG = np.array([0x2c, 0x3b, 0x2c], 'f4')


def flat(im):
    a = np.asarray(im.convert('RGBA')).astype('f4')
    al = a[..., 3:4] / 255
    return a[..., :3] * al + BG * (1 - al), al[..., 0]


def pick(arr, al, kind, n=300):
    g = np.abs(np.diff(arr.mean(2), axis=0))[:, :-1] + np.abs(np.diff(arr.mean(2), axis=1))[:-1, :]
    H, W = g.shape
    n = min(n, H, W)
    best, at = None, (0, 0)
    for y in range(0, H - n + 1, max(1, n // 3)):
        for x in range(0, W - n + 1, max(1, n // 3)):
            vis = al[y:y + n, x:x + n].mean()
            if vis < 0.6:
                continue
            e = g[y:y + n, x:x + n].mean()
            # 'smooth': the gentlest gradient that still moves (banding); 'detail': the busiest window
            sc = (-abs(e - 0.6) if kind == 'smooth' else e)
            if best is None or sc > best:
                best, at = sc, (x, y)
    return at, n


def metrics(a, b, al):
    m = al > 0.05
    d = (a - b) ** 2
    mse = d[m].mean() if m.any() else 0
    psnr = 99.0 if mse == 0 else 10 * np.log10(255 ** 2 / mse)
    H, W = (a.shape[0] // 8) * 8, (a.shape[1] // 8) * 8
    blk = np.sqrt(d[:H, :W].mean(2).reshape(H // 8, 8, W // 8, 8).mean((1, 3)))
    return round(float(psnr), 2), round(float(blk.max()), 1)


def main():
    inv = {r['src']: r for r in json.load(open(sys.argv[1]))}
    out, cj = sys.argv[2], sys.argv[3]
    os.makedirs(out, exist_ok=True)
    cases = []
    for key, src, kind, title in CASES:
        r = inv[src]
        orig = Image.open(os.path.join(ROOT, src)); orig.load()
        f = factor(r)
        oa, al = flat(orig)
        (x, y), n = pick(oa, al, kind)
        s = r.get('drawn_scale') or 0
        phone_scale = min(1.0, s) if s > 0 else 1.0  # (not seen by the probe: shown at its stored size, the worst case)
        versions = [('original', orig, r['bytes'], 'as shipped')]
        im2 = resized(orig, f)
        for q in QS:
            if f == 1.0 and (r.get('q_est') or 100) <= q + 1:
                versions.append((f'q{q}', orig, r['bytes'], f'kept as is (already about q{r["q_est"]})'))
                continue
            p = os.path.join(out, f'_{key}.q{q}.webp')
            im2.save(p, 'WEBP', quality=q, method=6, alpha_quality=100)
            v = Image.open(p); v.load()
            nb = os.path.getsize(p); os.remove(p)
            note = f'{"resized to %d%%, " % round(f * 100) if f != 1 else ""}WebP q{q}'
            if f == 1.0 and nb >= r['bytes']:
                versions.append((f'q{q}', orig, r['bytes'], f'kept as is (the re-encode was no smaller)'))
            else:
                versions.append((f'q{q}', v, nb, note))
        row = dict(key=key, src=src, title=title, w=orig.width, h=orig.height, drawn_scale=s, factor=f, q_est=r.get('q_est'),
                   crop=[x, y, n], phone_scale=round(phone_scale, 3), versions=[])
        # phone window: a backdrop is far wider than a screen; show a 1080 device-px window around the crop
        pw = min(orig.width, int(720 / phone_scale))
        ph = min(orig.height, int(720 / phone_scale))
        px = max(0, min(orig.width - pw, x + n // 2 - pw // 2)); py = max(0, min(orig.height - ph, y + n // 2 - ph // 2))
        for name, im, nb, note in versions:
            if im is orig and name != 'original':  # kept as is: the page shows the original's stills
                row['versions'].append(dict(name=name, file='original', bytes=nb, note=note, psnr=99.0, worst_block=0.0, w=im.width, h=im.height))
                continue
            big = im if im.size == orig.size else im.resize(orig.size, Image.BILINEAR)
            va, _ = flat(big)
            ps, blk = metrics(oa[y:y + n, x:x + n], va[y:y + n, x:x + n], al[y:y + n, x:x + n])
            Image.fromarray(va[y:y + n, x:x + n].clip(0, 255).astype('u1')).save(os.path.join(out, f'{key}.{name}.1x.png'), optimize=True)
            dif = (np.abs(va - oa)[y:y + n, x:x + n] * 8).clip(0, 255).astype('u1')
            Image.fromarray(dif).save(os.path.join(out, f'{key}.{name}.diff.png'), optimize=True)
            # phone: from the version's own pixels, scaled to the drawn size (what the canvas does)
            k = im.width / orig.width
            win = im.crop((round(px * k), round(py * k), round((px + pw) * k), round((py + ph) * k)))
            tw, th = max(1, round(pw * phone_scale)), max(1, round(ph * phone_scale))
            ph_im = win.convert('RGBA').resize((tw, th), Image.BILINEAR)
            fa, _ = flat(ph_im)
            Image.fromarray(fa.clip(0, 255).astype('u1')).save(os.path.join(out, f'{key}.{name}.phone.png'), optimize=True)
            row['versions'].append(dict(name=name, file=name, bytes=nb, note=note, psnr=ps, worst_block=blk, w=im.width, h=im.height))
        row['phone_px'] = [tw, th]
        cases.append(row)
        print(key, [(v['name'], v['bytes'], v['psnr'], v['worst_block']) for v in row['versions']], flush=True)
    json.dump(cases, open(cj, 'w'), indent=1)


if __name__ == '__main__':
    main()
