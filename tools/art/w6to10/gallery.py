"""Build the Worlds 5-10 pick-from gallery (2026-10-28): tools/art/gallery-w5-10/index.html plus its pictures.

    python3 -I tools/art/w6to10/gallery.py <unpacked dir> [<unpacked dir> ...]

Each unpacked dir holds what tools/art/w5/unpack_carrier.py took out of the bucket's w6to10/check/carrier-*.png (clip previews:
<clip>.webp animated, <clip>-strip.jpg) and w6to10/stills/carrier-*.png (<still>.webp), plus the stats-*.json files. The page groups
the clips by character and move (both seeds side by side, with the check numbers), then the stills by kind. Matt's notes and
verdicts (tools/art/w6to10/verdicts.json: {clip or still name: "good" | "broken: why" | ...}) are shown on each card.
Pictures are copied into tools/art/gallery-w5-10/img/ (all small WebP/JPEG, each well under 4 MiB).
"""
import html, json, shutil, sys
from pathlib import Path

from PIL import Image

H = Path(__file__).resolve().parent
OUT = H.parent / 'gallery-w5-10'
IMG = OUT / 'img'

WHO = {
    'ironclaw': ('General Iron-Claw', 'World 10 guardian, the war look'),
    'golem': ('Stone Idol Golem', 'World 7 guardian'),
    'drake': ('Magma Drake', 'World 9 guardian'),
    'reaver': ('Marsh Reaver', 'World 6 guardian'),
    'thornbark': ('Thornbark', 'the secret guardian of 7-7'),
    'monarch': ('Night-Wing Monarch', 'World 8 guardian'),
    'dangler': ('The Dangler', 'World 5 creature'),
    'seamstress': ('The Seamstress', 'World 5 creature'),
    'mantis': ('Orchid Mantis', 'World 5 creature'),
    'dozer': ('Dozer moth', 'World 5 creature'),
    'flicker': ('Flicker', 'the firefly guide, from his own Gemini cells: the moves he needs from World 6 to the end'),
    'title': ('Pokey and Meeca on the title', 'done first for the title (already handed over); kept here for the record'),
    'plate': ('Moving lair paintings', 'the calm lair paintings below, brought gently to life (no characters)'),
}
STILLS = [
    ('lair', 'Painted lairs', 'One painting per guardian, calm and in the last third of the fight (the Prowler\'s lair is the model).'),
    ('far', 'Times of day', 'New far strips for stages 1-3 and 7-9 of Worlds 6-10; the middle and near strips stay the world\'s own.'),
    ('free', 'Collars off', 'The guardians and the General, free, for the ending (each from its own character model).'),
    ('collar', 'The collar breaking', 'Closed, cracked, splitting, falling, open.'),
    ('prop', 'Props, Worlds 7-10', 'Single props on grey, to cut out.'),
    ('prop2', 'Props, side-on retries', 'The props that came out at an angle the first time, asked for flat side-on.'),
    ('sign', 'Water warning sign', 'A little post sign for the water edge, no words: World 5 garden look and a jungle one for Worlds 6-10.'),
]


