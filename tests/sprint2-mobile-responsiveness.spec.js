const { test, expect, devices } = require('@playwright/test');

// Mobile responsiveness tests for Sprint 2 Investment Calculators
test.describe('Sprint 2 Investment Calculators - Mobile Responsiveness', () => {
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
        bondsAllocation: '40'
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

  // === MOBILE CHROME TESTS ===
  test.describe('Mobile Chrome - Portrait Mode', () => {
    calculators.forEach((calculator) => {
      test(`${calculator.name} - Mobile Chrome functionality`, async ({ browser }) => {
        const context = await browser.newContext({
          ...devices['Pixel 5']
        });
        const page = await context.newPage();
        
        await page.goto(calculator.url);
        
        // Check viewport is mobile-sized
        const viewportSize = page.viewportSize();
        expect(viewportSize.width).toBeLessThanOrEqual(393); // Pixel 5 width
        
        // Verify page elements are visible and properly sized
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        
        // Test mobile navigation menu
        const mobileMenuButton = page.locator('.mobile-menu-toggle, .hamburger, .menu-toggle');
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click();
          await expect(page.locator('.mobile-menu, .nav-menu')).toBeVisible();
          await mobileMenuButton.click(); // Close menu
        }
        
        // Test form input accessibility on mobile
        const formInputs = page.locator('#calculatorForm input');
        const inputCount = await formInputs.count();
        
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = formInputs.nth(i);
          await input.click();
          
          // Check if input is properly focused and visible
          await expect(input).toBeFocused();
          
          // Verify input doesn't get obscured by virtual keyboard
          const boundingBox = await input.boundingBox();
          expect(boundingBox.y).toBeGreaterThan(0);
        }
        
        // Fill form with test data and calculate
        await fillFormBasedOnCalculator(page, calculator);
        
        // Test calculate button is easily tappable
        const calculateButton = page.locator('#calculateButton');
        const buttonBox = await calculateButton.boundingBox();
        expect(buttonBox.width).toBeGreaterThan(44); // Minimum touch target size
        expect(buttonBox.height).toBeGreaterThan(44);
        
        await calculateButton.click();
        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 10000 });
        
        // Check results display properly on mobile
        const resultItems = page.locator('.result-item, .results-grid > div');
        const resultCount = await resultItems.count();
        
        if (resultCount > 0) {
          // Results should be visible and not overlapping
          for (let i = 0; i < Math.min(resultCount, 2); i++) {
            await expect(resultItems.nth(i)).toBeVisible();
          }
        }
        
        await context.close();
      });
    });
  });

  // === MOBILE SAFARI TESTS ===
  test.describe('Mobile Safari - Portrait Mode', () => {
    calculators.forEach((calculator) => {
      test(`${calculator.name} - Mobile Safari functionality`, async ({ browser }) => {
        const context = await browser.newContext({
          ...devices['iPhone 12']
        });
        const page = await context.newPage();
        
        await page.goto(calculator.url);
        
        // Check viewport is mobile-sized
        const viewportSize = page.viewportSize();
        expect(viewportSize.width).toBeLessThanOrEqual(390); // iPhone 12 width
        
        // Test iOS-specific behaviors
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        
        // Test iOS number input behavior
        const numberInputs = page.locator('input[type="number"]');
        const numberInputCount = await numberInputs.count();
        
        if (numberInputCount > 0) {
          const firstNumberInput = numberInputs.first();
          await firstNumberInput.click();
          
          // On iOS, number inputs should trigger numeric keyboard
          // We can't directly test keyboard type, but can verify input accepts numbers
          await firstNumberInput.fill('12345');
          const value = await firstNumberInput.inputValue();
          expect(value).toBe('12345');
        }
        
        // Fill form and test calculation
        await fillFormBasedOnCalculator(page, calculator);
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible({ timeout: 10000 });
        
        // Test scroll behavior on iOS
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);
        if (pageHeight > viewportSize.height) {
          // Scroll to bottom
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(500);
          
          // Scroll back to top
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(500);
        }
        
        await context.close();
      });
    });
  });

  // === TABLET RESPONSIVENESS ===
  test.describe('Tablet Responsiveness', () => {
    calculators.forEach((calculator) => {
      test(`${calculator.name} - iPad functionality`, async ({ browser }) => {
        const context = await browser.newContext({
          ...devices['iPad Pro']
        });
        const page = await context.newPage();
        
        await page.goto(calculator.url);
        
        // Check viewport is tablet-sized
        const viewportSize = page.viewportSize();
        expect(viewportSize.width).toBeGreaterThan(768);
        
        // Verify layout adapts to tablet size
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        
        // Check if layout uses available space efficiently
        const form = page.locator('#calculatorForm');
        const formBox = await form.boundingBox();
        
        // Form should not be too narrow on tablet
        expect(formBox.width).toBeGreaterThan(400);
        
        // Test form functionality
        await fillFormBasedOnCalculator(page, calculator);
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        
        // Results should display in appropriate layout for tablet
        const resultsSection = page.locator('#resultsSection');
        const resultsBox = await resultsSection.boundingBox();
        expect(resultsBox.width).toBeGreaterThan(400);
        
        await context.close();
      });
    });
  });

  // === LANDSCAPE MODE TESTS ===
  test.describe('Mobile Landscape Mode', () => {
    calculators.forEach((calculator) => {
      test(`${calculator.name} - Mobile landscape functionality`, async ({ browser }) => {
        const context = await browser.newContext({
          viewport: { width: 812, height: 375 } // iPhone 12 landscape
        });
        const page = await context.newPage();
        
        await page.goto(calculator.url);
        
        // Verify landscape layout
        const viewportSize = page.viewportSize();
        expect(viewportSize.width).toBeGreaterThan(viewportSize.height);
        
        // Elements should still be accessible in landscape
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('#calculatorForm')).toBeVisible();
        
        // Test if content fits properly in reduced height
        const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
        if (bodyHeight > viewportSize.height) {
          // Should be scrollable
          await page.evaluate(() => window.scrollTo(0, 100));
          await page.waitForTimeout(300);
        }
        
        // Form should still be functional
        await fillFormBasedOnCalculator(page, calculator);
        await page.click('#calculateButton');
        await expect(page.locator('#resultsSection')).toBeVisible();
        
        await context.close();
      });
    });
  });

  // === TOUCH INTERACTION TESTS ===
  test.describe('Touch Interaction Testing', () => {
    
    test('Touch targets meet accessibility standards', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5']
      });
      const page = await context.newPage();
      
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Test button sizes meet 44px minimum standard
      const buttons = page.locator('button, .btn');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          expect(box.width).toBeGreaterThan(44);
          expect(box.height).toBeGreaterThan(44);
        }
      }
      
      // Test input field touch targets
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const box = await input.boundingBox();
          expect(box.height).toBeGreaterThan(44);
        }
      }
      
      await context.close();
    });
    
    test('Swipe and scroll gestures work properly', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12']
      });
      const page = await context.newPage();
      
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test vertical scrolling
      const initialScrollY = await page.evaluate(() => window.scrollY);
      
      // Simulate swipe up (scroll down)
      await page.touchscreen.tap(200, 400);
      await page.mouse.move(200, 400);
      await page.mouse.down();
      await page.mouse.move(200, 200);
      await page.mouse.up();
      
      await page.waitForTimeout(500);
      const newScrollY = await page.evaluate(() => window.scrollY);
      
      if (newScrollY !== initialScrollY) {
        console.log('Scroll gesture working correctly');
      }
      
      await context.close();
    });
  });

  // === RESPONSIVE DESIGN VALIDATION ===
  test.describe('Responsive Design Validation', () => {
    
    test('CSS media queries work correctly', async ({ browser }) => {
      const breakpoints = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1200, height: 800 }
      ];
      
      for (const breakpoint of breakpoints) {
        const context = await browser.newContext({
          viewport: { width: breakpoint.width, height: breakpoint.height }
        });
        const page = await context.newPage();
        
        await page.goto('/finance/investment/investment-goal-calculator/');
        
        // Check if appropriate styles are applied
        const bodyComputedStyle = await page.evaluate(() => {
          return window.getComputedStyle(document.body);
        });
        
        console.log(`${breakpoint.name} (${breakpoint.width}px): Body font-size ${bodyComputedStyle.fontSize}`);
        
        // Form should be visible and properly sized at all breakpoints
        await expect(page.locator('#calculatorForm')).toBeVisible();
        const formBox = await page.locator('#calculatorForm').boundingBox();
        expect(formBox.width).toBeGreaterThan(0);
        expect(formBox.width).toBeLessThanOrEqual(breakpoint.width);
        
        await context.close();
      }
    });
    
    test('Images and media scale properly', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5']
      });
      const page = await context.newPage();
      
      await page.goto('/finance/investment/drip-calculator/');
      
      // Check for any images that might not scale properly
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const imgBox = await img.boundingBox();
          const viewportWidth = page.viewportSize().width;
          
          // Images shouldn't exceed viewport width
          expect(imgBox.width).toBeLessThanOrEqual(viewportWidth);
        }
      }
      
      await context.close();
    });
  });

  // === FORM USABILITY ON MOBILE ===
  test.describe('Mobile Form Usability', () => {
    
    test('Form inputs are easily fillable on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5']
      });
      const page = await context.newPage();
      
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test each input for mobile usability
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        
        // Focus input
        await input.click();
        await page.waitForTimeout(300);
        
        // Input should be focused and visible
        await expect(input).toBeFocused();
        
        // Clear and type
        await input.fill('');
        await input.type('12345');
        
        const value = await input.inputValue();
        expect(value).toBe('12345');
        
        // Check if input is still visible (not hidden by virtual keyboard)
        const isVisible = await input.isVisible();
        expect(isVisible).toBeTruthy();
      }
      
      await context.close();
    });
    
    test('Select dropdowns work properly on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12']
      });
      const page = await context.newPage();
      
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test select dropdown
      const selectElement = page.locator('#dividendFrequency');
      if (await selectElement.isVisible()) {
        await selectElement.click();
        
        // Select an option
        await selectElement.selectOption('4'); // Quarterly
        
        const selectedValue = await selectElement.inputValue();
        expect(selectedValue).toBe('4');
      }
      
      await context.close();
    });
  });

  // === PERFORMANCE ON MOBILE ===
  test.describe('Mobile Performance', () => {
    
    test('Page loads efficiently on mobile network', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5']
      });
      
      // Simulate slow 3G network
      const page = await context.newPage();
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
      
      console.log(`Mobile load time (3G): ${loadTime}ms`);
      
      // Should load within reasonable time even on slow network
      expect(loadTime).toBeLessThan(10000); // 10 seconds max for 3G
      
      await context.close();
    });
    
    test('Calculations perform well on mobile', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5']
      });
      const page = await context.newPage();
      
      await page.goto('/finance/investment/drip-calculator/');
      
      // Fill complex calculation
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2.50');
      await page.fill('#timeHorizon', '30');
      await page.fill('#dividendGrowthRate', '3');
      await page.fill('#stockPriceGrowth', '7');
      
      const startTime = Date.now();
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      const calcTime = Date.now() - startTime;
      
      console.log(`Mobile calculation time: ${calcTime}ms`);
      
      // Should calculate quickly on mobile
      expect(calcTime).toBeLessThan(3000); // 3 seconds max
      
      await context.close();
    });
  });
});

// Helper function to fill forms based on calculator type
async function fillFormBasedOnCalculator(page, calculator) {
  if (calculator.name === 'Investment Goal Calculator') {
    await page.fill('#targetAmount', calculator.testData.targetAmount);
    await page.fill('#timeHorizon', calculator.testData.timeHorizon);
    await page.fill('#expectedReturn', calculator.testData.expectedReturn);
    await page.fill('#initialInvestment', calculator.testData.initialInvestment);
  } else if (calculator.name === 'Portfolio Return Calculator') {
    await page.fill('#portfolioValue', calculator.testData.portfolioValue);
    await page.fill('#stocks_allocation', calculator.testData.stocksAllocation);
    await page.fill('#bonds_allocation', calculator.testData.bondsAllocation);
    // Let international default to 0
  } else if (calculator.name === 'DRIP Calculator') {
    await page.fill('#initialInvestment', calculator.testData.initialInvestment);
    await page.fill('#sharePrice', calculator.testData.sharePrice);
    await page.fill('#annualDividend', calculator.testData.annualDividend);
    await page.fill('#timeHorizon', calculator.testData.timeHorizon);
  }
}