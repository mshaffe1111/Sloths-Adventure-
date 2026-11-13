"""ART 11-13: cut the picked takes (run in the HF sandbox beside hfprops/cut.py, whose key_own keys each take on its own drifted
background, biggest piece kept), size them to ship and pack them in one tar to bring back (sbx.py parts).

    python cutprops.py <picks.json> <takes dir> <out dir>

picks.json: {"<name>": {"take": "<take stem>", "dest": "pickups" | "w1-1113", "units": game units of the long side (pickups) or of the
height (set pieces), "box"?: [x0, y0, x1, y1] fractions of the take, "patch"?: true (her mark: a soft-edged oval cut from bark)}}.
Ship size: a pickup 96 px on its long side (the pickups' size: src/assets/pickups/*.webp, drawn 27-34 units by pickupSprites.ts);
a set piece 3 px per game unit of its height (at most the catalog's 4: ship_px = on-screen px x 2, R-165.99), never above the take.
Colour under clear pixels is zeroed (smaller files). Writes <out>/<dest>/<name>.webp, <out>/sizes.json, <out>/cut-sheet.jpg, <out>.tar.
"""
import json, os, runpy, sys, tarfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
key_own = runpy.run_path(str(HERE / 'hfcut.py'))['key_own']
PX_PER_UNIT = 3.0


def patch(im):
    """her mark: the bark take fills the frame, so an oval with a ragged soft edge is cut from its middle"""
    W, H = im.size
    m = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((W * 0.14, H * 0.08, W * 0.86, H * 0.92), fill=255)
    rng = np.random.default_rng(7)
    arr = np.asarray(m.filter(ImageFilter.GaussianBlur(W * 0.012))).astype(np.float32)
    noise = np.asarray(Image.fromarray((rng.random((H // 16, W // 16)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32)
    a = np.clip((arr - 128 + (noise - 128) * 0.5) * 3 + 128, 0, 255).astype(np.uint8)
    out = im.convert('RGBA')
    out.putalpha(Image.fromarray(a))
    return out


def key_hue(im):
    """for a piece whose colour sits near the drifted pink key (guarana's red-orange): background = the ring's hue within 22 deg,
    saturated and bright; a soft ramp to 34 deg; then the biggest piece and any piece touching it"""
    from scipy import ndimage as ndi
    a = np.asarray(im.convert('HSV')).astype(np.float32)
    rgb = np.asarray(im.convert('RGB'))
    ring = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    h0 = np.median(ring[:, 0])
    dh = np.abs(((a[..., 0] - h0 + 128) % 256) - 128) * 360 / 256
    bgish = (a[..., 1] > 90) & (a[..., 2] > 110)
    alpha = np.where(bgish, np.clip((dh - 22) / 12, 0, 1), 1.0)
    solid = alpha > 0.5
    lab, n = ndi.label(solid)
    if n:
        sizes = ndi.sum(solid, lab, range(1, n + 1))
        big = lab == 1 + int(np.argmax(sizes))
        near = ndi.binary_dilation(big, iterations=6)
        keep = np.isin(lab, [k for k in range(1, n + 1) if (near & (lab == k)).any() and sizes[k - 1] > 30])
        alpha = alpha * ndi.binary_dilation(keep, iterations=2)
    out = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    return Image.fromarray(out, 'RGBA')


def main(pp, takes, od):
    picks = json.loads(Path(pp).read_text())
    od = Path(od)
    sizes, shown = {}, []
    for name, p in picks.items():
        im = Image.open(Path(takes) / f"{p['take']}.png").convert('RGB')
        if p.get('box'):
            b = p['box']; W, H = im.size
            im = im.crop((round(b[0] * W), round(b[1] * H), round(b[2] * W), round(b[3] * H)))
        if p.get('patch'):
            cut = patch(im)
        elif p.get('key') == 'hue':
            cut = key_hue(im)
        else:
            ring = np.asarray(im)
            own = tuple(int(v) for v in np.median(np.concatenate([ring[:6].reshape(-1, 3), ring[-6:].reshape(-1, 3)]), 0))
            pad = Image.new('RGB', (im.width + 40, im.height + 40), own); pad.paste(im, (20, 20))
            cut = key_own(pad, solo=True)
        if p.get('fill'):
            # (an enclosed dark inside, a tunnel's mouth, keys partly clear: every hole the piece encloses is made solid)
            from scipy import ndimage as ndi
            arr = np.asarray(cut).copy()
            solid = ndi.binary_fill_holes(arr[..., 3] > 128)
            arr[..., 3] = np.maximum(arr[..., 3], solid.astype(np.uint8) * 255)
            cut = Image.fromarray(arr, 'RGBA')
        bb = cut.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        cut = cut.crop(bb)
        if p['dest'] == 'pickups':
            k = 96 / max(cut.size)
        else:
            k = min(1.0, p['units'] * PX_PER_UNIT / cut.height)
        cut = cut.resize((max(1, round(cut.width * k)), max(1, round(cut.height * k))), Image.LANCZOS)
        a = np.asarray(cut).copy(); a[a[..., 3] == 0, :3] = 0; cut = Image.fromarray(a, 'RGBA')
        dst = od / p['dest'] / f'{name}.webp'
        dst.parent.mkdir(parents=True, exist_ok=True)
        cut.save(dst, 'WEBP', quality=90, method=6, exact=False)
        sizes[name] = {'take': p['take'], 'dest': p['dest'], 'w': cut.width, 'h': cut.height, 'units': p['units'],
                       'kb': round(dst.stat().st_size / 1024, 1)}
        shown.append((name, cut))
        print(name, cut.size, sizes[name]['kb'], 'KB', flush=True)
    (od / 'sizes.json').write_text(json.dumps(sizes, indent=1))
    # check sheet: each cut on dusk purple and on leaf green (a pink fringe shows on the first, a grey halo on the second)
    tw = 200
    S = Image.new('RGB', (tw * 2 * 4, ((len(shown) + 3) // 4) * (tw + 14)), (25, 25, 25))
    d = ImageDraw.Draw(S)
    for i, (n, c) in enumerate(shown):
        x, y = (i % 4) * tw * 2, (i // 4) * (tw + 14)
        t = c.copy(); t.thumbnail((tw - 8, tw - 8))
        for j, bg in enumerate(((60, 30, 70), (52, 90, 44))):
            cell = Image.new('RGBA', (tw, tw), bg + (255,)); cell.alpha_composite(t, ((tw - t.width) // 2, (tw - t.height) // 2))
            S.paste(cell.convert('RGB'), (x + j * tw, y + 14))
        d.text((x + 3, y + 1), n, fill=(255, 255, 0))
    S.save(od / 'cut-sheet.jpg', quality=85)
    with tarfile.open(f'{od}.tar', 'w') as t:
        t.add(od, arcname=od.name)
    print('TAR', os.path.getsize(f'{od}.tar'))


if __name__ == '__main__':
    main(*sys.argv[1:4])
