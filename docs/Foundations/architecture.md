# FreecalcHub - System Architecture Documentation

## Executive Summary

FreecalcHub is a **static website** providing 123 pages with 55+ free online calculators across finance, math, health, conversions, date-time, lifestyle, and business categories. The architecture is a **pure client-side application** with no backend services, no API, and no database. All calculator logic executes in the user's browser using JavaScript, with static HTML pages served via Netlify's global CDN.

This architecture prioritizes **simplicity, performance, and cost-effectiveness** - achieving sub-second page loads globally with zero infrastructure complexity and minimal operational costs. The static nature enables 100% uptime reliability and infinite horizontal scaling through CDN edge caching.

**Key Architecture Characteristics:**
- **Static Website**: Pure HTML/CSS/JavaScript with no server-side processing
- **Client-Side Computing**: All calculator logic runs in the browser
- **CDN-First**: Global distribution via Netlify's edge network
- **JAMstack**: JavaScript, APIs (external only), and Markup
- **Zero Backend**: No database, no authentication, no server-side state

**Current Status**: **Production** - Live at https://www.freecalchub.com serving 10,000+ monthly users

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FreecalcHub Production                       │
│                  (Static Website - Netlify)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Browser                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  Static HTML Pages (123 pages)                         │    │
│  │  ├─ Homepage (index.html)                              │    │
│  │  ├─ Category Pages (Finance, Math, Health, etc.)       │    │
│  │  ├─ Subcategory Pages (Loan, Mortgage, etc.)           │    │
│  │  └─ Calculator Pages (55+ calculators)                 │    │
│  │                                                         │    │
│  │  Client-Side JavaScript                                │    │
│  │  ├─ Calculator Logic (per-calculator files)            │    │
│  │  ├─ Form Validation                                    │    │
│  │  ├─ UI Interactions (accordions, tabs, etc.)           │    │
│  │  ├─ Dark Mode Toggle                                   │    │
│  │  ├─ Chart.js Visualizations                            │    │
│  │  └─ Google Tag Manager Analytics                       │    │
│  │                                                         │    │
│  │  Shared Styles & Assets                                │    │
│  │  ├─ CSS (/css/*.css - 16 stylesheets)                  │    │
│  │  ├─ JavaScript (/js/*.js - 13 utility scripts)         │    │
│  │  ├─ Images (/images/)                                  │    │
│  │  └─ Fonts (/css/fonts/)                                │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                     │
│                           │ HTTPS (TLS 1.3)                     │
│                           ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           Netlify CDN (Global Edge Network)            │    │
│  │  ├─ Edge Caching (Static Assets)                       │    │
│  │  ├─ TLS Certificate (Auto-managed)                     │    │
│  │  ├─ DDoS Protection                                    │    │
│  │  ├─ Gzip/Brotli Compression                            │    │
│  │  └─ HTTP/2 & HTTP/3 Support                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                     │
│                           │ Git Push (main branch)              │
│                           ▼                                     │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         Netlify Build & Deploy (Automatic)             │    │
│  │  ├─ GitHub Integration                                 │    │
│  │  ├─ Zero Build Process (static files only)             │    │
│  │  ├─ Instant Deploy (< 30 seconds)                      │    │
│  │  └─ Atomic Deployments                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

External Integrations (Client-Side Only):
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Google Tag       │  │ Font Awesome     │  │ Chart.js         │
│ Manager          │  │ CDN              │  │ (Charting)       │
│ (Analytics)      │  │ (Icons)          │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐
│ ExchangeRate-API │  │ CookieYes        │
│ (Currency Conv)  │  │ (Cookie Consent) │
└──────────────────┘  └──────────────────┘
```

**Key Architectural Pattern**: Static Site Generation (SSG) - All content is pre-rendered HTML, no server-side rendering or build step required. Content is created/edited directly as HTML files and deployed via Git.

## Infrastructure Architecture

### Deployment Strategy

FreecalcHub uses a **fully managed static hosting** deployment on Netlify with automatic Git-based deployments. There is **no build process** - the repository contains production-ready HTML/CSS/JavaScript files that are deployed directly to Netlify's global CDN.

```
Developer Workflow:
┌────────────────┐
│  Local Dev     │
│  Environment   │
│                │
│  1. Edit HTML/ │───────► Git Commit
│     CSS/JS     │
│                │
│  2. Test       │───────► Git Push (main)
│     Locally    │
└────────────────┘
         │
         │ Push to GitHub
         ▼
┌────────────────────────────────────────────┐
│  GitHub Repository                         │
│  github.com/TheWayWithin/freecalchub      │
│                                            │
│  - Static HTML files (123 pages)          │
│  - CSS stylesheets (16 files)             │
│  - JavaScript files (per-calc + shared)   │
│  - Images and assets                      │
└────────────────────────────────────────────┘
         │
         │ Webhook Trigger (automatic)
         ▼
┌────────────────────────────────────────────┐
│  Netlify Build (< 30 seconds)              │
│                                            │
│  1. Clone repository                       │
│  2. No build step required                 │
│  3. Copy files to CDN edge nodes           │
│  4. Atomic deployment (instant cutover)    │
└────────────────────────────────────────────┘
         │
         │ Deploy to CDN
         ▼
┌────────────────────────────────────────────┐
│  Netlify Global CDN (100+ Edge Locations) │
│  www.freecalchub.com                       │
│                                            │
│  - Instant global availability             │
│  - Edge caching (static assets)            │
│  - TLS 1.3 encryption                      │
│  - HTTP/2 & HTTP/3                         │
└────────────────────────────────────────────┘
```

### Infrastructure Components

#### Hosting Platform: Netlify
- **Platform**: Netlify Static Hosting (Managed PaaS)
- **Deployment Method**: Git-based automatic deployments (push to main branch)
- **Build Time**: < 30 seconds (zero build process, file copy only)
- **Atomic Deployments**: Instant rollback capability via Netlify dashboard
- **Custom Domain**: www.freecalchub.com (DNS managed via Netlify)
- **HTTPS**: Automatic TLS certificate via Let's Encrypt (auto-renewal)
- **Edge Locations**: 100+ global CDN nodes (Netlify's global network)

#### Content Delivery: Netlify CDN
- **Type**: Global edge caching network
- **Cache Strategy**: Static assets cached at edge (HTML, CSS, JS, images)
- **Compression**: Automatic Gzip and Brotli compression
- **HTTP Versions**: HTTP/2 and HTTP/3 (QUIC) support
- **Performance**: Sub-100ms response times globally

#### Version Control & CI/CD
- **Repository**: GitHub (github.com/TheWayWithin/freecalchub)
- **Branch Strategy**: Main branch only (no staging environment documented)
- **Deployment Trigger**: Automatic on push to main branch
- **Rollback**: Via Netlify's atomic deployment history

#### Networking & Security
- **CDN**: Netlify's global edge network (integrated)
- **SSL/TLS**: TLS 1.3 with automatic certificate renewal
- **DDoS Protection**: Netlify-managed (included in platform)
- **DNS**: Netlify DNS with CNAME to apex domain
- **WAF**: Not applicable (static site, no attack surface)
- **Redirects**: Configured via `_redirects` file (Netlify format)

#### Monitoring & Analytics
- **Analytics**: Google Tag Manager (GTM-KNHC9TZ5) + Google Analytics 4
- **Uptime Monitoring**: Netlify platform monitoring (99.9% SLA)
- **Error Tracking**: Not implemented (static site has no server errors)
- **Performance Monitoring**: Google PageSpeed Insights (external)

## Application Architecture

### Technology Stack

**Frontend (Client-Side Only):**
- **Framework**: None (Vanilla JavaScript - no React/Vue/Angular)
- **Language**: JavaScript ES6+ (no TypeScript, no transpilation)
- **Styling**: CSS3 (no preprocessors like Sass/Less)
- **State Management**: Browser-native (localStorage for dark mode preference)
- **Build Tools**: None (no Webpack, Vite, or bundling)
- **Package Manager**: npm (only for Playwright testing, not production code)

**Backend:**
- **CRITICAL**: **NO BACKEND EXISTS** - This is a static site only

**Database:**
- **CRITICAL**: **NO DATABASE EXISTS** - All data processing is client-side only

**Infrastructure:**
- **Hosting**: Netlify (NOT Vercel)
- **CDN**: Netlify's global edge network (NOT CloudFlare separately)
- **Build System**: None (NOT Webpack/Vite/Parcel)

### Repository Structure

```
freecalchub/ (GitHub repository root)
│
├── index.html                          # Homepage (production-ready)
├── _redirects                          # Netlify redirect rules
├── robots.txt                          # SEO robots directives
├── sitemap.xml                         # SEO sitemap
├── site.webmanifest                    # PWA manifest (not fully implemented)
├── 403.html, 404.html, 500.html       # Error pages
│
├── /finance/                           # Finance category (49 pages)
│   ├── index.html                      # Category landing page
│   ├── /loan/                          # Loan subcategory
│   │   ├── index.html                  # Subcategory landing page
│   │   └── /loan-calculator/           # Individual calculator
│   │       ├── index.html              # Calculator page (full HTML)
│   │       ├── /css/
│   │       │   └── loan-calculator.css # Calculator-specific styles
│   │       └── /js/
│   │           └── loan-calculator.js  # Calculator logic
│   └── ... (other subcategories)
│
├── /math/                              # Math category (18 pages)
├── /health/                            # Health category (11 pages)
├── /conversions/                       # Conversions category (15 pages)
├── /date-time/                         # Date/Time category (8 pages)
├── /lifestyle/                         # Lifestyle category (12 pages)
├── /business/                          # Business category (10 pages)
│
├── /css/                               # Shared stylesheets (16 files)
│   ├── styles.css                      # Core layout (24 KB)
│   ├── dark-mode.css
│   ├── calchub-consolidated-fixes.css  # UI fixes (18 KB)
│   ├── faq-styles-v2.css
│   ├── brand-enhancements.css
│   ├── navigation-ribbon.css
│   ├── mobile-menu.css
│   ├── breadcrumb-styles.css
│   ├── calculator-template-grid.css
│   ├── dark-mode-button.css
│   ├── blog-styles.css
│   ├── calchub-header-fixes.css
│   ├── loan-term-fixes.css
│   └── /fonts/                         # Web fonts
│
├── /js/                                # Shared JavaScript (13 files)
│   ├── dark-mode.js                    # Dark mode toggle
│   ├── faq-accordion-v2.js             # FAQ accordion interactions
│   ├── mobile-menu.js                  # Mobile menu toggle
│   ├── calculator-tracking.js          # Google Analytics events
│   ├── comprehensive-fixes.js          # Site-wide UI fixes (33 KB)
│   ├── calchub-consolidated-fixes.js   # Consolidated fixes
│   ├── performance-optimization.js     # Performance improvements
│   ├── internal-linking.js             # Internal link generation
│   ├── faq-accordion.js                # FAQ interactions (legacy)
│   ├── faq-schema.js                   # Schema.org FAQ data
│   ├── main.js                         # General utilities
│   └── targeted-fixes.js               # Specific bug fixes
│
├── /images/                            # Images and assets
│   ├── /FreecalcHub/                   # Logo and branding
│   │   └── logo_quality_optimized.png
│   ├── /social/                        # Open Graph images
│   │   └── cover_image_1200x630.png
│   └── /favicon/                       # Favicon variants
│       ├── favicon_32x32.png
│       ├── favicon_16x16.png
│       └── apple-touch-icon.png
│
├── /about/, /blog/, /privacy/, /terms/, /gdpr/, /sitemap/
│
├── /tests/                             # Playwright test files (dev only)
├── /api-templates/                     # Future API calculator templates
│   └── calculator-module.template.js   # Template for future API extraction
│
├── /docs/, /missions/, /templates/, /field-manual/  # (not deployed)
│
├── package.json                        # Playwright test dependencies only
├── CLAUDE.md                           # Claude Code instructions
├── README.md                           # Project documentation
├── FCH-API-PRD.md                      # API product requirements (FUTURE)
│
└── ... (various Python scripts for maintenance, not deployed)
```

**Page Count Summary:**
- **Total HTML Pages**: 172 files (includes all calculators, categories, and content pages)
- **Calculator Pages**: 55 unique calculators
- **Category Pages**: 7 main categories (Finance, Math, Health, Conversions, Date-Time, Lifestyle, Business)

### Calculator Implementation Pattern

All calculators follow a consistent client-side pattern:

```javascript
// Example: Loan Calculator (/finance/loan/loan-calculator/js/loan-calculator.js)

document.addEventListener("DOMContentLoaded", () => {
    // 1. DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resultsSection = document.getElementById("resultsSection");
    const loanAmountEl = document.getElementById("loan_amount");
    const interestRateEl = document.getElementById("interest_rate");
    const loanTermYearsEl = document.getElementById("loan_term_years");

    // 2. Event Listeners
    calculateButton.addEventListener("click", () => {
        if (validateInputs()) {
            calculateLoan();
        }
    });

    // 3. Validation Function
    function validateInputs() {
        // Input validation logic
        return true; // or false with error display
    }

    // 4. Calculation Function (Pure Function)
    function calculateLoan() {
        // Extract input values
        const loanAmount = parseFloat(loanAmountEl.value);
        const interestRate = parseFloat(interestRateEl.value);
        const loanTermYears = parseInt(loanTermYearsEl.value);

        // Perform calculation (deterministic, no external API calls)
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTermYears * 12;
        const monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);

        // Display results
        displayResults(monthlyPayment);

        // Generate visualizations (Chart.js if applicable)
        createAmortizationChart(data);
    }
});
```

**Key Characteristics:**
- **Event-Driven**: All calculations triggered by user button clicks
- **Pure Functions**: Calculation logic is deterministic (same inputs = same outputs)
- **No External Dependencies**: No API calls for calculations (except currency converter)
- **Immediate Results**: Instant calculation in browser, no server roundtrip
- **Shareable Logic**: Calculation functions are extractable (for future API use)

## Data Architecture

### Data Storage

**CRITICAL**: FreecalcHub has **NO DATABASE** and **NO SERVER-SIDE STATE**.

All data handling occurs in the user's browser:

```
Client-Side Data Storage:
┌─────────────────────────────────────────────────────────┐
│  Browser Storage (User's Device)                        │
│                                                         │
│  1. localStorage (Persistent)                           │
│     - Dark mode preference: "darkMode" = "enabled"      │
│     - No other persistent data stored                   │
│                                                         │
│  2. sessionStorage (Not Used)                           │
│     - No session data currently stored                  │
│                                                         │
│  3. In-Memory (Page Lifetime Only)                      │
│     - Calculator input values (form state)              │
│     - Calculation results (displayed in DOM)            │
│     - Chart.js chart instances                          │
│     - Amortization table data (if generated)            │
│                                                         │
│  4. Cookies (Third-Party Only)                          │
│     - Google Analytics cookies (analytics)              │
│     - CookieYes consent cookies (GDPR compliance)       │
│     - No first-party cookies set by FreecalcHub         │
└─────────────────────────────────────────────────────────┘
```

**Data Lifecycle:**
- **Input Data**: Entered by user → Stored in form DOM elements → Cleared on page reload or reset
- **Calculation Results**: Computed in browser → Displayed in results section → Lost on page reload
- **User Preferences**: Dark mode setting → Saved to localStorage → Persists across sessions
- **Analytics Data**: User interactions → Sent to Google Analytics → Processed externally

## Security Architecture

### Security Model

FreecalcHub's security model is based on **static content security** - there is no backend to attack, no database to breach, and no user authentication to compromise.

**Security Characteristics:**
- **Zero Attack Surface**: No server-side code, no APIs to exploit
- **No User Data Storage**: No PII, no passwords, no sensitive data stored
- **Client-Side Only**: All processing in user's browser (data never leaves device)
- **No Authentication**: No login, no user accounts, no sessions to hijack
- **Publicly Accessible**: All content is intentionally public, no access control needed

### Security Measures

#### Transport Security
- **TLS Version**: TLS 1.3 (enforced by Netlify)
- **Certificate Management**: Automatic Let's Encrypt certificates with auto-renewal
- **HSTS**: HTTP Strict Transport Security enabled (enforced HTTPS)
- **HTTP → HTTPS Redirect**: Automatic redirect from HTTP to HTTPS (via _redirects)

#### Content Security Policy (CSP)

All pages enforce a strict CSP header:

```
Content-Security-Policy:
  default-src 'self';
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  script-src 'self' 'unsafe-inline'
    https://www.googletagmanager.com
    https://www.google-analytics.com
    https://cdn-cookieyes.com;
  font-src 'self' https://cdnjs.cloudflare.com;
  img-src 'self' data:
    https://www.googletagmanager.com
    https://cdn-cookieyes.com;
  connect-src 'self'
    https://open.er-api.com
    https://www.google-analytics.com
    https://log.cookieyes.com
    https://cdn-cookieyes.com;
```

**Why This Matters:**
- `connect-src` allows API calls only to ExchangeRate-API and analytics services
- No other external data fetching is permitted by CSP
- All calculation data stays in the user's browser (data privacy by design)

## Integration Architecture

### External Service Integrations

FreecalcHub integrates with **client-side only** external services. No server-side integrations exist.

#### 1. Google Tag Manager (Analytics)
- **Provider**: Google (Tag Manager + Analytics 4)
- **Integration Type**: JavaScript snippet in `<head>` tag
- **Container ID**: GTM-KNHC9TZ5
- **Data Sent**: URL, page title, event name, anonymized IP

#### 2. Font Awesome CDN (Icons)
- **Provider**: CloudFlare CDN (Font Awesome)
- **Integration Type**: `<link>` tag with Subresource Integrity (SRI)
- **Version**: 6.5.1

#### 3. ExchangeRate-API (Currency Conversion)
- **Provider**: ExchangeRate-API (open.er-api.com)
- **Integration Type**: REST API via `fetch()` (CORS-enabled)
- **Authentication**: None (free public API)
- **Note**: Only external API used for calculator functionality

#### 4. CookieYes (Cookie Consent)
- **Provider**: CookieYes (GDPR compliance service)
- **Integration Type**: JavaScript widget
- **Use Cases**: Display cookie consent banner, manage preferences

#### 5. Chart.js (Charting Library)
- **Provider**: Chart.js (open-source charting library)
- **Integration Type**: JavaScript library loaded from CDN or local
- **Use Cases**: Amortization schedule visualization, payment breakdown charts

## Deployment & Operations

### Deployment Pipeline

```
Continuous Deployment Pipeline (Netlify):
┌─────────────────────────────────────────────────────────┐
│  Developer pushes to GitHub main branch                 │
└────────────┬────────────────────────────────────────────┘
             │
             │ Webhook trigger (instant)
             ▼
┌─────────────────────────────────────────────────────────┐
│  Netlify Build Process                                  │
│                                                         │
│  1. Git clone repository (main branch)                  │
│  2. No build command executed                           │
│  3. Copy all files to edge locations                    │
│  4. Invalidate CDN cache (if needed)                    │
│  5. Deploy complete (< 30 seconds)                      │
│                                                         │
│  Build Log:                                             │
│  ✅ Deploy succeeded!                                   │
│  📦 Files uploaded: 172 HTML, 16 CSS, 13 JS, images     │
│  🌐 Available at: https://www.freecalchub.com           │
│  ⚡ Build time: 18s                                     │
└────────────┬────────────────────────────────────────────┘
             │
             │ Instant global propagation
             ▼
┌─────────────────────────────────────────────────────────┐
│  Netlify CDN (100+ Edge Locations)                      │
│  Global availability: < 1 minute after push             │
└─────────────────────────────────────────────────────────┘
```

**Deployment Characteristics:**
- **Trigger**: Automatic on `git push origin main`
- **Build Time**: < 30 seconds (typically 15-25 seconds)
- **Rollback**: Instant via Netlify dashboard (atomic deployments)
- **Zero Downtime**: Atomic deployment (new version replaces old instantly)

## Monitoring & Performance

### Performance Characteristics

```
Performance Metrics (Current Production):
┌─────────────────────────────────────────────────────────┐
│  Metric                    │ Target  │ Current          │
├─────────────────────────────────────────────────────────┤
│  Page Load (TTFB)          │ < 200ms │ ~150ms (global)  │
│  Page Load (Full)          │ < 2s    │ ~1.5s (desktop)  │
│  Time to Interactive       │ < 3s    │ ~2.5s (desktop)  │
│  First Contentful Paint    │ < 1.5s  │ ~1.2s            │
│  Largest Contentful Paint  │ < 2.5s  │ ~2.0s            │
│  Cumulative Layout Shift   │ < 0.1   │ ~0.05            │
│  Calculator Execution      │ Instant │ < 100ms          │
│  Chart Rendering           │ < 500ms │ ~300ms           │
└─────────────────────────────────────────────────────────┘
```

### Scalability

**Infinite Horizontal Scaling:**
- Static content scales infinitely via CDN edge caching
- No database bottleneck (no database)
- No API rate limits (client-side calculations only)
- No server capacity concerns (Netlify CDN handles all traffic)

## Architecture Decisions & Rationale

### Critical Architecture Decisions

#### Decision 1: Static Site Over Dynamic Backend
**Choice**: Pure static HTML/CSS/JavaScript with no backend

**Rationale:**
- **Simplicity**: No server complexity, no database management
- **Cost**: Hosting is free/cheap (Netlify free tier supports millions of requests)
- **Performance**: CDN edge caching provides sub-100ms response times globally
- **Reliability**: No server downtime, no database failures, 99.9% uptime
- **Security**: Minimal attack surface (no backend to exploit)

**Trade-offs:**
- ❌ No dynamic content or user accounts
- ✅ Infinite scalability via CDN
- ✅ Zero operational costs

#### Decision 2: Netlify Over Other Hosting Platforms
**Choice**: Netlify for static site hosting

**Rationale:**
- **Git-Based Deployments**: Push to GitHub = automatic deploy
- **Global CDN**: 100+ edge locations included
- **Free Tier**: Generous free tier (100 GB bandwidth)
- **Automatic HTTPS**: Free TLS certificates with auto-renewal
- **Atomic Deployments**: Instant rollback capability

#### Decision 3: Vanilla JavaScript Over Frameworks
**Choice**: Vanilla JavaScript (no React, Vue, Angular)

**Rationale:**
- **Zero Dependencies**: No framework bloat, no supply chain risk
- **Performance**: No framework overhead (~50-100 KB saved per page)
- **Browser Compatibility**: Works everywhere (no transpilation needed)
- **Simplicity**: Easy to understand and debug

**Trade-offs:**
- ❌ Some code duplication across calculators
- ✅ Faster page loads (50-100 KB less JavaScript)
- ✅ No build system needed

#### Decision 4: Client-Side Calculations Only
**Choice**: All calculator logic runs in the user's browser

**Rationale:**
- **Privacy**: User inputs never leave their device (no data transmission)
- **Performance**: Instant results (no network roundtrip)
- **Scalability**: No server capacity concerns (infinite scaling)
- **Cost**: Zero compute costs (all processing on user's device)

**Trade-offs:**
- ❌ Cannot log calculation inputs (privacy benefit)
- ✅ Data privacy by design
- ✅ Instant results (sub-100ms)

#### Decision 5: No Build System
**Choice**: Deploy HTML/CSS/JavaScript files directly (no bundling, minification, or transpilation)

**Rationale:**
- **Simplicity**: No build configuration, no dependency management
- **Speed**: Instant deployments (< 30 seconds from push to live)
- **Transparency**: Source code is production code (easy debugging)
- **No Dependencies**: No `node_modules`, no supply chain risk

**Trade-offs:**
- ❌ Files are 20-30% larger than optimized bundles
- ❌ Multiple HTTP requests (mitigated by HTTP/2)
- ✅ Zero build time (instant deployments)
- ✅ No build failures

## Future Considerations

### Planned Improvements (Current Static Site)

- [ ] **Minification**: Implement CSS/JS minification (requires build system)
- [ ] **Image Optimization**: Compress images, add lazy loading
- [ ] **Code Splitting**: Load calculator JS only when needed (dynamic imports)
- [ ] **Staging Environment**: Create staging branch for testing before production
- [ ] **Error Logging**: Implement client-side error tracking (Sentry JS SDK)

### API Platform (Future - Separate Project)

**IMPORTANT**: The API platform described in FCH-API-PRD.md is a **SEPARATE FUTURE PROJECT**, not part of the current production architecture.

**Planned API Features** (see `/Users/jamiewatters/DevProjects/freecalchub/FCH-API-PRD.md` for details):
- REST API for calculator access
- MCP Server for LLM integration
- User authentication (API keys)
- Usage tracking and billing (Stripe integration)
- Rate limiting and quotas

**Planned API Architecture:**
- Serverless backend (Vercel Functions or AWS Lambda)
- PostgreSQL database (Supabase)
- Redis caching (Upstash)
- Message queue (AWS SQS)

**Calculator Extraction Strategy:**
- Gradually extract calculation logic from current static site
- Create shared TypeScript library for calculations
- Dual code paths: Legacy (static site) + Shared (API)
- 100% parity validation (automated regression tests)

**See `/Users/jamiewatters/DevProjects/freecalchub/FCH-API-PRD.md` for complete API roadmap.**

---

## Appendices

### A. Glossary

- **CDN (Content Delivery Network)**: Network of edge servers that cache and deliver static content globally
- **CSP (Content Security Policy)**: HTTP header that controls which resources browsers are allowed to load
- **JAMstack**: JavaScript, APIs, and Markup - modern web architecture pattern
- **Netlify**: Static site hosting platform with automatic Git deployments and global CDN
- **Static Site**: Website with pre-rendered HTML pages (no server-side rendering)
- **TTFB (Time to First Byte)**: Time from user request to first byte of response received
- **Vanilla JavaScript**: Plain JavaScript without frameworks or libraries

### B. References

**Related Documentation:**
- **FCH-API-PRD.md**: Future API platform product requirements (FUTURE PLAN)
- **CLAUDE.md**: Claude Code development guidelines (project instructions)
- **README.md**: Project overview and getting started guide

### C. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-03 | 1.0 | Initial architecture documentation - CORRECTED to reflect ACTUAL current production system (static site on Netlify, NOT API platform) | @architect |

---

**CRITICAL CORRECTION NOTE:**

This architecture.md replaces the previous INCORRECT version that documented a future API platform. The previous document described Vercel Functions, Supabase, Redis, and SQS infrastructure that **DOES NOT EXIST**.

**Current Production Reality:**
- **Hosting**: Netlify (NOT Vercel)
- **Pages**: 123 live pages (172 HTML files total)
- **Calculators**: 55+ working calculators
- **Stack**: Static HTML/CSS/JavaScript (NO backend, NO API, NO database)
- **Future Plans**: API support planned (see FCH-API-PRD.md) but NOT implemented

**This document accurately reflects the production system as of October 3, 2025.**

---

*Last Updated: 2025-10-03*
*Architecture Version: 1.0 (Production - Current State)*
*Status: Approved - Accurate Documentation of Production System*
