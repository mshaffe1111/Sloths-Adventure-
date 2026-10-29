"""Pack and preview the title pair's clips (2026-10-28), on this machine.

    python3 -I tools/art/w6to10/titlepack.py <unpacked frames dir> <out dir> [picks.json]

The frames are the clips' carrier PNGs from the bucket (w6to10/clips/w6t-title-<move>-s<seed>.carrier.png, unpacked with
tools/art/w5/unpack_carrier.py: <clip>_NNN.webp, 49 frames at Wan's 16 fps). For each move it picks the seed and the frame range
(picks.json {move: [clip, first, last]} if given, else automatically: a loop for the idles = the pair of frames, 2-4 s apart, whose
silhouettes match best; a gesture = from frame 0 to the frame after the gesture that best matches frame 0, so it returns to the idle
and can chain), resamples it to 12 fps, cuts the flat grey off (train/clips.py key), puts every frame's feet on one ground line, and
writes, per move:
  <move>.webp            the frames in a grid (left to right, then down; `cols` in the JSON), all the same cell size, Pokey about as tall as title-idle.webp (303 px)
  <move>.json            cell size, frame count, fps, the anchor (middle of the feet on the ground line), loop or one-shot, source
  <move>.mp4             a preview at 12 fps (3 times through) on the game's title-like backdrop
and chained.mp4: the title as it would play (Pokey and Meeca each chaining idle -> gesture -> idle, then the pair clip).
Numbers that flag broken clips go to report.json: drift of the feet (sliding), size change, silhouette match at the loop seam.
"""
import json, subprocess, sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'train'))
from clips import key  # noqa: E402

REPO = Path(__file__).resolve().parents[3]
LOOPS = {'pokey-idle', 'meeca-idle'}
WHO = {'pokey-idle': 'pokey', 'pokey-look': 'pokey', 'pokey-cheer': 'pokey', 'meeca-idle': 'meeca', 'meeca-wave': 'meeca', 'pair-laugh': 'pair'}
SRC_FPS, FPS = 16, 12
TARGET_H = 640  # Pokey's packed height in px (the new title shows the pair ~280 CSS px tall, ~560 device px: pack at 600+)
POKEY_CLIP_H = 0.74 * 704  # his height in a 704 px clip (titlegpu.py FIG_H x 704); titleup.py frames are bigger, see scale below
BASE_W = {'pair': 832}  # the clip width Wan made (704 for the singles)


def load(d, clip):
    fs = sorted(Path(d).glob(f'{clip}_*.webp'))
    return [np.asarray(Image.open(f).convert('RGB')) for f in fs]


def sil(frames):
    return [key(f) > 128 for f in frames]


def iou(a, b):
    return (a & b).sum() / max(1, (a | b).sum())


def pick_range(s, loop):
    n = len(s)
    if loop:
        best = max(((iou(s[a], s[b]), a, b) for a in range(0, 10) for b in range(a + 32, n)), key=lambda t: t[0])
    else:
        best = max(((iou(s[0], s[b]), 0, b) for b in range(30, n)), key=lambda t: t[0])
    return best


def feet(alpha):
    ys, xs = np.nonzero(alpha > 128)
    low = ys.max()
    band = xs[ys > low - 0.05 * (low - ys.min())]
    return (band.min() + band.max()) / 2, low


