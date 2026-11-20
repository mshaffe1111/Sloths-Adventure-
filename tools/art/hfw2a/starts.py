"""ART-W2A: the edit starts. Matt's Happy poses (w2-props) and w2Heron (dressnew-w2), each on flat grey, upscaled to the edit size.
    python3 -I tools/art/hfw2a/starts.py   (from the repo root) -> reference/art/hfw2a/starts/*.png
"""
from PIL import Image
GREY = (150, 150, 150)
a = Image.open('src/assets/props/w2-props.webp').convert('RGBA')
b = Image.open('src/assets/props/dressnew-w2.webp').convert('RGBA')
OUT = 'reference/art/hfw2a/starts/'
def put(piece, W, H, fill, name):
    k = fill * H / piece.height
    p = piece.resize((round(piece.width * k), round(piece.height * k)), Image.LANCZOS)
    c = Image.new('RGBA', (W, H), GREY + (255,))
    c.alpha_composite(p, ((W - p.width) // 2, (H - p.height) // 2))
    c.convert('RGB').save(OUT + name + '.png')
for n, (x, y, w, h) in {'duck': (1503, 1262, 185, 260), 'otter': (1692, 1262, 190, 260), 'capy': (1317, 1262, 182, 260)}.items():
    put(a.crop((x, y, x + w, y + h)), 1024, 1024, 0.72, n + '-happy')
put(b.crop((181, 0, 181 + 322, 471)), 768, 1120, 0.86, 'heron')
