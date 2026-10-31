"""Start pictures for 7-4's slide redo (pokey-anim round 3, 2026-10-31): his flume grip pose (src/assets/w7slide/flume-pokey.webp,
standing seen from behind) on the flat grey, and Matt's own seated butt-slide from behind (standard-set 09_behind-the-back.jpg, cell 9)
as the reference for sitting down into a slide.

    python3 -I tools/art/pokeyanim/starts3.py   -> reference/prop-sheets/qa-notes/pokey-anim/starts/slide_grip.png, slide_ref9.png
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'reference/prop-sheets/qa-notes/pokey-anim/starts'
meta = json.loads((ROOT / 'src/assets/w7slide/flume-atlas.json').read_text())['sheets']['flume-pokey']
x, y, w, h = meta['frames']['grip']
im = Image.open(ROOT / 'src/assets/w7slide' / meta['file']).convert('RGBA').crop((x, y, x + w, y + h))
k = 560 / h
im = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
c = Image.new('RGBA', (768, 768), (200, 200, 200, 255))
c.alpha_composite(im, ((768 - im.width) // 2, 768 - 80 - im.height))
c.convert('RGB').save(OUT / 'slide_grip.png')
ref = Image.open(ROOT / 'reference/animation-sheets/slomatt/standard-set/09_behind-the-back.jpg').convert('RGB').crop((0, 512, 256, 768))
ref.resize((512, 512), Image.LANCZOS).save(OUT / 'slide_ref9.png')
print('ok')
