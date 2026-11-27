# ENG-LURE (R-165.502 + R-165.527): REPORT, box 1 (hand-over)

## EXACT NEXT STEP (box 2 starts here)
Worktree on t-eng-lure-wip at 62009dd56 (base origin/t-eng-w3 51ef0c6ab). `npm ci --legacy-peer-deps` (background), then:
1. R-165.527 (pipeline.ts topUpFoes): skip every node whose code names a threat count (the `threatLeft` map built near pipeline.ts:3627,
   `threatLeft.get(sec.node)`): the top-up lays only in nodes with no threat dial. Toy each way in a new gen2 test (a dialled node gets
   no 'topup' fill; an undialled one still does; plant: the skip removed -> RED). Then count 3-3's purge: what its code can lay vs 16.
2. Item 3, the verdict (gen2/verdicts.ts + verdicts.test.ts): "every call beat's stone reaches its round (680, noise.ts bell reach) and
   its patch sits on the round" (a laid stone with a lure post of fear 'spore' within its reach and both inside one animal's
   patrolMinX..patrolMaxX); named, with a planted RED (stone moved 700 px off).
3. Item 4, bot skills in tools/inspect/firsttimer.ts SKILLS: `ring-to-call` and `bait-and-climb`; a toy on beat 8's slow patch (8.4/2.0)
   with the plant 'skill removed -> clear count misses' (RED).
4. ENG-DEAL (R-165.541): merge it if it is on t-eng-w3; re-read 3-3's refusals.
5. Stills (item 6) with tools/art/kitaudit/shoot.mjs on the toy (w3Lure.test.ts's roll): the stone, the patch glowing, the yawn home.
6. GATES once on a frozen candidate (D115): tsc + generalitycheck; CI tool line; lock gate as TWO runs (`--layouts 16 --out base.json`
   on t-eng-w3's head, `--check base.json` on the candidate, with its counts line); the suite in 6 shards; tierBots 9/9. Land by merge.

## Done in box 1 (62009dd56, pushed, ls-remote equal)
- Item 2, the clock gate: predators/lure.ts `lureGates` (a post whose `fear` is a zone kind opens only once that zone's effect at the
  post has been over LURE.cloud.floor = DROWSY_MIN for LURE.cloud.hold = 0.3 s running; shuts when it drops); `stepLures` takes the
  gates; castPlay.ts builds them from a new optional `zones` constructor argument, engine.ts passes `currentStage.zones`. The
  'after him' rule is unchanged.
- OCELOT (predators/world3.ts): `fears: ['spore']`, `beatenBy.lure: { ends: 'chasedOff' }`. ways.ts keeps 'lure' for a zone fear
  (no world's cast names a spore).
- Item 1, one ring per call: castPlay.ts `hums(i)` (a stone hums while any animal its last ring called is drawn or off its round at
  rest); `ring()` returns null while it hums (engine.ts still marks the swing `rang`, so a blow on a humming stone makes no punch noise).
- World 3's rows (gen2/worlds/w3.ts): W3_SOUNDS 'w3-chime' (60 x 70 px, look 'chime') and W3_LURE 'w3-patch' (fear 'spore', reach 90),
  in the manifest's props and the kit's emitters.
- The chime's draw path: src/game/chimeArt.ts, a CODE-DRAWN STAND-IN (no World 3 chime art in the catalog; ART-W3 is queued): a squat
  stone, a carved ring that lights while it hums, one spreading ring. Drawn in engine.ts beside the traps.
- TYPE ADDITION (pushback, sent to the lead): SectionZone 'spore' gains optional `span: [from, to]` (gen2/types.ts; spore.ts lays the
  cloud over that share of its piece). Why: a cloud covers its whole piece and 'nothing stands in a zone' (pipeline.ts foeInZone) keeps
  every animal off it, and a round is one platform (patchFor), so without it NO patch can sit on any round (the toy laid 0 ocelots on
  40 seeds). Opt-in: no existing section sets it.
- Toy, gen2/worlds/w3Lure.test.ts on 3-1's real draft row (World 3's own kit and rows), 5/5: rung, cleared (arrived 1.13 s after the
  ring with the cloud in, taken 4.20 s, cloud 1.00, out 0.30 s, then flee); PLANT gate off -> taken on arrival with no cloud; PLANT stone
  silent -> never drawn, never taken; one ring per call (hums, second ring silent, rings again once its call ends).

## NOT done (box 2): R-165.527, item 3, item 4, ENG-DEAL merge, stills, every gate, landing.
## For the lead: the KIND the kit asks for (rule 26)
KIT-W3b's lure brick asks: a `soundSocket` (World 3's 'w3-chime') and a `lureSocket(id, piece, t, 'spore')` ('w3-patch') inside a
`{ kind: 'spore', on: <piece>, span: [a, b] }` zone on the ocelot's own floor, the ocelot's socket outside the span by 30 px or more.

## Lessons applied
D119 (no heredoc in a commit chain), D128 (stamps from date), D134 (next step pushed before hand-over), D140 (ReadNotifications at the
boundary), D156 (generalitycheck with tsc at every step: PASS each time).
