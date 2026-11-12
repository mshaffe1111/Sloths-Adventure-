#!/usr/bin/env python3
"""Writes the comparison page reference/art/compress-trials/index.html from compare.py's cases.json, the whole-game projection
(projection.json) and the music trial (music.json). Stills and audio clips sit beside it, referenced by relative path."""
import html, json, sys

cases = json.load(open(sys.argv[1]))
proj = json.load(open(sys.argv[2]))
music = json.load(open(sys.argv[3]))
out = sys.argv[4]
E = html.escape
kb = lambda b: f'{b / 1024:,.0f} KB' if b < 2**20 else f'{b / 2**20:.2f} MB'

css = """
/* layout: one column of case studies; each case has a setting switcher that swaps every picture in place (flip to compare) */
:root{--bg:#f3f5f1;--panel:#ffffff;--fg:#1d241d;--muted:#5d6a5c;--line:#d5dbd2;--accent:#2f6b3a;--warn:#9a5b00;--ok:#2f6b3a;
--display:'Fraunces',Georgia,serif;--body:'Inter',system-ui,sans-serif;--mono:'JetBrains Mono',ui-monospace,monospace;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141914;--panel:#1c231c;--fg:#e6ece4;--muted:#9aa898;--line:#2f3a2f;--accent:#8fd19b;--warn:#e7b25a;--ok:#8fd19b;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141914;--panel:#1c231c;--fg:#e6ece4;--muted:#9aa898;--line:#2f3a2f;--accent:#8fd19b;--warn:#e7b25a;--ok:#8fd19b;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:15px/1.55 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 48px}
main{max-width:980px;margin:0 auto;display:flex;flex-direction:column;gap:28px}
h1,h2{font-family:var(--display);font-weight:600;text-wrap:balance;margin:0}
h1{font-size:2rem;line-height:1.15}h2{font-size:1.35rem}
p{margin:0;max-width:68ch}.muted{color:var(--muted)}
.lede{display:flex;flex-direction:column;gap:10px}
.case,.panel{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}
.seg{display:flex;flex-wrap:wrap;gap:6px}
.seg button{font:600 13px var(--body);border:1px solid var(--line);background:transparent;color:var(--fg);border-radius:999px;padding:8px 14px;min-height:40px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:var(--panel)}
.seg button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
figure{margin:0;display:flex;flex-direction:column;gap:6px;min-width:0}
figure img{display:block;width:100%;height:auto;border-radius:6px;background:#2c3b2c;image-rendering:auto}
figure.px img{image-rendering:pixelated}
figcaption{font-size:12px;color:var(--muted)}
.stat{font:13px var(--mono);font-variant-numeric:tabular-nums}
.tw{overflow-x:auto}
table{border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:13px;width:100%}
th,td{text-align:right;padding:6px 8px;border-bottom:1px solid var(--line);white-space:nowrap}
th:first-child,td:first-child{text-align:left}
th{font-weight:600;color:var(--muted);font-size:12px;letter-spacing:.03em;text-transform:uppercase}
.pick{color:var(--ok);font-weight:700}
audio{width:100%}
.clips{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
"""

h = ['<title>Sloths Compression Trials</title>', '<meta name="claude:viewport-fit-sides" content="cover">',
     '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap">',
     f'<style>{css}</style>', '<main>']
h.append(f"""<section class="lede"><h1>Shrinking Sloths without a visible loss</h1>
<p>Task AS-1, measured on the live 0.9.6 build (585ef376). {E(proj['headline'])}</p>
<p class="muted">Each case: tap a setting to swap every picture in place. Flipping between Original and a setting is the fastest way to see a change. <b>1:1</b> is the stored pixels (a resized file is scaled back up: the worst case). <b>Phone</b> is the largest size the game ever draws it on a sharp (3x) phone, measured by playing 30 stages and the story screens upright and sideways. <b>Error x8</b> shows where the codec changed pixels.</p></section>""")

