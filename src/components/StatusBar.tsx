import React from 'react'

interface StatusBarProps {
  elapsedMs: number
  moves: number
}

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export const StatusBar: React.FC<StatusBarProps> = ({ elapsedMs, moves }) => {
  return (
    <div className="status-bar">
      <div>タイマー: {formatTime(elapsedMs)}</div>
      <div>手数: {moves}</div>
    </div>
  )
}









