#!/usr/bin/env node
// The lead's guard (R-165.532, R-165.547; CI #99, CI #102): two misses the lead repeated under load, now refused by the harness
// instead of remembered (Matt 11-27 11:50 AM ET: "Fix + fresh lead at 3 PM").
// 1. Bash (PreToolUse): a command that holds BOTH a heredoc ('<<') and 'git commit' is refused (D119: a multi-line edit goes in its
//    own call; the commit call is one line starting 'set -o pipefail;').
// 2. archive_session (PreToolUse): refused unless a get_session of the SAME session within the last 15 minutes showed it IDLE with
//    no run named in its summaries (CI #102: BUILD-29-g on 11-26 and BUILD-29-j on 11-27 were archived mid-run).
//    get_session (PostToolUse) records that look.
// `node tools/team/leadguard.mjs --self-test` runs the planted cases.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const DIR = join(process.env.LEADGUARD_DIR ?? tmpdir(), 'sloths-leadguard');
const FRESH_MS = 15 * 60 * 1000;
// words in a session's task_summary / status_detail that mean something is still running there
const RUN_WORDS = /\b(running|re-running|after|waiting on|in flight|gating|still)\b/i;
const NOT_RUN = /\b(nothing|not|no longer|none)\s+(is\s+|are\s+)?(running|re-running|in flight|gating|still running)\b/gi;

export function judgeBash(cmd) {
  if (/<</.test(cmd) && /\bgit\s+commit\b/.test(cmd)) {
    return { ok: false, why: 'Lead guard (D119, CI #99): this call holds a heredoc AND git commit. Write the multi-line edit in its OWN call (Write, or a scratch script), then commit in a one-line call starting `set -o pipefail;` gated on roadmapcheck.' };
  }
  return { ok: true };
}

// read the look out of a get_session result, whatever wrapping the harness gives it
export function lookFrom(resp) {
  const s = typeof resp === 'string' ? resp : JSON.stringify(resp ?? '');
  const q = '\\\\?"'; // a quote, escaped or not
  const id = s.match(new RegExp(`${q}id${q}\\s*:\\s*${q}(session_[A-Za-z0-9]+)`));
  const st = s.match(new RegExp(`session_status${q}\\s*:\\s*${q}(SESSION_STATUS_[A-Z_]+)`));
  const sums = [...s.matchAll(new RegExp(`(?:task_summary|status_detail)${q}\\s*:\\s*${q}([^"\\\\]*)`, 'g'))].map((m) => m[1]);
  if (!id || !st) return null;
  // a negated run ('nothing running', 'not running', 'no longer gating') says the opposite: drop it before the word check
  const idle = st[1] === 'SESSION_STATUS_IDLE' && !sums.some((t) => RUN_WORDS.test(t.replace(NOT_RUN, '')));
  return { id: id[1], status: st[1], sums, idle };
}

export function recordLook(look, now = Date.now()) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(join(DIR, `${look.id}.json`), JSON.stringify({ ...look, at: now }));
}

export function judgeArchive(id, now = Date.now()) {
  const f = join(DIR, `${id}.json`);
  if (!id || !existsSync(f)) return { ok: false, why: `Lead guard (CI #102): no get_session look at ${id} yet. Call get_session on it first; archive only if it is IDLE with no run named in its summaries.` };
  const l = JSON.parse(readFileSync(f, 'utf8'));
  if (now - l.at > FRESH_MS) return { ok: false, why: `Lead guard (CI #102): the last look at ${id} is over 15 minutes old. Look again with get_session.` };
  if (!l.idle) return { ok: false, why: `Lead guard (CI #102): ${id} was ${l.status}${l.sums.length ? ` ("${l.sums.join('" / "')}")` : ''} at the last look: something may still run there. Leave it and archive at the next check-in.` };
  return { ok: true };
}

const deny = (why) => process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: why } }));

if (process.argv[2] === '--self-test') {
  process.env.LEADGUARD_DIR ??= join(tmpdir(), 'leadguard-selftest');
  let bad = 0;
  const t = (name, got, want) => { if (got !== want) { bad++; console.log('FAIL', name, got, 'want', want); } };
  t('heredoc + commit refused', judgeBash("cat >> a <<'EOF'\nx\nEOF\ngit add a && git commit -m x").ok, false);
  t('heredoc alone allowed', judgeBash("cat > a <<'EOF'\nx\nEOF").ok, true);
  t('one-line commit allowed', judgeBash('set -o pipefail; git add -A && git commit -q -m "x"').ok, true);
  const idle = { ccr: { id: 'session_AAA111', session_status: 'SESSION_STATUS_IDLE', post_turn_summary: { status_detail: 'box done; report written' } } };
  const busy = { ccr: { id: 'session_BBB222', session_status: 'SESSION_STATUS_IDLE', post_turn_summary: { status_detail: 'drawcheck run on stage 1 of 22; commit after ~6 min' } } };
  const run = { ccr: { id: 'session_CCC333', session_status: 'SESSION_STATUS_RUNNING' } };
  const quiet = { ccr: { id: 'session_FFF666', session_status: 'SESSION_STATUS_IDLE', post_turn_summary: { status_detail: 'handed over; branch pushed, nothing running' } } };
  const wrapped = { content: [{ type: 'text', text: `<other-session nonce="x">${JSON.stringify(idle).replace('AAA111', 'DDD444')}</other-session>` }] };
  for (const r of [idle, busy, run, wrapped, quiet]) { const l = lookFrom(r); if (l) recordLook(l); else { bad++; console.log('FAIL no look', JSON.stringify(r).slice(0, 80)); } }
  t('idle archive allowed', judgeArchive('session_AAA111').ok, true);
  t('a named run refused', judgeArchive('session_BBB222').ok, false);
  t('a RUNNING session refused', judgeArchive('session_CCC333').ok, false);
  t('a wrapped idle look allowed', judgeArchive('session_DDD444').ok, true);
  t("'nothing running' allowed", judgeArchive('session_FFF666').ok, true);
  t('no look refused', judgeArchive('session_EEE555').ok, false);
  t('a stale look refused', judgeArchive('session_AAA111', Date.now() + FRESH_MS + 1000).ok, false);
  console.log(bad ? `${bad} FAIL` : 'PASS 10/10'); process.exit(bad ? 1 : 0);
} else {
  let raw = ''; for await (const ch of process.stdin) raw += ch;
  const ev = JSON.parse(raw || '{}');
  const tool = ev.tool_name ?? '';
  if (ev.hook_event_name === 'PostToolUse' && /get_session$/.test(tool)) {
    const l = lookFrom(ev.tool_response);
    if (l) recordLook(l);
  } else if (tool === 'Bash') {
    const r = judgeBash(ev.tool_input?.command ?? '');
    if (!r.ok) deny(r.why);
  } else if (/archive_session$/.test(tool)) {
    const r = judgeArchive(ev.tool_input?.session_id);
    if (!r.ok) deny(r.why);
  }
  process.exit(0);
}
