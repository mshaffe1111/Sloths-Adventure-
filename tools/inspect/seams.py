#!/usr/bin/env python3
"""
The seam detector: reads the frames of a stage walk (tools/inspect/walk.mjs) and flags what makes a stage look unclean.

  python3 tools/inspect/seams.py WALKDIR [--stages 1-2,5-1] [--kinds line,shape,...] [--no-crops]

Each frame comes with the game's canvas exactly as drawn and a log of every draw call on it (walkHook.js), so a finding is tied to
the picture or code shape that causes it, and the findings are grouped by cause (one bad ground tile covers hundreds of spots).

What it flags (kind: what):
  line      a hard straight vertical or horizontal line: the colour steps sharply along a straight line (a tile join, a strip join,
            a cut-out edge, a ground column's cut side), or a thin dark or light line (a dark outline round a backdrop strip).
            Lines exactly on a drawn piece's edge are 'edge' (high confidence); lines inside one picture are 'baked' and only
            reported when long, since some pictures have straight lines in them on purpose (stone, planks).
  fringe    a light halo or dark ring round a cut-out picture (checked on the picture file itself, then shown where it is drawn)
  key       magenta or green key colour left on a cut-out's edge, or near-pure key colour on screen
  repeat    the same patch of pixels again within a short distance (copy-paste tiling), or the same piece drawn several times close
            together in one view
  style     a piece drawn far blurrier (blown up) or with a far heavier outline than the pieces around it
  shape     a code-drawn shape bigger than a few pixels still showing: a flat-colour rect, circle/ellipse or polygon, a code line or
            dashed line, a large smooth gradient blob, or a flat area of one colour the log cannot explain
  float     a prop with a flat, solid base drawn with empty space between its base and the ground under it (colliders from the stage)
  hud       a HUD element or text cut off by the screen's edges, or text on top of other text

Outputs, in WALKDIR: seams.json (every finding), seams.md (by cause, with counts per stage), and per stage and orientation
finds/*.jpg (a crop of each finding, the spot boxed) and sheet.jpg (the contact sheet of the walk, findings marked).
Needs numpy, Pillow, opencv-python-headless, scipy.
"""
import argparse
import json
import math
import os
import re
import sys
from collections import defaultdict

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

# ───────────────────────────── what is what ─────────────────────────────

# pictures of things that move or are picked up: not scenery, so not judged for seams, repeats or floating
ACTOR = re.compile(
    r'move-|hero|pokey|sloth|dot-|dotperch|flicker|meeca|petal|fruit|berry|heart|relic|gem|coin|medal|butterfl|bird|hummingbird|'
    r'parrot|toucan|eagle|harpy|frog|jaguar|ocelot|caiman|croc|boa|snake|monkey|capuchin|spider|tarantula|mantis|bat|golem|guard|'
    r'drake|dozer|dangler|pell|monarch|venom|ironclaw|butler|jennifur|milo|critter|enemy|boss|fx|spark|burst|leaves-atlas|leaf-|'
    r'hud|icon|glow|aura|light|ring|cocoon|egg', re.I)
# backdrop strips: no outlines expected, so a dark ring round one is a fault
STRIP = re.compile(r'(^|[-_/])(far|mid|near|sky|strip|backdrop|canopy)([-_.]|$)|w\dc-|sunrise|kapok|rapids|evening|cavern|sinkhole|terraces|mist|dawn|dusk|twi\d|gold\d', re.I)


def short(name):
    """an asset name without the build hash: props-atlas-CwPSMzgp.webp -> props-atlas.webp"""
    if not name:
        return '?'
    n = re.sub(r'-[A-Za-z0-9_]{8}\.(webp|png|jpg|jpeg|avif)$', r'.\1', name)
    return n[-70:]


def parse_colour(s):
    """a CSS colour string -> (r, g, b, a) or None"""
    if not isinstance(s, str):
        return None
    s = s.strip().lower()
    if s.startswith('#'):
        h = s[1:]
        if len(h) in (3, 4):
            v = [int(c * 2, 16) for c in h]
        elif len(h) in (6, 8):
            v = [int(h[i:i + 2], 16) for i in range(0, len(h), 2)]
        else:
            return None
        return (v[0], v[1], v[2], v[3] / 255 if len(v) == 4 else 1.0)
    m = re.match(r'rgba?\(([^)]*)\)', s)
    if m:
        parts = [p.strip() for p in re.split(r'[ ,/]+', m.group(1)) if p.strip()]
        try:
            r, g, b = [float(p.rstrip('%')) * (2.55 if p.endswith('%') else 1) for p in parts[:3]]
            a = float(parts[3].rstrip('%')) / (100 if parts[3].endswith('%') else 1) if len(parts) > 3 else 1.0
            return (r, g, b, a)
        except ValueError:
            return None
    m = re.match(r'hsla?\(([^)]*)\)', s)
    if m:
        parts = [p.strip() for p in re.split(r'[ ,/]+', m.group(1)) if p.strip()]
        try:
            h = float(parts[0].replace('deg', '')) / 360
            sat = float(parts[1].rstrip('%')) / 100
            li = float(parts[2].rstrip('%')) / 100
            a = float(parts[3].rstrip('%')) / (100 if parts[3].endswith('%') else 1) if len(parts) > 3 else 1.0
            import colorsys
            r, g, b = colorsys.hls_to_rgb(h, li, sat)
            return (r * 255, g * 255, b * 255, a)
        except (ValueError, IndexError):
            return None
    named = {'white': (255, 255, 255), 'black': (0, 0, 0), 'red': (255, 0, 0), 'green': (0, 128, 0), 'blue': (0, 0, 255)}
    if s in named:
        return (*named[s], 1.0)
    return None


def lum(img):
    return img[..., 0] * 0.299 + img[..., 1] * 0.587 + img[..., 2] * 0.114


# ───────────────────────────── the picture files ─────────────────────────────

