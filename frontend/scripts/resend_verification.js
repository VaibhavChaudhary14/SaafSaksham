const fs = require('fs')
// Use global fetch available in Node 18+
const fetch = global.fetch || (async () => { throw new Error('global fetch not available') })

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/resend_verification.js <email>')
    process.exit(1)
  }

  // Load .env.local if present
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
  } catch (err) {
    // ignore
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
    process.exit(1)
  }

  // Check user exists
  const userListResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json'
    }
  })
  const users = await userListResp.json()
  if (!Array.isArray(users) || users.length === 0) {
    console.error('No user found with that email')
    process.exit(1)
  }

  const user = users[0]
  console.log('Found user:', { id: user.id, email: user.email, confirmed_at: user.confirmed_at })

  // Resend signup confirmation
  const resendResp = await fetch(`${SUPABASE_URL}/auth/v1/resend`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: 'signup', email })
  })

  const resendJson = await resendResp.json()
  console.log('Resend response:', resendResp.status, resendJson)

  if (resendResp.ok) {
    console.log('Confirmation email resent successfully.')
  } else {
    console.error('Failed to resend confirmation email: ', resendJson)
    process.exit(1)
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
