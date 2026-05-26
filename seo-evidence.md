# SEO EVIDENCE REPOSITORY
<!-- SHARED EVIDENCE FILE - ALL AGENTS CONTRIBUTE -->

## RUN POINTERS

- 2026-05-10 — site-audit (lite) — freecalchub.com — `runs/2026-05-10-freecalchub-com-site-audit-lite/` — AI scorecard 39/50, Traditional 36/50, top fix: add canonical+meta+OG to mortgage-calculator (ROI 8.0). See data.json for fix list.
- 2026-05-10 — technical-fix — freecalchub.com — `runs/2026-05-10-freecalchub-com-technical-fix/` — AI scorecard 39→43/50, Traditional 36→41/50. SOP strengthened (guidelines v1.7, SOP v3.8) + migration script + 99 pages updated. All 110 calculator pages now have canonical + OG + Twitter + meta description. Pre-existing relative canonicals on a handful of pages (incl. BMI) deferred to a separate pass.
- 2026-05-16 — sitewide-verify — freecalchub.com — `runs/2026-05-16-freecalchub-com-sitewide-verify/` — **deferred** (0 pages checked). Phase 2 blocked at harness sandbox. Sprint 11 added curl allowlist.
- 2026-05-25 — sitewide-verify — freecalchub.com — `runs/2026-05-25-freecalchub-com-sitewide-verify/` — **VERIFIED**. 110/110 calculator pages checked live. FCH-TF-003 (OG + Twitter Card): 110/110 pass. FCH-TF-004 (canonical): 110/110 pass. Both items moved shipped → verified in seo-backlog.md.

## CROSS-MISSION FINDINGS

### 2026-05-10 — Scope check: meta-tag SOP gap (from SEO-Agent dev session)

**Triggered by**: site-audit lite top fix #1 = mortgage calculator missing canonical/meta description/OG tags.
**Question asked**: isolated to mortgage, or systemic?
**Method**: grep across all calculator pages in `finance/`, `health/`, `math/`, `lifestyle/`, `conversions/`, `date-time/` (read-only inspection from `~/DevProjects/SEOAgent/` SEO-Agent library session).

**Scope (110 calculator pages total)**:
- Missing OG tags: **91 of 110 (83%)**
- Missing canonical link: **45 of 110 (41%)**
- Missing meta description: 1 of 110 (~1%)

**Per-domain canonical breakdown**:
| Domain | Missing | Total | % missing |
|---|---|---|---|
| finance | 27 | 45 | 60% |
| health | 8 | 10 | 80% |
| math | 6 | 18 | 33% |
| lifestyle | 2 | 14 | 14% |
| conversions | 2 | 14 | 14% |
| date-time | 0 | 9 | 0% (clean) |

date-time is fully canonical-clean → "good" pattern exists in the codebase, just not applied consistently. Older domains (finance, health) likely predate enforcement.

**Standard / SOP gap analysis**:
- `general-template-guidelines.md` v1.6 (Sept 2025): meta description thoroughly mandated; canonical mentioned in checklist (line 370) and JSON-LD schema fields (lines 137, 153, 243), but NOT promoted to a hard `<head><link rel="canonical">` requirement. **OG tags: zero mentions.**
- `docs/SOP-CalcDev.md` v3.7 (June 2025): canonical mentioned only for sitemap purposes (line 126). No OG tag mention.
- Result: pages built well to current standard still lack OG (because never required) and may lack canonical (because under-enforced).

**Template gap (separate finding)**:
- SOP repeatedly says "ALWAYS start with the latest `calculator_template.html`" — but **`calculator_template.html` does not exist in the repo** (and neither does `category_template.html`).
- `general-template-guidelines.md` is a guidelines doc, not an HTML scaffold.
- Implication: dev workflow may be copying from existing pages despite SOP forbidding this — explains how SOP gaps propagate.

**"Clean" reference page**:
- `date-time/age/index.html` is a good template-quality example for canonical/meta description/schema.org. Even this page lacks OG tags — confirms OG was never standard.

