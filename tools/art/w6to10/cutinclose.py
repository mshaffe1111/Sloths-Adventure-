"""Cut the close-ups out of cutinshots.mjs's screenshots (crops.json: CSS px, the shots are at 2x) and lay every shot out on contact
sheets, upright and sideways, for checking.   python3 -I tools/art/w6to10/cutinclose.py <out dir>"""
import json, sys
from pathlib import Path
from PIL import Image

D = Path(sys.argv[1])
for name, c in json.loads((D / 'crops.json').read_text()).items():
    im = Image.open(D / f'{name}.png')
    k = im.width / (390 if 'upright' in name else 844)
    im.crop(tuple(round(v * k) for v in (c['x'], c['y'], c['x'] + c['width'], c['y'] + c['height']))).save(D / f'{name}-close.png')
for size in ('upright', 'sideways'):
    names = sorted(p.stem for p in D.glob(f'*-{size}.png'))
    ims = [Image.open(D / f'{n}.png') for n in names]
    if not ims:
        continue
    t = ims[0].resize((ims[0].width // 3, ims[0].height // 3))
    cols = 6 if size == 'upright' else 3
    sheet = Image.new('RGB', (cols * t.width, -(-len(ims) // cols) * t.height))
    for i, im in enumerate(ims):
        sheet.paste(im.resize((t.width, t.height)), ((i % cols) * t.width, (i // cols) * t.height))
    sheet.save(D / f'contact-{size}.jpg', quality=85)
    print(size, names)
