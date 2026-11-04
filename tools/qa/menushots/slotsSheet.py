"""The save-slots review page for Matt: the mock stills (reference/menus/save-slots/mock/, from slots.mjs) on one page, with the
questions and how nobody's game is lost. Run after slots.mjs:
    python3 tools/qa/menushots/slotsSheet.py <out.html> "<base stamp>" [before-up.png before-side.png]
The before pair is optional (small-phone title shots from main, to show the defect that was there before this job).
"""
import base64
import io
import sys

from PIL import Image

out, stamp = sys.argv[1], sys.argv[2]
before = sys.argv[3:5] if len(sys.argv) >= 5 else None
M = 'reference/menus/save-slots/mock/'


def uri(path, q=None):
    if q is None:
        return 'data:image/webp;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
    im = Image.open(path)
    b = io.BytesIO()
    im.save(b, 'WEBP', quality=q)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


def fig(name, cap, cls):
    return f'<figure class="{cls}"><img loading="lazy" alt="{cap}" src="{uri(M + name + ".webp")}"><figcaption>{cap}</figcaption></figure>'


def bfig(path, cap, cls):
    return f'<figure class="{cls}"><img loading="lazy" alt="{cap}" src="{uri(path, 75)}"><figcaption>{cap}</figcaption></figure>'


SECTIONS = [
    ('The title', 'Under Continue there are two planks: <b>New game</b> and <b>Who&#8217;s playing</b>, which shows the explorer&#8217;s face in their colour and their name. On a fresh phone there&#8217;s nothing to start over, so only Who&#8217;s playing shows.',
     [('old-title-up', 'Old single save: it simply becomes Explorer 1', 'up'), ('family-title-up', 'A family: Matt playing', 'up'), ('fresh-title-up', 'Fresh phone', 'up'), ('family-title-side', 'Sideways', 'side')]),
    ('Who&#8217;s playing?', 'One card per explorer: their face and colour, name, furthest world, stars, stages, and either Playing now or when they last played. <b>Play</b> switches to them. <b>Rename</b> works on every card, and <b>Erase</b> is on the others, never the one playing. A free spot offers <b>New explorer</b>.',
     [('family-who-up', 'Two explorers and a free spot', 'up'), ('full-who-up', 'All three taken, one finished', 'up'), ('family-who-side', 'Sideways', 'side'), ('full-who-side', 'Sideways, all three', 'side')]),
    ('New game', 'One question. The big, safe answer keeps this game and starts <b>a new explorer</b>. <b>Start over</b> is the small one, and it opens today&#8217;s New Game card with its backup offer. With all three spots taken, the big answer becomes <b>Who&#8217;s playing?</b>, so a spot can be freed.',
     [('family-newgame-up', 'A spot free', 'up'), ('full-newgame-up', 'All three taken', 'up'), ('family-newgame-side', 'Sideways', 'side')]),
    ('A new explorer, and erasing one', 'Type a name. It starts as &#8220;Explorer 3&#8221;, selected, so typing replaces it. The game then restarts as them on the title, and their first Start asks Easy or Normal, as for any new player. Erasing asks first, says what will be lost, and offers a backup file.',
     [('family-newname-up', 'New explorer&#8217;s name', 'up'), ('family-erase-up', 'Erase, with the backup offer', 'up'), ('family-newname-side', 'Sideways', 'side'), ('family-erase-side', 'Sideways', 'side')]),
    ('Small phones (360x640, 640x360)', 'The title cut off its own buttons on small phones <b>before</b> this job: How to Play was off the bottom, and World Map sat under the update buttons. That is fixed here. The leaves share the width, and the sign and logo are a size smaller on short screens.',
     None),
]

parts = []
for title, text, figs in SECTIONS:
    if figs is None:
        g = ''
        if before:
            g += bfig(before[0], 'Before (version 0.9.3, this morning): leaves cut off', 'up')
        g += fig('family-title-sup', 'After', 'up')
        if before:
            g += bfig(before[1], 'Before (0.9.3): World Map under the buttons, How to Play cut', 'side')
        g += fig('family-title-sside', 'After', 'side')
    else:
        g = ''.join(fig(n, c, k) for n, c, k in figs)
    parts.append(f'<section><h2>{title}</h2><p>{text}</p><div class="figs">{g}</div></section>')

