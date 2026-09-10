import {Trace,items,type Algorithm,type Input,type Step} from './engine';
const codes:Record<string,string>={
array:`def array_operation(a, operation, index, value):
    if operation == "Read":
        return a[index] if 0 <= index < len(a) else None
    if operation == "Set" and 0 <= index < len(a):
        a[index] = value
    if operation == "Insert" and 0 <= index <= len(a):
        a.insert(index, value)
    if operation == "Delete" and 0 <= index < len(a):
        a.pop(index)
    return a`,
stack:`def stack_operation(stack, operation, value):
    if operation == "Push":
        stack.append(value)
    elif operation == "Pop":
        return stack.pop() if stack else None
    elif operation == "Peek":
        return stack[-1] if stack else None
    return stack`,
queue:`from collections import deque

def queue_operation(queue, operation, value):
    if operation == "Enqueue":
        queue.append(value)
    elif operation == "Dequeue":
        return queue.popleft() if queue else None
    elif operation == "Peek":
        return queue[0] if queue else None
    return queue`,
set:`def set_operation(values, operation, value):
    if operation == "Add":
        values.add(value)
    elif operation == "Discard":
        values.discard(value)
    elif operation == "Contains":
        return value in values
    return values`,
'linked-list':`class Node:
    def __init__(self, value):
        self.value, self.next = value, None

# head is the first node.
def operate(head, operation, index, value):
    if operation == "Search":
        current = head
        while current is not None:
            if current.value == value:
                return current
            current = current.next
        return None
    previous, current, position = None, head, 0
    while current is not None and position < index:
        previous, current = current, current.next
        position += 1
    if operation == "Insert" and position == index:
        new = Node(value)
        new.next = current
        if previous is None:
            head = new
        else:
            previous.next = new
    elif operation == "Delete" and current is not None:
        if previous is None:
            head = current.next
        else:
            previous.next = current.next
    return head`,
'hash-table':`def hash_operation(table, operation, value):
    bucket = value % len(table)
    chain = table[bucket]
    for index, key in enumerate(chain):
        if key == value:
            if operation == "Delete":
                chain.pop(index)
            return True
    if operation == "Insert":
        chain.append(value)
        return True
    return False`,
heap:`def sift_down(a, root):
    while 2 * root + 1 < len(a):
        child = 2 * root + 1
        if child + 1 < len(a) and a[child + 1] < a[child]:
            child += 1
        if a[root] <= a[child]:
            break
        a[root], a[child] = a[child], a[root]
        root = child

def heap_operation(a, operation, value):
    if operation == "Insert":
        a.append(value)
        child = len(a) - 1
        while child > 0:
            parent = (child - 1) // 2
            if a[parent] <= a[child]:
                break
            a[parent], a[child] = a[child], a[parent]
            child = parent
    elif operation == "Extract" and a:
        result = a[0]
        last = a.pop()
        if a:
            a[0] = last
            sift_down(a, 0)
        return result
    elif operation == "Peek":
        return a[0] if a else None
    return a`};
