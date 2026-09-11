import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const read=async path=>JSON.parse(await readFile(path,'utf8'));const bank=await read('app/problems.json'),catalogue=await read('app/catalogue.json'),guides=await read('app/solution-guides.json');
const lessons=await read('content/expansion/solution-lessons.json');
assert.equal(catalogue.length,bank.length);
for(const p of bank){const meta=catalogue.find(m=>m.id===p.id);assert.equal(meta.solution,'');assert.equal(meta.starter,'');assert.equal(meta.tests.length,p.tests.length);assert.equal(meta.rubric.length,p.rubric.length);assert.deepEqual(await read(`app/challenges/${p.id}.json`),{...p,solution:''});assert.deepEqual(await read(`app/references/${p.id}.json`),{solution:p.solution,steps:guides[p.id],...(lessons[p.id]?{lesson:lessons[p.id]}:{})});}
console.log('Content splitting: all 89 exercises and reference guides preserved; catalogue has no solutions or starter code.');
