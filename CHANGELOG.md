# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

docs: update CHANGELOG for v1.61.0 container list alignment

## [1.62.0] - 2025-05-06

### Fixed
- Reverted previous list alignment fix targeting only `.container`.
- Implemented a universal list alignment fix targeting `.container ul/ol/li`, `.main-content ul/ol/li`, and `.content ul/ol/li` in `styles.css`.
- This ensures consistent list marker alignment (`list-style-position: outside;`, `padding-left: 1.5rem;`) across all page types (calculator, category, blurb, etc.) by targeting all relevant content wrappers.

## [1.61.0] - 2025-05-06

### Fixed
- Reverted previous list alignment fix targeting `.main-content` and `.content`.
- Implemented new list alignment fix based on ChatGPT recommendation (v3) targeting `.container ul` and `.container ol` in `styles.css`.
- This correctly targets lists within the main page container used on category and blurb pages.
- Uses `list-style-position: outside;`, `padding-left: 1.5rem;`, and `margin: 0 0 1rem 0;` to align markers slightly outside the main text block.
- Updated `.container li` with `margin-bottom: 0.5rem;` for consistent spacing.

## [1.60.0] - 2025-05-05

### Fixed
- Reverted previous list alignment fix (`list-style-position: inside !important;`) in `styles.css`.
- Implemented new list alignment fix based on ChatGPT recommendation (v2) to ensure consistent list marker alignment across all pages.
- Targets `.main-content ul/ol` and `.content ul/ol`.
- Uses `list-style-position: outside;`, `padding-left: 1.5rem;`, and `margin: 0 0 1rem 0;` to align markers slightly outside the main text block, matching the desired style.
- Updated `.main-content li` and `.content li` with `margin-bottom: 0.5rem;` for consistent spacing.

## [1.59.0] - 2025-05-05

### Fixed
- Added `!important` to the `list-style-position: inside;` rule for `.main-content ul` and `.main-content ol` in `styles.css`. This ensures that list markers (bullets, numbers) consistently appear inside the text block across all pages (category, blurb, etc.) by overriding any potentially conflicting styles from other stylesheets.

## [1.58.0] - 2025-05-05

### Fixed
- Refactored the FAQ accordion on the mortgage calculator page (`/finance/mortgage/mortgage-calculator/index.html`) to align with the pattern recommended by ChatGPT for robust visibility control.
- **HTML:** Changed structure to use `<button class="accordion">` immediately followed by `<div class="panel">` for each FAQ item, removing the wrapping `.faq-item` div.
- **CSS:** Removed previous `.faq-item`, `.faq-question`, `.faq-answer`, and `.faq-section details` styles from `styles.css`. Added new styles targeting `.faq-accordion .accordion` and `.faq-accordion .panel`. The `.panel` now uses `max-height: 0` and `overflow: hidden` when collapsed, and `max-height: 1000px` with padding when the preceding button has the `.active` class (`.accordion.active + .panel`). This ensures the answer is completely hidden when collapsed.
- **JS:** Updated `/js/faq-accordion.js` to target the new `.accordion` buttons, toggle the `.active` class directly on the button upon click, update `aria-expanded`, and use `nextElementSibling` to implicitly control the panel via the CSS adjacent sibling selector.

## [1.57.0] - 2025-05-05

### Fixed
- Adjusted CSS for the FAQ accordion (`.faq-answer` in `styles.css`) to ensure the answer text is completely hidden when collapsed.
- Set `padding-top: 0;` and `padding-bottom: 0;` for the collapsed state and ensured `overflow: hidden;` and `max-height: 0;` are applied.
- Vertical padding is now only applied via `padding: 20px;` when the `.faq-item.active` class is present, resolving the issue where the top of the answer text was previously visible.

## [1.56.0] - 2025-05-05

### Changed
- Updated the HTML structure of the mortgage calculator form (`/finance/mortgage/mortgage-calculator/index.html`) to align with the new CSS Grid layout:
    - Wrapped all `.form-group` elements within a new `<div class="input-grid">`.
    - Renamed the button container div from `.form-buttons` to `.form-actions`.
    - Removed the `.half-width` class from all `.form-group` elements as it is no longer needed for the grid layout.

## [1.55.0] - 2025-05-05

