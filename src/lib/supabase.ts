import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
})

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
  }
})

export interface UserProfile {
  userId: string
  orgId: string
  role: string
  email: string
}

interface CachedProfile {
  profile: UserProfile | null
  expiresAt: number
}

// In-memory token profile cache to eliminate 300-600ms auth waterfalls on every API request
const profileCache = new Map<string, CachedProfile>()
const PROFILE_CACHE_TTL_MS = 60 * 1000 // 60 seconds for valid users
const NEGATIVE_CACHE_TTL_MS = 15 * 1000 // 15 seconds for invalid/expired tokens

// Helper: get current user profile (userId, orgId, role, email) from session
export async function getUserProfile(req: Request): Promise<UserProfile | null> {
  try {
    const authHeader = req.headers.get('authorization')
    let rawToken: string | null = null

    if (authHeader?.startsWith('Bearer ')) {
      rawToken = authHeader.replace('Bearer ', '').trim()
    }

    if (!rawToken) {
      const cookieStr = req.headers.get('cookie') || ''
      if (cookieStr) {
        const projectId = supabaseUrl.replace('https://', '').split('.')[0]
        
        // 1. Try exact project cookie
        let tokenMatch = cookieStr.match(new RegExp(`sb-${projectId}-auth-token=([^;]+)`))
        // 2. Fall back to any sb-*-auth-token cookie
        if (!tokenMatch) {
          tokenMatch = cookieStr.match(/sb-[a-zA-Z0-9_-]+-auth-token=([^;]+)/)
        }

        if (tokenMatch) {
          try {
            const token = decodeURIComponent(tokenMatch[1])
            const parsed = JSON.parse(token)
            rawToken = parsed.access_token || parsed[0]?.access_token || null
          } catch {}
        }

        // 3. Fall back to chunked cookies if rawToken is still null
        if (!rawToken) {
          let prefixMatch = cookieStr.match(/(sb-[a-zA-Z0-9_-]+-auth-token)\.0=/)
          if (prefixMatch) {
            const prefix = prefixMatch[1]
            const chunks: string[] = []
            let idx = 0
            while (true) {
              const chunkMatch = cookieStr.match(new RegExp(`${prefix.replace('.', '\\.')}\\.${idx}=([^;]+)`))
              if (!chunkMatch) break
              chunks.push(decodeURIComponent(chunkMatch[1]))
              idx++
            }
            if (chunks.length > 0) {
              try {
                const combined = chunks.join('')
                const parsed = JSON.parse(combined)
                rawToken = parsed.access_token || parsed[0]?.access_token || null
              } catch {}
            }
          }
        }
      }
    }

    if (!rawToken) return null

    // Check fast in-memory cache (supports both positive and negative caching)
    const cacheKey = rawToken.slice(-32)
    const cached = profileCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.profile
    }

    const { data, error } = await supabaseAdmin.auth.getUser(rawToken)
    const userId = data?.user?.id

    if (error || !userId) {
      // Fast Negative Cache: cache invalid/expired tokens for 15s to avoid hammering Supabase Auth API
      profileCache.set(cacheKey, {
        profile: null,
        expiresAt: Date.now() + NEGATIVE_CACHE_TTL_MS
      })
      return null
    }

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id, org_id, role, email')
      .eq('id', userId)
      .maybeSingle()

    if (!profile || !profile.org_id) {
      profileCache.set(cacheKey, {
        profile: null,
        expiresAt: Date.now() + NEGATIVE_CACHE_TTL_MS
      })
      return null
    }

    const userProf: UserProfile = {
      userId: profile.id,
      orgId: profile.org_id,
      role: profile.role || 'employee',
      email: profile.email || ''
    }

    profileCache.set(cacheKey, {
      profile: userProf,
      expiresAt: Date.now() + PROFILE_CACHE_TTL_MS
    })

    return userProf
  } catch {
    return null
  }
}

// Helper: get current user's org_id from session
export async function getOrgId(req: Request): Promise<string | null> {
  const profile = await getUserProfile(req)
  return profile?.orgId || null
}

const voiceSupabaseUrl = process.env.NEXT_PUBLIC_VOICE_SUPABASE_URL
const voiceSupabaseAnonKey = process.env.NEXT_PUBLIC_VOICE_SUPABASE_ANON_KEY
const voiceSupabaseServiceKey = process.env.VOICE_SUPABASE_SERVICE_ROLE_KEY || voiceSupabaseAnonKey

export const supabaseVoice = voiceSupabaseUrl && voiceSupabaseAnonKey
  ? createClient(voiceSupabaseUrl, voiceSupabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null

export const supabaseVoiceAdmin = voiceSupabaseUrl && voiceSupabaseServiceKey
  ? createClient(voiceSupabaseUrl, voiceSupabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : null