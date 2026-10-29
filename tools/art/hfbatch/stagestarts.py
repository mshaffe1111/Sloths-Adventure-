"""Start pictures for the every-stage pieces (hf-art-stage, 2026-10-29; polish report VI-9, VI-10, VI-12, VI-16), pasted up from the
game's own painted art on a flat key colour, for img2img (w6to10/img2imggpu.py, spec from make_stage_spec.py):
  start-gate-w<N>.webp    the exit gate, shut (left half) and open (right half), from World N's kit: two of its trunks or pillars, its
                          branch as the lintel, its bank as the step, its wall piece as the shut door; the open door a dark way through
                          with a warm light (1536 x 960, magenta)
  start-flag.webp         the checkpoint: World 5's painted pennant post with a pennant of World 1's painted leaves over the lace, unlit
                          (muted) and lit (warm) (1024 x 768, magenta)
  start-water-w<N>.webp   pit water: World 6's painted chop strip re-toned to World N's water and repeated (1536 x 384, magenta above)
  start-pickups.webp      heart, crowned super heart, speed, shield star, magnet: the HUD heart's shape and colours (1536 x 1024, cyan)
  start-thorn.webp        the Thorn Gate, a ring of World 8's thorny purple vine around a violet light, shut and open (1024 x 512, cyan)
  start-net.webp          4-8's old netting over a nest, whole and torn (1024 x 384, magenta)
  start-finds.webp        the Hush Fern and the Keeper's Bell (World 5's painted fern and bell), plain and glowing (1024 x 1024, cyan)
    python3 -I tools/art/hfbatch/stagestarts.py
"""
import json, math, re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

R = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / 'starts'
MAG = (255, 0, 255)
CYAN = (0, 255, 255)


def frames_ts(ts):
    t = (R / ts).read_text()
    return {m.group(1): tuple(map(int, m.groups()[1:])) for m in re.finditer(
        r'["\']?(\w+)["\']?\s*:\s*\{\s*"?x"?\s*:\s*(\d+),\s*"?y"?\s*:\s*(\d+),\s*"?w"?\s*:\s*(\d+),\s*"?h"?\s*:\s*(\d+)', t)}


def kit_frames():
    t = (R / 'src/game/kitAtlasData.ts').read_text()
    t = t[t.index('{', t.index('KIT_FRAMES')):]
    return json.loads(t[:t.rindex('}') + 1])


KIT = kit_frames()
SHEETS = {}


def sheet(p):
    if p not in SHEETS:
        SHEETS[p] = Image.open(R / p).convert('RGBA')
    return SHEETS[p]


def piece(world, name):
    """a kit piece of World `world` (World 1: the proto atlas)"""
    if world == 1:
        x, y, w, h = frames_ts('src/game/protoAtlasData.ts')[name]
        return sheet('src/assets/proto/props-atlas.webp').crop((x, y, x + w, y + h))
    f = KIT[str(world)][name]
    return sheet(f'src/assets/kits/w{world}.webp').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def prop(sheet_path, ts, name):
    x, y, w, h = frames_ts(ts)[name]
    return sheet(sheet_path).crop((x, y, x + w, y + h))


def fit(im, w, h):
    return im.resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)


def glow(size, cx, cy, r, col, a0=1.0):
    """a soft round light as an RGBA layer"""
    yy, xx = np.mgrid[0:size[1], 0:size[0]]
    d = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / r
    a = np.clip(1 - d, 0, 1) ** 1.6 * a0
    arr = np.zeros((size[1], size[0], 4), np.uint8)
    arr[..., 0], arr[..., 1], arr[..., 2] = col
    arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')


# which kit pieces make each world's gate: pillar piece, lintel piece, the shut door's face
GATE = {
    1: ('trunk', 'branch', 'curtain'),
    2: ('perch', 'branch', 'wall'),
    3: ('trunk', 'branch', 'wall'),
    4: ('trunk', 'branch', 'wall'),
    6: ('trunk', 'branch', 'wall'),
    7: ('perch', 'branch', 'wall'),
    8: ('trunk', 'branch', 'wall'),
    9: ('bankEnd', 'branch', 'wall'),
    10: ('wall', 'bank', 'branchCreak'),
}


