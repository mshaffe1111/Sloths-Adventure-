# 1-7 A Very Good Bush: the player lines, approved by the story keeper (KEEPER-17, 11-14)

Authority: Matt 11-13, "the storykeeper has full authority to add to the story and to approve all lines" (packet KEEPER-17).
Read for this: reference/story/STORY-KEEPER.md (§3 Dot's rules, §7 checks), reference/design/1-7.md (origin/t-1718-design: beats 0-15,
"STORY CONFLICTS for the keeper", "Nature check"), 1-6's lines (reference/story/lines-1-6.md, origin/t-keeper-16) for voice, 1-5's
LINES_15 (w1Arc15.ts:36-42), Dot's bush in World 1's arrival scene (storyWorlds.ts:67: "I stayed in that bush an hour. It was a
nice bush."; :64 "she walked the whole way with her chin up"), the stage clue (stageClue.ts:22), the banned words (whatsNew.test.ts:28,
playerText.test.ts:35), goalLine and SEALED_LINES (stagePlan.ts:187-199).

## The lines (verbatim; the builder copies these, a test holds them equal)

| # | Key | Who, where | Line |
|---|---|---|---|
| 1 | `arrive` | Dot, beat 0, as he walks up to her bush (not a teach; the screech is far off, no shadow) | That's MY bush, dent and all! And that far-off screech is an eagle. |
| 2 | `bush` | Dot, teach, 800+ px before beat 1 (the bush, safe) | When the eagle screams, get in the green and keep still. Then it can't see you! |
| 3 | `shake` | Dot, teach, 800+ px before beat 2 (the leaves shake) | No wiggling in a bush! Shaking leaves give you away. |
| 4 | `bark` | Dot, teach, 800+ px before beat 5 (bare bark) | Bare bark won't hide you, even if you're still. Get to the green! |
| 5 | `moss` | Dot, teach, 800+ px before beat 7 (moss anywhere) | Moss counts too! Any mossy spot is as good as my bush. |
| 6 | `creak` | Dot, teach, 800+ px before beat 8 (never still on a creak) | Never stop on a creaky limb! Cross it first, then hide. |
| 7 | `swing` | Dot, teach, 800+ px before beat 10 (the twist: still is not stopped) | A mossy liana hides you, swinging and all. Just hang on! |
| 8 | `lands` | Dot, teach, 800+ px before beat 12 (the eagle lands) | It's landed! Watch its head, and move only while it looks away. |
| 9 | `mark` | Dot, at her mark on the exit (beat 15) | Her mark! She walked right past my bush with her chin up. |
| 9b | `sealed` | Dot, at a LOCKED exit (1-7's petal count; see "For the builder") | We left some of her petals behind. Sneak back for them! |
| 10 | MISSION_17 | the stage's mission line (stagePlan.ts:51, replaces "Eagles are watching. Duck under the leaves the way Dot hid from the soldiers.") | An eagle is watching. Hide in the green like Dot did, and collect her petals. |

## The story conflicts, settled (the design named them, 1-7.md:51-52)

1. **pokeyJournal.ts:55 (the acorn lure): REWRITTEN.** World 1 is stillness and cover only (PREDATORS.md:131 "W1: stillness and cover
   only. The noise lure from World 3"; roster.ts:44-49: the thrown nut is World 3's 'noise', and in World 1 the only noise is his own
   landing). A journal page that says he threw an acorn at the eagle tells the player a move 1-7 never had. New line (Pokey, past tense,
   the journal's three-beat shape):
   **`'1-7': "An eagle looked straight at me and saw moss. Dot called it brave. Keeping still is just what sloths do.",`**
   True to the stage (the moss tint, beat 1; the perch's look straight down, beat 12) and to nature (real sloths hide by stillness and the
   algae in their fur, 1-7.md Nature check). MAP-REVISIONS' "sound stealth IN: 1-7" (1-7.md:51) is overruled for the same reason.
2. **GAP-MAP.md:78 and dotLinesData.ts:154 way.1-7 (the crouch line): REWRITTEN.** "Get low, low like me in my bush" / "Low, like me in my
   bush" teaches the retired crouch (1-7.md:6, no crouch anywhere). The joke stays (Meeca says she saw Dot; Dot says fibs), the crouch goes,
   and it now calls back the scene's hour in the bush instead of being a second tip (Dot's rule: no repeated tips; the wayside is story):
   **`way.1-7` (Dot, halfway): "A whole hour in that bush. Meeca says she saw me. Fibs!"**
   GAP-MAP.md:78's row takes the same words.

## Why each one (the keeper's checks, STORY-KEEPER.md §7)

1. **arrive.** Dot's own bush (stageClue.ts:22 "a small, worried dent") said by the one who made the dent: proud, a little embarrassed,
   loud ("MY"). The second sentence names the far screech before the eagle is ever seen (sound comes first, beat 0). Not a teach.
2. **bush.** The stage's one idea in Dot's words. **"keep still", never "hold still"**: "hold" is the game's press word ("Touch and hold
   still for a mega punch", dotLinesData.ts:25), and a child would press and hold, which is the opposite (he goes still by lifting his
   thumb, 1-7.md beat 1). **"It can't see you" is said only with "in the green":** the design's idea line, "it only sees what moves", is
   untrue in 1-7 itself (beat 5: a still sloth on bare bark IS seen, `seesStill`, predators/world1.ts:81), so no player line says it.
