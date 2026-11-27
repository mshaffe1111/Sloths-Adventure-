// INT-R3 slot confirm: vite on 5181 in the frozen tree, then UI-372's shooter Normal and Easy; prints the 'gone' lines' faces.
import { spawn, spawnSync } from 'node:child_process';
const [tree, out] = process.argv.slice(2);
const vite = spawn('npx', ['vite', '--port', '5181', '--strictPort', '--host', '127.0.0.1'], { cwd: tree, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
await new Promise((res) => { vite.stdout.on('data', (d) => { if (String(d).includes('Local')) res(); }); setTimeout(res, 60000); });
let rc = 0;
for (const mode of ['', 'easy']) {
  const r = spawnSync('node', ['reference/qa-reports/UI-372/stills372.mjs', `${out}/${mode || 'normal'}`, ...(mode ? [mode] : [])], { cwd: tree, encoding: 'utf8', timeout: 900000 });
  const lines = (r.stdout + r.stderr).split('\n');
  for (const l of lines) if (/gone|ERR/.test(l)) console.log(mode || 'normal', l.slice(0, 600));
  const gone = lines.filter((l) => / gone/.test(l) && /faces/.test(l));
  const bad = gone.filter((l) => !(/duck:open/.test(l) && /capy[a-z]*:open/.test(l)));
  console.log(mode || 'normal', 'gone lines', gone.length, 'not duck+capybara open', bad.length, 'exit', r.status);
  if (r.status !== 0 || !gone.length || bad.length) rc = 1;
}
try { process.kill(-vite.pid); } catch {}
console.log('SLOT CONFIRM', rc ? 'FAIL' : 'PASS');
process.exit(rc);
