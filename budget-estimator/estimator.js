/* =============================================================================
   Dream Big Home Design — Custom Home Budget Estimator
   -----------------------------------------------------------------------------
   HOW TO TUNE THIS TOOL FOR YOUR MARKET
   Every number a client's estimate is built from lives in the CONFIG block
   below. Nothing else needs editing. All figures are 2026 construction-cost
   ballparks (they EXCLUDE land, design fees, and financing — see the notes at
   the bottom of the estimate panel). Adjust the values to match what you're
   seeing from your builders and you're done.

   The math, in plain English:
     $/sqft  = tier base  +  the upgrade "delta" of every finish choice
     Build   = $/sqft  ×  square footage  ×  region factor  ×  story factor
     Total   = Build  +  add-ons  +  contingency
     Shown as a range of roughly ±8% because every estimate is a starting point.
============================================================================= */

const CONFIG = {
  // --- Square footage input -------------------------------------------------
  sqft: { min: 1000, max: 8000, step: 50, default: 2800 },

  // --- Region: scales labor + materials up or down by market ----------------
  regions: [
    { id: 'rural',    label: 'Rural / lower-cost area',        factor: 0.85 },
    { id: 'suburban', label: 'Suburban / average market',      factor: 1.00 },
    { id: 'metro',    label: 'Growing metro',                  factor: 1.15 },
    { id: 'coastal',  label: 'High-cost metro / coastal',      factor: 1.35 },
  ],

  // --- Overall quality tier: the single biggest cost driver -----------------
  // "base" is $/sqft for the structure + that tier's standard finishes.
  tiers: [
    { id: 'essential', label: 'Essential', base: 190, blurb: 'Efficient layout, builder-grade finishes done well.' },
    { id: 'signature', label: 'Signature', base: 265, blurb: 'True custom design with quality, name-brand finishes.' },
    { id: 'premium',   label: 'Premium',   base: 360, blurb: 'High-end custom, designer selections throughout.' },
    { id: 'estate',    label: 'Estate',    base: 500, blurb: 'Luxury and architectural — best-in-class everything.' },
  ],

  // --- Stories: two-story is slightly cheaper per sqft (shared roof/found.) --
  stories: [
    { id: 'one',     label: 'Single story', factor: 1.00 },
    { id: 'onehalf', label: '1.5 story',    factor: 0.98 },
    { id: 'two',     label: 'Two story',    factor: 0.96 },
  ],

  // --- Finish & material choices: each adds $/sqft ABOVE the tier standard ---
  // "delta: 0" is the included/standard choice for the selected tier.
  categories: [
    { id: 'kitchen', label: 'Kitchen', help: 'Cabinets, counters, appliances, island', options: [
      { label: 'Standard',        delta: 0 },
      { label: 'Premium',         delta: 12 },
      { label: "Chef's / luxury", delta: 28 },
    ]},
    { id: 'primaryBath', label: 'Primary bath', help: 'Shower, tub, vanities, tile', options: [
      { label: 'Standard',   delta: 0 },
      { label: 'Spa upgrade', delta: 8 },
      { label: 'Luxury spa', delta: 18 },
    ]},
    { id: 'flooring', label: 'Flooring', help: 'Whole-home floor surfaces', options: [
      { label: 'Carpet & laminate',   delta: 0 },
      { label: 'Luxury vinyl / wood', delta: 6 },
      { label: 'Hardwood & tile',     delta: 14 },
      { label: 'Premium stone & wood', delta: 24 },
    ]},
    { id: 'counters', label: 'Countertops', help: 'Kitchen and bathroom surfaces', options: [
      { label: 'Laminate',          delta: 0 },
      { label: 'Quartz / granite',  delta: 4 },
      { label: 'Natural stone slab', delta: 9 },
    ]},
    { id: 'cabinetry', label: 'Cabinetry', help: 'Kitchen, bath & built-ins', options: [
      { label: 'Stock',        delta: 0 },
      { label: 'Semi-custom',  delta: 7 },
      { label: 'Full custom',  delta: 16 },
    ]},
    { id: 'exterior', label: 'Exterior finish', help: 'Siding, brick, stone, stucco', options: [
      { label: 'Lap / fiber-cement', delta: 0 },
      { label: 'Stone accents',      delta: 10 },
      { label: 'Full brick / stone', delta: 22 },
    ]},
    { id: 'roof', label: 'Roofing', help: 'Roof material & detail', options: [
      { label: 'Architectural shingle', delta: 0 },
      { label: 'Standing-seam metal',   delta: 9 },
      { label: 'Tile / slate',          delta: 18 },
    ]},
    { id: 'windows', label: 'Windows & doors', help: 'Glazing, sizing, entry doors', options: [
      { label: 'Standard vinyl',     delta: 0 },
      { label: 'High-efficiency',    delta: 6 },
      { label: 'Premium / big glass', delta: 15 },
    ]},
    { id: 'energy', label: 'HVAC & energy', help: 'Systems, insulation, efficiency', options: [
      { label: 'Standard efficiency', delta: 0 },
      { label: 'High-efficiency',     delta: 7 },
      { label: 'Net-zero ready',      delta: 20 },
    ]},
    { id: 'smart', label: 'Smart home & lighting', help: 'Automation, security, fixtures', options: [
      { label: 'Basic',              delta: 0 },
      { label: 'Smart-home package', delta: 5 },
      { label: 'Whole-home automation', delta: 12 },
    ]},
  ],

  // --- Add-ons: flat costs, scaled by region --------------------------------
  addons: [
    { id: 'garage',   label: 'Garage bays', help: '$18k per bay', type: 'stepper', each: 18000, min: 0, max: 4, default: 2 },
    { id: 'basement', label: 'Finished basement', type: 'select', options: [
      { label: 'None',    cost: 0 },
      { label: 'Partial', cost: 55000 },
      { label: 'Full',    cost: 120000 },
    ]},
    { id: 'porch',    label: 'Covered outdoor living',       type: 'toggle', cost: 28000 },
    { id: 'outdoor',  label: 'Outdoor kitchen & screened porch', type: 'toggle', cost: 45000 },
    { id: 'bonus',    label: 'Bonus room over garage',       type: 'toggle', cost: 40000 },
    { id: 'casita',   label: 'Guest casita / ADU',           type: 'toggle', cost: 110000 },
    { id: 'pool',     label: 'In-ground pool & spa',         type: 'toggle', cost: 95000 },
    { id: 'elevator', label: 'Residential elevator',         type: 'toggle', cost: 45000 },
  ],

  // --- Contingency: recommended cushion for the unknowns --------------------
  contingency: { default: 0.10, options: [0, 0.05, 0.10, 0.15] },

  // Range shown around the point estimate (±).
  rangeSpread: 0.08,
}

