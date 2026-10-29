/**
 * playRecorder — the control test's recorder (only with #ctest in the address, or ?ctest=1; off for everyone else).
 *
 * From the moment a tester types a nickname and starts, it keeps a log of:
 *   - every finger: down, move, up, cancel (screen px, ms since start, and the touch's reported size on the way down);
 *   - what the touch rules decided each finger meant (run left, jump, punch, kick, ...);
 *   - what Pokey did: where he is and what he is doing, ten times a second and whenever that changes;
 *   - moments: hurt, lost a life, checkpoint, which stretch of the test stage he is in, finished.
 * It records no camera, microphone, location, contacts or anything else. The device line is the screen size, how the
 * phone is held, the kind of device (phone, tablet; iPhone, Android), the browser and its version, the app it is opened inside
 * and whether it is framed or on the home screen (deviceInfo.ts); once a run, an 'env' moment adds the system version, the graphics
 * chip, memory, cores, language and screen settings. Kinds and versions only: nothing that names a person or a phone.
 *
 * Every 20 seconds (and when the page is hidden or closed) the log so far goes to Matt's Google Sheet through the
 * collector (an Apps Script web app that only appends rows), one row per part, gzipped and base64'd to fit a cell.
 *
 * Log lines (arrays, t = ms since the start):
 *   ['d', t, finger, x, y, size]   finger down          ['m', t, finger, x, y]   moved (2 px or more)
 *   ['u', t, finger, x, y]         lifted               ['c', t, finger]         cancelled by the system
 *   ['i', t, intent, arg?]         what the rules decided (move, duck, jump, jumpUp, punch, kick, mega)
 *   ['p', t, x, y, vx, vy, state]  Pokey (state: g ground, a air, c climb, s swing, h hang, k duck, plus the move he is throwing)
 *   ['e', t, what, detail?]        a moment, or a glitch the game noticed (errors, freezes, screen changes, stutter, flicker and
 *                                  jitter: every name and its fields are in tools/playtesters/LOG_EVENTS.md, for the QA team)
 */
import { BUILD_TIME } from './version.ts';
import { controlStyle, padSide, subscribeControls } from './controlPrefs.ts';
import { BlinkWatch, ErrSeen, errLine, errWhere, RateLimiter } from './glitchWatch.ts';
import { browserShort, envDetail } from './deviceInfo.ts';

export const COLLECTOR =
  'https://script.google.com/macros/s/AKfycbxS0Yk2y7S7Ket_n7VwIpk3aKFGKVueZHi5XXn8XhvuyMy7PxcTIwJ5wJu9iKg0HzGZ/exec';
/** the collector ignores anything without this (it only stops stray traffic; it is not a secret) */
const KEY = 'sct-57496e7010785ac1';
/** a sheet cell holds 50,000 characters; the collector refuses more than 48,000 */
const CELL = 47000;
const FLUSH_MS = 20000;
const NAME_KEY = 'sloth_ctest_name';

type Line = (string | number)[];

let mixSeed = 0;
/**
 * The control test's layout seed. A new one each run (chosen on the front page, and as the questions after a run come up: newMix, so
 * its sheets load behind them), the same one for a retry inside the run, so every run is a different mix of stretches (protoStage.ts). `?mix=<seed>` in the address builds that one run again.
 */
export function ctestSeed(): number {
  try {
    const q = Number(new URLSearchParams(location.search).get('mix'));
    if (Number.isInteger(q) && q > 0) return q;
  } catch {
    /* no window */
  }
  if (!mixSeed) newMix();
  return mixSeed;
}
export function newMix() {
  mixSeed = 1 + Math.floor(Math.random() * 999999);
}

/**
 * A build for the QA team: the dev server and dev builds (the QA harness, tools/qa), and Matt's test link
 * (tools/testlink/vite.testlink.config.ts sets VITE_QA_BUILD). Never the shipped game (UI-15).
 */
