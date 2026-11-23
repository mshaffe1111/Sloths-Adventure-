# 2-7 The Mailman's Route ("Ride the River Home"): the player lines, approved by the story keeper (KEEPER-27, 11-23)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet
reference/packets/2026-11-23/KEEPER-27.md). For BUILD-27's lay of 2-7 (DESIGN-26-28; the design is origin/t-design-26
reference/design/2-7.md: the idea :1-3, the race and the boat :23-29, the post doors :30-32, the beat table :41-57, first appearances
:60-61, the story asks :80-81). The builder copies every line below verbatim; a test holds them equal (as w2Arc25.test.ts:66-72 reads
lines-2-5.md: the row shape `| ask | \`key\` | who, where | line | n |` is kept, so the same regex reads this file; the last column here is
the line's CHARACTER count, the word count is in the "who, where" cell).
Checked on origin/main cdffdc627: stagePlan.ts:86 (the 2-7 row, sprint), goalLine :211 (empty for a sprint: GOAL_WORDS :239 has no sprint
row), sealedLine :233 (none: a sprint's exit never locks, the design :28); w2.ts W2_TIPS.water and its doc (the pipeline's WATER_WARN);
W2_RIVERS (`ride` the only safe row); pokeyJournal.ts:66 and pokeyJournal.test.ts:34-42 (8-23 words, never the stage name);
components/stageClue.ts:33; whatsNew.ts:22-32 (0.10.2) and whatsNew.test.ts:27-35 (90 characters, no workshop word);
playerText.test.ts:35 BANNED; dotLinesData.ts:151-154, 172 (the hand build's 2-7 rows); storyWorlds.ts:104-106 and storyCels.ts:75 (the
mailman: he, the URGENT package, "held on tighter"). Speech boxes under 10 words (STAGE-RULES.md:276). Counts: `wc -w`, `${#s}`.

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key | Who, where (words) | Line | Chars |
|---|---|---|---|---|
| 1 | `handover` | Dot, once, at the post office jetty (beat 0) as the mailman hands Pokey the satchel, before the first door (9 words) | He's handed us the post! One for every door! | 44 |
| 1 | `race` | Dot, said right after `handover` (the row's second line, dotLinesData's `then`): the race challenge (9 words) | From the weir, he'll race us home by boat! | 42 |
| 2 | `turn` | Dot, THE teach for the run left, 800+ px before beat 6, on the weir (beat 5) with the boat in the pool below (9 words) | Now home's the other way! Go with the river! | 44 |
| 3 | `water` | REUSED, not a new row: W2_TIPS.water, said by the pipeline's WATER_WARN before the first deep river (beat 4, `upstream`) (7 words) | This river's deep. Don't touch the water! | 41 |
| 4 | `win` | Dot, once, at the jetty (beat 14) as Pokey reaches it BEFORE the boat docks (9 words) | You beat the post home! I never manage that! | 44 |
| 4 | `lose` | Pokey, once, at the jetty (beat 14) as he reaches it AFTER the boat has docked (9 words) | Beaten by the post. Fair enough. He's had practice. | 51 |
| 5 | journal `page` | Pokey's journal page `'2-7'` (pokeyJournal.ts:66, REPLACES "Walked the mailman's whole route. His package still says URGENT. We nodded as we passed. It took a while.") (22 words) | Took the post up the mill-race, came down the weir, and raced the mailman home. The URGENT one stayed in his bag. | 113 |
| 6 | `mission` | the stage card (stagePlan.ts:86, REPLACES "Take the long way round the river, past every door marked PLEASE BE PATIENT."; no digit: a sprint counts nothing) (12 words) | Carry the post up the mill-race, then race the mail boat home. | 62 |
| 7 | `cluetitle` | the Stage Cleared find's title (components/stageClue.ts:33, REPLACES "URGENT") (2 words) | Written Back | 12 |
| 7 | `cluetext` | the Stage Cleared find's text (REPLACES "The mailman's package rests on a step. It still says URGENT, in red.") (13 words) | Every door on the mill-race stands open, and every house has written back. | 74 |
| 8 | `whatsnew` | What's New, the release that ships 2-7 (first person, the 0.10.2 style; 90-character cap) (16 words) | New stage: The Mailman's Route. I post letters up the mill-race, then race the boat home. | 89 |

Ids for the kit, as 2-3's and 2-5's: `w27.handover` (with `race` as its `then`), `w27.turn`, `w27.win`, `w27.lose`; MISSION_27 for the
card. TEACH line (said on Normal's default Tips as on Help, D50): `turn` only. `handover`/`race` are story (once, at the start, on every
Tips setting: they set the stage's goal). `win`/`lose` are story, said once each run, never both.
**The goal line: none.** 2-7 is a sprint: goalLine returns '' (GOAL_WORDS has no sprint row) and the exit never locks, so no 'start',
'late' or 'sealed' line is said and none is needed (STAGE-RULES:88 "Dot explains any locked exit": there is none). The mission card is the
goal's only words. The letters and replies are the stage's petals in letter art (score and medals only), so no line asks for every one.

**Retired with the hand build (new replaces old):** dotLinesData.ts:151-154 `hint.2-7.basket`, `hint.2-7.frames`, `hint.2-7.open`,
`hint.2-7.porches` (the basket lift, rope frames and porches round the village are not in the new 2-7). **Kept:** `way.2-7`
(dotLinesData.ts:172, wayside.ts:101, Dot: "I asked the mailman for the time. He said, "Soon." I'm going to hold him to that.": true of the
same mailman, and a wayside line, not in play).

## Why each one, and its one-line check

1. **handover.** The design's beat 0 in Dot's voice: the mailman (a sloth, he) hands over the satchel; the doors take a letter as his chest
   passes the slot (design :30), so the line names the job, not a move: there is nothing to press. "One for every door" is true: 6 doors
   out, every slot on his path (design :30-31). *Check: 9 words; no "wait", "slow", "late", "hurry", "too" (lines-2-1.md:29); no control word.*
2. **race.** The challenge, said at the start so the whole stage has its promise (out with the post, back in a race), and kept apart from
   the turn teach so the weir carries one line. True: the boat waits in the weir pool (beat 5) and leaves as he passes the turn; "home" is
   the jetty where he started, the word the card and `turn` use. Dot says "us": she rides along, as always. *Check: 9 words.*
3. **turn.** The ask: home is the other way, down on the river. Said on the weir 800+ px before beat 6, it names the direction without a
   pointer (Dot has no arrow, STORY-KEEPER §3) and gives the hook in three words: "with the river" (the river flows LEFT toward the post
   office; out he fought it, home it carries him, design :3). "Now" claims nothing about the post being done (the last door is in beat 5).
   True on Easy (`ride` rows home) and Normal. *Check: 9 words; the teach for the first run back left (design :33-36), before nothing that hurts (beat 6 is soft).*
4. **water (REUSED, not reworded).** W2_TIPS.water is World 2's one deep-water line (one tip, one channel: a second wording would be a
   repeated tip). True at beat 4: `upstream` -75 is deep, a fall costs a life (w2.ts:7-8); the out leg's beat 2 (`back`, soft) is not deep,
   so the warning lands before the first river that hurts. On Easy beat 4 is `back` soft: WATER_WARN fires only before a `water: true` gap,
   so if Easy lays no deep river it says nothing, which is right (the builder confirms on both settings; see conflict 2). No new row.
5. **win.** The medal moment, Dot's. Beating the post is a courier's dream, and Dot (always late, the secret of the storm) admits she never
   manages it: a light touch on her secret, no word "late", no dead stop. It also answers the General's "too slow" without saying it: the
   slow sloth beat the post. *Check: 9 words; said only when he docks first.*
6. **lose.** Never a scold (the ask): Pokey's deadpan, kind to the mailman and to himself, and true to the village (the mailman has walked
   this route since before the rains, storyWorlds.ts:104). No "slow", no "try again"; the exit is open, the race is a medal, not a gate.
   *Check: 9 words; said only when the boat docked first; nothing on screen counts the seconds (design :29).*
