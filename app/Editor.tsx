'use client';
import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python, pythonLanguage } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import { Prec } from '@codemirror/state';
import { keymap, EditorView } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';
import { indentationGuides } from './editor-guides';
import { indentLess } from '@codemirror/commands';
import { notebookTab, pythonKeywords } from './notebook-completion.mjs';

const pythonExtensions = [
  python(),
  indentUnit.of("    "),
  pythonLanguage.data.of({ autocomplete: pythonKeywords }),
  autocompletion({ activateOnTyping: false, interactionDelay: 0 }),
  Prec.highest(keymap.of([
    { key: 'Tab', run: notebookTab, preventDefault: true },
    { key: 'Shift-Tab', run: indentLess, preventDefault: true },
  ])),
];
const sqlExtensions = [sql()];

export default function Editor({ value, onChange, kind, onRun, onSubmit }: {
  value: string; onChange: (value: string) => void; kind: string; onRun?:()=>void; onSubmit?:()=>void;
}) {
  const [position,setPosition]=useState({line:1,column:1,indent:0,selected:0});
  const positionExtension=useMemo(()=>EditorView.updateListener.of(u=>{if(!u.selectionSet&&!u.docChanged)return;const range=u.state.selection.main;const line=u.state.doc.lineAt(range.head);const prefix=line.text.match(/^[ \t]*/)?.[0]||'';let columns=0;for(const ch of prefix)columns+=ch==='\t'?4-columns%4:1;setPosition({line:line.number,column:range.head-line.from+1,indent:Math.floor(columns/4),selected:range.empty?0:u.state.doc.lineAt(Math.max(range.from,range.to-1)).number-u.state.doc.lineAt(range.from).number+1})}),[]);
  const runKeys=useMemo(()=>Prec.highest(keymap.of([
    {key:'Mod-Enter',run:()=>{if(!onRun)return false;onRun();return true},preventDefault:true},
    {key:'Mod-Shift-Enter',run:()=>{if(!onSubmit)return false;onSubmit();return true},preventDefault:true},
  ])),[onRun,onSubmit]);
  const isPython = kind !== 'sql';
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setDark(document.documentElement.dataset.theme==='dark'||document.documentElement.dataset.theme!=='light'&&media.matches);
    update();
    const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    media.addEventListener('change', update);
    return () => {media.removeEventListener('change', update);observer.disconnect()};
  }, []);
  return <>
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={dark ? oneDark : 'light'}
      extensions={[...(isPython ? pythonExtensions : sqlExtensions),indentationGuides,positionExtension,runKeys]}
      height="clamp(260px, calc(100dvh - 390px), 420px)"
      indentWithTab={!isPython}
      basicSetup={{ autocompletion: !isPython, foldGutter: true, highlightActiveLine: true, tabSize: 4 }}
      aria-label={isPython ? 'Python code editor' : 'SQLite code editor'}
    />
    <div className="editor-position"><span>Ln {position.line}, Col {position.column}</span><span>Indent {position.indent} · 4 spaces</span>{position.selected>0&&<strong>{position.selected} {position.selected===1?'line':'lines'} selected</strong>}</div>
    {onRun&&<div className="editor-shortcuts"><span><kbd>⌘ / Ctrl</kbd> + <kbd>Enter</kbd> run examples</span><span>+ <kbd>Shift</kbd> submit</span></div>}
    {isPython && <div className="editor-shortcuts">
      <span><kbd>Tab</kbd> suggestions</span>
      <span><kbd>↑</kbd><kbd>↓</kbd> choose</span>
      <span><kbd>Enter</kbd> / <kbd>Tab</kbd> insert</span>
      <span><kbd>Esc</kbd> close</span>
    </div>}
  </>;
}