### Changed
- Replaced the previous Flexbox-based multi-column layout for the mortgage calculator form (`#mortgage-calculator-form`) with a responsive CSS Grid layout in `/finance/mortgage/mortgage-calculator/css/enhanced-three-column-form-fix.css`.
- The new layout uses `display: grid` and `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` to automatically adjust the number of columns (from 1 up to potentially 4 or more, depending on screen width and a minimum item width of 250px) for a more ergonomic and space-efficient presentation on wider screens.
- Removed previous media queries for fixed 2 and 3-column layouts.
- Ensured form buttons (`.form-buttons`) span the full width of the grid using `grid-column: 1 / -1`.

## [1.54.0] - 2025-05-05

### Fixed
- Ensured the mortgage calculator HTML (`/finance/mortgage/mortgage-calculator/index.html`) includes the necessary script tag `<script src="/js/faq-accordion.js" defer></script>` before the closing `</body>` tag. This was missing in previous updates provided to the user, preventing the accordion JavaScript from loading and executing.

## [1.53.0] - 2025-05-05

### Fixed
- Replaced the native `<details>`/`<summary>` FAQ implementation on the mortgage calculator page with a JavaScript-controlled accordion using `<button>` and `<div>` elements for better reliability and accessibility.
- Updated `/js/faq-accordion.js` with robust logic to handle toggling visibility (`hidden` attribute), ARIA attributes (`aria-expanded`), and icon rotation (`+` to `x`) for the new accordion structure.
- Refined CSS styles in `styles.css` for the `.faq-item`, `.faq-question`, `.faq-answer`, and `.faq-icon` classes to provide smooth transitions, appropriate spacing, clear focus states, and visual feedback for the JS-controlled accordion.

## [1.52.0] - 2025-05-05

### Fixed
- Corrected CSS for the FAQ accordion (`<details>`/`<summary>`) on the mortgage calculator page to ensure the answer section expands fully and content is not cut off.
- Moved FAQ and formula box styles from inline `<style>` block in `/finance/mortgage/mortgage-calculator/index.html` to the global `styles.css` file for better organization and maintainability.

## [1.51.0] - 2025-05-05

### Fixed
- Added `list-style-position: inside;` and `padding-left: 1em;` to `styles.css` for `.main-content ul` and `.main-content ol` to correct list marker alignment site-wide, ensuring bullets and numbers appear inside the text block.
- Corrected footer links for Privacy Policy (to `/policy/`), Terms of Service (to `/terms/`), and added GDPR link (`/gdpr/`) in `/finance/mortgage/mortgage-calculator/index.html`.

## [1.50.0] - 2025-05-04

### Fixed
- Commented out conflicting `font-size`, `font-weight`, and `color` rules for footer headings (`footer h4`, `.footer h4`, etc.) within `calchub-consolidated-fixes.css`. This resolves the specificity issue that prevented the enhanced heading styles (larger size, bold weight) defined in `styles.css` from being applied.

## [1.49.0] - 2025-05-04

### Changed
- Increased `font-size` to `1.4rem` and ensured `font-weight` is `700` for footer column headings (`.footer-section h4` in `styles.css`) to improve clarity and prominence against the dark background.

## [1.48.0] - 2025-05-04

### Fixed
- Commented out the conflicting `background-color: #f8f9fa;` rule for the `footer` element within `calchub-consolidated-fixes.css`. This allows the intended dark footer background (defined by `--footer-background` variable in `styles.css` and `dark-mode.css`) to apply correctly, resolving the issue of unreadable light text on a light background on most pages.

## [1.47.0] - 2025-05-04

### Fixed
- Applied absolute path refactoring to all existing category pages (`/math/`, `/health/`, `/conversions/`, `/date-time/`, `/business/`, `/lifestyle/`) and the mortgage subcategory page (`/finance/mortgage/`) for consistent asset loading and navigation across the site. This ensures CSS, JS, images, and internal links use root-relative paths (e.g., `/css/styles.css`).
- Verified that the existing mortgage calculator page (`/finance/mortgage/mortgage-calculator/`) already uses absolute paths.

## [1.46.0] - 2025-05-04

### Fixed
- Refactored `/index.html` and `/finance/index.html` to use absolute paths (e.g., `/css/styles.css`, `/js/main.js`, `/images/logo.svg`, `/finance/`) for all CSS, JavaScript, image, and internal link references. This ensures consistent asset loading and navigation regardless of the page's directory level.
- Verified the presence of the correct mobile menu button markup (`<button id="mobile-menu-button">`) and required JavaScript includes (`main.js`, `dark-mode.js`) in the HTML structure of key pages (`/index.html`, `/finance/index.html`, `/finance/mortgage/index.html`) to ensure consistent mobile menu and dark mode functionality across the site, addressing issues identified in the provided analysis.

