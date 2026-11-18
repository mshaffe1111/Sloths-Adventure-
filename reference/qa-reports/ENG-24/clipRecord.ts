// npx tsx reference/qa-reports/ENG-24/clipRecord.ts <toy> <row> <easyRow> <setting> <variant> <out.json>: the middle bot's run over a liana
// toy (tools/inspect/lianaRiverToys.ts, the engine through the real InputEngine), every frame at the liana's river recorded (Pokey, the
// clocks, the logs), with the stage's pieces, for lianaClip.mjs to draw on the real page
import fs from 'node:fs';
import { fixtureSeed, lianaRun, type LianaToy, type ToyRiver } from '../../../tools/inspect/lianaRiverToys.ts';
const [toy = 'drop', row = 'gap280', easy = 'deep', setting = 'normal', variant = '1', out = 'rec.json'] = process.argv.slice(2);
const seed = fixtureSeed(toy as LianaToy, row as ToyRiver, ['normal', 'easy'], easy as ToyRiver)!;
const frames: unknown[] = [];
let stage: unknown = null;
const keep = ['x', 'y', 'vx', 'vy', 'width', 'height', 'grounded', 'facing', 'isVineSwinging', 'swingAngle', 'swingAngularVelocity', 'swingLength', 'swingVineId', 'climbing', 'hanging', 'jumpsLeft', 'isDoubleJumping', 'somersaultAngle', 'squashX', 'squashY'];
const r = lianaRun(toy as LianaToy, row as ToyRiver, 'middle', setting as 'normal' | 'easy', seed, Number(variant), easy as ToyRiver, {
  realInput: true,
  onFrame: (sim) => {
    const e = sim.e as Record<string, any>;
    if (!stage) stage = { platforms: e.platforms, vines: e.vines, rivers: e.currentStage.rivers, spawn: [e.currentStage.spawnX, e.currentStage.spawnY] };
    const riv = (e.currentStage.rivers ?? []).find((q: { speed: number }) => q.speed > 0);
    const p = e.player;
    if (!riv || p.x < riv.x0 - 420 || p.x > riv.x1 + 300) return;
    frames.push({ t: e.gameTime, vc: e.vineClock, p: Object.fromEntries(keep.map((k) => [k, p[k]])), logs: e.platforms.filter((q: { type: string }) => q.type === 'drift').map((q: { id: number; x: number; y: number }) => [q.id, q.x, q.y]), on: e.standingOnId });
  },
});
fs.writeFileSync(out, JSON.stringify({ toy, row, easy, setting, variant: Number(variant), seed, lives: r.pieces.find((q) => q.id === `toy-liana-${toy}`)?.lives, ontoLog: r.ontoLog, fromLog: r.fromLog, stage, frames }));
console.log(`${toy}/${row} ${setting} v${variant}: ${frames.length} frames, lives ${r.pieces.find((q) => q.id === `toy-liana-${toy}`)?.lives}, ontoLog ${r.ontoLog} fromLog ${r.fromLog}`);
