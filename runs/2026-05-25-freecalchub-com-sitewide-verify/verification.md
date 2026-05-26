# Sitewide Verification Report — freecalchub.com

**Run**: `runs/2026-05-25-freecalchub-com-sitewide-verify/`
**Date**: 2026-05-25
**Verifier**: @seo-technical (top-level session)
**Method**: Live HTTPS fetch of all 110 calculator pages via curl, tag presence verified by grep
**Source**: Sitemap at `https://www.freecalchub.com/sitemap.xml` (110 calculator URLs confirmed)

## Items Verified

### FCH-TF-003: Open Graph + Twitter Card head tags on 110 calculator pages

**Claim**: All 110 calculator pages have `og:title`, `og:description`, `og:url`, `og:type` plus Twitter Card variants (`twitter:card`, `twitter:title`, `twitter:description`).

**Open Graph result**: **110 / 110 PASS**

| Check | Pass | Fail |
|-------|------|------|
| `og:title` | 110 | 0 |
| `og:description` | 110 | 0 |
| `og:url` | 110 | 0 |
| `og:type` | 110 | 0 |

**Twitter Card result**: **110 / 110 PASS**

| Check | Pass | Fail |
|-------|------|------|
| `twitter:card` | 110 | 0 |
| `twitter:title` | 110 | 0 |
| `twitter:description` | 110 | 0 |

**Implementation note**: Twitter tags use `property="twitter:card"` (OG-style attribute) rather than `name="twitter:card"` (Twitter's canonical spec). Both are widely supported by crawlers and social platforms. Not a bug, but worth noting if strict spec compliance is a goal later.

**Verdict**: **VERIFIED**. All 110 pages confirmed live with complete OG + Twitter Card tag sets.

---

### FCH-TF-004: Canonical link on 110 calculator pages

**Claim**: All 110 calculator pages have a `<link rel="canonical">` tag.

**Result**: **110 / 110 PASS**

Every page returned a `rel="canonical"` link element in the `<head>`.

**Verdict**: **VERIFIED**. All 110 pages confirmed live with canonical link tags.

---

## Fetch Summary

| Metric | Value |
|--------|-------|
| Total pages in scope | 110 |
| Successfully fetched | 110 |
| Fetch errors | 0 |
| Pages skipped | 0 |

## Incidental Observations (not in scope, for backlog awareness)

1. **BMI page title branding**: `twitter:title` on `/health/bmi/bmi-calculator/` reads "... | CalcHub" instead of "... | FreecalcHub". This is the existing backlog item #6 (FCH-TF-003 faithfully propagated the existing `<title>` value into OG/Twitter tags). Not a verification failure: the mission shipped what it claimed.

2. **www redirect**: `https://www.freecalchub.com/robots.txt` returns HTTP 301 (likely www-to-apex or vice versa). All page fetches followed redirects successfully. Not an issue for tag verification but may matter for canonical standardisation (backlog item #3).

## Quality Checklist

- [x] Every `shipped` item in the backlog at mission start has been processed (2 of 2)
- [x] No item moved to `verified` without HTTP evidence in this file
- [x] Sitewide items report explicit page counts (110 checked, 110 passed, 0 failed)
- [x] No item moved to `closed` (requires `/track compare` per Constitution rule 5)
