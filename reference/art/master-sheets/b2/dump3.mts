// the creature frame lists the game draws from (fruitbatAnimData.ts, sentryAnimData.ts), for build_b2.py
const fb = await import('/home/user/Sloths-Adventure-/src/game/fruitbatAnimData.ts');
const se = await import('/home/user/Sloths-Adventure-/src/game/sentryAnimData.ts');
console.log(JSON.stringify({
  fruitbat: { frames: fb.FRUITBAT_ANIM, seq: fb.FRUITBAT_SEQ, ref: 'src/game/fruitbatAnimData.ts' },
  'fruitbat-fly': { frames: fb.FRUITBAT_FLY, seq: fb.FRUITBAT_FLY_SEQ, ref: 'src/game/fruitbatAnimData.ts' },
  sentry: { frames: se.SENTRY_FRAMES, seq: se.SENTRY_SEQ, ref: 'src/game/sentryAnimData.ts' },
}));
