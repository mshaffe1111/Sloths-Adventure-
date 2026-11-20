// ENG-24c: the raft in play: a tier bot's run over 2-4 (layout 1) through the game's own touch input, every frame near the LAST river
// (beat 9: the great swing onto the raft row), with Pokey, the clocks, the carriers, the lianas' angles and the drawn glow.
const ROOT = process.env.ROOT!;
await import(`${ROOT}/src/game/headlessDom.ts`);
const { runTier } = await import(`${ROOT}/tools/inspect/tierBots.ts`);
const fs = await import('node:fs');
const [setting = 'normal', out = 'raft.json', tier = 'middle', variant = '1'] = process.argv.slice(2);
const keep = ['x', 'y', 'vx', 'vy', 'width', 'height', 'grounded', 'facing', 'isVineSwinging', 'swingAngle', 'swingAngularVelocity', 'swingLength', 'swingVineId', 'climbing', 'hanging', 'jumpsLeft', 'isDoubleJumping', 'somersaultAngle', 'squashX', 'squashY'];
const frames: unknown[] = [];
let last: { x0: number; x1: number } | null = null;
const r = runTier(tier as never, setting as never, Number(variant), '2-4', {
  realInput: true,
  onFrame: (sim: { e: unknown }) => {
    const e = sim.e as Record<string, any>;
    if (!last) last = (e.currentStage.rivers ?? []).filter((q: any) => q.speed > 0).sort((a: any, b: any) => b.x0 - a.x0)[0];
    const p = e.player;
    if (!last || p.x < last.x0 - 700 || p.x > last.x1 + 250) return;
    frames.push({ tag: 'run', t: e.gameTime, vc: e.vineClock, sg: e.sweetGlow, p: Object.fromEntries(keep.map((k) => [k, p[k]])), logs: e.platforms.filter((q: any) => q.type === 'drift').map((q: any) => [q.id, q.x, q.y]), va: e.vines.filter((q: any) => q.vineType !== 'tree_climb').map((q: any) => [q.id, q.swingAngle]), on: e.standingOnId, raft: e.platforms.find((q: any) => q.id === e.standingOnId)?.drift?.look === 'raft' });
  },
} as never) as unknown as { end: string; lives: number };
fs.writeFileSync(out, JSON.stringify({ setting, variant: Number(variant), frames }));
const onRaft = (frames as any[]).map((f, i) => (f.raft ? i : -1)).filter((i) => i >= 0);
console.log(`2-4 ${tier} ${setting} v${variant}: end ${r.end} lives ${r.lives}; ${frames.length} frames near the last river; on a raft ${onRaft.length} frames (first ${onRaft[0]}, last ${onRaft[onRaft.length - 1]})`);
