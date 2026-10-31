"""Start pictures for pokey-anim round 3 (2026-10-31), on the flat grey the models know:

- rope_fN: Matt's rope cells (src/assets/hero/hero-rope.webp, heroRopeData.ts), each with its grip (the rope's middle at his paws) at the
  same point and his torso middle on the same line, so two cells side by side ask Qwen-Edit for the pose between them in place;
- vine_<pose>: his vine-swing pictures (hero-vine.webp, heroVineData.ts), each with its top hand's grip at the same point;
- punch: the cross's own first frame (src/assets/hero/clips/move-cross.webp), so a punch clip starts facing us like the cross and hook.

    python3 -I tools/art/pokeyanim/starts2.py   -> reference/prop-sheets/qa-notes/pokey-anim/starts/<name>.png
"""
import json, re
from pathlib import Path
from PIL import Image

H = Path(__file__).resolve().parent
ROOT = H.parents[2]
OUT = ROOT / 'reference/prop-sheets/qa-notes/pokey-anim/starts'
GREY = (200, 200, 200, 255)


def frames(ts, atlas):
    data = (ROOT / 'src/game' / ts).read_text()
    im = Image.open(ROOT / 'src/assets/hero' / atlas).convert('RGBA')
    out = {}
    for m in re.finditer(r"(\w+): \{ ([^}]*) \}", data):
        kv = dict((k.strip(), float(v)) for k, v in (p.split(':') for p in m.group(2).split(',')))
        if {'x', 'y', 'w', 'h'} <= kv.keys():
            out[m.group(1)] = (im.crop((int(kv['x']), int(kv['y']), int(kv['x'] + kv['w']), int(kv['y'] + kv['h']))), kv)
    return out


def place(im, k, ax, ay, W, Hh, at):
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    c = Image.new('RGBA', (W, Hh), GREY)
    c.alpha_composite(im, (round(at[0] - ax * k), round(at[1] - ay * k)))
    return c.convert('RGB')


OUT.mkdir(parents=True, exist_ok=True)
rope = frames('heroRopeData.ts', 'hero-rope.webp')
for n in ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']:
    im, kv = rope[n]
    place(im, 2.6, kv['ax'], kv['gy'], 768, 768, (384, 120)).save(OUT / f'rope_{n}.png')
vine = frames('heroVineData.ts', 'hero-vine.webp')
for n in ['still', 'forward', 'back']:
    im, kv = vine[n]
    place(im, 1.35, kv['gx'], kv['gy'], 768, 768, (384, 80)).save(OUT / f'vine_{n}.png')
clips = json.loads(re.search(r'= (\{.*\});', (ROOT / 'src/game/heroClipsData.ts').read_text(), re.S).group(1))
c = clips['move-cross']
sheet = Image.open(ROOT / 'src/assets/hero/clips/move-cross.webp').convert('RGBA')
cell = sheet.crop((0, 0, c['w'], c['h']))
place(cell, 330 / 200, c['ax'], c['ay'], 832, 480, (832 * 0.42, 480 * 0.92)).save(OUT / 'punch_cross.png')
print(sorted(p.name for p in OUT.glob('*.png')))
