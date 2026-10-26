"""Preview a packed creature sheet (<c>-anim.webp + <c>AnimData.ts, or any sheet with the same {x, y, w, h, ax, ay} frames): every sequence
playing side by side on the game's grey at its own anchor, as an animated WebP, plus a still contact sheet of every frame.

    python3 -I tools/art/w5/preview_sheet.py <sheet.webp> <data.ts> <out prefix> [fps=16] [scale=1] [prefix of the SEQ/FRAMES consts]
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageDraw

sheet = Image.open(sys.argv[1]).convert('RGBA')
src = Path(sys.argv[2]).read_text()
out = sys.argv[3]
fps = float(sys.argv[4]) if len(sys.argv) > 4 else 16
scale = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
seqs = json.loads(re.search(r'(?:_SEQ|_CLIPS)[^=]*= (\{.*?\});', src).group(1))
frames = json.loads(re.search(r'(?:_ANIM|_FRAMES|_ANIM_FRAMES): Record<string, [A-Za-z]+> = (\{.*\});', src).group(1))
crop = lambda n: sheet.crop((frames[n]['x'], frames[n]['y'], frames[n]['x'] + frames[n]['w'], frames[n]['y'] + frames[n]['h']))
# a cell per sequence, big enough for its largest frame around the anchor
cells = []
for s, names in seqs.items():
    l = max(frames[n]['ax'] for n in names); r = max(frames[n]['w'] - frames[n]['ax'] for n in names)
    t = max(frames[n]['ay'] for n in names); b = max(frames[n]['h'] - frames[n]['ay'] for n in names)
    cells.append((s, names, l, r, t, b))
cw = int(max(l + r for _, _, l, r, _, _ in cells) * scale) + 20
ch = int(max(t + b for _, _, _, _, t, b in cells) * scale) + 36
cols = min(4, len(cells))
rows = (len(cells) + cols - 1) // cols
n = max(len(c[1]) for c in cells)
GREY = (150, 160, 150, 255)
movie = []
for k in range(n):
    F = Image.new('RGBA', (cols * cw, rows * ch), GREY)
    d = ImageDraw.Draw(F)
    for i, (s, names, l, r, t, b) in enumerate(cells):
        cx, cy = (i % cols) * cw, (i // cols) * ch
        nm = names[k % len(names)]
        im = crop(nm)
        if scale != 1:
            im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
        ox = cx + 10 + int(l * scale) - int(frames[nm]['ax'] * scale)
        oy = cy + 26 + int(t * scale) - int(frames[nm]['ay'] * scale)
        F.alpha_composite(im, (ox, oy))
        d.line((cx + 4, cy + 26 + int(t * scale), cx + cw - 4, cy + 26 + int(t * scale)), fill=(90, 100, 90, 255))
        d.text((cx + 6, cy + 6), f'{s} ({len(names)})', fill=(20, 20, 20, 255))
    movie.append(F.convert('RGB'))
movie[0].save(out + '.webp', save_all=True, append_images=movie[1:], duration=int(1000 / fps), loop=0, quality=80)
# contact sheet of every frame
allf = [nm for _, names, *_ in cells for nm in names]
tw = 140
th = int(max(frames[x]['h'] * tw / frames[x]['w'] for x in allf)) + 14
S = Image.new('RGB', (12 * tw, ((len(allf) + 11) // 12) * th), GREY[:3])
d = ImageDraw.Draw(S)
for i, nm in enumerate(allf):
    im = crop(nm)
    im = im.resize((tw, max(1, round(im.height * tw / im.width))), Image.LANCZOS)
    x, y = (i % 12) * tw, (i // 12) * th
    S.paste(im, (x, y + 14), im)
    d.text((x + 2, y + 1), nm, fill=(20, 20, 20))
S.save(out + '-frames.jpg', quality=85)
print(out + '.webp', len(movie), 'frames;', out + '-frames.jpg')
