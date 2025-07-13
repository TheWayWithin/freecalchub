# FreecalcHub General Page - Template Usage Guidelines

**Version: 1.3 (Last Updated: 2025-06-15)**

## 1. Overview

This document provides comprehensive guidelines for using the FreecalcHub master HTML templates (`calculator_template.html` and `category_template.html`) to create new calculator pages and category/sub-category pages. Adhering to these guidelines ensures visual and structural consistency across the entire site, proper SEO markup, correct integration with global site assets (CSS/JavaScript), and automatic support for standard features like Dark Mode, responsive layouts, and the V2 FAQ system.

## 2. File Structure for New Pages

When creating a new page, the typical file structure within your project would be:

```
/ (Site Root)
├── css/                         # Global CSS folder
│   ├── styles.css             # Main site styles, NOW INCLUDES standard calculator form grid layout
│   ├── dark-mode.css          # Dark mode base styles
│   ├── dark-mode-button.css   # Styles for the dark mode toggle button
│   ├── breadcrumb-styles.css  # Styles for breadcrumbs
│   ├── calchub-consolidated-fixes.css # General site-wide fixes
│   ├── navigation-ribbon.css  # Styles for optional navigation ribbons
│   ├── faq-styles-v2.css      # Standard Global FAQ Styles (Theme-Aware)
│   └── ... (other global .css files)
├── js/                          # Global JS folder
│   ├── main.js                # Main site JavaScript (mobile menu, etc.)
│   ├── dark-mode.js           # Dark mode toggle logic
│   ├── faq-accordion-v2.js    # Standard Global FAQ Script
│   └── ... (other global .js files)
├── images/                      # Global images folder
│   └── logo.svg
├── finance/                     # Example category folder
│   └── loan-calculator/         # Folder for the new calculator (use lowercase, hyphens)
│       ├── index.html           # The main HTML file for this calculator (copied from calculator_template.html)
│       ├── css/
│       │   └── loan-calculator.css  # Specific CSS for this calculator
│       └── js/
│           └── loan-calculator.js   # Specific JavaScript for this calculator
└── ... (other categories and site files)

```
**Key Global Assets Notes:**
* `styles.css`: Now contains the **standard responsive grid layout** for fieldsets within calculator forms (targeting `.calculator-form fieldset`).
* `faq-styles-v2.css`: Provides theme-aware (Light/Dark Mode) styling for the V2 FAQ structure.
* `faq-accordion-v2.js`: Provides the functionality for the V2 FAQ accordion.
* All global CSS and JS files listed (and present in `calculator_template.html` and `category_template.html`) are linked directly from the template. You do not need to link them again.

## 3. Creating a New Calculator Page (using `calculator_template.html`)

Follow these steps meticulously:

### Step 1: Copy the Master Calculator Template

1.  Take a copy of the latest `calculator_template.html`.
2.  Place it in the appropriate new directory for your calculator (e.g., `finance/loan-calculator/index.html`).

### Step 2: Update Page Metadata (in `<head>`)

* **`<title>`**: Change `[Calculator Name] | FreecalcHub` to the specific title (e.g., `Loan Calculator | FreecalcHub`). This is crucial for SEO and browser tabs.
* **`<meta name="description">`**: Write a unique, concise description (150-160 characters) for the calculator. This is used by search engines.

### Step 3: Link Calculator-Specific CSS

* Modify the placeholder link in `calculator_template.html`:
    ```html
    <link rel="stylesheet" href="/[path-to-your-calculator-folder]/css/[calculator-name].css">
    ```
    to the correct **full root-relative path**.
    * Example: For a Loan Calculator at `finance/loan-calculator/`, this becomes:
        ```html
        <link rel="stylesheet" href="/finance/loan-calculator/css/loan-calculator.css">
        ```
* Create the corresponding CSS file (e.g., `finance/loan-calculator/css/loan-calculator.css`). Add calculator-specific styles here. Only add styles for elements unique to this calculator or for minor adjustments not covered by global styles.

### Step 4: Update Schema Markup (in `<head>`)

This is **critical** for SEO and rich search results. Carefully update all `[Placeholder Text]` items within the `<script type="application/ld+json"> ... </script>` block.

* **`SoftwareApplication`**:
    * `name`: `[Calculator Name]` (e.g., "Loan Calculator")
    * `applicationCategory`: Choose a relevant category (e.g., "FinanceApplication") or use descriptive text.
    * `description`: Repeat meta description or provide a slightly more detailed one.
    * `url`: The full canonical URL of the calculator page.
    * **`relatedLink`:** Populate this array with 3-5 relevant related calculators, matching the visible "Related Calculators" section. Each entry needs `@type` (usually `SoftwareApplication`), `name`, and `url` (absolute).
    * `aggregateRating`: Optional. Remove if no rating system is in place.
