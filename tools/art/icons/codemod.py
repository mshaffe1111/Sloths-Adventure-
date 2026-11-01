"""Swap <Icon> for <PaintedIcon> in the given files (icons-painted). Static names map through PAINTED_FOR (read from PaintedIcon.tsx),
dynamic ones go through paint(); rotate={180} becomes a mirror; size + 2 (the painted objects carry a little margin).
Inline arrows in text are left for TextGlyph by hand.   python3 tools/art/icons/codemod.py <file>..."""
import re, sys
from pathlib import Path
src = Path('src/components/icons/PaintedIcon.tsx').read_text()
body = src[src.index('PAINTED_FOR'):]
body = body[body.index('{') + 1: body.index('};')]
MAP = dict(re.findall(r"(\w+): '(\w+)'", body))
for f in sys.argv[1:]:
    s = Path(f).read_text()
    def rep(m):
        attrs = m.group(1)
        nm = re.search(r'name="(\w+)"', attrs)
        if nm:
            if nm.group(1) == 'note':
                return m.group(0)
            attrs = attrs.replace(nm.group(0), f'name="{MAP.get(nm.group(1), nm.group(1))}"')
        else:
            attrs = re.sub(r'name=\{([^}]*)\}', lambda q: f'name={{paint({q.group(1)})}}', attrs, count=1)
        attrs = re.sub(r'size=\{(\d+)\}', lambda q: f'size={{{int(q.group(1)) + 2}}}', attrs)
        # the painted `back` points left: an old arrow turned 180 is it as is; an old arrow pointing right is it mirrored
        if nm and nm.group(1) == 'arrow':
            if ' rotate={180}' in attrs:
                attrs = attrs.replace(' rotate={180}', '')
            else:
                attrs = attrs.replace(' className="', ' className="pic-flip ') if ' className="' in attrs else attrs.rstrip() + ' className="pic-flip" '
        attrs = attrs.replace(' rotate={180}', '')
        return f'<PaintedIcon{attrs}/>'
    s2 = re.sub(r'<Icon(\s[^>]*?)/>', rep, s)
    if s2 != s and 'PaintedIcon' not in s:
        pass
    if "from './icons/PaintedIcon.tsx'" not in s2 and '/icons/PaintedIcon.tsx' not in s2:
        rel = '../icons/PaintedIcon.tsx' if '/components/' in f and f.count('/') > 2 else './icons/PaintedIcon.tsx'
        if f.startswith('src/components/icons/'):
            rel = './PaintedIcon.tsx'
        s2 = re.sub(r"(import [^\n]*from '[^']*icons/index\.tsx';)", rf"\1\nimport {{ PaintedIcon, paint }} from '{rel}';", s2, count=1)
    Path(f).write_text(s2)
    print(f, len(re.findall(r'<Icon\b', s2)), 'left')
