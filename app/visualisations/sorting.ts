import {Trace,items,type Algorithm,type Input,type Item,type Step} from './engine';
const codes:Record<string,string>={
'bubble-sort':`def bubble_sort(a):
    for end in range(len(a) - 1, 0, -1):
        changed = False
        for j in range(end):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                changed = True
        if not changed:
            break
    return a`,
'selection-sort':`def selection_sort(a):
    for i in range(len(a)):
        smallest = i
        for j in range(i + 1, len(a)):
            if a[j] < a[smallest]:
                smallest = j
        a[i], a[smallest] = a[smallest], a[i]
    return a`,
'insertion-sort':`def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,
'merge-sort':`def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]`,
'quick-sort':`def quick_sort(a, low, high):
    if low >= high:
        return
    pivot = a[high]
    left = low
    for right in range(low, high):
        if a[right] <= pivot:
            a[left], a[right] = a[right], a[left]
            left += 1
    a[left], a[high] = a[high], a[left]
    quick_sort(a, low, left - 1)
    quick_sort(a, left + 1, high)
    return`,
'heap-sort':`def sift(a, root, size):
    largest = root
    for child in (2 * root + 1, 2 * root + 2):
        if child < size and a[child] > a[largest]:
            largest = child
    if largest != root:
        a[root], a[largest] = a[largest], a[root]
        sift(a, largest, size)

