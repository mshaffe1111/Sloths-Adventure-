"""AS-2: Matt's check page (reference/art/art82-check/index.html) and the stills beside it.
Usage: python3 tools/assets/art82_page.py MEASURE_JSON DARK_JSON OUTDIR_FILES SUMMARY_JSON"""
import html, io, json, os, subprocess, sys
from PIL import Image

OUT = 'reference/art/art82-check'
BASE = 'ffee5acc'  # origin/t-assets-compress, the shipped art
PHONE_W = 720  # a 360 pt wide phone at 2x

def stills(r, qfile, key):
    # the original as shipped: from the commit before the re-encode (src/ may already hold the q82 file)
    o = Image.open(io.BytesIO(subprocess.run(['git', 'show', f'{BASE}:' + r['src']], capture_output=True, check=True).stdout)).convert('RGBA'); q = Image.open(qfile).convert('RGBA')
    bg = Image.new('RGBA', o.size, (44, 59, 44, 255))  # the page's dark-green backing, so alpha edges show
    o, q = Image.alpha_composite(bg, o).convert('RGB'), Image.alpha_composite(bg, q).convert('RGB')
    s = min(1.0, PHONE_W / o.width, 1600 / o.height)
    size = (max(1, round(o.width * s)), max(1, round(o.height * s)))
    x, y = r['tile_xy']; c = 96
    x0 = max(0, min(o.width - c, x + 16 - c // 2)); y0 = max(0, min(o.height - c, y + 16 - c // 2))
    for im, v in ((o, 'original'), (q, 'q82')):
        im.resize(size, Image.LANCZOS).save(f'{OUT}/{key}.{v}.phone.png', optimize=True)
        im.crop((x0, y0, x0 + c, y0 + c)).resize((c * 3, c * 3), Image.NEAREST).save(f'{OUT}/{key}.{v}.zoom.png', optimize=True)
    return size, (x0, y0)

def main(mjson, djson, files, sjson):
    os.makedirs(OUT, exist_ok=True)
    m = json.load(open(mjson)); d = json.load(open(djson)); s = json.load(open(sjson))
    kept = [r for r in m if not r.get('flag')]
    worst = sorted(kept, key=lambda r: r['ssim'])[:8]
    cases = []
    for i, r in enumerate(worst):
        key = f'w{i + 1}'
        size, (x0, y0) = stills(r, os.path.join(files, r['src'].replace('/', '__')), key)
        cases.append((key, r, size, x0, y0))
    E = html.escape
    def f(v, n=3):
        return '-' if v is None else f'{v:.{n}f}'
    rows = ''.join(f'<tr><td>{E(x["src"].replace("src/assets/", ""))}</td><td>{x["near_black"]:.2f}</td><td>{x["smooth_dark"]:.2f}</td>'
                   f'<td>{x["bytes"] / 1024:.0f} KB</td></tr>' for x in s['dark'])
    frows = ''.join(f'<tr><td>{E(r["src"].replace("src/assets/", ""))}</td><td>{r["ssim"]:.4f}</td><td>{r["tile_ssim"]:.3f}</td>'
                    f'<td>{r["psnr"]:.1f}</td><td>{f(r.get("dark_tile_psnr"), 1)}</td><td>{E(r["flag"])}</td></tr>' for r in s['flagged']) \
        or '<tr><td colspan="6">None.</td></tr>'
    body = []
    for key, r, size, x0, y0 in cases:
        name = r['src'].replace('src/assets/', '')
        body.append(f'''<section class="case" id="{key}"><h2>{E(name)}</h2>
<p class="stat">{r["w"]}x{r["h"]} · {r["orig_bytes"] / 1024:.0f} KB → {r["q82_bytes"] / 1024:.0f} KB · SSIM {r["ssim"]:.4f} · worst tile SSIM {r["tile_ssim"]:.3f} · PSNR {r["psnr"]:.1f} dB · dark tile PSNR {f(r.get("dark_tile_psnr"), 1)} dB</p>
<div class="seg" role="group" aria-label="Version"><button data-k="{key}" data-v="original" aria-pressed="true">Original</button><button data-k="{key}" data-v="q82" aria-pressed="false">q82</button></div>
<div class="views"><figure><img data-k="{key}" data-kind="phone" src="{key}.original.phone.png" width="{size[0]}" height="{size[1]}" style="max-width:{size[0] // 2}px" alt="{E(name)} at phone size" loading="lazy"><figcaption>Phone size (whole picture, at most 360 pt wide, never enlarged)</figcaption></figure>
<figure class="px"><img data-k="{key}" data-kind="zoom" src="{key}.original.zoom.png" width="288" height="288" alt="{E(name)} worst region at 3x" loading="lazy"><figcaption>Its worst 96 px region (x {x0}, y {y0}) at 3x</figcaption></figure></div></section>''')
    page = open('tools/assets/art82_page.html').read()
    page = page.replace('%CASES%', '\n'.join(body)).replace('%DARK%', rows).replace('%FLAGGED%', frows)
    for k, v in s['text'].items():
        page = page.replace('%' + k + '%', E(str(v)))
    open(f'{OUT}/index.html', 'w').write(page)

if __name__ == '__main__':
    main(*sys.argv[1:5])
