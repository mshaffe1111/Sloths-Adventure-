"""Shared helpers for World 10's HF art cuts (2026-10-29): keys (magenta via w6to10/geminicut.cut_cell plus the wider despill of
hfbatch/chairscut.py; black for light, alpha from brightness), packing frames into one webp + {name: {x, y, w, h, ax, ay}} json, and the
review sheets (every candidate, the pick on dark and mid-grey, and at game size)."""
import json, sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

GAME = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(GAME / 'tools/art/w6to10'))
from geminicut import cut_cell  # noqa: E402

DARK, GREY = (20, 16, 24), (128, 128, 128)


def key_magenta(im):
    """full-canvas key (cut_cell crops to its bbox; two 7 px marker blocks in the corners of an 8 px key margin pin that bbox to the
    padded canvas, and the margin is cut off again, so coordinates stay those of the input)"""
    W, H = im.size
    pad = Image.new('RGB', (W + 16, H + 16), (255, 0, 255))
    pad.paste(im.convert('RGB'), (8, 8))
    d = ImageDraw.Draw(pad)
    d.rectangle((0, 0, 6, 6), fill=(60, 60, 60)); d.rectangle((W + 9, H + 9, W + 15, H + 15), fill=(60, 60, 60))
    sp = cut_cell(pad, 'magenta', {})
    assert sp.size == pad.size, (sp.size, pad.size)
    sp = sp.crop((8, 8, W + 8, H + 8))
    a = np.asarray(sp).astype(np.float32)
    band = ndimage.binary_dilation(a[..., 3] < 128, iterations=4) & (a[..., 3] > 0)
    ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 6, 0, None) * band
    a[..., 0] -= ex; a[..., 2] -= ex
    # (any pixel still clearly magenta (r and b well above g) is key the flood missed: drop it)
    mag = (np.minimum(a[..., 0], a[..., 2]) - a[..., 1] > 60)
    a[..., 3][mag] = 0
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def key_black(im, floor=10, gain=1.0):
    """light painted on black -> straight-alpha RGBA: alpha from the brightest channel, colour un-premultiplied, so drawn normally it
    matches the painting on black and drawn additively ('lighter') it adds the same light"""
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    m = a.max(axis=2)
    al = np.clip((m - floor) / (255 - floor) * gain, 0, 1)
    rgb = np.where(al[..., None] > 0.004, np.clip(a / np.maximum(al[..., None] * 255, 1) * 255, 0, 255), 0)
    return Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA')


def edge_fade(im, px, sides='lr'):
    """fade alpha to 0 over px at the given sides (l r t b), so a crop out of a painted glow has no hard edge"""
    a = np.asarray(im).astype(np.float32)
    H, W = a.shape[:2]
    m = np.ones((H, W), np.float32)
    r = lambda n: np.clip(np.arange(n) / px, 0, 1)
    if 'l' in sides: m *= r(W)[None, :]
    if 'r' in sides: m *= r(W)[::-1][None, :]
    if 't' in sides: m *= r(H)[:, None]
    if 'b' in sides: m *= r(H)[::-1][:, None]
    a[..., 3] *= m * m * (3 - 2 * m)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def trim(im, th=4):
    bb = im.getchannel('A').point(lambda v: 255 if v > th else 0).getbbox()
    return im.crop(bb), bb


def pack(frames, width=2048, pad=4):
    """frames: [(name, RGBA, ax, ay)] -> sheet, {name: {x, y, w, h, ax, ay}} (shelf packing, rows by height)"""
    x = y = rowh = 0
    pos = {}
    for n, im, ax, ay in frames:
        if x + im.width > width:
            x, y, rowh = 0, y + rowh + pad, 0
        pos[n] = (x, y)
        x += im.width + pad
        rowh = max(rowh, im.height)
    W = min(width, max(pos[n][0] + im.width for n, im, _, _ in frames))
    S = Image.new('RGBA', (W, y + rowh), (0, 0, 0, 0))
    data = {}
    for n, im, ax, ay in frames:
        S.alpha_composite(im, pos[n])
        data[n] = {'x': pos[n][0], 'y': pos[n][1], 'w': im.width, 'h': im.height, 'ax': round(ax, 1), 'ay': round(ay, 1)}
    return S, data


def write(out_dir, name, frames, meta=None, q=88):
    S, data = pack(frames)
    out_dir.mkdir(parents=True, exist_ok=True)
    p = out_dir / f'{name}.webp'
    S.save(p, 'WEBP', quality=q, method=6)
    j = {'image': f'{name}.webp', 'size': [S.width, S.height], 'frames': data}
    if meta:
        j.update(meta)
    (out_dir / f'{name}.json').write_text(json.dumps(j, indent=1))
    print(p, S.size, p.stat().st_size)
    return S, data


def on(im, col):
    bg = Image.new('RGBA', im.size, col + (255,))
    bg.alpha_composite(im)
    return bg.convert('RGB')


def on_add(im, col):
    """additive look: the RGBA light added onto a ground"""
    a = np.asarray(im).astype(np.float32)
    add = a[..., :3] * a[..., 3:] / 255
    return Image.fromarray(np.clip(np.array(col, np.float32) + add, 0, 255).astype(np.uint8))


def review(path, title, takes, pick_name, picks, game_k=0.3, additive=False, tw=420):
    """takes: [(name, RGB image)]; picks: [(label, RGBA)] shown on dark and on mid-grey, full size and at game size"""
    rows = []
    th = max(round(tw * im.height / im.width) for _, im in takes)
    cols = min(4, len(takes))
    W = max(cols * (tw + 8), 1200)
    shown = []
    for n, im in takes:
        shown.append((n + ('  <- PICK' if n == pick_name else ''), im.convert('RGB').resize((tw, round(tw * im.height / im.width)), Image.LANCZOS)))
    H = 30 + ((len(shown) + cols - 1) // cols) * (th + 22)
    blocks = []
    for label, im in picks:
        k = min(1.0, (W - 20) / 2 / im.width, 700 / im.height)
        big = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        small = im.resize((max(1, round(im.width * game_k)), max(1, round(im.height * game_k))), Image.LANCZOS)
        blocks.append((label, big, small, k))
    for label, big, small, k in blocks:
        H += big.height + 30 + small.height + 30
    S = Image.new('RGB', (W, H), (34, 34, 38))
    d = ImageDraw.Draw(S)
    d.text((6, 6), title, fill=(255, 255, 255))
    for i, (n, im) in enumerate(shown):
        x, y = (i % cols) * (tw + 8), 30 + (i // cols) * (th + 22)
        d.text((x + 3, y), n, fill=(255, 230, 0))
        S.paste(im, (x, y + 16))
    y = 30 + ((len(shown) + cols - 1) // cols) * (th + 22)
    f = on_add if additive else on
    for label, big, small, k in blocks:
        d.text((4, y + 6), f'{label}: on dark #141018 (left) and mid-grey #808080 (right), shown at x{k:.2f}', fill=(255, 230, 0))
        S.paste(f(big, DARK), (0, y + 24)); S.paste(f(big, GREY), (W // 2, y + 24))
        y += big.height + 30
        d.text((4, y + 4), f'{label} at game size (x{game_k})', fill=(255, 230, 0))
        S.paste(f(small, DARK), (0, y + 22)); S.paste(f(small, GREY), (small.width + 20, y + 22))
        y += small.height + 30
    path.parent.mkdir(parents=True, exist_ok=True)
    S.save(path, 'JPEG', quality=86)
    print(path, S.size)
