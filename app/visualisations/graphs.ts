import {Trace,type Algorithm,type Input,type Step} from './engine';
export function parseGraph(text:string,start:string,end:string){const nodes=new Set<string>(),edges:{from:string;to:string;weight:number}[]=[];if(text.trim())for(const line of text.trim().split('\n')){const p=line.trim().split(/\s+/);if(p.length!==3||!p.slice(0,2).every(v=>/^[A-Z]$/.test(v))||!/^\d+$/.test(p[2])||Number(p[2])>99)throw Error('Use one directed edge per line, like A B 4. Weights must be 0–99.');const[from,to]=p;nodes.add(from);nodes.add(to);if(edges.some(e=>e.from===from&&e.to===to))throw Error('Use each directed edge only once.');edges.push({from,to,weight:Number(p[2])});}if(!/^[A-Z]$/.test(start)||!/^[A-Z]$/.test(end))throw Error('Start and destination must be single capital letters.');nodes.add(start);nodes.add(end);if(nodes.size>8||edges.length>16)throw Error('Use at most 8 nodes and 16 edges.');return{labels:[...nodes].sort(),edges};}
const bfs=`from collections import deque

def bfs(graph, start):
    queue, seen, order = deque([start]), {start}, []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbour, weight in graph[node]:
            if neighbour not in seen:
                seen.add(neighbour)
                queue.append(neighbour)
    return order`;
const dfs=`def dfs(graph, start):
    stack, seen, order = [start], set(), []
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        order.append(node)
        for neighbour, weight in reversed(graph[node]):
            if neighbour not in seen:
                stack.append(neighbour)
    return order`;
const dijkstra=`def dijkstra(graph, start):
    distance = {node: float("inf") for node in graph}
    distance[start], previous = 0, {}
    unvisited = set(graph)
    while unvisited:
        node = min(unvisited, key=lambda n: (distance[n], n))
        if distance[node] == float("inf"):
            break
        unvisited.remove(node)
        for neighbour, weight in graph[node]:
            candidate = distance[node] + weight
            if neighbour in unvisited and candidate < distance[neighbour]:
                distance[neighbour] = candidate
                previous[neighbour] = node
    return distance, previous`;
