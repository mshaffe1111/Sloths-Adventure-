#!/usr/bin/env node
// The model gate (tools/team/models.json): a PreToolUse hook on create_session. It reads the new helper's role from its
// tags (sloths-team plus one role tag), looks up the role's tier, and refuses the call unless model and effort match.
// `node tools/team/modelgate.mjs --table` prints the table; `--self-test` runs the planted cases.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const T = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'models.json'), 'utf8'));

export function judge(input) {
  const tags = input.tags ?? [];
  if (!tags.includes('sloths-team')) return { ok: false, why: 'no sloths-team tag: every helper carries sloths-team plus one role tag (' + Object.keys(T.roles).join(', ') + ')' };
  const roles = tags.filter((t) => T.roles[t]);
  if (roles.length !== 1) return { ok: false, why: `need exactly one role tag, found ${roles.length ? roles.join(', ') : 'none'} (roles: ${Object.keys(T.roles).join(', ')})` };
  const tierName = T.roles[roles[0]], tier = T.tiers[tierName];
  const want = `${roles[0]} is ${tierName}: model ${tier.model}, effort ${tier.effort.join(' or ')}`;
  if (input.model !== tier.model) return { ok: false, why: `model ${input.model ?? '(none)'} is wrong; ${want}` };
  if (!input.effort) return { ok: false, why: `no effort set (Opus defaults to medium); ${want}` };
  if (T.never.effort.includes(input.effort)) return { ok: false, why: `effort ${input.effort} is never used (Matt 11-09); ${want}` };
  if (T.never.askMatt.includes(input.effort)) return { ok: false, why: `effort ${input.effort} needs Matt's yes first (one question, with the reason); ${want}` };
  if (!tier.effort.includes(input.effort)) return { ok: false, why: `effort ${input.effort} is wrong; ${want}` };
  return { ok: true, why: want };
}

const arg = process.argv[2];
if (arg === '--table') {
  for (const [n, t] of Object.entries(T.tiers)) console.log(`${n.padEnd(10)} ${t.model.padEnd(18)} ${t.effort.join('/').padEnd(11)} ${Object.keys(T.roles).filter((r) => T.roles[r] === n).join(', ')}`);
} else if (arg === '--self-test') {
  const cases = [
    [{ tags: ['sloths-team', 'engine'], model: 'claude-fable-5-2', effort: 'high' }, true],
    [{ tags: ['sloths-team', 'engine'], model: 'claude-opus-5-5', effort: 'high' }, false],
    [{ tags: ['sloths-team', 'engine'], model: 'claude-fable-5-2', effort: 'xhigh' }, false],
    [{ tags: ['sloths-team', 'engine'], model: 'claude-opus-5-5', effort: 'medium' }, false],
    [{ tags: ['sloths-team', 'critic'], model: 'claude-opus-5-5' }, false],
    [{ tags: ['sloths-team', 'art'], model: 'claude-opus-5-5', effort: 'medium' }, false],
    [{ tags: ['sloths-team', 'docs'], model: 'claude-opus-5-5', effort: 'medium' }, true],
    [{ tags: ['sloths-team', 'runner'], model: 'claude-opus-5-5', effort: 'high' }, true],
    [{ tags: ['sloths-team', 'engine'], model: 'claude-opus-5-5', effort: 'max' }, false],
    [{ tags: ['sloths-team', 'engine'], model: 'claude-opus-5-5', effort: 'low' }, false],
    [{ tags: ['engine'], model: 'claude-opus-5-5', effort: 'high' }, false],
    [{ tags: ['sloths-team', 'engine', 'critic'], model: 'claude-opus-5-5', effort: 'high' }, false],
    [{ tags: ['sloths-team', 'critic'], model: 'claude-opus-5-5', effort: 'xhigh' }, true],
    [{ tags: ['sloths-team', 'art'], model: 'claude-opus-5-5', effort: 'xhigh' }, false],
  ];
  let bad = 0;
  for (const [c, want] of cases) { const r = judge(c); if (r.ok !== want) { bad++; console.log('FAIL', JSON.stringify(c), r.why); } }
  console.log(bad ? `${bad} FAIL` : `PASS ${cases.length}/${cases.length}`); process.exit(bad ? 1 : 0);
} else {
  let raw = ''; for await (const ch of process.stdin) raw += ch;
  const ev = JSON.parse(raw || '{}');
  const r = judge(ev.tool_input ?? {});
  if (!r.ok) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `Model gate (tools/team/models.json): ${r.why}` } }));
  }
  process.exit(0);
}
