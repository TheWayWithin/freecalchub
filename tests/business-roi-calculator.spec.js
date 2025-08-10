/**
 * FreecalcHub - Business ROI Calculator Comprehensive Test
 * Testing with specified test case and all functionality
 * Test Case: Initial: $100,000, Final: $150,000, Period: 3 years
 * Expected: Simple ROI: 50%, Annualized ROI: ~14.47%
 */

import { test, expect } from '@playwright/test';

test.describe('Business ROI Calculator - Comprehensive Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://freecalchub.com/finance/business/business-roi-calculator/');
    await page.waitForLoadState('networkidle');
  });

  test('should load business ROI calculator with all essential elements', async ({ page }) => {
    // Check page loads correctly
    await expect(page).toHaveTitle(/Business ROI Calculator/);
    
    // Verify all input fields are present
    await expect(page.locator('#initialInvestment')).toBeVisible();
    await expect(page.locator('#finalValue')).toBeVisible();
    await expect(page.locator('#investmentPeriod')).toBeVisible();
    await expect(page.locator('#annualCashFlow')).toBeVisible();
    await expect(page.locator('#discountRate')).toBeVisible();
    
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
    
    // Test empty initial investment
    await calculateBtn.click();
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('Please enter valid initial investment');
    
    // Test zero initial investment
    await page.fill('#initialInvestment', '0');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('must be greater than 0');
    
    // Test negative final value
    await page.fill('#initialInvestment', '50000');
    await page.fill('#finalValue', '-1000');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('must be 0 or greater');
    
    // Test zero investment period
    await page.fill('#finalValue', '75000');
    await page.fill('#investmentPeriod', '0');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('must be greater than 0');
  });

  test('should calculate ROI correctly with mission test case', async ({ page }) => {
    // Mission Test Case: Initial: $100,000, Final: $150,000, Period: 3 years
    // Expected: Simple ROI: 50%, Annualized ROI: ~14.47%
    
    await page.fill('#initialInvestment', '100000');
    await page.fill('#finalValue', '150000');
    await page.fill('#investmentPeriod', '3');
    
    await page.click('#calculateButton');
    
    // Wait for results to appear
    const resultsSection = page.locator('#resultsSection');
    await expect(resultsSection).toBeVisible();
    
    // Verify ROI calculations
    const simpleROI = page.locator('#simpleROI');
    const annualizedROI = page.locator('#annualizedROI');
    const totalProfit = page.locator('#totalProfit');
    
    await expect(simpleROI).toContainText('50.0%'); // (150k - 100k) / 100k * 100
    await expect(annualizedROI).toContainText('14.5%'); // Approximately 14.47%
    await expect(totalProfit).toContainText('$50,000'); // 150k - 100k
    
    // Verify chart is generated
    const chart = page.locator('#roiChart');
    await expect(chart).toBeVisible();
  });

  test('should perform advanced cash flow analysis when provided', async ({ page }) => {
    // Test with cash flow data
    await page.fill('#initialInvestment', '50000');
    await page.fill('#finalValue', '80000');
    await page.fill('#investmentPeriod', '4');
    await page.fill('#annualCashFlow', '10000');
    await page.fill('#discountRate', '8');
    
    await page.click('#calculateButton');
    
    // Wait for results and cash flow section
    const cashFlowSection = page.locator('#cashFlowSection');
    await expect(cashFlowSection).toBeVisible();
    
    // Check advanced calculations
    const paybackPeriod = page.locator('#paybackPeriod');
    const npv = page.locator('#netPresentValue');
    const profitabilityIndex = page.locator('#profitabilityIndex');
    
    await expect(paybackPeriod).toBeVisible();
    await expect(npv).toBeVisible();
    await expect(profitabilityIndex).toBeVisible();
    
    // Payback period should be 5 years (50,000 / 10,000)
    await expect(paybackPeriod).toContainText('5.0 years');
  });

  test('should provide investment assessment and recommendations', async ({ page }) => {
    // Test with excellent ROI scenario
    await page.fill('#initialInvestment', '25000');
    await page.fill('#finalValue', '50000'); // 100% ROI
    await page.fill('#investmentPeriod', '2');
    
    await page.click('#calculateButton');
    
    // Check that assessment is provided
    const assessmentCard = page.locator('#assessmentCard');
    await expect(assessmentCard).toBeVisible();
    
    const assessmentTitle = page.locator('#assessmentTitle');
    const assessmentDescription = page.locator('#assessmentDescription');
    
    await expect(assessmentTitle).toBeVisible();
    await expect(assessmentDescription).toBeVisible();
    
    // Should indicate excellent performance
    await expect(assessmentCard).toContainText('Excellent');
  });

  test('should generate scenario comparisons', async ({ page }) => {
    await page.fill('#initialInvestment', '30000');
    await page.fill('#finalValue', '45000');
    await page.fill('#investmentPeriod', '3');
    
    await page.click('#calculateButton');
    
    // Check that scenario comparison is generated
    const scenarioComparison = page.locator('#scenarioComparison');
    await expect(scenarioComparison).toBeVisible();
    
    const scenarioCards = page.locator('#scenarioCards');
    await expect(scenarioCards).toBeVisible();
    
    // Should contain multiple scenario options
    const scenarios = page.locator('.scenario-card');
    const scenarioCount = await scenarios.count();
    expect(scenarioCount).toBeGreaterThan(0);
  });

  test('should handle negative ROI correctly', async ({ page }) => {
    // Create scenario with loss
    await page.fill('#initialInvestment', '100000');
    await page.fill('#finalValue', '70000'); // 30% loss
    await page.fill('#investmentPeriod', '2');
    
    await page.click('#calculateButton');
    
    // Verify negative ROI is displayed
    const simpleROI = page.locator('#simpleROI');
    const totalProfit = page.locator('#totalProfit');
    
    await expect(simpleROI).toContainText('-30.0%');
    await expect(totalProfit).toContainText('-$30,000');
    
    // Should have appropriate negative styling
    await expect(simpleROI).toHaveClass(/negative-value/);
    await expect(totalProfit).toHaveClass(/negative-value/);
  });

  test('should calculate correct annualized ROI for various periods', async ({ page }) => {
    // Test 1-year investment (simple = annualized)
    await page.fill('#initialInvestment', '10000');
    await page.fill('#finalValue', '12000');
    await page.fill('#investmentPeriod', '1');
    
    await page.click('#calculateButton');
    
    const simpleROI = page.locator('#simpleROI');
    const annualizedROI = page.locator('#annualizedROI');
    
    await expect(simpleROI).toContainText('20.0%');
    await expect(annualizedROI).toContainText('20.0%'); // Same for 1 year
    
    // Test multi-year compound calculation
    await page.fill('#initialInvestment', '10000');
    await page.fill('#finalValue', '14641');
    await page.fill('#investmentPeriod', '2');
    
    await page.click('#calculateButton');
    
    // 46.41% over 2 years should be ~20% annualized
    await expect(annualizedROI).toContainText('20.0%');
  });

  test('should reset calculator functionality completely', async ({ page }) => {
    // Fill form and calculate
    await page.fill('#initialInvestment', '40000');
    await page.fill('#finalValue', '60000');
    await page.fill('#investmentPeriod', '2.5');
    await page.fill('#annualCashFlow', '8000');
    await page.fill('#discountRate', '10');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Reset calculator
    await page.click('#resetButton');
    
    // Verify all inputs are cleared
    await expect(page.locator('#initialInvestment')).toHaveValue('');
    await expect(page.locator('#finalValue')).toHaveValue('');
    await expect(page.locator('#investmentPeriod')).toHaveValue('');
    await expect(page.locator('#annualCashFlow')).toHaveValue('');
    await expect(page.locator('#discountRate')).toHaveValue('');
    
    // Verify results are hidden
    await expect(page.locator('#resultsSection')).toBeHidden();
    await expect(page.locator('#errorMessages')).toBeHidden();
    
    // Verify result displays are reset
    await expect(page.locator('#simpleROI')).toContainText('--');
    await expect(page.locator('#annualizedROI')).toContainText('--');
  });

  test('should handle decimal inputs correctly', async ({ page }) => {
    await page.fill('#initialInvestment', '12345.67');
    await page.fill('#finalValue', '18987.54');
    await page.fill('#investmentPeriod', '2.5');
    await page.fill('#annualCashFlow', '2500.50');
    await page.fill('#discountRate', '7.5');
    
    await page.click('#calculateButton');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#simpleROI')).toContainText('%');
    await expect(page.locator('#cashFlowSection')).toBeVisible();
  });

  test('should validate discount rate bounds', async ({ page }) => {
    const calculateBtn = page.locator('#calculateButton');
    const errorDiv = page.locator('#errorMessages');
    
    // Test negative discount rate
    await page.fill('#initialInvestment', '50000');
    await page.fill('#finalValue', '75000');
    await page.fill('#investmentPeriod', '3');
    await page.fill('#discountRate', '-5');
    
    await calculateBtn.click();
    await expect(errorDiv).toContainText('Discount rate must be between 0 and 100');
    
    // Test discount rate over 100%
    await page.fill('#discountRate', '150');
    await calculateBtn.click();
    await expect(errorDiv).toContainText('Discount rate must be between 0 and 100');
  });

  test('should work correctly in dark mode', async ({ page }) => {
    // Toggle dark mode
    await page.click('#dark-mode-toggle');
    await page.waitForTimeout(500);
    
    // Verify dark mode is active
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    
    // Test calculator functionality in dark mode
    await page.fill('#initialInvestment', '75000');
    await page.fill('#finalValue', '120000');
    await page.fill('#investmentPeriod', '4');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Verify chart renders in dark mode
    await expect(page.locator('#roiChart')).toBeVisible();
  });

  test('should have proper accessibility and keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('#initialInvestment')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#finalValue')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#investmentPeriod')).toBeFocused();
    
    // Check for proper labels
    const initialLabel = page.locator('label[for="initialInvestment"]');
    await expect(initialLabel).toBeVisible();
    await expect(initialLabel).toContainText('Initial Investment');
  });

  test('should display related calculators correctly', async ({ page }) => {
    const relatedSection = page.locator('.related-calculators');
    await expect(relatedSection).toBeVisible();
    
    // Check for break-even calculator link
    const breakEvenLink = page.locator('a[href="/finance/business/break-even-calculator/"]');
    await expect(breakEvenLink).toBeVisible();
    
    // Check for profit margin calculator link
    const profitMarginLink = page.locator('a[href="/finance/business/profit-margin-calculator/"]');
    await expect(profitMarginLink).toBeVisible();
    
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

  test('should handle extreme investment values', async ({ page }) => {
    // Test very large investment
    await page.fill('#initialInvestment', '10000000');
    await page.fill('#finalValue', '15000000');
    await page.fill('#investmentPeriod', '5');
    
    await page.click('#calculateButton');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('#simpleROI')).toContainText('50.0%');
    await expect(page.locator('#totalProfit')).toContainText('$5,000,000');
    
    // Test small decimal investment
    await page.fill('#initialInvestment', '100.50');
    await page.fill('#finalValue', '125.75');
    await page.fill('#investmentPeriod', '1');
    
    await page.click('#calculateButton');
    
    await expect(page.locator('#resultsSection')).toBeVisible();
    // Should handle small amounts correctly
  });

  test('should calculate NPV correctly when discount rate provided', async ({ page }) => {
    await page.fill('#initialInvestment', '50000');
    await page.fill('#finalValue', '75000');
    await page.fill('#investmentPeriod', '3');
    await page.fill('#annualCashFlow', '15000');
    await page.fill('#discountRate', '10');
    
    await page.click('#calculateButton');
    
    const npv = page.locator('#netPresentValue');
    await expect(npv).toBeVisible();
    
    // NPV should account for time value of money
    // With 10% discount rate, NPV should be less than simple profit calculation
    const npvText = await npv.textContent();
    expect(npvText).toContain('$');
    expect(npvText).not.toContain('--');
  });

  test('should validate chart displays correct growth trajectory', async ({ page }) => {
    await page.fill('#initialInvestment', '20000');
    await page.fill('#finalValue', '32000');
    await page.fill('#investmentPeriod', '4');
    
    await page.click('#calculateButton');
    
    const chart = page.locator('#roiChart');
    await expect(chart).toBeVisible();
    
    // Verify chart has proper structure (tests Chart.js integration)
    const chartCanvas = page.locator('canvas#roiChart');
    await expect(chartCanvas).toBeVisible();
    
    // Check that chart dimensions are reasonable
    const chartBox = await chartCanvas.boundingBox();
    expect(chartBox.width).toBeGreaterThan(200);
    expect(chartBox.height).toBeGreaterThan(200);
  });
});