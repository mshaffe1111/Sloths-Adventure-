import re,sys
# union every conflict block: ours then theirs (docs only)
for p in sys.argv[1:]:
    s=open(p).read()
    pat=re.compile(r'<<<<<<< [^\n]*\n(.*?)(?:\|\|\|\|\|\|\| [^\n]*\n.*?)?=======\n(.*?)>>>>>>> [^\n]*\n',re.S)
    n=len(pat.findall(s))
    s=pat.sub(lambda m:m.group(1)+('' if m.group(1).endswith('\n\n') or not m.group(1) else '')+m.group(2),s)
    assert '<<<<<<<' not in s and '>>>>>>>' not in s
    open(p,'w').write(s); print(p,n,'blocks')
