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

### File Naming Conventions
- Use lowercase with hyphens for directories and files
- Calculator folders: `calculator-name/` (not `calculator-name-calculator/`)
- CSS/JS files: `calculator-name.css` and `calculator-name.js`

### CSS/JS Organization
- **Global styles** in `/css/styles.css` (includes calculator form grid layout)
- **Dark mode** support via `/css/dark-mode.css` and `/js/dark-mode.js`
- **FAQ system** uses V2 structure with `/css/faq-styles-v2.css` and `/js/faq-accordion-v2.js`
- **Calculator-specific styles** only for unique elements not covered by global styles

### "Coming Soon" Calculator Card Standards
- **Use standard format**: `<span class="coming-soon-tag">Coming Soon</span>`
- **Position**: Inline within the description paragraph after the main text
- **Styling**: Leverages existing `.coming-soon-tag` CSS (orange color, bold, smaller font, new line)
- **Structure**: Regular `<div class="calculator-card">` (not clickable links)
- **Consistency**: Used across all FreecalcHub category pages for unreleased calculators

### Schema Requirements
- All calculators need `SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`, and `WebPage` schemas
- Category pages need `CollectionPage`, `BreadcrumbList`, and `FAQPage` schemas
- Use ISO 8601 format for all dates: `YYYY-MM-DDTHH:MM:SSZ`
- Include `relatedLink` property in calculator schemas

### SEO & Content Standards
- **Breadcrumbs**: Must match schema breadcrumbs exactly
- **Related Calculators**: 3-5 relevant calculators with descriptions
- **FAQ sections**: Mandatory V2 structure with accordion interface
- **Internal linking**: Include links to relevant calculators in FAQ answers

### Testing Requirements
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness
- HTML and schema validation
- Calculator accuracy with various inputs
- Dark mode functionality

## Development Commands

This is a static site with no build process. Key operations:

- **Local Development**: Serve files with any static server (e.g., `python -m http.server`)
- **Validation**: Use online HTML and Schema validators
- **Deployment**: Push to main branch triggers automatic Netlify deployment

## Important Notes

- **No Package.json**: This is not a Node.js project
- **No Build Tools**: Direct file editing and serving
- **GTM Integration**: Google Tag Manager ID `GTM-KNHC9TZ5` 
- **Font Awesome**: Uses CDN version 6.0.0-beta3
- **API Usage**: Some calculators may require external APIs - check individual calculator specs
- **Git Workflow**: Direct commits to main trigger production deployment
- **Deployment Pipeline**: Local commits must be pushed to GitHub to trigger Netlify deployment - changes only take effect after successful deployment

## Quality Standards

- Follow accessibility guidelines (WCAG)
- Implement proper error handling and validation
- Use semantic HTML and meaningful CSS classes
- Maintain consistent styling with global design system
- Ensure all user inputs are properly validated
- Include comprehensive FAQ sections for user guidance

## Template Updates (July 2025)

### Master Template Compliance (COMPLETED)
**Both master templates updated to current standards:**

✅ **calculator-template.html**:
- Removed legacy gtag.js analytics code
- Expanded related calculators to 3 (minimum required)
- GTM-only implementation with CookieYes compatibility

✅ **category-template.html**:
- Removed legacy gtag.js analytics code  
- GTM-only implementation with CookieYes compatibility
- FAQ v2 structure already compliant

## Systematic Page Audit Approach

### Comprehensive Compliance Checklist
**Every page must be audited against ALL standards:**

1. **Analytics & Tracking**:
   - ✅ GTM implementation (`GTM-KNHC9TZ5`)
   - ❌ Remove legacy gtag.js code  
   - ✅ CookieYes CSP domains
   - ✅ GTM noscript tag in body

2. **Date Format Compliance**:
   - ✅ ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

3. **FAQ v2 Implementation**:
   - ✅ CSS: `/css/faq-styles-v2.css`
   - ✅ JavaScript: `/js/faq-accordion-v2.js`
   - ✅ Schema: FAQPage JSON-LD with internal links
   - ✅ HTML: V2 structure with FAQ index + accordion

4. **Required Assets**:
   - ✅ All global CSS files properly linked
   - ✅ Font Awesome 6.5.1 with integrity hash
   - ✅ Proper CSP headers

5. **Schema Compliance**:
   - ✅ All required schemas present
   - ✅ Absolute URLs throughout
   - ✅ Content matches visible page exactly

6. **Calculator-Specific**:
   - ✅ Minimum 3 related calculators
   - ✅ Schema relatedLink matches visible section

### Legacy Category Page Status
**Pages requiring systematic audit:**
- Main categories: `/finance/`, `/health/`, `/conversions/` (3 pages)
- Health subcategories: All 7 subcategory pages  
- Date-Time subcategories: All 8 subcategory pages
- Lifestyle subcategories: All 10 subcategory pages
- Math subcategories: All 8 subcategory pages

**Already compliant pages:**
- Finance: All subcategories ✅ (main page completed)
- Conversions: All subcategories ✅
- Business: Main + all subcategories ✅
- Math: Main page ✅
- Date-Time: Main page ✅
- Lifestyle: Main page ✅

### Workflow
1. User provides FAQ content for specific category
2. Update page with all 4 FAQ components
3. Update `dateModified` to current ISO 8601 format
4. **Update sitemap files**: 
   - Update `sitemap.xml` `lastmod` for the modified page
   - Update `sitemap/index.html` `dateModified` in schema
5. Commit all changes together (page + sitemaps)
6. Push for live testing
7. Validate functionality before proceeding to next page

### Lessons Learned
- **Always update sitemaps**: Critical for SEO and proper indexing
- **Batch sitemap updates**: Include sitemap changes in same commit as page updates
- **Test thoroughly**: Use live deployment for comprehensive testing
- **Strategic internal linking**: FAQ answers should link to relevant subcategory pages