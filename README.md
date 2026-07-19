# Tim & Danielle · Wedding Planner 💍

A warm, private, all-in-one wedding planning app built for Tim & Danielle — but easy for
anyone to make their own. Everything you need to plan the big day in one calm place.

![Made with React + Vite](https://img.shields.io/badge/React-Vite-b98a7a)

## What's inside

- **Dashboard** — a live countdown to the wedding day plus at-a-glance progress across
  planning, guests, budget, and vendors.
- **Checklist** — a full month-by-month planning timeline (12+ months out through the final
  weeks) pre-loaded with the classic milestones. Check items off, add your own, watch the
  progress bar fill.
- **Guest List** — track invitees, party size, which side they're on, RSVP status, and meal
  choices. Live headcount and filtering by response.
- **Budget** — estimated vs. actual spend by category, running totals, and an over-budget
  warning. Pre-seeded with common wedding categories you can edit.
- **Vendors** — keep every vendor's category, booking status, contact info, and cost in one
  table.
- **Details** — names, date, venue, city, and free-form notes. Includes one-click
  **export / import** so you can back up your plan or move it between devices.

## Privacy

There is no account and no server. Every plan is stored locally in your browser
(`localStorage`), so your information stays on your device. Use **Details → Export backup**
to save a copy.

## Running it locally

```bash
npm install
npm run dev      # start the dev server (prints a local URL)
```

To create an optimized production build:

```bash
npm run build    # outputs to ./dist
npm run preview  # serve the built app locally
```

The build is fully static (`base: './'`), so the contents of `dist/` can be dropped onto any
static host — GitHub Pages, Netlify, Vercel, or a plain web server.

## Tech

React 18 + Vite. No backend, no tracking, no dependencies beyond React. Custom CSS with a
soft, romantic palette and the Cormorant Garamond / Jost type pairing.

---

Made with ♥ for Tim & Danielle.