def main(src, out, picks_path=None):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    picks = json.loads(Path(picks_path).read_text()) if picks_path else {}
    clips = sorted({p.name.rsplit('_', 1)[0] for p in Path(src).glob('w6t-title-*_*.webp')})
    skip = [c for c in (picks.get('_skip') or [])]
    clips = [c for c in clips if c not in skip]
    report, packed = {}, {}
    for mv in WHO:
        cands = [c for c in clips if c.startswith(f'w6t-title-{mv}-s') or c.startswith(f'w6t-title-{mv}2-')]
        if not cands:
            continue
        if mv in picks:
            clip, a, b = picks[mv]
            fr = load(src, clip); s = sil(fr); score = iou(s[a], s[b])
        else:
            best = None
            for c in cands:
                fr = load(src, c); s = sil(fr)
                sc, a, b = pick_range(s, mv in LOOPS)
                if best is None or sc > best[0]:
                    best = (sc, c, a, b, fr, s)
            score, clip, a, b, fr, s = best
        # the frames may be titleup.py's enlarged ones: the scale follows the frame width
        # (Pokey is FIG_H of the clip's height: 704 for the singles, 576 for the pair)
        k = fr[0].shape[1] / BASE_W.get(WHO[mv], 704)
        scale = TARGET_H / (POKEY_CLIP_H * (576 / 704 if WHO[mv] == 'pair' else 1) * k)
        idx = [round(a + i * SRC_FPS / FPS) for i in range(int((b - a) * FPS / SRC_FPS) + 1)]
        idx = [i for i in idx if i <= b]
        if mv in LOOPS and idx[-1] == b:
            idx = idx[:-1]  # the seam frame matches the first: drop it so the loop does not stutter
        cut = []
        fx = []
        for i in idx:
            al = key(fr[i])
            x, y = feet(al)
            fx.append(x)
            cut.append((Image.fromarray(np.dstack([fr[i], al])), x, y))
        # one ground line: every frame's feet on the same row; the feet's x as the clip gives it (any drift shows in the report)
        ground = max(y for _, _, y in cut)
        H, W = fr[0].shape[:2]
        x0 = int(np.mean(fx))
        boxes = []
        for im, x, y in cut:
            al = np.asarray(im.getchannel('A')) > 16
            ys, xs = np.nonzero(al)
            boxes.append((xs.min() - x0, ys.min() - y, xs.max() - x0, ys.max() - y))
        L = min(b_[0] for b_ in boxes) - 4; T = min(b_[1] for b_ in boxes) - 4
        R = max(b_[2] for b_ in boxes) + 4; B = max(b_[3] for b_ in boxes) + 2
        cw, ch = round((R - L) * scale), round((B - T) * scale)
        cols = min(len(cut), max(1, 8192 // cw))  # a grid, not one row: WebP stops at 16383 px a side
        rows = (len(cut) + cols - 1) // cols
        sheet = Image.new('RGBA', (cw * cols, ch * rows), (0, 0, 0, 0))
        for k, (im, x, y) in enumerate(cut):
            # place: the feet row on the ground (dy = -y), x relative to the clip's mean feet x
            cell = Image.new('RGBA', (R - L, B - T), (0, 0, 0, 0))
            cell.alpha_composite(im, (round(-L - x0), round(-T - y)))
            sheet.alpha_composite(cell.resize((cw, ch), Image.LANCZOS), ((k % cols) * cw, (k // cols) * ch))
        sheet.save(out / f'{mv}.webp', 'WEBP', quality=88, method=6)
        meta = {'clip': clip, 'first': a, 'last': b, 'frames': len(cut), 'fps': FPS, 'loop': mv in LOOPS, 'w': cw, 'h': ch, 'cols': cols,
                'ax': round(-L * scale), 'ay': round(-T * scale), 'scale': round(scale, 4)}
        if WHO[mv] == 'pair':
            # both characters' feet in a cell (from frame 0): place the sheet so these match where the title draws the two idles
            al = np.asarray(frames_of(sheet, meta)[0].getchannel('A')) > 128
            lab_cols = np.nonzero(al.any(0))[0]
            gaps = np.nonzero(np.diff(lab_cols) > 3)[0]
            split = (lab_cols[gaps[0]] + lab_cols[gaps[0] + 1]) // 2 if len(gaps) else al.shape[1] // 2
            meta['feet'] = {}
            for who, sl in (('pokey', slice(0, split)), ('meeca', slice(split, al.shape[1]))):
                a2 = np.zeros_like(al); a2[:, sl] = al[:, sl]
                x, y = feet(a2.astype(np.uint8) * 255)
                meta['feet'][who] = [round(float(x)), int(y)]
        (out / f'{mv}.json').write_text(json.dumps(meta, indent=1))
        areas = [(np.asarray(im.getchannel('A')) > 128).sum() for im, _, _ in cut]
        report[mv] = {'clip': clip, 'range': [a, b], 'seam_match': round(float(score), 3), 'feet_drift_px': round(float(max(fx) - min(fx)), 1),
                      'size_change': round(max(areas) / max(1, min(areas)), 2), 'frames': len(cut)}
        packed[mv] = (sheet, meta)
        print(mv, report[mv], flush=True)
    (out / 'report.json').write_text(json.dumps(report, indent=1))
    previews(out, packed)


def frames_of(sheet, meta):
    c, w, h = meta['cols'], meta['w'], meta['h']
    return [sheet.crop(((k % c) * w, (k // c) * h, (k % c + 1) * w, (k // c + 1) * h)) for k in range(meta['frames'])]


def backdrop(w, h):
    bg = Image.open(REPO / 'src/assets/backdrops/w1-far.webp').convert('RGB')
    bg = bg.resize((round(bg.width * h / bg.height), h), Image.LANCZOS).crop((0, 0, w, h)).convert('RGBA')
    log = Image.new('RGBA', (w, 40), (92, 62, 38, 255))
    bg.alpha_composite(log, (0, h - 60))
    return bg


def video(path, frames):
    tmp = path.with_suffix('')
    tmp.mkdir(exist_ok=True)
    for i, f in enumerate(frames):
        f.convert('RGB').save(tmp / f'{i:04d}.png')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(tmp / '%04d.png'), '-pix_fmt', 'yuv420p',
                    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', str(path)], check=True)
    for p in tmp.iterdir():
        p.unlink()
    tmp.rmdir()


def previews(out, packed):
    W, Hh = 1280, 960
    ground = Hh - 60
    for mv, (sheet, meta) in packed.items():
        fr = frames_of(sheet, meta)
        seq = fr * (3 if meta['loop'] else 2)
        vid = []
        for f in seq:
            bg = backdrop(W, Hh)
            bg.alpha_composite(f, (W // 2 - meta['ax'], ground - meta['ay']))
            vid.append(bg)
        video(out / f'{mv}.mp4', vid)
    # the title as it would play: Pokey left, Meeca right, each chaining idle -> gesture -> idle; then the pair clip
    def chain(names, n):
        seq = []
        while len(seq) < n:
            for nm in names:
                if nm in packed:
                    seq += [(nm, f) for f in frames_of(*packed[nm])]
        return seq[:n]
    if 'pokey-idle' in packed and 'meeca-idle' in packed:
        n = 12 * FPS
        pk = chain(['pokey-idle', 'pokey-idle', 'pokey-look', 'pokey-idle', 'pokey-cheer', 'pokey-idle'], n)
        me = chain(['meeca-idle', 'meeca-wave', 'meeca-idle', 'meeca-idle', 'meeca-wave'], n)
        vid = []
        # the idles stand where the pair clip has them (its two feet anchors), so the pair clip cuts in and out without a jump
        px, mx = W // 2 - 240, W // 2 + 240
        if 'pair-laugh' in packed and 'feet' in packed['pair-laugh'][1]:
            m = packed['pair-laugh'][1]
            px, mx = W // 2 - m['ax'] + m['feet']['pokey'][0], W // 2 - m['ax'] + m['feet']['meeca'][0]
        for (pn, pf), (mn, mf) in zip(pk, me):
            bg = backdrop(W, Hh)
            bg.alpha_composite(pf, (px - packed[pn][1]['ax'], ground - packed[pn][1]['ay']))
            bg.alpha_composite(mf, (mx - packed[mn][1]['ax'], ground - packed[mn][1]['ay']))
            vid.append(bg)
        if 'pair-laugh' in packed:
            sh, m = packed['pair-laugh']
            for f in frames_of(sh, m):
                bg = backdrop(W, Hh)
                bg.alpha_composite(f, (W // 2 - m['ax'], ground - m['ay']))
                vid.append(bg)
        video(out / 'chained.mp4', vid)


if __name__ == '__main__':
    main(*sys.argv[1:4])
