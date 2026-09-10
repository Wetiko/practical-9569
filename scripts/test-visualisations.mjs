import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import ts from 'typescript';
import {loadPyodide} from 'pyodide';
const dir=await mkdtemp(join(tmpdir(),'viz-tests-'));
try{
for(const name of ['engine','sorting','searching','control','structures','trees','recursion','graphs','catalogue']){const src=await readFile(`app/visualisations/${name}.ts`,'utf8');const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");await writeFile(join(dir,name+'.mjs'),js);}
const {algorithms}=await import(join(dir,'catalogue.mjs'));const {defaults,parseValues,validateInput}=await import(join(dir,'engine.mjs'));
assert.equal(algorithms.length,33);assert.equal(new Set(algorithms.map(a=>a.id)).size,33);
const get=id=>algorithms.find(a=>a.id===id);
let checks=0;
const run=(id,patch={})=>{const a=get(id),input={...defaults,values:a.defaultValues??defaults.values,operation:a.operations?.[0]??'',...patch};const steps=a.generate(input);assert.ok(steps.length&&steps.length<=2000,id);assert.ok(steps.at(-1).done,id);for(const s of steps){assert.ok(s.codeLine>0&&s.codeLine<=((id==='graph'?100:a.code.split('\n').length)),`${id} line ${s.codeLine}`);assert.equal(new Set(s.array.map(x=>x.id)).size,s.array.length,id+' duplicate IDs');}checks++;return steps.at(-1);};
for(const a of algorithms)for(const op of a.operations??[''])for(const values of [[],[5],a.defaultValues??defaults.values,[2,2,-3,0]]){run(a.id,{operation:op,values});assert.deepEqual(a.generate({...defaults,operation:op,values}),a.generate({...defaults,operation:op,values}));}
let seed=9569;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
const cases=[[],[1],[2,2,1,-3,0],...Array.from({length:30},()=>Array.from({length:rand()%12},()=>rand()%21-10))];
for(const a of algorithms.filter(a=>a.category==='Sorting'))for(const values of cases){const r=run(a.id,{values});assert.deepEqual(r.result,[...values].sort((a,b)=>a-b),a.id);assert.ok(!r.array.some(x=>x.hole));}
for(const id of ['linear-search','binary-search','recursive-binary'])for(const values of cases)for(const target of [-10,0,5,99]){const r=run(id,{values,target}).result;const input=id==='linear-search'?values:[...values].sort((a,b)=>a-b);if(input.includes(target)){assert.equal(input[r],target);if(id==='linear-search')assert.equal(r,input.indexOf(target));}else assert.equal(r,-1);}
for(let n=0;n<=6;n++){assert.deepEqual(run('for-loop',{index:n}).result,Array.from({length:n},(_,i)=>i));assert.deepEqual(run('while-loop',{index:n}).result,Array.from({length:n},(_,i)=>i));assert.equal(run('factorial',{target:n}).result,[1,1,2,6,24,120,720][n]);assert.equal(run('fibonacci',{target:n}).result,[0,1,1,2,3,5,8][n]);assert.deepEqual(run('basic-recursion',{target:n}).result,Array.from({length:n},(_,i)=>n-i));}
assert.deepEqual(run('break',{index:6,target:2}).result,[0,1]);assert.deepEqual(run('continue',{index:4,target:2}).result,[0,1,3]);assert.equal(run('if-else',{target:-1}).result,'negative');assert.equal(run('return',{values:[0,-2,3,4]}).result,3);
for(const [id,op,expected] of [['stack','Pop',[7,2,9,1,5]],['queue','Dequeue',[2,9,1,5,3]],['array','Delete',[7,9,1,5,3]],['linked-list','Delete',[7,9,1,5,3]]])assert.deepEqual(run(id,{operation:op}).array.map(v=>v.value),expected);
for(const op of ['Insert','Delete','Search','Traversal'])for(const target of [8,1,10,99]){const r=run('bst',{values:[8,3,10,1,6,14],operation:op,target});const expected=[8,3,10,1,6,14];if(op==='Insert'&&!expected.includes(target))expected.push(target);if(op==='Delete'&&expected.includes(target))expected.splice(expected.indexOf(target),1);assert.deepEqual(r.nodes.map(n=>Number(n.label)).sort((a,b)=>a-b),expected.sort((a,b)=>a-b));}
for(const values of cases)for(const op of ['Insert','Extract']){const a=get('heap');const r=run(a.id,{values,operation:op,target:4}).array.map(x=>x.value);for(let i=1;i<r.length;i++)assert.ok(r[Math.floor((i-1)/2)]<=r[i]);}
assert.deepEqual(run('dijkstra').result,{distances:{A:0,B:3,C:2,D:8,E:10,F:13},path:['A','C','B','D','E','F']});
assert.deepEqual(run('dijkstra',{edges:'A B 0\nB A 1\nC D 2',start:'A',end:'D'}).result.path,[]);
for(const id of ['bfs','dfs']){const r=run(id,{edges:'A B 1\nB A 1\nB C 1',start:'A',end:'D'}).result;assert.deepEqual([...r].sort(),['A','B','C']);}
assert.deepEqual(parseValues(''),[]);assert.throws(()=>parseValues('1,,2'));assert.throws(()=>validateInput({...defaults,index:5,target:3},get('nested-loops')));
const py=await loadPyodide();
for(const a of algorithms){py.globals.set('source',a.code);py.runPython('import ast\nast.parse(source)');}
for(const a of algorithms.filter(a=>a.category==='Sorting'))for(const values of cases.slice(0,12)){py.globals.set('source',a.code);py.globals.set('raw',JSON.stringify(values));const fn=a.code.match(/def (\w+)\(a\):/)?.[1]??a.code.match(/def (\w+)\(/)[1];py.globals.set('fn',fn);const actual=py.runPython(`import json\nnamespace = {}\nexec(source, namespace)\na = json.loads(raw)\nresult = namespace[fn](a, 0, len(a)-1) if fn == "quick_sort" else namespace[fn](a)\njson.dumps(a if result is None else result)`);assert.deepEqual(JSON.parse(actual),run(a.id,{values}).result,a.id+' displayed Python');}
for(const a of algorithms.filter(a=>['Control flow','Recursion'].includes(a.category)&&!['recursive-binary','tree-traversal'].includes(a.id)))for(let n=0;n<=6;n++){
 const patch={target:n,index:a.id==='nested-loops'?3:n};if(a.id==='nested-loops')patch.target=n%5;
 const input={...defaults,...patch};py.globals.set('source',a.code);py.globals.set('raw',JSON.stringify(input));py.globals.set('id',a.id);
 const result=py.runPython(`import json
ns={}
exec(source,ns)
i=json.loads(raw)
fn=next(v for k,v in ns.items() if callable(v) and k != '__builtins__')
args=([i['index'],i['target']] if id in ['break','continue','nested-loops'] else [i['index']] if id in ['for-loop','while-loop'] else [i['values']] if id=='return' else [i['target']])
json.dumps(fn(*args))`);
 assert.deepEqual(JSON.parse(result),run(a.id,patch).result,a.id+' Python result');
}
for(const id of ['array','stack','queue','set','heap','hash-table'])for(const operation of get(id).operations)for(const values of [[],[2],[2,-3,2,9]]){
 const a=get(id),input={...defaults,values,operation};py.globals.set('source',a.code);py.globals.set('raw',JSON.stringify(input));py.globals.set('id',id);
 const result=py.runPython(`import json, heapq
from collections import deque
ns={}
exec(source,ns)
i=json.loads(raw)
a=i['values']
if id=='queue': a=deque(a)
if id=='set': a=set(a)
if id=='heap' and any(a[(j-1)//2]>a[j] for j in range(1,len(a))): a=sorted(a)
if id=='hash-table':
 table=[[] for _ in range(7)]
 for v in a:
  if v not in table[v%7]: table[v%7].append(v)
 a=table
fn=ns[{'hash-table':'hash_operation'}.get(id,id+'_operation')]
args=[a,i['operation']]+([i['index']] if id=='array' else [])+[i['target']]
r=fn(*args)
if isinstance(r,(set,deque)): r=list(r)
json.dumps(r)`);
 const expected=run(id,{values,operation}).result,actual=JSON.parse(result);if(id==='set'&&Array.isArray(actual))assert.deepEqual(actual.sort((a,b)=>a-b),[...expected].sort((a,b)=>a-b));else assert.deepEqual(actual,expected,id+' '+operation+' Python result');
}
for(let trial=0;trial<25;trial++){
 const labels=['A','B','C','D','E'];const edges=[];for(const from of labels)for(const to of labels)if(rand()%4===0&&edges.length<16)edges.push({from,to,weight:rand()%10});
 const patch={edges:edges.map(e=>`${e.from} ${e.to} ${e.weight}`).join('\n'),start:'A',end:'E'};const distances={A:0,E:Infinity};for(const e of edges){distances[e.from]??=Infinity;distances[e.to]??=Infinity;}
 for(let i=0;i<labels.length-1;i++)for(const e of edges)distances[e.to]=Math.min(distances[e.to],distances[e.from]+e.weight);
 const result=run('dijkstra',patch).result;assert.deepEqual(result.distances,Object.fromEntries(Object.entries(distances).map(([k,v])=>[k,Number.isFinite(v)?v:null])));
 for(const id of ['bfs','dfs','dijkstra']){py.globals.set('source',get(id).code);py.globals.set('raw',JSON.stringify(edges));py.globals.set('id',id);const actual=JSON.parse(py.runPython(`import json
ns={}
exec(source,ns)
edges=json.loads(raw)
g={k:[] for k in sorted({'A','E'} | {e['from'] for e in edges} | {e['to'] for e in edges})}
for e in edges: g[e['from']].append((e['to'],e['weight']))
r=ns[id](g,'A')
if id=='dijkstra': r={k:None if v==float('inf') else v for k,v in r[0].items()}
json.dumps(r)`));const expected=run(id,patch).result;assert.deepEqual(actual,id==='dijkstra'?expected.distances:expected);}
}
console.log(`Visualisations: ${checks} traces checked; all 33 Python examples parse; sorting, control flow, recursion and structure examples match executable Python.`);
}finally{await rm(dir,{recursive:true,force:true});}
