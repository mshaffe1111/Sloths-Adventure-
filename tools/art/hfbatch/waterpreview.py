"""Preview of the painted pit water for Worlds 1, 3, 4 and 5 at game scale over each world's own backdrop and kit bank (hf-art-stage,
2026-10-29): the hand-built stages of Worlds 1, 3 and 5 keep their water deep under painted banks, so it is rarely on screen; this shows
the look as the game draws it (stageArt.ts drawPitWater: 420 world px a repeat, the deep colour under the strip, the shine over it),
a phone-width view sideways (844 x 390 css px at the game's zoom ~0.9).
    python3 -I tools/art/hfbatch/waterpreview.py
"""
import json, re
from pathlib import Path
from PIL import Image, ImageDraw

R = Path(__file__).resolve().parents[3]
data = (R / 'src/game/stageArtData.ts').read_text()
PW = json.loads(re.search(r'PIT_WATER[^=]*= (\{.*\});', data).group(1))
W, H = 844 * 2, 390 * 2
rows = []
for w in (1, 3, 4, 5):
    bg = Image.open(R / f'src/assets/backdrops/w{w}-far.webp').convert('RGBA').resize((W, H))
    near = Image.open(R / f'src/assets/backdrops/w{w}-near.webp').convert('RGBA')
    near = near.resize((W, round(near.height * W / near.width)))
    bg.alpha_composite(near, (0, H - near.height))
    sheet = Image.open(R / f'src/assets/props/pitwater/w{w}.webp').convert('RGBA')
    p = PW[str(w)]
    s = p['strip']
    strip = sheet.crop((s['x'], s['y'], s['x'] + s['w'], s['y'] + s['h']))
    sh = p['shine']
    shine = sheet.crop((sh['x'], sh['y'], sh['x'] + sh['w'], sh['y'] + sh['h']))
    k = 2 * 0.9  # css px per world px x dpr 2
    tile = round(420 * k)
    th = round(tile * s['h'] / s['w'])
    water_y = round(H * 0.62)
    top = round(water_y - th * p['surface'])
    ImageDraw.Draw(bg).rectangle([0, top + th - 2, W, H], fill=p['deep'])
    st = strip.resize((tile, th), Image.LANCZOS)
    sn = shine.resize((tile, th), Image.LANCZOS)
    for x in range(-tile // 3, W, tile - 1):
        bg.alpha_composite(st, (x, top))
    a = sn.getchannel('A').point(lambda v: int(v * 0.7))
    sn.putalpha(a)
    for x in range(-tile // 2, W, tile - 1):
        bg.alpha_composite(sn, (x, top))
    rows.append((w, bg))
S = Image.new('RGB', (W, (H + 30) * len(rows)), (0, 0, 0))
d = ImageDraw.Draw(S)
for i, (w, im) in enumerate(rows):
    S.paste(im.convert('RGB'), (0, i * (H + 30) + 26))
    d.text((6, i * (H + 30) + 6), f'World {w} pit water (preview over its far and near backdrop, game scale, sideways phone)', fill=(255, 230, 0))
out = R / 'reference/prop-sheets/qa-notes/hf-art-stage/water-preview.jpg'
S.save(out, 'JPEG', quality=85)
print(out)
