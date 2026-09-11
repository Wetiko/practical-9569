import catalogue from './catalogue.json';
export type Problem={id:string;title:string;topic:string;level:string;minutes:number;ref:string;description:string;solution:string;starter:string;tests:{label:string;expr:string;expected:unknown}[];hints:string[];setup:string;files:Record<string,string>;kind:'python'|'sql'|'mongo'|'lab';rubric:string[];source:string;sourceUrl:string};
export const bank=catalogue as unknown as Problem[];
const challenges=import.meta.glob('./challenges/*.json',{import:'default'});
const references=import.meta.glob('./references/*.json',{import:'default'});
export async function loadChallenge(id:string):Promise<Problem>{const load=challenges[`./challenges/${id}.json`];if(!load)throw Error('Unknown challenge');return await load() as Problem}
export type SolutionLesson={approach:string;steps:{lines:string;text:string}[];trace:string;mistakes:string[];complexity:string};
export async function loadReference(id:string){const load=references[`./references/${id}.json`];if(!load)throw Error('Unknown reference');return await load() as {solution:string;steps:{line:number;text:string}[];lesson?:SolutionLesson}}