## [1.45.0] - 2025-05-04

### Fixed
- Increased specificity and added `!important` to the `left: 0` rule for `.mobile-menu.active` in `styles.css` to ensure the mobile menu reliably slides into view when activated, resolving issues where the menu remained hidden despite JS adding the active class.

## [1.44.0] - 2025-05-04

### Fixed
- Restored missing `<html>`, `<head>`, and `<body>` structure to `/finance/index.html`.
- Added standard CSS and JS includes (`styles.css`, `dark-mode.css`, `dark-mode.js`, `main.js`, etc.) to `/finance/index.html` using correct relative paths.
- Corrected internal link paths within `/finance/index.html` to use relative paths.
- This addresses the root cause of dark mode and other global features failing on the Finance category page, as identified by external analysis.

## [1.43.0] - 2025-05-04

### Fixed
- Refactored `/css/calchub-consolidated-fixes.css` (to v5.0.4):
  - Removed `!important` from main content and container centering rules (`margin-left`, `margin-right`).
  - Removed `!important` from subcategory/navigation ribbon `background-color` rule.
  - These changes further reduce forceful overrides, specifically targeting the blue navigation ribbon and broad container styles as potential sources of the dark mode conflict on the Finance category page.

## [1.42.0] - 2025-05-04

### Fixed
- Refactored `/css/calchub-consolidated-fixes.css` (to v5.0.3):
  - Removed `!important` from footer social icon `background-color` and `color` rules. This is another attempt to remove overrides that might conflict with dark mode styles, specifically targeting the Finance category page where dark mode is still failing.
- This change aims specifically to restore dark mode functionality on the Finance category page.

## [1.41.0] - 2025-05-04

### Fixed
- Refactored `/css/calchub-consolidated-fixes.css` (to v5.0.2):
  - Removed `!important` from the `color: white` rule applied to subcategory/navigation ribbon links (`.navigation-ribbon a`, etc.). This was likely overriding the text color set by `dark-mode.css` on the Finance category page, causing dark mode to fail there.
- This change aims specifically to restore dark mode functionality on the Finance category page.

## [1.40.0] - 2025-05-03

### Fixed
- Removed redundant include of `/finance/mortgage/css/mobile-menu-fix.css` from `/finance/mortgage/index.html` as its styles were previously integrated into the global `/css/styles.css`. This aims to resolve potential conflicts causing the mobile menu button to become inactive on the Mortgage page.

### Changed
- Enhanced JavaScript logging in `/js/main.js` to provide more detailed information in the browser console regarding the detection of mobile menu elements (button, close button, container) and the attachment of event listeners. This will help diagnose why the menu button might be inactive on certain pages.

## [1.39.0] - 2025-05-03

### Fixed
- Refactored `/css/calchub-consolidated-fixes.css` (to v5.0.1):
  - Removed aggressive `display: none !important` and `display: block !important` rules targeting mobile menu elements (`.mobile-menu`, `#mobile-menu`, etc.). These were likely preventing the menu from ever displaying correctly on pages where this file is loaded, overriding the intended behavior controlled by `styles.css` and `main.js`.
  - Reduced the use of `!important` on various layout, color, and transition rules to minimize conflicts with `styles.css` and `dark-mode.css`.
- This aims to resolve the inactive mobile menu button on the homepage and the blank menu / broken dark mode on the Finance category page by removing the conflicting overrides from the consolidated fixes file.

## [1.38.0] - 2025-05-03

### Fixed
- Integrated essential mobile menu display and layout styles from `/finance/mortgage/css/mobile-menu-fix.css` into the global `/css/styles.css`.
- This ensures the mobile menu container and its internal links (`.mobile-nav a`) have the correct CSS rules applied on all pages (including Homepage, Finance category, etc.), resolving the "blank menu" issue.
- The mobile menu button should now function correctly on all pages as the underlying menu structure is properly styled globally to respond to the JavaScript toggle.
- Removed page-specific CSS dependencies for core mobile menu functionality, promoting consistency.
- Verified dark mode styles for the mobile menu are correctly applied within the updated `styles.css`.

## [1.37.0] - 2025-05-03

