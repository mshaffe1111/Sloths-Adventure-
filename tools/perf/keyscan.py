"""The key-hue scan (2026-11-05; the W6 wetLeaves and stakeLantern frames shipped with a pink smear of the magenta key painted beside
them): for EVERY image with an alpha channel in src/assets, each frame's alpha edge and soft-alpha halo is counted for pixels in a
cutter's key colour, so a leftover key shows up wherever it is.

    python3 -I tools/perf/keyscan.py [--write] [--seed-known] [--contact <out.jpg> [N]] [--only <path substring>] [--image <file> ...]
  --seed-known  (once, when the gate was made, 2026-11-05) write every frame over the threshold to tools/perf/keyknown.json, owner
                "lead triage"; after that the list only shrinks (knowncheck.mjs), and a frame the lead judges painted on purpose
                keeps its entry with reason "painted, judged <date> by lead"

Keys the cutters use (tools/art: grep "flat ... magenta|grey|green"): magenta #FF00FF (and the darker pink the model drifts to), key
green #00FF00 (World 5's props), flat grey (#808080-ish: the creature clips and stills). White is used once (the W1 canopy, an opaque
strip) and is not a key-hue fault on a cut piece, so it is not counted.

Frames: each picture's alpha is split into its pieces (8-connected, alpha > 8, joined across 1 px), so every packed sheet is covered
whether or not it has a frames file; a piece is named by the frame rectangle that holds its centre when one is found: the sheet's own
.json beside it ({name: {x, y, w, h}} or {frames: {...}}), src/game/dressNewData.ts (by world), or a src/game/*.ts that names only that
picture and lists {x, y, w, h} frames. Otherwise it is "piece@x,y".

The edge: the soft-alpha halo (8 < alpha < 235) and the opaque pixels within 2 px of the clear area. Counted there:
  pink   hue 285-345 deg, saturation > 0.35, value > 0.45, red and blue both well over green: the magenta key and its pink drift;
         and in the soft halo also hue 285-10 deg with blue not under green: the key mixed into a warm painted glow (salmon pink: pastel, saturation 0.2-0.65, value > 0.6)
  green  hue 95-145, saturation > 0.7, value > 0.75: the neon key green, not a painted leaf (darker, less saturated)
  grey   only in the soft halo: saturation < 0.07, value 0.38-0.70: a flat grey key left in the antialiasing (an ink outline's own
         antialiasing is dark, below 0.38)
Only colours the piece is not painted in count: an edge pixel is skipped where an opaque pixel within OWN (16) px of it has that colour
(a pink sky's fade, a lilac bush, a grey stone keep their own paint), and a piece that is under 10% opaque (a mist, a glow, a light
shaft: soft by design) is not judged. A frame's score is its worst count over that hue's threshold. --write with --only or --image updates just those
images in the saved scan (after a single piece is remade); with neither it rescans and replaces everything. --write saves tools/perf/keyscan.json (every image's sha1 and its frames' counts), which
tools/perf/artcheck.mjs checks with no image library: an image whose sha1 is not in it fails (re-run this scan), and a frame over
THRESHOLD that is not in tools/perf/keyknown.json fails (a known list that only shrinks: knowncheck.mjs).
"""
import hashlib, json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / 'src' / 'assets'
THRESHOLD = {'pink': 40, 'green': 40, 'grey': 400}
OWN = 16   # px: an edge pixel within this of an opaque pixel of its own colour is the piece's own paint
# (full-bleed sky gradients: painted to fade out, no key ever cut them)
SKIP = ('src/assets/backdrops/', '-sky')   # set from the 2026-11-05 scan (see reference/methods/gates.md)


def hsv(a):
    r, g, b = a[..., 0] / 255.0, a[..., 1] / 255.0, a[..., 2] / 255.0
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    d = np.maximum(mx - mn, 1e-6)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, (mx - mn) / np.maximum(mx, 1e-6), mx


