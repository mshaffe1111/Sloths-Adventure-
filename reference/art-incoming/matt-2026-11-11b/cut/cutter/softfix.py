# Soft pieces on magenta (steam, mist, waterfall, glow): model each pixel as the art colour S over the ground at opacity a, with
# a = 1 - magenta-ness / ground magenta-ness (magenta-ness = min(R-G, B-G)); unmix S. Works inside the cut mask grown by GROW px, so
# faint mist the keyer dropped comes back as real transparency, and the pink halo goes. usage: softfix.py ROOT id [id ...]
import sys, json; ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
GROW = 14
info = {r['sheet']: r for r in json.load(open(ROOT + '/artcut/_cutinfo.json'))}
for pid in sys.argv[2:]:
    sid = pid.rsplit('-', 1)[0]; r = info[sid]; p = [q for q in r['pieces'] if q['id'] == pid][0]
    bg = np.array(r['bg'], np.float32); mb = min(bg[0] - bg[1], bg[2] - bg[1])
    src = np.asarray(Image.open(f"{ROOT}/artraw/{sid.split('-')[0]}/{sid.replace('-', '-sheet-')}.jpg").convert('RGB')).astype(np.float32)
    raw = np.asarray(Image.open(f'{ROOT}/pieces_raw/{pid}.png')).astype(np.float32)
    x0, y0 = p['x'] - GROW, p['y'] - GROW; H, W = raw.shape[0] + 2 * GROW, raw.shape[1] + 2 * GROW
    x0c, y0c = max(0, x0), max(0, y0); C = src[y0c:y0 + H, x0c:x0 + W]
    m = np.zeros(C.shape[:2], bool); oy, ox = p['y'] - y0c, p['x'] - x0c
    m[oy:oy + raw.shape[0], ox:ox + raw.shape[1]] = raw[..., 3] > 0
    m = ndi.binary_dilation(m, iterations=GROW)
    mag = np.minimum(C[..., 0] - C[..., 1], C[..., 2] - C[..., 1])
    a = np.clip(1 - mag / mb, 0, 1); a[a < 0.06] = 0; a[~m] = 0
    S = np.clip((C - (1 - a[..., None]) * bg) / np.maximum(a, 0.06)[..., None], 0, 255)
    out = np.dstack([S, a * 255])
    im = Image.fromarray(np.clip(out + .5, 0, 255).astype(np.uint8), 'RGBA'); bb = im.getbbox(); im = im.crop(bb)
    im.save(f'{ROOT}/artcut/pieces/{pid}.png', compress_level=6); print(pid, 'unmixed', im.size)