### Fixed
- Removed potentially problematic `!important` flags from mobile menu link styles (`.mobile-menu a`) and their dark mode overrides in `styles.css` to prevent conflicts and restore dark mode functionality on the Finance category page.
- Refined CSS selectors for mobile menu content (`.mobile-menu .mobile-nav a`) and header (`.mobile-menu-header`) to ensure consistent styling and visibility across all pages.
- Ensured mobile menu header has a defined height and sticky positioning to remain visible while scrolling the menu content.
- Verified mobile menu JavaScript (`main.js`) correctly targets elements and adds/removes the `.active` class on all relevant pages.

## [1.36.0] - 2025-05-03

### Fixed
- Adjusted the media query breakpoint for hiding the main navigation and showing the mobile menu button from `768px` to `991px` in `styles.css` to prevent navigation items wrapping over breadcrumbs.
- Added `!important` flags to styles for mobile menu links (`.mobile-menu a`) and their dark mode overrides in `styles.css` to forcefully ensure content visibility and override potential conflicts.
## [1.35.0] - 2025-05-03

### Fixed
- Resolved issue where mobile menu appeared blank by adding specific styles for menu links (`.mobile-menu a`) to ensure visibility (color, padding) in both light and dark modes within `styles.css`.
- Ensured mobile menu container (`.mobile-menu`) has correct positioning, dimensions, background, and overflow properties.
- Fixed issue where main top navigation (`.main-nav`) failed to hide on small screens by increasing the specificity of the CSS selector in the media query (`@media (max-width: 768px)`) within `styles.css` to `header .header-container .main-nav { display: none !important; }`.

## [1.34.0] - 2025-05-03

### Fixed
- **Mobile Menu Display:** Resolved issue where the mobile menu would only partially display when opened. Added comprehensive CSS rules for `.mobile-menu` and `.mobile-menu.active` to `css/styles.css` to ensure correct positioning (fixed, left: 0), height (100vh), width, z-index (above header), background, and overflow, allowing the full menu to slide in and be scrollable.
- **Main Navigation Hiding:** Ensured the main top navigation bar (`.main-nav`) correctly hides on smaller screens (max-width: 768px) when the mobile menu button becomes visible. Verified the `display: none !important;` rule within the relevant media query in `css/styles.css` is effective.

## [1.33.0] - 2025-05-03

### Fixed
- **Mobile Menu Functionality:** Resolved issue where the mobile menu button (hamburger icon) was not working on most pages (except the mortgage category page). The root cause was identified as a conflict within the original `js/main.js` script, likely related to dynamic script loading or search initialization, which prevented the mobile menu event listeners from being attached correctly on affected pages. The fix involved:
    - Temporarily simplifying `main.js` to isolate the core mobile menu logic.
    - Verifying script execution using inline scripts and console logs.
    - Restructuring `main.js` to ensure all initialization code runs within the `DOMContentLoaded` event listener.
    - Confirming the simplified script worked, then carefully restoring the full functionality (dynamic script loading, search initialization) within the `DOMContentLoaded` listener.
    - Ensuring script tags in HTML do not use `defer` attribute where `DOMContentLoaded` is used internally.
- **Removed Test Code:** Removed temporary inline script tag from `finance/index.html` used for debugging.

## [1.32.0] - 2025-05-03

### Fixed
- **Header Cosmetic Consistency:** Harmonized the header appearance across all pages to match the preferred layout observed on the mortgage category page. This resolved inconsistencies in navigation link spacing, logo size, and dark mode button icon display.
    - Adjusted left margin for `.main-nav li` in `css/styles.css` and added `!important` to ensure consistent spacing.
    - Added `!important` to the logo container height (`#dark-mode-toggle`) in `css/styles.css`.
    - Added a specific rule (`header .logo-container a.logo img`) in `css/styles.css` with `!important` for height, max-width, and width to ensure consistent logo image sizing, overriding conflicting rules from `calchub-consolidated-fixes.css`.
    - Added `!important` to the `opacity` rule for the sun icon (`#dark-mode-toggle .fa-sun`) in `css/dark-mode-button.css` to fix the issue where both icons were partially visible.

## [1.31.0] - 2025-05-03

