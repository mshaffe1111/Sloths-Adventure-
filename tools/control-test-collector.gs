/**
 * Sloths Control Tests: receives recordings from the control-test page and adds them to this sheet.
 *
 * It does one thing: when the test page sends a recording, it adds one row to the "Sessions" tab.
 * It cannot read your email, your Drive or any other file. It only writes to this spreadsheet.
 *
 * Each row: when it arrived, the player's nickname, which session, which part of the session,
 * the phone's screen size and how it was held, the game version, how many seconds it covers,
 * and the recorded touches and moves (a block of data for Claude to read).
 */

// the test page sends this with every recording; anything without it is ignored
const KEY = 'SAME-KEY-AS-THE-TEST-PAGE';
// a Google Sheets cell holds at most 50,000 characters
const MAX_DATA = 48000;

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.k !== KEY) return reply({ ok: false });
    const data = String(body.d || '');
    if (data.length > MAX_DATA) return reply({ ok: false, why: 'too big' });
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sessionsTab().appendRow([
        new Date(),
        safe(body.who, 40),
        safe(body.session, 40),
        Number(body.part) || 0,
        safe(body.device, 160),
        safe(body.build, 40),
        Number(body.secs) || 0,
        safe(data, MAX_DATA),
      ]);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false });
  }
}

// opening the web address in a browser just says it is working
function doGet() {
  return reply({ ok: true, says: 'Sloths control-test collector is running' });
}

function sessionsTab() {
  const book = SpreadsheetApp.getActive();
  let tab = book.getSheetByName('Sessions');
  if (!tab) {
    tab = book.insertSheet('Sessions');
    tab.appendRow(['Arrived', 'Player', 'Session', 'Part', 'Device', 'Version', 'Seconds', 'Data']);
    tab.setFrozenRows(1);
  }
  return tab;
}

// text from the page is never treated as a formula
function safe(v, n) {
  const s = String(v == null ? '' : v).slice(0, n);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