class Assets:
    """per picture part (file + source rect): halo, dark ring, key leaks, outline width. Read from the built files."""

    def __init__(self, dist):
        self.dir = os.path.join(dist, 'assets') if dist else None
        self.files = {}
        self.parts = {}

    def file(self, name):
        if name in self.files:
            return self.files[name]
        im = None
        if self.dir and re.search(r'\.(webp|png|jpg|jpeg|avif)$', name or '', re.I):
            p = os.path.join(self.dir, os.path.basename(name))
            if os.path.exists(p):
                try:
                    im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
                except Exception:
                    im = None
        self.files[name] = im
        return im

    def part(self, name, s):
        key = (name, tuple(int(round(v)) for v in s))
        if key in self.parts:
            return self.parts[key]
        im = self.file(name)
        out = None
        if im is not None:
            sx, sy, sw, sh = [int(round(v)) for v in s]
            sx, sy = max(0, sx), max(0, sy)
            crop = im[sy:sy + max(1, sh), sx:sx + max(1, sw)]
            if crop.size and crop.shape[0] >= 12 and crop.shape[1] >= 12:
                out = self.measure(crop)
        self.parts[key] = out
        return out

    @staticmethod
    def measure(c):
        a = c[..., 3]
        if a.min() > 250:
            return {'cut': False}
        rgb = c[..., :3]
        L = lum(rgb)
        solid = a > 200
        clear = a < 40
        if solid.sum() < 80 or clear.sum() < 20:
            return {'cut': bool(clear.sum() >= 20)}
        # distance (px) of each solid pixel from the nearest clear one
        dist = ndi.distance_transform_edt(~clear)
        ring = lambda k0, k1: solid & (dist > k0) & (dist <= k1)
        edge = ring(0, 2.0)
        inner = ring(4, 8)
        if edge.sum() < 30 or inner.sum() < 30:
            return {'cut': True}
        # a light halo or a dark ring: the edge band against the paint just inside it, compared spot by spot
        Li = ndi.uniform_filter(np.where(inner, L, 0), 9) / np.maximum(ndi.uniform_filter(inner.astype(np.float32), 9), 1e-3)
        has = ndi.uniform_filter(inner.astype(np.float32), 9) > 0.02
        e = edge & has
        diff = (L - Li)[e]
        light = float((diff > 40).mean()) if diff.size else 0.0
        dark = float((diff < -40).mean()) if diff.size else 0.0
        ratio = float(L[edge].mean() / max(1.0, L[inner].mean()))
        # key colours on the soft edge (any pixel with some alpha next to clear) against the inside
        soft = (a > 20) & (a < 215) & (dist <= 2.5)
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        mag = (r > 110) & (b > 90) & (g < 0.72 * np.minimum(r, b)) & (np.abs(r - b) < 0.4 * np.maximum(r, b))
        grn = (g > 150) & (r < 90) & (b < 110) & (g - np.maximum(r, b) > 80)
        inside = solid & (dist > 5)
        f = lambda m, region: float(m[region].mean()) if region.sum() else 0.0
        # outline width: the run of dark rings from the edge in
        rings = []
        for k in range(1, 11):
            m = solid & (dist > k - 1) & (dist <= k)
            rings.append(float(L[m].mean()) if m.sum() > 10 else np.nan)
        ref = np.nanmedian(rings[6:10]) if not all(np.isnan(rings[6:10])) else np.nan
        width = 0
        if not np.isnan(ref):
            for v in rings:
                if not np.isnan(v) and v < 0.62 * ref:
                    width += 1
                else:
                    break
        # where each fault is worst (picture px), for the proof crops
        spots = {}
        full = np.zeros_like(L)
        full[e] = (L - Li)[e]
        if light > 0:
            sm = ndi.uniform_filter(np.where(full > 40, 1.0, 0.0), 25)
            spots['light'] = [int(v) for v in np.unravel_index(int(sm.argmax()), sm.shape)[::-1]]
        if dark > 0:
            sm = ndi.uniform_filter(np.where(full < -40, 1.0, 0.0), 25)
            spots['dark'] = [int(v) for v in np.unravel_index(int(sm.argmax()), sm.shape)[::-1]]
        for nm, mm in (('mag', mag & soft), ('grn', grn & soft)):
            if mm.any():
                sm = ndi.uniform_filter(mm.astype(np.float32), 25)
                spots[nm] = [int(v) for v in np.unravel_index(int(sm.argmax()), sm.shape)[::-1]]
        return {
            'spots': spots,
            'cut': True, 'light': round(light, 3), 'dark': round(dark, 3), 'ratio': round(ratio, 2),
            'mag': round(f(mag, soft), 4), 'mag_in': round(f(mag, inside), 4),
            'grn': round(f(grn, soft), 4), 'grn_in': round(f(grn, inside), 4),
            'outline': width,
        }


# ───────────────────────────── one frame ─────────────────────────────

def eff(d):
    """what a draw can cover: its box cut to the clip it was drawn under"""
    b, c = d.get('b'), d.get('c')
    if not b or not c:
        return b
    return [max(b[0], c[0]), max(b[1], c[1]), min(b[2], c[2]), min(b[3], c[3])]


def overlay(d, W=None, H=None):
    """a full-screen wash, vignette or fog drawn over everything: never the cause of a spot"""
    b = d.get('b')
    if not b:
        return True
    if d.get('a', 1) < 0.5 or d.get('op', 'source-over') != 'source-over':
        return True
    return (b[2] - b[0]) * (b[3] - b[1]) > 0.8 * (W or 1688) * (H or 780) and not d.get('w')


def topmost(draws, x, y, kinds=('img', 'fill')):
    """the last-drawn piece whose box holds (x, y)"""
    for d in reversed(draws):
        e = eff(d)
        if d['k'] in kinds and e and e[0] <= x <= e[2] and e[1] <= y <= e[3]:
            if d['k'] == 'fill' and d.get('shape') == 'path2d' or overlay(d):
                continue
            return d
    return None


def label(d):
    if d is None:
        return 'unknown'
    if d['k'] == 'img':
        return short(d['n'])
    st = d.get('style', '')
    if isinstance(st, str) and st.startswith('pattern:'):
        return 'pattern ' + short(st[8:])
    return f"code {d.get('shape', d['k'])} {st if isinstance(st, str) else ''}".strip()


