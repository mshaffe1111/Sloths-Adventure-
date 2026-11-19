/**
 * The time-stamp check (R-165.168, LESSONS D30 and its three repeats): a dated ET time a commit adds may not be later than that
 * commit's own time. The lead and members typed clock times ahead of the real clock (11-12: up to 15 min; 11-15: 3-11 min; 11-18:
 * 1-19 min); a habit failed three times, a gate does not forget.
 *
 *   node tools/timecheck.mjs                       (seconds; exit 1 on a breach, 2 when it can't run)
 *   node tools/timecheck.mjs --range A..B          (judge the commits in A..B; default: merge-base(origin/main, HEAD)..HEAD,
 *                                                   or HEAD^1..HEAD when HEAD is main itself, the deploy run)
 *   node tools/timecheck.mjs --since 2026-11-16 [--rev B]   (judge every commit since that ET day, on B or HEAD)
 *   --repo <dir>                                   (another clone; the tests use it)
 *   --tsv                                          (breaches only, one per line, tab-separated, for a fixing script:
 *                                                   file, line, stamp as written, the stamp read as ET, the commit's ET time, commit)
 *
 * What it reads: the lines at the head of the range (B) of reference/STATE.md, reference/LESSONS.md, reference/handoffs/*.md,
 * reference/packets/**\/*.md and reference/qa-reports/**\/REPORT.md, each blamed (git blame -w -M -C) to the commit that last wrote
 * it. Only lines a commit IN the range wrote are judged, against THAT commit's committer time (lead's ruling 11-18 5:45 PM ET): a
 * stamp corrected by a later commit is judged against the later commit and clears; a line only moved or re-indented keeps its first
 * commit and is not judged again; history is never rewritten.
 * A stamp is a clock time with AM/PM (ET optional; a time in another zone is skipped), as one time or a range ("6:35-6:45 PM": the
 * end is judged). A date counts only within 7 days before or 1 day after the commit's ET day (readDate): outside it, a stage id
 * ("1-2 at 2:10 PM") is no date and its time is judged as an undated time; a real old or far day's time is not judged.
 * Its day: a date written next to it ("11-18 5:31 PM ET", "2026-11-14 2:05 AM", "Written 5:37 PM ET 11-18"), else
 * the date a ledger line starts with ("- 11-15 6:44 PM ET (lead): MATT 6:44 PM"), else the commit's own ET day (read as the day before when that would put it more than
 * an hour after the commit: "MATT 11:47 PM" in a 12:30 AM commit is last night; a port of an older branch's text re-committed later
 * in the day is not judged as typed ahead). A weekday written next to it ("Fri 5:44 PM") is the latest such day up to the commit. Quotes of what someone else said count the same.
 * Not stamps: plans and deadlines, a time right after a plan word ("by 7:30 PM", "~9:30 PM", "box 8:30 PM", "target 6:45 PM",
 * "cutoff 11:30 PM", "report 8:40 PM", ...: isPlan below), and the record of a wrong stamp ("first typed 5:40 PM").
 * A breach: the stamp (start of its minute) more than 2 minutes after the commit's committer time (grace for a commit made right after
 * writing). Each breach prints file:line, the stamp, the commit time and the commit.
 * Known limit: the ET offset is read for the stamp's own day, so a stamp inside the 1-hour DST change at 2 AM can be off by an hour.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const GRACE_MS = 2 * 60 * 1000;
export const DATELESS_AHEAD_MS = 60 * 60 * 1000; // typed-ahead drift seen: up to 19 min (11-12..11-18)
export const FILES = [
  'reference/STATE.md',
  'reference/LESSONS.md',
  ':(glob)reference/handoffs/*.md',
  ':(glob)reference/packets/**/*.md',
  ':(glob)reference/qa-reports/**/REPORT.md',
];

