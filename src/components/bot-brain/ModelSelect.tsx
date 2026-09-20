import React from 'react'

interface ModelSelectProps {
  value?: string
  onChange?: (val: string) => void
  isAdvanced: boolean
  onToggleAdvanced: () => void
}

export default function ModelSelect({ isAdvanced, onToggleAdvanced }: ModelSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggleAdvanced}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
          isAdvanced 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
            : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-700 hover:text-slate-200'
        }`}
      >
        {isAdvanced ? 'Standard UI' : 'Advanced (Raw)'}
      </button>
    </div>
  )
}