def actor_mask(meta, W, H, hard=True):
    """hard: Pokey, the cast, pickups and words; not hard: glows and pickup bubbles (code-drawn on purpose, small touches)"""
    m = np.zeros((H, W), bool)
    s = meta['s']
    p = meta['player']
    x0, x1 = int(p['cx'] - 45 * s), int(p['cx'] + 45 * s)
    y0, y1 = int(p['cy'] - 80 * s), int(p['cy'] + 12 * s)
    if hard:
        m[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
    for d in meta['draws']:
        if not d.get('b'):
            continue
        bw, bh = d['b'][2] - d['b'][0], d['b'][3] - d['b'][1]
        tiny = bw * bh < 0.06 * W * H
        small_code = d['k'] == 'img' and d.get('n', '').startswith('codecanvas:') and max(d['s'][2], d['s'][3]) <= 160 and tiny
        glow = d['k'] == 'fill' and str(d.get('style', '')).startswith('grad:rad') and tiny
        if (d['k'] in ('img',) and ACTOR.search(d.get('n', '')) or d['k'] == 'text') if hard else (small_code or glow):
            b = d['b']
            m[max(0, int(b[1]) - 2):max(0, int(b[3]) + 2), max(0, int(b[0]) - 2):max(0, int(b[2]) + 2)] = True
    return m


def runs(mask, min_len, gap=3):
    """for each column of a boolean (H, W) array: the runs of True along the column (small gaps closed), as (x, y0, y1)"""
    m = mask.astype(np.uint8)
    if gap:
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((gap * 2 + 1, 1), np.uint8))
    keep = np.where(m.sum(0) >= min_len)[0]
    if not len(keep):
        return []
    sub = m[:, keep].astype(np.int8)
    d = np.diff(np.vstack([np.zeros((1, len(keep)), np.int8), sub, np.zeros((1, len(keep)), np.int8)]), axis=0)
    sy, sx = np.where(d.T == 1)
    ey, ex = np.where(d.T == -1)
    # (both come out ordered by column, then row, so the n-th start goes with the n-th end)
    out = []
    for c, a0, b0 in zip(sy, sx, ex):
        if b0 - a0 >= min_len:
            out.append((int(keep[c]), int(a0), int(b0)))
    return out


def merge_runs(rs):
    """runs in neighbouring columns that overlap are one line"""
    rs = sorted(rs)
    out = []
    for x, a, b in rs:
        for o in out:
            if abs(o[0] - x) <= 2 and a < o[2] and b > o[1]:
                o[1], o[2] = min(o[1], a), max(o[2], b)
                break
        else:
            out.append([x, a, b])
    return out


