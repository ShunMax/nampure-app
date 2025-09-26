import React from 'react'
import type { Difficulty } from '../sudoku/types'

interface ToolbarProps {
  onCheck: () => void
  onUndo: () => void
  onRedo: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ onCheck, onUndo, onRedo }) => {
  return (
    <header className="sudoku-header">
      <div className="header-group">
        <button className="btn" onClick={onUndo}>Undo</button>
        <button className="btn" onClick={onRedo}>Redo</button>
        <button className="btn btn--primary" onClick={onCheck}>チェック</button>
      </div>
    </header>
  )
}



