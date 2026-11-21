"""ART-NEXT-c (R-165.354): the first and last pictures for Pokey's idle BRIDGES (Wan2.2-I2V-A14B, first + last frame pinned).
His plain pose (heroStandardData idle, 3/4 turned right) and each idle clip's end pose (frame 0: every clip's first ~ its last) are
drawn feet-aligned on one flat-grey canvas, scaled up by S, so the bridge moves him in place:
  B1 plain -> front (idle-yawn frame 0: also look-around's and hurt's ends)   B2 plain -> belly-scratch frame 0
  B3 plain -> wave frame 0                                                   B4 plain -> doze frame 0 (he sits down)
    python3 -I tools/art/hfnext/bridgestarts.py      -> reference/art/hfnext/bridge/<B>-first.png, <B>-last.png, starts.jpg
Every start is checked inside its frame (grey all round), the lesson of the reeds (11-20).
"""
import json, subprocess
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

OUT = Path('reference/art/hfnext/bridge'); OUT.mkdir(parents=True, exist_ok=True)
GREY = (128, 128, 128)
CW, CH, S = 480, 576, 2.4          # canvas (multiples of 16), sheet px -> canvas px
FX, FY = 240, 552                  # the feet anchor on the canvas
CLIPS = json.loads(subprocess.run(['npx', 'tsx', '-e', "import {HERO_CLIPS} from './src/game/heroClipsData.ts'; console.log(JSON.stringify(HERO_CLIPS))"],
                                  capture_output=True, text=True, check=True).stdout)
STD = Image.open('src/assets/hero/hero-standard.webp').convert('RGBA')
PLAIN = (STD.crop((674, 478, 674 + 127, 478 + 209)), 57.0, 205.0)    # heroStandardData STD_FRAMES.idle


def clip_frame(name, k):
    c = CLIPS[name]; im = Image.open(f'src/assets/hero/clips/{name}.webp').convert('RGBA')
    x, y = (k % c['cols']) * c['w'], (k // c['cols']) * c['h']
    return im.crop((x, y, x + c['w'], y + c['h'])), c['ax'], c['ay']


def place(fr):
    im, ax, ay = fr
    big = im.resize((round(im.width * S), round(im.height * S)), Image.LANCZOS)
    c = Image.new('RGBA', (CW, CH), GREY + (255,)); c.alpha_composite(big, (round(FX - ax * S), round(FY - ay * S)))
    return c.convert('RGB')


BRIDGES = {'B1': 'idle-yawn', 'B2': 'belly-scratch', 'B3': 'wave', 'B4': 'doze'}
tiles = []
for b, clip in BRIDGES.items():
    first, last = place(PLAIN), place(clip_frame(clip, 0))
    for tag, im in (('first', first), ('last', last)):
        e = np.asarray(im).astype(int)
        edges = np.concatenate([e[0], e[-1], e[:, 0], e[:, -1]])
        bad = (np.abs(edges - np.array(GREY)).max(axis=1) > 6).mean()
        assert bad < 0.002, f'{b}-{tag}: paint on {bad:.1%} of its frame edge'
        im.save(OUT / f'{b}-{tag}.png')
    T = Image.new('RGB', (CW * 2 + 10, CH + 18), (20, 20, 24)); T.paste(first, (0, 18)); T.paste(last, (CW + 10, 18))
    ImageDraw.Draw(T).text((4, 3), f'{b}: plain pose -> {clip} frame 0 (feet at {FX},{FY})', fill=(255, 230, 90)); tiles.append(T)
sheet = Image.new('RGB', (tiles[0].width * 2, tiles[0].height * 2), (0, 0, 0))
for i, t in enumerate(tiles): sheet.paste(t, ((i % 2) * t.width, (i // 2) * t.height))
sheet.resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS).save(OUT / 'starts.jpg', quality=85)
print('starts ok', list(BRIDGES))
