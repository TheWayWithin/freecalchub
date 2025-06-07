# FreecalcHub Calculator Page - Template Usage Guidelines

**Version: 3.2 (Updated: June 06, 2025)**

## 1. Overview

This document provides guidelines for using the FreecalcHub master HTML template (`calculator_template.html`) to create new calculator pages. Adhering to this template ensures visual and structural consistency across all calculators, proper SEO markup, correct integration with global site assets (CSS/JavaScript), and automatic support for standard features like Dark Mode, responsive form layouts, and the V2 FAQ system.

## 2. File Structure for a New Calculator

When creating a new calculator, for example, a "Loan Calculator" in the "Finance" category, the typical file structure within your project would be:

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
* All global CSS and JS files listed (and present in `calculator_template.html`) are linked directly from the template. You do not need to link them again.

## 3. Creating a New Calculator Page

Follow these steps meticulously:

### Step 1: Copy the Master Template

1.  Take a copy of the latest `calculator_template.html`.
2.  Place it in the appropriate new directory for your calculator (e.g., `finance/loan-calculator/index.html`).

### Step 2: Update Page Metadata (in `<head>`)

* **`<title>`**: Change `[Calculator Name] | FreecalcHub` to the specific title (e.g., `Loan Calculator | FreecalcHub`). This is crucial for SEO and browser tabs.
* **`<meta name="description">`**: Write a unique, concise description (150-160 characters) for the calculator. This is used by search engines.

### Step 3: Link Calculator-Specific CSS

* Modify the placeholder link in `calculator_template.html` (Section 4):
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

This is **critical** for SEO and rich search results. Carefully update all `[Placeholder Text]` items within the `<script type="application/ld+json"> ... </script>` block (Section 6 of the template).

** **`SoftwareApplication`**:
    * `name`: `[Calculator Name]` (e.g., "Loan Calculator")
    * `applicationCategory`: Choose a relevant category (e.g., "FinanceApplication") or use descriptive text.
    * `description`: Repeat meta description or provide a slightly more detailed one.
    * `url`: The full canonical URL of the calculator page.
    * **`relatedLink` (NEW):** Populate this array with 3-5 relevant related calculators, matching the visible "Related Calculators" section. Each entry needs `@type` (usually `SoftwareApplication`), `name`, and `url` (absolute). **IMPORTANT:** If more specialized calculators are planned (e.g., a simple 'Calorie Calculator' or 'Macro Calculator' that this comprehensive tool might later link to or supersede in some contexts), include them here with their intended future URLs, marking them as `(Future Link)` in the visible `name` property if they are not yet live pages.
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
* * **`WebPage`**:
    * `name`: Match the `<title>`.
    * `description`: Match the `<meta name="description">`.
    * `url`: The absolute canonical URL of *this specific calculator page*.
    * `datePublished`: Set the initial publication date using **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**. Example: `2025-06-07T14:40:04Z`.
    * `dateModified`: Set the date of the last modification using **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**. Example: `2025-06-07T14:40:04Z`. (Can be the same as `datePublished` for new pages).

### Step 5: Update Breadcrumb Navigation (Visible on Page)

Modify the visible breadcrumbs (Section 8 of the template) to reflect the calculator's position in the site structure. Use full root-relative paths for links.

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

**Key Global Assets Notes:**
* `styles.css`: Now contains the **standard responsive grid layout** for fieldsets within calculator forms (targeting `.calculator-form fieldset`).
* `faq-styles-v2.css`: Provides theme-aware (Light/Dark Mode) styling for the V2 FAQ structure.
* `faq-accordion-v2.js`: Provides the functionality for the V2 FAQ accordion.
* All global CSS and JS files listed (and present in `calculator_template.html`) are linked directly from the template. You do not need to link them again.

## 3. Creating a New Calculator Page

Follow these steps meticulously:

### Step 1: Copy the Master Template

