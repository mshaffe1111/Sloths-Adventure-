"""Preview video of packed creature animations: python3 -I preview_anim.py out.mp4 'creature:seq:fps[:ping]' ...
Each cell plays one sequence at its game speed, anchored on the ground, at one scale per creature."""
import json, re, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
GAME = __import__('pathlib').Path(str(__import__('pathlib').Path(__file__).resolve().parents[3]))
out = sys.argv[1]
cells = [a.split(':') for a in sys.argv[2:]]
CW, CH, COLS, FPS, SECS = 400, 250, 3, 30, 8
data = {}


def load(c):
    if c in data:
        return data[c]
    ts = (GAME / f'src/game/{c}AnimData.ts').read_text()
    seq = json.loads(re.search(r'_SEQ[^=]*= (\{.*?\});\n', ts).group(1))
    fr = json.loads(re.search(r'_ANIM: [^=]*= (\{.*\});', ts).group(1))
    atlas = Image.open(GAME / f'src/assets/enemies/{c}-anim.webp').convert('RGBA')
    ims = {n: atlas.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for n, f in fr.items()}
    # one scale per creature: its biggest frame fits a cell
    mx = max(max(f['w'] for f in fr.values()) / (CW * 0.85), max(f['h'] for f in fr.values()) / (CH * 0.72))
    data[c] = (seq, fr, ims, 1 / mx)
    return data[c]


rows = (len(cells) + COLS - 1) // COLS
W, H = CW * COLS, CH * rows
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except OSError:
    font = ImageFont.load_default()
p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', out], stdin=subprocess.PIPE)
for k in range(FPS * SECS):
    t = k / FPS
    frame = Image.new('RGBA', (W, H), (226, 232, 214, 255))
    d = ImageDraw.Draw(frame)
    for i, cell in enumerate(cells):
        c, s, fps = cell[0], cell[1], float(cell[2])
        ping = len(cell) > 3
        seq, fr, ims, sc = load(c)
        names = seq[s]
        n = len(names)
        j = int(t * fps)
        if ping and n > 1:
            j %= 2 * n - 2
            j = j if j < n else 2 * n - 2 - j
        else:
            j %= n
        nm = names[j]
        f = fr[nm]
        im = ims[nm]
        im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
        cx, cy = (i % COLS) * CW, (i // COLS) * CH
        gx, gy = cx + CW // 2, cy + int(CH * 0.86)
        d.rectangle([cx + 2, cy + 2, cx + CW - 3, cy + CH - 3], outline=(180, 190, 170))
        d.line([cx + 20, gy, cx + CW - 20, gy], fill=(150, 140, 110), width=2)
        frame.alpha_composite(im, (round(gx - f['ax'] * sc), round(gy - f['ay'] * sc)))
        d.text((cx + 10, cy + 8), f'{c} · {s}', fill=(40, 50, 40), font=font)
    p.stdin.write(frame.convert('RGB').tobytes())
p.stdin.close()
p.wait()
print(out)
