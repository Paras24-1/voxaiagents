// ============================================================================
// Multi-Tenant Crop & Agricultural Field Normalization Engine
// Provides standardized canonical taxonomies, multi-lingual synonym matching
// (English, Hindi, Marathi, Devanagari script), and safe PostgREST query generation.
// ============================================================================

export interface CropDefinition {
  label: string
  icon: string
  patterns: string[]
  regex: RegExp
}

export const CROP_TAXONOMY: Record<string, CropDefinition> = {
  onion: {
    label: 'Onion',
    icon: '🧅',
    patterns: ['%onion%', '%pyaz%', '%pyaaz%', '%kanda%', '%कांदा%', '%प्याज%'],
    regex: /onion|pyaz|pyaaz|piaz|pyaj|kanda|kaanda|कांदा|प्याज/i
  },
  chana: {
    label: 'Chana (Chickpea)',
    icon: '🌾',
    patterns: ['%chana%', '%channa%', '%gram%', '%chickpea%', '%चना%'],
    regex: /chana|channa|chane|gram|chickpea|चना/i
  },
  wheat: {
    label: 'Wheat',
    icon: '🌾',
    patterns: ['%wheat%', '%gehu%', '%gehun%', '%गेहूं%'],
    regex: /wheat|gehu|gehun|गेहूं/i
  },
  garlic: {
    label: 'Garlic',
    icon: '🧄',
    patterns: ['%garlic%', '%lahsun%', '%lehsun%', '%लहसुन%'],
    regex: /garlic|lahsun|lehsun|लहसुन/i
  },
  cotton: {
    label: 'Cotton',
    icon: '☁️',
    patterns: ['%cotton%', '%kapas%', '%kapaas%', '%कपास%'],
    regex: /cotton|kapas|kapaas|कपास/i
  },
  soybean: {
    label: 'Soybean',
    icon: '🌱',
    patterns: ['%soybean%', '%soya%', '%soyabean%', '%सोयाबीन%'],
    regex: /soybean|soya|soyabean|सोयाबीन/i
  },
  mustard: {
    label: 'Mustard',
    icon: '🌿',
    patterns: ['%mustard%', '%sarso%', '%sarson%', '%सरसों%'],
    regex: /mustard|sarso|sarson|सरसों/i
  },
  potato: {
    label: 'Potato',
    icon: '🥔',
    patterns: ['%potato%', '%aloo%', '%alu%', '%आलू%'],
    regex: /potato|aloo|alu|आलू/i
  },
  tomato: {
    label: 'Tomato',
    icon: '🍅',
    patterns: ['%tomato%', '%tamatar%', '%टमाटर%'],
    regex: /tomato|tamatar|टमाटर/i
  },
  maize: {
    label: 'Maize (Corn)',
    icon: '🌽',
    patterns: ['%maize%', '%corn%', '%makka%', '%मक्का%'],
    regex: /maize|corn|makka|मक्का/i
  },
  chilli: {
    label: 'Chilli',
    icon: '🌶️',
    patterns: ['%chilli%', '%chili%', '%mirch%', '%mirchi%', '%मिर्च%'],
    regex: /chilli|chili|mirchi|mirch|मिर्च/i
  },
  sugarcane: {
    label: 'Sugarcane',
    icon: '🎋',
    patterns: ['%sugarcane%', '%ganna%', '%गन्ना%'],
    regex: /sugarcane|ganna|गन्ना/i
  },
  paddy: {
    label: 'Paddy (Rice)',
    icon: '🌾',
    patterns: ['%paddy%', '%rice%', '%dhan%', '%chawal%', '%धान%'],
    regex: /paddy|rice|dhan|chawal|धान/i
  }
}

export const CANONICAL_CROP_LIST = Object.values(CROP_TAXONOMY).map(c => c.label)

export const PRIMARY_CROP_KEYS = [
  'Crop', 
  'crop', 
  'Crop Name',
  'crop_name',
  'Crop_Name',
  'Crop Choice',
  'crop_choice', 
  'Crop_Choice', 
  'Crop Requirement',
  'Crop_Requirement', 
  'crop_requirement',
  'crops',
  'Crops',
  'farm_crop',
  'Farm_Crop',
  'crops_grown',
  'crop_type',
  'Crop_Type',
  'selected_crop',
  'Selected Crop',
  'khedut_crop',
  'fasal',
  'pik',
  'product',
  'Product',
  'requirement',
  'Requirement'
]

/**
 * Normalizes any freeform crop text from user input or metadata into a single canonical crop name.
 * e.g., "red pyaz" -> "Onion", "कांदा" -> "Onion", "chickpea" -> "Chana (Chickpea)"
 */
export function normalizeCrop(val: any): string | null {
  if (!val) return null
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      for (const item of val) {
        const norm = normalizeCrop(item)
        if (norm) return norm
      }
      return null
    }
    for (const v of Object.values(val)) {
      const norm = normalizeCrop(v)
      if (norm) return norm
    }
    return null
  }

  const str = String(val).trim()
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') return null

  for (const crop of Object.values(CROP_TAXONOMY)) {
    if (crop.regex.test(str)) {
      return crop.label
    }
  }

  // Capitalize title-case if unrecognized
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Checks whether a lead's raw metadata value (or entire metadata object) matches a requested crop filter.
 */
