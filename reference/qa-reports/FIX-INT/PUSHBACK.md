# FIX-INT pushback: stageQuality.test.ts:50 "World 1 median 180 s" (band 135-175). Band NOT edited (LAWS 22). Written 4:46 PM ET.

## Numbers (designed layout, the test's own model: gen2Model for gen2 stages, modelStage otherwise; typical / fast, seconds)
| Stage | Builder | Base 2bcdda54 (main 0.9.7 + docs) | t-int-5 (src = t-int-4's 2bb29f8d) | targetSeconds |
|---|---|---|---|---|
| 1-1 | gen2 | 180 / 147 | 180 / 147 | 139 |
| 1-2 | gen2 | 213 / 183 | 213 / 183 | 135 |
| 1-3 | gen2 | 240 / 188 | 240 / 188 | 141 |
| 1-4 | old then gen2 | 150 / 122 | **213 / 188** | 140 |
| 1-5 | old then gen2 | 148 / 114 | **261 / 218** | 140 |
| 1-6 / 1-7 / 1-8 / 1-9 | old | 147 / 116, 152 / 112, 152 / 107, 159 / 116 | same | 134-151 |
World 1 median: base 152 (in band), now 180. Sorted now: 147 152 152 159 180 213 213 240 261. Every gen2 World 1 stage is over 175.

## Why this is the band, not a stage
- The band's ceiling is the OLD generator's target: stageTime.ts:83-84 "a typical stage of World 1 is about 2:15" (TYPICAL_W1 = 135),
  and the test reads it as "about two and a quarter minutes in World 1" (stageQuality.test.ts:50).
- Matt's rule since: STAGE-RULES.md:77 "Every stage takes at least 2 minutes for a quick player, on every roll (5+ minutes is fine)":
  a floor and no ceiling. gen2 lays to it on every roll, so its typical runs about 1.2x its quick: 180-261 s.
- The open rule-break on World 1 is the other way: ROADMAP R-165.206, 1-4 too SHORT for quick players (castBots expert min 101 s),
  to be lengthened. That fix raises the median further; the band as written would then fail for doing what the rule asks.
- 1-1, 1-2, 1-3 already sat at 180-240 on main; the test passed only because the 4 old-builder stages held the median down.

## Not proven (named plainly)
- The packet says 1-5 is "designed 206 s". I found no 206 for 1-5 in w1Arc15.ts, stageTable.ts or reference/qa-reports/B15/. If 206
  typical is its design, 1-5 (261) is the one stage long against its own design: that is w1Arc15.ts (B15's lane), not this packet's.
- Old-builder 1-6..1-9 read 107-116 s fast in the model; STAGE-RULES.md:77 is judged by quick-player bots, not this model; not measured here.

## Ask (the lead's ruling; Matt's if the band changes)
The World 1 band in stageQuality.test.ts:58 needs a ruling against STAGE-RULES.md:77 (e.g. a floor only, as Matt's rule is), made for
its own reason, not to clear this red. Until then this test stays red on t-int-5 and I have not touched it.

## 4:58 PM ET: the lead's 4:49 PM ruling applied (W1 >= 135 kept; W1's cap now "W1 median <= W10 median"); the test is still red
Next assertion down, kept whole by the ruling: "World 2 is shorter than World 1" (stageQuality.test.ts:64, med(w) >= med(w-1) - 6).
World medians now (typical, designed layout): W1 180, W2 159, W3 172, W4 174, W5 188, W6 197, W7 211, W8 218, W9 230, W10 238.
W2-W4 are all old-builder stages (2-1..2-9 at 155-194) laid to the same old linear target (stageTime.ts:96, TYPICAL_W1 -> TYPICAL_W10),
so W2 >= W1 - 6 is that same old number, not a rule of Matt's. W3 >= W2 - 6 onward all hold. Needs a second ruling.
