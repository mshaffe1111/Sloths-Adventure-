# S1 PUSHBACK: the route fix moves 2 of 1-1's 257 proven seeds (a CI gate), so S1 cannot land as it stands

**Fact.** `npx tsx tools/engine/seedlist.ts 1-1 --check`: PASS on t-s1@8a8877a9 (before S1), FAIL on t-s1@9bb17015: seeds 28729 and 43005,
both settings, "its replay differs from its search". Isolated in two scratch worktrees: with route.ts's step-onto rule off (stepBetween)
it PASSES; with validateAsJudged reverted and the step rule on it FAILS. So the step rule alone moves them.

**Why.** The 1-1 list is searched under the quiet line (tools/engine/listRules.ts:16, `pickRoute` -> route.ts; QUIET_MAX = 4 s,
src/game/gen2/seedList.ts:33). By the truer route the two shipped rolls read 4.1 s (28729, x 1517) and 4.4 s (43005, x 28008) of
nothing to do on Normal; the old route read 4.0 s and 3.3 s. The search now refuses them and lands on other plans.

**So route.ts is an input to shipped content**, not a read-only tool: any route change re-judges 1-1's list (and every list built under
`quietJudge`). The S1 packet's "Built on: the meter; replaced this sprint by: none" missed this dependency.

**Options (the lead's call; I wait):**
- A (my pick). Rebuild the 1-1 list on the truer route (2 seeds swap, 255 unchanged; the seed list and provenIndex are shared files), then
  re-run every roll-pinning test (release.md item 6) and the tier-bot calibration again. The quiet line is Matt's rule measured more truly;
  LAWS 22 says fix the root, never loosen. Cost: about 15 min of tools plus the full suite; it changes 2 of Matt's 1-1 layouts.
- B. Land S1 without the step rule (stages.ts, validateAsJudged, era/findSweep), and hold stepBetween and its two tests for a packet that
  rebuilds the list with it. The meter's 1-2 hump then still reads a pit (the packet's done-item 1 not met).
- C. Not offered: pinning listRules to the old route is a switch keeping a known-wrong measure (CLAUDE.md "new replaces old").
