import {sorting} from './sorting';
import {searching} from './searching';
import {control} from './control';
import {structures} from './structures';
import {trees} from './trees';
import {recursion} from './recursion';
import {graphAlgorithms,graphStructure} from './graphs';
export const algorithms=[...searching,...sorting,...control,...structures,...trees,graphStructure,...recursion,...graphAlgorithms];
export const categories=['Searching','Sorting','Control flow','Data structures','Recursion','Graph algorithms'] as const;
