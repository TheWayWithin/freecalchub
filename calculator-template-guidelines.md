# FreecalcHub Calculator Page - Template Usage Guidelines

**Version: 2.0 (Updated: May 24, 2025)**

## 1. Overview

This document provides guidelines for using the FreecalcHub master HTML template (`calculator_template.html`) to create new calculator pages. Adhering to this template ensures visual and structural consistency across all calculators, proper SEO markup, correct integration with global site assets (CSS/JavaScript), and automatic support for features like Dark Mode.

## 2. File Structure for a New Calculator

When creating a new calculator, for example, a "Loan Calculator" in the "Finance" category, the typical file structure within your project would be:

```
/ (Site Root)
├── css/                         # Global CSS folder
│   ├── styles.css
│   ├── dark-mode.css
│   ├── faq-styles-v2.css      # <-- Standard Global FAQ Styles (Theme-Aware)
│   └── ... (other global .css files)
├── js/                          # Global JS folder
│   ├── main.js
│   ├── dark-mode.js
│   ├── faq-accordion-v2.js    # <-- Standard Global FAQ Script
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

```
**Note:** `faq-styles-v2.css` and `faq-accordion-v2.js` are now the **standard, globally-linked** assets for FAQs. `faq-styles-v2.css` has been updated to use CSS variables and **supports both Light and Dark modes automatically**. No extra "fix" files are needed.

## 3. Creating a New Calculator Page

Follow these steps:

### Step 1: Copy the Master Template

1.  Take a copy of the latest `calculator_template.html`.
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
* **Note:** You *do not* need to link `faq-styles-v2.css`; it's already linked globally in the template's `<head>`.

### Step 4: Update Schema Markup

This is crucial for SEO. Carefully update all placeholders within the `<script type="application/ld+json"> ... </script>` block.

* **`SoftwareApplication`**:
    * `name`: `[Calculator Name]` (e.g., "Loan Calculator")
    * `applicationCategory`: Choose a relevant category (e.g., "FinanceApplication") or use descriptive text.
    * `description`: Repeat meta description or provide a slightly more detailed one.
    * `aggregateRating`: Remove if no rating system is in place.
* **`FAQPage`**: **IMPORTANT**
    * Add *every* question and answer pair from your FAQ section.
    * Ensure the `name` (question) and `text` (answer) **exactly match** the visible content on the page.
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

Modify the visible breadcrumbs to reflect the calculator's position in the site structure. Use full root-relative paths.

### Step 6: Navigation Ribbon (Optional)

* If your calculator's category uses a sub-navigation ribbon, uncomment this section in the template and populate the links.

### Step 7: Populate Main Content

* **Page Title (`<h1>`)**: Set to `[Calculator Name]`.
* **Calculator Description**: Write the introductory text.
* **Calculator Interface**: Design the `<form>`. Use semantic elements. Ensure unique `id`s for inputs and result fields.
* **"How to Use"**: Provide clear steps.
* **Educational Content**: Add relevant articles, explanations, formulas.
* **FAQ Section (Section 9.5)**: **MANDATORY V2 STRUCTURE** - Use the new, required structure.

    * **FAQ Index**:
        * Implement the `<div class="faq-index card">`.
        * Add an `<li><a href="#faq-item-X">Question Text?</a></li>` for *every* FAQ item.
        * Ensure the `href` **exactly matches** the `id` of the corresponding `div.faq-item`.

    * **FAQ Items**:
        * Use the following structure for *each* FAQ. This is **required** for correct functionality, accessibility, theming, and SEO.
        * Ensure each `div.faq-item` has a **unique `id`** (e.g., `id="faq-item-1"`).
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
    * This structure works automatically with `/css/faq-styles-v2.css` and `/js/faq-accordion-v2.js`.

### Step 8: Link Calculator-Specific JavaScript

* Modify the placeholder script tag:
    ```html
    <script src="/[path-to-your-calculator-folder]/js/[calculator-name].js" defer></script>
    ```
    to the correct **full root-relative path**.
* Create the corresponding JavaScript file.
* **Note:** You *do not* need to link `faq-accordion-v2.js`; it's already linked globally.

## 4. Best Practices

* **Root-Relative Paths**: **Always** use full root-relative paths (`/`) for assets and internal links.
* **CSS Variables**: Use standard site CSS variables for styling calculator-specific elements where possible to ensure consistency and theme support (Light/Dark Mode).
* **Accessibility**: Ensure `<label for="...">`, ARIA attributes, and keyboard navigability.
* **Validation & Error Handling**: Implement user-friendly input validation and error messages (DOM-based).
* **Comments**: Add comments to your HTML, CSS, and JS.
* **Testing**: Test calculations, responsiveness, browsers, and **Dark Mode**. Validate HTML/Schema. Test on a server (root-relative paths won't work with `file:///`).

## 5. Final Check

* Are all `[Placeholder Text]` items replaced?
* Are all paths correct and root-relative?
* Are all URLs in Schema/breadcrumbs absolute?
* Does `FAQPage` schema match visible FAQs?
* Does the FAQ Index link correctly?
* Does the FAQ section use the **required V2 structure**?
* Has the page been tested on a server, including Dark Mode?

