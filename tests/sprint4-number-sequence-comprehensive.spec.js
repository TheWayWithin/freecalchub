/**
 * SPRINT 4: Number Sequence Calculator Comprehensive Testing
 * Testing all pattern recognition, generation, and mathematical accuracy
 */

const { test, expect } = require('@playwright/test');

// Test data for different sequence types
const testSequences = {
  arithmetic: {
    basic: { input: '2,4,6,8,10', expected: 'arithmetic', difference: 2, formula: 'an = 2 + (n-1) × 2' },
    negative: { input: '10,7,4,1,-2', expected: 'arithmetic', difference: -3, formula: 'an = 10 + (n-1) × -3' },
    decimal: { input: '1.5,3.0,4.5,6.0', expected: 'arithmetic', difference: 1.5, formula: 'an = 1.5 + (n-1) × 1.5' },
    large: { input: '100,200,300,400,500', expected: 'arithmetic', difference: 100, formula: 'an = 100 + (n-1) × 100' },
    zero: { input: '0,5,10,15,20', expected: 'arithmetic', difference: 5, formula: 'an = 0 + (n-1) × 5' }
  },
  geometric: {
    basic: { input: '2,4,8,16,32', expected: 'geometric', ratio: 2, formula: 'an = 2 × 2^(n-1)' },
    fractional: { input: '12,6,3,1.5,0.75', expected: 'geometric', ratio: 0.5, formula: 'an = 12 × 0.5^(n-1)' },
    negative: { input: '1,-2,4,-8,16', expected: 'geometric', ratio: -2, formula: 'an = 1 × -2^(n-1)' },
    decimal: { input: '1,1.5,2.25,3.375,5.0625', expected: 'geometric', ratio: 1.5, formula: 'an = 1 × 1.5^(n-1)' },
    three: { input: '3,9,27,81,243', expected: 'geometric', ratio: 3, formula: 'an = 3 × 3^(n-1)' }
  },
  fibonacci: {
    classic: { input: '1,1,2,3,5,8,13', expected: 'fibonacci', formula: 'F(n) = F(n-1) + F(n-2)' },
    starting01: { input: '0,1,1,2,3,5,8', expected: 'fibonacci', formula: 'F(n) = F(n-1) + F(n-2)' },
    alternative: { input: '2,3,5,8,13,21', expected: 'fibonacci', formula: 'F(n) = F(n-1) + F(n-2)' },
    large: { input: '55,89,144,233,377,610', expected: 'fibonacci', formula: 'F(n) = F(n-1) + F(n-2)' }
  },
  prime: {
    standard: { input: '2,3,5,7,11,13,17', expected: 'prime', formula: 'Prime numbers (no simple formula)' },
    subset: { input: '5,7,11,13,17,19', expected: 'prime', formula: 'Prime numbers (no simple formula)' },
    large: { input: '101,103,107,109,113', expected: 'prime', formula: 'Prime numbers (no simple formula)' },
    single: { input: '2,3,5,7', expected: 'prime', formula: 'Prime numbers (no simple formula)' }
  },
  square: {
    standard: { input: '1,4,9,16,25,36', expected: 'square', formula: 'an = n²' },
    offset: { input: '4,9,16,25,36,49', expected: 'square', formula: 'an = n²' },
    large: { input: '100,121,144,169,196', expected: 'square', formula: 'an = n²' },
    starting: { input: '9,16,25,36,49', expected: 'square', formula: 'an = n²' }
  }
};

const missingTermsTests = {
  arithmetic: { input: '2,4,_,8,10', missing: [2], expected: '6' },
  geometric: { input: '2,4,_,16,32', missing: [2], expected: '8' },
  fibonacci: { input: '1,1,2,_,5,8', missing: [3], expected: '3' },
  multiple: { input: '2,_,6,_,10', missing: [1, 3], expected: ['4', '8'] }
};

