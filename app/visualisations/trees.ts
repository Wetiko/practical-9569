import {Trace,items,type Algorithm,type Input,type Step} from './engine';
type BNode={id:string;value:number;left:BNode|null;right:BNode|null};
export function seedTree(values:number[]){let serial=0;let root:BNode|null=null;function add(n:BNode|null,value:number):BNode{if(!n)return{id:`n${serial++}`,value,left:null,right:null};if(value<n.value)n.left=add(n.left,value);if(value>n.value)n.right=add(n.right,value);return n;}for(const v of values)root=add(root,v);return root;}
export function treePicture(root:BNode|null){const nodes:Step['nodes']=[],edges:Step['edges']=[];let count=0;function walk(n:BNode|null,depth:number){if(!n)return;walk(n.left,depth+1);nodes.push({id:n.id,label:String(n.value),x:++count*60,y:40+depth*58});for(const c of [n.left,n.right])if(c)edges.push({from:n.id,to:c.id});walk(n.right,depth+1);}walk(root,0);for(const n of nodes)n.x=n.x/(count+1)*11;return{nodes,edges};}
const bstCode=`class Node:
    def __init__(self, value):
        self.value, self.left, self.right = value, None, None

def insert(node, value):
    if node is None:
        return Node(value)
    if value < node.value:
        node.left = insert(node.left, value)
    elif value > node.value:
        node.right = insert(node.right, value)
    return node

def find(node, value):
    while node is not None:
        if value == node.value:
            return node
        node = node.left if value < node.value else node.right
    return None

def delete(node, value):
    if node is None:
        return None
    if value < node.value:
        node.left = delete(node.left, value)
    elif value > node.value:
        node.right = delete(node.right, value)
    else:
        if node.left is None:
            return node.right
        if node.right is None:
            return node.left
        successor = node.right
        while successor.left is not None:
            successor = successor.left
        node.value = successor.value
        node.right = delete(node.right, successor.value)
    return node

def inorder(node):
    if node is None:
        return []
    return inorder(node.left) + [node.value] + inorder(node.right)`;
