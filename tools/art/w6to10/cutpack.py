"""Cut the picked Worlds 5-10 takes into game sheets (2026-10-29, Matt: "use as much of this art as possible"), as a CPU job on Hugging
Face (bucket mshaffe111/w5-xfer at /out) or on this machine (OUT=<a folder holding w6to10/... and stills/...>).

    SPEC=w6to10/jobs/spec-w6to10-cutpack.json GROUPS=ironclaw,golem python cutpack.py

Spec: {"groups": {name: {...}}}; each group is one of
  clips   {"kind": "clips", "up": 1.25 | "target": 110, "key": "default"|"tight", "anchor": "meta"|"middle", "step": 2, "sheetH": 8000,
           "seqs": {seq: [clip, start meta key, first, last]}}
          Every frame is keyed off the flat grey, every 2nd (step) frame kept. With anchor "meta" the frames carry the old painted frame's
          anchor (stills/<tag>-meta.json, as tools/art/reanim/pack.py does: atlas px = UP x the old painted frames, so a sprite that drew
          an old frame at K draws these at K / UP in the same place); with "middle" each sequence is scaled so its first frame's figure is
          `target` px tall and anchored at that figure's middle (Flicker, whose start pictures are Matt's cells).
          start meta key: "<meta json in stills/>:<key>", e.g. "w10ic-meta.json:ironclaw-idle".
  plates  {"kind": "plates", "step": 2, "cols": 4, "w": 832, "seqs": {seq: clip}}  whole frames (moving lair paintings), one sheet each
  stills  {"kind": "stills", "items": {name: [bucket png, mode, size]}}  mode "cut" = key the grey and trim (props, collars, guardians),
          "far" = resize to the game's far strip (2048 x 868, centred crop), "lair" = as painted (webp q85); size = longest side (cut)
Writes <SUB>/cutin/<group>[-k].webp, <group>.json ({sheets: [...], up, seq: {seq: [frame names]}, frames: {name: {s, x, y, w, h, ax, ay}}}),
and <SUB>/cutin/carrier-<group>.png (everything of the group, packed byte for byte: tools/art/w5/unpack_carrier.py).
"""
import io, json, os, subprocess, sys, zipfile
from pathlib import Path

if os.environ.get('PIPINSTALL', '1') == '1':
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow', 'numpy', 'scipy'], check=True)
import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402
from scipy import ndimage  # noqa: E402

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = ROOT / os.environ.get('SUB', 'w6to10')
SPEC = json.loads((ROOT / os.environ['SPEC']).read_text())
ONLY = [g for g in os.environ.get('GROUPS', '').split(',') if g]
OUTD = SUB / 'cutin'
OUTD.mkdir(parents=True, exist_ok=True)


def key_default(rgb):
    """tools/art/train/clips.py key(): the grey that reaches the edge is background (so grey inside the figure stays)"""
    a = rgb.astype(np.int16)
    border = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.abs(a - bg).max(axis=2)
    sat = a.max(axis=2) - a.min(axis=2)
    v = a.max(axis=2)
    greyish = (d < 26) | ((sat < 14) & (v > 120) & (v < 215))
    lab, _ = ndimage.label(greyish)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fig = ~np.isin(lab, edge[edge > 0])
    lab2, n = ndimage.label(fig)
    if n > 1:
        sizes = ndimage.sum(fig, lab2, range(1, n + 1))
        fig = np.isin(lab2, 1 + np.flatnonzero(sizes > max(400, sizes.max() * 0.02)))
    lab3, n3 = ndimage.label(greyish & fig)
    if n3:
        sizes = ndimage.sum(np.ones_like(d), lab3, range(1, n3 + 1))
        fig &= ~np.isin(lab3, 1 + np.flatnonzero(sizes > 40))
    inner = ndimage.binary_erosion(fig, iterations=1)
    return np.where(inner, 255, np.where(fig, np.clip((d - 8) * 9, 0, 255), 0)).astype(np.uint8)


def key_tight(rgb):
    """tools/art/reanim/pack.py key_tight(): for grey-skinned creatures only grey reaching the edge, or a shut-in pocket of almost
    exactly the background grey, is background"""
    a = rgb.astype(np.int16)
    border = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    d = np.abs(a - bg).max(axis=2)
    greyish = d < 22
    lab, _ = ndimage.label(greyish)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    fig = ~np.isin(lab, edge[edge > 0])
    lab2, n = ndimage.label(fig)
    if n > 1:
        sizes = ndimage.sum(fig, lab2, range(1, n + 1))
        fig = np.isin(lab2, 1 + np.flatnonzero(sizes > max(400, sizes.max() * 0.02)))
    lab3, n3 = ndimage.label((d < 7) & fig)
    if n3:
        sizes = ndimage.sum(np.ones_like(d), lab3, range(1, n3 + 1))
        fig &= ~np.isin(lab3, 1 + np.flatnonzero(sizes > 60))
    inner = ndimage.binary_erosion(fig, iterations=1)
    return np.where(inner, 255, np.where(fig, np.clip((d - 8) * 9, 0, 255), 0)).astype(np.uint8)