// ---- ET clock ---------------------------------------------------------------------------------------------------------------------
const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
});
/** an instant's ET wall clock: { y, mo, d, h, mi } */
export function etParts(ms) {
  const p = Object.fromEntries(fmt.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute };
}
const wallMs = (w) => Date.UTC(w.y, w.mo - 1, w.d, w.h ?? 0, w.mi ?? 0);
/** the instant an ET wall clock names */
export function etToMs(y, mo, d, h, mi) {
  const want = Date.UTC(y, mo - 1, d, h, mi);
  let ms = want;
  for (let i = 0; i < 2; i++) ms += want - wallMs(etParts(ms));
  return ms;
}
/** "5:31 PM ET 11-18" ("5:31:40 PM ET 11-18" with seconds) */
export function etLabel(ms, secs = false) {
  const w = etParts(ms);
  const sec = secs ? `:${String(new Date(ms).getUTCSeconds()).padStart(2, '0')}` : '';
  return `${w.h % 12 || 12}:${String(w.mi).padStart(2, '0')}${sec} ${w.h < 12 ? 'AM' : 'PM'} ET ${w.mo}-${w.d}`;
}

// ---- reading stamps from a line --------------------------------------------------------------------------------------------------
// a time or a range of times, then AM/PM, then an optional zone
const TIME = /(?<![\d:])(\d{1,2}):(\d{2})(?:\s*(?:-|–|to)\s*(\d{1,2}):(\d{2}))?\s*([AaPp])\.?[Mm]\.?(?![A-Za-z])(\s*(?:ET|EST|EDT|UTC|GMT|Z\b|PT|PST|PDT|CT|CST|MT|MST))?/g;
// a month-day (optionally with the year), as a word of its own (not "R-165", not "1-1-2", not "t-int-12")
const DATE = /(?<![\w.\-/#])(?:(20\d\d)-)?(\d{1,2})-(\d{1,2})(?![\w\-]|\.\d)/g;
// a plan or deadline: the word RIGHT before the time (past a date written there) is one of these, with no punctuation between
// ("report by 7:30 PM", "box 8:30 PM", "final hash to the lead by 4:30 PM ET"); or a "~" before it ("~9:30 PM", "~10-10:30 PM"); or
// the word after it is ("8:00 PM checkpoint", "2:00 AM ET reset"). A word that ends a clause ("by date): MATT 11:29 AM", "fix
// tonight; 12:23 AM", "is no check (D83, 11-16 1:07 AM ET)") does not make the time a plan: those are stamps.
export const PLAN = /^(?:by|before|until|till|til|target(?:ed|s)?|eta|box(?:ed)?|final|cutoff|cut-off|deadline|due|stops?|stop-line|start(?:s|ing)?|ends?|report(?:s|ing)?|link|check(?:s|ing)?|check-ins?|next|moves?|moved|to|for|after|from|around|about|tonight|tomorrow|plann?(?:ed|s)?|expected|expects?|resumes?|wakes?|fires?|re-?arm(?:ed)?|armed|resets?|ready|lands?|aim(?:s|ing)?|hold(?:s|ing)?|wait(?:s|ing)?|typed|est\.?|->|→|=>)$/i;
const PLAN_AFTER = /^\s*(?:ET\b)?\s*(?:[\w-]+\s+)?(?:checkpoint|deadline|cutoff|cut-off|target|check-?in|wake-?up|alarm|reset)\b/i;
const WEEKDAY = /^\(?(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?$/;
/** is the time at `at` in `line` a plan or deadline rather than a stamp? */
export function isPlan(line, at, end, prev = '') {
  const before = line.slice(0, at);
  if (/[~≈]\s*(?:\d{1,2}\s*[-–]\s*)?$/.test(before)) return true;
  if (PLAN_AFTER.test(line.slice(end))) return true;
  // the clause the time sits in, back to the last punctuation (a wrapped line continues the one above it)
  const toks = `${prev} ${before}`.trimEnd().split(/\s+/);
  // past a date or weekday written just before the time; one that opens a bracket opens the clause too ("(11-18 3:46 PM)")
  const opens = (t) => /^[(\[]/.test(t);
  if (/^\(?(?:20\d\d-)?\d{1,2}-\d{1,2},?$/.test(toks.at(-1) ?? '')) {
    if (opens(toks.pop())) return false;
    if (WEEKDAY.test(toks.at(-1) ?? '') && opens(toks.pop())) return false;
  } else if (WEEKDAY.test(toks.at(-1) ?? '') && opens(toks.pop())) return false;
  const bare = (w) => w.replace(/^[(\["'*]+/, '').replace(/\*+$/, '');
  const last = toks.at(-1) ?? '';
  // a plan word with a colon ("due: 9:30 AM ET", "BOX: 8:30 PM") still plans; any other punctuation ended the clause
  if (/:$/.test(last)) return PLAN.test(bare(last.slice(0, -1)));
  if (/[,;.!?)\]"']$/.test(last)) return false; // the clause ended right before the time
  const clause = [];
  for (let i = toks.length - 1; i >= 0 && clause.length < 12; i--) {
    if (i < toks.length - 1 && /[,;:.!?)\]"']$/.test(toks[i])) break; // (the last one was checked above)
    clause.unshift(bare(toks[i]));
    if (/^[(\[]/.test(toks[i])) break;
  }
  if (!clause.length) return false;
  // "at" is a plan only in a clause that plans ("target link #4 at 4:30 PM", "Progress message at 8:30 PM"), not in a record
  // ("merged at 10:58 PM")
  if (/^at$/i.test(clause.at(-1))) return clause.slice(0, -1).some((c) => PLAN.test(c) || /^(?:will|shall|should|'ll|progress)$/i.test(c));
  // otherwise the clause's last word ("stop by 7:30 PM", "box 8:30 PM"), or a plan word before a lowercase one ("Stop line 7:45 PM",
  // "retired by the 1:05 AM check"; not "DECIDED by Matt 11-09 9:10 PM ET", a record)
  if (PLAN.test(clause.at(-1))) return true;
  return clause.length > 1 && PLAN.test(clause.at(-2)) && /^[a-z#\d]/.test(clause.at(-1));
}
const ZONE_OK = /^\s*(ET|EST|EDT)?$/;

// A date counts only if it is plausible for its commit (TIME-168b): within DATE_BEFORE_DAYS before or DATE_AFTER_DAYS after the commit's
// own ET day. A stamp is written the day it happens, or quoted from the past week; a "date" outside that is a stage id ("1-2 at 2:10 PM",
// "10-10 boss": the ten worlds' ids 1-1..10-10 all look like dates) or an old/far day.
export const DATE_BEFORE_DAYS = 7;
export const DATE_AFTER_DAYS = 1;
/** a stage id's shape: two numbers 1..10, no year ("1-2", "10-10") */
const STAGE_ID = (yy, mo, d) => !yy && mo >= 1 && mo <= 10 && d >= 1 && d <= 10;
/**
 * A date token, read against the commit: { kind: 'date', day } when its nearest reading falls in the window; { kind: 'far' } when it is a
 * real day outside it (its times are skipped: an older day's time is earlier than its commit, a later day's is a plan, and reading it as
 * the commit's own day would cry wolf on an old line re-committed, "REPEAT 11-12 6:35-6:45 PM ET"); null when it is no date at all
 * (a stage id out of the window, or "13-40"): its time is then judged as an undated time, like any other.
 */
export function readDate(yy, mo, d, commitMs) {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const c = etParts(commitMs);
  const cDay = Date.UTC(c.y, c.mo - 1, c.d) / 86400e3;
  let best = null;
  for (const y of yy ? [yy] : [c.y - 1, c.y, c.y + 1]) {
    const day = Date.UTC(y, mo - 1, d) / 86400e3;
    if (new Date(day * 86400e3).getUTCDate() !== d) continue; // 2-30
    if (!best || Math.abs(day - cDay) < Math.abs(best.off)) best = { y, mo, d, off: day - cDay };
  }
  if (!best) return null;
  if (best.off >= -DATE_BEFORE_DAYS && best.off <= DATE_AFTER_DAYS) return { kind: 'date', day: best };
  return STAGE_ID(yy, mo, d) ? null : { kind: 'far' };
}

/**
 * The stamps a line claims, each resolved to an instant against the commit that wrote it.
 * @returns {{ text: string, ms: number, dated: boolean }[]}
 */
export function stampsIn(line, commitMs, prev = '') {
  const dates = [...line.matchAll(DATE)]
    .map((m) => ({ at: m.index, end: m.index + m[0].length, ...readDate(m[1] ? +m[1] : 0, +m[2], +m[3], commitMs) }))
    .filter((x) => x.kind);
  // a ledger line's own date, at its head ("- 11-18 5:31 PM ET (lead): ... MATT 5:13 PM"): later dateless times on the line take it
  const head = /^\s*(?:[-*>]|\d+\.)?\s*(?:\*\*)?\s*/.exec(line)[0].length;
  const lead = dates.find((x) => x.at === head) ?? null;
  const out = [];
  for (const m of line.matchAll(TIME)) {
    if (!ZONE_OK.test(m[6] ?? '')) continue; // another zone (UTC, PT, ...)
    if (isPlan(line, m.index, m.index + m[0].length, prev)) continue;
    let h = m[3] !== undefined ? +m[3] : +m[1];
    const mi = m[3] !== undefined ? +m[4] : +m[2];
    if (h < 1 || h > 12 || mi > 59) continue;
    const pm = /p/i.test(m[5]);
    h = (h % 12) + (pm ? 12 : 0);
    const end = m.index + m[0].length;
    // the date written next to it: just before ("11-18 5:31", "Wed 11-18, 5:31") or just after ("5:37 PM ET 11-18", "5:37 PM ET Wed 11-18")
    const adj =
      dates.find((x) => x.end <= m.index && /^,?\s*(?:at\s+)?$/.test(line.slice(x.end, m.index))) ??
      dates.find((x) => x.at >= end && /^\s*,?\s*(?:on\s+)?(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+)?$/.test(line.slice(end, x.at)));
    const earlier = adj ?? (lead && lead.end <= m.index ? lead : null);
    if (earlier?.kind === 'far') continue; // a time on a day outside the window: not judged (readDate)
    let ms;
    const wd = !adj && /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\.?,?\s+$/.exec(line.slice(0, m.index));
    if (wd) {
      const c = etParts(commitMs), want = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd[1]);
      let back = (new Date(Date.UTC(c.y, c.mo - 1, c.d)).getUTCDay() - want + 7) % 7;
      ms = etToMs(c.y, c.mo, c.d - back, h, mi);
    } else if (earlier) ms = etToMs(earlier.day.y, earlier.day.mo, earlier.day.d, h, mi);
    else {
      const c = etParts(commitMs);
      ms = etToMs(c.y, c.mo, c.d, h, mi);
      if (ms - commitMs > DATELESS_AHEAD_MS) ms = etToMs(c.y, c.mo, c.d - 1, h, mi);
    }
    out.push({ text: line.slice(adj && adj.end <= m.index ? adj.at : wd ? m.index - wd[0].length : m.index, adj && adj.at >= end ? adj.end : end).trim(), ms, dated: !!(earlier || wd) });
  }
  return out;
}

/** breaches of one line: stamps more than the grace after the commit */
export function judgeLine(line, commitMs, prev = '') {
  return stampsIn(line, commitMs, prev).filter((s) => s.ms - commitMs > GRACE_MS);
}

// ---- git ---------------------------------------------------------------------------------------------------------------------------
function makeGit(cwd) {
  const git = (...a) => execFileSync('git', a, { cwd, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
  const tryGit = (...a) => { try { return git(...a).trim(); } catch { return null; } };
  return { git, tryGit };
}

/** the default range, the way knowncheck picks its base */
export function defaultRange(tryGit) {
  const head = tryGit('rev-parse', 'HEAD');
  for (const ref of ['origin/main', 'main']) {
    const r = tryGit('rev-parse', '--verify', '--quiet', ref);
    if (!r) continue;
    if (r === head) { const p = tryGit('rev-parse', '--verify', '--quiet', 'HEAD^1'); return p ? `${p}..HEAD` : null; }
    const mb = tryGit('merge-base', ref, 'HEAD');
    return mb ? `${mb}..HEAD` : null;
  }
  return null;
}

/** blame porcelain -> [{ line, n, sha, ms }]: each line at the head, the commit that last wrote it and its committer time */
export function parseBlame(text) {
  const commits = new Map();
  const out = [];
  let cur = null;
  for (const l of text.split('\n')) {
    const h = /^([0-9a-f]{40}) \d+ (\d+)(?: \d+)?$/.exec(l);
    if (h) { cur = { sha: h[1], n: +h[2] }; if (!commits.has(cur.sha)) commits.set(cur.sha, { ms: 0 }); continue; }
    if (!cur) continue;
    if (l.startsWith('\t')) { out.push({ line: l.slice(1), n: cur.n, sha: cur.sha, c: commits.get(cur.sha) }); continue; }
    const t = /^committer-time (\d+)$/.exec(l);
    if (t) commits.get(cur.sha).ms = +t[1] * 1000;
  }
  return out.map((x) => ({ line: x.line, n: x.n, sha: x.sha, ms: x.c.ms }));
}

/**
 * Run the check. opts: { repo, range?: 'A..B', since?: 'YYYY-MM-DD', rev?: string }
 * @returns {{ label: string, files: number, lines: number, stamps: number, breaches: object[] }}
 */
export function run(opts) {
  const { git, tryGit } = makeGit(opts.repo);
  if (tryGit('rev-parse', '--is-shallow-repository') === 'true')
    throw new Error('a shallow clone: blame needs the full history (git fetch --unshallow; CI checks out with fetch-depth 0)');
  let revArgs, label, head;
  if (opts.since) {
    const [y, mo, d] = opts.since.split('-').map(Number);
    head = opts.rev ?? 'HEAD';
    revArgs = [`--since=${new Date(etToMs(y, mo, d, 0, 0)).toISOString()}`, head];
    label = `commits on ${head} since ${opts.since} 12:00 AM ET`;
  } else {
    const range = opts.range ?? defaultRange(tryGit);
    if (!range) throw new Error('no range: no origin/main or main to compare with (a shallow clone? fetch main), and no --range given');
    head = range.split('..')[1] || 'HEAD';
    revArgs = [range];
    label = range;
  }
  // the commits judged; each line is blamed over the WHOLE history at the head, so a line older than the range keeps its old commit
  const inRange = new Set(git('rev-list', ...revArgs).split('\n').filter(Boolean));
  const files = [...new Set(git('log', '--format=', '--name-only', ...revArgs, '--', ...FILES).split('\n').filter(Boolean))]
    .filter((f) => tryGit('cat-file', '-e', `${head}:${f}`) !== null)
    .sort();
  let lines = 0, stamps = 0;
  const breaches = [];
  for (const f of files) {
    const all = parseBlame(git('blame', '--porcelain', '-w', '-M', '-C', head, '--', f)).sort((a, b) => a.n - b.n);
    for (const [i, b] of all.entries()) {
      if (!inRange.has(b.sha)) continue;
      lines++;
      // an indented line continues the one above it ("...after the weekly reset,\n  Wednesday 11-11 2:00 AM ET")
      const s = stampsIn(b.line, b.ms, /^\s/.test(b.line) ? all[i - 1]?.line ?? '' : '');
      stamps += s.length;
      for (const x of s.filter((x) => x.ms - b.ms > GRACE_MS))
        breaches.push({ file: f, n: b.n, stamp: x.text, stampMs: x.ms, commit: b.sha, commitMs: b.ms, aheadS: Math.round((x.ms - b.ms) / 1000) });
    }
  }
  return { label, commits: inRange.size, files: files.length, lines, stamps, breaches };
}

function main(argv) {
  const opt = { repo: path.join(path.dirname(fileURLToPath(import.meta.url)), '..') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--range') opt.range = argv[++i];
    else if (a === '--since') opt.since = argv[++i];
    else if (a === '--rev') opt.rev = argv[++i];
    else if (a === '--repo') opt.repo = path.resolve(argv[++i]);
    else if (a === '--tsv') opt.tsv = true;
    else { console.log(`time-stamp check: unknown argument ${a}: FAIL`); return 2; }
  }
  if (opt.since && !/^\d{4}-\d{2}-\d{2}$/.test(opt.since)) { console.log('time-stamp check: --since takes YYYY-MM-DD: FAIL'); return 2; }
  let r;
  try { r = run(opt); } catch (e) { console.log(`time-stamp check: couldn't run (${String(e.message ?? e).split('\n')[0]}): FAIL`); return 2; }
  if (opt.tsv) {
    console.log(['file', 'line', 'stamp', 'stamp_et', 'commit_et', 'commit'].join('\t'));
    for (const b of r.breaches) console.log([b.file, b.n, b.stamp, etLabel(b.stampMs), etLabel(b.commitMs, true), b.commit].join('\t'));
    return r.breaches.length ? 1 : 0;
  }
  console.log(`time-stamp check over ${r.label}: ${r.commits} commits, ${r.files} files, ${r.lines} lines they wrote, ${r.stamps} stamps`);
  for (const b of r.breaches)
    console.log(`✗ ${b.file}:${b.n}  "${b.stamp}" is ${Math.floor(b.aheadS / 60)}:${String(b.aheadS % 60).padStart(2, '0')} after its commit ${b.commit.slice(0, 8)} (${etLabel(b.commitMs, true)}); a stamp may not be later than its commit (+2 min)`);
  console.log(r.breaches.length ? `FAIL (${r.breaches.length})` : 'PASS');
  return r.breaches.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
