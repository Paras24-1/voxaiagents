import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-only Supabase instances (Safe for client component bundling)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
})

const voiceSupabaseUrl = process.env.NEXT_PUBLIC_VOICE_SUPABASE_URL
const voiceSupabaseAnonKey = process.env.NEXT_PUBLIC_VOICE_SUPABASE_ANON_KEY

export const supabaseVoice = voiceSupabaseUrl && voiceSupabaseAnonKey
  ? createClient(voiceSupabaseUrl, voiceSupabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null

/**
 * Helper to get an active, unexpired access token.
 * If token is expired or expiring within 60s, it auto-refreshes session first.
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    if (expiresAt && Date.now() >= expiresAt - 60000) {
      const { data: refreshData } = await supabase.auth.refreshSession()
      if (refreshData?.session?.access_token) {
        return refreshData.session.access_token
      }
    }
    return session.access_token || null
  } catch {
    return null
  }
}

/**
 * Robust fetch wrapper that attaches Authorization header,
 * handles token auto-refresh, and retries once on 401 Unauthorized.
 */
export async function fetchWithAuth(url: string, init: RequestInit = {}): Promise<Response> {
  let token = await getValidAccessToken()
  
  const headers = new Headers(init.headers || {})
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let res = await fetch(url, { ...init, headers })

  if (res.status === 401) {
    try {
      const { data: refreshData } = await supabase.auth.refreshSession()
      const newToken = refreshData?.session?.access_token
      if (newToken) {
        const retryHeaders = new Headers(init.headers || {})
        retryHeaders.set('Authorization', `Bearer ${newToken}`)
        res = await fetch(url, { ...init, headers: retryHeaders })
      }
    } catch {}
  }

  return res
}
