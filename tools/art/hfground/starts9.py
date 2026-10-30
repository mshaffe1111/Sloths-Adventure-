"""Starts for the lead's 2026-10-30 afternoon list (hf-art-ground): the bank ends again on a pure green key (the magenta key bled into the
paint and gave the ends purple bodies), and World 8's rounded mossy stones that replace its code-drawn white stalagmites on the ledges
(they read as thorns on a ledge that is safe), as plain shapes on green for img2img.
    python3 tools/art/hfground/starts9.py   ->  tools/art/hfground/starts/gend-w<N>.webp, stones-w8.webp
"""
import json, re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
OUT = HERE / 'starts'
GREEN = (0, 255, 0, 255)
G = json.loads(re.search(r'GROUND_FRAMES: Record<number, GroundSheet> = (\{.*\});', (ROOT / 'src/game/groundAtlasData.ts').read_text(), re.S).group(1))
for w, g in G.items():
    S = Image.open(ROOT / f'src/assets/ground/w{w}.webp').convert('RGBA')
    f = g['end']
    bg = Image.new('RGBA', (f['w'], f['h']), GREEN)
    bg.alpha_composite(S.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])))
    bg.convert('RGB').save(OUT / f'gend-w{w}.webp', quality=95)
# World 8: three low rounded stones, slate blue with teal moss caps, on green
im = Image.new('RGB', (512, 384), GREEN[:3])
d = ImageDraw.Draw(im)
for (x0, y0, x1, y1) in ((70, 200, 250, 330), (210, 150, 370, 330), (330, 220, 450, 330)):
    d.ellipse((x0, y0, x1, y1 + 40), fill=(74, 84, 112), outline=(20, 22, 36), width=6)
    d.chord((x0 + 10, y0 + 2, x1 - 10, y0 + (y1 - y0) * 0.8), 190, 350, fill=(52, 150, 140))
d.rectangle((0, 330, 512, 384), fill=GREEN[:3])
im.filter(ImageFilter.GaussianBlur(1)).save(OUT / 'stones-w8.webp', quality=95)
print('ok')
