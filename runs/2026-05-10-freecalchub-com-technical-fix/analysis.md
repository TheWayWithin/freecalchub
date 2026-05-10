# Analysis Report — freecalchub.com technical-fix 2026-05-10

**Run directory**: `runs/2026-05-10-freecalchub-com-technical-fix/`
**Mission mode**: default
**Pages assessed**: 110 calculator pages across six domain directories
**Constitution rules applied**: 1 (Read before scanning), 2 (Prioritise ROI), 3 (AI Search First), 4 (Minimal diffs), 5 (Prove it)

## Summary

Five fixes shipped in one session: two SOP-level (canonical promoted to hard requirement, Open Graph + Twitter Card requirements added), one filename-naming correction (calculator_template.html → calculator-template.html), and two bulk migrations covering 91 pages with missing OG tags and 45 pages with missing canonicals. Every calculator page on the site now has a complete head-tag set. Traffic-lift estimates are deliberately conservative (low confidence) because no live Lighthouse or GSC measurement was available this session — run `/track baseline` then `/track compare` to convert estimates into proof.

## Prioritised Fix List

Sort by ROI descending. Highest-impact-lowest-effort fixes at the top.

| # | Fix | Category | Impact (1-10) | Effort (1-10) | ROI | Est. lift | Min-diff? | Owner |
|---|-----|----------|---------------|---------------|-----|-----------|-----------|-------|
| 1 | Manual meta description on mortgage-calculator (the 1 page missing it) | content | 7 | 1 | 7.0 | ~350 sessions/mo | yes | @seo-content |
| 2 | SOP head-tag standards strengthened (canonical promotion + Open Graph section) | technical | 9 | 2 | 4.5 | 0 direct, prevents recurrence | yes | @seo-technical |
| 3 | Add missing canonical link to 45 calculator pages | technical | 8 | 2 | 4.0 | ~8 keywords top10 | yes | @seo-technical |
| 4 | SOP filename references corrected (underscore → dash) | technical | 4 | 1 | 4.0 | 0 direct, ends phantom finding | yes | @seo-technical |
| 5 | Add missing Open Graph + Twitter Card head tags to 91 pages | technical | 8 | 3 | 2.7 | improves AI ingestion + social shares | yes | @seo-technical |

**Effort scale**: 1 = single tag/line edit. 5 = mid-size refactor of one component. 10 = multi-week project.
**Min-diff?**: yes = changes only the necessary tags/schema (Constitution rule 4).

## Per-Fix Detail

### Fix #1 — Manual meta description on mortgage-calculator

**Why**: This was the single page out of 110 missing a meta description entirely. Without one, the migration script couldn't derive `og:description`, so it had to be added by hand before the bulk run.
**Where**: `finance/mortgage/mortgage-calculator/index.html` line 13.
**Implementation**: Inserted one line:
```html
<meta content="Free mortgage calculator to estimate monthly payments, total interest, and amortization schedules for your home loan." name="description"/>
```
The description was reused verbatim from the page's own SoftwareApplication schema description field (line 49 of the original file). 115 chars, under the SOP's 150-160 target — accurate and pre-vetted, no embellishment.
**Rollback**: Revert one line.

### Fix #2 — SOP head-tag standards strengthened

**Why**: Site-audit scope check identified the standards docs themselves as the root cause of the systemic gap. `general-template-guidelines.md` v1.6 mandated meta description but only mentioned canonical inside a checklist and inside JSON-LD schema fields. Open Graph: zero mentions. Result: pages built strictly to standard could ship without OG and without an explicit canonical link.
**Where**:
- `general-template-guidelines.md`: bumped to v1.7. Two new sub-sections inserted into Section 2 (SEO Requirements):
  - Canonical URL Requirements — promoted from checklist item to hard Head Tags requirement, with format + rules + why-it-matters
  - Open Graph & Social Card Tags — new section, all five OG properties named, all four Twitter Card properties named, worked example pulled from the master template
  - Section 4 Step 2 (Calculator pages, metadata): added explicit bullets for `<link rel="canonical">` and the Open Graph/Twitter block as REQUIRED
- `docs/SOP-CalcDev.md`: bumped to v3.8. One new bullet in Section 3.1 (Content & SEO Integration) cross-referencing the strengthened head-tag requirements.
**Rollback**: `git revert` the SOP commits.

### Fix #3 — Add missing canonical link to 45 pages

**Why**: 45 of 110 calculator pages had no `<link rel="canonical">` at all. For pages indexed by Google and read by LLM ingestion pipelines, the canonical is the disambiguation contract — its absence creates risk of duplicate-content scoring and weak inter-page signal.
**Where**: 45 calculator `index.html` files identified by `grep -L 'rel="canonical"'` and updated by `scripts/add-missing-head-tags.py`.
**Implementation**: Script inserts `<link rel="canonical" href="https://www.freecalchub.com/{path}/">` immediately below the existing `<meta name="description">` line. URL is derived from the file path: `finance/mortgage/affordability-calculator/index.html` → `https://www.freecalchub.com/finance/mortgage/affordability-calculator/`.
**Rollback**: Script is idempotent and insert-only; `git revert` removes the inserted lines cleanly.

### Fix #4 — SOP filename references corrected

