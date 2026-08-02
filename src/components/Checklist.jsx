import { useEffect, useState } from 'react'
import { defaultChecklist, PHASES } from '../lib/defaults.js'
import { uid } from '../lib/storage.js'

export default function Checklist({ state }) {
  const [tasks, setTasks] = state
  const [newTitle, setNewTitle] = useState('')
  const [newPhase, setNewPhase] = useState(PHASES[0])
  const [focusId, setFocusId] = useState(null) // newly added subtask to focus

  // Seed the default checklist the first time this couple opens the tab.
  useEffect(() => {
    if (tasks == null) setTasks(defaultChecklist())
  }, [tasks, setTasks])

  const list = tasks ?? []
  const done = list.filter((t) => t.done).length
  const pct = list.length ? Math.round((done / list.length) * 100) : 0

  function patch(id, changes) {
    setTasks(list.map((t) => (t.id === id ? { ...t, ...changes } : t)))
  }
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
    setTasks([...list, { id: uid(), phase: newPhase, title, done: false, subtasks: [] }])
    setNewTitle('')
  }

  // ----- Sub-checklist helpers -----
  function setSubs(taskId, updater) {
    setTasks(list.map((t) => (t.id === taskId ? { ...t, subtasks: updater(t.subtasks || []) } : t)))
  }
  function addSub(taskId) {
    const sub = { id: uid(), title: '', done: false }
    setSubs(taskId, (subs) => [...subs, sub])
    setFocusId(sub.id)
  }
  function toggleSub(taskId, subId) {
    setSubs(taskId, (subs) => subs.map((s) => (s.id === subId ? { ...s, done: !s.done } : s)))
  }
  function editSub(taskId, subId, title) {
    setSubs(taskId, (subs) => subs.map((s) => (s.id === subId ? { ...s, title } : s)))
  }
  function removeSub(taskId, subId) {
    setSubs(taskId, (subs) => subs.filter((s) => s.id !== subId))
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
            {items.map((t) => {
              const subs = t.subtasks || []
              const subDone = subs.filter((s) => s.done).length
              return (
                <div className="task-group" key={t.id}>
                  <div className={`task ${t.done ? 'done' : ''}`}>
                    <button
                      className={`check ${t.done ? 'on' : ''}`}
                      onClick={() => toggle(t.id)}
                      aria-label={t.done ? 'Mark not done' : 'Mark done'}
                    >
                      {t.done ? '✓' : ''}
                    </button>
                    <input
                      className="task-title-input"
                      value={t.title}
                      onChange={(e) => patch(t.id, { title: e.target.value })}
                      aria-label="Task"
                    />
                    {subs.length > 0 && (
                      <span className="sub-progress" title="Steps completed">{subDone}/{subs.length}</span>
                    )}
                    <button
                      className="icon-btn add-sub"
                      onClick={() => addSub(t.id)}
                      aria-label="Add a step"
                      title="Add a step"
                    >＋</button>
                    <button className="icon-btn" onClick={() => remove(t.id)} aria-label="Delete task">✕</button>
                  </div>

                  {subs.length > 0 && (
                    <div className="subtasks">
                      {subs.map((s) => (
                        <div className={`subtask ${s.done ? 'done' : ''}`} key={s.id}>
                          <button
                            className={`check sm ${s.done ? 'on' : ''}`}
                            onClick={() => toggleSub(t.id, s.id)}
                            aria-label={s.done ? 'Mark step not done' : 'Mark step done'}
                          >
                            {s.done ? '✓' : ''}
                          </button>
                          <input
                            className="task-title-input"
                            value={s.title}
                            autoFocus={s.id === focusId}
                            onChange={(e) => editSub(t.id, s.id, e.target.value)}
                            placeholder="Add a step…"
                            aria-label="Step"
                          />
                          <button className="icon-btn" onClick={() => removeSub(t.id, s.id)} aria-label="Delete step">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
