import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import ts from 'typescript';
const js=ts.transpileModule(await readFile('app/practice-qol.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {nextUnfinished,resultsAreStale,debugReport}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const items=[{id:'a',kind:'python'},{id:'b',kind:'lab'},{id:'c',kind:'python'}];
assert.equal(nextUnfinished(items,{a:{solved:true},b:{reviewed:true}}).id,'c');assert.equal(nextUnfinished(items,{},'a').id,'b');assert.equal(nextUnfinished([items[0]],{},'a').id,'a');assert.equal(nextUnfinished([],{}),undefined);assert.equal(nextUnfinished(items,{a:{solved:true},b:{reviewed:true},c:{solved:true}}),undefined);
const run={code:'print(1)',stdin:'input'};assert.equal(resultsAreStale(run,run.code,run.stdin),false);assert.equal(resultsAreStale(run,'print(2)',run.stdin),true);assert.equal(resultsAreStale(run,run.code,''),true);assert.equal(resultsAreStale(null,'',''),false);
const report=debugReport('Example','a',run,[{label:'Boundary',passed:false,expression:'f(0)',actual:undefined,expected:0,stdout:'debug\nline',stderr:'warning',error:'ValueError',raw:'None'}]);for(const text of ['0/1 checks','print(1)','input','f(0)','ValueError','debug\nline','warning','None'])assert.ok(report.includes(text));
console.log('Practice QoL: filtered selection, lab completion, stale code/input and complete debug reports passed.');
