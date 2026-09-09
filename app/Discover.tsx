import {useEffect,useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {daysUntil} from './study';
import { motion,useMotionValue,useSpring,useReducedMotion } from 'motion/react';
import { ArrowUpRight, ChevronRight, Code2, Check, Play, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const collections = [
  {name:'Algorithms', title:'Think it through.', subtitle:'Search, sort and solve.', art:'sort', tag:'01', code:['08','03','12','01','06']},
  {name:'Data structures', title:'Connect the dots.', subtitle:'Stacks, queues and linked lists.', art:'nodes', tag:'02', code:['head','data','next']},
  {name:'Python & files', title:'Make data useful.', subtitle:'Read, validate and transform.', art:'files', tag:'03', code:['records.csv','clean.py','results.txt']},
  {name:'Databases', title:'Find your answers.', subtitle:'Queries, joins and transactions.', art:'database', tag:'04', code:['SELECT','FROM','WHERE']},
  {name:'Web & networks', title:'Bring it together.', subtitle:'Flask, sockets and local labs.', art:'network', tag:'05', code:['GET','200','OK']},
];
let heroPlayed=false;
const reveal = {initial:{opacity:0,y:28},whileInView:{opacity:1,y:0},viewport:{once:true,amount:.15},transition:{duration:.55}};
export default function Discover({onBrowse,onTopic,onResume,onExam,title,solved,count,autoCount,examDate,onExamDate,motionPaused}:{onBrowse:()=>void;onTopic:(topic:string)=>void;onResume:()=>void;onExam:()=>void;title:string;solved:number;count:number;autoCount:number;examDate:string;onExamDate:(date:string)=>void;motionPaused:boolean}){
 const reduced=useReducedMotion();const tiltX=useMotionValue(0),tiltY=useMotionValue(0);const rotateX=useSpring(tiltX,{stiffness:140,damping:20}),rotateY=useSpring(tiltY,{stiffness:140,damping:20});
 const codeLines=['def keep_learning(you):','    while you.curious:','        you.practise()','        you.learn()','        you.grow()'];const total=codeLines.join('\n').length;
 const [visible,setVisible]=useState(heroPlayed?total:0);
 useEffect(()=>{if(heroPlayed||reduced||motionPaused){setVisible(total);heroPlayed=true;return}heroPlayed=true;const timer=setInterval(()=>setVisible(n=>{if(n>=total){clearInterval(timer);return total}return Math.min(total,n+3)}),40);return()=>clearInterval(timer)},[reduced,motionPaused,total]);
 useEffect(()=>{if(reduced||motionPaused){tiltX.set(0);tiltY.set(0)}},[reduced,motionPaused,tiltX,tiltY]);
 const [carousel,api]=useEmblaCarousel({align:'start',containScroll:'trimSnaps',dragFree:false});const [slide,setSlide]=useState(0);const [snaps,setSnaps]=useState<number[]>([]);useEffect(()=>{if(!api)return;const update=()=>{setSlide(api.selectedScrollSnap());setSnaps(api.scrollSnapList())};update();api.on('select',update);api.on('reInit',update);return()=>{api.off('select',update);api.off('reInit',update)}},[api]);const days=daysUntil(examDate);
 return <div className="discover">
  <section className="hero">
   <div className="hero-atmosphere" aria-hidden="true"><i/><i/><i/></div>
   <motion.div className="hero-copy" {...reveal}>
    <span className="hero-kicker">Your H2 Computing workspace</span>
    <h1>Big ideas.<br/><span>Start with a little code.</span></h1>
    <p>From your first function to your practical exam.<br className="desktop-break"/> A space to try, learn and get a little better.</p>
    <div className="hero-actions"><Button size="lg" onClick={onResume}>Start practising <ChevronRight/></Button><button className="text-link" onClick={onBrowse}>Explore all challenges <ChevronRight size={18}/></button></div>
   </motion.div>
   <motion.button className="hero-object" onClick={onResume} aria-label={`Continue ${title}`} style={{rotateX:reduced||motionPaused?0:rotateX,rotateY:reduced||motionPaused?0:rotateY}} onPointerMove={e=>{if(reduced||motionPaused||e.pointerType!=='mouse')return;const r=e.currentTarget.getBoundingClientRect();tiltX.set(-((e.clientY-r.top)/r.height-.5)*8);tiltY.set(((e.clientX-r.left)/r.width-.5)*10)}} onPointerLeave={()=>{tiltX.set(0);tiltY.set(0)}} initial={{opacity:0,y:45}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.15}} whileHover={{y:-7}} whileTap={{scale:.985}}>
    <div className="object-halo" aria-hidden="true"/>
    <div className="code-window"><div className="window-chrome"><span className="traffic" aria-hidden="true"><i/><i/><i/></span><span>possibility.py</span><Code2 size={14}/></div><div className="hero-code" aria-hidden="true">{codeLines.map((line,i)=>{const offset=codeLines.slice(0,i).reduce((n,l)=>n+l.length+1,0);const shown=line.slice(0,Math.max(0,visible-offset));return <div key={i}><small>{i+1}</small>{shown.split(/(def|while|keep_learning|practise|learn|grow)/g).map((part,j)=><span key={j} className={['def','while'].includes(part)?'syntax-purple':['keep_learning','practise','learn','grow'].includes(part)?'syntax-blue':''}>{part}</span>)}{visible>=offset&&visible<=offset+line.length&&<span className="code-caret"/>}{i===4&&visible===total&&<span className="sr-only">Ready</span>}</div>})}</div><div className="window-status"><span><i/> Ready for your next idea</span><span>Python 3</span></div></div>
    <div className="floating-result"><span className="result-symbol"><Check size={18}/></span><div><strong>Small steps. Real progress.</strong><span>One challenge at a time.</span></div></div>
   </motion.button>
   <div className="hero-footnote"><span>{count} challenges</span><i/><span>Python · SQLite · MongoDB</span><i/><span>Made for the 9569 practical</span></div>
  </section>
  <section className="collection-section">
   <motion.div className="section-heading" {...reveal}><h2>Find your next<br/><span>“I get it.”</span></h2><button className="text-link" onClick={onBrowse}>Explore the collection <ArrowUpRight size={18}/></button></motion.div>
   <div className="collection-grid" ref={carousel}><div className="collection-track">{collections.map((topic,i)=><motion.button key={topic.name} className={`collection-card collection-${topic.art}`} onClick={()=>onTopic(topic.name)} {...reveal} transition={{duration:.45,delay:i*.04}} whileHover={{y:-8}} whileTap={{scale:.985}}><div className="collection-copy"><span>{topic.name}</span><h3>{topic.title}</h3><p>{topic.subtitle}</p></div><div className={`collection-art art-${topic.art}`} aria-hidden="true">{topic.code.map((line,j)=><span key={line} style={{'--i':j} as React.CSSProperties}>{line}</span>)}</div><span className="collection-footer"><span>Explore challenges</span><i><ArrowUpRight size={18}/></i></span></motion.button>)}</div></div><div className="carousel-controls"><button aria-label="Previous collection" disabled={!api?.canScrollPrev()} onClick={()=>api?.scrollPrev()}>←</button><div>{snaps.map((_,i)=><button key={i} aria-label={`Collection page ${i+1}`} aria-current={slide===i?'true':undefined} onClick={()=>api?.scrollTo(i)}><i/></button>)}</div><button aria-label="Next collection" disabled={!api?.canScrollNext()} onClick={()=>api?.scrollNext()}>→</button></div>
  </section>
  <section className="continue-section"><motion.div className="continue-card" {...reveal}><div><h2>Pick up where<br/>you left off.</h2><p>{title}</p><Button onClick={onResume}><Play size={16}/> Continue practising</Button></div><div className="progress-orbit"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="84"/><circle cx="100" cy="100" r="84" className="orbit-fill" strokeDasharray={`${solved/(autoCount)*528} 528`}/></svg><div><strong>{solved}<span>/{autoCount}</span></strong><small>challenges solved</small></div></div></motion.div></section>
  <section className="exam-feature"><motion.div {...reveal}><h2>Your exam.<br/><span>Your rehearsal.</span></h2><p>Four tasks. Three hours. A little more ready.<br/>Create a practice session around the skills you want to master.</p><label className="exam-date">Your exam date<input type="date" value={examDate} onInput={e=>onExamDate(e.currentTarget.value)} onChange={e=>onExamDate(e.target.value)}/></label>{days!==null&&<p className="exam-countdown" role="status">{days>0?`${days} days to your sitting`:days===0?'Your sitting is today.':'Your selected sitting has passed.'}</p>}<Button size="lg" onClick={onExam}><Timer size={18}/> Set up exam practice</Button></motion.div><div className="exam-numbers" aria-hidden="true"><span>03<span>hours to put it together</span></span><span>04<span>tasks to test yourself</span></span></div></section>
  <footer className="site-footer"><span><Code2 size={17}/> Practical / 9569</span><p>Built for your practice. Saved on your device.</p><button className="text-link" onClick={onBrowse}>Find a challenge <ChevronRight size={15}/></button></footer>
 </div>
}
