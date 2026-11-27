#!/usr/bin/env node
// The lead's guard (R-165.532, R-165.547; CI #99, #102, #108, #109): the lead's repeat misses, refused by the harness instead of
// remembered (Matt 11-27 11:50 AM ET: "Fix + fresh lead at 3 PM"). It acts ONLY in the lead's container: the lead runs
// `touch ~/.sloths-lead` at its start (LEAD-PERSONA.md start step 1); members' fresh containers never have that file, so a member's
// own commits and sessions are never touched (cold review 11-27, item 5).
// 1. Bash (PreToolUse): a `git commit` anywhere in the command is refused unless the command runs tools/team/leadcommit.sh (the one
//    gated commit path, CI #109); a heredoc next to a commit is refused by the same rule (D119).
// 2. archive_session (PreToolUse): refused unless a get_session of the SAME session within the last 15 minutes showed it IDLE, its
//    status_bucket not WORKING (an IDLE session can still hold a background job: the bucket says WORKING then), and no run named in
//    its summaries unless the bucket is COMPLETED (CI #102). get_session (PostToolUse) records that look.
// 3. create_session (PreToolUse): refused when the prompt is not the brief itself: under 600 characters, a 'PASTE-FILE' pointer, or a
//    path into a session's /tmp/claude-0 scratch space, which another container cannot read (CI #108).
// `node tools/team/leadguard.mjs --self-test` runs the planted cases.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir, homedir } from 'node:os';

const DIR = join(process.env.LEADGUARD_DIR ?? tmpdir(), 'sloths-leadguard');
const MARK = process.env.LEADGUARD_MARK ?? join(homedir(), '.sloths-lead');
const FRESH_MS = 15 * 60 * 1000;
// words in a session's task_summary / status_detail that mean something is still running there
const RUN_WORDS = /\b(running|re-running|after|waiting on|in flight|gating|still)\b/i;
const NOT_RUN = /\b(nothing|not|no longer|none)\s+(is\s+|are\s+)?(running|re-running|in flight|gating|still running)\b/gi;

export function judgeCreate(prompt) {
  const p = String(prompt ?? '');
  const why = p.length < 600 ? `is ${p.length} characters` : /PASTE-FILE/i.test(p) ? 'points at a file' : /\/tmp\/claude-0\//.test(p) ? "names a /tmp/claude-0 path (a session's scratch space)" : '';
  if (why) return { ok: false, why: `Lead guard (CI #108): this create_session prompt ${why}. A member cannot read another container: put the WHOLE brief in the prompt.` };
  return { ok: true };
}

export function judgeBash(cmd) {
  if (/\bgit\b(\s+-C\s+\S+)?(\s+-c\s+\S+)*\s+commit\b/.test(cmd) && !/tools\/team\/leadcommit\.sh/.test(cmd)) {
    return { ok: false, why: 'Lead guard (CI #109, D119): the lead commits ONLY with `bash tools/team/leadcommit.sh "<subject>" <paths>` (roadmapcheck judged by its exit code, only the named paths, pushed to your branch). Write any multi-line edit in its own call first.' };
  }
  return { ok: true };
}

// read the look out of a get_session result, whatever wrapping the harness gives it
export function lookFrom(resp) {
  const s = typeof resp === 'string' ? resp : JSON.stringify(resp ?? '');
  const q = '\\\\?"'; // a quote, escaped or not
  const id = s.match(new RegExp(`${q}id${q}\\s*:\\s*${q}(session_[A-Za-z0-9]+)`));
  const st = s.match(new RegExp(`session_status${q}\\s*:\\s*${q}(SESSION_STATUS_[A-Z_]+)`));
  const bk = s.match(new RegExp(`status_bucket${q}\\s*:\\s*${q}(SESSION_STATUS_BUCKET_[A-Z_]+)`));
  const sums = [...s.matchAll(new RegExp(`(?:task_summary|status_detail)${q}\\s*:\\s*${q}([^"\\\\]*)`, 'g'))].map((m) => m[1]);
  if (!id || !st) return null;
  const bucket = bk ? bk[1] : 'SESSION_STATUS_BUCKET_UNKNOWN';
  const named = sums.some((t) => RUN_WORDS.test(t.replace(NOT_RUN, '')));
  const idle = st[1] === 'SESSION_STATUS_IDLE' && bucket !== 'SESSION_STATUS_BUCKET_WORKING' && (bucket === 'SESSION_STATUS_BUCKET_COMPLETED' || !named);
  return { id: id[1], status: st[1], bucket, sums, idle };
}

export function recordLook(look, now = Date.now()) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(join(DIR, `${look.id}.json`), JSON.stringify({ ...look, at: now }));
}

export function judgeArchive(id, now = Date.now()) {
  const f = join(DIR, `${id}.json`);
  if (!id || !existsSync(f)) return { ok: false, why: `Lead guard (CI #102): no get_session look at ${id} yet. Call get_session on it first; archive only if it is IDLE, not in the WORKING bucket, with no run named in its summaries.` };
  const l = JSON.parse(readFileSync(f, 'utf8'));
  if (now - l.at > FRESH_MS) return { ok: false, why: `Lead guard (CI #102): the last look at ${id} is over 15 minutes old. Look again with get_session.` };
  if (!l.idle) return { ok: false, why: `Lead guard (CI #102): ${id} was ${l.status} / ${l.bucket}${l.sums.length ? ` ("${l.sums.join('" / "')}")` : ''} at the last look: something may still run there. Ask it, or archive at the next check-in.` };
  return { ok: true };
}