def gate_half(world, open_):
    W, H = 768, 960
    c = Image.new('RGBA', (W, H), MAG + (255,))
    pil, lin, face = GATE[world]
    p = piece(world, pil)
    # (the pillar piece cropped to its upright part: a perch's arm or a trunk's foot flare kept narrow)
    if pil == 'perch':
        p = p.crop((0, 0, max(40, round(p.width * 0.42)), p.height))
    ph = 720
    pw = min(170, ph * p.width / p.height * 1.0)
    pw = max(pw, 120)
    pp = fit(p, pw, ph)
    x0, x1 = 120, W - 120 - pw
    top = H - 120 - ph
    # the door way (between the pillars)
    dx0, dx1, dy0, dy1 = x0 + pw - 10, x1 + 10, top + 120, H - 120
    if open_:
        d = Image.new('RGBA', (round(dx1 - dx0), round(dy1 - dy0)), (26, 18, 12, 255))
        dd = ImageDraw.Draw(d)
        # (a path running away into a warm light)
        w, h = d.size
        dd.polygon([(w * 0.2, h), (w * 0.8, h), (w * 0.56, h * 0.45), (w * 0.44, h * 0.45)], fill=(92, 70, 40, 255))
        d.alpha_composite(glow(d.size, w / 2, h * 0.42, w * 0.62, (255, 214, 120), 0.95))
        d.alpha_composite(glow(d.size, w / 2, h * 0.42, w * 0.25, (255, 248, 210), 1.0))
        c.alpha_composite(d, (round(dx0), round(dy0)))
        if world == 10:  # (the portcullis wound up: its bottom bars still show under the lintel)
            g = fit(piece(10, face), dx1 - dx0, (dy1 - dy0) * 0.9)
            c.alpha_composite(g.crop((0, round(g.height * 0.82), g.width, g.height)), (round(dx0), round(dy0)))
    else:
        f = piece(world, face)
        # (the whole door way filled: a flat dark board behind, the face stretched over it)
        ImageDraw.Draw(c).rectangle([dx0, dy0, dx1, dy1], fill=(70, 52, 34, 255) if world != 10 else (30, 26, 24, 255))
        f = fit(f, dx1 - dx0, dy1 - dy0)
        c.alpha_composite(f, (round(dx0), round(dy0)))
        dd = ImageDraw.Draw(c)
        # (bound shut: two crossed vines over the door, a knot in the middle)
        vine = (58, 82, 36, 255)
        if world == 10:
            vine = (110, 60, 30, 255)  # (a rusty chain bar, not a vine)
        dd.line([(dx0 + 10, dy0 + 40), (dx1 - 10, dy1 - 140)], fill=vine, width=22)
        dd.line([(dx1 - 10, dy0 + 40), (dx0 + 10, dy1 - 140)], fill=vine, width=22)
        mx, my = (dx0 + dx1) / 2, (dy0 + dy1 - 100) / 2
        dd.ellipse([mx - 34, my - 34, mx + 34, my + 34], fill=(70, 96, 44, 255), outline=(30, 40, 18, 255), width=5)
    c.alpha_composite(pp, (round(x0), round(top)))
    c.alpha_composite(pp.transpose(Image.FLIP_LEFT_RIGHT), (round(x1), round(top)))
    lp = piece(world, lin)
    lw = W - 150
    lh = min(170, lw * lp.height / lp.width * 1.6)
    c.alpha_composite(fit(lp, lw, lh), (75, round(top - lh * 0.35)))
    bp = piece(world, 'bank' if world != 1 else 'bank')
    c.alpha_composite(fit(bp, W - 80, 150), (40, H - 165))
    return c


def door_rect(world):
    """where gate_half put the door way (x0, x1, y0, y1 in a 768 x 960 half)"""
    pil = GATE[world][0]
    p = piece(world, pil)
    if pil == 'perch':
        p = p.crop((0, 0, max(40, round(p.width * 0.42)), p.height))
    pw = max(min(170, 720 * p.width / p.height), 120)
    return 120 + pw - 10, 768 - 120 - pw + 10, 240, 840


def fill_door_gaps(im, world, col=(30, 22, 16)):
    """the key showing through between the door and the pillars (slivers the pillar pieces' soft edges left): filled with the door
    way's dark, key-coloured pixels only, so the painted pillars are untouched"""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    x0, x1, y0, y1 = (round(v) for v in door_rect(world))
    x0, x1, y0 = x0 - 40, x1 + 40, y0 - 30
    reg = a[y0:y1, x0:x1]
    key = (np.minimum(reg[..., 0], reg[..., 2]) - reg[..., 1]) > 90
    reg[key] = col
    return Image.fromarray(a.astype(np.uint8))


