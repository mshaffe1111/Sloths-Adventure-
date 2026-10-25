/**
 * Drive the blind play-test harness (server.cjs).
 *
 *   node tools/qa/qa.cjs <port> persona jen [N]             play with that tester's phone size and thumbs (tools/playtesters/personas);
 *                                                         N = their thumbs as in their Nth real session (they got better)
 *   node tools/qa/qa.cjs <port> start 4-8 [land|port] [flag] [layout]  open a stage sideways (land) or upright (port), optionally
 *                                                         from its Nth flag; layout picks the roll (default 1, the same every time),
 *                                                         optionally from its Nth flag
 *   node tools/qa/qa.cjs <port> do "right 800" "jump" "right+jump 300" "wait 1000"
 *   node tools/qa/qa.cjs <port> click "Got it!"           press a button on screen by its words
 *   node tools/qa/qa.cjs <port> look                      just a screenshot
 *   node tools/qa/qa.cjs <port> turn                      turn the phone the other way up
 *   node tools/qa/qa.cjs <port> burst                     eight frames in a row (to catch flicker and jitter)
 *   node tools/qa/qa.cjs <port> perf                      how much memory the page is using
 *
 * Each prints the screenshot's path and the words on screen. Keys: left right up down jump punch kick mega, joined with + to press
 * together, then how long to hold them (ms of game time, default 120).
 * Touch (the phone's real controls): "steer right 800" puts the left thumb down and slides it (it stays down, so the next steps run
 * while steering; "steer none" stops, "steer up"/"steer down" climb), "lift" takes it off, "tap" (right thumb), "flick up|down|left|right",
 * "flickhold up 600" (flick, then keep the thumb on the glass), "hold 700". The game stands still between commands.
 */
const http = require('http');
const [port, cmd, ...rest] = process.argv.slice(2);
const body =
  cmd === 'start' ? { cmd, stage: rest[0], view: rest[1], flag: rest[2], layout: rest[3] }
  : cmd === 'do' ? { cmd, steps: rest }
  : cmd === 'click' ? { cmd, text: rest.join(' ') }
  : cmd === 'persona' ? { cmd, name: rest[0], level: rest[1] }
  : { cmd };
const req = http.request({ host: '127.0.0.1', port: Number(port), method: 'POST', path: '/' }, (res) => {
  let s = '';
  res.on('data', (c) => (s += c));
  res.on('end', () => {
    const o = JSON.parse(s);
    if (o.error) console.log('ERROR', o.error);
    if (o.shot) console.log('SHOT', o.shot);
    if (o.shots) console.log('SHOTS', o.shots.join(' '));
    if (o.errors) for (const e of o.errors) console.log('PAGE', e);
    if (o.text) console.log('SCREEN', o.text);
  });
});
req.on('error', (e) => console.log('ERROR harness not running on', port, e.message));
req.end(JSON.stringify(body));
