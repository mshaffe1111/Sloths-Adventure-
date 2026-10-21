"""Pack the named story cells into three webp atlases and write the frame table the game reads.

usage: python3 pack.py [global-scale] [quality]
"""
import hashlib, json, os, sys
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
from catalog import S

D = os.path.dirname(os.path.abspath(__file__))
REPO = '/home/claude/sloths-adventure-'
GS = float(sys.argv[1]) if len(sys.argv) > 1 else 0.9
Q = int(sys.argv[2]) if len(sys.argv) > 2 else 80
ATLASES = ['pokey', 'pair', 'folk']
PAD = 2
WIDTH = 2048
FACING = {'l': -1, 'r': 1, '0': 0}


def load_meta(sheet):
    return json.load(open(f'{D}/cells/s{sheet:02d}.json'))['cells']


def resize(img, k):
    if abs(k - 1) < 0.01: return img
    w, h = max(1, round(img.width * k)), max(1, round(img.height * k))
    return img.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')


items = []  # dict(key, atlas, img, f, c)
for n, spec in S.items():
    sheet = spec.get('sheet', n)
    meta = load_meta(sheet)
    k = None
    if spec['ref']:
        rc = f"{(spec['ref'][0]-1)//4}{(spec['ref'][0]-1)%4}"
        k = spec['ref'][1] / meta[rc]['size'][1] * GS
    else:
        k = (spec['scale'] or 1.0) * GS
    for i, tok in enumerate(spec['cells']):
        if tok == '-': continue
        parts = tok.split(':')
        name, f, flag = parts[0], FACING[parts[1]] if len(parts) > 1 else 0, parts[2] if len(parts) > 2 else None
        rc = f'{i//4}{i%4}'
        if rc not in meta:
            print('MISSING', sheet, rc, name); continue
        img = Image.open(f'{D}/cells/s{sheet:02d}_{rc}.png').convert('RGBA')
        if sheet == 18 and i >= 8 and flag != 'raw':
            a = img.getchannel('A').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
            img.putalpha(a)
        img = resize(img, k)
        items.append(dict(key=f"{spec['code']}.{name}", atlas=ATLASES.index(spec['atlas']), img=img, f=f, c=flag, sheet=sheet))

keys = [it['key'] for it in items]
assert len(keys) == len(set(keys)), [k for k in keys if keys.count(k) > 1]

out = {}
sizes = []
for ai, an in enumerate(ATLASES):
    mine = sorted([it for it in items if it['atlas'] == ai], key=lambda it: -it['img'].height)
    x = y = shelf = 0
    place = []
    for it in mine:
        w, h = it['img'].size
        if x + w + PAD > WIDTH:
            x, y, shelf = 0, y + shelf + PAD, 0
        place.append((it, x, y))
        x += w + PAD
        shelf = max(shelf, h)
    H = y + shelf + PAD
    H = (H + 3) // 4 * 4
    atlas = Image.new('RGBA', (WIDTH, H), (0, 0, 0, 0))
    for it, px, py in place:
        atlas.paste(it['img'], (px, py))
        e = dict(a=ai, x=px, y=py, w=it['img'].width, h=it['img'].height, f=it['f'])
        if it['c']: e['c'] = it['c']
        out[it['key']] = e
    path = f'{REPO}/src/assets/characters/cels-{an}.webp'
    atlas.save(path, 'WEBP', quality=Q, alpha_quality=Q, method=6)
    sizes.append((WIDTH, H))
    print(an, WIDTH, H, len(place), 'frames', os.path.getsize(path) // 1024, 'KB')
    # a labelled check picture
    chk = Image.new('RGB', atlas.size, (70, 62, 92))
    chk.paste(atlas, (0, 0), atlas)
    dr = ImageDraw.Draw(chk)
    for it, px, py in place:
        dr.rectangle([px, py, px + it['img'].width, py + it['img'].height], outline=(120, 110, 150))
        dr.text((px + 2, py + 2), it['key'], fill=(255, 255, 140))
    chk.save(f'{D}/atlas_{an}.png')

blob = hashlib.sha1()
for an in ATLASES:
    blob.update(open(f'{REPO}/src/assets/characters/cels-{an}.webp', 'rb').read())
ver = blob.hexdigest()[:8]

lines = [
    "/** Generated from Matt's story sheets (scratchpad story/cut.py, catalog.py, pack.py): every cell is cut from a flat grey sheet and keyed. */",
    "export interface CelFrame {",
    "  /** which atlas (see storyCels.ts: pokey, pair, folk) */",
    "  a: 0 | 1 | 2;",
    "  x: number; y: number; w: number; h: number;",
    "  /** the way the figure looks in the sheet: -1 left, 1 right, 0 front or unclear (never flipped for facing) */",
    "  f: -1 | 0 | 1;",
    "  /** b: cut off at the bottom (drawn with a soft fade); raw: an opaque picture, not a cut-out */",
    "  c?: 'b' | 'raw';",
    "}",
    "export const CEL_ATLAS_SIZES = [" + ', '.join(f"{{ w: {w}, h: {h} }}" for w, h in sizes) + "] as const;",
    "export const CELS: Record<string, CelFrame> = {",
]
cur = None
for key in sorted(out):
    e = out[key]
    c = f", c: '{e['c']}'" if 'c' in e else ''
    lines.append(f"  '{key}': {{ a: {e['a']}, x: {e['x']}, y: {e['y']}, w: {e['w']}, h: {e['h']}, f: {e['f']}{c} }},")
lines.append("};")
open(f'{REPO}/src/game/storyCelData.ts', 'w').write('\n'.join(lines) + '\n')
json.dump(out, open(f'{D}/cels.json', 'w'))
print('frames', len(out), 'version', ver, 'total', sum(os.path.getsize(f'{REPO}/src/assets/characters/cels-{a}.webp') for a in ATLASES) // 1024, 'KB')
