import { useState } from 'react'
import { prettyDate, daysUntil } from '../lib/format.js'

export default function Settings({ details, setDetails, sync }) {
  const [copied, setCopied] = useState(false)

  function set(patch) {
    setDetails({ ...details, ...patch })
  }

  async function copyShare() {
    const url = sync.share()
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy your shared link:', url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function exportData() {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('td-wedding:')) data[k] = localStorage.getItem(k)
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wedding-plan-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        Object.entries(data).forEach(([k, v]) => {
          if (k.startsWith('td-wedding:')) localStorage.setItem(k, v)
        })
        window.location.reload()
      } catch {
        alert('Sorry — that file could not be read.')
      }
    }
    reader.readAsText(file)
  }

  const label = prettyDate(details.date)
  const days = daysUntil(details.date)

  return (
    <div>
      <div className="page-head">
        <h1>Wedding Details</h1>
        <p>The essentials that power your dashboard and countdown.</p>
      </div>

      <div className="card card-pad" style={{ maxWidth: 640 }}>
        <div className="row">
          <div className="field">
            <label>Partner 1</label>
            <input value={details.partner1} onChange={(e) => set({ partner1: e.target.value })} />
          </div>
          <div className="field">
            <label>Partner 2</label>
            <input value={details.partner2} onChange={(e) => set({ partner2: e.target.value })} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <div className="field">
            <label>Wedding date</label>
            <input type="date" value={details.date || ''} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div className="field">
            <label>City / Region</label>
            <input value={details.city || ''} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Napa, CA" />
          </div>
        </div>

        {label && (
          <p className="muted" style={{ marginBottom: 0 }}>
            📅 {label}{days != null && days >= 0 ? ` · ${days} days away` : days != null ? ` · ${Math.abs(days)} days ago` : ''}
          </p>
        )}

        <hr className="divider" />

        <div className="field">
          <label>Venue</label>
          <input value={details.venue || ''} onChange={(e) => set({ venue: e.target.value })} placeholder="Where you’ll say “I do”" />
        </div>

        <div className="field" style={{ marginTop: 14 }}>
          <label>Notes & ideas</label>
          <textarea
            rows={4}
            value={details.notes || ''}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Colors, themes, must-have songs, anything you want to remember…"
          />
        </div>
      </div>

      {sync?.configured && (
        <>
          <h3 className="section-title">Share &amp; sync</h3>
          <div className="card card-pad" style={{ maxWidth: 640 }}>
            <p className="muted" style={{ marginTop: 0 }}>
              This is your private plan link. Open it on any device — or send it to
              {' '}{details.partner2 || 'your partner'} — and every change syncs automatically.
              Anyone with the link can view and edit, so keep it between the two of you.
            </p>
            <div className="row">
              <div className="field" style={{ flex: 2 }}>
                <label>Your shared plan link</label>
                <input readOnly value={sync.share()} onFocus={(e) => e.target.select()} />
              </div>
              <button className="btn" onClick={copyShare}>{copied ? 'Copied ✓' : 'Copy link'}</button>
            </div>
          </div>
        </>
      )}

      <h3 className="section-title">Your data</h3>
      <div className="card card-pad" style={{ maxWidth: 640 }}>
        <p className="muted" style={{ marginTop: 0 }}>
          {sync?.configured
            ? 'Your plan is saved to the cloud automatically. You can also download a backup copy or restore one here.'
            : 'Everything is stored privately in this browser — nothing is uploaded anywhere. Back it up or move it to another device with export / import.'}
        </p>
        <div className="row">
          <button className="btn" onClick={exportData}>Export backup</button>
          <label className="btn ghost" style={{ display: 'inline-block' }}>
            Import backup
            <input type="file" accept="application/json" onChange={importData} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  )
}
