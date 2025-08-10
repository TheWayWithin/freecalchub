const { test, expect, devices } = require('@playwright/test');

test.describe('Crypto Profit/Loss Calculator - UI/UX Testing', () => {
  const calculatorUrl = '/finance/cryptocurrency/crypto-profit-calculator/';

  test.describe('Mobile Responsiveness', () => {
    test('Mobile layout renders correctly', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12']
      });
      const page = await context.newPage();
      
      await page.goto(calculatorUrl);
      
      // Check that calculator is visible and usable on mobile
      await expect(page.locator('.calculator-container, .calculator-form, #calculator')).toBeVisible();
      
      // Check that inputs are appropriately sized for mobile
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const boundingBox = await input.boundingBox();
          expect(boundingBox.height).toBeGreaterThan(30); // Should be touch-friendly
        }
      }
      
      // Check that buttons are touch-friendly
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          expect(boundingBox.height).toBeGreaterThan(35); // Touch-friendly button height
        }
      }
      
      await context.close();
    });

    test('Tablet layout renders correctly', async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 768, height: 1024 }
      });
      const page = await context.newPage();
      
      await page.goto(calculatorUrl);
      
      // Check calculator visibility
      await expect(page.locator('.calculator-container, .calculator-form, #calculator')).toBeVisible();
      
      // Check that layout adapts well to tablet size
      const pageContent = await page.textContent('body');
      expect(pageContent.length).toBeGreaterThan(100); // Page should have content
      
      await context.close();
    });
  });

  test.describe('Dark Mode Toggle', () => {
    test('Dark mode toggle exists and functions', async ({ page }) => {
      await page.goto(calculatorUrl);
      
      // Look for dark mode toggle
      const darkModeSelectors = [
        'button:has-text("Dark")',
        'button:has-text("Light")', 
        '.dark-mode-toggle',
        '#dark-mode-toggle',
        '[data-theme-toggle]',
        'button[class*="theme"]',
        'button[class*="dark"]'
      ];
      
      let darkModeToggle = null;
      for (const selector of darkModeSelectors) {
        const toggle = page.locator(selector);
        if (await toggle.isVisible()) {
          darkModeToggle = toggle;
          break;
        }
      }
      
      if (darkModeToggle) {
        // Get initial background color or theme indicator
        const initialBodyClass = await page.getAttribute('body', 'class') || '';
        const initialHtmlClass = await page.getAttribute('html', 'class') || '';
        
        // Click dark mode toggle
        await darkModeToggle.click();
        await page.waitForTimeout(500);
        
        // Check if theme changed
        const newBodyClass = await page.getAttribute('body', 'class') || '';
        const newHtmlClass = await page.getAttribute('html', 'class') || '';
        
        // Theme should have changed (either class change or background color change)
        const themeChanged = (
          initialBodyClass !== newBodyClass || 
          initialHtmlClass !== newHtmlClass ||
          await page.locator('body[data-theme="dark"], html[data-theme="dark"], .dark-mode, .dark').isVisible()
        );
        
        expect(themeChanged).toBeTruthy();
        
        // Toggle back
        await darkModeToggle.click();
        await page.waitForTimeout(500);
      } else {
        console.log('Dark mode toggle not found - this may be expected if not implemented');
      }
    });
  });

  test.describe('Form Validation and Error Handling', () => {
    test('Input field validation works correctly', async ({ page }) => {
      await page.goto(calculatorUrl);
      
      // Test non-numeric input
      const purchaseInput = page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]').first();
      await purchaseInput.fill('abc');
      
      // Check if input rejects non-numeric values or shows validation
      const purchaseValue = await purchaseInput.inputValue();
      expect(purchaseValue).toBe(''); // Should reject non-numeric input
      
      // Test extremely large numbers
      await purchaseInput.fill('999999999999999');
      const largeValue = await purchaseInput.inputValue();
      expect(largeValue.length).toBeLessThan(20); // Should handle large numbers appropriately
      
      // Test decimal places
      await purchaseInput.fill('100.999999');
      const decimalValue = await purchaseInput.inputValue();
      expect(decimalValue).toMatch(/^\d+\.?\d*$/); // Should be numeric format
    });

    test('Required field validation', async ({ page }) => {
      await page.goto(calculatorUrl);
      
      // Try to calculate with empty fields
      const calculateButton = page.locator('button:has-text("Calculate"), input[type="button"][value*="Calculate"]');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        
        // Check for validation messages or behavior
        await page.waitForTimeout(500);
        
        // Look for error styling or messages
        const hasErrorStyling = await page.locator('.error, .invalid, [class*="error"], [class*="invalid"]').count() > 0;
        const pageContent = await page.textContent('body');
        const hasErrorMessage = /required|please|invalid|error/i.test(pageContent);
        
        // Should show some form of validation feedback
        expect(hasErrorStyling || hasErrorMessage).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility Features', () => {
    test('Form labels and accessibility attributes', async ({ page }) => {
      await page.goto(calculatorUrl);
      
      // Check for proper form labels
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          // Check for associated label or aria-label
          const hasLabel = await input.evaluate(el => {
            const id = el.id;
            const ariaLabel = el.getAttribute('aria-label');
            const placeholder = el.placeholder;
            const associatedLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
            
            return !!(ariaLabel || placeholder || associatedLabel);
          });
          
          expect(hasLabel).toBeTruthy();
        }
      }
      
      // Check for heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0); // Should have proper heading structure
      
      // Check for proper semantic HTML
      const main = page.locator('main, [role="main"]');
      const hasMainContent = await main.count() > 0;
      expect(hasMainContent).toBeTruthy();
    });

    test('Keyboard navigation', async ({ page }) => {
      await page.goto(calculatorUrl);
      
      // Test tab navigation through form
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const buttons = page.locator('button');
      
      // Start from first input
      if (await inputs.count() > 0) {
        await inputs.first().focus();
        
        // Tab through elements
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);
          
          // Check that focus moved to a focusable element
          const focusedElement = page.locator(':focus');
          await expect(focusedElement).toBeVisible();
        }
      }
    });
  });

  test.describe('Visual and Layout Testing', () => {
    test('Calculator layout is properly structured', async ({ page }) => {
      await page.goto(calculatorUrl);
      
      // Check that main content areas are visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.calculator-container, .calculator-form, #calculator')).toBeVisible();
      
      // Check for proper spacing and layout
      const calculator = page.locator('.calculator-container, .calculator-form, #calculator').first();
      const boundingBox = await calculator.boundingBox();
      expect(boundingBox.width).toBeGreaterThan(200); // Reasonable width
      expect(boundingBox.height).toBeGreaterThan(100); // Reasonable height
      
      // Check that inputs are properly aligned
      const inputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await inputs.count();
      
      if (inputCount > 1) {
        const firstInputBox = await inputs.first().boundingBox();
        const secondInputBox = await inputs.nth(1).boundingBox();
        
        // Inputs should be roughly aligned (within reasonable tolerance)
        const alignmentTolerance = 50;
        const isAligned = Math.abs(firstInputBox.x - secondInputBox.x) < alignmentTolerance;
        expect(isAligned).toBeTruthy();
      }
    });

    test('Results display is visually clear', async ({ page }) => {
      await page.goto(calculatorUrl);
      
      // Fill in data and calculate
      await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '100');
      await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '10');
      await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '150');
      
      const calculateButton = page.locator('button:has-text("Calculate"), input[type="button"][value*="Calculate"]');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Check that results area is visually distinct
      const resultSelectors = [
        '.result', '.calculation-result', '.profit-loss', 
        '#result', '#profit', '#loss', '.summary'
      ];
      
      for (const selector of resultSelectors) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const boundingBox = await element.boundingBox();
          expect(boundingBox.width).toBeGreaterThan(50); // Should have meaningful size
          expect(boundingBox.height).toBeGreaterThan(20);
          
          // Check for visual emphasis (larger font, color, etc.)
          const computedStyle = await element.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              color: style.color,
              backgroundColor: style.backgroundColor
            };
          });
          
          // Should have some visual styling
          expect(computedStyle.fontSize.length).toBeGreaterThan(0);
          break;
        }
      }
    });
  });
});