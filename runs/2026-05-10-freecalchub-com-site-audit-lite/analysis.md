# Analysis Report — freecalchub.com site-audit 2026-05-10

**Run directory**: `runs/2026-05-10-freecalchub-com-site-audit-lite/`
**Mission mode**: lite
**Pages assessed**: 8 (sampled from 130 in sitemap.xml)
**Constitution rules applied**: 1 (Read before scanning), 2 (Prioritise ROI), 3 (AI Search First), 4 (Minimal diffs)

## Summary

freecalchub.com has unusually strong AI Search foundations (llms.txt comprehensive, schema coverage ~100% on sampled pages) but a cluster of small on-page hygiene issues on flagship pages — most notably the mortgage calculator missing canonical, meta description and OG tags. Top three single-line fixes alone could plausibly add ~350 sessions/month at near-zero effort. Biggest risk: canonical inconsistency sitewide (four different patterns observed in the sample) is silently splitting ranking equity between www and non-www variants.

## Prioritised Fix List

Sort by ROI descending. Highest-impact-lowest-effort fixes at the top.

| # | Fix | Category | Impact (1-10) | Effort (1-10) | ROI | Est. lift | Min-diff? | Owner |
|---|-----|----------|---------------|---------------|-----|-----------|-----------|-------|
| 1 | Add canonical + meta description + OG tags to mortgage-calculator/index.html | technical | 8 | 1 | 8.0 | ~350 sessions/mo | yes | @seo-technical |
| 2 | Fix BMI calculator canonical: relative → absolute www URL | technical | 6 | 1 | 6.0 | ~2 keywords top10 | yes | @seo-technical |
| 3 | Complete the truncated meta description on affordability-calculator | content | 5 | 1 | 5.0 | ~7% CTR lift | yes | @seo-content |
| 4 | Add explicit allow blocks for GPTBot, Claude-User, PerplexityBot, Google-Extended in robots.txt | ai-search | 4 | 1 | 4.0 | future-proofing | yes | @seo-technical |
| 5 | Standardise all canonicals to absolute https://www.freecalchub.com/ sitewide | technical | 9 | 3 | 3.0 | ~8 keywords top10 | yes | @seo-technical |
| 6 | Noindex or replace Coming Soon stubs (monthly-budget, expense-tracker, debt-to-income) | content | 6 | 2 | 3.0 | ~50 sessions/mo | yes | @seo-content |
| 7 | Verify or soften "10,000+ users" / "CFPB-compliant" claims in Organization schema | authority | 3 | 1 | 3.0 | trust signal | yes | @seo-strategist |
| 8 | Refresh sitemap lastmod for content actually updated since 2025-10-24 | technical | 4 | 2 | 2.0 | recrawl signal | yes | @seo-technical |

**Effort scale**: 1 = single tag/line edit. 5 = mid-size refactor of one component. 10 = multi-week project.
**Min-diff?**: yes = changes only the necessary tags/schema (Constitution rule 4).

## Per-Fix Detail

### Fix #1 — Add canonical + meta description + OG tags to mortgage-calculator/index.html

**Why**: Mortgage is plausibly the flagship calculator. Sampled HTML shows the page has schema and title but no `<link rel="canonical">`, no `<meta name="description">`, and no Open Graph properties. Google has to choose its own snippet (often worse than a hand-written one); social shares look broken; canonical equity may be assigned ambiguously.
**Where**: `finance/mortgage/mortgage-calculator/index.html`, head section, lines 11-30.
**Replication**: `curl -s https://www.freecalchub.com/finance/mortgage/mortgage-calculator/ | grep -iE 'canonical|description|og:'` returns nothing meaningful.
**Implementation**: Add seven lines in the `<head>`:
```html
<link rel="canonical" href="https://www.freecalchub.com/finance/mortgage/mortgage-calculator/" />
<meta name="description" content="{{60-160 chars; reuse the description already in the SoftwareApplication schema on this page}}" />
<meta property="og:title" content="Mortgage Calculator — FreeCalcHub" />
<meta property="og:description" content="{{same as meta description}}" />
<meta property="og:url" content="https://www.freecalchub.com/finance/mortgage/mortgage-calculator/" />
<meta property="og:type" content="website" />
<meta property="og:image" content="{{site default OG image}}" />
```
**Rollback**: Single-file diff. Revert the commit.
**Evidence**: `finance/mortgage/mortgage-calculator/index.html` lines 11-30.

