#!/usr/bin/env bash
# The lead's ONE commit path (CI #109, D162; cold review 11-27 items 2-4): commit and push ONLY when roadmapcheck passes on exactly the
# tree being committed. The 11-27 one-liner ('set -o pipefail; node tools/roadmapcheck.mjs | grep -q "^FAIL" && echo FAIL || commit')
# never gated: with pipefail the pipeline is non-zero whether the check passed or failed, so the commit always ran.
#
# Usage:  bash tools/team/leadcommit.sh "<subject>" <path> [<path> ...]   commit the named paths, push
#         bash tools/team/leadcommit.sh --dry-run <path> [...]             run every check, commit nothing
#         bash tools/team/leadcommit.sh --plant                             prove the gate refuses a planted bad row
# Rules it enforces:
#  - roadmapcheck judged by its EXIT CODE. Exit 2 (a shallow clone: proofs skipped) is "not a pass": the script fetches --unshallow
#    and runs it again. With full history, a done row's "PR #N has no merge commit in this history" is accepted ONLY when origin/main
#    holds "Merge pull request #N from" (the lead's branch may lag main's newest release merges); every other red refuses.
#  - only the named paths: any other change in the working tree (tracked or untracked) refuses, so the tree checked is the tree committed.
#  - the trailers: the attribution lines the harness requires, with the session id read from reference/handoffs/lead.md line 1 (the
#    lead writes its own id there at its start), never a hard-coded id.
#  - the push: HEAD to the CURRENT branch, then to every branch listed one per line in .git/leadcommit-mirrors (per clone, never committed).
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

judge() { # judge <dir>: 0 = pass; prints the reds
  local dir="$1" out rc bad=0 seen=0 n mainmerges line
  out="$(mktemp)"
  (cd "$dir" && node tools/roadmapcheck.mjs) > "$out" 2>&1; rc=$?
  if [ "$rc" = 2 ]; then
    git -C "$dir" fetch -q --unshallow origin 2>/dev/null
    (cd "$dir" && node tools/roadmapcheck.mjs) > "$out" 2>&1; rc=$?
    [ "$rc" = 2 ] && { echo "leadcommit: roadmapcheck INCOMPLETE (shallow clone; --unshallow failed): not a pass"; rm -f "$out"; return 1; }
  fi
  if [ "$rc" != 0 ]; then
    git -C "$dir" fetch -q origin +refs/heads/main:refs/remotes/origin/main 2>/dev/null
    mainmerges="$(git -C "$dir" log --format=%s origin/main 2>/dev/null | sed -n 's/^Merge pull request #\([0-9]*\) from.*/\1/p')"
    while IFS= read -r line; do
      seen=1
      n="$(printf '%s' "$line" | sed -n 's/.*PR #\([0-9]*\) has no merge commit in this history.*/\1/p')"
      if [ -n "$n" ] && printf '%s\n' "$mainmerges" | grep -qx "$n"; then continue; fi
      bad=1; echo "$line" | cut -c1-300
    done < <(grep -E "^✗" "$out")
    if [ "$bad" = 1 ] || [ "$seen" = 0 ]; then
      echo "leadcommit: ROADMAP CHECK FAILED (exit $rc)"; grep -E "^FAIL|^INCOMPLETE" "$out"; rm -f "$out"; return 1
    fi
    echo "leadcommit: roadmapcheck rows pass; $(grep -c '^✗' "$out") 'PR #N not merged here' lines proven merged on origin/main"
  fi
  rm -f "$out"; return 0
}

if [ "${1:-}" = "--plant" ]; then
  wt="$(mktemp -d)/plant"
  git worktree add -q --detach "$wt" HEAD || exit 1
  # a planted red: a time cell without its history range (R-12)
  python3 - "$wt/reference/ROADMAP.md" <<'PY'
import sys
p = sys.argv[1]; L = open(p).read().split('\n')
i = max(n for n, l in enumerate(L) if l.startswith('| R-'))
L.insert(i + 1, "| R-999.1 | a planted bad row | Day 1: plant | none | 0.1 h | A | S | open | lead | the plant |")
open(p, 'w').write('\n'.join(L))
PY
  if judge "$wt" > /dev/null; then echo "leadcommit --plant: FAIL (the planted red PASSED the gate)"; r=1; else echo "leadcommit --plant: PASS (the planted red was refused)"; r=0; fi
  git worktree remove --force "$wt"; exit "$r"
fi

dry=0; [ "${1:-}" = "--dry-run" ] && { dry=1; shift; }
if [ "$dry" = 0 ]; then subject="${1:?subject}"; shift; fi
[ "$#" -gt 0 ] || { echo "leadcommit: name the paths to commit"; exit 1; }

# only the named paths may differ from HEAD
others="$(git status --porcelain --untracked-files=all | cut -c4- | while IFS= read -r f; do
  keep=0; for p in "$@"; do p="${p%/}"; case "$f" in "$p"|"$p"/*) keep=1;; esac; done; [ "$keep" = 0 ] && echo "$f"; done)"
if [ -n "$others" ]; then echo "leadcommit: changes outside the named paths (commit them by name, or stash them):"; echo "$others" | head -10; exit 1; fi

judge . || { echo "leadcommit: nothing committed"; exit 1; }
[ "$dry" = 1 ] && { echo "leadcommit --dry-run: every check passes; nothing committed"; exit 0; }

sid="$(head -1 reference/handoffs/lead.md | grep -o 'session_[A-Za-z0-9]*' | head -1)"
[ -n "$sid" ] || { echo "leadcommit: no session id on reference/handoffs/lead.md line 1"; exit 1; }
git add -A -- "$@" || exit 1
git commit -q -m "$subject" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/$sid" || exit 1
branch="$(git rev-parse --abbrev-ref HEAD)"
targets="$branch"; [ -f .git/leadcommit-mirrors ] && targets="$targets $(tr '\n' ' ' < .git/leadcommit-mirrors)"
for b in $targets; do
  ok=0; for t in 2 4 8 16; do git push -q origin "HEAD:$b" && { ok=1; break; }; sleep "$t"; done
  [ "$ok" = 1 ] || { echo "leadcommit: push to $b FAILED (committed locally; fetch and merge, then push)"; exit 1; }
done
git log --oneline -1
