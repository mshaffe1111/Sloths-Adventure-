"""Cut the picked hf-props takes into pieces, clean their edges, pack one small dressing sheet per world, and write the frame table.

    python3 tools/art/hfprops/cut.py <takes dir>

picks.json: {"<world>": {"<piece>": {"take": "<take name>", "units": <width in game units>, "hang"?: true}}}. Each take is one piece
on flat key colour (make_single.py); the cut is w1to4/cut.py's (key un-mixed from the edges, largest blob kept, then the fixed edge pass
tools/art/edges/defringe.py). Pieces are scaled to 4 atlas px per game unit (sharp at 2x on a phone at the game's zoom), packed into
src/assets/props/dressnew-w<N>.webp, and listed in src/game/dressNewData.ts (generated: units, hang, sheet). Review sheets:
reference/prop-sheets/qa-notes/hf-props/w<N>-pieces.jpg.
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(ROOT / 'tools/art/w1to4'))
from cut import edge_clean, keep_blobs, pack  # noqa: E402
import numpy as np  # noqa: E402
from scipy import ndimage  # noqa: E402


def key_own(img, solo=False):
    """the take's own background: the model drifts off the asked-for key (a darker pink, a soft vignette), so the key is measured
    from the picture: a smooth background map from the border ring (row and column medians blended), alpha from each pixel's colour
    distance to it, the background un-mixed from the edge pixels, only what is not connected to the border by background kept"""
    a = np.asarray(img.convert('RGB')).astype(np.float32)
    H, W, _ = a.shape
    ring = np.concatenate([a[:12].reshape(-1, 3), a[-12:].reshape(-1, 3), a[:, :12].reshape(-1, 3), a[:, -12:].reshape(-1, 3)])
    bg0 = np.median(ring, 0)
    # (the vignette: the background darkens toward the corners; a heavily smoothed copy where the picture is near the key stands in)
    near = np.linalg.norm(a - bg0, axis=-1) < 70
    # (worked at 1/8 size, then scaled back: the background varies slowly)
    sm = lambda x: np.asarray(Image.fromarray(ndimage.gaussian_filter(
        np.asarray(Image.fromarray(x).resize((max(1, W // 8), max(1, H // 8)), Image.BILINEAR)), 5)).resize((W, H), Image.BILINEAR))
    w = sm(near.astype(np.float32))
    bgm = np.dstack([sm(np.where(near, a[..., c], 0).astype(np.float32)) for c in range(3)]) / np.maximum(w[..., None], 1e-3)
    bgm = np.where(w[..., None] > 0.02, bgm, bg0)
    d = np.linalg.norm(a - bgm, axis=-1)
    alpha = np.clip((d - 34) / 80, 0, 1)
    if bg0[1] < bg0[0] and bg0[1] < bg0[2]:
        # (a magenta key: light beams, glows and moons the model painted in the key's own hue are background too; no piece on a
        # magenta-key world is painted magenta or pink, World 5's pink pieces are on green)
        # by hue: within ~22 degrees of the key's own hue and not grey (a purple mushroom or bellflower, ~60 degrees off, stays)
        def hue(x):
            r, g, b = x[..., 0] / 255, x[..., 1] / 255, x[..., 2] / 255
            mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
            d = np.maximum(mx - mn, 1e-6)
            h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
            return h, (mx - mn) / np.maximum(mx, 1e-6)
        h, sat = hue(a)
        hk, _ = hue(bg0[None, None, :])
        dh = np.abs((h - hk[0, 0] + 180) % 360 - 180)
        keyish = np.clip(1 - (22 - dh) / 10, 0, 1)  # 0 within 12 degrees, 1 beyond 22
        keyish = np.maximum(keyish, np.clip((0.16 - sat) / 0.06, 0, 1))  # near-grey: left to the distance key
        alpha = np.minimum(alpha, keyish)
    al = alpha[..., None]
    paint = np.where(al > 0.02, (a - (1 - al) * bgm) / np.maximum(al, 0.02), 0)
    rgb = np.where(al < 0.999, paint, a).clip(0, 255)
    al8 = keep_blobs(alpha * 255)
    if solo:  # (only the biggest blob: a stray scrap of light beam or mist beside the piece)
        lab, n = ndimage.label(al8 > 40)
        if n > 1:
            sizes = ndimage.sum(np.ones_like(al8), lab, range(1, n + 1))
            al8 = np.where(ndimage.binary_dilation(lab == 1 + int(np.argmax(sizes)), iterations=3), al8, 0)
    im = Image.fromarray(np.dstack([rgb, al8]).astype(np.uint8), 'RGBA')
    return im.crop(im.getbbox()) if im.getbbox() else im

PX_PER_UNIT = 4
BACK = {1: 'w1-near', 2: 'w2-near', 3: 'w3-near', 4: 'w4-near', 5: 'w5-near', 6: 'w6-near', 7: 'w7-near'}


def review(pieces, world, path):
    tw = 1600
    lay, x, y, rowh = [], 0, 0, 0
    for n, im in pieces:
        s = min(1.0, 260 / max(im.width, im.height))
        t = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        if x + t.width + 20 > tw:
            x, y, rowh = 0, y + rowh + 40, 0
        lay.append((n, t, x + 10, y + 30))
        x += t.width + 20
        rowh = max(rowh, t.height)
    H = y + rowh + 50
    bp = ROOT / f'src/assets/backdrops/{BACK[world]}.webp'
    if bp:
        back = Image.open(bp).convert('RGBA')
        Hs = max(H, round(tw * back.height / back.width))
        S = Image.new('RGBA', (tw, H), (60, 70, 60, 255))
        S.alpha_composite(back.resize((tw, Hs)).crop((0, Hs - H, tw, Hs)))
    else:
        S = Image.new('RGBA', (tw, H), (70, 80, 70, 255))
    d = ImageDraw.Draw(S)
    for n, t, px, py in lay:
        S.alpha_composite(t, (px, py))
        d.text((px, py - 16), n, fill=(255, 255, 210))
    S.convert('RGB').save(path, quality=86)


def main():
    takes = Path(sys.argv[1])
    picks = json.loads((HERE / 'picks.json').read_text())
    frames = {}
    for world, pp in sorted(picks.items(), key=lambda kv: int(kv[0])):
        w = int(world)
        key = [0, 255, 0] if w == 5 else [255, 0, 255]
        pieces = []
        for n, p in pp.items():
            img = Image.open(next(takes.glob(f"{p['take']}.*"))).convert('RGB')
            if p.get('box'):  # (the piece's own box in the take, as fractions: a hanging piece painted inside a tree scene)
                bx = p['box']
                img = img.crop((round(bx[0] * img.width), round(bx[1] * img.height), round(bx[2] * img.width), round(bx[3] * img.height)))
            im = edge_clean(key_own(img, p.get('solo', False)))
            if p.get('cropBottom'):  # (a base slab the model put under it: the bottom fraction cut off)
                im = im.crop((0, 0, im.width, round(im.height * (1 - p['cropBottom']))))
                im = im.crop(im.getbbox())
            tw = round(p['units'] * PX_PER_UNIT)
            s = tw / im.width
            im = im.resize((tw, max(1, round(im.height * s))), Image.LANCZOS)
            pieces.append((n, im))
        sheet, pos = pack(pieces, maxw=1024)
        dst = ROOT / f'src/assets/props/dressnew-w{w}.webp'
        sheet.save(dst, 'WEBP', quality=88, method=6)
        for n, (x, y, ww, hh) in pos.items():
            name = f'w{w}{n[0].upper()}{n[1:]}'
            frames[name] = {'x': x, 'y': y, 'w': ww, 'h': hh, 'units': pp[n]['units'], 'world': w, **({'hang': True} if pp[n].get('hang') else {})}
        review(pieces, w, ROOT / f'reference/prop-sheets/qa-notes/hf-props/w{w}-pieces.jpg')
        print(dst, sheet.size, len(pieces))
    # the three new looks per job per world (lead, 2026-10-31: three looks per job), from the pieces kept, in pieces.py order
    sys.path.insert(0, str(HERE))
    from pieces import P, P2
    looks = {}
    for world, pp in picks.items():
        w = int(world)
        nm = lambda n: f'w{w}{n[0].upper()}{n[1:]}'
        allp = P[w]['pieces'] + P2.get(w, [])
        by = {job: [nm(n) for (n, j, _u, _d) in allp if j == job and n in pp] for job in ('bank', 'hang', 'clutter')}
        # (a pick under a name of its own, not in the list: a take that came out as something else worth keeping, by its `job`)
        known = {n for (n, *_r) in allp}
        for n, v in pp.items():
            if n not in known:
                by[v['job']].append(nm(n))
        # (three looks per job from round 1's pieces; round 2's add looks of their own, in threes)
        pat = {'bank': [[0, 1, 2], [3, 4, 5], [1, 3, 5], [6, 7, 8], [9, 10, 11], [6, 9, 2], [8, 11, 4]], 'hang': [[0, 1], [2, 3], [1, 2]],
               'clutter': [[0, 1, 2], [3, 4, 0], [1, 3, 4], [5, 6, 2], [6, 5, 3]]}
        pat = {j: [ix for ix in v if ix[0] < max(3, len(by[j]))] for j, v in pat.items()}
        looks[w] = {}
        for job, ns in by.items():
            if not ns:
                continue
            sets = []
            for idx in pat[job]:
                st = []
                for i in idx:
                    n = ns[i % len(ns)]
                    if n not in st:
                        st.append(n)
                if st not in sets:
                    sets.append(st)
            looks[w][job] = sets
    body = json.dumps(frames, indent=1)
    worlds = sorted({f['world'] for f in frames.values()})
    urls = '\n'.join(f"  {w}: new URL('../assets/props/dressnew-w{w}.webp', import.meta.url).href," for w in worlds)
    ts = f"""/**
 * Generated by tools/art/hfprops/cut.py (hf-props, 2026-10-31): the new set dressing for Worlds 1-7, painted on Hugging Face, one small
 * sheet per world (src/assets/props/dressnew-w<N>.webp). Do not edit by hand. Drawn by dressArt.ts; placed by artDress.ts (dressSets).
 * units: the width it is drawn at in the game (world units); hang: anchored by the middle of its top (else the middle of its foot);
 * world: the sheet it is on.
 */
export interface DressNewFrame {{ x: number; y: number; w: number; h: number; units: number; world: number; hang?: boolean }}
export const DRESS_NEW_FRAMES = {body} satisfies Record<string, DressNewFrame>;
export type DressNewName = keyof typeof DRESS_NEW_FRAMES;
/** each world's sheet */
export const DRESS_NEW_URLS: Record<number, string> = typeof URL === 'undefined' ? {{}} : {{
{urls}
}};
"""
    (ROOT / 'src/game/dressNewData.ts').write_text(ts)
    (ROOT / 'src/game/dressNewLooks.ts').write_text(f"""/**
 * Generated by tools/art/hfprops/cut.py (hf-props, 2026-10-31): each world's three new looks per dressing job (bank, hang, clutter),
 * from the pieces kept, added after the first sheet's looks in artDress.ts DRESS_SETS (rollLook rotates them by the roll).
 */
import type {{ DressNewName }} from './dressNewData.ts';

export const DRESS_NEW_LOOKS: Record<number, Partial<Record<'bank' | 'hang' | 'clutter', DressNewName[][]>>> = {json.dumps(looks, indent=1)};
""")
    print(len(frames), 'frames')


if __name__ == '__main__':
    main()
