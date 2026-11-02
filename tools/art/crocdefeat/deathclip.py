"""Crocus Rex's in-fight defeat clip, $0 (R-1.1, 2026-11-02): the Wan "defeated" clip was keyed off grey and lost 15-35% of his body
(see-through). New clip, same 13 steps over the 2.0 s death (engine stepBossDeath / crocSprite DYING_S):
  hurt_002 hurt_006         his clean flinch (1-2% holes), 0-0.31 s
  dfade_1 dfade_2           hurt_006 cross-faded into the painted defeat still, aligned on his feet (the anchor), 0.31-0.62 s
  defeated_024 x9           the painted still (tools/art/crocdefeat/pack.py), from 0.62 s; the engine fades a boss with no ending
                            out from 1.0 s (bossArt.ts), so the still is what he falls apart from. The story cards draw it too.
The fades go in a new row at the bottom of croc-anim.webp; the 12 old holey defeated_* frames are cut from the sheet and the data.
Every packed frame is measured with holes.py.   python3 -I tools/art/crocdefeat/deathclip.py"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from holes import hole_share
R = Path(__file__).resolve().parents[3]
DATA = R / 'src/game/crocAnimData.ts'
SHEET = R / 'src/assets/enemies/croc-anim.webp'
src = DATA.read_text()
m = re.search(r'(export const CROC_ANIM_FRAMES: Record<string, BossFrameRect> = )(\{.*?\});', src)
fr = json.loads(m.group(2))
sheet = Image.open(SHEET).convert('RGBA')
crop = lambda f: sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
A, B = fr['hurt_006'], fr['defeated_024']
left = max(A['ax'], B['ax']); right = max(A['w'] - A['ax'], B['w'] - B['ax']); up = max(A['ay'], B['ay']); down = max(A['h'] - A['ay'], B['h'] - B['ay'], 0)
W, H = int(np.ceil(left + right)), int(np.ceil(up + down))
def placed(f):
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(crop(f), (int(round(left - f['ax'])), int(round(up - f['ay']))))
    return np.asarray(c).astype(np.float32) / 255
pa, pb = placed(A), placed(B)
pre = lambda p: np.concatenate([p[..., :3] * p[..., 3:], p[..., 3:]], -1)
fades = []
for i, u in enumerate((0.35, 0.7), 1):
    mix = pre(pa) * (1 - u) + pre(pb) * u
    a = mix[..., 3:]
    rgb = np.where(a > 1e-4, mix[..., :3] / np.maximum(a, 1e-4), 0)
    fades.append((f'dfade_{i}', Image.fromarray((np.concatenate([rgb, a], -1) * 255).clip(0, 255).astype(np.uint8))))
# cut the old holey frames out of the sheet and the data
old = [k for k in fr if k.startswith('defeated_') and k != 'defeated_024']
for k in old:
    f = fr.pop(k)
    sheet.paste(Image.new('RGBA', (f['w'], f['h']), (0, 0, 0, 0)), (f['x'], f['y']))
# a new row under the sheet for the fades
y0 = sheet.height + 2
big = Image.new('RGBA', (sheet.width, y0 + H), (0, 0, 0, 0)); big.paste(sheet, (0, 0))
x = 0
for n, im in fades:
    big.paste(im, (x, y0)); fr[n] = {'x': x, 'y': y0, 'w': W, 'h': H, 'ax': round(left, 1), 'ay': round(up, 1)}; x += W + 2
big.save(SHEET, 'WEBP', quality=90, method=6)
# (13 steps over 2.0 s; a boss with no ending fades out from 1.0 s (bossArt.ts drawBossFighter), so the still must be on by ~0.6 s)
clip = ['hurt_002', 'hurt_006', 'dfade_1', 'dfade_2'] + ['defeated_024'] * 9
src = src[:m.start(2)] + json.dumps(fr) + src[m.end(2):]
src = re.sub(r'"defeated": \[[^\]]*\]', '"defeated": ' + json.dumps(clip), src)
DATA.write_text(src)
print('sheet', big.size, 'removed', len(old))
for n in clip[:9]:
    f = fr[n]; print(f'{n:14s} holes {hole_share(big.crop((f["x"], f["y"], f["x"] + f["w"], f["y"] + f["h"]))):.0%}')
