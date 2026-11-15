# 1-8 The Long Branch: the player lines, approved by the story keeper (KEEPER-18, 11-14 about 7:55 PM ET)

Authority: Matt 11-13 10:43 AM ET, "the storykeeper has full authority to add to the story and to approve all lines". Asked by the lead
(session_01FhBbYN2CVHnFXg7XzqKXpM) at 7:42 PM ET 11-14.
Read for this: reference/design/1-8.md (origin/t-1718-design, beats 0-13, "For the keeper", "Nature check"), 1-6's and 1-7's lines
(lines-1-6.md on origin/t-keeper-16; lines-1-7.md on origin/t-build-17) for voice, the stage clues (stageClue.ts:23-24), the journal
(pokeyJournal.ts:56), the old 1-8 rows (dotLinesData.ts:135-136, 155-156), the speech-box rule (STAGE-RULES §5b.7: under 10 words),
the banned words (playerText.test.ts:35; whatsNew.test.ts:28 is What's New only). Every count below is `wc -w`.

## The lines (verbatim; the builder copies these, a test holds them equal)

| # | Key | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `nut` | Dot, teach, 800+ px before beat 1 (the low nut, safe) | Little nuts roll at you. Hop them! | 7 |
| 2 | `fruit` | Dot, teach, 800+ px before beat 2 (the bouncing fruit, safe) | Big ones bounce over you. Just keep walking! | 8 |
| 3 | `crack` | Dot, once, as the base cracks (beat 3; replaces `eng.chase`) | It's cracking! Run, and don't look back! | 7 |
| 4 | `fork` | Dot, teach, 800+ px before beat 9 (the still fork, the twist) | The mossy fork won't break. Stop and keep still! | 9 |
| 5 | `mark` | Dot, at her mark on the cannonball tree (beat 13, exit) | Her mark! And those coils ahead... the boa's branches. | 9 |
| 6 | `way.1-8` | Pokey, the halfway wayside (rewritten; at a living fork, never mid-stretch) | Dot keeps flying rings round me. Show-off. (9:50 PM ET 11-14: was "Dot keeps flying to the end and back. Show-off.", which broke wayside.test.ts:55, Pokey's lines in the first person) | 7 |
| 7 | MISSION_18 | the stage card (stagePlan.ts:52 on main, replaces "Race the long branch to the shrine.") | Race the long branch before it gives way, and gather her petals. | 12 |
| 8 | journal `1-8` | pokeyJournal.ts:56: KEEP as is | The branch came apart behind me, so I ran. Meeca always said I could. I'd never checked. | 17 |

No `sealed` line: see "The locked exit" below.

## Why each one

1. **nut.** One picture, one verb. A non-reader gets it from the safe beat itself (the nut only nudges him back); the line names it
   for a reader. "Hop" is the game's own word (the coach: "hop up or over"); no control word, because the game has two schemes.
2. **fruit.** "Keep walking", NOT the asked "stay down": "down" reads as a crouch, and the crouch is retired (1-7.md:6); the design
   passes under STANDING (1-8.md:60). Pairs with line 1: little = hop, big = walk on. Jumping into it is the mistake, and the line
   says the opposite.
3. **crack.** The moment the chase starts. "Don't look back" is true and useful: the design never needs him to look back (the crack
   and the bark's shiver 300 px ahead tell him how close, 1-8.md:28, :45). No slow, late, hurry or "too" (the General's wound).
   Dot then stays SILENT through set-backs and restarts (one tip, one channel).
4. **fork.** The twist in two halves: the NEW fact (this fork holds, so stopping is safe here and nowhere else) and the move 1-7
   taught (keep still). It doesn't re-teach the eagle: the screech on arrival does that. Worded "still", never "wait" or "slow".
5. **mark.** The payoff, then a dead stop (Dot's run-on stops when something is real). It hands off to 1-9, whose clue is "Coiled
   Branches... The snake is close" (stageClue.ts:24), without spoiling the clue's words. The cannonball tree is shown, not named.
6. **way.1-8.** The old line ("...four times. I'm still on my first.") is a joke built on counting (VOICE: no jokes on numbers), and
   puts Pokey's wound ("slow") in his own mouth mid-chase. The new one keeps the joke and drops both. Pokey is deadpan, a smart-ass.
7. **MISSION.** "The shrine" is the old stage's goal. The words are mine from 11-11 ("Race the long branch before it gives way.") with
   the goal clause, as 1-6 and 1-7's missions have. The stage card is not a speech box, so the under-10 rule doesn't bind it (1-7's is 14).
8. **journal.** Already right: true to the stage, three beats, and the turn ("I'd never checked") is the arc of the game, a sloth who
   runs. No change.

**Old 1-8 rows go when 1-8 ships** (new replaces old): `eng.chase`, `hint.1-8.vine` ("It is all coming down. The vine at the end!",
a pointer), `hint.1-8.long`; `way.1-8` takes line 6.

## The ruling: a nut or fruit that hits him AFTER the crack

**YES, a heart, on Normal (the lead's ruling stands).** Before the crack a touch only nudges (beats 1-2, Pitfall's rule). After it:
- it is a BONK, never a crush: he tumbles and gets up (stars at most); the nut rolls on and the fruit bounces on, both whole;
- it costs the heart only; whether it also sends him to the flag is the design's call (the collapse catching him does);
- **Easy: no heart from nuts or fruit**, only from the collapse (as 1-4's pods on Easy). Story has no objection either way; the kinder
  Easy is my advice.
The same for a jump INTO a fruit after the crack.

## The locked exit (a story fault in the design, for the lead)

The goal is petals (1-8.md:14), but the branch BEHIND him is gone: he cannot go back for a missed petal. A locked exit here would
need Dot to explain a thing the player can't do ("Dot explains any locked exit"; nothing true can be said). So: **1-8 never locks its
exit**; the petal count is a score for the stage card and medals only. If the build must lock it, ask me first.

## Nature check (1-8.md "left for the story keeper"): PASS with two fixes

| Thing | Verdict |
|---|---|
| Cannonball tree (Couroupita guianensis) | REAL, Costa Rica to Brazil and Bolivia. Its round woody fruit (about 20-25 cm, up to about 1 kg) grows on long tangled stalks straight from the TRUNK. |
| The fruit falling onto the branch | FIX (look): the fruit hangs from the far tree's trunk, not its branch tips, so the bouncers drop in from where that trunk's fruit stalks would reach, or from above. Never burst on landing (fruit stays whole; its shell is hard, so the bounce is fair storybook). |
| Palm nuts rolling | REAL kind (Neotropical palms drop small round hard nuts). FIX (look): show palm crowns overhead where the nuts drop in; a palm nut from a tree with no palm in view doesn't make sense. |
| One huge branch rising to a far tree | storybook, and fine: giant canopy limbs do reach neighbouring crowns |
| A breaking bough | REAL canopy danger |
| Mist below, the mossy fork, lianas off the tip | REAL |
| Squirrel tracks on the bark | storybook (the clue, stageClue.ts:23) |
| Harpy eagle at the fork | REAL (1-7.md) |
| The boa's coils beyond | REAL (boa constrictor, Neotropical) |
| Nobody crushed | HOLDS: a miss is a heart and the flag; nuts and fruit bonk, never squash; nothing falls on an animal |

## For the keeper's note in the design (1-8.md:64), settled

"Never stillness in a chase" holds: the fork stops the CHASE first, so his stillness is never against a clock. Stillness keeps him
safe; it never puts off the rescue (the 11-11 guard).

## Checked against the rules

- Speech boxes 7-9 words (`wc -w`), under 10; the mission 12 (a card); the journal kept.
- Banned words (playerText BANNED; no slow, late, hurry or "too" in any line): none. No numbers in any new line.
- Repeats: grepped src/ on origin/main for "roll at you", "bounce over you", "keep walking", "don't look back", "won't break", "coils
  ahead", "Show-off", "gives way": no player line uses them ("hop them" appears only in code comments). "Keep still" is 1-7's move
  word on purpose (the same move, named the same).
- Dot is she; Meeca leads (her petals, her mark); World 1 has no made things in any line.

## 11-14 9:50 PM ET: the moves journal's "collapsing branch" page (movesJournal.ts, id `collapse`), for BUILD-18
Its trigger was the deleted hint "This branch goes on and on" (`tip('1-8', ...)`). That line is gone and is not to come back (it was the
old 1-8's). The page now opens on 1-8's crack line, `crack` above ("It's cracking! Run, and don't look back!"), the moment the collapse
starts, or on clearing 1-8 (`cleared: ['1-8']` already does); how it is keyed is the builder's call. Its words were untrue of the new 1-8
("Keep moving and it can never catch you": the last stretch out-runs him; "Keep going, do not stop": the mossy fork is the place to stop).
APPROVED words:
| Field | Old | New |
|---|---|---|
| riddle | Do not look back. Just run! | KEEP |
| intro | Some branches break apart behind you. Keep moving and it can never catch you. If it does, you lose a heart and go back to the last flag. | Some branches break apart behind you. Run, and stop only on a mossy fork that holds. If it catches you, you lose a heart and go back to the last flag. |
| lines (how / what) | Keep going, do not stop / Stay ahead of it | Keep running; stop only on a mossy fork / Stay ahead of it |
