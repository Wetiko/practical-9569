export type Category = 'Searching'|'Sorting'|'Control flow'|'Data structures'|'Recursion'|'Graph algorithms';
export type Item = {id:string;value:number;hole?:boolean};
export type Node = {id:string;label:string;x:number;y:number};
export type Edge = {from:string;to:string;weight?:number};
export type Step = {
 description:string;codeLine:number;array:Item[];active:string[];comparing:string[];swapping:string[];sorted:string[];eliminated:string[];
 pointers:Record<string,number>;variables:Record<string,string|number>;output:string[];
 nodes:Node[];edges:Edge[];frontier:string[];frames:string[];groups:{label:string;values:number[];depth:number}[];
 held?:Item;edgePath?:string[];phase?:string;result?:unknown;done?:boolean;
};
export type Input = {values:number[];target:number;operation:string;index:number;edges:string;start:string;end:string};
export type Algorithm = {id:string;name:string;category:Category;level:'Foundation'|'Core'|'Stretch';type:'Algorithm'|'Structure'|'Control flow';summary:string;code:string;best:string;average:string;worst:string;space:string;complexityNote:string;view:'array'|'bars'|'nodes'|'stack'|'queue'|'flow'|'recursion'|'hash';operations?:string[];defaultValues?:number[];limit?:number;generate:(input:Input)=>Step[]};
export const defaults:Input={values:[7,2,9,1,5,3],target:5,operation:'',index:1,edges:'A B 4\nA C 2\nB D 5\nC B 1\nC D 8\nC E 10\nD E 2\nE F 3',start:'A',end:'F'};
export const items=(values:number[]):Item[]=>values.map((value,i)=>({id:`v${i}`,value}));
export class Trace {
 steps:Step[]=[];state:Step;lines:string[];
 constructor(code:string,values:number[]=[]){this.lines=code.split('\n');this.state={description:'Ready.',codeLine:1,array:items(values),active:[],comparing:[],swapping:[],sorted:[],eliminated:[],pointers:{},variables:{},output:[],nodes:[],edges:[],frontier:[],frames:[],groups:[]};}
 at(statement:string,description:string,patch:Partial<Step>={}){
  const line=this.lines.findIndex(l=>l.trim()===statement.trim());if(line<0)throw Error(`Missing code line: ${statement}`);
  this.state={...this.state,active:[],comparing:[],swapping:[],...patch,description,codeLine:patch.codeLine??line+1};
  if(this.steps.length>=2000)throw Error('This input creates too many steps. Try fewer values.');
  this.steps.push(structuredClone(this.state));return this;
 }
 finish(statement:string,description:string,result:unknown,patch:Partial<Step>={}){this.at(statement,description,{...patch,result,done:true});return this.steps;}
}
export function parseValues(text:string,limit=12){if(!text.trim())return [];const parts=text.split(',').map(s=>s.trim());if(parts.length>limit||parts.some(s=>! /^-?\d+$/.test(s)||Math.abs(Number(s))>99))throw Error(`Enter up to ${limit} integers from −99 to 99, separated by commas.`);return parts.map(Number);}
export function validateInput(input:Input,algorithm:Algorithm){
 if(algorithm.id==='nested-loops'&&(input.index>4||input.target<0||input.target>4))throw Error('Use 0–4 rows and columns.');
 if(input.values.length>(algorithm.limit??12)||input.values.some(n=>!Number.isInteger(n)||Math.abs(n)>99))throw Error('Use a smaller list of integers.');
 if(!Number.isInteger(input.target)||Math.abs(input.target)>99)throw Error('Enter a target/value from −99 to 99.');
 if(!Number.isInteger(input.index)||input.index<0||input.index>12)throw Error('Index/count must be from 0 to 12.');
 if(algorithm.category==='Recursion'&&['factorial','fibonacci','basic-recursion'].includes(algorithm.id)&&(input.target<0||input.target>(algorithm.id==='fibonacci'?6:8)))throw Error(`Use n from 0 to ${algorithm.id==='fibonacci'?6:8}.`);
}
export type LearningRecord={viewedAt:number;completed?:boolean;predictions?:number;correct?:number};
export type LearningProgress=Record<string,LearningRecord>;