def clip_frames(clip):
    with zipfile.ZipFile(SUB / 'clips' / f'{clip}.zip') as z:
        return [np.asarray(Image.open(io.BytesIO(z.read(n))).convert('RGB')) for n in sorted(z.namelist())]


def bbox(a, th=128):
    ys, xs = np.nonzero(a > th)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


def save_webp(im, q=80):
    for qq in (q, 72, 64, 56):
        b = io.BytesIO(); im.save(b, 'WEBP', quality=qq, method=6)
        if len(b.getvalue()) < 3_900_000:
            return b.getvalue()
    return b.getvalue()


def pack(frames, sheet_h, width=2048, pad=2):
    """frames: {name: (RGBA image, ax, ay)} -> sheets [PIL], data {name: {s, x, y, w, h, ax, ay}}"""
    order = sorted(frames, key=lambda n: -frames[n][0].height)
    sheets, data, cur = [], {}, []
    x = y = rowh = 0
    for n in order:
        im = frames[n][0]
        if x + im.width + pad > width:
            x = 0; y += rowh + pad; rowh = 0
        if y + im.height > sheet_h and cur:
            sheets.append((cur, y + rowh if x else y)); cur = []; x = y = rowh = 0
        cur.append((n, x, y)); data[n] = {'s': len(sheets), 'x': x, 'y': y, 'w': im.width, 'h': im.height,
                                          'ax': round(frames[n][1], 1), 'ay': round(frames[n][2], 1)}
        x += im.width + pad; rowh = max(rowh, im.height)
    sheets.append((cur, y + rowh))
    out = []
    for items, h in sheets:
        S = Image.new('RGBA', (width, max(1, h)), (0, 0, 0, 0))
        for n, px, py in items:
            S.paste(frames[n][0], (px, py))
        out.append(S)
    return out, data


def meta_of(ref):
    f, k = ref.split(':')
    return json.loads((ROOT / 'stills' / f).read_text())[k]


def do_clips(name, g):
    keyf = key_tight if g.get('key') == 'tight' else key_default
    step = g.get('step', 2)
    frames, seqs = {}, {}
    for seq, (clip, ref, a, b) in g['seqs'].items():
        fs = clip_frames(clip)
        H, W = fs[0].shape[:2]
        idx = list(range(a, min(b, len(fs) - 1) + 1, step))
        ims = [np.dstack([fs[i], keyf(fs[i])]) for i in idx]
        boxes = [bbox(im[..., 3]) for im in ims]
        if g.get('anchor', 'meta') == 'meta':
            m = meta_of(ref)
            tw, th = max(1024, round(1024 * W / H)), max(1024, round(1024 * H / W))
            px, py = (tw - 1024) // 2, (th - 1024) // 2
            sc = W / tw
            axc = (m['ax'] * m['f'] + m['ox'] + px) * sc
            ayc = (m['ay'] * m['f'] + m['oy'] + py) * sc
            F = g['up'] / (m['f'] * sc)
        else:
            x0, y0, x1, y1 = boxes[0]
            axc, ayc = (x0 + x1) / 2, (y0 + y1) / 2
            F = g['target'] / (y1 - y0)
        names = []
        for i, im, (x0, y0, x1, y1) in zip(idx, ims, boxes):
            n = f'{seq}_{i:02d}'
            c = Image.fromarray(im[y0:y1, x0:x1].astype(np.uint8), 'RGBA')
            c = c.resize((max(1, round(c.width * F)), max(1, round(c.height * F))), Image.LANCZOS)
            tb = c.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox() or (0, 0, c.width, c.height)
            c = c.crop(tb)
            frames[n] = (c, (axc - x0) * F - tb[0], (ayc - y0) * F - tb[1])
            names.append(n)
        seqs[seq] = names
        print('SEQ', name, seq, clip, len(names), frames[names[0]][0].size, flush=True)
    sheets, data = pack(frames, g.get('sheetH', 8000))
    files, sheet_names = [], []
    for k, S in enumerate(sheets):
        fn = f'{name}-anim{"" if len(sheets) == 1 else "-" + str(k)}.webp'
        files.append((fn, save_webp(S)))
        sheet_names.append({'file': fn, 'w': S.width, 'h': S.height})
    j = {'sheets': sheet_names, 'up': g.get('up', 1), 'target': g.get('target'), 'anchor': g.get('anchor', 'meta'),
         'fps': round(16 / step, 2), 'seq': seqs, 'frames': data,
         'source': {seq: v[0] for seq, v in g['seqs'].items()}}
    files.append((f'{name}.json', json.dumps(j).encode()))
    return files