7. **page (journal).** The ask: the mill-race and the weir, both by name, in the order he met them, with the race; the closing joke keeps
   the URGENT package thread (the old page's and the old clue's, storyWorlds.ts:104) alive without promising it on screen. True win or lose
   ("raced", not "beat"). *Check: 22 words (8-23); does not start with "The Mailman's Route"; no BANNED filler.*
8. **mission.** The stage's two halves on one card, as 2-3's MISSION_23 (no digit: the sprint counts nothing). "Race", never "beat": losing
   is allowed and the exit never locks. The old card is false now: there is no "long way round", and the doors take letters. *Check: 12
   words (as MISSION_24, MISSION_25).*
9. **clue.** Rule 10, what the words promise is on screen: the doors are drawn OPEN once posted (design :72, art ask 3) and each house's
   river step holds a reply (design :31). Both true whether or not he picked up every reply (the replies are there; "written back" says so).
   The old clue promised the URGENT package on a step: not in the new stage, so it is replaced (its joke moves to Pokey's page). The
   narrator's present tense, as 2-5's and 2-6's. *Check: 13 words, 74 characters (2-4's is 83).*
10. **whatsnew.** First person, a child can read it, the 0.10.2 shape ("New stage: <name>. I ..."). *Check: 89 characters (cap 90); no
    workshop word (whatsNew.test.ts:28); if the release title needs a phrase, "Race the post home" (18 characters).*