### Fix #2 — Fix BMI calculator canonical: relative → absolute www URL

**Why**: BMI is a high-volume keyword. Current canonical is a relative path, which Google generally tolerates but interprets case-by-case. An absolute `https://www.` form removes ambiguity and matches the rest of the site's canonical pattern (where it exists).
**Where**: `health/bmi/bmi-calculator/index.html` line 15.
**Replication**: View source; canonical href starts with `/` not `https://`.
**Implementation**: Replace the single line with `<link rel="canonical" href="https://www.freecalchub.com/health/bmi/bmi-calculator/" />`.
**Rollback**: Revert one line.
**Evidence**: `health/bmi/bmi-calculator/index.html` line 15.

### Fix #3 — Complete truncated meta description on affordability-calculator

**Why**: Current meta description ends with an ellipsis (`...`). Truncation at a content boundary often means the writer pasted in a snippet and lost the rest. The full description already exists in the page's SoftwareApplication schema description field — reuse it.
**Where**: `finance/mortgage/affordability-calculator/index.html` line 13.
**Replication**: View source; `<meta name="description">` value ends `…`.
**Implementation**: Copy the schema's `description` value into the meta description tag. One line.
**Rollback**: Revert one line.
**Evidence**: `finance/mortgage/affordability-calculator/index.html` line 13.

### Fix #4 — Add explicit AI crawler allow blocks in robots.txt

**Why**: Current `robots.txt` allows all crawlers implicitly via `User-agent: *`. That is fine today, but explicit allow blocks for the major AI crawlers (a) make policy auditable, (b) survive a future site-wide default-deny, and (c) signal intent to LLM indexing pipelines that some still respect.
**Where**: `robots.txt` root.
**Implementation**: Append:
```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
```
**Rollback**: Delete the blocks.
**Evidence**: `robots.txt`.

### Fix #5 — Standardise canonicals sitewide

**Why**: Four patterns observed across eight sampled pages: www absolute, non-www absolute, relative, and missing entirely. Even if Google reconciles most of these, the inconsistency leaks ranking signals between variants and makes future migrations harder.
**Where**: Every page's `<head>`. If templates are used, fix the template; otherwise scripted find-and-replace across the `*.html` set.
**Replication**: `grep -rEi '<link[^>]+rel=["'\'']canonical' --include='*.html'` and inspect distribution of href patterns.
**Implementation**: Decide one form (recommend `https://www.freecalchub.com/{path}/` with trailing slash for directory-style URLs). Apply via template or scripted edit. Keep diff to the canonical tag only.
**Rollback**: Single revert if templated; per-file revert if not.
**Evidence**: Cross-page sampling.

### Fix #6 — Noindex or replace Coming Soon stubs

**Why**: monthly-budget-calculator, expense-tracker, debt-to-income-ratio-calculator (and likely others) appear in the sitemap with placeholder content. Thin/duplicate pages dilute crawl budget and quality signal.
**Where**: `finance/budgeting/{monthly-budget,expense-tracker,debt-to-income-ratio}-calculator/index.html`.
**Implementation**: Either ship the calculator or add `<meta name="robots" content="noindex">` and remove from sitemap.xml until shipped.
**Rollback**: Remove the noindex when content is real.
**Evidence**: Listed in sitemap, content placeholder on visit.

### Fix #7 — Verify or soften unverifiable schema claims

**Why**: Organization schema description includes "10,000+ users" and "CFPB-compliant". If either is unverifiable, both become misrepresentation in structured data — small risk surface but real one. Constitution rule 5 ("Prove it") applies to claims in structured data, not just performance claims.
**Where**: `index.html` line 31 — Organization schema.
**Implementation**: If you can substantiate both, link the source (e.g. analytics screenshot, compliance review). If not, replace with softer wording you can stand behind ("calculators reviewed against CFPB guidance", "thousands of users").
**Rollback**: Restore prior values.
**Evidence**: `index.html` line 31.

