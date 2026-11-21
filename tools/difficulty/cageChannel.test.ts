// BUILD-23d: the meter prices a CAGE (ENG-CAGE REPORT NEXT STEP 1; meter-coverage.json beat:cages.channel = score.ts#cageChallenges).
// Any world's reed cage by its data: at his height a self-paced stop and punch (CAGE_BITS.punch); hung up a climbing vine (2-3's mooring
// post) the climb plus the punch from the vine, in the engine's airKick reach (fight.ts MOVES; CAGE_BITS.vine). The real roll is 2-3's.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAGE_BITS, OTHER_BITS, cageChallenges, cageVine, scoreStage } from './score.ts';
import type { Beat } from '../inspect/beats.ts';

const vine = (x: number, topY: number, bottomY: number) => ({ id: 1, x, topY, bottomY, vineType: 'tree_climb' });
const beat = (x: number): Beat => ({ t: 1, x, y: 600, letter: 'P', what: 'free a caged animal', fam: 'beat:cages' }) as unknown as Beat;

test('cageVine: a cage beside a climbing vine, in his airKick reach, hangs up it; one at his height, out of reach, or by a swing does not', () => {
  const v = vine(1000, 300, 640);
  assert.equal(cageVine({ x: 1045, y: 450 }, [v]), v, 'the post\'s shelf, 45 px right of the rope');
  assert.equal(cageVine({ x: 1045, y: 620 }, [v]), null, 'at the vine\'s foot: struck at his height');
  assert.equal(cageVine({ x: 1300, y: 450 }, [v]), null, 'out of his blow\'s reach');
  assert.equal(cageVine({ x: 1045, y: 450 }, [{ ...v, isSwingingVine: true }]), null, 'a swing is not a climb');
});

test('cageChallenges: a punch at his height, the climb plus a punch up a vine; a retry, never a heart; only beat:cages', () => {
  const st = { collectibles: [{ type: 'cage', x: 500, y: 600 }, { type: 'cage', x: 1045, y: 450 }], vines: [vine(1000, 300, 640)] };
  const out = cageChallenges(st, [beat(510), beat(1040), { ...beat(2000), fam: 'beat:relics' } as Beat]);
  assert.deepEqual(out.map((c) => [c.kind, c.bits, c.cost, c.threat]), [['cage', CAGE_BITS.punch, 'retry', false], ['cage-vine', CAGE_BITS.vine, 'retry', false]]);
  assert.equal(CAGE_BITS.vine, OTHER_BITS.climb + CAGE_BITS.punch);
  // (planted: the vine taken away, the post's cage is priced as one at his height)
  assert.equal(cageChallenges({ ...st, vines: [] }, [beat(1040)])[0].kind, 'cage');
});

test('2-3 end to end (seed 1, both settings): its five cages priced by the cage channel, the mooring post\'s one up its vine; beat:cages a piece', () => {
  for (const s of ['normal', 'easy'] as const) {
    const r = scoreStage('2-3', s, 1, new Map());
    assert.equal((r.count.cage ?? 0) + (r.count['cage-vine'] ?? 0), 5, `${s}: ${JSON.stringify(r.count)}`);
    assert.equal(r.count['cage-vine'], 1, `${s}: the post's cage`);
    assert.ok(r.pieces.includes('beat:cages'), r.pieces.join(','));
    assert.equal(r.challenges.filter((c) => c.kind === 'puzzle' && /caged animal/.test(c.note)).length, 0, 'no cage left at the old puzzle price');
  }
});
