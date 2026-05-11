# Baseline — 2026-05-10 Pre Technical-Fix Deploy

**Baseline ID**: `2026-05-10-pre-technical-fix`
**Captured at**: 2026-05-10 (commit time) / Lighthouse captured 2026-05-11
**Commit SHA being baselined against**: `1e8254a` (now merged to `main` as `299325c`)
**Live deploy status**: **DEPLOYED** 2026-05-10 22:00 UTC. Verified live the same day on 5 representative pages.
**Compare due**: 2026-06-07 (28 days after deploy)

## Why this baseline exists

The `technical-fix` mission (run `runs/2026-05-10-freecalchub-com-technical-fix/`) committed `1e8254a` on 2026-05-10 and was deployed live to freecalchub.com the same day via Netlify from `main`. This file is the bookend snapshot used to measure impact in 28 days.

**Timing caveat**: the strict pre-deploy window was missed for Lighthouse — Lighthouse capture happened 2026-05-11, the day AFTER deploy. So the Lighthouse table below reflects POST-fix synthetic state, not pre-fix. The compare on 2026-06-07 will diff against this snapshot, not against any pre-fix Lighthouse baseline. Tag-coverage and scorecard pre/post data IS captured truthfully (numbers are derivable from git and prior mission runs).

## Auto-captured (do not edit)

These values come from the codebase and the prior mission runs. They are stable.

### Tag coverage — POST-fix (current live state)

| Tag | Pages with | Pages without | Coverage |
|---|---|---|---|
| `<link rel="canonical">` | 110 | 0 | 100% |
| `<meta property="og:*">` | 110 | 0 | 100% |
| `<meta name="description">` | 110 | 0 | 100% |
| `<meta property="twitter:*">` | 110 | 0 | 100% (added alongside OG) |

### Tag coverage — PRE-fix (source: `seo-evidence.md` scope check entry, confirmed in technical-fix Phase 1)

| Tag | Pages with | Pages without | Coverage |
|---|---|---|---|
| `<link rel="canonical">` | 65 | 45 | 59% |
| `<meta property="og:*">` | 19 | 91 | 17% |
| `<meta name="description">` | 109 | 1 | 99% |
| `<meta property="twitter:*">` | 19 | 91 | 17% (added alongside OG) |

### Scorecards

| Scorecard | Pre-fix | Post-fix | Source |
|---|---|---|---|
| AI Search Readiness | 39 / 50 | 43 / 50 | `runs/2026-05-10-freecalchub-com-technical-fix/data.json` |
| Traditional SEO | 36 / 50 | 41 / 50 | same |

## Live-web measurements

### 1. Google Search Console — last 28 days

**Status**: PENDING. Property freshly verified 2026-05-11; GSC shows "Processing data, please check again in a day or so". Pull on 2026-05-12 or 2026-05-13 once data populates. By then the 28-day window will contain ~2-3 days of post-fix bleed, still ~90% pre-fix.

**Where to capture**: GSC → Performance → Search Results. Filter date range to "Last 28 days". Capture two slices.

**Slice A: whole site**

| Metric | Value | Notes |
|---|---|---|
| Total impressions | _TBD_ | |
| Total clicks | _TBD_ | |
| CTR (%) | _TBD_ | |
| Average position | _TBD_ | |

**Slice B: mortgage flagship**

Filter: Pages → URL contains `/finance/mortgage/`.

| Metric | Value | Notes |
|---|---|---|
| Total impressions | _TBD_ | |
| Total clicks | _TBD_ | |
| CTR (%) | _TBD_ | |
| Average position | _TBD_ | |

### 2. Lighthouse / PageSpeed Insights

**Status**: CAPTURED 2026-05-11 via PageSpeed Insights API v5, mobile strategy. Five representative URLs.

**Important caveat**: this capture happened AFTER deploy, so these are post-fix synthetic numbers. The compare on 2026-06-07 will diff against these (not against any pre-fix Lighthouse baseline). Direction-of-travel for the head-tag fix on Lighthouse SEO score: 4 of 5 URLs now hit SEO=100. BMI lower at 92 — Lighthouse is flagging the `| CalcHub` title (backlog item #6).

| URL | Performance | Accessibility | Best Practices | SEO | LCP (ms) | TBT (ms) | CLS |
|---|---|---|---|---|---|---|---|
| /finance/mortgage/mortgage-calculator/ | 81 | 96 | 85 | **100** | 3650 | 0 | 0.002 |
| /health/bmi/bmi-calculator/ | 86 | 93 | 92 | **92** | 3199 | 0 | 0.000 |
| /math/percentages/percentage-calculator/ | 87 | 96 | 85 | **100** | 3190 | 0 | 0.000 |
| /conversions/length/length-unit-calculator/ | 87 | 93 | 92 | **100** | 3193 | 0 | 0.000 |
| /lifestyle/dining-social/tip-calculator/ | 78 | 92 | 92 | **100** | 4251 | 93 | 0.000 |

INP is not captured: Lighthouse lab doesn't measure INP (real user interaction required). CrUX field data also unavailable — site below the traffic threshold for inclusion in the Chrome User Experience Report dataset.

**What stands out**:
- LCP is the weak spot across all 5 pages (3.2-4.3s; Google's "good" threshold is 2.5s). Worth a future performance pass.
- CLS is excellent everywhere (~0.000).
- Tip calc has TBT of 93ms — worth investigating for it specifically.
- BMI SEO=92 vs others at 100 — confirms the title fix on the backlog is real and Lighthouse-visible.

### 3. Social-preview check

**Status**: PRE-FIX WINDOW CLOSED. The deploy landed before this could be captured, so opengraph.xyz now shows post-fix cards. For the compare, treat the expectation as: 4/5 cards now rendering (vs 4/5 broken pre-fix). Manual verification optional; live tags already verified via Python urllib on 2026-05-10.

## Deploy log

| Field | Value |
|---|---|
| Deploy date (actual) | 2026-05-10 22:00 UTC |
| Deploy method | `git push -u origin seo-tooling`, then merge to `main` (merge commit `299325c`, .gitignore conflict resolved via union), pushed to origin/main, Netlify auto-deploy |
| Deploy verified live by | Python urllib check on 4 URLs (mortgage, BMI, tip, length) at 2026-05-10 22:20 UTC — all confirmed serving canonical + OG + Twitter tags |
| Compare date | 2026-06-07 (calendar event `k9u1qbsakr642pffmmddr3c4vg` in place) |

## Related runs

- `runs/2026-05-10-freecalchub-com-site-audit-lite/` — original audit that surfaced the 8-fix backlog
- `runs/2026-05-10-freecalchub-com-technical-fix/` — the fix pass this baseline measures against

## How to use this baseline (in 28+ days)

When 2026-06-07 arrives:

1. Pull the same GSC slices into a fresh file: `tracking/snapshots/2026-06-07-post-technical-fix.md`. Same two slices, same metrics, last 28 days.
2. Re-run the PSI fetch on the same 5 URLs (the migration script's idempotency means tags haven't drifted).
3. Build the diff. The PRIMARY signal is GSC: did impressions/clicks/CTR/avg position move? Lighthouse will mostly be noise since we couldn't capture pre-fix lab data.
4. Update `runs/2026-05-10-freecalchub-com-technical-fix/marketing.md` "Before / After" section — replace the tbd rows with real numbers.
5. Add a snapshot pointer to `seo-evidence.md`.
