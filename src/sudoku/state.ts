import { NUM_CELLS } from './types'
import type { Difficulty, HistoryEntry, NotesBitmask, SudokuState } from './types'
import { buildGivenFromPuzzle, cloneGrid, computeErrors, getHintFromSolution, parseGridString, solve, pruneNotesForPlacement } from './utils'
import { PRESETS } from './presets'

function emptyNotes(): NotesBitmask {
  return new Array(NUM_CELLS).fill(0)
}

// initial state is created via NEW_GAME action on mount

export type Action =
  | { type: 'NEW_GAME'; difficulty: Difficulty; presetId?: string }
  | { type: 'SELECT'; index: number | null }
  | { type: 'INPUT'; value: number }
  | { type: 'TOGGLE_NOTE'; value: number }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE_NOTES_MODE' }
  | { type: 'TOGGLE_AUTO_NOTES' }
  | { type: 'TOGGLE_SHOW_NOTES' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }
  | { type: 'SOLVE' }
  | { type: 'CHECK' }
  | { type: 'HINT' }
  | { type: 'TICK' }

function pushUndo(state: SudokuState): SudokuState {
  const snapshot: HistoryEntry = {
    grid: cloneGrid(state.grid),
    notes: [...state.notes],
    moveCount: state.moveCount,
  }
  return { ...state, undoStack: [...state.undoStack, snapshot], redoStack: [] }
}

function popUndo(state: SudokuState): SudokuState {
  if (state.undoStack.length === 0) return state
  const last = state.undoStack[state.undoStack.length - 1]
  const redo: HistoryEntry = {
    grid: cloneGrid(state.grid),
    notes: [...state.notes],
    moveCount: state.moveCount,
  }
  const undone = { ...state, grid: cloneGrid(last.grid), notes: [...last.notes], moveCount: last.moveCount }
  undone.errors = computeErrors(undone.grid)
  return { ...undone, undoStack: state.undoStack.slice(0, -1), redoStack: [...state.redoStack, redo] }
}

function popRedo(state: SudokuState): SudokuState {
  if (state.redoStack.length === 0) return state
  const last = state.redoStack[state.redoStack.length - 1]
  const undo: HistoryEntry = {
    grid: cloneGrid(state.grid),
    notes: [...state.notes],
    moveCount: state.moveCount,
  }
  const redone = { ...state, grid: cloneGrid(last.grid), notes: [...last.notes], moveCount: last.moveCount }
  redone.errors = computeErrors(redone.grid)
  return { ...redone, redoStack: state.redoStack.slice(0, -1), undoStack: [...state.undoStack, undo] }
}

function choosePreset(difficulty: Difficulty, presetId?: string) {
  const list = PRESETS.filter((p) => p.difficulty === difficulty)
  const chosen = presetId ? PRESETS.find((p) => p.id === presetId) ?? list[0] : list[Math.floor(Math.random() * list.length)]
  const puzzle = parseGridString(chosen.puzzle)
  const solution = (() => {
    try {
      return parseGridString(chosen.solution)
    } catch {
      return solve(puzzle) ?? cloneGrid(puzzle)
    }
  })()
  return { chosenId: chosen.id, puzzle, solution }
}

export function reducer(state: SudokuState, action: Action): SudokuState {
  switch (action.type) {
    case 'NEW_GAME': {
      const { chosenId, puzzle, solution } = choosePreset(action.difficulty, action.presetId)
      const given = buildGivenFromPuzzle(puzzle)
      return {
        puzzleId: chosenId,
        difficulty: action.difficulty,
        given,
        puzzle,
        solution,
        grid: cloneGrid(puzzle),
        notes: emptyNotes(),
        showNotes: state.showNotes,
        errors: new Array<boolean>(NUM_CELLS).fill(false),
        selectedIndex: null,
        notesMode: false,
        autoNotes: state.autoNotes,
        undoStack: [],
        redoStack: [],
        moveCount: 0,
        startedAt: Date.now(),
        elapsedMsAccum: 0,
        running: true,
      }
    }
    case 'SELECT': {
      return { ...state, selectedIndex: action.index }
    }
    case 'INPUT': {
      if (state.selectedIndex === null) return state
      const i = state.selectedIndex
      if (state.given[i]) return state
      const next = pushUndo(state)
      const grid = cloneGrid(next.grid)
      grid[i] = action.value
      const errors = computeErrors(grid)
      const notes = next.autoNotes ? pruneNotesForPlacement(next.notes, i, action.value) : next.notes
      return { ...next, grid, notes, errors, moveCount: next.moveCount + 1 }
    }
    case 'TOGGLE_NOTE': {
      if (state.selectedIndex === null) return state
      const i = state.selectedIndex
      if (state.given[i]) return state
      const next = pushUndo(state)
      const notes = [...next.notes]
      const bit = 1 << (action.value - 1)
      notes[i] = notes[i] ^ bit
      return { ...next, notes, moveCount: next.moveCount + 1 }
    }
    case 'CLEAR': {
      if (state.selectedIndex === null) return state
      const i = state.selectedIndex
      if (state.given[i]) return state
      const next = pushUndo(state)
      const grid = cloneGrid(next.grid)
      grid[i] = 0
      const errors = computeErrors(grid)
      const notes = [...next.notes]
      notes[i] = 0
      return { ...next, grid, errors, notes, moveCount: next.moveCount + 1 }
    }
    case 'TOGGLE_NOTES_MODE': {
      return { ...state, notesMode: !state.notesMode }
    }
    case 'TOGGLE_SHOW_NOTES': {
      return { ...state, showNotes: !state.showNotes }
    }
    case 'UNDO':
      return popUndo(state)
    case 'REDO':
      return popRedo(state)
    case 'RESET': {
      const grid = cloneGrid(state.puzzle)
      return { ...state, grid, errors: new Array<boolean>(NUM_CELLS).fill(false), notes: emptyNotes(), undoStack: [], redoStack: [], moveCount: 0 }
    }
    case 'SOLVE': {
      const solved = solve(state.grid)
      if (!solved) return state
      return { ...state, grid: solved, errors: new Array<boolean>(NUM_CELLS).fill(false) }
    }
    case 'CHECK': {
      const errors = computeErrors(state.grid)
      return { ...state, errors }
    }
    case 'HINT': {
      const hint = getHintFromSolution(state.grid, state.solution)
      if (!hint) return state
      const next = pushUndo(state)
      const grid = cloneGrid(next.grid)
      grid[hint.index] = hint.value
      const errors = computeErrors(grid)
      const notes = next.autoNotes ? pruneNotesForPlacement(next.notes, hint.index, hint.value) : next.notes
      return { ...next, grid, notes, errors, moveCount: next.moveCount + 1 }
    }
    case 'TICK': {
      if (!state.running || state.startedAt === null) return state
      return { ...state }
    }
    case 'TOGGLE_AUTO_NOTES': {
      return { ...state, autoNotes: !state.autoNotes }
    }
    default:
      return state
  }
}

export function getElapsedMs(state: SudokuState): number {
  if (state.running && state.startedAt != null) {
    return state.elapsedMsAccum + (Date.now() - state.startedAt)
  }
  return state.elapsedMsAccum
}



