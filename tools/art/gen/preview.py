"""A looping preview video of clips: python3 -I preview.py out.mp4 cols bg label=clipdir[:a-b] ...
clipdir is a folder of <name>_NNN.png (gen/clips/<name> or another path); figures on grey are keyed onto `bg` ('jungle', 'dark' or 'scene' = no keying)."""
import sys, subprocess, tempfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont
H = Path(__file__).resolve().parent
sys.path.insert(0, str(H.parent / 'train'))
from clips import key  # noqa: E402
out, cols, bg = sys.argv[1], int(sys.argv[2]), sys.argv[3]
PW, PH = 420, 260
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
back = Image.new('RGB', (PW, PH), (20, 28, 24))
if bg == 'jungle':
    j = Image.open((str(__import__('pathlib').Path(__file__).resolve().parents[3]) + '/src/assets/backdrops/w1-far.webp')).convert('RGB')
    back = j.crop((0, 0, round(j.height * PW / PH), j.height)).resize((PW, PH))
panels = []
for arg in sys.argv[4:]:
    label, spec = arg.split('=', 1)
    rng = None
    if ':' in spec:
        spec, r = spec.rsplit(':', 1); a, b = map(int, r.split('-')); rng = (a, b)
    d = Path(spec) if Path(spec).is_absolute() else H / 'clips' / spec
    fs = sorted(d.glob('*_[0-9][0-9][0-9].png'))
    if rng: fs = fs[rng[0]:rng[1] + 1]
    frames = []
    if bg == 'scene':
        for f in fs:
            im = Image.open(f).convert('RGB'); im.thumbnail((PW, PH))
            p = Image.new('RGB', (PW, PH), 'black'); p.paste(im, ((PW - im.width) // 2, (PH - im.height) // 2)); frames.append(p)
    else:
        arrs = [np.asarray(Image.open(f).convert('RGB')) for f in fs]
        als = [key(a) for a in arrs]
        al = np.maximum.reduce(als)
        ys, xs = np.nonzero(al > 40)
        x0, x1, y0, y1 = xs.min() - 6, xs.max() + 6, ys.min() - 6, ys.max() + 6
        s = min((PW - 30) / (x1 - x0), (PH - 40) / (y1 - y0))
        for a, k in zip(arrs, als):
            im = Image.fromarray(np.dstack([a, k]).astype(np.uint8), 'RGBA').crop((x0, y0, x1, y1))
            im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
            p = back.copy(); p.paste(im, ((PW - im.width) // 2, PH - 14 - im.height), im); frames.append(p)
    for p in frames:
        ImageDraw.Draw(p).text((10, 8), label, fill=(255, 236, 170), font=font)
    panels.append(frames)
N = max(len(p) for p in panels)
rows = (len(panels) + cols - 1) // cols
tmp = Path(tempfile.mkdtemp())
for t in range(N * 2):
    sheet = Image.new('RGB', (PW * cols + 4 * (cols - 1), PH * rows + 4 * (rows - 1)), 'black')
    for k, p in enumerate(panels):
        sheet.paste(p[t % len(p)], ((k % cols) * (PW + 4), (k // cols) * (PH + 4)))
    sheet.save(tmp / f'{t:04d}.png')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '16', '-i', str(tmp / '%04d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '22', '-movflags', '+faststart', out], check=True)
Image.open(tmp / f'{min(20, N - 1):04d}.png').save(Path(out).with_suffix('.jpg'), quality=85)
print(out, N, 'frames')