def frame_tables():
    """{image rel path: [(name, x, y, w, h)]} from the frames files that can be read without running the game"""
    out = {}
    for j in ASSETS.rglob('*.json'):
        try:
            d = json.loads(j.read_text())
        except Exception:
            continue
        if isinstance(d, dict) and isinstance(d.get('frames'), dict):
            d = d['frames']
        if not isinstance(d, dict):
            continue
        rows = []
        for k, v in d.items():
            if isinstance(v, dict):
                f = v.get('frame', v)
                if all(isinstance(f.get(c), (int, float)) for c in 'xywh'):
                    rows.append((k, f['x'], f['y'], f['w'], f['h']))
        if rows:
            for ext in ('.webp', '.png'):
                im = j.with_suffix(ext)
                if im.exists():
                    out[str(im.relative_to(ROOT))] = rows
    dn = ROOT / 'src/game/dressNewData.ts'
    if dn.exists():
        body = json.loads(re.search(r'DRESS_NEW_FRAMES = (\{.*?\n\}) satisfies', dn.read_text(), re.S).group(1))
        for k, f in body.items():
            out.setdefault(f'src/assets/props/dressnew-w{f["world"]}.webp', []).append((k, f['x'], f['y'], f['w'], f['h']))
    rx = re.compile(r'["\']?([\w-]+)["\']?\s*:\s*\{\s*["\']?x["\']?\s*:\s*(\d+)\s*,\s*["\']?y["\']?\s*:\s*(\d+)\s*,\s*["\']?w["\']?\s*:\s*(\d+)\s*,'
                    r'\s*["\']?h["\']?\s*:\s*(\d+)')
    for ts in (ROOT / 'src/game').glob('*.ts'):
        t = ts.read_text()
        refs = set(re.findall(r'assets/([\w/.-]+\.(?:webp|png))', t))
        if len(refs) != 1:
            continue
        rel = 'src/assets/' + next(iter(refs))
        if rel in out:
            continue
        rows = [(m[0], int(m[1]), int(m[2]), int(m[3]), int(m[4])) for m in rx.findall(t)]
        if rows:
            out[rel] = rows
    return out


