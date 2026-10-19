/**
 * Painted General Iron-Claw (world 10 final boss, the armoured mandrill warlord of the high canopy fortress) from the Gemini pose
 * sheets. A switch like the other painted creatures: `?ironclaw=sprite` / `?ironclaw=classic`, `localStorage.sloth_ironclaw = 'sprite'`,
 * DEFAULT_SPRITE_IRONCLAW otherwise.
 *
 * He marches in the four-frame warlord march and gallops in the two charge frames. Poses follow the boss brain: the raised blade
 * and the smash for the staff slam, the hurled blade for the spear throw, the horn call for the war cry, the stomp and double fist
 * for the ground pound, the glowing rage pose between phases, the groggy stagger and the fallen tyrant.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { IRONCLAW_FRAMES } from './ironclawAtlasData.ts';

export const DEFAULT_SPRITE_IRONCLAW = true;
const MARCH = ['march0', 'march1', 'march2', 'march3'];
/** world units travelled per full march cycle */
const STRIDE = 72;

export const ironclawSprite = createPaintedBoss({
  param: 'ironclaw',
  defaultOn: DEFAULT_SPRITE_IRONCLAW,
  url: new URL('../assets/enemies/ironclaw-atlas.webp', import.meta.url).href,
  frames: IRONCLAW_FRAMES,
  k: 1.15,
  pick: ({ b, br, m, moving, dist, time }) => {
    let name: string;
    const mv = br.move;
    if (br.state === 'dying') name = br.t < 0.5 ? 'hurt2' : br.t < 1.1 ? 'staggered' : br.t < 1.7 ? 'defeat1' : 'defeat2';
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = 'buff';
    else if (br.state === 'tell') {
      if (mv === 'staffSlam') name = 'cataprep';
      else if (mv === 'spearThrow') name = 'knuckle';
      else if (mv === 'warCry') name = 'roar';
      else if (mv === 'ironCharge') name = 'block';
      else if (mv === 'groundPound') name = 'stomp';
      else name = 'roar';
    } else if (br.state === 'act') {
      if (mv === 'staffSlam') name = 'overhead';
      else if (mv === 'spearThrow') name = 'bladethrow';
      else if (mv === 'warCry') name = 'warhorn';
      else if (mv === 'ironCharge') name = Math.floor(time * 9) % 2 === 0 ? 'gallop1' : 'gallop2';
      else if (mv === 'groundPound') name = 'doublefist';
      else name = m?.pose === 'slam' ? 'overhead' : 'roar';
    } else if (br.state === 'rec') name = mv === 'staffSlam' ? 'overhead' : mv === 'groundPound' ? 'doublefist' : mv === 'spearThrow' ? 'bladethrow' : 'idle';
    else if (moving) name = MARCH[Math.floor((dist / STRIDE) * MARCH.length) % MARCH.length];
    else name = 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