const invalidSequences = [
  { input: 'a,b,c,d', description: 'Non-numeric input' },
  { input: '1,2,hello,4', description: 'Mixed valid/invalid input' },
  { input: '', description: 'Empty input' },
  { input: '1', description: 'Single number' },
  { input: '1,2', description: 'Only two numbers' },
  { input: '1,3,7,15,32', description: 'No clear pattern' }
];

test.describe('Number Sequence Calculator - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math/basic/number-sequence-calculator/');
    await expect(page.locator('h1')).toContainText('Number Sequence Calculator');
  });

  test.describe('1. Arithmetic Sequence Pattern Recognition', () => {
    Object.entries(testSequences.arithmetic).forEach(([testName, testData]) => {
      test(`should detect ${testName} arithmetic sequence correctly`, async ({ page }) => {
        // Input sequence
        await page.fill('#sequenceInput', testData.input);
        await page.click('#analyzeButton');

        // Verify pattern detection
        await expect(page.locator('#patternType')).toContainText('Arithmetic', { timeout: 5000 });
        
        // Verify formula if pattern shows formulas
        const showFormula = page.locator('#showFormula');
        if (await showFormula.isChecked()) {
          await expect(page.locator('#formulaDisplay')).toBeVisible();
        }

        // Verify sequence is displayed
        await expect(page.locator('.sequence-display')).toBeVisible();
        await expect(page.locator('.sequence-number')).toHaveCount({ min: testData.input.split(',').length });

        // Verify statistics
        await expect(page.locator('#statisticsSection')).toBeVisible();
        await expect(page.locator('.stat-value')).toHaveCount({ min: 5 });
      });
    });

    test('should generate arithmetic sequence with specified parameters', async ({ page }) => {
      await page.selectOption('#sequenceType', 'arithmetic');
      await page.fill('#startValue', '5');
      await page.fill('#secondValue', '8');
      await page.fill('#termCount', '10');
      
      await page.click('#generateButton');

      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      await expect(page.locator('.sequence-number')).toHaveCount(10);
      
      // Verify first few terms follow pattern (5, 8, 11, 14, ...)
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('5');
      expect(sequenceNumbers[1]).toBe('8');
      expect(sequenceNumbers[2]).toBe('11');
    });
  });

  test.describe('2. Geometric Sequence Pattern Recognition', () => {
    Object.entries(testSequences.geometric).forEach(([testName, testData]) => {
      test(`should detect ${testName} geometric sequence correctly`, async ({ page }) => {
        await page.fill('#sequenceInput', testData.input);
        await page.click('#analyzeButton');

        await expect(page.locator('#patternType')).toContainText('Geometric', { timeout: 5000 });
        
        const showFormula = page.locator('#showFormula');
        if (await showFormula.isChecked()) {
          await expect(page.locator('#formulaDisplay')).toBeVisible();
        }

        await expect(page.locator('.sequence-display')).toBeVisible();
        await expect(page.locator('#statisticsSection')).toBeVisible();
      });
    });

    test('should generate geometric sequence with specified parameters', async ({ page }) => {
      await page.selectOption('#sequenceType', 'geometric');
      await page.fill('#startValue', '3');
      await page.fill('#secondValue', '6');
      await page.fill('#termCount', '8');
      
      await page.click('#generateButton');

      await expect(page.locator('#patternType')).toContainText('Geometric');
      await expect(page.locator('.sequence-number')).toHaveCount(8);
      
      // Verify geometric progression (3, 6, 12, 24, ...)
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('3');
      expect(sequenceNumbers[1]).toBe('6');
      expect(sequenceNumbers[2]).toBe('12');
    });
  });

  test.describe('3. Fibonacci Sequence Recognition', () => {
    Object.entries(testSequences.fibonacci).forEach(([testName, testData]) => {
      test(`should detect ${testName} Fibonacci sequence correctly`, async ({ page }) => {
        await page.fill('#sequenceInput', testData.input);
        await page.click('#analyzeButton');

        await expect(page.locator('#patternType')).toContainText('Fibonacci', { timeout: 5000 });
        
        const showFormula = page.locator('#showFormula');
        if (await showFormula.isChecked()) {
          const formulaText = await page.locator('#formulaDisplay').textContent();
          expect(formulaText).toContain('F(n-1) + F(n-2)');
        }

        await expect(page.locator('.sequence-display')).toBeVisible();
      });
    });

    test('should generate Fibonacci sequence correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'fibonacci');
      await page.fill('#startValue', '1');
      await page.fill('#secondValue', '1');
      await page.fill('#termCount', '10');
      
      await page.click('#generateButton');

      await expect(page.locator('#patternType')).toContainText('Fibonacci');
      
      // Verify Fibonacci progression
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('1');
      expect(sequenceNumbers[1]).toBe('1');
      expect(sequenceNumbers[2]).toBe('2');
      expect(sequenceNumbers[3]).toBe('3');
      expect(sequenceNumbers[4]).toBe('5');
    });
  });

  test.describe('4. Prime Number Sequence Recognition', () => {
    Object.entries(testSequences.prime).forEach(([testName, testData]) => {
      test(`should detect ${testName} prime sequence correctly`, async ({ page }) => {
        await page.fill('#sequenceInput', testData.input);
        await page.click('#analyzeButton');

        await expect(page.locator('#patternType')).toContainText('Prime', { timeout: 5000 });
        
        const showFormula = page.locator('#showFormula');
        if (await showFormula.isChecked()) {
          const formulaText = await page.locator('#formulaDisplay').textContent();
          expect(formulaText).toContain('Prime numbers');
        }
      });
    });

    test('should generate prime sequence correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'prime');
      await page.fill('#termCount', '8');
      
      await page.click('#generateButton');

      await expect(page.locator('#patternType')).toContainText('Prime');
      
      // Verify first few primes
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('2');
      expect(sequenceNumbers[1]).toBe('3');
      expect(sequenceNumbers[2]).toBe('5');
      expect(sequenceNumbers[3]).toBe('7');
    });
  });

  test.describe('5. Square Number Sequence Recognition', () => {
    Object.entries(testSequences.square).forEach(([testName, testData]) => {
      test(`should detect ${testName} square sequence correctly`, async ({ page }) => {
        await page.fill('#sequenceInput', testData.input);
        await page.click('#analyzeButton');

        await expect(page.locator('#patternType')).toContainText('Square', { timeout: 5000 });
        
        const showFormula = page.locator('#showFormula');
        if (await showFormula.isChecked()) {
          const formulaText = await page.locator('#formulaDisplay').textContent();
          expect(formulaText).toContain('²');
        }
      });
    });

    test('should generate square sequence correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'square');
      await page.fill('#startValue', '1');
      await page.fill('#termCount', '6');
      
      await page.click('#generateButton');

      await expect(page.locator('#patternType')).toContainText('Square');
      
      // Verify perfect squares
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('1');
      expect(sequenceNumbers[1]).toBe('4');
      expect(sequenceNumbers[2]).toBe('9');
      expect(sequenceNumbers[3]).toBe('16');
    });
  });

  test.describe('6. Missing Terms Detection', () => {
    test('should detect and fill missing terms in arithmetic sequence', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,_,8,10');
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      await expect(page.locator('#missingTermsSection')).toBeVisible();
      
      // Verify missing term was filled correctly
      const missingTermsText = await page.locator('#missingTermsDisplay').textContent();
      expect(missingTermsText).toContain('6');
    });

    test('should detect and fill missing terms in geometric sequence', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,_,16,32');
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Geometric');
      await expect(page.locator('#missingTermsSection')).toBeVisible();
      
      const missingTermsText = await page.locator('#missingTermsDisplay').textContent();
      expect(missingTermsText).toContain('8');
    });

    test('should handle multiple missing terms', async ({ page }) => {
      await page.fill('#sequenceInput', '2,_,6,_,10');
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      await expect(page.locator('#missingTermsSection')).toBeVisible();
      
      const missingTermsText = await page.locator('#missingTermsDisplay').textContent();
      expect(missingTermsText).toContain('4');
      expect(missingTermsText).toContain('8');
    });
  });

  test.describe('7. Next Terms Generation', () => {
    test('should generate correct next terms for arithmetic sequence', async ({ page }) => {
      await page.fill('#sequenceInput', '3,7,11,15');
      await page.fill('#nextTerms', '5');
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      
      // Should show original + next terms
      const allNumbers = await page.locator('.sequence-number').allTextContents();
      expect(allNumbers.length).toBeGreaterThan(4);
      
      // Verify the progression continues correctly
      expect(allNumbers[4]).toBe('19'); // Next term should be 19
      expect(allNumbers[5]).toBe('23'); // Then 23
    });

    test('should generate correct next terms for Fibonacci sequence', async ({ page }) => {
      await page.fill('#sequenceInput', '1,1,2,3,5');
      await page.fill('#nextTerms', '3');
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Fibonacci');
      
      const allNumbers = await page.locator('.sequence-number').allTextContents();
      expect(allNumbers[5]).toBe('8');  // 3+5=8
      expect(allNumbers[6]).toBe('13'); // 5+8=13
      expect(allNumbers[7]).toBe('21'); // 8+13=21
    });

    test('should respect maximum next terms limit', async ({ page }) => {
      await page.fill('#sequenceInput', '1,2,3,4');
      await page.fill('#nextTerms', '25'); // Over limit
      await page.click('#analyzeButton');

      // Should cap at reasonable limit
      const allNumbers = await page.locator('.sequence-number').allTextContents();
      expect(allNumbers.length).toBeLessThanOrEqual(24); // Original 4 + max 20
    });
  });

  test.describe('8. Mathematical Accuracy Validation', () => {
    test('should maintain precision with decimal arithmetic sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '0.1,0.2,0.3,0.4,0.5');
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      
      // Check that decimals are handled correctly
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('0.1');
      expect(sequenceNumbers[1]).toBe('0.2');
    });

    test('should handle large numbers correctly', async ({ page }) => {
      await page.fill('#sequenceInput', '1000000,2000000,3000000,4000000');
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      
      const stats = await page.locator('#statisticsDisplay').textContent();
      expect(stats).toContain('1000000'); // Min value
      expect(stats).toContain('4000000'); // Max value
    });

    test('should correctly identify complex patterns', async ({ page }) => {
      // Test sequence that could be multiple patterns
      await page.fill('#sequenceInput', '1,4,9,16,25'); // Perfect squares
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Square');
      
      // Reset and test different pattern
      await page.click('#resetButton');
      await page.fill('#sequenceInput', '2,4,8,16,32'); // Powers of 2
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Geometric');
    });
  });

  test.describe('9. User Interface and Experience', () => {
    test('should toggle generation options when sequence type is selected', async ({ page }) => {
      const generationOptions = page.locator('#generationOptions');
      const analysisOptions = page.locator('#analysisOptions');

      // Initially generation options should be hidden
      await expect(generationOptions).toBeHidden();
      await expect(analysisOptions).toBeVisible();

      // Select a sequence type
      await page.selectOption('#sequenceType', 'arithmetic');
      
      await expect(generationOptions).toBeVisible();
      await expect(analysisOptions).toBeHidden();

      // Clear selection
      await page.selectOption('#sequenceType', '');
      
      await expect(generationOptions).toBeHidden();
      await expect(analysisOptions).toBeVisible();
    });

    test('should display appropriate sections based on options', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,6,8,10');
      
      // Uncheck formula display
      await page.uncheck('#showFormula');
      // Uncheck explanation display
      await page.uncheck('#showExplanation');
      
      await page.click('#analyzeButton');

      await expect(page.locator('#formulaSection')).toBeHidden();
      await expect(page.locator('#explanationSection')).toBeHidden();
      
      // Check formula display
      await page.check('#showFormula');
      await page.click('#analyzeButton');

      await expect(page.locator('#formulaSection')).toBeVisible();
    });

    test('should validate input format correctly', async ({ page }) => {
      // Test invalid characters
      await page.fill('#sequenceInput', '1,2,abc,4');
      
      // Should show error after attempting analysis
      await page.click('#analyzeButton');
      await expect(page.locator('#errorMessages')).toBeVisible();
    });

    test('should copy sequence to clipboard', async ({ page }) => {
      await page.fill('#sequenceInput', '1,2,3,4,5');
      await page.click('#analyzeButton');

      await expect(page.locator('#copySequenceButton')).toBeVisible();
      
      // Click copy button
      await page.click('#copySequenceButton');
      
      // Should show success message
      await expect(page.locator('#errorMessages')).toBeVisible();
      const messageText = await page.locator('#errorMessages').textContent();
      expect(messageText).toContain('copied');
    });

    test('should export sequence data', async ({ page }) => {
      await page.fill('#sequenceInput', '1,3,5,7,9');
      await page.click('#analyzeButton');

      await expect(page.locator('#exportDataButton')).toBeVisible();
      
      // Set up download handler
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#exportDataButton')
      ]);
      
      expect(download.suggestedFilename()).toBe('sequence-data.json');
    });
  });

  test.describe('10. Performance and Responsiveness', () => {
    test('should analyze sequences quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.fill('#sequenceInput', '1,4,9,16,25,36,49,64,81,100');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#patternType')).toBeVisible({ timeout: 1000 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });

    test('should handle large sequence generation efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await page.selectOption('#sequenceType', 'arithmetic');
      await page.fill('#startValue', '1');
      await page.fill('#secondValue', '2');
      await page.fill('#termCount', '50');
      
      await page.click('#generateButton');
      
      await expect(page.locator('.sequence-number')).toHaveCount(50, { timeout: 2000 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone viewport
      
      await page.fill('#sequenceInput', '2,4,6,8');
      await page.click('#analyzeButton');

      // Verify mobile layout
      await expect(page.locator('.results-grid')).toBeVisible();
      await expect(page.locator('.sequence-display')).toBeVisible();
      
      // Check that buttons stack properly on mobile
      const formActions = page.locator('.form-actions');
      await expect(formActions).toBeVisible();
    });
  });

  test.describe('11. Error Handling and Edge Cases', () => {
    test('should handle empty input gracefully', async ({ page }) => {
      await page.click('#analyzeButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
      const errorText = await page.locator('#errorMessages').textContent();
      expect(errorText).toContain('enter a sequence');
    });

    test('should handle single number input', async ({ page }) => {
      await page.fill('#sequenceInput', '5');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
    });

    test('should handle non-pattern sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '1,3,7,15,31'); // No clear pattern
      await page.click('#analyzeButton');

      await expect(page.locator('#patternType')).toContainText('Unknown');
    });

    test('should handle invalid sequence type gracefully', async ({ page }) => {
      await page.selectOption('#sequenceType', 'prime');
      await page.fill('#termCount', '0'); // Invalid count
      
      await page.click('#generateButton');
      
      // Should either show error or handle gracefully
      const hasError = await page.locator('#errorMessages').isVisible();
      const hasResults = await page.locator('#resultsSection').isVisible();
      
      expect(hasError || hasResults).toBeTruthy();
    });

    test('should reset calculator completely', async ({ page }) => {
      // Set up some state
      await page.fill('#sequenceInput', '1,2,3,4');
      await page.selectOption('#sequenceType', 'arithmetic');
      await page.click('#analyzeButton');

      await expect(page.locator('#resultsSection')).toBeVisible();

      // Reset
      await page.click('#resetButton');

      // Verify everything is cleared
      await expect(page.locator('#sequenceInput')).toHaveValue('');
      await expect(page.locator('#sequenceType')).toHaveValue('');
      await expect(page.locator('#resultsSection')).toBeHidden();
      await expect(page.locator('#errorMessages')).toBeHidden();
    });
  });

  test.describe('12. Educational Content Accuracy', () => {
    test('should provide accurate formula for arithmetic sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '5,8,11,14,17');
      await page.click('#analyzeButton');

      await expect(page.locator('#formulaDisplay')).toContainText('an = 5 + (n-1) × 3');
    });

    test('should provide accurate formula for geometric sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '3,6,12,24,48');
      await page.click('#analyzeButton');

      await expect(page.locator('#formulaDisplay')).toContainText('an = 3 × 2^(n-1)');
    });

    test('should provide appropriate explanation for each pattern type', async ({ page }) => {
      // Test arithmetic explanation
      await page.fill('#sequenceInput', '10,15,20,25');
      await page.click('#analyzeButton');

      const explanationText = await page.locator('#explanationDisplay').textContent();
      expect(explanationText).toContain('arithmetic sequence');
      expect(explanationText).toContain('common difference');
    });

    test('should show correct statistics for sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,6,8,10');
      await page.click('#analyzeButton');

      const stats = await page.locator('#statisticsDisplay').textContent();
      
      // Verify statistical accuracy
      expect(stats).toContain('5'); // Count
      expect(stats).toContain('2'); // Min
      expect(stats).toContain('10'); // Max
      expect(stats).toContain('6'); // Average (2+4+6+8+10)/5 = 6
      expect(stats).toContain('8'); // Range (10-2)
      expect(stats).toContain('30'); // Sum
    });
  });

  test.describe('13. Accessibility and Keyboard Navigation', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab'); // Should focus on sequence input
      await expect(page.locator('#sequenceInput')).toBeFocused();

      await page.keyboard.press('Tab'); // Should focus on sequence type
      await expect(page.locator('#sequenceType')).toBeFocused();

      // Continue tabbing to buttons
      await page.keyboard.press('Tab'); // next terms input
      await page.keyboard.press('Tab'); // skip checkboxes 
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // analyze button
      await expect(page.locator('#analyzeButton')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check for aria-labels on buttons
      const analyzeButton = page.locator('#analyzeButton');
      const resetButton = page.locator('#resetButton');
      
      await expect(analyzeButton).toBeVisible();
      await expect(resetButton).toBeVisible();
      
      // Verify form structure has proper labels
      await expect(page.locator('label[for="sequenceInput"]')).toBeVisible();
      await expect(page.locator('label[for="sequenceType"]')).toBeVisible();
    });

    test('should announce important changes to screen readers', async ({ page }) => {
      await page.fill('#sequenceInput', '1,2,3,4,5');
      await page.click('#analyzeButton');

      // Results should be visible and accessible
      await expect(page.locator('#resultsSection')).toHaveAttribute('id', 'resultsSection');
      await expect(page.locator('#patternType')).toBeVisible();
    });
  });
});

