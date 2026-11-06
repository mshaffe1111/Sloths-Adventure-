# Release 0.9.5: drafts (release clerk, for the lead to approve)

Status: DRAFT. package.json is NOT bumped yet (the brief: bump only once engine-core's final commit is in). Every line below is for the
lead to approve or rewrite; the What's New words then go to Matt with the test link.

## 1. Version
- `package.json` `"version"`: 0.9.4 -> **0.9.5** (HANDOFF §7: one stage rebuilt is a patch, not a new world). Done at the final merge, in
  the same commit as the What's New entry (whatsNew.test.ts fails if the top entry is not package.json's version).

## 2. What's New, top entry (src/game/whatsNew.ts), DRAFT
Only claims checked in the code are here (sources beside each line, not shipped). Anything about what the stage holds (logs, banks,
mushrooms) waits for the lead's look at the real stage on the test link, because the seed list picks from many sections.

```ts
  {
    version: '0.9.5',
    date: '2026-11-06',
    title: 'A brand-new first stage',
    items: [
      'Into the Canopy, the very first stage, is built all over again.',
      'It is laid out a little differently each time you play it.',
      'Dot has new things to say as you climb.',
    ],
  },
```
- Line 1: stageGenerator.ts:2870 (1-1's Play is gen2 outside the QA picker), gen2/worlds/w1.ts.
- Line 2: testlink1_1.ts newPlay11 (a fresh proven seed each press of Play; no repeat until the whole list is played).
- Line 3: dotLinesData.ts hint.1-1.bank / .high / .noMoss (Matt's approved lines, R-165.41).
- To check: playerText.test.ts must pass on the entry (the gate runs at the final merge). Option for the lead: name one thing the player
  will see in every roll (once the stage is final), in place of line 3.

## 3. PLAY-STORE-RULES §6 (all 8 items), DRAFT: filled at the final merge
| # | Item | Proof / status |
|---|---|---|
| 1 | Nothing tappable or readable under the bars/notch, both ways, foldable size | clipcheck on the candidate (412x915, 915x412, fresh/old/done); in-play HUD over gen2 1-1: stills to shoot. Foldable size: not checked unless shot (clipcheck has no foldable size) |
| 2 | Back does something sensible on the new screen | No new screen in the player build (the Old 1-1/Rolls picker is QA-only and is deleted before release, step 6). To check: Back in play on 1-1 = pause, as before |
| 3 | Nothing new sent off the phone | npm run build:store + checkStoreBuild (gate 4); the #ctest recorder is QA-only behind its hash (stripped from the store build: to confirm in checkStoreBuild's output) |
| 4 | Nothing loads from the web; airplane mode | build:store's check for outside addresses; airplane mode on a real phone: not checked here (no phone in the container) |
| 5 | Sound stops in the background; nothing keeps the phone awake | No sound or wake code changed by this release (to confirm with a diff of src/audio and any wakeLock at the final merge) |
| 6 | Leave and come back (and rotate) keeps the place | Code: 1-1's seed is kept until the next Play, so a restart or respawn rebuilds the same stage (testlink1_1.ts playSeed); rotation in play to shoot |
| 7 | No dead ends or placeholder screens in the store build | The QA picker is gone (step 6); the store build's walk = clipcheck |
| 8 | Saves survive everything | No save format change expected (to confirm: diff of the save code at the final merge); kill-at-the-worst-moment on a real phone: not checked here (no phone) |

## 4. Gate table: in reference/notes/release-clerk-status.md, copied here at the final merge
