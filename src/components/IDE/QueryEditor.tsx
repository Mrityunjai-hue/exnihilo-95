/**
 * QueryEditor.tsx — CodeMirror 6 SQL Editor with Windows 95 styling
 */

import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { sql } from '@codemirror/lang-sql';

interface QueryEditorProps {
  value:     string;
  onChange:  (value: string) => void;
  onRun:     () => void;
  dialect:   string;
}

export const QueryEditor: React.FC<QueryEditorProps> = ({
  value,
  onChange,
  onRun,
  dialect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Keep latest onRun & onChange in refs for keymap
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const runCommand = () => {
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
    });

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        sql(),
        customKeymap,
        updateListener,
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--w95-mono)', fontSize: '13px' },
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
  }, []);

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
