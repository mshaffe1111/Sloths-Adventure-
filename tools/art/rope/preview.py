"""Preview of Pokey's rope crossing as the game packs it (2026-10-29): hero-rope.webp + heroRopeData.ts on the painted rope
(rope-kit.webp), timed the way heroRope.ts times it (one cycle per ROPE_STRIDE of travel at the game's ROPE_SPEED 120 px/s, the still
frame with a slow sway when he stops, mirrored going left), at 30 fps like the game's loop.

    python3 -I tools/art/rope/preview.py <out.mp4> <strip.png>

The video: creep right 3 s, hang still 2 s, creep left 3 s. The strip: each picture of the cycle and the still one, hung on the rope.
"""
import math, re, subprocess, sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

H = Path(__file__).resolve().parent
GAME = H.parents[2]
SPEED = 120
FPS = 30
PX = 2.6  # video px per world unit


def data():
    ts = (GAME / 'src/game/heroRopeData.ts').read_text()
    fr = {m[0]: dict(zip(('x', 'y', 'w', 'h', 'ax', 'gy'), map(float, m[1:]))) for m in
          re.findall(r'(\w+): \{ x: ([\d.]+), y: ([\d.]+), w: ([\d.]+), h: ([\d.]+), ax: ([\d.]+), gy: ([\d.]+) \}', ts)}
    cyc = re.findall(r"'(\w+)'", re.search(r'ROPE_CYCLE = \[(.*?)\]', ts).group(1))
    still = re.search(r"ROPE_STILL = '(\w+)'", ts).group(1)
    stand = float(re.search(r'ROPE_STAND_PX = ([\d.]+)', ts).group(1))
    stride_px = float(re.search(r'ROPE_STRIDE_PX = ([\d.]+)', ts).group(1))
    k = 66 * 1.35 / stand
    kit = (GAME / 'src/game/ropeKitData.ts').read_text()
    tile = dict(re.findall(r'(\w+): ([\d.]+)', re.search(r'tile: \{(.*?)\}', kit).group(1)))
    return fr, cyc, still, k, stride_px * k, {a: float(b) for a, b in tile.items()}


FR, CYC, STILL, K, STRIDE, TILE = data()
ATLAS = Image.open(GAME / 'src/assets/hero/hero-rope.webp').convert('RGBA')
KIT = Image.open(GAME / 'src/assets/props/rope-kit.webp').convert('RGBA')
IMS = {n: ATLAS.crop((int(f['x']), int(f['y']), int(f['x'] + f['w']), int(f['y'] + f['h']))) for n, f in FR.items()}


def rope_strip(width_px):
    t = KIT.crop((int(TILE['x']), int(TILE['y']), int(TILE['x'] + TILE['w']), int(TILE['y'] + TILE['h'])))
    s = 9 * PX / TILE['thick']
    t = t.resize((max(1, round(t.width * s)), max(1, round(t.height * s))), Image.LANCZOS)
    out = Image.new('RGBA', (width_px, t.height), (0, 0, 0, 0))
    for x in range(0, width_px, t.width):
        out.alpha_composite(t, (x, 0))
    return out, TILE['mid'] * s


def hang(frame, name, gx, gy, facing, sway):
    f = FR[name]
    im = IMS[name]
    s = K * PX
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    ax, ay = f['ax'] * s, f['gy'] * s
    if facing < 0:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
        ax = im.width - ax
    # turn about the grip
    pad = Image.new('RGBA', (im.width * 3, im.height * 3), (0, 0, 0, 0))
    pad.alpha_composite(im, (round(im.width * 1.5 - ax), round(im.height * 1.5 - ay)))
    pad = pad.rotate(-math.degrees(sway) * facing, resample=Image.BICUBIC, center=(im.width * 1.5, im.height * 1.5))
    frame.alpha_composite(pad, (round(gx - im.width * 1.5), round(gy - im.height * 1.5)))


def pick(moving, travelled):
    if not moving:
        return STILL
    return CYC[int((travelled / STRIDE) * len(CYC)) % len(CYC)]


def video(out):
    W, Hh = 1100, 420
    strip, mid = rope_strip(W)
    ry = 90
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{Hh}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', str(out)], stdin=subprocess.PIPE)
    x = 25.0
    travelled = 0.0
    font = ImageFont.load_default()
    for k in range(FPS * 8):
        t = k / FPS
        moving = t < 3 or t >= 5
        facing = 1 if t < 5 else -1
        if moving:
            if (t < 3 and k == 0) or (t >= 5 and k == FPS * 5):
                travelled = 0.0
            x += facing * SPEED / FPS
            travelled += SPEED / FPS
        name = pick(moving, travelled)
        sway = math.sin(t * 2.2) * 0.05 if not moving else math.sin(travelled / STRIDE * math.pi * 2) * 0.035
        fr = Image.new('RGBA', (W, Hh), (34, 52, 36, 255))
        fr.alpha_composite(strip, (0, round(ry - mid)))
        hang(fr, name, x * PX, ry, facing, sway)
        d = ImageDraw.Draw(fr)
        d.text((10, Hh - 20), f'{t:4.1f}s  {"creeping" if moving else "still"}  frame {name}', fill=(255, 255, 210), font=font)
        p.stdin.write(fr.convert('RGB').tobytes())
    p.stdin.close()
    p.wait()


def strip_png(out):
    names = CYC + [STILL]
    cw = 300
    W = cw * len(names)
    Hh = 360
    fr = Image.new('RGBA', (W, Hh), (34, 52, 36, 255))
    strip, mid = rope_strip(W)
    ry = 40
    fr.alpha_composite(strip, (0, round(ry - mid)))
    d = ImageDraw.Draw(fr)
    for i, n in enumerate(names):
        hang(fr, n, i * cw + cw / 2, ry, 1, 0)
        d.text((i * cw + 8, Hh - 18), n + (' (still)' if n == STILL else ''), fill=(255, 255, 210))
    fr.convert('RGB').save(out)


if __name__ == '__main__':
    video(sys.argv[1])
    strip_png(sys.argv[2])
    print('stride', round(STRIDE, 1), 'units,', round(SPEED / STRIDE, 2), 'cycles a second,', len(CYC), 'frames a cycle')
