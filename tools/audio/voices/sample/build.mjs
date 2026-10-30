// the voice sample page for Matt: node tools/audio/voices/sample/build.mjs <out.html>
// every voice in src/assets/voices goes into the page itself (about 220 KB), with one real line from the script for each speaker
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { execFileSync } from 'child_process';
const root = new URL('../../../../', import.meta.url).pathname;
const out = process.argv[2];
const js = execFileSync('npx', ['esbuild', `${root}tools/audio/voices/sample/page.ts`, '--bundle', '--format=iife', '--minify'], { encoding: 'utf8' });
const files = Object.fromEntries(readdirSync(`${root}src/assets/voices`).filter((f) => f.endsWith('.mp3')).map((f) => [f.slice(0, -4), readFileSync(`${root}src/assets/voices/${f}`).toString('base64')]));
const CAST = [
  ['Pokey', '#ffb02e', 'low and slow, a soft hum in it', "I was in the neighborhood. Slowly."],
  ['Dot', '#4fd18b', 'fast and chirpy, a hummingbird', "Don't you dare say that. Don't you dare."],
  ['Meeca', '#f58ab4', 'warm, a little sing-song', "Then I'll wait. I brought breakfast."],
  ['General Iron-Claw', '#e0524a', 'gravel, iron, no hurry', 'The General does not knock.'],
  ['Lieutenant Pell', '#9aa3ad', 'nervous: a tremble, a stammer', 'I am so sorry, but would you mind not looking at me?'],
  ['Grandma', '#c9a8e8', 'warm and old, unhurried', "You're staying for supper, Pokey. You always are."],
  ['Grandfather', '#b9a37a', "the General's voice with the iron gone", "Hello, love. I'm late. I brought the whole family."],
  ['Flicker', '#d8f27a', 'a firefly: tiny, high, buzzing', "I'm staying, if that's all right."],
  ['Squirrel', '#c98a4b', 'quick chatter', 'North! At that speed? See you next year!'],
  ['Soldier', '#8c7f6a', "one of the General's soldiers: gruff, clipped", 'Is that a hummingbird?'],
  ['Gruntlewick', '#d9b26a', 'the village crier: booming, in no hurry at all', "Young man. You've come a long way. Are your folks behind you?"],
  ['Thornbark', '#7a9a3c', 'old wood creaking', 'They are gone. I can hear myself think. It is very loud in here.'],
  ['Venom Fang', '#7bd34f', 'a hiss through every word', "You'll have to get through me, ssloth. Take all the time you need."],
  ['Crocus Rex', '#4aa87a', 'deep, wet, slow', 'Everyone look. I kept the crown.'],
  ['Shadow Prowler', '#8a7bd6', 'a purr under a growl', 'Again, keeper. The thorn line.'],
  ['Sky Sovereign', '#f0c04a', 'proud, clipped, bright', 'The cat says you outwaited him. Cats lie.'],
  ['Tarantula Queen', '#b05ad6', 'grand, a wobble of vibrato', 'Welcome, darling. Do stay awhile. Everyone does. Eventually.'],
  ['Marsh Reaver', '#5f9a8a', 'boggy, bubbling', 'Who wades into the blackwater at noon? Nobody wades at noon. It is LUNCH.'],
  ['Stone Idol Golem', '#a8a090', 'the lowest of all, stone grinding', 'I... am... the guardian... of this... temple.'],
  ['Night-Wing Monarch', '#6a6ad8', 'a sleepy whisper', 'Once more, please. I slept through the middle.'],
  ['Magma Drake', '#ff7a3a', 'deep, with a crackle of fire', 'Will you come back? After. Bring tea. Two cups.'],
];
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cards = CAST.map(([name, dot, how, line]) => `
  <li class="card" data-speaker="${esc(name)}" data-line="${esc(line)}" style="--dot:${dot}">
    <button type="button" aria-label="Play ${esc(name)}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z"/></svg></button>
    <div class="who"><span class="name">${esc(name)}</span><span class="how">${esc(how)}</span></div>
    <p class="line">${esc(line)}</p>
  </li>`).join('');
