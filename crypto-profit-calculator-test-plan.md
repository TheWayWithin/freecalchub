# Crypto Profit/Loss Calculator - Test Plan

**Calculator:** Crypto Profit/Loss Calculator  
**Location:** `/finance/cryptocurrency/crypto-profit-calculator/`  
**Date:** 2025-01-09  
**Status:** Ready for Testing

## Overview

This test plan covers comprehensive testing of the Crypto Profit/Loss Calculator implementation, ensuring all requirements from the Sprint 1 specification are met.

## Test Categories

### 1. Functional Testing

#### 1.1 Basic Calculation Tests
- [ ] **Test Case F1.1:** Single trade with profit
  - Input: Purchase $50,000, Sell $55,000, Quantity 1.5 BTC, No fees
  - Expected: Gross Profit $7,500, Net Profit $7,500, ROI 15%

- [ ] **Test Case F1.2:** Single trade with loss
  - Input: Purchase $50,000, Sell $45,000, Quantity 1.0 BTC, No fees
  - Expected: Gross Loss -$5,000, Net Loss -$5,000, ROI -10%

- [ ] **Test Case F1.3:** Break-even trade
  - Input: Purchase $50,000, Sell $50,000, Quantity 1.0 BTC, No fees
  - Expected: Gross Profit $0, Net Profit $0, ROI 0%

#### 1.2 Fee Calculation Tests
- [ ] **Test Case F2.1:** Percentage fees
  - Input: Purchase $10,000, Sell $11,000, Quantity 1.0, Buy Fee 0.25%, Sell Fee 0.25%
  - Expected: Total Fees $52.50, Net Profit $947.50

- [ ] **Test Case F2.2:** Flat fees
  - Input: Purchase $10,000, Sell $11,000, Quantity 1.0, Buy Fee $25, Sell Fee $25
  - Expected: Total Fees $50, Net Profit $950

- [ ] **Test Case F2.3:** Mixed fee types
  - Input: Purchase $10,000, Sell $11,000, Quantity 1.0, Buy Fee 0.1%, Sell Fee $20
  - Expected: Buy Fee $10, Sell Fee $20, Total Fees $30, Net Profit $970

#### 1.3 Multiple Trade Tests
- [ ] **Test Case F3.1:** Two profitable trades
  - Trade 1: Purchase $5,000, Sell $5,500, Quantity 0.5
  - Trade 2: Purchase $8,000, Sell $8,800, Quantity 0.8
  - Expected: Overall profit $1,300, Combined ROI calculation

- [ ] **Test Case F3.2:** Mixed profit/loss trades
  - Trade 1: Purchase $5,000, Sell $5,500, Quantity 0.5 (profit)
  - Trade 2: Purchase $8,000, Sell $7,500, Quantity 0.8 (loss)
  - Expected: Net result $0, accurate breakdown per trade

- [ ] **Test Case F3.3:** Maximum trades (10)
  - Add 10 trades and verify all calculate correctly
  - Expected: All trades processed, summary accurate

#### 1.4 Edge Case Tests
- [ ] **Test Case F4.1:** Very small quantities (0.00001)
  - Input: Purchase $50,000, Sell $51,000, Quantity 0.00001
  - Expected: Proper decimal handling, no precision errors

- [ ] **Test Case F4.2:** Very large numbers ($999,999)
  - Input: Purchase $999,999, Sell $999,999, Quantity 1
  - Expected: Proper formatting, no overflow errors

- [ ] **Test Case F4.3:** High percentage fees (20%)
  - Input: Purchase $1,000, Sell $1,200, Fee 20%
  - Expected: Warning about high fees, accurate calculation

### 2. Input Validation Testing

#### 2.1 Required Field Validation
- [ ] **Test Case V1.1:** Empty purchase price
  - Expected: Error message displayed
- [ ] **Test Case V1.2:** Empty quantity
  - Expected: Error message displayed
- [ ] **Test Case V1.3:** Empty sale price
  - Expected: Error message displayed

#### 2.2 Range Validation
- [ ] **Test Case V2.1:** Negative purchase price
  - Expected: Validation error
- [ ] **Test Case V2.2:** Zero quantity
  - Expected: Validation error
- [ ] **Test Case V2.3:** Quantity below minimum (0.00001)
  - Expected: Validation error
