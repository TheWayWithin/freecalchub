const { test, expect } = require('@playwright/test');

test.describe('Investment Goal Calculator - Comprehensive Testing', () => {
  const calculatorUrl = '/finance/investment/investment-goal-calculator/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(calculatorUrl);
  });

  // === BASIC FUNCTIONALITY TESTS ===
  test('Page loads correctly with all essential elements', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/Investment Goal Calculator/);
    await expect(page.locator('h1')).toContainText('Investment Goal Calculator');
    
    // Check calculator form is present
    await expect(page.locator('#calculatorForm')).toBeVisible();
    
    // Check essential form fields are present
    await expect(page.locator('#targetAmount')).toBeVisible();
    await expect(page.locator('#timeHorizon')).toBeVisible();
    await expect(page.locator('#expectedReturn')).toBeVisible();
    await expect(page.locator('#initialInvestment')).toBeVisible();
    await expect(page.locator('#contributionFrequency')).toBeVisible();
    
    // Check buttons are present
    await expect(page.locator('#calculateButton')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
  });

  test('Basic calculation with valid inputs', async ({ page }) => {
    // Fill in basic investment goal data
    await page.fill('#targetAmount', '100000');
    await page.fill('#timeHorizon', '10');
    await page.fill('#expectedReturn', '7');
    await page.fill('#initialInvestment', '5000');
    
    // Trigger calculation
    await page.click('#calculateButton');
    
    // Wait for results to appear
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 5000 });
    
    // Verify required contribution is calculated and displayed
    const requiredContribution = page.locator('#requiredContribution');
    await expect(requiredContribution).not.toHaveText('--');
    await expect(requiredContribution).toBeVisible();
    
    // Verify other result fields are populated
    await expect(page.locator('#totalContributions')).not.toHaveText('--');
    await expect(page.locator('#investmentGrowth')).toBeVisible();
    await expect(page.locator('#finalAmount')).not.toHaveText('--');
  });

  test('Monthly vs Annual contribution frequency calculations', async ({ page }) => {
    // Test monthly contributions first
    await page.fill('#targetAmount', '50000');
    await page.fill('#timeHorizon', '5');
    await page.fill('#expectedReturn', '6');
    await page.selectOption('#contributionFrequency', '12'); // Monthly
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const monthlyContribution = await page.textContent('#requiredContribution');
    
    // Clear results and test annual contributions
    await page.click('#resetButton');
    await page.fill('#targetAmount', '50000');
    await page.fill('#timeHorizon', '5');
    await page.fill('#expectedReturn', '6');
    await page.selectOption('#contributionFrequency', '1'); // Annual
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const annualContribution = await page.textContent('#requiredContribution');
    
    // Verify monthly and annual contributions are different
    expect(monthlyContribution).not.toBe(annualContribution);
  });

  // === FINANCIAL ACCURACY TESTS ===
  test('Verify mathematical accuracy of investment goal calculation', async ({ page }) => {
    // Test case: $100,000 goal in 10 years at 7% with $5,000 initial
    await page.fill('#targetAmount', '100000');
    await page.fill('#timeHorizon', '10');
    await page.fill('#expectedReturn', '7');
    await page.fill('#initialInvestment', '5000');
    await page.selectOption('#contributionFrequency', '12'); // Monthly
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Get calculated monthly payment
    const contributionText = await page.textContent('#requiredContribution');
    const monthlyPayment = parseFloat(contributionText.replace(/[$,]/g, ''));
    
    // Verify monthly payment is reasonable (should be around $580-620)
    expect(monthlyPayment).toBeGreaterThan(550);
    expect(monthlyPayment).toBeLessThan(650);
    
    // Verify final amount matches target
    const finalAmountText = await page.textContent('#finalAmount');
    const finalAmount = parseFloat(finalAmountText.replace(/[$,]/g, ''));
    expect(finalAmount).toBeCloseTo(100000, 0); // Within $500
  });

  test('Compound interest calculation accuracy', async ({ page }) => {
    // Simple test case for compound interest verification
    await page.fill('#targetAmount', '20000');
    await page.fill('#timeHorizon', '2');
    await page.fill('#expectedReturn', '10');
    await page.fill('#initialInvestment', '0');
    await page.selectOption('#contributionFrequency', '1'); // Annual
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // For 2 years at 10%, annual payment should be around $9,524
    const contributionText = await page.textContent('#requiredContribution');
    const annualPayment = parseFloat(contributionText.replace(/[$,]/g, ''));
    expect(annualPayment).toBeGreaterThan(9400);
    expect(annualPayment).toBeLessThan(9600);
  });

  test('Inflation adjustment functionality', async ({ page }) => {
    // Test calculation with inflation adjustment
    await page.fill('#targetAmount', '50000');
    await page.fill('#timeHorizon', '10');
    await page.fill('#expectedReturn', '7');
    await page.fill('#initialInvestment', '0');
    await page.fill('#inflationRate', '3'); // 3% inflation
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Check if inflation-adjusted container is visible
    const inflationContainer = page.locator('#inflationAdjustedContainer');
    if (await inflationContainer.isVisible()) {
      const inflationAdjustedTarget = await page.textContent('#inflationAdjustedTarget');
      const adjustedAmount = parseFloat(inflationAdjustedTarget.replace(/[$,]/g, ''));
      
      // Inflation-adjusted target should be higher than original target
      expect(adjustedAmount).toBeGreaterThan(50000);
      expect(adjustedAmount).toBeLessThan(80000); // Reasonable upper bound
    }
  });

  test('Tax adjustment functionality', async ({ page }) => {
    // Test calculation with tax considerations
    await page.fill('#targetAmount', '100000');
    await page.fill('#timeHorizon', '15');
    await page.fill('#expectedReturn', '8');
    await page.fill('#initialInvestment', '10000');
    await page.fill('#taxRate', '25'); // 25% tax rate
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Check if after-tax container is visible
    const afterTaxContainer = page.locator('#afterTaxContainer');
    if (await afterTaxContainer.isVisible()) {
      const afterTaxAmount = await page.textContent('#afterTaxAmount');
      const afterTaxValue = parseFloat(afterTaxAmount.replace(/[$,]/g, ''));
      
      // After-tax amount should be less than pre-tax final amount
      expect(afterTaxValue).toBeLessThan(100000);
      expect(afterTaxValue).toBeGreaterThan(70000); // Reasonable lower bound
    }
  });

  // === INPUT VALIDATION TESTS ===
  test('Required field validation', async ({ page }) => {
    // Try to calculate without required fields
    await page.click('#calculateButton');
    
    // Check if validation prevents calculation or shows errors
    const errorMessages = page.locator('#errorMessages');
    const isErrorVisible = await errorMessages.isVisible();
    
    if (isErrorVisible) {
      const errorText = await errorMessages.textContent();
      expect(errorText.toLowerCase()).toMatch(/required|missing|invalid/);
    }
    
    // Verify results section is not shown
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    expect(resultsVisible).toBeFalsy();
  });

  test('Numeric input validation and edge cases', async ({ page }) => {
    // Test negative target amount
    await page.fill('#targetAmount', '-1000');
    await page.fill('#timeHorizon', '10');
    await page.fill('#expectedReturn', '7');
    
    await page.click('#calculateButton');
    
    // Should show error or prevent calculation
    const errorVisible = await page.locator('#errorMessages').isVisible();
    if (errorVisible) {
      const errorText = await page.textContent('#errorMessages');
      expect(errorText.toLowerCase()).toMatch(/negative|invalid|positive/);
    }
    
    // Test extremely high return rate
    await page.fill('#targetAmount', '100000');
    await page.fill('#expectedReturn', '100'); // 100% return
    
    await page.click('#calculateButton');
    
    // Should handle extreme values gracefully
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    if (resultsVisible) {
      const contribution = await page.textContent('#requiredContribution');
      // Should still show a reasonable result or warning
      expect(contribution).not.toBe('--');
    }
  });

  test('Time horizon validation', async ({ page }) => {
    // Test zero time horizon
    await page.fill('#targetAmount', '50000');
    await page.fill('#timeHorizon', '0');
    await page.fill('#expectedReturn', '7');
    
    await page.click('#calculateButton');
    
    // Should prevent calculation or show error
    const errorVisible = await page.locator('#errorMessages').isVisible();
    const resultsVisible = await page.locator('#resultsSection').isVisible();
    
    if (errorVisible) {
      const errorText = await page.textContent('#errorMessages');
      expect(errorText.toLowerCase()).toMatch(/time|year|period|invalid/);
    } else {
      expect(resultsVisible).toBeFalsy();
    }
    
    // Test very long time horizon
    await page.fill('#timeHorizon', '100');
    await page.click('#calculateButton');
    
    // Should handle long timeframes (may show warning)
    if (await page.locator('#resultsSection').isVisible()) {
      const contribution = await page.textContent('#requiredContribution');
      expect(contribution).not.toBe('--');
    }
  });

  // === USER EXPERIENCE TESTS ===
  test('Reset functionality', async ({ page }) => {
    // Fill in form data
    await page.fill('#targetAmount', '75000');
    await page.fill('#timeHorizon', '8');
    await page.fill('#expectedReturn', '6.5');
    await page.fill('#initialInvestment', '2000');
    await page.fill('#inflationRate', '2.8');
    
    // Calculate to show results
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Reset form
    await page.click('#resetButton');
    
    // Verify all inputs are cleared
    await expect(page.locator('#targetAmount')).toHaveValue('');
    await expect(page.locator('#timeHorizon')).toHaveValue('');
    await expect(page.locator('#expectedReturn')).toHaveValue('');
    await expect(page.locator('#initialInvestment')).toHaveValue('');
    await expect(page.locator('#inflationRate')).toHaveValue('');
    
    // Verify results section is hidden
    await expect(page.locator('#resultsSection')).toBeHidden();
  });

  test('Form field placeholders and labels', async ({ page }) => {
    // Verify form has helpful placeholders
    await expect(page.locator('#targetAmount')).toHaveAttribute('placeholder', '100000');
    await expect(page.locator('#timeHorizon')).toHaveAttribute('placeholder', '10');
    await expect(page.locator('#expectedReturn')).toHaveAttribute('placeholder', '7');
    await expect(page.locator('#initialInvestment')).toHaveAttribute('placeholder', '5000');
    
    // Verify labels are present and descriptive
    await expect(page.locator('label[for="targetAmount"]')).toContainText('Target Goal Amount');
    await expect(page.locator('label[for="timeHorizon"]')).toContainText('Time to Reach Goal');
    await expect(page.locator('label[for="expectedReturn"]')).toContainText('Expected Annual Return');
  });

  test('Results display formatting', async ({ page }) => {
    // Calculate with known values
    await page.fill('#targetAmount', '100000');
    await page.fill('#timeHorizon', '10');
    await page.fill('#expectedReturn', '7');
    await page.fill('#initialInvestment', '5000');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    // Check currency formatting
    const requiredContribution = await page.textContent('#requiredContribution');
    const totalContributions = await page.textContent('#totalContributions');
    const finalAmount = await page.textContent('#finalAmount');
    
    // Should contain dollar signs and proper formatting
    expect(requiredContribution).toMatch(/\$.*\d/);
    expect(totalContributions).toMatch(/\$.*\d/);
    expect(finalAmount).toMatch(/\$.*\d/);
    
    // Check for comma separators in large numbers
    if (parseFloat(totalContributions.replace(/[$,]/g, '')) >= 1000) {
      expect(totalContributions).toMatch(/,/);
    }
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
    expect(softwareApp.name).toBe('Investment Goal Calculator');
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
    
    // Verify breadcrumb links
    await expect(page.locator('.breadcrumbs a[href="/"]')).toContainText('Home');
    await expect(page.locator('.breadcrumbs a[href="/finance/"]')).toContainText('Finance');
    await expect(page.locator('.breadcrumbs a[href="/finance/investment/"]')).toContainText('Investment');
    await expect(page.locator('.breadcrumbs .current')).toContainText('Investment Goal Calculator');
    
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
    
    // Test navigation to other finance categories
    await page.click('.navigation-ribbon a[href="/finance/mortgage/"]');
    await expect(page).toHaveURL(/.*\/finance\/mortgage\/$/);
  });

  test('FAQ section functionality', async ({ page }) => {
    // Check if FAQ section exists
    const faqSection = page.locator('.faq-section, .faq-container, #faq');
    if (await faqSection.isVisible()) {
      // Test FAQ accordion functionality
      const faqQuestions = page.locator('.faq-question, .faq-item');
      const questionCount = await faqQuestions.count();
      
      if (questionCount > 0) {
        // Click first FAQ question
        await faqQuestions.first().click();
        
        // Verify answer becomes visible
        const firstAnswer = page.locator('.faq-answer').first();
        await expect(firstAnswer).toBeVisible();
      }
    }
  });

  // === EDGE CASES AND ERROR HANDLING ===
  test('Handle zero initial investment', async ({ page }) => {
    await page.fill('#targetAmount', '25000');
    await page.fill('#timeHorizon', '5');
    await page.fill('#expectedReturn', '8');
    await page.fill('#initialInvestment', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const contribution = await page.textContent('#requiredContribution');
    expect(contribution).not.toBe('--');
    
    // With zero initial investment, required contribution should be higher
    const monthlyPayment = parseFloat(contribution.replace(/[$,]/g, ''));
    expect(monthlyPayment).toBeGreaterThan(0);
  });

  test('Handle very small target amounts', async ({ page }) => {
    await page.fill('#targetAmount', '100'); // $100 target
    await page.fill('#timeHorizon', '1');
    await page.fill('#expectedReturn', '5');
    await page.fill('#initialInvestment', '0');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const contribution = await page.textContent('#requiredContribution');
    const monthlyPayment = parseFloat(contribution.replace(/[$,]/g, ''));
    
    // Should be less than $10/month for $100 goal in 1 year
    expect(monthlyPayment).toBeLessThan(10);
    expect(monthlyPayment).toBeGreaterThan(0);
  });

  test('Handle large target amounts', async ({ page }) => {
    await page.fill('#targetAmount', '10000000'); // $10 million target
    await page.fill('#timeHorizon', '30');
    await page.fill('#expectedReturn', '7');
    await page.fill('#initialInvestment', '50000');
    
    await page.click('#calculateButton');
    await expect(page.locator('#resultsSection')).toBeVisible();
    
    const contribution = await page.textContent('#requiredContribution');
    const finalAmount = await page.textContent('#finalAmount');
    
    // Should handle large numbers without breaking
    expect(contribution).not.toBe('--');
    expect(finalAmount).toMatch(/10.*million|10,000,000/i);
  });
});