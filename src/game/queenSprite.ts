/**
 * Painted Tarantula Queen (world 5 boss) from the Gemini pose sheets. A switch like the other painted creatures: `?queen=sprite` /
 * `?queen=classic`, `localStorage.sloth_queen = 'sprite'`, DEFAULT_SPRITE_QUEEN otherwise. She is drawn at the boss definition's scale
 * (a giant), so the whole painted pose set is the same plumbing as the other bosses (paintedBoss.ts).
 *
 * Poses follow the boss brain: walking (the faster charge scuttle from the second phase on), a warning pose for each wind-up and one
 * for each attack (web cocoon, brood call, web slam, pounce and bite, leg stomp and crush, venom jet), the open recovery that goes with
 * each move, stun and death.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { QUEEN_FRAMES } from './queenAtlasData.ts';

export const DEFAULT_SPRITE_QUEEN = true;
const STRIDE = 60;
const WALK = ['walk_0', 'walk_1', 'walk_2', 'walk_3'];

export const queenSprite = createPaintedBoss({
  param: 'queen',
  defaultOn: DEFAULT_SPRITE_QUEEN,
  url: new URL('../assets/enemies/queen-atlas.webp', import.meta.url).href,
  frames: QUEEN_FRAMES,
  k: 0.9,
  pick: ({ b, br, moving, dist }) => {
    let name: string;
    const mv = br.move;
    if (br.state === 'dying') name = br.t < 0.5 ? 'hurt' : 'dead';
    else if (br.state === 'stun') name = 'dizzy';
    else if (br.state === 'roar') name = b.phase >= 3 && br.roarReason !== 'enter' ? 'enrage' : 'screech';
    else if (br.state === 'tell') {
      if (mv === 'pounceBite') name = 'block';
      else if (mv === 'legStomp') name = 'stomp';
      else if (mv === 'venomBlast') name = 'venom';
      else if (mv === 'webCurtain' || mv === 'cocoonDrop') name = 'screech';
      else if (mv === 'callBrood') name = 'summon';
      else name = 'idle2';
    } else if (br.state === 'act') {
      if (mv === 'webShot') name = 'cocoon';
      else if (mv === 'callBrood') name = 'summon';
      else if (mv === 'webCurtain') name = 'webslam';
      else if (mv === 'cocoonDrop') name = 'enrage';
      else if (mv === 'legStomp') name = 'crush';
      else if (mv === 'venomBlast') name = 'venom';
      else if (mv === 'pounceBite') name = br.air > 8 ? 'leap' : 'bite';
      else name = 'bite';
    } else if (br.state === 'rec') {
      if (mv === 'callBrood') name = 'summon';
      else if (mv === 'pounceBite') name = 'bite';
      else if (mv === 'legStomp') name = 'crush';
      else if (mv === 'venomBlast') name = 'venom';
      else if (mv === 'webCurtain') name = 'webslam';
      else if (mv === 'cocoonDrop') name = 'screech';
      else name = 'drip';
    } else if (moving) {
      if (b.phase >= 2) name = Math.floor((dist / 44) * 2) % 2 === 0 ? 'charge_0' : 'charge_1';
      else name = WALK[Math.floor((dist / STRIDE) * WALK.length) % WALK.length];
    } else name = 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
