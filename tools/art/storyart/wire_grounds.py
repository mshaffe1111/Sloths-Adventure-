"""The painted ground strips into the game: key the grey above each world's pick, find its walk line (where the ground is solid across most
of the strip), save src/assets/story/ground/w<N>.webp (1600 wide) and write the lines into src/game/storyGround.ts.

    python3 -I tools/art/storyart/wire_grounds.py <dir> '{"1": "gr-w1-s40", ...}'
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

REPO = Path(__file__).resolve().parents[3]


def band_alpha(world, W=2048, H=512, line=0.3):
    """the alpha of the near backdrop's floor band exactly where starts.py band() put it"""
    im = Image.open(REPO / f'src/assets/backdrops/w{world}-near.webp').convert('RGBA')
    r = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    bh = round(H * (1 - line)) + 40
    b = r.crop((0, r.height - bh, W, r.height)).split()[3]
    out = Image.new('L', (W, H), 0)
    out.paste(b, (0, H - bh))
    out = out.filter(ImageFilter.MaxFilter(5))
    a = np.asarray(out, np.float32) / 255
    # (where the band was cut from the backdrop it would end in a ruler-straight edge: its top 90 px melt away instead)
    top = H - bh
    ramp = np.clip((np.arange(H) - top) / 90.0, 0, 1)[:, None]
    return a * ramp


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
        # (the near backdrop the strip was painted from is cut out round its plants and rocks: that outline, where the start put it, is the
        # strip's outline too, so the far backdrop shows between the plants instead of the colour the holes were filled with)
        a0 = band_alpha(int(w), g.shape[1], g.shape[0])
        a = np.minimum(a, a0)
        a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
        aa = np.maximum(a, 0.2)[..., None]
        rgb = np.clip(bg + (g - bg) / aa, 0, 255)
        rgb = np.where(a[..., None] > 0.98, g, rgb)
        im = Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), 'RGBA')
        # the walk line: the row by which 70% of the columns are solid, a little below it so the feet sink into the tufts
        first = np.argmax(a > 0.9, 0)
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