3. **shake.** The same lesson, guarded (beat 2): moving inside the bush shows. "Wiggling" is a child's word for the thumb drift the design
   names as a trap.
4. **bark.** Closes the hole line 2 leaves on purpose: still is not enough without green. Then the one move (dash to green, beat 5).
5. **moss.** Widens "green" from bushes to every mossy spot (beat 7). "As good as my bush" keeps it Dot's, and keeps her bush the yardstick.
6. **creak.** 1-5's limb plus stillness: the order matters (cross, THEN hide), because the limb gives way 1.1 s after he lands. Distinct
   from 1-4's and 1-5's creak lines (w1Arc14.ts:49, w1Arc15.ts:37), which teach the drop, not the waiting.
7. **swing.** The twist (still is not stopped): holding a mossy liana is cover while it swings him. "Just hang on" is 1-6's own word for
   holding (1-6's "let go when you glow"), and rules out both climbing and letting go mid-pass (mid-air is moving).
8. **lands.** The perch's tell is its head (TELL_MIN 0.5 s, core.ts:19); the line gives the read (watch its head) and the move (only while
   it looks away). Being seen there costs a dive, not a story harm.
9. **mark.** The exit pays off Dot's scene: "she walked the whole way with her chin up like she was on her way to a party"
   (storyWorlds.ts:64). Her mark is here because she was marched past this very bush while Dot hid in it: proud, a little sad, true.
   Opens like 1-6's ("Her mark, right where she used to wait for you!") so the exits sound like one trail; the rest is new.
9b. **sealed.** "Dot explains any locked exit". Distinct from 1-5's "We missed some of her marks" and 1-6's "Back we go!"; "Sneak" fits the
   stage.
10. **MISSION.** The old line teaches the crouch ("Duck under the leaves"); new replaces old. It names the danger gently ("watching", not
   "hunting": nobody is hurt in World 1), the verb (hide in the green), the story (like Dot did, the stage's name) and the goal in the
   HUD's own verb (goalLine: "Collect", stagePlan.ts:203). Not "gather her petals" (1-6's MISSION ends so; no repeats).

## Checked against the rules

