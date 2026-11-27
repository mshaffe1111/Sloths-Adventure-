# 2-6 Up the Bank Houses ("The Water Wheels"): the player lines, by the story keeper (KEEPER-26, written 1:40 PM ET 11-21)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet
reference/packets/2026-11-21/KEEPER-26.md). For 2-6's build (BUILD-26). The design is origin/t-eng-26c reference/design/2-6.md: the idea
and the beat table :1-40, the great wheel :41, the story asks :62-66. The wheel as built: src/game/wheel.ts:1-12 (it never stops, it is
slow, the buckets ride level; the street is over the top, at the sweep's edge, or `up` px above the top floor, reached by a jump).
Checked on t-eng-26c 8b2438c7: stagePlan.ts:83 (the 2-6 card), :237-253 GOAL_WORDS (ascent has none); stageClue.ts:32; pokeyJournal.ts:65;
dotLinesData.ts:147 (`hint.2-6.climb`), :174 (`way.2-6`); wayside.ts:100; dotBox.test.ts:181-199; playerText.test.ts:35 BANNED;
pokeyJournal.test.ts:38 (stage lines 8-23 words, never opening on the stage name); journal.test.ts:31 (a tip 12 words or fewer, touch
words); whatsNew.test.ts:27-32 (90 letters, no workshop word); storyStyle.test.ts:60-85 (no semicolon, spaced hyphen, single ellipsis
character, doubled mark; missions end on a period). World 2's voice: lines-2-1.md, lines-2-2.md, lines-2-4.md, lines-2-5.md.
Words are `wc -w`, letters `${#s}` in bash. Every speech line is under 10 words (STAGE-RULES §5b.7).

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key | Who, where | Line | Words | Letters |
|---|---|---|---|---|---|
| 1 | `ride` | Dot, THE teach, 800+ px before beat 1 (the first wheel), on the millpond bank as the first wheel creaks into view | Ride a bucket up! Step off at the top. | 9 | 38 |
| 2 | `jump` | Dot, teach, 800+ px before beat 8 (the twist: the street above the top bucket) | The wheel won't reach. Jump at the very top! | 9 | 44 |
| 3 | `view` | Pokey, once, on the great wheel (beat 12) as the camera pulls out over the river, on the way UP, cleared before the bucket reaches the top (he does nothing in the bucket, so the box covers no move) | Look at it all. Didn't lift a claw. | 8 | 35 |
| 4a | journal page `noria` | the journal, a page (as 2-1's `river` and 2-2's `lily`, lines-2-1.md:18, lines-2-2.md:16) | The river turns a noria by itself. Its buckets scoop water at the bottom and pour it out at the top, up by the houses. It creaks all day. | 29 | 137 |
| 4b | journal tip `noria` | the same, if it is made a card (journal.test.ts:31's 12-word cap; card name "Noria") | The river turns it. Its buckets lift water up to the houses. | 12 | 60 |
| 4c | journal stage line `'2-6'` | Pokey's journal entry after the stage (pokeyJournal.ts:65, REPLACES "Climbed up past every front door in the village. Each one said PLEASE BE PATIENT. I already was.") | Rode the water wheels up the bank in buckets meant for water. The water didn't mind sharing. | 17 | 92 |
| 5 | dotBox.test.ts:199 | the test's moment: line 1 replaces 'Up through the village!' AND the spot is re-pointed from 'post' to 'lip' (see "Why" 5) | Ride a bucket up! | (prefix of line 1) | |
| 6 | clue `'2-6'` | the Stage Cleared clue (stageClue.ts:32, REPLACES C('A Welcome Mat', 'A mat outside the top house says TAKE YOUR TIME. They mean it.')): title **A Welcome Sign**; BUILD-26 lays a World 2 sign on the top house, as decor, reading TAKE YOUR TIME | A sign on the top house says TAKE YOUR TIME. They mean it. | 13 | 58 |
| 7 | mission card | the stage card (stagePlan.ts:83, REPLACES 'Climb up through the village houses dug into the bank.'); title stays **Up the Bank Houses**; no digit (ascent counts nothing) | Ride the village's water wheels up to the top of the bank. | 12 | 58 |
| 8 | What's New | release 3's line, 0.10.0's "is rebuilt:" form (whatsNew.ts top entry), first person | Up the Bank Houses is rebuilt: water wheels lift me up, and I step off at the top. | 18 | 82 |

**No goal line and no locked-exit line:** 2-6 is `ascent` (stagePlan.ts:83); GOAL_WORDS returns null for it (stagePlan.ts:253), so
goalLine says nothing and the exit never locks (Dot has no locked exit to explain). Nothing to write; nothing missing.

## Why (each line against the keeper's checks, STORY-KEEPER §7)

1. **ride.** World 2's teach shape (an observation, then the move: "Hear the knock? Hop on. Logs carry you!", lines-2-1.md:13). The design
   says the teach is the ride and the step-off, not the board (2-6.md:17-18: 100% of phases board), so the line spends its words there.
   "Ride" carries "it will carry you up"; "Step off at the top" is the one thing to do. True on the teach wheel: the street reaches in over
   the top (2-6.md:33). No control word (no tap, flick, press, hold).
2. **jump.** Says WHY before WHAT, so the jump makes sense the first time: the bucket stops short of the street (it is 80 px above the
   top floor, Easy 60; wheel.ts:11 'up'). True on both settings. Said 800+ px before, when the street may be off screen, so it names
   the wheel, not "that street".
3. **view.** The wonder, in Pokey's deadpan, and it lands on a real thing: he rode the whole last bank without a move (the wheel did it).
   It drops the "I", as his journal does ("Left home.", "Fell off a ledge.", pokeyJournal.ts:20-23). Not "the whole river" (wayside.ts:103,
   2-9's Pokey line) and not "what Dot sees" (2-4's `view`, lines-2-4.md:20): grepped.
4. **noria.** (a) The page in the shape of World 2's nature pages: plain facts a child can read, one sound to end on (the stage's look is
   "creaking norias dripping into the millrace", 2-6.md:28). (b) The 12-word tip if the lead makes it a card (needs its own painted
   picture, journal.test.ts:18-24; else it waits as a page beside `river` and `lily`, lines-2-4.md:143). (c) The journal STAGE line is
   rewritten as well, though the packet did not ask: the old one says he "climbed up past every front door", and in the new 2-6 the
   wheels do the climbing (rule 10, what the words promise is what happened). Past tense, his deadpan, warm; 17 words in the 8-23 cap;
   does not open on "Up the Bank Houses".
5. **dotBox.test.ts:199.** BOTH: the line is replaced by line 1, and the spot is re-pointed. 'post' finds the first vine past the hint
   (dotBox.test.ts:215-220); the new 2-6 has no post before the first wheel (the house ladder, beat 3, comes after it), so 'post' would
   stand him at the wrong place or fail. The moment is now the ride: he stands at the jetty's end before the first wheel and the way
   ahead is the wheel above him: `{ stage: '2-6', layout: 0, hint: 'Ride a bucket up!', at: 'lip' }` with the comment "(the ride moment,
   World 2: at the jetty's end before the first wheel; its way ahead is the wheel above him)". If the ground under the hint is the
   millpond bank and not the jetty, the builder uses a number (`at: <px to the jetty's end>`) instead; the words stay.
6. **clue.** Keeps the old clue's meaning and its joke ("They mean it.") and the village's running gag (PLEASE BE PATIENT, wayside.ts:100;
   2-7's card, stagePlan.ts:84); only the mat becomes a sign, which BUILD-26 lays. Narrator's voice, as every clue.
7. **mission.** Says what the stage is now (the old card says "climb ... houses"), ends on a period, no count. Same length as MISSION_25.
8. **What's New.** The 0.10.0 lines' own form ("The Boa's Branches is rebuilt: ..."), first person, 82 letters (cap 90), no workshop word.

## Nature and history check: PASS (the keeper's own knowledge; no page fetched this session)
| Thing | Verdict |
|---|---|
| A noria is turned by the river by itself | TRUE. The noria is the current-driven water wheel; one turned by an animal is a saqiya, by hand a different machine. |
| Its buckets scoop water at the bottom and pour it out at the top | TRUE. Pots or buckets on the rim fill as they dip and empty at the top into a channel (an aqueduct) that carries the water off. |
| It creaks all day | TRUE as typical: wooden norias groan as they turn, and they turn as long as the river runs (the norias of Hama, Syria are known for the sound). |
| A noria in a riverbank village | TRUE in kind: norias were built where a river runs below the fields and houses that need its water. |
| Nobody is hurt | Kept: a missed step-off rides round again, a wrong move drops him into the soft pond under the wheel (2-6.md:16-17). |

## For the builder and the lead (code, not words; the keeper does not edit code)
- **New replaces old when 2-6 ships:** dotLinesData.ts:147 `hint.2-6.climb` ("Up through the village! Slide up a post": no post, and
  "Slide up" is a control word), protoStage.ts:4859 (its old-look twin), qaW123.test.ts:136's comment; stagePlan.ts:83's mission (line 7);
  stageClue.ts:32 (line 6); pokeyJournal.ts:65 (line 4c).
- **Stay:** `way.2-6` (dotLinesData.ts:174, wayside.ts:100: the round doors and PLEASE BE PATIENT are still on the streets; "climbing past
  them" still holds, a street at a time). If the streets lay no round doors, tell the keeper and it is rewritten.
- **The lines live in one object** (LINES_26: `ride`, `jump`, `view`; MISSION_26; CLUE_26) in 2-6's world file (w2Arc26.ts), with a
  verbatim test that parses this table, as w2Arc25.ts / w2Arc25.test.ts do. TEACH_26 = ['ride', 'jump'] (said on Normal's default Tips).
- **The sign (line 6):** decor only, World 2's painted sign kind, on the top house at the crest, readable at ship size; the words on it are
  exactly TAKE YOUR TIME.

## Checked against the rules
- Speech boxes 8-9 words, under 10 (STAGE-RULES §5b.7); the tip 12; the stage line 17 (8-23); What's New 82 letters.
- Banned: none of playerText BANNED or BANNED_FILLER (pokeyJournal.ts:343); no "slow", "late", "hurry", "too" (the General's wound) and
  no "wait" in Pokey's mouth (lines-2-4.md:126).
- No control words (tap, press, swipe, flick, button, hold, duck, crouch, slide). "Ride", "step off", "jump" are move words.
- Style: no semicolon, spaced hyphen, ellipsis character or doubled mark; the card ends on a period.
- Repeats: grepped src/ for "Ride a bucket", "Step off at the top", "won't reach", "lift a claw", "Welcome Sign", "didn't mind sharing",
  "meant for water": none. "very top" is in 1-4's card ("Climb the giant kapok to the very top.", stagePlan.ts:52), a different line and
  list. "TAKE YOUR TIME" is the old clue's own words, kept on purpose.
- One tip, one channel: (1) and (2) each play once, before their beat; no lesson card teaches the wheel; nothing re-teaches 2-1's logs.
- Dot is she; Pokey deadpan; nobody hurt; no winter words.

## Learned (for the next keeper)
- Read a test's "where he stands" mode before re-pinning its line: dotBox's 'post' walks to the first vine past the hint, so a new stage
  with no post needs the spot re-pointed too, not just the words.
- When a stage is rebuilt, read every old line keyed to it (the clue, the journal stage line, the wayside line, the card), not only the
  ones the packet names: the journal line here still described the old climb.

Lessons applied: D30 (the time above from `date`), D102 (read lean: grep and the line ranges the packet names), D105 (the inbox read at
every step and push), D109 (no clock times in messages to the lead). D102/D105/D109 are not in LESSONS.md on t-eng-26c (grepped); their
meanings here are as ENG-26f's REPORT.md:5-6 names them.
