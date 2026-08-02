# Custom Home Budget Estimator

An interactive, client-facing tool for **Dream Big Home Design**. Prospective clients pick the
options that fit their vision — size, quality tier, finishes & materials, add-ons — and watch a
transparent, itemized budget range build in real time. It answers the "what will my custom home
cost?" question without you having to price every conversation by hand.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. Open it directly in a browser or host the folder anywhere. |
| `estimator.css` | All styling (the "drafting table" identity, light + dark themes). |
| `estimator.js` | The cost model **and** the interface logic. |

No build step, no dependencies, no tracking. It's three static files — drop the folder on any web
host (or embed it on dreambighomedesign.com) and it works.

## Tuning the numbers to your market

**Every figure lives in one place:** the `CONFIG` block at the top of `estimator.js`. You don't need
to touch anything else. Update the values to match what you're seeing from your builders:

- `tiers[].base` — the starting **$/sq ft** for each quality level (the biggest driver).
- `categories[].options[].delta` — how much each finish/material upgrade adds **per sq ft**.
- `addons[]` — flat prices for garages, basements, pools, casitas, etc.
- `regions[].factor` — market multipliers (rural → high-cost metro).
- `contingency` and `rangeSpread` — the recommended cushion and the ± range width.

## What the estimate covers

Home **construction only** — structure, finishes, and the selected features. It intentionally
**excludes** land, site-specific work (long driveways, steep lots, wells & septic), design &
engineering fees, permits, and financing, and it's shown as a **range** because a firm price needs
the client's actual plans and site. That framing is stated on the page so expectations stay right.

## The math

```
$/sq ft = tier base + sum of every selected finish upgrade's delta
build   = $/sq ft × square footage × region factor × story factor
total   = build + add-ons + contingency
shown   = total ± rangeSpread   (a range, because it's a planning estimate)
```

The "Request a detailed quote" button opens a pre-filled email to tim@dreambighomedesign.com with
the client's selections, so a ballpark turns into a real lead in one click.
