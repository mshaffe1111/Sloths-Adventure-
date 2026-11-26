# 2-8 Before the Water Rises ("Walk Them Home", the flood): the player lines, approved by the story keeper (KEEPER-28, 11-26)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet KEEPER-28,
reference/packets/2026-11-26/KEEPER-28.md on the lead's branch). Started 5:30 PM ET 11-26 (the session hook's date).
For BUILD-28's lay (the plan: reference/qa-reports/BUILD-28/REPORT.md READY-28 on t-build-28-wip c0e6034fe; the design:
origin/t-design-26 reference/design/2-8.md: one idea :2, nobody is hurt :4, the story asks :68-69, "the water you SEE rising, never
a chase" :78). Read for this: reference/story/STORY-KEEPER.md (§7 checks); World 2's voice (origin/t-keeper-23-29 lines-2-3.md,
lines-2-9.md; origin/t-keeper-27 lines-2-7.md); W2_TIPS (w2.ts:86); the goal words (stagePlan.ts goalLine, SEALED_LINES, the 2-8 row
:87); the water warning (pipeline.ts:3873-3910 WATER_WARN, `wet` = gaps that cost a heart); the teach water (floodLay.ts:7-9: rises to
paddling depth the first frame he is over it, never drains, never turns deep); the banned words (playerText.test.ts:35 BANNED; none
used); STAGE-RULES §5b.7 (speech boxes under 10 words; tips 8 or fewer naming the thumb move; story 12 or fewer). Counts are `wc -w`.
The thumb words are the game's own: "slide" is moving (dotLinesData.ts: "Slide up and across: Run and jump", "slide the way to go").

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key (id) | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `w28.rise` | Dot, TEACH, 800 px+ before beat 2's dip (on beat 1's bank, after the first cage), said on every help setting (a new hazard's first time) | This water rises when we come near! | 7 |
| 1 | `w28.rise2` | Dot, said right after `rise` (the row's second line, dotLinesData's `then`) | It never goes down. Keep sliding through! | 7 |
| 2 | `w28.turn` | Dot, once, as the last cage (beat 6, Uc1^) opens at the steps' foot: the flood clock starts here | The river's rising! Up the steps, back home! | 8 |
| 3 | `w28.fork` | Dot, once, at the rest before the fork (beat 9), with the low road's water in view | The low road's quick, but filling. High road's dry. | 9 |
| 4 | `w28.missingCage` | Dot at the LOCKED exit when a cage is still shut (in place of goalLine's 'sealed') | A little one's still caged! Back we go! | 8 |
| 4 | `w28.missingBank` | Dot at the LOCKED exit when no cage is shut but a little one waits at the low road's near bank (set back by the close) | One's waiting by the low road! Back we go! | 9 |
| 5 | `w28.home` | Dot, quiet (no exclamation, typed at her slowest), once, as the last little one reaches its family on the jetty (beat 14) | Everyone's home. Now the river can rise. | 7 |
| 6 | `w28.mission` | the stage card (stagePlan.ts:87, REPLACES "Free more little ones before the water rises."; no {n}: Normal 7, Easy 5) | Free the marsh's little ones, then beat the rising water home. | 11 |
| 6 | `w28.goalStart` | Dot's goal line, 'start' (in place of goalLine's) | Bring {n} little ones home to open the sanctuary | 9 |
| 6 | `w28.goalLate` | Dot's goal line, 'late' (in place of goalLine's) | Still {n} little ones out on the marsh | 8 |
| 7 | `water` (REUSED) | W2_TIPS.water, said by WATER_WARN before beat 4's channel (the first water that costs a heart): STANDS, on the condition below | This river's deep. Don't touch the water! | 7 |
| 8 | `w28.floodCard` | the journal (card name **Rising Water**; 12 words, journal.test.ts:31's cap), on the drumCard/heronCard pattern | Rainforest rivers rise for months. This marsh rises in seconds. Keep moving. | 12 |

## Added by the keeper (the hand build's words go with it; these replace them)

| Key | Where | REPLACES | Line | Words |
|---|---|---|---|---|
| `w28.page` | Pokey's journal page `'2-8'` (pokeyJournal.ts:67) | "The water rose the moment I stepped in. Little ones out first. Then I remembered I don't swim." (the hand build's islands going under; false now: he wades paddling water, and sloths do swim) | Walked the little ones home while the marsh filled behind us. Sloths can swim. I'd rather not prove it. | 19 |

## Why each line is right here (the keeper's checks, STORY-KEEPER §7)

1. **rise + rise2 (the teach).** The two facts the player cannot see before it happens: the water answers HIM (floodLay.ts:8, "the
   first frame he is over it") and it stays up (:8, "never drains"). The fix in a thumb move: keep sliding, because the line paddles
   at his pace and every second he stands in it is a second off the low road later (2-8.md :19, "the line, not Pokey, sets the time").
   No alarm word: the teach water never turns deep and nobody is hurt (:4). *Check: 7 + 7 words; "sliding" is the game's move word;
   said once, 800 px+ before the dip (rule 6).*
2. **turn.** Why (the river is rising, which the player is about to SEE, :78) and the way (up the steps, then back the way he came:
   home is the spawn's jetty, /L). It is the stake of the whole home leg in one breath. *Check: 8 words; true on both settings (one
   flood clock serves both, :20).*
3. **fork.** A choice, not a rule (rule 5: the high road is always open): "quick, but filling" is the low road's trade, "dry" the high
   road's, and the water in view says how full it is. Never "hurry" and never "don't": a slow player taking the high road has done
   nothing wrong. *Check: 9 words; said at the rest, the water in view (2-8.md :49).*
4. **missingCage / missingBank.** Dot explains any locked exit. The design leaves exactly two ways to arrive short: a cage left shut,
   or a little one set back on the low road's near bank by the close (:17, :21); each line names who and where. "Back we go!" is
   Dot's locked-exit turn in every world (2-3, 2-9), so a locked exit sounds the same; the first halves differ from 2-3's so no two
   lines in the game are equal. *Check: 8 and 9 words; true in both cases; no count (the HUD shows it).* If both are true, say
   missingCage (the cage is the one he cannot see from the jetty).
5. **home.** The homecoming, quiet: the flood is no longer a threat because they are all on the jetty, so "now the river can rise"
   turns the stage's pressure into relief. Distinct from 2-3's "They're home. Nobody was late." *Check: 7 words; once.*
6. **mission / goalStart / goalLate.** The card says the one idea (2-8.md :2) in the player's words; no count (Normal 7, Easy 5).
   goalStart keeps World 2's "to open the sanctuary" so the goal reads the same as 2-3's; goalLate says where the missing ones are
   (out on the marsh: in a cage or at the low road's bank). *Check: 11, 9, 8 words. {n} as 2-3's (countWord, stagePlan.ts).*
7. **W2_TIPS.water stands for beat 4.** Beat 4's channel is the first water in 2-8 that costs a heart, and after the teach's paddling
   water the player NEEDS the difference said: "deep" and "don't touch" are exactly it. A replacement would add a second world line
   for the same thing. **Condition (BUILD-28 holds it in a test):** WATER_WARN's `wet` gaps (pipeline.ts:3878) must not include any
   flood water (the teach dip, beat 8's and 11's dips, the low road, the parade's water under the boards): those are paddling water he
   wades, and "Don't touch the water!" said before one would be false, and on Normal (first water only) it would land beside the
   teach. Test: no hint with text W2_TIPS.water has its x within WATER_WARN.lead + 40 px before any flood water's near edge, on every
   seed and both settings; and Normal's one warning is before beat 4.
8. **floodCard (Rising Water).** 2-8's new thing is the flood itself (the design's story ask (5), :69). Fact-checked: rainforest
   rivers such as the Amazon rise over months in the rainy season (the flood pulse: the várzea floodplain fills over roughly half the
   year, several metres to over ten), so "for months" is true; the game's marsh rising in seconds is the stage's own fiction, said as
   such ("This marsh"). Ends with what to do, as the heron's card does. *Check: 12 words (the cap).*
9. **page (added).** The old page is the hand build's (islands going under) and two things in it are now false: he never swims in
   2-8 (the water is paddling depth or a wall), and "I don't swim" is false for a sloth. TRUE: sloths are capable swimmers (three-toed
   sloths swim with a slow breaststroke, and they cross rivers this way). Pokey's deadpan stays. *Check: 19 words; no repeat of 2-3's
   page ("For once I was the fast one").*

## For the builder (BUILD-28)

- Ids: `w28.rise`, `w28.rise2`, `w28.turn`, `w28.fork`, `w28.missingCage`, `w28.missingBank`, `w28.home`, `w28.mission`,
  `w28.goalStart`, `w28.goalLate`, `w28.floodCard`, `w28.page`; `water` is W2_TIPS.water unchanged. Put them in w2Arc28.ts LINES_28
  (as LINES_23) and MISSION_28; one test holds each equal to this file's table, word for word.
- TEACH lines (said on Normal's default Tips as on Help): `rise` + `rise2`. Locked-exit lines are "why an exit is locked (always)".
  `turn`, `fork` and `home` are story moments the player must get on every help setting.
- The w2_book find's words (finds.ts:416, "Look along the banks in Before the Water Rises. Hurry!") are the hand build's: the find
  moves to the high road's +, so "along the banks" is false and "Hurry!" fights the fork line (the high road is never wrong). When it
  is re-placed, ask the keeper for its words with the find's real spot; I will not write a place I have not seen.
- The hand build's 2-8 rows in dotLinesData.ts (:146 hint.2-8.post, :151 eng.flood, :152-154 hint.2-8.bank/deep/open, :169 way.2-8)
  go with it. 2-8 needs a wayside aside of its own (wayside.ts, one per stage): not in this packet; ask the keeper when its spot is laid.
