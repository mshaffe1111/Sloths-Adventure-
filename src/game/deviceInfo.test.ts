import { test } from 'node:test';
import assert from 'node:assert/strict';
import { browserOf, inAppOf, softwareGpu, systemOf } from './deviceInfo.ts';

// real user-agent strings, as phones send them
const UA = {
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  facebookAndroid:
    'Mozilla/5.0 (Linux; Android 14; SM-A146U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.6668.100 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/485.0.0.67.80;]',
  messengerAndroid:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230901.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.127 Mobile Safari/537.36 [FB_IAB/MESSENGER;FBAV/470.0.0.40.110;]',
  safariIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  facebookIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/482.0.0.40.103;FBBV/650000000;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.6;FBSS/3;FBCR/;FBID/phone;FBLC/en_US;FBOP/80]',
  instagramIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 345.0.0.31.89 (iPhone14,5; iOS 17_5; en_US; en; scale=3.00; 1170x2532; 634014373)',
  chromeIphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.37 Mobile/15E148 Safari/604.1',
  samsung:
    'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36',
  firefoxAndroid: 'Mozilla/5.0 (Android 14; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
};

test('device info: the browser and its version, an app\'s own view told apart from the Chrome or Safari app', () => {
  assert.equal(browserOf(UA.chromeAndroid), 'Chrome 130');
  assert.equal(browserOf(UA.facebookAndroid), 'Android WebView 129');
  assert.equal(browserOf(UA.safariIphone), 'Safari 18');
  assert.equal(browserOf(UA.facebookIphone), 'iOS WebView 17');
  assert.equal(browserOf(UA.chromeIphone), 'Chrome 130');
  assert.equal(browserOf(UA.samsung), 'Samsung Internet 26');
  assert.equal(browserOf(UA.firefoxAndroid), 'Firefox 131');
});

test('device info: the in-app browsers (Facebook, Messenger, Instagram), and none for a plain browser', () => {
  assert.equal(inAppOf(UA.facebookAndroid), 'Facebook');
  assert.equal(inAppOf(UA.facebookIphone), 'Facebook');
  assert.equal(inAppOf(UA.messengerAndroid), 'Messenger');
  assert.equal(inAppOf(UA.instagramIphone), 'Instagram');
  for (const ua of [UA.chromeAndroid, UA.safariIphone, UA.chromeIphone, UA.samsung, UA.firefoxAndroid]) assert.equal(inAppOf(ua), '', ua);
});

test('device info: the system and its version, never the phone model', () => {
  assert.equal(systemOf(UA.facebookAndroid), 'Android 14');
  assert.equal(systemOf(UA.safariIphone), 'iOS 18.1');
  assert.equal(systemOf(UA.facebookIphone), 'iOS 17.6');
  for (const ua of Object.values(UA)) assert.doesNotMatch(systemOf(ua) + browserOf(ua) + inAppOf(ua), /SM-|Pixel|iPhone1|Build/);
});

test('device info: a browser drawing without a graphics chip is spotted', () => {
  assert.ok(softwareGpu('Google SwiftShader'));
  assert.ok(softwareGpu('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)'));
  assert.ok(softwareGpu('llvmpipe (LLVM 15.0.7, 256 bits)'));
  assert.ok(!softwareGpu('Adreno (TM) 650'));
  assert.ok(!softwareGpu('Apple GPU'));
  assert.ok(!softwareGpu('Mali-G57 MC2'));
});
