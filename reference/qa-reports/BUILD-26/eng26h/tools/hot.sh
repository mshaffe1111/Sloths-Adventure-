#!/bin/bash
# usage: hot.sh <root> <stage> <seeds comma> <outdir>: bundle a build of the seeds and print the hottest lines and functions
S=${S:-$(mktemp -d)}
root=$1; out=$4; rm -rf $out; mkdir -p $out
cat > $root/zz-hot.ts <<EOT
import './src/game/headlessDom.ts';
import { generateAllLevels } from './src/game/worldsData.ts';
import { buildGen2Stage } from './src/game/gen2/pipeline.ts';
import { listedStage } from './src/game/gen2/listed.ts';
const cfg = generateAllLevels().find((l: any) => l.id === '$2')!;
for (const s of [$3]) { const t0 = performance.now(); const st: any = buildGen2Stage({ config: { ...cfg, unlocked: true }, kit: listedStage('$2')!.kit(), seed: s, difficulty: 'normal' }); console.log('seed', s, (performance.now() - t0).toFixed(0), 'ms', st.platforms.length); }
EOT
(cd $root && npx esbuild zz-hot.ts --bundle --platform=node --format=esm --outfile=$out/b.mjs --log-level=error --loader:.webp=empty --loader:.png=empty); rm -f $root/zz-hot.ts
(cd $out && node --cpu-prof --cpu-prof-dir=$out b.mjs)
node -e '
const fs=require("fs");const d=process.argv[1];const p=JSON.parse(fs.readFileSync(d+"/"+fs.readdirSync(d).find(f=>f.endsWith(".cpuprofile"))));
const src=fs.readFileSync(d+"/b.mjs","utf8").split("\n");
const fileOf=(l)=>{for(let i=l;i>=0;i--){const m=src[i].match(/^\/\/ (src\/.*\.ts)$/);if(m)return m[1].split("/").pop();}return "?";};
const lt=new Map();let tot=0;for(const n of p.nodes){for(const t of n.positionTicks||[]){lt.set(t.line,(lt.get(t.line)||0)+t.ticks);tot+=t.ticks;}}
console.log("ticks",tot);[...lt].sort((a,b)=>b[1]-a[1]).slice(0,Number(process.argv[2])).forEach(([l,t])=>console.log(String(t).padStart(5),l,fileOf(l-1),src[l-1].trim().slice(0,130)));
const byId=new Map(p.nodes.map(n=>[n.id,n]));const parent=new Map();for(const n of p.nodes)for(const c of n.children||[])parent.set(c,n.id);
const self=new Map();for(let i=0;i<p.samples.length;i++)self.set(p.samples[i],(self.get(p.samples[i])||0)+1);
const tot2=new Map();for(const [id,t] of self){const seen=new Set();let c=id;while(c!==undefined){const m=byId.get(c);const k=(m.callFrame.functionName||"anon")+":"+fileOf(m.callFrame.lineNumber);if(!seen.has(k)){seen.add(k);tot2.set(k,(tot2.get(k)||0)+t);}c=parent.get(c);}}
console.log("FUNCTIONS (samples incl. callees)");[...tot2].sort((a,b)=>b[1]-a[1]).slice(0,Number(process.argv[3])).forEach(([k,t])=>console.log(String(t).padStart(6),k));
' $out ${HOT_LINES:-18} ${HOT_FN:-30}
