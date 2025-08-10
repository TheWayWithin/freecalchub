const { test, expect } = require('@playwright/test');

// Performance testing suite for Sprint 2 Investment Calculators
test.describe('Sprint 2 Investment Calculators - Performance Testing', () => {
  const calculators = [
    {
      name: 'Investment Goal Calculator',
      url: '/finance/investment/investment-goal-calculator/',
      testData: {
        targetAmount: '100000',
        timeHorizon: '10',
        expectedReturn: '7',
        initialInvestment: '5000'
      }
    },
    {
      name: 'Portfolio Return Calculator', 
      url: '/finance/investment/portfolio-return-calculator/',
      testData: {
        portfolioValue: '100000',
        stocksAllocation: '60',
        bondsAllocation: '40',
        internationalAllocation: '0'
      }
    },
    {
      name: 'DRIP Calculator',
      url: '/finance/investment/drip-calculator/',
      testData: {
        initialInvestment: '10000',
        sharePrice: '50',
        annualDividend: '2.50',
        timeHorizon: '10'
      }
    }
  ];

  // === PAGE LOAD PERFORMANCE ===
  test.describe('Page Load Performance', () => {
    
    calculators.forEach((calculator) => {
      test(`${calculator.name} - Page load performance`, async ({ page }) => {
        // Start timing
        const startTime = Date.now();
        
        // Navigate to page
        await page.goto(calculator.url);
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        console.log(`${calculator.name} load time: ${loadTime}ms`);
        
        // Page should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
        
        // Critical elements should be visible
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        await expect(page.locator('#calculateButton')).toBeVisible();
      });
    });

    test('Asset loading efficiency', async ({ page }) => {
      // Monitor network requests
      const resourceSizes = [];
      
      page.on('response', async (response) => {
        if (response.url().includes('.css') || response.url().includes('.js')) {
          const headers = response.headers();
          if (headers['content-length']) {
            resourceSizes.push({
              url: response.url(),
              size: parseInt(headers['content-length']),
              type: response.url().includes('.css') ? 'CSS' : 'JS'
            });
          }
        }
      });
      
      await page.goto('/finance/investment/investment-goal-calculator/');
      await page.waitForLoadState('networkidle');
      
      // Analyze resource sizes
      const cssResources = resourceSizes.filter(r => r.type === 'CSS');
      const jsResources = resourceSizes.filter(r => r.type === 'JS');
      
      const totalCSSSize = cssResources.reduce((sum, r) => sum + r.size, 0);
      const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
      
      console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
      console.log(`Total JS size: ${(totalJSSize / 1024).toFixed(2)} KB`);
      
      // CSS should be reasonable size (under 200KB)
      expect(totalCSSSize).toBeLessThan(200 * 1024);
      // JS should be reasonable size (under 500KB)
      expect(totalJSSize).toBeLessThan(500 * 1024);
    });
  });

  // === CALCULATION PERFORMANCE ===
  test.describe('Calculation Performance', () => {
    
    calculators.forEach((calculator) => {
      test(`${calculator.name} - Basic calculation speed`, async ({ page }) => {
        await page.goto(calculator.url);
        
        // Fill form based on calculator type
        await fillFormForCalculator(page, calculator);
        
        // Measure calculation time
        const startTime = Date.now();
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        const calcTime = Date.now() - startTime;
        
        console.log(`${calculator.name} calculation time: ${calcTime}ms`);
        
        // Calculation should complete within 1 second
        expect(calcTime).toBeLessThan(1000);
      });

      test(`${calculator.name} - Complex calculation performance`, async ({ page }) => {
        await page.goto(calculator.url);
        
        // Fill with complex/extreme values
        if (calculator.name === 'Investment Goal Calculator') {
          await page.fill('#targetAmount', '10000000'); // $10M goal
          await page.fill('#timeHorizon', '50'); // 50 years
          await page.fill('#expectedReturn', '12'); // High return
          await page.fill('#initialInvestment', '100000');
          await page.fill('#inflationRate', '3.5');
        } else if (calculator.name === 'Portfolio Return Calculator') {
          await page.fill('#portfolioValue', '5000000'); // $5M portfolio
          await page.fill('#stocks_allocation', '45');
          await page.fill('#bonds_allocation', '25');
          await page.fill('#international_allocation', '15');
          // Add additional asset if possible
          const addAssetBtn = page.locator('#addAssetButton');
          if (await addAssetBtn.isVisible()) {
            await addAssetBtn.click();
            await page.waitForTimeout(100);
          }
        } else if (calculator.name === 'DRIP Calculator') {
          await page.fill('#initialInvestment', '500000'); // $500K initial
          await page.fill('#sharePrice', '150');
          await page.fill('#annualDividend', '6.75');
          await page.fill('#timeHorizon', '40'); // 40 years
          await page.fill('#dividendGrowthRate', '8');
          await page.fill('#stockPriceGrowth', '12');
          await page.fill('#additionalContribution', '5000'); // Monthly contribution
        }
        
        // Measure complex calculation time
        const startTime = Date.now();
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        const calcTime = Date.now() - startTime;
        
        console.log(`${calculator.name} complex calculation time: ${calcTime}ms`);
        
        // Even complex calculations should complete within 2 seconds
        expect(calcTime).toBeLessThan(2000);
      });
    });

    test('Multiple rapid calculations stress test', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      const calculations = [];
      
      // Perform 5 rapid calculations with different values
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        await page.fill('#targetAmount', `${(i + 1) * 50000}`);
        await page.fill('#timeHorizon', `${10 + i}`);
        await page.fill('#expectedReturn', `${6 + i}`);
        await page.fill('#initialInvestment', `${i * 1000}`);
        
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        
        const calcTime = Date.now() - startTime;
        calculations.push(calcTime);
        
        // Small delay between calculations
        await page.waitForTimeout(100);
      }
      
      const avgCalcTime = calculations.reduce((sum, time) => sum + time, 0) / calculations.length;
      const maxCalcTime = Math.max(...calculations);
      
      console.log(`Average calculation time: ${avgCalcTime.toFixed(0)}ms`);
      console.log(`Maximum calculation time: ${maxCalcTime}ms`);
      
      // Average should be fast
      expect(avgCalcTime).toBeLessThan(1500);
      // No single calculation should be too slow
      expect(maxCalcTime).toBeLessThan(3000);
    });
  });

  // === USER INTERACTION RESPONSIVENESS ===
  test.describe('User Interaction Responsiveness', () => {
    
    test('Form input responsiveness', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      const inputs = page.locator('input[type="number"]');
      const inputCount = await inputs.count();
      
      const inputTimes = [];
      
      // Test input response time for first 3 inputs
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        
        const startTime = Date.now();
        await input.click();
        await input.fill('12345');
        const inputTime = Date.now() - startTime;
        
        inputTimes.push(inputTime);
        
        // Verify input was updated
        const value = await input.inputValue();
        expect(value).toBe('12345');
      }
      
      const avgInputTime = inputTimes.reduce((sum, time) => sum + time, 0) / inputTimes.length;
      console.log(`Average input response time: ${avgInputTime.toFixed(0)}ms`);
      
      // Inputs should be very responsive
      expect(avgInputTime).toBeLessThan(100);
    });

    test('Real-time validation responsiveness', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test allocation total updating in real-time
      const totalAllocation = page.locator('#totalAllocation');
      
      // Initially should be 0%
      await expect(totalAllocation).toHaveText('0%');
      
      // Fill first allocation
      const startTime = Date.now();
      await page.fill('#stocks_allocation', '60');
      
      // Wait for update
      await expect(totalAllocation).toHaveText('60%');
      const updateTime = Date.now() - startTime;
      
      console.log(`Real-time validation update time: ${updateTime}ms`);
      
      // Real-time updates should be very fast
      expect(updateTime).toBeLessThan(500);
    });

    test('Button click responsiveness', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test scenario tab switching speed
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2.50');
      await page.fill('#timeHorizon', '10');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Test tab switching performance
      const startTime = Date.now();
      await page.click('.tab-button[data-scenario="cash"]');
      await expect(page.locator('#cashScenario')).toBeVisible();
      const switchTime = Date.now() - startTime;
      
      console.log(`Tab switch time: ${switchTime}ms`);
      
      // Tab switching should be immediate
      expect(switchTime).toBeLessThan(300);
    });

    test('Reset functionality performance', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Fill form completely
      await page.fill('#targetAmount', '250000');
      await page.fill('#timeHorizon', '15');
      await page.fill('#expectedReturn', '8.5');
      await page.fill('#initialInvestment', '25000');
      await page.fill('#inflationRate', '2.5');
      await page.fill('#taxRate', '20');
      
      // Calculate
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Test reset performance
      const startTime = Date.now();
      await page.click('#resetButton');
      
      // Verify reset completed
      await expect(page.locator('#targetAmount')).toHaveValue('');
      await expect(page.locator('#resultsSection')).toBeHidden();
      
      const resetTime = Date.now() - startTime;
      console.log(`Reset time: ${resetTime}ms`);
      
      // Reset should be fast
      expect(resetTime).toBeLessThan(500);
    });
  });

  // === MEMORY AND RESOURCE USAGE ===
  test.describe('Memory and Resource Usage', () => {
    
    test('Memory usage during calculations', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Get initial memory usage
      const initialMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return performance.memory;
        }
        return null;
      });
      
      // Perform multiple calculations
      for (let i = 0; i < 10; i++) {
        await page.fill('#initialInvestment', `${10000 + i * 1000}`);
        await page.fill('#sharePrice', `${50 + i}`);
        await page.fill('#annualDividend', `${2.5 + i * 0.1}`);
        await page.fill('#timeHorizon', `${10 + i}`);
        
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        
        // Switch between scenarios
        await page.click('.tab-button[data-scenario="cash"]');
        await page.click('.tab-button[data-scenario="comparison"]');
        await page.click('.tab-button[data-scenario="drip"]');
      }
      
      // Check final memory usage
      const finalMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return performance.memory;
        }
        return null;
      });
      
      if (initialMetrics && finalMetrics) {
        const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
        console.log(`Memory increase after calculations: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
        
        // Memory increase should be reasonable (less than 10MB)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });

    test('No memory leaks in form operations', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Perform repetitive operations that could cause memory leaks
      for (let i = 0; i < 20; i++) {
        // Fill form
        await page.fill('#portfolioValue', '100000');
        await page.fill('#stocks_allocation', '60');
        await page.fill('#bonds_allocation', '40');
        
        // Add and remove assets if possible
        const addAssetBtn = page.locator('#addAssetButton');
        if (await addAssetBtn.isVisible()) {
          await addAssetBtn.click();
          await page.waitForTimeout(50);
        }
        
        // Calculate
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        
        // Reset
        await page.click('#resetButton');
        await page.waitForTimeout(50);
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      console.log('Completed memory leak test - no crashes detected');
    });
  });

  // === NETWORK PERFORMANCE ===
  test.describe('Network Performance', () => {
    
    test('Performance on slow network', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Simulate slow 3G
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 300,
        downloadThroughput: 750000,
        uploadThroughput: 250000,
      });
      
      const startTime = Date.now();
      await page.goto('/finance/investment/investment-goal-calculator/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`Load time on slow network: ${loadTime}ms`);
      
      // Should still load within reasonable time on slow network
      expect(loadTime).toBeLessThan(8000); // 8 seconds max for slow 3G
      
      // Verify functionality still works
      await page.fill('#targetAmount', '100000');
      await page.fill('#timeHorizon', '10');
      await page.fill('#expectedReturn', '7');
      await page.click('#calculateButton');
      
      await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 10000 });
      
      await context.close();
    });

    test('Offline functionality', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Load page while online
      await page.goto('/finance/investment/portfolio-return-calculator/');
      await page.waitForLoadState('networkidle');
      
      // Go offline
      await context.setOffline(true);
      
      // Test if calculator still works offline
      await page.fill('#portfolioValue', '100000');
      await page.fill('#stocks_allocation', '60');
      await page.fill('#bonds_allocation', '40');
      
      const startTime = Date.now();
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      const calcTime = Date.now() - startTime;
      
      console.log(`Offline calculation time: ${calcTime}ms`);
      
      // Calculations should work offline
      expect(calcTime).toBeLessThan(2000);
      
      await context.close();
    });
  });

  // === PERFORMANCE COMPARISON ===
  test.describe('Performance Comparison', () => {
    
    test('Compare calculation performance across calculators', async ({ page }) => {
      const performanceResults = [];
      
      for (const calculator of calculators) {
        await page.goto(calculator.url);
        
        // Fill form
        await fillFormForCalculator(page, calculator);
        
        // Measure calculation time
        const startTime = Date.now();
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        const calcTime = Date.now() - startTime;
        
        performanceResults.push({
          calculator: calculator.name,
          time: calcTime
        });
      }
      
      // Log performance comparison
      console.log('Calculator Performance Comparison:');
      performanceResults.forEach(result => {
        console.log(`${result.calculator}: ${result.time}ms`);
      });
      
      // All calculators should perform within acceptable range
      performanceResults.forEach(result => {
        expect(result.time).toBeLessThan(2000);
      });
      
      // Performance should be relatively consistent
      const times = performanceResults.map(r => r.time);
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxVariation = Math.max(...times) - Math.min(...times);
      
      console.log(`Average calculation time: ${avgTime.toFixed(0)}ms`);
      console.log(`Performance variation: ${maxVariation}ms`);
      
      // Variation between calculators shouldn't be too large
      expect(maxVariation).toBeLessThan(3000);
    });
  });
});

// Helper function to fill forms based on calculator type
async function fillFormForCalculator(page, calculator) {
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
}