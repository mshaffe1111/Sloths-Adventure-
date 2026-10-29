"""Start pictures for the story-art GPU jobs (storygpu.py), made on this machine from the game's own art and force-added under
tools/art/hfbatch/starts/storyart/ so the job reads them from GitHub raw at a pinned commit.

    python3 -I tools/art/storyart/starts.py <set>      (sets below; each writes its starts and a meta json next to them)

A figure start: the frame cut from its atlas, scaled up (Lanczos) so it stands FILL of the square, feet on a line near the bottom, on flat
key grey (the character models were trained on plain grey). meta: {name: {"scale", "ox", "oy", "src": [atlas, x, y, w, h], "ax", "ay"}}
maps a point of the old frame to the start: start = old * scale + (ox, oy).
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

REPO = Path(__file__).resolve().parents[3]
OUT = REPO / 'tools/art/hfbatch/starts/storyart'
KEY = (128, 128, 128)


def cut(atlas, x, y, w, h):
    return Image.open(REPO / atlas).convert('RGBA').crop((x, y, x + w, y + h))


def on_key(fig, size=1024, fill=0.78, foot=0.9, ax=None, ay=None, key=KEY, height=None):
    """fig RGBA -> RGB square start, plus the mapping; the figure's height is FILL of the square (or `height` px), its feet at FOOT"""
    W = H = size
    if isinstance(size, tuple):
        W, H = size
    s = (height or fill * H) / fig.height
    if fig.width * s > W * 0.92:
        s = W * 0.92 / fig.width
    big = fig.resize((max(1, round(fig.width * s)), max(1, round(fig.height * s))), Image.LANCZOS)
    ax = fig.width / 2 if ax is None else ax
    ay = fig.height if ay is None else ay
    ox = round(W / 2 - ax * s)
    oy = round(H * foot - ay * s)
    bg = Image.new('RGBA', (W, H), key + (255,))
    bg.alpha_composite(big, (ox, oy))
    return bg.convert('RGB'), {'scale': s, 'ox': ox, 'oy': oy}


def save(name, im, meta, allmeta):
    OUT.mkdir(parents=True, exist_ok=True)
    im.save(OUT / f'{name}.png')
    allmeta[name] = meta


def ts_rects(path, var):
    """the rects of a generated TS frames table (heroStandardData.ts, heroStoryData.ts ...): {name: {x, y, w, h, ax, ay}}"""
    import re
    src = (REPO / path).read_text()
    out = {}
    for m in re.finditer(r"^\s*'?([a-z0-9_]+)'?: \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+), ax: ([\d.]+), ay: ([\d.]+)", src, re.M):
        out[m.group(1)] = dict(x=int(m.group(2)), y=int(m.group(3)), w=int(m.group(4)), h=int(m.group(5)), ax=float(m.group(6)), ay=float(m.group(7)))
    return out


def boss_rects():
    src = (REPO / 'src/game/ironclawAtlasData.ts').read_text()
    i = src.index('IRONCLAW_FRAMES')
    j = src.index('= {', i) + 2
    return json.JSONDecoder().raw_decode(src[j:])[0]


def calib():
    meta = {}
    std = ts_rects('src/game/heroStandardData.ts', 'STD_FRAMES')
    sto = ts_rects('src/game/heroStoryData.ts', 'STORY_FRAMES')
    for n, (tab, atlas) in {'idle': (std, 'src/assets/hero/hero-standard.webp'), 'duck': (std, 'src/assets/hero/hero-standard.webp'),
                            'talk_b': (sto, 'src/assets/hero/hero-story.webp'), 'worried': (sto, 'src/assets/hero/hero-story.webp')}.items():
        r = tab[n]
        im, m = on_key(cut(atlas, r['x'], r['y'], r['w'], r['h']), ax=r['ax'], ay=r['ay'], height=820)
        m.update(src=[atlas, r['x'], r['y'], r['w'], r['h']], ax=r['ax'], ay=r['ay'])
        save(f'calib-pokey-{n}', im, m, meta)
    bf = boss_rects()
    for n in ('idle', 'roar', 'fallen'):
        r = bf[n]
        im, m = on_key(cut('src/assets/enemies/ironclaw-atlas.webp', r['x'], r['y'], r['w'], r['h']), ax=r['ax'], ay=r['ay'], fill=0.74 if n != 'fallen' else 0.5)
        m.update(src=['src/assets/enemies/ironclaw-atlas.webp', r['x'], r['y'], r['w'], r['h']], ax=r['ax'], ay=r['ay'])
        save(f'calib-gen-{n}', im, m, meta)
    (OUT / 'meta-calib.json').write_text(json.dumps(meta, indent=1))