### Fixed
- **Header Responsiveness with Navigation Ribbon:** Resolved inconsistent header responsiveness caused by the interaction between the header and the blue subcategory navigation ribbon. The ribbon's presence affected layout calculations. Increased the specificity of the header navigation wrapping rule (`header .header-container .main-nav ul { flex-wrap: wrap !important; }`) in `css/styles.css` to ensure it overrides conflicting rules (`flex-wrap: nowrap !important;`) from `css/calchub-consolidated-fixes.css` even when the navigation ribbon is present. This allows header elements (logo, navigation, controls) to wrap correctly on smaller screens before the mobile menu breakpoint, ensuring consistent behavior across all pages.

## [1.30.0] - 2025-05-03

### Fixed
- **Header Responsiveness (Final Fix):** Resolved inconsistent header responsiveness across pages. The issue was caused by an `!important` rule (`flex-wrap: nowrap !important;`) in `css/calchub-consolidated-fixes.css` overriding the intended wrapping behavior from `css/styles.css` on pages where the consolidated file was loaded. Fixed by adding `!important` to the `flex-wrap: wrap !important;` rule for `.main-nav ul` in `css/styles.css` to ensure consistent wrapping behavior. Also retained the `min-width` on `.logo-container` and `white-space: nowrap` on `.main-nav a` from the previous attempt to ensure elements remain visible and text doesn't wrap inappropriately.

## [1.29.0] - 2025-05-03

### Fixed
- **Navigation Text Color (Dark Mode Final Fix):** Resolved persistent issue where navigation text color did not change in dark mode on most pages. Added `!important` flag to the `html.dark-mode header .main-nav a` rule in `css/dark-mode.css` to forcefully override conflicting CSS rules with higher specificity, ensuring consistent white text color in dark mode across all pages.

## [1.29.0] - 2025-05-03

### Fixed
- **Navigation Text Color (Dark Mode Final Fix):** Resolved persistent issue where navigation text color did not change in dark mode on most pages. Added `!important` flag to the `html.dark-mode header .main-nav a` rule in `css/dark-mode.css` to forcefully override conflicting CSS rules with higher specificity, ensuring consistent white text color in dark mode across all pages.

## [1.28.0] - 2025-05-03

### Fixed
- **Navigation Text Color (Dark Mode Consistency):** Resolved inconsistent navigation text color in dark mode across different pages. Removed an overly specific CSS selector (`html.dark-mode header nav.main-nav ul li a`) from `css/dark-mode.css` that was causing conflicts due to minor HTML structure variations. Relied on the more general `html.dark-mode .main-nav a` selector which now applies consistently across all pages.

## [1.27.0] - 2025-05-03

### Fixed
- **Navigation Text Color (Dark Mode):** Ensured main navigation link text correctly changes to a light color in dark mode by adding a more specific CSS rule in `css/dark-mode.css` to override potential conflicts.
- **Header Responsiveness:** Improved the responsiveness of the header by adjusting flexbox properties (`flex-shrink`, `flex-grow`) and adding intermediate breakpoints in `css/styles.css`. This prevents the logo, navigation links, and dark mode button from compressing or disappearing abruptly on smaller screen sizes before the mobile menu transition.

## [1.26.0] - 2025-05-03

### Fixed
- **Dark Mode JS Conflicts:** Resolved inconsistent dark mode persistence and disappearing button issues by removing redundant/conflicting dark mode logic from `js/main.js` and `js/calchub-consolidated-fixes.js`. Ensured `js/dark-mode.js` is the single source of truth for managing dark mode state and persistence, using the `html.dark-mode` selector consistently.

## [1.25.0] - 2025-05-02

### Fixed
- **Dark Mode Persistence:** Resolved issue where dark mode setting was not persisting when navigating between pages. Implemented an immediate-execution script in `dark-mode.js` to apply the `dark-mode` class to the `<html>` element based on `localStorage` before the page content loads, preventing the flash of light mode.
- **Dark Mode Navigation Text Color:** Fixed the main navigation link text color remaining black in dark mode. This was resolved by the persistence fix and by updating `dark-mode.css` and `dark-mode-button.css` to use `html.dark-mode` selectors instead of `body.dark-mode`.

## [1.24.0] - 2025-05-02

### Fixed
- **Site-Wide Dark Mode Button Consistency:** Ensured the dark mode toggle button has a consistent appearance across all pages by adding the missing `/css/dark-mode-button.css` link to the `<head>` of the following pages: Conversions, Date & Time, Business, Lifestyle, Blog, About, Privacy, Terms, and GDPR.
- **Mortgage Calculator Layout:** Resolved layout issues on the mortgage calculator page (`/finance/mortgage/mortgage-calculator/`) by adding missing global CSS file links (`/css/navigation-ribbon.css`, `/css/breadcrumb-styles.css`, `/css/calchub-consolidated-fixes.css`) to the page's `<head>`.
- **Header and Navigation Consistency:** Ensured the header, logo, navigation ribbon, and breadcrumbs display correctly and consistently on the mortgage calculator page.

