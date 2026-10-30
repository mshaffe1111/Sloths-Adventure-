// stdin: a slide course (JSON) -> stdout: for each obstacle (sorted, by index), the middle of its jump window in s before he reaches it
// (jumps.ts windowOf, from the lane the bot will be in: the middle lane, or the open one round a column), for proof.mjs's bot
import { readFileSync } from 'fs';
import { windowOf } from './jumps.ts';
import type { SlideCourse } from '../../../src/game/w7Slide.ts';

const c = JSON.parse(readFileSync(0, 'utf8')) as SlideCourse;
const obs = [...c.obstacles].sort((a, b) => a.z - b.z);
const out = obs.map((o) => {
  if (o.kind === 'head' || o.kind === 'beam') return null;
  const lane = o.lanes.includes(1) ? 1 : o.lanes[0];
  const w = windowOf(c, o, lane);
  return w.length ? (Math.min(...w) + Math.max(...w)) / 2 : null;
});
process.stdout.write(JSON.stringify(out));