def plate_start(key, W=1280, BH=720, H=1360, feather=56):
    """a plate extended upward: the old plate at the bottom (W x BH), the room above it filled with its own top rows stretched and
    blurred (colour cues for the inpaint), and the mask (white = paint) over that room and a feathered strip into the plate"""
    base = Image.open(REPO / f'src/assets/story/plates/{key}.webp').convert('RGB').resize((W, BH), Image.LANCZOS)
    ext = H - BH
    top = base.crop((0, 0, W, max(8, BH // 7))).resize((W, ext), Image.BICUBIC).filter(ImageFilter.GaussianBlur(40))
    arr = np.asarray(top, np.float32)
    arr += np.random.default_rng(1).normal(0, 10, arr.shape)
    im = Image.new('RGB', (W, H))
    im.paste(Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)), (0, 0))
    im.paste(base, (0, ext))
    m = np.zeros((H, W), np.float32)
    m[:ext + feather] = 1
    mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(feather / 2))
    return im, mask


def ground_start(top=150, W=2048, H=512, bark=((138, 90, 43), (94, 58, 26), (47, 28, 12)), moss=((155, 227, 90), (63, 154, 58))):
    """the old code-drawn branch, drawn here at strip size as the start for its painted replacement (grey above it)"""
    from PIL import ImageDraw
    im = Image.new('RGB', (W, H), KEY)
    d = ImageDraw.Draw(im)
    for y in range(top, H):
        u = (y - top) / (H - top)
        c = [round(bark[0][i] + (bark[1][i] - bark[0][i]) * min(1, u * 2) + (bark[2][i] - bark[1][i]) * max(0, u * 2 - 1)) for i in range(3)]
        d.line([(0, y), (W, y)], fill=tuple(c))
    for x in range(0, W, 110):
        d.line([(x + 20, top + 30), (x + 40, top + 80), (x + 10, top + 150)], fill=(50, 28, 10), width=6)
    for x in range(0, W, 34):
        d.ellipse([x - 22, top - 14, x + 22, top + 26 + (x // 34 % 2) * 10], fill=moss[1])
        d.ellipse([x - 18, top - 16, x + 18, top + 10], fill=moss[0])
    return im


def calib_plates():
    OUT.mkdir(parents=True, exist_ok=True)
    im, mask = plate_start('courtyard')
    im.save(OUT / 'calib-plate-courtyard.png')
    mask.save(OUT / 'calib-plate-courtyard-mask.png')
    ground_start().save(OUT / 'calib-ground-w1.png')


CEL_ATLAS = ['src/assets/characters/cels-pokey.webp', 'src/assets/characters/cels-pair.webp', 'src/assets/characters/cels-folk.webp']


def cel_rects():
    import re
    src = (REPO / 'src/game/storyCelData.ts').read_text()
    out = {}
    for m in re.finditer(r"'([a-z]+\.[a-z0-9_]+)': \{ a: (\d), x: (\d+), y: (\d+), w: (\d+), h: (\d+), f: (-?\d)(, c: '(\w+)')?", src):
        out[m.group(1)] = dict(a=int(m.group(2)), x=int(m.group(3)), y=int(m.group(4)), w=int(m.group(5)), h=int(m.group(6)), f=int(m.group(7)), c=m.group(9))
    return out


def sharpen(im):
    """a start scaled up from a small frame: its edges crisped so the repaint keeps a clean line instead of copying the blur"""
    return im.filter(ImageFilter.UnsharpMask(radius=3, percent=90, threshold=2))


def band(world, W=2048, H=512, line=0.3):
    """a world's ground strip start: the floor of its own near backdrop (the bottom band), grey above the walk line"""
    im = Image.open(REPO / f'src/assets/backdrops/w{world}-near.webp').convert('RGBA')
    r = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    bh = round(H * (1 - line)) + 40
    b = r.crop((0, r.height - bh, W, r.height))
    out = Image.new('RGBA', (W, H), KEY + (255,))
    # holes in the band (the near layer is cut out around its rocks) take the band's own colour first
    arr = np.asarray(b).astype(np.float32)
    a = arr[..., 3:] / 255
    mean = (arr[..., :3] * a).sum((0, 1)) / max(1, a.sum())
    fill = Image.new('RGBA', b.size, tuple(int(v) for v in mean) + (255,))
    fill.alpha_composite(b)
    out.alpha_composite(fill, (0, H - bh))
    return out.convert('RGB')


def round2():
    meta = {}
    std = ts_rects('src/game/heroStandardData.ts', 'STD_FRAMES')
    sto = ts_rects('src/game/heroStoryData.ts', 'STORY_FRAMES')
    for n, (tab, atlas) in {'idle': (std, 'src/assets/hero/hero-standard.webp'), 'duck': (std, 'src/assets/hero/hero-standard.webp'),
                            'worried': (sto, 'src/assets/hero/hero-story.webp')}.items():
        r = tab[n]
        im, m = on_key(cut(atlas, r['x'], r['y'], r['w'], r['h']), ax=r['ax'], ay=r['ay'], height=820)
        save(f'r2-pokey-{n}', sharpen(im), m, meta)
    cr = cel_rects()
    for k in ('mc.sing_reach', 'mx.petal_glow', 'gn.ready_a', 'gv.stand', 'gr.stand_hands'):
        r = cr[k]
        im, m = on_key(cut(CEL_ATLAS[r['a']], r['x'], r['y'], r['w'], r['h']), fill=0.8)
        m.update(src=[CEL_ATLAS[r['a']], r['x'], r['y'], r['w'], r['h']])
        save(f'r2-cel-{k.replace(".", "-")}', sharpen(im), m, meta)
    mf = ts_rects('src/game/meecaStandardData.ts', 'X')
    r = mf['idle'] if 'idle' in mf else next(iter(mf.values()))
    im, m = on_key(cut('src/assets/characters/meeca-standard.webp', r['x'], r['y'], r['w'], r['h']), ax=r['ax'], ay=r['ay'], height=820)
    save('r2-meeca-idle', sharpen(im), m, meta)
    bf = boss_rects()
    for n in ('idle', 'roar', 'fallen'):
        r = bf[n]
        im, m = on_key(cut('src/assets/enemies/ironclaw-atlas.webp', r['x'], r['y'], r['w'], r['h']), ax=r['ax'], ay=r['ay'], fill=0.74 if n != 'fallen' else 0.5)
        save(f'r2-gen-{n}', sharpen(im), m, meta)
    (OUT / 'meta-r2.json').write_text(json.dumps(meta, indent=1))
    # the courtyard, extended upward from its own top rows repeated (so the tower goes on up), and an outpaint canvas for the edit model
    W, BH, H = 1280, 720, 1360
    base = Image.open(REPO / 'src/assets/story/plates/courtyard.webp').convert('RGB').resize((W, BH), Image.LANCZOS)
    ext = H - BH
    im = Image.new('RGB', (W, H))
    strip = base.crop((0, 0, W, 160))
    y = ext
    flip = True
    while y > 0:
        piece = strip.transpose(Image.FLIP_TOP_BOTTOM) if flip else strip
        im.paste(piece, (0, y - 160))
        y -= 160
        flip = not flip
    im = Image.fromarray(np.asarray(im.filter(ImageFilter.GaussianBlur(3))))
    im.paste(base, (0, ext))
    im.save(OUT / 'r2-plate-courtyard.png')
    m = np.zeros((H, W), np.float32)
    m[:ext + 90] = 1
    Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(40)).save(OUT / 'r2-plate-courtyard-mask.png')
    can = Image.new('RGB', (W, H), (255, 255, 255))
    can.paste(base, (0, ext))
    can.save(OUT / 'r2-plate-courtyard-canvas.png')
    band(1).save(OUT / 'r2-ground-w1.png')


if __name__ == '__main__':
    globals()[sys.argv[1]]()
