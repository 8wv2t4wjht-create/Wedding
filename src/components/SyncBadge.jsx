const MAP = {
  syncing: { cls: 'syncing', dot: '•', text: 'Syncing…' },
  synced: { cls: 'synced', dot: '✓', text: 'Synced across your devices' },
  offline: { cls: 'offline', dot: '!', text: 'Offline — saved here, will sync when reconnected' },
  local: { cls: 'local', dot: '•', text: 'Saved on this device' },
}

export default function SyncBadge({ status }) {
  const s = MAP[status] || MAP.local
  return (
    <div className="sync-strip">
      <span className={`sync-badge ${s.cls}`}>
        <span className="sync-dot" aria-hidden>{s.dot}</span>
        {s.text}
      </span>
    </div>
  )
}
