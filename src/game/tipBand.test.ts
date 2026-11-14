// A rolled stage's tip fires only inside its section's height band (R-165.236, the lead's TIPS packet 11-14). Before: a gen2 tip fired
// by x alone (engine.ts: p.x >= h.x), so on 1-4, a climbing stage 1,280 px wide and 11,585 px tall, all four teach tips went up in the
// first 3 s on the start floor, 1,200-3,500 px under the creaking boughs, the field, the pods and the fig gate they teach
// (reference/qa-reports/INT-7/stills/1-4/TIPWALK-1-4-L0.txt). Now each carries its section's band (pipeline tipBand) and waits for his
// feet inside it. On a flat stage the band holds every place he can be over the section: its tips fire at the very frame x alone fired.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import type { StageHint } from './protoStage.ts';
import { FirstTimerRun, FT_ADULT, FT_CHILD_EASY, freshPhone, rng, type FirstTimer } from '../../tools/inspect/firsttimer.ts';
import { tipMisses, TIP_NEAR } from './gen2/pipeline.ts';
import { LISTED } from './gen2/listed.ts';
import { GEN2_STAGES } from './gen2/game.ts';
import type { Gen2Stage } from './gen2/types.ts';

type Run = { play(): void; e: { proto?: { hints: StageHint[] } }; sim: { frame(p?: unknown): void; p: { x: number; y: number; height: number } } };

/** the first-timer's whole run on a stage (the real engine, 30 fps), with the bands or with them taken off (x alone, as before): each
 *  tip's frame as it went up, and how many tips carried a band */
function fired(id: string, layout: number, who: FirstTimer, strip: boolean, cap: number) {
  freshPhone(who.setting);
  const mr = Math.random;
  Math.random = rng(layout * 104729 + 11);
  try {
    const r = new FirstTimerRun(id, layout, who, { cap }) as unknown as Run;
    const hints = () => r.e.proto?.hints ?? [];
    const banded = hints().filter((h) => h.band).length;
    const frame = r.sim.frame.bind(r.sim);
    const up = new Map<StageHint, boolean>();
    const out: string[] = [];
    let n = 0;
    r.sim.frame = (pad?: unknown) => {
      if (strip) for (const h of hints()) delete (h as { band?: unknown }).band;
      frame(pad);
      n++;
      for (const h of hints()) {
        if (h.shown && !up.get(h)) out.push(`frame ${n}: "${h.text.slice(0, 32)}" at x ${Math.round(r.sim.p.x)} y ${Math.round(r.sim.p.y)}`);
        up.set(h, !!h.shown);
      }
    };
    r.play();
    return { out, banded };
  } finally {
    Math.random = mr;
  }
}

test('every rolled tip carries its section band, and the band holds the socket it stands on (every gen2 stage, layout 1, both settings)', () => {
  let n = 0;
  for (const c of generateAllLevels().filter((l) => !l.secret)) {
    for (const setting of ['normal', 'easy'] as const) {
      setLayoutVariant(1);
      let st: { gen2?: { fills: Array<{ role: string; socket: string; what: string | null; unsaid?: boolean; x: number; y: number }> }; proto?: { hints: StageHint[] } };
      try {
        st = generateStage({ ...c, unlocked: true }, setting) as unknown as typeof st;
      } finally {
        setLayoutVariant(null);
      }
      const g = st.gen2;
      if (!g) continue;
      const hints = st.proto?.hints ?? [];
      for (const f of g.fills.filter((q) => q.role === 'tip' && q.socket !== 'water' && q.what && !q.unsaid)) {
        const h = hints.find((q) => q.x === f.x && q.band);
        assert.ok(h, `${c.id} ${setting}: the tip "${f.what}" at x ${f.x} carries no band`);
        assert.ok(h!.band![0] < f.y && f.y < h!.band![1], `${c.id} ${setting}: "${f.what}"'s band ${h!.band!.join('..')} misses its socket's y ${f.y}`);
        n++;
      }
    }
  }
  assert.ok(n > 40, `only ${n} rolled tips seen`);
});

