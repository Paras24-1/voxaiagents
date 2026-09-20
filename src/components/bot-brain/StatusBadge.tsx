import React from 'react'

interface StatusBadgeProps {
  status: 'live' | 'saving' | 'updated' | 'error' | 'idle'
  label?: string
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  if (status === 'idle') return null

  const config = {
    live: {
      dot: 'bg-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      label: label || 'LIVE PREVIEW',
      pulse: true
    },
    saving: {
      dot: 'bg-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      label: label || 'SAVING...',
      pulse: true
    },
    updated: {
      dot: 'bg-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      label: label || 'PROMPT UPDATED',
      pulse: false
    },
    error: {
      dot: 'bg-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      label: label || 'ERROR',
      pulse: false
    }
  }

  const active = config[status]

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md ${active.bg} ${active.border} border`}>
      <div className={`w-2 h-2 rounded-full ${active.dot} ${active.pulse ? 'animate-pulse' : ''}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active.text}`}>
        {active.label}
      </span>
    </div>
  )
}
