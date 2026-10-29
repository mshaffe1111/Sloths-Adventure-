"""The start picture for the rope traverse clip (2026-10-29): Gemini cell 1 (both paws on the rope, tools/art/rope/cut.py) on the sheet's
own flat grey, with the sheet's rope straightened and run the whole width of the clip so he has something to travel along. Saved at the
clip's own size (832x480, ~11 KB) as a WebP for the bucket (hf_fs_write through the connector; this machine cannot reach huggingface.co).

    python3 -I tools/art/rope/prep_start.py <out.webp>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H))
from cut import SHEET, key, rope_cut  # noqa: E402

W, HH = 832, 480
FIG_H = 0.72  # share of the clip's height from the rope to his toes
ROPE_Y = 0.17  # the rope's height in the clip
LONG = 832


def main(out):
    sh = np.asarray(Image.open(SHEET).convert('RGB'))
    ch, cw = sh.shape[0] // 2, sh.shape[1] // 4
    cell = sh[:ch, :cw]
    clean, yc, paw = rope_cut(cell)
    grey = tuple(int(v) for v in np.median(cell[-4:].reshape(-1, 3), axis=0))
    # a straight strip of the sheet's rope (columns clear of him), each column moved so the rope's middle is level
    cols = [x for x in range(cw) if not paw[x] and (x < 70 or x > 200)]
    strip = np.stack([cell[int(round(yc[x])) - 6:int(round(yc[x])) + 7, x] for x in cols], axis=1)
    al = key(clean)
    ys, xs = np.nonzero(al > 128)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    gy = float(np.mean(yc[paw])) - y0
    fig = Image.fromarray(np.dstack([clean, al])[y0:y1, x0:x1].astype(np.uint8), 'RGBA')
    s = FIG_H * HH / fig.height
    fig = fig.resize((round(fig.width * s), round(fig.height * s)), Image.LANCZOS)
    c = Image.new('RGBA', (W, HH), grey + (255,))
    st = Image.fromarray(strip.astype(np.uint8), 'RGB')
    st = st.resize((round(st.width * s), round(st.height * s)), Image.LANCZOS)
    ry = round(ROPE_Y * HH)
    for x in range(0, W, st.width):
        c.paste(st, (x, ry - st.height // 2))
    c.alpha_composite(fig, ((W - fig.width) // 2, round(ry - gy * s)))
    k = LONG / W
    im = c.convert('RGB').resize((LONG, round(HH * k)), Image.LANCZOS)
    im.save(out, 'WEBP', quality=88, method=6)
    print(out, Path(out).stat().st_size, im.size)


if __name__ == '__main__':
    main(sys.argv[1])
