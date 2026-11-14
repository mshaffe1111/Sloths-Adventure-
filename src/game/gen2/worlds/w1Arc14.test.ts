/**
 * 1-4 Up the Kapok's own rows (w1Arc14.ts), held: its words verbatim, its graph's code rules, its pool its own, Easy never harder than
 * Normal in any number, and the finish laying a fair vine field (figs, gates, pods, beats) from a section's pieces by their keys. The
 * rolls on the ascent lay are held by tools/engine/library14.test.ts. Each rule is planted: the same rows made to break it turn it red.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Platform, Vine } from '../../types.ts';
import { checkCode, parseCode } from '../nodeCode.ts';
import { buildGen2Stage, stagePool } from '../pipeline.ts';
import { listedStage } from '../listed.ts';
import { provenSeeds } from '../seedList.ts';
import { levelConfig } from '../../realPlay.ts';
import { footRoom, topRoom, topRoomShort } from '../../vineTop.ts';
import { stageLine } from '../../wayside.ts';
import { STAGE_LINES } from '../../pokeyJournal.ts';
import { ARC_14, BRIEF_14, FIELD_ROWS, GAP, PODS_14, HALFWAY_14, JOURNAL_14, LINES_14, SECTIONS_14, STAGE_14, beats14, finish14, kitLib14 } from './w1Arc14.ts';
import { w1World } from './w1.ts';
import { FIELD_FEEL } from '../../vineField.ts';
import { POD, podFaults } from '../../podfall.ts';
import { warnLength } from '../../beat.ts';

test("1-4's words are the story keeper's, verbatim (the lead, 11-13 10:44 AM ET), each a teach line on Normal's default Tips (D50)", () => {
  assert.deepEqual({ ...LINES_14 }, {
    creak: 'Creaky limbs drop you, but just one branch down!',
    field: 'Reach for the next vine! Two hands zoom up!',
    pods: 'Hear it creak? Scoot a vine over!',
    figs: 'Climb under the figs and push them free!',
  });
  const M = kitLib14().manifest;
  for (const k of Object.keys(LINES_14)) {
    assert.equal(M.tips?.[k], LINES_14[k as keyof typeof LINES_14], `the kit says ${k} in the keeper's words`);
    assert.ok(M.teachTips?.includes(k), `${k} is a teach line (said on Normal's default Tips)`);
  }
  for (const l of Object.values(LINES_14)) assert.ok(l.split(' ').length < 10, `under 10 words: "${l}"`);
  // the journal's 1-4 (pokeyJournal.ts), the keeper's rewrite of the squirrel lift
  assert.equal(STAGE_LINES['1-4'], JOURNAL_14);
  // Pokey's halfway line (wayside.ts, World 1 stage 4: his, at half the way)
  const half = stageLine(1, 4);
  assert.deepEqual(half && { who: half.who, text: half.text, at: half.at }, { who: 'Pokey', text: HALFWAY_14, at: 'half' });
});

test("1-4's graph passes the node code's rules with its own brief (V2 one teach a type, V11 no type over 40%, V12 windows)", () => {
  const code = Object.values(ARC_14)[0];
  const types: Record<string, string> = Object.fromEntries(SECTIONS_14.map((t) => [t.jobs?.[0] ?? '', t.content ?? ''] as const));
  assert.ok(types.arrive !== undefined && types.exit !== undefined);
  const W1 = w1World().manifest;
  assert.deepEqual(checkCode(parseCode(code), { teaches: BRIEF_14.teaches!.length, windows: W1.graphs?.windows }), []);
  // every content job of the arc is served by exactly one of 1-4's own sections (one brick a beat: a roll cannot reorder the level)
  for (const job of ['teach', 'practise', 'descent', 'climb', 'test', 'flow', 'twist', 'signature', 'combine'] as const) {
    const n = SECTIONS_14.filter((t) => t.jobs?.includes(job)).length;
    assert.equal(n, job === 'teach' ? 4 : 1, `${job}: ${n} sections`);
  }
  // and the brief's deal is the arc's own: as many of each type as the beats that are that type
  const deal = BRIEF_14.deal!;
  const beats = SECTIONS_14.filter((t) => t.jobs?.some((j) => j !== 'rest' && j !== 'arrive' && j !== 'exit'));
  for (const [type, pc] of Object.entries(deal)) {
    const n = beats.filter((t) => t.content === type).length;
    assert.ok(Math.abs((pc / 100) * beats.length - n) < 0.6, `${type}: ${pc}% of ${beats.length} beats is ${n}`);
  }
});

test("1-4's pool is its own: every section in it is 1-4's, and no other stage's pool holds one", () => {
  const M = kitLib14().manifest;
  const pool = stagePool(M, STAGE_14).map((t) => t.id).sort();
  assert.deepEqual(pool, SECTIONS_14.map((t) => t.id).sort());
  for (const id of ['1-1', '1-2', '1-3', '1-5']) assert.equal(stagePool(w1World().manifest, id).filter((t) => t.id.startsWith('w1-14-')).length, 0, `${id}'s pool holds none of 1-4's`);
});

test('Easy is never harder than Normal: no more figs on a gate, the same field and pods, tells longer, pods only knock', () => {
  for (const [id, row] of Object.entries(FIELD_ROWS)) {
    const easy = row.easyFigs ?? row.figs;
    assert.ok(easy.length <= row.figs.length, `${id}: Easy's figs ${easy.length} <= Normal's ${row.figs.length}`);
    if (row.figs.length >= 2) assert.equal(easy.length, row.figs.length - 1, `${id}: a gate of two or more is one fewer on Easy (1-4.md "Easy")`);
  }
  const [steady, quick] = beats14(400);
  for (const b of [steady, quick]) {
    assert.ok(Math.abs(warnLength(b, false) - PODS_14.tell) < 1e-9 && PODS_14.tell >= POD.tellMin, `${b.id}: the ${PODS_14.tell} s tell Matt saw, on Normal (never under POD.tellMin)`);
    assert.ok(warnLength(b, true) >= PODS_14.tell * 1.5 - 1e-9, `${b.id}: longer on Easy`);
  }
});

/** a laid field section as the pipeline would hand it (pieces tagged uid:key), for the finish */
function laidField(template: string, uid = 's7', x0 = 200, footY = 2000): Parameters<typeof finish14>[0] & { platforms: Platform[]; vines: Vine[] } {
  const row = FIELD_ROWS[template];
  const W = 120 + (row.n - 1) * GAP;
  const foot: Platform = { id: 1, x: x0, y: footY, width: W + 200, height: 24, type: 'solid', tag: `${uid}:${row.foot ?? 'foot'}` } as Platform;
  const top: Platform = { id: 2, x: x0, y: footY - row.H, width: W, height: 24, type: 'solid', tag: `${uid}:top` } as Platform;
  const vines: Vine[] = [];
  for (let i = 0; i < row.n; i++) vines.push({ id: i + 1, x: x0 + 60 + i * GAP, topY: footY - row.H, bottomY: footY, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', tag: `${uid}:f${i + 1}` });
  // (the lay's own climb up from the top bough, a storey's turn)
  vines.push({ id: 99, x: x0 + W - 20, topY: footY - row.H - 300, bottomY: footY - row.H, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' });
  return { platforms: [foot, top], vines, gen2: { sections: [{ uid, template }] } };
}

test('the finish lays a fair field from the keys: field vines, figs on their vines, the gate shut by them with its way up held, pods on the beat, by setting', () => {
  for (const easy of [false, true]) {
    const st = finish14(laidField('w1-14-under-fire'), easy ? 'easy' : 'normal');
    const row = FIELD_ROWS['w1-14-under-fire'];
    assert.ok(st.vines.filter((v) => v.id !== 99).every((v) => v.field === true), 'every vine of the field is a field vine');
    assert.equal(st.vines.find((v) => v.id === 99)!.field, undefined, "the lay's own climb is not");
    assert.equal(st.clusters!.length, easy ? 1 : 2, 'a gate of two (Easy one)');
    assert.equal(st.gates!.length, 1);
    assert.deepEqual(st.gates![0].ways, [99], 'the way up from the shut bough is held with it');
    assert.equal(st.pods!.length, row.pods.length);
    assert.ok(st.pods!.every((p) => p.cost === (easy ? 'knock' : 'heart')), `pods cost ${easy ? 'a knock' : 'a heart'}`);
    assert.deepEqual(podFaults(st.pods!, st.clocks!, st.vines, st.platforms, FIELD_FEEL.reach, easy), []);
  }
  // planted: a row whose pods leave no free vine (all five columns) is refused by the finish (a roll that cannot be laid fair is never listed)
  const saved = FIELD_ROWS['w1-14-under-fire'].pods;
  FIELD_ROWS['w1-14-under-fire'].pods = [1, 2, 3, 4, 5].map((vine, i) => ({ vine, shift: i * 1.8 }));
  try {
    assert.throws(() => finish14(laidField('w1-14-under-fire'), 'normal'), /no free vine|within 1.5 s/);
  } finally {
    FIELD_ROWS['w1-14-under-fire'].pods = saved;
  }
  // planted: a laid section missing a vine its row names
  const broken = laidField('w1-14-pods');
  broken.vines = broken.vines.filter((v) => v.tag !== 's7:f3');
  assert.throws(() => finish14(broken, 'normal'), /no vine f3/);
});

test("the view north dresses the squirrels' nest door in the crown bough (the hand-built 1-4's door kept in the game)", () => {
  const crown: Platform = { id: 5, x: 400, y: 900, width: 420, height: 24, type: 'solid', tag: 's16:crown' } as Platform;
  type Dressed = { proto?: { kitDecor?: Array<{ n: string; open?: string; x: number; b: number }> } };
  const st = finish14({ platforms: [crown], vines: [], gen2: { sections: [{ uid: 's16', template: 'w1-14-view-north' }] }, proto: {} }, 'normal') as Dressed;
  assert.deepEqual(st.proto!.kitDecor!.map((d) => [d.n, d.open, d.x, d.b]), [['nestDoorShut', 'nestDoorOpen', 750, 908]]);
  // (planted: no crown bough laid, no door)
  assert.equal((finish14({ platforms: [], vines: [], gen2: { sections: [{ uid: 's16', template: 'w1-14-view-north' }] }, proto: {} }, 'normal') as Dressed).proto!.kitDecor, undefined);
});

test('every field row is in reach (vines GAP apart, under two hands\' reach) and every pod has the time to fall its column', () => {
  assert.ok(GAP <= FIELD_FEEL.reach && GAP >= 70, `fields 70-90 px apart (${GAP})`);
  for (const [id, row] of Object.entries(FIELD_ROWS)) {
    assert.ok(row.H <= POD.catchBelow, `${id}: sound wood within 450 px under every point (${row.H})`);
    for (const f of [...row.figs, ...(row.easyFigs ?? [])]) assert.ok(f.vine >= 1 && f.vine <= row.n && f.over > 0 && f.over < row.H - 60, `${id}: a fig bunch on a vine of the field, under its top`);
    for (const p of row.pods) assert.ok(p.vine >= 1 && p.vine <= row.n, `${id}: a pod down a column of the field`);
  }
});

/** from a section's pieces, the way from a creaking stair's foot to the bough it climbs to that is NOT the stair: a sound vine standing on
 *  that foot whose top reaches the bough's height under its span (pieces placed 'over'/'climb' on the foot, by the foot's width) */
function sureWayUp(t: (typeof SECTIONS_14)[number]): string | null {
  const n0 = (r: unknown) => (Array.isArray(r) ? r[0] : r) as number;
  const pl = (p: (typeof t.pieces)[number]) => p.place as unknown as { kind: string; on?: string; at?: unknown; dy?: unknown; h?: unknown };
  const W = n0(t.pieces.find((p) => p.key === 'foot')!.w);
  const overFoot = (p: (typeof t.pieces)[number]) => pl(p).kind === 'over' && pl(p).on === 'foot';
  const steps = t.pieces.filter((p) => p.creak && overFoot(p));
  if (!steps.length) return 'no stair';
  const rise = Math.max(...steps.map((p) => -n0(pl(p).dy)));
  // the bough the stair climbs to: the next piece over the foot, higher than every step
  const top = t.pieces.find((p) => !p.creak && overFoot(p) && -n0(pl(p).dy) > rise)!;
  const y = -n0(pl(top).dy), x0 = n0(pl(top).at) * W, x1 = x0 + n0(top.w);
  const vine = t.pieces.find((p) => p.shape === 'vine' && pl(p).kind === 'climb' && pl(p).on === 'foot' && n0(pl(p).at) * W >= x0 && n0(pl(p).at) * W <= x1 && n0(pl(p).h) >= y - 10);
  return vine ? null : `nothing but the stair reaches the bough ${y} px over the foot`;
}

test('no creaking stair strands him: beside every stair a sound vine climbs from its foot to the bough it leads to (planted: kid Normal seed 16 at the crown, POLISH-1 11-13)', () => {
  // (a step gives at the creak's hold, and a fall onto the stair's own foot is no set-back (engine.ts crumbledWhole runs on a set-back
  //  only), so with the stair alone two broken steps left him under the bough until they grew back off screen: level.md rule 5)
  const stairs = SECTIONS_14.filter((t) => t.pieces.some((p) => p.creak && p.place.kind === 'over' && (p.place as unknown as { on: string }).on === 'foot'));
  assert.ok(stairs.some((t) => t.id === 'w1-14-crown'), 'the crown has its rotten stair');
  for (const t of stairs) assert.equal(sureWayUp(t), null, t.id);
  // planted: the crown without its sure vine is the stranding case, and the check says so
  const crown = SECTIONS_14.find((t) => t.id === 'w1-14-crown')!;
  assert.match(sureWayUp({ ...crown, pieces: crown.pieces.filter((p) => p.key !== 'sure') }) ?? '', /nothing but the stair/);
});

// Matt's pick waits (11-14): the pods as the mocks showed them, or none. Every number is PODS_14's, and `on: false` lays no pods
// (planted both ways on the real finish).
test('the pods are PODS_14\'s: speed, tell and beats from the one block; on: false lays none (Matt\'s other choice, one line)', () => {
  const st = finish14(laidField('w1-14-pods'), 'normal');
  assert.ok(st.pods!.length > 0 && st.pods!.every((p) => p.speed === PODS_14.speed), 'every pod falls at PODS_14.speed');
  assert.equal(PODS_14.speed, 300, 'the mock Matt saw: 300 px/s (was 620)');
  for (const c of st.clocks!) {
    const period = c.phases.reduce((a, q) => a + q.seconds, 0);
    assert.ok((Object.values(PODS_14.beats) as number[]).some((b) => Math.abs(b - period) < 1e-9), `${c.id}: its beat is PODS_14's (${period})`);
  }
  const was = PODS_14.on;
  (PODS_14 as { on: boolean }).on = false;
  try {
    assert.equal(finish14(laidField('w1-14-pods'), 'normal').pods!.length, 0, 'on: false lays no pods');
  } finally {
    (PODS_14 as { on: boolean }).on = was;
  }
});

// ── the 80 px vine-top rule (R-165.206, FIX-14c; level.md rule proposed): every climbable vine on every shipped roll, Normal and Easy,
// keeps TOP_ROOM of ledge between its top (and its foot, the ledge he walks along to it) and any OPEN end (vineTop.ts topRoomShort: touching pieces are one ledge, the stage's edge and a
// step beside are no end). Before: the crown's sure vine 20 px from the mid's end over the stair on every roll; every field's end vines
// 60 px (MARGIN) from their top bough's ends; drop-one's vines squeezed 55 px apart, its first 17 px from the end.
test('every climbable vine on every shipped 1-4 roll, Normal and Easy, tops out and stands TOP_ROOM (80 px) or more from any open end of its ledge (planted: the crown\'s sure vine back at 20 px; a link vine\'s foot back at 18)', () => {
  const seeds = provenSeeds('1-4');
  assert.ok(seeds.length >= 100, `1-4's proven list (${seeds.length})`);
  const row = listedStage('1-4')!;
  const cfg = levelConfig('1-4');
  const bad: string[] = [];
  let n = 0;
  let planted = false;
  let plantedFoot = false;
  for (const seed of seeds) {
    for (const difficulty of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty });
      const W = st.gen2.tower!.width;
      for (const v of st.vines) {
        if (v.vineType !== 'tree_climb') continue;
        n++;
        const m = topRoomShort(v, st.platforms, W) ?? topRoomShort(v, st.platforms, W, 'foot');
        if (m) bad.push(`seed ${seed} ${difficulty} ${(v as { tag?: string }).tag ?? ''}: ${m}`);
        // planted (once): the crown's sure vine where it stood until 11-14, 20 px in from the mid's end over the stair
        if (!planted && (v as { tag?: string }).tag?.endsWith(':sure')) {
          const t = topRoom(v, st.platforms, W)!;
          const end = t.openLeft ? t.x0 + 20 : t.x1 - 20;
          assert.match(topRoomShort({ ...v, x: end }, st.platforms, W) ?? '', /20 px to the open/, 'planted: the sure vine at 20 px is caught');
          planted = true;
        }
        // planted: a tower link vine (untagged) back where the lay stood it until 11-14, 18 px from the open tip of the ledge he walks along
        if (!plantedFoot && !(v as { tag?: string }).tag && !v.field) {
          const t = footRoom(v, st.platforms, W);
          if (t && t.openRight !== t.openLeft) {
            const x = t.openRight ? t.x1 - 18 : t.x0 + 18;
            assert.match(topRoomShort({ ...v, x }, st.platforms, W, 'foot') ?? '', /18 px to the open/, 'planted: a link vine 18 px from its ledge\'s tip is caught');
            plantedFoot = true;
          }
        }
      }
    }
  }
  assert.ok(planted, 'the crown\'s sure vine was found on a roll');
  assert.ok(plantedFoot, 'a link vine was planted');
  assert.ok(n > 1000, `vines checked (${n})`);
  assert.deepEqual(bad, []);
});