const html = `<title>Sloths Story Voices</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600&family=Cherry+Bomb+One&display=swap">
<style>
/* one look, the game's story screen at night: deep canopy green, warm amber for Pokey's lead, each speaker's own colour on their card */
:root {
  --bg: #0b140e; --panel: #13211a; --panel-hi: #1b2e23; --line: #2a4434; --fg: #eef3e6; --muted: #9fb3a3; --amber: #ffb02e;
  --display: 'Cherry Bomb One', 'Baloo 2', ui-rounded, system-ui, sans-serif;
  --read: 'Atkinson Hyperlegible Next', 'Atkinson Hyperlegible', system-ui, sans-serif;
  color-scheme: dark;
}
body { background: var(--bg); color: var(--fg); font-family: var(--read); font-size: 16px; line-height: 1.45; }
.wrap { max-width: 720px; margin: 0 auto; padding-block: 28px 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 22px; }
h1 { font-family: var(--display); font-weight: 400; font-size: clamp(30px, 7vw, 44px); line-height: 1.05; margin: 0; color: var(--amber); text-wrap: balance; }
.lede { margin: 0; color: var(--muted); max-width: 60ch; }
.bar { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
#all { font: 600 16px var(--read); background: var(--amber); color: #2a1a00; border: 0; border-radius: 999px; padding: 11px 20px; cursor: pointer; }
#all:focus-visible, .card button:focus-visible, .mode label:focus-within { outline: 2px solid var(--fg); outline-offset: 2px; }
.mode { display: inline-flex; background: var(--panel); border: 1px solid var(--line); border-radius: 999px; padding: 3px; }
.mode input { position: absolute; opacity: 0; pointer-events: none; }
.mode label { padding: 7px 14px; border-radius: 999px; cursor: pointer; color: var(--muted); font-size: 14px; }
.mode input:checked + span { color: var(--fg); }
.mode label:has(input:checked) { background: var(--panel-hi); color: var(--fg); }
ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.card { display: grid; grid-template-columns: 44px minmax(0, 1fr); column-gap: 14px; row-gap: 4px; align-items: start; background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 14px; transition: border-color .2s, background .2s; }
.card.on { border-color: var(--dot); background: var(--panel-hi); }
.card button { grid-row: span 2; width: 44px; height: 44px; border-radius: 50%; border: 0; background: var(--dot); cursor: pointer; display: grid; place-items: center; }
.card button svg { width: 18px; height: 18px; fill: #0b140e; margin-left: 2px; }
.who { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; min-width: 0; }
.name { font-weight: 600; color: var(--dot); }
.how { font-size: 13px; color: var(--muted); }
.line { margin: 0; font-size: 17px; min-width: 0; }
.rest { opacity: 0; }
.note { font-size: 14px; color: var(--muted); margin: 0; max-width: 62ch; }
@media (prefers-reduced-motion: reduce) { .card { transition: none; } }
</style>
<main class="wrap">
  <h1>Story voices</h1>
  <p class="lede">Every character now has a babble of their own while their line types, the way Celeste and Animal Crossing do it. Tap a card to hear one, or play them all. Each line types at that character's own pace, as it does in the game. The Narrator stays silent: narration is read, not spoken. Turn your phone's sound on.</p>
  <div class="bar">
    <button type="button" id="all">Play all</button>
    <div class="mode" role="radiogroup" aria-label="Which voices">
      <label><input type="radio" name="mode" id="mode-new" value="new" checked><span>New voices</span></label>
      <label><input type="radio" name="mode" id="mode-old" value="old"><span>Old beeps</span></label>
    </div>
  </div>
  <ul>${cards}</ul>
  <p class="note">Each voice is a few short syllables made for this game, ${Math.round(Object.values(files).reduce((a, b) => a + b.length * 0.75, 0) / 1024)} KB for the whole cast. A word always uses the same syllable, a question rises at the end, a full stop falls, and a shout is louder.</p>
</main>
<script>var VOICE_FILES = ${JSON.stringify(files)};</script>
<script>${js}</script>
`;
writeFileSync(out, html);
console.log(out, Math.round(html.length / 1024), 'KB');
