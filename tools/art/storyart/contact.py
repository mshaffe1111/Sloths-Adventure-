"""Contact sheets of every new story figure on dark, at game-ish size, named: the story HD pages (Pokey, Meeca, Dot) and the cel pages.
-> reference/prop-sheets/qa-notes/story-art/contact-<set>-<n>.jpg

    python3 -I tools/art/storyart/contact.py
"""
import re, json
from pathlib import Path
from PIL import Image, ImageDraw

REPO = Path(__file__).resolve().parents[3]
QA = REPO / 'reference/prop-sheets/qa-notes/story-art'


def frames(path, var):
    src = (REPO / path).read_text()
    out = {}
    for m in re.finditer(r"'?\"?([a-z0-9_.]+)\"?'?: \{ (?:p|a): (\d+), x: (\d+), y: (\d+), w: (\d+), h: (\d+)", src):
        out[m.group(1)] = tuple(int(m.group(i)) for i in range(2, 7))
    return out


def sheet(name, page_of, fr, cell=(250, 260), cols=7):
    keys = sorted(fr)
    for s in range(0, len(keys), cols * 4):
        part = keys[s:s + cols * 4]
        S = Image.new('RGB', (cols * cell[0], 4 * cell[1]), (24, 28, 32))
        d = ImageDraw.Draw(S)
        for i, k in enumerate(part):
            p, x, y, w, h = fr[k]
            im = Image.open(page_of(p)).convert('RGBA').crop((x, y, x + w, y + h))
            im.thumbnail((cell[0] - 10, cell[1] - 24))
            cx, cy = (i % cols) * cell[0], (i // cols) * cell[1]
            S.paste(im, (cx + (cell[0] - im.width) // 2, cy + cell[1] - im.height - 4), im)
            d.text((cx + 4, cy + 3), k, fill=(255, 230, 0))
        out = QA / f'contact-{name}-{s // (cols * 4)}.jpg'
        S.save(out, quality=84)
        print(out)


for st in ('pokey', 'meeca', 'dot'):
    sheet(st, lambda p, st=st: REPO / f'src/assets/story/hd/{st}-{p}.webp', frames(f'src/game/storyHdData_{st}.ts', 'FRAMES'))
sheet('cels', lambda p: REPO / f'src/assets/characters/cels-{p}.webp', frames('src/game/storyCelData.ts', 'CELS'))