let qaForTest = false;
/** a unit test that plays the control test stands in for a QA build (the shipped game never calls this) */
export function asQaBuildForTest(on: boolean): void {
  qaForTest = on;
}
export function qaBuild(): boolean {
  if (qaForTest) return true;
  try {
    return !!import.meta.env.DEV || import.meta.env.VITE_QA_BUILD === '1';
  } catch {
    // (no import.meta.env outside a Vite build: the unit tests)
    return false;
  }
}

/** the control test is on: a QA build (qaBuild), and #ctest in the address (the only part a shared Claude link passes on) or ?ctest=1 */
export function ctestEnabled(): boolean {
  try {
    return qaBuild() && typeof location !== 'undefined' && (/(^#|[#&])ctest\b/.test(location.hash) || /[?&]ctest=1\b/.test(location.search));
  } catch {
    return false;
  }
}

export function savedTesterName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

function deviceLine(): string {
  const w = Math.round(window.innerWidth), h = Math.round(window.innerHeight);
  const held = w >= h ? 'landscape' : 'portrait';
  const ua = navigator.userAgent;
  const os = /iPad|Macintosh.*Mobile|Macintosh(?=.*Safari)(?!.*Chrome)/.test(ua) && navigator.maxTouchPoints > 1 ? 'iPad'
    : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? (/Mobile/.test(ua) ? 'Android phone' : 'Android tablet')
    : /Windows/.test(ua) ? 'Windows' : /Mac/.test(ua) ? 'Mac' : 'other';
  const touch = navigator.maxTouchPoints > 0 ? `touch ${navigator.maxTouchPoints}` : 'no touch';
  // (the browser goes last, so the parts the QA team already reads keep their places)
  return `${os}; ${w}x${h} ${held}; screen ${screen.width}x${screen.height}; dpr ${window.devicePixelRatio}; ${touch}; ${browserShort()}`;
}

/** gzip + base64 where the browser can (most since 2023), else the plain text; the first characters say which */
async function pack(text: string): Promise<string> {
  try {
    if (typeof CompressionStream === 'undefined') return 'raw:' + text;
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = new Uint8Array(await new Response(stream).arrayBuffer());
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return 'gz64:' + btoa(bin);
  } catch {
    return 'raw:' + text;
  }
}

class PlayRecorder {
  on = false;
  /** 'ok' after a part reached the collector, 'blocked' if this page may not send (a Claude preview), 'waiting' before the first */
  sendState: 'waiting' | 'ok' | 'blocked' = 'waiting';
  onState: ((s: PlayRecorder['sendState']) => void) | null = null;
  private who = '';
  private session = '';
  private t0 = 0;
  private part = 0;
  private lines: Line[] = [];
  private size = 0;
  private partStart = 0;
  private timer = 0;
  private lastPos: { x: number; y: number }[] = [];
  private lastP = '';
  private lastPT = -1e9;
  private section = '';
  /** glitch lines: each kind at most once a second and up to a cap a session (glitchWatch.ts) */
  private limiter = new RateLimiter();
  private errSeen = new ErrSeen(3);
  private blinks = new BlinkWatch();
  private blanks = new Set<string>();
  /** a stage is being played (the engine runs): a sheet asked for now is drawn as a stand-in until it arrives */
  playing = false;
  /** when the page last came back into view (performance.now()), so a frame gap across a hidden spell is not taken for a freeze */
  shownAt = -1;
  private hiddenAt = -1;
  /** long tasks (50 ms or more) seen since the engine last read them for its 'fps' line (-1: this browser does not report them) */
  longTasks = -1;
  /** Pokey's x when last noted, for lines that come from outside the game (long tasks) */
  private lastX = 0;

  start(who: string) {
    if (this.on) return;
    // (the mix the front page already loaded the sheets for, App.tsx; a new one only if none was chosen)
    if (!mixSeed) newMix();
    this.who = who.trim().slice(0, 40) || 'anonymous';
    try {
      localStorage.setItem(NAME_KEY, this.who);
    } catch {
      /* ignore */
    }
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
    this.session = `${stamp}-${Math.random().toString(36).slice(2, 6)}`;
    this.t0 = performance.now();
    this.partStart = 0;
    this.on = true;
    const controls = () => (controlStyle() === 'pad' ? `pad on the ${padSide()}` : 'screen gestures');
    this.push(['e', 0, 'start', `${window.innerWidth}x${window.innerHeight}; ${controls()}`]);
    this.push(['e', 0, 'env', envDetail()]);
    // a tester who switches to the thumb pad (or back) part way through
    subscribeControls(() => this.event('controls', controls()));
    this.timer = window.setInterval(() => void this.flush(false), FLUSH_MS);
    const bye = () => void this.flush(true);
    window.addEventListener('pagehide', bye);
    document.addEventListener('visibilitychange', () => {
      // hidden and back (another app, the lock button, the notification shade): noted with the time away, so the gap is not a freeze
      const now = performance.now();
      if (document.visibilityState === 'hidden') {
        this.hiddenAt = now;
        this.glitch('hidden', `x${this.lastX}`);
        bye();
      } else {
        this.shownAt = now;
        this.glitch('shown', this.hiddenAt >= 0 ? `away ${((now - this.hiddenAt) / 1000).toFixed(1)}s` : 'away ?');
      }
    });
    this.watchPage();
  }

  /** errors, long tasks and full screen, from the page itself (only once the control test has started) */
  private watchPage() {
    window.addEventListener('error', (e) => {
      // (a picture or script that failed to load arrives here too, as an event on that element with no message)
      const el = e.target as Element | null;
      if (!e.message && el && el !== (window as unknown as Element) && 'tagName' in el) {
        const src = (el as HTMLImageElement).src || (el as HTMLScriptElement).src || '';
        this.error(`load failed: <${el.tagName.toLowerCase()}> ${src.split('/').pop()?.split('?')[0] ?? ''}`, 'res');
        return;
      }
      this.error(e.error ?? e.message, 'js', e.filename, e.lineno, e.colno);
    }, true);
    window.addEventListener('unhandledrejection', (e) => this.error(e.reason, 'promise'));
    try {
      if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
        this.longTasks = 0;
        // (Chrome and Android only: a stretch of 50 ms or more the page could not answer a touch or draw a frame. Each one is counted
        // for the 'fps' line; one of 100 ms or more, a freeze you feel, gets a line of its own)
        new PerformanceObserver((list) => {
          for (const en of list.getEntries()) {
            this.longTasks++;
            if (en.duration >= 100) this.glitch('long', `${Math.round(en.duration)}ms x${this.lastX}${this.playing ? '' : ' menu'}`);
          }
        }).observe({ type: 'longtask', buffered: false });
      }
    } catch {
      /* no long-task timing here */
    }
    const fs = () => {
      const d = document as Document & { webkitFullscreenElement?: Element | null };
      this.glitch('fullscreen', `${d.fullscreenElement || d.webkitFullscreenElement ? 'on' : 'off'} ${window.innerWidth}x${window.innerHeight}`);
    };
    document.addEventListener('fullscreenchange', fs);
    document.addEventListener('webkitfullscreenchange', fs);
  }

  /**
   * A glitch line: kept at most once a second for each kind, up to that kind's cap a session (glitchWatch.ts CAPS), so a phone in
   * trouble cannot flood the log. A line kept after some were dropped ends with "+n" (how many were dropped since the last one).
   */
  glitch(kind: string, detail: string) {
    if (!this.on) return;
    const now = performance.now();
    const dropped = this.limiter.allow(kind, now);
    if (dropped < 0) this.hold(kind, detail, now);
    else this.emit(kind, detail, dropped, now);
  }
  private emit(kind: string, detail: string, dropped: number, now: number) {
    this.push(['e', this.now(now), kind, dropped > 0 ? `${detail} +${dropped}` : detail]);
    if (this.limiter.capped) {
      this.push(['e', this.now(now), 'capped', this.limiter.capped]);
      this.limiter.capped = '';
    }
  }
  /**
   * A line that came too soon after the last of its kind is held, and the latest one held goes in when the second is up (so the last
   * word of a burst is kept: the size a turning screen settled on, a second error thrown with the first). "+n" counts the rest.
   */
  private held = new Map<string, { detail: string; at: number }>();
  private hold(kind: string, detail: string, now: number) {
    if (this.limiter.full(kind)) return;
    const waiting = this.held.has(kind);
    this.held.set(kind, { detail, at: now });
    if (waiting) return;
    window.setTimeout(() => {
      const h = this.held.get(kind);
      this.held.delete(kind);
      if (!h || !this.on) return;
      const n = this.limiter.allow(kind, performance.now());
      // (stamped with when it happened, so it can sit a little out of order; the held line was itself counted as dropped)
      if (n >= 0) this.emit(kind, h.detail, n - 1, h.at);
    }, this.limiter.wait(kind, now) + 5);
  }

  /** an error (`where`: js, promise, frame, screen, res): the message and file:line, the same message at most three times a session */
  error(err: unknown, where: string, file?: string, line?: number, col?: number) {
    if (!this.on) return;
    const at = file ? { file, line, col } : errWhere(err);
    const text = errLine(err, at.file, at.line, at.col, 150);
    if (!this.errSeen.take(text)) return;
    this.glitch('err', `${where} ${text}`);
  }

  /** a stage starts (its engine), or ends: the picture sheets noted as missing start over, once per sheet per stage */
  private stageOwner: object | null = null;
  stage(owner: object, on: boolean) {
    if (on) {
      this.stageOwner = owner;
      this.playing = true;
      this.blanks.clear();
    } else if (this.stageOwner === owner) {
      this.stageOwner = null;
      this.playing = false;
    }
  }

  /**
   * A picture sheet asked for during play that is not there yet (`wait`), or that failed to load (`fail`): whatever needs it is drawn as
   * a stand-in (or not at all) until it arrives. Once per sheet per stage; the ones asked for within a second share a line (the start of
   * a stage asks for several at once).
   */
  blank(sheet: string, why: 'wait' | 'fail') {
    if (!this.on || !this.playing) return;
    const key = `${why} ${sheet.replace(/\.(webp|png|jpe?g)$/, '')}`;
    if (this.blanks.has(key)) return;
    this.blanks.add(key);
    this.blankQueue.push(key);
    if (!this.blankTimer) this.blankTimer = window.setTimeout(() => this.flushBlanks(), 1000);
  }
  private blankQueue: string[] = [];
  private blankTimer = 0;
  private flushBlanks() {
    this.blankTimer = 0;
    const q = this.blankQueue;
    this.blankQueue = [];
    let line = '';
    let n = 0;
    for (const k of q) {
      if (line.length + k.length > 140) break;
      line += (line ? ', ' : '') + k;
      n++;
    }
    if (q.length > n) line += ` +${q.length - n} sheets`;
    this.glitch('blank', `${line} x${this.lastX}`);
  }

  /** a HUD piece or an overlay was shown (mounted, or a new line in it): more than 4 times in 2 s is a blink */
  shown(name: string) {
    if (!this.on) return;
    if (this.blinks.shown(name, performance.now())) this.glitch('blink', `${name} x${this.lastX}`);
  }

  private now(stamp?: number): number {
    return Math.round((stamp ?? performance.now()) - this.t0);
  }

  private push(l: Line) {
    this.lines.push(l);
    this.size += 4 + l.join(',').length;
    if (this.size > CELL * 2.5) void this.flush(false);
  }

  touch(kind: 'd' | 'm' | 'u' | 'c', id: number, x: number, y: number, stamp: number, size = 0) {
    if (!this.on) return;
    const fx = Math.round(x), fy = Math.round(y);
    if (kind === 'm') {
      const last = this.lastPos[id % 16];
      if (last && Math.abs(last.x - fx) < 2 && Math.abs(last.y - fy) < 2) return;
    }
    this.lastPos[id % 16] = { x: fx, y: fy };
    const t = this.now(stamp);
    if (kind === 'd') this.push(['d', t, id % 1000, fx, fy, Math.round(size)]);
    else if (kind === 'c') this.push(['c', t, id % 1000]);
    else this.push([kind, t, id % 1000, fx, fy]);
  }

  intent(name: string, arg?: string | number) {
    if (!this.on) return;
    this.push(arg === undefined ? ['i', this.now(), name] : ['i', this.now(), name, arg]);
  }

  event(what: string, detail?: string | number) {
    if (!this.on) return;
    this.push(detail === undefined ? ['e', this.now(), what] : ['e', this.now(), what, detail]);
    if (what === 'finish' || what === 'survey' || what === 'quit') void this.flush(false);
  }

  /** Pokey, once a tick: kept ten times a second, and at once whenever what he is doing changes */
  pokey(x: number, y: number, vx: number, vy: number, state: string, section: string) {
    if (!this.on) return;
    this.lastX = Math.round(x);
    if (section && section !== this.section) {
      this.section = section;
      this.event('section', section);
    }
    const t = this.now();
    // ten times a second while he moves; once a second while he stands still doing the same thing
    const key = `${state}|${Math.round(x)}|${Math.round(y)}`;
    if (state === this.lastP.split('|')[0] && t - this.lastPT < (key === this.lastP ? 1000 : 100)) return;
    this.lastP = key;
    this.lastPT = t;
    this.push(['p', t, Math.round(x), Math.round(y), Math.round(vx), Math.round(vy), state]);
  }

  /** send the log so far as the next part (`leaving`: the page is going away, so use the beacon, which survives it) */
  async flush(leaving: boolean) {
    if (!this.on || this.lines.length === 0) return;
    const lines = this.lines;
    const secs = Math.round((this.now() - this.partStart) / 1000);
    this.lines = [];
    this.size = 0;
    this.partStart = this.now();
    // halve until each piece fits a cell (a very busy 20 s, or an old browser that cannot gzip)
    const pieces: Line[][] = [lines];
    const out: string[] = [];
    while (pieces.length) {
      const p = pieces.shift()!;
      const packed = await pack(JSON.stringify(p));
      if (packed.length <= CELL || p.length < 2) out.push(packed.slice(0, CELL));
      else pieces.unshift(p.slice(0, p.length >> 1), p.slice(p.length >> 1));
    }
    for (const d of out) this.send({ k: KEY, who: this.who, session: this.session, part: ++this.part, device: deviceLine(), build: BUILD_TIME || 'dev', secs, d }, leaving);
  }

  private send(body: object, leaving: boolean) {
    const text = JSON.stringify(body);
    if (leaving && navigator.sendBeacon) {
      try {
        if (navigator.sendBeacon(COLLECTOR, new Blob([text], { type: 'text/plain' }))) return;
      } catch {
        /* fall through to fetch */
      }
    }
    fetch(COLLECTOR, { method: 'POST', mode: 'no-cors', keepalive: text.length < 60000, headers: { 'Content-Type': 'text/plain' }, body: text })
      .then(() => this.setState('ok'))
      .catch(() => this.setState(this.sendState === 'ok' ? 'ok' : 'blocked'));
  }

  private setState(s: PlayRecorder['sendState']) {
    if (s === this.sendState) return;
    this.sendState = s;
    this.onState?.(s);
  }
}

export const recorder = new PlayRecorder();