/* ------------------------------------------------------------------ state -- */
const state = {
  sqft: CONFIG.sqft.default,
  region: 'suburban',
  tier: 'signature',
  story: 'one',
  categories: Object.fromEntries(CONFIG.categories.map(c => [c.id, 0])), // index into options
  addons: {
    garage: CONFIG.addons.find(a => a.id === 'garage').default,
    basement: 0,
    porch: false, outdoor: false, bonus: false, casita: false, pool: false, elevator: false,
  },
  contingency: CONFIG.contingency.default,
}

/* ----------------------------------------------------------------- helpers - */
const $ = (sel, root = document) => root.querySelector(sel)
const el = (tag, cls, html) => {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (html != null) n.innerHTML = html
  return n
}
const money = n => (Math.round(n / 1000) * 1000).toLocaleString('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
})
const moneyExact = n => Math.round(n).toLocaleString('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
})

/* ------------------------------------------------------------------- compute */
function compute() {
  const region = CONFIG.regions.find(r => r.id === state.region)
  const tier   = CONFIG.tiers.find(t => t.id === state.tier)
  const story  = CONFIG.stories.find(s => s.id === state.story)
  const factor = region.factor * story.factor

  // Per-sqft: tier base + all selected finish deltas.
  let deltaPerSqft = 0
  for (const cat of CONFIG.categories) {
    deltaPerSqft += cat.options[state.categories[cat.id]].delta
  }

  const structure = tier.base * state.sqft * factor          // shell + standard finishes
  const upgrades  = deltaPerSqft * state.sqft * factor        // everything above standard

  // Add-ons (region-scaled).
  let addonsTotal = 0
  for (const a of CONFIG.addons) {
    if (a.type === 'stepper') addonsTotal += a.each * state.addons[a.id]
    else if (a.type === 'select') addonsTotal += a.options[state.addons[a.id]].cost
    else if (a.type === 'toggle' && state.addons[a.id]) addonsTotal += a.cost
  }
  addonsTotal *= region.factor

  const subtotal = structure + upgrades + addonsTotal
  const contingency = subtotal * state.contingency
  const total = subtotal + contingency

  return {
    structure, upgrades, addonsTotal, contingency, total,
    perSqft: total / state.sqft,
    low: total * (1 - CONFIG.rangeSpread),
    high: total * (1 + CONFIG.rangeSpread),
    upgradePct: subtotal ? upgrades / subtotal : 0,
  }
}

