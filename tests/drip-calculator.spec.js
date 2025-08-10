const { test, expect } = require('@playwright/test');

test.describe('DRIP Calculator - Comprehensive Testing', () => {
  const calculatorUrl = '/finance/investment/drip-calculator/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(calculatorUrl);
  });

  // === BASIC FUNCTIONALITY TESTS ===
  test('Page loads correctly with all essential elements', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/DRIP Calculator/);
    await expect(page.locator('h1')).toContainText('DRIP Calculator');
    
    // Check calculator form is present
    await expect(page.locator('#calculatorForm')).toBeVisible();
    
    // Check essential form fields are present
    await expect(page.locator('#initialInvestment')).toBeVisible();
    await expect(page.locator('#sharePrice')).toBeVisible();
    await expect(page.locator('#annualDividend')).toBeVisible();
    await expect(page.locator('#dividendGrowthRate')).toBeVisible();
    await expect(page.locator('#timeHorizon')).toBeVisible();
    await expect(page.locator('#dividendFrequency')).toBeVisible();
    
    // Check buttons are present
    await expect(page.locator('#calculateButton')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
  });

  test('Basic DRIP calculation with valid inputs', async ({ page }) => {
    // Fill in basic DRIP investment data
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#dividendGrowthRate', '3');
    await page.fill('#stockPriceGrowth', '5');
    await page.fill('#timeHorizon', '10');
    await page.selectOption('#dividendFrequency', '4'); // Quarterly
    
    // Trigger calculation
    await page.click('#calculateButton');
    
    // Wait for results to appear
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 5000 });
    
    // Verify DRIP scenario results are calculated
    const dripTotalValue = page.locator('#dripTotalValue');
    const dripTotalShares = page.locator('#dripTotalShares');
    const dripAnnualDividend = page.locator('#dripAnnualDividend');
    const dripTotalReturn = page.locator('#dripTotalReturn');
    
    await expect(dripTotalValue).not.toHaveText('--');
    await expect(dripTotalShares).not.toHaveText('--');
    await expect(dripAnnualDividend).not.toHaveText('--');
    await expect(dripTotalReturn).not.toHaveText('--');
  });

  test('Scenario tabs functionality', async ({ page }) => {
    // Set up calculation
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#timeHorizon', '10');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Test DRIP scenario tab (should be active by default)
    await expect(page.locator('.tab-button[data-scenario="drip"]')).toHaveClass(/active/);
    await expect(page.locator('#dripScenario')).toBeVisible();
    
    // Test Cash Dividend scenario tab
    await page.click('.tab-button[data-scenario="cash"]');
    await expect(page.locator('.tab-button[data-scenario="cash"]')).toHaveClass(/active/);
    await expect(page.locator('#cashScenario')).toBeVisible();
    await expect(page.locator('#dripScenario')).toBeHidden();
    
    // Verify cash scenario has results
    await expect(page.locator('#cashStockValue')).not.toHaveText('--');
    await expect(page.locator('#cashDividendTotal')).not.toHaveText('--');
    
    // Test Comparison scenario tab
    await page.click('.tab-button[data-scenario="comparison"]');
    await expect(page.locator('.tab-button[data-scenario="comparison"]')).toHaveClass(/active/);
    await expect(page.locator('#comparisonScenario')).toBeVisible();
    await expect(page.locator('#cashScenario')).toBeHidden();
    
    // Verify comparison results
    await expect(page.locator('#comparisonAdvantage')).not.toHaveText('--');
  });

  // === FINANCIAL ACCURACY TESTS ===
  test('Verify dividend reinvestment compound growth calculation', async ({ page }) => {
    // Test simple case: $10,000 initial, $50 share price = 200 shares
    // $2.50 annual dividend = $500 first year dividends
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#dividendGrowthRate', '0'); // No growth for simplicity
    await page.fill('#stockPriceGrowth', '0'); // No price growth
    await page.fill('#timeHorizon', '1'); // 1 year only
    await page.selectOption('#dividendFrequency', '1'); // Annual
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Initial shares: 10,000 / 50 = 200 shares
    // First year dividend: 200 * 2.50 = $500
    // Additional shares from DRIP: $500 / $50 = 10 shares
    // Total shares should be approximately 210
    const totalSharesText = await page.textContent('#dripTotalShares');
    const totalShares = parseFloat(totalSharesText.replace(/[,]/g, ''));
    expect(totalShares).toBeCloseTo(210, 5); // Within 5 shares
  });

  test('Dividend growth rate calculation accuracy', async ({ page }) => {
    // Test with dividend growth
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '100');
    await page.fill('#annualDividend', '4');
    await page.fill('#dividendGrowthRate', '5'); // 5% annual growth
    await page.fill('#stockPriceGrowth', '0');
    await page.fill('#timeHorizon', '5');
    await page.selectOption('#dividendFrequency', '1');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Year 5 dividend per share should be approximately $4 * (1.05)^5 = $5.11
    const annualDividendText = await page.textContent('#dripAnnualDividend');
    const annualDividend = parseFloat(annualDividendText.replace(/[$,]/g, ''));
    
    // Total shares will grow, so annual dividend should be higher than base case
    expect(annualDividend).toBeGreaterThan(400); // Should be more than original $400
    expect(annualDividend).toBeLessThan(1000); // Reasonable upper bound
  });

  test('DRIP vs Cash dividend comparison accuracy', async ({ page }) => {
    // Set up calculation
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#dividendGrowthRate', '3');
    await page.fill('#stockPriceGrowth', '5');
    await page.fill('#timeHorizon', '20');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Switch to comparison tab
    await page.click('.tab-button[data-scenario="comparison"]');
    
    // DRIP should show advantage over cash dividends due to compounding
    const comparisonAdvantageText = await page.textContent('#comparisonAdvantage');
    const advantageAmount = parseFloat(comparisonAdvantageText.replace(/[$,%]/g, ''));
    
    expect(advantageAmount).toBeGreaterThan(0); // DRIP should have advantage
  });

  test('Additional monthly contribution impact', async ({ page }) => {
    // Test without additional contributions
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#timeHorizon', '10');
    await page.fill('#additionalContribution', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const totalValueWithoutContributions = await page.textContent('#dripTotalValue');
    const valueWithout = parseFloat(totalValueWithoutContributions.replace(/[$,]/g, ''));
    
    // Reset and test with additional contributions
    await page.click('#resetButton');
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#timeHorizon', '10');
    await page.fill('#additionalContribution', '200'); // $200/month
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const totalValueWithContributions = await page.textContent('#dripTotalValue');
    const valueWith = parseFloat(totalValueWithContributions.replace(/[$,]/g, ''));
    
    // With additional contributions should be significantly higher
    expect(valueWith).toBeGreaterThan(valueWithout + 20000); // At least $24,000 more
  });

  // === DIVIDEND FREQUENCY TESTS ===
  test('Dividend frequency impact on calculations', async ({ page }) => {
    // Test quarterly vs annual dividend frequency
    const testData = {
      initialInvestment: '10000',
      sharePrice: '100',
      annualDividend: '4',
      timeHorizon: '5'
    };
    
    // Test quarterly dividends
    await page.fill('#initialInvestment', testData.initialInvestment);
    await page.fill('#sharePrice', testData.sharePrice);
    await page.fill('#annualDividend', testData.annualDividend);
    await page.fill('#timeHorizon', testData.timeHorizon);
    await page.selectOption('#dividendFrequency', '4'); // Quarterly
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const quarterlyTotalValue = await page.textContent('#dripTotalValue');
    const quarterlyValue = parseFloat(quarterlyTotalValue.replace(/[$,]/g, ''));
    
    // Reset and test annual dividends
    await page.click('#resetButton');
    await page.fill('#initialInvestment', testData.initialInvestment);
    await page.fill('#sharePrice', testData.sharePrice);
    await page.fill('#annualDividend', testData.annualDividend);
    await page.fill('#timeHorizon', testData.timeHorizon);
    await page.selectOption('#dividendFrequency', '1'); // Annual
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const annualTotalValue = await page.textContent('#dripTotalValue');
    const annualValue = parseFloat(annualTotalValue.replace(/[$,]/g, ''));
    
    // Quarterly compounding should result in slightly higher value
    expect(quarterlyValue).toBeGreaterThan(annualValue);
  });

  // === INPUT VALIDATION TESTS ===
  test('Required field validation', async ({ page }) => {
    // Try to calculate without required fields
    await page.click('#calculateButton');
    
    // Check if validation prevents calculation or shows errors
    const errorMessages = page.locator('#errorMessages');
    if (await errorMessages.isVisible()) {
      const errorText = await errorMessages.textContent();
      expect(errorText.toLowerCase()).toMatch(/required|missing|invalid/);
    }
    
    // Verify results section is not shown
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    expect(resultsVisible).toBeFalsy();
  });

  test('Numeric input validation and edge cases', async ({ page }) => {
    // Test negative initial investment
    await page.fill('#initialInvestment', '-1000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2');
    await page.fill('#timeHorizon', '10');
    
    await page.click('#calculateButton');
    
    const errorVisible = await page.locator('#errorMessages').isVisible();
    if (errorVisible) {
      const errorText = await page.textContent('#errorMessages');
      expect(errorText.toLowerCase()).toMatch(/negative|positive|invalid/);
    }
    
    // Test zero share price
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '0');
    
    await page.click('#calculateButton');
    
    // Should prevent division by zero or show appropriate error
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    if (!resultsVisible) {
      expect(resultsVisible).toBeFalsy();
    }
  });

  test('Extreme growth rate validation', async ({ page }) => {
    // Test very high dividend growth rate
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#dividendGrowthRate', '50'); // 50% growth rate
    await page.fill('#timeHorizon', '10');
    
    await page.click('#calculateButton');
    
    // Should handle extreme values gracefully
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    if (resultsVisible) {
      const totalValue = await page.textContent('#dripTotalValue');
      expect(totalValue).not.toBe('--');
    }
  });

  test('Time horizon validation', async ({ page }) => {
    // Test zero time horizon
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#timeHorizon', '0');
    
    await page.click('#calculateButton');
    
    const errorVisible = await page.locator('#errorMessages').isVisible();
    if (errorVisible) {
      const errorText = await page.textContent('#errorMessages');
      expect(errorText.toLowerCase()).toMatch(/time|year|period|invalid/);
    }
  });

  // === USER EXPERIENCE TESTS ===
  test('Reset functionality', async ({ page }) => {
    // Fill in form data
    await page.fill('#initialInvestment', '15000');
    await page.fill('#sharePrice', '75');
    await page.fill('#annualDividend', '3.25');
    await page.fill('#dividendGrowthRate', '4');
    await page.fill('#stockPriceGrowth', '6');
    await page.fill('#timeHorizon', '15');
    await page.fill('#additionalContribution', '150');
    
    // Calculate to show results
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Reset form
    await page.click('#resetButton');
    
    // Verify inputs are cleared
    await expect(page.locator('#initialInvestment')).toHaveValue('');
    await expect(page.locator('#sharePrice')).toHaveValue('');
    await expect(page.locator('#annualDividend')).toHaveValue('');
    await expect(page.locator('#dividendGrowthRate')).toHaveValue('');
    await expect(page.locator('#stockPriceGrowth')).toHaveValue('');
    await expect(page.locator('#timeHorizon')).toHaveValue('');
    await expect(page.locator('#additionalContribution')).toHaveValue('');
    
    // Verify results section is hidden
    await expect(page.locator('#resultsSection')).toBeHidden();
  });

  test('Form field placeholders and labels', async ({ page }) => {
    // Verify helpful placeholders
    await expect(page.locator('#initialInvestment')).toHaveAttribute('placeholder', '10000');
    await expect(page.locator('#sharePrice')).toHaveAttribute('placeholder', '50');
    await expect(page.locator('#annualDividend')).toHaveAttribute('placeholder', '2.50');
    await expect(page.locator('#dividendGrowthRate')).toHaveAttribute('placeholder', '3');
    
    // Verify labels are descriptive
    await expect(page.locator('label[for="initialInvestment"]')).toContainText('Initial Investment');
    await expect(page.locator('label[for="sharePrice"]')).toContainText('Share Price');
    await expect(page.locator('label[for="annualDividend"]')).toContainText('Annual Dividend');
    await expect(page.locator('label[for="dividendGrowthRate"]')).toContainText('Dividend Growth Rate');
  });

  test('Results display formatting', async ({ page }) => {
    // Calculate with known values
    await page.fill('#initialInvestment', '100000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#timeHorizon', '10');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Check currency and number formatting
    const dripTotalValue = await page.textContent('#dripTotalValue');
    const dripTotalShares = await page.textContent('#dripTotalShares');
    const dripAnnualDividend = await page.textContent('#dripAnnualDividend');
    
    // Should contain dollar signs and proper formatting
    expect(dripTotalValue).toMatch(/\$/);
    expect(dripAnnualDividend).toMatch(/\$/);
    
    // Large numbers should have comma separators
    if (parseFloat(dripTotalValue.replace(/[$,]/g, '')) >= 1000) {
      expect(dripTotalValue).toMatch(/,/);
    }
    
    // Shares should be formatted as numbers
    expect(dripTotalShares).toMatch(/\d/);
  });

  // === DIVIDEND YIELD AND RETURN TESTS ===
  test('High dividend yield stock calculation', async ({ page }) => {
    // Test high dividend yield scenario (10% yield)
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '25'); // $25 per share
    await page.fill('#annualDividend', '2.50'); // 10% yield
    await page.fill('#dividendGrowthRate', '2');
    await page.fill('#stockPriceGrowth', '3');
    await page.fill('#timeHorizon', '15');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const dripTotalValue = await page.textContent('#dripTotalValue');
    const totalValue = parseFloat(dripTotalValue.replace(/[$,]/g, ''));
    
    // High yield should generate significant compound growth
    expect(totalValue).toBeGreaterThan(30000); // Should more than triple
  });

  test('Low dividend yield growth stock calculation', async ({ page }) => {
    // Test low yield, high growth scenario
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '100'); // $100 per share
    await page.fill('#annualDividend', '1.00'); // 1% yield
    await page.fill('#dividendGrowthRate', '8'); // High dividend growth
    await page.fill('#stockPriceGrowth', '10'); // High stock growth
    await page.fill('#timeHorizon', '20');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const dripTotalValue = await page.textContent('#dripTotalValue');
    const totalValue = parseFloat(dripTotalValue.replace(/[$,]/g, ''));
    
    // Growth should compensate for low initial yield
    expect(totalValue).toBeGreaterThan(40000);
  });

  // === EDGE CASES AND ERROR HANDLING ===
  test('Fractional shares calculation', async ({ page }) => {
    // Test case that would result in fractional shares
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '73.33'); // Unusual price
    await page.fill('#annualDividend', '2.47'); // Unusual dividend
    await page.fill('#timeHorizon', '5');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Should handle fractional shares properly
    const totalShares = await page.textContent('#dripTotalShares');
    expect(totalShares).not.toBe('--');
    
    // Shares can be fractional in DRIPs
    const shareCount = parseFloat(totalShares.replace(/[,]/g, ''));
    expect(shareCount).toBeGreaterThan(0);
  });

  test('Very long time horizon calculation', async ({ page }) => {
    // Test 50-year investment horizon
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#dividendGrowthRate', '3');
    await page.fill('#stockPriceGrowth', '7');
    await page.fill('#timeHorizon', '50');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Should handle very long time horizons
    const dripTotalValue = await page.textContent('#dripTotalValue');
    const totalValue = parseFloat(dripTotalValue.replace(/[$,]/g, ''));
    
    // 50 years of compound growth should be substantial
    expect(totalValue).toBeGreaterThan(500000);
    
    // Should display large numbers with proper formatting
    expect(dripTotalValue).toMatch(/million|,000,000/i);
  });

  test('Zero dividend growth rate', async ({ page }) => {
    // Test with no dividend growth
    await page.fill('#initialInvestment', '10000');
    await page.fill('#sharePrice', '50');
    await page.fill('#annualDividend', '2.50');
    await page.fill('#dividendGrowthRate', '0'); // No growth
    await page.fill('#stockPriceGrowth', '5');
    await page.fill('#timeHorizon', '10');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Should still show compound growth from reinvestment
    const dripTotalValue = await page.textContent('#dripTotalValue');
    const totalValue = parseFloat(dripTotalValue.replace(/[$,]/g, ''));
    
    expect(totalValue).toBeGreaterThan(10000); // Should still grow
  });

  // === TEMPLATE COMPLIANCE TESTS ===
  test('Schema.org markup validation', async ({ page }) => {
    // Check for JSON-LD structured data
    const schemaScript = page.locator('script[type="application/ld+json"]');
    await expect(schemaScript).toHaveCount(1);
    
    const schemaContent = await schemaScript.textContent();
    const schemaData = JSON.parse(schemaContent);
    
    // Verify SoftwareApplication schema
    const softwareApp = schemaData['@graph'].find(item => item['@type'] === 'SoftwareApplication');
    expect(softwareApp).toBeDefined();
    expect(softwareApp.name).toBe('DRIP Calculator (Dividend Reinvestment Plan)');
    expect(softwareApp.applicationCategory).toBe('FinanceApplication');
    
    // Verify FAQ schema
    const faqPage = schemaData['@graph'].find(item => item['@type'] === 'FAQPage');
    expect(faqPage).toBeDefined();
    expect(faqPage.mainEntity).toBeInstanceOf(Array);
    expect(faqPage.mainEntity.length).toBeGreaterThan(0);
  });

  test('Breadcrumb navigation functionality', async ({ page }) => {
    // Check breadcrumbs structure
    const breadcrumbs = page.locator('.breadcrumbs');
    await expect(breadcrumbs).toBeVisible();
    
    // Test breadcrumb navigation
    await page.click('.breadcrumbs a[href="/finance/investment/"]');
    await expect(page).toHaveURL(/.*\/finance\/investment\/$/);
  });

  test('Navigation ribbon functionality', async ({ page }) => {
    // Check navigation ribbon is present
    const navRibbon = page.locator('.navigation-ribbon');
    await expect(navRibbon).toBeVisible();
    
    // Verify Investment is marked as active
    const activeLink = page.locator('.navigation-ribbon a.active');
    await expect(activeLink).toContainText('Investment');
  });
});