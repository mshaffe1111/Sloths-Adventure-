"""Put the picked defeat still into croc-anim.webp in place of the frame every defeat card draws (defeated_024): keyed off magenta,
scaled to fit that frame's box, its feet on the box's floor (the frame's anchor), so no code changes.
  python3 -I tools/art/crocdefeat/pack.py <take> [out.webp]   (default: src/assets/enemies/croc-anim.webp in place)"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
from cut import key
R = Path(__file__).resolve().parents[3]
take = sys.argv[1]
out = Path(sys.argv[2]) if len(sys.argv) > 2 else R / 'src/assets/enemies/croc-anim.webp'
fr = json.loads(re.search(r'CROC_ANIM_FRAMES: Record<string, BossFrameRect> = (\{.*?\});', (R / 'src/game/crocAnimData.ts').read_text()).group(1))
f = fr['defeated_024']
sheet = Image.open(R / 'src/assets/enemies/croc-anim.webp').convert('RGBA')
art = key(take)                                   # body, crown and mud, trimmed
k = min(f['w'] / art.width, f['h'] / art.height)
art = art.resize((max(1, round(art.width * k)), max(1, round(art.height * k))), Image.LANCZOS)
box = Image.new('RGBA', (f['w'], f['h']), (0, 0, 0, 0))
box.paste(art, ((f['w'] - art.width) // 2, f['h'] - art.height), art)   # feet on the floor of the box
sheet.paste(Image.new('RGBA', (f['w'], f['h']), (0, 0, 0, 0)), (f['x'], f['y']))
sheet.alpha_composite(box, (f['x'], f['y']))
sheet.save(out, 'WEBP', quality=90, method=6)
print(out, art.size, 'in', (f['w'], f['h']))
