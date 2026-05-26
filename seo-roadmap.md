# FreeCalcHub SEO Roadmap

**Last updated**: 2026-05-11
**Live URL**: https://www.freecalchub.com
**Last audit**: 2026-05-10 (`runs/2026-05-10-freecalchub-com-site-audit-lite/`)
**Last technical-fix**: 2026-05-10 (`runs/2026-05-10-freecalchub-com-technical-fix/`)
**Tracking baseline**: `tracking/baselines/2026-05-10-pre-technical-fix.{md,json}`
**Next measurement window**: 2026-06-07 (28 days post technical-fix deploy)

## How this document works

This is the forward-looking strategic plan. Three sections:

- **Active**: items being worked on right now (typically 1-3 max).
- **Backlog**: scoped items ready to execute, sorted by ROI descending. Pull from here when active completes.
- **Themes**: strategic initiatives, often needing scoping before they can yield concrete backlog items. Lower-ranked sections may have placeholder estimates.

Two companion files keep this lean:

- `seo-backlog.md` — tactical leftover items from completed audits (subset of Backlog below). Items move from there to here as their scope sharpens.
- `seo-evidence.md` — backward-looking evidence and run history.

**Scoring**:
- Impact (1-10): traffic / visibility lift if shipped, on the scale of the site (1 = imperceptible, 5 = noticeable on a single page or category, 10 = sitewide step-change).
- Effort (1-10): 1 = single tag/line edit, 5 = mid-size component refactor, 10 = multi-week initiative.
- ROI = Impact / Effort. Higher = pull first.
- Confidence (L/M/H): how sure we are about the impact estimate. Low for things not yet measured.

**Workflow**: pick the highest-ROI item in Active or top of Backlog. Ship it via the appropriate mission (`/coord technical-fix` etc.) or direct edit. Move shipped items to Done with date + commit SHA.

## Active

Nothing in flight as of 2026-05-11 22:30 UTC. Last batch (BMI canonical + AI crawler allow blocks) shipped live earlier today.

**Next concrete action**: pull GSC numbers 2026-05-12 or 2026-05-13 (property finishes processing). Then pick the next item from Backlog or pause until 2026-06-07 compare.

## Backlog (ROI-ranked, ready to execute)

Sorted: ROI descending, then effort ascending (ties broken in favour of less work).

