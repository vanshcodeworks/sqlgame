import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { sql } from '@codemirror/lang-sql'
import { oneDark } from '@codemirror/theme-one-dark'
import { autocompletion } from '@codemirror/autocomplete'
import styles from './SqlEditor.module.css'

interface Props {
  initialQuery: string
  loading: boolean
  onRun: (query: string) => void
}

export function SqlEditor({ initialQuery, loading, onRun }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  // Stable ref avoids recreating the editor when parent re-renders
  const onRunRef = useRef(onRun)
  useEffect(() => {
    onRunRef.current = onRun
  }, [onRun])

  useEffect(() => {
    if (!containerRef.current) return

    const view = new EditorView({
      state: EditorState.create({
        doc: initialQuery,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          history(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            {
              key: 'Ctrl-Enter',
              mac: 'Cmd-Enter',
              run: () => {
                onRunRef.current(view.state.doc.toString())
                return true
              }
            }
          ]),
          sql(),
          oneDark,
          autocompletion(),
          EditorView.theme({
            '&': { height: '100%' },
            '.cm-scroller': {
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
              lineHeight: '1.6'
            },
            '.cm-focused': { outline: 'none' },
            '.cm-editor': { height: '100%' }
          })
        ]
      }),
      parent: containerRef.current
    })

    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [initialQuery]) // remounts per level via the parent's key; no user edits are lost

  function handleRun() {
    if (viewRef.current) {
      onRunRef.current(viewRef.current.state.doc.toString())
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <span className={styles.label}>SQL Editor</span>
        <span className={styles.shortcut}>Ctrl+Enter to run</span>
        <button
          className={styles.runButton}
          onClick={handleRun}
          disabled={loading}
        >
          {loading ? 'Loading...' : '▶ Run'}
        </button>
      </div>
      <div ref={containerRef} className={styles.editorContainer} />
    </div>
  )
}
