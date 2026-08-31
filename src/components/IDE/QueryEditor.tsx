/**
 * QueryEditor.tsx — CodeMirror 6 SQL Editor with Windows 95 styling
 * Features:
 *  - Selection-aware execution (executes selected query if highlighted)
 *  - Strings in quotes -> Distinct Green (#008800)
 *  - Numbers & numerical comparisons -> Distinct Purple (#800080)
 *  - Comparison operators (=, >, <, >=, <=, !=) -> Bold Crimson (#b00020)
 *  - SQL Keywords -> Classic Navy Blue (#000080)
 *  - Functions & Aggregates -> Deep Blue-Teal (#005a9c)
 */

import React, { useEffect, useRef } from 'react';
import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, Decoration, DecorationSet } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { sql, MySQL, PostgreSQL, SQLite, MSSQL } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

export interface SqlErrorLocation {
  line: number;
  col?: number;
  message: string;
}

interface QueryEditorProps {
  value:              string;
  onChange:           (value: string) => void;
  onRun:              (queryToRun?: string) => void;
  dialect:            string;
  onSelectionChange?: (hasSelection: boolean, selectedText: string) => void;
  onCursorChange?:    (line: number, col: number) => void;
  schemaTables?:      Record<string, string[]>;
  errorLocation?:     SqlErrorLocation | null;
}

// Custom Windows 95 IDE Syntax Theme
const win95SqlHighlightStyle = HighlightStyle.define([
  // 1. Strings enclosed in single or double quotes -> Vibrant Green
  {
    tag: [tags.string, tags.special(tags.string), tags.character],
    color: '#008800',
    fontWeight: '500',
  },

  // 2. Numbers, Integers, Decimals (for numeric comparison/values) -> Distinct Purple
  {
    tag: [tags.number, tags.integer, tags.float],
    color: '#800080',
    fontWeight: 'bold',
  },

  // 3. Comparison & Logical Operators (=, >, <, >=, <=, !=, LIKE, IN, AND, OR) -> Bold Crimson
  {
    tag: [tags.compareOperator, tags.arithmeticOperator, tags.logicOperator],
    color: '#b00020',
    fontWeight: 'bold',
  },

  // 4. SQL Keywords (SELECT, FROM, WHERE, JOIN, ON, GROUP BY, ORDER BY, etc.) -> Classic Bold Navy
  {
    tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword],
    color: '#000080',
    fontWeight: 'bold',
  },

  // 5. Functions & Aggregates (AVG, COUNT, SUM, MAX, MIN, etc.) -> Deep Blue-Teal
  {
    tag: [tags.function(tags.variableName), tags.standard(tags.variableName)],
    color: '#005a9c',
    fontWeight: 'bold',
  },

  // 6. Data Types (VARCHAR, INT, DATE, NUMERIC, etc.) -> Bold Navy
  {
    tag: tags.typeName,
    color: '#000080',
    fontWeight: 'bold',
  },

  // 7. Comments (-- or /* ... */) -> Muted Grey-Green Italic
  {
    tag: [tags.comment, tags.lineComment, tags.blockComment],
    color: '#6a737d',
    fontStyle: 'italic',
  },

  // 8. Punctuation, commas, semicolons, brackets
  {
    tag: [tags.punctuation, tags.bracket],
    color: '#24292e',
  },
]);

// Custom StateEffect & StateField for rendering inline SQL error squiggles
const setErrorDecorationEffect = StateEffect.define<SqlErrorLocation | null>();

const errorDecorationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setErrorDecorationEffect)) {
        if (!e.value || e.value.line <= 0) {
          return Decoration.none;
        }
        const { line: lineNum, col = 1, message } = e.value;
        const doc = tr.state.doc;
        const safeLineNum = Math.min(doc.lines, Math.max(1, lineNum));
        const lineObj = doc.line(safeLineNum);
        const from = Math.min(lineObj.to, lineObj.from + Math.max(0, col - 1));
        const to = Math.max(from + 1, lineObj.to);

        const mark = Decoration.mark({
          class: 'cm-sql-error-squiggle',
          attributes: { title: `Syntax Error: ${message}` },
        });
        return Decoration.set([mark.range(from, to)]);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

export const QueryEditor: React.FC<QueryEditorProps> = ({
  value,
  onChange,
  onRun,
  dialect,
  onSelectionChange,
  onCursorChange,
  schemaTables,
  errorLocation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Keep latest handlers in refs for keymap and listeners
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;
  const onCursorChangeRef = useRef(onCursorChange);
  onCursorChangeRef.current = onCursorChange;

  const getSqlDialectExtension = (d: string, schema?: Record<string, string[]>) => {
    const config = schema && Object.keys(schema).length > 0 ? { schema } : {};
    switch (d) {
      case 'PostgreSQL':
        return sql({ dialect: PostgreSQL, ...config });
      case 'SQLite':
        return sql({ dialect: SQLite, ...config });
      case 'TransactSQL':
      case 'SSMS':
        return sql({ dialect: MSSQL, ...config });
      case 'MySQL':
      default:
        return sql({ dialect: MySQL, ...config });
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const runCommand = () => {
      if (viewRef.current) {
        const sel = viewRef.current.state.selection.main;
        if (!sel.empty) {
          const selectedText = viewRef.current.state.sliceDoc(sel.from, sel.to).trim();
          if (selectedText.length > 0) {
            onRunRef.current(selectedText);
            return true;
          }
        }
      }
      onRunRef.current();
      return true;
    };

    const customKeymap = keymap.of([
      { key: 'Ctrl-Enter', run: runCommand },
      { key: 'F5', run: runCommand },
      ...defaultKeymap,
      ...historyKeymap,
    ]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
      if (update.selectionSet || update.docChanged) {
        const sel = update.state.selection.main;
        const isSelected = !sel.empty;
        const txt = isSelected ? update.state.sliceDoc(sel.from, sel.to).trim() : '';
        onSelectionChangeRef.current?.(Boolean(txt), txt);

        const pos = sel.head;
        const line = update.state.doc.lineAt(pos);
        const col = pos - line.from + 1;
        onCursorChangeRef.current?.(line.number, col);
      }
    });

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        getSqlDialectExtension(dialect, schemaTables),
        syntaxHighlighting(win95SqlHighlightStyle),
        errorDecorationField,
        customKeymap,
        updateListener,
        EditorView.theme({
          '&': { height: '100%', backgroundColor: 'var(--w95-editor-bg, #ffffff)', color: 'var(--w95-editor-text, #000000)' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--w95-mono)', fontSize: '13px' },
          '.cm-content': { caretColor: 'var(--w95-editor-text, #000000)' },
          '.cm-activeLine': { backgroundColor: 'rgba(0, 0, 128, 0.12)' },
          '.cm-activeLineGutter': { backgroundColor: 'var(--w95-gray, #d4d0c8)', fontWeight: 'bold' },
          '.cm-gutters': { backgroundColor: 'var(--w95-gray, #ece9d8)', borderRight: '1px solid var(--w95-dark-gray, #999)', color: 'var(--w95-dark-gray, #555)' },
          '.cm-sql-error-squiggle': { textDecoration: 'underline wavy #d00000 2px', textDecorationSkipInk: 'none', backgroundColor: 'rgba(255, 0, 0, 0.12)' },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [dialect, schemaTables]);

  // Sync inline error squiggles on result/error changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      effects: setErrorDecorationEffect.of(errorLocation || null),
    });
  }, [errorLocation]);

  // Update doc if changed externally
  useEffect(() => {
    const view = viewRef.current;
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="win95-inset"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    />
  );
};
