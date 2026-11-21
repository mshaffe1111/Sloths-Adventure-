# KEEPER-PICK REPORT: the testers' World 1 page words approved for release 2 (R-165.343), and What's New 0.10.1
Story keeper, Opus 5.5 high. Branch t-keeper-pick from origin/t-pick-w1 ef5622725. Packet reference/packets/2026-11-21/KEEPER-PICK.md
(on ccr-ea739a2f-dfcee4). Started 9:35 AM ET 11-21 (by `date`).

## EXACT NEXT STEP
None for KEEPER-PICK. Words head (the last code commit) 1fdf0a144; the final hash is the commit that carries this report (sent to the
lead). Next: REL-0101 merges t-keeper-pick and puts reference/story/whats-new-0.10.1.md at the top of whatsNew.ts.

## Commits (t-keeper-pick)
| Commit | What |
|---|---|
| 05405038c | What's New 0.10.1 approved set, with each line's evidence (reference/story/whats-new-0.10.1.md). Sent to the lead 9:41 AM ET |
| 7d0cacd06 | chips trimmed to six on every stage; 1-6's vine-snake card and 1-8's Run card rewritten; the cap pinned in the tests |
| 1fdf0a144 | 1-8's Run card names the branch (polish fix after the still); polish stills |

## 3. What's New 0.10.1, "Count to four" (approved 9:41 AM ET; full reasons in the file)
1. River Snappers is rebuilt: the stones bite on four, so I hop off before four.
2. The snappers snap on four too. Right after one snaps, a kick sends it home.
3. No snapper is ever hurt: a kicked one just hurries off, grumpy.
4. The river’s rocks come in three painted shapes now, and no two in a row look alike.
5. The ground under the forest’s stones and stumps is tidy now, with no stray grass.
6. When I stand still to yawn, wave or scratch, I stay solid: nothing shows through me.
7. The riverbanks grow painted flowers and plants now, in place of the old bright stems.
- (a) "snap stone" cut (our name for it, not the player's). (b)/(c) "paddling", "downstream" and "huffy" cut. A kicked snapper uses the
  shared leaving glide (castPlay.ts:367), which moves away from Pokey, not with the river, and no huffy face is drawn. "home" and "grumpy"
  are Dot's own words (w2Arc25.ts:60). (d), (e) approved as written.
- (f) is NOT "no flicker". FIX-IDLE's report says a second face (about 3 frames) and doze's standing ghost stay until R-165.354, so the
  line names only the fixed part: the four standing idle clips.
- (g) avoids "every plant": ENV-W2 left the front reed layer alone.
- All lines are 90 characters or fewer and pass whatsNew.test's word regex.

## 1. Chips ("What felt hardest?"), before -> after
The bar: each stage shows at most 6 stretch chips, with Running first and Nothing last. Running stays, because it names the control the
test measures and is not a stretch. The words in brackets are the sections each chip covers (their w1Arc design names were checked by grep).
- **1-2** 7 -> 6. "the first thorns" now also covers the three caps (again: the same thorns lesson, practised). Kept: the mushroom stair,
  the long mushroom chain, the hollow by the roots, the crossing by the island, the last mushrooms. Dropped: "the mushrooms over thorns"
  (all of 1-2 is mushrooms over thorns, so the chip pointed at nothing in particular).
- **1-4** 12 -> 6:
  - the first vines up (going-up, field)
  - the rotten boughs (rotting, rotten-fork: "creaking boughs" meant the same)
  - the falling pods (pods, under-fire: the pods are what hit him)
  - pushing up the figs (push, push-two, columns, hollow: every fig gate)
  - dropping figs on the snake (drop-one: was "the figs on the snake"; now it names what he does)
  - the top of the tree (crown)
- **1-5** 7 -> 6. "the creaky limbs" covers creak-lesson and weave (was "the first creaky limb" and "the fast creaky limbs": two for
  one thing). The rest are unchanged: the hollow trunk, past the sleeping snake, the snake that woke up, the branch or the creek,
  riding the limb down.
- **1-6** 9 -> 6:
  - the first lianas (first-liana, hang-low)
  - liana to liana over thorns
  - the vine snakes (snakes-met, snake-on-vine, risers: three chips for one snake; the card's name)
  - the creaky landing
  - the vine with a face
  - the big swing over the gorge
- **1-7** 8 -> 6:
  - hiding in a bush or on moss (bush, moss: the card's own words)
  - run, stop, hide (red-green, bare-bark: bare bark is where NOT to stop)
  - the creaky limb
  - hiding on a mossy liana
  - when the eagle landed
  - the sunny gap
- **1-8** 8 -> 6:
  - the rolling nuts (teach, rhythm)
  - the first race
  - the liana swings (at-pace, tip: both are swings)
  - the high bough
  - the one place to stop (still-fork: was "the fork to stop at"; "fork" is a design word)
  - the last stretch
- **1-9** 9 -> 6:
  - freezing like a branch (forest-freeze, stair)
  - bopping a boa (miss, read-bare: the bare boa is beaten with the bop or a freeze, w1Arc19.ts:198)
  - the eagle's nest (roost, read-roost)
  - the boa under a trap
  - the two boas
  - the Old Boa
- **1-3 (CHANGED, my call; packet said keep unless wrong)** 8 -> 6:
  - It WAS wrong: "the two snakes on a log" and "the last two snakes" both read as "two snakes", for two different beats.
  - Now: the first hive · the snakes on watch (again, stone-stair: both awake snakes under a trap) · punching the snakes (other-way,
    finale: both end in his own punch, w1Arc13.ts:237-238) · the high branch · three traps in a row · the two snakes on a log.
  - The 11-12 pin test is updated to these words.
- **1-1 (CHANGED, my call)** up to 7 a roll -> 6. "bounce, then double jump" sections now read "the mushroom bounce": to a player both
  chips meant the same thing (the mushroom). Union 9 -> 8 phrases; no roll shows more than 6.
- **Flown proof**: all nine stages, 12 seeds x both settings each (216 builds), with the final table: max chips per roll = 6 on every
  stage; every phrase has 30 characters or fewer.
- **The cap, pinned**:
  - ctestPicker.test's flight test asserts `chips.length <= 6` for every offered stage, both settings, seeds 1-2.
  - ctestSurvey.test's 1-1 proven-seed test went from <= 10 to <= 6.

## 2. Move cards and alts
- **Approved as drafted:** 1-1, 1-2, 1-7 and 1-9 (all four cards each). 1-6's Grab a liana, Leap and Climb. 1-8's Jump, Little nuts and
  Big nuts. Each matches Dot's line in that stage's w1Arc file: 1-7 :56-:64, 1-8 :51-:53, 1-9 :49-:57.
- **1-6 Vine snakes, rewritten:**
  - Was: "A snake coming down? Climb down ahead of it."
  - Now: "A snake on your vine? Climb the way it goes, ahead of it."
  - Why: the draft was only half true. 1-6 also sends snakes UP (risers; Dot, w1Arc16: "Snakes coming UP now! Climb high, ahead of them.").
- **1-8 Run, rewritten:**
  - Was: the shared Run card.
  - Now: "The branch breaks behind you! Keep your thumb down and run."
  - Why: 1-8's one idea is the branch breaking (Dot: "It's cracking! Run, and don't look back!"), and no card said so.
  - My first wording, "It's cracking behind you!", read unclear on the front page before playing. Fixed after the still.
- **Alts:** all six approved. Each was checked against its still (src/assets/ui/ctest-*.webp, judged side by side): 1-1's mound,
  mushroom and petals; 1-2's caps over thorn pits; 1-6's snake coiled at the liana's foot; 1-7's two bushes and the eagle; 1-8's log under
  nut palms; 1-9's coiled boa by the nest.

## Polish check (stills/, judged at phone size)
- **1-7-up.png, 1-7-side.png:** 1-7's end questions on the real page. Its chips are the longest; Running + 6 + Nothing wrap cleanly
  (upright 5 rows, sideways 2), nothing cut off.
- **front-1-6-up.png, front-1-6-side.png:** the new vine-snake card fits in 4 lines both ways.
- **front-1-8-up.png, front-1-8-side.png:** the new Run card fits in 4 lines both ways.
- **Named, not fixed:** 1-6's Climb card runs 4 lines sideways (the shared card, unchanged).

## 4. Gates (verdict per gate)
| Gate | Head | Result |
|---|---|---|
| tsc | 1fdf0a144 | PASS |
| ctestSurvey, ctestPicker, controlTest, ctestCoach, ctestCourseGone, playerText, fonts, textSize, whatsNew | 1fdf0a144 | PASS 106/106 |
| clipcheck (the picker screens walk) | 7d0cacd06 | PASS (83 known, 401 s) |
| kbdcheck | 7d0cacd06 | PASS (111 s) |
| clipcheck (the picker screens walk) | 1fdf0a144 | PASS (83 known, 394 s) |
| kbdcheck | 1fdf0a144 | PASS (111 s) |

Not run: the rest of THE FULL SET. These are words-only data changes; the release candidate runs THE FULL SET (REL-0101). kbdcheck
rewrites its tracked stills in reference/qa/tester-page-1106/keyboard/. I restored them each time and did not commit them.

## Learned
- **Check What's New lines against the fix's own report, not its packet title.** The packet asked for "standing still without
  flickering". FIX-IDLE's report says part of that is still there until R-165.354. Promising the title would have told Matt something
  untrue.
- **Count chips by flying the stage.** The packet said to keep 1-1's and 1-3's chips, but a roll of 1-1 shows 7 and 1-3 shows 8. Only
  flying all nine showed that the 6-cap reached them too.
- **Look at the card on the page.** A line can be true and still unclear there: "It's cracking" needs the stage to explain it.

## Proposed rule change (for the lead)
- The cap ("at most 6 stretch chips a stage, plus Running and Nothing") belongs in reference/methods/level.md's testers'-page notes. It is
  enforced by ctestPicker.test, so a new stage's chips are trimmed when its arc lands, not at release.

## Lessons applied
- D30: every time comes from `date`.
- D102: read lean, as the packet listed.
- D103: ReadNotifications at the milestones.
- Law 3: every What's New claim checked in code or reports.
- Law 2: the real page, both ways.
- New replaces old: the old chip words are gone, not kept beside the new ones.
