# SEO Backlog — freecalchub.com

Active backlog of SEO fixes not yet shipped. Each item names where it came from (originating run + fix ID) so the audit trail stays connected.

**Convention**: rank by ROI descending. Move shipped items to a "Done" section at the bottom (or remove if too long).

## Prioritised

| # | Fix | Category | Impact | Effort | ROI | Min-diff? | Source |
|---|---|---|---|---|---|---|---|
| 1 | Fix BMI calculator canonical: relative `/health/bmi/bmi-calculator/` → absolute `https://www.freecalchub.com/health/bmi/bmi-calculator/` | technical | 6 | 1 | 6.0 | yes | site-audit fch-003 |
| 2 | Add explicit `User-agent` allow blocks for GPTBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended in `robots.txt` | ai-search | 4 | 1 | 4.0 | yes | site-audit fch-006 |
| 3 | Standardise all canonicals to absolute `https://www.freecalchub.com/` across site (wider variant of #1; affects pages with non-www or relative canonicals) | technical | 9 | 3 | 3.0 | yes | site-audit fch-002 |
| 4 | Noindex or replace Coming Soon stub pages: monthly-budget-calculator, expense-tracker-calculator, debt-to-income-ratio-calculator | content | 6 | 2 | 3.0 | yes | site-audit fch-005 |
| 5 | Verify or soften the "10,000+ users" and "CFPB-compliant" claims in Organization schema (`index.html` line 31) | authority | 3 | 1 | 3.0 | yes | site-audit fch-008 |
| 6 | Fix BMI calculator title: change `| CalcHub` → `| FreecalcHub` (currently propagated to `og:title` and `twitter:title` by technical-fix migration) | content | 3 | 1 | 3.0 | yes | technical-fix observation |
| 7 | Refresh `sitemap.xml` `lastmod` dates for content actually updated since 2025-10-24 | technical | 4 | 2 | 2.0 | yes | site-audit fch-007 |

**Effort scale**: 1 = single tag/line edit. 5 = mid-size refactor of one component. 10 = multi-week project.

## Per-Fix Notes

### #1 — BMI canonical absolutisation

`health/bmi/bmi-calculator/index.html` line 15 currently has `<link href="/health/bmi/bmi-calculator/" rel="canonical"/>`. Replace with absolute www form. Single line. Same fix pattern applies to any other page found with a relative or non-www canonical (Fix #3 generalises this).

### #2 — robots.txt AI crawler allow blocks

Currently `User-agent: *` implicitly allows everyone. Adding explicit allow blocks for the named AI crawlers (a) makes policy auditable, (b) survives a future site-wide default-deny, (c) signals intent to ingestion pipelines that some respect. Append to `robots.txt`:

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

### #3 — Canonical sitewide standardisation

The technical-fix only ADDED canonicals where missing (45 pages). Pages with existing canonicals that are non-www, apex, or relative were not touched. Likely tightly correlated set; can be done as a scripted find-and-replace but needs a quick survey first to know the patterns. Consider extending `scripts/add-missing-head-tags.py` with a `--standardise` flag, or write a sibling script.

### #4 — Coming Soon stubs

Three pages identified by site-audit. Either ship the calculator or add `<meta name="robots" content="noindex">` and remove from `sitemap.xml` until shipped. Decide per page; budgeting tools may or may not be a priority to actually build.

### #5 — Unverifiable schema claims

Organization schema description in `index.html` line 31 includes "10,000+ users" and "CFPB-compliant". If you can substantiate both, link the source. If not, soften to wording you can stand behind ("calculators reviewed against CFPB guidance", "thousands of users"). Constitution rule 5.

### #6 — BMI title branding inconsistency

Surfaced during the technical-fix dry-run. The page title contains `| CalcHub` instead of `| FreecalcHub`. The migration script propagated this verbatim into the new `og:title` and `twitter:title` tags (which it had to, faithfully). One-line fix in the `<title>` tag, then re-run the migration script's idempotency check (or manually update the OG/Twitter mirror lines). Consider a quick grep across all calculator pages for any other `| CalcHub` instances.

### #7 — Sitemap lastmod refresh

100+ URLs in `sitemap.xml` carry `<lastmod>2025-10-24</lastmod>`. If those pages truly haven't changed in 6+ months, fine. If any have, the stale lastmod suppresses recrawl. Audit; correct where needed. Automatable via git log or file mtime.

## How to use this file

When picking the next fix:

1. Read the row, then the per-fix note.
2. Run the appropriate mission: most of these are `/coord technical-fix freecalchub.com` with the specific fix scope. #4 and #5 are content/strategy calls and may not need a full mission.
3. Update or remove the row when shipped. Move to a "Done" section if you want to keep audit trail in one file.
4. New backlog items from future audits get added at the top of the table sorted into ROI position.

## Done

(Empty — populate as items ship.)
