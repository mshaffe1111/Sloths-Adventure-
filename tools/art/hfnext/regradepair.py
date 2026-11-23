"""ART-REGRADE (R-165.377): the 1-1 stop before/after the idle regrade, from two idleshoot.mjs runs (each on a scratch merge with the
release branch, so they show what ships).
    python3 -I tools/art/hfnext/regradepair.py <before dir> <after dir>
Writes reference/art/hfnext/bridge/regrade-1-1-before-after.jpg (the same game times, before over after: the plain pose standing, then
the yawn), regrade-yawn-1-1-strip.jpg (the whole yawn, after) and regrade-1-1-game-speed.mp4 (before | after side by side, each pair held
for its own game time).
"""
import glob, os, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw
bef, aft = sys.argv[1:3]; B = 'reference/art/hfnext/bridge/'
T = lambda f: float(re.search(r't([\d.]+)\.png', f).group(1))
fb = sorted(glob.glob(f'{bef}/1-1-t*.png'), key=T); fa = sorted(glob.glob(f'{aft}/1-1-t*.png'), key=T)
near = lambda fs, t: min(fs, key=lambda f: abs(T(f) - t))


def row(fs, lab):
    ims = [Image.open(f).convert('RGB') for f in fs]; o = Image.new('RGB', (sum(i.width for i in ims), ims[0].height + 16)); d = ImageDraw.Draw(o); x = 0
    for f, i in zip(fs, ims): o.paste(i, (x, 16)); d.text((x + 3, 2), lab(f), fill=(255, 230, 90)); x += i.width
    return o


ts = [3.5, 4.3, 4.9, 5.6, 6.3, 7.0, 7.7, 8.4, 8.9]
rows = [('1-1 BEFORE (3b27e3efe + release-0.10.1): the yawn is a paler, beiger sloth than the plain pose', row([near(fb, t) for t in ts], lambda f: f't{T(f):.2f}')),
        ('1-1 AFTER (this branch + release-0.10.1): the yawn regraded onto the plain pose\'s fur', row([near(fa, t) for t in ts], lambda f: f't{T(f):.2f}'))]
o = Image.new('RGB', (max(r[1].width for r in rows), sum(r[1].height + 18 for r in rows)), (20, 20, 24)); d = ImageDraw.Draw(o); y = 0
for t, im in rows: d.text((4, y + 3), t, fill=(255, 255, 255)); o.paste(im, (0, y + 18)); y += im.height + 18
o.save(B + 'regrade-1-1-before-after.jpg', quality=86)
row([f for f in fa if 3.9 <= T(f) <= 8.95][::2], lambda f: f'{T(f):.2f}').save(B + 'regrade-yawn-1-1-strip.jpg', quality=84)
with tempfile.TemporaryDirectory() as tmp:
    with open(os.path.join(tmp, 'l.txt'), 'w') as L:
        for i, f in enumerate(fa):
            a = Image.open(f).convert('RGB'); b = Image.open(near(fb, T(f))).convert('RGB')
            pr = Image.new('RGB', (a.width + b.width + 4, max(a.height, b.height) + 14), (20, 20, 24)); dd = ImageDraw.Draw(pr)
            pr.paste(b, (0, 14)); pr.paste(a, (b.width + 4, 14)); dd.text((3, 1), 'before', fill=(255, 230, 90)); dd.text((b.width + 7, 1), 'after', fill=(255, 230, 90))
            p = os.path.join(tmp, f'{i:03d}.png'); pr.save(p)
            L.write(f"file '{p}'\nduration {(T(fa[i + 1]) - T(f)) if i + 1 < len(fa) else 0.2:.3f}\n")
        L.write(f"file '{p}'\n")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', L.name, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
                    '-r', '30', B + 'regrade-1-1-game-speed.mp4'], check=True)
print('wrote', B + 'regrade-1-1-before-after.jpg', B + 'regrade-yawn-1-1-strip.jpg', B + 'regrade-1-1-game-speed.mp4')
