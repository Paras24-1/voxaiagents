import { NextResponse } from 'next/server'

export function handleApiError(routeContext: string, err: any) {
  // 1. Full error logging on server side
  console.error(`[${routeContext} Error]:`, {
    message: err?.message || String(err),
    code: err?.code,
    details: err?.details,
    hint: err?.hint,
    stack: err?.stack || err
  })

  // 2. Return a clean, sanitized error message to the client
  let userMessage = 'An internal server error occurred'
  if (typeof err === 'string') {
    userMessage = err
  } else if (err?.message && !err?.code) {
    userMessage = err.message
  } else if (err?.code === 'PGRST102' || err?.code === '22P02') {
    userMessage = 'Invalid request parameters'
  } else if (err?.code === 'PGRST116') {
    userMessage = 'Resource not found'
  } else if (err?.code === '23505') {
    userMessage = 'A record with this value already exists'
  } else if (err?.code === 'PGRST204') {
    userMessage = 'Invalid schema or missing database field'
  }

  return NextResponse.json(
    { error: userMessage },
    { status: 500 }
  )
}
