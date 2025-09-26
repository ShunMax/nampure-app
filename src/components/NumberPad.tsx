import React from 'react'

interface NumberPadProps {
  onInput: (n: number) => void
  onClear: () => void
  onToggleNotes: () => void
  notesMode: boolean
}

export const NumberPad: React.FC<NumberPadProps> = ({ onInput, onClear, onToggleNotes, notesMode }) => {
  return (
    <div className="number-pad" role="group" aria-label="数字パッド">
      <div className="digits">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button key={n} className="pad-btn" onClick={() => onInput(n)} aria-label={`${n}`}>
            <span className="pad-num">{n}</span>
          </button>
        ))}
      </div>
      <div className="pad-actions">
        <button className="pad-btn" onClick={onClear} aria-label="消去">
          消去
        </button>
        <button className={`pad-btn ${notesMode ? 'on' : ''}`} onClick={onToggleNotes} aria-label="メモ">
          メモ
        </button>
      </div>
    </div>
  )
}