* **`FAQPage`**: **IMPORTANT**
    * Add *every* question and answer pair from your FAQ section.
    * The `name` (question) and `text` (answer) in the schema **must exactly match** the visible content on the page.
* **`HowTo`**:
    * `name`: `How to Use the [Calculator Name]`
    * Update `description` and all `step` elements to accurately reflect how to use *this specific calculator*.
* **`BreadcrumbList`**:
    * Update `itemListElement` entries. URLs **must be absolute** (e.g., `https://www.freecalchub.com/...`).
        * Position 2: `[Category Name]` and its absolute URL.
        * Position 3 (or 4 if a sub-category exists): `[Calculator Name]` and its absolute URL. Adjust position numbers accordingly.
* **`WebPage`**:
    * `name`: Match the `<title>`.
    * `description`: Match the `<meta name="description">`.
    * `url`: The absolute canonical URL of *this specific calculator page*.
    * `datePublished`: Set the initial publication date using **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**. Example: `2025-06-07T14:40:04Z`.
    * `dateModified`: Set the date of the last modification using **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**. Example: `2025-06-07T14:40:04Z`. (Can be the same as `datePublished` for new pages).

### Step 5: Update Breadcrumb Navigation (Visible on Page)

Modify the visible breadcrumbs to reflect the calculator's position in the site structure. Use full root-relative paths for links.

* Example for `finance/loan-calculator/`:
    ```html
    <div class="breadcrumbs">
        <div class="breadcrumbs-container">
            <a href="/">Home</a>
            <span class="separator">/</span>
            <a href="/finance/">Finance Calculators</a> <span class="separator">/</span>
            <span class="current">Loan Calculator</span>
        </div>
    </div>
    ```

### Step 6: Navigation Ribbon (Optional for Calculators)

* If your calculator's category uses a sub-navigation ribbon, uncomment the relevant HTML section in the template and populate the links with correct root-relative paths and names. Mark the current calculator's link (or its sub-category link if more appropriate) as `class="active"`.

### Step 7: Populate Main Content for Calculators

This is where you add all the unique content for your calculator.

* **Page Title (`<h1>`)**: Set to `[Calculator Name]`.
* **Calculator Introduction (`<section class="calculator-description-section">`)**: Write the introductory text. Explain what the calculator does, who it's for, and why it's useful. Be engaging and informative.
* **Calculator Interface (`<section id="calculator-section" class="calculator-interface">`)**:
    * The main `<form>` **must** have `id="calculatorForm"` and `class="calculator-form"`.
    * Structure inputs within `<fieldset>` and `<div class="form-group">`.
    * Define the results display within `<div id="resultsSection">`.
    * Include `<div id="errorMessages">`.
* **Related Calculators Section (`<section class="related-calculators">`)**:
    * This section is placed **after** the `resultsSection` and **before** the `how-to-use-section`.
    * Populate the `<ul>` with 3-5 links to relevant calculators. Each `<li>` should contain an `<a>` tag with:
        * `<span class="calculator-name">[Related Calculator Name]</span>`
        * `<span class="calculator-description">[Brief description of related calculator]</span>`
    * Ensure the `href` paths are correct and root-relative.
    * These links should correspond to the `relatedLink` entries in your `SoftwareApplication` schema.
* **"How to Use" Section (`<section class="how-to-use-section">`)**: Provide clear, step-by-step instructions.
* **Educational Content Section (`<section class="content-section">`)**: Add relevant articles, explanations, etc. Add multiple such sections if needed.
* **FAQ Section (`<section class="faq-section">`)**: **MANDATORY V2 STRUCTURE** - Add all FAQs using the required structure (FAQ Index + FAQ Items). Refer to the `calculator_template.html` for the precise HTML structure for each item (`div.faq-item`, `button.accordion`, `div.panel`).

### Step 8: Link Calculator-Specific JavaScript

* Modify the placeholder script tag in `calculator_template.html`:
    ```html
    <script src="/[path-to-your-calculator-folder]/js/[calculator-name].js" defer></script>
    ```
    to the correct **full root-relative path**.
* Create the corresponding JavaScript file.

## 4. Creating a New Category/Sub-Category Page (using `category_template.html`)

Follow these steps meticulously:

### Step 1: Copy the Master Category Template

1.  Take a copy of the latest `category_template.html`.
2.  Place it in the appropriate new directory for your category (e.g., `finance/index.html` or `finance/investments/index.html`).

### Step 2: Update Page Metadata (in `<head>`)

