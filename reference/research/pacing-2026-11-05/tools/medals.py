# save each mariowiki page and print its Time Attack sentence: medals.py out_prefix file...
import json,re,sys
pre=sys.argv[1]
for f in sys.argv[2:]:
    d=json.load(open(f))
    for r in d['results']:
        n=r['url'].rsplit('/',1)[1]
        open(f'{pre}{n}.md','w').write('URL: '+r['url']+'\nRead: 2026-11-05 via TinyFish fetch_content\n\n'+r['text'])
        m=re.search(r'time of (\d+:\d\d)\.\d\d is required to get a gold medal, a time of (\d+:\d\d)\.\d\d for silver, and a time of (\d+:\d\d)\.\d\d for bronze',r['text'])
        print(n, *(m.groups() if m else ['NO MEDAL LINE']), sep='\t')
    for e in d['errors']: print('ERR',e['url'],e.get('error'))
