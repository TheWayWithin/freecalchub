const { test, expect } = require('@playwright/test');

// Test data for each calculator with specific field IDs
const testData = {
  investmentGoal: {
    url: '/finance/investment/investment-goal-calculator/',
    inputs: {
      targetAmount: '10000',
      timeHorizon: '5',
      expectedReturn: '7'
    },
    buttonId: 'calculateButton'
  },
  portfolioReturn: {
    url: '/finance/investment/portfolio-return-calculator/',
    inputs: {
      portfolioValue: '100000',
      stocks_allocation: '60',
      bonds_allocation: '30'
    },
    buttonId: 'calculateButton'
  },
  drip: {
    url: '/finance/investment/drip-calculator/',
    inputs: {
      initialInvestment: '10000',
      sharePrice: '50',
      annualDividend: '2.50'
    },
    buttonId: 'calculateButton'
  }
};

// Helper function to measure page load time
async function measurePageLoadTime(page, url) {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  return loadTime;
}

test.describe('Investment Calculators - Priority Testing', () => {
  
  test('Investment Goal Calculator - Basic Functionality', async ({ page }) => {
    const calculator = testData.investmentGoal;
    
    // Measure load time
    const loadTime = await measurePageLoadTime(page, calculator.url);
    console.log(`Investment Goal Calculator load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
    
    // Check page loads successfully
    expect(page.url()).toContain(calculator.url);
    
    // Verify calculator form is visible
    await expect(page.locator('form, .calculator-form, #calculator')).toBeVisible();
    
    // Fill in test data using specific IDs
    await page.locator('#targetAmount').fill(calculator.inputs.targetAmount);
    await page.locator('#timeHorizon').fill(calculator.inputs.timeHorizon);
    await page.locator('#expectedReturn').fill(calculator.inputs.expectedReturn);
    
    // Trigger calculation
    await page.locator(`#${calculator.buttonId}`).click();
    
    // Verify results appear
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Investment Goal Calculator: Basic functionality working');
  });

  test('Portfolio Return Calculator - Basic Functionality', async ({ page }) => {
    const calculator = testData.portfolioReturn;
    
    // Measure load time
    const loadTime = await measurePageLoadTime(page, calculator.url);
    console.log(`Portfolio Return Calculator load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
    
    // Check page loads successfully
    expect(page.url()).toContain(calculator.url);
    
    // Verify calculator form is visible
    await expect(page.locator('form, .calculator-form, #calculator')).toBeVisible();
    
    // Fill in test data using specific IDs
    await page.locator('#portfolioValue').fill(calculator.inputs.portfolioValue);
    await page.locator('#stocks_allocation').fill(calculator.inputs.stocks_allocation);
    await page.locator('#bonds_allocation').fill(calculator.inputs.bonds_allocation);
    
    // Trigger calculation
    await page.locator(`#${calculator.buttonId}`).click();
    
    // Verify results appear
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Portfolio Return Calculator: Basic functionality working');
  });

  test('DRIP Calculator - Basic Functionality', async ({ page }) => {
    const calculator = testData.drip;
    
    // Measure load time
    const loadTime = await measurePageLoadTime(page, calculator.url);
    console.log(`DRIP Calculator load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
    
    // Check page loads successfully
    expect(page.url()).toContain(calculator.url);
    
    // Verify calculator form is visible
    await expect(page.locator('form, .calculator-form, #calculator')).toBeVisible();
    
    // Fill in test data using specific IDs
    await page.locator('#initialInvestment').fill(calculator.inputs.initialInvestment);
    await page.locator('#sharePrice').fill(calculator.inputs.sharePrice);
    await page.locator('#annualDividend').fill(calculator.inputs.annualDividend);
    
    // Trigger calculation
    await page.locator(`#${calculator.buttonId}`).click();
    
    // Verify results appear
    await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ DRIP Calculator: Basic functionality working');
  });

  test('Mobile Responsiveness Check - All Calculators', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    for (const [name, calculator] of Object.entries(testData)) {
      await page.goto(calculator.url);
      await page.waitForLoadState('networkidle');
      
      // Check that calculator form is still visible on mobile
      await expect(page.locator('form, .calculator-form, #calculator')).toBeVisible();
      
      // Check that input fields are accessible (not overlapping or cut off)
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        await expect(inputs.nth(i)).toBeVisible();
      }
      
      console.log(`✅ ${name}: Mobile layout working`);
    }
  });

  test('Performance Benchmark - All Calculators', async ({ page }) => {
    const performanceResults = {};
    
    for (const [name, calculator] of Object.entries(testData)) {
      const startTime = Date.now();
      await page.goto(calculator.url);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Check for calculator form
      await page.locator('form, .calculator-form, #calculator').waitFor();
      
      const totalTime = Date.now() - startTime;
      performanceResults[name] = totalTime;
      
      console.log(`${name} total load time: ${totalTime}ms`);
      
      // Performance expectation: under 5 seconds
      expect(totalTime).toBeLessThan(5000);
    }
    
    console.log('Performance Results:', performanceResults);
  });

  test('Critical Issues Detection - All Calculators', async ({ page }) => {
    const issues = [];
    
    for (const [name, calculator] of Object.entries(testData)) {
      try {
        await page.goto(calculator.url);
        await page.waitForLoadState('networkidle');
        
        // Check for critical JavaScript errors
        const errorLogs = [];
        page.on('pageerror', (error) => {
          errorLogs.push(error.message);
        });
        
        // Check if calculator form exists
        const calculatorForm = page.locator('form, .calculator-form, #calculator');
        if (!(await calculatorForm.isVisible())) {
          issues.push(`${name}: Calculator form not found`);
        }
        
        // Check for any major JavaScript errors after brief wait
        await page.waitForTimeout(2000);
        
        if (errorLogs.length > 0) {
          issues.push(`${name}: JavaScript errors detected - ${errorLogs.join(', ')}`);
        }
        
        console.log(`✅ ${name}: No critical issues detected`);
        
      } catch (error) {
        issues.push(`${name}: Failed to load - ${error.message}`);
      }
    }
    
    if (issues.length > 0) {
      console.log('🚨 Critical Issues Found:', issues);
      expect(issues).toHaveLength(0);
    }
  });

});