function bstTrace(input:Input){let root=seedTree(input.values);const t=new Trace(bstCode),op=input.operation||'Search',value=input.target;let result:unknown;
 const vals=()=>{const out:number[]=[];function visit(n:BNode|null){if(n){out.push(n.value);visit(n.left);visit(n.right);}}visit(root);return out;};
 const lineFor=(s:string)=>{const start=bstCode.indexOf(op==='Delete'?'def delete':op==='Search'?'def find':op==='Traversal'?'def inorder':'def insert');return bstCode.slice(0,start).split('\n').length+bstCode.slice(start).split('\n').findIndex(l=>l.trim()===s);};
 const emit=(s:string,d:string,p:Partial<Step>={})=>t.at(s,d,{codeLine:lineFor(s),...treePicture(root),array:items(vals()),variables:{value,operation:op},...p});
 emit(op==='Insert'?'def insert(node, value):':op==='Delete'?'def delete(node, value):':op==='Traversal'?'def inorder(node):':'def find(node, value):','Start from the root. Smaller values go left; larger values go right.');
 if(op==='Insert'){
  let parent:BNode|null=null,n=root;let side:'left'|'right'='left';while(n){emit('if value < node.value:',`Compare ${value} with ${n.value}.`,{active:[n.id]});if(value===n.value){result=false;emit('return node','This value is already present; no duplicate node is added.');break;}parent=n;side=value<n.value?'left':'right';n=n[side];emit(side==='left'?'node.left = insert(node.left, value)':'node.right = insert(node.right, value)',`Follow the ${side} child.`,{active:parent?[parent.id]:[]});}
  if(!n){const fresh:BNode={id:'inserted',value,left:null,right:null};if(parent)parent[side]=fresh;else root=fresh;result=true;emit('return Node(value)',`Attach ${value} at the empty child pointer.`,{active:[fresh.id]});}
 }else if(op==='Search'){let n=root;while(n){emit('if value == node.value:',`Inspect ${n.value}.`,{active:[n.id]});if(value===n.value){result=true;emit('return node',`Found ${value}.`,{sorted:[n.id]});break;}const left=value<n.value;emit('node = node.left if value < node.value else node.right',`Only the ${left?'left':'right'} subtree can contain ${value}.`,{active:[n.id]});n=left?n.left:n.right;}if(!n){result=false;emit('return None','Reached an empty pointer; the value is absent.');}
 }else if(op==='Delete'){
  function remove(n:BNode|null,value:number,assign:(next:BNode|null)=>void){if(!n)return;emit('def delete(node, value):',`Find ${value}; inspect ${n.value}.`,{active:[n.id]});if(value<n.value){remove(n.left,value,next=>{n.left=next});}else if(value>n.value){remove(n.right,value,next=>{n.right=next});}else{result=true;if(!n.left||!n.right){const child=n.left||n.right;assign(child);emit(!n.left?'return node.right':'return node.left',`Reconnect the parent to ${child?child.value:'an empty pointer'}.`);}else{let successor=n.right;emit('successor = node.right','Find the smallest value in the right subtree.',{active:[successor.id]});while(successor.left){successor=successor.left;emit('successor = successor.left','Follow left toward the in-order successor.',{active:[successor.id]});}n.value=successor.value;emit('node.value = successor.value',`Replace the deleted value with successor ${successor.value}.`,{active:[n.id,successor.id]});remove(n.right,successor.value,next=>{n.right=next});}}}
  remove(root,value,next=>{root=next});result=result??false;
 }else{const out:number[]=[];function walk(n:BNode|null){if(!n)return;emit('def inorder(node):',`Enter subtree rooted at ${n.value}.`,{active:[n.id]});walk(n.left);out.push(n.value);emit('return inorder(node.left) + [node.value] + inorder(node.right)',`Visit ${n.value} between its left and right subtrees.`,{active:[n.id],output:out.map(String)});walk(n.right);}walk(root);result=out;}
 return t.finish(op==='Traversal'?'return inorder(node.left) + [node.value] + inorder(node.right)':op==='Search'&&result===false?'return None':'return node',op==='Traversal'?'In-order traversal visits the BST in sorted order.':'The operation is complete; the BST ordering is preserved.',result,{codeLine:lineFor(op==='Traversal'?'return inorder(node.left) + [node.value] + inorder(node.right)':op==='Search'&&result===false?'return None':'return node'),...treePicture(root),array:items(vals()),output:Array.isArray(result)?result.map(String):[String(result)]});
}
const treeCode=`def tree_operation(a, operation, value):
    # A complete binary tree stored in level order.
    if operation == "Insert":
        a.append(value)
    elif operation == "Search":
        for i in range(len(a)):
            if a[i] == value:
                return i
        return -1
    elif operation == "Delete":
        for i in range(len(a)):
            if a[i] == value:
                a[i] = a[-1]
                a.pop()
                break
    elif operation == "Traversal":
        output = []
        for value in a:
            output.append(value)
        return output
    return a`;
