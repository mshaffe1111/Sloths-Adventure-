"""ART-NEXT-d: the 1-1 idle-start before/after pair and the yawn strip + game-speed clip, from idleshoot.mjs crops.
    python3 -I tools/art/hfnext/idlepair.py <after dir (1-1 3.7-4.7)> <yawn dir (1-1 0.3-9.0)>
Writes reference/art/hfnext/bridge/before-after-idle-start.jpg, yawn-1-1-strip.jpg, yawn-1-1-game-speed.mp4 (ffmpeg, each crop held
for its own game time).
"""
import glob, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw
after, yawn = sys.argv[1:3]; B = 'reference/art/hfnext/bridge/'
T = lambda f: float(re.search(r't([\d.]+)\.png', f).group(1))
def row(fs, lab):
    ims = [Image.open(f).convert('RGB') for f in fs]; o = Image.new('RGB', (sum(i.width for i in ims), ims[0].height + 16)); d = ImageDraw.Draw(o); x = 0
    for f, i in zip(fs, ims): o.paste(i, (x, 16)); d.text((x + 3, 2), lab(f), fill=(255, 230, 90)); x += i.width
    return o
a = row(sorted(glob.glob(f'{after}/1-1-t*.png'), key=T), lambda f: f't{T(f):.2f}')
b = Image.open(B + 'before-idle-start.jpg').convert('RGB')
rows = [('1-1 BEFORE (old clips: doubled outline in the melt at t4.33)', b), ('1-1 AFTER (bridged: the plain pose holds through the melt)', a)]
o = Image.new('RGB', (max(r[1].width for r in rows), sum(r[1].height + 18 for r in rows)), (20, 20, 24)); d = ImageDraw.Draw(o); y = 0
for t, im in rows: d.text((4, y + 3), t, fill=(255, 255, 255)); o.paste(im, (0, y + 18)); y += im.height + 18
o.save(B + 'before-after-idle-start.jpg', quality=86)
fs = sorted(glob.glob(f'{yawn}/1-1-t*.png'), key=T)
row([f for f in fs if 3.9 <= T(f) <= 8.95][::3], lambda f: f'{T(f):.2f}').save(B + 'yawn-1-1-strip.jpg', quality=84)
with tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False) as L:
    for i, f in enumerate(fs): L.write(f"file '{f}'\nduration {(T(fs[i + 1]) - T(f)) if i + 1 < len(fs) else 0.2:.3f}\n")
    L.write(f"file '{fs[-1]}'\n")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', L.name, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
                '-r', '30', '-c:v', 'libx264', '-crf', '22', B + 'yawn-1-1-game-speed.mp4'], check=True)
print('wrote the pair, the strip and the clip')
