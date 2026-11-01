# Follow-ups from the 2-3 stuck-cages fix (commit 33fd7b4c, shipped in 0.9.1)
- 2-8: on the reed islands the room's reset post stands 30-44 px left of the stone pile; a tap from a step behind the stones can hit the post (nearest piece wins) and reset the room instead of picking a stone up.
- World 1 (protoStage.ts, mouth 236) and kitStage.ts (basket3, mouth 236) have high baskets with the same unaimed flick-up arc (~95 px forward, a 50 px landing strip); check them in play and give them aimUp (puzzleKit.ts) if a throw from under the basket misses.
