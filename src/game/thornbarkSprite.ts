/**
 * Painted Thornbark (the secret boss of Thornbark's Hollow, reached from stage 7-7): the corrupted guardian, a hulking dark sloth
 * with burning red eyes, a spiked rusted pauldron, a torn purple cape and a bone club. He replaces the old Slomatt-rig puppet.
 * A switch like the other painted creatures: `?thornbark=sprite` / `?thornbark=classic`, `localStorage.sloth_thornbark = 'sprite'`,
 * DEFAULT_SPRITE_THORNBARK otherwise (the puppet draws while the atlas loads or when it is off).
 *
 * Poses follow the boss brain: the prowling idle and the three-pose march, the gallop for the shadow dash, the roar (with its
 * shockwave) for the thorn volley, the raised fists and the leap crouch for the slams and the big leap, the hook for the briar whip,
 * claw / knuckle / kick for the flurry, the crossed-arms guard when he is stunned, and the club-on-the-shoulder rest once he is freed.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { THORNBARK_FRAMES } from './thornbarkAtlasData.ts';

export const DEFAULT_SPRITE_THORNBARK = true;
const MARCH = ['march1', 'march2', 'march3', 'march2'];
/** world units travelled per full march cycle */
const STRIDE = 96;

export const thornbarkSprite = createPaintedBoss({
  param: 'thornbark',
  defaultOn: DEFAULT_SPRITE_THORNBARK,
  url: new URL('../assets/enemies/thornbark-atlas.webp', import.meta.url).href,
  frames: THORNBARK_FRAMES,
  k: 0.5,
  glow: 'rgba(167, 139, 250, 0.55)',
  pick: ({ b, br, m, moving, dist, time }) => {
    let name: string;
    const mv = br.move;
    if (br.state === 'dying') name = br.t < 0.7 ? 'block' : 'rest';
    else if (br.state === 'stun') name = 'block';
    else if (br.state === 'roar') name = 'roar';
    else if (br.state === 'tell') {
      if (mv === 'thornVolley') name = 'overhead';
      else if (mv === 'briarWhip') name = 'march2';
      else if (mv === 'rootBurst') name = 'leapprep';
      else if (mv === 'shadowDash') name = 'leapprep';
      else if (mv === 'clawFlurry') name = 'claw';
      else if (mv === 'mirrorStep') name = 'block';
      else if (mv === 'thornSlam') name = 'leapprep';
      else if (mv === 'thornRain') name = 'roar';
      else name = 'leapprep';
    } else if (br.state === 'act') {
      if (mv === 'thornVolley') name = 'roar';
      else if (mv === 'briarWhip') name = 'hook';
      else if (mv === 'rootBurst') name = 'overhead';
      else if (mv === 'shadowDash') name = Math.floor(time * 9) % 2 === 0 ? 'gallop1' : 'gallop2';
      else if (mv === 'clawFlurry') name = ['claw', 'knuckle', 'claw', 'kick'][Math.floor(br.t / 0.2) % 4];
      else if (mv === 'mirrorStep') name = 'claw';
      else if (mv === 'thornSlam') name = 'overhead';
      else if (mv === 'thornRain') name = 'roar';
      else name = m?.pose === 'slam' ? 'overhead' : 'roar';
    } else if (br.state === 'rec') name = mv === 'briarWhip' ? 'hook' : mv === 'thornSlam' || mv === 'rootBurst' ? 'knuckle' : mv === 'clawFlurry' ? 'kick' : 'idle';
    else if (moving) name = MARCH[Math.floor((dist / STRIDE) * MARCH.length) % MARCH.length];
    else name = 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'block';
    return name;
  },
});
