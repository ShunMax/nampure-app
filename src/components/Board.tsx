import React from 'react'
import { Cell } from './Cell'
import { NUM_CELLS, SIZE } from '../sudoku/types'

interface BoardProps {
  grid: number[]
  notes: number[]
  given: boolean[]
  errors: boolean[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  showNotes?: boolean
}

export const Board: React.FC<BoardProps> = ({ grid, notes, given, errors, selectedIndex, onSelect, showNotes }) => {
  const selectedVal = selectedIndex != null ? grid[selectedIndex] : 0
  return (
    <div className="board" role="grid" aria-label="数独 9x9">
      {Array.from({ length: NUM_CELLS }, (_, i) => {
        const isSelected = selectedIndex === i
        const isPeer = selectedIndex != null && (Math.floor(selectedIndex / SIZE) === Math.floor(i / SIZE) || selectedIndex % SIZE === i % SIZE || Math.floor(Math.floor(selectedIndex / SIZE) / 3) * 3 + Math.floor((selectedIndex % SIZE) / 3) === Math.floor(Math.floor(i / SIZE) / 3) * 3 + Math.floor((i % SIZE) / 3))
        const isSame = selectedVal !== 0 && grid[i] === selectedVal
        const cls = [
          'cell-wrap',
          i % SIZE === 0 ? 'left' : '',
          Math.floor(i / SIZE) % 3 === 0 && i < SIZE * 9 ? 'top' : '',
          (i + 1) % 3 === 0 ? 'box-v' : '',
          Math.floor(i / SIZE) % 3 === 2 ? 'box-h' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div key={i} className={cls} role="gridcell">
            <Cell
              value={grid[i]}
              notesMask={notes[i]}
              given={given[i]}
              selected={isSelected}
              error={errors[i]}
              onClick={() => onSelect(i)}
              peer={isPeer && !isSelected}
              same={isSame}
              showNotes={!!showNotes}
            />
          </div>
        )
      })}
    </div>
  )
}



