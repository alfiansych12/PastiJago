// lib/themes/custom-dark.ts
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';

export const customDarkTheme: Extension = EditorView.theme({
  "&": {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    height: "100%"
  },
  ".cm-content": {
    caretColor: "#f59e0b"
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "#f59e0b"
  },
  ".cm-line": {
    padding: "0 4px"
  },
  ".cm-gutters": {
    backgroundColor: "#0f172a",
    color: "#64748b",
    border: "none"
  },
  ".cm-activeLine": {
    backgroundColor: "#1e293b"
  },
  ".cm-selectionMatch": {
    backgroundColor: "#334155"
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "#334155"
  },
}, { dark: true });