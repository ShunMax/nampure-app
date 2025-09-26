import { useEffect } from 'react'
import './index.css'
import { Board } from './components/Board'
import { NumberPad } from './components/NumberPad'
import { Toolbar } from './components/Toolbar'
// StatusBar removed from layout; kept for potential future use
import { useSudoku } from './sudoku/useSudoku'
import { getElapsedMs } from './sudoku/state'

function App() {
  const [state, actions, dispatch] = useSudoku()

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [dispatch])

  const handleInput = (n: number) => {
    if (state.notesMode) actions.toggleNoteAt(n)
    else actions.inputNumber(n)
  }

  if (!state) {
    return <div>読み込み中...</div>
  }

  // 残数計算は現UIで未使用

  return (
    <div className="app">
      <Toolbar onCheck={actions.check} onUndo={actions.undo} onRedo={actions.redo} />
      <div className="main sudoku-main">
        <Board
          grid={state.grid}
          notes={state.notes}
          given={state.given}
          errors={state.errors}
          selectedIndex={state.selectedIndex}
          onSelect={actions.select}
          showNotes={state.showNotes}
        />
        <div className="side-panel">
          <div className="panel-section">
            <NumberPad onInput={handleInput} onClear={actions.clearCell} onToggleNotes={actions.toggleNotesMode} notesMode={state.notesMode} />
          </div>
          <div className="panel-section panel-actions" style={{ display: 'none' }} />
          <div className="panel-status">
            <div className="status-item">タイマー: {Math.floor(getElapsedMs(state)/1000/60)}:{String(Math.floor(getElapsedMs(state)/1000)%60).padStart(2,'0')}</div>
            <div className="status-item">手数: {state.moveCount}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