/* -------------------------------------------------------------- render: form */
function segmented(options, activeIdx, onPick, describe) {
  const wrap = el('div', 'seg', '')
  options.forEach((opt, i) => {
    const b = el('button', 'seg-btn' + (i === activeIdx ? ' is-active' : ''))
    b.type = 'button'
    b.setAttribute('aria-pressed', String(i === activeIdx))
    b.innerHTML = describe ? describe(opt) : opt.label
    b.addEventListener('click', () => onPick(i))
    wrap.appendChild(b)
  })
  return wrap
}

function renderBasics() {
  const root = $('#basics')
  root.innerHTML = ''

  // Square footage
  const sq = el('div', 'field')
  sq.appendChild(el('div', 'field-head',
    `<label class="field-label" for="sqft">Home size</label>
     <output class="field-value" id="sqftOut">${state.sqft.toLocaleString()} sq ft</output>`))
  const slider = el('input', 'range')
  Object.assign(slider, { type: 'range', id: 'sqft', min: CONFIG.sqft.min, max: CONFIG.sqft.max, step: CONFIG.sqft.step, value: state.sqft })
  slider.setAttribute('aria-label', 'Home size in square feet')
  slider.addEventListener('input', e => { state.sqft = +e.target.value; $('#sqftOut').textContent = state.sqft.toLocaleString() + ' sq ft'; refresh() })
  sq.appendChild(slider)
  sq.appendChild(el('div', 'range-scale', `<span>${CONFIG.sqft.min.toLocaleString()}</span><span>${CONFIG.sqft.max.toLocaleString()} sq ft</span>`))
  root.appendChild(sq)

  // Stories + Region on one row
  const row = el('div', 'field-grid')
  const st = el('div', 'field')
  st.appendChild(el('div', 'field-head', `<span class="field-label">Stories</span>`))
  st.appendChild(segmented(CONFIG.stories, CONFIG.stories.findIndex(s => s.id === state.story),
    i => { state.story = CONFIG.stories[i].id; renderBasics(); refresh() }))
  row.appendChild(st)

  const rg = el('div', 'field')
  rg.appendChild(el('div', 'field-head', `<label class="field-label" for="region">Location</label>`))
  const sel = el('select', 'select')
  sel.id = 'region'
  CONFIG.regions.forEach(r => {
    const o = el('option'); o.value = r.id; o.textContent = r.label; if (r.id === state.region) o.selected = true; sel.appendChild(o)
  })
  sel.addEventListener('change', e => { state.region = e.target.value; refresh() })
  rg.appendChild(sel)
  row.appendChild(rg)
  root.appendChild(row)
}

