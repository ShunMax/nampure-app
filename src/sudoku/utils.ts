import { GRID_SIZE_ERROR } from './validators'
import { NUM_CELLS, SIZE, indexToRC, isDigitValid } from './types'
import type { Grid, PresetPuzzle } from './types'

export function parseGridString(input: string): Grid {
  const cleaned = input.replace(/\./g, '0').trim()
  if (cleaned.length !== NUM_CELLS) throw new Error(GRID_SIZE_ERROR)
  const grid: number[] = new Array(NUM_CELLS)
  for (let i = 0; i < NUM_CELLS; i++) {
    const ch = cleaned[i]
    const num = ch >= '1' && ch <= '9' ? Number(ch) : 0
    grid[i] = num
  }
  return grid
}

export function gridToString(grid: Grid): string {
  return grid.map((v) => (v === 0 ? '0' : String(v))).join('')
}

export function cloneGrid(grid: Grid): Grid {
  return [...grid]
}

export function buildGivenFromPuzzle(puzzle: Grid): boolean[] {
  return puzzle.map((v) => v !== 0)
}

export function isPlacementValid(grid: Grid, index: number, value: number): boolean {
  if (!isDigitValid(value)) return false
  const { row, col } = indexToRC(index)
  // row
  for (let c = 0; c < SIZE; c++) {
    const i = row * SIZE + c
    if (i !== index && grid[i] === value) return false
  }
  // col
  for (let r = 0; r < SIZE; r++) {
    const i = r * SIZE + col
    if (i !== index && grid[i] === value) return false
  }
  // box
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      const i = r * SIZE + c
      if (i !== index && grid[i] === value) return false
    }
  }
  return true
}

export function computeErrors(grid: Grid): boolean[] {
  const errors = new Array<boolean>(NUM_CELLS).fill(false)
  for (let i = 0; i < NUM_CELLS; i++) {
    const v = grid[i]
    if (v === 0) continue
    if (!isPlacementValid(grid.map((x, idx) => (idx === i ? 0 : x)), i, v)) {
      errors[i] = true
    }
  }
  return errors
}

export function getCandidates(grid: Grid, index: number): number[] {
  if (grid[index] !== 0) return []
  const candidates: number[] = []
  for (let v = 1; v <= 9; v++) {
    if (isPlacementValid(grid, index, v)) candidates.push(v)
  }
  return candidates
}

export function pruneNotesForPlacement(notes: number[], index: number, value: number): number[] {
  const next = [...notes]
  const { row, col } = indexToRC(index)
  const bit = 1 << (value - 1)
  // row
  for (let c = 0; c < SIZE; c++) {
    const i = row * SIZE + c
    next[i] = next[i] & ~bit
  }
  // col
  for (let r = 0; r < SIZE; r++) {
    const i = r * SIZE + col
    next[i] = next[i] & ~bit
  }
  // box
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      const i = r * SIZE + c
      next[i] = next[i] & ~bit
    }
  }
  return next
}

export function isSolved(grid: Grid): boolean {
  for (let i = 0; i < NUM_CELLS; i++) {
    const v = grid[i]
    if (!isDigitValid(v)) return false
    if (!isPlacementValid(grid.map((x, idx) => (idx === i ? 0 : x)), i, v)) return false
  }
  return true
}

function findEmptyWithFewestCandidates(grid: Grid): number | null {
  let bestIndex: number | null = null
  let bestCount = 10
  for (let i = 0; i < NUM_CELLS; i++) {
    if (grid[i] === 0) {
      const cands = getCandidates(grid, i)
      if (cands.length < bestCount) {
        bestCount = cands.length
        bestIndex = i
        if (bestCount <= 1) break
      }
    }
  }
  return bestIndex
}

export function solve(grid: Grid): Grid | null {
  const work = cloneGrid(grid)
  function backtrack(): boolean {
    const idx = findEmptyWithFewestCandidates(work)
    if (idx === null) return true
    const cands = getCandidates(work, idx)
    for (const v of cands) {
      work[idx] = v
      if (backtrack()) return true
      work[idx] = 0
    }
    return false
  }
  const ok = backtrack()
  return ok ? work : null
}

export function getHintFromSolution(grid: Grid, solution: Grid): { index: number; value: number } | null {
  // Prefer single-candidate cells
  for (let i = 0; i < NUM_CELLS; i++) {
    if (grid[i] === 0) {
      const cands = getCandidates(grid, i)
      if (cands.length === 1) return { index: i, value: cands[0] }
    }
  }
  // Otherwise reveal one correct cell
  for (let i = 0; i < NUM_CELLS; i++) {
    if (grid[i] === 0 && isDigitValid(solution[i])) {
      return { index: i, value: solution[i] }
    }
  }
  return null
}

export function validatePreset(p: PresetPuzzle): void {
  const puzzle = parseGridString(p.puzzle)
  const solution = parseGridString(p.solution)
  // solution must be solved and satisfy puzzle givens
  if (!isSolved(solution)) throw new Error('Invalid preset solution')
  for (let i = 0; i < NUM_CELLS; i++) {
    if (puzzle[i] !== 0 && puzzle[i] !== solution[i]) {
      throw new Error('Solution does not match puzzle givens')
    }
  }
}



