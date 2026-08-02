import { useState } from 'react'
import { uid } from '../lib/storage.js'

const RSVP_OPTIONS = [
  { value: 'pending', label: 'Pending', cls: 'pending' },
  { value: 'yes', label: 'Attending', cls: 'yes' },
  { value: 'no', label: 'Declined', cls: 'no' },
  { value: 'maybe', label: 'Maybe', cls: 'maybe' },
]

export default function Guests({ state }) {
  const [guests, setGuests] = state
  const list = guests ?? []
  const [form, setForm] = useState({ name: '', party: 1, side: 'Both', rsvp: 'pending', meal: '' })
  const [filter, setFilter] = useState('all')

  function add(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    setGuests([...list, { id: uid(), ...form, name, party: Number(form.party) || 1 }])
    setForm({ name: '', party: 1, side: 'Both', rsvp: 'pending', meal: '' })
  }
  function update(id, patch) {
    setGuests(list.map((g) => (g.id === id ? { ...g, ...patch } : g)))
  }
  function remove(id) {
    setGuests(list.filter((g) => g.id !== id))
  }

  const shown = list.filter((g) => filter === 'all' || g.rsvp === filter || (filter === 'pending' && !g.rsvp))
  const headcount = list.filter((g) => g.rsvp === 'yes').reduce((s, g) => s + (Number(g.party) || 1), 0)
  const invited = list.reduce((s, g) => s + (Number(g.party) || 1), 0)
  const declined = list.filter((g) => g.rsvp === 'no').length
  const pending = list.filter((g) => g.rsvp === 'pending' || !g.rsvp).length

  return (
    <div>
      <div className="page-head">
        <h1>Guest List</h1>
        <p>{headcount} attending · {invited} invited · {pending} awaiting reply · {declined} declined</p>
      </div>

      <form className="card card-pad row" onSubmit={add}>
        <div className="field" style={{ flex: 2 }}>
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Guest or household name" />
        </div>
        <div className="field" style={{ maxWidth: 90 }}>
          <label>Party</label>
          <input type="number" min="1" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} />
        </div>
        <div className="field" style={{ maxWidth: 130 }}>
          <label>Side</label>
          <select value={form.side} onChange={(e) => setForm({ ...form, side: e.target.value })}>
            <option>Both</option><option>Tim</option><option>Danielle</option>
          </select>
        </div>
        <div className="field" style={{ maxWidth: 140 }}>
          <label>RSVP</label>
          <select value={form.rsvp} onChange={(e) => setForm({ ...form, rsvp: e.target.value })}>
            {RSVP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button className="btn" type="submit">Add guest</button>
      </form>

      <div className="spread" style={{ margin: '20px 0 10px' }}>
        <div className="nav">
          {['all', 'yes', 'pending', 'no', 'maybe'].map((f) => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : RSVP_OPTIONS.find((o) => o.value === f)?.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card card-pad empty">
          <div className="heart">♥</div>
          {list.length === 0 ? 'No guests yet — add your first above.' : 'No guests match this filter.'}
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Party</th><th>Side</th><th>RSVP</th><th>Meal / Notes</th><th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((g) => {
                const opt = RSVP_OPTIONS.find((o) => o.value === (g.rsvp || 'pending'))
                return (
                  <tr key={g.id}>
                    <td>
                      <input
                        style={{ padding: '6px 9px', minWidth: 150 }}
                        value={g.name}
                        onChange={(e) => update(g.id, { name: e.target.value })}
                        aria-label="Guest name"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        style={{ padding: '6px 9px', maxWidth: 66 }}
                        value={g.party || 1}
                        onChange={(e) => update(g.id, { party: Number(e.target.value) || 1 })}
                        aria-label="Party size"
                      />
                    </td>
                    <td>
                      <select
                        className="select-inline"
                        value={g.side || 'Both'}
                        onChange={(e) => update(g.id, { side: e.target.value })}
                        aria-label="Side"
                      >
                        <option>Both</option>
                        <option>Tim</option>
                        <option>Danielle</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className={`select-inline pill ${opt.cls}`}
                        value={g.rsvp || 'pending'}
                        onChange={(e) => update(g.id, { rsvp: e.target.value })}
                      >
                        {RSVP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        style={{ padding: '6px 9px', fontSize: '.88rem' }}
                        value={g.meal || ''}
                        onChange={(e) => update(g.id, { meal: e.target.value })}
                        placeholder="—"
                      />
                    </td>
                    <td className="right"><button className="icon-btn" onClick={() => remove(g.id)} aria-label="Remove">✕</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
