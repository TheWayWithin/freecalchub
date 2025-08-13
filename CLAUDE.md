# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreecalcHub is a free online calculator website (www.freecalchub.com) with calculators organized into categories: Finance, Math, Health, Conversions, Date & Time, Business, and Lifestyle. This is a static website deployed via Netlify with no build process - all files are served directly.

**Recent additions include the Finance > Cryptocurrency subcategory with "Coming Soon" calculators for crypto-related financial tools.**

## Architecture

### Site Structure
- **Static HTML Website**: No framework, uses vanilla HTML/CSS/JS
- **Category-based Organization**: Each calculator category has its own directory with subdirectories for individual calculators
- **Template-based Development**: All pages use master templates (`calculator-template.html` and `category-template.html`)
- **Global Assets**: Shared CSS/JS files in `/css/` and `/js/` directories
- **Automatic Deployment**: Changes to main branch trigger Netlify deployment

### Key Files
- `/Users/jamiewatters/DevProjects/freecalchub/calculator-template.html` - Master template for all calculator pages
- `/Users/jamiewatters/DevProjects/freecalchub/category-template.html` - Master template for category/subcategory pages  
- `/Users/jamiewatters/DevProjects/freecalchub/general-template-guidelines.md` - Comprehensive development guidelines
- `docs/SOP-CalcDev.md` - Standard operating procedure for calculator development

### Directory Structure
```
/category-name/
  └── subcategory-name/ (optional)
      └── calculator-name/
          ├── index.html
          ├── css/calculator-name.css
          └── js/calculator-name.js
```

## CRITICAL: Always Consult Documentation First

**MANDATORY WORKFLOW - NO EXCEPTIONS:**

**For ANY calculator or category page work:**

1. **ALWAYS start by reading the current page to understand what needs updating**
2. **ALWAYS read `docs/SOP-CalcDev.md` section relevant to the task** 
3. **ALWAYS review `/Users/jamiewatters/DevProjects/freecalchub/general-template-guidelines.md` for implementation specifics**
4. **ALWAYS use the master templates as the source of truth:**
   - `/Users/jamiewatters/DevProjects/freecalchub/calculator-template.html` for calculator pages
   - `/Users/jamiewatters/DevProjects/freecalchub/category-template.html` for category/subcategory pages
5. **ALWAYS compare the current page against the template to identify discrepancies**
6. **ALWAYS follow the template patterns exactly** (CSP headers, structure, classes, etc.)

**REMEDIATION WORKFLOW:**
1. Read existing page to understand current state
2. Read template to understand correct implementation  
3. **Research existing patterns** - check similar pages for consistent styling (especially for "Coming Soon" items)
4. Compare and identify what needs to be changed
5. Apply changes using template patterns
6. Test and validate before committing

**NEVER:**
- Copy from existing calculator pages (they may be outdated)
- Copy from existing category pages (they may be outdated) 
- Modify CSP headers without checking template first
- Make ad-hoc changes without consulting documentation
- Assume existing pages are compliant - always verify against templates

## Development Guidelines

### Creating New Calculators
1. **Follow Templates**: Always start with `/Users/jamiewatters/DevProjects/freecalchub/calculator-template.html`
2. **Follow SOP**: Reference `docs/SOP-CalcDev.md` for complete workflow
3. **Schema Markup**: Implement all required Schema.org JSON-LD markup
4. **Category Updates**: Add calculator cards to relevant category pages
5. **🚨 CRITICAL: Update Sitemaps IMMEDIATELY**: After deploying each new calculator, ALWAYS update both `sitemap.xml` and `/sitemap/index.html` files - this is mandatory for SEO and site discovery

### Calculator Page Standards (v1.4+)
1. **FAQ Section**: MUST include FAQ index with linked items before FAQ content
   - Use `<div class="faq-index card">` with linked list
   - Each FAQ item needs unique `id="faq-item-N"` for anchor linking
2. **Related Calculators**: Use icon-enhanced grid layout (as of template v1.4)
   - Structure: `<div class="related-links">` with `<a class="related-link">`
   - Include Font Awesome icons for visual appeal
   - 3-5 related calculators recommended
3. **Breadcrumbs**: Verify correct hierarchy (especially for Business calculators)
   - Check both HTML breadcrumbs and Schema.org BreadcrumbList
   - Ensure paths match actual site structure

### Building Multiple Related Calculators
When creating a set of related calculators (e.g., percentage suite):
1. **Plan the full set**: Identify all calculators needed for the subcategory
2. **Create systematically**: Build HTML structure → Add CSS styling → Implement JS functionality
3. **Share common patterns**: Use consistent validation, error handling, and result display
4. **Update category pages**: Fix all "Coming Soon" statuses after deployment
5. **Cross-link appropriately**: Ensure related calculators reference each other

### Implementation Details Location
- **File naming, CSS/JS organization**: See `/Users/jamiewatters/DevProjects/freecalchub/general-template-guidelines.md`
- **Schema requirements**: See `docs/SOP-CalcDev.md` and `/Users/jamiewatters/DevProjects/freecalchub/general-template-guidelines.md`
- **"Coming Soon" styling standards**: See `/Users/jamiewatters/DevProjects/freecalchub/general-template-guidelines.md`
- **SEO & content standards**: See `docs/SOP-CalcDev.md`

## Key Principles
- **Always consult the authoritative documents** before implementing
- **Templates are the source of truth** for structure and standards
- **Research existing patterns** before creating new styling
- **Maintain consistency** across all FreecalcHub pages

## Development Workflow
- **Static site**: No build process, direct file editing and serving
- **Deployment**: Push to main branch triggers automatic Netlify deployment
- **🚨 POST-DEPLOYMENT REQUIREMENTS**: After each calculator deployment:
  1. Update `sitemap.xml` with new calculator URL
  2. Update `/sitemap/index.html` with new calculator listing
  3. Verify category page integration (remove "Coming Soon" if applicable)
- **Testing**: See `docs/SOP-CalcDev.md` for comprehensive testing requirements
- **Validation**: Use online HTML and Schema validators as specified in guidelines

## Common Issues & Solutions

### "Coming Soon" Calculator Activation
- **Issue**: Calculator deployed but still shows as "Coming Soon" on category page
- **Solution**: Change from `<div class="calculator-card">` to `<a class="calculator-card" href="/path/">`
- **Check**: Both category and subcategory pages may need updating

### FAQ Index Missing
- **Issue**: FAQ section lacks navigation index
- **Solution**: Add `<div class="faq-index card">` before FAQ items with linked list
- **Pattern**: See percentage calculators for reference implementation

### Breadcrumb Path Errors
- **Issue**: Incorrect category hierarchy (e.g., Business calculators showing Finance path)
- **Solution**: Verify both HTML breadcrumbs and Schema.org BreadcrumbList match actual paths
- **Common**: Business calculators often incorrectly reference `/finance/business/` instead of `/business/`

## Current Status & Compliance
- **Master templates**: Updated to v1.4 with icon-enhanced related calculators
- **Template standards**: GTM-only, CookieYes compliance, FAQ v2 system
- **Systematic audits**: Ongoing compliance checks across all category pages
- **Template compliance**: All new pages must follow current template standards
- **For detailed audit checklists**: See `docs/SOP-CalcDev.md`