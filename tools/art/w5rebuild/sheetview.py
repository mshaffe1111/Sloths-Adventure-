"""Every frame of World 5's prop sheet on dark and mid-grey, labelled: python3 sheetview.py <out.jpg> [names...]"""
import re, sys
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parents[3]
F = {m.group(1): tuple(map(int, m.groups()[1:])) for m in re.finditer(r'(\w+): \{ x: (\d+), y: (\d+), w: (\d+), h: (\d+) \}', (ROOT / 'src/game/w5PropsData.ts').read_text())}
sheet = Image.open(ROOT / 'src/assets/props/w5-props.webp').convert('RGBA')
names = sys.argv[2:] or sorted(F)
T = 170; cols = 6
S = Image.new('RGB', (cols * T, ((len(names) + cols - 1) // cols) * (T + 14)), (20, 20, 20)); d = ImageDraw.Draw(S)
for i, n in enumerate(names):
    x, y, w, h = F[n]; p = sheet.crop((x, y, x + w, y + h)); p.thumbnail((T - 6, T - 6))
    c = Image.new('RGBA', (T, T), (128, 128, 128, 255)); c.paste((34, 30, 38, 255), (0, 0, T // 2, T))
    c.alpha_composite(p, ((T - p.width) // 2, (T - p.height) // 2))
    X, Y = (i % cols) * T, (i // cols) * (T + 14)
    S.paste(c.convert('RGB'), (X, Y + 14)); d.text((X + 2, Y + 1), n, fill=(255, 255, 0))
S.save(sys.argv[1], quality=85)
print(len(names), 'frames')
