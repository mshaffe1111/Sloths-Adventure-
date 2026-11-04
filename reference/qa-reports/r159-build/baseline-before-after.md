# R-159.1 first-timer before/after, round 2 (2026-11-04, OLD BOT: the thumb that cannot ease off, bot-fix's fix not merged)

All numbers here come from the old bot (the lead, 2026-11-04). Every one is re-measured together after bot-fix's thumb fix merges.

## Worlds 1-10, 552 runs a side (`botBaseline.ts --worlds 1-10 --seeds 1-3`, kid + adult)
- before: the lead branch as it stood at 12:20 PM ET (a worktree; fix-petals' R-150.8 bot change included).
- after: w8-rope2 with Matt's 1-3 tip and 1-9 opening and the bot timed for a moving thumb. The vault line and the vault bot
  were not yet in.
- Compared run by run on every field but run time. **Outside World 1: 0 of 498 runs differ.** World 1: 19 differ:

| stage | who | seed | end | goal got/need | lives | hits | rescues |
|---|---|---|---|---|---|---|---|
| 1-3 | ADULT | 1 | shrine -> sealed door | 16/16 -> 5/8 | 2 -> 0 | 13 -> 4 | 0 -> 1 |
| 1-3 | ADULT | 2 | shrine -> sealed door | 18/17 -> 7/8 | 1 -> 0 | 7 -> 3 | 0 -> 0 |
| 1-3 | ADULT | 3 | sealed door -> sealed door | 6/18 -> 2/6 | 1 -> 0 | 8 -> 0 | 0 -> 2 |
| 1-3 | KID | 1 | sealed door -> sealed door | 0/8 -> 0/4 | 0 -> 0 | 9 -> 4 | 0 -> 1 |
| 1-3 | KID | 2 | sealed door -> sealed door | 0/8 -> 0/4 | 0 -> 0 | 9 -> 5 | 0 -> 0 |
| 1-3 | KID | 3 | sealed door -> sealed door | 0/8 -> 0/3 | 0 -> 0 | 3 -> 1 | 1 -> 3 |
| 1-4 | ADULT | 2 | shrine -> shrine | 0/1 -> 0/1 | 0 -> 0 | 4 -> 4 | 0 -> 0 |
| 1-4 | ADULT | 3 | shrine -> shrine | 0/1 -> 0/1 | 0 -> 0 | 1 -> 0 | 1 -> 1 |
| 1-4 | KID | 3 | shrine -> shrine | 0/1 -> 0/1 | 0 -> 0 | 2 -> 2 | 3 -> 3 |
| 1-6 | ADULT | 1 | shrine -> shrine | 0/1 -> 0/1 | 11 -> 8 | 2 -> 2 | 6 -> 5 |
| 1-6 | ADULT | 2 | shrine -> shrine | 0/1 -> 0/1 | 9 -> 7 | 2 -> 3 | 6 -> 5 |
| 1-6 | ADULT | 3 | shrine -> shrine | 0/1 -> 0/1 | 13 -> 13 | 0 -> 0 | 7 -> 7 |
| 1-8 | KID | 1 | shrine -> shrine | 0/1 -> 0/1 | 0 -> 0 | 1 -> 1 | 0 -> 0 |
| 1-9 | ADULT | 1 | sealed door -> sealed door | 13/20 -> 20/23 | 2 -> 5 | 13 -> 12 | 2 -> 3 |
| 1-9 | ADULT | 2 | sealed door -> sealed door | 12/20 -> 19/23 | 3 -> 5 | 16 -> 13 | 2 -> 3 |
| 1-9 | ADULT | 3 | sealed door -> sealed door | 12/20 -> 19/23 | 2 -> 5 | 12 -> 12 | 2 -> 3 |
| 1-9 | KID | 1 | sealed door -> sealed door | 1/10 -> 5/10 | 0 -> 4 | 9 -> 13 | 1 -> 3 |
| 1-9 | KID | 2 | sealed door -> sealed door | 0/10 -> 5/10 | 1 -> 3 | 13 -> 11 | 2 -> 2 |
| 1-9 | KID | 3 | sealed door -> sealed door | 2/10 -> 7/10 | 0 -> 4 | 8 -> 12 | 1 -> 2 |

Read:
- 1-3: the goal itself changed (8 snakes and a purge kept; plan approved). The adult now gets 2-7 of 6-8. The kid gets 0, as he did
  before (0 of 8): his punch hesitation walks him into each snake (the thumb defect).
- 1-9: more snakes and boas finished (the bot kicks boas once told). New lives lost: "water" at the master stretch's vault, untaught
  then.
- 1-4/1-6/1-8: one or two runs move by a hit or a rescue (the boa and snake answers on their animals). Every end is unchanged.

## World 1's 1-3 and 1-9 on the final bot (Matt's vault line in, the bot taught the vault from it, vault snakes back on respawn)

| stage | who | seed | end | goal got/need | lives | rescues | causes |
|---|---|---|---|---|---|---|---|
| 1-3 | ADULT | 1 | sealed door | 5/8 | 0 | 1 |  |
| 1-3 | ADULT | 2 | sealed door | 7/8 | 0 | 0 |  |
| 1-3 | ADULT | 3 | sealed door | 2/6 | 0 | 2 |  |
| 1-3 | KID | 1 | sealed door | 0/4 | 0 | 1 |  |
| 1-3 | KID | 2 | sealed door | 0/4 | 0 | 0 |  |
| 1-3 | KID | 3 | sealed door | 0/3 | 0 | 3 |  |
| 1-9 | ADULT | 1 | sealed door | 20/23 | 2 | 2 | foe:boa, foe:snake |
| 1-9 | ADULT | 2 | sealed door | 21/23 | 2 | 2 | foe:boa, foe:snake |
| 1-9 | ADULT | 3 | sealed door | 19/23 | 2 | 2 | foe:boa, foe:boa |
| 1-9 | KID | 1 | sealed door | 6/10 | 1 | 2 | foe:boa |
| 1-9 | KID | 2 | sealed door | 6/10 | 4 | 2 | foe:snake, water, water, water |
| 1-9 | KID | 3 | sealed door | 7/10 | 4 | 2 | foe:snake, water, water, water |

Read:
- The adult crosses 1-9's vault drop on every seed (no water).
- The kid falls there on 2 of 3 seeds. He vaults once. After a lost life past it, his punch at the snake comes 0.4 s late, and the
  thumb that can't ease off walks him past the lip. That's the old bot's defect; it's re-measured after the fix.
- The vault snake coming back on respawn is a real stage fix: before it, a life lost past the vault left the drop uncrossable.
- The 1-3 and 1-9 goals are NOT set from these runs yet: the kid's 1-3 zeros are the thumb defect, not the stage.
