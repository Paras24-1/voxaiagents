'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import CannedRepliesModal, { CannedReplyItem } from '@/components/chat/CannedRepliesModal'
import { Plus, Search, MessageSquare, Trash2, Edit3, MapPin, Loader2, Sparkles, ChevronRight, FileText, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function CannedRepliesPage() {
  const [replies, setReplies] = useState<CannedReplyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CannedReplyItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  useEffect(() => {
    fetchCannedReplies()
  }, [])

  const fetchCannedReplies = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/canned-replies', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setReplies(data)
      }
    } catch (err) {
      console.error('Fetch canned replies error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReply = async (item: CannedReplyItem) => {
    const method = item.id ? 'PUT' : 'POST'
    const token = await getToken()
    const res = await fetch('/api/canned-replies', {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(item)
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to save canned reply')
    }

    await fetchCannedReplies()
  }

  const handleDeleteReply = async (id: string) => {
    if (!confirm('Delete this canned reply?')) return
    setDeletingId(id)
    try {
      const token = await getToken()
      const res = await fetch(`/api/canned-replies?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to delete')
      setReplies((prev) => prev.filter((r) => r.id !== id))
    } catch (err: any) {
      alert(`Delete error: ${err.message || String(err)}`)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredReplies = replies.filter(
    (r) =>
      r.shortcut.toLowerCase().includes(search.toLowerCase()) ||
      (r.title && r.title.toLowerCase().includes(search.toLowerCase())) ||
      (r.content && r.content.toLowerCase().includes(search.toLowerCase()))
  )

  const typeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
      case 'document': return <FileText className="w-3.5 h-3.5 text-amber-400" />
      case 'location': return <MapPin className="w-3.5 h-3.5 text-rose-400" />
      default: return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
    }
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Image'
      case 'document': return 'Doc'
      case 'location': return 'Location'
      default: return 'Text'
    }
  }

  const typeBg = (type: string) => {
    switch (type) {
      case 'image': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'document': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'location': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }
  }

  return (
    <div className="h-[100dvh] pb-safe flex flex-col bg-slate-950 text-slate-100 overflow-hidden">

      {/* Top Header */}
      <header className="px-3 md:px-8 pt-safe py-3 md:py-4 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sidebar />
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-extrabold text-white tracking-tight truncate">Canned Replies</h1>
            <p className="hidden md:block text-[11px] text-slate-400 truncate">Type <span className="font-mono text-emerald-400">/shortcut</span> in chat to send instantly</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingItem(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Reply</span>
          <span className="sm:hidden">New</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-3 md:px-8 py-2.5 border-b border-slate-800/40 shrink-0 bg-slate-950/60">
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by shortcut, title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Count Badge */}
      {!loading && filteredReplies.length > 0 && (
        <div className="px-3 md:px-8 py-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-400">
            {filteredReplies.length} {filteredReplies.length === 1 ? 'reply' : 'replies'}
            {search && ` for "${search}"`}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3 h-full">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="text-sm font-medium">Loading replies...</span>
          </div>
        ) : filteredReplies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7 text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {search ? 'No results found' : 'No Canned Replies Yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                {search
                  ? `Nothing matches "${search}". Try a different search.`
                  : 'Create shortcuts like /hello or /pricing to reply instantly in chat.'}
              </p>
            </div>
            {!search && (
              <button
                onClick={() => {
                  setEditingItem(null)
                  setIsModalOpen(true)
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                Create First Reply
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile: Compact List */}
            <div className="md:hidden divide-y divide-slate-800/60">
              {filteredReplies.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-3.5 hover:bg-slate-900/60 active:bg-slate-900 transition-colors"
                >
                  {/* Type icon circle */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${typeBg(item.type)}`}>
                    {typeIcon(item.type)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 shrink-0">
                        /{item.shortcut}
                      </span>
                      {item.title && (
                        <span className="text-xs font-semibold text-white truncate">
                          {item.title}
                        </span>
                      )}
                    </div>
                    {item.content && (
                      <p className="text-xs text-slate-400 truncate mt-0.5 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                    {item.type === 'location' && item.location_data && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        📍 {item.location_data.name || item.location_data.address}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingItem(item)
                        setIsModalOpen(true)
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 active:scale-95 transition-all"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => item.id && handleDeleteReply(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {/* Bottom padding for nav */}
              <div className="h-20" />
            </div>

            {/* Desktop: Card Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 p-8">
              {filteredReplies.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Top Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                          /{item.shortcut}
                        </span>
                        {item.title && (
                          <span className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${typeBg(item.type)}`}>
                        {typeLabel(item.type)}
                      </span>
                    </div>

                    {/* Media Thumbnail */}
                    {item.media_url && item.type === 'image' && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 max-h-36 bg-black/40">
                        <img src={item.media_url} alt={item.shortcut} className="w-full h-32 object-cover" />
                      </div>
                    )}

                    {/* Location */}
                    {item.type === 'location' && item.location_data && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{item.location_data.name || 'Location'}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{item.location_data.address}</p>
                      </div>
                    )}

                    {/* Content */}
                    {item.content && (
                      <p className="text-xs text-slate-300 line-clamp-3 whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                    <span className="text-[11px] text-slate-500">
                      Type <span className="font-mono text-slate-300">/{item.shortcut}</span> in chat
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingItem(item)
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => item.id && handleDeleteReply(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Canned Replies Modal */}
      <CannedRepliesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveReply}
        initialData={editingItem}
      />
    </div>
  )
}
