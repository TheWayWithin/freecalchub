# FreecalcHub Calculator Page - Template Usage Guidelines

## 1. Overview

This document provides guidelines for using the FreecalcHub master HTML template (`calculator_template.html`) to create new calculator pages. Adhering to this template ensures visual and structural consistency across all calculators, proper SEO markup, and correct integration with global site assets (CSS/JavaScript).

## 2. File Structure for a New Calculator

When creating a new calculator, for example, a "Loan Calculator" in the "Finance" category, the typical file structure within your project would be:

```
/ (Site Root)
├── css/                         # Global CSS folder
│   ├── styles.css
│   ├── dark-mode.css
│   └── ... (other global .css files)
├── js/                          # Global JS folder
│   ├── main.js
│   ├── dark-mode.js
│   └── faq-accordion.js
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

## 3. Creating a New Calculator Page

Follow these steps:

### Step 1: Copy the Master Template

1.  Take a copy of the latest `calculator_template.html` (the one with detailed comments).
2.  Place it in the appropriate new directory for your calculator (e.g., `finance/loan-calculator/index.html`).

### Step 2: Update Page Metadata (in `<head>`) - Section 1

* **`<title>`**: Change `[Calculator Name] | FreecalcHub` to the specific title (e.g., `Loan Calculator | FreecalcHub`).
* **`<meta name="description">`**: Write a unique, concise description (150-160 characters) for the calculator.

### Step 3: Link Calculator-Specific CSS - Section 3

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

### Step 4: Update Schema Markup - Section 5

This is crucial for SEO. Carefully update all placeholders within the `<script type="application/ld+json"> ... </script>` block.

* **`SoftwareApplication`**:
    * `name`: `[Calculator Name]` (e.g., "Loan Calculator")
    * `applicationCategory`: Choose a relevant category (e.g., "FinanceApplication") or use descriptive text.
    * `description`: Repeat meta description or provide a slightly more detailed one.
    * `aggregateRating`: Remove if no rating system is in place for this calculator yet.
* **`FAQPage`**:
    * Add each question and answer relevant to *this specific calculator*. Ensure the text here matches the visible FAQs on the page.
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

### Step 5: Update Breadcrumb Navigation - Section 7

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

### Step 6: Navigation Ribbon (Optional) - Section 8

* If your calculator's category uses a sub-navigation ribbon (like the Mortgage Calculators do), uncomment this section and populate the links with correct root-relative paths and names. Mark the current calculator's link as `class="active"`.

### Step 7: Populate Main Content - Section 9

This is where you add all the unique content for your calculator.

* **Page Title (`<h1>`)**: Set to `[Calculator Name]`.
* **Calculator Description (Section 9.1)**: Write the introductory text.
* **Calculator Interface (Section 9.2)**:
    * Update the `<h2 class="section-title">`.
    * Design the `<form id="calculatorForm">`. Add `<fieldset>`, `<legend>`, `<div class="form-group">`, `<label>`, and `<input>` (or `<select>`, `<textarea>`) elements as needed for your calculator.
        * Give each input a unique `id` for JavaScript targeting and `label for`.
    * Define the structure for the results display within `<div id="resultsSection">`. Use unique `id`s for elements that JavaScript will populate (e.g., `<p id="monthlyPaymentResult">`).
* **"How to Use" (Section 9.3)**: Provide clear, step-by-step instructions.
* **Educational Content (Section 9.4)**: Add relevant articles, explanations, formulas, etc. Use multiple `<section class="content-section">` blocks if needed.
* **FAQ Section (Section 9.5)**: Add the visible Q&A content.
    * For simple Q&A: `<div class="faq-item"><h3>Question?</h3><p>Answer.</p></div>`
    * For accordion FAQs (requires `faq-accordion.js`):
        ```html
        <div class="faq-item">
            <button class="accordion" aria-expanded="false">Question?</button>
            <div class="panel"><p>Answer.</p></div>
        </div>
        ```

### Step 8: Link Calculator-Specific JavaScript - Section 12

* Modify the placeholder script tag:
    ```html
    <script src="/[path-to-your-calculator-folder]/js/[calculator-name].js" defer></script>
    ```
    to the correct **full root-relative path**.
    * Example: For a Loan Calculator at `finance/loan-calculator/`, this becomes:
        ```html
        <script src="/finance/loan-calculator/js/loan-calculator.js" defer></script>
        ```
* Create the corresponding JavaScript file (e.g., `finance/loan-calculator/js/loan-calculator.js`). This file will contain:
    * Event listeners for the "Calculate" and "Reset" buttons.
    * Functions to get input values.
    * Input validation logic.
    * The core calculation logic.
    * Functions to update the HTML elements in the results section.
    * Logic for any charts or dynamic tables (like amortization).

## 4. Best Practices

* **Root-Relative Paths**: Always use full root-relative paths (starting with `/`) for linking CSS, JS, images, and for `href` attributes in navigation/links. This ensures they work correctly regardless of how deep the calculator page is.
* **IDs and Classes**: Use unique and descriptive `id` attributes for elements that JavaScript will interact with. Use meaningful class names for styling.
* **Accessibility**:
    * Ensure all form inputs have associated `<label for="...">` tags.
    * Use appropriate ARIA attributes where necessary.
    * The "skip-link" is already in the template.
* **Validation**: Implement client-side input validation in your JavaScript to guide users.
* **Error Handling**: Provide clear feedback for calculation errors or invalid inputs.
* **Comments**: Add comments to your HTML (for sections), CSS (for complex rules), and JS (for logic).
* **Testing**:
    * Test calculations thoroughly.
    * Test responsiveness on different screen sizes.
    * Test in various browsers.
    * Validate HTML and Schema markup.
    * Deploy to a staging environment (or directly to Netlify via GitHub) to test with the actual server configuration, as local `file:///` testing will not work correctly with root-relative paths.

## 5. Final Check

Before committing:
* Have all `TODO` comments in the HTML template been addressed?
* Are all placeholder texts (like `[Calculator Name]`) replaced?
* Are all paths to calculator-specific CSS/JS correct and root-relative?
* Are all URLs in the Schema markup and breadcrumbs absolute and correct?
