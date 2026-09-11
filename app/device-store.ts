import type {Saved} from './study';
type RecordValue={revision:number;current:Saved;previous?:Saved};
export class ConflictError extends Error{constructor(){super('Another tab saved newer work.')}}
export class DeviceStore{
 revision=0;
 private constructor(private db:IDBDatabase,private validate:(data:unknown)=>Saved){}
 static open(validate:(data:unknown)=>Saved,name='practical9569.device'):Promise<DeviceStore>{return new Promise((resolve,reject)=>{const request=indexedDB.open(name,1);request.onupgradeneeded=()=>request.result.createObjectStore('snapshots');request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Close an older tab to open device storage.'));request.onsuccess=()=>{request.result.onversionchange=()=>request.result.close();resolve(new DeviceStore(request.result,validate))}})}
 close(){this.db.close()}
 async load(legacy:()=>string|null):Promise<{value:Saved|null;recovered:boolean}>{
  const record=await this.record();this.revision=record?.revision||0;
  if(record){try{return {value:this.validate(record.current),recovered:false}}catch{if(record.previous)return {value:this.validate(record.previous),recovered:true};throw Error('No readable device snapshot.')}}
  const raw=legacy();if(!raw)return {value:null,recovered:false};const value=this.validate(JSON.parse(raw));await this.save(value);return {value,recovered:false};
 }
 record():Promise<RecordValue|undefined>{return new Promise((resolve,reject)=>{const request=this.db.transaction('snapshots').objectStore('snapshots').get('work');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
 async previous():Promise<Saved>{const r=await this.record();if(!r?.previous)throw Error('No previous snapshot is available yet.');return this.validate(r.previous)}
 save(value:Saved):Promise<void>{return new Promise((resolve,reject)=>{
  const tx=this.db.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots');let error:unknown;let next=0;
  const request=store.get('work');request.onsuccess=()=>{const old=request.result as RecordValue|undefined;if((old?.revision||0)!==this.revision){error=new ConflictError();tx.abort();return}
   let previous:Saved|undefined;try{if(old)previous=this.validate(old.current)}catch{try{if(old?.previous)previous=this.validate(old.previous)}catch{previous=undefined}}
   next=this.revision+1;store.put({revision:next,current:value,previous},'work');
  };
  tx.oncomplete=()=>{this.revision=next;resolve()};tx.onabort=()=>reject(error||tx.error||Error('Device save interrupted'));tx.onerror=()=>{error=tx.error};
 })}
}
