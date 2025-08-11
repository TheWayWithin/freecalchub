/**
 * FreecalcHub - Comprehensive Business Calculator Suite Test
 * Sprint 3 Testing Mission: Validate Business Calculator Suite
 * Testing: Break-Even, Profit Margin, and Business ROI Calculators
 */

import { test, expect } from '@playwright/test';

// Test configuration constants
const TEST_TIMEOUT = 30000;
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const TABLET_VIEWPORT = { width: 768, height: 1024 };
const DESKTOP_VIEWPORT = { width: 1200, height: 800 };

// Break-Even Calculator Test Suite
test.describe('Break-Even Analysis Calculator - Comprehensive Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://freecalchub.com/business/break-even/break-even-calculator/');
    await page.waitForLoadState('networkidle');
  });

  // ===== FUNCTIONAL TESTING (Priority 1) =====
  test('should load break-even calculator with all essential elements', async ({ page }) => {
    // Check page loads without errors
    await expect(page).toHaveTitle(/Break-Even Analysis Calculator/);
    
    // Verify all input fields are present
    await expect(page.locator('#fixedCosts')).toBeVisible();
    await expect(page.locator('#variableCostPerUnit')).toBeVisible();
    await expect(page.locator('#pricePerUnit')).toBeVisible();
    await expect(page.locator('#currentSalesUnits')).toBeVisible();
    
    // Verify buttons are present and functional
    await expect(page.locator('#calculateButton')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
    
    // Verify results section exists (initially hidden)
    const resultsSection = page.locator('#resultsSection');
    await expect(resultsSection).toBeHidden();
  });

  test('should validate input fields with proper error messages', async ({ page }) => {
    const calculateBtn = page.locator('#calculateButton');
    const errorDiv = page.locator('#errorMessages');
    
    // Test empty form submission
    await calculateBtn.click();
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('Please enter valid fixed costs');
    
    // Test negative fixed costs
    await page.fill('#fixedCosts', '-100');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('must be 0 or greater');
    
    // Test negative variable costs
    await page.fill('#fixedCosts', '1000');
    await page.fill('#variableCostPerUnit', '-5');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('Please enter valid variable cost per unit');
    
    // Test zero selling price
    await page.fill('#variableCostPerUnit', '10');
    await page.fill('#pricePerUnit', '0');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('must be greater than 0');
    
    // Test price less than variable cost
    await page.fill('#pricePerUnit', '5'); // Less than variable cost of 10
    await calculateBtn.click();
    await expect(errorDiv).toContainText('Selling price per unit must be greater than variable cost');
  });

  test('should calculate break-even point correctly with test case', async ({ page }) => {
    // Test Case: Fixed Costs: $50,000, Variable Cost: $25, Price: $75
    // Expected: Break-Even = 1,000 units, Revenue = $75,000
    
    await page.fill('#fixedCosts', '50000');
    await page.fill('#variableCostPerUnit', '25');
    await page.fill('#pricePerUnit', '75');
    
    await page.click('#calculateButton');
    
    // Wait for results to appear
    const resultsSection = page.locator('#resultsSection');
    await expect(resultsSection).toBeVisible();
    
    // Verify break-even calculations
    const breakEvenUnits = page.locator('#breakEvenUnits');
    const breakEvenRevenue = page.locator('#breakEvenRevenue');
    const contributionMargin = page.locator('#contributionMargin');
    
    await expect(breakEvenUnits).toContainText('1,000 units');
    await expect(breakEvenRevenue).toContainText('$75,000');
    await expect(contributionMargin).toContainText('$50');
    
    // Verify chart is generated
    const chart = page.locator('#breakEvenChart');
    await expect(chart).toBeVisible();
  });

  test('should calculate margin of safety when current sales provided', async ({ page }) => {
    // Input data with current sales
    await page.fill('#fixedCosts', '10000');
    await page.fill('#variableCostPerUnit', '20');
    await page.fill('#pricePerUnit', '50');
    await page.fill('#currentSalesUnits', '500'); // Above break-even of 333.33
    
    await page.click('#calculateButton');
    
    // Wait for results and margin of safety section
    const marginSafetySection = page.locator('#marginSafetySection');
    await expect(marginSafetySection).toBeVisible();
    
    // Check margin of safety calculations
    const salesAboveBreakEven = page.locator('#salesAboveBreakEven');
    const marginSafetyPercent = page.locator('#marginSafetyPercent');
    
    await expect(salesAboveBreakEven).toBeVisible();
    await expect(marginSafetyPercent).toBeVisible();
    
    // Should show positive margin (green color)
    await expect(salesAboveBreakEven).toHaveClass(/positive-margin/);
  });

  test('should reset calculator functionality', async ({ page }) => {
    // Fill form with data
    await page.fill('#fixedCosts', '10000');
    await page.fill('#variableCostPerUnit', '15');
    await page.fill('#pricePerUnit', '40');
    
    // Calculate results
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Reset calculator
    await page.click('#resetButton');
    
    // Verify form is cleared
    await expect(page.locator('#fixedCosts')).toHaveValue('');
    await expect(page.locator('#variableCostPerUnit')).toHaveValue('');
    await expect(page.locator('#pricePerUnit')).toHaveValue('');
    
    // Verify results are hidden
    await expect(page.locator('#resultsSection')).toBeHidden();
    await expect(page.locator('#errorMessages')).toBeHidden();
  });

  // ===== RESPONSIVE DESIGN TESTING (Priority 2) =====
  test('should display correctly on mobile devices', async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    
    // Check form layout on mobile
    const form = page.locator('#calculatorForm');
    await expect(form).toBeVisible();
    
    // Check input fields are properly sized
    const inputs = page.locator('input[type="number"]');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      await expect(input).toBeVisible();
      
      // Verify touch-friendly sizing
      const box = await input.boundingBox();
      expect(box.height).toBeGreaterThan(40); // Minimum touch target
    }
    
    // Test calculation on mobile
    await page.fill('#fixedCosts', '5000');
    await page.fill('#variableCostPerUnit', '10');
    await page.fill('#pricePerUnit', '30');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
  });

  test('should display correctly on tablet devices', async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    
    // Verify layout adapts to tablet
    const calculatorSection = page.locator('#calculator-section');
    await expect(calculatorSection).toBeVisible();
    
    // Test touch interactions
    const calculateBtn = page.locator('#calculateButton');
    await expect(calculateBtn).toBeVisible();
    
    const btnBox = await calculateBtn.boundingBox();
    expect(btnBox.height).toBeGreaterThan(40);
  });

  // ===== PERFORMANCE TESTING (Priority 2) =====
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('https://freecalchub.com/business/break-even/break-even-calculator/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load in under 5 seconds
  });

  test('should perform calculations quickly', async ({ page }) => {
    await page.fill('#fixedCosts', '25000');
    await page.fill('#variableCostPerUnit', '12');
    await page.fill('#pricePerUnit', '45');
    
    const startTime = Date.now();
    await page.click('#calculateButton');
    await page.waitForSelector('#resultsSection[style*="block"]');
    const calcTime = Date.now() - startTime;
    
    expect(calcTime).toBeLessThan(2000); // Calculation should complete in under 2 seconds
  });

  // ===== ACCESSIBILITY TESTING (Priority 2) =====
  test('should have proper ARIA labels and keyboard navigation', async ({ page }) => {
    // Check input labels
    const fixedCostsInput = page.locator('#fixedCosts');
    const label = page.locator('label[for="fixedCosts"]');
    await expect(label).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(fixedCostsInput).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#variableCostPerUnit')).toBeFocused();
    
    // Check button accessibility
    const calculateBtn = page.locator('#calculateButton');
    await expect(calculateBtn).toBeVisible();
    await calculateBtn.focus();
    await expect(calculateBtn).toBeFocused();
  });

  // ===== TECHNICAL VALIDATION (Priority 3) =====
  test('should have proper Schema.org markup', async ({ page }) => {
    const schemaScript = page.locator('script[type="application/ld+json"]');
    await expect(schemaScript).toBeVisible();
    
    const schemaContent = await schemaScript.textContent();
    const schema = JSON.parse(schemaContent);
    
    // Verify required schema types
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@graph']).toBeDefined();
    
    const softwareApp = schema['@graph'].find(item => item['@type'] === 'SoftwareApplication');
    expect(softwareApp).toBeDefined();
    expect(softwareApp.name).toContain('Break-Even');
    
    const faqPage = schema['@graph'].find(item => item['@type'] === 'FAQPage');
    expect(faqPage).toBeDefined();
  });

  test('should have proper meta tags and SEO elements', async ({ page }) => {
    // Check title tag
    await expect(page).toHaveTitle(/Break-Even Analysis Calculator.*FreecalcHub/);
    
    // Check meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /Calculate your business break-even point/);
    
    // Check H1 tag
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Break-Even Analysis Calculator');
    
    // Check breadcrumbs
    const breadcrumbs = page.locator('.breadcrumbs');
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs).toContainText('Home');
    await expect(breadcrumbs).toContainText('Finance');
    await expect(breadcrumbs).toContainText('Business');
  });

  // ===== ERROR HANDLING & EDGE CASES (Priority 4) =====
  test('should handle extreme values gracefully', async ({ page }) => {
    // Test very large numbers
    await page.fill('#fixedCosts', '999999999');
    await page.fill('#variableCostPerUnit', '1000000');
    await page.fill('#pricePerUnit', '2000000');
    
    await page.click('#calculateButton');
    
    // Should calculate without crashing
    await expect(page.locator('#resultsSection')).toBeVisible();
    const errorDiv = page.locator('#errorMessages');
    await expect(errorDiv).toBeHidden();
  });

  test('should handle decimal inputs correctly', async ({ page }) => {
    await page.fill('#fixedCosts', '10000.50');
    await page.fill('#variableCostPerUnit', '15.75');
    await page.fill('#pricePerUnit', '45.25');
    
    await page.click('#calculateButton');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#breakEvenUnits')).toBeVisible();
  });

  // ===== DARK MODE TESTING =====
  test('should work correctly in dark mode', async ({ page }) => {
    // Toggle dark mode
    await page.click('#dark-mode-toggle');
    await page.waitForTimeout(500);
    
    // Verify dark mode is active
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    
    // Test calculator functionality in dark mode
    await page.fill('#fixedCosts', '8000');
    await page.fill('#variableCostPerUnit', '20');
    await page.fill('#pricePerUnit', '50');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Verify chart renders in dark mode
    await expect(page.locator('#breakEvenChart')).toBeVisible();
  });

  // ===== FAQ FUNCTIONALITY =====
  test('should have working FAQ accordion', async ({ page }) => {
    const firstFaqButton = page.locator('.faq-item button.accordion').first();
    const firstFaqPanel = page.locator('.faq-item .panel').first();
    
    // Initially closed
    await expect(firstFaqPanel).toBeHidden();
    
    // Click to open
    await firstFaqButton.click();
    await expect(firstFaqPanel).toBeVisible();
    
    // Click to close
    await firstFaqButton.click();
    await expect(firstFaqPanel).toBeHidden();
  });
});

