import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { defaultChecklist, defaultBudgetCategories } from './lib/defaults.js'
import { isConfigured, getSpaceCreds, fetchSpace, pushSpace, shareUrl } from './lib/sync.js'

const DEFAULT_DETAILS = {
  partner1: 'Tim',
  partner2: 'Danielle',
  date: '',
  venue: '',
  city: '',
  notes: '',
}

const SECTIONS = ['details', 'checklist', 'guests', 'budget', 'vendors']
const POLL_MS = 4000
const SAVE_DEBOUNCE_MS = 700

function seedData() {
  return {
    details: DEFAULT_DETAILS,
    checklist: defaultChecklist(),
    guests: [],
    budget: defaultBudgetCategories(),
    vendors: [],
  }
}

// One-time migration from the earlier local-only version, which stored each
// section under its own key. Keeps existing plans intact.
function migrateFromLegacy() {
  try {
    const raw = localStorage.getItem('td-wedding:details')
    if (raw == null) return null
    const get = (k, fallback) => {
      const v = localStorage.getItem('td-wedding:' + k)
      return v == null ? fallback : JSON.parse(v)
    }
    return {
      details: get('details', DEFAULT_DETAILS),
      checklist: get('checklist', null) || defaultChecklist(),
      guests: get('guests', []) || [],
      budget: get('budget', null) || defaultBudgetCategories(),
      vendors: get('vendors', []) || [],
    }
  } catch {
    return null
  }
}

const WeddingContext = createContext(null)

export function WeddingProvider({ children }) {
  const clientId = useRef(Math.random().toString(36).slice(2)).current
  const creds = useRef(getSpaceCreds()).current
  const cacheKey = 'td-wedding:blob:' + creds.id

  const [data, setData] = useState(() => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) return JSON.parse(cached)
    } catch { /* ignore */ }
    return migrateFromLegacy() || seedData()
  })

  // 'local' (no cloud), 'syncing', 'synced', or 'offline' (cloud unreachable).
  const [status, setStatus] = useState(isConfigured() ? 'syncing' : 'local')

  const saveTimer = useRef(null)
  const lastServerAt = useRef(0)
  const dataRef = useRef(data)
  dataRef.current = data

  function cache(next) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(next))
    } catch { /* ignore */ }
  }

  function scheduleSave(next) {
    cache(next)
    if (!isConfigured()) return
    clearTimeout(saveTimer.current)
    setStatus('syncing')
    saveTimer.current = setTimeout(async () => {
      try {
        await pushSpace(creds.id, creds.key, { ...next, _writer: clientId })
        setStatus('synced')
      } catch {
        setStatus('offline')
      }
    }, SAVE_DEBOUNCE_MS)
  }

  // Load from the cloud on mount, then poll for the other device's changes.
  useEffect(() => {
    if (!isConfigured()) return
    let alive = true

    async function pull(initial) {
      try {
        const row = await fetchSpace(creds.id, creds.key)
        if (!alive) return
        if (row && row.data) {
          const at = new Date(row.updated_at).getTime()
          const mine = row.data._writer === clientId
          if (at > lastServerAt.current && !mine) {
            lastServerAt.current = at
            setData(row.data)
            cache(row.data)
          } else if (at > lastServerAt.current) {
            lastServerAt.current = at
          }
        } else if (initial) {
          // No plan on the server yet — seed it with what we have locally.
          await pushSpace(creds.id, creds.key, { ...dataRef.current, _writer: clientId })
        }
        setStatus('synced')
      } catch {
        if (alive) setStatus('offline')
      }
    }

    pull(true)
    const timer = setInterval(() => pull(false), POLL_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [])

  // Stable per-section setters that behave like React state setters.
  const setters = useMemo(() => {
    const map = {}
    for (const section of SECTIONS) {
      map[section] = (value) => {
        setData((prev) => {
          const resolved = typeof value === 'function' ? value(prev[section]) : value
          const next = { ...prev, [section]: resolved }
          scheduleSave(next)
          return next
        })
      }
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ data, setters, status, configured: isConfigured(), share: shareUrl }),
    [data, setters, status],
  )

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
}

// Returns [value, setValue] for a section — same shape the components already use.
export function useSection(name) {
  const ctx = useContext(WeddingContext)
  return [ctx.data[name], ctx.setters[name]]
}

export function useSync() {
  const ctx = useContext(WeddingContext)
  return { status: ctx.status, configured: ctx.configured, share: ctx.share }
}
