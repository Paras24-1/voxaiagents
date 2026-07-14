'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/contexts/OrgContext'
import Sidebar from '@/components/Sidebar'
import { 
  MessageCircle, Eye, EyeOff, Bot, Sparkles, Trash2, 
  ExternalLink, Search, Filter, RefreshCw, AlertCircle, 
  Send, ShieldAlert, Heart, CheckCircle2 
} from 'lucide-react'
import FeatureUpgradePaywall from '@/components/FeatureUpgradePaywall'

interface SocialComment {
  id: string
  platform: string
  comment_id: string
  media_id: string
  username: string
  user_avatar: string | null
  comment_text: string
  sentiment: 'positive' | 'neutral' | 'toxic'
  status: 'pending' | 'replied' | 'hidden'
  ai_reply: string | null
  dm_sent: boolean
  created_at: string
}

interface Stats {
  total: number
  replied: number
  hidden: number
  dm_sent: number
}

export const dynamic = 'force-dynamic'

export default function CommentsPage() {
  const { profile, org, loading: authLoading } = useOrg()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !profile) router.push('/login')
  }, [profile, authLoading, router])

  if (authLoading || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-955">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 min-h-screen p-6 md:p-8 ml-64 transition-all overflow-x-hidden">
        {org?.has_comments_crm ? (
          <CommentsContent />
        ) : (
          <FeatureUpgradePaywall featureName="Comments & Moderation Center" orgName={org?.name || 'Your Team'} />
        )}
      </main>
    </div>
  )
}

