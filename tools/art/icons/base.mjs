// D23 (stale-base sheets, 2026-11-01): a shot or sheet is only evidence if it was made on a tree that holds the live game.
// requireLiveBase() fetches origin/main and refuses (exit 2) when HEAD lacks it; stampBase(page) writes the base on the page so every
// screenshot carries it; writeBase(dir) leaves BASE.txt beside the shots.
import { execFileSync } from 'child_process';
import fs from 'fs';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
export function requireLiveBase() {
  if (process.env.ICON_SHOTS_OFFLINE !== '1') {
    try { git('fetch', '-q', 'origin', 'main'); } catch (e) { console.error('could not fetch origin/main:', String(e).slice(0, 120)); process.exit(2); }
  }
  const main = git('rev-parse', '--short', 'origin/main');
  try { git('merge-base', '--is-ancestor', 'origin/main', 'HEAD'); } catch {
    console.error(`REFUSED: HEAD does not contain origin/main (${main}). Merge main first: shots on a stale base are not evidence (D23).`);
    process.exit(2);
  }
  const head = git('rev-parse', '--short', 'HEAD');
  const dirty = git('status', '--porcelain', '--untracked-files=no', 'src').length > 0;
  return { head, main, dirty, label: `base ${head}${dirty ? '+wip' : ''} (has main ${main})` };
}
export async function stampBase(page, base) {
  await page.evaluate((t) => {
    const s = document.createElement('div');
    s.textContent = t;
    s.style.cssText = 'position:fixed;left:2px;bottom:1px;z-index:2147483647;font:600 9px/1 monospace;color:#fff;background:rgba(0,0,0,.55);padding:1px 3px;pointer-events:none';
    document.body.appendChild(s);
  }, base.label);
}
export function writeBase(dir, base) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/BASE.txt`, `${base.label}\n${new Date().toISOString()}\n`);
}
