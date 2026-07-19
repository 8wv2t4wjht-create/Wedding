import { prettyDate, countdownParts, currency } from '../lib/format.js'
import { defaultChecklist, defaultBudgetCategories } from '../lib/defaults.js'

export default function Dashboard({ details, guests, budget, checklist, vendors, goTo }) {
  const tasks = checklist ?? defaultChecklist()
  const cats = budget ?? defaultBudgetCategories()
  const guestList = guests ?? []
  const vendorList = vendors ?? []

  const doneCount = tasks.filter((t) => t.done).length
  const taskPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  const attending = guestList.filter((g) => g.rsvp === 'yes')
  const headcount = attending.reduce((s, g) => s + (Number(g.party) || 1), 0)
  const invited = guestList.reduce((s, g) => s + (Number(g.party) || 1), 0)

  const estTotal = cats.reduce((s, c) => s + (Number(c.estimated) || 0), 0)
  const actualTotal = cats.reduce((s, c) => s + (Number(c.actual) || 0), 0)

  const booked = vendorList.filter((v) => v.status === 'booked').length

  const cd = countdownParts(details.date)
  const dateLabel = prettyDate(details.date)

  return (
    <div>
      <section className="hero">
        <div className="names">
          {details.partner1} <span className="amp">&amp;</span> {details.partner2}
        </div>
        {dateLabel ? (
          <div className="when">{dateLabel}{details.venue ? ` · ${details.venue}` : ''}</div>
        ) : (
          <div className="when">
            <button className="btn ghost small" onClick={() => goTo('settings')}>
              Set your wedding date →
            </button>
          </div>
        )}

        {cd && (
          <div className="countdown">
            {cd.total >= 0 ? (
              <>
                <Unit num={cd.total} label={cd.total === 1 ? 'day to go' : 'days to go'} />
                <Unit num={cd.months} label="months" />
                <Unit num={cd.weeks} label="weeks" />
                <Unit num={cd.days} label="days" />
              </>
            ) : (
              <Unit num={Math.abs(cd.total)} label="days married ♥" />
            )}
          </div>
        )}
      </section>

      <div className="grid grid-3" style={{ marginTop: 22 }}>
        <StatCard
          value={`${taskPct}%`}
          label="Planning complete"
          sub={`${doneCount} of ${tasks.length} tasks done`}
          onClick={() => goTo('checklist')}
          progress={taskPct}
        />
        <StatCard
          value={headcount}
          label="Guests attending"
          sub={`${invited} invited · ${guestList.filter((g) => g.rsvp === 'pending' || !g.rsvp).length} awaiting reply`}
          onClick={() => goTo('guests')}
        />
        <StatCard
          value={currency(actualTotal)}
          label="Spent so far"
          sub={`of ${currency(estTotal)} estimated`}
          onClick={() => goTo('budget')}
        />
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card card-pad">
          <div className="spread">
            <h3 className="section-title" style={{ margin: 0 }}>Up next</h3>
            <button className="btn ghost small" onClick={() => goTo('checklist')}>View all</button>
          </div>
          <div style={{ marginTop: 12 }}>
            {tasks.filter((t) => !t.done).slice(0, 5).map((t) => (
              <div key={t.id} className="task" style={{ marginBottom: 8 }}>
                <span className="check" aria-hidden />
                <span className="task-title">{t.title}</span>
                <span className="badge-soft">{t.phase}</span>
              </div>
            ))}
            {tasks.every((t) => t.done) && (
              <div className="empty"><div className="heart">♥</div>Every task is done — congratulations!</div>
            )}
          </div>
        </div>

        <div className="card card-pad">
          <h3 className="section-title" style={{ margin: 0 }}>At a glance</h3>
          <div style={{ marginTop: 12, display: 'grid', gap: 14 }}>
            <GlanceRow label="Vendors booked" value={`${booked} of ${vendorList.length || '—'}`} onClick={() => goTo('vendors')} />
            <GlanceRow label="Budget remaining" value={currency(estTotal - actualTotal)} onClick={() => goTo('budget')} />
            <GlanceRow label="RSVPs received" value={`${guestList.filter((g) => g.rsvp && g.rsvp !== 'pending').length} of ${guestList.length}`} onClick={() => goTo('guests')} />
            <GlanceRow label="Venue" value={details.venue || 'Not set'} onClick={() => goTo('settings')} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Unit({ num, label }) {
  return (
    <div className="count-unit">
      <div className="count-num">{num}</div>
      <div className="count-label">{label}</div>
    </div>
  )
}

function StatCard({ value, label, sub, onClick, progress }) {
  return (
    <button className="card card-pad stat" onClick={onClick} style={{ textAlign: 'left', border: '1px solid var(--line)' }}>
      <div className="value">{value}</div>
      <div className="label">{label}</div>
      {typeof progress === 'number' && (
        <div className="progress" style={{ margin: '10px 0 6px' }}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="sub">{sub}</div>
    </button>
  )
}

function GlanceRow({ label, value, onClick }) {
  return (
    <div className="spread" style={{ cursor: 'pointer' }} onClick={onClick}>
      <span className="muted">{label}</span>
      <strong style={{ fontWeight: 500 }}>{value}</strong>
    </div>
  )
}
