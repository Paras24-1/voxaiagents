// =====================
// Conversation
// =====================
export interface Conversation {
  id: string
  phone_number: string
  name?: string
  last_message?: string
  unread_count: number
  ai_mode: boolean
  stage: string
  created_at: string
  updated_at: string
}
// =====================
// Stage (lead/conversation stage)
// =====================
export type Stage =
  | 'new'
  | 'interested'
  | 'booking'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
// =====================
// Message
// =====================
export interface Message {
  id: string
  conversation_id: string
  phone_number: string
  message?: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
  media_url?: string
  media_type?: string
  created_at: string
}

// =====================
// Lead
// =====================
export interface Lead {
  id?: string
  conversation_id?: string
  phone_number: string
  customer_name?: string
  name?: string
  lead_type?: string
  intent?: string
  previous_qualification?: string
  year_of_passing?: string
  work_experience?: string
  location?: string
  course_interest?: string
  lead_quality?: string
  lead_ready?: string
  send_prospectus?: string
  prospectus_type?: string
  summary?: string
  last_message?: string
  updated?: string
  created_at?: string
}

// =====================
// Reply Payload (API)
// =====================
export interface ReplyPayload {
  message: string
  conversation_id: string
  phone_number?: string
}
