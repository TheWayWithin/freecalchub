# FreecalcHub Calculator Page - Template Usage Guidelines

## 1. Overview

This document provides guidelines for using the FreecalcHub master HTML template (`calculator_template.html`) to create new calculator pages. Adhering to this template ensures visual and structural consistency across all calculators, proper SEO markup, and correct integration with global site assets (CSS/JavaScript).

## 2. File Structure for a New Calculator

When creating a new calculator, for example, a "Loan Calculator" in the "Finance" category, the typical file structure within your project would be:
/ (Site Root)
├── css/                         # Global CSS folder
│   ├── styles.css
│   ├── dark-mode.css
│   ├── faq-styles-v2.css      # <-- NEW Global FAQ Styles
│   └── ... (other global .css files)
├── js/                          # Global JS folder
│   ├── main.js
│   ├── dark-mode.js
│   ├── faq-accordion-v2.js    # <-- NEW Global FAQ Script
│   └── ... (other global .js files)
├── images/                      # Global images folder
│   └── logo.svg
├── finance/                     # Example category folder
│   └── loan-calculator/         # Folder for the new calculator (use lowercase, hyphens)
│       ├── index.html           # The main HTML file for this calculator
│       ├── css/
│       │   └── loan-calculator.css  # Specific CSS for this calculator
│       └── js/
│           └── loan-calculator.js   # Specific JavaScript for this calculator
└── ... (other categories and site files)
**Note:** `faq-styles-v2.css` and `faq-accordion-v2.js` are now considered part of the core global assets and are linked directly from the `calculator_template.html`.

## 3. Creating a New Calculator Page

Follow these steps:

### Step 1: Copy the Master Template

1.  Take a copy of the latest `calculator_template.html` (the full version provided previously).
2.  Place it in the appropriate new directory for your calculator (e.g., `finance/loan-calculator/index.html`).

### Step 2: Update Page Metadata (in `<head>`)

* **`<title>`**: Change `[Calculator Name] | FreecalcHub` to the specific title (e.g., `Loan Calculator | FreecalcHub`).
* **`<meta name="description">`**: Write a unique, concise description (150-160 characters) for the calculator.

### Step 3: Link Calculator-Specific CSS

* Modify the placeholder link:
    ```html
    <link rel="stylesheet" href="/[path-to-your-calculator-folder]/css/[calculator-name].css">
    ```
    to the correct **full root-relative path**.
    * Example: For a Loan Calculator at `finance/loan-calculator/`, this becomes:
        ```html
        <link rel="stylesheet" href="/finance/loan-calculator/css/loan-calculator.css">
        ```
* Create the corresponding CSS file (e.g., `finance/loan-calculator/css/loan-calculator.css`). Add calculator-specific styles here.
* **Note:** You *do not* need to link `faq-styles-v2.css` here; it's already linked in the template's `<head>`.

### Step 4: Update Schema Markup

This is crucial for SEO. Carefully update all placeholders within the `<script type="application/ld+json"> ... </script>` block.

* **`SoftwareApplication`**:
    * `name`: `[Calculator Name]` (e.g., "Loan Calculator")
    * `applicationCategory`: Choose a relevant category (e.g., "FinanceApplication") or use descriptive text.
    * `description`: Repeat meta description or provide a slightly more detailed one.
    * `aggregateRating`: Remove if no rating system is in place.
* **`FAQPage`**: **UPDATED**
    * Add *every* question and answer pair from your FAQ section.
    * Ensure the `name` (question) and `text` (answer) **exactly match** the visible content on the page.
    * This schema is vital for AI search features.
* **`HowTo`**:
    * `name`: `How to Use the [Calculator Name]`
    * Update steps to accurately reflect how to use *this specific calculator*.
* **`BreadcrumbList`**:
    * Update `itemListElement` entries. URLs **must be absolute**.
        * Position 2: `[Category Name]` and `https://www.freecalchub.com/[category-path]/`
        * Position 3 (or 4 if sub-category): `[Calculator Name]` and `https://www.freecalchub.com/[full-path-to-calculator]/`
* **`WebPage`**:
    * `name`: Match the `<title>`.
    * `description`: Match the `<meta name="description">`.
    * `url`: The absolute canonical URL of *this specific calculator page*.

