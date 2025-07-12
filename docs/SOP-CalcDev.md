# Standard Operating Procedure: Calculator Developer

**Site:** FreecalcHub (www.freecalchub.com)
**Role:** Calculator Developer (Human or AI Agent)
**Version: 3.7**
**Date: June 11, 2025**
**Status:** Active

## 1. Purpose

The purpose of this Standard Operating Procedure (SOP) is to define the standardized process for developing, testing, and deploying new calculators, as well as creating and updating associated category/sub-category pages on the FreecalcHub website.

This SOP aims to:

* Ensure consistency in design, functionality, and code quality across all calculators and site pages.
* Streamline the development workflow for efficient rollout of new features and content.
* Clarify roles, responsibilities, inputs, and deliverables for the Calculator Developer.
* Maintain a high standard of user experience and SEO best practices.

## 2. Scope

This SOP applies to all activities undertaken by the Calculator Developer related to the creation, modification, and deployment of calculator tools and their corresponding category/subcategory page updates on the FreecalcHub platform. This includes front-end development (HTML, CSS, JavaScript), content integration, schema markup implementation, category page updates, and adherence to established templates and guidelines.

## 3. Responsibilities

### 3.1. Calculator Developer

* **Calculator Development:**
    * Develop the front-end structure (HTML) for new calculator pages based on the master `calculator_template.html`.
    * Implement the core calculation logic and user interface interactions using JavaScript.
    * Create calculator-specific CSS to style unique elements, ensuring consistency with global site styles.
* **Content & SEO Integration:**
    * Integrate all provided textual content for calculator pages, including introductions, educational material, "how-to-use" sections, and FAQs, as per the Calculator Specification Document.
    * Implement all specified SEO elements (page titles, meta descriptions) and structured data (Schema.org markup in JSON-LD format) accurately on calculator pages, referencing provided Schema Markup Templates and the Calculator Specification Document.
    * Ensure selection and integration of 3-5 relevant "Related Calculators" with descriptive links, both in the visible page content (as per `general-template-guidelines.md`) and within the `relatedLink` property of the `SoftwareApplication` schema.
* **Sitemap Updates:**
    * Accurately update `sitemap.xml` with the URLs of any new or modified calculator pages, category pages, or sub-category pages.
    * Add corresponding user-friendly links for these new/modified pages to the HTML sitemap page located at `/sitemap/index.html`, maintaining its hierarchical structure.
* **Category Page Management:**
    * Create new category or sub-category HTML pages as required for new calculator groupings, strictly following the master `category_template.html` and `general-template-guidelines.md`, as well as any specific content guidelines provided in the Category Page Update Requirements.
    * Update existing category and sub-category pages (HTML) to add links, descriptive "calculator cards," and any other required elements to feature newly developed calculators, as specified.
    * Ensure navigation elements (main navigation, breadcrumbs, navigation ribbons) on new and updated pages are consistent and correctly link to new and existing pages.
    * **Implement Category Page FAQs:** Integrate relevant FAQ content and schema markup (FAQPage) on category pages as per `general-template-guidelines.md`, ensuring internal linking within answers to relevant calculator pages.
* **Adherence to Standards:**
    * Strictly follow the `general-template-guidelines.md` and the master `calculator_template.html` for all new calculator pages.
    * Ensure all code (HTML, CSS, JS) is well-commented, clean, and maintainable.
* **Testing & Quality Assurance:**
    * Perform thorough functional testing of calculators with a wide range of valid and invalid inputs.
    * Verify the accuracy of calculations against known examples or manual computations.
    * Conduct cross-browser compatibility testing (latest versions of Chrome, Firefox, Safari, Edge).
    * Ensure calculator pages and updated category pages are fully responsive across desktop, tablet, and mobile devices.
    * Validate HTML and Schema markup using appropriate online tools.
    * Prepare a Test Plan / QA Checklist Document for human testers if the developer is an AI agent.
* **Collaboration & Communication:**
    * Liaise with the Content/SEO Lead or Project Manager to clarify requirements and report progress.
    * Incorporate feedback from reviews effectively.
* **Version Control & Deployment:**
    * Commit all code changes (new calculator files, updated category pages, supporting documents like test plans) to the FreecalcHub GitHub repository following established branch and commit message conventions.
    * Understand that commits to the designated main/production branch will trigger automatic deployment via Netlify.

