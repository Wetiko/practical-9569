// Preserve unreadable stored data until the user restores a valid backup.
export function persistSaved(storage:Pick<Storage,'setItem'>,key:string,value:unknown,loaded:boolean,loadFailed:boolean):'paused'|'saved'|'failed'{
 if(!loaded||loadFailed)return 'paused';
 try{storage.setItem(key,JSON.stringify(value));return 'saved'}catch{return 'failed'}
}

// The caller reloads only after saving, or after an explicit backup export.
export function canReloadAfterSave(result:'paused'|'saved'|'failed',exported:boolean){
 return result==='saved'||exported;
}
