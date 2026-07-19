import { useState, useEffect } from 'react'

const PREFIX = 'td-wedding:'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable — fail quietly */
  }
}

// A small hook that mirrors useState but persists to localStorage.
export function usePersistentState(key, initial) {
  const [state, setState] = useState(() => load(key, initial))
  useEffect(() => {
    save(key, state)
  }, [key, state])
  return [state, setState]
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
