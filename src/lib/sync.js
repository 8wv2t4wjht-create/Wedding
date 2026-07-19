import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

// True once the Supabase project details are filled in. When false the app
// runs happily in local-only mode (saves to this browser).
export function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

// Each shared plan is identified by a space id plus a secret key, both random
// and both carried in the private link. Knowing the link is what grants
// access — there are no accounts to manage.
export function getSpaceCreds() {
  const url = new URL(window.location.href)
  let id = url.searchParams.get('space') || localStorage.getItem('td-wedding:space')
  let key = url.searchParams.get('k') || localStorage.getItem('td-wedding:k')
  if (!id) id = 'w-' + cryptoRandom()
  if (!key) key = cryptoRandom()

  // Reflect the credentials back into the URL and remember them so a plain
  // reload (without the query string) still reopens the same plan.
  url.searchParams.set('space', id)
  url.searchParams.set('k', key)
  window.history.replaceState({}, '', url)
  localStorage.setItem('td-wedding:space', id)
  localStorage.setItem('td-wedding:k', key)
  return { id, key }
}

export function shareUrl() {
  const { id, key } = getSpaceCreds()
  const url = new URL(window.location.href)
  url.searchParams.set('space', id)
  url.searchParams.set('k', key)
  return url.toString()
}

function cryptoRandom() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Low-level call to a Supabase RPC (a locked-down database function).
async function rpc(fn, args) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`${fn} failed: ${res.status}`)
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

// Returns { data, updated_at } for the space, or null if it doesn't exist yet.
export async function fetchSpace(id, key) {
  return rpc('get_space', { p_id: id, p_secret: key })
}

// Creates or updates the space. Ignored server-side if the secret is wrong.
export async function pushSpace(id, key, data) {
  await rpc('save_space', { p_id: id, p_secret: key, p_data: data })
}
