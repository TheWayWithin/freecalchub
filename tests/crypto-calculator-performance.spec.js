const { test, expect } = require('@playwright/test');

test.describe('Crypto Profit/Loss Calculator - Performance Testing', () => {
  const calculatorUrl = '/finance/cryptocurrency/crypto-profit-calculator/';

  test('Page load performance metrics', async ({ page }) => {
    // Start timing
    const startTime = Date.now();
    
    // Navigate to the page
    await page.goto(calculatorUrl);
    
    // Wait for the calculator to be visible
    await expect(page.locator('.calculator-container, .calculator-form, #calculator')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time (5 seconds max)
    expect(loadTime).toBeLessThan(5000);
    console.log(`Page load time: ${loadTime}ms`);
    
    // Check for basic interactive elements
    await expect(page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]')).toBeVisible();
  });

  test('CSS and JS assets load properly', async ({ page }) => {
    const failedRequests = [];
    const loadedAssets = [];
    
    // Listen for network events
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('.css') || url.includes('.js')) {
        loadedAssets.push({ url, status });
        
        if (status >= 400) {
          failedRequests.push({ url, status });
        }
      }
    });
    
    await page.goto(calculatorUrl);
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that no critical assets failed to load
    expect(failedRequests.length).toBe(0);
    
    // Should have loaded some CSS/JS assets
    expect(loadedAssets.length).toBeGreaterThan(0);
    
    console.log(`Loaded ${loadedAssets.length} CSS/JS assets`);
    failedRequests.forEach(req => {
      console.error(`Failed to load: ${req.url} (Status: ${req.status})`);
    });
  });

  test('Calculation performance with multiple operations', async ({ page }) => {
    await page.goto(calculatorUrl);
    
    // Fill in basic trade data
    await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '100');
    await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '10');
    await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '150');
    
    // Measure calculation time
    const calculateButton = page.locator('button:has-text("Calculate"), input[type="button"][value*="Calculate"]');
    
    if (await calculateButton.isVisible()) {
      const startTime = Date.now();
      
      await calculateButton.click();
      
      // Wait for results to appear
      await page.waitForTimeout(100); // Give minimum time for calculation
      
      const calculationTime = Date.now() - startTime;
      
      // Calculation should be near-instantaneous (under 1 second)
      expect(calculationTime).toBeLessThan(1000);
      console.log(`Calculation time: ${calculationTime}ms`);
    }
    
    // Test multiple rapid calculations
    for (let i = 0; i < 5; i++) {
      await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', String(100 + i * 10));
      
      if (await calculateButton.isVisible()) {
        const rapidStartTime = Date.now();
        await calculateButton.click();
        await page.waitForTimeout(50);
        const rapidCalcTime = Date.now() - rapidStartTime;
        
        expect(rapidCalcTime).toBeLessThan(500); // Should handle rapid calculations
      }
    }
  });

  test('Memory usage with multiple trades', async ({ page }) => {
    await page.goto(calculatorUrl);
    
    // Get initial page metrics
    const initialMetrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        };
      }
      return null;
    });
    
    // Add multiple trades if functionality exists
    const addTradeButton = page.locator('button:has-text("Add Another"), button:has-text("Add Trade"), button:has-text("+")').first();
    
    if (await addTradeButton.isVisible()) {
      // Add several trades
      for (let i = 0; i < 10; i++) {
        if (await addTradeButton.isVisible()) {
          await addTradeButton.click();
          await page.waitForTimeout(100);
          
          // Fill in some data
          const inputs = page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]');
          const currentInput = inputs.nth(i + 1);
          
          if (await currentInput.isVisible()) {
            await currentInput.fill(String(100 + i * 10));
          }
        }
      }
      
      // Calculate if button exists
      const calculateButton = page.locator('button:has-text("Calculate"), input[type="button"][value*="Calculate"]');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForTimeout(500);
      }
      
      // Check memory usage after operations
      if (initialMetrics) {
        const finalMetrics = await page.evaluate(() => {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize
          };
        });
        
        const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
        console.log(`Memory increase: ${Math.round(memoryIncrease / 1024)}KB`);
        
        // Memory increase should be reasonable (less than 10MB for basic operations)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    }
  });

  test('Network performance and resource optimization', async ({ page }) => {
    const networkRequests = [];
    let totalTransferSize = 0;
    
    // Monitor network requests
    page.on('response', response => {
      const request = response.request();
      const url = response.url();
      const status = response.status();
      
      networkRequests.push({
        url,
        status,
        method: request.method(),
        resourceType: request.resourceType()
      });
      
      // Estimate transfer size (headers indicate this)
      response.headers()['content-length'] && (totalTransferSize += parseInt(response.headers()['content-length']) || 0);
    });
    
    await page.goto(calculatorUrl);
    await page.waitForLoadState('networkidle');
    
    // Analyze requests
    const cssRequests = networkRequests.filter(req => req.resourceType === 'stylesheet');
    const jsRequests = networkRequests.filter(req => req.resourceType === 'script');
    const imageRequests = networkRequests.filter(req => req.resourceType === 'image');
    const fontRequests = networkRequests.filter(req => req.resourceType === 'font');
    
    console.log(`Total network requests: ${networkRequests.length}`);
    console.log(`CSS files: ${cssRequests.length}`);
    console.log(`JS files: ${jsRequests.length}`);
    console.log(`Images: ${imageRequests.length}`);
    console.log(`Fonts: ${fontRequests.length}`);
    console.log(`Estimated total transfer: ${Math.round(totalTransferSize / 1024)}KB`);
    
    // Performance expectations
    expect(networkRequests.length).toBeLessThan(50); // Reasonable number of requests
    expect(cssRequests.length).toBeLessThan(10); // Not too many CSS files
    expect(jsRequests.length).toBeLessThan(15); // Not too many JS files
    
    // Check for failed requests
    const failedRequests = networkRequests.filter(req => req.status >= 400);
    expect(failedRequests.length).toBe(0);
  });

  test('DOM performance and rendering', async ({ page }) => {
    await page.goto(calculatorUrl);
    
    // Measure DOM metrics
    const domMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0];
      
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        firstContentfulPaint: navigation ? navigation.loadEventEnd : null
      };
    });
    
    console.log('DOM Performance Metrics:');
    console.log(`DOM Content Loaded: ${domMetrics.domContentLoaded}ms`);
    console.log(`DOM Complete: ${domMetrics.domComplete}ms`);
    console.log(`Load Complete: ${domMetrics.loadComplete}ms`);
    
    // Performance expectations
    expect(domMetrics.domContentLoaded).toBeLessThan(3000); // DOM should load within 3s
    expect(domMetrics.domComplete).toBeLessThan(5000); // Complete loading within 5s
    
    // Test rendering performance with interactions
    const startTime = Date.now();
    
    // Perform several DOM manipulations
    await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '100');
    await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '10');
    await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '150');
    
    const interactionTime = Date.now() - startTime;
    
    // Interactions should be responsive
    expect(interactionTime).toBeLessThan(1000);
    console.log(`DOM interaction time: ${interactionTime}ms`);
  });

  test('Large dataset performance', async ({ page }) => {
    await page.goto(calculatorUrl);
    
    // Test with large numbers and many decimal places
    const largeNumbers = [
      '999999999.99',
      '0.000000001',
      '123456789.123456789',
      '999999.999999'
    ];
    
    for (const number of largeNumbers) {
      const startTime = Date.now();
      
      // Fill with large/precise numbers
      await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', number);
      await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '1000000');
      await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', String(parseFloat(number) * 1.1));
      
      // Calculate
      const calculateButton = page.locator('button:has-text("Calculate"), input[type="button"][value*="Calculate"]');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForTimeout(100);
      }
      
      const calculationTime = Date.now() - startTime;
      
      // Should handle large numbers efficiently
      expect(calculationTime).toBeLessThan(2000);
      console.log(`Large number calculation time (${number}): ${calculationTime}ms`);
    }
  });
});