* **`<title>`**: Change `[Category Name] Calculators | FreecalcHub` to the specific title (e.g., `Finance Calculators | FreecalcHub`).
* **`<meta name="description">`**: Write a unique, concise description (150-160 characters) for the category, detailing the types of calculators it contains.
* **`<link rel="canonical">`**: Update the `href` to the absolute canonical URL of *this specific category page* (e.g., `https://www.freecalchub.com/finance/`).

### Step 3: Update Schema Markup (in `<head>`)

This is **critical** for SEO and rich search results. Carefully update all `[Placeholder Text]` items within the `<script type="application/ld+json"> ... </script>` block.

* **`CollectionPage`**:
    * `name`: Match the `<title>`.
    * `description`: Match the `<meta name="description">`.
    * `url`: Match the canonical URL of the page.
    * `datePublished`: Set the initial publication date using **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**. Example: `2025-06-07T15:06:00Z`.
    * `dateModified`: Set the date of the last modification using **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**. Example: `2025-06-07T15:06:00Z`.
    * `hasPart`: **IMPORTANT**. Add an entry for *each* calculator or sub-category listed on this page. Use `@type: "SoftwareApplication"` for direct calculator links and `@type: "WebPage"` or `"CollectionPage"` for sub-categories. Ensure `name` and `url` are accurate and `url` is absolute.
* **`BreadcrumbList`**:
    * Update `itemListElement` entries. URLs **must be absolute** (e.g., `https://www.freecalchub.com/...`).
        * Position 1: "Home".
        * Position 2 (if a sub-category): `[Parent Category Name]` and its absolute URL.
        * Last Position: `[Current Category Name]` and its absolute URL. Adjust positions based on hierarchy.
* **`FAQPage` (For Category Pages)**: **IMPORTANT**
    * Add *every* category-level question and answer pair here.
    * The `name` (question) and `text` (answer) in the schema **must exactly match** the visible content on the page.
    * **Crucially, include internal links** within the `text` property (answer) to relevant calculator pages on your site. Example: `[Category Answer 1. Include internal links to relevant calculators, e.g., <a href='/finance/loan/loan-calculator/'>Loan Calculator</a>]`

### Step 4: Update Breadcrumb Navigation (Visible on Page)

Modify the visible breadcrumbs to reflect the category's position in the site structure. Use full root-relative paths for links.

* Example for `finance/investments/`:
    ```html
    <div class="breadcrumbs">
        <div class="breadcrumbs-container">
            <a href="/">Home</a>
            <span class="separator">/</span>
            <a href="/finance/">Finance</a>
            <span class="separator">/</span>
            <span class="current">Investments</span>
        </div>
    </div>
    ```

### Step 5: Navigation Ribbon (Optional for Categories)

* Uncomment and populate this section if your category uses a sub-navigation ribbon for sibling categories. Ensure links are correct root-relative paths and the current category's link is marked `class="active"`.

### Step 6: Populate Main Content for Categories

* **Page Title (`<h1>`)**: Set to `[Category Name] Calculators` (e.g., `Finance Calculators`).
* **Category Description (`<p class="lead">`)**: Provide a clear, concise description of the category.
* **Calculator Grid (`<div class="calculator-grid">`)**:
    * For each calculator or sub-category, add a `div` with `class="calculator-card"` or `class="category-card"`.
    * Include an icon (`<div class="calculator-icon"> <i class="fas fa-icon"></i> </div>`), an `<h3>` with a link to the page, and a brief `<p>` description.
    * Ensure all `href` paths are correct and root-relative.
    * Example for a calculator:
        ```html
        <div class="calculator-card">
            <div class="calculator-icon"><i class="fas fa-home"></i></div>
            <h3><a href="/finance/mortgage/mortgage-calculator/">Mortgage Calculator</a></h3>
            <p>Calculate monthly payments, interest, and amortization</p>
        </div>
        ```
    * Example for a sub-category:
        ```html
        <div class="category-card">
            <div class="calculator-icon"><i class="fas fa-chart-line"></i></div>
            <h3><a href="/finance/investments/">Investment Calculators</a></h3>
            <p>Tools for understanding stocks, bonds, and portfolio growth.</p>
        </div>
        ```
* **About Category Section (`<section class="category-content-section">`)**: Add relevant introductory or educational content about the category.
* **FAQ Section (`<section class="faq-section content-section">`)**: **MANDATORY V2 STRUCTURE** - Add all category-specific FAQs using the required structure (FAQ Index + FAQ Items). Refer to `category_template.html` for the precise HTML structure for each item (`div.faq-item`, `button.accordion`, `div.panel`). Ensure unique IDs for each FAQ item (`id="faq-cat-item-X"`) and panel (`id="faq-cat-panel-X"`), and **include internal links within the answer text to relevant calculator pages.**