### Fix #8 — Refresh sitemap lastmod dates

**Why**: 100+ URLs in `sitemap.xml` carry `<lastmod>2025-10-24</lastmod>`. If those pages truly haven't changed in 6+ months, fine. If any have, the stale lastmod suppresses recrawl. Audit; correct where needed.
**Where**: `sitemap.xml`.
**Implementation**: For each URL, check git log or page mtime; set lastmod to the real most-recent edit. Automatable.
**Rollback**: Revert the sitemap.
**Evidence**: `sitemap.xml`.

## AI Search Readiness Scorecard (Constitution rule 3)

| Dimension | Status | Score | Notes |
|---|---|---|---|
| llms.txt | present, comprehensive | 9/10 | 134 pages, 9 clusters, ~34,928 words, generated 2026-02-14. Genuine asset. Minor concern: content within may be staler than the file's lastmod. |
| Structured data coverage | 100% of sampled pages | 9/10 | SoftwareApplication, FAQPage, Organization, WebSite, AggregateRating present. AggregateRating values flagged in Fix #7 for verifiability. |
| Answerability (LLM-friendly headings, FAQ schema, summary blocks) | strong | 8/10 | FAQ schema everywhere; definitional content clear. Could push higher with TL;DR summary blocks at top of each calculator. |
| Sitemap freshness | sitemap itself recent (2025-11-30); URLs clustered 2025-10-24 | 6/10 | Recrawl signal weak. See Fix #8. |
| Robots policy for AI crawlers (GPTBot, Claude-User, PerplexityBot, etc.) | allow (implicit via User-agent: *) | 7/10 | Allowed by default but not explicitly named. Fix #4 makes this explicit. |

**AI scorecard total**: 39/50

## Traditional SEO Scorecard

| Dimension | Status | Score | Notes |
|---|---|---|---|
| Core Web Vitals (LCP/INP/CLS) | not measured (no Lighthouse access) | 5/10 | Conservative placeholder. Page construction (deferred JS, ~6-8 stylesheets, no synchronous chart.js on most pages) suggests likely 7/10 if measured. Run Lighthouse before acting on this. |
| Crawlability and indexability | mostly clean | 7/10 | Sitemap present and structured; robots.txt clean. Penalised for canonical inconsistency (Fix #5) and Coming Soon stubs in sitemap (Fix #6). |
| On-page (titles, descriptions, headings) | ~80% complete | 6/10 | Mortgage missing canonical+description+OG. Affordability has truncated meta. BMI canonical relative. |
| Internal linking | not deeply assessed (lite scope) | 6/10 | Schema relatedLink arrays show intent. Category hub structure sensible. Actual `<a>` link graph not crawled. |
| Authority signals (backlinks, mentions) | not measured (no Ahrefs/Moz) | 5/10 | Conservative placeholder. AggregateRating values in schema flagged in Fix #7. |

**Traditional scorecard total**: 36/50

## Risks and Caveats

Three constraints on this audit, called out honestly:

- **No live measurement.** Core Web Vitals, ranking positions, backlink counts, GA4/GSC traffic — none were accessible to the agent during this run. Scores marked "not measured" are placeholders. Run Lighthouse and pull GSC before treating those numbers as real.
- **Sampling.** Eight pages assessed out of 130 in the sitemap. Findings about canonical inconsistency and on-page gaps are likely representative but not guaranteed sitewide. Fix #5 implicitly trusts the sample.
- **Traffic-lift estimates are low-confidence.** The ~350 sessions/month figure for Fix #1 is a plausible-order-of-magnitude estimate from comparable mortgage-calculator pages, not a measured projection. Treat as a "this is worth doing" signal, not a forecast.

## What Was Re-Used (Constitution rule 1)

Findings from prior runs (read from `seo-evidence.md`): none. This is the first audit logged. Future audits should consult this run's pointer in `seo-evidence.md`.

## Next Suggested Mission

`technical-fix` bundling Fixes #1, #2, #3, #4 (all single-line, all ROI ≥ 4.0). Run `/track baseline` immediately before, `/track compare` after, per Constitution rule 5.
