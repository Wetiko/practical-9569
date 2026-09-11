import {useEffect,useState} from 'react';
import {loadReference} from './content';
export default function SolutionGuide({id,kind}:{id:string;kind:string}){
 const [data,setData]=useState<Awaited<ReturnType<typeof loadReference>>|null>(null);const [error,setError]=useState(false);const [retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setData(null);setError(false);loadReference(id).then(d=>{if(active)setData(d)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[id,retry]);
 if(error)return <div role="alert"><p>Reference couldn’t load. Check your connection.</p><button onClick={()=>setRetry(n=>n+1)}>Retry reference</button></div>;
 if(!data)return <p role="status">Loading reference…</p>;
 return <div className="solution-walkthrough"><pre className="numbered-solution">{data.solution.split('\n').map((line,i)=><span className="solution-line" key={i}><span aria-hidden="true">{i+1}</span>{line||' '}{'\n'}</span>)}</pre><details open><summary>Line-by-line guide</summary><ol>{data.steps.map(step=><li key={step.line}><strong>Line {step.line}</strong><span>{step.text}</span></li>)}</ol></details><button onClick={()=>{const url=URL.createObjectURL(new Blob([data.solution],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download=id+'-reference.'+(kind==='sql'?'sql':'py');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download reference</button></div>
}
