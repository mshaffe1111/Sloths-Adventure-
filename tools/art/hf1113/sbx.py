"""ART 11-13: run INSIDE the Hugging Face sandbox (this session's credential is refused for the bucket and for repo writes, so files come
back by hf_sandbox_fs cat, at most 100000 bytes a call).

    python sbx.py sheet <out.jpg> <tile w> <cols> <png>...   contact sheet, each take on dusk purple with its name (cuts) or as is
    python sbx.py parts <file>                               <file>.p0, .p1, ... base64 parts of exactly 95000 bytes (the last padded
                                                             with newlines, so every cat is the same size); prints the part count
    python sbx.py cut <climbcut.py> <out dir> <png>...       runs climbcut on each, writes <name>.webp (lossless) + grips.json
"""
import base64, json, runpy, sys
from pathlib import Path
from PIL import Image, ImageDraw

PART = 95000


def sheet(out, tw, cols, files):
    tw, cols = int(tw), int(cols)
    ims = [Image.open(f) for f in files]
    th = max(round(tw * im.height / im.width) for im in ims)
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 14)), (30, 30, 30))
    d = ImageDraw.Draw(S)
    for i, (f, im) in enumerate(zip(files, ims)):
        x, y = (i % cols) * tw, (i // cols) * (th + 14)
        t = im.convert('RGBA').resize((tw, round(tw * im.height / im.width)), Image.LANCZOS)
        bg = Image.new('RGBA', t.size, (60, 30, 70, 255)); bg.alpha_composite(t)
        S.paste(bg.convert('RGB'), (x, y + 14))
        d.text((x + 3, y + 1), Path(f).stem, fill=(255, 255, 0))
    S.save(out, quality=80)


def parts(f):
    b = base64.b64encode(Path(f).read_bytes())
    n = (len(b) + PART - 1) // PART
    for i in range(n):
        c = b[i * PART:(i + 1) * PART]
        Path(f'{f}.p{i}').write_bytes(c + b'\n' * (PART - len(c)))
    print(n)


def cut(tool, outdir, files):
    m = runpy.run_path(tool)
    od = Path(outdir); od.mkdir(parents=True, exist_ok=True)
    allg = {}
    for f in files:
        name = Path(f).stem
        info = m['cut'](f, str(od / f'{name}.png'))
        Image.open(od / f'{name}.png').save(od / f'{name}.webp', lossless=True, method=6)
        allg[name] = info
    (od / 'grips.json').write_text(json.dumps(allg, indent=1))


if __name__ == '__main__':
    c = sys.argv[1]
    if c == 'sheet':
        sheet(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5:])
    elif c == 'parts':
        parts(sys.argv[2])
    elif c == 'cut':
        cut(sys.argv[2], sys.argv[3], sys.argv[4:])
