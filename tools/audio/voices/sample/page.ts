// the voice sample page's script (bundled by build.mjs): each card types its line at the speaker's pace and speaks it the way the game
// does (voiceLine.ts Speech), or with the old letter blips for comparison
import { Speech, typeMs } from '../../../../src/audio/voiceLine.ts';
import { cutTakes } from '../../../../src/audio/voiceCut.ts';
import { typeSchedule } from '../../../../src/game/storyTyping.ts';
import { oldBlip } from './old.ts';

declare const VOICE_FILES: Record<string, string>;
let ctx: AudioContext | null = null;
let bus: GainNode;
const bank = new Map<string, AudioBuffer[]>();
let mode: 'new' | 'old' = 'new';
let playing = 0;

async function boot() {
  if (ctx) return;
  ctx = new AudioContext();
  bus = ctx.createGain();
  bus.gain.value = 1.6;
  const comp = ctx.createDynamicsCompressor();
  bus.connect(comp);
  comp.connect(ctx.destination);
  await Promise.all(Object.entries(VOICE_FILES).map(async ([slug, b64]) => {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    bank.set(slug, cutTakes(ctx!, await ctx!.decodeAudioData(u8.buffer)));
  }));
}

function syllable(slug: string, take: number, semis: number, db: number) {
  const takes = bank.get(slug);
  if (!ctx || !takes?.length) return;
  const src = ctx.createBufferSource();
  src.buffer = takes[take % takes.length];
  src.playbackRate.value = Math.pow(2, (semis + (Math.random() - 0.5) * 0.3) / 12);
  const g = ctx.createGain();
  g.gain.value = Math.pow(10, db / 20);
  src.connect(g);
  g.connect(bus);
  src.start();
}

async function say(card: HTMLElement): Promise<void> {
  await boot();
  if (ctx!.state !== 'running') await ctx!.resume();
  const run = ++playing;
  const speaker = card.dataset.speaker!;
  const text = card.dataset.line!;
  const out = card.querySelector('.line') as HTMLElement;
  document.querySelectorAll('.card.on').forEach((c) => c.classList.remove('on'));
  card.classList.add('on');
  const when = typeSchedule(text, mode === 'new' ? typeMs(speaker) : 26);
  const speech = new Speech();
  const t0 = performance.now();
  let k = 0;
  return new Promise((done) => {
    const tick = () => {
      if (run !== playing) return done();
      const now = performance.now() - t0;
      while (k < text.length && when[k] <= now) {
        if (mode === 'new') {
          const due = speech.next(speaker, text, k, ctx!.currentTime);
          if (due) {
            syllable(due.slug, due.syl.take, due.syl.semis, due.syl.db);
            speech.played(text, k, ctx!.currentTime);
          }
        } else oldBlip(ctx!, bus, speaker, text[k], k);
        k++;
      }
      out.innerHTML = `${esc(text.slice(0, k))}<span class="rest">${esc(text.slice(k))}</span>`;
      if (k < text.length) requestAnimationFrame(tick);
      else window.setTimeout(() => { card.classList.remove('on'); done(); }, 300);
    };
    requestAnimationFrame(tick);
  });
}
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);

// (a tap on one card stops a Play all that is running)
let chain = 0;
document.querySelectorAll<HTMLElement>('.card').forEach((card) => card.querySelector('button')!.addEventListener('click', () => { chain++; void say(card); }));
document.getElementById('all')!.addEventListener('click', async () => {
  const me = ++chain;
  for (const card of document.querySelectorAll<HTMLElement>('.card')) {
    if (chain !== me) return;
    await say(card);
    await new Promise((r) => setTimeout(r, 500));
  }
});
document.querySelectorAll<HTMLInputElement>('input[name=mode]').forEach((r) => r.addEventListener('change', () => { mode = r.value as 'new' | 'old'; }));