- Banned words (whatsNew.test.ts:28; playerText BANNED): none (no "branch": "limb", "bark", "bush"). No numbers.
- No control words: no tap, press, swipe, flick, button, hold, duck, crouch, slide down. "Grab", "let go", "hang on" are 1-6's.
- Repeats: grepped src/ for every phrase ("dent and all", "keep still", "give you away", "Shaking leaves", "as good as my bush", "Moss
  counts", "swinging and all", "Just hang on", "looks away", "right past my bush", "like Dot did", "Sneak back", "saw moss", "what sloths
  do", "A whole hour"): no hit in a player line. "chin up" hits only storyWorlds.ts:64, the callback it is meant to be.
- Length: one or two short sentences each, 9 to 15 words; readable at a glance upright.
- World 1 has no made things; nobody is hurt (the eagle looks, screeches, dives and gives up; no line says it catches anything).
- Dot is she; Meeca is never a damsel (chin up, her mark, her petals).

## Nature check (1-7.md "left for the story keeper"): PASS

The harpy eagle (Harpia harpyja) lives in Central and South American lowland rainforest and does take sloths; it hunts from a perch,
turning its head to scan the canopy, so "it lands, its head turns" (beat 12) is true behaviour. Real sloths survive by keeping still and by
the green algae in their fur (the moss tint is real). Spanish moss (Tillandsia usneoides) hangs from trees across that range; a tree-fall
gap is a real canopy opening. The one storybook claim, "it only sees what moves", stays out of player text (line 2 note). No design change asked.

## For the builder and the lead

- **New replaces old:** the old 1-7 words in dotLinesData.ts:115-117, 132-134 (eng.watch.hide.bush, eng.watch.seen.bush, hint.1-7.hide,
  float.hide.bush, hint.1-7.go, hint.1-7.ropeBush: "Slide down in a bush", the retired crouch) and dotGuide.ts:183's "Hide! Into a bush!"
  go when 1-7 ships. Check first that w6.ts / w8.ts's crouch zones do not read the eng.watch.* keys (dotTips.ts:29-31 maps them to
  'watcher'/'watcherSeen'); if they do, those keys stay for World 6/8 only and 1-7 must not fire them.
- **The locked exit (9b):** SEALED_LINES is keyed `world:type` (stagePlan.ts:198). If 1-7 becomes `harvest`, the key '1:harvest' would
  also speak at 1-2's locked exit. Key it to 1-7 alone (a per-stage entry, or 1-7's own goal type); if the build keeps 1-7 as `stealth`,
  goalLine returns '' for it (GOAL_WORDS has no stealth), so 9b is the ONLY words at a locked 1-7: it must be wired.
- The lines live in one object (LINES_17, MISSION_17) in 1-7's world file with a verbatim test, as w1Arc15.test.ts holds 1-5's.
- The journal and wayside rewrites (conflicts 1 and 2) ship with 1-7; until then the shipped 1-7 still crouches, so they wait with it
  (no patching what is being replaced).

## Journal (KEEPER-17b): the "hide" page for the new 1-7 (R-165.249)

The page (movesJournal.ts:235-249) and the Duck page's intro (:115) still teach the retired crouch hide. Same short format as the rest of
movesJournal.ts; new replaces old, so these ship with 1-7, not before (no patching what is being replaced).

**The hide page (id 'hide'), verbatim:**

```ts
title: 'Hide in the green',
open: { tip: [tip('1-7', "When the eagle screams, get in the green and keep still. Then it can't see you!")], cleared: ['1-7'] },
intro: 'When the eagle screams, get into a bush, onto moss or onto a mossy liana, and keep still till its shadow has gone by. On bare bark it can see you, still or not.',
lines: {
  screen: [
    { how: 'Lift your thumb in the green', what: 'Hide', sub: 'a bush, moss or a mossy liana' },
    { glyph: 'up', how: 'Grab a mossy liana and hang on', what: 'Hide while you swing' },
  ],
  pad: [{ how: 'Let go of the pad in the green', what: 'Hide' }, { how: 'Hang on to a mossy liana', what: 'Hide while you swing' }],
  keys: [{ how: 'Let go of the keys in the green', what: 'Hide' }, { how: 'Hang on to a mossy liana', what: 'Hide while you swing' }],
},
```

Kept as is: `where: 'Learned in World 1'`, `riddle: 'Dot knows a good trick for hiding from soldiers.'` (true: Dot's hour in the bush,
storyWorlds.ts:67).