def gate_open_from(world, take):
    """round 2 (the first open takes kept the start's flat cone of light): the open gate from the picked take's own shut half (its
    painted pillars, lintel and step), the door gone, the way through dark with a soft warm light deep inside"""
    src = Image.open(take).convert('RGB').crop((0, 0, 768, 960))
    x0, x1, y0, y1 = (round(v) for v in door_rect(world))
    c = src.convert('RGBA')
    d = Image.new('RGBA', (x1 - x0, y1 - y0), (24, 17, 12, 255))
    w, h = d.size
    d.alpha_composite(glow(d.size, w / 2, h * 0.55, w * 0.9, (150, 104, 56), 0.9))
    d.alpha_composite(glow(d.size, w / 2, h * 0.5, w * 0.45, (255, 214, 140), 0.8))
    c.alpha_composite(d, (x0, y0))
    return fill_door_gaps(c, world)


# the light each world's way out glows with (round 3, lead review: the open door read as a dark hole): warm gold, green-gold in the
# cave and the swamp, rose-gold in the orchid garden
GLOW = {1: (255, 214, 120), 2: (255, 210, 130), 3: (200, 240, 150), 4: (255, 224, 150), 5: (255, 200, 170), 6: (214, 236, 130),
        7: (255, 208, 110), 8: (255, 214, 150), 9: (255, 196, 110), 10: (255, 210, 130)}


def doorway_mask(im, world):
    """the open way through: the biggest dark region (lum under 60) inside where the door way was laid out (door_rect; World 5: the
    totem's little door, where gate_w5 put it), filled"""
    from scipy import ndimage
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    lum = a.mean(axis=2)
    key = (np.minimum(a[..., 0], a[..., 2]) - a[..., 1]) > 90
    dark = (lum < 60) & ~key
    x0, x1, y0, y1 = (349, 489, 650, 851) if world == 5 else (round(v) for v in door_rect(world))
    box = np.zeros_like(dark)
    box[y0 - 10:y1 + 4, x0 - 16:x1 + 16] = True
    dark &= box
    lab, n = ndimage.label(dark)
    if not n:
        return None
    sizes = ndimage.sum(np.ones_like(lum), lab, range(1, n + 1))
    m = lab == (int(np.argmax(sizes)) + 1)
    return ndimage.binary_fill_holes(ndimage.binary_closing(m, iterations=6))


