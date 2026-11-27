# W3-LANES: World 3's piece lanes and the lead's rulings, from the audit (Matt 11-26 R-165.497/.498: every piece found up front; 4 helpers + the bot-switch slot, R-165.500)
Source: AUDIT-W3 (t-audit-w3 0b8930e64: REPORT.md THE TABLE and THE LANE LIST; codes/codes-trim.txt = the BUILDERS' STARTING CODES with the
asks; codes/codes-trim-rolled.txt = the rollable form until ENG-ASKS lands). Every World 3 build starts only when the lead has opened its roll
file and every piece below that it names has a LANDED hash (level.md rule 23; PM.md, CI #95).

## The lead's rulings (11-26 evening)
- Trims APPROVED for all nine as the audit wrote them, with its three V11 fixes:
  3-2 keeps r at T, W, S only (X -> c, C -> g, one P r -> f); 3-4's moon beats keep the letter p, laid by ENG-MOON's own emitter (no B14), X -> c on
  the moon; 3-8 one practise swing -> f under a sleeper.
- #soft dropped from 3-2's teach, 3-5's teach and 3-6's beat 2: each is taught on a walk (a World 3 miss is laid hurt; first try cannot fail).
- 3-4's #soft@moon: NO ENG-SOFT-W3 lane. The moon's TEACH beat is laid over a walkable floor; later moon beats accept a respawn miss that drops
  him to the storey below.
- Cuts named to Matt: 3-7 loses the shadow puzzle (the guarana in a plain fern); 3-9 loses the World 4 look-ahead (V -> P) and the swing
  callback (W s -> c). 3-7's &eyes -> a passing ocelot unless the cast row is cheap.
- B14 and B15 are NOT needed (untested; the trims avoid them).
- The node code's World 3 asks are an ENGINE piece (ENG-ASKS), not a trim: every later world asks the same way (rule 22).

## The lanes (dependency order; side by side inside the cap)
| # | Lane | Size | Unblocks | After | Row |
|---|---|---|---|---|---|
| 1 | ENG-DARK landing (3-1's tower fix + the dark piece; 1-4's lock move traced first) | M | 3-1, 3-2, 3-6, 3-7, 3-9 | - | R-165.491 |
| 2 | ENG-SPORE landing (ENG-SPORE-c: merge into t-eng-spore-wip 5dd854b15, toys, gates) | S | 3-1, 3-3, 3-7 | 1 | (ENG-SPORE) |
| 3 | ENG-ASKS (started 11-26) | S | all nine | - | R-165.501 |
| 4 | ENG-ROOT (packets/2026-11-25/ENG-ROOT.md) | M | 3-2 | - | R-165.452 |
| 5 | ENG-LURE + ring-to-call, bait-and-climb | M | 3-3 | 2 | R-165.502 |
| 6 | ENG-MOON + wait-for-light | M | 3-4 | - | R-165.503 |
| 7a | KIT-W3a towers: down c/b FIRST, rising c/f/b, vine sockets | L | 3-1, 3-4, 3-5 | (dark/puff bricks after 1-2) | R-165.504 |
| 7b | KIT-W3b levels: ocelot ground FIRST, lure, root r, cover m, finds, fern, swing | L | 3-2, 3-3, 3-6..3-9 | (root after 4, lure after 5) | R-165.505 |
| 8 | KEEPER-W3: REVIEW lines-3.md (t-keeper-3x 5b63cd8c6, approved 11-19) against the trims | S | all nine | - | R-165.506 |
| 9 | ART-W3 (Hugging Face): puffball, moonflower x3 + beam, lamp, guarana + shadow, thorn-vine liana x3 | M | 3-3, 3-4, 3-6, 3-7, 3-8 | - | R-165.507 |
| 10 | ENG-VINE + quiet-route, wake-from-afar (packets/2026-11-25/ENG-VINE.md) | M | 3-5, 3-8 | - | R-165.514 |
| 11 | ENG-LIGHT + toss-light, set-down-to-climb | M | 3-6, 3-9 | 1 | R-165.508 |
| 12 | ENG-FERN (+ &eyes row if cheap) | M | 3-7 | - | R-165.509 |
| 13 | ENG-SLEEPER + the s swing emitter | L | 3-8 | 10 (R-165.514) | R-165.510 |
| 14 | ENG-WAYS + bait-and-slip | M | 3-9 | 11 | R-165.511 |

## The order inside the cap (5 slots from Friday 8:30 AM ET; release 5's INT-R5 and the 2-8 / 2-9 builds share them)
FIRST (Friday morning): INT-R5 (release 5), KIT-W3a (down c/b), KIT-W3b (ocelot ground), KEEPER-W3 (3-1, 3-2), with ENG-ASKS / ENG-DARK /
ENG-SPORE landing as their lanes finish; then ENG-ROOT and ENG-MOON; BUILD-31 the moment its roll is clean with every piece landed; BUILD-32
after ENG-ROOT. 2-8 and 2-9's builds keep a slot each until World 2 is done (Saturday). Honest target (told to Matt): 3-1 to 3-4 by Sunday
night; 3-5 to 3-9 by mid next week (no tokens Mon-Tue).

## ADDED 11-26 9:45 PM ET: ENG-CUT (a cut-piece sheet for ANY world on Platform.cut)
2-8's reed island (t-art-28) has NO draw site: the only cut-piece hook is World 1's (Platform.cut -> w1CutArt.ts W1_CUT). Every World 3
cut piece (ART-W3's puffball, moonflowers, lamp, guarana, thorn-vine liana; and any w3-next cut the audit called 'nothing missing') needs the
same path. ENG-CUT (session_01FhBbYMwGKj4oBjAEW1669C, started 11-26) builds it on t-eng-cut; every art lane names its DRAW PATH (existing,
or ENG-CUT) before it paints, and the audit's 'art: nothing missing' rows are re-read against a draw path, not only the inventory.

## 11-26 10:15 PM ET: LANDED on t-eng-w3 = 13135bf6b: the DARK piece (a8bc662e5), ENG-ASKS's hazard registry (11e2af1a0) and the SPORE piece
(d653d3994), fully gated (6 shards 0 fail, lockall 102/102 in one run, tierBots 9/9). FRIDAY FIRST: ENG-ASKS-b, World 3's registry rows
(#dark, #dark@puff, #spore@puff, #soft@moon; #vine and #thornvine@doze when ENG-VINE lands) as a small data candidate on t-eng-w3; then
BUILD-31 when KIT-W3a's down c/b land and the keeper's review of 3-1's lines is in (rule 23: the lead opens 3-1's roll file first).

## 11-27 8:45 AM ET: ENG-ASKS-b's audit rolls with the asks
3-1: 48 asks, 48 LAID (#dark 32, #dark@puff 16), 0 refused. 3-2: 48 #dark asks, 30 laid, 18 REFUSED 'no dark zone in its span' at the climb
node Xc and the rope nodes Wr / Sr: World 3 has no DARK climb or DARK rope section. KIT-W3b's list gains: a dark climb brick and a dark rope
brick (3-2). A sharper refusal line ('no climb section in the pool lays #dark') is a parking-lot engine ask (R-165.521).
