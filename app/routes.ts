import {useSyncExternalStore} from 'react';
export const defaults={view:'home',selected:'first-match',topic:'All topics',level:'All levels',source:'All sources',query:'',onlySaved:false,statusFilter:'All progress',kindFilter:'All formats',refFilter:'',module:'',question:''};
export type Route=typeof defaults;
const views=['home','library','practice','visualisations','progress','papers','exam','review'];
export function parseRoute(hash:string):Route{
 const [path,query='']=hash.replace(/^#\/?/,'').split('?');const [view,id]=path.split('/');const params=new URLSearchParams(query);const r={...defaults};
 if(views.includes(view))r.view=view;
 for(const key of Object.keys(defaults) as (keyof Route)[]){if(key==='view'||key==='onlySaved')continue;const v=params.get(key);if(v!==null)(r[key] as string)=v}
 if(view==='practice'&&id){try{r.selected=decodeURIComponent(id)}catch{}}
 r.onlySaved=params.get('onlySaved')==='true';return r;
}
export function routeHash(r:Route){const params=new URLSearchParams();for(const key of Object.keys(defaults) as (keyof Route)[]){if(key==='view'||key==='selected'&&r.view==='practice')continue;if(r[key]!==defaults[key])params.set(key,String(r[key]))}return '#/'+r.view+(r.view==='practice'?'/'+encodeURIComponent(r.selected):'')+(params.size?'?'+params.toString():'')}
export function navigate(patch:Partial<Route>,replace=false){const hash=routeHash({...parseRoute(location.hash),...patch});if(location.hash===hash)return;(replace?history.replaceState:history.pushState).call(history,null,'',hash);window.dispatchEvent(new Event('hashchange'))}
const subscribe=(fn:()=>void)=>{window.addEventListener('hashchange',fn);window.addEventListener('popstate',fn);return()=>{window.removeEventListener('hashchange',fn);window.removeEventListener('popstate',fn)}};
export function useRouteField<K extends keyof Route>(key:K):[Route[K],(value:Route[K])=>void]{const hash=useSyncExternalStore(subscribe,()=>location.hash,()=> '');return [parseRoute(hash)[key],value=>navigate({[key]:value},!['view','selected','module','question'].includes(key))]}