def gate_lit_from(world, take, shut_take=None, half=None):
    """round 3: the open gate lit from inside: the way through shows the world beyond (its far backdrop, faint and warm) in a strong
    glow of the world's light, brightest low in the middle where the path leads out. World 10: the shut take's floor spikes put back."""
    from scipy import ndimage
    src = Image.open(take).convert('RGB')
    if half == 'right':
        src = src.crop((src.width // 2, 0, src.width, src.height))
    src = src.resize((768, 960), Image.LANCZOS) if src.size != (768, 960) else src
    if shut_take is not None:  # (World 10's spikes: the step of the first round's open half, which painted a spike either side of the
        # way through and two more by the pillars, put back under the round-2 gate)
        sh = Image.open(shut_take).convert('RGB').crop((768, 0, 1536, 960))
        y0 = 800
        band = sh.crop((0, y0, 768, 960))
        src.paste(band, (0, y0))
    m = doorway_mask(src, world)
    c = src.convert('RGBA')
    if m is None:
        return c
    ys, xs = np.where(m)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    w, h = x1 - x0 + 1, y1 - y0 + 1
    far = Image.open(R / f'src/assets/backdrops/w{world}-far.webp').convert('RGB')
    # (a tall slice from the middle of the painting, inside its bounds: its sky above, its land below)
    beyond = far.crop((round(far.width * 0.36), round(far.height * 0.12), round(far.width * 0.56), round(far.height * 0.92)))
    beyond = np.asarray(beyond.resize((w, h), Image.LANCZOS)).astype(np.float32)
    col = np.array(GLOW[world], np.float32)
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w * 0.55)) ** 2 + ((yy - h * 0.62) / (h * 0.62)) ** 2)
    light = np.clip(1.15 - d, 0, 1)[..., None]
    out = beyond * 0.55 + col * 0.45
    out = out * (0.55 + 0.6 * light) + np.array([255, 250, 230], np.float32) * (light ** 3) * 0.55
    # (the edges of the way through stay a little in shadow, so the frame reads)
    edge = np.clip(ndimage.distance_transform_edt(m[y0:y1 + 1, x0:x1 + 1]) / 14, 0, 1)[..., None]
    out = out * (0.45 + 0.55 * edge)
    a = np.asarray(c).astype(np.float32)
    sub = a[y0:y1 + 1, x0:x1 + 1]
    mm = m[y0:y1 + 1, x0:x1 + 1]
    sub[mm, :3] = np.clip(out, 0, 255)[mm]
    a[y0:y1 + 1, x0:x1 + 1] = sub
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def water_irregular(world):
    """round 3 (lead review: World 5's swirls came back every ~210 px): World 6's chop re-toned as before, but laid in uneven pieces,
    each its own width, offset, height and flip, so the model has no beat to copy"""
    import random
    rnd = random.Random(world * 31 + 7)
    src = sheet('src/assets/props/w6-water.webp')
    chop = src.crop((0, 158, 183, 244)).convert('RGB')
    a = np.asarray(chop).astype(np.float32)
    lum = a.mean(axis=2, keepdims=True) / 255
    top, deep = (np.array(c, np.float32) for c in WATER[world])
    rows = np.linspace(0, 1, a.shape[0])[:, None, None]
    base = top * (1 - rows) + deep * rows
    tone = Image.fromarray(np.clip(base * (0.6 + lum * 0.9), 0, 255).astype(np.uint8))
    s = Image.new('RGB', (1536, 384), MAG)
    body = Image.new('RGB', (1536, 260), tuple(int(v) for v in deep))
    x = 0
    while x < 1536:
        pw = rnd.randint(150, 330)
        piece = tone.crop((rnd.randint(0, 60), 0, 183, 86)).resize((pw + 40, rnd.randint(230, 270)), Image.LANCZOS)
        if rnd.random() < 0.5:
            piece = piece.transpose(Image.FLIP_LEFT_RIGHT)
        body.paste(piece, (x - 20, rnd.randint(-6, 6)))
        x += pw
    s.paste(body, (0, 124))
    d = ImageDraw.Draw(s)
    for _ in range(4 if world == 5 else 0):  # (a few petals, here and there, not in a row)
        px, py = rnd.randint(40, 1500), rnd.randint(122, 150)
        d.ellipse([px, py, px + rnd.randint(14, 22), py + 7], fill=(236, 180, 200))
    return s


def gate(world):
    s = Image.new('RGBA', (1536, 960), MAG + (255,))
    s.alpha_composite(gate_half(world, False), (0, 0))
    s.alpha_composite(gate_half(world, True), (768, 0))
    return s


def gate_w5():
    """World 5: its painted exit totem (w5-props 'totem') as the open gate; shut, the same totem with its little door wrapped in silk and
    its orchid closed to a bud (w5-props 'orchidClosed')"""
    s = Image.new('RGBA', (1536, 960), MAG + (255,))
    tot = prop('src/assets/props/w5-props.webp', 'src/game/w5PropsData.ts', 'totem')
    t = fit(tot, tot.width * 880 / tot.height, 880)
    for k, open_ in enumerate((False, True)):
        c = Image.new('RGBA', (768, 960), MAG + (255,))
        x0 = (768 - t.width) // 2
        c.alpha_composite(t, (x0, 960 - t.height - 30))
        if not open_:
            d = ImageDraw.Draw(c)
            # (the door, low in the trunk, wrapped across in silk)
            dx, dy = x0 + t.width * 0.58, 960 - 30 - t.height * 0.2
            dw, dh = t.width * 0.16, t.height * 0.11
            d.ellipse([dx - dw, dy - dh * 1.2, dx + dw, dy + dh], fill=(236, 232, 226, 255), outline=(90, 80, 80, 255), width=4)
            for j in range(-3, 4):
                d.line([(dx - dw, dy + j * dh * 0.3), (dx + dw, dy + j * dh * 0.3 - dh * 0.25)], fill=(170, 160, 160, 255), width=3)
            # (the orchid on top closed to a bud)
            bud = prop('src/assets/props/w5-props.webp', 'src/game/w5PropsData.ts', 'orchidClosed')
            b = fit(bud, t.width * 0.36, t.width * 0.36 * bud.height / bud.width)
            top = 960 - 30 - t.height
            cut_y = top + t.height * 0.31
            ImageDraw.Draw(c).rectangle([x0 - 4, top - 10, x0 + t.width + 4, cut_y], fill=MAG + (255,))
            # (the bloom gone: the bud stands on the trunk's top)
            c.alpha_composite(b, (round(x0 + t.width * 0.5 - b.width / 2), round(cut_y - b.height + 14)))
            q = np.asarray(c).astype(np.float32)
            paint = q[..., 1] > np.minimum(q[..., 0], q[..., 2]) - 60
            q[paint, :3] *= 0.8
            c = Image.fromarray(np.clip(q, 0, 255).astype(np.uint8), 'RGBA')
        s.alpha_composite(c, (k * 768, 0))
    return s


