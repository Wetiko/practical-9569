import {useCallback,useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import type {Step} from './engine';
const BEAT=1.1;
export function usePlayback(steps:Step[]){
 const [index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
 const timeline=useRef<gsap.core.Timeline|null>(null),indexRef=useRef(0);
 useEffect(()=>{const clock={step:0};setIndex(0);indexRef.current=0;setPlaying(false);const tl=gsap.timeline({paused:true,onComplete:()=>setPlaying(false)});tl.to(clock,{step:Math.max(0,steps.length-1),duration:Math.max(BEAT,(steps.length-1)*BEAT),ease:'none',onUpdate:()=>{const next=Math.min(steps.length-1,Math.floor(clock.step+1e-6));if(next!==indexRef.current){indexRef.current=next;setIndex(next);}}});timeline.current=tl;return()=>{tl.kill();timeline.current=null}},[steps]);
 useEffect(()=>{timeline.current?.timeScale(speed)},[speed,steps]);
 const pause=useCallback(()=>{timeline.current?.pause();setPlaying(false)},[]);
 const seek=useCallback((next:number)=>{pause();const n=Math.max(0,Math.min(steps.length-1,next));timeline.current?.time(n*BEAT,true);indexRef.current=n;setIndex(n)},[steps.length,pause]);
 const toggle=useCallback(()=>{if(playing){pause();return;}if(steps.length<2)return;if(indexRef.current>=steps.length-1){timeline.current?.restart();indexRef.current=0;setIndex(0)}else timeline.current?.play();setPlaying(true)},[playing,pause,steps.length]);
 useEffect(()=>{const hide=()=>{if(document.hidden)pause()};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide)},[pause]);
 return {index:Math.min(index,steps.length-1),playing,speed,setSpeed,seek,toggle,pause};
}