def main(dirs):
    IMG.mkdir(parents=True, exist_ok=True)
    stats, files = {}, {}
    for d in map(Path, dirs):
        for p in d.glob('stats-*.json'):
            stats.update(json.loads(p.read_text()))
        for p in d.iterdir():
            if p.suffix in ('.webp', '.jpg') and not p.name.startswith('sum-'):
                files[p.name] = p
    verdicts = json.loads((H / 'verdicts.json').read_text()) if (H / 'verdicts.json').exists() else {}
    clips = sorted(n[:-5] for n in files if n.startswith('w6t-') and n.endswith('.webp') and not n.endswith('-strip.webp'))
    by = {}
    for c in clips:
        parts = c.split('-')
        who, mv = parts[1], '-'.join(parts[2:-1])
        by.setdefault(who, {}).setdefault(mv, []).append(c)
    for n, p in files.items():
        if n.startswith('w6t-') and n.endswith('.webp'):  # the strips are only for the check sheets
            shutil.copy(p, IMG / n)
    still_names = sorted(n[:-5] for n in files if n.endswith('.webp') and not n.startswith('w6t-'))
    for n in still_names:
        im = Image.open(files[n + '.webp']).convert('RGB')
        s = min(1.0, 900 / im.width)
        im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS).save(IMG / f'{n}.webp', 'WEBP', quality=80, method=6)

    def card(name, src, cap):
        v = verdicts.get(name, '')
        cls = 'bad' if v.startswith('broken') else 'good' if v.startswith('good') else ''
        return (f'<figure class="card {cls}"><img loading="lazy" src="img/{html.escape(src)}" alt="{html.escape(name)}">'
                f'<figcaption><b>{html.escape(cap)}</b>{"<span class=v>" + html.escape(v) + "</span>" if v else ""}</figcaption></figure>')

    sec = []
    order = [w for w in WHO if w in by] + [w for w in by if w not in WHO]
    nav = ''.join(f'<a href="#{w}">{html.escape(WHO.get(w, (w, ""))[0])}</a>' for w in order)
    nav += ''.join(f'<a href="#{k}">{html.escape(t)}</a>' for k, t, _ in STILLS if any(n.startswith(k + '-') for n in still_names))
    for w in order:
        title, sub = WHO.get(w, (w, ''))
        rows = []
        for mv, cs in by[w].items():
            cards = ''.join(card(c, f'{c}.webp', f"{mv} · seed {c.rsplit('-s', 1)[1]}") for c in cs)
            rows.append(f'<div class="move"><h3>{html.escape(mv)}</h3><div class="grid">{cards}</div></div>')
        ph = (f'<details class="phone"><summary>Phone size check (portrait and landscape, game size then 0.5x)</summary>'
              f'<img loading="lazy" src="img/phone-{w}.webp" alt="{html.escape(title)} at phone size"></details>') if (IMG / f'phone-{w}.webp').exists() else ''
        sec.append(f'<section id="{w}"><h2>{html.escape(title)}</h2><p class="sub">{html.escape(sub)} · '
                   f'{sum(len(c) for c in by[w].values())} clips, {len(by[w])} moves</p>{ph}{"".join(rows)}</section>')
    for k, t, d in STILLS:
        ns = [n for n in still_names if n.startswith(k + '-')]
        if not ns:
            continue
        cards = ''.join(card(n, f'{n}.webp', n[len(k) + 1:]) for n in ns)
        sec.append(f'<section id="{k}"><h2>{html.escape(t)}</h2><p class="sub">{html.escape(d)}</p><div class="grid wide">{cards}</div></section>')
    # the props made on 29 October (Matt's Gemini sheets cut into sprites, and the img2img sets): each world sheet's cut sprites on a
    # checker, from PROPS (a folder of check-<sheet>.jpg and props.json: {sheet: [title, words]})
    import os
    pd = Path(os.environ['PROPS']) if os.environ.get('PROPS') else None
    if pd and (pd / 'props.json').exists():
        meta = json.loads((pd / 'props.json').read_text())
        cards = []
        for k, (t, d) in meta.items():
            src = pd / f'check-{k}.jpg'
            if not src.exists():
                continue
            im = Image.open(src).convert('RGB')
            sc = min(1.0, 1400 / im.width)
            im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS).save(IMG / f'props-{k}.webp', 'WEBP', quality=82, method=6)
            cards.append(f'<figure class="card"><img loading="lazy" src="img/props-{html.escape(k)}.webp" alt="{html.escape(t)}">'
                         f'<figcaption><b>{html.escape(t)}</b><span class=v>{html.escape(d)}</span></figcaption></figure>')
        if cards:
            nav += '<a href="#props29">Props, 29 October</a>'
            sec.append('<section id="props29"><h2>Props, 29 October</h2><p class="sub">Cut into sprites on a checker, ready for the stages: '
                       'your Gemini sheets, and sets painted with the style model over flat side-on starts built from each world\'s own kit '
                       '(so they stay side-on). Paired states (lever, plate, door) share one size and anchor.</p>'
                       f'<div class="grid wide one">{"".join(cards)}</div></section>')
    (OUT / 'index.html').write_text(PAGE.replace('{nav}', nav).replace('{body}', ''.join(sec)).replace('{n}', str(len(clips))).replace('{s}', str(len(still_names))))
    tot = sum(p.stat().st_size for p in IMG.iterdir())
    big = max((p.stat().st_size, p.name) for p in IMG.iterdir())
    print('clips', len(clips), 'stills', len(still_names), 'img total MB', round(tot / 1e6, 1), 'largest', big)


PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Worlds 5-10 Art</title>
<style>
:root { --bg:#f3efe4; --panel:#fffdf7; --ink:#1e2a20; --muted:#5d6a5e; --line:#d9d1bc; --good:#2f7d4f; --bad:#b4452f; --chip:#ebe4d1; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#101812; --panel:#18231b; --ink:#e7eee4; --muted:#9db09f; --line:#2b3b2e; --good:#6fd39a; --bad:#f08a72; --chip:#203024; color-scheme: dark; } }
:root[data-theme="dark"] { --bg:#101812; --panel:#18231b; --ink:#e7eee4; --muted:#9db09f; --line:#2b3b2e; --good:#6fd39a; --bad:#f08a72; --chip:#203024; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; padding:24px 16px 64px; }
main { max-width:1100px; margin:0 auto; }
h1 { font-size:clamp(28px,6vw,40px); margin:0 0 6px; }
h2 { font-size:24px; margin:0; }
h3 { font-size:15px; margin:10px 0 6px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; }
.lede { color:var(--muted); max-width:68ch; margin:0 0 14px; }
nav { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 20px; position:sticky; top:0; background:var(--bg); padding:8px 0; z-index:2; }
nav a { font-size:13px; padding:5px 10px; border-radius:99px; background:var(--chip); color:var(--ink); text-decoration:none; }
section { background:var(--panel); border:1px solid var(--line); border-radius:14px; padding:14px; margin:0 0 18px; }
.sub { color:var(--muted); margin:2px 0 6px; font-size:14px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap:10px; }
.grid.wide { grid-template-columns:repeat(auto-fill, minmax(min(100%, 320px), 1fr)); }
.grid.one { grid-template-columns:1fr; }
@media (max-width: 700px) { nav { position: static; } }
.card { margin:0; border:1px solid var(--line); border-radius:10px; overflow:hidden; background:#7f7f7f; }
.card img { display:block; width:100%; height:auto; }
.card figcaption { background:var(--panel); padding:6px 8px; font-size:13px; display:flex; flex-direction:column; gap:2px; }
.card.good { outline:2px solid var(--good); }
.card.bad { outline:2px solid var(--bad); opacity:.8; }
.v { color:var(--muted); }
.phone summary { cursor:pointer; color:var(--muted); font-size:14px; margin:4px 0; }
.phone img { width:100%; height:auto; border-radius:8px; }
.card.bad .v { color:var(--bad); }
.card.good .v { color:var(--good); }
</style></head><body><main>
<h1>Worlds 5-10 art to pick from</h1>
<p class="lede">Made on Hugging Face on 28 October with the game's motion and style models: {n} clips and {s} stills. Nothing here is in the
game yet. Every guardian clip starts from one of its own painted poses; attacks wind up, hold (the warning), then strike. Two takes of each
move; green outline = my pick, red = broken (kept so you can see why). Tap a section to jump.</p>
<p class="lede">Known gaps: the Marsh Reaver will not walk (he stands and sways; skipped for now). The style model will not draw props
flat side-on, so those come from your Gemini kit sheets. The title pair (Pokey and Meeca) was done first and handed over separately.</p>
<nav>{nav}</nav>
{body}
</main></body></html>
"""

if __name__ == '__main__':
    main(sys.argv[1:])
