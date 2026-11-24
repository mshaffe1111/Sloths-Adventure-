// The shell '&' guard's planted cases (R-165.418): a bare '&' that backgrounds a job is refused; '&&', redirections, '|&', quoted and
// heredoc '&' are allowed; anything the guard cannot parse is allowed (fails open). Remove the refusal in bgguard.mjs and this goes RED.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
// @ts-ignore: a plain .mjs module
import { judge } from './bgguard.mjs';

const REFUSED = [
  'npx tsx tools/engine/seedlist.ts 1-1 --check &',
  'node tools/perf/drawcheck.mjs > out.log 2>&1 &',
  'sleep 5 & echo started',
  'node a.mjs & node b.mjs; wait',
  'cd /tmp && (node probe.mjs &)',
  'echo "a & b" && node long.mjs &',
  'for f in *.ts; do npx tsx $f & done',
  'node x.mjs&\necho next',
];
const ALLOWED = [
  'git fetch origin main && git log -1',
  'node tools/perf/artcheck.mjs 2>&1 | tail -5',
  'echo oops >&2',
  'node build.mjs &> build.log',
  'node build.mjs &>> build.log',
  'make |& tee make.log',
  "curl -s 'https://example.com/api?a=1&b=2'",
  'printf "a & b\\n"',
  "sed 's/x/&&y/; s/z/&/' file.txt",
  'cat <<EOF > notes.txt\nrun a & b in the body\nEOF\necho done',
  "cat <<'END'\nx &\nEND",
  'echo $(( 6 & 3 ))',
  'exec 3<&0',
  'echo hi # a comment with a & in it',
  'echo a \\& b',
  'case $x in a) echo a ;& b) echo b ;; esac',
];

test('a bare background & is refused, naming run_in_background', () => {
  assert.ok(REFUSED.length >= 6);
  for (const c of REFUSED) {
    const r = judge(c);
    assert.equal(r.ok, false, `should refuse: ${c}`);
    assert.match(r.why, /run_in_background/);
  }
});

test('&&, redirections, |&, quoted, heredoc, arithmetic and comment & are allowed', () => {
  assert.ok(ALLOWED.length >= 10);
  for (const c of ALLOWED) assert.equal(judge(c).ok, true, `should allow: ${c} (${judge(c).why})`);
});

test('fails open on what it cannot parse', () => {
  for (const c of ['echo "unclosed &', "echo 'unclosed &", undefined, 'echo $(( 1 &']) {
    const r = judge(c);
    assert.equal(r.ok, true);
    assert.ok(r.unparsed, `should say why it skipped: ${c}`);
  }
});

test('as a hook: denies by JSON on stdout, exits 0, and fails open on bad input', () => {
  const hook = path.join(path.dirname(fileURLToPath(import.meta.url)), 'bgguard.mjs');
  const run = (input: string) => spawnSync(process.execPath, [hook], { input, encoding: 'utf8' });
  const deny = run(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'node long.mjs &' } }));
  assert.equal(deny.status, 0);
  assert.equal(JSON.parse(deny.stdout).hookSpecificOutput.permissionDecision, 'deny');
  const allow = run(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'a && b 2>&1' } }));
  assert.equal(allow.status, 0);
  assert.equal(allow.stdout, '');
  const broken = run('not json');
  assert.equal(broken.status, 0);
  assert.equal(broken.stdout, '');
  assert.match(broken.stderr, /allowed without a check/);
});
