import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { PICKUP_APART, SAFE_APPROACH, validateStage } from './levelCheck.ts';
import type { GeneratedStage } from './stageGenerator.ts';

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
    const spots = [{ x: s.spawnX, y: s.spawnY }, ...(s.checkpoints ?? []), { x: s.exitTotemX, y: s.exitTotemY }];
    for (const e of s.enemies) {
      for (const sp of spots) {
        if (Math.abs(e.y - sp.y) >= 400) continue;
        const d = e.type === 'eagle' ? Math.abs(e.x - sp.x) : Math.max(0, e.patrolMinX - sp.x, sp.x - e.patrolMaxX);
        if (d < (e.type === 'eagle' ? 300 : SAFE_APPROACH)) bad.push(`${l.id}: ${e.type} #${e.id} is ${Math.round(d)} px from a safe spot`);
      }
    }
  }
  assert.deepEqual(bad, []);
});
