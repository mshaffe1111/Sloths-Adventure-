# INT-1-1: the stair builder's old-layout rules, each switched off on the re-laid 1-1 (200 listed seeds x 2 settings)
Run on b575da9's parent code with a temporary switch per rule (removed after), by `cmp.ts.txt` (pieces whose grown boxes change when the
rule is off; each flown three ways: with the rule, without it, and with no help at all). A row reads `needs help|nothing` (no help: plain
jumps fail|pass), `keep pass|FAIL(n grown)`, `drop pass|FAIL(n grown)`. Decided: catch, hidden, takein, planks KEPT (a row with drop
FAIL, or help lost where it was given); stumpswap and sliver DROPPED (no drop FAIL, no help lost where needed).
