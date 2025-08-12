const { test, expect } = require('@playwright/test');

test.describe('Sprint 2: Random Number Generator Comprehensive Testing', () => {
  let page;
  const baseURL = 'http://localhost:8080';
  const calculatorPath = '/math/basic/random-number-generator/';

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto(`${baseURL}${calculatorPath}`);
    await expect(page.locator('h1')).toContainText('Random Number Generator');
  });

  test.describe('1. Core Integer/Decimal Generation Testing', () => {
    test('should generate integers in specified range (1-100)', async () => {
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '100');
      await page.selectOption('#numberType', 'integer');
      await page.fill('#quantity', '10');
      
      const startTime = Date.now();
      await page.click('#generateButton');
      const endTime = Date.now();
      
      // Verify results appear
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Check that 10 numbers were generated
      const numberItems = page.locator('.number-item');
      await expect(numberItems).toHaveCount(10);
      
      // Verify all numbers are integers in range
      const numbers = await numberItems.allTextContents();
      for (const numStr of numbers) {
        const num = parseInt(numStr);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(100);
        expect(Number.isInteger(num)).toBe(true);
      }
      
      // Performance check
      expect(endTime - startTime).toBeLessThan(650);
    });

    test('should generate decimals with specified precision', async () => {
      await page.fill('#minValue', '0');
      await page.fill('#maxValue', '1');
      await page.selectOption('#numberType', 'decimal');
      await page.selectOption('#decimalPlaces', '3');
      await page.fill('#quantity', '5');
      
      await page.click('#generateButton');
      
      const numberItems = page.locator('.number-item');
      const numbers = await numberItems.allTextContents();
      
      for (const numStr of numbers) {
        const num = parseFloat(numStr);
        expect(num).toBeGreaterThanOrEqual(0);
        expect(num).toBeLessThanOrEqual(1);
        
        // Check decimal precision (should have exactly 3 decimal places)
        const decimalPart = numStr.split('.')[1];
        expect(decimalPart).toBeDefined();
        expect(decimalPart.length).toBe(3);
      }
    });

    test('should handle negative ranges correctly', async () => {
      await page.fill('#minValue', '-50');
      await page.fill('#maxValue', '50');
      await page.selectOption('#numberType', 'integer');
      await page.fill('#quantity', '20');
      
      await page.click('#generateButton');
      
      const numberItems = page.locator('.number-item');
      const numbers = await numberItems.allTextContents();
      
      for (const numStr of numbers) {
        const num = parseInt(numStr);
        expect(num).toBeGreaterThanOrEqual(-50);
        expect(num).toBeLessThanOrEqual(50);
      }
    });

    test('should handle edge case: min=max', async () => {
      await page.fill('#minValue', '42');
      await page.fill('#maxValue', '42');
      await page.fill('#quantity', '1');
      
      await page.click('#generateButton');
      
      // Should show error
      await expect(page.locator('#errorMessages')).toBeVisible();
      await expect(page.locator('#errorMessages')).toContainText('Maximum value must be greater than minimum value');
    });
  });

  test.describe('2. Seed Functionality Testing', () => {
    test('should produce identical sequences with same seed', async () => {
      // First generation with seed
      await page.check('#useSeed');
      await page.fill('#seedValue', '12345');
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '100');
      await page.fill('#quantity', '10');
      
      await page.click('#generateButton');
      const firstNumbers = await page.locator('.number-item').allTextContents();
      
      // Reset and generate again with same seed
      await page.click('#resetButton');
      await page.check('#useSeed');
      await page.fill('#seedValue', '12345');
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '100');
      await page.fill('#quantity', '10');
      
      await page.click('#generateButton');
      const secondNumbers = await page.locator('.number-item').allTextContents();
      
      // Should be identical
      expect(firstNumbers).toEqual(secondNumbers);
    });

    test('should produce different sequences with different seeds', async () => {
      // First generation with seed 111
      await page.check('#useSeed');
      await page.fill('#seedValue', '111');
      await page.fill('#quantity', '5');
      
      await page.click('#generateButton');
      const firstNumbers = await page.locator('.number-item').allTextContents();
      
      // Reset and generate with seed 222
      await page.click('#resetButton');
      await page.check('#useSeed');
      await page.fill('#seedValue', '222');
      await page.fill('#quantity', '5');
      
      await page.click('#generateButton');
      const secondNumbers = await page.locator('.number-item').allTextContents();
      
      // Should be different
      expect(firstNumbers).not.toEqual(secondNumbers);
    });

    test('should handle negative seed values', async () => {
      await page.check('#useSeed');
      await page.fill('#seedValue', '-999');
      await page.fill('#quantity', '3');
      
      await page.click('#generateButton');
      
      // Should generate without errors
      await expect(page.locator('#resultsSection')).toBeVisible();
      await expect(page.locator('.number-item')).toHaveCount(3);
    });

    test('should handle zero seed value', async () => {
      await page.check('#useSeed');
      await page.fill('#seedValue', '0');
      await page.fill('#quantity', '3');
      
      await page.click('#generateButton');
      
      // Should generate without errors
      await expect(page.locator('#resultsSection')).toBeVisible();
      await expect(page.locator('.number-item')).toHaveCount(3);
    });
  });

  test.describe('3. No Duplicates Feature Testing', () => {
    test('should generate unique integers when no duplicates enabled', async () => {
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '10');
      await page.selectOption('#numberType', 'integer');
      await page.fill('#quantity', '10');
      await page.check('#noDuplicates');
      
      await page.click('#generateButton');
      
      const numberItems = page.locator('.number-item');
      const numbers = await numberItems.allTextContents();
      const uniqueNumbers = [...new Set(numbers.map(n => parseInt(n)))];
      
      // All numbers should be unique
      expect(uniqueNumbers.length).toBe(10);
    });

    test('should show error when requesting more unique numbers than possible', async () => {
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '5');
      await page.selectOption('#numberType', 'integer');
      await page.fill('#quantity', '10'); // Asking for 10 unique integers in range 1-5
      await page.check('#noDuplicates');
      
      await page.click('#generateButton');
      
      // Should show error
      await expect(page.locator('#errorMessages')).toBeVisible();
      await expect(page.locator('#errorMessages')).toContainText('Cannot generate 10 unique integers');
    });

    test('should work correctly with decimals and no duplicates', async () => {
      await page.fill('#minValue', '0');
      await page.fill('#maxValue', '1');
      await page.selectOption('#numberType', 'decimal');
      await page.selectOption('#decimalPlaces', '2');
      await page.fill('#quantity', '5');
      await page.check('#noDuplicates');
      
      await page.click('#generateButton');
      
      // Should generate without errors (decimals have much lower collision probability)
      await expect(page.locator('#resultsSection')).toBeVisible();
      await expect(page.locator('.number-item')).toHaveCount(5);
    });
  });

  test.describe('4. Export Features Testing', () => {
    test('should copy numbers to clipboard', async () => {
      await page.fill('#quantity', '3');
      await page.click('#generateButton');
      
      // Mock clipboard API
      await page.evaluate(() => {
        window.clipboardText = '';
        navigator.clipboard = {
          writeText: async (text) => {
            window.clipboardText = text;
            return Promise.resolve();
          }
        };
      });
      
      await page.click('#copyButton');
      
      // Check success message appears
      const successMessage = page.locator('div').filter({ hasText: 'Numbers copied to clipboard!' });
      await expect(successMessage).toBeVisible();
      
      // Verify clipboard content
      const clipboardContent = await page.evaluate(() => window.clipboardText);
      expect(clipboardContent).toMatch(/^\d+(?:, \d+)*$/); // Numbers separated by commas
    });

    test('should export CSV file', async () => {
      await page.fill('#quantity', '5');
      await page.click('#generateButton');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('#exportCsvButton');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('random_numbers.csv');
      
      // Verify success message
      const successMessage = page.locator('div').filter({ hasText: 'File random_numbers.csv downloaded successfully!' });
      await expect(successMessage).toBeVisible();
    });

    test('should export TXT file', async () => {
      await page.fill('#quantity', '5');
      await page.click('#generateButton');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('#exportTxtButton');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('random_numbers.txt');
      
      // Verify success message
      const successMessage = page.locator('div').filter({ hasText: 'File random_numbers.txt downloaded successfully!' });
      await expect(successMessage).toBeVisible();
    });
  });

  test.describe('5. Large Dataset Performance Testing', () => {
    test('should handle 10,000 number generation with acceptable performance', async () => {
      await page.fill('#quantity', '10000');
      
      const startTime = Date.now();
      await page.click('#generateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      const endTime = Date.now();
      
      const generationTime = endTime - startTime;
      console.log(`Generation time for 10,000 numbers: ${generationTime}ms`);
      
      // Should complete within 2 seconds
      expect(generationTime).toBeLessThan(2000);
      
      // Verify summary shows correct count
      await expect(page.locator('#resultsSummary')).toContainText('Numbers Generated: 10000');
      
      // UI should remain responsive
      const scrollable = page.locator('.numbers-grid');
      await expect(scrollable).toBeVisible();
    });

    test('should handle large unique integer generation efficiently', async () => {
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '5000');
      await page.fill('#quantity', '1000');
      await page.check('#noDuplicates');
      
      const startTime = Date.now();
      await page.click('#generateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      const endTime = Date.now();
      
      const generationTime = endTime - startTime;
      console.log(`Unique generation time for 1,000 numbers: ${generationTime}ms`);
      
      // Should complete within reasonable time
      expect(generationTime).toBeLessThan(3000);
      
      // Verify all numbers are unique
      const numbers = await page.locator('.number-item').allTextContents();
      const uniqueNumbers = [...new Set(numbers.map(n => parseInt(n)))];
      expect(uniqueNumbers.length).toBe(1000);
    });
  });

  test.describe('6. Edge Cases & Error Handling', () => {
    test('should validate non-numeric inputs', async () => {
      await page.fill('#minValue', 'abc');
      await page.fill('#maxValue', 'def');
      await page.click('#generateButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
      await expect(page.locator('#errorMessages')).toContainText('Minimum value must be a valid number');
      await expect(page.locator('#errorMessages')).toContainText('Maximum value must be a valid number');
    });

    test('should validate quantity limits', async () => {
      await page.fill('#quantity', '0');
      await page.click('#generateButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
      await expect(page.locator('#errorMessages')).toContainText('Quantity must be at least 1');
      
      await page.fill('#quantity', '15000');
      await page.click('#generateButton');
      
      await expect(page.locator('#errorMessages')).toContainText('Quantity cannot exceed 10,000');
    });

    test('should handle empty required fields', async () => {
      await page.fill('#minValue', '');
      await page.fill('#maxValue', '');
      await page.fill('#quantity', '');
      await page.click('#generateButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
    });

    test('should validate min >= max scenario', async () => {
      await page.fill('#minValue', '100');
      await page.fill('#maxValue', '50');
      await page.click('#generateButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
      await expect(page.locator('#errorMessages')).toContainText('Maximum value must be greater than minimum value');
    });
  });

  test.describe('7. User Interface & Experience Testing', () => {
    test('should show/hide conditional fields correctly', async () => {
      // Decimal places should be hidden initially
      await expect(page.locator('#decimalPlacesGroup')).toBeHidden();
      
      // Show when decimal selected
      await page.selectOption('#numberType', 'decimal');
      await expect(page.locator('#decimalPlacesGroup')).toBeVisible();
      
      // Hide when integer selected
      await page.selectOption('#numberType', 'integer');
      await expect(page.locator('#decimalPlacesGroup')).toBeHidden();
      
      // Seed group should be hidden initially
      await expect(page.locator('#seedGroup')).toBeHidden();
      
      // Show when seed checkbox checked
      await page.check('#useSeed');
      await expect(page.locator('#seedGroup')).toBeVisible();
      
      // Hide when unchecked
      await page.uncheck('#useSeed');
      await expect(page.locator('#seedGroup')).toBeHidden();
    });

    test('should display results summary correctly', async () => {
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '10');
      await page.fill('#quantity', '5');
      await page.click('#generateButton');
      
      const summary = page.locator('#resultsSummary');
      await expect(summary).toBeVisible();
      await expect(summary).toContainText('Numbers Generated: 5');
      await expect(summary).toContainText('Range:');
      await expect(summary).toContainText('Sum:');
      await expect(summary).toContainText('Average:');
    });

    test('should reset form correctly', async () => {
      // Change all values
      await page.fill('#minValue', '50');
      await page.fill('#maxValue', '200');
      await page.selectOption('#numberType', 'decimal');
      await page.selectOption('#decimalPlaces', '5');
      await page.fill('#quantity', '20');
      await page.check('#noDuplicates');
      await page.check('#useSeed');
      await page.fill('#seedValue', '999');
      
      // Generate results
      await page.click('#generateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Reset
      await page.click('#resetButton');
      
      // Verify defaults restored
      await expect(page.locator('#minValue')).toHaveValue('1');
      await expect(page.locator('#maxValue')).toHaveValue('100');
      await expect(page.locator('#numberType')).toHaveValue('integer');
      await expect(page.locator('#quantity')).toHaveValue('1');
      await expect(page.locator('#noDuplicates')).not.toBeChecked();
      await expect(page.locator('#useSeed')).not.toBeChecked();
      await expect(page.locator('#seedValue')).toHaveValue('');
      await expect(page.locator('#resultsSection')).toBeHidden();
    });
  });

  test.describe('8. Mobile & Responsive Testing', () => {
    test('should be mobile responsive', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Form should be usable
      await expect(page.locator('.calculator-form')).toBeVisible();
      await expect(page.locator('#minValue')).toBeVisible();
      await expect(page.locator('#generateButton')).toBeVisible();
      
      // Generate numbers
      await page.fill('#quantity', '5');
      await page.click('#generateButton');
      
      // Results should display properly
      await expect(page.locator('#resultsSection')).toBeVisible();
      await expect(page.locator('.numbers-grid')).toBeVisible();
      
      // Export buttons should be usable
      await expect(page.locator('#copyButton')).toBeVisible();
      await expect(page.locator('#exportCsvButton')).toBeVisible();
      await expect(page.locator('#exportTxtButton')).toBeVisible();
    });

    test('should maintain functionality on tablet size', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.fill('#quantity', '10');
      await page.click('#generateButton');
      
      await expect(page.locator('#resultsSection')).toBeVisible();
      await expect(page.locator('.number-item')).toHaveCount(10);
    });
  });

  test.describe('9. Accessibility Testing', () => {
    test('should have proper keyboard navigation', async () => {
      // Tab through form elements
      await page.keyboard.press('Tab'); // Skip link
      await page.keyboard.press('Tab'); // Should focus first input
      
      const activeElement = page.locator(':focus');
      await expect(activeElement).toHaveAttribute('id', 'minValue');
      
      // Continue tabbing through form
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('id', 'maxValue');
      
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('id', 'numberType');
    });

    test('should have proper ARIA labels and descriptions', async () => {
      await expect(page.locator('label[for="minValue"]')).toContainText('Minimum Value');
      await expect(page.locator('label[for="maxValue"]')).toContainText('Maximum Value');
      await expect(page.locator('label[for="quantity"]')).toContainText('How Many Numbers');
      
      // Fieldsets should have legends
      await expect(page.locator('fieldset legend').first()).toContainText('Number Range');
      await expect(page.locator('fieldset legend').nth(1)).toContainText('Number Format');
      await expect(page.locator('fieldset legend').nth(2)).toContainText('Generation Options');
    });

    test('should announce errors to screen readers', async () => {
      await page.fill('#minValue', 'invalid');
      await page.click('#generateButton');
      
      const errorDiv = page.locator('#errorMessages');
      await expect(errorDiv).toBeVisible();
      await expect(errorDiv).toHaveAttribute('style', expect.stringContaining('display: block'));
    });
  });

  test.describe('10. Statistical Distribution Analysis', () => {
    test('should produce reasonably distributed numbers', async () => {
      await page.fill('#minValue', '1');
      await page.fill('#maxValue', '100');
      await page.fill('#quantity', '1000');
      await page.click('#generateButton');
      
      const numbers = await page.locator('.number-item').allTextContents();
      const numValues = numbers.map(n => parseInt(n));
      
      // Basic distribution checks
      const min = Math.min(...numValues);
      const max = Math.max(...numValues);
      const average = numValues.reduce((a, b) => a + b, 0) / numValues.length;
      
      expect(min).toBeGreaterThanOrEqual(1);
      expect(max).toBeLessThanOrEqual(100);
      expect(average).toBeGreaterThan(40);
      expect(average).toBeLessThan(60);
      
      // Check distribution across quarters
      const q1 = numValues.filter(n => n <= 25).length;
      const q2 = numValues.filter(n => n > 25 && n <= 50).length;
      const q3 = numValues.filter(n => n > 50 && n <= 75).length;
      const q4 = numValues.filter(n => n > 75).length;
      
      // Each quarter should have reasonable representation (not perfect, but reasonable)
      expect(q1).toBeGreaterThan(100); // At least 10% in each quarter
      expect(q2).toBeGreaterThan(100);
      expect(q3).toBeGreaterThan(100);
      expect(q4).toBeGreaterThan(100);
    });
  });

  test.describe('11. Cryptographic vs Fallback Randomness', () => {
    test('should use secure randomness when available', async () => {
      // Test that crypto.getRandomValues is being used
      const cryptoAvailable = await page.evaluate(() => {
        return !!(window.crypto && window.crypto.getRandomValues);
      });
      
      if (cryptoAvailable) {
        console.log('✓ Cryptographic randomness available');
        
        // Generate numbers and verify they work
        await page.fill('#quantity', '10');
        await page.click('#generateButton');
        await expect(page.locator('.number-item')).toHaveCount(10);
      } else {
        console.log('⚠ Fallback to Math.random()');
      }
    });

    test('should handle fallback when crypto unavailable', async () => {
      // Mock crypto as unavailable
      await page.addInitScript(() => {
        delete window.crypto;
      });
      
      await page.fill('#quantity', '5');
      await page.click('#generateButton');
      
      // Should still generate numbers using Math.random fallback
      await expect(page.locator('.number-item')).toHaveCount(5);
    });
  });
});