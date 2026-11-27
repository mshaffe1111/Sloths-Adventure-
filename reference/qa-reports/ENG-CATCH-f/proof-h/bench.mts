// ENG-CATCH-h: downInvariant's cost per call, before (OLD tree) and after (NEW tree), on the same input: each drafted 3-1 stage's
// tower wood (the platforms and vines the build laid), seeds FROM..SEEDS normal; plus woodOverlaps alone
const NEW = process.env.NEW!, OLD = process.env.OLD!;
await import(NEW + '/src/game/headlessDom.ts');
await import(NEW + '/tools/engine/draft.ts');
const { buildStage } = await import(NEW + '/tools/engine/libstage.ts');
const n = await import(NEW + '/src/game/gen2/tower.ts');
const o = await import(OLD + '/src/game/gen2/tower.ts');
const from = Number(process.env.FROM ?? 1), to = Number(process.env.SEEDS ?? 5), N = Number(process.env.N ?? 200);
let tOld = 0, tNew = 0, tOv = 0, calls = 0, pieces = 0;
for (let s = from; s <= to; s++) {
  const st: any = buildStage('3-1', s, 'normal');
  const P = st.platforms as any[], V = st.vines as any[];
  const floorY = Math.max(...P.map((p) => p.y)), width = Math.max(...P.map((p) => p.x + p.width));
  pieces += P.length;
  for (let r = 0; r < 3; r++) { o.downInvariant(P, V, [], floorY, width); n.downInvariant(P, V, [], floorY, width); }
  let t = performance.now(); for (let i = 0; i < N; i++) o.downInvariant(P, V, [], floorY, width); tOld += performance.now() - t;
  t = performance.now(); for (let i = 0; i < N; i++) n.downInvariant(P, V, [], floorY, width); tNew += performance.now() - t;
  t = performance.now(); for (let i = 0; i < N; i++) n.woodOverlaps(P); tOv += performance.now() - t;
  calls += N;
}
console.log(`downInvariant per call over ${to - from + 1} drafted 3-1 stages (normal; avg ${Math.round(pieces / (to - from + 1))} pieces, the whole stage's wood), ${N} calls each: before ${(tOld / calls).toFixed(3)} ms, after ${(tNew / calls).toFixed(3)} ms; woodOverlaps alone ${(tOv / calls * 1000).toFixed(1)} us`);