def do_plates(name, g):
    step, cols, w = g.get('step', 2), g.get('cols', 4), g.get('w', 832)
    files, j = [], {'sheets': [], 'fps': round(16 / step, 2), 'seq': {}}
    for seq, clip in g['seqs'].items():
        fs = clip_frames(clip)[::step]
        h = round(fs[0].shape[0] * w / fs[0].shape[1])
        rows = (len(fs) + cols - 1) // cols
        S = Image.new('RGB', (cols * w, rows * h))
        for k, f in enumerate(fs):
            S.paste(Image.fromarray(f).resize((w, h), Image.LANCZOS), ((k % cols) * w, (k // cols) * h))
        fn = f'{name}-{seq}.webp'
        files.append((fn, save_webp(S, 78)))
        j['seq'][seq] = {'file': fn, 'frames': len(fs), 'cols': cols, 'w': w, 'h': h, 'clip': clip}
        print('PLATE', seq, len(fs), S.size, flush=True)
    files.append((f'{name}.json', json.dumps(j).encode()))
    return files


def do_stills(name, g):
    files, j = [], {}
    cut = {}
    for n, (src, mode, size) in g['items'].items():
        im = Image.open(ROOT / src).convert('RGB')
        if mode == 'cut':
            a = np.asarray(im)
            al = key_default(a)
            r = Image.fromarray(np.dstack([a, al]), 'RGBA')
            r = r.crop(bbox(al, 8))
            s = min(1.0, size / max(r.size))
            cut[n] = (r.resize((round(r.width * s), round(r.height * s)), Image.LANCZOS), 0, 0)
        elif mode == 'far':
            s = 2048 / im.width
            r = im.resize((2048, round(im.height * s)), Image.LANCZOS)
            top = max(0, (r.height - 868) // 2)
            r = r.crop((0, top, 2048, top + 868))
            files.append((f'{n}.webp', save_webp(r, 82))); j[n] = {'file': f'{n}.webp', 'w': 2048, 'h': 868}
        else:
            files.append((f'{n}.webp', save_webp(im, 85))); j[n] = {'file': f'{n}.webp', 'w': im.width, 'h': im.height}
        print('STILL', n, mode, flush=True)
    if cut:
        sheets, data = pack({k: (v[0], v[0].width / 2, v[0].height) for k, v in cut.items()}, 8000)
        for k, S in enumerate(sheets):
            fn = f'{name}{"" if len(sheets) == 1 else "-" + str(k)}.webp'
            files.append((fn, save_webp(S, 85)))
        j['_atlas'] = {'sheets': [f'{name}{"" if len(sheets) == 1 else "-" + str(k)}.webp' for k in range(len(sheets))],
                       'frames': data, 'anchor': 'bottom middle'}
    files.append((f'{name}.json', json.dumps(j).encode()))
    return files


for name, g in SPEC['groups'].items():
    if ONLY and name not in ONLY:
        continue
    try:
        files = {'clips': do_clips, 'plates': do_plates, 'stills': do_stills}[g['kind']](name, g)
    except Exception as e:
        import traceback; traceback.print_exc()
        print('FAILED', name, repr(e)[:300], flush=True)
        continue
    for fn, x in files:
        (OUTD / fn).write_bytes(x)
        print('PUT', fn, len(x), flush=True)
    # carriers under 7 MB each (hf_fs attach takes up to 8 MB a call)
    chunk, size, k = [], 0, 0
    for fn, x in files:
        if chunk and size + len(x) > 7_000_000:
            (OUTD / f'carrier-{name}-{k}.png').write_bytes(carrier(chunk)); k += 1; chunk, size = [], 0
        chunk.append((fn, x)); size += len(x)
    (OUTD / f'carrier-{name}-{k}.png').write_bytes(carrier(chunk))
    print('GROUP_DONE', name, k + 1, 'carriers', flush=True)
print('ALL_DONE', flush=True)
