const { castRun } = await import("/home/user/Sloths-Adventure-/tools/inspect/castBots.ts");
const r = castRun('kid', 'easy', '2-9', Number(process.argv[2] ?? 3));
console.log(JSON.stringify({ end: r.end, rescues: r.rescues, hits: r.hits, stuck: r.stuck, cast: r.cast }));
