import React from 'react'

interface CellProps {
  value: number
  notesMask: number
  given: boolean
  selected: boolean
  error: boolean
  onClick: () => void
  peer?: boolean
  same?: boolean
  showNotes?: boolean
}

export const Cell: React.FC<CellProps> = ({ value, notesMask, given, selected, error, onClick, peer = false, same = false, showNotes = false }) => {
  const className = [
    'cell',
    given ? 'given' : 'editable',
    selected ? 'selected' : '',
    error ? 'error' : '',
    peer ? 'peer' : '',
    same ? 'same' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={className} onClick={onClick} aria-label={given ? `固定: ${value}` : value ? `${value}` : '空'}>
      {value !== 0 || !showNotes ? (
        <span className="val">{value !== 0 ? value : ''}</span>
      ) : (
        <div className="notes">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <span key={n} className={notesMask & (1 << (n - 1)) ? 'note on' : 'note'}>
              {n}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}



