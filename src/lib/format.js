export function currency(n) {
  const value = Number(n) || 0
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
}

export function prettyDate(iso) {
  if (!iso) return null
  // Parse as a local date to avoid timezone drift on plain YYYY-MM-DD strings.
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Whole days from today (local midnight) until the wedding date.
export function daysUntil(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  const target = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const ms = target - today
  return Math.round(ms / 86400000)
}

// Break a day count into a friendly months / weeks / days trio.
export function countdownParts(iso) {
  const total = daysUntil(iso)
  if (total == null) return null
  const abs = Math.abs(total)
  const months = Math.floor(abs / 30)
  const weeks = Math.floor((abs % 30) / 7)
  const days = abs % 7
  return { total, months, weeks, days }
}
