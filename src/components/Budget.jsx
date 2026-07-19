import { useEffect, useState } from 'react'
import { defaultBudgetCategories } from '../lib/defaults.js'
import { currency } from '../lib/format.js'
import { uid } from '../lib/storage.js'

export default function Budget({ state }) {
  const [cats, setCats] = state
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (cats == null) setCats(defaultBudgetCategories())
  }, [cats, setCats])

  const list = cats ?? []
  const est = list.reduce((s, c) => s + (Number(c.estimated) || 0), 0)
  const actual = list.reduce((s, c) => s + (Number(c.actual) || 0), 0)
  const remaining = est - actual
  const pct = est ? Math.min(100, Math.round((actual / est) * 100)) : 0

  function update(id, patch) {
    setCats(list.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function remove(id) {
    setCats(list.filter((c) => c.id !== id))
  }
  function add(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setCats([...list, { id: uid(), name, estimated: 0, actual: 0 }])
    setNewName('')
  }

  return (
    <div>
      <div className="page-head">
        <h1>Budget</h1>
        <p>Track what you plan to spend against what you actually spend.</p>
      </div>

      <div className="grid grid-3">
        <SumCard label="Estimated total" value={currency(est)} />
        <SumCard label="Spent so far" value={currency(actual)} />
        <SumCard label="Remaining" value={currency(remaining)} tone={remaining < 0 ? 'over' : 'ok'} />
      </div>

      <div className="progress" style={{ margin: '18px 0 6px' }}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="muted" style={{ marginTop: 0, fontSize: '.85rem' }}>
        {pct}% of estimated budget spent{remaining < 0 ? ' · over budget' : ''}
      </p>

      <div className="card table-wrap" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="right">Estimated</th>
              <th className="right">Actual</th>
              <th className="right">Difference</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const diff = (Number(c.estimated) || 0) - (Number(c.actual) || 0)
              return (
                <tr key={c.id}>
                  <td>
                    <input
                      style={{ padding: '6px 9px', minWidth: 140 }}
                      value={c.name}
                      onChange={(e) => update(c.id, { name: e.target.value })}
                    />
                  </td>
                  <td className="right">
                    <MoneyInput value={c.estimated} onChange={(v) => update(c.id, { estimated: v })} />
                  </td>
                  <td className="right">
                    <MoneyInput value={c.actual} onChange={(v) => update(c.id, { actual: v })} />
                  </td>
                  <td className="right" style={{ color: diff < 0 ? 'var(--danger)' : 'var(--sage)' }}>
                    {currency(diff)}
                  </td>
                  <td className="right"><button className="icon-btn" onClick={() => remove(c.id)} aria-label="Remove">✕</button></td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ fontWeight: 500 }}>Total</td>
              <td className="right" style={{ fontWeight: 500 }}>{currency(est)}</td>
              <td className="right" style={{ fontWeight: 500 }}>{currency(actual)}</td>
              <td className="right" style={{ fontWeight: 500, color: remaining < 0 ? 'var(--danger)' : 'var(--sage)' }}>{currency(remaining)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <form className="row" onSubmit={add} style={{ marginTop: 16 }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Add a category</label>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Officiant, Favors, Hotel block" />
        </div>
        <button className="btn" type="submit">Add category</button>
      </form>
    </div>
  )
}

function SumCard({ label, value, tone }) {
  return (
    <div className="card card-pad stat">
      <div className="value" style={tone === 'over' ? { color: 'var(--danger)' } : undefined}>{value}</div>
      <div className="label">{label}</div>
    </div>
  )
}

function MoneyInput({ value, onChange }) {
  return (
    <input
      type="number"
      min="0"
      step="50"
      value={value ?? 0}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      style={{ padding: '6px 9px', maxWidth: 110, textAlign: 'right' }}
    />
  )
}