const deny = (why) => process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: why } }));

if (process.argv[2] === '--self-test') {
  process.env.LEADGUARD_DIR ??= join(tmpdir(), 'leadguard-selftest');
  let bad = 0, n = 0;
  const t = (name, got, want) => { n++; if (got !== want) { bad++; console.log('FAIL', name, got, 'want', want); } };
  t('a pointer prompt refused', judgeCreate('Read your brief.\n\nPASTE-FILE: kitf-prompt.txt').ok, false);
  t('a scratch path refused', judgeCreate('x'.repeat(700) + ' read /tmp/claude-0/abc/scratchpad/brief.txt').ok, false);
  t('a whole brief allowed', judgeCreate('x'.repeat(2000)).ok, true);
  t('heredoc + commit refused', judgeBash("cat >> a <<'EOF'\nx\nEOF\ngit add a && git commit -m x").ok, false);
  t('heredoc alone allowed', judgeBash("cat > a <<'EOF'\nx\nEOF").ok, true);
  t('the old pipefail one-liner refused', judgeBash('set -o pipefail; node tools/roadmapcheck.mjs | grep -q "^FAIL" && echo F || (git add -A && git commit -q -m "x")').ok, false);
  t('a plain git commit refused', judgeBash('git commit -m x').ok, false);
  t('git -C . commit refused', judgeBash('git -C . commit -m x').ok, false);
  t('leadcommit.sh allowed', judgeBash('bash tools/team/leadcommit.sh "x" reference/STATE.md').ok, true);
  t('git log allowed', judgeBash('git log --oneline -3 --grep commit').ok, true);
  const look = (id, status, bucket, detail) => ({ ccr: { id, session_status: status, status_bucket: bucket, post_turn_summary: detail ? { status_detail: detail } : undefined } });
  const cases = [
    look('session_AAA111', 'SESSION_STATUS_IDLE', 'SESSION_STATUS_BUCKET_COMPLETED', 'box done; report written'),
    look('session_BBB222', 'SESSION_STATUS_IDLE', 'SESSION_STATUS_BUCKET_REVIEW_READY', 'drawcheck run on stage 1 of 22; commit after ~6 min'),
    look('session_CCC333', 'SESSION_STATUS_RUNNING', 'SESSION_STATUS_BUCKET_WORKING'),
    look('session_FFF666', 'SESSION_STATUS_IDLE', 'SESSION_STATUS_BUCKET_COMPLETED', 'handed over; branch pushed, nothing running'),
    look('session_GGG777', 'SESSION_STATUS_IDLE', 'SESSION_STATUS_BUCKET_WORKING', 'lock gate base.json written'),
    look('session_HHH888', 'SESSION_STATUS_IDLE', 'SESSION_STATUS_BUCKET_COMPLETED', 'landed after the gates; still idle'),
  ];
  const wrapped = { content: [{ type: 'text', text: `<other-session nonce="x">${JSON.stringify(cases[0]).replace('AAA111', 'DDD444')}</other-session>` }] };
  for (const r of [...cases, wrapped]) { const l = lookFrom(r); if (l) recordLook(l); else { bad++; console.log('FAIL no look', JSON.stringify(r).slice(0, 80)); } }
  t('idle + completed allowed', judgeArchive('session_AAA111').ok, true);
  t('a named run refused', judgeArchive('session_BBB222').ok, false);
  t('a RUNNING session refused', judgeArchive('session_CCC333').ok, false);
  t('a wrapped idle look allowed', judgeArchive('session_DDD444').ok, true);
  t("'nothing running' allowed", judgeArchive('session_FFF666').ok, true);
  t('IDLE but bucket WORKING refused (a background job)', judgeArchive('session_GGG777').ok, false);
  t("completed with 'after'/'still' in its summary allowed", judgeArchive('session_HHH888').ok, true);
  t('no look refused', judgeArchive('session_EEE555').ok, false);
  t('a stale look refused', judgeArchive('session_AAA111', Date.now() + FRESH_MS + 1000).ok, false);
  console.log(bad ? `${bad} FAIL of ${n}` : `PASS ${n}/${n}`); process.exit(bad ? 1 : 0);
} else {
  let raw = ''; for await (const ch of process.stdin) raw += ch;
  if (!existsSync(MARK)) process.exit(0); // not the lead's container: a member's tools are never touched
  const ev = JSON.parse(raw || '{}');
  const tool = ev.tool_name ?? '';
  if (ev.hook_event_name === 'PostToolUse' && /get_session$/.test(tool)) {
    const l = lookFrom(ev.tool_response);
    if (l) recordLook(l);
  } else if (tool === 'Bash') {
    const r = judgeBash(ev.tool_input?.command ?? '');
    if (!r.ok) deny(r.why);
  } else if (/create_session$/.test(tool)) {
    const r = judgeCreate(ev.tool_input?.prompt);
    if (!r.ok) deny(r.why);
  } else if (/archive_session$/.test(tool)) {
    const r = judgeArchive(ev.tool_input?.session_id);
    if (!r.ok) deny(r.why);
  }
  process.exit(0);
}
