# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

