/**
 * Fetching the sound files: the bytes behind a url, and a load kept once it has worked but forgotten when it fails, so the next ask
 * tries again (a failed pack used to silence its effects for the whole session, with nothing said).
 */

/** the bytes behind a url; a data: url (the single-file preview build) is decoded directly, since a page may not be allowed to fetch it */
export async function bytesOf(url: string): Promise<ArrayBuffer> {
  if (url.startsWith('data:')) {
    const bin = atob(url.slice(url.indexOf(',') + 1));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out.buffer;
  }
  const res = await fetch(url);
  // (an error page is not the sound: the decoder would refuse it with nothing to say why)
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.arrayBuffer();
}

interface Memo<K, V> {
  get(k: K): V | undefined;
  set(k: K, v: V): unknown;
  delete(k: K): boolean;
}

const warned = new Set<string>();
/**
 * `start()` once for `key`, its promise shared by every later ask; if it fails it is forgotten (the next ask starts it again) and the
 * failure is said once, as `what`.
 */
export function onceUntilFailed<K, V>(memo: Memo<K, Promise<V>>, key: K, start: () => Promise<V>, what: string): Promise<V> {
  const have = memo.get(key);
  if (have) return have;
  const p = start();
  memo.set(key, p);
  p.catch((e: unknown) => {
    if (memo.get(key) === p) memo.delete(key);
    if (warned.has(what)) return;
    warned.add(what);
    console.warn(`${what} did not load (it is tried again when next needed): ${e instanceof Error ? e.message : String(e)}`);
  });
  return p;
}
