# FIX-CARD-DOWN (R-165.456): on a way down, Dot's card keeps off the drop and sits above Pokey

## EXACT NEXT STEP (box 1 hand-over; head = this commit on t-fix-card-down; fix code = 8ae26cdd9, unchanged since)
Box 1 is finishing and will record here: lockall --check (fix tree vs the base lock, 3264 builds of 102 stages) and the suite's 3 shards,
all on the frozen fix tree. A box-1 line below saying they are recorded means they are done; until then, do not re-run them.
1. Run the CI tool line on a frozen tree of this head: `npx tsx --test tools/engine/library.test.ts tools/engine/seedlist.test.ts
   tools/engine/yield.test.ts tools/inspect/travelBots.test.ts tools/engine/paintFall.test.ts`; record pass/fail here.
2. `git fetch origin t-eng-w3`; if it moved past c1008d8ed, `git merge origin/t-eng-w3` (no force; name any conflict), then on the
   merged head: tsc, `npx tsx --test src/game/dotGuideDown.test.ts` (8 GREEN), and clipcheck again (no new debt).
3. Land: `git push origin HEAD:t-eng-w3` (fast-forward/merge, no force), `git ls-remote origin t-eng-w3`; hash to the lead
   (session_01FhBbYN2CVHnFXg7XzqKXpM), no clock times.

## What changed (fix 8ae26cdd9 on base c1008d8ed)
- `GuideView.travel` (src/game/dotGuideView.ts): the stage's travel; the engine fills it from its travel mode
  (`out.travel = this.mode.travel`, src/game/engine.ts guideView), which comes from LevelConfig.travel. No stage id.
- `aheadZone` (src/game/dotGuidePerch.ts): when `travel === 'down'` the way-ahead keep-out (the law, and its soft high part) is the
  drop below him: 1.5 jumps either side, from just over the ledge he stands on (falling: from his head) to the bottom of the screen;
  on a vine, the stretch under him as well as over him. Every other travel takes the old branches untouched.
- `hoverOrder`: on a way down, above first, then behind, in front, under last.
- Who else this touches: any stage whose data says `travel: 'down'` (3-1, and stagePlan's 'The Long Drop'). Meeca's thought cloud
  (engine.ts mcProbe) has no travel and keeps its shape.

## Planted check: src/game/dotGuideDown.test.ts
- A way down, 390x844, 360x740, 844x390, 740x360: Pokey high on a ledge (where a way down's camera holds him), next ledge below.
  The card may not cover the ledge below and the air over it; upright its bottom is above his head; sideways it sits beside him above
  his feet. A run (travel unset vs 'right'): the same scene places the card at exactly the same box.
- RED on the base: 4 fail (all four way-down cases: the card sat under him, on the landing). GREEN with the fix: 8 pass.
- Sideways, honestly: on a 390-tall screen the band from the HUD to his head is shorter than the card, so it cannot sit wholly above
  his head; it sits in the band beside him, above his feet, off the drop.

## Stills (3-1's first stop; THE DARK IS NOT ON THIS BASE: t-eng-w3 has no dark yet, so the grotto is lit)
`node reference/qa-reports/FIX-CARD-DOWN/cardshoot.mjs <tree> <out> <port> <tag>` (served tree checked; base tree c1008d8ed frozen,
fix tree 8ae26cdd9 frozen). Pokey pinned at the lip of the ledge he starts on (seed 1), facing the nearest ledge below; the real line said
through the guide (engineLine). Boxes in cards-before.json / cards-after.json. Stills in stills/, each captioned "no dark on this base".
| still | card (css px) | Pokey | ledge below | verdict |
|---|---|---|---|---|
| 3-1-port-before | 16,323-342,414 | 117,244-156,287 | 162,696-360,779 | UNDER his feet, over the drop (the fault) |
| 3-1-port-after | 48,122-374,212 | same | same | ABOVE his head, under the HUD; drop and ledge clear |
| 3-1-land-before | 256,218-550,302 | 321,152-353,187 | 358,520-519,588 | UNDER his feet, over the drop |
| 3-1-land-after | 534,74-828,158 | same | same | beside him (ahead, top band), bottom above his feet; drop clear |
Polish check (looked at as on a phone): upright after is clean: the card reads under the HUD, his face and the whole drop are clear.
Sideways after: clear of him, the drop, the petals and the HUD, BUT it sits about 190 px from Dot, who stays behind him; her name tag
says whose it is, and nothing ties them. That is the old hover behaviour on every stage (the law can put the card past him and she
never follows it), not new to a way down. Proposed (the lead's call; it touches every stage, so it needs the dotbox re-shoot and
clipcheck): when the law puts a hover card more than about 120 px from her, she flies to its near corner.
LEAD: stills APPROVED (port-after, land-after). The Dot-follows-her-card point: SEEN, FILED (R-165.460), NOT BUILT, by the lead's ruling.

## Gates (fix tree, frozen src; base c1008d8ed)
- tsc: clean. Dot's tests (dotGuideDown, dotGuidePlace, dotGuide, dotBox, guideInsets, w5QA6, ciTests): 75 pass, 0 fail.
- clipcheck: PASS (83 known, the same list; no new debt; 588 s). generalitycheck, knowncheck, roadmapcheck, timecheck: PASS.
- Note (D115, own it): the fix tree was moved from 8ae26cdd9 to 490450973 while clipcheck read it; that commit adds only report files and
  src was chattr-frozen and identical, so what clipcheck reads did not change.
- lockall --check vs base lock: RUNNING (box 1 records). Suite 3 shards: RUNNING (box 1 records).
- CI tool line (box 2, 11-25 2:20 PM ET, frozen worktree of 689596d12, src and tools chattr +i): the FULL line, gates.yml:157 (42 words,
  identical on the fix tree), not only the 5 files step 1 names: 351 tests, 350 pass, 0 fail, 1 todo (chase bots' CHILD on Normal,
  OPEN, known), exit 0. The 5 files alone: 50/50. Pushback: step 1 listed the CLAUDE.md tool line, which is shorter than CI's (D96).
- t-eng-w3 at box 2's start: still c1008d8ed, so no merge is needed yet; checked again just before the landing.

## Lessons applied
D115 (frozen worktrees for the base lock, the tests and the stills), D119, D128, D134, D136 (the stills measure the drawn card's box),
CI #78 (cardshoot refuses a busy port, checks the served tree, kills it after).
