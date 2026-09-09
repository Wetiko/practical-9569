import ast,json,re
from pathlib import Path
bank=json.loads(Path('app/problems.json').read_text())
def code(n):return ast.unparse(n)
def expr(n):
 if isinstance(n,ast.Name):return n.id
 if isinstance(n,ast.Constant):return repr(n.value)
 if isinstance(n,ast.List):return 'an empty list' if not n.elts else '['+', '.join(expr(x) for x in n.elts)+']'
 if isinstance(n,ast.Dict):return 'an empty dictionary' if not n.keys else code(n)
 if isinstance(n,ast.Compare):
  names={ast.Eq:'equals',ast.NotEq:'differs from',ast.Lt:'is less than',ast.LtE:'is at most',ast.Gt:'is greater than',ast.GtE:'is at least',ast.Is:'is',ast.IsNot:'is not',ast.In:'is in',ast.NotIn:'is not in'}
  return expr(n.left)+' '+ ' and '.join(names[type(op)]+' '+expr(v) for op,v in zip(n.ops,n.comparators))
 if isinstance(n,ast.BoolOp):return (' and ' if isinstance(n.op,ast.And) else ' or ').join(expr(v) for v in n.values)
 if isinstance(n,ast.UnaryOp) and isinstance(n.op,ast.Not):return 'not ('+expr(n.operand)+')'
 if isinstance(n,ast.Call):
  f=code(n.func);a=[expr(x) for x in n.args]
  if f=='len':return 'the length of '+a[0]
  if f=='int' and len(a)==1:return a[0]+' converted to an integer'
  if f=='sum':return 'the sum of '+a[0]
  if f=='sorted':return 'the sorted values of '+a[0]
  if f=='set' and not a:return 'an empty set'
  if f=='range':return 'range('+', '.join(a)+')'
 if isinstance(n,ast.ListComp):return 'a list of '+expr(n.elt)+' for '+', '.join(code(g.target)+' in '+expr(g.iter)+(' if '+' and '.join(expr(x) for x in g.ifs) if g.ifs else '') for g in n.generators)
 if isinstance(n,ast.IfExp):return expr(n.body)+' if '+expr(n.test)+'; otherwise '+expr(n.orelse)
 return code(n)
def describe(n):
 if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)):return 'Define '+n.name+'('+', '.join(a.arg for a in n.args.args)+').'
 if isinstance(n,ast.ClassDef):return 'Define '+n.name+(' as a subclass of '+', '.join(code(b) for b in n.bases) if n.bases else ' as a class')+'.'
 if isinstance(n,(ast.Import,ast.ImportFrom)):return 'Import '+(', '.join(a.name for a in n.names))+(' from '+n.module if isinstance(n,ast.ImportFrom) else '')+'.'
 if isinstance(n,ast.Assign):
  target=' = '.join(code(t) for t in n.targets)
  if isinstance(n.value,ast.Subscript) and isinstance(n.value.slice,ast.Slice) and n.value.slice.lower is None and n.value.slice.upper is None:return 'Copy '+code(n.value.value)+' into '+target+' so the input is not changed.'
  return 'Set '+target+' to '+expr(n.value)+'.'
 if isinstance(n,ast.AugAssign):return {'Add':'Increase','Sub':'Decrease','Mult':'Multiply','FloorDiv':'Integer-divide'}.get(type(n.op).__name__,'Update')+' '+code(n.target)+' by '+expr(n.value)+'.'
 if isinstance(n,ast.Return):return 'Return '+(expr(n.value) if n.value else 'to the caller')+'.'
 if isinstance(n,ast.If):return 'Check whether '+expr(n.test)+'.'
 if isinstance(n,ast.While):return 'Repeat while '+expr(n.test)+'.'
 if isinstance(n,ast.For):return 'Process each '+code(n.target)+' in '+expr(n.iter)+'.'
 if isinstance(n,ast.With):return 'Open a managed context for '+', '.join(code(x.context_expr)+(' as '+code(x.optional_vars) if x.optional_vars else '') for x in n.items)+'; clean it up on exit.'
 if isinstance(n,ast.Try):return 'Try the following steps, with error handling below.'
 if isinstance(n,ast.ExceptHandler):return 'Handle '+(code(n.type) if n.type else 'any exception')+' rather than stopping the program.'
 if isinstance(n,ast.Raise):return 'Stop this call with '+code(n.exc)+'.'
 if isinstance(n,ast.Break):return 'Exit the nearest loop.'
 if isinstance(n,ast.Continue):return 'Skip to the next loop iteration.'
 if isinstance(n,ast.Expr) and isinstance(n.value,ast.Call):
  v=n.value;f=code(v.func);a=[expr(x) for x in v.args]
  if f.endswith('.append'):return 'Append '+a[0]+' to '+f[:-7]+'.'
  if f.endswith('.add'):return 'Record '+a[0]+' in '+f[:-4]+'.'
  if f.endswith('.clear'):return 'Remove all entries from '+f[:-6]+'.'
  if f.endswith('.write'):return 'Write '+a[0]+' to the output file.'
  if f.endswith('.execute'):return 'Execute '+a[0]+(' with bound parameters '+a[1] if len(a)>1 else '')+'.'
  return 'Call '+code(v)+'.'
 return None
