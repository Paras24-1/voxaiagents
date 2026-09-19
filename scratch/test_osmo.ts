import fs from 'fs'
const env = fs.readFileSync('.env.local', 'utf8')
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
})

import { fetchUnifiedOsmoContacts } from '../src/lib/osmoPhonebooks'

async function run() {
  const contacts = await fetchUnifiedOsmoContacts('e7c673e9-818e-4dd3-818e-7dfb51a1007b')
  console.log('Total contacts:', contacts.length)
  
  const categories = { unfiltered: 0, osmo_dealer: 0, dealer: 0, customer: 0 }
  contacts.forEach(c => {
    const cat = c.category as keyof typeof categories
    if (categories[cat] !== undefined) categories[cat]++
  })
  console.log('Category breakdown:', categories)

  const match = contacts.find(c => c.phone.includes('6307632124'))
  console.log('Sample match for 6307632124:', JSON.stringify(match, null, 2))
}

run()
