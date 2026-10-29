"""Previews and checks for the World 5-10 clips (2026-10-28), as a CPU job on Hugging Face (bucket mshaffe111/w5-xfer at /out).

For every clip <SUB>/clips/<name>.zip whose name starts with one of PREFIXES (comma list):
  - an 8-frame strip (frames 0, 7, 14, ... 48) for a per-group summary sheet <SUB>/check/sum-<group>.jpg (one row a clip, labelled
    with the numbers below), the group being the clip name's second field (w6t-<group>-<move>-s<seed>);
  - an animated WebP at 288 px wide, every second frame at 12 fps (<name>.webp), for the gallery;
  - numbers that flag broken clips, from the figure cut off the flat grey (anything more than 28 levels away from the frame's corner
    colour): `drift` = how far the figure's middle moves across the clip (share of the frame width; a walk that slides or a creature
    that leaves the frame shows here), `size` = largest / smallest figure area (shrinking into the distance), `move` = mean change
    between frames (a frozen clip is ~0), `edge` = share of frames where the figure touches the frame's edge.
All animated WebPs and strips are packed into <SUB>/check/carrier-<group>.png (tools/art/w5/unpack_carrier.py) and the numbers into
<SUB>/check/stats-<group>.json.
"""
import io, json, os, subprocess, sys, zipfile
from pathlib import Path

subprocess.run([sys.executable, '-m', 'pip', 'install', '-q', 'pillow', 'numpy'], check=True)
import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

ROOT = Path(os.environ.get('OUT', '/out'))
SUB = ROOT / os.environ['SUB']
PRE = [p for p in os.environ['PREFIXES'].split(',') if p]


def put(path, data):
    p = SUB / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_bytes(data)
    print('PUT', path, len(data), flush=True)


def carrier(files):
    head = json.dumps([[n, len(x)] for n, x in files]).encode() + b'\n'
    data = head + b''.join(x for _, x in files)
    w = 2048
    h = (len(data) + w - 1) // w
    arr = np.zeros(w * h, np.uint8)
    arr[:len(data)] = np.frombuffer(data, np.uint8)
    b = io.BytesIO(); Image.fromarray(arr.reshape(h, w), 'L').save(b, 'PNG', compress_level=9)
    return b.getvalue()


def stats(frames):
    a = [np.asarray(f.convert('RGB').resize((f.width // 4, f.height // 4)), np.float32) for f in frames]
    H, W = a[0].shape[:2]
    cx, area, edge = [], [], 0
    for x in a:
        bg = np.median(np.concatenate([x[:3, :3].reshape(-1, 3), x[:3, -3:].reshape(-1, 3)]), 0)
        m = np.abs(x - bg).max(-1) > 28
        if m.sum() < 20:
            cx.append(W / 2); area.append(1); continue
        ys, xs = np.nonzero(m)
        cx.append(xs.mean()); area.append(m.sum())
        if xs.min() <= 1 or xs.max() >= W - 2 or ys.min() <= 1:
            edge += 1
    mv = float(np.mean([np.abs(a[i + 1] - a[i]).mean() for i in range(len(a) - 1)]))
    return {'drift': round(float(max(cx) - min(cx)) / W, 3), 'size': round(float(max(area)) / max(1, min(area)), 2), 'move': round(mv, 2),
            'edge': round(edge / len(a), 2)}


groups = {}
for z in sorted((SUB / 'clips').glob('*.zip')):
    name = z.stem
    if not any(name.startswith(p) for p in PRE):
        continue
    groups.setdefault(name.split('-')[1], []).append(z)
for g, zs in groups.items():
    rows, files, st = [], [], {}
    for z in zs:
        name = z.stem
        try:
            with zipfile.ZipFile(z) as zf:
                frames = [Image.open(io.BytesIO(zf.read(n))).convert('RGB') for n in sorted(zf.namelist())]
        except Exception as e:
            print('BAD', name, repr(e)[:200], flush=True); continue
        s = stats(frames); st[name] = s
        tw = 160; th = round(frames[0].height * tw / frames[0].width)
        strip = Image.new('RGB', (8 * tw, th + 14), (34, 34, 34))
        d = ImageDraw.Draw(strip)
        for i, k in enumerate(range(0, len(frames), 7)):
            if i < 8:
                strip.paste(frames[k].resize((tw, th), Image.LANCZOS), (i * tw, 14))
        d.text((3, 1), f"{name}  drift {s['drift']}  size {s['size']}  move {s['move']}  edge {s['edge']}", fill=(255, 255, 0))
        rows.append(strip)
        aw = 288; ah = round(frames[0].height * aw / frames[0].width)
        small = [f.resize((aw, ah), Image.LANCZOS) for f in frames[::2]]
        b = io.BytesIO(); small[0].save(b, 'WEBP', save_all=True, append_images=small[1:], duration=83, loop=0, quality=72, method=4)
        files.append((f'{name}.webp', b.getvalue()))
        b = io.BytesIO(); strip.save(b, 'JPEG', quality=82); files.append((f'{name}-strip.jpg', b.getvalue()))
        print('CLIP', name, s, flush=True)
    if not rows:
        continue
    W = max(r.width for r in rows)
    S = Image.new('RGB', (W, sum(r.height for r in rows)), (20, 20, 20))
    y = 0
    for r in rows:
        S.paste(r, (0, y)); y += r.height
    b = io.BytesIO(); S.save(b, 'JPEG', quality=80); put(f'check/sum-{g}.jpg', b.getvalue())
    put(f'check/stats-{g}.json', json.dumps(st, indent=1).encode())
    chunk, size, k = [], 0, 0
    for n, x in files:
        if chunk and size + len(x) > 5_800_000:
            put(f'check/carrier-{g}-{k}.png', carrier(chunk)); k += 1; chunk, size = [], 0
        chunk.append((n, x)); size += len(x)
    if chunk:
        put(f'check/carrier-{g}-{k}.png', carrier(chunk))
print('ALL_DONE', flush=True)
