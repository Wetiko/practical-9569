import {Component,type ReactNode} from 'react';

type Props={children:ReactNode;onExport:()=>void;onReload:(exported:boolean)=>boolean};
type State={failed:boolean;exported:boolean;message:string};
/** Kept outside lazy chunks so a failed import cannot hide the recovery controls. */
export default class LoadRecovery extends Component<Props,State>{
 state:State={failed:false,exported:false,message:''};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidUpdate(previous:Props){if(this.state.exported&&previous.onExport!==this.props.onExport)this.setState({exported:false,message:'Your work changed since the last export. Export again before reloading if device storage is unavailable.'})}
 render(){
  if(!this.state.failed)return this.props.children;
  return <section className="load-recovery" role="alert" aria-label="Screen loading failed">
   <h2>This part of the app couldn’t load.</h2>
   <p>Your connection may be offline, or a newer version may be available. Your work is still held in this tab. Other screens remain available.</p>
   <p>Export a backup for an extra copy, then reload when you’re ready. An active exam timer will continue.</p>
   <div><button type="button" onClick={()=>{try{this.props.onExport();this.setState({exported:true,message:'Backup download requested. Check that it finished before reloading.'})}catch{this.setState({message:'The backup could not be downloaded. Keep this tab open and try again.'})}}}>Export current work</button>
   <button type="button" onClick={()=>{if(!this.props.onReload(this.state.exported))this.setState({message:'Your work could not be saved on this device. Export a backup and check the download before reloading.'})}}>Reload latest version</button></div>
   {this.state.message&&<p role="status">{this.state.message}</p>}
  </section>;
 }
}