### 3.2. Content/SEO Lead (or Project Manager)

* Provide the Calculator Developer with all necessary inputs (see Section 4).
* Maintain and update the master `calculator_template.html`, `general-template-guidelines.md`, and generic category page templates if applicable.
* Review completed calculator pages, updated category pages, and any developer-generated supporting documents (e.g., AI-generated test plan).
* Oversee human QA/UX testing based on the provided test plan.
* Provide final approval before work is considered complete.

## 4. Inputs for Development

To initiate the development of a new calculator and associated category page updates, the Calculator Developer must receive the following:

* Master `calculator_template.html`: The latest approved version.
* `general-template-guidelines.md`: The latest approved version of the comprehensive usage guidelines.
* `category_template.html`: The latest approved version for category/sub-category pages
* Calculator Specification Document: A detailed document (e.g., `[priority-number]_[calculator-name]_spec.md`) for each specific calculator, which must include:
    * Calculator Name and Purpose.
    * Target URL Structure for the calculator page.
    * SEO Elements (Title, Meta Description, Keywords).
    * Detailed Content Outline for all sections of the calculator page (Introduction, How-to-Use, Educational Material, etc.).
    * Calculator Tool Details (Input Fields, Output Fields, Calculation Logic/Formulas).
    * FAQ Section content (Questions & Answers).
    * Related Calculators list.
    * Visual Elements requirements (if any).
    * Related Calculators List: A curated list of 3-5 relevant calculators, including their target URLs and brief (1-2 line) descriptions suitable for the 'Related Calculators' section.
    * API & External Service Details (if applicable): If the calculator requires an external API, the document must specify:
        * The exact API endpoint(s) to be used.
        * The authentication method (e.g., "Requires API Key," "Public/No Key").
        * The **exact method of access key usage/variable name** if applicable (e.g., "API Key is passed via `X-API-Key` header with value from environment variable `API_KEY_FREEHALC`," or "No key required, public API").
        * The specific data source to be credited on the page (e.g., "Data sourced from exchangerate.host").
* **Current Sitemap Files:** The latest `sitemap.xml` and `/sitemap/index.html` files must be provided for incremental updates to ensure consistency.
* Schema Markup Templates / Specifics: A document like `schema_markup_templates_next_calculators.md` or specific JSON-LD blocks/values for the new calculator and potentially for updated category pages.
* Category Page Update Requirements:
    * Clear instructions if a new category/sub-category page needs to be created (including its URL, title, H1, introductory content, schema details, and list of calculators to include).
    * Details on which existing category/sub-category pages need to be updated to link to the new calculator.
    * Content for the "calculator card" (icon suggestion, short description) for display on category pages.
    * **Category Page FAQ Content:** Specific questions and answers to be included as FAQs on category pages, along with suggestions for internal links to relevant calculators within the answers.
* Access to FreecalcHub GitHub Repository.

## 5. Workflow

The development process includes the calculator and relevant category page updates:

1.  **Task Assignment & Input Reception:**
    * The Developer (AI Agent or Human) receives the Calculator Specification Document, Schema Markup details, Category Page Update Requirements, and confirmation to begin from the Content/SEO Lead.
    * Developer confirms receipt and understanding of all inputs listed in Section 4.
    * **Category Page Strategy Confirmation:** Based on the target URL and provided category page updates, the Developer will explicitly state their plan for category pages (e.g., "I will update existing page X, and create new page Y") and, if not provided, request the current HTML content of any existing category pages that require modification.
2.  **Calculator Directory & File Setup:**
    * Create the new calculator's directory structure (e.g., `/finance/loan/new-calculator-name/`) and its `css/` and `js/` subfolders.
    * Copy `calculator_template.html` to the new directory, renaming it `index.html`.
3.  **Calculator HTML Page Implementation (based on template and spec):**
    * Implement Sections 1-5, 7-9, and 12 from the commented `calculator_template.html` (Metadata, CSS links, Schema, Breadcrumbs, Ribbon, Page Title, Content Sections, Calculator UI, JS link).
