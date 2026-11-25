"""ART-W3: pack World 3's first stages' pieces (3-1, 3-2) into ONE atlas, ready to drop into the build in the SAME commit as their first
draw sites (the art-use gate, src/game/artUse.test.ts, fails a packed frame no code draws, and its allow-list only shrinks: the lead's
ruling on ART-W3's catch-ahead). One atlas = one file on Matt's test link.
    python3 -I tools/art/hfw3/pack.py <out dir>            a dry pack: <out dir>/w3-grotto.webp + .json + the size report
    python3 -I tools/art/hfw3/pack.py --drop               writes src/assets/w1to4art/w3-grotto.webp + .json and src/game/w3GrottoArt.ts
Every piece is kept at its cut size (3 cut px a world px, the lips 2.2: about 3x their drawn size, sharp on a 3x phone). Frames are
named by the catalog id after '#': w3-next#rimS-s11 -> 'rimS-s11', w3-w3a#shelfL-s23 -> 'shelfL-s23'.
"""
import json, os, sys
from PIL import Image

PIECES = [  # (frame name, cut png): the HAVE list (ART-NEXT-c, reference/art/hfnext/cut/) + ART-W3's picks (reference/art/hfw3/cut/)
    ('rimS-s11', 'reference/art/hfnext/cut/rimS-s11.png'), ('rimS-s23', 'reference/art/hfnext/cut/rimS-s23.png'),
    ('rimShort-s11', 'reference/art/hfnext/cut/rimShort-s11.png'), ('rimLong-s11', 'reference/art/hfnext/cut/rimLong-s11.png'),
    ('shelfS-s37', 'reference/art/hfnext/cut/shelfS-s37.png'), ('mat-s23', 'reference/art/hfnext/cut/mat-s23.png'),
    ('sleepy-s23', 'reference/art/hfnext/cut/sleepy-s23.png'), ('sleepy-s37', 'reference/art/hfnext/cut/sleepy-s37.png'),
    ('lipA-s23', 'reference/art/hfnext/cut/lipA-s23.png'), ('lipB-s23', 'reference/art/hfnext/cut/lipB-s23.png'),
    ('lipA-s37', 'reference/art/hfnext/cut/lipA-s37.png'),
]
PICKS = 'reference/art/hfw3/cut/picks.json'
if os.path.exists(PICKS):
    for n, p in json.load(open(PICKS)).items():
        if p.get('pack', True):
            PIECES.append((n, os.path.join('reference/art/hfw3/cut', p['file'])))

MAXW, GAP = 4096, 4
ims = [(n, Image.open(f).convert('RGBA')) for n, f in PIECES]
ims.sort(key=lambda t: -t[1].height)
frames, x, y, rh = {}, 0, 0, 0
for n, im in ims:   # shelf packing, tallest first
    if x + im.width > MAXW: x, y, rh = 0, y + rh + GAP, 0
    frames[n] = dict(x=x, y=y, w=im.width, h=im.height); x += im.width + GAP; rh = max(rh, im.height)
H = y + rh
assert H <= 4096, f'atlas {MAXW}x{H}: over 4096 (artcheck)'
A = Image.new('RGBA', (MAXW, H), (0, 0, 0, 0))
for n, im in ims: A.alpha_composite(im, (frames[n]['x'], frames[n]['y']))
used = max(f['x'] + f['w'] for f in frames.values()); A = A.crop((0, 0, used, H))
drop = '--drop' in sys.argv
out = 'src/assets/w1to4art' if drop else sys.argv[1]
os.makedirs(out, exist_ok=True)
A.save(os.path.join(out, 'w3-grotto.webp'), quality=88, method=6)
json.dump(frames, open(os.path.join(out, 'w3-grotto.json'), 'w'), indent=1)
kb = os.path.getsize(os.path.join(out, 'w3-grotto.webp')) / 1024
print(f'w3-grotto.webp {A.width}x{A.height}, {len(frames)} frames, {kb:.0f} KB (limit 4096 KB, 4096 px)')
if drop:
    names = ' | '.join(f"'{n}'" for n in sorted(frames))
    open('src/game/w3GrottoArt.ts', 'w').write(f"""/**
 * World 3's grotto pieces for its first stages (3-1 Into the Grotto, 3-2 Glowworm Path): the shelves, lit rims, fungus mat, sleepy
 * shelves and floor lips (ART-NEXT-c) and the shaft wall, wall shelf, wide shelf, root curtains and roof root (ART-W3), one atlas
 * (src/assets/w1to4art/w3-grotto.webp, packed by tools/art/hfw3/pack.py; rows in reference/art/CATALOG-MASTER.csv, parts NEXT2 and W3A).
 * Every draw returns false until the sheet has loaded; nothing is ever drawn in its place. The w2NewArt.ts pattern.
 */
import {{ trackAtlas }} from './atlasLoader.ts';
import FRAMES from '../assets/w1to4art/w3-grotto.json';

export type W3GrottoPiece = {names};
const F: Record<string, {{ x: number; y: number; w: number; h: number }}> = FRAMES;
export const W3_GROTTO_URL = new URL('../assets/w1to4art/w3-grotto.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {{
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W3_GROTTO_URL, () => {{ ready = true; }}, () => {{ img = null; }}, () => {{ img = null; ready = false; }});
}}
/** whether the sheet has loaded (starts the load) */
export function w3GrottoReady(): boolean {{
  load();
  return ready && !!img;
}}
/** a piece's drawn height at width w (its picture's own shape) */
export const w3GrottoHeight = (n: W3GrottoPiece, w: number): number => (w * F[n].h) / F[n].w;
/** piece `n` with its box's bottom on `bottom`, its middle at cx, `w` wide (its own shape); `flip` mirrors it */
export function drawW3Grotto(ctx: CanvasRenderingContext2D, n: W3GrottoPiece, cx: number, bottom: number, w: number, flip = false): boolean {{
  if (!w3GrottoReady()) return false;
  const f = F[n];
  const h = w3GrottoHeight(n, w);
  if (!flip) {{
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, cx - w / 2, bottom - h, w, h);
    return true;
  }}
  ctx.save();
  ctx.translate(cx + w / 2, bottom - h);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
  return true;
}}
""")
    print('wrote src/game/w3GrottoArt.ts')
