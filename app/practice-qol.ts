export type DebugResult={label:string;passed:boolean;expression?:string;expected?:unknown;actual?:unknown;error?:string;raw?:string;stdout?:string;stderr?:string};
export function nextUnfinished<T extends {id:string;kind:string}>(items:T[],progress:Record<string,{solved?:boolean;reviewed?:boolean}>,current?:string){
 const remaining=items.filter(p=>p.kind==='lab'?!progress[p.id]?.reviewed:!progress[p.id]?.solved);
 return remaining.find(p=>p.id!==current)||remaining[0];
}
export function resultsAreStale(run:{code:string;stdin:string}|null,code:string,stdin:string){return !!run&&(run.code!==code||run.stdin!==stdin)}
export function debugReport(title:string,id:string,run:{code:string;stdin:string},results:DebugResult[]){
 const show=(v:unknown)=>JSON.stringify(v,null,2)??String(v);
 return [`${title} (${id})`,`${results.filter(r=>r.passed).length}/${results.length} checks passed`,'','Code used for this run:',run.code,'Standard input:',run.stdin||'(empty)',...results.flatMap(r=>['',`${r.passed?'PASS':'FAIL'}: ${r.label}`,`Call: ${r.expression||'(not recorded)'}`,`Expected: ${show(r.expected)}`,`Actual: ${show(r.actual)}`,`Error: ${r.error||'(none)'}`,`Raw return: ${r.raw||'(none)'}`,`stdout:\n${r.stdout||'(empty)'}`,`stderr:\n${r.stderr||'(empty)'}`])].join('\n');
}