- [ ] **Test Case V2.4:** Price above maximum ($1,000,000)
  - Expected: Validation error
- [ ] **Test Case V2.5:** Percentage fee above 20%
  - Expected: Validation error

#### 2.3 Fee Validation
- [ ] **Test Case V3.1:** Negative fee amount
  - Expected: Validation error
- [ ] **Test Case V3.2:** Fees exceeding 50% of trade value
  - Expected: Warning message
- [ ] **Test Case V3.3:** Flat fee above maximum ($10,000)
  - Expected: Validation error

### 3. User Interface Testing

#### 3.1 Form Interaction
- [ ] **Test Case UI1.1:** Add trade button
  - Expected: New trade section appears, numbered correctly
- [ ] **Test Case UI1.2:** Remove trade button
  - Expected: Trade section removed, numbers updated
- [ ] **Test Case UI1.3:** Reset button
  - Expected: All fields cleared, single trade remains

#### 3.2 Real-time Calculation
- [ ] **Test Case UI2.1:** Input field changes
  - Expected: Results update automatically (debounced)
- [ ] **Test Case UI2.2:** Fee type radio button changes
  - Expected: Placeholder text updates, validation adjusts

#### 3.3 Results Display
- [ ] **Test Case UI3.1:** Single trade results
  - Expected: Appropriate results grid shown, profit/loss colors correct
- [ ] **Test Case UI3.2:** Multiple trade results
  - Expected: Summary results + individual breakdown shown
- [ ] **Test Case UI3.3:** Profit/loss indicators
  - Expected: Green for profit, red for loss, gray for break-even

### 4. Responsive Design Testing

#### 4.1 Mobile Devices (< 480px)
- [ ] **Test Case R1.1:** Form layout on mobile
  - Expected: Single column, readable text, touch-friendly buttons
- [ ] **Test Case R1.2:** Results display on mobile
  - Expected: Cards stack vertically, text remains legible

#### 4.2 Tablet (768px - 1024px)
- [ ] **Test Case R2.1:** Form layout on tablet
  - Expected: Appropriate spacing, readable labels
- [ ] **Test Case R2.2:** Results grid on tablet
  - Expected: Optimal column layout

#### 4.3 Desktop (> 1024px)
- [ ] **Test Case R3.1:** Full desktop layout
  - Expected: Multi-column forms, full results grid

### 5. Cross-Browser Testing

#### 5.1 Chrome/Chromium
- [ ] **Test Case B1.1:** All functionality works
- [ ] **Test Case B1.2:** No console errors

#### 5.2 Firefox
- [ ] **Test Case B2.1:** All functionality works
- [ ] **Test Case B2.2:** No console errors

#### 5.3 Safari
- [ ] **Test Case B3.1:** All functionality works
- [ ] **Test Case B3.2:** No console errors

#### 5.4 Edge
- [ ] **Test Case B4.1:** All functionality works
- [ ] **Test Case B4.2:** No console errors

### 6. Accessibility Testing

#### 6.1 Keyboard Navigation
- [ ] **Test Case A1.1:** Tab through all form elements
- [ ] **Test Case A1.2:** Enter key submits form
- [ ] **Test Case A1.3:** Escape key closes error messages

#### 6.2 Screen Reader Support
- [ ] **Test Case A2.1:** Labels properly associated
- [ ] **Test Case A2.2:** Error messages announced
- [ ] **Test Case A2.3:** Results properly announced

#### 6.3 Visual Accessibility
- [ ] **Test Case A3.1:** Color contrast meets WCAG AA
- [ ] **Test Case A3.2:** Text scalable to 200%
- [ ] **Test Case A3.3:** No color-only information

### 7. Performance Testing

#### 7.1 Load Time
- [ ] **Test Case P1.1:** Initial page load < 3 seconds
- [ ] **Test Case P1.2:** CSS/JS resources load efficiently

#### 7.2 Calculation Performance
- [ ] **Test Case P2.1:** Single trade calculation < 100ms
- [ ] **Test Case P2.2:** 10 trades calculation < 500ms
- [ ] **Test Case P2.3:** Real-time updates smooth (no lag)

### 8. SEO and Schema Testing

#### 8.1 Schema Validation
- [ ] **Test Case S1.1:** Validate Schema.org markup with Google's tool
  - URL: https://search.google.com/test/rich-results
