import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { PICKUP_APART, SAFE_APPROACH, validateStage } from './levelCheck.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { isKitSweeper } from './gen2/stillLay.ts';

const levels = generateAllLevels().filter((l) => l.objectiveType !== 'boss_lair');

/** pickups inside a platform, and pairs of pickups that overlap (the same tests the audit uses) */
function pickupFaults(s: GeneratedStage) {
  const inSolid: string[] = [];
  const overlaps: string[] = [];
  const live = s.collectibles.filter((c) => c.type !== 'exit_totem');
  for (const c of live) {
    for (const p of s.platforms) {
      if (p.broken || p.type === 'drift' || p.type === 'moving') continue;
      if (c.x >= p.x && c.x <= p.x + p.width && c.y > p.y + 2 && c.y < p.y + p.height - 2) { inSolid.push(`${c.type} #${c.id} in platform ${p.id}`); break; }
    }
  }
  const byX = [...live].sort((a, b) => a.x - b.x);
  for (let i = 0; i < byX.length; i++) {
    for (let j = i + 1; j < byX.length && byX[j].x - byX[i].x < PICKUP_APART; j++) {
      if (Math.hypot(byX[j].x - byX[i].x, byX[j].y - byX[i].y) < PICKUP_APART) overlaps.push(`#${byX[i].id} and #${byX[j].id}`);
    }
  }
  return { inSolid, overlaps };
}

test('no pickup sits inside a platform or on top of another, in the shipped layouts and in random ones', () => {
  const bad: string[] = [];
  for (const l of levels) {
    setLayoutVariant(null);
    const designed = pickupFaults(generateStage(l));
    if (designed.inSolid.length || designed.overlaps.length) bad.push(`${l.id} designed: ${[...designed.inSolid, ...designed.overlaps].slice(0, 2).join('; ')}`);
    if (l.miniIndex % 3 === 0) {
      setLayoutVariant(l.worldIndex * 7919 + l.miniIndex * 31 + 5);
      const r = pickupFaults(generateStage(l));
      if (r.inSolid.length || r.overlaps.length) bad.push(`${l.id} random: ${[...r.inSolid, ...r.overlaps].slice(0, 2).join('; ')}`);
    }
  }
  setLayoutVariant(null);
  assert.deepEqual(bad, []);
});

test('the validator turns down a pickup inside a platform, two on top of each other, and one out in the margin', () => {
  const l = levels.find((x) => x.id === '2-2')!;
  setLayoutVariant(null);
  const base = generateStage(l);
  assert.equal(validateStage(base).ok, true);
  const solid = base.platforms.find((p) => p.height >= 60 && p.type === 'solid')!;
  const a = JSON.parse(JSON.stringify(base)) as GeneratedStage;
  a.collectibles.push({ id: 99001, type: 'flower', x: solid.x + solid.width / 2, y: solid.y + 40, collected: false, bobPhase: 0 });
  assert.ok(validateStage(a).errors.some((e) => /inside platform/.test(e)), 'inside');
  const b = JSON.parse(JSON.stringify(base)) as GeneratedStage;
  const f = b.collectibles.find((c) => c.type === 'flower')!;
  b.collectibles.push({ ...f, id: 99002, x: f.x + 10 });
  assert.ok(validateStage(b).errors.some((e) => /overlap/.test(e)), 'overlap');
  const c = JSON.parse(JSON.stringify(base)) as GeneratedStage;
  c.collectibles.push({ ...f, id: 99003, x: 4, y: c.spawnY - 40 });
  assert.ok(validateStage(c).errors.some((e) => /outside the walkable strip/.test(e)), 'strip');
});

test('no animal patrols within the clear approach of the start, a flag or the exit', () => {
  const bad: string[] = [];
  for (const l of levels) {
    setLayoutVariant(null);
    const s = generateStage(l);
    const spots = [{ x: s.spawnX, y: s.spawnY, flag: false }, ...(s.checkpoints ?? []).map((c) => ({ x: c.x, y: c.y, flag: true })), { x: s.exitTotemX, y: s.exitTotemY, flag: false }];
    for (const e of s.enemies) {
      // (a kit sweeper, castWatches: by the stretch its eye crosses, against the start and the shrine; a flag is fair, the respawn stands
      // it down for a whole calm, eagleKit.test "back at a flag inside its stretch")
      const swept = isKitSweeper(e);
      for (const sp of spots) {
        if (swept && sp.flag) continue;
        if (Math.abs(e.y - sp.y) >= 400) continue;
        const d = e.type === 'eagle' && !swept ? Math.abs(e.x - sp.x) : Math.max(0, e.patrolMinX - sp.x, sp.x - e.patrolMaxX);
        if (d < (e.type === 'eagle' && !swept ? 300 : SAFE_APPROACH)) bad.push(`${l.id}: ${e.type} #${e.id} is ${Math.round(d)} px from a safe spot`);
      }
    }
  }
  assert.deepEqual(bad, []);
});

test('the validator judges a kit sweeper by the stretch its eye crosses: never over the start or the shrine; a flag in it is fair', () => {
  // (a sweeper laid as castWatches lays one: x at its stretch's start, its stretch [patrolMinX, patrolMaxX], its own calm)
  const l = levels.find((x) => x.id === '2-2')!;
  setLayoutVariant(null);
  const base = generateStage(l);
  assert.equal(validateStage(base).ok, true);
  const flag = (base.checkpoints ?? [])[0];
  assert.ok(flag, '2-2 has a flag');
  const sweeper = (x0: number, x1: number, y: number, o: Partial<GeneratedStage['enemies'][number]> = {}) => ({
    id: 99100, type: 'eagle', x: x0, y: y - 220, vx: 0, vy: 0, width: 58, height: 42, hp: 1, maxHp: 1, facing: 1, patrolMinX: x0, patrolMaxX: x1,
    attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, kitCool: 5.4, ...o,
  }) as GeneratedStage['enemies'][number];
  const errs = (e: GeneratedStage['enemies'][number]) => {
    const st = JSON.parse(JSON.stringify(base)) as GeneratedStage;
    st.enemies.push(e);
    return validateStage(st).errors.filter((m) => /#99100 stands too close/.test(m));
  };
  // a flag in the MIDDLE of a long stretch, 600 px from where it was laid: the old reading (its laid x, 300 px) saw nothing; it is fair
  // only by the respawn's stand-down, which eagleKit.test proves
  assert.deepEqual(errs(sweeper(flag.x - 600, flag.x + 600, flag.y)), [], 'a flag inside its stretch');
  // planted: the same stretch over the START: its pass can be called at once (the cast's first cool is 0), so it is refused
  assert.equal(errs(sweeper(base.spawnX - 100, base.spawnX + 1200, base.spawnY)).length, 1, 'over the start');
  assert.equal(errs(sweeper(base.spawnX + 150, base.spawnX + 1200, base.spawnY)).length, 1, 'within the approach of the start');
  assert.equal(errs(sweeper(base.exitTotemX - 900, base.exitTotemX + 40, base.exitTotemY)).length, 1, 'over the shrine');
  // (and the engine's own eagle, no kit calm, is still judged where it hangs: 250 px from a flag is too close)
  assert.equal(errs(sweeper(flag.x + 250, flag.x + 250, flag.y + 220, { kitCool: undefined })).length, 1, 'an engine eagle by a flag');
});
