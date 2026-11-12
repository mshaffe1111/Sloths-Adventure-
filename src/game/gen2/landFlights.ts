/**
 * R-165.124 (Matt, 11-06 and 11-11: the dead-zone landing): the four plain flights a landing may be reached by, FLOWN on the real engine
 * (realPlay.ts, 30 fps, his own stage's help), never a closed form. Each is his feet's path frame by frame from where it starts, holding
 * the way he goes the whole time (the plain input: no mid-air correction):
 *   walk:   a full-speed walk off a ledge's end, from the last frame he stood (x from the ledge's end, y from its top);
 *   jump:   a full single jump (held) at full speed, from the take-off frame (x from the take-off, y from the floor);
 *   double: the same jump with the second press at its top (the move 1-1 teaches);
 *   bounce: off a floor mushroom's cap at full speed (x from where he met it, y from the cap's top), holding nothing else;
 *   bounce-air: the same bounce with the air jump pressed at its top (the bounce + air jump 1-1 teaches);
 *   jump-up, double-up: the same jumps from a standstill, holding no way (straight up), flown back down to the take-off's level;
 *   bounce-up, bounce-air-up: the bounces with the way let go of as he meets the cap (straight up, as far as the air stop lets him),
 *   flown back down to the cap's level.
 * `flyLandFlights` flies them; landFlights.data.ts holds what it flew (written by tools/engine/landflights.ts); landFlights.test.ts flies
 * them again and proves the table is the engine's. Read by landings.ts (the verdicts), never by the game.
 */
import type { Difficulty } from '../difficulty.ts';

export type Flight = 'walk' | 'jump' | 'double' | 'bounce' | 'bounce-air' | 'jump-up' | 'double-up' | 'bounce-up' | 'bounce-air-up';
export const FLIGHTS: readonly Flight[] = ['walk', 'jump', 'double', 'bounce', 'bounce-air', 'jump-up', 'double-up', 'bounce-up', 'bounce-air-up'];
/** a flight: his feet [dx, dy] per frame (dy down), the first point the start */
export type FlightPath = ReadonlyArray<readonly [number, number]>;
export type FlightTable = Readonly<Record<Difficulty, Readonly<Record<Flight, FlightPath>>>>;

/** how far each path is flown: deeper than any landing a 1-1 section lays under its take-off */
export const FLY_DEPTH = 700;

/** fly the four on the real engine for `setting` (a 1-1 RealPlay with its pieces swapped for one bare ledge and one mushroom) */
export async function flyLandFlights(setting: Difficulty): Promise<Record<Flight, Array<[number, number]>>> {
  await import('../headlessDom.ts');
  const { RealPlay } = await import('../realPlay.ts');
  const { setDifficulty } = await import('../difficulty.ts');
  setDifficulty(setting);
  const r = new RealPlay('1-1', 1);
  const e = r.e as unknown as { platforms: unknown[]; enemies: unknown[]; vines: unknown[]; ropes?: unknown[]; stop?: () => void };
  const TOP = 300, END = 3000;
  const ledge = { id: 9001, x: 400, y: TOP, width: END - 400, height: 24, type: 'solid' };
  const R1 = (v: number) => Math.round(v * 10) / 10;
  const set = (extra: unknown[] = []) => { e.platforms.length = 0; e.platforms.push(ledge, ...extra); e.enemies.length = 0; e.vines.length = 0; if (e.ropes) e.ropes.length = 0; };
  const deep = () => r.p.y - TOP > FLY_DEPTH;
  const out = {} as Record<Flight, Array<[number, number]>>;
  // walk: run up from 600 px back, hold the way on; the path starts at the last frame he stood
  set();
  r.stand(END - 600, TOP);
  let last: [number, number] = [r.p.x, r.p.y];
  const walk: Array<[number, number]> = [];
  for (let i = 0; i < 400 && !deep(); i++) {
    const was = r.p.grounded;
    if (was) last = [r.p.x, r.p.y];
    r.frame({ right: true });
    if (!r.p.grounded && (walk.length || was)) { if (!walk.length) walk.push([R1(last[0] - END), R1(last[1] - TOP)]); walk.push([R1(r.p.x - END), R1(r.p.y - TOP)]); }
  }
  out.walk = walk;
  // jump and double: full speed, the press at 20 px before the end (nothing under the fall), held; the double pressed again at the top
  for (const kind of ['jump', 'double', 'jump-up', 'double-up'] as const) {
    const up = kind.endsWith('-up');
    set();
    r.stand(END - 600, TOP);
    let i = 0;
    while (!up && r.p.x < END - 20 && i++ < 400) r.frame({ right: true });
    const x0 = r.p.x, y0 = r.p.y;
    const path: Array<[number, number]> = [[0, 0]];
    r.frame(up ? { press: true, jump: true } : { right: true, press: true, jump: true });
    path.push([R1(r.p.x - x0), R1(r.p.y - y0)]);
    let second = !kind.startsWith('double');
    const way = up ? {} : { right: true };
    for (let k = 0; k < 400 && !deep(); k++) {
      const top = !second && r.p.vy >= 0;
      if (top) second = true;
      r.frame(top ? { ...way, press: true, jump: true } : { ...way, jump: true });
      path.push([R1(r.p.x - x0), R1(r.p.y - y0)]);
      // (straight up comes back down onto where it started: flown to its take-off level, where its own floor or cap takes it)
      if (r.p.grounded || (up && r.p.y - y0 > 0)) break;
    }
    out[kind] = path;
  }
  // bounce (and bounce-air): a floor mushroom (cap 30 px up, 70 wide) at the ledge's end, walked onto at full speed; the path from the
  // frame he met it (nothing under the fall past it)
  for (const kind of ['bounce', 'bounce-air', 'bounce-up', 'bounce-air-up'] as const) {
    const up = kind.endsWith('-up');
    const cap = { id: 9002, x: END - 300, y: TOP - 30, width: 70, height: 30, type: 'bouncy' };
    set([cap]);
    ledge.width = cap.x + cap.width + 4 - ledge.x;
    r.stand(cap.x - 600, TOP);
    const path: Array<[number, number]> = [];
    let bx = 0, second = !kind.startsWith('bounce-air');
    for (let k = 0; k < 600 && !deep(); k++) {
      const top = path.length > 0 && !second && r.p.vy >= 0;
      if (top) second = true;
      const way = up && path.length ? {} : { right: true };
      r.frame(top ? { ...way, press: true, jump: true } : way);
      if (!path.length && r.p.vy < -500) { bx = r.p.x; path.push([0, R1(r.p.y - cap.y)]); continue; }
      if (path.length) { path.push([R1(r.p.x - bx), R1(r.p.y - cap.y)]); if (r.p.grounded || (up && r.p.y - cap.y > 0)) break; }
    }
    out[kind] = path;
    ledge.width = END - 400;
  }
  e.stop?.();
  return out;
}