sql={
'sql-filter':['Select each student name and score.','Join students to their results using the student ID.','Keep Computing results of at least 50.','Sort highest scores first; break ties alphabetically.'],
'sql-group':['Select each class and its average score.','Match each result to its student.','Restrict the input rows to Computing.','Group by class and keep averages of at least 50.','List classes alphabetically.'],
'sql-join':['Select each student ID and name.','Keep every student, attaching only their Computing result if present.','Keep unmatched students, whose result-side ID is NULL.','Order the remaining students by ID.']}
overrides={
'first-match':{2:'Start with the entire list; -1 means no match has been found.',4:'Choose the middle index using integer division.',7:'Remember this match, but keep searching left for an earlier duplicate.',8:'Discard the middle and everything to its right.',10:'Discard the middle and everything to its left.',11:'Return the earliest matching index, or -1.'},
'recursion':{2:'Base case: a one-digit number needs no further splitting.',4:'Add the last digit to the digit sum of the remaining digits.'},
'gcd':{2:'Stop when b is zero; otherwise recurse with b and the remainder of a ÷ b.'},
'matrix-totals':{3:'Sum every row, then sum each column by taking that position from every row.'},
'transpose':{3:'Create one output row per original column, preserving its top-to-bottom order.'},
'validation':{4:'Compare the final digit with the sum of the first five digits modulo 10.'},
'base-decode':{3:'Read three base-7 digits at a time, convert to a character code, then join the characters.'},
'magic-square':{6:'Require every row, column and both diagonals to sum to the same target.'},
'weighted-check':{4:'Map the weighted sum modulo 26 onto a–z and compare with the check letter.'},
'valid-bst':{5:'Require this value to fit its bounds, then tighten the bounds for each subtree.'},
'flask-lab':{10:'Route GET requests for / to the following view.',16:'Route POST requests for /add to the following handler.'},
'python-sql':{2:'Execute a parameterised lookup and turn each returned tuple into a list.',3:'Use ? to bind name safely, then order matching rows by ID.'},
'mongo-lab':{2:'Insert the following three documents in one operation.',3:'Create Ari’s initial score document.',4:'Create Mei’s initial score document.',5:'Create Jo’s initial score document.',6:'Update only Ari’s score to 81.',7:'Delete every document with a score below 50.',8:'Read the matching documents and collect their names.',9:'Keep scores of at least 80, return names without IDs, and sort by name.'}}
result={}
for p in bank:
 lines=p['solution'].splitlines();notes={}
 if p['kind']=='sql':notes={i+1:x for i,x in enumerate(sql[p['id']])}
 else:
  tree=ast.parse(p['solution'])
  for node in sorted(ast.walk(tree),key=lambda n:(getattr(n,'lineno',0),getattr(n,'col_offset',0))):
   desc=describe(node)
   if desc:notes.setdefault(node.lineno,[]).append(desc)
  notes={n:' '.join(dict.fromkeys(v)) for n,v in notes.items()}
  for i,line in enumerate(lines,1):
   if line.strip()=='else:':notes[i]='Run this branch if the preceding condition failed (or the loop completed without break).'
   if line.lstrip().startswith('#'):notes[i]=line.strip('# ').strip()
   if line.lstrip().startswith('@'):notes[i]='Register the following function with '+line.strip()[1:]+'.'
  notes.update(overrides.get(p['id'],{}))
  for i,line in enumerate(lines,1):
   if line.strip() and i not in notes:
    previous=max((n for n in notes if n<i),default=1);notes[i]='Continue the expression begun on line '+str(previous)+'.'
 result[p['id']]=[{'line':n,'text':text} for n,text in sorted(notes.items()) if n<=len(lines) and lines[n-1].strip()]
Path('app/solution-guides.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Generated guides:',len(result),'; explained lines:',sum(map(len,result.values())))
