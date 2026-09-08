'use client';
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
  return <>
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={oneDark}
      extensions={isPython ? pythonExtensions : sqlExtensions}
      height="420px"
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