- [ ] **Test Case S1.2:** Verify all FAQ schema matches visible content
- [ ] **Test Case S1.3:** Check BreadcrumbList structure

#### 8.2 HTML Validation
- [ ] **Test Case S2.1:** Validate HTML with W3C validator
  - URL: https://validator.w3.org/
- [ ] **Test Case S2.2:** No HTML validation errors

#### 8.3 Meta Tags
- [ ] **Test Case S3.1:** Title tag present and descriptive
- [ ] **Test Case S3.2:** Meta description within 150-160 characters
- [ ] **Test Case S3.3:** Canonical URL correct

### 9. Content Testing

#### 9.1 Educational Content
- [ ] **Test Case C1.1:** "How to Use" section accurate
- [ ] **Test Case C1.2:** Educational sections informative
- [ ] **Test Case C1.3:** FAQ answers helpful and complete

#### 9.2 Related Calculator Links
- [ ] **Test Case C2.1:** All related calculator links work
- [ ] **Test Case C2.2:** Descriptions accurate
- [ ] **Test Case C2.3:** Links relevant to crypto trading

### 10. Integration Testing

#### 10.1 Category Page Integration
- [ ] **Test Case I1.1:** Calculator appears on cryptocurrency category page
- [ ] **Test Case I1.2:** Category page link works correctly
- [ ] **Test Case I1.3:** Category page description matches

#### 10.2 Sitemap Integration
- [ ] **Test Case I2.1:** Calculator appears in XML sitemap
- [ ] **Test Case I2.2:** Calculator appears in HTML sitemap
- [ ] **Test Case I2.3:** Sitemap lastmod dates correct

#### 10.3 Navigation Integration
- [ ] **Test Case I3.1:** Breadcrumbs work correctly
- [ ] **Test Case I3.2:** Main navigation accessible
- [ ] **Test Case I3.3:** Mobile menu functions

## Test Environment Requirements

### Desktop Testing
- **Browsers:** Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- **Screen Resolutions:** 1920x1080, 1366x768, 1024x768
- **Operating Systems:** Windows 11, macOS Sonoma, Ubuntu 22.04

### Mobile Testing
- **Devices:** iPhone 14, Samsung Galaxy S23, iPad Pro
- **Browsers:** Safari Mobile, Chrome Mobile, Firefox Mobile
- **Orientations:** Portrait and landscape

### Tools Required
- W3C HTML Validator
- Google Rich Results Test
- Chrome DevTools
- Screen reader software (NVDA/VoiceOver)
- Performance monitoring tools

## Pass/Fail Criteria

### Must Pass (P0)
- All basic calculation tests (F1.x)
- All fee calculation tests (F2.x)
- All input validation tests (V1.x, V2.x)
- Single trade UI tests (UI1.x, UI2.x, UI3.1)
- HTML validation (S2.1)
- Schema validation (S1.1)
- Mobile responsiveness (R1.x)
- Basic cross-browser support (B1.x, B2.x)

### Should Pass (P1)
- Multiple trade tests (F3.x)
- Edge case tests (F4.x)
- Advanced UI tests (UI3.2, UI3.3)
- Full responsive testing (R2.x, R3.x)
- All browser testing (B3.x, B4.x)
- Accessibility tests (A1.x, A2.x, A3.x)

### Could Pass (P2)
- Performance optimizations (P1.x, P2.x)
- Advanced fee validation (V3.x)
- Content quality tests (C1.x, C2.x)

## Test Execution Notes

1. **Test Data:** Use realistic cryptocurrency prices and quantities
2. **Error Handling:** Verify all error messages are clear and actionable
3. **User Experience:** Ensure the calculator is intuitive for both beginners and experienced traders
4. **Documentation:** Record any bugs or issues found during testing
5. **Browser Cache:** Clear cache between different test scenarios

## Completion Checklist

- [ ] All P0 tests passed
- [ ] All P1 tests passed (or documented exceptions)
- [ ] Bug reports filed for any failures
- [ ] Performance meets requirements
- [ ] Accessibility requirements met
- [ ] SEO requirements met
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness confirmed
- [ ] Integration with site navigation confirmed

## Sign-off

**Tester:** ________________  
**Date:** ________________  
**Overall Status:** ☐ Pass ☐ Pass with Issues ☐ Fail  
**Notes:** ________________