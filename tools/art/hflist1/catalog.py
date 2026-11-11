"""Picture list 1: catalogue the kept HF pieces (src/assets/w1-1111c/) into reference/art-incoming/hf-list1/: catalog.csv, contact
sheets by item on dark and light (cyan = flat walkable top, drawn only where it passes the 3 px flatness test, at least 50%).
usage: python3 catalog.py <repo root>"""
import sys, csv, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
R = sys.argv[1]; K = f'{R}/src/assets/w1-1111c'; O = f'{R}/reference/art-incoming/hf-list1'
sys.path.insert(0, f'{R}/reference/art-incoming/matt-2026-11-09/cut/cutter'); from walk import walk_top
W = {1: 'Emerald Canopy', 2: 'Sunlit Riverbank', 3: 'Mossy Grotto', 4: 'Mist Cascades', 5: 'Orchid Sanctuary', 6: 'Deep Mangrove',
     7: 'Ancient Ruins', 8: 'Twilight Treetops', 9: 'Volcanic Jungle', 10: 'Stormy Highlands Fortress'}
G, A, F = 'grounded', 'attached', 'may float'
MT = ' (made thing: never W1)'
ROWS = [  # id, item, take kept, label, kind, float, worlds, why, notes, rejected takes
 ('HF1-P-08-c', 1, 's52-23', 'ruin stairs', 'step set piece', G, [7], 'ruin stairs' + MT, 'FLAG: still angled, not side view: repaint in place at s52/s60 keeps Matt\'s 3/4 composition (by design); a side-on stair needs a new start.', 's52-11, s60-11: the step faces smeared; s60-23: the top step grew a second slab'),
 ('HF1-P-08-d', 1, 's60-11', 'ruin arch', 'den or hide spot', G, [7, 3], 'carved ruin arch' + MT, 'Clean keystone, dark doorway.', 's52-11: the keystone lost its carving; s52-23, s60-23: plainer, weaker moss'),
 ('HF1-P-10-a', 1, 's52-23', 'dripping cliff ledge', 'rock', G, [4, 10, 3], 'mossy cliff ledge with drips: the cascades; fills 4 floor', 'Drips falling below the ledge are separate drops; the keyer kept the ones near the ledge.', 's52-11, s60-11: drips blur into the rock; s60-23: moss drapes thick enough to hide the top line'),
 ('HF1-P-10-d', 1, 's52-23', 'root curtain', 'plant or dressing', A, [4, 6, 3], 'root curtain: behind a waterfall, mangrove, grotto', 'Hangs from a mossy branch: attach both ends.', 's52-11: roots muddier; s60-11, s60-23: the branch broke up'),
 ('HF1-P-11-a', 1, 's52-11', 'scaffold', 'step set piece', G, [2, 6], 'lashed pole scaffold: the village' + MT, 'Rope lashings at the joints read clearly.', 's52-23, s60-23: braces turned into rope; s60-11: the top rail doubled'),
 ('HF1-P-11-c', 1, 's60-23', 'palisade', 'plant or dressing', G, [2, 10], 'palisade: village wall, fortress' + MT, 'FLAG: still angled, not side view (Matt\'s composition kept at s52/s60). Sharpened stakes can read as danger.', 's52-11, s52-23, s60-11: a broken stake or stray block in the row'),
 ('HF1-P-11-d', 1, 's52-23', 'dock with water', 'walkable log or plank', G, [2, 6], 'dock over water: fills 2 docks' + MT, 'Plank deck on posts over a strip of painted water.', 's52-11, s60-11, s60-23: near twins; the s52-23 water ripples read best'),
 ('HF1-P-01-a', 2, 's52-23 + native pass + wrap', 'leaf-litter ground strip', 'ground strip', G, [1, 5, 3], 'leaf-litter forest floor: fills the W1 ground band', 'Tiles: square ends, wrap diff 0.9 (interior 0.4). Top is a soft soil edge: stand line by hand.', 's52-11, s60-11, s60-23: leaves larger and fewer, more seam work'),
 ('HF1-P-03-a', 2, 's52-11 + native pass + wrap', 'moss-root ground strip', 'ground strip', G, [1, 3, 6], 'moss-root ground: the W1 ground band', 'Tiles: wrap diff 1.5 (interior 0.7). Moss tufts on top: stand line by hand.', 's52-23, s60-11, s60-23: big fern leaves grew on the front face (they read as plants to stand behind, not soil)'),
 ('HF1-P-03-b', 2, 's52-23 + native pass + wrap', 'moss-root strip with leaf litter', 'ground strip', G, [1, 5, 3], 'moss-root strip with fallen leaves', 'Tiles: wrap diff 1.6 (interior 1.0). The leaf band on top is ragged: stand line by hand.', 's52-11, s60-11: leaf band thinner; s60-23: roots lost their shape'),
 ('HF1-P-04-c', 2, 's52-11 + native pass + wrap', 'long thin ground strip', 'ground strip', G, [1, 3, 6], 'thin root-soil strip', 'Tiles: wrap diff 2.5 (interior 1.9). A faint see-through ghost along the top edge where the two ends\' grass tops were blended (named).', 's52-23, s60-11, s60-23: near twins; s52-11 had the cleanest roots'),
 ('HF1-stump-short', 3, 's60-23', 'natural flat-top stump, short', 'block', G, [1, 6, 5], 'natural rotted stump, level moss top: a W1 flat top', 'Broken and rotted level, moss cushion, no saw rings or cut face.', 's68-11 (first pick): moss top too bumpy (39% flat); s60-11: 49% flat; s68-23: 44% flat'),
 ('HF1-stump-medium', 3, 's60-23', 'natural flat-top stump, medium', 'block', G, [1, 6, 5], 'natural rotted stump, level moss top', 'No saw rings; moss top. Its trunk is short against wide roots.', 's60-11, s68-11, s68-23: the moss cap is a lid-like slab'),
 ('HF1-stump-tall', 3, 's60-11', 'natural flat-top stump, tall', 'block', G, [1, 8, 6], 'tall natural snag rotted level, moss top, vines', 'No saw rings; vines and bromeliads on the trunk.', 's60-23, s68-23: moss drips like icing; s68-11: a hole punched through the trunk'),
 ('HF1-P-02-a', 4, 's62-23', 'grassy earth slab, side-on', 'block', G, [1, 2, 5], 'grassy earth slab', 'Side-on now (a thin top sliver shows). Stones in the soil.', 's62-11, s68-11: boulders bulge from the top; s68-23: front face blurred'),
 ('HF1-P-02-b', 4, 's68-23', 'gravel earth slab, side-on', 'block', G, [4, 2, 10], 'gravel slab: cliff path, riverbank, highlands', 'Side-on; gravel top.', 's62-11, s68-11: drippy soil face; s62-23: gravel top too thin'),
 ('HF1-P-02-c', 4, 's62-23', 'plank-topped earth slab, side-on', 'block', G, [2, 6], 'plank-topped slab: worked wood' + MT, 'Side-on; planks on top.', 's62-11, s68-11: green stains on the face; s68-23: planks tilted'),
 ('HF1-P-02-d', 4, 's62-23', 'pebbled earth slab, side-on', 'block', G, [2, 4], 'pebbled slab: riverbank first', 'Side-on; pebbles on top.', 's62-11, s68-11: lumpy face; s68-23: pebbles float above the top'),
]
STAND = {'ground strip', 'block', 'rock', 'walkable log or plank'}
rows = []
for pid, item, take, label, kind, flt, ws, why, notes, rej in ROWS:
    im = Image.open(f'{K}/{pid}.png'); al = np.asarray(im)[..., 3]
    r = dict(id=pid, item=item, take=take, label=label, kind=kind, w=im.width, h=im.height, walk_y='', walk_x0='', walk_x1='', flat='',
             world='; '.join(f'{n} {W[n]}' for n in ws), world_why=why, float_class=flt, notes=notes, rejected_takes=rej)
    if kind in STAND:
        y, x0, x1, _ = walk_top(al); op = al > 128; top = np.where(op.any(0), op.argmax(0), 99999)[x0:x1 + 1]
        f = round(float((np.abs(top - y) <= 3).mean()), 2); r['flat'] = f
        if f >= 0.5: r['walk_y'], r['walk_x0'], r['walk_x1'] = y, x0, x1
        else: r['walk_y'] = 'by hand'; r['notes'] += f' Flatness {int(f * 100)}% within 3 px: by hand.'
    rows.append(r)
