import { useEffect, useReducer } from 'react'
import { reducer, buildInitialState } from './state'
import type { Action } from './state'
import type { Difficulty, SudokuActions, SudokuState } from './types'

const STORAGE_KEY = 'sudoku-state-v1'

export function useSudoku(): [SudokuState, SudokuActions, React.Dispatch<Action>] {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as SudokuState, buildInitialState as unknown as () => SudokuState)

  // load / bootstrap initial game
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SudokuState
        // rehydrate minimally by dispatching NEW_GAME then applying grid/notes
        dispatch({ type: 'NEW_GAME', difficulty: parsed.difficulty, presetId: parsed.puzzleId })
        // defer to next tick to allow state init
        setTimeout(() => {
          // naive restore: replace grid/notes/moveCount
          dispatch({ type: 'SELECT', index: null })
          // We'll rely on controlled UI that will set values via SOLVE/INPUT/HINT in future improvements
        }, 0)
      } else {
        dispatch({ type: 'NEW_GAME', difficulty: 'easy' })
      }
    } catch {
      // ignore
    }
  }, [])

  // save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // ignore
    }
  }, [state])

  const actions: SudokuActions = {
    newGame: (difficulty: Difficulty) => dispatch({ type: 'NEW_GAME', difficulty }),
    select: (index) => dispatch({ type: 'SELECT', index }),
    inputNumber: (value) => dispatch({ type: 'INPUT', value }),
    toggleNoteAt: (value) => dispatch({ type: 'TOGGLE_NOTE', value }),
    clearCell: () => dispatch({ type: 'CLEAR' }),
    toggleNotesMode: () => dispatch({ type: 'TOGGLE_NOTES_MODE' }),
    toggleAutoNotes: () => dispatch({ type: 'TOGGLE_AUTO_NOTES' }),
    toggleShowNotes: () => dispatch({ type: 'TOGGLE_SHOW_NOTES' }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    reset: () => dispatch({ type: 'RESET' }),
    solve: () => dispatch({ type: 'SOLVE' }),
    check: () => dispatch({ type: 'CHECK' }),
    hint: () => dispatch({ type: 'HINT' }),
  }

  return [state, actions, dispatch]
}



