# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreecalcHub is a free online calculator website (www.freecalchub.com) with calculators organized into categories: Finance, Math, Health, Conversions, Date & Time, Business, and Lifestyle. This is a static website deployed via Netlify with no build process - all files are served directly.

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

**BEFORE making any changes to calculators or templates:**

1. **Read `docs/SOP-CalcDev.md`** - Standard operating procedure for all development work
2. **Review `general-template-guidelines.md`** - Complete guidelines for template usage and best practices  
3. **Use `calculator-template.html`** - Master template for all new calculators
4. **Use `category-template.html`** - Master template for all category/subcategory pages
5. **Compare with templates when debugging** - Don't modify individual files without checking template standards first

**NEVER:**
- Copy from existing calculator pages (they may be outdated)
- Copy from existing category pages (they may be outdated)
- Modify CSP headers without updating templates first
- Make infrastructure changes without updating documentation

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

## Legacy Category Page Remediation

### Current Status (July 2025)
**Ongoing project to update legacy category pages to latest template standards.**

**Pages requiring FAQ v2 implementation:**
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

### FAQ Implementation Requirements
Each page needs:
1. **CSS Link**: `<link rel="stylesheet" href="/css/faq-styles-v2.css">`
2. **Schema Markup**: FAQPage JSON-LD with internal links
3. **HTML Structure**: V2 FAQ section with accordion interface
4. **JavaScript**: `<script src="/js/faq-accordion-v2.js" defer></script>`
5. **Content**: Custom FAQ content with strategic internal linking

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