1.  Take a copy of the latest `calculator_template.html` (ensure it's v3.1 or later to include the Related Calculators section).
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
    * **`relatedLink` (NEW):** Populate this array with 3-5 relevant related calculators, matching the visible "Related Calculators" section. Each entry needs `@type` (usually `SoftwareApplication`), `name`, and `url` (absolute).
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
    * `datePublished`: Set the initial publication date (YYYY-MM-DD).
    * `dateModified`: Set the date of the last modification using the full ISO 8601 format including timezone (e.g., `YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS+00:00`). Can be the same as `datePublished` for new pages.

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

### Step 6: Navigation Ribbon (Optional)

* If your calculator's category uses a sub-navigation ribbon, uncomment the relevant HTML section in the template and populate the links with correct root-relative paths and names. Mark the current calculator's link (or its sub-category link if more appropriate) as `class="active"`.

### Step 7: Populate Main Content

This is where you add all the unique content for your calculator.

* **Page Title (`<h1>`)**: Set to `[Calculator Name]`.
* **Calculator Introduction (`<section class="calculator-description-section">`)**: Write the introductory text.
* **Calculator Interface (`<section id="calculator-section" class="calculator-interface">`)**:
    * The main `<form>` **must** have `id="calculatorForm"` and `class="calculator-form"`.
    * Structure inputs within `<fieldset>` and `<div class="form-group">`.
    * Define the results display within `<div id="resultsSection">`.
    * Include `<div id="errorMessages">`.
* **Related Calculators Section (`<section class="related-calculators">`) (NEW)**:
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

## 4. Best Practices

* **Root-Relative Paths**: **Always** use full root-relative paths (starting with `/`).
* **IDs and Classes**: Use unique and descriptive `id`s and meaningful classes.
* **CSS Variables**: Use standard site CSS variables for calculator-specific CSS.
* **Global Styles**: Leverage global classes like `calculator-form`, `content-section`, `card`.
* **Accessibility (WCAG)**: Ensure labels, ARIA attributes, and keyboard navigability.
* **Validation & Error Handling**: Implement client-side validation and display errors in `<div id="errorMessages">`.
* **API & External Dependencies**: For any calculator relying on an external data API (e.g., for currency rates, inflation data, historical data), ensure the specification document clearly defines the API endpoint, authentication method (e.g., 'Requires API Key'), and the location/name of the required access key if applicable. This is a critical technical requirement for the developer.
* **Comments**: Add comments to HTML, CSS, and JS.
* **Testing**: Thoroughly test logic, responsiveness, browsers, HTML/Schema validation, and **Dark Mode**. Test on a server environment.
* **Date/Time Formatting**: For all date and time-related properties in Schema.org (`datePublished`, `dateModified`, etc.) and sitemap entries (`lastmod`), **always use the full ISO 8601 format including timezone (e.g., `YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS+00:00`)**.

## 5. Charting & Canvas Elements (e.g., Chart.js)

*(This section remains the same as in v3.0)*
Many calculators benefit from visual charts. Be aware of:
* **`ResizeObserver` Loop Risk:** Can occur with `responsive: true`.
* **FIX: Set Fixed Container Heights:** On the chart's parent container (e.g., `<div id="chart-container" style="position: relative; height: 400px;"></div>`). Container needs `position: relative;`. Avoid `auto` height. Set `responsive: true` and `maintainAspectRatio: false` in Chart.js options.
* **Use `update()` Method:** Prefer `chartInstance.update()` over destroying and recreating.
* **Visibility:** Ensure chart container is visible before initializing/updating.
* **Testing:** Explicitly test chart stability and responsiveness.

## 6. Final Check

Before considering the calculator page complete:
* Are all `[Placeholder Text]` and `TODO:` comments in the HTML template addressed?
* Are all paths correct and root-relative?
* Are all URLs in Schema.org markup and visible breadcrumbs absolute and correct?
* Is the "Related Calculators" section populated correctly in both the HTML and the `relatedLink` schema?
* Does the `FAQPage` schema exactly match the visible V2 FAQ content?
* Has the page been tested on a server environment?
* Are all `datePublished`, `dateModified`, and `lastmod` (for sitemap) fields formatted using the **ISO 8601 standard (YYYY-MM-DDTHH:MM:SSZ)**?
