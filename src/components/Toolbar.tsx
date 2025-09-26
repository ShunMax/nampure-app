import React from 'react'
import type { Difficulty } from '../sudoku/types'

interface ToolbarProps {
  onNew: (d: Difficulty) => void
  onCheck: () => void
  onUndo: () => void
  onRedo: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ onNew, onCheck, onUndo, onRedo }) => {
  return (
    <header className="sudoku-header">
      <div className="header-group">
        <span className="group-label" aria-hidden="true">New</span>
        <button className="btn" onClick={() => onNew('easy')}>Easy</button>
        <button className="btn" onClick={() => onNew('medium')}>Medium</button>
        <button className="btn" onClick={() => onNew('hard')}>Hard</button>
      </div>
      <div className="header-group">
        <button className="btn" onClick={onUndo}>Undo</button>
        <button className="btn" onClick={onRedo}>Redo</button>
        <button className="btn btn--primary" onClick={onCheck}>チェック</button>
      </div>
    </header>
  )
}



