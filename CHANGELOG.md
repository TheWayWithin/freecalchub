# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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


## [1.13.0] - 2025-04-28

### Fixed
- **Dark Mode Button Styling:** Created `dark-mode-button-fix.css` with high specificity rules to ensure the dark mode button styling matches other pages, including icon display and hover effects. Also fixed the site header background color to be white.
- **Dark Mode Functionality:** Linked `dark-mode-button-fix.css` in `index.html` and ensured the global `main.js` script is correctly referenced to enable dark mode toggling.
- **Breadcrumb Alignment:** Created `breadcrumb-alignment-fix.css` with specific rules to ensure breadcrumbs are properly aligned within the container, matching the style of other pages.



## [1.15.0] - 2025-04-28

### Fixed
- **Three-Column Layout:** Created `enhanced-three-column-form-fix.css` with higher specificity selectors (using `#mortgage-calculator-form` ID) and `!important` declarations to ensure the three-column responsive layout applies correctly, overriding potential conflicts.
- **HTML Update:** Linked `enhanced-three-column-form-fix.css` in `index.html`.

