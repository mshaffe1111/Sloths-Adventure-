/**
 * Painted Stone Idol Golem (world 7 boss, the moss-grown guardian of the ruins) from the Gemini pose sheets. A switch like the other
 * painted creatures: `?golem=sprite` / `?golem=classic`, `localStorage.sloth_golem = 'sprite'`, DEFAULT_SPRITE_GOLEM otherwise.
 *
 * It lumbers in the three-frame guard march with its hammer. Poses follow the boss brain: the fists-down crush for the fist slam
 * (and the groggy, hammer-dropped stagger when they stick), the roar of the earth for the rockfall, the blue-fire glow and the
 * outstretched arm for the eye beam, the foot stomp and the crouching shock for the quake, the awakening on its entrance and the
 * enraged glow between phases, then the rubble heap when it falls.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { GOLEM_FRAMES } from './golemAtlasData.ts';

export const DEFAULT_SPRITE_GOLEM = true;
const MARCH = ['march1', 'march2', 'march3'];
/** world units travelled per full march cycle (it is slow, so a short stride) */
const STRIDE = 70;

export const golemSprite = createPaintedBoss({
  param: 'golem',
  defaultOn: DEFAULT_SPRITE_GOLEM,
  url: new URL('../assets/enemies/golem-atlas.webp', import.meta.url).href,
  frames: GOLEM_FRAMES,
  k: 1.15,
  pick: ({ b, br, moving, dist }) => {
    let name: string;
    const mv = br.move;
    if (br.state === 'dying') name = br.t < 0.45 ? 'hurt' : br.t < 1.0 ? 'defeat1' : 'defeat2';
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = br.roarReason === 'enter' ? 'awaken' : 'enrage';
    else if (br.state === 'tell') {
      if (mv === 'fistSlam') name = 'charge2';
      else if (mv === 'rockfall') name = 'roar';
      else if (mv === 'eyeBeam') name = 'enrage';
      else if (mv === 'quake') name = 'tremor';
      else if (mv === 'hammerSmash' || mv === 'crystalRift') name = 'charge1';
      else if (mv === 'hammerSpin') name = 'charge2';
      else name = 'roar';
    } else if (br.state === 'act') {
      if (mv === 'fistSlam') name = 'doublefist';
      else if (mv === 'rockfall') name = 'roar';
      else if (mv === 'eyeBeam') name = 'shards';
      else if (mv === 'quake') name = 'quake';
      else if (mv === 'hammerSmash') name = 'overhead';
      else if (mv === 'hammerSpin') name = 'spin';
      else if (mv === 'crystalRift') name = 'rift';
      else name = 'roar';
    } else if (br.state === 'rec') {
      const rec: Record<string, string> = { fistSlam: 'doublefist', quake: 'quake', eyeBeam: 'shards', hammerSmash: 'overhead', hammerSpin: 'hurt', crystalRift: 'rift' };
      name = (mv && rec[mv]) || 'march1';
    }
    else if (moving) name = MARCH[Math.floor((dist / STRIDE) * MARCH.length) % MARCH.length];
    else name = b.phase >= 2 ? 'enrage' : 'march1';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