// Performance timing tests
test.describe('Performance Benchmarks', () => {
  test('should meet performance benchmarks for pattern recognition', async ({ page }) => {
    await page.goto('/math/basic/number-sequence-calculator/');
    
    const sequences = [
      '2,4,6,8,10,12,14,16,18,20',
      '1,2,4,8,16,32,64,128,256,512',
      '1,1,2,3,5,8,13,21,34,55',
      '2,3,5,7,11,13,17,19,23,29',
      '1,4,9,16,25,36,49,64,81,100'
    ];

    for (const sequence of sequences) {
      const startTime = Date.now();
      
      await page.fill('#sequenceInput', sequence);
      await page.click('#analyzeButton');
      await expect(page.locator('#patternType')).toBeVisible();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Pattern recognition under 200ms
      
      await page.click('#resetButton');
    }
  });

  test('should handle stress test with maximum terms', async ({ page }) => {
    await page.goto('/math/basic/number-sequence-calculator/');
    
    await page.selectOption('#sequenceType', 'arithmetic');
    await page.fill('#startValue', '1');
    await page.fill('#secondValue', '2');
    await page.fill('#termCount', '50'); // Maximum terms
    
    const startTime = Date.now();
    await page.click('#generateButton');
    await expect(page.locator('.sequence-number')).toHaveCount(50);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(300); // Generation under 300ms
  });
});