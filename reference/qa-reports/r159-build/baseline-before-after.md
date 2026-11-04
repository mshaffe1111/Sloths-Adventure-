# R-159.1 first-timer before/after (botBaseline.ts --worlds 1-10 --seeds 1-3, kid + adult)

- before: the lead branch at 18be5443 (a worktree); after: w8-rope2 at cdd3ec65 (a worktree): the tricks, the redo rules and the bot
  that learns World 1's answers from Dot's words. Compared run by run on every field but the run time (`ms`).
- runs: 552 before, 552 after; **outside World 1: 0 runs differ** (every other world identical).
- World 1: 14 runs differ:

| stage | who | seed | end | goal got/need | lives | hits | rescues |
|---|---|---|---|---|---|---|---|
| 1-3 | ADULT | 1 | shrine -> sealed door | 16/16 -> 0/16 | 2 -> 2 | 13 -> 13 | 0 -> 0 |
| 1-3 | ADULT | 2 | shrine -> sealed door | 18/17 -> 1/17 | 1 -> 1 | 7 -> 9 | 0 -> 0 |
| 1-3 | ADULT | 3 | sealed door -> sealed door | 6/18 -> 2/18 | 1 -> 1 | 8 -> 7 | 0 -> 0 |
| 1-4 | KID | 3 | shrine -> shrine | 0/1 -> 0/1 | 0 -> 0 | 2 -> 2 | 3 -> 3 |
| 1-6 | ADULT | 1 | shrine -> shrine | 0/1 -> 0/1 | 11 -> 8 | 2 -> 2 | 6 -> 5 |
| 1-6 | ADULT | 2 | shrine -> shrine | 0/1 -> 0/1 | 9 -> 7 | 2 -> 3 | 6 -> 5 |
| 1-6 | ADULT | 3 | shrine -> shrine | 0/1 -> 0/1 | 13 -> 13 | 0 -> 0 | 7 -> 7 |
| 1-8 | KID | 1 | shrine -> shrine | 0/1 -> 0/1 | 0 -> 0 | 1 -> 1 | 0 -> 0 |
| 1-9 | ADULT | 1 | sealed door -> sealed door | 13/20 -> 3/20 | 2 -> 1 | 13 -> 7 | 2 -> 2 |
| 1-9 | ADULT | 2 | sealed door -> sealed door | 12/20 -> 2/20 | 3 -> 1 | 16 -> 7 | 2 -> 2 |
| 1-9 | ADULT | 3 | sealed door -> sealed door | 12/20 -> 2/20 | 2 -> 1 | 12 -> 5 | 2 -> 2 |
| 1-9 | KID | 1 | sealed door -> sealed door | 1/10 -> 3/10 | 0 -> 0 | 9 -> 5 | 1 -> 1 |
| 1-9 | KID | 2 | sealed door -> sealed door | 0/10 -> 1/10 | 1 -> 1 | 13 -> 13 | 2 -> 2 |
| 1-9 | KID | 3 | sealed door -> sealed door | 2/10 -> 1/10 | 0 -> 1 | 8 -> 13 | 1 -> 2 |

Read: 1-3 and 1-9 collapse because, at cdd3ec65, the bot is never told to stomp (Dot's new 1-3 line waits on Matt's 8-word answer)
and 1-9 still asks for 20 with its boas bowl-only. Both are the placements and goals still to do; nothing outside World 1 moved.
