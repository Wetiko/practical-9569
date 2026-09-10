import {Trace,items,type Algorithm,type Input} from './engine';
const codes:Record<string,string>={
'for-loop':`def run(count):
    output = []
    for i in range(count):
        output.append(i)
    return output`,
'while-loop':`def run(count):
    output, i = [], 0
    while i < count:
        output.append(i)
        i += 1
    return output`,
'nested-loops':`def run(rows, columns):
    output = []
    for row in range(rows):
        for col in range(columns):
            output.append((row, col))
    return output`,
'if-else':`def classify(value):
    if value >= 0:
        result = "non-negative"
    else:
        result = "negative"
    return result`,
'break':`def run(count, stop):
    output = []
    for i in range(count):
        if i == stop:
            break
        output.append(i)
    return output`,
'continue':`def run(count, skip):
    output = []
    for i in range(count):
        if i == skip:
            continue
        output.append(i)
    return output`,
'return':`def first_positive(a):
    for i in range(len(a)):
        if a[i] > 0:
            return a[i]
    return None`};
export function controlTrace(id:string,input:Input){const code=codes[id],t=new Trace(code);const out:string[]=[];const count=input.index;
 t.at(code.split('\n')[0],'Enter the function.',{phase:'entry',variables:{count,target:input.target},array:items(id==='return'?input.values:Array.from({length:count},(_,i)=>i))});
 if(id==='if-else'){const yes=input.target>=0;t.at('if value >= 0:',`${input.target} ≥ 0 is ${yes?'True':'False'}.`,{phase:'condition',variables:{value:input.target,condition:String(yes)}});const result=yes?'non-negative':'negative';t.at(yes?'result = "non-negative"':'result = "negative"',`Only the ${yes?'if':'else'} branch runs.`,{phase:yes?'body':'alternate',output:[result]});return t.finish('return result',`Return “${result}”.`,result,{phase:'exit'});}
 if(id==='return'){for(let i=0;i<input.values.length;i++){t.at('if a[i] > 0:',`Is ${input.values[i]} positive?`,{phase:'condition',active:[`v${i}`],pointers:{i},variables:{i}});if(input.values[i]>0)return t.finish('return a[i]',`Return ${input.values[i]} immediately. Later values are never examined.`,input.values[i],{phase:'exit',output:[String(input.values[i])]});}return t.finish('return None','No positive value: return None.',null,{phase:'exit',output:['None']});}
 if(id==='nested-loops'){const rows=Math.min(4,count),columns=Math.min(4,Math.max(0,input.target));const pairs:number[][]=[];t.at('output = []',`Visit ${rows} rows and ${columns} columns.`,{variables:{rows,columns},array:items(Array.from({length:rows*columns},(_,i)=>i))});for(let row=0;row<rows;row++){t.at('for row in range(rows):',`Start row ${row}.`,{phase:'condition',variables:{row,rows,columns}});for(let col=0;col<columns;col++){t.at('for col in range(columns):',`Column ${col} in row ${row}.`,{phase:'condition',active:[`v${row*columns+col}`],variables:{row,col,rows,columns}});pairs.push([row,col]);out.push(`(${row}, ${col})`);t.at('output.append((row, col))',`Execute the body at (${row}, ${col}).`,{phase:'body',output:[...out],active:[`v${row*columns+col}`]});}}return t.finish('return output',`${rows} × ${columns} = ${pairs.length} body executions.`,pairs,{phase:'exit'});}
 for(let i=0;i<count;i++){
  t.at(id==='while-loop'?'while i < count:':'for i in range(count):',id==='while-loop'?`${i} < ${count} is True: enter the body.`:`Start iteration ${i}.`,{phase:'condition',variables:{i,count,target:input.target},pointers:{i},active:[`v${i}`]});
  if(id==='break'||id==='continue'){t.at(id==='break'?'if i == stop:':'if i == skip:',`${i} equals ${input.target}: ${i===input.target?'True':'False'}.`,{phase:'condition'});if(i===input.target){t.at(id==='break'?'break':'continue',id==='break'?`Break at ${i}: leave the loop immediately.`:`Continue at ${i}: skip the body, then take the next iteration.`,{phase:id==='break'?'exit':'skip',eliminated:[`v${i}`]});if(id==='break')break;else continue;}}
  out.push(String(i));t.at('output.append(i)',`Append ${i} to the output.`,{phase:'body',output:[...out],active:[`v${i}`]});if(id==='while-loop')t.at('i += 1',`Increment i to ${i+1}, then return to the condition.`,{phase:'repeat',variables:{i:i+1,count}});
 }
 if(id==='while-loop')t.at('while i < count:',`${count} < ${count} is False: exit the loop.`,{phase:'condition',variables:{i:count,count}});
 return t.finish('return output','The function ends. The output shows only executed bodies.',out.map(Number),{phase:'exit',pointers:{}});
}
export const control:Algorithm[]=Object.entries(codes).map(([id,code])=>({id,code,name:({'for-loop':'For loop','while-loop':'While loop','nested-loops':'Nested loops','if-else':'If / Else',break:'Break',continue:'Continue',return:'Return'} as Record<string,string>)[id],category:'Control flow',type:'Control flow',view:'flow',level:id==='nested-loops'?'Core':'Foundation',summary:({break:'Leave a loop immediately.',continue:'Skip this body. Keep the loop going.',return:'Leave the entire function with a value.','for-loop':'One body execution for each value in the range.','while-loop':'Check. Execute. Repeat until the condition is false.','nested-loops':'A complete inner loop for each outer iteration.','if-else':'Choose exactly one path through the program.'} as Record<string,string>)[id],best:['if-else','break','return'].includes(id)?'O(1)':id==='nested-loops'?'O(r × c)':'O(n)',average:id==='if-else'?'O(1)':id==='nested-loops'?'O(r × c)':'O(n)',worst:id==='if-else'?'O(1)':id==='nested-loops'?'O(r × c)':'O(n)',space:id==='if-else'||id==='return'?'O(1)':id==='nested-loops'?'O(r × c) output':'O(n) output',complexityNote:id==='nested-loops'?'Rows and columns are limited to four each for clarity; the work multiplies.':id==='if-else'?'One comparison and one assignment, regardless of value.':'Costs describe this example. Building output takes storage; loop control itself needs constant extra space.',generate:i=>controlTrace(id,i)}));
