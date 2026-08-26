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
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { sql, MySQL, PostgreSQL, SQLite, MSSQL } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

interface QueryEditorProps {
  value:              string;
  onChange:           (value: string) => void;
  onRun:              (queryToRun?: string) => void;
  dialect:            string;
  onSelectionChange?: (hasSelection: boolean, selectedText: string) => void;
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

export const QueryEditor: React.FC<QueryEditorProps> = ({
  value,
  onChange,
  onRun,
  dialect,
  onSelectionChange,
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

  const getSqlDialectExtension = (d: string) => {
    switch (d) {
      case 'PostgreSQL':
        return sql({ dialect: PostgreSQL });
      case 'SQLite':
        return sql({ dialect: SQLite });
      case 'TransactSQL':
      case 'SSMS':
        return sql({ dialect: MSSQL });
      case 'MySQL':
      default:
        return sql({ dialect: MySQL });
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
      }
    });

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        getSqlDialectExtension(dialect),
        syntaxHighlighting(win95SqlHighlightStyle),
        customKeymap,
        updateListener,
        EditorView.theme({
          '&': { height: '100%', backgroundColor: 'var(--w95-editor-bg, #ffffff)', color: 'var(--w95-editor-text, #000000)' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--w95-mono)', fontSize: '13px' },
          '.cm-content': { caretColor: 'var(--w95-editor-text, #000000)' },
          '.cm-activeLine': { backgroundColor: 'rgba(0, 0, 128, 0.12)' },
          '.cm-activeLineGutter': { backgroundColor: 'var(--w95-gray, #d4d0c8)', fontWeight: 'bold' },
          '.cm-gutters': { backgroundColor: 'var(--w95-gray, #ece9d8)', borderRight: '1px solid var(--w95-dark-gray, #999)', color: 'var(--w95-dark-gray, #555)' },
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
  }, [dialect]);

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
