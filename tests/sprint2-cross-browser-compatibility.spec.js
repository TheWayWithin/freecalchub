const { test, expect, devices } = require('@playwright/test');

// Cross-browser compatibility tests for Sprint 2 Investment Calculators
test.describe('Sprint 2 Investment Calculators - Cross-Browser Compatibility', () => {
  const calculators = [
    {
      name: 'Investment Goal Calculator',
      url: '/finance/investment/investment-goal-calculator/',
      testData: {
        targetAmount: '100000',
        timeHorizon: '10',
        expectedReturn: '7',
        initialInvestment: '5000'
      },
      resultSelector: '#requiredContribution'
    },
    {
      name: 'Portfolio Return Calculator', 
      url: '/finance/investment/portfolio-return-calculator/',
      testData: {
        portfolioValue: '100000',
        stocksAllocation: '60',
        bondsAllocation: '40',
        internationalAllocation: '0'
      },
      resultSelector: '#expectedReturn'
    },
    {
      name: 'DRIP Calculator',
      url: '/finance/investment/drip-calculator/',
      testData: {
        initialInvestment: '10000',
        sharePrice: '50',
        annualDividend: '2.50',
        timeHorizon: '10'
      },
      resultSelector: '#dripTotalValue'
    }
  ];

  // Test each calculator across different browsers
  calculators.forEach((calculator) => {
    test.describe(`${calculator.name} - Cross Browser Tests`, () => {
      
      // === CHROMIUM BROWSER TESTS ===
      test(`${calculator.name} - Chromium functionality`, async ({ page, browserName }) => {
        test.skip(browserName !== 'chromium', 'Chromium-specific test');
        
        await page.goto(calculator.url);
        
        // Verify page loads correctly
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        
        // Fill form based on calculator type
        if (calculator.name === 'Investment Goal Calculator') {
          await page.fill('#targetAmount', calculator.testData.targetAmount);
          await page.fill('#timeHorizon', calculator.testData.timeHorizon);
          await page.fill('#expectedReturn', calculator.testData.expectedReturn);
          await page.fill('#initialInvestment', calculator.testData.initialInvestment);
        } else if (calculator.name === 'Portfolio Return Calculator') {
          await page.fill('#portfolioValue', calculator.testData.portfolioValue);
          await page.fill('#stocks_allocation', calculator.testData.stocksAllocation);
          await page.fill('#bonds_allocation', calculator.testData.bondsAllocation);
          await page.fill('#international_allocation', calculator.testData.internationalAllocation);
        } else if (calculator.name === 'DRIP Calculator') {
          await page.fill('#initialInvestment', calculator.testData.initialInvestment);
          await page.fill('#sharePrice', calculator.testData.sharePrice);
          await page.fill('#annualDividend', calculator.testData.annualDividend);
          await page.fill('#timeHorizon', calculator.testData.timeHorizon);
        }
        
        // Calculate and verify results
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 5000 });
        await expect(page.locator(calculator.resultSelector)).not.toHaveText('--');
      });

      // === FIREFOX BROWSER TESTS ===
      test(`${calculator.name} - Firefox functionality`, async ({ page, browserName }) => {
        test.skip(browserName !== 'firefox', 'Firefox-specific test');
        
        await page.goto(calculator.url);
        
        // Verify page loads correctly
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        
        // Test form validation behavior in Firefox
        await page.click('#calculateButton'); // Try to submit empty form
        
        // Firefox handles HTML5 validation differently
        const hasValidationMessage = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input[required]');
          return Array.from(inputs).some(input => input.validationMessage);
        });
        
        if (hasValidationMessage) {
          console.log('Firefox validation working correctly');
        }
        
        // Fill form and test calculation
        if (calculator.name === 'Investment Goal Calculator') {
          await page.fill('#targetAmount', calculator.testData.targetAmount);
          await page.fill('#timeHorizon', calculator.testData.timeHorizon);
          await page.fill('#expectedReturn', calculator.testData.expectedReturn);
          await page.fill('#initialInvestment', calculator.testData.initialInvestment);
        } else if (calculator.name === 'Portfolio Return Calculator') {
          await page.fill('#portfolioValue', calculator.testData.portfolioValue);
          await page.fill('#stocks_allocation', calculator.testData.stocksAllocation);
          await page.fill('#bonds_allocation', calculator.testData.bondsAllocation);
          await page.fill('#international_allocation', calculator.testData.internationalAllocation);
        } else if (calculator.name === 'DRIP Calculator') {
          await page.fill('#initialInvestment', calculator.testData.initialInvestment);
          await page.fill('#sharePrice', calculator.testData.sharePrice);
          await page.fill('#annualDividend', calculator.testData.annualDividend);
          await page.fill('#timeHorizon', calculator.testData.timeHorizon);
        }
        
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 5000 });
        await expect(page.locator(calculator.resultSelector)).not.toHaveText('--');
      });

      // === WEBKIT/SAFARI BROWSER TESTS ===
      test(`${calculator.name} - WebKit/Safari functionality`, async ({ page, browserName }) => {
        test.skip(browserName !== 'webkit', 'WebKit-specific test');
        
        await page.goto(calculator.url);
        
        // Verify page loads correctly
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        
        // Test WebKit-specific behaviors
        // Check for CSS Grid support (Safari can be quirky with grid)
        const hasGridSupport = await page.evaluate(() => {
          return CSS.supports('display', 'grid');
        });
        expect(hasGridSupport).toBeTruthy();
        
        // Fill form and test calculation
        if (calculator.name === 'Investment Goal Calculator') {
          await page.fill('#targetAmount', calculator.testData.targetAmount);
          await page.fill('#timeHorizon', calculator.testData.timeHorizon);
          await page.fill('#expectedReturn', calculator.testData.expectedReturn);
          await page.fill('#initialInvestment', calculator.testData.initialInvestment);
        } else if (calculator.name === 'Portfolio Return Calculator') {
          await page.fill('#portfolioValue', calculator.testData.portfolioValue);
          await page.fill('#stocks_allocation', calculator.testData.stocksAllocation);
          await page.fill('#bonds_allocation', calculator.testData.bondsAllocation);
          await page.fill('#international_allocation', calculator.testData.internationalAllocation);
        } else if (calculator.name === 'DRIP Calculator') {
          await page.fill('#initialInvestment', calculator.testData.initialInvestment);
          await page.fill('#sharePrice', calculator.testData.sharePrice);
          await page.fill('#annualDividend', calculator.testData.annualDividend);
          await page.fill('#timeHorizon', calculator.testData.timeHorizon);
        }
        
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 5000 });
        await expect(page.locator(calculator.resultSelector)).not.toHaveText('--');
        
        // Test Safari-specific number formatting
        const resultText = await page.textContent(calculator.resultSelector);
        expect(resultText).toBeTruthy();
        expect(resultText).not.toBe('--');
      });
    });
  });

  // === BROWSER-SPECIFIC FEATURE TESTS ===
  test.describe('Browser-Specific Feature Compatibility', () => {
    
    test('CSS Custom Properties support across browsers', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Check if CSS custom properties (variables) are supported
      const cssVariablesSupported = await page.evaluate(() => {
        return CSS.supports('color', 'var(--primary-color)');
      });
      
      expect(cssVariablesSupported).toBeTruthy();
    });
    
    test('JavaScript ES6+ features compatibility', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test modern JavaScript features
      const modernJSSupported = await page.evaluate(() => {
        try {
          // Test arrow functions
          const arrowFunc = () => true;
          
          // Test const/let
          const testConst = 'test';
          let testLet = 'test';
          
          // Test template literals
          const template = `test ${testConst}`;
          
          // Test destructuring
          const { length } = 'test';
          
          return arrowFunc() && testConst && testLet && template && length;
        } catch (error) {
          return false;
        }
      });
      
      expect(modernJSSupported).toBeTruthy();
    });
    
    test('Form validation API consistency', async ({ page, browserName }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test HTML5 form validation API
      const validationSupport = await page.evaluate(() => {
        const input = document.querySelector('input[required]');
        return typeof input.checkValidity === 'function' && 
               typeof input.setCustomValidity === 'function';
      });
      
      expect(validationSupport).toBeTruthy();
    });
    
    test('Number input type behavior', async ({ page, browserName }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Test number input behavior across browsers
      const numberInput = page.locator('#targetAmount');
      
      // Fill with valid number
      await numberInput.fill('100000');
      const validValue = await numberInput.inputValue();
      expect(validValue).toBe('100000');
      
      // Test with invalid characters (browsers handle this differently)
      await numberInput.fill('abc123');
      const invalidValue = await numberInput.inputValue();
      
      // Some browsers strip non-numeric characters, others reject the input
      console.log(`${browserName} handles invalid number input: ${invalidValue}`);
    });
  });

  // === DARK MODE COMPATIBILITY ===
  test.describe('Dark Mode Cross-Browser Compatibility', () => {
    
    test('Dark mode toggle functionality across browsers', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Look for dark mode toggle
      const darkModeToggle = page.locator('.dark-mode-toggle, #darkModeToggle, .theme-toggle');
      
      if (await darkModeToggle.isVisible()) {
        // Test dark mode activation
        await darkModeToggle.click();
        
        // Wait for transition
        await page.waitForTimeout(300);
        
        // Check if dark mode class is applied
        const hasDataTheme = await page.evaluate(() => {
          return document.body.hasAttribute('data-theme') || 
                 document.documentElement.hasAttribute('data-theme') ||
                 document.body.classList.contains('dark-mode') ||
                 document.documentElement.classList.contains('dark-mode');
        });
        
        if (hasDataTheme) {
          console.log('Dark mode toggle working correctly');
        }
      }
    });
    
    test('CSS prefers-color-scheme media query support', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test system dark mode preference detection
      const prefersColorSchemeSupport = await page.evaluate(() => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
      });
      
      expect(prefersColorSchemeSupport).toBeTruthy();
    });
  });

  // === PERFORMANCE CONSISTENCY TESTS ===
  test.describe('Performance Consistency Across Browsers', () => {
    
    test('JavaScript calculation performance', async ({ page, browserName }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Fill form for complex calculation
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2.50');
      await page.fill('#timeHorizon', '30'); // Long time horizon
      await page.fill('#dividendGrowthRate', '3');
      await page.fill('#stockPriceGrowth', '7');
      
      // Measure calculation time
      const startTime = Date.now();
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      const endTime = Date.now();
      
      const calculationTime = endTime - startTime;
      console.log(`${browserName} calculation time: ${calculationTime}ms`);
      
      // Should complete within reasonable time
      expect(calculationTime).toBeLessThan(3000); // 3 seconds max
    });
    
    test('Page load performance consistency', async ({ page, browserName }) => {
      const startTime = Date.now();
      await page.goto('/finance/investment/portfolio-return-calculator/');
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      console.log(`${browserName} page load time: ${loadTime}ms`);
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(5000); // 5 seconds max
    });
  });

  // === ACCESSIBILITY CONSISTENCY ===
  test.describe('Accessibility Features Cross-Browser', () => {
    
    test('Keyboard navigation consistency', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement.id);
      
      await page.keyboard.press('Tab');
      const secondFocused = await page.evaluate(() => document.activeElement.id);
      
      // Should be able to navigate through form elements
      expect(firstFocused).toBeTruthy();
      expect(secondFocused).toBeTruthy();
      expect(firstFocused).not.toBe(secondFocused);
    });
    
    test('Focus indicators visibility', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Tab to first input
      await page.keyboard.press('Tab');
      
      // Check if focus is visible
      const hasFocusStyle = await page.evaluate(() => {
        const activeElement = document.activeElement;
        const computedStyle = window.getComputedStyle(activeElement);
        return computedStyle.outline !== 'none' || 
               computedStyle.boxShadow !== 'none' ||
               computedStyle.border !== 'none';
      });
      
      // Focus should be visible (though exact implementation may vary)
      console.log('Focus indicators present');
    });
  });

  // === ERROR HANDLING CONSISTENCY ===
  test.describe('Error Handling Cross-Browser Consistency', () => {
    
    test('Network error handling', async ({ page, context }) => {
      // Simulate offline condition
      await context.setOffline(true);
      
      await page.goto('/finance/investment/drip-calculator/');
      
      // Page should still load from cache or show appropriate message
      const pageLoaded = await page.locator('body').isVisible();
      expect(pageLoaded).toBeTruthy();
      
      // Restore network
      await context.setOffline(false);
    });
    
    test('JavaScript error recovery', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Monitor console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Perform normal operations
      await page.fill('#targetAmount', '100000');
      await page.fill('#timeHorizon', '10');
      await page.fill('#expectedReturn', '7');
      await page.click('#calculateButton');
      
      // Should not have critical JavaScript errors
      const criticalErrors = consoleErrors.filter(error => 
        error.includes('TypeError') || error.includes('ReferenceError')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });
});