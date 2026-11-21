# 2-3 Stuck in the Reeds ("Walk Them Home"): the player lines, approved by the story keeper (KEEPER-23-29, 11-18)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet KEEPER-23-29, written
by the lead 7:40 PM ET 11-18). For 2-3's build (the design is origin/t-design-23 reference/design/2-3.md: the arc :28-41, first
appearances :45-46, the spooked one :47-48, the goal and the locked gate :50-51, "For the story keeper" :82-84).
Read for this: reference/story/STORY-KEEPER.md (§2 the bible, §3 Dot's rules, §7 checks), World 2's voice (w2Arc21.ts LINES_21,
w2Arc22.ts LINES_22, w2.ts W2_TIPS, origin/t-keeper-24 lines-2-4.md), the goal words (stagePlan.ts:68 the 2-3 row, goalLine :197,
SEALED_LINES :208, GOAL_WORDS :216, countWord :233; goals.ts:91), the old 2-3 rows (dotLinesData.ts:147, 148, 174, 181;
stageClue.ts:29; pokeyJournal.ts:62), the cage lesson (lessons.ts:205-213, dotLinesData.ts:17), the journal cap (journal.test.ts:29-33),
the banned words (playerText.test.ts:35 BANNED; whatsNew.test.ts:28 is What's New only), STAGE-RULES.md:276 (speech boxes under 10
words). All checked on origin/main 6e7b85f8f. Counts are `wc -w`.

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `follow` | Dot, TEACH, 800+ px before cage 1 (beat 1), on the arrival bank | Punch a cage open. They'll follow you home! | 8 |
| 2 | `heron` | Dot, TEACH, 800+ px before beat 2 (the heron's first look, freeFirst), as the heron comes on screen | The heron wants little ones! Into the reeds! | 8 |
| 2 | `look` | Dot, said right after `heron` (the row's second line, dotLinesData's `then`) | Go right after it looks. Wait for everyone! | 8 |
| 3 | `spooked` | Dot, the FIRST time a little one is spooked in the stage (WatchZone.setback); later spooks are Help only | One got spooked! Go back and get it! | 8 |
| 4 | `missingCage` | Dot at the LOCKED gate when a cage is still shut (said in place of goalLine's 'sealed') | One's still in its cage! Back we go! | 8 |
| 4 | `missingReed` | Dot at the LOCKED gate when no cage is shut but a spooked one waits at its reed | One's still hiding in the reeds! Back we go! | 9 |
| 5 | `post` | Pokey, once, at the foot of the mooring post (beat 5) as the line stops behind him, before he climbs | Everybody wait here. This part is sloth work. | 8 |
| 6 | `home` | Dot, quiet (no exclamation, typed at her slowest), once, as the last little one reaches its family on the jetty (beat 8) | They're home. Nobody was late. | 5 |
| 7 | `heronCard` | the journal: the heron's tip (card name **Cocoi Heron**; 12 words, journal.test.ts:31's cap) | Waits like a statue to catch fish. Move right after it looks. | 12 |
| 8 | `mission` | the stage card (stagePlan.ts:68, replaces "Free {n} little ones caught in the reed cages."; no {n}: Normal 5, Easy 3) | Free the little ones and walk them home, past the heron. | 11 |

The goal words (ask 4's other half), as FIXED lines for 2-3's goal, not goalLine's template: the template (stagePlan.ts:197-203) with a
two-word verb makes 'late' 11 words, over the speech box's 10 (STAGE-RULES.md:276):

| Key | goalLine form | Line | Words |
|---|---|---|---|
| `goalStart` | 'start' | Walk {n} little ones home to open the sanctuary | 9 |
| `goalLate` | 'late' | Still {n} little ones to walk home | 7 |
| (none) | 'sealed' | never said in 2-3: `missingCage` / `missingReed` replace it | |

{n} is the goal's live count (Normal 5, Easy 3); with n = 1, "little one" (the builder's plural, as goalLine's `one`). The HUD's count
word (countWord) is **`home`** ("3/5 home").

Two stage texts the new design makes false, replaced (the keeper's call, as 2-4's conflict 6):

| Key | Where | REPLACES | Line |
|---|---|---|---|
| `page` | Pokey's journal page `'2-3'` (pokeyJournal.ts:62) | "Little ones hung in reed cages over the river. I let each one down gently. Gently is my only speed." | Led a line of little ones home past a heron. For once I was the fast one. I waited for them anyway. |
| `clue` | the Stage Cleared clue `'2-3'` (stageClue.ts:29), title stays **Wet Footprints** | 'Little wet footprints run off into the reeds, very fast, very grateful.' | Little wet footprints run up the jetty, very fast, very grateful. |

Code form for the builder: `'2-3': "Led a line of little ones home past a heron. For once I was the fast one. I waited for them anyway.",`
and `'2-3': C('Wet Footprints', 'Little wet footprints run up the jetty, very fast, very grateful.'),`.
The page is 22 words (pokeyJournal.test.ts:38 allows 8-23) and opens "Led" (pokeyJournal.ts `opener`: not 2-2's "Picked", 2-4's
"Dropped" (lines-2-4.md) or 2-7's "Walked", so no two pages on World 2's spread open alike).

Ids for the kit, as 2-1's (w2Arc21.ts lineId21): `w23.follow`, `w23.heron` (then `w23.look`), `w23.spooked`, `w23.missingCage`,
`w23.missingReed`, `w23.post`, `w23.home`, `w23.goalStart`, `w23.goalLate`; MISSION_23 for the card. TEACH lines (said on Normal's default Tips as on Help, D50):
`follow`, `heron` + `look`, `spooked` (dotTips.ts:6-7: a new hazard's warning, the first time). The locked-gate lines are "why an exit
is locked (always)" (dotTips.ts:8). `post` and `home` are story moments the player must get on every setting: see "For the builder".

## Why each one, and its one-line check

1. **follow.** The stage's one new idea (design :45, "the followers... the cage IS the teach"). "Punch" is the cage lesson's own word
   (lessons.ts:211 "Punch the cage"), so the move has one name; the thumb word ("Tap twice", dotLinesData.ts:17) stays the lesson card's,
   one tip, one channel. The new half, "They'll follow you home!", is what the card does not say. *Check: 8 words; no control word (tap,
   flick, press, hold); true (each little one follows once freed, design :32).*
2. **heron + look.** The design's three ideas (who it wants, the lesson, the tail) in two boxes under 10 words each, said back to back
   (the row's `then`, dotLinesData.ts:6-7). `heron` puts the danger on THEM, never on Pokey (design :4, "it wants THEM"), and gives the
   one safe place, the reeds, in 1-7's grammar ("get in the green", LINES_17.bush). `look` is the flown lesson verbatim, "go right after a
   look" (design :21, "Going on the warn fails from G 350 up"), then "wait for everyone", the tail that bunches 0.3-2.0 s after he stops
   (design :21). Not "when it looks away": the heron's head-down pose is an art ask that may not land (design :80-81), so the line names
   the look itself, which every version shows. *Check: 8 + 8 words; no "slow", "hurry", "too"; nobody hurt in the words (the heron
   never takes a heart, design :46).*
3. **spooked.** What happened and the fix, nothing else: the hiding one is DRAWN at its reed (design :47-48), so "go back" plus the
   picture says where. No heart lost, so no alarm word. *Check: 8 words; said once (the first spook); later spooks are reminders, Help
   only (dotTips.ts:11).*
4. **missingCage / missingReed.** Dot explains any locked exit (CLAUDE.md stage rules; design :51 "who is missing and where"). The
   design leaves exactly two ways to arrive short: a cage left shut (cage 4 is up the post, skippable) or a spooked one left at its
   reed; a lost heart re-forms the whole line, spooked ones included (design :48-49), so nobody else can be missing. Each line names who
   and where; "Back we go!" is Dot's locked-exit turn from World 1 (SEALED_LINES '1:vine_runner', stagePlan.ts:210), so a locked
   gate sounds the same across worlds. *Check: 8 and 9 words; true in both cases; no count (the HUD shows it, stagePlan.ts:206).*
5. **post.** Pokey, because he is the one the little ones follow, and he is talking TO them; Dot is present but this is his job (Pokey
   already speaks in World 2: 2-2's `lily`, 2-4's `view`). It tells the player the line will wait (they never climb, design :62; the line waits at the foot, :37), and
   it is the slow smart-ass on the one thing a sloth is built for, deadpan, not a joke with a button. *Check: 8 words; said before the
   climb, on flat ground, so the box covers no jump (STAGE-RULES.md:276).*
6. **home.** The design's "They're home." (beat 8, :40) and Dot's dead stop "when something is real" (STORY-KEEPER §2, Dot). "Nobody was
   late" is a plant, not a joke: Dot's secret is that she was late for Pokey's parents (STORY-KEEPER §2 "What happened, in order";
   the ending's "I was late, Pokey. For them.", STORY-REWRITE:1647-1866). On the stage where little ones come home to their families,
   the one who wasn't on time once says the quiet thing; a player who finishes the game hears it again. No reveal: it names nothing.
   *Check: 5 words; true on Easy too (it speaks of the ones who came home, not of five); once, after the last one, so it covers no move.*
7. **heronCard.** Fact-checked (below). The game's rainforest is the Americas' (the journal's cards: Golden Eyelash Viper, Harpy Eagle,
   Tayra, Spectacled Caiman; journal.ts:27-37), so the heron is South America's own big grey heron, the cocoi. The first sentence is the
   fact (it hunts by standing still); the second is the stage's lesson, as the capuchin and eaglet cards carry theirs (journal.ts:57-58).
   *Check: 12 words, the cap; no key words; true.*
8. **mission.** The stage's idea in the player's words (design :2-3: "the one where the babies follow you and you hide them from the
   heron"): free them, walk them home, mind the heron. The old line counts what is freed, but the new goal counts who gets HOME
   (design :50), so "Free {n}" would read wrong. No number: Normal 5, Easy 3, and the HUD gives the count (stagePlan.ts:20-22). *Check:
   11 words on a card; no "defeat", no count, no "wait".*

Goal words: "walk ... home" is the stage's own verb (its title, "Walk Them Home", design :1), and "little ones" is the stage's own name for them (dotLinesData.ts:174, the old `hint.2-3.open`). The HUD's "home" is what is
counted (design :50: "counts when it reaches the exit with him (not when freed)").

**page** and **clue.** The old page has them hung "over the river" and let down "gently": the design has cages on banks, a post and a
stone bank, punched open, and a walk home. The new page keeps the old page's shape (what happened, then the deadpan turn) and lands
the stage's hook (design :3, "here he is the fast one"); "I waited for them anyway" is the kind half, not a button. The clue keeps its
title and its last four words; only where the footprints go changes (the jetty, where the families wait, design :40).

## Nature check (the journal card)

- Cocoi heron (*Ardea cocoi*): the largest heron in South America; a solitary ambush hunter that stands in shallow water and stabs
  down with its bill, mainly at fish (https://en.wikipedia.org/wiki/Cocoi_heron, read 11-18). "Waits like a statue to catch fish" is
  the ambush hunt; nothing on the card claims it eats ducklings.
- For the art (not a line): the cocoi has a black cap and a white neck; dressnew-w2#w2Heron (design :78) should read as one, or the
  card is named for what the picture shows. The lead's call.

## Conflicts found, and the keeper's call

1. **Goal key:** SEALED_LINES and GOAL_WORDS are keyed by world and type (stagePlan.ts:215-228). 2-7 "Before the Water Rises" is ALSO
   `rescue` in World 2 (stagePlan.ts:73), so a `'2:rescue'` entry would put "bring home" and the missing lines in 2-7. 2-3's goal is
   the design's NEW goal ("bring N home", goals.ts NEW 1), so its words hang on that goal type (or on the stage), never on '2:rescue'.
2. **The lesson card and Dot:** `hint.2-3.cage` (dotLinesData.ts:147, "Tap twice to break the cage") repeats `lesson.cage`
   (dotLinesData.ts:17) word for word: retired. `follow` does not restate the thumb move.
3. **Old 2-3 rows the design makes false:** `hint.2-3.post` (:148, "The last one is up the post": cage 4 of 5 is, design :37) and
   `hint.2-3.open` (:174, the goal said as "Free them!", now `follow` and the mission): retired. `way.2-3` (:181) stays: true, and the
   reeds are the stage.
4. **Who speaks:** STAGE-RULES.md:277 says Pokey speaks only where Dot is away; `post` is Pokey speaking to the little ones, which only
   he can (Dot is not the one they follow). Same call as 2-4's `view` and 2-2's `lily`.

## For the builder and the lead (code, not words; the keeper does not edit code)

- **New replaces old when 2-3 ships:** dotLinesData.ts:147 `hint.2-3.cage`, :148 `hint.2-3.post`, :174 `hint.2-3.open`; stagePlan.ts:68's
  desc (line 8; drop `goal: 5` with the {n}, or keep it for stagePlanGoals.test.ts: the builder's call); pokeyJournal.ts:62 and
  stageClue.ts:29 (page, clue). **Stay:** way.2-3 (:181), lesson.cage.
- **The locked gate picks its line by state:** any cage still shut, `missingCage`; else a spooked one waiting, `missingReed`. A stage
  with neither cannot be locked short (design :48-49, :51).
- **D50:** `post` and `home` are said in every Tips setting, as their beats need them (the player must know the line waits; the
  homecoming is the stage's signature). If the Tips filter (dotTips.ts) would drop them as chatter, they go on the stage's own beat
  (as 2-4's `view`), and a test proves they are said on Normal's default Tips.
- **The heron card:** a road card needs its own painted picture (journal.test.ts:18-24): the heron's painted sheet (design :78) can be
  it. The lead's call; the words fit either way.
- **The lines live in one object** (LINES_23 with goalStart / goalLate, MISSION_23) in 2-3's world file (w2Arc23.ts) with a verbatim test that
  parses this table, as w2Arc21.ts / w2Arc21.test.ts do.
