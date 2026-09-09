'use client';
import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python, pythonLanguage } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';
import { Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentLess } from '@codemirror/commands';
import { notebookTab, pythonKeywords } from './notebook-completion.mjs';

const pythonExtensions = [
  python(),
  pythonLanguage.data.of({ autocomplete: pythonKeywords }),
  autocompletion({ activateOnTyping: false, interactionDelay: 0 }),
  Prec.highest(keymap.of([
    { key: 'Tab', run: notebookTab, preventDefault: true },
    { key: 'Shift-Tab', run: indentLess, preventDefault: true },
  ])),
];
const sqlExtensions = [sql()];

export default function Editor({ value, onChange, kind }: {
  value: string; onChange: (value: string) => void; kind: string;
}) {
  const isPython = kind !== 'sql';
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setDark(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return <>
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={dark ? oneDark : 'light'}
      extensions={isPython ? pythonExtensions : sqlExtensions}
      height="clamp(260px, calc(100dvh - 390px), 420px)"
      indentWithTab={!isPython}
      basicSetup={{ autocompletion: !isPython, foldGutter: true, highlightActiveLine: true, tabSize: 4 }}
      aria-label={isPython ? 'Python code editor' : 'SQLite code editor'}
    />
    {isPython && <div className="editor-shortcuts">
      <span><kbd>Tab</kbd> suggestions</span>
      <span><kbd>↑</kbd><kbd>↓</kbd> choose</span>
      <span><kbd>Enter</kbd> / <kbd>Tab</kbd> insert</span>
      <span><kbd>Esc</kbd> close</span>
    </div>}
  </>;
}