html = f'''<title>New Game and Explorers</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cherry+Bomb+One&family=Outfit:wght@400;600;800&display=swap">
<style>
/* layout: one column of sections, each a line of phone stills; wood and parchment like the game */
:root {{ --bg:#f4ead3; --card:#fffaf0; --ink:#3b2412; --soft:#6e4c2c; --wood:#9b6331; --gold:#c26f1c; --line:#d8c39a;
  --fun:'Cherry Bomb One','Outfit',sans-serif; --ui:'Outfit',system-ui,sans-serif; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg:#16231a; --card:#21301f; --ink:#f3e6c8; --soft:#c9b48f; --wood:#d39a5c; --gold:#f0b04a; --line:#3d5238; color-scheme:dark }} }}
:root[data-theme="dark"] {{ --bg:#16231a; --card:#21301f; --ink:#f3e6c8; --soft:#c9b48f; --wood:#d39a5c; --gold:#f0b04a; --line:#3d5238; color-scheme:dark }}
body {{ background:var(--bg); color:var(--ink); font-family:var(--ui); padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)); padding-block:20px 48px; }}
main {{ max-width:1300px; margin:0 auto; display:flex; flex-direction:column; gap:30px; }}
h1 {{ font-family:var(--fun); font-weight:400; color:var(--gold); font-size:clamp(28px,6vw,42px); margin:0; text-wrap:balance; }}
h2 {{ font-family:var(--fun); font-weight:400; font-size:25px; margin:0; color:var(--wood); text-wrap:balance; }}
p, li {{ max-width:72ch; line-height:1.5; font-size:16px; }}
section > p {{ margin:0; }}
section {{ display:flex; flex-direction:column; gap:10px; }}
.stamp {{ font-size:13px; font-weight:800; color:var(--soft); }}
.box {{ background:var(--card); border:2px solid var(--line); border-radius:14px; padding:14px 18px; }}
.box h2 {{ margin-bottom:6px; }}
.box ul {{ margin:6px 0 0; padding-left:20px; }}
.figs {{ display:flex; flex-wrap:wrap; gap:14px; align-items:flex-start; }}
figure {{ margin:0; display:flex; flex-direction:column; gap:4px; min-width:0; }}
figure.up {{ width:min(100%,240px); }} figure.side {{ width:min(100%,520px); }}
figure img {{ width:100%; display:block; border-radius:12px; border:3px solid #2a1608; }}
figcaption {{ font-size:13px; font-weight:800; color:var(--soft); }}
table {{ border-collapse:collapse; font-size:15px; min-width:560px; }}
td, th {{ border-bottom:1px solid var(--line); padding:8px 10px; text-align:left; vertical-align:top; }}
th {{ font-size:13px; letter-spacing:.06em; text-transform:uppercase; color:var(--soft); }}
.scroll {{ overflow-x:auto; }}
</style>
<main>
<header><h1>New game and three explorers</h1>
<p>Mock-ups for Matt&#8217;s OK. They are taken from the real game with real save data, not drawings, on four saves: fresh, an old single save, a family of two, and all three spots taken with one finished. Each is shown upright and sideways, plus small phones.</p>
<p class="stamp">{stamp}</p></header>
<div class="box"><h2>Two questions for Matt</h2><ul>
<li><b>1. How each person likes to play</b> (controls, assists, jump help, screen shake, buzz, Dot&#8217;s asides): <b>(A) each explorer keeps their own</b> (recommended, so a left-handed child and a parent can share a phone), or (B) one setting for the whole phone?</li>
<li><b>2. After making a new explorer:</b> (A) back to the title as them, then Start (as shown), or (B) straight into their first story?</li></ul></div>
{''.join(parts)}
<section class="box"><h2>How no one&#8217;s game is lost</h2><ul>
<li><b>Today&#8217;s save needs no moving.</b> Its keys stay exactly where they are: they simply are Explorer 1. Opening Who&#8217;s playing? only reads; it writes nothing.</li>
<li><b>Switching</b> copies the player&#8217;s game out and reads it back before anything is cleared, and each step is recorded. A switch cut off at any step is finished on the next start, and every explorer comes back exactly as they were. That was tested by cutting the switch at each of its 48 steps. A full phone stops the switch before anything changes.</li>
<li><b>Going back to an older version</b> plays whoever was playing, and never touches the other explorers. A copy made by a newer version is shown, but never opened or erased.</li>
<li><b>In the real game:</b> an old save shows as Explorer 1; a new explorer starts fresh; going back brings all 34 of Explorer 1&#8217;s saved items back exactly; and sound stays the phone&#8217;s.</li>
<li><b>Found on the way:</b> today&#8217;s backup file misses the golden seeds, Dot&#8217;s silk and which guardians&#8217; intros have been seen, and New Game doesn&#8217;t clear the seeds or the silk. The fix is in the plan.</li></ul></section>
<section class="box"><h2>What belongs to an explorer, and what to the phone</h2><div class="scroll"><table>
<tr><th>Each explorer&#8217;s own</th><th>Shared by the phone</th></tr>
<tr><td>Stages, stars, finds, medals, stories seen, the secret, Pokey&#8217;s outfit, Easy or Normal</td><td>Sound: music, effects, mute</td></tr>
<tr><td>Dot&#8217;s memory and help level, golden seeds, Dot&#8217;s silk, a stage cut off mid-run</td><td>Full screen, the performance tip, the update stamp, tester switches</td></tr>
<tr><td>First-time teaching (How to Play, the touch coach), because a new explorer is a new person</td><td>The explorer list itself</td></tr>
<tr><td>How they like to play (question 1)</td><td></td></tr></table></div>
<p>Every saved setting in the game is in one column or the other, and a test fails if a new one isn&#8217;t.</p></section>
</main>'''
open(out, 'w').write(html)
print(len(html) // 1024, 'KB')
