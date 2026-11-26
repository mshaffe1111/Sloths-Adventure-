// The '&' gate's own tests (R-165.469): every refused form the 11-26 slips used, hand-picked allowed edge cases, and a real corpus
// (every workflow `run:` command, every command span in reference/methods/*.md and CLAUDE.md) that must pass with no refusal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findAmp, REASON } from './ampgate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const HOOK = path.join(HERE, 'ampgate.mjs');

const REFUSED = [
  'npx tsx tools/engine/paintcheck.ts > log 2>&1 & wait',
  'cmd > log 2>&1 & wait',
  'a & b & wait',
  'nohup x &',
  'nohup node tools/perf/drawcheck.mjs > /tmp/d.log 2>&1 &',
  '(x) &',
  '(cd tools && node x.mjs) &',
  'for s in 1 2 3; do npx tsx tools/engine/paintcheck.ts --part $s/3 & done; wait',
  'for s in 1 2 3; do x & done; wait',
  'npx vite --port=4301 &',
  'x &\necho next',
  'echo "a&b" & wait',
  "echo 'q' && sleep 5 &",
  'curl http://h/x?a=1&b=2',
  'x & # background it',
  'y=$(sleep 3 &)',
  '{ x; y; } &',
];

const ALLOWED = [
  'a && b',
  'cd /x && npx tsc --noEmit -p . && echo ok',
  'node x.mjs 2>&1 | tail -5',
  'node x.mjs >&2',
  'node x.mjs &> log',
  'node x.mjs &>> log',
  'node x.mjs |& tail',
  'exec 3<&0',
  'exec 3>&-',
  "echo 'a & b'",
  'echo "a & b"',
  "curl 'http://h/x?a=1&b=2'",
  'curl "http://h/x?autostart=1&level=1-1&layout=1"',
  "echo $'a & b'",
  'echo a\\&b',
  'echo $((a & b))',
  '((x = a & 3)); echo $x',
  'echo ${v//&/and}',
  'echo "$(printf \'%s\' "a & b")"',
  'cat <<EOF\nrun this & that\nEOF\necho done',
  "cat <<'EOF' > f.txt\nx & y\nEOF",
  'cat <<-END\n\tx & y\n\tEND',
  'python3 - <<"PY"\nprint("a" if 1 & 1 else "b")\nPY',
  'grep -c x f # a & b in a comment',
  'case $x in a) echo 1;& b) echo 2;;& *) echo 3;; esac',
  'git log --format="%h %s" -3 | cat',
  'sed -n \'s/&/and/gp\' f',
  'awk \'$1 && $2 { print }\' f',
  'TZ=America/New_York date "+%-I:%M %p ET"',
  '',
];

test('refuses every background form the slips used', () => {
  for (const c of REFUSED) assert.ok(findAmp(c) >= 0, `not refused: ${JSON.stringify(c)}`);
});

test('allows &&, redirections, quotes, heredocs, comments, escapes and arithmetic', () => {
  for (const c of ALLOWED) assert.equal(findAmp(c), -1, `refused: ${JSON.stringify(c)}`);
  assert.ok(ALLOWED.length >= 30);
});

/** every command the repo itself tells members or CI to run */
function corpus() {
  const out = [];
  const wf = path.join(ROOT, '.github/workflows');
  for (const f of readdirSync(wf).filter((n) => /\.ya?ml$/.test(n))) {
    const lines = readFileSync(path.join(wf, f), 'utf8').split('\n');
    for (let k = 0; k < lines.length; k++) {
      const m = /^(\s*)(?:- )?run:\s*(.*)$/.exec(lines[k]);
      if (!m) continue;
      if (m[2] !== '|' && m[2] !== '>') { out.push(m[2]); continue; }
      const block = []; // a `run: |` block: its indented lines
      while (k + 1 < lines.length && (lines[k + 1].trim() === '' || lines[k + 1].search(/\S/) > m[1].length)) block.push(lines[++k].trim());
      out.push(block.join('\n').trim());
    }
  }
  const md = [path.join(ROOT, 'CLAUDE.md'), ...readdirSync(path.join(ROOT, 'reference/methods')).filter((n) => n.endsWith('.md')).map((n) => path.join(ROOT, 'reference/methods', n))];
  const cmdStart = /^(?:[A-Z_]+=\S+ )*(?:npx|node|npm|git|python3|cd|bash|sh|curl|grep|sed|cat|ls|TZ=|for|date)\b/;
  for (const f of md) {
    const text = readFileSync(f, 'utf8');
    for (const fence of text.matchAll(/```(?:bash|sh|shell)?\n([\s\S]*?)```/g)) if (cmdStart.test(fence[1].trim())) out.push(fence[1].trim());
    for (const span of text.replace(/```[\s\S]*?```/g, '').matchAll(/`([^`\n]+)`/g)) if (cmdStart.test(span[1])) out.push(span[1]);
  }
  return [...new Set(out.filter(Boolean))];
}

test("no refusal on the repo's own commands (workflows, methods, CLAUDE.md)", () => {
  const all = corpus();
  assert.ok(all.length >= 100, `corpus too small: ${all.length}`);
  assert.deepEqual(all.filter((c) => findAmp(c) >= 0), []);
});

const hook = (command) => spawnSync(process.execPath, [HOOK], { input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }), encoding: 'utf8' });

test('the hook refuses with exit 2 and the one-line reason, and allows with exit 0', () => {
  const no = hook('npx tsx x.ts > log 2>&1 & wait');
  assert.equal(no.status, 2);
  assert.ok(no.stderr.includes(REASON));
  assert.equal(no.stderr.trim().split('\n').length, 1);
  const yes = hook('npx tsc --noEmit -p . && node x.mjs 2>&1 | tail -3');
  assert.equal(yes.status, 0);
  assert.equal(yes.stderr, '');
  assert.equal(spawnSync(process.execPath, [HOOK], { input: 'not json', encoding: 'utf8' }).status, 0, 'unreadable input is allowed');
});

test('it is wired as a PreToolUse hook on Bash in .claude/settings.json', () => {
  const pre = JSON.parse(readFileSync(path.join(ROOT, '.claude/settings.json'), 'utf8')).hooks.PreToolUse;
  assert.ok(pre.some((h) => h.matcher === 'Bash' && h.hooks.some((x) => x.command.includes('tools/session/ampgate.mjs'))));
});
