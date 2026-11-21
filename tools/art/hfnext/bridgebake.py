"""ART-NEXT-c (R-165.354): bake a picked bridge take into its idle clips' sheets, so every idle clip starts AND ends on Pokey's plain pose.
    python3 -I tools/art/hfnext/bridgebake.py <take dir of Wan frames> <clip>[,<clip>...] [--sheet out.jpg] [--pin-feet] [--dry]
A take is the bridge from the plain pose (Wan frame 0) to the clip's frame 0 (Wan's last frame), drawn by bridgestarts.py at S = 2.4
canvas px a sheet px with the feet anchor at (240, 552). Each Wan frame is keyed off its flat grey (flood from the border), scaled to
sheet px and placed on the anchor; then frame 0 is REPLACED by the exact plain frame (heroStandardData idle) and the last by the clip's
exact frame 0, so both ends are pixel for pixel what they join. The clip becomes: bridge in (Wan 0..m-2), the clip's own frames, bridge
out (Wan m-2..0, reversed): its first and last frames are the plain pose. --pin-feet shifts each in-between frame sideways so its feet
centre stays on the anchor (a standing turn; never the sit-down, whose feet move by design). The sheet box grows to the union of all
frames; heroClipsData.ts's entry (n, w, h, ax, ay) is rewritten in the clip cutter's own format. --dry writes only the check sheet.
Prints, per in-between frame, the RAW feet drift in sheet px before any pin (the lead's bar: within 2 px across a standing bridge).
"""
import glob, json, re, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd

S, FX, FY = 2.4, 240, 552
take, clips = sys.argv[1], sys.argv[2].split(',')
PIN, DRY = '--pin-feet' in sys.argv, '--dry' in sys.argv
SHEET = sys.argv[sys.argv.index('--sheet') + 1] if '--sheet' in sys.argv else None
DATA = Path('src/game/heroClipsData.ts')
src = DATA.read_text()
CL = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {HERO_CLIPS} from './src/game/heroClipsData.ts'; console.log(JSON.stringify(HERO_CLIPS))"],
                               capture_output=True, text=True, check=True).stdout)
STD = Image.open('src/assets/hero/hero-standard.webp').convert('RGBA')
AW, AH, AX, AY = 420, 300, 210, 270          # the working canvas (sheet px) and its feet anchor


def on_anchor(im, ax, ay):
    c = Image.new('RGBA', (AW, AH), (0, 0, 0, 0)); c.alpha_composite(im, (int(round(AX - ax)), int(round(AY - ay)))); return c


