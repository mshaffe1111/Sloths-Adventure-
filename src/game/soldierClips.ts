/** the General's soldiers' painted clips (soldier-anim.webp), one sheet shared by Meeca's stage (meecaArt.ts) and the cutscenes (storyArt.ts) */
import { makeCreatureAnim } from './creatureAnim.ts';
import { SOLDIER_ANIM, SOLDIER_ANIM_UP, SOLDIER_ANIM_URL, SOLDIER_SEQ } from './soldierAnimData.ts';

export const SOLDIER_CLIPS = makeCreatureAnim(SOLDIER_ANIM_URL, SOLDIER_ANIM, SOLDIER_SEQ, SOLDIER_ANIM_UP);
