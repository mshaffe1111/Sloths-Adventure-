// layouts.ts: the platforms of the gen2 1-1 layouts the testers played, rebuilt the way the game builds them (stageGenerator.ts:2892:
// w1Finish(buildPlayStage(config, w1World(), seed, difficulty))), for report.py --profiles (the jump press measured against the lip).
// Called by report.py; reads "<seed> <easy|normal>" lines on stdin, writes {"<seed> <mode>": [[x, y, w, h, type], ...]} to stdout.
// Only valid for the seed list the runs logged (`list` in the gen2 line): report.py checks it against seedListVersion('1-1').
//   echo "3747 normal" | npx tsx tools/playtesters/layouts.ts
import fs from 'node:fs';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildPlayStage } from '../../src/game/gen2/seedList.ts';
import { w1Finish, w1World } from '../../src/game/gen2/worlds/w1.ts';
import { seedListVersion } from '../../src/game/testRound.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const want = fs.readFileSync(0, 'utf8').split('\n').map((s: string) => s.trim()).filter(Boolean);
const out: Record<string, unknown> = { _list: seedListVersion('1-1') };
for (const line of want) {
  const [seed, mode] = line.split(/\s+/);
  try {
    const st = w1Finish(buildPlayStage(cfg, w1World(), Number(seed), mode === 'easy' ? 'easy' : 'normal'));
    out[line] = st.platforms.map((p) => [Math.round(p.x), Math.round(p.y), Math.round(p.width), Math.round(p.height), p.type]);
  } catch (e) {
    out[line] = { error: String((e as Error).message).slice(0, 120) };
  }
}
process.stdout.write(JSON.stringify(out));