function renderTiers() {
  const root = $('#tiers')
  root.innerHTML = ''
  CONFIG.tiers.forEach(t => {
    const active = t.id === state.tier
    const card = el('button', 'tier' + (active ? ' is-active' : ''))
    card.type = 'button'
    card.setAttribute('aria-pressed', String(active))
    card.innerHTML =
      `<span class="tier-top"><span class="tier-name">${t.label}</span>
        <span class="tier-rate">$${t.base}<span class="tier-rate-unit">/sq ft</span></span></span>
       <span class="tier-blurb">${t.blurb}</span>`
    card.addEventListener('click', () => { state.tier = t.id; renderTiers(); refresh() })
    root.appendChild(card)
  })
}

function renderCategories() {
  const root = $('#materials')
  root.innerHTML = ''
  CONFIG.categories.forEach(cat => {
    const rowEl = el('div', 'mat')
    rowEl.appendChild(el('div', 'mat-info',
      `<span class="mat-label">${cat.label}</span><span class="mat-help">${cat.help}</span>`))
    rowEl.appendChild(segmented(
      cat.options,
      state.categories[cat.id],
      i => { state.categories[cat.id] = i; renderCategories(); refresh() },
      opt => `${opt.label}${opt.delta ? `<span class="seg-add">+$${opt.delta}</span>` : ''}`
    ))
    root.appendChild(rowEl)
  })
}

function renderAddons() {
  const root = $('#addons')
  root.innerHTML = ''
  CONFIG.addons.forEach(a => {
    const rowEl = el('div', 'addon')
    const info = el('div', 'addon-info', `<span class="addon-label">${a.label}</span>`)
    if (a.help) info.querySelector('.addon-label').insertAdjacentHTML('afterend', `<span class="addon-help">${a.help}</span>`)
    rowEl.appendChild(info)

    if (a.type === 'toggle') {
      info.querySelector('.addon-label').insertAdjacentHTML('afterend',
        `<span class="addon-help">${moneyExact(a.cost)}</span>`)
      const t = el('button', 'switch' + (state.addons[a.id] ? ' is-on' : ''))
      t.type = 'button'
      t.setAttribute('role', 'switch')
      t.setAttribute('aria-checked', String(!!state.addons[a.id]))
      t.setAttribute('aria-label', a.label)
      t.innerHTML = '<span class="switch-dot"></span>'
      t.addEventListener('click', () => { state.addons[a.id] = !state.addons[a.id]; renderAddons(); refresh() })
      rowEl.appendChild(t)
    } else if (a.type === 'stepper') {
      const s = el('div', 'stepper')
      const dec = el('button', 'step-btn'); dec.type = 'button'; dec.textContent = '−'; dec.setAttribute('aria-label', 'Fewer ' + a.label)
      const val = el('span', 'step-val'); val.textContent = state.addons[a.id]
      const inc = el('button', 'step-btn'); inc.type = 'button'; inc.textContent = '+'; inc.setAttribute('aria-label', 'More ' + a.label)
      dec.addEventListener('click', () => { state.addons[a.id] = Math.max(a.min, state.addons[a.id] - 1); val.textContent = state.addons[a.id]; refresh() })
      inc.addEventListener('click', () => { state.addons[a.id] = Math.min(a.max, state.addons[a.id] + 1); val.textContent = state.addons[a.id]; refresh() })
      s.append(dec, val, inc)
      rowEl.appendChild(s)
    } else if (a.type === 'select') {
      rowEl.appendChild(segmented(a.options, state.addons[a.id],
        i => { state.addons[a.id] = i; renderAddons(); refresh() },
        opt => `${opt.label}${opt.cost ? `<span class="seg-add">${money(opt.cost).replace('$', '$').replace(',000', 'k')}</span>` : ''}`))
    }
    root.appendChild(rowEl)
  })
}

