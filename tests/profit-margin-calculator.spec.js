/**
 * FreecalcHub - Profit Margin Calculator Comprehensive Test
 * Testing with specified test case and all functionality
 * Test Case: Revenue: $500,000, COGS: $200,000, OpEx: $150,000, Net Expenses: $50,000
 * Expected: Gross: 60%, Operating: 30%, Net: 20%
 */

import { test, expect } from '@playwright/test';

test.describe('Profit Margin Calculator - Comprehensive Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://freecalchub.com/finance/business/profit-margin-calculator/');
    await page.waitForLoadState('networkidle');
  });

  test('should load profit margin calculator with all essential elements', async ({ page }) => {
    // Check page loads correctly
    await expect(page).toHaveTitle(/Profit Margin Calculator/);
    
    // Verify all input fields are present
    await expect(page.locator('#totalRevenue')).toBeVisible();
    await expect(page.locator('#costOfGoodsSold')).toBeVisible();
    await expect(page.locator('#operatingExpenses')).toBeVisible();
    await expect(page.locator('#otherExpenses')).toBeVisible();
    
    // Verify calculation and reset buttons
    await expect(page.locator('#calculateButton')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
    
    // Verify results section exists (hidden initially)
    const resultsSection = page.locator('#resultsSection');
    await expect(resultsSection).toBeHidden();
  });

  test('should validate inputs with proper error handling', async ({ page }) => {
    const calculateBtn = page.locator('#calculateButton');
    const errorDiv = page.locator('#errorMessages');
    
    // Test empty revenue field
    await calculateBtn.click();
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('Please enter valid total revenue');
    
    // Test zero revenue
    await page.fill('#totalRevenue', '0');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('must be greater than 0');
    
    // Test negative COGS
    await page.fill('#totalRevenue', '100000');
    await page.fill('#costOfGoodsSold', '-1000');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('must be 0 or greater');
    
    // Test COGS exceeding revenue
    await page.fill('#costOfGoodsSold', '150000'); // More than revenue
    await calculateBtn.click();
    await expect(errorDiv).toContainText('Cost of goods sold cannot exceed total revenue');
  });

  test('should calculate profit margins correctly with mission test case', async ({ page }) => {
    // Mission Test Case: Revenue: $500,000, COGS: $200,000, OpEx: $150,000, Net: $50,000
    // Expected: Gross: 60%, Operating: 30%, Net: 20%
    
    await page.fill('#totalRevenue', '500000');
    await page.fill('#costOfGoodsSold', '200000');
    await page.fill('#operatingExpenses', '150000');
    await page.fill('#otherExpenses', '50000');
    
    await page.click('#calculateButton');
    
    // Wait for results to appear
    const resultsSection = page.locator('#resultsSection');
    await expect(resultsSection).toBeVisible();
    
    // Verify profit calculations
    const grossProfit = page.locator('#grossProfit');
    const operatingProfit = page.locator('#operatingProfit');
    const netProfit = page.locator('#netProfit');
    
    await expect(grossProfit).toContainText('$300,000'); // 500k - 200k
    await expect(operatingProfit).toContainText('$150,000'); // 300k - 150k
    await expect(netProfit).toContainText('$100,000'); // 150k - 50k
    
    // Verify margin calculations
    const grossMargin = page.locator('#grossMargin');
    const operatingMargin = page.locator('#operatingMargin');
    const netMargin = page.locator('#netMargin');
    
    await expect(grossMargin).toContainText('60.0%'); // 300k/500k * 100
    await expect(operatingMargin).toContainText('30.0%'); // 150k/500k * 100
    await expect(netMargin).toContainText('20.0%'); // 100k/500k * 100
    
    // Verify chart is generated
    const chart = page.locator('#profitMarginChart');
    await expect(chart).toBeVisible();
  });

  test('should display color-coded margin indicators correctly', async ({ page }) => {
    // Test with excellent margins scenario
    await page.fill('#totalRevenue', '100000');
    await page.fill('#costOfGoodsSold', '20000'); // 80% gross margin - excellent
    await page.fill('#operatingExpenses', '30000'); // 50% operating margin - excellent  
    await page.fill('#otherExpenses', '10000'); // 40% net margin - excellent
    
    await page.click('#calculateButton');
    
    // Check margin performance indicators
    const grossMarginIndicator = page.locator('#grossMarginIndicator');
    const operatingMarginIndicator = page.locator('#operatingMarginIndicator');
    const netMarginIndicator = page.locator('#netMarginIndicator');
    
    await expect(grossMarginIndicator).toHaveClass(/excellent/);
    await expect(operatingMarginIndicator).toHaveClass(/excellent/);
    await expect(netMarginIndicator).toHaveClass(/excellent/);
  });

  test('should generate improvement suggestions based on performance', async ({ page }) => {
    // Test with poor margins to trigger suggestions
    await page.fill('#totalRevenue', '100000');
    await page.fill('#costOfGoodsSold', '80000'); // 20% gross - poor
    await page.fill('#operatingExpenses', '18000'); // 2% operating - poor
    await page.fill('#otherExpenses', '1500'); // 0.5% net - poor
    
    await page.click('#calculateButton');
    
    // Check that suggestions are generated
    const suggestionsList = page.locator('#suggestionsList');
    await expect(suggestionsList).toBeVisible();
    
    // Should contain improvement suggestions
    const suggestionItems = page.locator('.suggestion-item');
    const suggestionCount = await suggestionItems.count();
    expect(suggestionCount).toBeGreaterThan(0);
    
    // Check for specific suggestions
    await expect(suggestionsList).toContainText('Improve Gross Margin');
    await expect(suggestionsList).toContainText('Focus on Profitability');
  });

  test('should handle negative margins correctly', async ({ page }) => {
    // Create scenario with losses
    await page.fill('#totalRevenue', '50000');
    await page.fill('#costOfGoodsSold', '30000');
    await page.fill('#operatingExpenses', '25000'); // Operating loss
    await page.fill('#otherExpenses', '5000'); // Net loss
    
    await page.click('#calculateButton');
    
    // Verify negative values are displayed with proper classes
    const operatingProfit = page.locator('#operatingProfit');
    const netProfit = page.locator('#netProfit');
    
    await expect(operatingProfit).toHaveClass(/negative-value/);
    await expect(netProfit).toHaveClass(/negative-value/);
    
    // Verify negative percentages are shown
    const operatingMargin = page.locator('#operatingMargin');
    const netMargin = page.locator('#netMargin');
    
    await expect(operatingMargin).toContainText('-10.0%');
    await expect(netMargin).toContainText('-20.0%');
  });

  test('should reset calculator functionality completely', async ({ page }) => {
    // Fill form and calculate
    await page.fill('#totalRevenue', '100000');
    await page.fill('#costOfGoodsSold', '40000');
    await page.fill('#operatingExpenses', '30000');
    await page.fill('#otherExpenses', '10000');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Reset calculator
    await page.click('#resetButton');
    
    // Verify all inputs are cleared
    await expect(page.locator('#totalRevenue')).toHaveValue('');
    await expect(page.locator('#costOfGoodsSold')).toHaveValue('');
    await expect(page.locator('#operatingExpenses')).toHaveValue('');
    await expect(page.locator('#otherExpenses')).toHaveValue('');
    
    // Verify results are hidden
    await expect(page.locator('#resultsSection')).toBeHidden();
    await expect(page.locator('#errorMessages')).toBeHidden();
    
    // Verify result displays are reset
    await expect(page.locator('#grossProfit')).toContainText('--');
    await expect(page.locator('#grossMargin')).toContainText('--');
  });

  test('should handle decimal inputs correctly', async ({ page }) => {
    await page.fill('#totalRevenue', '123456.78');
    await page.fill('#costOfGoodsSold', '45678.90');
    await page.fill('#operatingExpenses', '12345.67');
    await page.fill('#otherExpenses', '2345.89');
    
    await page.click('#calculateButton');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#grossProfit')).toBeVisible();
    await expect(page.locator('#grossMargin')).toContainText('%');
  });

  test('should work correctly in dark mode', async ({ page }) => {
    // Toggle dark mode
    await page.click('#dark-mode-toggle');
    await page.waitForTimeout(500);
    
    // Verify dark mode is active
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    
    // Test calculator functionality in dark mode
    await page.fill('#totalRevenue', '200000');
    await page.fill('#costOfGoodsSold', '80000');
    await page.fill('#operatingExpenses', '60000');
    await page.fill('#otherExpenses', '20000');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Verify chart renders in dark mode
    await expect(page.locator('#profitMarginChart')).toBeVisible();
  });

  test('should have proper accessibility and keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('#totalRevenue')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#costOfGoodsSold')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#operatingExpenses')).toBeFocused();
    
    // Check for proper labels
    const revenueLabel = page.locator('label[for="totalRevenue"]');
    await expect(revenueLabel).toBeVisible();
    await expect(revenueLabel).toContainText('Total Revenue');
  });

  test('should display related calculators correctly', async ({ page }) => {
    const relatedSection = page.locator('.related-calculators');
    await expect(relatedSection).toBeVisible();
    
    // Check for break-even calculator link
    const breakEvenLink = page.locator('a[href="/finance/business/break-even-calculator/"]');
    await expect(breakEvenLink).toBeVisible();
    
    // Check for ROI calculator link
    const roiLink = page.locator('a[href="/finance/business/business-roi-calculator/"]');
    await expect(roiLink).toBeVisible();
    
    // Check for compound interest link
    const compoundLink = page.locator('a[href="/finance/investment/compound-interest-calculator/"]');
    await expect(compoundLink).toBeVisible();
  });

  test('should have working FAQ accordion functionality', async ({ page }) => {
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

  test('should display performance with extreme values', async ({ page }) => {
    // Test very high margins
    await page.fill('#totalRevenue', '1000000');
    await page.fill('#costOfGoodsSold', '100000'); // 90% gross margin
    await page.fill('#operatingExpenses', '200000'); // 70% operating margin
    await page.fill('#otherExpenses', '50000'); // 65% net margin
    
    await page.click('#calculateButton');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#grossMargin')).toContainText('90.0%');
    await expect(page.locator('#operatingMargin')).toContainText('70.0%');
    await expect(page.locator('#netMargin')).toContainText('65.0%');
    
    // Should generate excellent performance suggestion
    await expect(page.locator('#suggestionsList')).toContainText('Excellent Performance');
  });

  test('should validate chart displays correct data', async ({ page }) => {
    await page.fill('#totalRevenue', '100000');
    await page.fill('#costOfGoodsSold', '30000');
    await page.fill('#operatingExpenses', '40000');
    await page.fill('#otherExpenses', '10000');
    
    await page.click('#calculateButton');
    
    const chart = page.locator('#profitMarginChart');
    await expect(chart).toBeVisible();
    
    // Verify chart has proper structure (this tests the Chart.js integration)
    const chartCanvas = page.locator('canvas#profitMarginChart');
    await expect(chartCanvas).toBeVisible();
    
    // Check that chart dimensions are reasonable
    const chartBox = await chartCanvas.boundingBox();
    expect(chartBox.width).toBeGreaterThan(200);
    expect(chartBox.height).toBeGreaterThan(200);
  });
});