# POLISH-1 PLAN (t-polish-1 from t-int-5@e8afc05c; written 5:33 PM ET). Box 90 min / 40% context.
Order (D40: what changes 1-4's layout comes before polishing 1-4's look):
1. 1-4 bot stuck kinds left by INT-4 (top-field vines fall-back, dip 240, time-goal loop): probe each with a plain player; bot fault -> fix bot.
2. R-165.206: lengthen 1-4 at its root (its own arc data), then castBots 1-4 seeds 1-40 to the 40/40 bar.
3. R-165.209 rough spots: 1-5 first (independent of 1-4's length), then 1-4's after its layout settles. Stills upright + sideways.
WRITE files (mine alone):
- tools/inspect/firsttimer.ts, tools/inspect/towerRoute.ts, tools/inspect/figPush.ts (bot limits only)
- src/game/gen2/worlds/w1Arc14.ts, w1Arc14.test.ts, w1Arc15.ts, w1Arc15.test.ts (each level's own data)
- reference/qa-reports/POLISH-1/* (plan, report, stills)
ASK FIRST (shared, token needed): src/game/gen2/proven/seeds-1-4.ts (re-roll after lengthening, via addlevel.ts, never to pass a gate);
any draw code (w1CutArt.ts / engine.ts) if a rough spot's root is there. One line to the lead before touching either.
