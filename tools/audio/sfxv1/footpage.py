"""The footstep listening page for Matt (polish-sfx, 2026-10-30): each candidate set (footcand.py) plays a walk then a run on leaves,
then the same on wood, beside today's. One page, the clips inlined.

    python3 tools/audio/sfxv1/footpage.py <footcand out dir> <page.html>
"""
import base64, html, json, os, sys

D, OUT = sys.argv[1], sys.argv[2]
meta = json.load(open(os.path.join(D, 'sets.json')))


def clip(name):
    return 'data:audio/mpeg;base64,' + base64.b64encode(open(os.path.join(D, f'{name}-walkrun.mp3'), 'rb').read()).decode()


SHOW = (sys.argv[3] if len(sys.argv) > 3 else ','.join(meta['sets'])).split(',')
lane = '<ol class="lane"><li>Walk, leaves</li><li>Run, leaves</li><li>Walk, wood</li><li>Run, wood</li></ol>'


def button(name, label, parts):
    return (f'<button class="play" aria-pressed="false" data-parts="{",".join(str(p) for p in parts)}" data-src="{clip(name)}">'
            f'<span class="ico"></span><span class="lbl">{label}</span></button>')


cards = []
for key in SHOW:
    s = meta['sets'][key]
    parts = s.get('parts', {})
    btns = [button(key, f'Play {key}' if '80' not in parts else f'{key}, today\'s stride', parts.get('52', [0, 3.3, 6.3, 9.6]))]
    if '80' in parts:
        btns.append(button(key + '80', f'{key}, longer stride', parts['80']))
    cards.append(f'''
  <article class="set" data-key="{key}">
    <header><span class="letter">{key}</span><h2>{html.escape(s["name"])}</h2></header>
    <p>{html.escape(s["words"])}</p>
    <div class="btns">{"".join(btns)}</div>
    {lane}
  </article>''')