const labels:Record<string,string>={array:'Array',stack:'Stack',queue:'Queue',set:'Set','linked-list':'Linked list','hash-table':'Hash table',heap:'Heap'};
export function structureTrace(id:string,input:Input){
 const code=codes[id],t=new Trace(code);let a=items(id==='set'?[...new Set(input.values)]:input.values);const op=input.operation||({array:'Read',stack:'Peek',queue:'Peek',set:'Contains','linked-list':'Search','hash-table':'Lookup',heap:'Peek'} as Record<string,string>)[id];const value=input.target,index=input.index;
 const emit=(line:string,desc:string,patch:Partial<Step>={})=>t.at(line,desc,{array:a,variables:{operation:op,value,index},...patch});
 const extra={id:'new',value};let result:unknown;
 if(id==='heap'){
  // Seed a valid min heap without hiding the operation being taught.
  a=items(input.values.every((v,i)=>i===0||input.values[Math.floor((i-1)/2)]<=v)?input.values:[...input.values].sort((x,y)=>x-y));
  const picture=()=>({nodes:a.map((v,i)=>{const depth=Math.floor(Math.log2(i+1));return{id:v.id,label:String(v.value),x:(i-(2**depth-1)+.5)/2**depth*680+20,y:45+depth*68}}),edges:a.slice(1).map((v,i)=>({from:a[Math.floor(i/2)].id,to:v.id}))});
  emit('def heap_operation(a, operation, value):','Start with a valid min heap: each parent is no larger than its children.',picture());
  if(op==='Insert'){a.push(extra);emit('a.append(value)',`Add ${value} at the next leaf.`,{...picture(),active:[extra.id]});let child=a.length-1;while(child>0){const parent=Math.floor((child-1)/2);emit('if a[parent] <= a[child]:',`Compare parent ${a[parent].value} and child ${a[child].value}.`,{...picture(),comparing:[a[parent].id,a[child].id]});if(a[parent].value<=a[child].value)break;const ids=[a[parent].id,a[child].id];[a[parent],a[child]]=[a[child],a[parent]];emit('a[parent], a[child] = a[child], a[parent]','Swap upward to restore min-heap order.',{...picture(),swapping:ids});child=parent;}}
  else if(op==='Extract'&&a.length){result=a[0].value;emit('result = a[0]',`The root ${result} is the minimum.`,{...picture(),active:[a[0].id]});const last=a.pop()!;emit('last = a.pop()','Detach the last leaf.',picture());if(a.length){a[0]=last;emit('a[0] = last','Move the last value to the root.',picture());let root=0;while(root*2+1<a.length){let child=root*2+1;if(child+1<a.length&&a[child+1].value<a[child].value)child++;emit('if a[root] <= a[child]:',`Compare ${a[root].value} with smaller child ${a[child].value}.`,{...picture(),comparing:[a[root].id,a[child].id]});if(a[root].value<=a[child].value)break;const ids=[a[root].id,a[child].id];[a[root],a[child]]=[a[child],a[root]];emit('a[root], a[child] = a[child], a[root]','Swap downward to restore order.',{...picture(),swapping:ids});root=child;}}}
  else if(op==='Peek'){result=a[0]?.value??null;emit('return a[0] if a else None',a.length?`Peek at ${result} without removing it.`:'The heap is empty.',{...picture(),active:a[0]?[a[0].id]:[]});}
  return t.finish(op==='Peek'?'return a[0] if a else None':op==='Extract'&&result!==undefined?'return result':'return a','The min-heap invariant is restored.',result===undefined?a.map(v=>v.value):result,{array:a,...picture(),output:result!==undefined?[String(result)]:[]});
 }
 if(id==='linked-list'){
  const links=new Map<string,string|undefined>(a.map((v,i)=>[v.id,a[i+1]?.id]));let head:string|undefined=a[0]?.id;let pending:typeof extra|undefined;
  const picture=()=>{const nodes=a.map((v,i)=>({id:v.id,label:String(v.value),x:60+i*65,y:145}));if(pending)nodes.push({id:pending.id,label:String(pending.value),x:60+Math.min(index,a.length)*65,y:45});return {nodes,edges:[...links].filter(([,to])=>to!==undefined).map(([from,to])=>({from,to:to!})),variables:{operation:op,value,index,head:head??'null'}}};
  emit('def operate(head, operation, index, value):','Follow next pointers from head. Nodes keep their identities.',picture());
  if(op==='Search'){for(let i=0;i<a.length;i++){emit('if current.value == value:',`Inspect node ${a[i].value}.`,{...picture(),active:[a[i].id]});if(a[i].value===value)return t.finish('return current',`Found ${value} at position ${i}.`,i,{...picture(),array:a,sorted:[a[i].id]});emit('current = current.next','Follow the next pointer.',picture());}return t.finish('return None','Reached null: the value is absent.',-1,{...picture(),array:a});}
  for(let i=0;i<Math.min(index,a.length);i++)emit('previous, current = current, current.next',`Follow the link past position ${i}.`,{...picture(),active:[a[i].id]});
  if(op==='Insert'&&index<=a.length){pending=extra;emit('new = Node(value)',`Create a separate node for ${value}.`,picture());links.set(extra.id,a[index]?.id);emit('new.next = current','Point the new node to the current successor.',{...picture(),active:[extra.id]});if(index===0){head=extra.id;emit('head = new','Move head to the new node.',picture());}else{links.set(a[index-1].id,extra.id);emit('previous.next = new','Reconnect the predecessor to the new node.',{...picture(),active:[a[index-1].id,extra.id]});}a.splice(index,0,extra);pending=undefined;}
  else if(op==='Delete'&&index<a.length){const current=a[index];if(index===0){head=links.get(current.id);emit('head = current.next','Move head to the successor.',picture());}else{links.set(a[index-1].id,links.get(current.id));emit('previous.next = current.next','Bypass the selected node by redirecting its predecessor.',{...picture(),active:[a[index-1].id,current.id]});}links.delete(current.id);a.splice(index,1);}
  return t.finish('return head',index>a.length+(op==='Delete'?1:0)?'Index was beyond the list; no change.':'The updated chain is connected.',a.map(v=>v.value),{...picture(),array:a});
 }
 if(id==='hash-table'){
  const table:number[][]=Array.from({length:7},()=>[]);for(const n of input.values){const b=((n%7)+7)%7;if(!table[b].includes(n))table[b].push(n);}const bucket=((value%7)+7)%7;
  const picture=()=>({groups:table.map((values,i)=>({label:`bucket ${i}`,values:[...values],depth:0})),variables:{operation:op,value,hash:`${value} % 7 = ${bucket}`},array:items(table.flat()),pointers:{bucket}});
  emit('bucket = value % len(table)',`Hash ${value} to bucket ${bucket}.`,picture());const chain=table[bucket];let found=false;
  for(let i=0;i<chain.length;i++){emit('if key == value:',`Compare ${chain[i]} in this collision chain with ${value}.`,{...picture(),phase:String(bucket)});if(chain[i]===value){found=true;if(op==='Delete'){chain.splice(i,1);emit('chain.pop(index)',`Remove ${value} from this bucket.`,picture());}break;}}
  if(!found&&op==='Insert'){const collision=chain.length>0;chain.push(value);found=true;emit('chain.append(value)',collision?`Collision: append ${value} to the same bucket's chain.`:`Store ${value} in the empty bucket.`,picture());}
  return t.finish(found?'return True':'return False',found?'Operation succeeded. Other buckets are untouched.':'The value is absent from its bucket.',found,picture());
 }
 emit(code.split('\n').find(l=>l.startsWith(id==='heap'?'def heap_operation':'def '))!,`Start with ${a.length} ${id==='set'?'distinct ':''}values.`);
 if(id==='array'){
  if(op==='Read'){result=a[index]?.value??null;emit('return a[index] if 0 <= index < len(a) else None',a[index]?`Read index ${index} directly: ${result}.`:'That index is outside the array.',{active:a[index]?[a[index].id]:[],pointers:{index}});}
  if(op==='Set'&&a[index]){a[index]={...a[index],value};emit('a[index] = value',`Replace index ${index} with ${value}.`,{active:[a[index].id]});}
  if(op==='Insert'&&index<=a.length){a.splice(index,0,extra);emit('a.insert(index, value)',`Insert at ${index}; later values shift right.`,{active:[extra.id]});}
  if(op==='Delete'&&a[index]){a.splice(index,1);emit('a.pop(index)',`Delete index ${index}; later values shift left.`);}
 }else if(id==='set'){
  const existing=a.find(x=>x.value===value);if(op==='Add'){if(!existing)a.push(extra);emit('values.add(value)',existing?`${value} is already present. Sets do not duplicate it.`:`Add ${value} once.`,{active:[existing?.id??extra.id]});}else if(op==='Discard'){a=a.filter(x=>x.value!==value);emit('values.discard(value)',existing?`Discard ${value}.`:'An absent value leaves the set unchanged.');}else{result=!!existing;emit('return value in values',`${value} ${existing?'is':'is not'} in the set.`,{active:existing?[existing.id]:[]});}
 }else{
  const stack=id==='stack',add=stack?'Push':'Enqueue',remove=stack?'Pop':'Dequeue';if(op===add){a.push(extra);emit(stack?'stack.append(value)':'queue.append(value)',`${add} ${value} at the ${stack?'top':'rear'}.`,{active:[extra.id]});}else if(op===remove){const removed=stack?a.pop():a.shift();result=removed?.value??null;emit(stack?'return stack.pop() if stack else None':'return queue.popleft() if queue else None',removed?`${remove} ${removed.value} from the ${stack?'top':'front'}.`:'The structure is empty.');}else{const current=stack?a.at(-1):a[0];result=current?.value??null;emit(stack?'return stack[-1] if stack else None':'return queue[0] if queue else None',current?`Peek at ${current.value} without removing it.`:'There is no value to peek.',{active:current?[current.id]:[]});}
 }
 const end=id==='array'?(op==='Read'?'return a[index] if 0 <= index < len(a) else None':'return a'):id==='set'?(op==='Contains'?'return value in values':'return values'):id==='stack'?(op==='Pop'?'return stack.pop() if stack else None':op==='Peek'?'return stack[-1] if stack else None':'return stack'):(op==='Dequeue'?'return queue.popleft() if queue else None':op==='Peek'?'return queue[0] if queue else None':'return queue');return t.finish(end,`${labels[id]} operation complete.`,result===undefined?a.map(v=>v.value):result,{array:a,output:result===undefined?[]:[result===null?'None':String(result)]});
}
export const structures:Algorithm[]=Object.entries(codes).map(([id,code])=>({id,code,name:labels[id],category:'Data structures',type:'Structure',view:id==='linked-list'||id==='heap'?'nodes':id==='hash-table'?'hash':id==='stack'?'stack':id==='queue'?'queue':'array',level:['heap','hash-table','linked-list'].includes(id)?'Core':'Foundation',summary:({array:'Direct positions. Ordered values.',stack:'Last in, first out.',queue:'First in, first out.',set:'Every value appears at most once.','linked-list':'The links define the order.','hash-table':'A hash chooses a bucket. Chains resolve collisions.',heap:'Keep the minimum at the root.'} as Record<string,string>)[id],operations:({array:['Read','Set','Insert','Delete'],stack:['Push','Pop','Peek'],queue:['Enqueue','Dequeue','Peek'],set:['Add','Discard','Contains'],'linked-list':['Insert','Delete','Search'],'hash-table':['Insert','Lookup','Delete'],heap:['Insert','Extract','Peek']} as Record<string,string[]>)[id],limit:id==='linked-list'?9:12,best:'O(1)',average:id==='linked-list'?'O(n)':id==='heap'?'O(log n)':id==='array'?'O(1) access; O(n) shift':'O(1)',worst:['hash-table','set','linked-list','array'].includes(id)?'O(n)':id==='heap'?'O(log n)':id==='stack'?'O(n) resize':'O(1)',space:'O(n) stored values',complexityNote:id==='hash-table'?'Seven buckets illustrate separate chaining. Expected constant lookup assumes a good hash and controlled load; long chains are linear.':id==='set'?'Display order is for clarity. A Python set has no guaranteed element order. Hash collisions can make operations linear.':id==='linked-list'?'Rewiring is constant work once the predecessor is known; finding a position requires walking the links.':id==='heap'?'The seed values are arranged as a valid min heap before playback. Insert/extract traverse its height; peek is O(1).':id==='queue'?'The Python example uses deque, so removing the front is O(1).':id==='array'?'This uses a Python list: indexed access/set is O(1); insertion/deletion may shift O(n) items.':'Python-list push is amortized O(1); an occasional resize costs O(n). Pop and peek at the end are O(1).',generate:i=>structureTrace(id,i)}));
