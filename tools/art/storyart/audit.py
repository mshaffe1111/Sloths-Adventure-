"""Read audit.mjs's log: name every character picture each story panel drew (from the atlas rect it was cut from), flag any drawn bigger
than 1.5 screen px per px of its painting (it shows soft on the phone), and make contact sheets of every panel, upright and sideways.

    python3 -I tools/art/storyart/audit.py <audit dir> <out dir>
-> <out>/audit-flags.txt, <out>/scenes-<group>.jpg (upright and sideways, numbered), <out>/audit-summary.json
"""
import json, re, sys
from collections import defaultdict
from pathlib import Path
from PIL import Image, ImageDraw

REPO = Path(__file__).resolve().parents[3]
LIMIT = 1.5


def table(path, var):
    s = (REPO / path).read_text()
    i = s.index('{', s.index('=', s.index(var)))
    js = re.sub(r"([{,]\s*)'?([A-Za-z_][A-Za-z0-9_.]*)'?\s*:", r'\1"\2":', s[i:])
    js = re.sub(r":\s*'([^']*)'", r': "\1"', js)
    return json.JSONDecoder().raw_decode(re.sub(r",(\s*[}\]])", r"\1", js))[0]


def rects():
    """page file -> [(name, x, y, w, h)]"""
    out = defaultdict(list)
    for k, f in table('src/game/storyCelData.ts', 'CELS').items():
        out[f'cels-{f["a"]}.webp'].append((k, f['x'], f['y'], f['w'], f['h']))
    for who in ('pokey', 'meeca', 'dot'):
        for k, f in table(f'src/game/storyHdData_{who}.ts', f'HD_{who.upper()}_FRAMES').items():
            out[f'{who}-{f["p"]}.webp'].append((f'{who}:{k}', f['x'], f['y'], f['w'], f['h']))
    return out


def name(R, key):
    src, sx, sy, sw, sh = key.split('|')
    sx, sy, sw, sh = int(sx), int(sy), int(sw), int(sh)
    page = re.sub(r'-[A-Za-z0-9_]{8}\.webp$', '.webp', src)
    for n, x, y, w, h in R.get(page, []):
        if x - 2 <= sx + sw / 2 <= x + w + 2 and y - 2 <= sy + sh / 2 <= y + h + 2:
            return n, page
    return f'{page}@{sx},{sy}', page


def main():
    a, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    R = rects()
    rows = [json.loads(l) for f in sorted(a.glob('log-*.jsonl')) for l in f.read_text().splitlines() if l.strip()]
    flags, worst = [], defaultdict(float)
    for r in rows:
        for k, v in r['mag'].items():
            if v['px'] < 24:
                continue
            n, page = name(R, k)
            worst[n] = max(worst[n], v['mag'])
            if v['mag'] > LIMIT:
                flags.append((v['mag'], r['f'], n, round(v['px'])))
    flags.sort(reverse=True)
    with open(out / 'audit-flags.txt', 'w') as f:
        f.write(f'pictures drawn above {LIMIT} screen px per painted px (phone, pixel ratio 3), worst first\n')
        for m, fn, n, px in flags:
            f.write(f'{m:5.2f}x  {fn:28s} {n}  ({px} px tall on screen)\n')
    (out / 'audit-summary.json').write_text(json.dumps({'panels': len(rows), 'flags': len(flags), 'worst': dict(sorted(worst.items(), key=lambda x: -x[1])[:60])}, indent=1))
    # contact sheets: per group, upright row then sideways
    by = defaultdict(list)
    for r in rows:
        by[r['tag']].append(r)
    for g, rs in by.items():
        ups = sorted({r['n'] for r in rs})
        cols = 8
        cw, ch, sw_, sh_ = 156, 338, 338, 156
        rws = (len(ups) + cols - 1) // cols
        S = Image.new('RGB', (cols * (cw + 6) + 10, 30 + rws * (ch + 22) + 30 + ((len(ups) + 3) // 4) * (sh_ + 22)), (18, 20, 22))
        d = ImageDraw.Draw(S)
        d.text((8, 8), f'{g}: every picture, upright (390x844) then sideways (844x390), phone pixel ratio 3', fill=(255, 230, 0))
        for i, n in enumerate(ups):
            p = a / f'{g}-{n:03d}-up.jpg'
            x, y = 8 + (i % cols) * (cw + 6), 30 + (i // cols) * (ch + 22)
            if p.exists():
                S.paste(Image.open(p).resize((cw, ch)), (x, y + 14))
            d.text((x, y), str(n), fill=(220, 220, 220))
        y0 = 30 + rws * (ch + 22) + 20
        for i, n in enumerate(ups):
            p = a / f'{g}-{n:03d}-side.jpg'
            x, y = 8 + (i % 4) * (sw_ + 12), y0 + (i // 4) * (sh_ + 22)
            if p.exists():
                S.paste(Image.open(p).resize((sw_, sh_)), (x, y + 14))
            d.text((x, y), str(n), fill=(220, 220, 220))
        S.save(out / f'scenes-{g}.jpg', quality=78)
    print(len(rows), 'shots', len(flags), 'flags')


if __name__ == '__main__':
    main()
