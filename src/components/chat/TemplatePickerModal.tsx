'use client'

import { useState, useEffect } from 'react'
import { X, Search, FileText, Check, AlertCircle, Loader2, Send, Eye, Plus, Sparkles, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import CreateTemplateModal from '@/components/chat/CreateTemplateModal'

interface Template {
  id: string
  name: string
  language: string
  status: string
  category: string
  body: string
  header?: string
  header_format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | null
  footer?: string
  variables?: string[]
}

interface TemplatePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSendTemplate: (templateData: {
    template_name: string
    template_language: string
    template_components: any[]
    previewText: string
  }) => Promise<void>
}

export default function TemplatePickerModal({
  isOpen,
  onClose,
  onSendTemplate
}: TemplatePickerModalProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Variables & Header Media input states
  const [variableValues, setVariableValues] = useState<{ [key: string]: string }>({})
  const [headerMediaUrl, setHeaderMediaUrl] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setSelectedTemplate(null)
      }
      fetchTemplates()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const res = await fetch('/api/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to load templates')
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setTemplates(data)
        // Only auto-select on desktop; on mobile keep null so user can choose from the template list
        if (data.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
          handleSelectTemplate(data[0])
        } else {
          setSelectedTemplate(null)
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err: any) {
      console.error('Template fetch error:', err)
      setError(err.message || 'Failed to fetch templates from Meta WABA')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTemplate = (tpl: Template) => {
    setSelectedTemplate(tpl)
    // Extract variables {{1}}, {{2}}, etc.
    const vars = tpl.variables || []
    const initialVars: { [key: string]: string } = {}
    vars.forEach((v) => {
      const key = v.replace(/[{}]/g, '')
      initialVars[key] = ''
    })
    setVariableValues(initialVars)
    setHeaderMediaUrl('')
  }

  // Generate live body text preview
  const getRenderedBody = () => {
    if (!selectedTemplate) return ''
    let text = selectedTemplate.body || ''
    Object.keys(variableValues).forEach((key) => {
      const val = variableValues[key] || `{{${key}}}`
      text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val)
    })
    return text
  }

  const handleSend = async () => {
    if (!selectedTemplate) return
    setSending(true)

    try {
      const components: any[] = []

      // Header Media or Text Component if needed
      if (selectedTemplate.header_format && selectedTemplate.header_format !== 'TEXT' && headerMediaUrl) {
        const formatKey = selectedTemplate.header_format.toLowerCase()
        components.push({
          type: 'header',
          parameters: [
            {
              type: formatKey,
              [formatKey]: { link: headerMediaUrl }
            }
          ]
        })
      }

      // Body Variables Component
      const varKeys = Object.keys(variableValues)
      if (varKeys.length > 0) {
        const bodyParameters = varKeys.map((key) => {
          const val = variableValues[key] !== undefined && variableValues[key] !== null ? variableValues[key].trim() : ''
          return {
            type: 'text',
            text: val.length > 0 ? val : ' '
          }
        })
        components.push({
          type: 'body',
          parameters: bodyParameters
        })
      }

      await onSendTemplate({
        template_name: selectedTemplate.name,
        template_language: selectedTemplate.language || 'en',
        template_components: components,
        previewText: getRenderedBody()
      })

      onClose()
    } catch (err: any) {
      console.error('Error sending template:', err)
      alert(`Failed to send template: ${err.message || String(err)}`)
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">Meta Approved Templates</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Select & preview templates to bypass 24h limit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 sm:gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Meta Template</span>
              <span className="sm:hidden font-extrabold">Create</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Responsive Master-Detail layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          
          {/* Left Column: Template List (Hidden on mobile when a template is selected) */}
          <div className={`border-r border-slate-800 flex flex-col h-full bg-slate-950/40 md:col-span-5 min-h-0 ${selectedTemplate ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 sm:p-4 border-b border-slate-800 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="text-xs">Fetching templates from Meta WABA...</span>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No approved templates found.
                </div>
              ) : (
                filteredTemplates.map((t) => {
                  const isSelected = selectedTemplate?.id === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-white truncate flex-1">
                          {t.name}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                          {t.category || 'APPROVED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{t.body}</p>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Preview & Variable Customization (Shown full width on mobile when template is selected) */}
          <div className={`flex flex-col h-full bg-slate-900/40 overflow-y-auto p-4 sm:p-6 space-y-5 md:col-span-7 min-h-0 ${selectedTemplate ? 'flex' : 'hidden md:flex'}`}>
            {selectedTemplate ? (
              <>
                {/* Mobile Back Button to Template List */}
                <div className="md:hidden flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Templates</span>
                  </button>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800">
                    {selectedTemplate.category || 'APPROVED'}
                  </span>
                </div>

                {/* Template Info & Variables Form */}
                <div className="space-y-4">
                  <div className="hidden md:flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-white text-base">{selectedTemplate.name}</h3>
                      <p className="text-xs text-slate-400">Language: {selectedTemplate.language}</p>
                    </div>
                  </div>

                  {/* Header Media URL if required */}
                  {selectedTemplate.header_format && selectedTemplate.header_format !== 'TEXT' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <span>Header {selectedTemplate.header_format} URL:</span>
                      </label>
                      <input
                        type="url"
                        placeholder={`Enter public ${selectedTemplate.header_format.toLowerCase()} URL...`}
                        value={headerMediaUrl}
                        onChange={(e) => setHeaderMediaUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Variable Inputs */}
                  {Object.keys(variableValues).length > 0 && (
                    <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Template Variables
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.keys(variableValues).map((key) => (
                          <div key={key} className="space-y-1">
                            <label className="text-[11px] text-slate-400 font-mono">
                              Variable {`{{${key}}}`}:
                            </label>
                            <input
                              type="text"
                              placeholder={`Value for {{${key}}}`}
                              value={variableValues[key]}
                              onChange={(e) =>
                                setVariableValues({ ...variableValues, [key]: e.target.value })
                              }
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Live Preview Card */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Live Preview</span>
                  </div>

                  {/* Simulated WhatsApp Chat Bubble */}
                  <div className="bg-[#0b141a] p-4 rounded-2xl border border-slate-800 shadow-inner max-w-sm">
                    <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tl-none shadow space-y-2 text-sm">
                      
                      {/* Header Format */}
                      {selectedTemplate.header && (
                        <div className="font-bold text-white text-sm border-b border-emerald-600/50 pb-1.5">
                          {selectedTemplate.header}
                        </div>
                      )}

                      {/* Header Media placeholder if format is media */}
                      {selectedTemplate.header_format && selectedTemplate.header_format !== 'TEXT' && (
                        <div className="bg-black/20 rounded-lg p-3 text-center text-xs text-emerald-200 border border-emerald-600/30">
                          {headerMediaUrl ? `[Media: ${headerMediaUrl}]` : `[${selectedTemplate.header_format} Header]` }
                        </div>
                      )}

                      {/* Body */}
                      <p className="whitespace-pre-wrap leading-relaxed text-xs text-slate-100">
                        {getRenderedBody()}
                      </p>

                      {/* Footer */}
                      {selectedTemplate.footer && (
                        <p className="text-[10px] text-slate-300 pt-1 border-t border-emerald-600/40">
                          {selectedTemplate.footer}
                        </p>
                      )}

                      <div className="text-[10px] text-emerald-200/80 text-right font-mono">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Send Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-auto pb-safe">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                        setSelectedTemplate(null)
                      } else {
                        onClose()
                      }
                    }}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send Template</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-12">
                Select a template from the list to preview and send
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Create Meta Template Sub-Modal */}
      <CreateTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchTemplates()
        }}
      />
    </div>
  )
}
