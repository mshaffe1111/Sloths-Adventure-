#!/usr/bin/env node
// Prints the current Eastern time on every prompt (UserPromptSubmit hook), so the lead never converts UTC by hand (D42:
// on 11-11 the lead typed UTC-4 times in EST and told Matt times an hour late). ~20 tokens a turn.
const t = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', weekday: 'short', month: 'numeric', day: 'numeric', timeZoneName: 'short' });
process.stdout.write(`Now: ${t} (use this; never convert UTC by hand)\n`);
