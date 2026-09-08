import { acceptCompletion, completionStatus, startCompletion, completeFromList, ifNotIn } from '@codemirror/autocomplete';
import { indentMore } from '@codemirror/commands';

// A leading Tab indents. After code, Tab requests the Python language's
// scope-aware names, builtins and keywords. An open list accepts its selection.
export function notebookTab(view) {
  const status = completionStatus(view.state);
  if (status === 'active') return acceptCompletion(view);
  if (status === 'pending') return true;
  const { main } = view.state.selection;
  const before = view.state.sliceDoc(view.state.doc.lineAt(main.head).from, main.head);
  if (!main.empty || /^\s*$/.test(before)) return indentMore(view);
  return startCompletion(view);
}

export const pythonKeywords = ifNotIn(['String', 'FormatString', 'Comment', 'PropertyName'], completeFromList(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'.split(' ').map(label => ({label, type: 'keyword'}))
));
