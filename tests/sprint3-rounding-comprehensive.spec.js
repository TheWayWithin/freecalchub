/**
 * Sprint 3: Comprehensive Rounding Calculator Testing
 * 
 * Testing Target: /math/basic/rounding-calculator/
 * Mission: Validate all 5 rounding methods and advanced features
 */

import { test, expect } from '@playwright/test';

test.describe('Sprint 3: Rounding Calculator Comprehensive Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/math/basic/rounding-calculator/');
    await expect(page.locator('h1')).toContainText('Rounding Calculator');
  });

  // ===========================
  // 1. DECIMAL PLACES ROUNDING
  // ===========================
  
  test.describe('Decimal Places Rounding Testing', () => {
    
    test('should round to 0-10 decimal places correctly', async ({ page }) => {
      const testCases = [
        { input: '3.14159265359', decimals: 0, expected: '3' },
        { input: '3.14159265359', decimals: 1, expected: '3.1' },
        { input: '3.14159265359', decimals: 2, expected: '3.14' },
        { input: '3.14159265359', decimals: 3, expected: '3.142' },
        { input: '3.14159265359', decimals: 4, expected: '3.1416' },
        { input: '3.14159265359', decimals: 5, expected: '3.14159' },
        { input: '3.14159265359', decimals: 10, expected: '3.1415926536' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="decimal"]');
        await page.fill('#decimalPlaces', testCase.decimals.toString());
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle negative numbers correctly with decimal places', async ({ page }) => {
      const testCases = [
        { input: '-3.14159', decimals: 2, expected: '-3.14' },
        { input: '-123.456', decimals: 1, expected: '-123.5' },
        { input: '-0.9999', decimals: 3, expected: '-1' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="decimal"]');
        await page.fill('#decimalPlaces', testCase.decimals.toString());
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle large numbers with decimal precision', async ({ page }) => {
      const testCases = [
        { input: '1234567.123456', decimals: 2, expected: '1,234,567.12' },
        { input: '999999.999', decimals: 1, expected: '1,000,000' },
        { input: '0.000001', decimals: 6, expected: '0.000001' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="decimal"]');
        await page.fill('#decimalPlaces', testCase.decimals.toString());
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });
  });

  // ===========================
  // 2. SIGNIFICANT FIGURES ROUNDING
  // ===========================
  
  test.describe('Significant Figures Rounding Testing', () => {
    
    test('should round to 1-15 significant figures correctly', async ({ page }) => {
      const testCases = [
        { input: '123456', sigFigs: 1, expected: '100,000' },
        { input: '123456', sigFigs: 2, expected: '120,000' },
        { input: '123456', sigFigs: 3, expected: '123,000' },
        { input: '123456', sigFigs: 4, expected: '123,500' },
        { input: '123456', sigFigs: 5, expected: '123,460' },
        { input: '123456', sigFigs: 6, expected: '123,456' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="significant"]');
        await page.fill('#significantFigures', testCase.sigFigs.toString());
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle leading zeros correctly in significant figures', async ({ page }) => {
      const testCases = [
        { input: '0.00123456', sigFigs: 3, expected: '0.00123' },
        { input: '0.000001234', sigFigs: 2, expected: '0.0000012' },
        { input: '0.0999', sigFigs: 1, expected: '0.1' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="significant"]');
        await page.fill('#significantFigures', testCase.sigFigs.toString());
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle scientific notation in significant figures', async ({ page }) => {
      const testCases = [
        { input: '1.23456e12', sigFigs: 3, expected: '1.23e+12' },
        { input: '1.23456e-6', sigFigs: 2, expected: '1.2e-6' },
        { input: '9.876e15', sigFigs: 1, expected: '1e+16' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="significant"]');
        await page.fill('#significantFigures', testCase.sigFigs.toString());
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toContain(testCase.expected.substring(0, 3)); // Check first part
        
        await page.click('#resetButton');
      }
    });
  });

  // ===========================
  // 3. NEAREST VALUE ROUNDING
  // ===========================
  
  test.describe('Nearest Value Rounding Testing', () => {
    
    test('should round to standard intervals correctly', async ({ page }) => {
      const testCases = [
        { input: '123', nearest: '10', expected: '120' },
        { input: '127', nearest: '10', expected: '130' },
        { input: '1234', nearest: '100', expected: '1,200' },
        { input: '1267', nearest: '100', expected: '1,300' },
        { input: '12345', nearest: '1000', expected: '12,000' },
        { input: '12567', nearest: '1000', expected: '13,000' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="nearest"]');
        await page.selectOption('#nearestValue', testCase.nearest);
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should round to decimal intervals correctly', async ({ page }) => {
      const testCases = [
        { input: '1.23', nearest: '0.1', expected: '1.2' },
        { input: '1.27', nearest: '0.1', expected: '1.3' },
        { input: '1.234', nearest: '0.01', expected: '1.23' },
        { input: '1.237', nearest: '0.01', expected: '1.24' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="nearest"]');
        await page.selectOption('#nearestValue', testCase.nearest);
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should round to custom intervals correctly', async ({ page }) => {
      const testCases = [
        { input: '23', nearest: '5', expected: '25' },
        { input: '22', nearest: '5', expected: '20' },
        { input: '137', nearest: '25', expected: '125' },
        { input: '149', nearest: '25', expected: '150' },
        { input: '74', nearest: '50', expected: '50' },
        { input: '76', nearest: '50', expected: '100' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="nearest"]');
        await page.selectOption('#nearestValue', testCase.nearest);
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle boundary values correctly', async ({ page }) => {
      // Test exact midpoint values
      const testCases = [
        { input: '125', nearest: '10', expected: '130' }, // Exactly between 120 and 130
        { input: '15', nearest: '10', expected: '20' },   // Exactly between 10 and 20
        { input: '2.5', nearest: '1', expected: '3' }     // Exactly between 2 and 3
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="nearest"]');
        await page.selectOption('#nearestValue', testCase.nearest);
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });
  });

  // ===========================
  // 4. CEILING ROUNDING
  // ===========================
  
  test.describe('Ceiling (Round Up) Testing', () => {
    
    test('should always round positive numbers up', async ({ page }) => {
      const testCases = [
        { input: '3.1', expected: '4' },
        { input: '3.9', expected: '4' },
        { input: '3.01', expected: '4' },
        { input: '3.99', expected: '4' },
        { input: '3.0', expected: '3' },  // Whole number stays same
        { input: '0.1', expected: '1' },
        { input: '10.1', expected: '11' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="ceiling"]');
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle negative numbers correctly with ceiling', async ({ page }) => {
      const testCases = [
        { input: '-3.1', expected: '-3' },  // Ceiling of -3.1 is -3 (closer to 0)
        { input: '-3.9', expected: '-3' },  // Ceiling of -3.9 is -3
        { input: '-3.0', expected: '-3' },  // Whole number stays same
        { input: '-0.1', expected: '0' }    // Ceiling of -0.1 is 0
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="ceiling"]');
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle large numbers with ceiling', async ({ page }) => {
      const testCases = [
        { input: '1234567.1', expected: '1,234,568' },
        { input: '999999.9', expected: '1,000,000' },
        { input: '0.000001', expected: '1' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="ceiling"]');
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });
  });

  // ===========================
  // 5. FLOOR ROUNDING
  // ===========================
  
  test.describe('Floor (Round Down) Testing', () => {
    
    test('should always round positive numbers down', async ({ page }) => {
      const testCases = [
        { input: '3.1', expected: '3' },
        { input: '3.9', expected: '3' },
        { input: '3.01', expected: '3' },
        { input: '3.99', expected: '3' },
        { input: '3.0', expected: '3' },  // Whole number stays same
        { input: '10.9', expected: '10' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="floor"]');
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle negative numbers correctly with floor', async ({ page }) => {
      const testCases = [
        { input: '-3.1', expected: '-4' },  // Floor of -3.1 is -4 (away from 0)
        { input: '-3.9', expected: '-4' },  // Floor of -3.9 is -4
        { input: '-3.0', expected: '-3' },  // Whole number stays same
        { input: '-0.1', expected: '-1' }   // Floor of -0.1 is -1
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="floor"]');
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle edge cases with floor', async ({ page }) => {
      const testCases = [
        { input: '0.999', expected: '0' },
        { input: '1234567.9', expected: '1,234,567' },
        { input: '0.000001', expected: '0' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="floor"]');
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });
  });

  // ===========================
  // 6. BATCH PROCESSING TESTING
  // ===========================
  
  test.describe('Batch Processing Testing', () => {
    
    test('should process multiple numbers correctly', async ({ page }) => {
      await page.fill('#numbersInput', '3.14159, 2.71828, 1.41421, 0.57721');
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '2');
      await page.click('#calculateButton');
      
      const results = await page.locator('.result-rounded .number.highlight').allTextContents();
      expect(results).toEqual(['3.14', '2.72', '1.41', '0.58']);
      
      // Check that all results are displayed
      const resultItems = await page.locator('.result-item').count();
      expect(resultItems).toBe(4);
    });

    test('should handle mixed number types in batch', async ({ page }) => {
      await page.fill('#numbersInput', '123, 456.789, 1.23e-4, -789.123');
      await page.check('input[value="significant"]');
      await page.fill('#significantFigures', '3');
      await page.click('#calculateButton');
      
      const results = await page.locator('.result-rounded .number.highlight').allTextContents();
      expect(results).toHaveLength(4);
      expect(results[0]).toBe('123');
      expect(results[1]).toBe('457');
      
      // Check that scientific notation is handled
      expect(results[2]).toContain('0.000');
      expect(results[3]).toBe('-789');
    });

    test('should handle large batch sizes efficiently', async ({ page }) => {
      // Create a batch of 20 numbers
      const numbers = Array.from({length: 20}, (_, i) => (i + 1) * 1.234567).join(', ');
      
      await page.fill('#numbersInput', numbers);
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '2');
      
      const startTime = Date.now();
      await page.click('#calculateButton');
      
      // Wait for results
      await expect(page.locator('.result-item')).toHaveCount(20);
      const endTime = Date.now();
      
      // Should process 20 numbers in under 1 second
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Verify results are displayed
      const results = await page.locator('.result-rounded .number.highlight').allTextContents();
      expect(results).toHaveLength(20);
    });
  });

  // ===========================
  // 7. SCIENTIFIC NOTATION TESTING
  // ===========================
  
  test.describe('Scientific Notation Support Testing', () => {
    
    test('should accept scientific notation input', async ({ page }) => {
      const testCases = [
        { input: '1.23e12', method: 'decimal', precision: '2' },
        { input: '5.67e-6', method: 'significant', precision: '3' },
        { input: '9.99e15', method: 'nearest', precision: '1000' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check(`input[value="${testCase.method}"]`);
        
        if (testCase.method === 'decimal') {
          await page.fill('#decimalPlaces', testCase.precision);
        } else if (testCase.method === 'significant') {
          await page.fill('#significantFigures', testCase.precision);
        } else if (testCase.method === 'nearest') {
          await page.selectOption('#nearestValue', testCase.precision);
        }
        
        await page.click('#calculateButton');
        
        // Should not show error and should display result
        await expect(page.locator('.error-message')).not.toBeVisible();
        await expect(page.locator('.result-item')).toBeVisible();
        
        await page.click('#resetButton');
      }
    });

    test('should output scientific notation for very large/small numbers', async ({ page }) => {
      const testCases = [
        { input: '123456789012345', expected: 'e+' }, // Should show scientific notation
        { input: '0.000000000123', expected: 'e-' }   // Should show scientific notation
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check('input[value="significant"]');
        await page.fill('#significantFigures', '3');
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toContain(testCase.expected);
        
        await page.click('#resetButton');
      }
    });
  });

  // ===========================
  // 8. COPY FUNCTIONALITY TESTING
  // ===========================
  
  test.describe('Copy Functionality Testing', () => {
    
    test('should show copy button after calculation', async ({ page }) => {
      await page.fill('#numbersInput', '3.14159');
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '2');
      await page.click('#calculateButton');
      
      await expect(page.locator('#copyButton')).toBeVisible();
      await expect(page.locator('#copyButton')).toContainText('Copy Results');
    });

    test('should copy single result to clipboard', async ({ page }) => {
      await page.fill('#numbersInput', '3.14159');
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '2');
      await page.click('#calculateButton');
      
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-write']);
      
      await page.click('#copyButton');
      
      // Check feedback
      await expect(page.locator('#copyButton')).toContainText('Copied!');
      
      // Wait for button text to reset
      await page.waitForTimeout(2500);
      await expect(page.locator('#copyButton')).toContainText('Copy Results');
    });

    test('should copy multiple results correctly', async ({ page }) => {
      await page.fill('#numbersInput', '3.14159, 2.71828, 1.41421');
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '2');
      await page.click('#calculateButton');
      
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-write']);
      
      await page.click('#copyButton');
      
      // Should show feedback
      await expect(page.locator('#copyButton')).toContainText('Copied!');
    });
  });

  // ===========================
  // 9. MATHEMATICAL ACCURACY TESTING
  // ===========================
  
  test.describe('Mathematical Accuracy Testing', () => {
    
    test('should handle floating point precision correctly', async ({ page }) => {
      // Test cases that are prone to floating point errors
      const testCases = [
        { input: '0.1', method: 'decimal', precision: '1', expected: '0.1' },
        { input: '0.3', method: 'decimal', precision: '1', expected: '0.3' },
        { input: '1.005', method: 'decimal', precision: '2', expected: '1.01' }, // Banker's rounding
        { input: '2.005', method: 'decimal', precision: '2', expected: '2.01' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check(`input[value="${testCase.method}"]`);
        await page.fill('#decimalPlaces', testCase.precision);
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle zero and near-zero values correctly', async ({ page }) => {
      const testCases = [
        { input: '0', method: 'decimal', precision: '2', expected: '0' },
        { input: '0.0', method: 'significant', precision: '3', expected: '0' },
        { input: '0.000001', method: 'ceiling', expected: '1' },
        { input: '0.000001', method: 'floor', expected: '0' },
        { input: '-0.000001', method: 'ceiling', expected: '0' },
        { input: '-0.000001', method: 'floor', expected: '-1' }
      ];

      for (const testCase of testCases) {
        await page.fill('#numbersInput', testCase.input);
        await page.check(`input[value="${testCase.method}"]`);
        
        if (testCase.method === 'decimal') {
          await page.fill('#decimalPlaces', testCase.precision);
        } else if (testCase.method === 'significant') {
          await page.fill('#significantFigures', testCase.precision);
        }
        
        await page.click('#calculateButton');
        
        const result = await page.locator('.result-rounded .number.highlight').first().textContent();
        expect(result).toBe(testCase.expected);
        
        await page.click('#resetButton');
      }
    });

    test('should handle boundary values for precision limits', async ({ page }) => {
      // Test maximum decimal places
      await page.fill('#numbersInput', '3.123456789012345');
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '10');
      await page.click('#calculateButton');
      
      await expect(page.locator('.result-item')).toBeVisible();
      await expect(page.locator('.error-message')).not.toBeVisible();
      
      await page.click('#resetButton');
      
      // Test maximum significant figures
      await page.fill('#numbersInput', '123456789012345');
      await page.check('input[value="significant"]');
      await page.fill('#significantFigures', '15');
      await page.click('#calculateButton');
      
      await expect(page.locator('.result-item')).toBeVisible();
      await expect(page.locator('.error-message')).not.toBeVisible();
    });
  });

  // ===========================
  // 10. ERROR HANDLING TESTING
  // ===========================
  
  test.describe('Error Handling Testing', () => {
    
    test('should validate empty input', async ({ page }) => {
      await page.click('#calculateButton');
      
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Please enter at least one number');
    });

    test('should validate invalid numbers', async ({ page }) => {
      const invalidInputs = ['abc', '1.2.3', '1,000', '1+2', ''];
      
      for (const input of invalidInputs) {
        await page.fill('#numbersInput', input);
        await page.click('#calculateButton');
        
        if (input) { // Skip empty string test
          await expect(page.locator('.error-message')).toBeVisible();
        }
        
        await page.click('#resetButton');
      }
    });

    test('should validate precision ranges', async ({ page }) => {
      await page.fill('#numbersInput', '3.14159');
      
      // Test decimal places out of range
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '15'); // Above max of 10
      await page.click('#calculateButton');
      
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Decimal places must be between 0 and 10');
      
      await page.click('#resetButton');
      
      // Test significant figures out of range
      await page.check('input[value="significant"]');
      await page.fill('#significantFigures', '20'); // Above max of 15
      await page.click('#calculateButton');
      
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('Significant figures must be between 1 and 15');
    });

    test('should handle mixed valid/invalid numbers in batch', async ({ page }) => {
      await page.fill('#numbersInput', '3.14, abc, 2.71, xyz');
      await page.click('#calculateButton');
      
      await expect(page.locator('.error-message')).toBeVisible();
      await expect(page.locator('.error-message')).toContainText('not a valid number');
    });
  });

  // ===========================
  // 11. UI INTERACTION TESTING
  // ===========================
  
  test.describe('UI Interaction Testing', () => {
    
    test('should show/hide precision fields based on method selection', async ({ page }) => {
      // Decimal places should be visible by default
      await expect(page.locator('#decimalPlacesGroup')).toBeVisible();
      await expect(page.locator('#significantFiguresGroup')).not.toBeVisible();
      await expect(page.locator('#nearestValueGroup')).not.toBeVisible();
      
      // Switch to significant figures
      await page.check('input[value="significant"]');
      await expect(page.locator('#decimalPlacesGroup')).not.toBeVisible();
      await expect(page.locator('#significantFiguresGroup')).toBeVisible();
      await expect(page.locator('#nearestValueGroup')).not.toBeVisible();
      
      // Switch to nearest value
      await page.check('input[value="nearest"]');
      await expect(page.locator('#decimalPlacesGroup')).not.toBeVisible();
      await expect(page.locator('#significantFiguresGroup')).not.toBeVisible();
      await expect(page.locator('#nearestValueGroup')).toBeVisible();
      
      // Switch to ceiling (should hide precision fieldset)
      await page.check('input[value="ceiling"]');
      await expect(page.locator('#precisionFieldset')).not.toBeVisible();
      
      // Switch to floor (should hide precision fieldset)
      await page.check('input[value="floor"]');
      await expect(page.locator('#precisionFieldset')).not.toBeVisible();
    });

    test('should support keyboard Enter key for calculation', async ({ page }) => {
      await page.fill('#numbersInput', '3.14159');
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '2');
      
      // Press Enter in the input field
      await page.press('#numbersInput', 'Enter');
      
      await expect(page.locator('.result-item')).toBeVisible();
      const result = await page.locator('.result-rounded .number.highlight').first().textContent();
      expect(result).toBe('3.14');
    });

    test('should reset form correctly', async ({ page }) => {
      // Fill form with data
      await page.fill('#numbersInput', '3.14159');
      await page.check('input[value="significant"]');
      await page.fill('#significantFigures', '4');
      await page.click('#calculateButton');
      
      // Verify results are shown
      await expect(page.locator('.result-item')).toBeVisible();
      await expect(page.locator('#copyButton')).toBeVisible();
      
      // Reset form
      await page.click('#resetButton');
      
      // Verify reset state
      await expect(page.locator('.result-item')).not.toBeVisible();
      await expect(page.locator('#copyButton')).not.toBeVisible();
      await expect(page.locator('#numbersInput')).toHaveValue('');
      await expect(page.locator('input[value="decimal"]')).toBeChecked();
      await expect(page.locator('#decimalPlacesGroup')).toBeVisible();
    });

    test('should show explanatory text for each method', async ({ page }) => {
      const methods = [
        { value: 'decimal', explanation: 'decimal place' },
        { value: 'significant', explanation: 'significant figure' },
        { value: 'nearest', explanation: 'nearest' },
        { value: 'ceiling', explanation: 'up to next whole number' },
        { value: 'floor', explanation: 'down to current whole number' }
      ];

      for (const method of methods) {
        await page.fill('#numbersInput', '3.14159');
        await page.check(`input[value="${method.value}"]`);
        
        if (method.value === 'decimal') {
          await page.fill('#decimalPlaces', '2');
        } else if (method.value === 'significant') {
          await page.fill('#significantFigures', '3');
        } else if (method.value === 'nearest') {
          await page.selectOption('#nearestValue', '10');
        }
        
        await page.click('#calculateButton');
        
        const explanation = await page.locator('.result-explanation').first().textContent();
        expect(explanation.toLowerCase()).toContain(method.explanation);
        
        await page.click('#resetButton');
      }
    });
  });

  // ===========================
  // 12. PERFORMANCE TESTING
  // ===========================
  
  test.describe('Performance Testing', () => {
    
    test('should calculate single numbers quickly', async ({ page }) => {
      await page.fill('#numbersInput', '3.14159265359');
      await page.check('input[value="decimal"]');
      await page.fill('#decimalPlaces', '5');
      
      const startTime = Date.now();
      await page.click('#calculateButton');
      await expect(page.locator('.result-item')).toBeVisible();
      const endTime = Date.now();
      
      // Should complete in under 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should handle batch processing efficiently', async ({ page }) => {
      // Create 50 numbers
      const numbers = Array.from({length: 50}, (_, i) => (i + 1) * Math.PI).join(', ');
      
      await page.fill('#numbersInput', numbers);
      await page.check('input[value="significant"]');
      await page.fill('#significantFigures', '4');
      
      const startTime = Date.now();
      await page.click('#calculateButton');
      await expect(page.locator('.result-item')).toHaveCount(50);
      const endTime = Date.now();
      
      // Should process 50 numbers in under 500ms
      expect(endTime - startTime).toBeLessThan(500);
    });

    test('should respond to UI interactions quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.check('input[value="significant"]');
      await expect(page.locator('#significantFiguresGroup')).toBeVisible();
      const endTime = Date.now();
      
      // UI should respond in under 50ms
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  // ===========================
  // 13. ACCESSIBILITY TESTING
  // ===========================
  
  test.describe('Accessibility Testing', () => {
    
    test('should have proper form labels and ARIA attributes', async ({ page }) => {
      // Check input labels
      await expect(page.locator('label[for="numbersInput"]')).toBeVisible();
      await expect(page.locator('label[for="decimalPlaces"]')).toBeVisible();
      await expect(page.locator('label[for="significantFigures"]')).toBeVisible();
      await expect(page.locator('label[for="nearestValue"]')).toBeVisible();
      
      // Check fieldset legends
      await expect(page.locator('legend')).toHaveCount(3); // Input, Method, Precision
      
      // Check button accessibility
      await expect(page.locator('#calculateButton')).toHaveAttribute('type', 'button');
      await expect(page.locator('#resetButton')).toHaveAttribute('type', 'reset');
      await expect(page.locator('#copyButton')).toHaveAttribute('type', 'button');
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab'); // Numbers input
      await expect(page.locator('#numbersInput')).toBeFocused();
      
      await page.keyboard.press('Tab'); // First radio button
      await expect(page.locator('input[value="decimal"]')).toBeFocused();
      
      // Continue tabbing through radio buttons
      await page.keyboard.press('Tab');
      await expect(page.locator('input[value="significant"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[value="nearest"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[value="ceiling"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[value="floor"]')).toBeFocused();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = await page.locator('h1').count();
      const h2 = await page.locator('h2').count();
      const h3 = await page.locator('h3').count();
      
      expect(h1).toBe(1); // Only one main heading
      expect(h2).toBeGreaterThan(0); // Section headings
      expect(h3).toBeGreaterThan(0); // Subsection headings
    });

    test('should show appropriate focus indicators', async ({ page }) => {
      await page.keyboard.press('Tab');
      
      // Check that focus is visible (this would be a visual test in real scenario)
      const focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();
    });
  });

  // ===========================
  // 14. EDUCATIONAL CONTENT TESTING
  // ===========================
  
  test.describe('Educational Content Testing', () => {
    
    test('should display method explanations correctly', async ({ page }) => {
      // Check that method cards are present
      await expect(page.locator('.method-card')).toHaveCount(5);
      
      // Check specific method explanations
      await expect(page.locator('.method-card')).toContainText(['Decimal Places', 'Significant Figures', 'Nearest Value', 'Ceiling', 'Floor']);
    });

    test('should have accurate mathematical examples', async ({ page }) => {
      // Verify examples in method cards are correct
      await expect(page.locator('.method-example')).toContainText('123.456 → 123.46');
      await expect(page.locator('.method-example')).toContainText('0.00123456 → 0.00123');
      await expect(page.locator('.method-example')).toContainText('123 → 120');
      await expect(page.locator('.method-example')).toContainText('3.1 → 4');
      await expect(page.locator('.method-example')).toContainText('3.9 → 3');
    });

    test('should have functional FAQ section', async ({ page }) => {
      // Check FAQ section exists
      await expect(page.locator('.faq-section')).toBeVisible();
      
      // Click first FAQ item
      await page.click('.faq-item:first-child .accordion');
      
      // Check that panel opens
      await expect(page.locator('.faq-item:first-child .panel')).toBeVisible();
      
      // Click again to close
      await page.click('.faq-item:first-child .accordion');
      
      // Check that panel closes
      await expect(page.locator('.faq-item:first-child .panel')).not.toBeVisible();
    });

    test('should provide helpful form help text', async ({ page }) => {
      await expect(page.locator('.form-help')).toContainText(['Enter a single number or multiple numbers separated by commas', 'Round to 0-10 decimal places', 'Round to 1-15 significant figures', 'Select the value to round to']);
    });
  });

});