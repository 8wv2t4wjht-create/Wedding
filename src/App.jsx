import { useState } from 'react'
import { usePersistentState } from './lib/storage.js'
import Dashboard from './components/Dashboard.jsx'
import Checklist from './components/Checklist.jsx'
import Guests from './components/Guests.jsx'
import Budget from './components/Budget.jsx'
import Vendors from './components/Vendors.jsx'
import Settings from './components/Settings.jsx'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'guests', label: 'Guests' },
  { id: 'budget', label: 'Budget' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'settings', label: 'Details' },
]

const DEFAULT_DETAILS = {
  partner1: 'Tim',
  partner2: 'Danielle',
  date: '',
  venue: '',
  city: '',
  notes: '',
}

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [details, setDetails] = usePersistentState('details', DEFAULT_DETAILS)

  // Shared collections live here so the dashboard can summarize them.
  const guestsState = usePersistentState('guests', [])
  const budgetState = usePersistentState('budget', null) // null → seed defaults in Budget
  const checklistState = usePersistentState('checklist', null)
  const vendorsState = usePersistentState('vendors', [])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">♥</div>
          <div>
            <div className="brand-title">
              {details.partner1} <span style={{ color: 'var(--blush)' }}>&amp;</span> {details.partner2}
            </div>
            <div className="brand-sub">Wedding Planner</div>
          </div>
        </div>
        <nav className="nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {tab === 'dashboard' && (
          <Dashboard
            details={details}
            guests={guestsState[0]}
            budget={budgetState[0]}
            checklist={checklistState[0]}
            vendors={vendorsState[0]}
            goTo={setTab}
          />
        )}
        {tab === 'checklist' && <Checklist state={checklistState} />}
        {tab === 'guests' && <Guests state={guestsState} />}
        {tab === 'budget' && <Budget state={budgetState} />}
        {tab === 'vendors' && <Vendors state={vendorsState} />}
        {tab === 'settings' && <Settings details={details} setDetails={setDetails} />}
      </main>

      <footer className="footer">
        Made with <span className="heart">♥</span> for {details.partner1} &amp; {details.partner2}
        &nbsp;·&nbsp; your plans are saved privately in this browser
      </footer>
    </div>
  )
}