4.  **Develop Calculator-Specific CSS & JavaScript (as per spec).**
5.  **Category Page Updates / Creation:**
    * Identify Target Category Pages: Based on requirements, identify existing category/sub-category `index.html` files that need updating, or determine if a new category page is needed.
    * When new calculator pages, category pages, or sub-category pages are created or their URLs change, their full canonical URLs must be noted by the developer for sitemap updates. The structure for calculator pages would be: [main-category]/[sub-category-if-any]/[calculator-name]-calculator/ All `lastmod` and `dateModified` properties in sitemaps and schema must use the **full ISO 8601 format including timezone (e.g., `YYYY-MM-DDTHH:MM:SSZ`)**.
    * Create New Category Page (if required):
        * if a new category/sub-category page is needed, create its directory structure and index.html file by copying the master `category_template.html` and adapting it according to `general-template-guidelines.md` and the specific requirements.
        * Populate the new category page with its title, H1, introductory content, calculator cards, appropriate schema, **and FAQ section (if provided)** as per requirements.
    * Update Existing Category Pages:
        * Add a "calculator card" (HTML snippet including icon, title, short description, and link) for the new calculator to the relevant grid/list section of the identified category/sub-category pages.
        * Ensure the layout remains consistent (e.g., correct number of columns in a grid).
        * Update any `ItemList` or `hasPart` schema on the category page to include the new calculator.
        * Verify all links on the category page are correct.
        * **Integrate Category Page FAQs:** Add the FAQ section HTML structure (from `category_template.html`) and populate it with the provided content and schema, ensuring internal links are correctly added to relevant calculators.
6.  **Prepare Testing Documentation (especially if Developer is an AI Agent):**
    * The Developer (or AI Agent) generates a Test Plan / QA Checklist Document.
    * This document should outline:
        * Key functionalities to test for the calculator.
        * A range of test cases (valid inputs, edge cases, invalid inputs) and expected outputs.
        * UI/UX aspects to verify (responsiveness, clarity, ease of use).
        * Checks for content accuracy and SEO elements on the calculator page.
        * Checks for correct linking and display on updated/new category pages, **including proper display and functionality of category FAQs and their internal links**.
7.  **Developer Self-Testing & QA (as per SOP Section 3.1):**
    * The Developer performs initial testing based on the generated Test Plan.
    * Validate HTML & Schema markup. Check console for errors.
8.  **Commit, Push & Handoff for Review:**
    * Add all new and modified files (calculator files, updated category page HTML files, Test Plan document) to Git; explicitly include:
        * Updated `sitemap.xml` file (containing only changes relevant to the current task and maintaining existing entries, with updated ISO 8601 `lastmod` dates).
        * Updated `/sitemap/index.html` file (the HTML sitemap page, adding new links hierarchically and updating its `dateModified` in schema).
    * Commit changes with clear messages (e.g., "feat: Add [Calculator Name], update category pages, sitemaps, add test plan - Closes #[IssueNumber]").
    * Push to GitHub.
    * Notify Content/SEO Lead that development is complete and ready for review and human QA testing.
9.  **Human QA/UX Testing & Review (by Content/SEO Lead or designated testers):**
    * Testers use the Test Plan / QA Checklist Document to conduct thorough testing.
    * Content/SEO Lead reviews for content accuracy, SEO, and overall quality.
    * Feedback is provided to the Developer.
10. **Revisions (if necessary):**
    * Developer incorporates feedback and fixes any reported bugs.
    * Steps 7-9 are repeated until approval.
11. **Deployment & Final Live Review:**
    * Once approved, if not already deployed via main branch commits, ensure changes are merged for Netlify deployment.
    * Developer and Content/SEO Lead review the live calculator page AND all updated category/sub-category pages.
    * If issues are found post-deployment, create new tasks/bugs and repeat relevant steps.

## 6. Outputs / Deliverables

The primary deliverables for each new calculator development task include:

* Calculator HTML Page: A fully populated `index.html` file for the calculator.
* Calculator-Specific CSS: A `[calculator-name].css` file.
* Calculator-Specific JavaScript: A `[calculator-name].js` file.
* Updated Category/Sub-category Page(s): Modified `index.html` file(s) for relevant category pages.
* New Category/Sub-category Page(s) (if applicable): All necessary files for any newly created category pages.
* Test Plan / QA Checklist Document: A document outlining test cases and QA checks for the new calculator and associated pages.
* All content, SEO elements, and schema markup are accurately implemented on all new/modified pages.
* Updated `sitemap.xml` file reflecting any new or modified page URLs.
* Updated `/sitemap/index.html` page with links to any new or modified pages.
* Code committed and pushed to the GitHub repository.
* A fully tested (by developer and human QA) and functional calculator and correctly updated category pages on the live FreecalcHub website.

