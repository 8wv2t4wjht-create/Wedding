import { uid } from './storage.js'

// A calm default set of milestones a couple can adapt. Grouped by the
// classic wedding-planning timeline. Each task can be checked off.
const rawChecklist = [
  ['12+ months out', [
    'Set your engagement — celebrate it!',
    'Dream up your vision & overall style',
    'Draft a preliminary budget',
    'Start a rough guest list',
    'Research and tour venues',
    'Book your ceremony & reception venue',
  ]],
  ['9–11 months out', [
    'Book your photographer & videographer',
    'Book your caterer',
    'Hire a wedding planner or coordinator',
    'Choose your wedding party',
    'Start shopping for wedding attire',
  ]],
  ['6–8 months out', [
    'Book florist',
    'Book band or DJ',
    'Book officiant',
    'Reserve room block for guests',
    'Order save-the-dates and send them',
    'Plan your honeymoon',
  ]],
  ['3–5 months out', [
    'Order invitations',
    'Finalize the menu & schedule a tasting',
    'Choose and order the cake',
    'Buy wedding rings',
    'Arrange transportation',
    'Book hair & makeup trial',
  ]],
  ['1–2 months out', [
    'Mail invitations',
    'Apply for marriage license',
    'Finalize ceremony readings & vows',
    'Confirm details with all vendors',
    'Create a day-of timeline',
    'Final dress fitting',
  ]],
  ['Final weeks', [
    'Give final headcount to caterer',
    'Build the seating chart',
    'Confirm arrival times with vendors',
    'Pack for the honeymoon',
    'Prepare payments & tips envelopes',
    'Delegate day-of responsibilities',
    'Relax and enjoy — you did it!',
  ]],
]

export function defaultChecklist() {
  const tasks = []
  rawChecklist.forEach(([phase, items]) => {
    items.forEach((title) => {
      tasks.push({ id: uid(), phase, title, done: false })
    })
  })
  return tasks
}

export function defaultBudgetCategories() {
  return [
    { id: uid(), name: 'Venue', estimated: 12000, actual: 0 },
    { id: uid(), name: 'Catering & Bar', estimated: 9000, actual: 0 },
    { id: uid(), name: 'Photography & Video', estimated: 5000, actual: 0 },
    { id: uid(), name: 'Flowers & Décor', estimated: 3500, actual: 0 },
    { id: uid(), name: 'Music & Entertainment', estimated: 2500, actual: 0 },
    { id: uid(), name: 'Attire & Beauty', estimated: 3000, actual: 0 },
    { id: uid(), name: 'Cake & Desserts', estimated: 800, actual: 0 },
    { id: uid(), name: 'Stationery', estimated: 700, actual: 0 },
    { id: uid(), name: 'Rings', estimated: 4000, actual: 0 },
    { id: uid(), name: 'Transportation', estimated: 900, actual: 0 },
  ]
}

export const PHASES = rawChecklist.map(([phase]) => phase)
