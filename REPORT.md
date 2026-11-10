**Method used:** reference/roles/DESIGNER.md and packet R-165.60 (fly the real engine, stepped at 30 fps; fix the ruler, never the data).
**Lessons applied:** the harness was proved before it was trusted (FakeInput against InputEngine); every figure is flown and reproducible; what was not flown is named.

# REPORT R-165.60 (Designer, attempt 1, Mon 11-09 8:59 PM ET) branch t-designer-reach

## 1. Done-items
1. **reach.md: done.** Flown in the real engine (`npx tsx reference/specs/sims/flight.ts <normal|easy> all`; runs saved in
   reference/specs/sims/out/). Normal 1-1 = Easy on rises. Apex: single 97.8, double 189.0, bounce 167.6 over the cap (197.6 over the
   floor), bounce + air jump 259.1 (289.1). Highest block climbed: 123 / 214 / 223 / 317. Widest level gap, one press, any timing:
   single 244 Normal, 246 Easy; double flick 396 / 400; bounce 179 / 183; bounce + air jump 340.
   Verdicts (reach.md §4): JUMP_RISE 107.8 is 10.0 too high as an apex; the bounce's own rise 13.7 too high (BOUNCE_REACH's sum is
   right within 1.1 on 1-1 by luck of the +12% second jump); DOUBLE_RISE 4.5 low on 1-1; reachJump single 174.7 is 33-69 px short,
   double 313.2 is 57-83 short; maxGap single confirmed on Easy, 15 px over its slack claim on Normal; riseLimit single confirmed;
   Easy's double rise clamp 113.9 is under the single's 123; LAND_HALF off by 3-7.
2. **bands.md: done.** Per setting: single gap and rise (unchanged), double teach as a rise (Easy 128-132, Normal 136-140), double
   gap as a Normal test (250-262), bounce lip 232-246 with one air jump; §5 lists every w1.ts line that moves.
3. **help.md: done as a proposal.** Four steps, failures and seconds, Easy and Normal, with sources. Thresholds are benchmarks, not
   flown and not yet tuned on tester data (said at its top).
4. **touch.md: done.** Flown: a Pad tap,tap clears the Easy double rise on 53% of tries and the 250 px gap on 18%; a tapped Pad jump
   is 61.7 px against a touch flick's 97.2. The Pad coach line teaches the wrong press. No new touch harness is needed (touchRig.ts).
5. **Engine packet: done.** reference/specs/packets/ENGINE-flight-test.md, in the dispatch shape.
Checks run: `npx tsc --noEmit -p .` exit 0 (flight.ts is in the repo's tsc). No suite, build or perf gate was run (the dispatch said not to).

## 2. Polish check
No screens changed. Each spec was read as its reader will: every number has its command and tolerance; tables checked line by line
against sims/out/normal.txt and easy.txt; 0 backslash-backticks; no tester name, code or survey text.

## 3. Pushback
- **P1 (done-item 2, "a bounce alone clears it"):** not possible with a margin on a floor mushroom. Bounce alone climbs 223 px, a
  plain double 214: the only band is 216-221, 2 px spare, lost at 25 fps (bounce 220.8). I ruled lip 232-246 with one air jump and
  wrote the other way (190-205, teaches but does not block) in bands.md §4. The lead picks; the lesson card's words follow.
- **P2 (frozen input, "TEACH 195-205" as a gap to re-band):** a gap that blocks one jump (250+) is cleared by a double flick on
  72% of tries or fewer. I moved Normal's double TEACH to the rise block and kept the gap as a test. Say if a gap teach must stay.
- **P3 (the packet's coyote note):** FakeInput's 0.16 s press keep changes nothing in flight; its missing minimum hold does (reach.md §5).
- Branch name: the dispatch said t-designer-reach, the packet t-r165-60-reach; I used the dispatch's.

## 4. Suggestions (ready packets)
- **Engine, R-165.60-E:** reference/specs/packets/ENGINE-flight-test.md (send as is).
- **Content, after it:** enter bands.md §5 in src/game/gen2/worlds/w1.ts; rebuild provenSeeds and the pins; done = the first-timer
  bot clears every teach and the single-jump bot fails every block on 16 seeds, both settings.
- **Engine, the Easy tap:** on Easy the Pad's Jump button holds 220 ms (padControl.ts `PAD_HOP_MS` by setting); done = flight.ts
  `easy rshare` shows tap,tap at 100% on 128-132. Until then Content changes `COACH_TEXT.pad.jump` to "press and hold".
- **Designer, next flights:** Normal from stage 25 (no early help), a gap onto a raised bank, thin-lip shares, a raised mushroom.

## 5. Unresolved
- Not flown: Normal from stage 25; thin-lip shares; double hold gaps; the coyote frame count on its own; help.md's thresholds.
- help.md was the last priority and is a proposal, not a measured spec. Nothing else was cut.
- The Analyst's hold-time data was not read (not to wait for it): whether real Pad presses are taps is open.
- Matt typed "Additional art" with 12 images in this session by mistake ("wrong bot"); relayed to the lead as text, no action taken.

## 6. Method update
reference/roles/DESIGNER.md "Traps" should add: apex is not reach (the lip hoist adds 26 px, the catch 20 px, coyote 6 frames);
fly with the game's InputEngine, never FakeInput's bare `press`; a share names its tries. DESIGNER.md "What's known going in" is now
answered by reference/specs/reach.md.

## 7. Turnover note
reference/handoffs/designer.md rewritten in this commit: §3.2 and §3.3 changed on the flown numbers, §3.10 rewritten to the float
ruling (R-165.54), §4 and §5 updated, the specs added to §1.