**Recommended fix at the right level (Constitution rule 4)**:
1. Update `general-template-guidelines.md`: add Open Graph tags section; promote canonical to a Head Tags hard requirement
2. Update `docs/SOP-CalcDev.md`: brief reference to strengthened guidelines (don't duplicate)
3. Migration script: applies canonical + OG tags to the 91 OG-missing and 45 canonical-missing pages
4. Optional: create `calculator_template.html` fresh (closes the SOP-promised-but-missing gap)

**Open decisions for `/coord technical-fix`**:
- og:image strategy: site-wide default URL? per-category? per-page (defer)? skip og:image this pass?
- `calculator_template.html`: address in this fix pass or flag separately?

## EVIDENCE CATALOG
**Mission:** [MISSION_NAME]
**Domain:** [TARGET_DOMAIN]
**Collection Period:** [START] to [END]
**Last Updated:** [TIMESTAMP]

## TECHNICAL EVIDENCE

### Performance Metrics
| Metric | Value | Source | Agent | Timestamp |
|--------|-------|--------|-------|-----------|
| LCP | | Lighthouse | @seo-technical | |
| FID | | Lighthouse | @seo-technical | |
| CLS | | Lighthouse | @seo-technical | |
| Page Speed | | PageSpeed Insights | @seo-technical | |
| Mobile Score | | Mobile Test | @seo-technical | |

### Crawl Evidence
```
[CRAWL_DATA]
- Pages crawled: 
- Errors found: 
- Warnings: 
- Indexability issues: 
```

### Technical Issues
| Issue | Severity | Pages Affected | Evidence Link | Status |
|-------|----------|----------------|---------------|--------|
| | | | | |

## CONTENT EVIDENCE

### Keyword Performance
| Keyword | Position | Volume | Difficulty | Opportunity | Evidence |
|---------|----------|--------|------------|-------------|----------|
| | | | | | |

### Content Gaps
| Topic | Competitor Coverage | Our Coverage | Gap Size | Priority |
|-------|-------------------|--------------|----------|----------|
| | | | | |

### SERP Features
| Feature | Currently Own | Could Own | Requirement | Evidence |
|---------|--------------|-----------|-------------|----------|
| | | | | |

## RANKING EVIDENCE

### Position Changes
| URL | Keyword | Before | After | Change | Date | Screenshot |
|-----|---------|--------|-------|--------|------|------------|
| | | | | | | |

### Competitor Movements
| Competitor | Keyword | Their Position | Our Position | Gap | Trend |
|------------|---------|---------------|--------------|-----|-------|
| | | | | | |

## AUTHORITY EVIDENCE

### Backlink Analysis
| Metric | Value | Change | Evidence | Date |
|--------|-------|--------|----------|------|
| Total Backlinks | | | | |
| Referring Domains | | | | |
| Domain Rating | | | | |
| Trust Flow | | | | |

### Brand Signals
| Signal | Status | Evidence | Impact | Action |
|--------|--------|----------|--------|--------|
| | | | | |

## TRAFFIC EVIDENCE

### Analytics Data
| Metric | Period | Value | Change | Source | Screenshot |
|--------|--------|-------|--------|--------|------------|
| Organic Sessions | | | | GA4 | |
| Organic Users | | | | GA4 | |
| Conversion Rate | | | | GA4 | |
| Bounce Rate | | | | GA4 | |

### Search Console Data
| Metric | Period | Value | Change | Evidence |
|--------|--------|-------|--------|----------|
| Impressions | | | | |
| Clicks | | | | |
| CTR | | | | |
| Avg Position | | | | |

## USER EXPERIENCE EVIDENCE

### Behavioral Metrics
| Page/Section | Engagement Time | Scroll Depth | Exit Rate | Evidence |
|--------------|----------------|--------------|-----------|----------|
| | | | | |

### Feedback & Issues
| Type | Description | Frequency | Impact | Evidence |
|------|-------------|-----------|--------|----------|
| | | | | |

## COMPETITIVE EVIDENCE

### Feature Comparison
| Feature | Us | Competitor 1 | Competitor 2 | Gap Analysis |
|---------|-----|--------------|--------------|--------------|
| | | | | |

### Market Position
| Metric | Our Value | Market Leader | Industry Avg | Position |
|--------|-----------|---------------|--------------|----------|
| | | | | |

## EVIDENCE VALIDATION

### Cross-Reference Check
- [ ] Technical data matches analytics
- [ ] Ranking data verified in multiple tools
- [ ] Content gaps validated with search data
- [ ] Authority metrics from multiple sources

### Data Quality Score
- Completeness: [0-100%]
- Accuracy: [0-100%]
- Recency: [DAYS_OLD]
- Reliability: [HIGH/MEDIUM/LOW]

## EVIDENCE NOTES

### Collection Methods
- Tool 1: [METHOD_DESCRIPTION]
- Tool 2: [METHOD_DESCRIPTION]
- Manual verification: [PROCESS]

### Known Limitations
- Limitation 1: 
- Limitation 2: 
- Data gaps: 

### Anomalies Detected
- Anomaly: 
  - Description: 
  - Possible cause: 
  - Impact on analysis: 

---
**USAGE**: All agents MUST contribute evidence to support findings and recommendations.
**VALIDATION**: Coordinator reviews evidence quality at phase boundaries.
**TAGGING**: Use [AGENT_NAME-TIMESTAMP] format for all contributions.

## RUN INDEX

- 2026-05-10 — `runs/2026-05-10-freecalchub-com-site-audit-lite/` — site-audit (lite) freecalchub.com — AI scorecard 39/50, Trad SEO 36/50, 8 fixes identified (4 with ROI ≥ 4.0). Constraints: no Lighthouse/GSC/backlink data this run. Next: technical-fix bundling fch-001/003/004/006.