import {Trace,items,type Algorithm,type Input} from './engine';
const linear=`def linear_search(a, target):
    for current in range(len(a)):
        if a[current] == target:
            return current
    return -1`;
const binary=`def binary_search(a, target):
    left, right = 0, len(a) - 1
    while left <= right:
        mid = (left + right) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`;
export const recursiveBinary=`def search(a, target, left, right):
    if left > right:
        return -1
    mid = (left + right) // 2
    if a[mid] == target:
        return mid
    if a[mid] < target:
        return search(a, target, mid + 1, right)
    return search(a, target, left, mid - 1)`;
export function searchTrace(input:Input,kind:'linear'|'binary'|'recursive'){
 const code=kind==='linear'?linear:kind==='binary'?binary:recursiveBinary;
 const values=kind==='linear'?input.values:[...input.values].sort((a,b)=>a-b),t=new Trace(code,values),a=items(values);let comparisons=0;
 t.at(code.split('\n')[0],kind==='linear'?'Inspect values in their original order.':'Use sorted input. At each comparison, discard a range that cannot contain the target.',{variables:{target:input.target,comparisons},output:kind==='linear'?[]:[`${a.length} candidates`]});
 if(kind==='linear'){
  for(let i=0;i<a.length;i++){comparisons++;t.at('if a[current] == target:',`Compare ${a[i].value} with target ${input.target}.`,{active:[a[i].id],comparing:[a[i].id],pointers:{current:i},variables:{target:input.target,comparisons}});if(a[i].value===input.target)return t.finish('return current',`Found ${input.target} at index ${i}.`,i,{sorted:[a[i].id]});t.at('for current in range(len(a)):',`${a[i].value} is not the target; move on.`,{eliminated:a.slice(0,i+1).map(x=>x.id)});}
 }else{
  let left=0,right=a.length-1;const frames:string[]=[];const sizes=[`${a.length} candidates`];
  while(left<=right){if(kind==='recursive')frames.push(`search(${left}, ${right})`);const mid=Math.floor((left+right)/2);t.at('mid = (left + right) // 2',`mid = (${left} + ${right}) // 2 = ${mid}.`,{pointers:{left,mid,right},active:[a[mid].id],frames:[...frames]});comparisons++;t.at('if a[mid] == target:',`Compare middle value ${a[mid].value} with ${input.target}.`,{comparing:[a[mid].id],variables:{target:input.target,comparisons,left,mid,right}});
   if(a[mid].value===input.target){if(kind==='recursive'){t.at('return mid',`Found ${input.target} at sorted index ${mid}; return it to the waiting call.`,{sorted:[a[mid].id]});frames.pop();while(frames.length){const caller=frames.pop()!;const bounds=caller.match(/search\((\d+), (\d+)\)/)!;const callerMid=Math.floor((Number(bounds[1])+Number(bounds[2]))/2);t.at(a[callerMid].value<input.target?'return search(a, target, mid + 1, right)':'return search(a, target, left, mid - 1)',`The call ${caller} returns index ${mid} unchanged.`,{frames:[...frames],sorted:[a[mid].id]});}return t.finish(t.lines[t.state.codeLine-1],`Search complete: sorted index ${mid}.`,mid,{frames:[],sorted:[a[mid].id]});}return t.finish('return mid',`Found ${input.target} at sorted index ${mid}.`,mid,{sorted:[a[mid].id]});}const smaller=a[mid].value<input.target;if(smaller)left=mid+1;else right=mid-1;sizes.push(`${Math.max(0,right-left+1)} candidates`);
   t.at(kind==='recursive'?(smaller?'return search(a, target, mid + 1, right)':'return search(a, target, left, mid - 1)'):(smaller?'left = mid + 1':'right = mid - 1'),`Discard the ${smaller?'left':'right'} range, including mid.`,{eliminated:a.filter((_,i)=>i<left||i>right).map(x=>x.id),pointers:{left,right},output:[...sizes],frames:[...frames]});
  }
 }
 return t.finish('return -1',`No candidates remain. ${input.target} is absent.`,-1,{pointers:{},frames:[]});
}
export const searching:Algorithm[]=[['linear-search','Linear search',linear],['binary-search','Binary search',binary]].map(([id,name,code])=>({id,name,code,category:'Searching',type:'Algorithm',view:'array',level:id==='linear-search'?'Foundation':'Core',summary:id==='linear-search'?'Look at each value. Stop when you find a match.':'Throw away half the possibilities at a time.',best:'O(1)',average:id==='linear-search'?'O(n)':'O(log n)',worst:id==='linear-search'?'O(n)':'O(log n)',space:'O(1)',complexityNote:id==='linear-search'?'A target near the end or an absent target requires a full scan.':'The input is sorted before playback. These costs describe searching only; sorting unsorted data costs extra. Duplicate targets may return any matching index.',generate:i=>searchTrace(i,id==='linear-search'?'linear':'binary')}));