function CommentsContent() {
  const { org } = useOrg()
  const [comments, setComments] = useState<SocialComment[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, replied: 0, hidden: 0, dm_sent: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')

  // Manual Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const fetchComments = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/comments')
      if (!res.ok) throw new Error('Failed to retrieve comments')
      const data = await res.json()
      setComments(data.comments || [])
      setStats(data.stats || { total: 0, replied: 0, hidden: 0, dm_sent: 0 })
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error fetching comments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (org) {
      fetchComments()
    }
  }, [org])

  const handleToggleHide = async (comment: SocialComment) => {
    const nextStatus = comment.status === 'hidden' ? 'pending' : 'hidden'
    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: comment.id, status: nextStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      
      setComments(prev => prev.map(c => c.id === comment.id ? updated : c))
      // Recalculate stats counts locally
      setStats(prev => ({
        ...prev,
        hidden: nextStatus === 'hidden' ? prev.hidden + 1 : Math.max(0, prev.hidden - 1),
        replied: comment.status === 'replied' && nextStatus === 'hidden' ? Math.max(0, prev.replied - 1) : prev.replied
      }))
    } catch (err: any) {
      alert(err.message || 'Error hiding comment')
    }
  }

  const handleSendManualReply = async (comment: SocialComment) => {
    if (!replyText.trim()) return
    setSendingReply(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: comment.id, status: 'replied', ai_reply: replyText })
      })

      if (!res.ok) throw new Error('Failed to save manual reply')
      const updated = await res.json()

      setComments(prev => prev.map(c => c.id === comment.id ? updated : c))
      setStats(prev => ({
        ...prev,
        replied: comment.status !== 'replied' ? prev.replied + 1 : prev.replied
      }))
      
      setReplyingTo(null)
      setReplyText('')
    } catch (err: any) {
      alert(err.message || 'Error sending reply')
    } finally {
      setSendingReply(false)
    }
  }

  // Filter calculations
  const filteredComments = comments.filter(c => {
    const matchesSearch = 
      c.username.toLowerCase().includes(search.toLowerCase()) || 
      c.comment_text.toLowerCase().includes(search.toLowerCase())
      
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesPlatform = platformFilter === 'all' || c.platform === platformFilter

    return matchesSearch && matchesStatus && matchesPlatform
  })

  const sentimentBadgeColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
      case 'toxic': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-150 dark:border-gray-700/50'
    }
  }

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'replied': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
      case 'hidden': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    }
  }

  return (
    <>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-emerald-500" />
              Comments & Moderation Center
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitor incoming social comments, moderate spam, and engage with automated private DMs.
            </p>
          </div>
          <button 
            onClick={fetchComments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 border border-gray-250 dark:border-gray-800 rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* 1. KPIs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Comments</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">AI Auto-Replies</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.replied}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Auto-Hidden (Spam)</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.hidden}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">DM Leads Sent</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.dm_sent}</h3>
            </div>
          </div>

        </div>

        {/* 2. Filters Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800/80 p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by username or comment text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-850 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filters Selectors */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-850">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="replied">Auto-Replied</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-850">
              <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                className="bg-transparent text-xs text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>

        </div>

        {/* 3. Live Feed Stream List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-12 rounded-2xl flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-xs text-gray-500">Loading social comments feed...</span>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-12 rounded-2xl flex flex-col items-center justify-center gap-3">
            <MessageCircle className="w-10 h-10 text-gray-300" />
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">No Comments Found</span>
            <span className="text-[11px] text-gray-400">Pushed comments will automatically sync and populate in real-time.</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-850/50 border-b border-gray-150 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Comment Details</th>
                    <th className="px-6 py-4">AI Sentiment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-xs text-gray-700 dark:text-gray-300">
                  {filteredComments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20 transition-colors">
                      
                      {/* User Column */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 border border-gray-150 dark:border-gray-800">
                            {comment.user_avatar ? (
                              <img src={comment.user_avatar} alt={comment.username} className="w-full h-full object-cover" />
                            ) : (
                              comment.username.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                              @{comment.username}
                              {comment.platform === 'instagram' ? (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400">IG</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">FB</span>
                              )}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {new Date(comment.created_at).toLocaleDateString()} at{' '}
                              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Comment Column */}
                      <td className="px-6 py-4.5 max-w-md">
                        <p className="text-gray-900 dark:text-white font-medium break-words">"{comment.comment_text}"</p>
                        {comment.ai_reply && (
                          <div className="mt-2.5 p-2.5 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-150 dark:border-gray-800 flex items-start gap-2">
                            <Bot className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[9px] font-bold text-emerald-600 uppercase block tracking-wider">AI Generated Response:</span>
                              <span className="text-xs text-gray-600 dark:text-gray-300">"{comment.ai_reply}"</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Sentiment Column */}
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border w-max uppercase ${sentimentBadgeColor(comment.sentiment)}`}>
                            {comment.sentiment}
                          </span>
                          {comment.dm_sent && (
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Private DM Sent
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase ${statusBadgeColor(comment.status)}`}>
                          {comment.status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          
                          {/* Hide Toggle */}
                          <button
                            onClick={() => handleToggleHide(comment)}
                            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                            title={comment.status === 'hidden' ? 'Unhide Comment' : 'Hide Comment'}
                          >
                            {comment.status === 'hidden' ? (
                              <Eye className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>

                          {/* Trigger Reply Form */}
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="p-2 rounded-lg bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                            title="Write Manual Reply"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {/* Jump to original post */}
                          {comment.media_id && (
                            <a
                              href={`https://instagram.com/p/${comment.media_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                              title="View Original Post"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                        </div>

                        {/* Inline Reply Form rendering */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-850 rounded-xl border border-gray-150 dark:border-gray-800 space-y-2 max-w-sm">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Write a custom response..."
                              className="w-full p-2.5 text-xs text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-855 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setReplyingTo(null); setReplyText(''); }}
                                className="px-2.5 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendManualReply(comment)}
                                disabled={sendingReply || !replyText.trim()}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold disabled:opacity-50"
                              >
                                {sendingReply ? 'Sending...' : 'Reply'}
                              </button>
                            </div>
                          </div>
                        )}

                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

    </>
  )
}
