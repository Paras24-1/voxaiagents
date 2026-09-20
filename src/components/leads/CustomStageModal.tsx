'use client'

import React, { useState } from 'react'
import { X, Plus, Trash2, Tag, Loader2, Sparkles, Check } from 'lucide-react'
import { LeadStage } from '@/hooks/useLeadStages'

interface CustomStageModalProps {
  isOpen: boolean
  onClose: () => void
  stages: LeadStage[]
  customStages: LeadStage[]
  onAddStage: (label: string, color?: string) => Promise<any>
  onDeleteStage: (name: string) => Promise<any>
}

const COLOR_OPTIONS = [
  { label: 'Purple', value: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50' },
  { label: 'Emerald', value: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50' },
  { label: 'Blue', value: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50' },
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50' },
  { label: 'Amber', value: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50' },
  { label: 'Rose', value: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50' },
  { label: 'Cyan', value: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/50' },
  { label: 'Teal', value: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/50' }
]

export default function CustomStageModal({
  isOpen,
  onClose,
  stages,
  customStages,
  onAddStage,
  onDeleteStage
}: CustomStageModalProps) {
  const [newLabel, setNewLabel] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value)
  const [loading, setLoading] = useState(false)
  const [deletingName, setDeletingName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabel.trim()) return

    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await onAddStage(newLabel.trim(), selectedColor)
      setNewLabel('')
      setSuccessMsg('New stage added successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to add custom stage')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm('Are you sure you want to delete this custom stage?')) return
    setDeletingName(name)
    setError(null)

    try {
      await onDeleteStage(name)
    } catch (err: any) {
      setError(err.message || 'Failed to delete custom stage')
    } finally {
      setDeletingName(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Tenant Lead Stages</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Custom stages created here are strictly visible to your organization only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {/* Add Stage Form */}
        <form onSubmit={handleAdd} className="space-y-4 bg-gray-50 dark:bg-gray-950/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Create Custom Stage
          </h4>
          
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-500">Stage Name / Label</label>
            <input
              type="text"
              placeholder="e.g. Demo Scheduled, Proposal Sent, Followup 2..."
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-500">Badge Color Theme</label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all text-center ${c.value} ${
                    selectedColor === c.value ? 'ring-2 ring-emerald-500 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newLabel.trim()}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add Custom Stage</span>
          </button>
        </form>

        {/* Existing Custom Stages List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Your Organization&apos;s Custom Stages ({customStages.length})
          </h4>

          {customStages.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2">No custom stages created yet. Add one above!</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {customStages.map((cs) => (
                <div
                  key={cs.name}
                  className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl"
                >
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cs.color}`}>
                    {cs.label}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(cs.name)}
                    disabled={deletingName === cs.name}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                    title="Delete stage"
                  >
                    {deletingName === cs.name ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
