import { useState } from 'react'
import { uid } from '../lib/storage.js'
import { currency } from '../lib/format.js'

const STATUS = [
  { value: 'idea', label: 'Idea', cls: 'pending' },
  { value: 'contacted', label: 'Contacted', cls: 'contacted' },
  { value: 'booked', label: 'Booked', cls: 'booked' },
]

const CATEGORIES = [
  'Venue', 'Catering', 'Photography', 'Videography', 'Florist',
  'Music / DJ', 'Officiant', 'Cake', 'Hair & Makeup', 'Rentals',
  'Transportation', 'Stationery', 'Planner', 'Other',
]

export default function Vendors({ state }) {
  const [vendors, setVendors] = state
  const list = vendors ?? []
  const [form, setForm] = useState({ name: '', category: 'Venue', status: 'idea', cost: '', contact: '' })

  function add(e) {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) return
    setVendors([...list, { id: uid(), ...form, name, cost: Number(form.cost) || 0 }])
    setForm({ name: '', category: 'Venue', status: 'idea', cost: '', contact: '' })
  }
  function update(id, patch) {
    setVendors(list.map((v) => (v.id === id ? { ...v, ...patch } : v)))
  }
  function remove(id) {
    setVendors(list.filter((v) => v.id !== id))
  }

  const booked = list.filter((v) => v.status === 'booked').length
  const committed = list.filter((v) => v.status === 'booked').reduce((s, v) => s + (Number(v.cost) || 0), 0)

  return (
    <div>
      <div className="page-head">
        <h1>Vendors</h1>
        <p>{booked} booked · {currency(committed)} committed</p>
      </div>

      <form className="card card-pad row" onSubmit={add}>
        <div className="field" style={{ flex: 2 }}>
          <label>Vendor</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Business or contact name" />
        </div>
        <div className="field" style={{ maxWidth: 160 }}>
          <label>Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field" style={{ maxWidth: 130 }}>
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <button className="btn" type="submit">Add</button>
      </form>

      {list.length === 0 ? (
        <div className="card card-pad empty" style={{ marginTop: 18 }}>
          <div className="heart">♥</div>
          No vendors yet — start tracking the people who’ll bring your day to life.
        </div>
      ) : (
        <div className="card table-wrap" style={{ marginTop: 18 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Vendor</th><th>Category</th><th>Status</th><th>Contact</th><th className="right">Cost</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => {
                const opt = STATUS.find((s) => s.value === (v.status || 'idea'))
                return (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td className="muted">{v.category}</td>
                    <td>
                      <select
                        className={`select-inline pill ${opt.cls}`}
                        value={v.status || 'idea'}
                        onChange={(e) => update(v.id, { status: e.target.value })}
                      >
                        {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        style={{ padding: '6px 9px', fontSize: '.88rem', minWidth: 140 }}
                        value={v.contact || ''}
                        onChange={(e) => update(v.id, { contact: e.target.value })}
                        placeholder="Phone, email, website"
                      />
                    </td>
                    <td className="right">
                      <input
                        type="number" min="0" step="50"
                        style={{ padding: '6px 9px', maxWidth: 100, textAlign: 'right' }}
                        value={v.cost ?? 0}
                        onChange={(e) => update(v.id, { cost: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="right"><button className="icon-btn" onClick={() => remove(v.id)} aria-label="Remove">✕</button></td>
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
