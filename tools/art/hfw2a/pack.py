"""ART-W2A: pack 2-3's painted follow poses into the sheets the game already loads.
  ONE new band at the foot of src/assets/props/w2-props.webp (W2_FRAMES), saved once (one re-encode of Matt's pieces):
  - the little ones' waddle (A, B) frames, feet on the band's foot, then the paddle poses stacked two high; each colour-matched to its
    Happy pose (per-channel gain over the fur, outline excluded) and kept at the Happy pose's scale (cut.py K);
  - the looking heron (w2HeronLook: a 2-3 ACTOR pose, not set dressing: every dressing-sheet piece must be in a dressing set,
    artDress.test.ts), scaled so its post matches w2Heron's post (dressnew-w2) and framed so the post sits exactly where w2Heron's does
    (same foot middle, same bottom), then packed at HERON_PACK of that size (still over its on-screen size: the band stays low).
    followArt draws it HERON_LOOK_W units wide (printed here), i.e. at w2Heron's px a unit. Run it ONCE from the committed sheet.
    python3 -I tools/art/hfw2a/pack.py <cut dir> <picks.json>
picks.json: {"duckWalkA": "duck-walkA-s11", ..., "w2HeronLook": "heron-look-s11"} (cut dir holds <name>.webp from cut.py)
"""
import json, re, sys
from PIL import ImageFilter
import numpy as np
from PIL import Image

cut_dir, picks = sys.argv[1], json.load(open(sys.argv[2]))
P = 'src/assets/props/'
DATA = 'src/game/w2PropsData.ts'
GAP = 4
Q = 88  # one re-encode of the sheet: Matt's pieces measured 40.3 dB (w2-props) and 39.7 dB (dressnew-w2), max 22 levels
POST_PAD = 22  # w2Heron's pixels from this far under the post's top edge down (the post's body, rope and water): the look keeps its own toes and post top
HERON_PACK = 0.72  # the look frame packed at this share of w2Heron's px (242 px wide: on screen it is ~193-237 px at 3x)
CATTAIL_X = 0.37  # share of w2Heron's width the cattails stand in (the legs start past it)

