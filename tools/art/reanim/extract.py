"""Start pictures for re-animating the game's creatures: chosen poses cut from their atlases, upscaled 4x (Real-ESRGAN), set on a 1024
square of flat grey at 80% of its width or height. meta.json records, for each start picture, the old frame and where its pixels
went (start px = old px * f + (ox, oy)) so the packer can carry the old anchors through.
  python3 -I extract.py creature:frame ...
"""
import json, re, subprocess, sys
from pathlib import Path
from PIL import Image
H = Path(__file__).resolve().parent
S = H.parent
G = Path((str(__import__('pathlib').Path(__file__).resolve().parents[3]) + '/src'))
ATLAS = {'eagle': 'eagle', 'ocelot': 'ocelot', 'frog': 'frog', 'spider': 'spider', 'tayra': 'tayra', 'turtle': 'turtle', 'caiman': 'caiman',
         'boa': 'boa', 'jaguar': 'jaguar', 'harpy': 'harpy', 'guard': 'guard'}
GREY = (127, 127, 127)


def frames(c):
    src = (G / f'game/{c}AtlasData.ts').read_text()
    out = {}
    for m in re.finditer(r'"?(\w+)"?: \{\s*"?x"?: ([\d.]+), "?y"?: ([\d.]+), "?w"?: ([\d.]+), "?h"?: ([\d.]+)(?:, "?ax"?: ([\d.]+))?(?:, "?ay"?: ([\d.]+))?', src):
        n = m.group(1)
        x, y, w, h = (int(float(v)) for v in m.groups()[1:5])
        ax = float(m.group(6)) if m.group(6) else w / 2
        ay = float(m.group(7)) if m.group(7) else h
        out[n] = dict(x=x, y=y, w=w, h=h, ax=ax, ay=ay)
    return out


meta = json.loads((H / 'meta.json').read_text()) if (H / 'meta.json').exists() else {}
(H / 'small').mkdir(exist_ok=True)
(H / 'in').mkdir(exist_ok=True)
todo = []
for arg in sys.argv[1:]:
    c, n = arg.split(':')
    fr = frames(c)[n]
    atlas = Image.open(G / f'assets/enemies/{ATLAS[c]}-atlas.webp').convert('RGBA')
    crop = atlas.crop((fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h']))
    p = H / 'small' / f'{c}-{n}.png'
    crop.save(p)
    todo += [str(p), str(H / 'in' / f'{c}-{n}.png')]
    meta[f'{c}-{n}'] = dict(creature=c, frame=n, **fr)
subprocess.run([sys.executable, str(S / 'upscale/up.py'), str(S / 'upscale/anime6b.pth'), *todo], check=True)
for arg in sys.argv[1:]:
    c, n = arg.split(':')
    key = f'{c}-{n}'
    big = Image.open(H / 'in' / f'{key}.png').convert('RGBA')
    m = meta[key]
    up = big.width / m['w']
    s = 819 / max(big.size)
    big = big.resize((round(big.width * s), round(big.height * s)), Image.LANCZOS)
    ox, oy = (1024 - big.width) // 2, (1024 - big.height) // 2
    c2 = Image.new('RGBA', (1024, 1024), GREY + (255,))
    c2.alpha_composite(big, (ox, oy))
    c2.convert('RGB').save(H / 'in' / f'{key}.png')
    m.update(f=up * s, ox=ox, oy=oy)
(H / 'meta.json').write_text(json.dumps(meta, indent=1))
print(len(sys.argv) - 1, 'start pictures')
