'use client'

import React, { useState } from 'react'
import { X, Plus, Trash2, Tag, Loader2, Sparkles, Check, SlidersHorizontal, Search, CheckCircle2 } from 'lucide-react'
import { LeadStage } from '@/hooks/useLeadStages'

interface CustomStageModalProps {
  isOpen: boolean
  onClose: () => void
  stages: LeadStage[]
  allStages?: LeadStage[]
  customStages: LeadStage[]
  onAddStage: (label: string, color?: string) => Promise<any>
  onDeleteStage: (name: string) => Promise<any>
  onToggleStage?: (stageName: string, enabled: boolean) => Promise<void>
  onSetDisabledStagesList?: (disabledList: string[]) => Promise<void>
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

// Common niche tags to disable when clicking "Standard CRM Only"
const NICHE_TAGS = ['joined', 'not_joined', 'contact_save', 'contact_not_save', 'unknown', 'not_connected', 'low_budget']

export default function CustomStageModal({
  isOpen,
  onClose,
  stages,
  allStages = stages,
  customStages,
  onAddStage,
  onDeleteStage,
  onToggleStage,
  onSetDisabledStagesList
}: CustomStageModalProps) {
  const [activeTab, setActiveTab] = useState<'visibility' | 'create'>('visibility')
  const [searchQuery, setSearchQuery] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value)
  const [loading, setLoading] = useState(false)
  const [togglingName, setTogglingName] = useState<string | null>(null)
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
      setSuccessMsg('New custom stage created and enabled!')
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
      setSuccessMsg('Stage deleted successfully!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete custom stage')
    } finally {
      setDeletingName(null)
    }
  }

  const handleToggle = async (stageName: string, currentEnabled: boolean) => {
    if (!onToggleStage) return
    setTogglingName(stageName)
    try {
      await onToggleStage(stageName, !currentEnabled)
    } catch (err: any) {
      setError(err.message || 'Failed to update stage visibility')
    } finally {
      setTogglingName(null)
    }
  }

  const handleApplyStandardOnly = async () => {
    if (!onSetDisabledStagesList) return
    setLoading(true)
    try {
      await onSetDisabledStagesList(NICHE_TAGS)
      setSuccessMsg('Applied Standard CRM preset! Niche tags hidden.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to apply preset')
    } finally {
      setLoading(false)
    }
  }

  const handleEnableAll = async () => {
    if (!onSetDisabledStagesList) return
    setLoading(true)
    try {
      await onSetDisabledStagesList([])
      setSuccessMsg('All tags enabled!')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to enable all tags')
    } finally {
      setLoading(false)
    }
  }

  const enabledCount = allStages.filter(s => s.enabled !== false).length
  const filteredAllStages = allStages.filter(s => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return s.label.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  })

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-hidden relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Organization Stages & Tags</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose which tags your team sees in Lead CRM & Chats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('visibility')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'visibility'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tag Visibility ({enabledCount} Active)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>+ Create Custom Tag</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium shrink-0">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 font-medium flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {/* TAB 1: VISIBILITY (SHOW / HIDE TAGS) */}
        {activeTab === 'visibility' && (
          <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
            {/* Quick Actions & Search */}
            <div className="flex items-center justify-between gap-2 shrink-0 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyStandardOnly}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900 text-[11px] font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                  title="Hide niche campaign tags (joined, contact_save, etc.) and keep only core standard tags"
                >
                  Standard Only
                </button>

                <button
                  type="button"
                  onClick={handleEnableAll}
                  disabled={loading}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750 text-[11px] font-bold rounded-xl border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
                >
                  Enable All
                </button>
              </div>
            </div>

            {/* Tags Grid / List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
              {filteredAllStages.map((stg) => {
                const isEnabled = stg.enabled !== false
                const isBusy = togglingName === stg.name

                return (
                  <div
                    key={stg.id || stg.name}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isEnabled
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                        : 'bg-gray-50/60 dark:bg-gray-950/40 border-gray-150 dark:border-gray-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${stg.color}`}>
                        {stg.label}
                      </span>
                      {stg.isCustom && (
                        <span className="text-[9px] uppercase font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggle(stg.name, isEnabled)}
                      disabled={isBusy}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                      } ${isBusy ? 'opacity-50' : ''}`}
                      title={isEnabled ? 'Click to hide tag' : 'Click to show tag'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE CUSTOM TAG */}
        {activeTab === 'create' && (
          <div className="flex flex-col space-y-4 flex-1 overflow-y-auto pr-1">
            <form onSubmit={handleAdd} className="space-y-4 bg-gray-50 dark:bg-gray-950/60 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Create New Custom Stage
              </h4>
              
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-500">Stage Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Demo Scheduled, Proposal Sent, Followup 2..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-500">Badge Color Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all text-center cursor-pointer ${c.value} ${
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
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Custom Stage</span>
              </button>
            </form>

            {/* Existing Custom Stages List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Your Organization&apos;s Custom Stages ({customStages.length})
              </h4>

              {customStages.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">No custom stages created yet. Add one above!</p>
              ) : (
                <div className="space-y-2">
                  {customStages.map((cs) => (
                    <div
                      key={cs.name}
                      className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-950/40 border border-gray-200 dark:border-gray-800 rounded-xl"
                    >
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cs.color}`}>
                        {cs.label}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => handleDelete(cs.name)}
                        disabled={deletingName === cs.name}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        title="Delete custom stage"
                      >
                        {deletingName === cs.name ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