**The Duck page (id 'duck'), intro only:** `intro: 'Get low. A low duck slips under a diving bird.',`
Its lines (:117-119, "Slide down" / "Duck", "keep your thumb there to stay low") STAY: ducking is still a real move, the eagle's dive
lesson teaches it (lessons.ts:81-85, dotLinesData.ts:22) and the low hurt box makes it real (fight.ts:258, engine.ts:2913). Only the
"and it is how you hide in a bush" half goes.

**Why each one**
- **The tip is Dot's own teach, word for word.** `tip()` keys the unlock on the exact text Dot says (movesJournal.ts:75 `tip:${text}`),
  so the page must name 1-7's `bush` line (line 2 above) verbatim or it never opens from the tip. The old text ("Slide down inside a bush
  to hide") is never said in the new 1-7.
- **Title "Hide in the green":** cover is a bush, moss or a mossy liana (lines 2, 5, 7); "in a bush" alone would be a third of it.
- **Intro:** the whole rule in two sentences: where (the three covers), how (keep still), until when (its shadow has gone by), and the
  hole (bare bark, beat 5, `seesStill`). "Keep still", never "hold still" (line 2 note). No "keep low" (the crouch).
- **"Lift your thumb" / "Let go of the pad / keys":** stillness is the absence of input (stillness.ts:62-68, under 25 px/s for 0.5 s;
  1-7.md beat 1 "lifts his thumb"). It is the game's own phrase for stopping (movesJournal.ts:83 "Lift your thumb to stop";
  dotLinesData.ts:80, :210). The screen line has NO glyph on purpose: GlyphKind (GestureGlyph.tsx:7) has no lift, and 'hold' or 'down'
  would teach the opposite.
- **The liana line** replaces "Hang inside a bush on a rope / Hide up high too" (the retired rope-bush, hint.1-7.ropeBush). It teaches
  beat 10's twist (swinging is still; climbing is not, stillness.ts:41-43). glyph 'up' and "grab" match the rope page's own grab
  (movesJournal.ts:225 "Flick up into the rope / Grab on"); "hang on" is 1-6's word (line 7 note).
- Checks: no banned words, no numbers, no tap/press/hold/duck/crouch/slide down in the hide page; grepped src/ for "Hide in the green",
  "Hide while you swing", "still or not", "keep still in the green", "Let go of the pad", "Let go of the keys": no hit.

**The rest of the journal, grepped** (`grep -n -i -E "crouch|slide down|duck|keep low|hide|hiding|bush|low "` over movesJournal.ts,
plus journal.ts and creatureLore.ts for the eagle):
- movesJournal.ts:115 Duck intro: rewritten above. :117-119 Duck lines: kept (real move).
- :135 "Lift your thumb or slide down / Drop normally" (leaf glide), :184 bird page pose 'duck', :227 "Slide down, then flick up / Let go"
  (rope): not hiding, kept.
- :331-336 Hush Fern "Crouch beside it" / "Slide down beside the fern and hold": a real, separate search move (finds.ts:4,
  w5Stages.ts:1193), not hiding; kept.
- journal.ts:29 (the creature journal, eagle): "Circles, then dives. Slide down to duck, or hide in a bush." Not the crouch hide (the duck
  is the real dive dodge); kept. creatureLore.ts:11 "Hide in a bush and wait." true under the new rule; kept.

**For the builder (code, not words; the keeper does not edit code)**
- `['1-7', 'watch:hide']` (movesJournal.ts:237) is set by the old watcher path (engine.ts:8312-8313). If the new 1-7 never runs it, drop
  that entry or set it from the kit's first hide; the page still opens on the tip and on `cleared: ['1-7']`.
- `pose: 'duck'` and `demo: 'hide'` show a crouch on the page's tile and scene. The pose should be a still Pokey ('stand' or 'hang'), and
  the 'hide' demo (JournalDemo.tsx) must show him going still in the green with the moss tint, not ducking. A demo that ducks while the
  words say keep still teaches both.
- World 6 and 8 still hide by crouching (w6.ts:55-58 rootHide/reedHide, watcher.ts). This page teaches 1-7's rule only. If the one-hide-rule
  engine study (1-8.md) keeps the crouch for W6/W8, those worlds need their own teach there; this page must not be widened to cover both.
