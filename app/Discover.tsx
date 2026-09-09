import { motion } from 'motion/react';
import { ArrowUpRight, ChevronRight, Code2, Check, Play, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const collections = [
  {name:'Algorithms', title:'Think it through.', subtitle:'Search, sort and solve.', art:'sort', tag:'01', code:['08','03','12','01','06']},
  {name:'Data structures', title:'Connect the dots.', subtitle:'Stacks, queues and linked lists.', art:'nodes', tag:'02', code:['head','data','next']},
  {name:'Python & files', title:'Make data useful.', subtitle:'Read, validate and transform.', art:'files', tag:'03', code:['records.csv','clean.py','results.txt']},
  {name:'Databases', title:'Find your answers.', subtitle:'Queries, joins and transactions.', art:'database', tag:'04', code:['SELECT','FROM','WHERE']},
  {name:'Web & networks', title:'Bring it together.', subtitle:'Flask, sockets and local labs.', art:'network', tag:'05', code:['GET','200','OK']},
];
const reveal = {initial:{opacity:0,y:28},whileInView:{opacity:1,y:0},viewport:{once:true,amount:.15},transition:{duration:.55}};
export default function Discover({onBrowse,onTopic,onResume,onExam,title,solved,count}:{onBrowse:()=>void;onTopic:(topic:string)=>void;onResume:()=>void;onExam:()=>void;title:string;solved:number;count:number}){
 return <div className="discover">
  <section className="hero">
   <div className="hero-atmosphere" aria-hidden="true"><i/><i/><i/></div>
   <motion.div className="hero-copy" {...reveal}>
    <span className="hero-kicker">Your H2 Computing workspace</span>
    <h1>Big ideas.<br/><span>Start with a little code.</span></h1>
    <p>From your first function to your practical exam.<br className="desktop-break"/> A space to try, learn and get a little better.</p>
    <div className="hero-actions"><Button size="lg" onClick={onResume}>Start practising <ChevronRight/></Button><button className="text-link" onClick={onBrowse}>Explore all challenges <ChevronRight size={18}/></button></div>
   </motion.div>
   <motion.button className="hero-object" onClick={onResume} aria-label={`Continue ${title}`} initial={{opacity:0,y:45,rotateX:12}} animate={{opacity:1,y:0,rotateX:0}} transition={{duration:.9,delay:.15}} whileHover={{y:-7}} whileTap={{scale:.985}}>
    <div className="object-halo" aria-hidden="true"/>
    <div className="code-window"><div className="window-chrome"><span className="traffic" aria-hidden="true"><i/><i/><i/></span><span>possibility.py</span><Code2 size={14}/></div><div className="hero-code" aria-hidden="true"><div><small>1</small><span className="syntax-purple">def</span> <span className="syntax-blue">keep_learning</span>(you):</div><div><small>2</small>    <span className="syntax-purple">while</span> you.curious:</div><div><small>3</small>        you.<span className="syntax-blue">practise</span>()</div><div><small>4</small>        you.<span className="syntax-blue">learn</span>()</div><div><small>5</small>        you.<span className="syntax-blue">grow</span>()<span className="code-caret"/></div></div><div className="window-status"><span><i/> Ready for your next idea</span><span>Python 3</span></div></div>
    <div className="floating-result"><span className="result-symbol"><Check size={18}/></span><div><strong>Small steps. Real progress.</strong><span>One challenge at a time.</span></div></div>
   </motion.button>
   <div className="hero-footnote"><span>{count} challenges</span><i/><span>Python & SQLite</span><i/><span>Made for the 9569 practical</span></div>
  </section>
  <section className="collection-section">
   <motion.div className="section-heading" {...reveal}><h2>Find your next<br/><span>“I get it.”</span></h2><button className="text-link" onClick={onBrowse}>Explore the collection <ArrowUpRight size={18}/></button></motion.div>
   <div className="collection-grid">{collections.map((topic,i)=><motion.button key={topic.name} className={`collection-card collection-${topic.art}`} onClick={()=>onTopic(topic.name)} {...reveal} transition={{duration:.45,delay:i*.04}} whileHover={{y:-8}} whileTap={{scale:.985}}><div className="collection-copy"><span>{topic.name}</span><h3>{topic.title}</h3><p>{topic.subtitle}</p></div><div className={`collection-art art-${topic.art}`} aria-hidden="true">{topic.code.map((line,j)=><span key={line} style={{'--i':j} as React.CSSProperties}>{line}</span>)}</div><span className="collection-footer"><span>Explore challenges</span><i><ArrowUpRight size={18}/></i></span></motion.button>)}</div>
  </section>
  <section className="continue-section"><motion.div className="continue-card" {...reveal}><div><span className="hero-kicker">A little more confident, every day.</span><h2>Pick up where<br/>you left off.</h2><p>{title}</p><Button onClick={onResume}><Play size={16}/> Continue practising</Button></div><div className="progress-orbit"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="84"/><circle cx="100" cy="100" r="84" className="orbit-fill" strokeDasharray={`${solved/57*528} 528`}/></svg><div><strong>{solved}<span>/57</span></strong><small>challenges solved</small></div></div></motion.div></section>
  <section className="exam-feature"><motion.div {...reveal}><span className="hero-kicker">Meet the moment.</span><h2>Your exam.<br/><span>Your rehearsal.</span></h2><p>Four tasks. Three hours. A little more ready.<br/>Create a practice session around the skills you want to master.</p><Button size="lg" onClick={onExam}><Timer size={18}/> Set up exam practice</Button></motion.div><div className="exam-numbers" aria-hidden="true"><span>03<span>hours to put it together</span></span><span>04<span>tasks to test yourself</span></span></div></section>
  <footer className="site-footer"><span><Code2 size={17}/> Practical / 9569</span><p>Built for your practice. Saved on your device.</p><button className="text-link" onClick={onBrowse}>Find a challenge <ChevronRight size={15}/></button></footer>
 </div>
}
