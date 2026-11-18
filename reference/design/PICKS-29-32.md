# PICKS-29-32: the lead's picks for 2-9, 3-1, 3-2: the second two-lens round, the FIRST with truly separate packets (D85). 6:02 PM ET 11-18 (by `date`).
A = fixed lens (high, GAME-MAP rows): origin/t-pitch-29a @ 4f6e688e, reference/design/pitches/PITCH-29A.md (16 min, $7.29, 292k).
B = open lens (xhigh, blind: no GAME-MAP, no A): origin/t-pitch-29b @ 9256c27c, PITCH-29B.md (26 min, $8.00, 300k). B's blindness held
(its header lists what it did not read; grep of its packet: no GAME-MAP rows).

## 2-9 The River King's Court (World 2's finale): MATT PICKED "A" (6:06 PM ET 11-18) = B's King's Drum core + A's King's Barge and bell ending
A "Come up behind them": the king's guards ride the rafts facing the way they float; board behind and kick them off, vault one coming at
you; end on the King's Barge (three guards, the court bell). Kung-Fu Master, Super Mario Bros. 3's airships, Crossy Road. NEW: a guard
aboard a raft (M, 3-4 h) + two bot skills (S-M).
B "The King's Drum": every World 2 toy keeps ONE beat you can hear (the liana's 2.85 s swing = one bar of four: 0.7125 s Normal, 0.825 s
Easy, the clocks' own easyStretch); hop on the beat and the pads never sink. Rayman Legends' music levels, Bit.Trip Runner, Donkey Kong.
NEW: the court's tempo check (S-M) + the drum cue (S). No new mechanic: the old toys make a song.
LEAD: B's core (a finale that combines, not teaches; cheaper engine; "the stage with a song you play" is new in the whole game) with A's
signature ending: the King's Barge drifting into the shrine and the court bell rung on the downbeat (both wired today: raft rivers,
puzzleKit bell). A's guards-on-rafts (a third NEW) is parked as a later idea, not lost. The hand build's 14-guard goal goes with it (the
keeper words the new goal). Matt's answer (his option A, the lead's recommendation): DESIGN-29 starts from it Thu 8:30 AM.

## 3-1 Into the Grotto: A "Stand still, see the way down" (+ B's kind falls)
A: going down into the dark, stand still at a shelf's edge and the glowworms below wake and show where to drop; spore puffs light the
shaft on their beat; the signature is a whole cave roof waking like stars over the long drop to the grotto floor (Metroid's descent,
Pitfall II, Donkey Kong Country's lantern parrot). B: hang under roots and slide down sloping ones (the Roof Road). PICK A: World 3 is the
patience world and stillness-makes-light is a sloth's own nature; it teaches DARK before 3-2 teaches HANG (one new thing per stage); it
reuses glowWake (engine.ts:8835/8852). From B: every drop in the teach is soft (Pitfall II's insight; both pitchers cited it on their own).

## 3-2 Glowworm Path: A "Prowlers never look up" (+ B's sloping root, if it fits)
A: hang under the roof roots and creep over the prowlers' heads; they never look up, but a lit glowworm patch gives him away (3-1's light
turned against him; B reached the same "what is lit is seen" blind, as its 3-2). NEW 1 prowlers never look up (S-M; enemyBrain.ts roam:
today a prowler sees him 170 px up, :229, a fix needed whatever is picked); NEW 2 the roof root lay (M; a rope under the roof, no posts,
the 1-3 shimmy on new ground: R-160.1's 10-16 h under-branch move stays for World 6/8). From B: the SLOPING root (hold right on a slope =
a slide) is what makes the hang new in kind (B: shimmy was taught at 1-3); the final designer takes it into NEW 2 if it stays within
size (M), else it goes to 3-3+.

## Foundations first (D40; both pitchers said it)
World 3 has no gen2 kit (gen2/worlds: w1, w2, w5-w8): ENG-W3a (the World 3 kit, a DOWN stage proven on a real row) and W3-ART (World 3's
standing and climb pieces, the thinnest art in the game) come BEFORE DESIGN-31-32's finals are built. 2-9 builds after 2-4/2-5/2-6's
engine pieces (its toys) are merged.

## What the open lens added (measured)
Round 2 (2-6..2-8): 3 of 3 cores from B, but B had seen the outline (D85). Round 3, truly blind: B won 1 of 3 (2-9's core); A won 3-1
and 3-2, because World 3's arc (dark, then hang) is a world plan the outline carries and a blind pitcher can't see. Both, independently:
Pitfall II's kind falls, glowworms as the light, no World 3 kit yet. Reading: the open lens finds new cores where a stage stands alone
(a finale, a set piece); the fixed lens wins where a stage is a step in a world's teaching ladder. Keep both lenses; next round (3-3..3-5)
the same way.

## DESIGN-29's pushback, ruled (6:28 PM ET 11-18; t-design-29 562a8e71, reference/design/2-9.md)
(1) The royal guard's journal card (met only in 2-9): KEEP a guard on the court's land, posted at the shrine steps facing the water (wired
today: predatorAI royal; head-on he blocks, from behind a kick), on a rest beat, never on a beat row: the court has guards, the card keeps
its stage, and it nods to A's "come up behind them". The 2-9 builder places it; the keeper words the card's line.
(2)-(5) accepted as the designer flew them (beat rows at a RUN pitch, the WAVE as the long row, per-clock easyStretch with Easy rivers as
their own rows, the bell on the steps' arch, Easy's wheel R160).
(6) The liana clock (vineClock vs gameTime after a flag resume) is a GENERAL fault (rule 22): R-165.295, fixed in ENG-285 tomorrow (before
release 1, because 2-4's liana rows depend on it), not inside 2-9's NEW 1.
