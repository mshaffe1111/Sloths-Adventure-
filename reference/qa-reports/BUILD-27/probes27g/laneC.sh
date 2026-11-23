#!/bin/bash
# BUILD-27g lane C: artcheck, the shipping build + chunkcheck, roadmapcheck, timecheck (vite writes dist/: run where dist is writable). buildcheck is a TIMING gate: run it ALONE after all lanes: node tools/perf/buildcheck.mjs
cd "$1" || exit 9; O=$2; mkdir -p $O
r() { local n=$1; shift; local t0=$(date +%s); "$@" > $O/$n.txt 2>&1; echo "$n exit=$? $(( $(date +%s)-t0 ))s" >> $O/lines.txt; }
r artcheck node tools/perf/artcheck.mjs
r vitebuild env BASE_PATH=/Sloths-Adventure-/ npx vite build
r chunkcheck node tools/perf/chunkcheck.mjs
r roadmapcheck node tools/roadmapcheck.mjs
r timecheck node tools/timecheck.mjs
echo LANE-C-DONE >> $O/lines.txt
