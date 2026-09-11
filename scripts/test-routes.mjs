import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import ts from 'typescript';
const src=(await readFile('app/routes.ts','utf8')).replace("import {useSyncExternalStore} from 'react';",'');
const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {parseRoute,routeHash,defaults}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
for(const r of [{...defaults,view:'practice',selected:'shared-pool'},{...defaults,view:'library',query:'A&B #1',onlySaved:true,kindFilter:'Local labs'},{...defaults,view:'review',module:'normalisation',question:'2'}])assert.deepEqual(parseRoute(routeHash(r)),r);
assert.equal(parseRoute('#/unknown').view,'home');assert.doesNotThrow(()=>parseRoute('#/practice/%'));console.log('Hash routes: challenge, filters, question links, escaping and invalid routes passed.');
