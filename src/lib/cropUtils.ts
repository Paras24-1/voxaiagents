// ============================================================================
// Multi-Tenant Crop & Agricultural Field Normalization Engine
// Provides standardized canonical taxonomies, multi-lingual synonym matching
// (English, Hindi, Marathi), and safe PostgREST query generation.
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
    patterns: ['%onion%', '%pyaz%', '%pyaaz%', '%kanda%'],
    regex: /onion|pyaz|pyaaz|piaz|pyaj|kanda|kaanda|कांदा|प्याज/i
  },
  chana: {
    label: 'Chana (Chickpea)',
    icon: '🌾',
    patterns: ['%chana%', '%gram%', '%chickpea%'],
    regex: /chana|channa|chane|gram|chickpea|चना/i
  },
  wheat: {
    label: 'Wheat',
    icon: '🌾',
    patterns: ['%wheat%', '%gehu%'],
    regex: /wheat|gehu|gehun|गेहूं/i
  },
  garlic: {
    label: 'Garlic',
    icon: '🧄',
    patterns: ['%garlic%', '%lahsun%'],
    regex: /garlic|lahsun|lehsun|लहसुन/i
  },
  cotton: {
    label: 'Cotton',
    icon: '☁️',
    patterns: ['%cotton%', '%kapas%'],
    regex: /cotton|kapas|kapaas|कपास/i
  },
  soybean: {
    label: 'Soybean',
    icon: '🌱',
    patterns: ['%soybean%', '%soya%'],
    regex: /soybean|soya|soyabean|सोयाबीन/i
  },
  mustard: {
    label: 'Mustard',
    icon: '🌿',
    patterns: ['%mustard%', '%sarso%'],
    regex: /mustard|sarso|sarson|सरसों/i
  },
  potato: {
    label: 'Potato',
    icon: '🥔',
    patterns: ['%potato%', '%aloo%'],
    regex: /potato|aloo|alu|आलू/i
  },
  tomato: {
    label: 'Tomato',
    icon: '🍅',
    patterns: ['%tomato%', '%tamatar%'],
    regex: /tomato|tamatar|टमाटर/i
  },
  maize: {
    label: 'Maize (Corn)',
    icon: '🌽',
    patterns: ['%maize%', '%corn%', '%makka%'],
    regex: /maize|corn|makka|मक्का/i
  },
  chilli: {
    label: 'Chilli',
    icon: '🌶️',
    patterns: ['%chilli%', '%chili%', '%mirch%'],
    regex: /chilli|chili|mirchi|mirch|मिर्च/i
  },
  sugarcane: {
    label: 'Sugarcane',
    icon: '🎋',
    patterns: ['%sugarcane%', '%ganna%'],
    regex: /sugarcane|ganna|गन्ना/i
  },
  paddy: {
    label: 'Paddy (Rice)',
    icon: '🌾',
    patterns: ['%paddy%', '%rice%', '%dhan%'],
    regex: /paddy|rice|dhan|chawal|धान/i
  }
}

export const CANONICAL_CROP_LIST = Object.values(CROP_TAXONOMY).map(c => c.label)

export const PRIMARY_CROP_KEYS = [
  'Crop', 
  'crop', 
  'crop_choice', 
  'Crop_Choice', 
  'Crop_Requirement', 
  'crop_requirement',
  'crops',
  'Crops',
  'crop_name',
  'farm_crop'
]

/**
 * Normalizes any freeform crop text from user input or metadata into a single canonical crop name.
 * e.g., "red pyaz" -> "Onion", "कांदा" -> "Onion", "chickpea" -> "Chana (Chickpea)"
 */
export function normalizeCrop(val: any): string | null {
  if (!val) return null
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
 * Checks whether a lead's raw metadata value matches a requested crop filter.
 */
export function isCropMatch(leadVal: any, targetFilterVal: string): boolean {
  if (!leadVal || !targetFilterVal) return false
  const targetLower = targetFilterVal.trim().toLowerCase()
  const leadStr = String(leadVal).trim().toLowerCase()

  if (leadStr === targetLower || leadStr.includes(targetLower) || targetLower.includes(leadStr)) {
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
    patterns = [`%${targetLower.replace(/[^a-zA-Z0-9_-]/g, '')}%`]
  }

  const keys = ['Crop', 'crop', 'crop_choice', 'Crop_Requirement', 'crops']
  const clauses: string[] = []

  for (const k of keys) {
    for (const p of patterns) {
      clauses.push(`metadata->>${k}.ilike.${p}`)
    }
  }

  return clauses
}