### Step 5: Update Breadcrumb Navigation

Modify the visible breadcrumbs to reflect the calculator's position in the site structure.

* Example for `finance/loan-calculator/`:
    ```html
    <div class="breadcrumbs">
        <div class="breadcrumbs-container">
            <a href="/">Home</a>
            <span class="separator">/</span>
            <a href="/finance/">Finance Calculators</a> <span class="separator">/</span>
            <span class="current">Loan Calculator</span> </div>
    </div>
    ```

### Step 6: Navigation Ribbon (Optional)

* If your calculator's category uses a sub-navigation ribbon, uncomment this section in the template and populate the links with correct root-relative paths and names. Mark the current calculator's link as `class="active"`.

### Step 7: Populate Main Content

This is where you add all the unique content for your calculator.

* **Page Title (`<h1>`)**: Set to `[Calculator Name]`.
* **Calculator Description**: Write the introductory text.
* **Calculator Interface**:
    * Update the `<h2 class="section-title">`.
    * Design the `<form id="calculatorForm">`. Use `<fieldset>`, `<legend>`, `<div class="form-group">`, `<label>`, and `<input>`/`<select>`.
    * Give each input a unique `id` for JavaScript targeting and `label for`.
    * Define the structure for the results display within `<div id="resultsSection">`. Use unique `id`s for result elements.
* **"How to Use"**: Provide clear, step-by-step instructions.
* **Educational Content**: Add relevant articles, explanations, formulas, etc.
* **FAQ Section (Section 9.5)**: **UPDATED** - Add the FAQ content using the new structure.

    * **FAQ Index**:
        * Implement the `<div class="faq-index card">` section *before* the individual FAQs.
        * Add an `<li><a href="#faq-item-X">Question Text?</a></li>` for *every* FAQ item.
        * Ensure the `href` **exactly matches** the `id` of the corresponding `div.faq-item`.

    * **FAQ Items**:
        * Use the following structure for *each* FAQ. This structure is **required** for correct functionality, accessibility, and SEO.
        * Ensure each `div.faq-item` has a **unique `id`** (e.g., `id="faq-item-1"`, `id="faq-item-2"`).
        * Ensure the button and panel have corresponding `aria-controls` and `id` attributes (e.g., `aria-controls="faq-panel-1"` and `id="faq-panel-1"`).

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

### Step 8: Link Calculator-Specific JavaScript

* Modify the placeholder script tag:
    ```html
    <script src="/[path-to-your-calculator-folder]/js/[calculator-name].js" defer></script>
    ```
    to the correct **full root-relative path**.
    * Example: For a Loan Calculator at `finance/loan-calculator/`, this becomes:
        ```html
        <script src="/finance/loan-calculator/js/loan-calculator.js" defer></script>
        ```
* Create the corresponding JavaScript file. This file contains calculator-specific logic (input handling, calculations, output display).
* **Note:** You *do not* need to link `faq-accordion-v2.js`; it's already linked in the template.

## 4. Best Practices

* **Root-Relative Paths**: **Always** use full root-relative paths (starting with `/`) for linking CSS, JS, images, and internal pages.
* **IDs and Classes**: Use unique and descriptive `id`s for JS interaction and meaningful classes for styling.
* **Accessibility**:
    * Ensure all form inputs have associated `<label for="...">` tags.
    * Use appropriate ARIA attributes (the new FAQ structure includes `aria-expanded`, `aria-controls`, and `role="region"`).
    * The "skip-link" is already in the template.
* **Validation**: Implement client-side input validation.
* **Error Handling**: Provide clear feedback for errors.
* **Comments**: Add comments to your HTML, CSS, and JS.
* **Testing**:
    * Test calculations, responsiveness, and browsers.
    * Validate HTML and Schema markup.
    * **Crucially**: Test with a local web server or a staging environment (like Netlify) because `file:///` **will not work** with root-relative paths.

## 5. Final Check

Before committing:
* Are all `[Placeholder Text]` items replaced?
* Are all paths correct and root-relative?
* Are all URLs in Schema/breadcrumbs absolute and correct?
* Does the `FAQPage` schema match the visible FAQs?
* Does the FAQ Index link correctly to all FAQ items?
* Has the page been tested on a server environment?

