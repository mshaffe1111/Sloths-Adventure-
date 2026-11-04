"""R-159.1 art starts (w8-rope2, 2026-11-04), Matt-approved list: img2img starts pasted up from the game's own frames on flat magenta
(hf-art.md §5), never a bare prompt.
  vine-hang.webp  the gold snake's prowl frame turned head-down and recoloured to the lianas' green-brown (Matt's option (a))
  boa-ball.webp   the boa's coil frame squeezed round: the kicked boa rolled into a ball
    python3 -I tools/art/combat/starts.py
"""
import colorsys
import json
import re
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent / 'starts'
OUT.mkdir(exist_ok=True)
MAG = (255, 0, 255)


def frame(data_ts, atlas, name):
    src = (ROOT / 'src/game' / data_ts).read_text()
    r = json.loads(re.search('"%s": (\\{[^}]*\\})' % re.escape(name), src).group(1))
    return Image.open(ROOT / 'src/assets/enemies' / atlas).convert('RGBA').crop((r['x'], r['y'], r['x'] + r['w'], r['y'] + r['h']))


def solid(im):
    """no half-transparent pixels (hf-art.md §5): alpha cut at 50%"""
    a = im.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
    im.putalpha(a)
    return im


def recolour(im, hue=0.17, sat=0.42, lift=0.8):
    """gold to the lianas' green-brown, keeping the shading and the dark outline"""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a:
                continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            if s > 0.2 and l > 0.12:  # the body, not the outline or the eye's dark
                h2 = hue + (0.04 if l < 0.45 else -0.03)
                r2, g2, b2 = colorsys.hls_to_rgb(h2, l * lift, s * sat)
                px[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255), a)
    return im


def place(sprite, w, h, frac=0.8):
    k = min(w * frac / sprite.width, h * frac / sprite.height)
    s = sprite.resize((int(sprite.width * k), int(sprite.height * k)), Image.LANCZOS)
    s = solid(s)
    bg = Image.new('RGBA', (w, h), MAG + (255,))
    bg.alpha_composite(s, ((w - s.width) // 2, (h - s.height) // 2))
    return bg.convert('RGB')


snake = recolour(frame('goldsnakeAnimData.ts', 'goldsnake-anim.webp', 'prowl_10'))
# (the frame's bottom rows are its ground shadow, a dark line: cut off before it is turned head-down)
snake = snake.crop((0, 0, snake.width, snake.height - 10)).rotate(-90, expand=True, resample=Image.BICUBIC)
place(snake, 768, 1024).save(OUT / 'vine-hang.webp', quality=95)
coil = frame('boaAnimData.ts', 'boa-anim.webp', 'coil_00')
ball = coil.resize((coil.height, coil.height), Image.LANCZOS).rotate(-30, expand=True, resample=Image.BICUBIC)
place(ball, 1024, 1024, 0.7).save(OUT / 'boa-ball.webp', quality=95)
coilst = place(coil, 1024, 704, 0.75)
coilst.save(OUT / 'boa-coil.webp', quality=95)
print(sorted(p.name for p in OUT.iterdir()))
