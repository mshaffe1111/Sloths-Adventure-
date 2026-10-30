"""Repack each world's ground sheet with the clean sweep's variants (hf-art-ground, 2026-10-30; CLEAN-SWEEP G1, G2): four soil textures
(the three in the game and one more, made from them with their edges kept), three top lips (sharing their ends) and three bank ends.
    python3 tools/art/hfground/pack2.py <raw dir> [worlds]      (picks from picks2.json: {"<w>": {"fill": name, "lips": [..], "ends": [..]}})
Layout, 2048 x 2944: fills 2 x 2 (1024 each); lips at y 2048 (two across) and y 2208; ends 384 x 576 at (1024, 2208), (1408, 2208) and
(0, 2368). Writes src/assets/ground/w<N>.webp and the world's entry in src/game/groundAtlasData.ts (fills, lip, lips, end, ends, deep).
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from keying import depurple, key  # noqa: E402

ROOT = HERE.parents[2]
raw = Path(sys.argv[1])
picks = json.loads((HERE / 'picks2.json').read_text())
worlds = sys.argv[2:] or list(picks)
TS = ROOT / 'src/game/groundAtlasData.ts'
src = TS.read_text()
G = json.loads(re.search(r'GROUND_FRAMES: Record<number, GroundSheet> = (\{.*\});', src, re.S).group(1))


def surf_row(solid, share=0.85):
    cov = solid.mean(1)
    rows = np.where(cov >= share)[0]
    return int(rows[0]) if len(rows) else int(np.argmax(cov))


def end_piece(end):
    """pack.py's bank end: only a rim along the face kept below the corner, the last rows faded; its walking line, corner and face"""
    end = end.resize((384, 576), Image.LANCZOS)
    a = np.asarray(end).copy()
    al = a[..., 3].astype(np.float32)
    x = np.arange(384, dtype=np.float32)
    fade = np.clip((x - 0.04 * 384) / (0.36 * 384), 0, 1)
    fade = fade * fade * (3 - 2 * fade)
    solid0 = al > 128
    body = ndimage.binary_erosion(solid0, iterations=5)
    edge = np.array([np.where(body[y])[0].max() if body[y].any() else 0 for y in range(576)], np.float32)
    edge = ndimage.median_filter(edge, size=41, mode='nearest')
    rim = np.clip(1 - ((edge[:, None] - x[None, :]) - 70) / 50, 0, 1)
    es0 = surf_row(solid0[:, :192], 0.9)
    top = np.clip(1 - (np.arange(576, dtype=np.float32) - (es0 + 50)) / 60, 0, 1)[:, None]
    keep = ndimage.gaussian_filter(np.maximum(rim, top * fade[None, :]), 6)
    yy = np.arange(576, dtype=np.float32)
    keep = keep * np.clip((575 - yy) / 120, 0, 1)[:, None]
    a[..., 3] = (al * np.minimum(1, keep)).astype(np.uint8)
    solid = al > 128
    es = surf_row(solid[:, :192], 0.9)

    def right_edge(row):
        xs = np.where(solid[min(575, max(0, row))])[0]
        return int(xs.max()) if len(xs) else 192
    corner = right_edge(es + 14)
    face = []
    for i in range(9):
        row = round(es + (575 - es) * i / 8)
        rs = [right_edge(r) for r in range(max(0, row - 4), min(576, row + 5))]
        face.append(round(float(np.median(rs)) / 384, 4))
    face[0] = min(face[0], corner / 384)
    return Image.fromarray(a, 'RGBA'), {'surf': round(es / 576, 4), 'cx': round(corner / 384, 4), 'face': face}


for w in worlds:
    pk = picks[w]
    g = G[w]
    old = Image.open(ROOT / f'src/assets/ground/w{w}.webp').convert('RGBA')
    crop = lambda f: old.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    S = Image.new('RGBA', (2048, 2944), (0, 0, 0, 0))
    fills = [crop(f) for f in g['fills']] + [Image.open(raw / f"{pk['fill']}.webp").convert('RGBA').resize((1024, 1024), Image.LANCZOS)]
    fpos = [(0, 0), (1024, 0), (0, 1024), (1024, 1024)]
    for im, p in zip(fills, fpos):
        S.alpha_composite(im, p)
    lips = [crop(g['lip'])] + [depurple(key(Image.open(raw / f'{n}.webp'))).resize((1024, 160), Image.LANCZOS) for n in pk['lips']]
    lpos = [(0, 2048), (1024, 2048), (0, 2208)]
    for im, p in zip(lips, lpos):
        S.alpha_composite(im, p)
    ends = [(crop(g['end']), {k: g['end'][k] for k in ('surf', 'cx', 'face')})]
    ends += [end_piece(depurple(key(Image.open(raw / f'{n}.webp'), main_only=True))) for n in pk['ends']]
    epos = [(1024, 2208), (1408, 2208), (0, 2368)]
    for (im, _), p in zip(ends, epos):
        S.alpha_composite(im, p)
    fr = lambda p, wh: {'x': p[0], 'y': p[1], 'w': wh[0], 'h': wh[1]}
    lipf = [{**fr(p, (1024, 160)), 'surf': g['lip']['surf']} for p in lpos[:len(lips)]]
    endf = [{**fr(p, (384, 576)), **meta} for (_, meta), p in zip(ends, epos)]
    G[w] = {'fills': [fr(p, (1024, 1024)) for p in fpos[:len(fills)]], 'lip': lipf[0], 'lips': lipf, 'end': endf[0], 'ends': endf,
            'deep': g['deep']}
    out = ROOT / f'src/assets/ground/w{w}.webp'
    S.save(out, 'WEBP', quality=82, method=6)
    print(w, out.stat().st_size, [e['cx'] for e in endf])
TS.write_text(re.sub(r'(GROUND_FRAMES: Record<number, GroundSheet> = )\{.*\};', lambda m: m.group(1) + json.dumps(G) + ';', src, flags=re.S))