def flag():
    W, H = 512, 768
    s = Image.new('RGBA', (1024, 768), MAG + (255,))
    base = prop('src/assets/props/w5-props.webp', 'src/game/w5PropsData.ts', 'flag')
    leaves = sheet('src/assets/flora/leaves-atlas.webp')
    LF = frames_ts('src/game/leafAtlasData.ts')
    for k, lit in enumerate((False, True)):
        c = Image.new('RGBA', (W, H), MAG + (255,))
        b = fit(base, 142 * 2.6, 237 * 2.6)
        # (the lace pennant re-toned to woven leaves: its pale cloth to leaf green, muted when unlit, a warm gold-green when lit)
        a = np.asarray(b).astype(np.float32)
        hh, ww = a.shape[:2]
        yy, xx = np.mgrid[0:hh, 0:ww]
        pale = (a[..., :3].mean(axis=2) > 150) & (xx > ww * 0.22) & (yy < hh * 0.45)
        lum = a[..., :3].mean(axis=2, keepdims=True) / 255
        tone = np.array((150, 170, 96) if lit else (104, 120, 92), np.float32)
        a[pale, :3] = (tone * (0.55 + lum * 0.6))[pale]
        b = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
        bx, by = 60, H - b.height - 20
        c.alpha_composite(b, (bx, by))
        names = [n for n in LF if n.startswith('warm' if lit else 'green')][:5]
        for i, n in enumerate(names):
            x, y, w, h = LF[n]
            lf = leaves.crop((x, y, x + w, y + h)).resize((round(w * 1.3), round(h * 1.3)), Image.LANCZOS).rotate(-70 + i * 8, expand=True)
            if not lit:
                q = np.asarray(lf).astype(np.float32)
                g = q[..., :3].mean(axis=2, keepdims=True)
                q[..., :3] = q[..., :3] * 0.55 + g * 0.45 - 18
                lf = Image.fromarray(np.clip(q, 0, 255).astype(np.uint8), 'RGBA')
            c.alpha_composite(lf, (round(bx + ww * 0.3 + i * 44), round(by + hh * 0.14 + i * 9)))
        if lit:  # (a warm glowing bead at the post's top: the light the game's glow sits on)
            d = ImageDraw.Draw(c)
            d.ellipse([bx + ww * 0.1 - 6, by + 4, bx + ww * 0.1 + 46, by + 58], fill=(255, 214, 90, 255), outline=(90, 50, 20, 255), width=5)
            d.ellipse([bx + ww * 0.1 + 6, by + 14, bx + ww * 0.1 + 22, by + 28], fill=(255, 250, 220, 255))
        else:
            q = np.asarray(c).astype(np.float32)
            paint = q[..., 1] > np.minimum(q[..., 0], q[..., 2]) - 60
            q[paint, :3] *= 0.85
            c = Image.fromarray(np.clip(q, 0, 255).astype(np.uint8), 'RGBA')
        s.alpha_composite(c, (k * W, 0))
    return s


WATER = {  # (top, deep) colours each world's water is re-toned to
    1: ((132, 92, 44), (52, 34, 18)),
    3: ((40, 74, 104), (8, 18, 34)),
    4: ((82, 116, 124), (26, 42, 52)),
    5: ((150, 128, 150), (70, 52, 78)),
}