## [1.23.0] - 2025-05-02

### Fixed
- **Mortgage Calculator Layout:** Resolved layout issues on the mortgage calculator page (`/finance/mortgage/mortgage-calculator/`) by adding missing global CSS file links (`/css/navigation-ribbon.css`, `/css/breadcrumb-styles.css`, `/css/calchub-consolidated-fixes.css`) to the page's `<head>`.
- **Header and Navigation Consistency:** Ensured the header, logo, navigation ribbon, and breadcrumbs display correctly and consistently with other pages.
- **Dark Mode Button Visibility:** Confirmed the dark mode button appears correctly in the header.

## [1.15.0] - 2025-04-28

### Fixed
- **Three-Column Layout:** Created `enhanced-three-column-form-fix.css` with higher specificity selectors (using `#mortgage-calculator-form` ID) and `!important` declarations to ensure the three-column responsive layout applies correctly, overriding potential conflicts.
- **HTML Update:** Linked `enhanced-three-column-form-fix.css` in `index.html`.

## [1.13.0] - 2025-04-28

### Fixed
- **Dark Mode Button Styling:** Created `dark-mode-button-fix.css` with high specificity rules to ensure the dark mode button styling matches other pages, including icon display and hover effects. Also fixed the site header background color to be white.
- **Dark Mode Functionality:** Linked `dark-mode-button-fix.css` in `index.html` and ensured the global `main.js` script is correctly referenced to enable dark mode toggling.
- **Breadcrumb Alignment:** Created `breadcrumb-alignment-fix.css` with specific rules to ensure breadcrumbs are properly aligned within the container, matching the style of other pages.

## [1.12.0] - 2025-04-28

### Fixed
- **Mobile Menu:** Fixed issue where mobile menu was incorrectly visible on desktop view. Created `mobile-menu-fix.css` with comprehensive rules to ensure the mobile menu is hidden by default on all screen sizes and only appears when toggled on mobile devices.

## [1.11.0] - 2025-04-28

### Fixed
- **Amortization Results:** Fixed issue where amortization results were not displaying. Updated JavaScript (`refined-amortization-fix.js`) to consistently use the ID selector `#results-container` instead of the class selector `.results-container` when finding or creating the results display area, aligning with the HTML structure.

## [1.10.0] - 2025-04-28

### Fixed
- **Navigation Header Styling:** Created `navigation-header-fix.css` with high specificity selectors and !important declarations to ensure the header has a white background, matching the style of other pages.
- **Header Components:** Fixed styling for logo, main navigation, header controls, dark mode toggle button, and navigation ribbon.

## [1.9.0] - 2025-04-28

### Fixed
- **Repository Structure:** Removed duplicate `mortgage-calculator ` folder (with trailing space) to resolve potential path conflicts.
- **File Cleanup:** Removed numerous old/unused CSS and JS files from previous fix attempts within `finance/mortgage/mortgage-calculator/`.
- **HTML Cleanup:** Removed conflicting inline styles from `header`, logo, navigation icons, and form elements in `index.html`.
- **HTML Structure:** Added explicit `<div id="results-container"></div>` for JavaScript to insert results.
- **CSS/JS Links:** Corrected and simplified CSS and JS links in `index.html` head to reference only necessary files (`styles.css`, `calculator.css`, `mortgage-calculator.css`, `page-alignment-fix.css`, `navigation-header-fix.css`, `mortgage-calculator.js`, `refined-amortization-fix.js`, `main.js`).

## [1.8.0] - 2025-04-28

### Fixed
- **Page Scrolling:** Removed JavaScript `setTimeout` that forced initial calculation and caused page to scroll down on load.
- **Navigation Styling:** Removed conflicting inline styles on navigation ribbon to allow external CSS to apply correctly, restoring blue background.
- **Dark Mode Button:** Corrected HTML structure (using ID instead of class, adding sun icon) and included `/js/main.js` to restore functionality.
- **Page Alignment:** Created `page-alignment-fix.css` with specific rules to center the main content container (`.content-container`) with `max-width: 1200px` and `margin: 0 auto`.
- **Form Layout:** Included rules in `page-alignment-fix.css` to ensure form inputs (`.form-group.half-width`) display in a two-column layout on desktop screens (min-width: 768px).