## The story conflicts (for the lead and the builder; the keeper does not edit code)

1. **How the mailman reaches the weir first.** He hands over the satchel at the jetty, and his boat waits in the weir pool when Pokey gets
   there. The picture does not show how; no line claims it (`race` says only that the race starts at the weir). A sloth who has been on
   this route since before the rains knowing the short way is fair. If BUILD-27 can show the boat leaving the jetty at the start (it rows
   off right as Pokey sets off), it reads better; not required.
2. **Easy's warning.** Easy's out leg is `back` soft and its home rivers `ride` (safe): if Easy lays no `water: true` gap, WATER_WARN says
   nothing on Easy, which is right. If any Easy river is deep, the warning must be said before it (Matt's rule: Dot warns first). The
   builder checks both settings (as 2-5's hintX checks).
3. **Win and lose are once, at the jetty, never mid-race.** The boat docking while he is still on the river says nothing (no clock on
   screen, design :29); the line plays when HE reaches the jetty, before the Stage Cleared card. A respawn on the home leg (the boat put back
   level, design :63) changes nothing here.
4. **The release title.** If 2-7 ships alone, "Race the post home" (first person not needed in a title; 0.10.2's is "Walk them home").

## Nature check: PASS
| Thing | Verdict |
|---|---|
| Up the mill-race is against the current, the weir is upstream | TRUE. A mill-race is a channel fed by water turned off the river at a weir upstream; it runs down to the mill and back to the river, so walking up it toward the weir is walking against its flow, and below the weir the river runs back down the other way. |
| A weir with a stepped face and white water | TRUE: a low dam across a river; water pours over a stepped or sloped face and churns white below. |
| Nobody is hurt | Kept: the mailman and his boat are story, not threat (design :39); the race loses nothing but a medal. |

## Learned (for the next keeper)
- A sprint has no goal words: read goalLine/GOAL_WORDS first, and the card is the only place the goal is said; a race needs a win AND a
  lose line, and the lose line is the one a child hears most, so it carries the kindness.
- Keep the keeper file's row shape the regex the last test read (`| n | \`key\` | ... | line | n |`): a builder's test copies it.
