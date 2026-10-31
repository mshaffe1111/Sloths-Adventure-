"""Rewrite a hero clip sheet (src/assets/hero/clips/<name>.webp, heroClipsData.ts) with its own cells in another order (pokey-anim):
a cell may repeat. The hook's way back popped from its reach, turned away, to a pose at ease facing us; its own wind-up cell now
carries it back, as the jab's did.

    python3 -I tools/art/pokeyanim/reorder.py move-hook 0,1,2,3,4,0,6
"""
import json, re, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
name, order = sys.argv[1], [int(v) for v in sys.argv[2].split(',')]
data_p = ROOT / 'src/game/heroClipsData.ts'
txt = data_p.read_text()
m = re.search(r'HERO_CLIPS: Record<string, HeroClip> = (\{.*?\});', txt, re.S)
clips = json.loads(m.group(1))
c = clips[name]
src = Image.open(ROOT / f'src/assets/hero/clips/{name}.webp').convert('RGBA')
cell = lambda i: src.crop(((i % c['cols']) * c['w'], (i // c['cols']) * c['h'], (i % c['cols'] + 1) * c['w'], (i // c['cols'] + 1) * c['h']))
cells = [cell(i) for i in order]
rows = (len(cells) + c['cols'] - 1) // c['cols']
out = Image.new('RGBA', (c['w'] * c['cols'], c['h'] * rows), (0, 0, 0, 0))
for k, im in enumerate(cells):
    out.paste(im, ((k % c['cols']) * c['w'], (k // c['cols']) * c['h']))
out.save(ROOT / f'src/assets/hero/clips/{name}.webp', 'WEBP', quality=86, method=6)
c['n'] = len(cells)
data_p.write_text(txt[:m.start(1)] + json.dumps(clips, indent=1) + txt[m.end(1):])
print(name, c)
