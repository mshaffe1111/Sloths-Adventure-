"""Cut and pack the HF batch for Worlds 7-8 (2026-10-29) into ready-not-drawn clip sheets, on this machine from the unpacked carriers
(hf_fs attach + tools/art/w5/unpack_carrier.py) in tools/art/hfbatch/in (old cr-/m1k- clips) and tools/art/hfbatch/new (this batch).

    python3 -I tools/art/hfbatch/cutbatch.py <game checkout> [creature ...]

Frames are every 2nd Wan frame (8 fps), keyed off the grey with w6to10/cutpack.py's key_default, at clip size (up 1). The camera is
locked and every clip of one creature starts from the same picture, so one canvas anchor serves all its moves:
  ground: the middle of frame 0's feet on its lowest solid row (as w6to10/cutnew.py)
  middle: the middle of frame 0's box (a flier or a fish)
  roost:  the anchor nc-fruitbat-roost-s17 has in fruitbat.json (ground rule on that clip's frame 0), so the World 8 bat's doze and
          sleep swap in place for its roost frames.
Writes src/assets/w6to10/creatures/<c>-anim.webp + <c>.json ({sheets, up, fps, anchor, seq, frames, source}) and an entry under
"creatures" in src/assets/w6to10/manifest.json. Nothing imports them yet.
"""
import io, json, os, sys, tempfile
from pathlib import Path
os.environ.setdefault('PIPINSTALL', '0')
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
GAME = Path(sys.argv[1])
ONLY = set(sys.argv[2:])
_tmp = Path(tempfile.mkdtemp()); (_tmp / 'spec.json').write_text('{"groups": {}}')
os.environ.update(OUT=str(_tmp), SPEC='spec.json', GROUPS='')
sys.path.insert(0, str(HERE.parent / 'w6to10'))
import cutpack  # noqa: E402

DIRS = [HERE / 'in', HERE / 'new']
# picks (picks.json from make_picks.py): (clip, Wan frame numbers); reasons in jobs.txt, check sheets in reference/prop-sheets/qa-notes/hf-batch-w7w8/
PICKS = json.loads((HERE / 'picks.json').read_text())
OUT = GAME / 'src/assets/w6to10/creatures'
man_p = GAME / 'src/assets/w6to10/manifest.json'
man = json.loads(man_p.read_text())


def frame(clip, i):
    for d in DIRS:
        p = d / f'{clip}_{i:03d}.webp'
        if p.exists():
            return np.asarray(Image.open(p).convert('RGB'))
    raise FileNotFoundError(f'{clip}_{i:03d}')


def derim(im, band=5):
    """cut a pale 'sticker' outline (the start still's, carried into the clip): pale, nearly grey pixels joined to the transparent
    outside within a few px of it, stopping at the dark outline (as w5/repack.py --derim)"""
    from scipy import ndimage
    a = np.asarray(im).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    lum, sat = rgb.mean(-1), rgb.max(-1) - rgb.min(-1)
    out = al < 40
    near = ndimage.binary_dilation(out, iterations=band)
    pale = near & ~out & (sat < 45) & (lum > 120)
    lab, _ = ndimage.label(out | pale)
    k = np.unique(lab[out])
    cut = np.isin(lab, k[k > 0]) & pale
    a[..., 3] = np.where(cut, 0, al)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def white_pockets(im, minpx=60):
    """pure white patches shut in by the outline (the start still's white 'sticker' fill between a figure's legs): pockets of near-white,
    unsaturated pixels of at least minpx, grown 1 px, become see-through"""
    from scipy import ndimage
    a = np.asarray(im).astype(np.float32)
    rgb = a[..., :3]
    w = (rgb.mean(-1) > 215) & (rgb.max(-1) - rgb.min(-1) < 30) & (a[..., 3] > 0)
    lab, n = ndimage.label(w)
    if n:
        sizes = ndimage.sum(np.ones_like(w, np.float32), lab, range(1, n + 1))
        big = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= minpx])
        big = ndimage.binary_dilation(big, iterations=1) & (rgb.mean(-1) > 150)
        a[..., 3] = np.where(big, 0, a[..., 3])
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def main_only(a, frac=0.45):
    """keep only the subject: alpha pieces at least frac of the biggest one (drops a splash or ripple left apart from a fish)"""
    from scipy import ndimage
    lab, n = ndimage.label(a > 8)
    if n < 2:
        return a
    sizes = ndimage.sum(np.ones_like(a, np.float32), lab, range(1, n + 1))
    keep = [i + 1 for i, s in enumerate(sizes) if s >= frac * sizes.max()]
    return np.where(np.isin(lab, keep), a, 0).astype(a.dtype)


