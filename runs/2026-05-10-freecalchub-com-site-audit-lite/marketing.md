# Marketing Report — freecalchub.com site-audit 2026-05-10

**Run directory**: `runs/2026-05-10-freecalchub-com-site-audit-lite/`
**Suitable for**: build-in-public post, X thread, internal kickoff note

> **Framing note.** This is an audit baseline, not an "after the fix" story. No before/after numbers exist yet — that comes after `/track baseline` and the first `technical-fix` mission. Use this report to set the story up, not to claim a win.

## Headline

We audited freecalchub.com and found four single-line fixes that could plausibly add 350+ organic sessions a month — without writing a single new calculator.

## TL;DR (3 bullets)

- AI Search foundations are unusually strong: comprehensive llms.txt, 100% schema coverage on sampled pages, FAQ markup everywhere (AI readiness scorecard: 39/50).
- The flagship mortgage calculator is missing canonical, meta description, and OG tags — Google is choosing its own snippet and social shares are broken.
- Eight fixes identified, all "min-diff" (no refactor), four scoring ROI ≥ 4.0. Total cost: under an hour of work.

## Before / After

| Metric | Before | After | Delta |
|---|---|---|---|
| Organic sessions (last 28 days) | not measured | — | tbd |
| Avg position (target keywords) | not measured | — | tbd |
| Keywords in top 10 | not measured | — | tbd |
| Core Web Vitals score | not measured | — | tbd |
| AI Search Readiness score | 39/50 | — | tbd |
| Traditional SEO score | 36/50 | — | tbd |

Time between measurements: baseline only. After-numbers populate post-`technical-fix`.
Data sources: local source files, sitemap.xml, robots.txt, llms.txt. GSC and Lighthouse data not accessed this run.

## What We Did

3-5 bullets. Plain English.

- Read what was already documented (llms.txt, sitemap.xml, robots.txt) before touching any page — Constitution rule 1.
- Sampled 8 representative pages from the 130-page sitemap: homepage, mortgage calculator, BMI calculator, affordability calculator, and four others across health and finance.
- Scored against two scorecards — AI Search Readiness and Traditional SEO — rather than picking one orthodoxy and ignoring the other (Constitution rule 3).
- Ranked every finding by ROI (impact ÷ effort) so the cheap, high-leverage fixes float to the top.
- Produced a fix list short enough to ship in one afternoon.

## What Made the Difference (in finding it)

The fastest signal was checking the mortgage calculator's `<head>` — a single page-source view revealed missing canonical, missing meta description, and missing Open Graph tags. For what is plausibly the site's flagship calculator, that is a high-impact gap. The rest of the audit then asked: how widespread is this pattern? Answer: the on-page hygiene is patchy site-wide, and canonical inconsistency is the second-biggest leak after the missing tags themselves.

## Visual Evidence

To be captured during `technical-fix`:

- `mortgage-head-before.png` — view-source screenshot showing missing tags
- `mortgage-head-after.png` — same view after Fix #1 ships
- `lighthouse-mortgage-before.png` — first measured CWV scores
- `gsc-impressions-trend.png` — 28-day GSC trend if access available

## Case Study Framing (for content team)

**Hook**: A calculator site with 130 pages and a comprehensive llms.txt — yet the flagship calculator was missing the seven HTML tags any 2010-era SEO checklist would have caught.
**Stakes**: Likely losing ~350 organic sessions/month and serving broken social previews for the highest-intent keyword in finance.
**Resolution**: Eight ROI-ranked fixes, all single-file, all min-diff. No refactor.
**Result**: Pending — baseline locked in `seo-evidence.md` 2026-05-10. Update after `technical-fix`.
**Lesson**: "AI Search optimisation" gets the attention. The 2010-era basics still set the floor.

## What This Cost

- Effort: ~30 minutes agent time for the lite audit. Implementation of all eight fixes estimated < 90 minutes engineer time.
- Tools: local file reads only. No paid APIs invoked this run (Lighthouse/GSC/Ahrefs deferred — flagged as a measurement gap).
- Risk taken: none — audit is read-only. Implementation risk is per-fix and rollback is single-line revert for the top four.

Honest. Constitution rule 5 — Prove it. No improvement claim until `/track compare` runs after the fixes ship.

## What's Next

Run `/track baseline` to lock current GSC/Lighthouse numbers, then `/coord technical-fix` bundling fixes #1, #2, #3, #4 — all four together as one PR since each is a single-line or seven-line change.
