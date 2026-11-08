"""Kit-audit contact sheet per stage: the three sideways stills stacked, the upright one beside them (python3 sheet.py <shots> <out> <stage>...)."""
import sys, os
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for st in sys.argv[3:]:
    lands = [os.path.join(src, f'{st}-land-{p}.png') for p in (20, 50, 80)]
    port = os.path.join(src, f'{st}-port-50.png')
    lands = [f for f in lands if os.path.exists(f)]
    if not lands: continue
    sheet = Image.new('RGB', (844 + 8 + 540, 1170 + 16), (30, 30, 36))
    for i, f in enumerate(lands): sheet.paste(Image.open(f).convert('RGB'), (0, i * 395))
    if os.path.exists(port): sheet.paste(Image.open(port).convert('RGB').resize((540, 1169)), (852, 0))
    ImageDraw.Draw(sheet).text((856, 1172), st, fill=(255, 255, 0))
    sheet.save(os.path.join(out, f'{st}.jpg'), quality=82)
