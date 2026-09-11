"""Targeted assessment additions, applied by build_bank.py."""
def refine(bank):
 by={p['id']:p for p in bank}
 by['word-paths']['tests'].append(dict(label='Two equal scores retain order',expr='rank_paths([["A","B"]],[[1,1]],[[0,0,""],[0,1,""]])',expected=[['A',1],['B',1]]))
 p=by['tournament-tree']
 p['setup']+='''\ndef rejects_shared():
    try:Tree([['a',1,'b','b'],['b',2,None,None]],'a')
    except ValueError:return True
    return False
'''
 p['tests'].append(dict(label='Reject a shared child',expr='rejects_shared()',expected=True))
 p=by['register-import'];p['setup']+='''\ndef wrong_header():
    from pathlib import Path
    Path('wrong.csv').write_text('name,id,score\\nAri,1,80\\n')
    c=connection()
    try:import_register(c,'wrong.csv')
    except ValueError:return c.execute('SELECT COUNT(*) FROM Student').fetchone()[0]==0
    return False
''';p['tests'].append(dict(label='Wrong header leaves database unchanged',expr='wrong_header()',expected=True))
 p=by['master-update'];p['setup']+='''\ndef ordered_recreation():
    Path('base.csv').write_text('4,Old\\n')
    transactions='4,D,\\n4,I,New\\n4,U,Final\\n6,U,Missing\\n7,I,Last\\n'
    Path('tx.csv').write_text(transactions)
    count=apply_updates('base.csv','tx.csv','out.csv')
    return [count,Path('out.csv').read_text(),Path('tx.csv').read_text()==transactions]
''';p['tests'].append(dict(label='Delete, recreate and update the same key',expr='ordered_recreation()',expected=[2,'4,Final\n7,Last\n',True]))
 for id,text in {
 'shared-pool':'Explain why every slot belongs to exactly one live list or the free chain, including after a failed insertion.',
 'master-update':'Explain why only the current master record and transaction are retained, and why same-key transactions keep their input order.',
 'tournament-tree':'Explain why a repeated node ID during traversal indicates a cycle or shared child, and why payload edits leave links unchanged.',
 'word-paths':'Explain why equal scores never swap in the bubble sort and why bounds are checked before indexing.',
 'register-import':'Explain why header validation precedes writes and why unexpected database errors roll back the whole import.'}.items():
  if text not in by[id]['rubric']:by[id]['rubric'].append(text)