def scan(path, table, masks=None):
    im = Image.open(path)
    if 'A' not in im.getbands() and not (im.mode == 'P' and 'transparency' in im.info):
        return []
    a = np.asarray(im.convert('RGBA'))
    al = a[..., 3].astype(np.int16)
    if al.min() >= 250:
        return []
    clear = al <= 8
    soft = (al > 8) & (al < 235)
    near = ndimage.binary_dilation(clear, iterations=2) & ~clear
    edge = soft | near
    h, s, v = hsv(a[..., :3].astype(np.float32))
    r, g, b = [a[..., c].astype(np.int16) for c in range(3)]
    magenta = (h >= 285) & (h <= 345) & (s > 0.35) & (v > 0.45) & (r - g > 60) & (b - g > 30)
    # (in the soft halo, also the key mixed with a warm glow: salmon pink, blue not under green; the W6 lantern's glow, 2026-11-05)
    warm = ((h >= 285) | (h <= 10)) & (s > 0.2) & (s < 0.65) & (v > 0.6) & (r - g > 50) & (b >= g - 8)   # (pastel: a red petal is more saturated)
    green_k = (h >= 95) & (h <= 145) & (s > 0.7) & (v > 0.75)
    grey_k = (s < 0.07) & (v >= 0.38) & (v <= 0.70)
    # (a key left over is a colour the piece itself is not painted in: an edge pixel counts only where no opaque pixel within OWN px
    # of it is painted that colour, so a pink sky's fade, a lilac bush's petals or a grey stone's rim are the piece's own paint)
    solid = al >= 235
    own = lambda m, r=OWN: ndimage.binary_dilation(solid & m, iterations=r)
    # (a warm glow's own pixels only spare it 4 px: the lantern's glow is the fault, its glass is the piece)
    pink = (edge & magenta & ~own(magenta)) | (soft & warm & ~own(magenta) & ~own(warm, 4))
    green = edge & green_k & ~own(green_k)
    grey = soft & grey_k & ~own(grey_k)
    if masks is not None:
        masks.update(rgba=a, pink=pink, green=green, grey=grey)
    lab, n = ndimage.label(ndimage.binary_dilation(~clear, iterations=1), structure=np.ones((3, 3)))
    if n == 0:
        return []
    idx = range(1, n + 1)
    cnt = {k: ndimage.sum(m, lab, idx) for k, m in (('pink', pink), ('green', green), ('grey', grey), ('edge', edge), ('solid', solid),
                                                    ('body', ~clear))}
    boxes = ndimage.find_objects(lab)
    frames = []
    for i, sl in enumerate(boxes):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if (y1 - y0) * (x1 - x0) < 64:
            continue
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        name = next((k for (k, fx, fy, fw, fh) in table if fx <= cx < fx + fw and fy <= cy < fy + fh), None) or f'piece@{x0},{y0}'
        # (a piece that is almost all soft alpha is a mist, a glow or a light by design: not judged)
        if cnt['solid'][i] < 0.1 * cnt['body'][i]:
            continue
        row = {'frame': name, 'box': [int(x0), int(y0), int(x1 - x0), int(y1 - y0)], 'edge': int(cnt['edge'][i]),
               'pink': int(cnt['pink'][i]), 'green': int(cnt['green'][i]), 'grey': int(cnt['grey'][i])}
        frames.append(row)
    # (one frame can split into several pieces, e.g. a smear beside the leaf: summed under its name)
    merged = {}
    for f in frames:
        m = merged.setdefault(f['frame'], {**f, 'pieces': 0, 'pink': 0, 'green': 0, 'grey': 0, 'edge': 0})
        m['pieces'] += 1
        for k in ('pink', 'green', 'grey', 'edge'):
            m[k] += f[k]
    return list(merged.values())


def contact(hits, tables, out):
    """a sheet of the worst frames: each on dark green, and beside it the same with the counted key pixels painted cyan"""
    from PIL import ImageDraw
    cells, cache = [], {}
    for sc, rel, f, k in hits:
        if rel not in cache:
            m = {}
            scan(ROOT / rel if not Path(rel).is_absolute() else Path(rel), tables.get(rel, []), m)
            cache = {rel: m}
        m = cache[rel]
        x, y, w, h = f['box']
        if w * h > 1400 * 900:
            w, h = min(w, 1400), min(h, 900)
        c = m['rgba'][y:y + h, x:x + w]
        bg = Image.new('RGBA', (w, h), (24, 56, 28, 255))
        bg.alpha_composite(Image.fromarray(c, 'RGBA'))
        mark = bg.copy()
        hit = (m['pink'] | m['green'] | m['grey'])[y:y + h, x:x + w]
        ma = np.asarray(mark).copy(); ma[hit] = (0, 255, 255, 255); mark = Image.fromarray(ma, 'RGBA')
        s_ = min(1.0, 300 / max(w, h))
        tw, th = max(1, round(w * s_)), max(1, round(h * s_))
        cell = Image.new('RGB', (tw * 2 + 6, th + 34), (16, 16, 16))
        cell.paste(bg.convert('RGB').resize((tw, th), Image.LANCZOS), (0, 34)); cell.paste(mark.convert('RGB').resize((tw, th), Image.LANCZOS), (tw + 6, 34))
        d = ImageDraw.Draw(cell)
        d.text((2, 2), f'{sc:.1f}x {k} {f[k]}', fill=(255, 255, 0)); d.text((2, 17), f'{rel.replace("src/assets/", "")} {f["frame"]}'[:70], fill=(220, 220, 220))
        cells.append(cell)
    W = 1600
    rows, x, y, rh, lay = [], 0, 0, 0, []
    for c in cells:
        if x + c.width > W:
            x, y, rh = 0, y + rh + 8, 0
        lay.append((c, x, y)); x += c.width + 8; rh = max(rh, c.height)
    S = Image.new('RGB', (W, y + rh + 8), (40, 40, 40))
    for c, x, y in lay:
        S.paste(c, (x, y))
    out.parent.mkdir(parents=True, exist_ok=True)
    S.save(out, quality=85)
    print('contact sheet', out, len(cells))