// ===== CROSS-CALCULATOR INTEGRATION TESTING =====
test.describe('Business Calculator Integration Tests', () => {
  test('should navigate between business calculators correctly', async ({ page }) => {
    // Start at break-even calculator
    await page.goto('https://freecalchub.com/business/break-even/break-even-calculator/');
    
    // Navigate to profit margin calculator
    await page.click('a[href="/business/profit/profit-margin-calculator/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/profit-margin-calculator/);
    await expect(page).toHaveTitle(/Profit Margin Calculator/);
    
    // Navigate to ROI calculator
    await page.click('a[href="/business/roi/roi-calculator/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/roi-calculator/);
    await expect(page).toHaveTitle(/ROI Calculator/);
    
    // Navigate to business category page
    await page.click('a[href="/business/"]');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/business\/$/);
  });

  test('should display related calculators correctly', async ({ page }) => {
    await page.goto('https://freecalchub.com/business/break-even/break-even-calculator/');
    
    const relatedSection = page.locator('.related-calculators');
    await expect(relatedSection).toBeVisible();
    
    // Check for profit margin calculator link
    const profitMarginLink = page.locator('a[href="/business/profit/profit-margin-calculator/"]');
    await expect(profitMarginLink).toBeVisible();
    
    // Check for ROI calculator link
    const roiLink = page.locator('a[href="/business/roi/roi-calculator/"]');
    await expect(roiLink).toBeVisible();
  });
});