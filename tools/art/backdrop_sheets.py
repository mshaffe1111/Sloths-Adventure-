"""backdrop_sheets: contact sheets of every painted backdrop for the art catalog (part B3, 2026-11-11).

For each strip set (src/assets/backdrops/<stem>-sky|far|mid|near.webp) it draws one row:
  1. the set composed the way scenery.ts drawStrip places it on a sideways phone (2400x1080 view, STRIP_FIT k/a/at, sky above the far
     strip with SKY_OVERLAP), so a seam, a bad join or a strip that floats shows the way Matt sees it;
  2. the same set composed for an upright phone (1080x2400, strips at the sideways scale, the painted sky filling the top);
  3. the middle and near cut-outs alone over flat mid-grey, so a halo or a fringe of key colour shows.
Specials (lairs, the Hollow, the council garden, Dot's flight) get one tile each.
  python3 tools/art/backdrop_sheets.py [out_dir]
"""
import glob, os, re, sys
from PIL import Image, ImageDraw

D = 'src/assets/backdrops'
OUT = sys.argv[1] if len(sys.argv) > 1 else 'reference/art/master-sheets'
H = 720
FIT = {'far': (1.2, 0.72, 0.6), 'mid': (1.0, 0.69, 0.58), 'near': (1.05, 0.72, 0.63)}
SKY_OVERLAP = 0.05
GROW = {7: {'near': 1.75}}
FAR_BY_STAGE_BORROW = True  # a far-only set borrows its world's mid/near where it has none (paintedBackdrops.ts urlFor)


def load(p):
    return Image.open(p).convert('RGBA') if os.path.exists(p) else None


def part(stem, p):
    own = load(f'{D}/{stem}-{p}.webp')
    if own is not None or p == 'sky' or p == 'far':
        return own, False
    w = re.match(r'w(\d+)', stem).group(1)
    return load(f'{D}/w{w}-{p}.webp'), True


def compose(stem, vw, vh, s, cam=0.0):
    view = Image.new('RGBA', (vw, vh), (120, 150, 190, 255))
    world = int(re.match(r'w(\d+)', stem).group(1))
    sky, _ = part(stem, 'sky')
    for p, par in (('far', 0.05), ('mid', 0.2), ('near', 0.42)):
        img, _ = part(stem, p)
        if img is None:
            continue
        k, a, at = FIT[p]
        ss = s * GROW.get(world, {}).get(p, 1)
        if p == 'far' and sky is None:  # farScale: grow until its top reaches the top of the view
            ss = max(ss, vh * at / (a * H * k))
        dh = H * ss * k
        top = vh * at - a * dh
        pitch = img.width * dh / img.height
        im = img.resize((max(1, round(pitch)), max(1, round(dh))), Image.LANCZOS)
        x = -((cam * par) % pitch)
        while x < vw:
            if p == 'far' and sky is not None and top > 0:
                sh = dh * sky.height / img.height
                sk = sky.resize((im.width, max(1, round(sh))), Image.LANCZOS)
                view.alpha_composite(sk, (round(x), round(top + dh * SKY_OVERLAP - sh))) if top + dh * SKY_OVERLAP - sh >= 0 else view.paste(sk, (round(x), round(top + dh * SKY_OVERLAP - sh)), sk)
            view.paste(im, (round(x), round(top)), im)
            x += pitch
    return view


def label(img, text):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 8 * len(text) + 10, 18), fill=(0, 0, 0, 200))
    d.text((5, 3), text, fill=(255, 255, 255, 255))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    stems = sorted({re.sub(r'-(far|mid|near|sky)\.webp$', '', os.path.basename(f)) for f in glob.glob(f'{D}/w*-*.webp')
                    if re.search(r'-(far|mid|near|sky)\.webp$', f)})
    by_world = {}
    for st in stems:
        by_world.setdefault(int(re.match(r'w(\d+)', st).group(1)), []).append(st)
    for w, sts in sorted(by_world.items()):
        rows = []
        for st in sts:
            far, _ = part(st, 'far')
            side = compose(st, 2400, 1080, 1080 / H, cam=900).resize((800, 360), Image.LANCZOS) if far else None
            up = compose(st, 1080, 2400, 1080 / H, cam=900).resize((162, 360), Image.LANCZOS) if far else None
            cut = Image.new('RGBA', (560, 360), (128, 128, 128, 255))
            y = 0
            for p in ('mid', 'near'):
                img, borrowed = part(st, p)
                if img is None:
                    continue
                t = img.resize((560, round(img.height * 560 / img.width)), Image.LANCZOS)
                t = t.crop((0, max(0, t.height - 180), 560, t.height))
                cut.paste(t, (0, y), t)
                label(cut.crop((0, y, 560, y + 18)), '')
                d = ImageDraw.Draw(cut)
                d.text((4, y + 2), f'{p}{" (borrowed)" if borrowed else ""}', fill=(255, 255, 0, 255))
                y += 180
            row = Image.new('RGBA', (800 + 162 + 560 + 20, 360), (20, 20, 20, 255))
            if side:
                row.paste(label(side, f'{st}  sideways 2400x1080'), (0, 0))
                row.paste(label(up, 'upright'), (810, 0))
            else:
                row.paste(label(Image.new('RGBA', (800, 360), (60, 60, 60, 255)), f'{st}  (no far strip: canopy/extra set)'), (0, 0))
            row.paste(cut, (982, 0))
            rows.append(row)
        sheet = Image.new('RGB', (rows[0].width, 362 * len(rows)), (0, 0, 0))
        for i, r in enumerate(rows):
            sheet.paste(r.convert('RGB'), (0, i * 362))
        sheet.save(f'{OUT}/B3-backdrop-w{w}.webp', quality=80)
        print(f'{OUT}/B3-backdrop-w{w}.webp', len(rows), 'sets')
    # specials
    sp = sorted(glob.glob(f'{D}/dot-*.webp') + [f'{D}/hollow.webp'] + glob.glob(f'{D}/w5arena-*.webp') + glob.glob('src/assets/lairs/*.webp'))
    tiles = []
    for f in sp:
        im = Image.open(f).convert('RGBA')
        bg = Image.new('RGBA', im.size, (128, 128, 128, 255))
        bg.alpha_composite(im)
        t = bg.resize((480, max(1, round(im.height * 480 / im.width))), Image.LANCZOS)
        tiles.append(label(t, os.path.basename(f)))
    cols = 3
    rh = max(t.height for t in tiles)
    sheet = Image.new('RGB', (cols * 484, ((len(tiles) + cols - 1) // cols) * (rh + 4)), (0, 0, 0))
    for i, t in enumerate(tiles):
        sheet.paste(t.convert('RGB'), ((i % cols) * 484, (i // cols) * (rh + 4)))
    sheet.save(f'{OUT}/B3-backdrop-special.webp', quality=82)
    print(f'{OUT}/B3-backdrop-special.webp', len(tiles), 'pictures')


if __name__ == '__main__':
    main()
