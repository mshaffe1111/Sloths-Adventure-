/**
 * playRecorder — the control test's recorder (only with #ctest in the address, or ?ctest=1; off for everyone else).
 *
 * From the moment a tester types a nickname and starts, it keeps a log of:
 *   - every finger: down, move, up, cancel (screen px, ms since start, and the touch's reported size on the way down);
 *   - what the touch rules decided each finger meant (run left, jump, punch, kick, ...);
 *   - what Pokey did: where he is and what he is doing, ten times a second and whenever that changes;
 *   - moments: hurt, lost a life, checkpoint, which stretch of the test stage he is in, finished.
 * It records no camera, microphone, location, contacts or anything else. The device line is the screen size, how the
 * phone is held, and the kind of device (phone, tablet; iPhone, Android), nothing that names it.
 *
 * Every 20 seconds (and when the page is hidden or closed) the log so far goes to Matt's Google Sheet through the
 * collector (an Apps Script web app that only appends rows), one row per part, gzipped and base64'd to fit a cell.
 *
 * Log lines (arrays, t = ms since the start):
 *   ['d', t, finger, x, y, size]   finger down          ['m', t, finger, x, y]   moved (2 px or more)
 *   ['u', t, finger, x, y]         lifted               ['c', t, finger]         cancelled by the system
 *   ['i', t, intent, arg?]         what the rules decided (move, duck, jump, jumpUp, punch, kick, mega)
 *   ['p', t, x, y, vx, vy, state]  Pokey (state: g ground, a air, c climb, s swing, h hang, k duck, plus the move he is throwing)
 *   ['e', t, what, detail?]        a moment
 */
import { BUILD_TIME } from './version.ts';
import { controlStyle, padSide, subscribeControls } from './controlPrefs.ts';

export const COLLECTOR =
  'https://script.google.com/macros/s/AKfycbxS0Yk2y7S7Ket_n7VwIpk3aKFGKVueZHi5XXn8XhvuyMy7PxcTIwJ5wJu9iKg0HzGZ/exec';
/** the collector ignores anything without this (it only stops stray traffic; it is not a secret) */
const KEY = 'sct-57496e7010785ac1';
/** a sheet cell holds 50,000 characters; the collector refuses more than 48,000 */
const CELL = 47000;
const FLUSH_MS = 20000;
const NAME_KEY = 'sloth_ctest_name';

type Line = (string | number)[];

/** the control test is on: #ctest in the address (the only part a shared Claude link passes on), or ?ctest=1 */
export function ctestEnabled(): boolean {
  try {
    return typeof location !== 'undefined' && (/(^#|[#&])ctest\b/.test(location.hash) || /[?&]ctest=1\b/.test(location.search));
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
  return `${os}; ${w}x${h} ${held}; screen ${screen.width}x${screen.height}; dpr ${window.devicePixelRatio}; ${touch}`;
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

  start(who: string) {
    if (this.on) return;
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
    // a tester who switches to the thumb pad (or back) part way through
    subscribeControls(() => this.event('controls', controls()));
    this.timer = window.setInterval(() => void this.flush(false), FLUSH_MS);
    const bye = () => void this.flush(true);
    window.addEventListener('pagehide', bye);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') bye();
    });
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
    if (what === 'finish' || what === 'survey') void this.flush(false);
  }

  /** Pokey, once a tick: kept ten times a second, and at once whenever what he is doing changes */
  pokey(x: number, y: number, vx: number, vy: number, state: string, section: string) {
    if (!this.on) return;
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
