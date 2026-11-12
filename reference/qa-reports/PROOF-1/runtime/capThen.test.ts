// PROOF-1 defect test (fails on d0276817, and on 0.9.6 for KeepAwake): appShell.ts:34 and audioFocus.ts:12 return a Capacitor plugin
// proxy from a .then() callback. The proxy answers every property, `then` too, so the promise treats it as a thenable, calls its
// `then` (a native method that does not exist), and never settles: keepScreenOn() and wantAudioFocus() never reach the phone.
// Run with Capacitor's real native bridge (the file the Android WebView injects) and a fake androidBridge that answers every call.
//   npx tsx --test reference/qa-reports/PROOF-1/runtime/capThen.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const g = globalThis as any;
const calls: string[] = [];
g.window = g;
// (the bridge's logger patches document.cookie, XHR and fetch: a bare stand-in for each, nothing the plugin path reads)
g.Document = class {};
Object.defineProperty(g.Document.prototype, 'cookie', { get: () => '', set: () => {}, configurable: true });
g.document = new g.Document();
g.XMLHttpRequest ??= class { open() {} send() {} setRequestHeader() {} };
g.androidBridge = { postMessage(json: string) { const d = JSON.parse(json); calls.push(`${d.pluginId}.${d.methodName}`); setTimeout(() => g.Capacitor.fromNative({ callbackId: d.callbackId, pluginId: d.pluginId, methodName: d.methodName, success: true, data: {} }), 0); } };
vm.runInThisContext(readFileSync(new URL('./native-bridge.js', import.meta.url), 'utf8'));
g.Capacitor.PluginHeaders = [{ name: 'KeepAwake', methods: [{ name: 'set', rtype: 'promise' }] }, { name: 'AudioFocus', methods: [{ name: 'want', rtype: 'promise' }] }];
const settle = <T,>(p: Promise<T>, ms = 1500) => Promise.race([p.then(() => 'settled' as const), new Promise<'hung'>((r) => setTimeout(() => r('hung'), ms))]);
process.on('unhandledRejection', () => {}); // (the proxy's `then` rejects, unhandled, exactly as the page error shows)
test('keepScreenOn: the plugin promise settles and set() reaches the phone (appShell.ts:34 pattern)', async () => {
  const keepAwakePlugin = import('@capacitor/core').then(({ registerPlugin }) => registerPlugin<{ set(o: { on: boolean }): Promise<void> }>('KeepAwake'));
  void keepAwakePlugin.then((p) => p.set({ on: true })).catch(() => {});
  assert.equal(await settle(keepAwakePlugin), 'settled', `the plugin promise never settles; native calls made: ${JSON.stringify(calls)}`);
});
test('wantAudioFocus: the plugin promise settles and want() reaches the phone (audioFocus.ts:12 pattern)', async () => {
  const focusPlugin = import('@capacitor/core').then(({ registerPlugin }) => registerPlugin<{ want(o: { on: boolean }): Promise<void> }>('AudioFocus'));
  void focusPlugin.then((p) => p.want({ on: true })).catch(() => {});
  assert.equal(await settle(focusPlugin), 'settled', `the plugin promise never settles; native calls made: ${JSON.stringify(calls)}`);
});
test('control: the same plugin held in a wrapper object settles and its call reaches the phone (the harness is sound)', async () => {
  const held = import('@capacitor/core').then(({ registerPlugin }) => ({ p: registerPlugin<{ set(o: { on: boolean }): Promise<void> }>('KeepAwake') }));
  assert.equal(await settle(held), 'settled');
  await (await held).p.set({ on: true });
  assert.ok(calls.includes('KeepAwake.set'), `native calls: ${JSON.stringify(calls)}`);
});
