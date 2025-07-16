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
- `calculator-template.html` - Master template for all calculator pages
- `category-template.html` - Master template for category/subcategory pages  
- `general-template-guidelines.md` - Comprehensive development guidelines
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
3. **ALWAYS review `general-template-guidelines.md` for implementation specifics**
4. **ALWAYS use the master templates as the source of truth:**
   - `calculator-template.html` for calculator pages
   - `category-template.html` for category/subcategory pages
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
1. **Follow Templates**: Always start with `calculator-template.html`
2. **Follow SOP**: Reference `docs/SOP-CalcDev.md` for complete workflow
3. **Update Sitemaps**: Add new pages to both `sitemap.xml` and `/sitemap/index.html`
4. **Schema Markup**: Implement all required Schema.org JSON-LD markup
5. **Category Updates**: Add calculator cards to relevant category pages

### Implementation Details Location
- **File naming, CSS/JS organization**: See `general-template-guidelines.md`
- **Schema requirements**: See `docs/SOP-CalcDev.md` and `general-template-guidelines.md`
- **"Coming Soon" styling standards**: See `general-template-guidelines.md`
- **SEO & content standards**: See `docs/SOP-CalcDev.md`

## Key Principles
- **Always consult the authoritative documents** before implementing
- **Templates are the source of truth** for structure and standards
- **Research existing patterns** before creating new styling
- **Maintain consistency** across all FreecalcHub pages

## Development Workflow
- **Static site**: No build process, direct file editing and serving
- **Deployment**: Push to main branch triggers automatic Netlify deployment
- **Testing**: See `docs/SOP-CalcDev.md` for comprehensive testing requirements
- **Validation**: Use online HTML and Schema validators as specified in guidelines

## Current Status & Compliance
- **Master templates**: Updated to current standards (GTM-only, CookieYes compliance)
- **Systematic audits**: Ongoing compliance checks across all category pages
- **Template compliance**: All new pages must follow current template standards
- **For detailed audit checklists**: See `docs/SOP-CalcDev.md`