def heap_sort(a):
    for root in range(len(a) // 2 - 1, -1, -1):
        sift(a, root, len(a))
    for end in range(len(a) - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift(a, 0, end)
    return a`};
function generate(id:string,input:Input){
 const code=codes[id],t=new Trace(code,input.values);let a=items(input.values);const locked:string[]=[];
 const emit=(s:string,d:string,p:Partial<Step>={})=>t.at(s,d,{array:a,sorted:[...locked],...p});
 const swap=(i:number,j:number)=>{[a[i],a[j]]=[a[j],a[i]]};
 emit(id==='heap-sort'?'def heap_sort(a):':code.split('\n')[0],`Start with ${a.length} values.`);
 if(id==='bubble-sort'){
  for(let end=a.length-1;end>0;end--){let changed=false;emit('for end in range(len(a) - 1, 0, -1):',`Pass ${a.length-end}: scan the unsorted prefix.`,{variables:{pass:a.length-end,end}});
   for(let j=0;j<end;j++){emit('if a[j] > a[j + 1]:',`Compare ${a[j].value} and ${a[j+1].value}.`,{comparing:[a[j].id,a[j+1].id],pointers:{j}});if(a[j].value>a[j+1].value){const ids=[a[j].id,a[j+1].id];swap(j,j+1);emit('a[j], a[j + 1] = a[j + 1], a[j]','Swap: the larger value moves right.',{swapping:ids});changed=true;}}
   locked.push(a[end].id);emit('if not changed:',`${a[end].value} is fixed at index ${end}. ${changed?'Continue with a shorter prefix.':'No swaps: the remainder is sorted.'}`);if(!changed)break;
  }
 }else if(id==='selection-sort'){
  for(let i=0;i<a.length;i++){let min=i;emit('smallest = i',`Start the minimum at ${a[i].value}.`,{pointers:{current:i,minimum:min}});
   for(let j=i+1;j<a.length;j++){emit('if a[j] < a[smallest]:',`Is ${a[j].value} smaller than ${a[min].value}?`,{comparing:[a[j].id,a[min].id],pointers:{current:i,minimum:min,search:j}});if(a[j].value<a[min].value){min=j;emit('smallest = j',`The new minimum is ${a[min].value}.`,{active:[a[min].id],pointers:{current:i,minimum:min,search:j}});}}
   const ids=[a[i].id,a[min].id];swap(i,min);locked.push(a[i].id);emit('a[i], a[smallest] = a[smallest], a[i]',`Place ${a[i].value} at index ${i}; lock this position.`,{swapping:ids,pointers:{current:i}});
  }
 }else if(id==='insertion-sort'){
  for(let i=1;i<a.length;i++){const key=a[i];let j=i-1;const hole={id:'hole',value:0,hole:true};a[i]=hole;emit('key = a[i]',`Hold ${key.value} as the key. The open slot is its available space.`,{held:key,variables:{key:key.value,i,j},pointers:{j}});
   while(j>=0){emit('while j >= 0 and a[j] > key:',`Compare ${a[j].value} with key ${key.value}: ${a[j].value>key.value?'shift right.':'stop shifting.'}`,{held:key,comparing:[a[j].id,key.id],variables:{key:key.value,i,j},pointers:{j}});if(a[j].value<=key.value)break;const moved=a[j];a[j+1]=moved;a[j]=hole;emit('a[j + 1] = a[j]',`Shift ${moved.value} right into the open slot.`,{held:key,swapping:[moved.id]});j--;emit('j -= 1',`Move j left to ${j}.`,{pointers:{j},variables:{key:key.value,i,j}});}
   if(j<0)emit('while j >= 0 and a[j] > key:','j is −1: insert at the beginning.',{variables:{key:key.value,i,j}});
   a[j+1]=key;emit('a[j + 1] = key',`Insert ${key.value}. The prefix through index ${i} is ordered.`,{held:undefined,active:[key.id],pointers:{key:j+1}});
  }
 }else if(id==='merge-sort'){
  const groups:Step['groups']=[];
  function merge(part:Item[],offset:number,depth:number):Item[]{
   groups.push({label:`[${offset}…${offset+part.length})`,values:part.map(x=>x.value),depth});emit('if len(a) <= 1:',`Visit a group of ${part.length} values.`,{groups:[...groups],active:part.map(x=>x.id),frames:groups.map(g=>g.label)});
   if(part.length<=1){emit('return a','This group is already sorted.');groups.pop();return part;}
   const mid=Math.floor(part.length/2);emit('mid = len(a) // 2',`Divide ${part.length} values into ${mid} and ${part.length-mid}.`,{groups:[...groups,{label:'left',values:part.slice(0,mid).map(x=>x.value),depth:depth+1},{label:'right',values:part.slice(mid).map(x=>x.value),depth:depth+1}]});
   const left=merge(part.slice(0,mid),offset,depth+1),right=merge(part.slice(mid),offset+mid,depth+1);let i=0,j=0;const result:Item[]=[];
   while(i<left.length&&j<right.length){emit('if left[i] <= right[j]:',`Merge: compare ${left[i].value} and ${right[j].value}.`,{comparing:[left[i].id,right[j].id],groups:[...groups,{label:'left sorted',values:left.map(x=>x.value),depth:depth+1},{label:'right sorted',values:right.map(x=>x.value),depth:depth+1},{label:'merged',values:result.map(x=>x.value),depth:depth+1}]});const takeLeft=left[i].value<=right[j].value;const next=takeLeft?left[i++]:right[j++];result.push(next);emit(takeLeft?'result.append(left[i]); i += 1':'result.append(right[j]); j += 1',`Take ${next.value} into the merged result.`,{active:[next.id],groups:[...groups,{label:'merged',values:result.map(x=>x.value),depth:depth+1}]});}
   result.push(...left.slice(i),...right.slice(j));a.splice(offset,part.length,...result);emit('return result + left[i:] + right[j:]',`Merge complete for these ${result.length} values.`,{groups:[...groups,{label:'merged',values:result.map(x=>x.value),depth:depth+1}],active:result.map(x=>x.id)});groups.pop();return result;
  }a=merge(a,0,0);
 }else if(id==='quick-sort'){
  function quick(low:number,high:number,depth:number){if(low>=high){if(low===high)locked.push(a[low].id);return;}const pivot=a[high];let left=low;emit('pivot = a[high]',`Choose ${pivot.value} as pivot.`,{active:[pivot.id],pointers:{left,right:low,pivot:high},variables:{low,high,depth,pivot:pivot.value}});
   for(let right=low;right<high;right++){emit('if a[right] <= pivot:',`Compare ${a[right].value} with pivot ${pivot.value}.`,{comparing:[a[right].id,pivot.id],pointers:{left,right,pivot:high}});if(a[right].value<=pivot.value){const ids=[a[left].id,a[right].id];swap(left,right);emit('a[left], a[right] = a[right], a[left]',`Move ${a[left].value} into the ≤ pivot region.`,{swapping:ids});left++;emit('left += 1',`The partition boundary advances to ${left}.`,{pointers:{left,right,pivot:high}});}}
   swap(left,high);locked.push(pivot.id);emit('a[left], a[high] = a[high], a[left]',`Pivot ${pivot.value} reaches its final position.`,{swapping:[pivot.id,a[high].id],pointers:{pivot:left},groups:[{label:'≤ pivot',values:a.slice(low,left).map(x=>x.value),depth:0},{label:'pivot',values:[pivot.value],depth:0},{label:'> pivot',values:a.slice(left+1,high+1).map(x=>x.value),depth:0}]});quick(low,left-1,depth+1);quick(left+1,high,depth+1);
  }quick(0,a.length-1,0);
 }else{
  const tree=(size:number)=>({nodes:a.slice(0,size).map((v,i)=>{const depth=Math.floor(Math.log2(i+1)),start=2**depth-1;return{id:v.id,label:String(v.value),x:((i-start+.5)/2**depth)*680+20,y:45+depth*68}}),edges:a.slice(1,size).map((v,k)=>({from:a[Math.floor(k/2)].id,to:v.id}))});
  function sift(root:number,size:number){let largest=root;for(const child of [2*root+1,2*root+2])if(child<size){emit('if child < size and a[child] > a[largest]:',`Compare child ${a[child].value} with ${a[largest].value}.`,{...tree(size),comparing:[a[child].id,a[largest].id],variables:{root,size}});if(a[child].value>a[largest].value)largest=child;}if(largest!==root){const ids=[a[root].id,a[largest].id];swap(root,largest);emit('a[root], a[largest] = a[largest], a[root]',`Promote ${a[root].value} to restore the max heap.`,{...tree(size),swapping:ids});sift(largest,size);}}
  for(let root=Math.floor(a.length/2)-1;root>=0;root--)sift(root,a.length);for(let end=a.length-1;end>0;end--){const ids=[a[0].id,a[end].id];swap(0,end);locked.push(a[end].id);emit('a[0], a[end] = a[end], a[0]',`Extract maximum ${a[end].value} into its final position.`,{...tree(end),swapping:ids,variables:{end}});sift(0,end);}
 }
 return t.finish(id==='merge-sort'?(input.values.length<=1?'return a':'return result + left[i:] + right[j:]'):id==='quick-sort'?'return':'return a','Every value is now sorted.',a.map(x=>x.value),{...(id==='quick-sort'&&input.values.length>1?{codeLine:t.lines.length}:{}),array:a,held:undefined,sorted:a.map(x=>x.id),pointers:{},frames:[],groups:[],nodes:[],edges:[]});
}
const descriptions:Record<string,string>={'bubble-sort':'Compare neighbours. Let the largest settle at the end.','selection-sort':'Find the smallest remaining value. Lock it into place.','insertion-sort':'Lift a key. Shift larger values. Find its place.','merge-sort':'Divide into small pieces. Merge them in order.','quick-sort':'Partition around a pivot, then solve each side.','heap-sort':'Build a max heap. Extract its largest value.'};
export const sorting:Algorithm[]=Object.entries(codes).map(([id,code])=>({id,code,name:id.split('-').map((w,i)=>i?w:w[0].toUpperCase()+w.slice(1)).join(' '),category:'Sorting',type:'Algorithm',view:'bars',level:['merge-sort','quick-sort','heap-sort'].includes(id)?'Stretch':'Core',summary:descriptions[id],best:['bubble-sort','insertion-sort'].includes(id)?'O(n)':id==='selection-sort'?'O(n²)':'O(n log n)',average:['merge-sort','quick-sort','heap-sort'].includes(id)?'O(n log n)':'O(n²)',worst:['merge-sort','heap-sort'].includes(id)?'O(n log n)':'O(n²)',space:id==='merge-sort'?'O(n)':id==='quick-sort'?'O(log n) average; O(n) worst':id==='heap-sort'?'O(log n)':'O(1)',complexityNote:id==='merge-sort'?'Linear merges across log n levels. The displayed Python uses cursors, not costly front removals.':id==='quick-sort'?'Last-value pivot: sorted or equal inputs can create unbalanced partitions.':id==='heap-sort'?'Heap construction is O(n). Repeated extractions and recursive sift dominate the total.':id==='selection-sort'?'Each position scans the remaining region, even on sorted input.':id==='insertion-sort'?'An ordered prefix grows one key at a time. The open slot visualises shifting, while Python temporarily holds duplicate values.':'Each pass scans a shorter prefix. No swaps ends the algorithm early.',generate:input=>generate(id,input)}));