export function isCropMatch(leadVal: any, targetFilterVal: string): boolean {
  if (!leadVal || !targetFilterVal) return false
  const targetLower = targetFilterVal.trim().toLowerCase()

  // Find matching taxonomy definition
  let targetTaxonomy: CropDefinition | null = null
  for (const crop of Object.values(CROP_TAXONOMY)) {
    if (crop.regex.test(targetLower)) {
      targetTaxonomy = crop
      break
    }
  }

  // If leadVal is an object (or stringified JSON), inspect all relevant values
  if (typeof leadVal === 'object') {
    if (Array.isArray(leadVal)) {
      return leadVal.some(item => isCropMatch(item, targetFilterVal))
    }
    // Check known crop keys first
    for (const [k, v] of Object.entries(leadVal)) {
      const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (normK.includes('crop') || normK.includes('farm') || normK.includes('fasal') || normK.includes('pik') || normK.includes('product') || normK.includes('require')) {
        if (isCropMatch(v, targetFilterVal)) return true
      }
    }
    // Fallback: check all other primitive values in object
    for (const v of Object.values(leadVal)) {
      if (typeof v === 'string' || typeof v === 'number') {
        if (isCropMatch(v, targetFilterVal)) return true
      }
    }
    return false
  }

  const leadStr = String(leadVal).trim().toLowerCase()
  if (!leadStr || leadStr === 'null' || leadStr === 'undefined') return false

  if (leadStr === targetLower || leadStr.includes(targetLower) || targetLower.includes(leadStr)) {
    return true
  }

  if (targetTaxonomy && targetTaxonomy.regex.test(leadStr)) {
    return true
  }

  for (const crop of Object.values(CROP_TAXONOMY)) {
    if (crop.regex.test(targetLower)) {
      if (crop.regex.test(leadStr)) return true
    }
  }

  return false
}

/**
 * Extracts and canonicalizes the crop from a lead's metadata or direct fields.
 */
export function extractLeadCrop(metadata: any, leadDirectFields?: any): string | null {
  let meta = metadata || {}
  if (typeof meta === 'string') {
    try { meta = JSON.parse(meta) } catch { meta = {} }
  }

  // 1. Check direct crop keys in metadata
  for (const k of PRIMARY_CROP_KEYS) {
    if (meta[k]) {
      const norm = normalizeCrop(meta[k])
      if (norm) return norm
    }
  }

  // 2. Check any key containing 'crop', 'farm', 'fasal', 'pik'
  for (const [k, v] of Object.entries(meta)) {
    const lowerK = k.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (lowerK.includes('crop') || lowerK.includes('farm') || lowerK.includes('fasal') || lowerK.includes('pik')) {
      const norm = normalizeCrop(v)
      if (norm) return norm
    }
  }

  // 3. Check leadDirectFields if present
  if (leadDirectFields) {
    if (leadDirectFields.crop) {
      const norm = normalizeCrop(leadDirectFields.crop)
      if (norm) return norm
    }
    for (const k of PRIMARY_CROP_KEYS) {
      if (leadDirectFields[k]) {
        const norm = normalizeCrop(leadDirectFields[k])
        if (norm) return norm
      }
    }
  }

  // 4. Check if any value in metadata matches a crop taxonomy directly
  for (const v of Object.values(meta)) {
    if (typeof v === 'string' && v.trim().length > 1 && v.trim().length < 60) {
      for (const crop of Object.values(CROP_TAXONOMY)) {
        if (crop.regex.test(v)) {
          return crop.label
        }
      }
    }
  }

  return null
}

/**
 * Generates compact, safe PostgREST `.or()` clauses for crop search to prevent 400 errors.
 */
export function getCropDbFilterClauses(targetFilterVal: string): string[] {
  const targetLower = targetFilterVal.trim().toLowerCase()
  
  let patterns: string[] = []
  for (const crop of Object.values(CROP_TAXONOMY)) {
    if (crop.regex.test(targetLower)) {
      patterns = crop.patterns
      break
    }
  }

  if (patterns.length === 0) {
    const clean = targetLower.replace(/[^a-zA-Z0-9_\u0900-\u097F-]/g, '')
    patterns = [`%${clean}%`]
  }

  // Common database keys (identifiers without spaces for PostgREST compatibility)
  const dbKeys = [
    'Crop', 
    'crop', 
    'crop_name',
    'Crop_Name',
    'crop_choice', 
    'Crop_Choice',
    'crop_requirement', 
    'Crop_Requirement', 
    'crops', 
    'Crops', 
    'farm_crop',
    'Farm_Crop'
  ]
  const clauses: string[] = []

  // Take top 4 most specific patterns to keep URI within safe limits
  const topPatterns = patterns.slice(0, 4)

  for (const k of dbKeys) {
    for (const p of topPatterns) {
      clauses.push(`metadata->>${k}.ilike.${p}`)
    }
  }

  return clauses
}
