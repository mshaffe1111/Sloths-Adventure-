# PLAN-W3 REPORT (Designer, written 5:56 PM 11-19 ET by `date`)
EXACT NEXT STEP: lead reads reference/plans/WORLD-3-PLAN.md §2 and §4, starts F1 ENG-W3a, F3 ENG-PROWL, F4 W3-ART-1 (and F2/F5) as slots free; DESIGN-31-32 reads the plan.

## Done-items (packet 1-6)
1. Stage table 3-1..3-9 + hidden + guardian: WORLD-3-PLAN §1 (EXISTS/UNWIRED/NEW, file:line on origin/main 6e7b85f8f, toys, art, meter, bot).
2. Engine list, deduplicated, dependency order, NOW vs waits: §2 (F1-F6 foundations, D1-D9 wait).
3. Art list for HF: §3 (counts from src/game/art/inventory/w3.json; 29-30 pieces; $4-8, cap $10).
4. Slot plan Fri 11-20..next week; builds 3-1 Tue 12-1 .. 3-6/3-9 from Tue 12-8: §4.
5. World 4 outline + the map's three new pieces checked + art gaps: §5.
6. Questions for Matt: §6 Q1 (the roof-root creep feel, R-160.1), recommendation A.
Gates: roadmapcheck, knowncheck, timecheck (from origin/t-time-168b): results in the lead message.

## Polish check
Docs only: no screens. Every cite re-grepped last (D52).

## Pushback
Yes, 5 items: WORLD-3-PLAN "Pushback" (prowler fix belongs in the kit, not enemyBrain.ts; noise->sleeper exists; ART-HANG mostly not
needed; one-week rule can idle builders; GAME-MAP §4 W3 stale on four points).

## Suggestions
The packet stubs in §2 are ready to send as written (one member each).

## Unresolved (not checked, named plainly)
Whether a long fall hurts (3-1's soft drops); who throws a lure in a gen2 stage; trap, find and slide meter channels; rustle frames;
thorn vine art scale; a let-go hang frame in hero-rope.webp. The packet's HF balance (~$49) is used as given.

## Method used / Lessons applied / Method update
Method: none existed for world plans; wrote reference/methods/world-plan.md. Lessons: D30 (stamps from date), D34/D52 (file:line, cites
last), D40 (dependency order; no patch of the old enemyBrain path), D41 (Pokey 89.1 px), D43 (engine for every stage), D53 (fast gates
before push), D57 (queue read at push), D66 (grep what exists before sizing), D75 (toys on real rows), D90 (lean reads).
Method update: grep the creature kit first (world-plan.md step 2); count art from the inventory JSON (step 3).

## Turnover note
reference/handoffs/designer.md: a "World plans" section added at the top (this commit).
