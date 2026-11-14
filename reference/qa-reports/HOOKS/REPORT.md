# HOOKS REPORT (ENGINE-678 W0), t-hooks from t-eng-base@204e3dec. Written 11:14 PM ET.
**Done 1, the piece hook:** stagePiece.types.ts (StagePiece: step, draw by layer, respawn, hurts; PieceKind.start; PieceHost live reads) +
pieces/index.ts (PIECE_KINDS + one loop). engine.ts: one field, one start (after the clock), one step (before the moving platforms), one
hurt (after the cast, through damagePlayer), 3 draw calls ('world' after the traps, 'front' with the bushes, 'screen' after the world),
one respawn. RIDE moved onto it (pieces/ridePiece.ts; the ride branch deleted, the loop skips `plat.ride`). pieceHook.test.ts 8/8:
a planted probe starts once, steps 10/10, hurts (1 heart, safe time, knocked away) and respawns on 1-2, 2-1, 3-3 through RealPlay;
RIDE keeps its beat and carries him on 1-2 and 2-1; planted red: the old loop on a ride fails both RIDE tests.
**Done 2, one letter grammar:** gen2/nodeLetters.ts is the one table; nodeCode's JOB_OF, CONTENT_OF, V13 LATER and nodeAsks'
LATER_CONTENT derive from it; tools/engine/nodekey.ts writes NODE-KEY's Jobs / Made of / pieces rows. Liana = s (r = rope + climbing
vine); rows s v p t x m and the pick `?` added; m (kind, apart) and h (roll, gap, teach) and s (grip, phase, moss) dials named with the
packet that lays them; K says 1-8. nodeLetters.test.ts 5/5 (planted: a dropped row, liana under r, K 1-5 each caught).
**Done 3, gates** (gates/RESULTS.txt, run.sh on 553b125d): tsc, build, chunkcheck, artcheck, knowncheck, generality, kbdcheck,
seedlists, registry, tooltests, tierBots, unit2, unit3, drawcheck (PASS 557 s), clipcheck (PASS, 83 known), buildcheck (p95 142 ms) all 0;
**lockall 102/102 unchanged** vs the base 204e3dec (= f9671e3b). roadmap 2 = shallow clone; full clone PASS. unit1: 3 reds, rideLay.test's
real-engine rides: RealPlay.bare() swapped the platforms after the stage started the pieces. Root fixed (lead OK): bare() calls
e.startPieces() (17423dde), rideLay.test kept whole. Final code (17423dde) re-run in a worktree (rerun/RESULTS.txt): tsc 0, unit 3376/0,
build 0, chunkcheck PASS, tooltests 74/0, tierBots 7/0 (lock/draw/clip/buildcheck unreachable: only test files call bare()).
**Polish check:** stills/key-{upright,sideways}-{r,s,m,h,v,K,pick}.png + sheet-upright.png: no overflow at 390 or 844 px. Fixed: the
unlaid letters showed an empty "Never" line; they now have no Pieces block (test pins it).
**Pushback:** (1) RIDE has no hurt and draws nothing of its own (the platform drawer paints it): hurt is proven by the planted probe in
the real engine (lead OK'd 10:00 PM); draw ORDER is pinned in render()'s text, because the headless canvas cannot paint scenery. The
first piece that draws (A2's sweeper) must prove its layer with a browser still. (2) The key shows H and L as Later while V13 allows
them (only K Z B Y V G are LATER in code); the test enforces one way only (code-LATER is never "now"). Designer to rule.
(3) nodeAsks.ts: two statements, not one: LATER_CONTENT derived, and the ELEMENTS "content s v p t x" card derived so it names m.
**Suggestions:** (a) designer: NODES.md:276 K row still says 1-5's; §8.0 has no s v p t x m rows (the table now holds them).
(b) nodeAsks TYPE_OF_LETTER (g..h -> ContentType) is still its own list: add `type` to CONTENT_LETTERS, derive it (5 lines + test).
**Unresolved:** none in the packet. Not done: a browser still of a piece drawing on its layer (no piece draws yet; A2's job).
**Method update:** NEW reference/methods/stage-piece.md (indexed). gates: run.sh in its own worktree (I edited the tree mid-run and had
to re-run tsc/unit/build on the head); a shallow clone fails roadmapcheck: `git fetch --unshallow` first. **Learned:** a runtime piece is one file + one
PIECE_KINDS line now; the key is generated: edit nodeLetters.ts, never the HTML.
**Lessons applied:** D7 (code wins: s), D40 (STILL waits for HIDE-ONE), D43 (generality 0), D36, D57, D59 (gates waited for), D30, D53. **Turnover:** engine-core.md §0t (d72a3653). Context ~23%.
