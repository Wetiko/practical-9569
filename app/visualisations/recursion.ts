import {Trace,type Algorithm} from './engine';
import {searchTrace,recursiveBinary} from './searching';
import {treeTraversal} from './trees';
const codes:Record<string,string>={
'basic-recursion':`def countdown(n):
    if n == 0:
        return []
    rest = countdown(n - 1)
    return [n] + rest`,
factorial:`def factorial(n):
    if n <= 1:
        return 1
    smaller = factorial(n - 1)
    return n * smaller`,
fibonacci:`def fibonacci(n):
    if n <= 1:
        return n
    left = fibonacci(n - 1)
    right = fibonacci(n - 2)
    return left + right`};
export const recursion:Algorithm[]=Object.entries(codes).map(([id,code])=>({id,code,name:id==='basic-recursion'?'Basic recursion':id[0].toUpperCase()+id.slice(1),category:'Recursion',type:'Algorithm',view:'recursion',level:id==='fibonacci'?'Stretch':'Core',summary:id==='factorial'?'Every call waits for a smaller answer.':id==='fibonacci'?'Two recursive branches reveal repeated work.':'Reach a base case. Return through the waiting calls.',best:id==='fibonacci'?'O(φⁿ)':id==='basic-recursion'?'O(n²)':'O(n)',average:id==='fibonacci'?'O(φⁿ)':id==='basic-recursion'?'O(n²)':'O(n)',worst:id==='fibonacci'?'O(φⁿ)':id==='basic-recursion'?'O(n²) with list copying':'O(n)',space:id==='basic-recursion'?'O(n) peak':'O(n) call stack',complexityNote:id==='fibonacci'?'Naive recursion repeats subproblems. φ ≈ 1.618; n is capped at 6 to keep the tree readable.':id==='basic-recursion'?'There are n calls. Python list concatenation copies results, making this exact example quadratic in total work.':'Treating arithmetic as constant work: n calls and an n-deep stack. Python big-integer costs grow for very large n.',generate(input){const t=new Trace(code),frames:string[]=[];let calls=0;function run(n:number):number|number[]{calls++;frames.push(`${id==='basic-recursion'?'countdown':id}(${n})`);t.at(code.split('\n')[0],`Call with n = ${n}.`,{frames:[...frames],variables:{n,calls},phase:'call'});const base=id==='basic-recursion'?n===0:n<=1;t.at(id==='basic-recursion'?'if n == 0:':'if n <= 1:',`Base case is ${base?'True':'False'}.`,{phase:'condition'});let result:number|number[];
 if(base){result=id==='basic-recursion'?[]:id==='factorial'?1:n;t.at(id==='basic-recursion'?'return []':id==='factorial'?'return 1':'return n',`Base case returns ${JSON.stringify(result)}.`,{phase:'return',output:[JSON.stringify(result)]});}
 else if(id==='fibonacci'){t.at('left = fibonacci(n - 1)',`Wait for fibonacci(${n-1}).`);const left=run(n-1) as number;t.at('right = fibonacci(n - 2)',`Left returned ${left}; now compute fibonacci(${n-2}).`,{frames:[...frames],variables:{n,left,calls}});const right=run(n-2) as number;result=left+right;t.at('return left + right',`Return ${left} + ${right} = ${result}.`,{frames:[...frames],variables:{n,left,right,calls},output:[String(result)],phase:'return'});}
 else{t.at(id==='factorial'?'smaller = factorial(n - 1)':'rest = countdown(n - 1)',`Pause this call while n = ${n-1} is computed.`);const smaller=run(n-1);result=id==='factorial'?n*(smaller as number):[n,...smaller as number[]];t.at(id==='factorial'?'return n * smaller':'return [n] + rest',`Return ${id==='factorial'?`${n} × ${smaller} = `:''}${JSON.stringify(result)}.`,{frames:[...frames],variables:{n,calls},output:[JSON.stringify(result)],phase:'return'});}
 frames.pop();return result;}
 const result=run(input.target);return t.finish(t.lines[t.state.codeLine-1].trim(),'All waiting calls have returned.',result,{frames:[],output:[JSON.stringify(result)],variables:{calls},phase:'exit'});}}));
recursion.push({id:'recursive-binary',name:'Recursive binary search',category:'Recursion',type:'Algorithm',view:'array',level:'Core',summary:'Pass a smaller interval into the next call.',code:recursiveBinary,best:'O(1)',average:'O(log n)',worst:'O(log n)',space:'O(log n) call stack',complexityNote:'Input is sorted before playback. Each call shrinks the interval, avoiding array slicing.',generate:i=>searchTrace(i,'recursive')},treeTraversal);
