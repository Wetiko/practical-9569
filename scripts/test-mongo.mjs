import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {loadPyodide} from 'pyodide';
const py=await loadPyodide();
assert.equal(py.version,'0.28.2','Verify the exact runtime shipped by the site');
const messages=[];
const source=await readFile(new URL('../public/python-worker.js',import.meta.url),'utf8');
assert.ok(source.includes('https://cdn.jsdelivr.net/pyodide/v0.28.2/full/'));
const context={importScripts(){},loadPyodide:()=>py,self:{postMessage:m=>messages.push(m)}};
vm.runInNewContext(source,context);
const bank=JSON.parse(await readFile(new URL('../app/problems.json',import.meta.url),'utf8'));
async function run(problem,code=problem.solution,tests=problem.tests){
  messages.length=0;
  await context.self.onmessage({data:{problem,code,tests,stdin:''}});
  const result=messages.at(-1);
  assert.equal(result.type,'result',result.message);
  return result.results;
}
for(const p of bank.filter(p=>p.kind==='mongo')){
  const rows=await run(p);
  assert.ok(rows.every(r=>r.passed),`${p.id}: ${JSON.stringify(rows.filter(r=>!r.passed))}`);
  const starter=await run(p,p.starter);
  assert.ok(starter.some(r=>!r.passed),`${p.id}: an empty starter must not pass`);
  console.log(`${p.id}: ${rows.length} reference checks passed; unfinished starter rejected`);
}
// Repeating a mutating test must recreate the collection, including after an exception.
const update=bank.find(p=>p.id==='mongo-update');
const repeated=await run(update,update.solution,[update.tests[0],update.tests[0]]);
assert.ok(repeated.every(r=>r.passed),'Collection state leaked across tests');
const failure=await run(update,"import mongomock\ndef revise_score(collection, name, score):\n    collection.delete_many({})\n    print('before error')\n    raise ValueError('debug me')\n",[update.tests[0]]);
assert.match(failure[0].error,/ValueError: debug me/);assert.equal(failure[0].stdout,'before error\n');
assert.ok((await run(update)).every(r=>r.passed));
// Existing branches still run their original solutions and SQL setup helpers.
for(const p of bank.filter(p=>p.kind==='sql'||['first-match','python-sql','transaction'].includes(p.id))){
  assert.ok((await run(p)).every(r=>r.passed),`Regression: ${p.id}`);
}
console.log('MongoDB checks passed on Pyodide 0.28.2: CRUD, aggregation, mutation checks, isolation, errors and Python/SQLite regressions.');
