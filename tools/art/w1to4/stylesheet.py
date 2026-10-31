"""World 1-4 style sheets (2026-10-31, branch w1-4-sheets; audit-2 line ~380: "one style sheet per world (the kit plus three approved
pieces), attached to every prompt").

    python3 tools/art/w1to4/stylesheet.py [1 2 3 4]

Writes reference/prop-sheets/w<N>-style-sheet.png (2048 x 1280): the world's whole approved kit atlas on the left, its three approved
pieces large on the right, the near and far backdrop strips the pieces sit on, a palette strip (12 colours, k-means over the kit and
the pieces) and the rules every new piece follows (light direction, outline, key colour). Read-only on src/; nothing here ships.
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / 'src'
OUT = ROOT / 'reference' / 'prop-sheets'


def frames(ts):
    """{name: (x, y, w, h)} from a generated atlas data file (either `name: { x: 1, y: 2, w: 3, h: 4 }` or the JSON style)"""
    t = (SRC / 'game' / ts).read_text()
    out = {}
    for m in re.finditer(r"['\"]?([A-Za-z0-9_-]+)['\"]?\s*:\s*\{\s*['\"]?x['\"]?\s*:\s*(\d+)\s*,\s*['\"]?y['\"]?\s*:\s*(\d+)\s*,\s*"
                         r"['\"]?w['\"]?\s*:\s*(\d+)\s*,\s*['\"]?h['\"]?\s*:\s*(\d+)", t):
        out[m.group(1)] = tuple(int(m.group(i)) for i in range(2, 6))
    return out


def kit_frames(world):
    t = (SRC / 'game' / 'kitAtlasData.ts').read_text()
    d = json.loads(t[t.index('= {') + 2:].rstrip().rstrip(';'))
    return {k: (v['x'], v['y'], v['w'], v['h']) for k, v in d[str(world)].items()}


# per world: the kit atlas, three approved pieces [(atlas, frames file, key)], the backdrops, and the light/look notes
W = {
    1: dict(name='World 1, The Trail', kit='assets/proto/props-atlas.webp',
            pieces=[('assets/proto/props-atlas.webp', 'protoAtlasData.ts', 'log'),
                    ('assets/proto/props-atlas.webp', 'protoAtlasData.ts', 'stump'),
                    ('assets/proto/props-atlas.webp', 'protoAtlasData.ts', 'curtain')],
            backs=['assets/backdrops/w1-near.webp', 'assets/backdrops/w1sunrise-far.webp'],
            notes=['Daylight canopy: warm sun from the UPPER LEFT, soft cel shading, shadow side lower right.',
                   'Thin dark brown ink outline (about 2-3 px at 512), never black-on-black.',
                   'Palette: warm bark browns, mossy yellow-greens, pale moss on top edges, small pink/red flower accents.',
                   'Mossy top edge on anything Pokey stands on. No water anywhere in World 1.',
                   'Paint on flat pure magenta #FF00FF (green #00FF00 if the piece is pink). No cast shadow, no ground line.']),
    2: dict(name='World 2, The River', kit='assets/kits/w2.webp',
            pieces=[('assets/props/w2-props.webp', 'w2PropsData.ts', 'jetty'),
                    ('assets/props/w2-props.webp', 'w2PropsData.ts', 'cageA'),
                    ('assets/props/w2-props.webp', 'w2PropsData.ts', 'reedTall')],
            backs=['assets/backdrops/w2-near.webp', 'assets/backdrops/w2rapids-far.webp'],
            notes=['Riverbank afternoon: light from the UPPER LEFT, soft cel shading.',
                   'Thin dark ink outline; weathered grey-brown planks, rope lashings in tan.',
                   'Palette: layered clay-orange soil, grey-brown wood, teal river water, olive reeds, lily greens.',
                   'Water pieces: teal body, pale foam line on top, no reflections of the sky.',
                   'Paint on flat pure magenta #FF00FF (green #00FF00 if the piece is pink). No cast shadow.']),
    3: dict(name='World 3, The Grotto', kit='assets/kits/w3.webp',
            pieces=[('assets/props/w3-props.webp', 'w3PropsData.ts', 'grottoMouth'),
                    ('assets/props/w3-props.webp', 'w3PropsData.ts', 'hollowLog'),
                    ('assets/props/w3-props.webp', 'w3PropsData.ts', 'mushrooms')],
            backs=['assets/backdrops/w3-near.webp', 'assets/backdrops/w3cavern-far.webp'],
            notes=['Underground: props painted EVENLY LIT (the game lights them), soft light from the upper left only.',
                   'Light sources (glowworms, fungi, crystals) painted bright cyan/teal and separate so they can glow.',
                   'Palette: cool grey-green stone, deep moss greens, teal glow drips; no warm daylight on stone.',
                   'Thin dark ink outline; damp stone with pale water streaks.',
                   'Paint on flat pure magenta #FF00FF (green #00FF00 if the piece is pink). No cast shadow.']),
    4: dict(name='World 4, The Falls', kit='assets/kits/w4.webp',
            pieces=[('assets/props/w4-props.webp', 'w4PropsData.ts', 'fallCliff'),
                    ('assets/props/w4-props.webp', 'w4PropsData.ts', 'chimesStill'),
                    ('assets/props/w4-props.webp', 'w4PropsData.ts', 'boulderMoss')],
            backs=['assets/backdrops/w4-near.webp', 'assets/backdrops/w4terraces-far.webp'],
            notes=['High cliffs in mist: light from the UPPER LEFT, slightly warm (World 4 is graded warm, VI-18).',
                   'Thin dark ink outline; blue-grey slate cliffs with moss-green grassy tops, white-blue falling water.',
                   'Palette: slate blue-greys, moss and grass greens, pale aqua water, bamboo tan, orange fruit accents.',
                   'Cartoon storybook (as the capuchins and eaglets), not photo; big readable shapes.',
                   'Paint on flat pure magenta #FF00FF (green #00FF00 if the piece is pink). No cast shadow.']),
}

BG = (52, 54, 64)
FONT = None
for f in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
    if Path(f).exists():
        FONT = f
def font(n):
    return ImageFont.truetype(FONT, n) if FONT else ImageFont.load_default()


def on_bg(im, bg=BG):
    b = Image.new('RGBA', im.size, bg + (255,))
    b.alpha_composite(im.convert('RGBA'))
    return b.convert('RGB')


def fit(im, w, h):
    s = min(w / im.width, h / im.height)
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def palette(ims, k=12):
    px = np.concatenate([np.asarray(i.convert('RGBA').resize((160, max(1, round(160 * i.height / i.width))))).reshape(-1, 4) for i in ims])
    px = px[px[:, 3] > 200][:, :3].astype(np.float32)
    rng = np.random.default_rng(1)
    c = px[rng.choice(len(px), k, replace=False)]
    for _ in range(25):
        lab = ((px[:, None, :] - c[None]) ** 2).sum(-1).argmin(1)
        c = np.array([px[lab == i].mean(0) if (lab == i).any() else c[i] for i in range(k)])
    n = np.bincount(lab, minlength=k)
    order = np.argsort([0.3 * r + 0.59 * g + 0.11 * b for r, g, b in c])
    return [(tuple(int(v) for v in c[i]), int(n[i])) for i in order]


def build(world):
    cfg = W[world]
    S = Image.new('RGB', (2048, 1280), BG)
    d = ImageDraw.Draw(S)
    d.text((24, 14), f"{cfg['name']}: style sheet (attach to every prompt)", fill=(240, 236, 220), font=font(34))
    kit = Image.open(SRC / cfg['kit'])
    k = fit(on_bg(kit), 1100, 760)
    S.paste(k, (24, 64))
    d.text((24, 64 + k.height + 6), 'the approved kit: ' + cfg['kit'].split('/')[-1], fill=(190, 190, 200), font=font(20))
    picked = []
    x0, y = 1150, 64
    for atlas, fr, key in cfg['pieces']:
        a = Image.open(SRC / atlas).convert('RGBA')
        x, yy, w, h = frames(fr)[key]
        p = a.crop((x, yy, x + w, yy + h))
        picked.append(p)
        t = fit(on_bg(p), 420, 240)
        S.paste(t, (x0, y))
        d.text((x0 + 430, y + 8), key, fill=(240, 236, 220), font=font(24))
        d.text((x0 + 430, y + 40), f'{w} x {h} px', fill=(170, 170, 180), font=font(18))
        y += t.height + 14
    # the backdrops the pieces sit on
    by = max(64 + k.height + 40, y + 4)
    bx = 24
    for b in cfg['backs']:
        p = SRC / b
        if not p.exists():
            continue
        im = on_bg(Image.open(p).convert('RGBA'), (120, 150, 180))
        t = fit(im, 640, 1280 - by - 180)
        S.paste(t, (bx, by))
        d.text((bx, by + t.height + 4), b.split('/')[-1], fill=(170, 170, 180), font=font(18))
        bx += t.width + 20
    # palette
    pal = palette([kit] + picked)
    px0, py0, sw = bx + 10, by, 52
    for i, (c, _) in enumerate(pal):
        d.rectangle([px0 + (i % 6) * (sw + 6), py0 + (i // 6) * (sw + 6), px0 + (i % 6) * (sw + 6) + sw, py0 + (i // 6) * (sw + 6) + sw],
                    fill=c, outline=(20, 20, 20))
    d.text((px0, py0 + 2 * (sw + 6) + 4), 'palette (k-means of kit + pieces)', fill=(170, 170, 180), font=font(18))
    ny = 1280 - 140
    for i, n in enumerate(cfg['notes']):
        d.text((24, ny + i * 26), '- ' + n, fill=(235, 230, 210), font=font(20))
    p = OUT / f'w{world}-style-sheet.png'
    S.save(p, optimize=True)
    print(p, S.size, [f'#{r:02x}{g:02x}{b:02x}' for (r, g, b), _ in pal])
    return S


if __name__ == '__main__':
    for w in [int(a) for a in sys.argv[1:]] or [1, 2, 3, 4]:
        build(w)