def defringe(im):
    """every part-transparent edge pixel takes the colour of the nearest solid one (no grey line on a dark ground; as repack.py)"""
    from scipy import ndimage
    a = np.asarray(im).copy()
    solid = a[..., 3] >= 250
    if not solid.any():
        return im
    _, (iy, ix) = ndimage.distance_transform_edt(~solid, return_indices=True)
    soft = (a[..., 3] > 0) & ~solid
    a[..., :3][soft] = a[iy[soft], ix[soft], :3]
    return Image.fromarray(a, 'RGBA')


def ground_anchor(rgb):
    a = cutpack.key_default(rgb)
    ys, xs = np.nonzero(a > 128)
    fy = ys.max() + 1
    return float(np.median(xs[ys >= fy - 6])), float(fy)


def middle_anchor(rgb, main=False):
    a = cutpack.key_default(rgb)
    if main:
        a = main_only(a)
    ys, xs = np.nonzero(a > 128)
    return (xs.min() + xs.max() + 1) / 2, (ys.min() + ys.max() + 1) / 2


for c, cfg in PICKS.items():
    if c.startswith('_') or (ONLY and c not in ONLY):
        continue
    mode = cfg['anchor']
    frames, seqd, src = {}, {}, {}
    for seq, (clip, idx) in cfg['seq'].items():
        f0 = frame(cfg.get('anchorClip', clip), 0)
        ax, ay = middle_anchor(f0, cfg.get('mainOnly')) if mode == 'middle' else ground_anchor(f0)
        names = []
        for k, i in enumerate(idx):
            rgb = frame(clip, i)
            a = cutpack.key_default(rgb)
            if cfg.get('mainOnly'):
                a = main_only(a)
            yy, xx = np.nonzero(a > 8)
            x0, y0, x1, y1 = xx.min(), yy.min(), xx.max() + 1, yy.max() + 1
            im = Image.fromarray(np.dstack([rgb, a])[y0:y1, x0:x1], 'RGBA')
            if cfg.get('derim'):
                im = derim(im, cfg['derim'])
            if cfg.get('whitePockets'):
                im = white_pockets(im, cfg['whitePockets'])
            im = defringe(im)
            n = f'{seq}_{k:02d}'
            frames[n] = (im, ax - x0, ay - y0)
            names.append(n)
        seqd[seq] = names
        src[seq] = {'clip': clip, 'frames': idx}
    sheets, data = cutpack.pack(frames, 4096)
    files = []
    for k, S in enumerate(sheets):
        fn = f'{c}-anim{"-" + str(k) if len(sheets) > 1 else ""}.webp'
        b = io.BytesIO(); S.save(b, 'WEBP', quality=80, method=6)
        (OUT / fn).write_bytes(b.getvalue()); files.append(fn)
        print(c, fn, S.size, len(b.getvalue()))
    meta = {'sheets': files, 'up': 1.0, 'fps': 8, 'anchor': {'ground': 'the middle of the feet on the ground',
                                                             'middle': "the middle of the body's box",
                                                             'roost': "fruitbat.json's roost anchor (swaps in place)"}[mode],
            'seq': seqd, 'loop': cfg.get('loop', []), 'frames': data, 'source': src}
    if cfg.get('note'):
        meta['note'] = cfg['note']
    (OUT / f'{c}.json').write_text(json.dumps(meta, separators=(',', ':')))
    man.setdefault('creatures', {})[c] = {'sheets': files, 'json': f'{c}.json', 'moves': {s: len(v) for s, v in seqd.items()},
                                          'source': {s: v['clip'] for s, v in src.items()}}
man['creaturesHfbNote'] = ('hf-batch-w7w8 (2026-10-29, tools/art/hfbatch/cutbatch.py): crab, piranha, sentry, beetle, owl and the World 8 '
                           'bat (fruitbat-w8: doze, sleep, fly) from the old cr-/m1k- clips plus this batch; frames face RIGHT, up 1, '
                           'one canvas anchor per creature (each json says which). Nothing draws them yet.')
man_p.write_text(json.dumps(man, indent=1))
