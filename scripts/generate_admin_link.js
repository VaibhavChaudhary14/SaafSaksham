const fs = require('fs')

// Load .env.local into process.env (if present)
try {
  const env = fs.readFileSync('.env.local', 'utf8')
  env.split(/\n/).forEach((line) => {
    line = line.trim()
    if (!line || line.startsWith('#')) return
    const idx = line.indexOf('=')
    if (idx === -1) return
    const key = line.slice(0, idx)
    const value = line.slice(idx + 1)
    process.env[key] = value
  })
} catch (e) {
  // ignore
}

async function main() {
  const email = process.argv[2]
  const type = process.argv[3] || 'signup'
  if (!email) {
    console.error('Usage: node scripts/generate_admin_link.js <email> [type]')
    process.exit(1)
  }

  const { createClient } = await import('@supabase/supabase-js')

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type,
      email,
    })
    if (error) {
      console.error('generateLink error', error)
      process.exit(1)
    }
    console.log('Generated link:', data?.action_link)
  } catch (err) {
    console.error('Unexpected error', err)
    process.exit(1)
  }
}

main()
