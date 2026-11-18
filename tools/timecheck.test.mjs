/**
 * The time-stamp check's planted failures (tools/timecheck.mjs, R-165.168, LESSONS D30): each case builds a throwaway git repo whose
 * commits carry set committer times, then runs the real check (and its CLI) over it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, stampsIn, judgeLine, etToMs, etLabel } from './timecheck.mjs';

const TOOL = path.join(path.dirname(fileURLToPath(import.meta.url)), 'timecheck.mjs');
const ET = (hm, day = '2026-11-18') => `${day}T${hm}:00-05:00`; // November is EST
const at = (hm, day) => Date.parse(ET(hm, day));

/** a fresh repo; commit(time, files) writes the files (path -> text, null deletes) and commits at that ET time */
function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'timecheck-'));
  const git = (args, env = {}) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', env: { ...process.env, ...env } }).trim();
  git(['init', '-q', '-b', 'main']);
  git(['config', 'user.email', 't@example.com']);
  git(['config', 'user.name', 't']);
  git(['config', 'commit.gpgsign', 'false']);
  const commit = (hm, files, day) => {
    for (const [f, text] of Object.entries(files)) {
      const p = path.join(dir, f);
      if (text === null) { fs.rmSync(p); continue; }
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, text);
    }
    git(['add', '-A']);
    const d = ET(hm, day);
    git(['commit', '-q', '-m', `at ${hm}`], { GIT_COMMITTER_DATE: d, GIT_AUTHOR_DATE: d });
    return git(['rev-parse', 'HEAD']);
  };
  return { dir, git, commit };
}
const FILLER = Array.from({ length: 6 }, (_, i) => `- an older ledger line number ${i} with plenty of words in it, no clock`).join('\n');

test('a stamp 10 minutes ahead of its commit fails, with file:line, the stamp and the commit', () => {
  const r = repo();
  const base = r.commit('17:00', { 'reference/STATE.md': `${FILLER}\n` });
  const c = r.commit('17:31', { 'reference/STATE.md': `${FILLER}\n- 11-18 5:41 PM ET (lead): INT-12 started\n` });
  const out = run({ repo: r.dir, range: `${base}..HEAD` });
  assert.equal(out.breaches.length, 1);
  assert.deepEqual([out.breaches[0].file, out.breaches[0].n, out.breaches[0].stamp, out.breaches[0].commit, out.breaches[0].aheadS],
    ['reference/STATE.md', 7, '11-18 5:41 PM ET', c.slice(0, 8), 600]);
  const cli = spawnSync('node', [TOOL, '--repo', r.dir, '--range', `${base}..HEAD`], { encoding: 'utf8' });
  assert.equal(cli.status, 1);
  assert.match(cli.stdout, /✗ reference\/STATE\.md:7 {2}"11-18 5:41 PM ET" is 10:00 after its commit [0-9a-f]{8} \(5:31:00 PM ET 11-18\)/);
  assert.match(cli.stdout, /FAIL \(1\)/);
});

test('on the minute passes; the 2-minute grace holds; 3 minutes ahead fails', () => {
  const c = at('17:31');
  assert.deepEqual(judgeLine('- 11-18 5:31 PM ET (lead): on the minute', c + 50_000), []);
  assert.deepEqual(judgeLine('- 11-18 5:33 PM ET (lead): two minutes ahead', c), []);
  assert.equal(judgeLine('- 11-18 5:34 PM ET (lead): three minutes ahead', c).length, 1);
  const r = repo();
  const base = r.commit('17:00', { 'reference/STATE.md': 'x\n' });
  r.commit('17:31', { 'reference/STATE.md': 'x\n- 11-18 5:31 PM ET: a\n- 11-18 5:33 PM ET: b\n' });
  const ok = spawnSync('node', [TOOL, '--repo', r.dir, '--range', `${base}..HEAD`], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stdout);
  assert.match(ok.stdout, /PASS$/m);
});

test('a stamp from an earlier day passes, including a dateless late-night time in an after-midnight commit', () => {
  const c = at('00:30', '2026-11-19');
  assert.deepEqual(judgeLine('- 11-18 11:50 PM ET: last night', c), []);
  assert.deepEqual(judgeLine('(Matt, 2026-11-14 1:51 PM ET: "we only are going up to extra high")', c), []);
  assert.deepEqual(judgeLine('MATT 11:47 PM: fix tonight', c), [], 'a dateless 11:47 PM at 12:30 AM is last night');
  assert.deepEqual(judgeLine('Written 9:05 AM ET 11-18.', c), []);
});

