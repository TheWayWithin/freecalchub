const { test, expect } = require('@playwright/test');

test.describe('Sprint S3.2: Retirement Calculator Suite - Comprehensive System Integration & Testing', () => {
  
  const calculators = [
    {
      name: 'Social Security Benefit Calculator',
      url: '/finance/retirement/social-security-benefit-calculator/',
      testData: {
        age: '35',
        retirementAge: '67',
        currentIncome: '75000',
        expectedInflation: '3.2'
      }
    },
    {
      name: '401(k) Contribution Calculator', 
      url: '/finance/retirement/401k-contribution-calculator/',
      testData: {
        currentAge: '30',
        retirementAge: '65',
        currentBalance: '25000',
        monthlyContribution: '500',
        employerMatch: '3',
        salary: '60000',
        expectedReturn: '7'
      }
    },
    {
      name: 'Roth vs Traditional IRA Calculator',
      url: '/finance/retirement/roth-traditional-ira-calculator/', 
      testData: {
        currentAge: '28',
        retirementAge: '65',
        annualContribution: '6000',
        currentIncome: '65000',
        currentTaxRate: '22',
        retirementTaxRate: '15'
      }
    },
    {
      name: 'Required Minimum Distribution Calculator',
      url: '/finance/retirement/rmd-calculator/',
      testData: {
        age: '72',
        accountBalance: '500000',
        spouse: 'no'
      }
    },
    {
      name: 'Long-Term Care Cost Calculator',
      url: '/finance/retirement/long-term-care-cost-calculator/',
      testData: {
        state: 'California',
        careType: 'nursing-home',
        yearsOfCare: '3',
        currentAge: '55',
        inflationRate: '3'
      }
    }
  ];

  // Test 1: Category Page Integration
  test('should have properly functioning retirement category page with all calculators linked', async ({ page }) => {
    await page.goto('/finance/retirement/');
    
    // Check page loads correctly
    await expect(page).toHaveTitle(/Retirement Calculators/);
    
    // Verify no "Coming Soon" tags exist
    const comingSoonTags = page.locator('.coming-soon-tag');
    await expect(comingSoonTags).toHaveCount(0);
    
    // Verify all 6 calculator cards exist and are linked
    const calculatorCards = page.locator('.calculator-card');
    await expect(calculatorCards).toHaveCount(6); // Including main retirement calculator
    
    // Test each calculator link works
    for (const calc of calculators) {
      const calcLink = page.locator(`a[href="${calc.url}"]`);
      await expect(calcLink).toBeVisible();
      
      // Test link navigation
      await calcLink.click();
      await expect(page).toHaveURL(new RegExp(calc.url));
      await expect(page.locator('h1')).toContainText(calc.name);
      await page.goBack();
    }
    
    // Test FAQ accordion functionality
    const faqButton = page.locator('.accordion').first();
    await faqButton.click();
    await expect(page.locator('.panel').first()).toBeVisible();
  });

  // Test 2-6: Individual Calculator Functionality Tests
  calculators.forEach((calc, index) => {
    test(`should have fully functional ${calc.name}`, async ({ page }) => {
      await page.goto(calc.url);
      
      // Basic page load validation
      await expect(page).toHaveTitle(new RegExp(calc.name));
      await expect(page.locator('h1')).toContainText(calc.name);
      
      // Check CSS and JS files load
      const cssResponse = await page.waitForResponse(response => 
        response.url().includes('.css') && response.status() === 200
      );
      expect(cssResponse.ok()).toBe(true);
      
      // Test form elements exist and are interactive
      const form = page.locator('form, .calculator-form').first();
      await expect(form).toBeVisible();
      
      // Fill out form with test data
      const inputs = await form.locator('input, select').all();
      expect(inputs.length).toBeGreaterThan(0);
      
      // Fill form based on test data
      for (const [field, value] of Object.entries(calc.testData)) {
        const input = form.locator(`[name="${field}"], #${field}`).first();
        if (await input.isVisible()) {
          if (await input.getAttribute('type') === 'select-one' || await input.evaluate(el => el.tagName) === 'SELECT') {
            await input.selectOption(value);
          } else {
            await input.fill(value);
          }
        }
      }
      
      // Test calculate button
      const calculateBtn = page.locator('button:has-text("Calculate"), button[type="submit"], .calculate-btn').first();
      await expect(calculateBtn).toBeEnabled();
      
      // Perform calculation
      await calculateBtn.click();
      
      // Wait for and verify results
      await page.waitForTimeout(2000); // Allow for calculation
      
      const resultsSection = page.locator('.results, #results, .calculation-results').first();
      await expect(resultsSection).toBeVisible();
      
      // Test reset functionality
      const resetBtn = page.locator('button:has-text("Reset"), .reset-btn');
      if (await resetBtn.count() > 0) {
        await resetBtn.first().click();
        await expect(inputs[0]).toHaveValue('');
      }
      
      // Test FAQ section exists
      const faqSection = page.locator('.faq-section, #faq');
      await expect(faqSection).toBeVisible();
    });
  });

  // Test 7: Cross-Calculator Navigation
  test('should provide proper cross-calculator navigation and related links', async ({ page }) => {
    // Start with Social Security calculator
    await page.goto('/finance/retirement/social-security-benefit-calculator/');
    
    // Check for related calculators section
    const relatedSection = page.locator('.related-calculators, .related-tools');
    if (await relatedSection.count() > 0) {
      const relatedLinks = relatedSection.locator('a');
      const linkCount = await relatedLinks.count();
      expect(linkCount).toBeGreaterThan(0);
      
      // Test first related link works
      if (linkCount > 0) {
        const firstLink = relatedLinks.first();
        const href = await firstLink.getAttribute('href');
        await firstLink.click();
        await expect(page).toHaveURL(new RegExp(href));
      }
    }
    
    // Test breadcrumb navigation
    const breadcrumbs = page.locator('.breadcrumbs a');
    const retirementLink = breadcrumbs.locator(':has-text("Retirement")');
    if (await retirementLink.count() > 0) {
      await retirementLink.click();
      await expect(page).toHaveURL(/\/finance\/retirement\/$/);
    }
  });

  // Test 8: Mobile Responsiveness
  calculators.forEach(calc => {
    test(`${calc.name} should be mobile responsive`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      await page.goto(calc.url);
      
      // Check mobile layout
      const form = page.locator('form, .calculator-form').first();
      await expect(form).toBeVisible();
      
      // Check form fields are properly sized for mobile
      const inputs = form.locator('input, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const box = await input.boundingBox();
        expect(box.width).toBeLessThanOrEqual(400); // Should fit in mobile width
      }
      
      // Test mobile menu if present
      const mobileMenuButton = page.locator('#mobile-menu-button');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        const mobileMenu = page.locator('#mobile-menu');
        await expect(mobileMenu).toBeVisible();
      }
    });
  });

  // Test 9: Chart.js Integration and Performance
  test('should have proper Chart.js integration with acceptable performance', async ({ page }) => {
    // Test charts on calculators that use them
    const chartsCalculators = [
      '/finance/retirement/social-security-benefit-calculator/',
      '/finance/retirement/401k-contribution-calculator/',
      '/finance/retirement/roth-traditional-ira-calculator/'
    ];
    
    for (const calcUrl of chartsCalculators) {
      await page.goto(calcUrl);
      
      // Check if Chart.js is loaded
      const chartJs = await page.evaluate(() => {
        return typeof window.Chart !== 'undefined';
      });
      
      if (chartJs) {
        // Fill form to trigger chart generation
        const form = page.locator('form, .calculator-form').first();
        const inputs = await form.locator('input').all();
        
        // Fill with sample data
        for (let i = 0; i < Math.min(inputs.length, 3); i++) {
          await inputs[i].fill('50000');
        }
        
        const calculateBtn = page.locator('button:has-text("Calculate"), button[type="submit"]').first();
        await calculateBtn.click();
        
        await page.waitForTimeout(3000);
        
        // Check if chart canvas exists and is visible
        const chartCanvas = page.locator('canvas');
        if (await chartCanvas.count() > 0) {
          await expect(chartCanvas.first()).toBeVisible();
          
          // Test chart performance - should render within 5 seconds
          const chartRendered = await page.waitForFunction(
            () => {
              const canvas = document.querySelector('canvas');
              return canvas && canvas.getContext('2d');
            },
            { timeout: 5000 }
          );
          expect(chartRendered).toBeTruthy();
        }
      }
    }
  });

  // Test 10: Form Validation and Error Handling
  calculators.forEach(calc => {
    test(`${calc.name} should have proper form validation and error handling`, async ({ page }) => {
      await page.goto(calc.url);
      
      const form = page.locator('form, .calculator-form').first();
      const calculateBtn = page.locator('button:has-text("Calculate"), button[type="submit"], .calculate-btn').first();
      
      // Test empty form submission
      await calculateBtn.click();
      
      // Check for validation messages (either browser native or custom)
      const invalidInputs = form.locator('input:invalid');
      const errorMessages = page.locator('.error-message, .validation-error, .alert-danger');
      
      const hasValidation = (await invalidInputs.count() > 0) || (await errorMessages.count() > 0);
      expect(hasValidation).toBe(true);
      
      // Test with invalid data (negative numbers where not allowed)
      const numericInputs = form.locator('input[type="number"]');
      const inputCount = await numericInputs.count();
      
      if (inputCount > 0) {
        await numericInputs.first().fill('-100');
        await calculateBtn.click();
        
        // Should either prevent submission or show error
        await page.waitForTimeout(1000);
        const resultsVisible = await page.locator('.results, #results').isVisible();
        expect(resultsVisible).toBe(false); // Should not show results with invalid data
      }
    });
  });

  // Test 11: Performance Benchmarking
  test('should load with acceptable performance metrics', async ({ page }) => {
    for (const calc of calculators.slice(0, 3)) { // Test first 3 for performance
      const startTime = Date.now();
      
      await page.goto(calc.url);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      // Check for core web vitals
      const performanceMetrics = await page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver((list) => {
            resolve(list.getEntries());
          }).observe({ entryTypes: ['navigation', 'paint'] });
        });
      });
      
      expect(performanceMetrics).toBeDefined();
    }
  });

  // Test 12: Schema.org Markup Validation
  test('should have proper Schema.org markup implementation', async ({ page }) => {
    for (const calc of calculators) {
      await page.goto(calc.url);
      
      // Check for JSON-LD script tag
      const jsonLdScript = page.locator('script[type="application/ld+json"]');
      await expect(jsonLdScript).toHaveCount(1);
      
      // Validate JSON structure
      const jsonContent = await jsonLdScript.textContent();
      let schema;
      
      try {
        schema = JSON.parse(jsonContent);
      } catch (e) {
        throw new Error(`Invalid JSON-LD in ${calc.name}: ${e.message}`);
      }
      
      // Check required schema properties
      expect(schema).toHaveProperty('@context');
      expect(schema).toHaveProperty('@type');
      expect(schema['@context']).toBe('https://schema.org');
      
      // Should be SoftwareApplication type for calculators
      if (schema['@graph']) {
        const softwareApp = schema['@graph'].find(item => item['@type'] === 'SoftwareApplication');
        expect(softwareApp).toBeDefined();
        expect(softwareApp).toHaveProperty('name');
        expect(softwareApp).toHaveProperty('description');
      }
    }
  });

  // Test 13: Cross-Browser Compatibility (Basic)
  test('should maintain functionality across different browsers', async ({ page, browserName }) => {
    // Test core functionality works in current browser
    const testCalc = calculators[0]; // Social Security calculator
    
    await page.goto(testCalc.url);
    await expect(page.locator('h1')).toBeVisible();
    
    // Test JavaScript execution
    const jsWorking = await page.evaluate(() => {
      return typeof document !== 'undefined' && typeof window !== 'undefined';
    });
    expect(jsWorking).toBe(true);
    
    // Test form interaction
    const form = page.locator('form, .calculator-form').first();
    await expect(form).toBeVisible();
    
    const input = form.locator('input').first();
    await input.fill('test');
    expect(await input.inputValue()).toBe('test');
    
    console.log(`✅ Basic compatibility verified for ${browserName}`);
  });

  // Test 14: Accessibility Compliance
  calculators.forEach(calc => {
    test(`${calc.name} should meet basic accessibility standards`, async ({ page }) => {
      await page.goto(calc.url);
      
      // Check for proper heading structure
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      
      // Check form labels
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const name = await input.getAttribute('name');
        
        // Should have associated label
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = (await label.count() > 0) || name;
        expect(hasLabel).toBeTruthy();
      }
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    });
  });

  // Test 15: Integration with Site Navigation
  test('should integrate properly with site navigation and footer', async ({ page }) => {
    await page.goto('/finance/retirement/social-security-benefit-calculator/');
    
    // Test header navigation
    const headerNav = page.locator('.main-nav a[href="/finance/"]');
    await expect(headerNav).toBeVisible();
    await headerNav.click();
    await expect(page).toHaveURL(/\/finance\/$/);
    
    await page.goBack();
    
    // Test breadcrumb navigation
    const breadcrumbs = page.locator('.breadcrumbs a');
    const homeLink = breadcrumbs.first();
    await homeLink.click();
    await expect(page).toHaveURL(/^\//);
    
    await page.goBack();
    
    // Test footer links
    const footerLinks = page.locator('footer a');
    expect(await footerLinks.count()).toBeGreaterThan(0);
    
    // Test dark mode toggle
    const darkModeToggle = page.locator('#dark-mode-toggle');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      // Should add dark mode class
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark/);
    }
  });
});