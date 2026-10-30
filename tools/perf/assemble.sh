#!/usr/bin/env bash
# Builds reference/perf-report/ from the harness's JSON (tools/perf/run.mjs) laid out as <src>/<set>/<build>.json.
#   tools/perf/assemble.sh <src dir>
# Each set gets report.md, summary.json and raw/<build>.json.gz.
set -euo pipefail
SRC="$1"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/reference/perf-report"
mkdir -p "$OUT"
run() { # set, builds, diffs
  local set="$1" builds="$2" diffs="$3"
  [ -d "$SRC/$set" ] || return 0
  mkdir -p "$OUT/$set/raw"
  PERF_BUILDS="$builds" PERF_DIFF="$diffs" node "$ROOT/tools/perf/report.mjs" "$SRC/$set" "$OUT/$set/report.md" "$OUT/$set/summary.json" > /dev/null
  for f in "$SRC/$set"/*.json; do case "$f" in *partial*|*summary*) ;; *) gzip -9c "$f" > "$OUT/$set/raw/$(basename "$f").gz" ;; esac; done
  echo "wrote $OUT/$set"
}
run ctest-q0 v6,v7,today,ccrground,merged today:ccrground,today:merged,v6:merged
run ctest-q2 v6,today,merged v6:merged,today:merged
run stages-q0 v6,v7,today,merged v6:merged,today:merged
run stages-q2 merged ''
run four-stages-q0 today,ccrnow,merged today:ccrnow,today:merged
