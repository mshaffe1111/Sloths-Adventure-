/**
 * Painted General Iron-Claw (world 10 final boss, the sloth warlord of the high canopy fortress) from the Gemini pose sheets: a
 * brown sloth with red eyes, a spiked silver pauldron, a red scarf, a torn crimson cape and a spiked club. A switch like the other
 * painted creatures: `?ironclaw=sprite` / `?ironclaw=classic`, `localStorage.sloth_ironclaw = 'sprite'`, DEFAULT_SPRITE_IRONCLAW otherwise.
 *
 * He marches in the three-pose war march and charges behind his guard. Poses follow the boss brain: the club raised and brought
 * down for the staff slam, the armed stance and the horizontal slash for the thrown club, the roar for the war cry, the stomp for
 * the ground pound, the flame aura and the rage blast between phases, then the knockback, the collapse and the fallen tyrant.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { IRONCLAW_FRAMES } from './ironclawAtlasData.ts';

export const DEFAULT_SPRITE_IRONCLAW = true;
const MARCH = ['march0', 'march1', 'march2', 'march1'];
/** world units travelled per full march cycle */
const STRIDE = 80;

export const ironclawSprite = createPaintedBoss({
  param: 'ironclaw',
  defaultOn: DEFAULT_SPRITE_IRONCLAW,
  url: new URL('../assets/enemies/ironclaw-atlas.webp', import.meta.url).href,
  frames: IRONCLAW_FRAMES,
  k: 0.72,
  pick: ({ b, br, m, moving, dist, time }) => {
    let name: string;
    const mv = br.move;
    if (br.state === 'dying') name = br.t < 0.5 ? 'knockback' : br.t < 0.9 ? 'groundhit' : br.t < 1.4 ? 'defeat1' : br.t < 2.0 ? 'defeat2' : 'defeat3';
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = br.roarReason === 'enter' ? 'roar' : b.phase >= 3 ? 'enrage3' : 'rageblast';
    else if (br.state === 'tell') {
      if (mv === 'staffSlam') name = 'overhead1';
      else if (mv === 'spearThrow') name = 'armed';
      else if (mv === 'warCry') name = 'roar';
      else if (mv === 'ironCharge') name = 'block';
      else if (mv === 'groundPound') name = 'stomp1';
      else name = 'armed';
    } else if (br.state === 'act') {
      if (mv === 'staffSlam') name = 'overhead2';
      else if (mv === 'spearThrow') name = 'slash';
      else if (mv === 'warCry') name = 'roar';
      else if (mv === 'ironCharge') name = Math.floor(time * 9) % 2 === 0 ? 'charge' : 'run';
      else if (mv === 'groundPound') name = 'stomp2';
      else name = m?.pose === 'slam' ? 'overhead2' : 'roar';
    } else if (br.state === 'rec') name = mv === 'staffSlam' ? 'overhead2' : mv === 'groundPound' ? 'stomp2' : mv === 'spearThrow' ? 'slash' : 'idle';
    else if (moving) name = MARCH[Math.floor((dist / STRIDE) * MARCH.length) % MARCH.length];
    else name = 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