# projection table
rows = ''.join(f"<tr><td>{E(r['name'])}</td><td>{r['images']:.1f}</td><td>{r['music']:.1f}</td><td>{r['saved']:.1f}</td><td>{r['web']:.1f}</td><td>{r['app']:.1f}</td></tr>" for r in proj['rows'])
h.append(f"""<section class="panel"><h2>The whole game at each setting</h2><div class="tw"><table><thead><tr><th>Setting</th><th>Images MB</th><th>Music MB</th><th>Saved MB</th><th>Web MB</th><th>App MB</th></tr></thead><tbody>{rows}</tbody></table></div>
<p class="muted">{E(proj['note'])}</p></section>""")

for c in cases:
    vs = c['versions']
    btn = ''.join(f'<button type="button" id="b-{c["key"]}-{v["name"]}" data-v="{v["name"]}" aria-pressed="{str(i == 0).lower()}">{E(v["name"].replace("original", "Original"))}</button>' for i, v in enumerate(vs))
    stats = {v['name']: f"{kb(v['bytes'])} · {v['w']}x{v['h']} · {E(v['note'])} · PSNR {v['psnr'] if v['psnr'] < 99 else '∞'} dB · worst 8x8 block {v['worst_block']}" for v in vs}
    v0 = vs[0]['name']
    ds = c['drawn_scale']
    seen = f"drawn at most {ds:.2f}x its stored size on a 3x phone" if ds else 'not seen by the probe (shown at 1/3 for the phone view)'
    h.append(f"""<section class="case" data-key="{c['key']}" data-stats='{E(json.dumps(stats))}'>
<h2>{E(c['title'])}</h2>
<p class="muted stat">{E(c['src'])} · {c['w']}x{c['h']} · shipped at about q{c['q_est']} · {seen}{' · resize to %d%%' % round(c['factor'] * 100) if c['factor'] != 1 else ''}</p>
<div class="seg" role="group" aria-label="Setting">{btn}</div>
<p class="stat sel">{stats[v0]}</p>
<div class="views">
<figure class="px"><img data-kind="1x" src="{c['key']}.{v0}.1x.png" alt="1:1 crop" width="300" height="300"><figcaption>1:1, 300 px of the stored picture</figcaption></figure>
<figure><img data-kind="phone" src="{c['key']}.{v0}.phone.png" alt="phone size" loading="lazy"><figcaption>Phone size ({c['phone_px'][0]}x{c['phone_px'][1]} device px)</figcaption></figure>
<figure class="px"><img data-kind="diff" src="{c['key']}.{v0}.diff.png" alt="error x8" width="300" height="300"><figcaption>Error x8 against the original (black is no change)</figcaption></figure>
</div></section>""")

# music
mrows, clips = '', ''
for m in music:
    ks = sorted(m['enc'], key=lambda k: -int(k))
    cur = ks[0]
    cells = ''.join(f"<td>{kb(m['enc'][k]['bytes'])}<br><span class='muted'>{m['enc'][k]['nsr']['0-4k']} / {m['enc'][k]['nsr']['4-8k']} dB</span></td>" for k in ks)
    mrows += f"<tr><td>{E(m['piece'])}.{m['stem']}</td>{cells}</tr>"
heads = ''.join(f'<th>{k} kb/s</th>' for k in sorted(music[0]['enc'], key=lambda k: -int(k)))
for cl in proj.get('clips', []):
    clips += f"<figure><audio controls preload=\"none\" src=\"{cl['file']}\"></audio><figcaption>{E(cl['label'])}</figcaption></figure>"
h.append(f"""<section class="panel"><h2>Music (the .webm files are music, not video)</h2>
<p>{E(proj['music_note'])}</p>
<div class="tw"><table><thead><tr><th>Piece</th>{heads}</tr></thead><tbody>{mrows}</tbody></table></div>
<p class="muted">Under each size: the noise against the source recording below 4 kHz / 4-8 kHz (STFT error, dB, lower is cleaner). A measure, not a listen: the clips below are for ears, on headphones.</p>
<div class="clips">{clips}</div></section>""")

h.append("""</main><script>
document.querySelectorAll('.case').forEach(function (c) {
  var key = c.dataset.key, stats = JSON.parse(c.dataset.stats), sel = c.querySelector('.sel');
  c.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.v;
      c.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      c.querySelectorAll('img[data-kind]').forEach(function (im) { im.src = key + '.' + v + '.' + im.dataset.kind + '.png'; });
      sel.textContent = stats[v];
    });
  });
});
</script>""")
open(out, 'w').write('\n'.join(h))
print('wrote', out)
