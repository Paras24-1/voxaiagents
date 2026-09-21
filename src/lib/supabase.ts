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
  }
})

export interface UserProfile {
  userId: string
  orgId: string
  role: string
  email: string
}

interface CachedProfile {
  profile: UserProfile
  expiresAt: number
}

// In-memory token profile cache to eliminate 300-600ms auth waterfalls on every API request
const profileCache = new Map<string, CachedProfile>()
const PROFILE_CACHE_TTL_MS = 60 * 1000 // 60 seconds

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
      const projectId = supabaseUrl.replace('https://', '').split('.')[0]
      
      let tokenMatch = cookieStr.match(new RegExp(`sb-${projectId}-auth-token=([^;]+)`))
      if (!tokenMatch) {
        const chunks: string[] = []
        let idx = 0
        while (true) {
          const chunkMatch = cookieStr.match(new RegExp(`sb-${projectId}-auth-token\\.${idx}=([^;]+)`))
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
      } else {
        const token = decodeURIComponent(tokenMatch[1])
        try {
          const parsed = JSON.parse(token)
          rawToken = parsed.access_token || parsed[0]?.access_token || null
        } catch {}
      }
    }

    if (!rawToken) return null

    // Check fast in-memory cache
    const cacheKey = rawToken.slice(-32)
    const cached = profileCache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return cached.profile
    }

    const { data } = await supabaseAdmin.auth.getUser(rawToken)
    const userId = data.user?.id
    if (!userId) return null

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('id, org_id, role, email')
      .eq('id', userId)
      .maybeSingle()

    if (!profile || !profile.org_id) return null

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