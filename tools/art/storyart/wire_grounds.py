"""The painted ground strips into the game: key the grey above each world's pick, find its walk line (where the ground is solid across most
of the strip), save src/assets/story/ground/w<N>.webp (1600 wide) and write the lines into src/game/storyGround.ts.

    python3 -I tools/art/storyart/wire_grounds.py <dir> '{"1": "gr-w1-s40", ...}'
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

REPO = Path(__file__).resolve().parents[3]


def main():
    src = Path(sys.argv[1])
    picks = json.loads(sys.argv[2])
    out = REPO / 'src/assets/story/ground'
    out.mkdir(parents=True, exist_ok=True)
    lines = {}
    for w, stem in picks.items():
        p = next(q for q in src.iterdir() if q.stem == stem)
        g = np.asarray(Image.open(p).convert('RGB'), np.float32)
        bg = np.median(g[:12].reshape(-1, 3), 0)
        d = np.sqrt(((g - bg) ** 2).sum(-1))
        d = np.maximum(d, (g.max(-1) - g.min(-1)) * 2.2)
        a = np.clip((d - 16) / 30, 0, 1)
        # (only the grey above the ground goes: below the first solid row of each column everything is ground)
        solid = a > 0.9
        first = np.argmax(solid, 0)
        rows = np.arange(a.shape[0])[:, None]
        a = np.where(rows > first[None, :] + 6, 1.0, a)
        a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
        aa = np.maximum(a, 0.2)[..., None]
        rgb = np.clip(bg + (g - bg) / aa, 0, 255)
        rgb = np.where(a[..., None] > 0.98, g, rgb)
        im = Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), 'RGBA')
        # the walk line: the row by which 70% of the columns are solid, a little below it so the feet sink into the tufts
        line = float(np.percentile(first, 70) + 10) / a.shape[0]
        im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        im.save(out / f'w{w}.webp', 'WEBP', quality=88, method=6)
        lines[int(w)] = round(line, 3)
        print(w, stem, 'line', lines[int(w)], (out / f'w{w}.webp').stat().st_size)
    ts = (REPO / 'src/game/storyGround.ts').read_text()
    cur = {int(k): float(v) for k, v in re.findall(r'(\d+): ([\d.]+)', ts[ts.index('GROUND_LINE'):ts.index('};', ts.index('GROUND_LINE'))])}
    cur.update(lines)
    body = ', '.join(f'{k}: {v}' for k, v in sorted(cur.items()))
    ts = re.sub(r'export const GROUND_LINE: Record<number, number> = \{[^}]*\};', f'export const GROUND_LINE: Record<number, number> = {{ {body} }};', ts)
    (REPO / 'src/game/storyGround.ts').write_text(ts)


if __name__ == '__main__':
    main()
