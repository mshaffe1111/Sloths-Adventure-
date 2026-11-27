#!/usr/bin/env bash
# The lead's commit (CI #109, D162): commit and push ONLY when roadmapcheck exits 0, judged by its EXIT CODE.
# The one-line pattern used 11-27 ('set -o pipefail; node tools/roadmapcheck.mjs | grep -q "^FAIL" && echo FAIL || commit') never gated:
# with pipefail the pipeline is non-zero whether the check passed (grep finds nothing) or failed (the check exits 1), so '||' always ran.
# Usage: bash tools/team/leadcommit.sh "<subject>" <path> [<path> ...]
# It adds the paths, commits with the session trailers, and pushes HEAD to both lead branches. A failed check prints its ✗ lines and exits 1.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1
subject="${1:?subject}"; shift
[ "$#" -gt 0 ] || { echo "leadcommit: name the paths to commit"; exit 1; }
out="$(mktemp)"
node tools/roadmapcheck.mjs > "$out" 2>&1; rc=$?
if [ "$rc" != 0 ]; then
  # The lead branch does not carry main's newest release merges, so a done row's 'PR #N' can read as unmerged HERE. Such a line is
  # accepted only when origin/main really holds 'Merge pull request #N from' (the fact checked, not the rule loosened). Every other
  # ✗ line, and a run with no ✗ line but a non-zero exit other than the shallow INCOMPLETE (2), refuses the commit.
  git fetch -q origin +refs/heads/main:refs/remotes/origin/main 2>/dev/null
  mainmerges="$(git log --format=%s origin/main 2>/dev/null | sed -n 's/^Merge pull request #\([0-9]*\) from.*/\1/p')"
  bad=0; seen=0
  while IFS= read -r line; do
    seen=1
    n="$(printf '%s' "$line" | sed -n 's/.*PR #\([0-9]*\) has no merge commit in this history.*/\1/p')"
    if [ -n "$n" ] && printf '%s\n' "$mainmerges" | grep -qx "$n"; then continue; fi
    bad=1; echo "$line" | cut -c1-300
  done < <(grep -E "^✗" "$out")
  if [ "$bad" = 1 ] || { [ "$seen" = 0 ] && [ "$rc" != 2 ]; }; then
    echo "leadcommit: ROADMAP CHECK FAILED (exit $rc), nothing committed"; grep -E "^FAIL|^INCOMPLETE" "$out"; rm -f "$out"; exit 1
  fi
  echo "leadcommit: roadmapcheck rows pass; $(grep -c '^✗' "$out") 'PR #N not merged here' lines proven merged on origin/main"
fi
rm -f "$out"
git add -- "$@" || exit 1
git commit -q -m "$subject" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FhBbYN2CVHnFXg7XzqKXpM" || exit 1
for b in ccr-ea739a2f-dfcee4 ccr-e71c7674-i0i93u; do
  ok=0; for t in 1 2 4 8; do git push -q origin "HEAD:$b" && { ok=1; break; }; sleep "$t"; done
  [ "$ok" = 1 ] || { echo "leadcommit: push to $b FAILED"; exit 1; }
done
git log --oneline -1