## 5. Best Practices for All Pages

* **Google Tag Manager (GTM) Implementation:**
    * The GTM `script` tag must be placed as high as possible in the `<head>` of the document.
    * The GTM `noscript` iframe must be placed immediately after the opening `<body>` tag.
    * The GTM container ID is `GTM-KNHC9TZ5`.
* **Content Security Policy (CSP) Requirements:**
    * **CRITICAL**: All pages must use the standard CSP from `calculator_template.html` which supports current GTM + CookieYes setup
    * Required CSP domains for script-src: `https://www.googletagmanager.com https://www.google-analytics.com https://cdn-cookieyes.com`
    * Required CSP domains for connect-src: `https://open.er-api.com https://www.google-analytics.com https://log.cookieyes.com https://cdn-cookieyes.com`
    * Calculator-specific additions (like Chart.js CDN) should be added to the template CSP, not custom per-page CSP
    * **Never modify CSP without updating the master template first** to maintain site-wide consistency
* **Root-Relative Paths**: **Always** use full root-relative paths (starting with `/`) for all internal links and asset references.
* **IDs and Classes**: Use unique and descriptive `id`s and meaningful classes.
* **CSS Variables**: Use standard site CSS variables for specific styles, leveraging global styles (`calculator-form`, `content-section`, `card`) where possible.
* **Accessibility (WCAG)**: Ensure labels, ARIA attributes, and keyboard navigability for all interactive elements.
* **Validation & Error Handling**: Implement client-side validation and display errors in `<div id="errorMessages">` for calculators.
* **API & External Dependencies**: For any calculator relying on an external data API, ensure the specification document clearly defines the API endpoint, authentication method, and location/name of the required access key.
* **Comments**: Add comments to HTML, CSS, and JS to explain complex sections or key decisions.
* **Testing**: Thoroughly test logic, responsiveness, cross-browser compatibility, HTML/Schema validation, and Dark Mode. Test on a server environment.
* **Date/Time Formatting**: For all date and time-related properties in Schema.org (`datePublished`, `dateModified`, etc.) and sitemap entries (`lastmod`), **always use the full ISO 8601 format including timezone (e.g., `YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS+00:00`)**.
* **Avoid Inline `<style>` Blocks for General Layout and Component Styling:** Do not add `<style>` blocks directly within individual page HTML files (`index.html`) for styling elements like `category-header`, `subcategory-cta`, or component styles. All page-specific CSS should reside in dedicated `.css` files linked in the `<head>`, and global styles should be managed in `styles.css`. If an element's styling (e.g., alignment) differs from expectations, first inspect global CSS (`styles.css`, etc.) and the relevant template, rather than adding inline overrides.

## 6. Charting & Canvas Elements (e.g., Chart.js)

*(This section applies primarily to calculator pages and remains the same as in v3.0 of calculator guidelines)*
Many calculators benefit from visual charts. Be aware of:
* **`ResizeObserver` Loop Risk:** Can occur with `responsive: true`.
* **FIX: Set Fixed Container Heights:** On the chart's parent container (e.g., `<div id="chart-container" style="position: relative; height: 400px;"></div>`). Container needs `position: relative;`. Avoid `auto` height. Set `responsive: true` and `maintainAspectRatio: false` in Chart.js options.
* **Use `update()` Method:** Prefer `chartInstance.update()` over destroying and recreating.
* **Visibility:** Ensure chart container is visible before initializing/updating.
* **Testing:** Explicitly test chart stability and responsiveness.

## 7. Final Check Before Completion

Before considering any page complete:
* Are all `[Placeholder Text]` and `TODO:` comments in the HTML template addressed?
* Are all paths correct and root-relative?
* Are all URLs in Schema.org markup and visible breadcrumbs absolute and correct?
* For calculator pages: Is the "Related Calculators" section populated correctly in both the HTML and the `relatedLink` schema?
* For calculator pages: Does the `FAQPage` schema exactly match the visible V2 FAQ content?
* For category pages: Are all `hasPart` entries in the `CollectionPage` schema accurate and complete, reflecting all listed calculators/sub-categories?
* **For category pages: Is the `FAQPage` schema correctly implemented and does it exactly match the visible FAQ content? Are internal links included in FAQ answers?**
* Has the page been tested on a server environment?
* Are all `datePublished`, `dateModified`, and `lastmod` (for sitemap) fields formatted using the **ISO 8601 standard (YYYY-MM-DDTHH:MM:SSZ)**?