def find_lines(img, meta, actors, transpose=False):
    """hard steps and thin dark/light lines along straight vertical lines (horizontal ones: transpose)"""
    I = img.transpose(1, 0, 2) if transpose else img
    act = actors.T if transpose else actors
    s = meta['s']
    dpr = meta['dpr']
    # (read at one picture pixel per CSS pixel: four times quicker, and a line thinner than that does not show on a phone)
    K = 2 if dpr >= 2 else 1
    if K > 1:
        I = cv2.resize(np.ascontiguousarray(I), (I.shape[1] // K, I.shape[0] // K), interpolation=cv2.INTER_AREA)
        act = cv2.resize(np.ascontiguousarray(act).astype(np.uint8), (I.shape[1], I.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
    H, W = I.shape[:2]
    L = lum(I)
    found = []
    pad = 4
    Ip = np.pad(I, ((0, 0), (pad, pad), (0, 0)), mode='edge')
    Lp = np.pad(L, ((0, 0), (pad, pad)), mode='edge')
    col = lambda k: Ip[:, pad + k:pad + k + W]
    lcol = lambda k: Lp[:, pad + k:pad + k + W]
    # a hard step between x and x+1: the jump across two pixels against the texture either side
    step = np.abs(col(1) - col(-1)).sum(-1)
    ref = np.maximum(np.abs(col(-1) - col(-3)).sum(-1), np.abs(col(3) - col(1)).sum(-1))
    tex = np.maximum(np.abs(col(-2) - col(-4)).sum(-1), np.abs(col(4) - col(2)).sum(-1))
    hard = (step > 75) & (step > 3.0 * np.maximum(ref, tex) + 12)
    # a thin dark or light line 1-3 px wide
    thin_d = np.zeros((H, W), bool)
    thin_l = np.zeros((H, W), bool)
    for w in (1, 2, 3):
        c = sum(lcol(k) for k in range(w)) / w
        left, right = lcol(-2), lcol(w + 1)
        dk = np.minimum(left - c, right - c)
        lt = np.minimum(c - left, c - right)
        side = np.abs(left - right)
        thin_d |= (dk > 18) & (side < dk * 1.2)
        thin_l |= (lt > 18) & (side < lt * 1.2)
    for m, kind in ((hard, 'step'), (thin_d, 'dark line'), (thin_l, 'light line')):
        m = m & ~act
        m[:, :3] = False
        m[:, -4:] = False
        min_len = int(max(28, 22 * s) / K)
        for x, a, b in merge_runs(runs(m, min_len, gap=2)):
            strength = float((step if kind == 'step' else np.abs(lcol(0) - lcol(-2)))[a:b, x].mean())
            found.append({'x': x * K + K // 2, 'y0': a * K, 'y1': b * K, 'kind': kind, 'strength': round(strength, 1)})
    W, H = W * K, H * K
    out = []
    for f in found:
        x, a, b = f['x'], f['y0'], f['y1']
        # which piece's edge is it on?
        on_edge = None
        inside = None
        for d in reversed(meta['draws']):
            bb = eff(d)
            if not bb or bb[2] <= bb[0] or bb[3] <= bb[1] or d['k'] not in ('img', 'fill') or overlay(d, W, H):
                continue
            if d['k'] == 'fill' and d.get('shape') == 'path2d':
                continue
            x0, y0, x1, y1 = (bb[1], bb[0], bb[3], bb[2]) if transpose else bb
            if y1 < a or y0 > b:
                continue
            rectish = d['k'] == 'img' or d.get('shape') in ('rect', 'poly')
            if rectish and min(abs(x - x0), abs(x - x1), abs(x + 1 - x0), abs(x + 1 - x1)) <= 1.6:
                on_edge = on_edge or d
            elif x0 < x < x1 and inside is None:
                inside = d
            if on_edge:
                break
        conf = 'edge' if on_edge else 'baked'
        # the long side of a thin strip (a rope, a web strand, a rail) is its own outline, not a seam
        if on_edge:
            bb = eff(on_edge)
            thick = (bb[3] - bb[1]) if transpose else (bb[2] - bb[0])
            if thick < 26 * dpr:
                continue
        length = b - a
        # inside one picture only a long colour step counts: thin lines and short steps are often drawn on purpose (mortar, planks)
        if conf == 'baked' and (f['kind'] != 'step' or length < 110 * dpr):
            continue
        if conf == 'edge' and length < 30 * dpr:
            continue
        d = on_edge or inside
        if transpose:
            box = [a, x - 3, b, x + 4]
        else:
            box = [x - 3, a, x + 4, b]
        out.append({'kind': 'line', 'sub': f"{'horizontal' if transpose else 'vertical'} {f['kind']}", 'conf': conf, 'box': box,
                    'len': length, 'strength': f['strength'], 'cause': label(d), 'draw': d})
    return out


def find_shapes(img, meta, actors, soft_mask=None):
    """code-drawn shapes still showing (actors: Pokey, the cast, pickups, words; soft_mask adds glows, for the flat-area check)"""
    soft_mask = actors if soft_mask is None else soft_mask
    H, W = img.shape[:2]
    s = meta['s']
    dpr = meta['dpr']
    out = []
    seen = np.zeros((H, W), bool)
    for d in meta['draws']:
        if d['k'] not in ('fill', 'stroke') or not d.get('b'):
            continue
        if d.get('op', 'source-over') != 'source-over' or d.get('f'):
            continue
        x0, y0, x1, y1 = [int(round(v)) for v in eff(d)]
        cx0, cy0, cx1, cy1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
        if cx1 - cx0 < 2 or cy1 - cy0 < 2:
            continue
        bw, bh = x1 - x0, y1 - y0
        st = d.get('style')
        region = img[cy0:cy1, cx0:cx1]
        if (cx1 - cx0) * (cy1 - cy0) > 0.85 * W * H:
            continue
        if isinstance(st, str) and st.startswith('grad'):
            if d['k'] != 'fill' or min(bw, bh) < 40 * dpr or d.get('a', 1) < 0.5:
                continue
            Lr = lum(region)
            lap = np.abs(cv2.Laplacian(Lr, cv2.CV_32F))
            smooth = float(((lap < 0.6) & ~actors[cy0:cy1, cx0:cx1]).mean())
            if smooth > 0.55:
                out.append({'kind': 'shape', 'sub': f"gradient {d.get('shape')}", 'conf': 'check', 'box': [cx0, cy0, cx1, cy1],
                            'cause': f"code gradient {d.get('shape')} ({st})", 'draw': d, 'share': round(smooth, 2)})
            continue
        c = parse_colour(st)
        if not c:
            continue
        alpha = c[3] * d.get('a', 1)
        if alpha < 0.6:
            continue
        if d['k'] == 'fill':
            if min(bw, bh) < 5 * dpr or bw * bh < (11 * dpr) ** 2:
                continue
        else:
            lw = d.get('lw', 1)
            if lw < 1.6 * dpr or max(bw, bh) < 14 * dpr:
                continue
        # still showing: pixels of that colour in its box
        diff = np.sqrt(((region - np.array(c[:3], np.float32)) ** 2).sum(-1))
        match = (diff < 9) & ~actors[cy0:cy1, cx0:cx1] & ~seen[cy0:cy1, cx0:cx1]
        n = int(match.sum())
        area = bw * bh * (0.785 if d.get('shape') == 'ellipse' else 1.0)
        need = 0.18 * area if d['k'] == 'fill' else 0.25 * max(bw, bh) * d.get('lw', 2)
        if n < max(120, need):
            continue
        seen[cy0:cy1, cx0:cx1] |= match
        col = '#%02x%02x%02x' % tuple(int(v) for v in c[:3])
        sub = ('dashed line' if d.get('dash') else 'code line') if d['k'] == 'stroke' else f"flat {d.get('shape')}"
        out.append({'kind': 'shape', 'sub': sub, 'conf': 'edge', 'box': [cx0, cy0, cx1, cy1], 'cause': f"{sub} {col}", 'draw': d,
                    'share': round(n / max(1, area), 2)})
    # a surface textured by code: a pattern made only of code fills, or a code-made canvas drawn as a piece of the world, still showing
    # (the green pit blocks, code soil and stone): what shows is the part no later solid picture covers
    draws = meta['draws']
    for i, d in enumerate(draws):
        st = str(d.get('style', ''))
        code_pat = d['k'] == 'fill' and st.startswith('pattern:codecanvas')
        code_img = d['k'] == 'img' and d.get('n', '').startswith('codecanvas:') and d.get('w') and max(d['s'][2], d['s'][3]) > 160
        if not (code_pat or code_img) or not d.get('b') or d.get('a', 1) < 0.5:
            continue
        x0, y0, x1, y1 = [int(round(v)) for v in eff(d)]
        cx0, cy0, cx1, cy1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
        if cx1 - cx0 < 24 * dpr or cy1 - cy0 < 16 * dpr or (cx1 - cx0) * (cy1 - cy0) > 0.85 * W * H:
            continue
        vis = np.ones((cy1 - cy0, cx1 - cx0), bool)
        for e in draws[i + 1:]:
            if e['k'] != 'img' or not e.get('b') or e.get('a', 1) < 0.9 or not e.get('edge'):
                continue
            eg = e['edge']
            if min(eg.get('top', 0), eg.get('bottom', 0), eg.get('left', 0), eg.get('right', 0)) < 0.85:
                continue
            ex0, ey0, ex1, ey1 = [int(round(v)) for v in eff(e)]
            vis[max(0, ey0 - cy0):max(0, ey1 - cy0), max(0, ex0 - cx0):max(0, ex1 - cx0)] = False
        vis &= ~actors[cy0:cy1, cx0:cx1]
        n = int(vis.sum())
        if n < (24 * dpr) ** 2 or n < 0.25 * vis.size:
            continue
        name = st[8:] if code_pat else d['n']
        out.append({'kind': 'shape', 'sub': 'code texture', 'conf': 'edge', 'box': [cx0, cy0, cx1, cy1], 'cause': f"code-made texture {name}",
                    'draw': d, 'share': round(n / vis.size, 2)})
        seen[cy0:cy1, cx0:cx1] |= vis
    # flat one-colour areas nothing in the log explains (a code fill through a Path2D, putImageData)
    L = lum(img)
    k = 7
    m1 = cv2.blur(L, (k, k))
    m2 = cv2.blur(L * L, (k, k))
    sd = np.sqrt(np.maximum(0, m2 - m1 * m1))
    cs = np.abs(img[..., 0] - cv2.blur(img[..., 0], (k, k))) + np.abs(img[..., 2] - cv2.blur(img[..., 2], (k, k)))
    flat = (sd < 0.5) & (cs < 1.5) & (L > 14) & ~soft_mask & ~seen
    flat = ndi.binary_opening(flat, iterations=2)
    lab, n = ndi.label(flat)
    if n:
        sizes = ndi.sum(flat, lab, range(1, n + 1))
        for i in np.where(sizes >= (24 * dpr) ** 2)[0]:
            sl = ndi.find_objects((lab == i + 1).astype(np.int8))[0]
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            if (x1 - x0) * (y1 - y0) > 0.6 * W * H:
                continue
            cy, cx = (y0 + y1) // 2, (x0 + x1) // 2
            colr = img[lab == i + 1].mean(0)
            d = topmost(meta['draws'], cx, cy)
            # (a smooth sky or a smooth patch of paint is painted that way: only a flat area under a code fill, or under nothing, counts)
            if d is not None and (not d.get('w') or (d['k'] == 'img' and re.search(r'\.(webp|png|jpe?g|avif)$', d.get('n', '')))):
                continue
            out.append({'kind': 'shape', 'sub': 'flat area', 'conf': 'check', 'box': [int(x0), int(y0), int(x1), int(y1)],
                        'cause': f"flat area under {label(d)}", 'draw': d, 'colour': '#%02x%02x%02x' % tuple(int(v) for v in colr)})
    return out


def find_key(img, meta, actors):
    """near-pure key colour on screen"""
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    mag = (r > 200) & (b > 170) & (g < 90)
    grn = (g > 200) & (r < 60) & (b < 80)
    out = []
    for m, what in ((mag & ~actors, 'magenta'), (grn & ~actors, 'green')):
        lab, n = ndi.label(ndi.binary_dilation(m, iterations=2))
        for i, sl in enumerate(ndi.find_objects(lab) or []):
            if sl is None:
                continue
            cnt = int(m[sl].sum())
            if cnt < 30:
                continue
            y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
            d = topmost(meta['draws'], (x0 + x1) // 2, (y0 + y1) // 2)
            out.append({'kind': 'key', 'sub': f'{what} on screen', 'conf': 'edge', 'box': [x0, y0, x1, y1], 'cause': f"{what} key colour in {label(d)}", 'draw': d, 'px': cnt})
    return out


def find_repeats(img, meta, actors):
    """the same patch of pixels again close by"""
    H, W = img.shape[:2]
    dpr = meta['dpr']
    small = cv2.resize(lum(img), (W // 2, H // 2), interpolation=cv2.INTER_AREA).astype(np.float32)
    act = cv2.resize(actors.astype(np.uint8), (W // 2, H // 2), interpolation=cv2.INTER_NEAREST).astype(bool)
    h, w = small.shape
    P = 28
    hits = defaultdict(list)
    for y in range(0, h - P, P):
        for x in range(0, w - P, P):
            patch = small[y:y + P, x:x + P]
            if act[y:y + P, x:x + P].mean() > 0.05 or patch.std() < 14:
                continue
            # texture with real detail (not a smooth gradient)
            if np.abs(cv2.Laplacian(patch, cv2.CV_32F)).mean() < 3.0:
                continue
            ya, yb = max(0, y - 3), min(h, y + P + 3)
            xa = x + P // 2 + 12
            xb = min(w, x + int(w * 0.9))
            if xb - xa < P + 2:
                continue
            band = small[ya:yb, xa:xb]
            res = cv2.matchTemplate(band, patch, cv2.TM_CCOEFF_NORMED)
            mx = float(res.max())
            if mx < 0.965:
                continue
            yy, xx = np.unravel_index(int(res.argmax()), res.shape)
            dx = xa + xx - x
            dy = ya + yy - y
            if act[y + dy:y + dy + P, x + dx:x + dx + P].mean() > 0.05:
                continue
            d1 = topmost(meta['draws'], 2 * x + P, 2 * y + P)
            if d1 is not None and d1['k'] == 'img' and ACTOR.search(d1.get('n', '')):
                continue
            key = (label(d1), int(round(dx / 3)), dy)
            hits[key].append((2 * x, 2 * y, 2 * (x + dx), 2 * (y + dy), mx))
    out = []
    for (cause, dxq, dy), hs in hits.items():
        if len(hs) < 2:
            continue
        xs = [hh[0] for hh in hs] + [hh[2] + 2 * P for hh in hs]
        ys = [hh[1] for hh in hs] + [hh[3] + 2 * P for hh in hs]
        out.append({'kind': 'repeat', 'sub': 'copy-paste pixels', 'conf': 'edge' if len(hs) >= 4 else 'check',
                    'box': [min(xs), min(ys), max(xs), max(ys)], 'cause': f"repeating pixels in {cause}",
                    'period_css': dxq * 3 * 2 // dpr, 'patches': len(hs), 'draw': topmost(meta['draws'], hs[0][0] + P, hs[0][1] + P),
                    'pairs': [hh[:4] for hh in hs[:6]]})
    # the same piece drawn several times close together (the log says so directly)
    by = defaultdict(list)
    for d in meta['draws']:
        if d['k'] != 'img' or ACTOR.search(d.get('n', '')) or STRIP.search(d.get('n', '')):
            continue
        if d.get('n', '').startswith('codecanvas:') and max(d['s'][2], d['s'][3]) <= 160:
            continue
        b = d['b']
        bw = b[2] - b[0]
        if bw < 40 * dpr / 2 or bw > 0.6 * W:
            continue
        by[(d['n'], tuple(int(v) for v in d['s']), round(d.get('up', 1), 2), d.get('flip'))].append(d)
    for (n, sr, up, flip), ds in by.items():
        if len(ds) < 2:
            continue
        ds.sort(key=lambda q: q['b'][0])
        bw = ds[0]['b'][2] - ds[0]['b'][0]
        close = [q for i, q in enumerate(ds) if any(abs(q['b'][0] - o['b'][0]) < 3 * bw and abs(q['b'][1] - o['b'][1]) < bw for j, o in enumerate(ds) if j != i)]
        if len(close) >= 3 or (len(close) >= 2 and bw > 70 * dpr):
            xs = [q['b'][0] for q in close] + [q['b'][2] for q in close]
            ys = [q['b'][1] for q in close] + [q['b'][3] for q in close]
            out.append({'kind': 'repeat', 'sub': 'same piece', 'conf': 'edge', 'box': [int(max(0, min(xs))), int(max(0, min(ys))), int(min(W, max(xs))), int(min(H, max(ys)))],
                        'cause': f"same piece {short(n)} [{','.join(str(v) for v in sr)}]", 'draw': close[0], 'copies': len(close)})
    return out


def find_style(meta, assets):
    """a piece far blurrier or with a far heavier outline than its neighbours"""
    dpr = meta['dpr']
    out = []
    pieces = [d for d in meta['draws'] if d['k'] == 'img' and d.get('w') and not d.get('rot') and not ACTOR.search(d.get('n', ''))
              and re.search(r'\.(webp|png|jpe?g|avif)$', d.get('n', ''))
              and (d['b'][2] - d['b'][0]) >= 24 * dpr and (d['b'][3] - d['b'][1]) >= 24 * dpr and d.get('a', 1) > 0.6]
    if len(pieces) < 3:
        return out
    ups = np.array([d.get('up', 1) for d in pieces])
    med = float(np.median(ups))
    widths = []
    for d in pieces:
        m = assets.part(d['n'], d['s']) if re.search(r'\.(webp|png|jpe?g|avif)$', d['n']) else None
        d['_ol'] = m.get('outline', 0) * d.get('up', 1) if m and m.get('cut') and m.get('outline') else None
        if d['_ol']:
            widths.append(d['_ol'])
    medw = float(np.median(widths)) if len(widths) >= 3 else None
    for d in pieces:
        up = d.get('up', 1)
        if up > 2.4 * dpr / 2 and up > 3.0 * med:
            out.append({'kind': 'style', 'sub': 'blurry (blown up)', 'conf': 'edge', 'box': [int(v) for v in d['b']],
                        'cause': f"{short(d['n'])} drawn at {up:.1f}x its pixels (others {med:.1f}x)", 'draw': d, 'up': up})
        elif up < med / 3.5 and up < 0.25:
            out.append({'kind': 'style', 'sub': 'much sharper (shrunk)', 'conf': 'check', 'box': [int(v) for v in d['b']],
                        'cause': f"{short(d['n'])} drawn at {up:.2f}x its pixels (others {med:.1f}x)", 'draw': d, 'up': up})
        if medw and d['_ol'] and d['_ol'] > 2.2 * medw and d['_ol'] - medw > 2.5 * dpr:
            out.append({'kind': 'style', 'sub': 'heavy outline', 'conf': 'edge', 'box': [int(v) for v in d['b']],
                        'cause': f"{short(d['n'])} outline {d['_ol'] / dpr:.1f} px (others {medw / dpr:.1f} px)", 'draw': d})
    return out


def find_fringes(meta, assets, W, H):
    """light halos, dark rings and key leaks on the cut-out pictures in view (measured on the files)"""
    out = []
    dpr = meta['dpr']
    for d in meta['draws']:
        if d['k'] != 'img' or not re.search(r'\.(webp|png|jpe?g|avif)$', d.get('n', '')):
            continue
        b = d['b']
        if (b[2] - b[0]) < 16 * dpr or (b[3] - b[1]) < 16 * dpr or d.get('a', 1) < 0.5:
            continue
        m = assets.part(d['n'], d['s'])
        if not m or not m.get('cut') or 'light' not in m:
            continue
        box = [int(max(0, b[0])), int(max(0, b[1])), int(min(W, b[2])), int(min(H, b[3]))]
        strip = bool(STRIP.search(d['n']))
        if m['light'] > 0.12 and m['ratio'] > 1.08:
            out.append({'kind': 'fringe', 'sub': 'light halo', 'conf': 'edge', 'box': box, 'cause': f"light halo on {short(d['n'])}", 'draw': d, 'm': m})
        if strip and m['dark'] > 0.25 and m['ratio'] < 0.8:
            out.append({'kind': 'fringe', 'sub': 'dark ring', 'conf': 'edge', 'box': box, 'cause': f"dark ring on {short(d['n'])}", 'draw': d, 'm': m})
        if m['mag'] > 0.01 and m['mag'] > 4 * m['mag_in']:
            out.append({'kind': 'key', 'sub': 'magenta edge', 'conf': 'edge', 'box': box, 'cause': f"magenta key on the edge of {short(d['n'])}", 'draw': d, 'm': m})
        if m['grn'] > 0.01 and m['grn'] > 4 * m['grn_in']:
            out.append({'kind': 'key', 'sub': 'green edge', 'conf': 'edge', 'box': box, 'cause': f"green key on the edge of {short(d['n'])}", 'draw': d, 'm': m})
    return out


def find_floating(meta, assets):
    """props with a flat solid base and empty space under it"""
    s = meta['s']
    dpr = meta['dpr']
    out = []
    plats = meta.get('plats', [])
    for d in meta['draws']:
        if d['k'] != 'img' or not d.get('w') or d.get('rot') or ACTOR.search(d.get('n', '')) or STRIP.search(d.get('n', '')):
            continue
        b = d['b']
        bw, bh = b[2] - b[0], b[3] - b[1]
        if bw < 20 * dpr or bh < 16 * dpr or d.get('a', 1) < 0.6 or not re.search(r'\.(webp|png|jpe?g|avif)$', d['n']):
            continue
        e = d.get('edge')
        if not e or e.get('bottom', 0) < 0.3 or e.get('foot', 0) < 0.9:
            continue
        foot = b[1] + e['foot'] * bh
        cx0, cx1 = b[0] + bw * 0.3, b[2] - bw * 0.3
        under = [p for p in plats if p['b'][0] < cx1 and p['b'][2] > cx0]
        if not under:
            continue
        # resting on (or sunk into) a ledge: fine
        if any(p['b'][1] - 6 * s <= foot <= p['b'][3] + 4 * s for p in under):
            continue
        below = [p['b'][1] for p in under if p['b'][1] > foot]
        if not below:
            continue
        gap = (min(below) - foot) / s
        if 6 <= gap <= 80:
            out.append({'kind': 'float', 'sub': 'floating prop', 'conf': 'edge', 'box': [int(b[0]), int(b[1]), int(b[2]), int(min(below) + 4)],
                        'cause': f"{short(d['n'])} [{','.join(str(int(v)) for v in d['s'])}] floats", 'draw': d, 'gap': round(gap)})
    return out


def find_hud(meta):
    out = []
    for h in meta.get('hud', []):
        out.append({'kind': 'hud', 'sub': 'cut off' if h['k'] == 'cut' else 'text on text', 'conf': 'edge',
                    'box_css': h['b'], 'cause': f"HUD {'cut off' if h['k'] == 'cut' else 'overlap'}: {h['text'][:50]}"})
    return out


# ───────────────────────────── a walk ─────────────────────────────

def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def crop(img_pil, box, path, colour=(255, 40, 40), others=()):
    W, H = img_pil.size
    x0, y0, x1, y1 = box
    pad = max(60, int(0.35 * max(x1 - x0, y1 - y0)))
    cx0, cy0 = max(0, x0 - pad), max(0, y0 - pad)
    cx1, cy1 = min(W, x1 + pad), min(H, y1 + pad)
    # never a huge crop: a long line is shown at its middle
    if cx1 - cx0 > 900:
        mid = (x0 + x1) // 2
        cx0, cx1 = max(0, mid - 450), min(W, mid + 450)
    if cy1 - cy0 > 700:
        mid = (y0 + y1) // 2
        cy0, cy1 = max(0, mid - 350), min(H, mid + 350)
    c = img_pil.crop((cx0, cy0, cx1, cy1)).convert('RGB')
    dr = ImageDraw.Draw(c)
    for o in others:
        dr.rectangle([o[0] - cx0 - 2, o[1] - cy0 - 2, o[2] - cx0 + 2, o[3] - cy0 + 2], outline=(255, 170, 40), width=2)
    dr.rectangle([x0 - cx0 - 3, y0 - cy0 - 3, x1 - cx0 + 3, y1 - cy0 + 3], outline=colour, width=3)
    c.save(path, quality=85)


_ASSETS = {}


def frame_finds(job):
    """every finding in one frame, one per cause (a cause's spots in the frame are listed under it); runs in a worker"""
    wd, fr, kinds, crops, w = job
    dist = w.get('dist')
    if dist not in _ASSETS:
        _ASSETS[dist] = Assets(dist)
    assets = _ASSETS[dist]
    cdir = os.path.join(wd, 'canvas')
    fdir = os.path.join(wd, 'finds')
    meta = json.load(open(os.path.join(cdir, fr + '.json')))
    pil = Image.open(os.path.join(cdir, fr + '.png')).convert('RGB')
    img = np.asarray(pil).astype(np.float32)
    H, W = img.shape[:2]
    hard = actor_mask(meta, W, H)
    act = hard | actor_mask(meta, W, H, hard=False)
    fs = []
    if 'line' in kinds:
        fs += find_lines(img, meta, act) + find_lines(img, meta, act, transpose=True)
    if 'shape' in kinds:
        fs += find_shapes(img, meta, hard, act)
    if 'key' in kinds:
        fs += find_key(img, meta, act)
    if 'repeat' in kinds:
        fs += find_repeats(img, meta, act)
    if 'style' in kinds:
        fs += find_style(meta, assets)
    if 'fringe' in kinds or 'key' in kinds:
        fs += [f for f in find_fringes(meta, assets, W, H) if f['kind'] in kinds]
    if 'float' in kinds:
        fs += find_floating(meta, assets)
    if 'hud' in kinds:
        fs += find_hud(meta)
    # one finding per cause in a frame: its spots under it, the biggest one shown
    groups = defaultdict(list)
    for f in fs:
        groups[(f['kind'], f['sub'], f['cause'])].append(f)
    out = []
    for k, ((kind, sub, cause), g) in enumerate(sorted(groups.items())):
        size = lambda f: (f['box'][2] - f['box'][0]) * (f['box'][3] - f['box'][1]) + 50 * f.get('len', 0) if 'box' in f else 0
        g.sort(key=size, reverse=True)
        f = dict(g[0])
        f['spots'] = len(g)
        if 'box' in f:
            f['boxes'] = [x['box'] for x in g[:30]]
        f['frame'] = fr
        f['stage'] = w['id']
        f['orient'] = w['orient']
        if 'box' in f:
            f['x_world'] = int(meta['cam']['x'] + (f['box'][0] + f['box'][2]) / 2 / meta['s'])
        d = f.pop('draw', None)
        if d is not None:
            f['piece'] = {kk: d.get(kk) for kk in ('k', 'n', 'shape', 'style', 's', 'up', 'w') if kk in d}
        if crops:
            name = f"{kind}-{fr}-{k:02d}.jpg"
            try:
                if 'box' in f:
                    crop(pil, f['box'], os.path.join(fdir, name), others=f['boxes'][1:])
                else:
                    scr = Image.open(os.path.join(wd, 'screen', fr + '.jpg'))
                    sc = scr.size[0] / meta['cssW']
                    crop(scr, [int(v * sc) for v in f['box_css']], os.path.join(fdir, name))
                f['crop'] = os.path.relpath(os.path.join(fdir, name), os.path.dirname(os.path.dirname(wd)))
            except Exception as err:  # a crop never stops the walk
                f['crop_error'] = str(err)
        out.append(f)
    return out


def walk_dir(wd, kinds, crops, pool=None):
    w = json.load(open(os.path.join(wd, 'walk.json')))
    cdir = os.path.join(wd, 'canvas')
    fdir = os.path.join(wd, 'finds')
    os.makedirs(fdir, exist_ok=True)
    for f in os.listdir(fdir):
        os.remove(os.path.join(fdir, f))
    frames = sorted(f[:-5] for f in os.listdir(cdir) if f.endswith('.json') and os.path.exists(os.path.join(cdir, f[:-5] + '.png')))
    jobs = [(wd, fr, kinds, crops, w) for fr in frames]
    res = pool.map(frame_finds, jobs) if pool else [frame_finds(j) for j in jobs]
    finds = [f for r in res for f in r]
    if crops:
        proofs(wd, w, finds)
    sheet(wd, w, frames, finds)
    json.dump(finds, open(os.path.join(wd, 'seams.json'), 'w'), default=str)
    return w, finds


def proofs(wd, w, finds):
    """for a fault on a picture file (halo, dark ring, key colour): the worst spot of the picture itself, x3, on dark and on grey"""
    made = {}
    assets = Assets(w.get('dist'))
    for f in finds:
        m, pc = f.get('m'), f.get('piece')
        if not m or not pc or not m.get('spots'):
            continue
        which = {'light halo': 'light', 'dark ring': 'dark', 'magenta edge': 'mag', 'green edge': 'grn'}.get(f['sub'])
        spot = m['spots'].get(which)
        if not spot:
            continue
        key = (pc['n'], tuple(pc['s']), which)
        if key not in made:
            im = assets.file(pc['n'])
            if im is None:
                continue
            sx, sy = int(pc['s'][0]), int(pc['s'][1])
            cx, cy = sx + spot[0], sy + spot[1]
            r = 40
            c = im[max(0, cy - r):cy + r, max(0, cx - r):cx + r]
            if not c.size:
                continue
            a = c[..., 3:4] / 255
            tiles = []
            for bg in ((22, 26, 34), (128, 128, 128)):
                t = c[..., :3] * a + np.array(bg, np.float32) * (1 - a)
                t = Image.fromarray(t.clip(0, 255).astype(np.uint8)).resize((c.shape[1] * 3, c.shape[0] * 3), Image.NEAREST)
                tiles.append(t)
            P = Image.new('RGB', (tiles[0].size[0] * 2 + 6, tiles[0].size[1]), (0, 0, 0))
            P.paste(tiles[0], (0, 0))
            P.paste(tiles[1], (tiles[0].size[0] + 6, 0))
            name = f"asset-{which}-{re.sub(r'[^A-Za-z0-9]+', '_', short(pc['n']))[:40]}-{abs(hash(key)) % 10 ** 6}.jpg"
            P.save(os.path.join(wd, 'finds', name), quality=88)
            made[key] = os.path.relpath(os.path.join(wd, 'finds', name), os.path.dirname(os.path.dirname(wd)))
        f['proof'] = made[key]


def sheet(wd, w, frames, finds):
    """the contact sheet: every frame of the walk as the phone shows it, findings marked"""
    ims = []
    for fr in frames:
        p = os.path.join(wd, 'screen', fr + '.jpg')
        if os.path.exists(p):
            ims.append((fr, Image.open(p).convert('RGB')))
    if not ims:
        return
    up = w['orient'] == 'up'
    tw = 220 if up else 380
    th = int(ims[0][1].size[1] * tw / ims[0][1].size[0])
    cols = 8 if up else 5
    rows = math.ceil(len(ims) / cols)
    S = Image.new('RGB', (cols * tw, rows * (th + 22) + 40), (24, 24, 24))
    dr = ImageDraw.Draw(S)
    dr.text((8, 8), f"{w['id']} {'upright' if up else 'sideways'}  seed {w['seed']}  {w['how']}  {len(ims)} frames  {len(finds)} findings", fill=(240, 240, 240), font=font(18))
    byf = defaultdict(list)
    for f in finds:
        byf[f['frame']].append(f)
    for i, (fr, im) in enumerate(ims):
        x, y = (i % cols) * tw, 40 + (i // cols) * (th + 22)
        t = im.resize((tw, th))
        meta_k = tw / im.size[0]
        td = ImageDraw.Draw(t)
        cnt = byf.get(fr, [])
        for f in cnt:
            if 'box' not in f:
                continue
            # (the canvas covers the page at the screenshot's scale)
            for bb in f.get('boxes', [f['box']]):
                td.rectangle([v * meta_k for v in bb], outline=(255, 60, 60), width=1)
        S.paste(t, (x, y))
        dr.text((x + 4, y + th + 2), f"{fr}  {len(cnt)} finds", fill=(200, 200, 200), font=font(13))
    S.save(os.path.join(wd, 'sheet.jpg'), quality=80)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('walk')
    ap.add_argument('--stages')
    ap.add_argument('--kinds', default='line,fringe,key,repeat,style,shape,float,hud')
    ap.add_argument('--no-crops', action='store_true')
    ap.add_argument('--one', help='only this walk dir (WALKDIR/<stage>/<orient>); the report is not rewritten')
    ap.add_argument('--report-only', action='store_true', help='rebuild seams.md/json from each walk\'s seams.json')
    ap.add_argument('--procs', type=int, default=max(1, (os.cpu_count() or 2) - 1))
    a = ap.parse_args()
    kinds = set(a.kinds.split(','))
    import multiprocessing as mp
    pool = mp.Pool(a.procs) if a.procs > 1 else None
    if a.one:
        w, fs = walk_dir(a.one, kinds, not a.no_crops, pool)
        print(f"{w['id']} {w['orient']}: {len(fs)} findings", file=sys.stderr)
        return
    want = set(a.stages.split(',')) if a.stages else None
    allf = []
    walks = []
    for sid in sorted(os.listdir(a.walk)):
        if want and sid not in want:
            continue
        for o in ('up', 'side'):
            wd = os.path.join(a.walk, sid, o)
            if not os.path.exists(os.path.join(wd, 'walk.json')):
                continue
            if a.report_only:
                if not os.path.exists(os.path.join(wd, 'seams.json')):
                    continue
                w, fs = json.load(open(os.path.join(wd, 'walk.json'))), json.load(open(os.path.join(wd, 'seams.json')))
            else:
                w, fs = walk_dir(wd, kinds, not a.no_crops, pool)
                print(f"{sid} {o}: {len(fs)} findings", file=sys.stderr)
            walks.append(w)
            allf += fs
    write_report(a.walk, walks, allf)


def write_report(root, walks, allf):
    json.dump({'walks': [{k: w[k] for k in ('id', 'orient', 'seed', 'how', 'frames')} for w in walks], 'findings': allf},
              open(os.path.join(root, 'seams.json'), 'w'), indent=0, default=str)
    causes = defaultdict(list)
    for f in allf:
        causes[(f['kind'], f['cause'])].append(f)
    per = defaultdict(lambda: defaultdict(int))
    for f in allf:
        per[f"{f['stage']} {f['orient']}"][f['kind']] += 1
    kinds = ['line', 'fringe', 'key', 'repeat', 'style', 'shape', 'float', 'hud']
    L = ['# Stage walk: findings by cause', '',
         f"{len(walks)} walks, {sum(len(w['frames']) for w in walks)} frames, {len(allf)} findings, {len(causes)} causes.", '',
         '## Count per stage', '', '| stage | ' + ' | '.join(kinds) + ' | all |', '|---|' + '---|' * (len(kinds) + 1)]
    for k in sorted(per, key=lambda s: (int(s.split('-')[0]) if s.split('-')[0].isdigit() else 99, s)):
        L.append(f"| {k} | " + ' | '.join(str(per[k].get(x, 0)) for x in kinds) + f" | {sum(per[k].values())} |")
    L += ['', '## Causes (most spots first)', '']
    for (kind, cause), fs in sorted(causes.items(), key=lambda kv: -len(kv[1])):
        stages = sorted({f['stage'] for f in fs})
        ex = next((f.get('crop') for f in fs if f.get('crop')), '')
        L.append(f"- **{kind}** {cause}: {len(fs)} spots in {len(stages)} stages ({', '.join(stages[:12])}{'...' if len(stages) > 12 else ''}); e.g. `{ex}`")
    open(os.path.join(root, 'seams.md'), 'w').write('\n'.join(L) + '\n')


if __name__ == '__main__':
    main()
