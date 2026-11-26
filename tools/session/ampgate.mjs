#!/usr/bin/env node
// The '&' gate (R-165.469, CI #88): a PreToolUse hook on Bash. A shell '&' backgrounds a job that dies when the Bash call ends,
// or races the next step; members kept doing it though every brief said NEVER, so this is a hook, not a sentence.
// It refuses (exit 2, one line on stderr) a command holding a lone '&' that ends a command or joins two. It allows '&&',
// redirections (2>&1, >&2, <&3, &>, &>>, |&), case's ;& and ;;&, '&' inside quotes ('', "", $''), a heredoc body, a comment,
// ${...} expansions and arithmetic ($((a & b)), ((a & b))), and an escaped \&. When unsure (odd or unparsable input) it allows:
// a false refusal blocks real work. Tests: tools/session/ampgate.test.mjs (CI: gates.yml, the tools' tests line).
import { pathToFileURL } from 'node:url';

export const REASON = "a shell '&' backgrounds a job that dies with this call: use the Bash tool's run_in_background (and timeout) instead";

/** the index of the first background '&' in a bash command, or -1 (none, or the command could not be read) */
export function findAmp(cmd) {
  try { return scan(String(cmd ?? '')); } catch { return -1; }
}

function scan(s) {
  const n = s.length;
  const heredocs = []; // delimiters waiting for the end of the current line: { word, strip }
  let i = 0;
  let wordStart = true; // at the start of a word (a '#' here opens a comment)
  const isBlank = (c) => c === ' ' || c === '\t';

  // skips a region that ends at the matching close, counting nested opens; returns the index after the close, or n (unterminated)
  const skipNested = (from, open, close) => {
    let depth = 1, j = from;
    while (j < n && depth > 0) {
      const c = s[j];
      if (c === '\\') { j += 2; continue; }
      if (c === "'") { const k = s.indexOf("'", j + 1); if (k < 0) return n; j = k + 1; continue; }
      if (c === '"') { j = skipDouble(j + 1); continue; }
      if (s.startsWith(open, j)) { depth++; j += open.length; continue; }
      if (s.startsWith(close, j)) { depth--; j += close.length; continue; }
      j++;
    }
    return j;
  };
  // from just after an opening ", returns the index after the closing "
  const skipDouble = (from) => {
    let j = from;
    while (j < n) {
      const c = s[j];
      if (c === '\\') { j += 2; continue; }
      if (c === '"') return j + 1;
      if (c === '$' && s[j + 1] === '(') { j = skipNested(j + 2, '(', ')'); continue; } // "$(... "a & b" ...)": all quoted
      j++;
    }
    return n;
  };

  while (i < n) {
    const c = s[i];
    if (c === '\n') {
      i++;
      // heredoc bodies start on the next line: skip each up to its delimiter line
      while (heredocs.length) {
        const { word, strip } = heredocs.shift();
        for (;;) {
          if (i >= n) return -1;
          let e = s.indexOf('\n', i); if (e < 0) e = n;
          let line = s.slice(i, e);
          if (strip) line = line.replace(/^\t+/, '');
          i = e + 1;
          if (line === word) break;
        }
      }
      wordStart = true;
      continue;
    }
    if (c === '\\') { i += 2; wordStart = false; continue; }
    if (c === "'") { const k = s.indexOf("'", i + 1); if (k < 0) return -1; i = k + 1; wordStart = false; continue; }
    if (c === '"') { i = skipDouble(i + 1); wordStart = false; continue; }
    if (c === '$' && s[i + 1] === "'") { // $'...' (ANSI-C: \' escapes)
      let j = i + 2;
      while (j < n && s[j] !== "'") j += s[j] === '\\' ? 2 : 1;
      i = j + 1; wordStart = false; continue;
    }
    if (c === '$' && s.startsWith('((', i + 1)) { i = skipNested(i + 3, '((', '))'); wordStart = false; continue; }
    if (c === '$' && s[i + 1] === '{') { i = skipNested(i + 2, '{', '}'); wordStart = false; continue; }
    if (c === '(' && s[i + 1] === '(' && wordStart) { i = skipNested(i + 2, '((', '))'); wordStart = false; continue; }
    if (c === '#' && wordStart) { const e = s.indexOf('\n', i); i = e < 0 ? n : e; continue; }
    if (c === '<' && s[i + 1] === '<' && s[i + 2] !== '<') { // heredoc: <<WORD, <<-WORD, <<'WORD', <<"WORD"
      let j = i + 2;
      const strip = s[j] === '-'; if (strip) j++;
      while (j < n && isBlank(s[j])) j++;
      let word = '';
      while (j < n && !/[\s;&|<>()]/.test(s[j])) {
        const q = s[j];
        if (q === "'" || q === '"') { const k = s.indexOf(q, j + 1); if (k < 0) return -1; word += s.slice(j + 1, k); j = k + 1; }
        else if (q === '\\') { word += s[j + 1] ?? ''; j += 2; }
        else { word += q; j++; }
      }
      if (word) heredocs.push({ word, strip });
      i = j; wordStart = false; continue;
    }
    if (c === '&') {
      const prev = s[i - 1], next = s[i + 1];
      if (next === '&') { i += 2; wordStart = true; continue; } // &&
      if (next === '>') { i += s[i + 2] === '>' ? 3 : 2; wordStart = true; continue; } // &> and &>>
      if (prev === '>' || prev === '<' || prev === '|' || prev === ';') { i++; wordStart = true; continue; } // >&2 2>&1 <&3 |& ;& ;;&
      return i;
    }
    wordStart = isBlank(c) || c === ';' || c === '|' || c === '(' || c === ')' || c === '{' || c === '}' || c === '`';
    i++;
  }
  return -1;
}

// the hook: read the Bash call from stdin; refuse a background '&' (exit 2, the reason on stderr), allow everything else
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let raw = ''; for await (const ch of process.stdin) raw += ch;
  let cmd = '';
  try { cmd = JSON.parse(raw || '{}').tool_input?.command ?? ''; } catch { process.exit(0); }
  const at = findAmp(cmd);
  if (at >= 0) {
    const near = cmd.slice(Math.max(0, at - 30), at + 10).replace(/\s+/g, ' ');
    process.stderr.write(`'&' gate (tools/session/ampgate.mjs, R-165.469): ${REASON} (near: ${near})\n`);
    process.exit(2);
  }
  process.exit(0);
}