def frames_ts():
    s = open(DATA).read()
    return s, {m[0]: tuple(map(int, m[1:])) for m in re.findall(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', s)}

def fur_mean(a):
    rgb, al = a[..., :3].astype(float), a[..., 3]
    lum = rgb @ [0.299, 0.587, 0.114]
    m = (al > 200) & (lum > 70)
    return rgb[m].mean(axis=0)

def match(im, ref, g=None):
    a = np.asarray(im.convert('RGBA')).copy()
    if g is None:
        g = fur_mean(np.asarray(ref.convert('RGBA'))) / fur_mean(a)
    a[..., :3] = np.clip(a[..., :3].astype(float) * g, 0, 255).astype(np.uint8)
    return Image.fromarray(a, 'RGBA'), g

# --- the pieces
sheet = Image.open(P + 'w2-props.webp').convert('RGBA')
src, F = frames_ts()
WALKS = [k for k in ('duckWalkA', 'duckWalkB', 'otterWalkA', 'otterWalkB', 'capyWalkA', 'capyWalkB') if k in picks]
PADS = [k for k in ('duckPaddle', 'otterPaddle', 'capyPaddle') if k in picks]
ims, gains = {}, {}
for k in WALKS + PADS:
    kind = re.match(r'[a-z]+', k)[0]
    hx, hy, hw, hh = F[kind + 'Happy']
    # (a paddle pose shows a different share of fur and chest than the upright Happy pose, so a mean match on it is skewed: it takes
    # its kind's walk-A gain, the same model's colour bias on the same animal)
    ims[k], g = match(Image.open(f'{cut_dir}/{picks[k]}.webp'), sheet.crop((hx, hy, hx + hw, hy + hh)),
                      gains.get(kind + 'WalkA') if k.endswith('Paddle') else None)
    gains[k] = g
    print(k, picks[k], ims[k].size, 'gain', np.round(g, 3))

if 'w2HeronLook' in picks:
    DN = 'src/game/dressNewData.ts'
    dn = open(DN).read()
    m = re.search(r'"w2Heron": \{\s*"x": (\d+),\s*"y": (\d+),\s*"w": (\d+),\s*"h": (\d+),\s*"units": ([\d.]+)', dn)
    hx, hy, hw, hh, hu = int(m[1]), int(m[2]), int(m[3]), int(m[4]), float(m[5])
    ds = Image.open(P + 'dressnew-w2.webp').convert('RGBA')
    plain = np.asarray(ds.crop((hx, hy, hx + hw, hy + hh)))[..., 3] > 128
    look = Image.open(f'{cut_dir}/{picks["w2HeronLook"]}.webp').convert('RGBA')

    def post(a, f=0.94):  # the post's run at 94% of the height: its left and right edge
        xs = np.nonzero(a[int(a.shape[0] * f)])[0]
        runs = np.split(xs, np.nonzero(np.diff(xs) > 3)[0] + 1)
        r = max(runs, key=len)
        return r.min(), r.max()
    pl, pr = post(plain)
    la = np.asarray(look)[..., 3] > 128
    ll, lr = post(la)
    k = (pr - pl) / (lr - ll)
    look = look.resize((round(look.width * k), round(look.height * k)), Image.LANCZOS)
    la = np.asarray(look)[..., 3] > 128
    ll, lr = post(la)
    # (the look's post right edge onto the plain's, bottoms level; frame it about the plain's foot middle so drawDress puts the post
    # where it was)
    dx = pr - lr  # look x in plain coords = its own x + dx
    mid = hw / 2
    left = min(0, dx); right = max(hw, dx + look.width)
    half = max(mid - left, right - mid)
    fw = int(np.ceil(2 * half)); fh = max(hh, look.height)
    fr = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    fr.alpha_composite(look, (int(round(dx + half - mid)), fh - look.height))
    # (only the bird moves: from just over the post's top edge down, and in the cattails' corner, the frame is w2Heron's own pixels, so
    # the post and the cattails never shift when it looks up; the look's feet (tan, inside its legs' box) are laid back over the wood;
    # then any speck left apart from the piece is dropped)
    from scipy import ndimage as nd
    pa = np.asarray(ds.crop((hx, hy, hx + hw, hy + hh)).convert('RGBA')).astype(float)
    rows = [y for y in range(hh // 2, hh) if (plain[y, pl:pr + 1].sum() > 0.6 * (pr - pl))]
    post_top = rows[0]
    ox, oy = int(round(half - mid)), fh - hh  # plain's (0, 0) in the frame
    fa = np.asarray(fr).astype(float)
    la_ = fa[oy:oy + hh, ox:ox + hw].copy()
    yy, xx = np.mgrid[0:hh, 0:hw]

    # (the cattails' corner stops at the post's left edge at its top, so no post top is taken from two paintings)
    cx = min(CATTAIL_X * hw, np.nonzero(plain[post_top + 4])[0][np.nonzero(plain[post_top + 4])[0] > hw * 0.15].min() - 2)
    keep = (yy > post_top + POST_PAD) | ((yy > hh * 0.5) & (xx < cx))
    km = np.asarray(Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.0))).astype(float)[..., None] / 255
    res = la_ * (1 - km) + pa * km
    fa[oy:oy + hh, ox:ox + hw] = res
    al2 = fa[..., 3] > 20
    lab, n = nd.label(al2)
    sizes = nd.sum(al2, lab, range(1, n + 1))
    small = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s < 0.004 * al2.sum()])
    fa[small] = 0
    fr = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8), 'RGBA')
    print('specks dropped', int(small.sum()))
    print('post top', post_top, 'of', hh)
    fr = fr.resize((round(fw * HERON_PACK), round(fh * HERON_PACK)), Image.LANCZOS)
    ims['w2HeronLook'] = fr
    print('heron look frame', (fw, fh), 'post scale', round(k, 3), 'packed', fr.size, 'HERON_LOOK_W', round(hu * fw / hw, 2))

# --- one band: walks (feet on the band's foot), the heron (foot on it too), the paddles stacked in columns of two
cols = [PADS[i:i + 2] for i in range(0, len(PADS), 2)]
band = max([ims[k].height for k in WALKS] + ([ims['w2HeronLook'].height] if 'w2HeronLook' in ims else [])
           + [sum(ims[k].height for k in c) + GAP * (len(c) - 1) for c in cols] or [0])
y0 = sheet.height + GAP
out = Image.new('RGBA', (sheet.width, y0 + band), (0, 0, 0, 0))
out.alpha_composite(sheet, (0, 0))
x, new = 0, {}
def put(k, x, y):
    out.alpha_composite(ims[k], (x, y)); new[k] = (x, y, ims[k].width, ims[k].height)
for k in WALKS + (['w2HeronLook'] if 'w2HeronLook' in ims else []):
    put(k, x, y0 + band - ims[k].height); x += ims[k].width + GAP
for c in cols:
    y = y0
    for k in c:
        put(k, x, y); y += ims[k].height + GAP
    x += max(ims[k].width for k in c) + GAP
assert x - GAP <= sheet.width, f'band {x - GAP} px wider than the sheet {sheet.width}'
assert out.height <= 4096
F2 = {**{k: v for k, v in F.items() if k not in new}, **new}
body = '\n'.join(f'  {k}: {{ x: {v[0]}, y: {v[1]}, w: {v[2]}, h: {v[3]} }},' for k, v in sorted(F2.items()))
open(DATA, 'w').write(re.sub(r'(export const W2_FRAMES = \{\n)(.*?)(\n\} as const)', lambda m: m[1] + body + m[3], src, flags=re.S))
out.save(P + 'w2-props.webp', 'WEBP', quality=Q, method=6)
print('w2-props', out.size, 'band used', x - GAP, 'px wide')