def worst(f):
    return max(((f[k] / THRESHOLD[k], k) for k in THRESHOLD), default=(0, ''))


def main():
    args = sys.argv[1:]
    write = '--write' in args
    only = args[args.index('--only') + 1] if '--only' in args else None
    images = [Path(x) for x in args[args.index('--image') + 1:]] if '--image' in args else \
        sorted(p for p in ASSETS.rglob('*') if p.suffix.lower() in ('.webp', '.png'))
    tables = frame_tables()
    res, hits = {}, []
    for p in images:
        rel = str(p.resolve().relative_to(ROOT)) if p.resolve().is_relative_to(ROOT) else str(p)
        if only and only not in rel:
            continue
        if rel.startswith(SKIP[0]) and SKIP[1] in rel:
            continue
        frames = scan(p, tables.get(rel, []))
        res[rel] = {'sha1': hashlib.sha1(p.read_bytes()).hexdigest(), 'frames': frames}
        for f in frames:
            sc, k = worst(f)
            if sc > 1:
                hits.append((sc, rel, f, k))
    hits.sort(key=lambda t: -t[0])
    print(f'key scan: {len(res)} images, {sum(len(v["frames"]) for v in res.values())} frames, {len(hits)} over the threshold {THRESHOLD}')
    for sc, rel, f, k in hits:
        print(f'  {sc:6.1f}x  {rel}  {f["frame"]}  worst {k} {f[k]} (pink {f["pink"]}, green {f["green"]}, grey {f["grey"]}; '
              f'edge {f["edge"]} px, box {f["box"]})')
    if '--contact' in args:
        contact(hits[:int(args[args.index('--contact') + 2]) if len(args) > args.index('--contact') + 2 else 48], tables,
                Path(args[args.index('--contact') + 1]))
    if '--seed-known' in args:
        kn = [{'sheet': rel, 'frame': f['frame'], 'hue': k, 'count': f[k], 'box': f['box'], 'owner': 'lead triage',
               'why': 'key-hue scan 2026-11-05 (R-164.15)'} for sc, rel, f, k in hits]
        (ROOT / 'tools/perf/keyknown.json').write_text(json.dumps({
            'about': 'Frames with leftover key-hue pixels when the key-hue check was made (2026-11-05, tools/perf/keyscan.py; artcheck.mjs '
                     'fails any frame over the threshold not listed here). Shrink-only (LAWS.md law 5): artcheck fails a listed frame that is '
                     'clean now, knowncheck.mjs fails an added one. Worst first. Owner "lead triage": the lead judges each; a frame painted on '
                     'purpose (a lava glow, a dusk haze) keeps its entry with reason "painted, judged <date> by lead"; the rest is debt.',
            'known': kn}, indent=1))
        print('wrote tools/perf/keyknown.json', len(kn))
    if write:
        out = ROOT / 'tools/perf/keyscan.json'
        if only or '--image' in args:  # (a partial scan updates its images in the saved one; a full scan replaces it)
            res = {**json.loads(out.read_text())['images'], **res}
        out.write_text(json.dumps({'note': 'written by tools/perf/keyscan.py --write; checked by artcheck.mjs', 'threshold': THRESHOLD,
                                   'images': res}, indent=0, sort_keys=True))
        print('wrote', out)
    return hits


if __name__ == '__main__':
    main()