os.makedirs(f'{O}/sheets', exist_ok=True)
with open(f'{O}/catalog.csv', 'w', newline='') as fh:
    w = csv.DictWriter(fh, list(rows[0])); w.writeheader(); [w.writerow(r) for r in rows]
font = ImageFont.load_default(size=20)
for item in (1, 2, 3, 4):
    it = [r for r in rows if r['item'] == item]; cell = 440; cols = min(4, len(it)); n = (len(it) + cols - 1) // cols
    M = Image.new('RGB', (cols * cell * 2 + 30, n * (cell + 50)), (20, 20, 20)); d = ImageDraw.Draw(M)
    for g, ground in enumerate([(44, 44, 50), (222, 228, 212)]):
        ox = g * (cols * cell + 30)
        for i, r in enumerate(it):
            x, y = ox + (i % cols) * cell, (i // cols) * (cell + 50)
            d.rectangle([x + 4, y, x + cell - 4, y + cell], fill=ground)
            im = Image.open(f"{K}/{r['id']}.png"); s = min((cell - 20) / im.width, (cell - 20) / im.height)
            t = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS); px, py = x + (cell - t.width) // 2, y + (cell - t.height) // 2
            M.paste(t, (px, py), t)
            if isinstance(r['walk_y'], int):
                d.line([px + r['walk_x0'] * s, py + r['walk_y'] * s, px + r['walk_x1'] * s, py + r['walk_y'] * s], fill=(0, 255, 255), width=3)
            d.text((x + 6, y + cell + 4), f"{r['id']} {r['w']}x{r['h']} {r['take']}"[:44], fill='white', font=font)
            d.text((x + 6, y + cell + 26), r['label'][:40], fill=(200, 200, 200), font=font)
    M.thumbnail((2800, 2800)); M.save(f'{O}/sheets/item{item}.jpg', quality=85)
print(len(rows), 'rows')
