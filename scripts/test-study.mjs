import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const bank=JSON.parse(await readFile(new URL('../app/problems.json',import.meta.url),'utf8'));
const source=(await readFile(new URL('../app/study.ts',import.meta.url),'utf8')).replace("import bank from './problems.json';",`const bank=${JSON.stringify(bank)};`);
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const m=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
assert.deepEqual(m.references('2.5.1–2.5.4'),['2.5.1','2.5.2','2.5.3','2.5.4']);
assert.equal(new Set(m.syllabus.map(s=>s.code)).size,m.syllabus.length);
for(const p of bank)assert.ok(['python','sql','mongo','lab'].includes(p.kind));
for(const p of bank)for(const ref of m.references(p.ref))assert.ok(m.syllabus.some(s=>s.code===ref),ref);
for(let i=0;i<30;i++){const ids=m.composePaper({},i%2===0);assert.equal(new Set(ids).size,4);assert.equal(m.budgets(ids).reduce((a,b)=>a+b),180);const topics=ids.map(id=>bank.find(p=>p.id===id).topic);assert.ok(topics.includes('Databases'));assert.ok(topics.includes('Python & files'));assert.ok(topics.includes('Web & networks'))}
const progress={'first-match':{code:'draft',solved:true,attempts:[{at:new Date(5000).toISOString(),passed:1,total:3,code:'x',sessionId:'new'},{at:new Date(1000).toISOString(),passed:3,total:3,code:'old',sessionId:'old'}]}};
const record=m.finishRecord({id:'new',startedAt:4000,end:10000,finishedAt:7000,finished:true,ids:['first-match']},progress,[]);assert.equal(record.tasks[0].passed,1);assert.equal(record.endedAt-record.startedAt,3000);
const legacy={version:1,progress,exam:null,selected:'first-match'};const restored=m.validateSaved(legacy);assert.equal(restored.progress['first-match'].code,'draft');assert.deepEqual(restored.examHistory,[]);
const full={...restored,examHistory:[record],labSessions:[{id:'lab',problemId:'flask-lab',startedAt:10,endedAt:20,notes:'My notes',checks:[0]}],examDate:'2026-11-01',theme:'dark'};assert.deepEqual(m.validateSaved(JSON.parse(JSON.stringify(full))),full);
assert.throws(()=>m.validateSaved({...full,labSessions:[{...full.labSessions[0],checks:[999]}]}));assert.throws(()=>m.validateSaved({...full,examHistory:[{...record,endedAt:-1}]}));
assert.equal(m.topicStats({}).find(s=>s.topic==='Databases').rate,null);assert.equal(m.topicStats(progress).find(s=>s.topic==='Algorithms').rate,50);
assert.equal(m.daysUntil('2026-11-01',new Date(2026,10,1)),0);assert.equal(m.daysUntil('2026-11-02',new Date(2026,10,1)),1);
const guides=JSON.parse(await readFile(new URL('../app/solution-guides.json',import.meta.url),'utf8'));for(const p of bank){const nonblank=p.solution.split('\n').map((line,i)=>line.trim()?i+1:null).filter(Boolean);assert.deepEqual(guides[p.id].map(g=>g.line),nonblank);assert.ok(guides[p.id].every(g=>g.text.length<300))}
console.log(`Study checks passed: ${m.syllabus.length} syllabus points, paper composition, session scores, legacy/new backups, date arithmetic and ${bank.length} solution guides.`);

const learning={'for-loop':{viewedAt:100,completed:true,predictions:2,correct:1}};assert.deepEqual(m.validateSaved({...full,learning}).learning,learning);assert.throws(()=>m.validateSaved({...full,learning:{x:{viewedAt:100,predictions:0,correct:1}}}));
