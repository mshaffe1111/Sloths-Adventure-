/**
 * The Android app's own plugins reach the phone (PROOF-1 violation 1). A Capacitor plugin is a Proxy that answers EVERY property, `then`
 * too, so a promise that resolves to the bare plugin treats it as a thenable, calls its `then` (a native method that does not exist) and
 * never settles: keepScreenOn() (KeepAwake, live in 0.9.6) and wantAudioFocus() (AudioFocus) never reached Android.
 * Run with Capacitor's real native bridge (the file the Android WebView injects, from @capacitor/android) and a fake androidBridge that
 * answers every call, the way the phone does. The calls go through the game's real functions, not a copy of their pattern.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';

const g = globalThis as Record<string, any>;
const calls: string[] = [];
const prevWindow = g.window;
g.window = g;
// (the bridge's logger patches document.cookie, XHR and fetch: a bare stand-in for each, nothing the plugin path reads)
g.Document ??= class {};
if (!Object.getOwnPropertyDescriptor(g.Document.prototype, 'cookie')) Object.defineProperty(g.Document.prototype, 'cookie', { get: () => '', set: () => {}, configurable: true });
g.document ??= new g.Document();
g.XMLHttpRequest ??= class { open() {} send() {} setRequestHeader() {} };
g.androidBridge = {
  postMessage(json: string) {
    const d = JSON.parse(json);
    calls.push(`${d.pluginId}.${d.methodName}:${JSON.stringify(d.options)}`);
    setTimeout(() => g.Capacitor.fromNative({ callbackId: d.callbackId, pluginId: d.pluginId, methodName: d.methodName, success: true, data: {} }), 0);
  },
};
const bridgeFile = createRequire(import.meta.url).resolve('@capacitor/android/capacitor/src/main/assets/native-bridge.js');
vm.runInThisContext(readFileSync(bridgeFile, 'utf8'));
g.Capacitor.PluginHeaders = [
  { name: 'KeepAwake', methods: [{ name: 'set', rtype: 'promise' }] },
  { name: 'AudioFocus', methods: [{ name: 'want', rtype: 'promise' }] },
];
process.on('unhandledRejection', () => {}); // (the broken pattern's `then` rejects unhandled, exactly as the page error showed)

const reached = async (call: string, ms = 1500) => {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if (calls.includes(call)) return true;
    await new Promise((r) => setTimeout(r, 10));
  }
  return false;
};

test('the harness: Capacitor reads as the Android app here', async () => {
  const { nativeApp } = await import('./appShell.ts');
  assert.equal(nativeApp(), true);
});

test('keepScreenOn reaches KeepAwakePlugin.java, both ways, and again on a second call', async () => {
  const { keepScreenOn } = await import('./appShell.ts');
  keepScreenOn(true);
  assert.ok(await reached('KeepAwake.set:{"on":true}'), `native calls: ${JSON.stringify(calls)}`);
  keepScreenOn(false);
  assert.ok(await reached('KeepAwake.set:{"on":false}'), `native calls: ${JSON.stringify(calls)}`);
});

test('wantAudioFocus reaches AudioFocusPlugin.java, both ways', async () => {
  const { wantAudioFocus } = await import('./audioFocus.ts');
  wantAudioFocus(true);
  assert.ok(await reached('AudioFocus.want:{"on":true}'), `native calls: ${JSON.stringify(calls)}`);
  wantAudioFocus(false);
  assert.ok(await reached('AudioFocus.want:{"on":false}'), `native calls: ${JSON.stringify(calls)}`);
});

// The countermeasure spread: no game file hands a registered plugin to a promise (a `.then` or an async function returning it). A plugin
// is held in a wrapper object, or used inside the callback that registered it.
test('no source file resolves a promise to a bare Capacitor plugin', () => {
  const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
  const bad: string[] = [];
  const walk = (d: string) => {
    for (const n of readdirSync(d)) {
      const p = path.join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n)) {
        const src = readFileSync(p, 'utf8');
        // `.then(... => registerPlugin<...>(...))` with no wrapper object, or `return registerPlugin(` inside an async function
        if (/\.then\(\s*\([^)]*\)\s*=>\s*registerPlugin\b/.test(src) || /async[^{]*\{[^}]*return\s+registerPlugin\b/.test(src)) bad.push(path.relative(root, p));
      }
    }
  };
  walk(root);
  assert.deepEqual(bad, []);
});

test.after(() => {
  g.window = prevWindow;
});