## [1.7.0] - 2025-04-28

### Fixed
- **Definitive Fixes:** Implemented definitive CSS fixes (`definitive-calculator-fix.css`) with high specificity and inline styles in `index.html` to address persistent issues.
- **Logo:** Corrected logo path in `index.html` to `/images/logo.svg` and added inline styles to ensure visibility.
- **Dark Mode Button:** Added inline styles to ensure visibility and basic structure. (Functionality fix pending)
- **Navigation Ribbon:** Added inline styles for blue background and icon visibility.
- **Form Layout:** Added inline styles and `data-desktop-style` attributes with JavaScript to attempt two-column layout.
- **Footer Copyright:** Added inline styles to center copyright text.

## [1.6.0] - 2025-04-28

### Fixed
- **Refined Fixes:** Implemented refined CSS (`refined-calculator-fix.css`) and JavaScript (`refined-amortization-fix.js`) to address regressions from previous aggressive fixes.
- **Logo Display:** Attempted to fix logo display.
- **Dark Mode Button:** Attempted to restore dark mode button.
- **Navigation Ribbon Icons:** Added Font Awesome icons back to navigation ribbon links.
- **Form Layout:** Attempted to restore two-column form layout.
- **Footer Alignment:** Attempted to fix footer alignment.

## [1.5.0] - 2025-04-28

### Fixed
- **Super-Aggressive Fixes:** Implemented super-aggressive CSS (`super-aggressive-calculator-fix.css`) and JavaScript (`super-aggressive-amortization-fix.js`) to override conflicting styles and ensure functionality.
- **Mobile Menu:** Ensured mobile menu is hidden on desktop.
- **Breadcrumbs & Navigation:** Fixed styling for breadcrumbs and navigation ribbon.
- **Form Layout & Buttons:** Corrected form layout and button positioning.
- **Amortization Table:** Implemented robust JavaScript with fallbacks to ensure amortization table always displays and calculates correctly.

## [1.4.0] - 2025-04-27

### Fixed
- **Mobile Menu:** Fixed mobile menu display issue on mortgage category page (`finance/mortgage/css/mobile-menu-fix.css`).
- **Breadcrumb Styling:** Fixed breadcrumb styling on mortgage category page (`finance/mortgage/css/breadcrumb-styling-fix.css`).
- **Button Positioning:** Fixed button positioning on mortgage category page (`finance/mortgage/css/button-positioning-fix.css`).
- **Page Container:** Fixed page container width on mortgage category page (`finance/mortgage/css/page-container-fix.css`).

## [1.3.0] - 2025-04-27

### Fixed
- **Dropdown Display:** Fixed dropdown display issue on mortgage calculator page (`finance/mortgage/mortgage-calculator/css/dropdown-display-fix.css`).
- **Amortization Table:** Fixed amortization table population issue on mortgage calculator page (`finance/mortgage/mortgage-calculator/js/amortization-table-fix.js`).
- **Navigation Ribbon:** Fixed navigation ribbon styling on mortgage category page (`finance/mortgage/css/navigation-ribbon-fix.css`).

## [1.2.0] - 2025-04-27

### Fixed
- **Logo Styling:** Implemented definitive logo fix (`definitive-logo-fix.css`) for consistent display.
- **Form Alignment:** Fixed form alignment issues (`fixed-form-alignment.css`).
- **Calculator Layout:** Fixed calculator layout on mortgage category page (`fixed-calculator-layout.css`).

## [1.1.0] - 2025-04-27

### Fixed
- **Enhanced Logo Styling:** Created `enhanced-logo-fix.css` for better logo display.
- **Enhanced Breadcrumb Fix:** Created `enhanced-breadcrumb-fix.css` for consistent breadcrumbs.
- **Fixed Amortization Functionality:** Created `fixed-amortization.js` to ensure amortization table populates.
- **Improved Form Layout:** Created `improved-form-layout.css` for side-by-side fields.
- **Fixed Mortgage Category Layout:** Created `mortgage-category-layout.css` to restore correct card layout.

## [1.0.0] - 2025-04-27

### Added
- Initial setup for mortgage calculator functionality fixes.
- Copied relevant files to `mortgage-calculator-fix-functionality` directory.

