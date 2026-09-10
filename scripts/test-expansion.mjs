import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {loadPyodide} from 'pyodide';
const bank=JSON.parse(await readFile('app/problems.json','utf8'));
const ids=JSON.parse(await readFile('content/expansion/automatic-ids.json','utf8'));
const messages=[];const py=await loadPyodide();
const context={importScripts(){},loadPyodide:()=>Promise.resolve(py),self:{postMessage:m=>messages.push(m)}};
vm.runInNewContext(await readFile('public/python-worker.js','utf8'),context);
let count=0;
for(const id of ids){const p=bank.find(p=>p.id===id);assert.ok(p);for(const code of [p.solution,p.starter]){await context.self.onmessage({data:{problem:p,code,tests:p.tests,stdin:''}});const result=messages.at(-1);assert.equal(result.type,'result',result.message);if(code===p.solution){for(const r of result.results)assert.ok(r.passed,`${id}: ${r.label}: ${r.error??JSON.stringify(r.actual)}`);count+=result.results.length;}else assert.ok(result.results.some(r=>!r.passed),id+' starter should fail');}}
console.log(`${ids.length} expansion solutions: ${count} checks passed in the actual Python worker; all unfinished starters rejected.`);