| # | Fix | Theme | Impact | Effort | ROI | Conf. | Source |
|---|---|---|---|---|---|---|---|
| 1 | BMI title `\| CalcHub` → `\| FreecalcHub` (also propagated to og:title and twitter:title on that page) | Content | 3 | 1 | 3.0 | M | technical-fix observation 2026-05-10 |
| 2 | Verify or soften "10,000+ users" and "CFPB-compliant" claims in Organization schema (`index.html` line 31) | Authority | 3 | 1 | 3.0 | M | site-audit fch-008 |
| 3 | Defer Chart.js loading on calculator pages that use it (currently synchronous in calculator-template.html line 31) | Performance | 6 | 2 | 3.0 | M | Performance audit |
| 4 | Noindex or ship Coming Soon stub pages: monthly-budget, expense-tracker, debt-to-income-ratio | Content | 6 | 2 | 3.0 | L | site-audit fch-005 |
| 5 | Standardise all canonicals sitewide to absolute www form (broader sweep beyond items already shipped) | Technical | 9 | 3 | 3.0 | M | site-audit fch-002 |
| 6 | Profile + fix LCP bottleneck on mortgage-calculator (today's LCP: 3.65s, target 2.5s) | Performance | 7 | 3 | 2.3 | M | Lighthouse 2026-05-11 |
| 7 | Refresh `sitemap.xml` `lastmod` dates for content actually updated since 2025-10-24 | Technical | 4 | 2 | 2.0 | L | site-audit fch-007 |

## Themes (strategic, longer-horizon)

### 1. Performance / Core Web Vitals

**Current state** (2026-05-11 Lighthouse mobile, lab data — site below CrUX traffic threshold):
- Performance scores: 78-87 across 5 sampled pages
- LCP: 3.2-4.3s sitewide (target ≤ 2.5s). All 5 sampled pages fail Google's "good" threshold.
- CLS: ~0.000 everywhere (excellent — don't touch)
- TBT: 0-93ms (good)

**Why it matters**: LCP is now the biggest unaddressed lever. Lighthouse Performance lifts of 10-15 points are plausible. Real-world impact harder to predict but compounds across 110 pages.

**Candidate items**:
| Item | Impact | Effort | ROI | Conf. | Notes |
|---|---|---|---|---|---|
| Profile LCP on mortgage-calculator, identify root cause | 7 | 3 | 2.3 | M | First step; reveals subsequent fixes |
| Defer Chart.js load on calculator-template.html | 6 | 2 | 3.0 | M | Chart.js currently synchronous in head |
| Audit blocking CSS in calculator-template.html (8 stylesheets in head) | 6 | 4 | 1.5 | L | Consolidation or critical-CSS pattern |
| Investigate tip-calculator LCP=4.3s (worst of sampled set) | 4 | 2 | 2.0 | L | Possibly currency-exchange API call on load |
| Self-host Font Awesome instead of CDN | 3 | 2 | 1.5 | M | Reduces TLS handshake to cdnjs |
| Preload key fonts and hero CSS | 4 | 2 | 2.0 | M | Standard CWV best practice |

### 2. Content & Topical Coverage

**Current state**: 110 calculator pages shipped, 9 thematic clusters (per `llms.txt`). Three Coming Soon stubs in budgeting. No content-gap analysis has been run — unknown what competitors rank for that freecalchub doesn't.

**Why it matters**: organic growth ceiling without new topical coverage. AI Search Mastery thesis depends on calculator topical depth.

**Candidate items**:
| Item | Impact | Effort | ROI | Conf. | Notes |
|---|---|---|---|---|---|
| Run `/coord content-gap` against top competitors (calculator.net, rapidtables.com) | 8 | 4 | 2.0 | L | Reveals concrete topic backlog |
| Ship Coming Soon stub calculators (or noindex) | 6 | varies | ? | L | budgeting: monthly-budget, expense-tracker, debt-to-income |
| Add TL;DR summary block at top of each calculator (push answerability score from 8/10 to 9-10/10) | 6 | 6 | 1.0 | M | 110 pages × ~10 min each |
| Refresh educational content where dateModified > 6 months | 4 | varies | ? | L | Cross-ref sitemap lastmod refresh |

### 3. AI Search Optimisation

**Current state**: scorecard 43/50 post technical-fix.
- llms.txt: 9/10 (comprehensive, 134 pages)
- Schema coverage: 9/10 (100% sampled pages)
- Answerability: 9/10 (FAQ schema everywhere; could go higher with TL;DR blocks)
- Sitemap freshness: 6/10 (most URLs at stale lastmod)
- AI crawler policy: 7/10 → 9/10 after today's robots.txt update (re-score on next audit)

**Why it matters**: defensible competitive moat. Most calculator sites won't bother. Aligns with Jamie's AI Search Mastery thesis.

**Candidate items**:
| Item | Impact | Effort | ROI | Conf. | Notes |
|---|---|---|---|---|---|
| Add TL;DR summary block to top of each calculator (also tracked under Content) | 6 | 6 | 1.0 | M | Direct lift on answerability dimension |
| Refresh sitemap lastmod for actually-changed pages | 4 | 2 | 2.0 | M | Sitemap freshness dimension |
| Run `/coord ai-search-optimize` after next content batch | 5 | 3 | 1.7 | M | Re-scores full AI scorecard |
| Add JSON-LD `dateModified` ISO 8601 timestamps everywhere (currently mixed) | 3 | 3 | 1.0 | L | Polish; some pages may already comply |

### 4. Authority Signals & Backlinks

**Current state**: not measured (no Ahrefs/Moz). Zero structured outreach. `seo-builder` agent exists in `.claude/agents/` for this purpose.

**Why it matters**: long-term ranking ceiling for competitive head terms ("mortgage calculator", "bmi calculator"). Calculator sites need authority to compete.

**Candidate items**:
| Item | Impact | Effort | ROI | Conf. | Notes |
|---|---|---|---|---|---|
| Get a backlink audit (free Ahrefs Webmaster Tools, or paid sample) | 4 | 2 | 2.0 | M | Establishes current authority baseline |
| Identify 5 "calculator guide" link prospects (educational sites, financial blogs) | 5 | 4 | 1.3 | L | First outreach batch |
| Submit to relevant directories (calculator-specific, finance education) | 3 | 3 | 1.0 | L | Low-effort table stakes |
| Pitch a guest article on a finance blog with calculator embed | 7 | 8 | 0.9 | L | High-payoff, slow burn |

### 5. Schema & Structured Data Quality

**Current state**: 100% coverage on sampled pages. SoftwareApplication, FAQPage, Organization, WebSite, AggregateRating all present. But AggregateRating values look manually set (e.g. 4.8 / 189 ratings on mortgage) — unverifiable. "10,000+ users" / "CFPB-compliant" claims in Organization schema same issue.

**Why it matters**: Constitution rule 5. Unverifiable structured-data claims are misrepresentation. Google has demoted sites for this in past algo updates.

**Candidate items**:
| Item | Impact | Effort | ROI | Conf. | Notes |
|---|---|---|---|---|---|
| Audit all AggregateRating values across 110 pages — verify or remove | 5 | 4 | 1.3 | M | Single grep + decision per page |
| Verify or soften Organization schema claims (in Backlog as #6) | 3 | 1 | 3.0 | M | One-page fix |
| Standardise all date fields to ISO 8601 with timezone | 3 | 3 | 1.0 | L | Cross-ref Theme 3 item |
| Add `Calculator` or `MathSolver` schema (if Schema.org adds it) | 2 | 3 | 0.7 | L | Speculative; Schema.org evolution |

### 6. Conversion Tracking & UX

**Current state**: unknown. `tracking.yml` references "calculator_completion_rate" and "calculator_use" events but GA4 firing not audited. UX never RECON'd against current calculators.

**Why it matters**: SEO without conversion measurement is half-blind. If traffic doubles but conversion rate is 0%, no business value.

**Candidate items**:
| Item | Impact | Effort | ROI | Conf. | Notes |
|---|---|---|---|---|---|
| Audit GA4 event firing on 3 representative calculators | 6 | 2 | 3.0 | M | Direct visibility into funnel |
| Run `/recon` (UI/UX) on top-traffic calculator | 5 | 3 | 1.7 | L | Surfaces friction not visible in code |
| Add explicit "Calculate" CTA tracking + result-share tracking | 4 | 4 | 1.0 | L | After GA4 audit |

## Done

Latest shipped items. Older items archived after 90 days.

- **2026-05-11** — Explicit AI crawler allow blocks in `robots.txt` (5 bots). Commit `1768045`. Source: site-audit fch-006.
- **2026-05-11** — BMI canonical relative → absolute www form. Commit `ce427f7`. Source: site-audit fch-003.
- **2026-05-11** — Twitter Card gaps on 2 math/basic pages + script bug fix + tracking infra (schema, baseline, backlog). Commit `2d52f39`.
- **2026-05-10** — Strengthen head-tag SOPs + bulk migration adds canonical/OG/Twitter to 99 calculator pages. Commit `1e8254a` merged via `299325c`. Source: technical-fix mission.
- **2026-05-10** — Site-audit lite. AI Search 39/50, Traditional 36/50, 8-item backlog identified. Source: site-audit mission.

## Parked

Items considered and deliberately not done, with reason. (Use this section to record decisions, not just to-dos.)

- _(empty so far)_

## Notes

This file complements `seo-backlog.md` (tactical fixes from completed audits) and `seo-evidence.md` (backward-looking evidence). When a Theme item gets scoped to a known fix, move it up into Backlog. When a Backlog item ships, move it to Done with the commit SHA.

If this file format proves useful, consider promoting a stripped version to `templates/seo-roadmap-template.md` so future SEO-Agent projects have a standard.
