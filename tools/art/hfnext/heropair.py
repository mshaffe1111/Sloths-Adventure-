"""ART-HERO (R-165.378): before/after strips and a game-speed clip from two heroshoot.mjs runs (BEFORE = the old sheets, AFTER = this
branch, each merged with origin/main in a scratch worktree, never pushed).
    python3 -I tools/art/hfnext/heropair.py <beforeDir> <afterDir> <outDir> <stage> <scene,...> [switchSec 1.0]
Per scene: <outDir>/hero-<scene>-before-after.jpg, the shots nearest a fixed set of game times around the switch (top row before, bottom
after, the game time over each), and <outDir>/hero-<scene>-game-speed.mp4: before | after side by side, each shot held for its own game
time (so it plays at game speed). Also hero-all-before-after.jpg: the scenes' strips stacked (the one to look at first).
"""
import re, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw

bdir, adir, odir, stage, scenes = sys.argv[1:6]
SW = float(sys.argv[6]) if len(sys.argv) > 6 else 1.0
Path(odir).mkdir(parents=True, exist_ok=True)
TIMES = [SW - 0.3, SW - 0.05, SW + 0.05, SW + 0.15, SW + 0.3, SW + 0.6, SW + 1.0, SW + 1.35]


def shots(d, scene):
    out = []
    for f in Path(d).glob(f'{stage}-{scene}-t*.png'):
        out.append((float(re.search(r'-t([\d.]+)\.png$', f.name).group(1)), f))
    return sorted(out)


def nearest(sh, t):
    return min(sh, key=lambda s: abs(s[0] - t))


H = 260   # each cell's height in the strip (downscaled from the 2x crop)
rows_all = []
for scene in scenes.split(','):
    B, A = shots(bdir, scene), shots(adir, scene)
    assert B and A, f'{scene}: no shots'
    cells = []
    for side in (B, A):
        row = []
        for t in TIMES:
            gt, f = nearest(side, t); im = Image.open(f).convert('RGB'); im = im.resize((round(im.width * H / im.height), H))
            ImageDraw.Draw(im).text((6, 4), f'{"plain" if gt < SW else scene} t{gt:.2f}', fill=(255, 255, 255))
            row.append(im)
        cells.append(row)
    w = sum(c.width for c in cells[0]); strip = Image.new('RGB', (w + 70, 2 * H + 30), (20, 20, 20)); d = ImageDraw.Draw(strip)
    d.text((6, 6), f'{stage} {scene}: plain pose -> {scene} (switch at t{SW:.2f}); top BEFORE, bottom AFTER', fill=(255, 255, 255))
    for r, (row, lab) in enumerate(zip(cells, ('BEFORE', 'AFTER'))):
        d.text((6, 30 + r * H + H // 2), lab, fill=(255, 255, 255)); x = 70
        for c in row:
            strip.paste(c, (x, 30 + r * H)); x += c.width
    strip.save(f'{odir}/hero-{scene}-before-after.jpg', quality=88); rows_all.append(strip)
    # the game-speed clip: both sides on one clock, each frame shows the latest shot at or before that game time
    with tempfile.TemporaryDirectory() as tmp:
        t0, t1, fps = max(B[0][0], A[0][0]), min(B[-1][0], A[-1][0]), 30
        k = 0; t = t0
        while t <= t1:
            pair = [max((s for s in side if s[0] <= t + 1e-6), key=lambda s: s[0])[1] for side in (B, A)]
            ims = [Image.open(p).convert('RGB') for p in pair]; hh = min(i.height for i in ims)
            ims = [i.resize((round(i.width * hh / i.height), hh)) for i in ims]
            fr = Image.new('RGB', (sum(i.width for i in ims) + 8, hh + 24), (20, 20, 20)); dd = ImageDraw.Draw(fr)
            fr.paste(ims[0], (0, 24)); fr.paste(ims[1], (ims[0].width + 8, 24))
            dd.text((6, 6), f'BEFORE | AFTER  {scene}  t{t:.2f}{"  (plain)" if t < SW else ""}', fill=(255, 255, 255))
            fr = fr.resize((fr.width // 2 * 2 // 2, fr.height // 2 * 2 // 2)) if fr.width > 1400 else fr
            fr = fr.crop((0, 0, fr.width // 2 * 2, fr.height // 2 * 2))
            fr.save(f'{tmp}/f{k:04d}.png'); k += 1; t += 1 / fps
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', f'{tmp}/f%04d.png', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                        '-crf', '24', f'{odir}/hero-{scene}-game-speed.mp4'], check=True)
w = max(r.width for r in rows_all); allim = Image.new('RGB', (w, sum(r.height for r in rows_all)), (20, 20, 20)); y = 0
for r in rows_all:
    allim.paste(r, (0, y)); y += r.height
allim.save(f'{odir}/hero-all-before-after.jpg', quality=86)
print('wrote', odir)
