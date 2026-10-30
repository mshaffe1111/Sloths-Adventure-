/** Flicker's painted clips (flicker-anim.webp), one sheet shared by Meeca's stage (meecaArt.ts) and the cutscenes (storyArt.ts) */
import { makeCreatureAnim } from './creatureAnim.ts';
import { FLICKER_ANIM, FLICKER_ANIM_UP, FLICKER_ANIM_URL, FLICKER_SEQ } from './flickerAnimData.ts';

export const FLICKER_CLIPS = makeCreatureAnim(FLICKER_ANIM_URL, FLICKER_ANIM, FLICKER_SEQ, FLICKER_ANIM_UP);
