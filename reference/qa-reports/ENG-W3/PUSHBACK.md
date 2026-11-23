# ENG-W3a pushback (before building; checked in the code at main cdffdc627)

Two done-items of the packet cannot both hold as written.

1. **"addlevel READY on the row" and "a draft row, not listed; the live 3-1 stays" contradict.** addlevel's READY is registrycheck's
   full list (tools/engine/addlevel.ts:100-107 -> registrycheck.ts:148-172): `routed` (no HAND_STAGES shadow, i.e. the old 3-1 deleted),
   a drawcheck scenario, a proven seed list in src/game/gen2/proven, a judged flown scope, LEVEL_ATTEMPTS. That IS listing 3-1.
   Worse: any '3-1' row put in STAGE_TABLE while protoStage.ts:62 HAND_STAGES['3-1'] shadows it is a `routed` miss, so CI's
   `npx tsx tools/engine/registrycheck.ts` (gates.yml) and registrycheck.test.ts "the shipped table passes the gate" go RED
   (listed.ts:55 makes every STAGE_TABLE row LISTED; there is no draft state today).
2. **stagePlan.ts `travel: 'down'` for 3-1 changes the LIVE 3-1.** worldsData.ts:288/394 copies the plan's travel into 3-1's config, and
   the engine plays a stage by config.travel alone (stageModes.ts:1-5, :52-60: progress by y, camera lead down, flags 'further' by y).
   The old horizontal 3-1 would be played as a way down.

**What I am building (option A, my recommendation; a question does not end my box):** a draft row that no game path reads:
`DRAFT_TABLE['3-1'] = { kit: 'w3', travel: 'down' }` in stageTable.ts (LISTED, registrycheck and the game never see it), and the
tools take `--draft` (one tools-side helper: the row installed with listed.ts withTestStage, the HAND_STAGES shadow lifted and the
config given the row's travel, for that process only). The proof: addlevel --draft steps 1-5 green (row, rolls, a list PLANTED in
memory not written, bots 40 seeds both settings, flown), step 6's live-only needs (routed, drawcheck, attempts, CI) printed as "what
3-1's build adds"; the plant: the draft's travel set back to 'right' turns the down test red. stagePlan.ts's `travel: 'down'` moves to
3-1's build commit (with HAND_STAGES['3-1'] deleted), the one commit where the old 3-1 is replaced.
**Option B:** list 3-1 on gen2 on t-eng-w3 (old 3-1 deleted there, placeholder arc live on the branch): literal READY, but a
half-built 3-1 replaces the old one on a shared branch.
