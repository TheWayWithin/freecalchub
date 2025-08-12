/**
 * Sprint 3: Focused Rounding Calculator Testing
 * 
 * Targeted tests for core functionality validation
 */

import { test, expect } from '@playwright/test';

test.describe('Sprint 3: Rounding Calculator Core Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/math/basic/rounding-calculator/');
    await expect(page.locator('h1')).toContainText('Rounding Calculator');
  });

  test('should load calculator page correctly', async ({ page }) => {
    // Page loads successfully
    await expect(page.locator('h1')).toContainText('Rounding Calculator');
    
    // Form elements are present
    await expect(page.locator('#numbersInput')).toBeVisible();
    await expect(page.locator('#calculateButton')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
    
    // Radio buttons are present
    await expect(page.locator('input[name="roundingMethod"]')).toHaveCount(5);
    
    // Default state - decimal places should be selected and visible
    await expect(page.locator('input[value="decimal"]')).toBeChecked();
    await expect(page.locator('#decimalPlacesGroup')).toBeVisible();
  });

  test('should perform basic decimal places rounding', async ({ page }) => {
    await page.fill('#numbersInput', '3.14159');
    await page.fill('#decimalPlaces', '2');
    await page.click('#calculateButton');
    
    await expect(page.locator('.result-item')).toBeVisible();
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('3.14');
    
    const explanation = await page.locator('.result-explanation').first().textContent();
    expect(explanation).toContain('2 decimal places');
  });

  test('should change precision fields when rounding method changes', async ({ page }) => {
    // Start with decimal method (default)
    await expect(page.locator('#decimalPlacesGroup')).toBeVisible();
    await expect(page.locator('#significantFiguresGroup')).not.toBeVisible();
    
    // Click significant figures radio button using JavaScript
    await page.evaluate(() => {
      document.querySelector('input[value="significant"]').click();
    });
    
    // Wait for UI update
    await page.waitForTimeout(100);
    
    // Check field visibility changed
    await expect(page.locator('#decimalPlacesGroup')).not.toBeVisible();
    await expect(page.locator('#significantFiguresGroup')).toBeVisible();
  });

  test('should perform significant figures rounding', async ({ page }) => {
    await page.fill('#numbersInput', '123456');
    
    // Use JavaScript to select significant figures method
    await page.evaluate(() => {
      document.querySelector('input[value="significant"]').click();
    });
    
    await page.fill('#significantFigures', '3');
    await page.click('#calculateButton');
    
    await expect(page.locator('.result-item')).toBeVisible();
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('123,000');
  });

  test('should perform nearest value rounding', async ({ page }) => {
    await page.fill('#numbersInput', '123');
    
    // Use JavaScript to select nearest method
    await page.evaluate(() => {
      document.querySelector('input[value="nearest"]').click();
    });
    
    await page.selectOption('#nearestValue', '10');
    await page.click('#calculateButton');
    
    await expect(page.locator('.result-item')).toBeVisible();
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('120');
  });

  test('should perform ceiling rounding', async ({ page }) => {
    await page.fill('#numbersInput', '3.1');
    
    // Use JavaScript to select ceiling method
    await page.evaluate(() => {
      document.querySelector('input[value="ceiling"]').click();
    });
    
    await page.click('#calculateButton');
    
    await expect(page.locator('.result-item')).toBeVisible();
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('4');
    
    const explanation = await page.locator('.result-explanation').first().textContent();
    expect(explanation).toContain('up to next whole number');
  });

  test('should perform floor rounding', async ({ page }) => {
    await page.fill('#numbersInput', '3.9');
    
    // Use JavaScript to select floor method
    await page.evaluate(() => {
      document.querySelector('input[value="floor"]').click();
    });
    
    await page.click('#calculateButton');
    
    await expect(page.locator('.result-item')).toBeVisible();
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('3');
    
    const explanation = await page.locator('.result-explanation').first().textContent();
    expect(explanation).toContain('down to current whole number');
  });

  test('should handle multiple numbers (batch processing)', async ({ page }) => {
    await page.fill('#numbersInput', '3.14159, 2.71828, 1.41421');
    await page.fill('#decimalPlaces', '2');
    await page.click('#calculateButton');
    
    // Should show 3 result items
    await expect(page.locator('.result-item')).toHaveCount(3);
    
    const results = await page.locator('.result-rounded .number.highlight').allTextContents();
    expect(results).toEqual(['3.14', '2.72', '1.41']);
  });

  test('should show copy button after calculation', async ({ page }) => {
    await page.fill('#numbersInput', '3.14159');
    await page.fill('#decimalPlaces', '2');
    await page.click('#calculateButton');
    
    await expect(page.locator('#copyButton')).toBeVisible();
  });

  test('should reset form correctly', async ({ page }) => {
    // Fill form with data
    await page.fill('#numbersInput', '3.14159');
    await page.fill('#decimalPlaces', '5');
    await page.click('#calculateButton');
    
    // Verify results are shown
    await expect(page.locator('.result-item')).toBeVisible();
    
    // Reset form
    await page.click('#resetButton');
    
    // Verify reset state
    await expect(page.locator('.result-item')).not.toBeVisible();
    await expect(page.locator('#numbersInput')).toHaveValue('');
    await expect(page.locator('input[value="decimal"]')).toBeChecked();
  });

  test('should validate empty input', async ({ page }) => {
    await page.click('#calculateButton');
    
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Please enter at least one number');
  });

  test('should handle invalid input gracefully', async ({ page }) => {
    await page.fill('#numbersInput', 'not a number');
    await page.click('#calculateButton');
    
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('not a valid number');
  });

  test('should validate precision ranges', async ({ page }) => {
    await page.fill('#numbersInput', '3.14159');
    
    // Test decimal places out of range
    await page.fill('#decimalPlaces', '15'); // Above max of 10
    await page.click('#calculateButton');
    
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Decimal places must be between 0 and 10');
  });

  test('should handle negative numbers correctly', async ({ page }) => {
    const testCases = [
      { input: '-3.14159', method: 'decimal', precision: '2', expected: '-3.14' },
      { input: '-3.1', method: 'ceiling', expected: '-3' },
      { input: '-3.9', method: 'floor', expected: '-4' }
    ];

    for (const testCase of testCases) {
      await page.fill('#numbersInput', testCase.input);
      
      if (testCase.method !== 'decimal') {
        await page.evaluate((method) => {
          document.querySelector(`input[value="${method}"]`).click();
        }, testCase.method);
      }
      
      if (testCase.precision) {
        await page.fill('#decimalPlaces', testCase.precision);
      }
      
      await page.click('#calculateButton');
      
      const result = await page.locator('.result-rounded .number.highlight').first().textContent();
      expect(result).toBe(testCase.expected);
      
      await page.click('#resetButton');
    }
  });

  test('should handle large numbers correctly', async ({ page }) => {
    await page.fill('#numbersInput', '1234567.123456');
    await page.fill('#decimalPlaces', '2');
    await page.click('#calculateButton');
    
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('1,234,567.12');
  });

  test('should support keyboard Enter key', async ({ page }) => {
    await page.fill('#numbersInput', '3.14159');
    await page.fill('#decimalPlaces', '2');
    
    // Press Enter in the input field
    await page.press('#numbersInput', 'Enter');
    
    await expect(page.locator('.result-item')).toBeVisible();
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('3.14');
  });

  test('should have proper accessibility structure', async ({ page }) => {
    // Check form labels
    await expect(page.locator('label[for="numbersInput"]')).toBeVisible();
    await expect(page.locator('label[for="decimalPlaces"]')).toBeVisible();
    
    // Check fieldset legends
    await expect(page.locator('legend')).toHaveCount(3);
    
    // Check heading hierarchy
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    expect(h1Count).toBe(1);
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should display educational content correctly', async ({ page }) => {
    // Check method cards are present
    await expect(page.locator('.method-card')).toHaveCount(5);
    
    // Check FAQ section
    await expect(page.locator('.faq-section')).toBeVisible();
    
    // Test FAQ interaction
    await page.click('.faq-item:first-child .accordion');
    await expect(page.locator('.faq-item:first-child .panel')).toBeVisible();
  });

  test('should handle scientific notation input', async ({ page }) => {
    await page.fill('#numbersInput', '1.23e12');
    await page.fill('#decimalPlaces', '2');
    await page.click('#calculateButton');
    
    // Should not error and should display result
    await expect(page.locator('.error-message')).not.toBeVisible();
    await expect(page.locator('.result-item')).toBeVisible();
  });

  test('should perform mathematical accuracy test for edge cases', async ({ page }) => {
    // Test floating point precision
    await page.fill('#numbersInput', '1.005');
    await page.fill('#decimalPlaces', '2');
    await page.click('#calculateButton');
    
    const result = await page.locator('.result-rounded .number.highlight').first().textContent();
    expect(result).toBe('1.01'); // Should handle banker's rounding correctly
  });

});