function renderContingency() {
  const root = $('#contingency')
  root.innerHTML = ''
  const opts = CONFIG.contingency.options.map(v => ({ v, label: v === 0 ? 'None' : Math.round(v * 100) + '%' }))
  root.appendChild(segmented(opts, opts.findIndex(o => o.v === state.contingency),
    i => { state.contingency = opts[i].v; renderContingency(); refresh() },
    o => o.label))
}

/* ---------------------------------------------------------- render: summary */
function renderSummary() {
  const r = compute()

  $('#estLow').textContent = money(r.low)
  $('#estHigh').textContent = money(r.high)
  $('#estPerSqft').textContent = moneyExact(r.perSqft) + ' / sq ft'
  $('#estMid').textContent = 'Midpoint ' + money(r.total)

  const bd = $('#breakdown')
  bd.innerHTML = ''
  const lines = [
    ['Structure & standard finishes', r.structure, false],
    ['Material & finish upgrades',    r.upgrades,   false],
    ['Add-ons & site features',       r.addonsTotal, false],
    [`Contingency (${Math.round(state.contingency * 100)}%)`, r.contingency, false],
  ]
  lines.forEach(([label, val, muted]) => {
    if (val <= 0 && label.startsWith('Contingency')) return
    const line = el('div', 'bd-line')
    line.innerHTML = `<span class="bd-label">${label}</span><span class="bd-val">${moneyExact(val)}</span>`
    bd.appendChild(line)
  })

  // "Material choices add X%" insight
  const insight = $('#insight')
  if (r.upgrades > 0) {
    insight.hidden = false
    insight.innerHTML = `Your finish &amp; material choices add <strong>${moneyExact(r.upgrades)}</strong> — about <strong>${Math.round(r.upgradePct * 100)}%</strong> of the build.`
  } else {
    insight.hidden = false
    insight.innerHTML = `You're at standard finishes for this tier. Upgrading materials is where budgets move most — try a few options above.`
  }

  // Mobile bar
  $('#barRange').textContent = money(r.low) + ' – ' + money(r.high)
}

/* -------------------------------------------------------------------- wiring */
function refresh() { renderSummary() }

function init() {
  renderBasics()
  renderTiers()
  renderCategories()
  renderAddons()
  renderContingency()
  renderSummary()

  // Reset
  $('#resetBtn').addEventListener('click', () => {
    state.sqft = CONFIG.sqft.default
    state.region = 'suburban'; state.tier = 'signature'; state.story = 'one'
    CONFIG.categories.forEach(c => state.categories[c.id] = 0)
    state.addons = { garage: CONFIG.addons.find(a => a.id === 'garage').default, basement: 0, porch: false, outdoor: false, bonus: false, casita: false, pool: false, elevator: false }
    state.contingency = CONFIG.contingency.default
    init()
  })

  // Print / save
  $('#printBtn').addEventListener('click', () => window.print())

  // Smooth-scroll the CTA to top summary on mobile
  $('#ctaBtn').addEventListener('click', () => {
    const subject = encodeURIComponent('Custom home estimate — request a detailed quote')
    const r = compute()
    const body = encodeURIComponent(
      `Hi Dream Big Home Design team,\n\nI used the budget estimator and I'd love a detailed quote.\n\n` +
      `Estimated range: ${money(r.low)} – ${money(r.high)}\n` +
      `Size: ${state.sqft.toLocaleString()} sq ft · Tier: ${CONFIG.tiers.find(t => t.id === state.tier).label} · ` +
      `${CONFIG.stories.find(s => s.id === state.story).label} · ${CONFIG.regions.find(x => x.id === state.region).label}\n\n` +
      `Thanks!`)
    window.location.href = `mailto:tim@dreambighomedesign.com?subject=${subject}&body=${body}`
  })
}

document.addEventListener('DOMContentLoaded', init)
