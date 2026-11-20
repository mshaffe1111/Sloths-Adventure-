"""ENG-ROCK (R-165.338, the lead's ruling C 11-20): the img2img start for World 2's two new brown hop rocks, from the World 2 kit's own
boulder (src/assets/kits/w2.webp, kitAtlasData '2'.boulder) so the takes keep its hand. On flat grey 128 (transparent pieces, hf-art.md
step 4), solid alpha only, 1536x768: LEFT the boulder stretched low and wide (a flat-ish top to stand on), RIGHT squeezed tall and narrow.

    python3 -I tools/art/hfrock/starts.py <repo root>    -> reference/art/hfrock/starts/rocks-w2.png
"""
import json, sys
from pathlib import Path
from PIL import Image

root = Path(sys.argv[1])
src = (root / 'src/game/kitAtlasData.ts').read_text()
f = json.loads(src[src.index('= {') + 2:src.rindex('}') + 1])['2']['boulder']
kit = Image.open(root / 'src/assets/kits/w2.webp').convert('RGBA')
b = kit.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
b.putalpha(b.split()[3].point(lambda v: 255 if v > 128 else 0))
out = Image.new('RGB', (1536, 768), (128, 128, 128))
for (w, h), cx in (((680, 230), 384), ((400, 330), 1152)):
    p = b.resize((w, h), Image.LANCZOS)
    a = p.split()[3].point(lambda v: 255 if v > 128 else 0)
    out.paste(p.convert('RGB'), (cx - w // 2, 600 - h), a)
out.save(root / 'reference/art/hfrock/starts/rocks-w2.png')