test('1-4 (a climbing stage): x alone said all four teach lines on the start floor in 3 s; the bands say none there (planted: bands off)', () => {
  for (const layout of [0, 1, 2]) {
    const walk = (strip: boolean) => {
      const r = new RealPlay('1-4', layout);
      const hs = ((r.stage as unknown as { proto?: { hints: StageHint[] } }).proto?.hints ?? []);
      if (strip) for (const h of hs) delete (h as { band?: unknown }).band;
      const y0 = r.p.y;
      for (let i = 0; i < 20 * 30; i++) r.frame({ right: true, jump: i % 20 < 2, press: i % 20 === 0 });
      assert.ok(Math.abs(r.p.y - y0) < 60, `layout ${layout}: still on the start floor`);
      return hs.filter((h) => h.shown).length;
    };
    assert.equal(walk(true), 4, `layout ${layout}: x alone fires the four tips on the floor (the defect this fixes)`);
    assert.equal(walk(false), 0, `layout ${layout}: no tip fires on the start floor`);
  }
});

// (the flat stages: 1-1, 1-2 and 1-5, the first-timer's whole run on Normal and Easy; with the bands, every tip goes up on the same
// frame, at the same place, as with x alone. Planted: TIP_BAND { over: 0, under: 0 } moves 1-1's tips; reference/qa-reports/TIPS/)
for (const id of ['1-1', '1-2', '1-5']) {
  test(`${id}: every tip fires at the same frame with its band as by x alone (the first-timer's run, Normal and Easy)`, () => {
    for (const who of [FT_ADULT, FT_CHILD_EASY]) {
      const a = fired(id, 1, who, false, 420);
      const b = fired(id, 1, who, true, 420);
      assert.ok(a.banded >= 2, `${id} ${who.setting}: ${a.banded} banded tips`);
      assert.ok(a.out.length >= 2, `${id} ${who.setting}: only ${a.out.length} tips went up`);
      assert.deepEqual(a.out, b.out, `${id} ${who.setting}: the bands moved a tip`);
    }
  });
}

test('the tip verdict: no rolled stage misses (every stage, layouts 1-2, both settings); 1-4 by x alone and a teach after its first showing fail by name (planted)', () => {
  assert.equal(TIP_NEAR, 1026, 'PHYS.maxRun 285 px/s x a tip 3.6 s up');
  let n = 0;
  for (const c of generateAllLevels().filter((l) => !l.secret)) {
    for (const setting of ['normal', 'easy'] as const) {
      const kit = LISTED[c.id]?.kit() ?? GEN2_STAGES[c.id]?.kit(setting);
      if (!kit) continue;
      for (const layout of [1, 2]) {
        setLayoutVariant(layout);
        let st: Gen2Stage;
        try {
          st = generateStage({ ...c, unlocked: true }, setting) as unknown as Gen2Stage;
        } finally {
          setLayoutVariant(null);
        }
        if (!st.gen2) continue;
        assert.deepEqual(tipMisses(st as never, kit.manifest), [], `${c.id} ${setting} layout ${layout}`);
        n++;
        if (c.id !== '1-4' || layout !== 1) continue;
        const hints = ((st.proto as { hints: StageHint[] }).hints).map((h) => ({ ...h, band: [-1e9, 1e9] as const }));
        const x = tipMisses({ ...st, proto: { hints } } as never, kit.manifest);
        assert.equal(x.filter((m) => /past TIP_NEAR/.test(m)).length, 4, `1-4 ${setting} by x alone: ${x.join('; ')}`);
        // (the creak lesson's section moved after another that shows creaking boughs: the line comes after the thing)
        const k = st.gen2.sections.findIndex((q) => q.uid === st.gen2.fills.find((f) => f.role === 'tip' && f.what === 'creak')!.section);
        const sections = st.gen2.sections.map((q, i) => (i === k - 1 ? { ...q, template: st.gen2.sections[k].template } : q));
        const late = tipMisses({ ...st, gen2: { ...st.gen2, sections } } as never, kit.manifest);
        assert.ok(late.some((m) => /teaches creak in s\d+, but s\d+ shows it first/.test(m)), late.join('; '));
      }
    }
  }
  assert.ok(n >= 50, `${n} rolled builds judged`);
});
