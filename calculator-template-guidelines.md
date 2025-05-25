# FreecalcHub Calculator Page - Template Usage Guidelines

**Version: 2.2 (Updated: May 25, 2025)**

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

* **`SoftwareApplication`**:
    * `name`: `[Calculator Name]` (e.g., "Loan Calculator")
    * `applicationCategory`: Choose a relevant category (e.g., "FinanceApplication") or use descriptive text.
    * `description`: Repeat meta description or provide a slightly more detailed one.
    * `url`: The full canonical URL of the calculator page.
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
    * `dateModified`: Set the date of the last modification (can be the same as `datePublished` for new pages).

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

### Step 6: Navigation Ribbon (Optional)

* If your calculator's category uses a sub-navigation ribbon, uncomment the relevant HTML section in the template and populate the links with correct root-relative paths and names. Mark the current calculator's link as `class="active"`.

### Step 7: Populate Main Content (Sections 9.1 - 9.7)

This is where you add all the unique content for your calculator.

* **Page Title (`<h1>`)** (Section 9.1): Set to `[Calculator Name]`.
* **Calculator Introduction** (Section 9.2): Write the introductory text explaining the calculator.
* **Calculator Interface** (Section 9.3):
    * The main `<form>` **must** have `id="calculatorForm"` (for JS) and `class="calculator-form"` (to enable the standard global fieldset grid layout).
    * Fieldsets (`<fieldset>`) within this form will automatically have a responsive multi-column grid layout provided by `styles.css`.
    * Use `<legend>` for fieldset titles.
    * Structure inputs within `<div class="form-group">`. Each `.form-group` will be a grid item within the fieldset.
    * Use `<label for="uniqueId">` for all inputs, and ensure the `id` attribute on the input matches.
    * Define the structure for the results display within `<div id="resultsSection">` (initially `style="display:none;"`).
    * Include `<div id="errorMessages" class="error-messages" style="display:none;"></div>` for displaying validation errors.
* **"How to Use" Section** (Section 9.4): Provide clear, step-by-step instructions.
* **Educational Content Section** (Section 9.5): Add relevant articles, explanations of formulas, definitions, etc.
* **FAQ Section** (Section 9.6): **MANDATORY V2 STRUCTURE** - Add all FAQs using the new, required structure.

    * **FAQ Index**:
        * Implement the `<div class="faq-index card">` section *before* the individual FAQs.
        * Add an `<li><a href="#faq-item-X">Question Text?</a></li>` for *every* FAQ item.
        * Ensure the `href` (e.g., `#faq-item-1`) **exactly matches** the `id` of the corresponding `div.faq-item` (e.g., `id="faq-item-1"`).

    * **FAQ Items**:
        * Use the following structure for *each* FAQ. This structure is **required** for correct functionality, accessibility, theming (Light/Dark Mode), and SEO.
        * Ensure each `div.faq-item` has a **unique `id`** (e.g., `id="faq-item-1"`).
        * The `button` must have `aria-expanded="false"` initially and `aria-controls` pointing to the panel's `id`.
        * The panel `div` must have a unique `id` (e.g., `id="faq-panel-1"`) and `role="region"`.
        * The `<span class="accordion-icon"></span>` is essential for the +/- visual cue and **must not be removed**.

        ```html
        <div class="faq-item" id="faq-item-1">
            <h3>
                <button class="accordion" aria-expanded="false" aria-controls="faq-panel-1">
                    [Question 1?]
                    <span class="accordion-icon"></span>
                </button>
            </h3>
            <div class="panel" id="faq-panel-1" role="region">
                <p>[Answer 1]</p>
            </div>
        </div>
        ```
    * This structure uses `/css/faq-styles-v2.css` and `/js/faq-accordion-v2.js`, which are linked globally in the template.
* **Related Calculators (Optional)** (Section 9.7): If relevant, add links to other calculators.

### Step 8: Link Calculator-Specific JavaScript

* Modify the placeholder script tag in `calculator_template.html` (Section 13):
    ```html
    <script src="/[path-to-your-calculator-folder]/js/[calculator-name].js" defer></script>
    ```
    to the correct **full root-relative path**.
* Create the corresponding JavaScript file (e.g., `finance/loan-calculator/js/loan-calculator.js`). This file contains calculator-specific logic (input handling, calculations, DOM manipulation for results and errors).
* **Note:** You *do not* need to link `faq-accordion-v2.js` or other global JS files like `main.js` or `dark-mode.js`; they are already linked in the template.

## 4. Best Practices

* **Root-Relative Paths**: **Always** use full root-relative paths (starting with `/`) for linking CSS, JS, images, and internal pages (e.g., `<a href="/finance/another-calculator/">`).
* **IDs and Classes**: Use unique and descriptive `id`s for JavaScript interaction and meaningful classes for styling. Follow existing BEM-like conventions if observed.
* **CSS Variables**: For calculator-specific CSS, use standard site CSS variables (e.g., `var(--primary-color)`, `var(--text-color)`) wherever possible to ensure consistency and proper theme support (Light/Dark Mode).
* **Global Styles**: Leverage standard classes like `calculator-form` to automatically apply site-wide layouts (like the fieldset grid). Only add calculator-specific CSS for elements unique to the current calculator or for minor styling adjustments not covered by global rules.
* **Accessibility (WCAG)**:
    * Ensure all form inputs have associated `<label for="...">` tags that correctly point to the input's `id`.
    * Use appropriate ARIA attributes where necessary (the V2 FAQ structure includes these).
    * Ensure keyboard navigability for all interactive elements.
    * The "skip-link" is already in the template.
* **Validation**: Implement client-side input validation (e.g., using HTML5 `required`, `type="number"`, `min`, `max` attributes).
* **Error Handling**: Provide clear, user-friendly feedback for invalid inputs or calculation errors. Display these messages in the `<div id="errorMessages">` element, not using `alert()`.
* **Comments**: Add comments to your HTML (explaining sections, TODOs), CSS (explaining complex rules or sections), and JS (explaining functions and complex logic). The template contains many TODO comments to guide you.
* **Testing**:
    * Thoroughly test calculation logic with valid, invalid, and edge-case inputs.
    * Test responsiveness across different screen sizes (desktop, tablet, mobile).
    * Test in latest versions of major browsers (Chrome, Firefox, Safari, Edge).
    * Validate HTML (e.g., W3C Nu Html Checker) and Schema Markup (e.g., Google Rich Results Test).
    * **Crucially**: Test with a local web server or a staging environment (like Netlify) because `file:///` **will not work** with root-relative paths.
    * Verify Light and **Dark Mode** display for all elements.

## 5. Final Check

Before considering the calculator page complete:
* Are all `[Placeholder Text]` and `TODO:` comments in the HTML template addressed?
* Are all paths (CSS, JS, images, internal links) correct and fully root-relative?
* Are all URLs in Schema.org markup and visible breadcrumbs absolute and correct?
* Does the `<form>` element have `class="calculator-form"` to enable the standard fieldset grid layout?
* Does the `FAQPage` schema markup exactly match the questions and answers visible in the V2 FAQ section?
* Does the FAQ Index link correctly to all FAQ items, and does each FAQ item use the **MANDATORY V2 HTML structure**?
* Has the page been tested on a server environment, including calculations, responsiveness, and Dark Mode?