function plainTree(input:Input){const t=new Trace(treeCode);let a=items(input.values);const op=input.operation||'Traversal';let result:unknown;
 const pic=()=>({array:a,nodes:a.map((v,i)=>{const d=Math.floor(Math.log2(i+1));return{id:v.id,label:String(v.value),x:(i-2**d+1.5)/2**d*680+20,y:40+d*68}}),edges:a.slice(1).map((v,i)=>({from:a[Math.floor(i/2)].id,to:v.id}))});
 const emit=(s:string,d:string,p:Partial<Step>={})=>t.at(s,d,{...pic(),...p,...(op==='Delete'&&s==='if a[i] == value:'?{codeLine:12}:{})});emit('def tree_operation(a, operation, value):','A complete binary tree fills one level before the next. It is not ordered by value.');
 if(op==='Insert'){a.push({id:'new',value:input.target});emit('a.append(value)',`Attach ${input.target} in the next level-order position.`,{active:['new']});}
 else if(op==='Search'||op==='Delete'){result=-1;for(let i=0;i<a.length;i++){emit('if a[i] == value:',`Inspect ${a[i].value}.`,{active:[a[i].id]});if(a[i].value===input.target){result=i;if(op==='Delete'){const last=a.at(-1)!;a[i]={...a[i],value:last.value};emit('a[i] = a[-1]',`Copy the last leaf's value ${last.value} to this position.`,{active:[a[i].id,last.id]});a.pop();emit('a.pop()','Remove the last leaf to keep the tree complete.');}break;}}}
 else{const out:string[]=[];for(const v of a){out.push(String(v.value));emit('output.append(value)',`Read ${v.value} in level order.`,{active:[v.id],output:[...out]});}result=a.map(v=>v.value);}
 return t.finish(op==='Search'?(result===-1?'return -1':'return i'):op==='Traversal'?'return output':'return a','Tree operation complete.',op==='Delete'?a.map(v=>v.value):result??a.map(v=>v.value),pic());}
export const trees:Algorithm[]=[{id:'tree',name:'Tree',code:treeCode,summary:'Parents and children, organised into levels.',generate:plainTree},{id:'bst',name:'Binary search tree',code:bstCode,summary:'Smaller to the left. Larger to the right.',generate:bstTrace}].map(x=>({...x,category:'Data structures',type:'Structure',view:'nodes',level:'Core',operations:['Insert','Search','Delete','Traversal'],defaultValues:[8,3,10,1,6,14],limit:9,best:'O(1)',average:x.id==='bst'?'O(log n) when reasonably balanced':'O(n) search',worst:'O(n)',space:'O(n) stored nodes',complexityNote:x.id==='bst'?'This is an unbalanced BST: sorted insertion can form a chain. Duplicate values are ignored. Traversal visits every node.':'This example uses level-order array storage. Deletion replaces a value with the last leaf; no search-order invariant is promised.'}));
const traversalCode=`def traverse(node, order, output):
    if node is None:
        return
    if order == "Pre-order":
        output.append(node.value)  # before children
    traverse(node.left, order, output)
    if order == "In-order":
        output.append(node.value)  # between children
    traverse(node.right, order, output)
    if order == "Post-order":
        output.append(node.value)  # after children
    return`;
export const treeTraversal:Algorithm={id:'tree-traversal',name:'Tree traversal',category:'Recursion',type:'Algorithm',level:'Core',view:'nodes',summary:'See how visiting before, between or after children changes the order.',code:traversalCode,best:'O(n)',average:'O(n)',worst:'O(n)',space:'O(h) call stack + O(n) output',complexityNote:'Every node is visited once. h is the tree height; a chain needs a linear call stack.',operations:['In-order','Pre-order','Post-order'],defaultValues:[8,3,10,1,6,14],limit:9,generate(input){const root=seedTree(input.values),t=new Trace(traversalCode),order=input.operation||'In-order',out:number[]=[],frames:string[]=[];function walk(n:BNode|null){if(!n)return;frames.push(`visit(${n.value})`);t.at('if node is None:',`Enter node ${n.value}; keep its call on the stack.`,{...treePicture(root),frames:[...frames],active:[n.id]});const visit=(statement:string)=>{out.push(n.value);t.at(statement,`Visit ${n.value} (${order.toLowerCase()}).`,{active:[n.id],output:out.map(String),frames:[...frames]});};if(order==='Pre-order')visit('output.append(node.value)  # before children');walk(n.left);if(order==='In-order')visit('output.append(node.value)  # between children');walk(n.right);if(order==='Post-order')visit('output.append(node.value)  # after children');frames.pop();t.at('return',`Return from node ${n.value}.`,{codeLine:traversalCode.split('\n').length,frames:[...frames]});}t.at('def traverse(node, order, output):',`Start ${order.toLowerCase()} traversal.`,treePicture(root));walk(root);return t.finish('return','Traversal complete.',out,{codeLine:traversalCode.split('\n').length,output:out.map(String),frames:[]});}};
