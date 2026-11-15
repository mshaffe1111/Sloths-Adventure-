# 1-9 The Boa's Branches: the player lines, approved by the story keeper (KEEPER-19, 11-14 about 8:10 PM ET)

Authority: Matt 11-13 10:43 AM ET, "the storykeeper has full authority to add to the story and to approve all lines". Asked by the lead
(session_01FhBbYN2CVHnFXg7XzqKXpM) at 7:47 PM ET.
Read for this: reference/design/1-9.md (origin/t-pitch-b, beats 0-15, "For the story keeper" asks 1-8, "Nature check"), W1_CAST_SAID
(w1Cast.ts:93), creatureLore.ts:10 and journal.ts:28 (the boa), pokeyJournal.ts:57, the old 1-9 rows (dotLinesData.ts:118, :140), stagePlan's
1-9 row, STAGE-RULES §5b.7 (speech boxes under 10 words). Counts are `wc -w`. The boa is SHE, as creatureLore.ts:10 has her.

## The lines (verbatim; the builder copies these, a test holds them equal)

| Ask | Key | Who, where | Line | Words |
|---|---|---|---|---|
| 1 | `boas` | Dot, teach, 800+ px before beat 1 | Boas see moving things. Keep still, be a branch! | 9 |
| 2 | `creep` | Dot, once, after the first freeze IF he froze late or was hit (silent if he got it right) | Tiny steps work too. Creep, stop, creep! | 7 |
| 3 | `miss` | Dot, teach, 800+ px before the make-it-miss beat (arc #5) | Boa missed? Its nose is open. Bop it! | 8 |
| 4 | `roost` | Dot, teach, 800+ px before the roost (arc #7, the twist) | Eagle's nest! Boas flee it. Don't stop, just walk! | 9 |
| 5 | cast-said `boa` | Dot, once, the first boa chased off for good (trap, roost or eagle) | Off she slides! Not hurt, just very cross. | 8 |
| 6 | `splash` | Pokey, as the Old Boa swims off downstream | She's fine. Wet, and furious about it. | 7 |
| 8 | `mark` | Dot, at her mark on the exit (beat 15), the river below | Her mark! They took her down to the river. | 9 |
| 7a | journal tip `boa` (journal.ts:28, a page) | the journal | It sees only what moves. Freeze when it rears, drop something beside it, or bop it after a miss. | 19 |
| 7b | lore `boa` (creatureLore.ts:10, a page) | the journal | Boas feel warmth through their lips. A sloth runs cool, so a still one feels like moss. Pokey calls this a talent. | 22 |
| + | MISSION_19 (stagePlan's 1-9 row, a card) | the stage card | Boas watch these branches. Keep still, outwit them, and gather her petals. | 12 |
| + | journal `1-9` (pokeyJournal.ts:57, a page) | Pokey | A boa looked me in the eye and saw a branch. The old one went in the river. I'm still shaking. | 21 |

way.1-9 is already cut (short-lines-1-6-1-7.md): "I'm not worth chasing. Best thing about being tiny!"

## Why each one
1. **boas.** The level's one rule, said once (Oddworld's lesson in the design): what moves is seen, what is still is a branch. Kid
   picture: "be a branch". True by the code: a still sloth is ignored, the rear is the only door.
2. **creep.** Gentle, never disappointed (the 11-11 help guards): offers the expert's move as a kindness. Silent when he froze in time.
3. **miss.** "Bop" is the cartoon word: the window after a strike, not a fight (see the punch ruling).
4. **roost.** The twist is "this time DON'T stop" (the creaky limb under it). "Just walk" says it, and the hurry in Dot's voice keeps the
   eagle what it is: a sloth-hunter (1-7), not a friend.
5. **cast-said.** World 1's cast voice ("Off he glides, not a scratch, just very offended!") turned for the boa; once, then silent.
6. **splash.** Pokey's deadpan; it settles "nobody is hurt" for the child and gets the laugh. His one in-play line in 1-9.
7. **journal.** The old tip ("Let it strike, then punch it three times") and lore ("nine years", "never in a hurry") are untrue now and
   carry a number and a hurry word. The new lore is the design's real fact in Pokey's world (see Nature check).
8. **mark.** The dead stop after her mark, and the hand-off to World 2 (Sunlit Riverbank; 2-1 opens "Down to the River").
+ **MISSION / journal 1-9.** Both still say "the boa's guards" and "the shrine" (a fight that no longer exists). New ones, same jobs.
**Old rows go when 1-9 ships:** `hint.1-9.guard` ("Wait for it to rear and strike, then tap to punch it"), `lock.ring.snakes`.

## The punch ruling (the lead's question 3): YES, it reads right, on four guards
- It is a BOP on the nose, only in the window after a missed strike: he is defending himself, never punching a still, sleeping or
  leaving boa. Real sloths do defend themselves with a swipe of their claws, so a sloth fighting back is true.
- Dazed means a wobble and stars, then a head-shake and an offended look. No knock-off needed; no hurt face, no mark, no sound of pain.
- Dot never cheers a hit; Pokey's manners stand ("You said "excuse me."" is 1-3's; it need not repeat).
- The bop never beats a boa for good; only the forest does (trap, roost, eagle) or her own retreat. That keeps "the forest beats it".

## Nature check: PASS with one fix
| Thing | Verdict |
|---|---|
| Boa constrictor, ambush hunter that strikes from a coil | REAL, Neotropical; it does hunt sloths in life, so never eaten here is a choice, and it holds |
| Senses heat through its lips; "a cool, still sloth reads as moss" | REAL enough: boas have heat-sensing scales on the lips, and sloths run unusually cool for mammals; the algae-green fur is real (1-7) |
| A big boa high in the boughs | storybook (big adults mostly hunt low), fine |
| Shed skins | REAL |
| The harpy eagle hunting sloths; boas wary of it | REAL (harpies live mostly on sloths, and take snakes); the reader must feel the eagle is no friend (line 4) |
| The roost: "a dead snag with the harpy's nest" | FIX (look): harpies nest in a LIVING giant's high fork, most often a kapok, on a huge stick platform. Paint a stick nest in a living fork (1-4's kapok kind), not a dead snag |
| The eagle's eye chasing a boa off; the Old Boa into the river | storybook; boas swim well (REAL), so the splash and swim-off are true; nobody eaten, holds |
| The river below, the cannonball tree behind | REAL; World 2's river is below |
| Loads (hive or stone) falling | land BESIDE the boa, never on her (D11), as 1-3 |

## Checked against the rules
- Speech boxes 7-9 words (`wc -w`); pages and cards as marked. No slow, late, hurry, wait or "too". No numbers in any new line.
- Repeats: grepped origin/main src/ for "only see what moves", "Creep, stop", "nose is open", "Boas flee", "very cross", "furious about
  it": none. "Down to the river" is 2-1's opener (dotLinesData.ts:173): an intended hand-off, not a repeat in one stage.
- Dot is she; the boa is she; Meeca leads (her petals, her mark); nothing made of iron in World 1.
