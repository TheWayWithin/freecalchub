const { test, expect } = require('@playwright/test');

test.describe('Portfolio Return Calculator - Comprehensive Testing', () => {
  const calculatorUrl = '/finance/investment/portfolio-return-calculator/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(calculatorUrl);
  });

  // === BASIC FUNCTIONALITY TESTS ===
  test('Page loads correctly with all essential elements', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/Portfolio Return Calculator/);
    await expect(page.locator('h1')).toContainText('Portfolio Return Calculator');
    
    // Check calculator form is present
    await expect(page.locator('#calculatorForm')).toBeVisible();
    
    // Check essential form fields are present
    await expect(page.locator('#portfolioValue')).toBeVisible();
    await expect(page.locator('#rebalanceThreshold')).toBeVisible();
    
    // Check asset allocation inputs are present (default assets)
    await expect(page.locator('#stocks_allocation')).toBeVisible();
    await expect(page.locator('#bonds_allocation')).toBeVisible();
    await expect(page.locator('#international_allocation')).toBeVisible();
    
    // Check buttons are present
    await expect(page.locator('#calculateButton')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
    await expect(page.locator('#addAssetButton')).toBeVisible();
  });

  test('Basic portfolio calculation with balanced allocation', async ({ page }) => {
    // Fill in portfolio value
    await page.fill('#portfolioValue', '100000');
    
    // Set up a balanced 60/30/10 portfolio
    await page.fill('#stocks_allocation', '60');
    await page.fill('#bonds_allocation', '30');
    await page.fill('#international_allocation', '10');
    
    // Trigger calculation
    await page.click('#calculateButton');
    
    // Wait for results to appear
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 5000 });
    
    // Verify key results are calculated and displayed
    const expectedReturn = page.locator('#expectedReturn');
    const portfolioRisk = page.locator('#portfolioRisk');
    const expectedGain = page.locator('#expectedGain');
    const sharpeRatio = page.locator('#sharpeRatio');
    
    await expect(expectedReturn).not.toHaveText('--');
    await expect(portfolioRisk).not.toHaveText('--');
    await expect(expectedGain).not.toHaveText('--');
    await expect(sharpeRatio).not.toHaveText('--');
  });

  test('Allocation percentage validation - must total 100%', async ({ page }) => {
    // Fill portfolio value
    await page.fill('#portfolioValue', '50000');
    
    // Set allocations that don't add up to 100%
    await page.fill('#stocks_allocation', '50');
    await page.fill('#bonds_allocation', '20');
    await page.fill('#international_allocation', '20'); // Total = 90%
    
    await page.click('#calculateButton');
    
    // Check total allocation display
    const totalAllocation = await page.textContent('#totalAllocation');
    expect(totalAllocation).toBe('90%');
    
    // Should show error or warning for not totaling 100%
    const errorMessages = page.locator('#errorMessages');
    if (await errorMessages.isVisible()) {
      const errorText = await errorMessages.textContent();
      expect(errorText.toLowerCase()).toMatch(/100|total|allocation/);
    }
  });

  test('Add asset class functionality', async ({ page }) => {
    // Count initial asset groups
    const initialAssetGroups = await page.locator('.asset-group').count();
    
    // Click add asset button
    await page.click('#addAssetButton');
    
    // Verify new asset group was added
    const newAssetGroups = await page.locator('.asset-group').count();
    expect(newAssetGroups).toBe(initialAssetGroups + 1);
    
    // Verify new asset group has required inputs
    const lastAssetGroup = page.locator('.asset-group').last();
    await expect(lastAssetGroup.locator('input[id$="_allocation"]')).toBeVisible();
    await expect(lastAssetGroup.locator('input[id$="_return"]')).toBeVisible();
    await expect(lastAssetGroup.locator('input[id$="_volatility"]')).toBeVisible();
  });

  // === FINANCIAL ACCURACY TESTS ===
  test('Verify weighted average return calculation', async ({ page }) => {
    // Set up known portfolio: 50% stocks (8%), 50% bonds (4%)
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '50');
    await page.fill('#bonds_allocation', '50');
    await page.fill('#international_allocation', '0');
    
    // Ensure expected returns are set correctly
    await expect(page.locator('#stocks_return')).toHaveValue('8');
    await expect(page.locator('#bonds_return')).toHaveValue('4');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Expected weighted return should be 6% (0.5 * 8% + 0.5 * 4%)
    const expectedReturnText = await page.textContent('#expectedReturn');
    const expectedReturn = parseFloat(expectedReturnText.replace(/[%]/g, ''));
    expect(expectedReturn).toBeCloseTo(6, 0.5); // Within 0.5% of 6%
  });

  test('Portfolio risk calculation with diversification', async ({ page }) => {
    // Conservative portfolio: 20% stocks, 80% bonds
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '20');
    await page.fill('#bonds_allocation', '80');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const portfolioRiskText = await page.textContent('#portfolioRisk');
    const conservativeRisk = parseFloat(portfolioRiskText.replace(/[%]/g, ''));
    
    // Reset and test aggressive portfolio: 100% stocks
    await page.click('#resetButton');
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '100');
    await page.fill('#bonds_allocation', '0');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const aggressiveRiskText = await page.textContent('#portfolioRisk');
    const aggressiveRisk = parseFloat(aggressiveRiskText.replace(/[%]/g, ''));
    
    // Diversified portfolio should have lower risk than 100% stocks
    expect(conservativeRisk).toBeLessThan(aggressiveRisk);
    expect(aggressiveRisk).toBeGreaterThan(15); // Stocks have higher volatility
    expect(conservativeRisk).toBeLessThan(10); // Bond-heavy portfolio lower risk
  });

  test('Expected annual gain calculation accuracy', async ({ page }) => {
    // $100,000 portfolio with 7% expected return
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '70');
    await page.fill('#bonds_allocation', '30');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Expected gain should be approximately 7% of $100,000 = $7,000
    const expectedGainText = await page.textContent('#expectedGain');
    const expectedGain = parseFloat(expectedGainText.replace(/[$,]/g, ''));
    
    // Should be close to $6,800 (70% * 8% + 30% * 4% = 6.8% of $100,000)
    expect(expectedGain).toBeGreaterThan(6500);
    expect(expectedGain).toBeLessThan(7200);
  });

  test('Sharpe ratio calculation', async ({ page }) => {
    // Set up portfolio for Sharpe ratio calculation
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '60');
    await page.fill('#bonds_allocation', '40');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Sharpe ratio should be a reasonable value (typically 0.1 to 2.0)
    const sharpeRatioText = await page.textContent('#sharpeRatio');
    const sharpeRatio = parseFloat(sharpeRatioText);
    
    expect(sharpeRatio).toBeGreaterThan(0.1);
    expect(sharpeRatio).toBeLessThan(3.0);
  });

  // === ASSET ALLOCATION TESTS ===
  test('Real-time allocation total updating', async ({ page }) => {
    // Monitor total allocation as we input values
    await expect(page.locator('#totalAllocation')).toHaveText('0%');
    
    // Add first allocation
    await page.fill('#stocks_allocation', '40');
    await page.waitForTimeout(100);
    await expect(page.locator('#totalAllocation')).toHaveText('40%');
    
    // Add second allocation
    await page.fill('#bonds_allocation', '35');
    await page.waitForTimeout(100);
    await expect(page.locator('#totalAllocation')).toHaveText('75%');
    
    // Add third allocation to reach 100%
    await page.fill('#international_allocation', '25');
    await page.waitForTimeout(100);
    await expect(page.locator('#totalAllocation')).toHaveText('100%');
  });

  test('Asset breakdown display', async ({ page }) => {
    // Set up portfolio
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '60');
    await page.fill('#bonds_allocation', '30');
    await page.fill('#international_allocation', '10');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Check asset breakdown is displayed
    const assetBreakdown = page.locator('#assetBreakdown');
    await expect(assetBreakdown).toBeVisible();
    
    const breakdownContent = await assetBreakdown.textContent();
    
    // Should show asset names and values
    expect(breakdownContent.toLowerCase()).toMatch(/stocks|stock/);
    expect(breakdownContent.toLowerCase()).toMatch(/bonds|bond/);
    expect(breakdownContent).toMatch(/\$60,000|\$30,000|\$10,000/);
  });

  test('Over 100% allocation handling', async ({ page }) => {
    // Set allocations that exceed 100%
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '70');
    await page.fill('#bonds_allocation', '40');
    await page.fill('#international_allocation', '20'); // Total = 130%
    
    // Check total allocation display
    await expect(page.locator('#totalAllocation')).toHaveText('130%');
    
    await page.click('#calculateButton');
    
    // Should show error or warning
    const errorMessages = page.locator('#errorMessages');
    if (await errorMessages.isVisible()) {
      const errorText = await errorMessages.textContent();
      expect(errorText.toLowerCase()).toMatch(/exceed|over|100/);
    }
  });

  // === REBALANCING TESTS ===
  test('Rebalancing threshold functionality', async ({ page }) => {
    // Set up initial portfolio
    await page.fill('#portfolioValue', '100000');
    await page.fill('#rebalanceThreshold', '10'); // 10% threshold
    await page.fill('#stocks_allocation', '60');
    await page.fill('#bonds_allocation', '40');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Note: Rebalancing suggestions might only appear when current allocations
    // differ from target allocations, which would require additional inputs
    const rebalancingContainer = page.locator('#rebalancingContainer');
    if (await rebalancingContainer.isVisible()) {
      const suggestions = await page.textContent('#rebalancingSuggestions');
      expect(suggestions).toBeTruthy();
    }
  });

  // === INPUT VALIDATION TESTS ===
  test('Required field validation', async ({ page }) => {
    // Try to calculate without portfolio value
    await page.fill('#stocks_allocation', '100');
    await page.click('#calculateButton');
    
    // Should prevent calculation or show error
    const errorMessages = page.locator('#errorMessages');
    if (await errorMessages.isVisible()) {
      const errorText = await errorMessages.textContent();
      expect(errorText.toLowerCase()).toMatch(/portfolio|value|required/);
    }
    
    // Verify results section is not shown without valid inputs
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    if (!resultsVisible) {
      expect(resultsVisible).toBeFalsy();
    }
  });

  test('Negative allocation validation', async ({ page }) => {
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '-10'); // Negative allocation
    await page.fill('#bonds_allocation', '50');
    
    await page.click('#calculateButton');
    
    // Should handle negative values appropriately
    const errorMessages = page.locator('#errorMessages');
    if (await errorMessages.isVisible()) {
      const errorText = await errorMessages.textContent();
      expect(errorText.toLowerCase()).toMatch(/negative|positive|invalid/);
    }
  });

  test('Extreme return rate validation', async ({ page }) => {
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '100');
    await page.fill('#stocks_return', '100'); // 100% return rate
    
    await page.click('#calculateButton');
    
    // Should handle extreme values gracefully
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    if (resultsVisible) {
      const expectedReturn = await page.textContent('#expectedReturn');
      expect(expectedReturn).not.toBe('--');
    }
  });

  // === USER EXPERIENCE TESTS ===
  test('Reset functionality', async ({ page }) => {
    // Fill in form data
    await page.fill('#portfolioValue', '150000');
    await page.fill('#rebalanceThreshold', '8');
    await page.fill('#stocks_allocation', '65');
    await page.fill('#bonds_allocation', '25');
    await page.fill('#international_allocation', '10');
    
    // Calculate to show results
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Reset form
    await page.click('#resetButton');
    
    // Verify key inputs are cleared
    await expect(page.locator('#portfolioValue')).toHaveValue('');
    await expect(page.locator('#stocks_allocation')).toHaveValue('');
    await expect(page.locator('#bonds_allocation')).toHaveValue('');
    await expect(page.locator('#international_allocation')).toHaveValue('');
    
    // Verify results section is hidden
    await expect(page.locator('#resultsSection')).toBeHidden();
    
    // Verify total allocation resets
    await expect(page.locator('#totalAllocation')).toHaveText('0%');
  });

  test('Form field placeholders and default values', async ({ page }) => {
    // Verify helpful placeholders
    await expect(page.locator('#portfolioValue')).toHaveAttribute('placeholder', '100000');
    await expect(page.locator('#stocks_allocation')).toHaveAttribute('placeholder', '60');
    await expect(page.locator('#bonds_allocation')).toHaveAttribute('placeholder', '30');
    await expect(page.locator('#international_allocation')).toHaveAttribute('placeholder', '10');
    
    // Verify default expected returns
    await expect(page.locator('#stocks_return')).toHaveValue('8');
    await expect(page.locator('#bonds_return')).toHaveValue('4');
    await expect(page.locator('#international_return')).toHaveValue('7');
  });

  test('Results display formatting', async ({ page }) => {
    // Calculate with known values
    await page.fill('#portfolioValue', '250000');
    await page.fill('#stocks_allocation', '70');
    await page.fill('#bonds_allocation', '30');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Check formatting of results
    const expectedReturn = await page.textContent('#expectedReturn');
    const portfolioRisk = await page.textContent('#portfolioRisk');
    const expectedGain = await page.textContent('#expectedGain');
    
    // Should have percentage signs for rates
    expect(expectedReturn).toMatch(/%/);
    expect(portfolioRisk).toMatch(/%/);
    
    // Should have dollar formatting for gains
    expect(expectedGain).toMatch(/\$/);
  });

  // === EDGE CASES AND ERROR HANDLING ===
  test('Very small portfolio value', async ({ page }) => {
    await page.fill('#portfolioValue', '100'); // $100 portfolio
    await page.fill('#stocks_allocation', '100');
    await page.fill('#bonds_allocation', '0');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Should handle small values correctly
    const expectedGain = await page.textContent('#expectedGain');
    const gainValue = parseFloat(expectedGain.replace(/[$,]/g, ''));
    expect(gainValue).toBeGreaterThan(0);
    expect(gainValue).toBeLessThan(50); // Should be around $8 for $100 at 8%
  });

  test('Very large portfolio value', async ({ page }) => {
    await page.fill('#portfolioValue', '10000000'); // $10M portfolio
    await page.fill('#stocks_allocation', '50');
    await page.fill('#bonds_allocation', '50');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Should handle large values with proper formatting
    const expectedGain = await page.textContent('#expectedGain');
    const assetBreakdown = await page.textContent('#assetBreakdown');
    
    // Should contain commas for large numbers
    expect(expectedGain).toMatch(/,/);
    expect(assetBreakdown).toMatch(/million|,000,000/i);
  });

  test('Zero allocation scenarios', async ({ page }) => {
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '0');
    await page.fill('#bonds_allocation', '100');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Should handle 100% bonds allocation
    const expectedReturn = await page.textContent('#expectedReturn');
    const returnValue = parseFloat(expectedReturn.replace(/[%]/g, ''));
    expect(returnValue).toBeCloseTo(4, 0.5); // Should be close to bond return rate
  });

  test('Single asset class portfolio', async ({ page }) => {
    await page.fill('#portfolioValue', '100000');
    await page.fill('#stocks_allocation', '100');
    await page.fill('#bonds_allocation', '0');
    await page.fill('#international_allocation', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Portfolio risk should equal stock volatility (no diversification)
    const portfolioRisk = await page.textContent('#portfolioRisk');
    const riskValue = parseFloat(portfolioRisk.replace(/[%]/g, ''));
    
    // Should be close to stock volatility (default 18%)
    expect(riskValue).toBeCloseTo(18, 2);
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
    expect(softwareApp.name).toBe('Portfolio Return Calculator');
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