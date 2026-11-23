// Easy's flags on a stage with a ROUTE (ENG-HUD27 item 3; 2-7 Easy seed 1: easyMode.test 'Easy broke the stage: checkpoints are out of
// order'). easyMode.ts fills a flag into every gap of FLAG_EVERY or more between the flags and orders them; it measured both by x, and on
// a stacked out-and-back (gen2/toyHome.ts, 2-7's shape: the way home laid UNDER the way out, sharing its x) an x gap runs across two
// legs, so the flags it added, sorted by x, broke the route's order the engine and the level check take them in (gen2/tower.ts
// flagFurther, levelCheck.ts 'checkpoints are out of order'). Now measured along the route (routeAt). Proven on the toy, every laid
// roll of both codes: each flag further along the route than the one before, no order error, and Easy still adds its flags; RED on
// the x measure (every roll out of order).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { homeKit, HOME_CODE, POST_CODE } from './toyHome.ts';
import { flagFurther, routeAt, type Route } from './tower.ts';
import { easyStage } from '../easyMode.ts';
import { validateStage } from '../levelCheck.ts';
import { homeCfg, HOME_ID } from '../../../tools/inspect/homeToys.ts';

test("Easy's flags on a stacked out-and-back are filled and ordered along the route: in the route's order on every roll, and still added (the toy, both codes); RED by x", () => {
  let laid = 0;
  for (const [name, code] of [['home', HOME_CODE], ['post', POST_CODE]] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const st = buildGen2Stage({ config: homeCfg, kit: homeKit(HOME_ID, code), seed, difficulty: 'easy' });
      if (st.gen2.errors.length) continue;
      laid++;
      const at = `${name} seed ${seed}`;
      const before = (st.checkpoints ?? []).length;
      const easy = easyStage(st);
      const route = (easy as { gen2?: { tower?: { route?: Route } } }).gen2!.tower!.route!;
      const cps = easy.checkpoints ?? [];
      assert.ok(cps.length > before, `${at}: Easy adds flags on a routed stage too (${before} to ${cps.length})`);
      for (let i = 1; i < cps.length; i++) {
        assert.ok(flagFurther(easy, { further: () => false }, cps[i], cps[i - 1]), `${at}: flag ${i} at x ${cps[i].x}, y ${cps[i].y} (route ${Math.round(routeAt(route, cps[i].x, cps[i].y))}) is further along the way than flag ${i - 1} at x ${cps[i - 1].x}, y ${cps[i - 1].y} (route ${Math.round(routeAt(route, cps[i - 1].x, cps[i - 1].y))})`);
      }
      assert.deepEqual(validateStage(easy).errors.filter((e) => /checkpoints are out of order/.test(e)), [], at);
    }
  }
  assert.ok(laid >= 6, `the toy lays on most rolls (${laid} of 8)`);
});
