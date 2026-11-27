"""ART-REED-28: cut the picked reed-island take at Pokey's scale and write its row in reference/art/CATALOG-MASTER.csv, then
`python3 tools/art/catalog_master.py --emit` (the engine copy, src/game/art/inventory/w2.json).
    python3 -I tools/art/hfreed28/catalog.py <take.webp> <id suffix> [stand world px, default 340]
Scale: 2 cut px a world px (ship 2x: sharp at a phone's 2x). The walk line is measured from alpha: the first row, under the reeds, whose
solid run covers 55% of the piece's middle half; x0/x1 the ends of that row's solid run. Sizes against Pokey's DRAWN 89.1 px."""
import csv, io, os, subprocess, sys
import numpy as np
from PIL import Image
take, suf = sys.argv[1], sys.argv[2]
STAND = float(sys.argv[3]) if len(sys.argv) > 3 else 340.0
CPU, PU = 2.0, 89.1
D = 'reference/art/hfreed28/cut/'; os.makedirs(D, exist_ok=True)
png = f'/tmp/reed28-{suf}.png'; Image.open(take).convert('RGB').save(png)
tmp = f'/tmp/reed28-{suf}-k1.png'
subprocess.run(['python3', '-I', 'tools/art/hfnext/cut.py', png, tmp, '1'], check=True)
def walk(im):
    a = np.asarray(im.getchannel('A')) > 160; H, W = a.shape; m0, m1 = W // 4, 3 * W // 4
    for y in range(H):
        if a[y, m0:m1].mean() >= 0.55:
            xs = np.where(a[y])[0]; return y, int(xs.min()), int(xs.max())
im = Image.open(tmp); y, x0, x1 = walk(im)
k = (x1 - x0) / (STAND * CPU)                     # take px a cut px
out = im.resize((round(im.width / k), round(im.height / k)), Image.LANCZOS)
wy, wx0, wx1 = walk(out)
# the foot: the take's wet foot ends in a grey water gloss that reads as a pale slab on the river; fade it out from 45 to 85 world px
# under the top (the water stands 22-45 px under the top in 2-8; under that the engine's own water and banks show) and crop there
F0, F1 = wy + round(45 * CPU), wy + round(85 * CPU)
A = np.asarray(out.getchannel('A')).astype(np.float32)
for y in range(F0, out.height):
    A[y] *= max(0.0, 1 - (y - F0) / (F1 - F0))
out.putalpha(Image.fromarray(A.clip(0, 255).astype(np.uint8)))
out = out.crop((0, 0, out.width, min(out.height, F1)))
name = f'reed-isle-28{suf}'
out.save(D + name + '.png'); out.save(D + name + '.webp', quality=88, method=6)
assert max(out.size) <= 4096
P = 'reference/art/CATALOG-MASTER.csv'
rows = list(csv.reader(io.StringIO(open(P, newline='').read()))); h = rows[0]; ix = {c: i for i, c in enumerate(h)}
rid = f'w2-reed28#{name}'
rows = [r for r in rows if r[0] != rid]
r = list(next(r for r in rows if r[0] == 'w2-new#reed-isle-b'))
Wd, Hd = out.width / CPU, out.height / CPU
# the stand line's flatness: the alpha top along the walk span, its spread in world px
a = np.asarray(out.getchannel('A')) > 160
tops = [int(np.argmax(a[:, x])) for x in range(wx0 + 10, wx1 - 10, 4) if a[:, x].any()]
mid = [t for t in tops if abs(t - wy) < 60]
v = dict(id=rid, source='2-8 reed island (ART-REED-28 2026-11-26, HF Qwen-Image-Edit-2511 img2img from World 2\'s own painted bank and reeds, tools/art/hfreed28; cut tools/art/hfreed28/catalog.py)',
  file=f'origin/t-art-28:{D}{name}.webp', kind='reed island (2-8 the cage beat: a level grassy top, reeds at both ends, wet mud sides into the marsh water)',
  w=out.width, h=out.height, walk_y=wy, walk_x0=wx0, walk_x1=wx1, flat=f'{(np.percentile(mid, 90) - np.percentile(mid, 10)) / CPU:.1f} world px (10-90% spread of the top)',
  float_class='grounded (stands in the water: its mud foot under the surface)', world_best=2,
  worlds='USED none | COULD 2 Sunlit Riverbank: the marsh island a cage stands on (2-8 low road; reeds and wet mud, the banks\' own paint); 6 Deep Mangrove: a swamp hummock (~grey-wet)',
  no_fit=r[ix['no_fit']], made_thing='n', engine_slot='new slot: World 2 reed island (2-8 low road, the cage beat: the island solid\'s top = walk_y)',
  footing=f'the grass top: walk line y {wy} from x {wx0} to {wx1} (cut px; {wy / CPU:.0f} world px under the top of the box); the reeds above it are behind him',
  layer='platform', on_screen_px=f'{Wd:.0f}x{Hd:.0f} (world px: {CPU:g} cut px a unit; stand line {(wx1 - wx0) / CPU:.0f} = {(wx1 - wx0) / CPU / PU:.1f} Pokey)',
  ship_px=out.height, file_kb=f'{os.path.getsize(D + name + ".png") / 1024:.1f}', file_kb_ship=f'{os.path.getsize(D + name + ".webp") / 1024:.1f}',
  draw_cost='one drawImage of a cut webp (pack into the World 2 props atlas when wired)', used_in='none (not placed)',
  status='cut, not placed (ART-REED-28): BUILD-28 wires it', notes='Take isleC-s23 (ART-REED-28, the lead approved the spec). BUILD-28 lays it on 2-8\'s reed-island solid (beat 4, the cage beat): the solid\'s top = walk_y; the reeds above the line stand behind him; the wet foot fades out 45-85 world px under the top (the flood water shows through it at any level).', part='REED28',
  pokey_scale=f'{(wx1 - wx0) / CPU / PU:.2f}', scale_ok='y', scale_basis='drawn (stand line against Pokey 89.1)')
for c, val in v.items(): r[ix[c]] = str(val)
at = max(i for i, q in enumerate(rows) if q[0].startswith('w2-new#')) + 1
rows.insert(at, r)
buf = io.StringIO(); csv.writer(buf, lineterminator='\n').writerows(rows); open(P, 'w', newline='').write(buf.getvalue())
print(rid, out.size, 'walk', wy, wx0, wx1, 'stand', (wx1 - wx0) / CPU, 'world px; above-top reeds', wy / CPU, 'world px; body under the top', (out.height - wy) / CPU)
