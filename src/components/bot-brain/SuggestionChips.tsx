import React from 'react'

interface SuggestionChipsProps {
  onSelect: (text: string) => void
}

const SUGGESTIONS = [
  "Make it friendlier",
  "Add a 10% first-order discount",
  "Reply in Hindi and English",
  "Keep answers very short"
]

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1 mb-3">
      {SUGGESTIONS.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(suggestion)}
          className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-700 hover:border-purple-500/50 transition-all active:scale-95 whitespace-nowrap"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
