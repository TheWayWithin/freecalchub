
# Website Update Specification: FreeCalcHub On-Page Optimization

**Project:** FreeCalcHub Homepage & About Page Enhancements
**Date:** October 8, 2025
**Contact:** Jamie Watters

## 1. Objective

To improve the site's SEO and AI-readiness by implementing high-priority recommendations from an AImpactScanner analysis report. The focus is on adding a meta description and enhancing the transparency and authority signals on the site.

## 2. High-Priority Tasks

### Task 2.1: Add Meta Description to Homepage

*   **Description:** The homepage is missing a `<meta name="description">` tag, which is critical for controlling how the site is presented in search engine results and for providing context to AI crawlers.
*   **File to Modify:** The main HTML file for the homepage (e.g., `index.html` or the primary template).
*   **Location:** Inside the `<head>` section of the HTML.
*   **Action:** Add the following `<meta>` tag.

```html
<meta name="description" content="Get instant answers with FreeCalcHub's collection of 100+ free online calculators for finance, health, math, and more. Easy, accurate, and no sign-up required. Try our tools today!">
```

### Task 2.2: Update the "About" Page Content

*   **Description:** The existing "About" page needs to be updated to better reflect the personal story behind the site, which will serve as a strong signal for Experience, Expertise, Authoritativeness, and Trust (E-E-A-T). This directly addresses low scores in "Transparency & Disclosure Standards."
*   **File to Modify:** The HTML file for the "About" page (located at `/about/`).
*   **Action:** Replace the entire content within the main body of the page with the new content provided below. The new content includes a personal story, clear disclaimers on funding and conflicts of interest, and a link to a new personal site.

#### New HTML Content for the "About" Page:

```html
<!-- This content should replace the existing content inside the main content area of the /about/ page -->

<h1>About FreeCalcHub</h1>

<p>Hello, and welcome to FreeCalcHub. My name is Jamie Watters, and this project is my journey back into the world of hands-on software development.</p>

<h3>The Story Behind the Site</h3>

<p>After a 20-year career focused on management, I decided it was time to reconnect with my roots as a developer. I launched FreeCalcHub as a personal challenge and a passion project—an exercise to sharpen my coding skills and build something simple, useful, and genuinely free for everyone.</p>

<p>This site is built and maintained entirely by me. Every calculator you see was created as part of this journey.</p>

<h3>Our Philosophy: Transparency and Trust</h3>

<p>Because this is a one-person operation, my principles are straightforward:</p>
<ul>
    <li><strong>Purpose:</strong> To provide simple, accurate, and easy-to-use online calculators without intrusive ads, fees, or sign-ups.</li>
    <li><strong>Funding & Independence:</strong> FreeCalcHub is an independent project. It is not funded by or affiliated with any financial institution, corporation, or healthcare organization. Its operational costs are covered by me personally, supplemented by unobtrusive, standard contextual advertising. This funding model has zero influence on how the calculators work or the results they produce.</li>
    <li><strong>No Conflicts of Interest:</strong> I have no financial stake in the outcomes of any calculations. My sole goal is to provide a reliable and helpful tool.</li>
</ul>

<h3>Disclaimer</h3>

<p>The tools on this website are provided for informational and educational purposes only. They are not a substitute for professional financial, medical, or legal advice. Please consult with a qualified professional before making any significant decisions.</p>

<h3>About Me</h3>

<p>I'm a developer and technology leader with over two decades of experience in the software industry. If you'd like to learn more about my professional journey or see my other work, you can visit my personal site at <a href="https://jamiewatters.work" target="_blank" rel="noopener me">jamiewatters.work</a>.</p>

```

**Note on the link:** The link to `jamiewatters.work` includes `target="_blank"`, `rel="noopener"`, and `rel="me"`. The `rel="me"` attribute is a specific microformat that creates a verifiable, machine-readable link between your sites, which is a positive signal for search engines.

## 3. Verification Checklist

After deployment, please verify the following:

1.  [ ] **Homepage:** View the source code of `www.freecalchub.com` and confirm the new `<meta name="description">` tag is present within the `<head>` section.
2.  [ ] **About Page:** Navigate to `www.freecalchub.com/about/` and confirm the new text is displayed correctly.
3.  [ ] **External Link:** Click the link to `jamiewatters.work` on the "About" page and verify that it opens in a new tab and points to the correct URL.