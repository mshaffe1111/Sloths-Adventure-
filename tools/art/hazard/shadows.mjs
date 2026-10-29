// Old vs new, drawn side by side on a real 4-9 ledge frame (2026-10-29, hazard-anim): the flat code ovals (the Sovereign's shadow, the
// eagle's shadow, a ring drop's landing spot, 4-7's glide shadow) beside the one soft shadow sprite that replaces them, and the 4-9
// feather painted. The old drawing is copied here from the base branch. Needs the dev server (this branch) on <port>.
//   node tools/art/hazard/shadows.mjs <port> <out.png>
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '5173', out = 'shadows.png'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 } });
await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('4-9'));
await p.waitForTimeout(6000);
for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
await p.waitForTimeout(1500);
const shot = await p.screenshot({ type: 'png' });
const url = await p.evaluate(async (b64) => {
  const G = await import('/src/game/w4Grit.ts');
  const F = await import('/src/game/bossFx.ts');
  F.warmBossFx();
  await new Promise((r) => setTimeout(r, 1500));
  const im = new Image();
  im.src = 'data:image/png;base64,' + b64;
  await im.decode();
  const c = document.createElement('canvas');
  c.width = 844; c.height = 780;
  const x = c.getContext('2d');
  x.drawImage(im, 0, 0); x.drawImage(im, 0, 390);
  const y = 243; // the ledge top in this frame
  const label = (t, yy) => { x.font = '700 14px sans-serif'; x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 3; x.strokeText(t, 10, yy); x.fillText(t, 10, yy); };
  // before: the Sovereign's two ovals, the eagle's halo and core, a ring drop's oval, the glide shadow
  x.save();
  x.fillStyle = 'rgba(8, 12, 8, 0.42)'; x.beginPath(); x.ellipse(170, y - 3, 110, 15, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(8, 12, 8, 0.25)'; x.beginPath(); x.ellipse(170, y - 3, 170, 24, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(8, 12, 8, 0.225)'; x.beginPath(); x.ellipse(560, y - 6, 120, 20, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(8, 12, 8, 0.5)'; x.beginPath(); x.ellipse(560, y - 6, 82, 12, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(20, 10, 2, 0.65)'; x.beginPath(); x.ellipse(640, y + 10, 34, 10, 0, 0, Math.PI * 2); x.fill();
  x.globalAlpha = 0.58; x.fillStyle = '#0f172a'; x.beginPath(); x.ellipse(400, y + 2, 32, 7, 0, 0, Math.PI * 2); x.fill();
  x.restore();
  label('BEFORE: Sovereign shadow / glide shadow / eagle shadow / ring drop (flat code ovals)', 20);
  // after
  const Y = y + 390;
  G.drawSoftShadow(x, 170, Y - 3, 380, 56, 0.6); G.drawSoftShadow(x, 170, Y - 3, 250, 34, 0.75);
  G.drawSoftShadow(x, 560, Y - 6, 280, 46, 0.5); G.drawSoftShadow(x, 560, Y - 6, 190, 30, 0.8); G.drawSoftShadow(x, 560, Y - 6, 150, 22, 0.7);
  G.drawSoftShadow(x, 640, Y + 10, 1.5 * 60 + 48, 28, 0.9);
  G.drawSoftShadow(x, 400, Y + 2, 88, 21, 0.85);
  F.drawFx(x, 'feather', 300, Y - 150, 30, { rot: 0.5, ay: 0.5 });
  F.drawFx(x, 'feather', 340, Y - 4, 30, { rot: 1.45, ay: 0.5 });
  label('AFTER: the one soft shadow sprite (w4Grit drawSoftShadow), and the painted feather falling and lying on the ledge', 410);
  return c.toDataURL('image/png');
}, shot.toString('base64'));
const fs = await import('node:fs');
fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
await b.close();
console.log(out);
