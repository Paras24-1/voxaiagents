/**
 * Formats a lead's permanent serial number (e.g. #0042, #1052, #12045).
 * Reads from lead.serial_number or metadata.serial_number / serial_no / lead_number.
 * If not yet explicitly stored, falls back to a deterministic 5-digit number derived from lead.id
 * so that every single lead has an unchanging, permanent serial number across all views and filters.
 */
export function formatLeadSerialNumber(lead: any): string {
  if (!lead) return ''

  let meta: any = lead.metadata
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta)
    } catch {
      meta = {}
    }
  } else if (!meta || typeof meta !== 'object') {
    meta = {}
  }

  const raw = lead.serial_number ?? lead.serial_no ?? meta.serial_number ?? meta.serial_no ?? meta.lead_number ?? lead.lead_number

  if (raw !== undefined && raw !== null && String(raw).trim()) {
    const num = Number(raw)
    if (!isNaN(num) && num > 0) {
      return num < 10000 ? String(num).padStart(4, '0') : String(num)
    }
    return String(raw).trim()
  }

  // Deterministic fallback derived from lead UUID so every lead always has a consistent fixed ID
  if (lead.id && typeof lead.id === 'string') {
    const cleanId = lead.id.replace(/[^a-fA-F0-9]/g, '')
    if (cleanId.length >= 6) {
      const intVal = parseInt(cleanId.slice(-6), 16)
      if (!isNaN(intVal)) {
        const stableNum = (intVal % 90000) + 10000 // guarantees a 5-digit number between 10000 and 99999
        return String(stableNum)
      }
    }
  }

  return ''
}
