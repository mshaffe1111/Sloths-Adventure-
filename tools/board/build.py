#!/usr/bin/env python3
"""Build the lead's Kanban board page (R-165.75). Reads tools/board/board.json and reference/ROADMAP.md,
writes tools/board/dist/board.html (ignored by git). Fails if a card has no roadmap row, sits in two
columns, is in Done without a done state on the roadmap (or the reverse), or Doing is over its limit.
Run: python3 tools/board/build.py ; then publish the page in place with the Artifact tool."""
import html, json, os, re, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(os.path.dirname(here))
cfg = json.load(open(os.path.join(here, 'board.json')))
rows = {}
for l in open(os.path.join(root, 'reference', 'ROADMAP.md'), encoding='utf-8'):
    m = re.match(r'\| (R-[\d.]+) \|', l)
    if m:
        c = [x.strip() for x in l.strip().strip('|').split('|')]
        if len(c) >= 10: rows[m.group(1)] = dict(time=c[-6], value=c[-5], size=c[-4], state=c[-3], owner=c[-2])
errs, seen = [], {}
for col in cfg['columns']:
    if col.get('limit') and len(col['cards']) > col['limit']: errs.append(f"{col['name']}: {len(col['cards'])} cards, limit {col['limit']}")
    for card in col['cards']:
        for i in [card['id']] + card.get('includes', []):
            if i not in rows: errs.append(f"{i}: no row in ROADMAP.md")
        if card['id'] in seen: errs.append(f"{card['id']}: in {seen[card['id']]} and {col['name']}")
        seen[card['id']] = col['name']
        if card['id'] in rows:
            done = rows[card['id']]['state'].startswith('done')
            if done != (col['key'] == 'done'): errs.append(f"{card['id']}: roadmap state '{rows[card['id']]['state'][:30]}' but column {col['name']}")
if errs: sys.exit('board: FAIL\n  ' + '\n  '.join(errs))
e = html.escape
stamp = subprocess.run(['date', '+%a %b %-d, %-I:%M %p ET'], env={**os.environ, 'TZ': 'America/New_York'}, capture_output=True, text=True).stdout.strip()
def hours(t):
    m = re.match(r'([\d.]+) h', t); return (m.group(1).rstrip('0').rstrip('.') if '.' in m.group(1) else m.group(1)) + ' h' if m else ''
def who(o): return re.sub(r'\s*\(.*?\)', '', o).strip()
def card(c, n, col):
    r = rows[c['id']]; out = ['<li class="card">']
    out.append(f'<div class="top"><span class="rid">{e(c["id"])}</span>' + (f'<span class="ord">{n}</span>' if col['key'] in ('matt', 'todo') else '') + '</div>')
    out.append(f'<p class="t">{e(c["title"])}</p>')
    meta = [f'<span class="who">{e(who(r["owner"]))}</span>']
    if hours(r['time']): meta.append(f'<span class="hrs">{e(hours(r["time"]))}</span>')
    out.append('<div class="meta">' + ''.join(meta) + '</div>')
    if c.get('waits'): out.append(f'<p class="waits">Waits on {e(c["waits"])}</p>')
    if c.get('includes'): out.append('<p class="waits">Carries the decided calls ' + ', '.join(e(i) for i in c['includes']) + '</p>')
    out.append('</li>'); return ''.join(out)
cols, tabs = [], []
for col in cfg['columns']:
    n = len(col['cards']); lim = f' of {col["limit"]}' if col.get('limit') else ''
    tabs.append(f'<a href="#{col["key"]}" class="tab k-{col["key"]}"><b>{n}</b>{e(col["name"])}</a>')
    body = ''.join(card(c, i + 1, col) for i, c in enumerate(col['cards'])) or '<li class="empty">Nothing here.</li>'
    cols.append(f'<section class="col k-{col["key"]}" id="{col["key"]}"><header><h2>{e(col["name"])}</h2><span class="n">{n}{lim}</span></header><p class="hint">{e(col["hint"])}</p><ol>{body}</ol></section>')
path = ''.join(f'<li class="s-{p["state"]}"><span class="dot"></span><b>{e(p["name"])}</b><small>{e(p["sub"])}</small></li>' for p in cfg['path'])
team = ''.join(f'<li><b>{e(t["role"])}</b><span>{e(t["task"])}</span><em class="st-{t["status"].split()[0]}">{e(t["status"])}</em></li>' for t in cfg['team'])
tpl = open(os.path.join(here, 'template.html'), encoding='utf-8').read()
page = (tpl.replace('{{STAMP}}', e(stamp)).replace('{{GOAL}}', e(cfg['goal'])).replace('{{SPRINT}}', e(cfg['sprint']))
        .replace('{{PATH}}', path).replace('{{TEAM}}', team).replace('{{TABS}}', ''.join(tabs)).replace('{{COLS}}', ''.join(cols)))
os.makedirs(os.path.join(here, 'dist'), exist_ok=True)
open(os.path.join(here, 'dist', 'board.html'), 'w', encoding='utf-8').write(page)
print('board: PASS,', len(seen), 'cards,', stamp)