test('the shapes the repo uses are read, the day taken from the date next to the time or earlier on the line', () => {
  const c = at('17:31');
  const s = (l) => stampsIn(l, c).map((x) => [x.text, etLabel(x.ms)]);
  assert.deepEqual(s('- 11-18 5:31 PM ET (lead): MATT 5:13 PM: plan ahead'), [['11-18 5:31 PM ET', '5:31 PM ET 11-18'], ['5:13 PM', '5:13 PM ET 11-18']]);
  assert.deepEqual(s('- 2026-11-14 2:05 AM ET: MATT 2:04 AM: push harder'), [['2026-11-14 2:05 AM ET', '2:05 AM ET 11-14'], ['2:04 AM', '2:04 AM ET 11-14']]);
  assert.deepEqual(s('# TIME-168. Written 5:37 PM ET 11-18 (by `date`).'), [['5:37 PM ET 11-18', '5:37 PM ET 11-18']]);
  assert.deepEqual(s('(D87, 11-18 5:31 PM ET by the commit clock; first typed 5:40 PM)'), [['11-18 5:31 PM ET', '5:31 PM ET 11-18']]);
  assert.deepEqual(s('REPEAT (11-15 11:07-11:24 AM ET, this lead)'), [['11-15 11:07-11:24 AM ET', '11:24 AM ET 11-15']]);
  // a stage id is not a date: "1-8" leaves the time on the commit's day
  assert.deepEqual(s('1-8 build began 5:20 PM'), [['5:20 PM', '5:20 PM ET 11-18']]);
});

test('weekdays, wrapped lines, colons and the one-hour dateless window (shapes met on the lead branch, 11-08..11-18)', () => {
  const sat = at('12:12', '2026-11-14'); // a Saturday
  assert.deepEqual(judgeLine('lead.md was last written Fri 5:44 PM ET, a day stale', sat), [], 'Fri is the day before');
  assert.equal(judgeLine('written Sat 12:30 PM ET', sat).length, 1, 'Sat is the commit day');
  const c = at('17:31');
  for (const plan of ['to: Engine   effort: high   due: 9:30 AM ET', 'Progress message at 8:30 PM ET with what is planted', 'Stop line 7:45 PM (the lead).',
    'EN-F is retired by the 1:05 AM check.', 'Progress at 9:20 PM. No shell wait loops.'])
    assert.deepEqual(judgeLine(plan, c), [], plan);
  assert.deepEqual(judgeLine('  Wednesday 11-19 2:00 AM ET, on free usage.', c, 'the weekly limit resets'), [], 'the plan word is on the line above');
  assert.equal(judgeLine('  Wednesday 11-18 5:45 PM ET, on free usage.', c, 'Matt wrote this:').length, 1);
  // a port of older text re-committed later in the day: a dateless time over an hour ahead is the day before
  assert.deepEqual(judgeLine('12:52 PM: t-int-2 = engine + lead docs', at('09:57', '2026-11-13')), []);
  assert.equal(judgeLine('12:52 PM: t-int-2 = engine + lead docs', at('12:20', '2026-11-13')).length, 1);
});

test('quotes of the future fail like any stamp; another zone and plans/deadlines are not stamps', () => {
  const c = at('17:31');
  assert.equal(judgeLine('(Matt, 11-18 5:45 PM ET: "do it now")', c).length, 1);
  for (const plan of ['report by 7:30 PM', 'Link #4 ETA moves from ~9:30 PM to ~11:30 PM', 'box 8:30 PM', 'target 6:45 PM', 'cutoff 11:30 PM ET',
    'Nightly cutoff 11:30 PM ET', 'if a slot frees before 8:30 PM ET', 'stop by 11:15 PM', 'final ~7:15 PM', 'report 8:40 PM', 'starts 9:00 PM',
    'build 06:36 UTC', 'call at 6:00 PM PT', 'first typed 5:40 PM', 'Re-armed #16 for 6:19 PM.', 'target merge ~10-10:30 PM',
    'BOX: final hash to the lead by 6:30 PM ET', '8:00 PM checkpoint', 'until the Wed 11-18 9:00 PM ET reset', 'INT-12 box -> 9:00 PM',
    'INT-10d told to target link #4 at 6:30 PM; BUILD', 'reset Wed 11-18 9:00 PM ET. Mon/Tue: lean', 'week resets Wed 11-18 9:00 PM ET;'])
    assert.deepEqual(judgeLine(plan, c), [], plan);
  // a plan word earlier in the clause does not hide a stamp after a clause break (found on the lead branch, 11-18)
  for (const stamp of ["- 11-18 5:30 PM ET (lead, by date): MATT 5:45 PM: 'plan ahead'", 'a check that only passes here is no check (D83, 11-18 5:45 PM ET):',
    "the lead's priority-\"next\" messages (5:40-5:45 PM) sat unread", 'MATT 11:4x PM: fix tonight; 5:45 PM: change it', 'sent to integration (11-18 5:45 PM).',
    'MATT MERGED PR #72 at 5:45 PM', 'Matt APPROVED it 5:45 PM, pushback included', '- DECIDED by Matt 11-18 5:45 PM ET ("A"): test link A',
    "## REDO from the lead's 5:45 PM ET quality check (NOT done)", 't-ruler from t-nodes@1829470f, 8:51-5:45 PM ET 11-18. HELD'])
    assert.equal(judgeLine(stamp, c).length, 1, stamp);
});

