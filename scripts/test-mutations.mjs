import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import vm from 'node:vm';import {loadPyodide} from 'pyodide';
const bank=JSON.parse(await readFile('app/problems.json','utf8'));const py=await loadPyodide();const messages=[];
const context={importScripts(){},loadPyodide:()=>Promise.resolve(py),self:{postMessage:m=>messages.push(m)}};vm.runInNewContext(await readFile('public/python-worker.js','utf8'),context);
const mutants=[
 ['shared-pool','self.next[current], self.free = self.free, current','self.next[current] = -1','lost free slot'],
 ['master-update','while change is not None and int(change[0]) == key:','if change is not None and int(change[0]) == key:','only applies one transaction'],
 ['tournament-tree','key not in self.nodes or key in seen','key not in self.nodes','allows shared nodes'],
 ['word-paths','result[i][1] < result[i + 1][1]','result[i][1] <= result[i + 1][1]','unstable tie order'],
 ['register-import','with conn:','with __import__("contextlib").nullcontext():','missing transaction rollback']
];
for(const [id,from,to,label] of mutants){const p=bank.find(p=>p.id===id);assert.ok(p.solution.includes(from));const tests=id==='tournament-tree'?p.tests.filter(t=>t.label==='Reject a shared child'):p.tests;await context.self.onmessage({data:{problem:p,code:p.solution.replace(from,to),tests,stdin:''}});const r=messages.at(-1);assert.equal(r.type,'result');assert.ok(r.results.some(t=>!t.passed),label+' escaped assessment');console.log('Rejected: '+label)}