page = f'''<title>Pokey's Footsteps</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
/* layout: one column of cards, like specimen jars on a shelf; today's sound sits apart at the top as the thing to beat */
:root {{
  --bg: #eef1e8; --card: #f8faf3; --ink: #1f2a1c; --muted: #5b6655; --moss: #4f6b3a; --bark: #7a5536; --line: #d5dccb;
  --display: "Fraunces", Georgia, serif; --body: "Atkinson Hyperlegible", system-ui, sans-serif;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #141a12; --card: #1c2419; --ink: #e5ead9; --muted: #a3ad97; --moss: #9cc27a; --bark: #d39d6e; --line: #2f3a2a; color-scheme: dark }} }}
:root[data-theme="dark"] {{
  --bg: #141a12; --card: #1c2419; --ink: #e5ead9; --muted: #a3ad97; --moss: #9cc27a; --bark: #d39d6e; --line: #2f3a2a; color-scheme: dark }}
body {{ background: var(--bg); color: var(--ink); font: 16px/1.5 var(--body);
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); padding-block: 28px 48px }}
main {{ max-width: 640px; margin: 0 auto; display: grid; gap: 18px }}
h1 {{ font: 600 2rem/1.15 var(--display); margin: 0; text-wrap: balance }}
.lede {{ margin: 0; color: var(--muted); max-width: 60ch }}
.set {{ background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; display: grid; gap: 10px }}
.set.today {{ border-style: dashed; background: transparent }}
.set header {{ display: flex; align-items: center; gap: 12px }}
.letter {{ font: 600 1.4rem/1 var(--display); color: var(--moss); width: 1.6em; height: 1.6em; display: grid; place-items: center;
  border: 2px solid var(--moss); border-radius: 50% }}
.today .letter {{ color: var(--bark); border-color: var(--bark); font-size: 0.8rem; font-family: var(--body); font-weight: 700 }}
h2 {{ font: 600 1.25rem/1.2 var(--display); margin: 0 }}
.set p {{ margin: 0; color: var(--muted) }}
.btns {{ display: flex; flex-wrap: wrap; gap: 8px }}
.play {{ display: inline-flex; align-items: center; gap: 10px; font: 700 1rem var(--body); color: var(--bg);
  background: var(--moss); border: 0; border-radius: 999px; padding: 10px 18px 10px 14px; cursor: pointer; min-height: 44px }}
.today .play {{ background: var(--bark) }}
.play:focus-visible {{ outline: 3px solid var(--ink); outline-offset: 2px }}
.ico {{ width: 0; height: 0; border-left: 12px solid currentColor; border-top: 7px solid transparent; border-bottom: 7px solid transparent }}
.play[aria-pressed="true"] .ico {{ width: 12px; height: 12px; border: 0; background: currentColor; border-radius: 2px }}
.lane {{ list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; font-size: 0.78rem }}
.lane li {{ padding: 6px 4px; text-align: center; border-radius: 6px; background: var(--line); color: var(--muted); transition: background .15s }}
.lane li.on {{ background: var(--moss); color: var(--bg); font-weight: 700 }}
.today .lane li.on {{ background: var(--bark) }}
.ask {{ border-top: 1px solid var(--line); padding-top: 14px; color: var(--muted); font-size: 0.95rem }}
.ask strong {{ color: var(--ink) }}
@media (max-width: 420px) {{ .lane {{ grid-template-columns: repeat(2, 1fr) }} }}
@media (prefers-reduced-motion: reduce) {{ .lane li {{ transition: none }} }}
</style>
<main>
  <h1>Pokey's footsteps</h1>
  <p class="lede">Round two. You picked D but said it sounds like hammering, and that today's at least sounded like footsteps.
  E and F mix the two: E is mostly today's real footsteps with the crunch taken out, F is mostly D's paws. Both have a softer
  wood step, a padded thump instead of the bare-foot click. Each plays a walk then a run on leafy ground, then on wooden planks.
  "Longer stride" is the same sound with fewer steps (about 3.6 a second at a full run instead of 5.5). Listen on your phone's
  speaker, turned up.</p>
  <article class="set today" data-key="today">
    <header><span class="letter">NOW</span><h2>Today's steps</h2></header>
    <p>What the game plays now: people walking on dry leaves. The crunch is the chewing.</p>
    <div class="btns">{button("today", "Play today's", meta.get("today_parts", [0, 3.3, 6.3, 9.6]))}</div>
    <ol class="lane"><li>Walk, leaves</li><li>Run, leaves</li><li>Walk, wood</li><li>Run, wood</li></ol>
  </article>
  {"".join(cards)}
  <p class="ask"><strong>Pick one letter, and today's or the longer stride.</strong> Every new set is about 4 dB quieter than
  today's, keeps nothing above 4 kHz, and never plays the same step twice in a row.</p>
</main>
<script>
// each button's data-parts: when its clip's four parts start (s): walk on leaves, run on leaves, walk on wood, run on wood
const audio = new Audio();
let cur = null;
function stop() {{
  audio.pause();
  if (cur) {{ cur.setAttribute('aria-pressed', 'false'); cur.closest('.set').querySelectorAll('.lane li').forEach(li => li.classList.remove('on')); }}
  cur = null;
}}
document.querySelectorAll('.play').forEach(b => b.addEventListener('click', () => {{
  if (cur === b) {{ stop(); return; }}
  stop();
  cur = b; b.setAttribute('aria-pressed', 'true');
  audio.src = b.dataset.src; audio.currentTime = 0;
  audio.play().catch(stop);
}}));
audio.addEventListener('timeupdate', () => {{
  if (!cur) return;
  let k = 0; cur.dataset.parts.split(',').map(Number).forEach((t, i) => {{ if (audio.currentTime >= t) k = i; }});
  cur.closest('.set').querySelectorAll('.lane li').forEach((li, i) => li.classList.toggle('on', i === k));
}});
audio.addEventListener('ended', stop);
</script>
'''
open(OUT, 'w').write(page)
print(OUT, os.path.getsize(OUT), 'bytes')
