import type { Register } from 'claude-code'

// Matt, 2026-11-11: save tokens. Any tool result over CAP characters is cut to its head and tail; the full text is written to a
// scratch file whose path the model sees, so nothing is lost and it can be read in part on purpose.
const CAP = 8000
const HEAD = 2500
const TAIL = 1500
const DIR = '/tmp/output-trim'
// tools whose whole answer is the point, or that carry pictures: never trimmed
const KEEP = new Set(['Read', 'Edit', 'Write', 'ReadNotifications', 'Skill', 'SendUserFile', 'ToolSearch', 'AskUserQuestion', 'WebFetch', 'WebSearch', 'Agent', 'SendMessage'])

const cut = (s: string, path: string) =>
  `${s.slice(0, HEAD)}\n\n... [output-trim: ${s.length - HEAD - TAIL} of ${s.length} characters left out; the full text is in ${path}] ...\n\n${s.slice(-TAIL)}`

export const register: Register = on => {
  on('tool.call', async ($, e, next) => {
    const r = await next(e)
    if (KEEP.has(e.tool) || r.deny !== undefined || r.isError === true) return r
    const text = r.text
    if (typeof text !== 'string' || text.length <= CAP) return r
    const path = `${DIR}/${Date.now()}-${e.tool.replace(/[^A-Za-z0-9_-]/g, '_')}.txt`
    try {
      await $.fs.write(path, text)
    } catch {
      return r // could not save it: keep the whole result rather than lose it
    }
    if (e.tool === 'Bash' && r.result) {
      const res = r.result as { stdout: string; stderr: string }
      return { result: { ...r.result, stdout: cut(res.stdout ?? '', path), stderr: (res.stderr ?? '').length > 2000 ? cut(res.stderr, path) : res.stderr } }
    }
    return { deny: cut(text, path) }
  })
}