def key(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    bg = np.median(np.concatenate([a[:3].reshape(-1, 3), a[-3:].reshape(-1, 3), a[:, :3].reshape(-1, 3), a[:, -3:].reshape(-1, 3)]), axis=0)
    near = np.abs(a - bg).max(axis=2) <= 22
    lab, _ = nd.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgm = np.isin(lab, list(edge))
    keep = ~bgm
    lab2, n2 = nd.label(keep)
    if n2 > 1:
        sz = nd.sum(keep, lab2, range(1, n2 + 1)); keep = lab2 == 1 + int(np.argmax(sz))
    dist = np.abs(a - bg).max(axis=2)
    al = keep.astype(np.float32); rim = keep & ~nd.binary_erosion(keep, iterations=2)
    al[rim] = np.clip(dist[rim] / 50.0, 0, 1)
    al = np.asarray(Image.fromarray((al * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) / 255
    al[~nd.binary_dilation(keep, iterations=1)] = 0
    k = np.maximum(al, 1e-3)[..., None]
    rgb = np.where(al[..., None] > 0.02, np.clip((a - bg * (1 - k)) / k, 0, 255), 0)
    im = Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA')
    im = im.resize((round(im.width / S), round(im.height / S)), Image.LANCZOS)
    return on_anchor(im, FX / S, FY / S)


def feet_cx(im):
    m = np.asarray(im)[..., 3] > 128; ys = np.nonzero(m.any(1))[0]; b = ys.max()
    xs = np.nonzero(m[b - 7:b + 1].any(0))[0]; return (xs.min() + xs.max()) / 2, b


def clip_frames(name):
    c = CL[name]; im = Image.open(f'src/assets/hero/clips/{name}.webp').convert('RGBA')
    return [on_anchor(im.crop(((k % c['cols']) * c['w'], (k // c['cols']) * c['h'], (k % c['cols'] + 1) * c['w'], (k // c['cols'] + 1) * c['h'])),
                      c['ax'], c['ay']) for k in range(c['n'])]


plain = on_anchor(STD.crop((674, 478, 674 + 127, 478 + 209)), 57.0, 205.0)
wan = [key(f) for f in sorted(glob.glob(take + '/*.webp'))]
assert len(wan) >= 9, f'{take}: {len(wan)} frames'
f0x, f0y = feet_cx(plain)
drift = []
for i, im in enumerate(wan[1:-1], 1):
    x, y = feet_cx(im); drift.append((i, round(x - f0x, 1), int(y - f0y)))
print('raw feet drift (frame, dx, dy) sheet px:', drift)
print('max |dx|', max(abs(d[1]) for d in drift), 'max |dy|', max(abs(d[2]) for d in drift))
if PIN:
    wan = [im if i in (0, len(wan) - 1) else im.transform(im.size, Image.AFFINE, (1, 0, feet_cx(im)[0] - f0x, 0, 1, 0), Image.BICUBIC)
           for i, im in enumerate(wan)]
for name in clips:
    own = clip_frames(name)
    bridge = [plain] + wan[1:-1]                  # Wan 0 -> the exact plain frame; Wan m-1 -> the clip's own frame 0 (not repeated)
    frames = bridge + own + bridge[::-1]
    if SHEET:
        ims = [plain] + wan[1:-1] + [own[0]]
        tw = 2 * 140; th = 2 * 230
        sh = Image.new('RGB', (len(ims) * tw, th * 2 + 40), (0, 0, 0)); d = ImageDraw.Draw(sh)
        for i, im in enumerate(ims):
            cr = im.crop((AX - 70, AY - 220, AX + 70, AY + 10)).resize((tw, th), Image.LANCZOS)
            for r, bgc in enumerate([(226, 230, 214, 255), (26, 30, 42, 255)]):
                b = Image.new('RGBA', cr.size, bgc); b.alpha_composite(cr); sh.paste(b.convert('RGB'), (i * tw, 20 + r * (th + 20)))
            d.text((i * tw + 4, 4), 'PLAIN' if i == 0 else ('CLIP f0' if i == len(ims) - 1 else str(i)), fill=(255, 230, 90))
            d.line([(i * tw, 20 + th - 20), (i * tw + tw, 20 + th - 20)], fill=(255, 60, 60))
        sh.save(SHEET, quality=86); print('sheet', SHEET, sh.size)
    if DRY:
        continue
    al = np.stack([np.asarray(f)[..., 3] for f in frames]).max(0) > 8
    ys, xs = np.nonzero(al); x0, x1, y0, y1 = xs.min() - 1, xs.max() + 2, ys.min() - 1, ys.max() + 2
    w, h = int(x1 - x0), int(y1 - y0); cols = 8; rows = (len(frames) + cols - 1) // cols
    out = Image.new('RGBA', (cols * w, rows * h), (0, 0, 0, 0))
    for k, f in enumerate(frames):
        out.alpha_composite(f.crop((x0, y0, x1, y1)), ((k % cols) * w, (k // cols) * h))
    assert out.width <= 4096 and out.height <= 4096
    p = f'src/assets/hero/clips/{name}.webp'; out.save(p, 'WEBP', quality=90, method=6)
    ent = {'n': len(frames), 'cols': cols, 'w': w, 'h': h, 'ax': round(float(AX - x0), 1), 'ay': round(float(AY - y0), 1), 'fps': CL[name]['fps']}
    old = json.dumps({name: CL[name]}, indent=1)[2:-2]
    assert old in src, f'{name}: entry not found in the cutter format'
    src = src.replace(old, json.dumps({name: ent}, indent=1)[2:-2])
    print(name, 'frames', len(frames), 'sheet', out.size, f'{Path(p).stat().st_size / 1024:.0f} KB', ent)
if not DRY:
    if 'bridgebake.py' not in src.split('\n')[0]:
        src = src.replace('Do not edit by hand. */', 'Do not edit by hand. The idle clips\' bridge frames: tools/art/hfnext/bridgebake.py (R-165.354). */', 1)
    DATA.write_text(src)
