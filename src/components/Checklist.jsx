import { useEffect, useState } from 'react'
import { defaultChecklist, PHASES } from '../lib/defaults.js'
import { uid } from '../lib/storage.js'

export default function Checklist({ state }) {
  const [tasks, setTasks] = state
  const [newTitle, setNewTitle] = useState('')
  const [newPhase, setNewPhase] = useState(PHASES[0])

  // Seed the default checklist the first time this couple opens the tab.
  useEffect(() => {
    if (tasks == null) setTasks(defaultChecklist())
  }, [tasks, setTasks])

  const list = tasks ?? []
  const done = list.filter((t) => t.done).length
  const pct = list.length ? Math.round((done / list.length) * 100) : 0

  function toggle(id) {
    setTasks(list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }
  function remove(id) {
    setTasks(list.filter((t) => t.id !== id))
  }
  function add(e) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setTasks([...list, { id: uid(), phase: newPhase, title, done: false }])
    setNewTitle('')
  }

  // Keep phases in the classic timeline order, with any custom phases after.
  const phases = [...PHASES, ...[...new Set(list.map((t) => t.phase))].filter((p) => !PHASES.includes(p))]

  return (
    <div>
      <div className="page-head spread">
        <div>
          <h1>Planning Checklist</h1>
          <p>{done} of {list.length} complete · {pct}% of the way there</p>
        </div>
      </div>

      <div className="progress" style={{ marginBottom: 8 }}>
        <span style={{ width: `${pct}%` }} />
      </div>

      <form className="card card-pad row" onSubmit={add} style={{ margin: '18px 0 8px' }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Add a task</label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Book calligrapher for envelopes"
          />
        </div>
        <div className="field">
          <label>When</label>
          <select value={newPhase} onChange={(e) => setNewPhase(e.target.value)}>
            {PHASES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <button className="btn" type="submit">Add</button>
      </form>

      {phases.map((phase) => {
        const items = list.filter((t) => t.phase === phase)
        if (!items.length) return null
        const d = items.filter((t) => t.done).length
        return (
          <div className="phase" key={phase}>
            <div className="phase-head">
              <h3>{phase}</h3>
              <span className="phase-count">{d}/{items.length}</span>
            </div>
            {items.map((t) => (
              <div className={`task ${t.done ? 'done' : ''}`} key={t.id}>
                <button
                  className={`check ${t.done ? 'on' : ''}`}
                  onClick={() => toggle(t.id)}
                  aria-label={t.done ? 'Mark not done' : 'Mark done'}
                >
                  {t.done ? '✓' : ''}
                </button>
                <span className="task-title">{t.title}</span>
                <button className="icon-btn" onClick={() => remove(t.id)} aria-label="Delete task">✕</button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