test('a line only moved or re-indented is not judged again; a stamp corrected later is judged against the later commit and clears', () => {
  const r = repo();
  const bad = '- 11-18 5:30 PM ET (lead): this line was written ahead of its clock long ago';
  // written (ahead) BEFORE the range, then moved to the bottom of the file and re-indented inside the range
  const base = r.commit('17:00', { 'reference/STATE.md': `${bad}\n${FILLER}\n` });
  r.commit('17:10', { 'reference/STATE.md': `${FILLER}\n  ${bad}\n` });
  assert.deepEqual(run({ repo: r.dir, range: `${base}..HEAD` }).breaches, [], 'moved within the file');
  // moved to another judged file in one commit
  r.commit('17:12', { 'reference/STATE.md': `${FILLER}\n`, 'reference/LESSONS.md': `${FILLER}\n  ${bad}\n` });
  assert.deepEqual(run({ repo: r.dir, range: `${base}..HEAD` }).breaches, [], 'moved to another file');
  // added ahead in range, then corrected in place by a later commit (history not rewritten): clears
  r.commit('17:31', { 'reference/STATE.md': `${FILLER}\n- 11-18 5:42 PM ET (lead): typed ahead\n` });
  assert.equal(run({ repo: r.dir, range: `${base}..HEAD` }).breaches.length, 1);
  r.commit('17:38', { 'reference/STATE.md': `${FILLER}\n- 11-18 5:31 PM ET (lead; first typed 5:42 PM): typed ahead\n` });
  assert.deepEqual(run({ repo: r.dir, range: `${base}..HEAD` }).breaches, []);
});

test('only the judged files are read: packets, handoffs, qa REPORT.md, STATE, LESSONS; nothing else', () => {
  const r = repo();
  const base = r.commit('17:00', { 'README.md': 'x\n' });
  const ahead = '# X. Written 5:40 PM ET 11-18.\n';
  r.commit('17:31', {
    'reference/packets/2026-11-19/X.md': ahead, 'reference/handoffs/lead.md': ahead, 'reference/qa-reports/X/REPORT.md': ahead,
    'reference/qa-reports/X/notes.md': ahead, 'reference/STATUS.md': ahead, 'src/x.md': ahead,
  });
  const files = run({ repo: r.dir, range: `${base}..HEAD` }).breaches.map((b) => b.file).sort();
  assert.deepEqual(files, ['reference/handoffs/lead.md', 'reference/packets/2026-11-19/X.md', 'reference/qa-reports/X/REPORT.md']);
});

test('the default range is the merge base with main; --since judges by ET day; bad arguments exit 2', () => {
  const r = repo();
  r.commit('12:00', { 'reference/STATE.md': '- 11-18 12:30 PM ET: ahead, but already on main\n' });
  r.git(['checkout', '-q', '-b', 'work']);
  r.commit('17:31', { 'reference/STATE.md': '- 11-18 12:30 PM ET: ahead, but already on main\n- 11-18 5:50 PM ET: ahead on the branch\n' });
  const d = run({ repo: r.dir });
  assert.deepEqual(d.breaches.map((b) => b.n), [2], 'main\'s own line is not this branch\'s');
  assert.deepEqual(run({ repo: r.dir, since: '2026-11-18' }).breaches.map((b) => b.n), [1, 2]);
  assert.deepEqual(run({ repo: r.dir, since: '2026-11-19' }).breaches, []);
  assert.equal(spawnSync('node', [TOOL, '--repo', r.dir, '--bogus'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync('node', [TOOL, '--repo', r.dir, '--since', '11-18'], { encoding: 'utf8' }).status, 2);
});

test('the ET clock: November is UTC-5, July UTC-4', () => {
  assert.equal(new Date(etToMs(2026, 11, 18, 17, 31)).toISOString(), '2026-11-18T22:31:00.000Z');
  assert.equal(new Date(etToMs(2026, 7, 4, 12, 0)).toISOString(), '2026-07-04T16:00:00.000Z');
});
