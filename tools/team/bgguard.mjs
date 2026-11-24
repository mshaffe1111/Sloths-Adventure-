/**
 * The shell '&' guard (R-165.418; LESSONS D115: a check, not a rule): a PreToolUse hook on Bash (.claude/settings.json, beside
 * modelgate.mjs). It REFUSES a command that backgrounds a job with a bare '&' outside quotes, and names run_in_background, so every
 * long run is one the harness tracks and a hand-over can see.
 *
 * Allowed: '&&', redirections ('2>&1', '>&2', '<&3', '&>file', '&>>file'), '|&', bash's case fall-through ';&' / ';;&', an escaped '\&',
 * any '&' inside single or double quotes (a URL query, printf "a & b", sed 's/x/&/'), inside $(( )) / (( )) arithmetic, after a '#'
 * comment, and in a heredoc body.
 * FAILS OPEN: anything it cannot parse (an unclosed quote, bad JSON) is ALLOWED, with the reason on stderr; a bug here must never
 * block every Bash call in every session.
 *
 *   node tools/team/bgguard.mjs            (as the hook: reads the event on stdin)
 *   judge(command) -> { ok, why }          (tools/team/bgguard.test.ts)
 */

/** Returns { ok: true } / { ok: false, why } / { ok: true, unparsed: why } (fail open). */
export function judge(cmd) {
  if (typeof cmd !== 'string') return { ok: true, unparsed: 'no command string' };
  const n = cmd.length;
  let i = 0;
  const heredocs = []; // pending heredoc delimiters, read after the next newline: { word, strip }
  let atWordStart = true;
  while (i < n) {
    const c = cmd[i];
    if (c === '\\') { i += 2; atWordStart = false; continue; }
    if (c === "'") {
      const j = cmd.indexOf("'", i + 1);
      if (j < 0) return { ok: true, unparsed: `unclosed single quote at ${i}` };
      i = j + 1; atWordStart = false; continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < n && cmd[j] !== '"') j += cmd[j] === '\\' ? 2 : 1;
      if (j >= n) return { ok: true, unparsed: `unclosed double quote at ${i}` };
      i = j + 1; atWordStart = false; continue;
    }
    if (c === '#' && atWordStart) {
      const j = cmd.indexOf('\n', i);
      i = j < 0 ? n : j; continue;
    }
    if (c === '(' && cmd[i + 1] === '(' && (i === 0 || cmd[i - 1] === '$' || atWordStart)) {
      // arithmetic: $(( a & b )) or (( a & b )): '&' is bitwise AND there
      let depth = 0, j = i;
      for (; j < n; j++) {
        if (cmd[j] === '(') depth++;
        else if (cmd[j] === ')') { depth--; if (depth === 0) break; }
      }
      if (j >= n) return { ok: true, unparsed: `unclosed (( at ${i}` };
      i = j + 1; atWordStart = false; continue;
    }
    if (c === '<' && cmd[i + 1] === '<' && cmd[i + 2] !== '<') {
      let j = i + 2;
      const strip = cmd[j] === '-';
      if (strip) j++;
      while (cmd[j] === ' ' || cmd[j] === '\t') j++;
      const m = /^(['"]?)([A-Za-z0-9_.\-]+)\1/.exec(cmd.slice(j));
      if (!m) return { ok: true, unparsed: `heredoc without a delimiter at ${i}` };
      heredocs.push({ word: m[2], strip });
      i = j + m[0].length; atWordStart = false; continue;
    }
    if (c === '\n') {
      i++;
      // skip every pending heredoc body, line by line, to its delimiter (no delimiter: the body runs to the end, as in bash)
      while (heredocs.length) {
        const { word, strip } = heredocs.shift();
        for (;;) {
          if (i >= n) { i = n; break; }
          const e = cmd.indexOf('\n', i);
          const line = cmd.slice(i, e < 0 ? n : e);
          i = e < 0 ? n : e + 1;
          if ((strip ? line.replace(/^\t+/, '') : line) === word) break;
        }
      }
      atWordStart = true; continue;
    }
    if (c === '&') {
      const prev = i > 0 ? cmd[i - 1] : '', next = cmd[i + 1] ?? '';
      if (next === '&') { i += 2; atWordStart = true; continue; } // &&
      if (next === '>') { i += 1; atWordStart = false; continue; } // &> and &>>
      if (prev === '>' || prev === '<' || prev === '|' || prev === ';') { i += 1; atWordStart = true; continue; } // 2>&1 >&2 <&3 |& ;& ;;&
      return {
        ok: false,
        why: `a bare '&' at character ${i} backgrounds a job the harness cannot track (near: ${JSON.stringify(cmd.slice(Math.max(0, i - 30), i + 10))}). ` +
          `Run it with the Bash tool's run_in_background (and a fitting timeout) instead, never a shell '&' (R-165.418).`,
      };
    }
    atWordStart = c === ' ' || c === '\t' || c === ';' || c === '|' || c === '(' || c === '{' || c === '`';
    i++;
  }
  return { ok: true };
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  let r = { ok: true };
  try {
    let raw = '';
    for await (const ch of process.stdin) raw += ch;
    const ev = JSON.parse(raw || '{}');
    r = judge(ev.tool_input?.command);
  } catch (e) {
    r = { ok: true, unparsed: `hook error: ${e && e.message}` };
  }
  if (r.unparsed) process.stderr.write(`bgguard: allowed without a check (${r.unparsed})\n`);
  if (!r.ok) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `Shell '&' guard (tools/team/bgguard.mjs): ${r.why}` } }));
  }
  process.exit(0);
}