## 7. Tools & Technologies

* HTML5
* CSS3 (including CSS Variables, Flexbox, Grid)
* JavaScript (ES6+) (Vanilla JS, no external frameworks unless specified)
* Master `calculator_template.html`
* FreecalcHub Global Stylesheets and JavaScript files
* Git & GitHub for version control and collaboration.
* Netlify for continuous deployment.
* Web Browser Developer Tools (Inspector, Console, Network tab) for development and debugging.
* Online Validation Tools:
    * W3C Nu Html Checker
    * Google Rich Results Test / Schema Markup Validator
* Text Editor / IDE (e.g., VS Code)

## 8. Quality Assurance Checklist

Before considering work complete (passing to human QA/final review), ensure:

* All `TODO` items in the `calculator_template.html` have been addressed for the new calculator page.
* All content from the specification document is accurately reflected on the calculator page.
* All input fields on the calculator function as expected, with appropriate validation.
* Calculator calculations are accurate for a range of test cases.
* Calculator results are displayed clearly and correctly.
* The new calculator page AND any modified/new category pages are fully responsive.
* The new calculator page AND any modified/new category pages function correctly in all supported browsers.
* If a new category page was created, does it correctly use `category_template.html` and follow `general-template-guidelines.md`?
* Is the Navigation Ribbon correctly implemented and populated on all relevant category pages (including the active class)?
* Does the category page Schema (CollectionPage, BreadcrumbList, hasPart) validate correctly and accurately reflect the page content?
* Are all calculator/category cards on category pages correctly formatted and linked?
* Verify interactive elements (e.g., charts, graphs) are stable after calculation, not exhibiting redraw loops or visual glitches.
* Is the 'Related Calculators' section correctly implemented according to the template guidelines (placement, number of links, content accuracy)?
* Does the `relatedLink` property in the `SoftwareApplication` schema accurately reflect the visible related calculators, and are all URLs absolute and correct?
* Are the descriptions for related calculators concise and informative?
* Schema markup is implemented and validates successfully on all new/modified pages.
* All links (internal navigation, breadcrumbs, new calculator links on category pages, related calculators) are working correctly on all affected pages.
* No errors in the browser console on any new/modified pages during developer testing.
* URL of the new/modified page(s) accurately added to `sitemap.xml` with appropriate `<priority>`, `<changefreq>`, and `<lastmod>` tags, ensuring `<lastmod>` uses **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**.
* Link(s) to the new/modified page(s) accurately added to the HTML sitemap (`/sitemap/index.html`) in the correct hierarchical section, and ensure its own `WebPage` schema `dateModified` is updated to **ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)**.
* Footer on the new/updated calculator page correctly links to the HTML sitemap (`/sitemap/index.html`).
* Code is well-commented.
* All new/modified pages adhere to the overall design and UX standards of FreecalcHub.
* A comprehensive Test Plan / QA Checklist Document has been prepared and is included with the deliverables.

## 9. Category Page Remediation (Legacy Template Updates)

### 9.1. Purpose
This section covers the process for updating existing category/subcategory pages to comply with the latest template standards, specifically FAQ v2 implementation.

### 9.2. Identification Process
* Use systematic analysis to identify pages missing FAQ v2 components:
  - Missing `faq-styles-v2.css` link
  - Missing `FAQPage` schema in JSON-LD
  - Missing FAQ section HTML structure
  - Missing `faq-accordion-v2.js` script

### 9.3. Remediation Workflow
1. **Content Preparation**: Obtain custom FAQ content for the specific category
2. **Page Updates**: Add all 4 required FAQ components
3. **Timestamp Updates**: Update `dateModified` to current ISO 8601 format
4. **Sitemap Maintenance**: Update both `sitemap.xml` and `sitemap/index.html`
5. **Commit Strategy**: Include page and sitemap changes in single commit
6. **Live Testing**: Deploy and validate functionality before proceeding

### 9.4. Quality Standards
* FAQ content must include strategic internal links to relevant subcategory pages
* Schema markup must exactly match visible FAQ content
* All FAQ IDs must be unique within the page
* Accordion functionality must work across all devices

## 10. Document Review and Updates

* This SOP shall be reviewed at least annually, or as needed when significant changes to the development process, templates, or tools occur.
* Updates will be communicated to all relevant personnel.