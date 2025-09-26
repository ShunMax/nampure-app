export type Difficulty = 'easy' | 'medium' | 'hard'

export type Grid = number[] // length 81, 0 means empty

export type NotesBitmask = number[] // length 81, 9-bit bitmask for notes (bit 0 => 1, bit 8 => 9)

export interface PresetPuzzle {
  id: string
  difficulty: Difficulty
  puzzle: string // 81 chars, '0' or '.' for empty
  solution: string // 81 digits
}

export interface HistoryEntry {
  grid: Grid
  notes: NotesBitmask
  moveCount: number
}

export interface SudokuState {
  puzzleId: string
  difficulty: Difficulty
  given: boolean[] // length 81
  puzzle: Grid
  solution: Grid
  grid: Grid
  notes: NotesBitmask
  showNotes: boolean
  errors: boolean[] // length 81
  selectedIndex: number | null
  notesMode: boolean
  autoNotes: boolean
  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]
  moveCount: number
  // timer
  startedAt: number | null
  elapsedMsAccum: number // accumulated when paused
  running: boolean
}

export interface SudokuActions {
  newGame: (difficulty: Difficulty) => void
  select: (index: number | null) => void
  inputNumber: (value: number) => void
  toggleNoteAt: (value: number) => void
  clearCell: () => void
  toggleNotesMode: () => void
  toggleAutoNotes: () => void
  toggleShowNotes: () => void
  undo: () => void
  redo: () => void
  reset: () => void
  solve: () => void
  check: () => void
  hint: () => void
}

export const NUM_CELLS = 81
export const SIZE = 9

export function rcToIndex(row: number, col: number): number {
  return row * SIZE + col
}

export function indexToRC(index: number): { row: number; col: number } {
  const row = Math.floor(index / SIZE)
  const col = index % SIZE
  return { row, col }
}

export function boxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}

export function isDigitValid(value: number): boolean {
  return value >= 1 && value <= 9
}

export function toNotesBit(noteValue: number): number {
  if (!isDigitValid(noteValue)) return 0
  return 1 << (noteValue - 1)
}

export function hasNoteBit(mask: number, noteValue: number): boolean {
  return (mask & toNotesBit(noteValue)) !== 0
}

export function toggleNoteBit(mask: number, noteValue: number): number {
  return mask ^ toNotesBit(noteValue)
}



