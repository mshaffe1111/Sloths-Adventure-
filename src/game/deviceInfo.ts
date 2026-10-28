/**
 * deviceInfo — what the control test's recorder notes about where the game is running, so a problem on one phone can be traced
 * to its browser or its shell (Matt, 2026-10-28: Sally's phone ran at 1-3 fps in what was probably Facebook's in-app browser, and the
 * recording could not say so).
 *
 * Kept to kinds and versions, never anything that names a person or a phone: the browser and its major version, the system and its
 * version, the app the page is opened inside (Facebook, Instagram, ...), whether it is in a frame (Matt's Claude test link is one) or
 * installed to the home screen, the graphics chip's family as the browser reports it (and whether it is drawing in software), the
 * memory and cores the browser reports (already rounded by the browser), the language, and the screen and motion settings. No full
 * browser string, no phone model.
 *
 * `browserOf` and `inAppOf` read a user-agent string and are pure, so the tests can check real ones.
 */

/** the browser and its major version, from a user-agent string ('Chrome 130', 'Safari 18', 'Samsung Internet 26', ...) */
export function browserOf(ua: string): string {
  const v = (re: RegExp) => re.exec(ua)?.[1] ?? '';
  const named = (name: string, re: RegExp) => `${name} ${v(re)}`.trim();
  if (/SamsungBrowser\//.test(ua)) return named('Samsung Internet', /SamsungBrowser\/(\d+)/);
  if (/EdgA\/|EdgiOS\/|Edg\//.test(ua)) return named('Edge', /Edg(?:A|iOS)?\/(\d+)/);
  if (/OPR\/|OPT\//.test(ua)) return named('Opera', /OP[RT]\/(\d+)/);
  if (/FxiOS\//.test(ua)) return named('Firefox', /FxiOS\/(\d+)/);
  if (/Firefox\//.test(ua)) return named('Firefox', /Firefox\/(\d+)/);
  if (/CriOS\//.test(ua)) return named('Chrome', /CriOS\/(\d+)/);
  // an Android WebView says "; wv)" and carries a Chrome version: it is an app's own view, not the Chrome app
  if (/Android/.test(ua) && /; wv\)/.test(ua)) return named('Android WebView', /Chrome\/(\d+)/);
  if (/Chrome\//.test(ua)) return named('Chrome', /Chrome\/(\d+)/);
  if (/Safari\//.test(ua) && /Version\//.test(ua)) return named('Safari', /Version\/(\d+)/);
  // an iPhone app's own view has no "Safari/" and no "Version/"
  if (/iPhone|iPad/.test(ua)) return named('iOS WebView', /OS (\d+)_/);
  return 'other';
}

/** the app the page is opened inside, if it is one of the usual in-app browsers; '' for a plain browser */
export function inAppOf(ua: string): string {
  if (/FB_IAB\/MESSENGER|FBAN\/Messenger|MessengerForiOS|MessengerLite/.test(ua)) return 'Messenger';
  if (/Instagram/.test(ua)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS/.test(ua)) return 'Facebook';
  if (/musical_ly|TikTok|BytedanceWebview/.test(ua)) return 'TikTok';
  if (/Snapchat/.test(ua)) return 'Snapchat';
  if (/Twitter|TwitterAndroid/.test(ua)) return 'X';
  if (/LinkedInApp/.test(ua)) return 'LinkedIn';
  if (/Pinterest/.test(ua)) return 'Pinterest';
  if (/ Line\//.test(ua)) return 'Line';
  if (/ GSA\//.test(ua)) return 'Google app';
  if (/Discord/.test(ua)) return 'Discord';
  return '';
}

/** the system and its version ('Android 14', 'iOS 18.1'), never the phone model */
export function systemOf(ua: string): string {
  const and = /Android (\d+(?:\.\d+)?)/.exec(ua);
  if (and) return `Android ${and[1]}`;
  const ios = /(?:iPhone|CPU) OS (\d+)_(\d+)/.exec(ua);
  if (ios) return `iOS ${ios[1]}.${ios[2]}`;
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS X/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux';
  return 'other';
}

/** a graphics chip name that means the browser is drawing without one (the slowest way a canvas game can run) */
export function softwareGpu(renderer: string): boolean {
  return /SwiftShader|llvmpipe|softpipe|Software|Microsoft Basic Render/i.test(renderer);
}

let gpu: string | null = null;
/** the graphics chip as the browser names it ('Adreno (TM) 650', 'Apple GPU'), worked out once; 'no webgl' when the browser has none */
function gpuName(): string {
  if (gpu !== null) return gpu;
  gpu = 'unknown';
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl') ?? c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return (gpu = 'no webgl');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    gpu = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).slice(0, 80);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    /* keep 'unknown' */
  }
  return gpu;
}

/** how the page is shown: 'framed' inside another page (the Claude test link), 'installed' from the home screen, else 'browser' */
function shellOf(): string {
  try {
    if (window.top !== window.self) return 'framed';
  } catch {
    return 'framed'; // a frame from another site cannot even read window.top
  }
  const standalone = (navigator as unknown as { standalone?: boolean }).standalone === true || matchMedia('(display-mode: standalone)').matches;
  return standalone ? 'installed' : 'browser';
}

/** the short part for the device line every recording row carries: 'Chrome 130; in Facebook; framed' */
export function browserShort(): string {
  const ua = navigator.userAgent;
  const app = inAppOf(ua);
  return [browserOf(ua), app ? `in ${app}` : '', shellOf()].filter(Boolean).join('; ');
}

/** the full picture, once at the start of a recording (the 'env' moment) */
export function envDetail(): string {
  const ua = navigator.userAgent;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; saveData?: boolean } };
  const g = gpuName();
  const mq = (q: string) => {
    try {
      return matchMedia(q).matches;
    } catch {
      return false;
    }
  };
  const parts = [
    `browser ${browserOf(ua)}`,
    `app ${inAppOf(ua) || 'none'}`,
    `system ${systemOf(ua)}`,
    `shell ${shellOf()}`,
    `gpu ${g}${softwareGpu(g) ? ' (software)' : ''}`,
    `memory ${nav.deviceMemory ? `${nav.deviceMemory} GB` : '?'}`,
    `cores ${nav.hardwareConcurrency || '?'}`,
    `lang ${nav.language || '?'}`,
    `net ${nav.connection?.effectiveType ?? '?'}${nav.connection?.saveData ? ' save-data' : ''}`,
    `zoom ${(window.visualViewport?.scale ?? 1).toFixed(2)}`,
    `orientation ${screen.orientation?.type ?? '?'}`,
  ];
  if (mq('(prefers-reduced-motion: reduce)')) parts.push('reduced motion');
  if (mq('(prefers-color-scheme: dark)')) parts.push('dark mode');
  return parts.join('; ');
}
