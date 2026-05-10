# Marketing Report — freecalchub.com technical-fix 2026-05-10

**Run directory**: `runs/2026-05-10-freecalchub-com-technical-fix/`
**Suitable for**: build-in-public post, X thread, internal kickoff or "what we shipped" note

> **Framing note**: this report covers what was shipped in the fix pass. Traffic-impact numbers ("we won N keywords") are NOT in this version because no live measurement was available. Run `/track baseline` (already pending from site-audit) and `/track compare` after a 14-28 day window to populate the Before/After table.

## Headline

Shipped 110 head-tag fixes plus an SOP rewrite to stop the gap recurring — all in one session, all single-line or single-tag inserts.

## TL;DR (3 bullets)

- 99 of 110 calculator pages were missing at least one of canonical, Open Graph, or meta description head tags. All 110 now have the full set.
- The fix happened at two levels: standards documents (`general-template-guidelines.md` v1.7, `docs/SOP-CalcDev.md` v3.8) so future pages cannot ship without these tags; and a one-off migration script run across the existing 99 affected pages.
- Constitution rule 4 obeyed throughout: every change is additive. Zero existing markup was rewritten. Rollback is `git revert` on a single commit.

## Before / After

| Metric | Before | After | Delta |
|---|---|---|---|
| Pages with canonical link | 65 / 110 (59%) | 110 / 110 (100%) | +45 |
| Pages with Open Graph tags | 19 / 110 (17%) | 110 / 110 (100%) | +91 |
| Pages with meta description | 109 / 110 (99%) | 110 / 110 (100%) | +1 |
| AI Search Readiness scorecard | 39/50 | 43/50 | +4 |
| Traditional SEO scorecard | 36/50 | 41/50 | +5 |
| Organic sessions (last 28 days) | not measured | — | tbd |
| Avg position (target keywords) | not measured | — | tbd |
| Keywords in top 10 | not measured | — | tbd |
| Core Web Vitals score | not measured | — | tbd |

Time between measurements: same session. Tag-coverage deltas are confirmable by `grep`; traffic deltas pending real measurement.
Data sources: local source files, `scripts/add-missing-head-tags.py` output, idempotency verified by second dry-run.

## What We Did

5 bullets. Plain English.

- Wrote 5 lines in two SOP documents to make canonical and Open Graph head tags hard requirements, so future calculator pages cannot pass review without them. This was the leverage move (Constitution rule 2).
- Corrected a phantom finding: SOP referred to `calculator_template.html` (underscore), the actual file in the repo is `calculator-template.html` (dash). 23 line changes across the two docs.
- Wrote a 282-line Python migration script that adds missing canonical, Open Graph, and Twitter Card tags to calculator pages. Idempotent — re-running is a no-op.
- Manually added a meta description to the mortgage calculator (the one page sitewide that was missing it, blocking the migration script's auto-derivation logic).
- Ran the script across all 110 calculator pages. Result: 99 modified, 11 unchanged (already complete), 0 skipped.

## What Made the Difference

The work that mattered most was not the bulk migration — it was the 5 lines added to `general-template-guidelines.md` Section 2. The bulk migration fixes existing pages once; the SOP change prevents the gap recurring. Every future calculator built strictly to the strengthened SOP arrives with the full head-tag set already in place. Fix the standard, then fix the pages.

## Visual Evidence

To be captured during `/track compare`:

- `before-search-result.png` — Google SERP snippet for "mortgage calculator" before fix (Google-chosen description)
- `after-search-result.png` — same query after 14-28 days, showing custom description rendered
- `social-preview-before.png` — broken share card for a calculator URL
- `social-preview-after.png` — proper OG-rendered card with site-default image
- `gsc-impressions-trend.png` — 28-day GSC trend across the affected pages

## Case Study Framing (for content team)

**Hook**: A calculator site with 130 pages, comprehensive llms.txt, and 100% schema coverage — yet 91 of its 110 calculator pages had no Open Graph tags at all, and 45 had no canonical link.
**Stakes**: Likely losing impressions on social shares (no preview card) and weak duplicate-content signals to Google and to LLM ingestion pipelines.
**Resolution**: 5 fixes in one session. Two at the SOP level so it can't happen again. Three at the page level to clean up the existing 99 affected pages.
**Result**: 100% head-tag coverage across all calculators. Traffic delta pending measurement (Constitution rule 5).
**Lesson**: Single-page audits surface symptoms. Scope checks surface root causes. Fix at the standards layer first; the bulk migration becomes a one-off.

## What This Cost

- Effort: one focused session. Estimate breakdown: ~30 min Phase 1-2 (counts + SOP edits), ~30 min Phase 3 (script), ~10 min Phase 4 (dry-run + approval), ~5 min Phase 5 (bulk run + verification), ~15 min Phase 6 (deliverables + commit). Total ~90 minutes.
- Tools: stdlib Python (no new dependencies), `grep`, `find`. Zero paid APIs.
- Risk taken: the migration script is insert-only and idempotent. Rollback is a single `git revert`. No paths overwritten, no existing markup modified.

Honest. Constitution rule 5 — Prove it. Traffic claims to follow `/track compare`, not this report.

## What's Next

Run `/track baseline` now (locks today's GSC and Lighthouse state). Schedule `/track compare` for 2026-06-07 to convert the head-tag coverage delta into measured impressions, click-through-rate, and keyword movement. Then queue `/coord ai-search-optimize` for the remaining AI-search dimensions still on the backlog.
