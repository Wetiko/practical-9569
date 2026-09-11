import json
from pathlib import Path
bank=json.loads(Path('app/problems.json').read_text());guides=json.loads(Path('app/solution-guides.json').read_text())
lessons=json.loads(Path('content/expansion/solution-lessons.json').read_text())
for folder in ['app/challenges','app/references']:Path(folder).mkdir(exist_ok=True)
catalogue=[]
for p in bank:
 meta={**p,'description':'','rubric':['']*len(p['rubric']),'starter':'','solution':'','setup':'','files':{},'hints':[],'tests':[{'label':t['label'],'expr':'','expected':None} for t in p['tests']]}
 catalogue.append(meta)
 Path('app/challenges',p['id']+'.json').write_text(json.dumps({**p,'solution':''},separators=(',',':'))+'\n')
 Path('app/references',p['id']+'.json').write_text(json.dumps({'solution':p['solution'],'steps':guides[p['id']],**({'lesson':lessons[p['id']]} if p['id'] in lessons else {})},separators=(',',':'))+'\n')
Path('app/catalogue.json').write_text(json.dumps(catalogue,separators=(',',':'))+'\n')
