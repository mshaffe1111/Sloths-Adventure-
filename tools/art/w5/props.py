"""Cut World 5's prop sheets (Orchid Sanctuary concept art, Hugging Face mshaffe111/slothadv-w5art, approved by Matt 2026-10-26) into
one atlas, and write its frame table.

    python3 -I tools/art/w5/props.py <w5art dir> [--blobs]

<w5art dir>/props holds the seven sheets in two takes each (w5p-<sheet>-<11|33>.png, 1536x1024, already cut out on transparency).
A piece is a blob of a sheet, found the way the review numbered them (alpha over 40, grown 6 px, then labelled in reading order:
--blobs writes a labelled preview of each sheet to pick from). Some pieces need more than the blob:
  keep   only the biggest solid part (a teapot without its painted steam: the game draws the steam)
  clip   only this box of the blob (x0, y0, x1, y1 in sheet pixels; a box with a None side runs to the blob's edge), or `drop` to
         leave a box out (the hanging orchid row without the bell flower that hangs off the branch's end)
  blank  boxes where Meeca's letters are scratched into the bark: the dark strokes are filled from the bark around them, so the
         game can draw the words itself, crisp (HANDOFF: "the words are drawn by the game")
Writes src/assets/props/w5-props.webp (at half size, like World 4's) and src/game/w5PropsData.ts."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

SRC = Path(sys.argv[1]) / 'props'
ROOT = Path(__file__).resolve().parents[3]
SCALE = 0.5
W = 2048
PAD = 4

# name: (sheet, blob, options)
PIECES = {
    # the table set for two with its card, and the soft chairs that tug (tea)
    'teaTable': ('tea-33', 2, {}),
    'teaTableNapkin': ('tea-11', 2, {}),
    'armchairRose': ('tea-11', 0, {}),
    'armchairLilac': ('tea-11', 1, {}),
    'armchairRose2': ('tea-33', 0, {}),
    'armchairLilac2': ('tea-33', 1, {}),
    'teapot': ('tea-11', 3, {'keep': True}),
    'teapot2': ('tea-33', 3, {'keep': True}),
    'teacup': ('tea-11', 5, {}),
    'teacup2': ('tea-33', 5, {}),
    'cakeTier': ('tea-11', 4, {}),
    'cakeTier2': ('tea-33', 4, {}),
    # tiny cakes (DON'T EAT)
    'cakePlate': ('cakes-11', 2, {}),
    'cakePlate2': ('cakes-33', 2, {}),
    'cupcake': ('cakes-11', 0, {}),
    'cupcake2': ('cakes-33', 1, {}),
    'cakeSponge': ('cakes-11', 1, {}),
    'cakeCherry': ('cakes-33', 4, {}),
    # Meeca's trunks, bark left blank for the game's own lettering; ferns, sprouts and roots
    'trunkTall': ('carved-11', 0, {'blank': [(170, 350, 440, 800)]}),
    'trunkShort': ('carved-11', 1, {'blank': [(722, 205, 875, 432)]}),
    'trunkA': ('carved-33', 0, {'blank': [(292, 245, 468, 445), (292, 440, 408, 515)]}),
    'trunkB': ('carved-33', 1, {'blank': [(660, 252, 855, 408)]}),
    'trunkC': ('carved-33', 2, {'blank': [(1080, 300, 1215, 400)]}),
    'fernStump': ('carved-11', 2, {'blank': [(1212, 150, 1295, 248)]}),
    'fern': ('carved-33', 4, {}),
    'orchidSprout': ('carved-11', 3, {}),
    'orchidSprout2': ('carved-33', 3, {}),
    'mossRoot': ('carved-11', 4, {}),
    'mossRoot2': ('carved-33', 5, {}),
    # the closing orchids (platforms that open and shut), a pink one, the hanging rows and the pink bell
    'orchidOpen': ('orchids2-11', 0, {}),
    'orchidHalf': ('orchids2-11', 1, {}),
    'orchidClosed': ('orchids2-11', 2, {}),
    'orchidOpen2': ('orchids2-33', 0, {}),
    'orchidHalf2': ('orchids2-33', 2, {}),
    'orchidBack': ('orchids2-33', 1, {}),
    'orchidPink': ('orchids2-11', 4, {}),
    'orchidPink2': ('orchids2-33', 4, {}),
    'orchidRow': ('orchids2-11', 3, {'drop': (1165, 640, None, None)}),
    'orchidRow2': ('orchids2-33', 3, {'drop': (1240, 600, None, None)}),
    'bell': ('orchids2-11', 3, {'clip': (1165, 640, None, None), 'drop': (1165, 640, 1272, 705), 'keep': True}),
    'bell2': ('orchids2-33', 3, {'clip': (1240, 600, None, None), 'keep': True}),
    # silk: a thread, a thread strung between two forks with dewy strands, a bridge, a sheet on a twig, and lace doilies (platforms)
    'silkThread': ('silk-33', 1, {}),
    'silkSpan': ('silk-11', 0, {}),
    'silkBridge': ('silk-33', 2, {}),
    'silkSheet': ('silk-33', 0, {}),
    'doily': ('silk-11', 1, {}),
    'doilyStool': ('silk-11', 2, {}),
    'doilyLong': ('silk-33', 3, {}),
    # the visitors who sat: wrapped chairs, a wrapped cup, a lump; cocoons wrapped and torn
    'wrappedArmchair': ('wrapped2-11', 1, {}),
    'wrappedArmchair2': ('wrapped2-33', 1, {}),
    'wrappedChair': ('wrapped2-11', 2, {}),
    'wrappedChair2': ('wrapped2-33', 2, {}),
    'wrappedStool': ('wrapped2-11', 3, {}),
    'wrappedCup': ('wrapped2-11', 4, {}),
    'wrappedCup2': ('wrapped2-33', 5, {}),
    'silkLump': ('wrapped2-11', 5, {}),
    'cocoonHanging': ('wrapped2-33', 0, {}),
    'cocoonHangingTorn': ('wrapped2-11', 0, {}),
    'cocoonWrapped': ('wrapped2-33', 3, {}),
    'cocoonTorn': ('wrapped2-33', 4, {}),
    # the exit totem (lit, and dark), the stone arch, the lace pennant checkpoint, the stone lantern
    'totem': ('shrine-11', 0, {}),
    'totem2': ('shrine-33', 0, {}),
    'totemDark': ('shrine-11', 1, {}),
    'arch': ('shrine-11', 2, {}),
    'arch2': ('shrine-33', 2, {}),
    'flag': ('shrine-11', 3, {}),
    'flag2': ('shrine-33', 3, {}),
    'lantern': ('shrine-11', 4, {}),
    'lantern2': ('shrine-33', 4, {}),
}
# small copies drawn at pickup size (a 2048 px sheet scaled down five times in one draw shimmers): name: (piece, height in px)
ICONS = {'cakeIcon': ('cupcake', 64), 'cakeIcon2': ('cupcake2', 64), 'orchidIcon': ('orchidPink', 64)}


def blobs(a):
    m = a[..., 3] > 40
    lab, _ = ndimage.label(ndimage.binary_dilation(m, iterations=6))
    objs = ndimage.find_objects(lab)
    keep = [i for i, o in enumerate(objs) if (o[0].stop - o[0].start) * (o[1].stop - o[1].start) >= 900]
    return lab, objs, keep


def box_mask(shape, b):
    x0, y0, x1, y1 = b
    m = np.zeros(shape, bool)
    m[y0 or 0:y1 or shape[0], x0 or 0:x1 or shape[1]] = True
    return m


def blank(rgba, box, solid):
    """fill Meeca's letter strokes inside `box` from the bark around them: the strokes (dark, with their carved rims) are filled by
    repeated averaging from the bark at their edges, then given back the bark's grain, which runs up the trunk: each column gets the
    grain of the same column above and below the letters"""
    x0, y0, x1, y1 = box
    P = 40
    cy0, cx0 = max(0, y0 - P), max(0, x0 - P)
    cy1, cx1 = min(rgba.shape[0], y1 + P), min(rgba.shape[1], x1 + P)
    sub = rgba[cy0:cy1, cx0:cx1]
    sol = solid[cy0:cy1, cx0:cx1]
    rgb = sub[..., :3].astype(np.float32)
    luma = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    inner = ndimage.binary_erosion(sol, iterations=10)
    m = box_mask(luma.shape, (x0 - cx0, y0 - cy0, x1 - cx0, y1 - cy0)) & inner & (luma < 80)
    m = ndimage.binary_dilation(m, iterations=7) & inner
    if not m.any():
        return rgba
    known = ~m & sol
    fill = rgb.copy()
    fill[m] = rgb[known].mean(0)
    for _ in range(600):
        acc = np.zeros_like(fill)
        n = np.zeros(fill.shape[:2], np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            acc += np.roll(fill, (dy, dx), (0, 1)) * np.roll(sol, (dy, dx), (0, 1))[..., None]
            n += np.roll(sol, (dy, dx), (0, 1))
        fill = np.where(m[..., None], acc / np.maximum(n, 1)[..., None], fill)
    # the grain: how each column of clean bark differs from its neighbours across, averaged down the column
    blur = ndimage.uniform_filter(rgb, size=(1, 7, 1))
    det = (rgb - blur) * known[..., None]
    cnt = known.sum(0)
    col = det.sum(0) / np.maximum(cnt, 1)[:, None]
    fill = np.where(m[..., None], fill + col[None] * 0.9, fill)
    out = rgba.copy()
    out[cy0:cy1, cx0:cx1, :3] = np.clip(fill, 0, 255).astype(np.uint8)
    return out


_BLOBS = {}


def cut(name, sheet, blob, opt, sheets):
    a = sheets[sheet]
    if sheet not in _BLOBS:
        _BLOBS[sheet] = blobs(a)
    lab, objs, _ = _BLOBS[sheet]
    m = (lab == blob + 1) & (a[..., 3] > 0)
    if 'clip' in opt:
        m &= box_mask(m.shape, opt['clip'])
    if 'drop' in opt:
        m &= ~box_mask(m.shape, opt['drop'])
    if opt.get('keep'):
        sl, n = ndimage.label(a[..., 3] > 40)
        sl = np.where(m, sl, 0)
        sizes = np.bincount(sl.ravel())
        sizes[0] = 0
        body = ndimage.binary_dilation(sl == sizes.argmax(), iterations=3)
        m &= body
    px = a.copy()
    px[..., 3] = np.where(m, px[..., 3], 0)
    solid = m & (a[..., 3] > 200)
    for b in opt.get('blank', []):
        px = blank(px, b, solid)
    ys, xs = np.nonzero(px[..., 3] > 8)
    piece = px[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return Image.fromarray(piece, 'RGBA')


def main():
    sheets = {p.stem[4:]: np.asarray(Image.open(p).convert('RGBA')) for p in sorted(SRC.glob('w5p-*.png'))}
    if '--blobs' in sys.argv:
        out = ROOT / 'tools/art/w5/blobs'
        out.mkdir(exist_ok=True)
        for s, a in sheets.items():
            lab, objs, keep = blobs(a)
            im = Image.new('RGBA', a.shape[1::-1], (120, 120, 120, 255))
            im.alpha_composite(Image.fromarray(a, 'RGBA'))
            d = ImageDraw.Draw(im)
            for i in keep:
                o = objs[i]
                d.rectangle([o[1].start, o[0].start, o[1].stop, o[0].stop], outline=(255, 0, 0, 255), width=3)
                d.text((o[1].start + 6, o[0].start + 6), str(i), fill=(255, 255, 0, 255))
            im.convert('RGB').save(out / f'{s}.jpg', quality=85)
        return
    pieces = []
    full = {}
    only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else None
    for n, (sheet, blob, opt) in PIECES.items():
        if only and n not in only:
            continue
        im = cut(n, sheet, blob, opt, sheets)
        full[n] = im
        if '--dump' in sys.argv:
            im.save(Path(sys.argv[sys.argv.index('--dump') + 1]) / f'{n}.png')
        pieces.append((n, im.resize((max(1, round(im.width * SCALE)), max(1, round(im.height * SCALE))), Image.LANCZOS)))
    if only:
        return
    for n, (src, h) in ICONS.items():
        im = full[src]
        pieces.append((n, im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS)))
    # skyline packing, tallest first: each piece goes where its top would sit lowest (decoded, every row of the sheet is 8 KB)
    def pack(order):
        fr = {}
        sky = np.zeros(W, int)
        for n, im in order:
            w, h = im.width + PAD, im.height + PAD
            best = None
            for x in range(0, W - im.width + 1, 4):
                y = sky[x:x + w].max()
                if best is None or y < best[1]:
                    best = (x, y)
            x, y = best
            fr[n] = (x, y, im.width, im.height)
            sky[x:x + w] = y + h
        return fr
    # (whichever order packs shortest: tallest, widest or biggest first)
    orders = [sorted(pieces, key=k) for k in (lambda t: (-t[1].height, -t[1].width), lambda t: (-t[1].width, -t[1].height),
                                              lambda t: -t[1].width * t[1].height)]
    frames = min((pack(o) for o in orders), key=lambda fr: max(f[1] + f[3] for f in fr.values()))
    atlas = Image.new('RGBA', (W, max(f[1] + f[3] for f in frames.values())), (0, 0, 0, 0))
    for n, im in pieces:
        fx, fy, _, _ = frames[n]
        atlas.paste(im, (fx, fy))
    a = np.asarray(atlas).copy()
    a[a[..., 3] == 0, :3] = 0
    atlas = Image.fromarray(a, 'RGBA')
    out = ROOT / 'src/assets/props/w5-props.webp'
    atlas.save(out, 'WEBP', quality=86, method=6)
    print('atlas', atlas.size, out.stat().st_size, 'bytes')
    (ROOT / 'src/game/w5PropsData.ts').write_text(table(frames))


HEAD = '''// generated by tools/art/w5/props.py from World 5's prop sheets (Orchid Sanctuary concept art, Hugging Face, approved 2026-10-26):
// where each piece sits in src/assets/props/w5-props.webp. Do not edit by hand. Draw them with w5Art.ts (drawW5); a "2" is the second take.
//   tea table      teaTable (for two: two cups and the card; the card's words are the game's), teaTableNapkin (one cup, the napkin)
//   soft chairs    armchairRose, armchairLilac (+2): the chairs that tug him toward them as he passes (DON'T SIT)
//   tea            teapot, teapot2 (no steam: the game draws its sleepy puffs), teacup, teacup2
//   cakes          cupcake, cupcake2, cakeSponge, cakeCherry, cakePlate (+2), cakeTier (+2); cakeIcon, cakeIcon2: 64 px tall, for pickups
//   Meeca's trunks trunkTall, trunkShort, trunkA, trunkB, trunkC, fernStump: blank bark, the game scratches the words on
//   plants         fern (the find's fern clump), orchidSprout (+2), mossRoot (+2)
//   orchids        orchidOpen, orchidHalf, orchidClosed (the closing-orchid platform's three states), orchidOpen2, orchidHalf2,
//                  orchidBack, orchidPink (+2), orchidIcon (64 px); orchidRow (+2): a mossy branch with a hanging row of blooms
//   bell           bell, bell2: the pink bell flower ("in plain sight, look for a pink bell")
//   silk           silkThread (a dewy thread), silkSpan (a thread strung between two forks, strands hanging), silkBridge, silkSheet
//   doilies        doily (flat, round), doilyStool (on a wooden disc), doilyLong (a long lace ledge)
//   visitors       wrappedArmchair (+2), wrappedChair (+2), wrappedStool, wrappedCup (+2), silkLump
//   cocoons        cocoonHanging, cocoonHangingTorn, cocoonWrapped (lying), cocoonTorn (lying, burst open)
//   exit           totem, totem2 (the exit totem, lit), totemDark (shut), arch, arch2, lantern, lantern2
//   checkpoint     flag, flag2 (the lace pennant)
//
// The helpers (w5Art.ts): drawW5 (a piece by its bottom middle), drawW5Box (stretched to a box: a silk span, a doily ledge),
// drawW5Orchid (the closing orchid at any openness), steamPuff (the teapot's sleepy steam), drawCarving and drawScratch (Meeca's
// letters), drawW5Arena (the council's garden behind 5-10 and the tea). Which backdrop each stage plays in: w5Backdrop.ts.
'''


def table(frames):
    lines = [HEAD.rstrip('\n'), 'export interface W5Frame { x: number; y: number; w: number; h: number }', 'export const W5_FRAMES = {']
    for n in sorted(frames):
        fx, fy, fw, fh = frames[n]
        lines.append(f'  {n}: {{ x: {fx}, y: {fy}, w: {fw}, h: {fh} }},')
    lines.append('} satisfies Record<string, W5Frame>;')
    return '\n'.join(lines) + '\n'


main()