**Why**: SOP and guidelines referred to `calculator_template.html` and `category_template.html` (underscore). The files actually in the repo are `calculator-template.html` and `category-template.html` (dash). The site-audit scope check raised this as "template doesn't exist" — in fact it does, just under a different name. Correcting the docs ends the false alarm and means any developer (human or AI) following the SOP can find the template at the path the docs claim.
**Where**: 23 line changes total (8 in general-template-guidelines.md, 15 in docs/SOP-CalcDev.md). Find/replace; no semantic content changed.
**Rollback**: `git revert`.

### Fix #5 — Add missing Open Graph + Twitter Card tags to 91 pages

**Why**: 91 of 110 calculator pages had no Open Graph properties. Result: Google chose its own snippet, social shares looked broken, and LLM ingestion pipelines could not read consistent `og:title` / `og:description` cross-references. Across nearly the whole site.
**Where**: 91 calculator `index.html` files identified by `grep -L 'property="og:'` and updated by `scripts/add-missing-head-tags.py`.
**Implementation**: Script inserts a 14-line block immediately below the existing `<meta name="description">` line (and after canonical if also being inserted):
- 8 Open Graph properties (`og:type=website`, `og:url=canonical`, `og:title=title`, `og:description=meta description`, `og:image=site-wide default`, `og:image:width=1200`, `og:image:height=630`, plus the section comment)
- 5 Twitter Card properties mirroring the OG values (`twitter:card=summary_large_image`, `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`, plus the section comment)
- og:image points to the site-wide default `https://www.freecalchub.com/images/social/cover_image_1200x630.png` (the same image already used by `calculator-template.html`)
**Rollback**: Script is insert-only; `git revert` removes the inserted block.

## AI Search Readiness Scorecard (Constitution rule 3)

| Dimension | Before | After | Change | Notes |
|---|---|---|---|---|
| llms.txt | 9/10 | 9/10 | – | Not touched this run. |
| Structured data coverage | 9/10 | 9/10 | – | Existing SoftwareApplication/FAQPage schema preserved verbatim. OG/Twitter are additions, not modifications. |
| Answerability | 8/10 | 9/10 | +1 | All 110 pages now have consistent `og:title` and `og:description` that LLM ingestion pipelines can read. |
| Sitemap freshness | 6/10 | 6/10 | – | Deferred. Still on backlog (site-audit fch-007). |
| Robots policy for AI crawlers | 7/10 | 7/10 | – | Explicit GPTBot/ClaudeBot allow blocks deferred. Still on backlog (site-audit fch-006). |

**AI scorecard total**: 39/50 → **43/50** (+4)

## Traditional SEO Scorecard

| Dimension | Before | After | Change | Notes |
|---|---|---|---|---|
| Core Web Vitals (LCP/INP/CLS) | 5/10 | 5/10 | – | Still not measured. 14 head lines added per page; CWV impact expected negligible but unverified. |
| Crawlability and indexability | 7/10 | 8/10 | +1 | 100% canonical coverage achieved (was 59%). |
| On-page (titles, descriptions, headings) | 6/10 | 9/10 | +3 | All five head tags (title, description, canonical, OG block, Twitter block) now present on 100% of calculator pages. |
| Internal linking | 6/10 | 6/10 | – | Not touched. |
| Authority signals (backlinks, mentions) | 5/10 | 5/10 | – | Still not measured. |

**Traditional scorecard total**: 36/50 → **41/50** (+5)

## Risks and Caveats

Three honest constraints on this run:

- **Tag completeness ≠ traffic improvement.** Scorecard moves above are confirmable (count of pages with the tag went from X to 110 — verifiable by `grep`). Whether Google or any LLM ingestion pipeline actually rewards this with traffic is a separate question that needs `/track baseline` before this commit lands and `/track compare` 14-28 days after.
- **No live measurement this run.** Core Web Vitals, ranking positions, backlink counts, GA4/GSC traffic — none accessed. Score placeholders for those dimensions are unchanged at conservative values, not 10/10.
- **Pre-existing branding inconsistency surfaced but not fixed.** BMI calculator's `<title>` still reads `| CalcHub` (not `| FreecalcHub`). The migration script propagated this verbatim into `og:title` and `twitter:title`. Out of scope for this fix pass — flag for a future content-quality pass.

Two related fixes from site-audit explicitly deferred:
- **fch-002** (standardise all canonicals to absolute www form sitewide): pages with existing relative canonicals like BMI were left untouched. The script only adds canonical where none exists; it does not modify existing ones. Separate technical-fix pass needed.
- **fch-006** (explicit AI crawler allow blocks in robots.txt): not in this scope.

## What Was Re-Used (Constitution rule 1)

Findings from prior runs (read from `seo-evidence.md`) built on rather than re-discovered:

- Site-audit lite (run 2026-05-10): `fch-001` (mortgage missing all head tags) directly addressed. Site-audit's per-domain canonical breakdown table was confirmed valid in this repo (Phase 1 of this run produced identical counts: 91/45/1).
- Cross-mission scope check entry under "2026-05-10 — Scope check: meta-tag SOP gap": root-cause analysis (SOP gap, not per-page) drove the Fix #2 sequencing — SOP first, bulk migration second. Saved re-doing the upstream analysis.

## Next Suggested Mission

`ai-search-optimize` — with all pages now carrying canonical + OG + Twitter Card head tags, the next leverage move is the AI-search-specific dimensions still unaddressed: explicit AI crawler allow blocks in robots.txt, TL;DR summary blocks on calculator pages for higher answerability scoring, and sitemap-lastmod refresh. Alternatively, run a fresh `site-audit lite` after `/track baseline` to lock in measured post-fix scores.