def water(world):
    src = sheet('src/assets/props/w6-water.webp')
    chop = src.crop((0, 158, 183, 244)).convert('RGB')
    a = np.asarray(chop).astype(np.float32)
    lum = a.mean(axis=2, keepdims=True) / 255
    top, deep = (np.array(c, np.float32) for c in WATER[world])
    rows = np.linspace(0, 1, a.shape[0])[:, None, None]
    base = top * (1 - rows) + deep * rows
    out = base * (0.6 + lum * 0.9)
    tile = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).resize((384, 260), Image.LANCZOS)
    s = Image.new('RGB', (1536, 384), MAG)
    for x in range(0, 1536, 384):
        s.paste(tile if (x // 384) % 2 == 0 else tile.transpose(Image.FLIP_LEFT_RIGHT), (x, 124))
    if world == 1:  # floating leaves on the tea-brown water
        leaves = sheet('src/assets/flora/leaves-atlas.webp')
        LF = frames_ts('src/game/leafAtlasData.ts')
        sr = s.convert('RGBA')
        for i, n in enumerate([n for n in LF if n.startswith('warm')][:5]):
            x, y, w, h = LF[n]
            lf = leaves.crop((x, y, x + w, y + h)).resize((round(w * 1.3), round(h * 0.6)), Image.LANCZOS)
            sr.alpha_composite(lf, (120 + i * 290, 120))
        s = sr.convert('RGB')
    return s


HEART = [(12, 21.35), (2, 8.5), (7.5, 3), (12, 5.09), (16.5, 3), (22, 8.5)]


def heart_poly(cx, cy, r, n=120):
    pts = []
    for i in range(n):
        t = i / n * 2 * math.pi
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((cx + x * r / 17, cy + y * r / 17))
    return pts


def shaded(size, poly, c0, c1, ink=(58, 36, 20)):
    """a flat shape with a two-tone shade (light upper left) and a dark ink outline"""
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).polygon(poly, fill=255)
    yy, xx = np.mgrid[0:size[1], 0:size[0]]
    t = np.clip((xx + yy) / (size[0] + size[1]) * 1.4 - 0.2, 0, 1)[..., None]
    col = np.array(c0, np.float32) * (1 - t) + np.array(c1, np.float32) * t
    im = Image.fromarray(np.dstack([col, np.asarray(m)]).astype(np.uint8), 'RGBA')
    ImageDraw.Draw(im).line(poly + [poly[0]], fill=ink + (255,), width=12, joint='curve')
    return im


def pickups():
    s = Image.new('RGBA', (1536, 1024), CYAN + (255,))
    C = 512

    def cell(i):
        return Image.new('RGBA', (C, C), (0, 0, 0, 0)), ((i % 3) * C, (i // 3) * C)

    # heart
    c, at = cell(0)
    c.alpha_composite(shaded((C, C), heart_poly(256, 270, 190), (255, 120, 120), (168, 20, 44)))
    ImageDraw.Draw(c).ellipse([150, 170, 215, 205], fill=(255, 240, 240, 220))
    s.alpha_composite(c, at)
    # super heart: bigger, a gold crown
    c, at = cell(1)
    c.alpha_composite(shaded((C, C), heart_poly(256, 300, 180), (255, 104, 120), (150, 14, 40)))
    crown = [(170, 150), (190, 70), (225, 120), (256, 50), (287, 120), (322, 70), (342, 150)]
    c.alpha_composite(shaded((C, C), crown, (255, 238, 140), (210, 140, 20)))
    ImageDraw.Draw(c).ellipse([160, 200, 222, 236], fill=(255, 240, 240, 220))
    s.alpha_composite(c, at)
    # speed: a green leaf pod with a gold bolt
    c, at = cell(2)
    pod = [(256 + 180 * math.cos(t) * (0.75 + 0.25 * math.sin(t)), 256 + 190 * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 90, endpoint=False)]
    c.alpha_composite(shaded((C, C), pod, (150, 232, 120), (30, 120, 70)))
    bolt = [(276, 120), (180, 290), (250, 290), (226, 400), (330, 220), (262, 220), (300, 120)]
    c.alpha_composite(shaded((C, C), bolt, (255, 230, 110), (230, 130, 20)))
    s.alpha_composite(c, at)
    # shield: a gold star
    c, at = cell(3)
    star = [(256 + (200 if k % 2 == 0 else 86) * math.cos(-math.pi / 2 + k * math.pi / 5), 266 + (200 if k % 2 == 0 else 86) * math.sin(-math.pi / 2 + k * math.pi / 5)) for k in range(10)]
    c.alpha_composite(shaded((C, C), star, (255, 244, 160), (220, 130, 10)))
    s.alpha_composite(c, at)
    # magnet: a violet-blue orb with a pale swirl
    c, at = cell(4)
    orb = [(256 + 170 * math.cos(t), 256 + 170 * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 90, endpoint=False)]
    c.alpha_composite(shaded((C, C), orb, (170, 150, 255), (60, 40, 150)))
    d = ImageDraw.Draw(c)
    d.arc([140, 160, 372, 352], 200, 340, fill=(230, 225, 255, 255), width=16)
    d.ellipse([196, 186, 236, 216], fill=(255, 255, 255, 230))
    s.alpha_composite(c, at)
    # (a spare: a second plain heart, a little turned)
    c, at = cell(5)
    c.alpha_composite(shaded((C, C), heart_poly(256, 270, 170), (255, 130, 130), (176, 26, 50)).rotate(-10))
    s.alpha_composite(c, at)
    return s


def thorn():
    s = Image.new('RGBA', (1024, 512), CYAN + (255,))
    vine = piece(8, 'liana')
    for k, open_ in enumerate((False, True)):
        c = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
        rr = 175 if open_ else 145
        disc = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
        ImageDraw.Draw(disc).ellipse([256 - rr * 0.86, 256 - rr, 256 + rr * 0.86, 256 + rr], fill=(70, 30, 110, 255) if open_ else (44, 24, 60, 255))
        disc.alpha_composite(glow((512, 512), 256, 256, rr, (170, 110, 250), 1.0 if open_ else 0.4))
        if open_:
            disc.alpha_composite(glow((512, 512), 256, 256, rr * 0.55, (240, 228, 255), 1.0))
        m = Image.new('L', (512, 512), 0)
        ImageDraw.Draw(m).ellipse([256 - rr * 0.86, 256 - rr, 256 + rr * 0.86, 256 + rr], fill=255)
        c.paste(disc, (0, 0), m)
        seg = fit(vine, 60, 160)
        r = 190 if open_ else 160
        for i in range(14):
            a = i / 14 * 2 * math.pi
            sg = seg.rotate(-math.degrees(a), expand=True)
            c.alpha_composite(sg, (round(256 + math.cos(a) * r * 0.86 - sg.width / 2), round(256 + math.sin(a) * r - sg.height / 2)))
        d = ImageDraw.Draw(c)
        for i in range(18):  # thorns pointing out
            a = i / 18 * 2 * math.pi + 0.2
            x, y = 256 + math.cos(a) * (r + 18) * 0.86, 256 + math.sin(a) * (r + 18)
            nx, ny = math.cos(a), math.sin(a)
            d.polygon([(x - ny * 12, y + nx * 12), (x + nx * 46, y + ny * 46), (x + ny * 12, y - nx * 12)], fill=(210, 190, 160, 255), outline=(40, 26, 30, 255))
        if not open_:  # brambles woven across the way
            for a0 in (0.6, 2.2, 3.9, 5.3):
                sg = fit(vine, 50, 300).rotate(math.degrees(a0), expand=True)
                c.alpha_composite(sg, (256 - sg.width // 2, 256 - sg.height // 2))
        s.alpha_composite(c, (k * 512, 0))
    return s


def net():
    s = Image.new('RGBA', (1024, 384), MAG + (255,))
    for k, torn in enumerate((False, True)):
        c = Image.new('RGBA', (512, 384), (0, 0, 0, 0))
        d = ImageDraw.Draw(c)
        twine, ink = (214, 196, 152, 255), (70, 52, 30, 255)
        cx, floor, rx, ry = 256, 330, 205, 250
        # a diamond mesh of twine clipped to a dome (half ellipse) over the nest
        mesh = Image.new('RGBA', (512, 384), (0, 0, 0, 0))
        md = ImageDraw.Draw(mesh)
        for col, wd in ((ink, 11), (twine, 6)):
            for o in range(-600, 700, 46):
                md.line([(o, floor + 20), (o + 420, floor - 400)], fill=col, width=wd)
                md.line([(o, floor + 20), (o - 420, floor - 400)], fill=col, width=wd)
        m = Image.new('L', (512, 384), 0)
        ImageDraw.Draw(m).pieslice([cx - rx, floor - ry, cx + rx, floor + ry], 180, 360, fill=255)
        if torn:  # (a ragged hole torn in the top)
            pts = [(cx + (70 + 18 * math.sin(t * 7)) * math.cos(t), 170 + (55 + 14 * math.cos(t * 5)) * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 40)]
            ImageDraw.Draw(m).polygon(pts, fill=0)
        c.paste(mesh, (0, 0), m)
        d.arc([cx - rx, floor - ry, cx + rx, floor + ry], 180, 360, fill=ink, width=13)
        d.arc([cx - rx, floor - ry, cx + rx, floor + ry], 180, 360, fill=twine, width=7)
        if torn:  # loose frayed ends hanging into the hole
            for x0, y0 in ((200, 150), (236, 122), (290, 126), (318, 160)):
                d.line([(x0, y0), (x0 + 8, y0 + 50)], fill=ink, width=9)
                d.line([(x0, y0), (x0 + 8, y0 + 50)], fill=twine, width=5)
        for px in (cx - rx, cx + rx):
            d.rectangle([px - 12, floor - 30, px + 12, floor + 44], fill=(124, 74, 30, 255), outline=(28, 20, 12, 255), width=4)
        s.alpha_composite(c, (k * 512, 0))
    return s


def finds():
    s = Image.new('RGBA', (1024, 1024), CYAN + (255,))
    fern = prop('src/assets/props/w5-props.webp', 'src/game/w5PropsData.ts', 'fern')
    bell = prop('src/assets/props/w5-props.webp', 'src/game/w5PropsData.ts', 'bell')
    for row, (pc, w) in enumerate(((fern, 440), (bell, 330))):
        for k, lit in enumerate((False, True)):
            c = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
            p = fit(pc, w, w * pc.height / pc.width)
            if lit:  # (lit: warmer and brighter; the game lays its own soft glow behind it)
                a = np.asarray(p).astype(np.float32)
                a[..., 0] = a[..., 0] * 1.15 + 30
                a[..., 1] = a[..., 1] * 1.12 + 22
                a[..., 2] = a[..., 2] * 0.95
                p = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
            c.alpha_composite(p, ((512 - p.width) // 2, 480 - p.height))
            s.alpha_composite(c, (k * 512, row * 512))
    return s


if __name__ == '__main__' and len(sys.argv) > 2 and sys.argv[1] == 'lit':
    # round 3: python3 -I tools/art/hfbatch/stagestarts.py lit <takes dir>  (the open gates lit from inside, World 5 and 4's water redone)
    T = Path(sys.argv[2])
    picks = json.loads((Path(__file__).resolve().parent / 'stage-picks.json').read_text())
    for w in list(GATE) + [5]:
        if w == 5:
            im = gate_lit_from(5, T / f"{picks['gate-w5']}.webp", half='right')
        else:
            im = gate_lit_from(w, T / f"{picks[f'gateopen-w{w}']}.webp", T / f"{picks[f'gate-w{w}']}.webp" if w == 10 else None)
        im.convert('RGB').save(OUT / f'start-gatelit-w{w}.webp', 'WEBP', quality=92)
        print(OUT / f'start-gatelit-w{w}.webp')
    for w in (4, 5):
        water_irregular(w).save(OUT / f'start-water2-w{w}.webp', 'WEBP', quality=92)
        print(OUT / f'start-water2-w{w}.webp')
    sys.exit(0)

if __name__ == '__main__' and len(sys.argv) > 2 and sys.argv[1] == 'open':
    # round 2: python3 -I tools/art/hfbatch/stagestarts.py open <takes dir>  (the open gates from the picked shut takes)
    picks = json.loads((Path(__file__).resolve().parent / 'stage-picks.json').read_text())
    for k, v in picks.items():
        if k.startswith('gate-w') and int(k[6:]) in GATE:
            w = int(k[6:])
            im = gate_open_from(w, Path(sys.argv[2]) / f'{v}.webp')
            im.save(OUT / f'start-gateopen-w{w}.webp', 'WEBP', quality=92)
            print(OUT / f'start-gateopen-w{w}.webp')
    sys.exit(0)

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    out = {'start-flag.webp': flag(), 'start-pickups.webp': pickups(), 'start-thorn.webp': thorn(), 'start-net.webp': net(),
           'start-finds.webp': finds()}
    for w in GATE:
        out[f'start-gate-w{w}.webp'] = gate(w)
    out['start-gate-w5.webp'] = gate_w5()
    for w in WATER:
        out[f'start-water-w{w}.webp'] = water(w)
    for n, im in out.items():
        im.convert('RGB').save(OUT / n, 'WEBP', quality=92)
        print(OUT / n, im.size)