function graphTrace(input:Input,kind:string){const graph=parseGraph(input.edges,input.start,input.end),code=kind==='bfs'?bfs:kind==='dfs'?dfs:dijkstra,t=new Trace(code);const nodes=graph.labels.map((id,i)=>({id,label:id,x:360+230*Math.cos(2*Math.PI*i/graph.labels.length-Math.PI/2),y:175+130*Math.sin(2*Math.PI*i/graph.labels.length-Math.PI/2)}));const common={nodes,edges:graph.edges,phase:kind};const order:string[]=[];
 t.at(code.split('\n').find(s=>s.startsWith('def '))!,`Start at ${input.start}. Edges are directed; arrowheads show their direction.`,common);
 if(kind==='dijkstra'){const dist:Record<string,number>=Object.fromEntries(graph.labels.map(n=>[n,Infinity])),previous:Record<string,string>={},unvisited=new Set(graph.labels);dist[input.start]=0;const variables=()=>Object.fromEntries(graph.labels.map(n=>[n,dist[n]===Infinity?'∞':dist[n]]));t.at('distance[start], previous = 0, {}','The start has distance 0; other distances are unknown.',{variables:variables(),frontier:[...unvisited]});
  while(unvisited.size){const node=[...unvisited].sort((a,b)=>dist[a]-dist[b]||a.localeCompare(b))[0];t.at('node = min(unvisited, key=lambda n: (distance[n], n))',`Select unsettled node ${node} with the smallest tentative distance.`,{active:[node],variables:variables(),frontier:[...unvisited]});if(dist[node]===Infinity){t.at('break','All remaining nodes are unreachable from the start.');break;}unvisited.delete(node);order.push(node);t.at('unvisited.remove(node)',`Settle ${node}: non-negative edges cannot improve this distance.`,{sorted:[...order],frontier:[...unvisited]});for(const e of graph.edges.filter(e=>e.from===node)){const candidate=dist[node]+e.weight;t.at('candidate = distance[node] + weight',`Try ${node} → ${e.to}: ${dist[node]} + ${e.weight} = ${candidate}.`,{active:[node,e.to],comparing:[node,e.to],variables:{...variables(),candidate}});if(unvisited.has(e.to)&&candidate<dist[e.to]){dist[e.to]=candidate;previous[e.to]=node;t.at('distance[neighbour] = candidate',`Improve ${e.to}'s tentative distance to ${candidate}.`,{active:[e.to],variables:variables()});t.at('previous[neighbour] = node',`Remember ${node} as the predecessor of ${e.to}.`,{active:[node,e.to]});}}}
  const path:string[]=[];if(dist[input.end]!==Infinity){let at:string|undefined=input.end;while(at){path.unshift(at);if(at===input.start)break;at=previous[at];}}
  return t.finish('return distance, previous',path.length?`Shortest path to ${input.end}: ${path.join(' → ')}. Cost ${dist[input.end]}.`:`${input.end} is unreachable.`,{distances:Object.fromEntries(graph.labels.map(n=>[n,Number.isFinite(dist[n])?dist[n]:null])),path},{variables:variables(),output:path,active:path,edgePath:path,frontier:[]});
 }
 const pending=[input.start],seen=new Set<string>(kind==='bfs'?[input.start]:[]);t.at(kind==='bfs'?'queue, seen, order = deque([start]), {start}, []':'stack, seen, order = [start], set(), []',`Put ${input.start} in the ${kind==='bfs'?'queue':'stack'}.`,{frontier:[...pending],phase:kind});
 while(pending.length){const node=kind==='bfs'?pending.shift()!:pending.pop()!;t.at(kind==='bfs'?'node = queue.popleft()':'node = stack.pop()',`Take ${node} from the ${kind==='bfs'?'front of the queue':'top of the stack'}.`,{active:[node],frontier:[...pending]});if(kind==='dfs'&&seen.has(node)){t.at('continue',`${node} was already visited; skip this duplicate entry.`);continue;}seen.add(node);order.push(node);t.at('order.append(node)',`Visit ${node}.`,{active:[node],sorted:[...order],output:[...order]});const neighbours=graph.edges.filter(e=>e.from===node);if(kind==='dfs')neighbours.reverse();for(const e of neighbours){t.at('if neighbour not in seen:',`Inspect edge ${node} → ${e.to}.`,{active:[node,e.to],comparing:[node,e.to]});if(!seen.has(e.to)){if(kind==='bfs')seen.add(e.to);pending.push(e.to);t.at(kind==='bfs'?'queue.append(neighbour)':'stack.append(neighbour)',`Add ${e.to} to the ${kind==='bfs'?'rear':'top'}.`,{frontier:[...pending],active:[e.to]});}}}
 return t.finish('return order',`Traversal finished. ${order.length} reachable nodes visited.`,order,{output:[...order],frontier:[],active:[]});
}
export const graphAlgorithms:Algorithm[]=[['bfs','Breadth-first search',bfs],['dfs','Depth-first search',dfs],['dijkstra',"Dijkstra’s algorithm",dijkstra]].map(([id,name,code])=>({id,name,code,category:'Graph algorithms',type:'Algorithm',view:'nodes',level:id==='dijkstra'?'Stretch':'Core',summary:id==='bfs'?'Visit nearby nodes first, using a queue.':id==='dfs'?'Follow a path deeply, using a stack.':'Settle the nearest node. Improve its neighbours.',best:id==='dijkstra'?'O(V² + E)':'O(V + E)',average:id==='dijkstra'?'O(V² + E)':'O(V + E)',worst:id==='dijkstra'?'O(V² + E)':'O(V + E)',space:id==='dfs'?'O(V + E)':'O(V)',complexityNote:id==='dijkstra'?'This educational version scans unsettled nodes instead of using a priority queue. Only non-negative edge weights are accepted.':id==='dfs'?'The explicit stack may contain duplicate pending nodes, so it can use O(E) space. Neighbours are pushed in reverse order.':'These are bounds for the reachable graph. Nodes are marked when enqueued, preventing duplicate queue entries.',generate:i=>graphTrace(i,id)}));
export const graphStructure:Algorithm={...graphAlgorithms[0],id:'graph',name:'Graph',category:'Data structures',type:'Structure',summary:'Explore connections with a queue, a stack or shortest paths.',operations:['BFS','DFS','Shortest path'],generate:i=>graphTrace(i,i.operation==='DFS'?'dfs':i.operation==='Shortest path'?'dijkstra':'bfs')};
export function graphCode(operation:string){return operation==='DFS'?dfs:operation==='Shortest path'?dijkstra:bfs;}
