// Keeps the running app up to date. After a new version is deployed, the
// app notices (on load, on tab focus, and every 60s) and reloads once so the
// couple always sees the latest — no manual hard-refresh or cache clearing.

const CURRENT = typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : '0'
const GUARD = 'td-wedding:reloadedFor'

async function check() {
  try {
    // Cache-busted so we always see the freshly deployed version file.
    const res = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' })
    if (!res.ok) return
    const { id } = await res.json()
    if (!id) return
    // Only ever move forward, and only reload once per new build to avoid
    // any chance of a reload loop while a CDN is mid-propagation.
    if (Number(id) > Number(CURRENT) && sessionStorage.getItem(GUARD) !== String(id)) {
      sessionStorage.setItem(GUARD, String(id))
      window.location.reload()
    }
  } catch {
    /* offline or unreachable — try again next time */
  }
}

export function startAutoUpdate() {
  if (CURRENT === '0') return
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) check()
  })
  window.addEventListener('focus', check)
  setInterval(check, 60000)
  check()
}
