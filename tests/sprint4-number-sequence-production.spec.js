/**
 * SPRINT 4: Number Sequence Calculator Production Testing
 * Focused production-ready testing for all pattern types and features
 */

const { test, expect } = require('@playwright/test');

test.describe('Number Sequence Calculator - Production Testing', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/math/basic/number-sequence-calculator/');
    await expect(page.locator('h1')).toContainText('Number Sequence Calculator');
  });

  test.describe('Pattern Recognition Core Tests', () => {
    
    test('should detect arithmetic sequences accurately', async ({ page }) => {
      const arithmeticTests = [
        { input: '2,4,6,8,10', pattern: 'Arithmetic', description: 'Basic positive arithmetic' },
        { input: '10,7,4,1,-2', pattern: 'Arithmetic', description: 'Negative difference arithmetic' },
        { input: '1.5,3.0,4.5,6.0', pattern: 'Arithmetic', description: 'Decimal arithmetic' },
        { input: '0,5,10,15,20', pattern: 'Arithmetic', description: 'Starting with zero' }
      ];

      for (const testCase of arithmeticTests) {
        console.log(`Testing: ${testCase.description}`);
        
        await page.fill('#sequenceInput', testCase.input);
        await page.click('#analyzeButton');
        
        await expect(page.locator('#patternType')).toContainText(testCase.pattern, { timeout: 3000 });
        await expect(page.locator('#resultsSection')).toBeVisible();
        
        // Verify sequence display shows numbers
        const sequenceDisplay = page.locator('.sequence-display');
        await expect(sequenceDisplay).toBeVisible();
        
        // Reset for next test
        await page.click('#resetButton');
      }
    });

    test('should detect geometric sequences accurately', async ({ page }) => {
      const geometricTests = [
        { input: '2,4,8,16,32', pattern: 'Geometric', description: 'Powers of 2' },
        { input: '3,6,12,24,48', pattern: 'Geometric', description: 'Multiplying by 2' },
        { input: '12,6,3,1.5,0.75', pattern: 'Geometric', description: 'Dividing by 2' },
        { input: '1,3,9,27,81', pattern: 'Geometric', description: 'Powers of 3' }
      ];

      for (const testCase of geometricTests) {
        console.log(`Testing: ${testCase.description}`);
        
        await page.fill('#sequenceInput', testCase.input);
        await page.click('#analyzeButton');
        
        await expect(page.locator('#patternType')).toContainText(testCase.pattern, { timeout: 3000 });
        
        // Verify formula display for geometric sequences
        const formulaDisplay = page.locator('#formulaDisplay');
        if (await formulaDisplay.isVisible()) {
          const formulaText = await formulaDisplay.textContent();
          expect(formulaText).toContain('^'); // Should contain exponent notation
        }
        
        await page.click('#resetButton');
      }
    });

    test('should detect Fibonacci sequences accurately', async ({ page }) => {
      const fibonacciTests = [
        { input: '1,1,2,3,5,8,13', pattern: 'Fibonacci', description: 'Classic Fibonacci' },
        { input: '0,1,1,2,3,5,8', pattern: 'Fibonacci', description: 'Starting with 0,1' },
        { input: '2,3,5,8,13,21', pattern: 'Fibonacci', description: 'Alternative start' }
      ];

      for (const testCase of fibonacciTests) {
        console.log(`Testing: ${testCase.description}`);
        
        await page.fill('#sequenceInput', testCase.input);
        await page.click('#analyzeButton');
        
        await expect(page.locator('#patternType')).toContainText(testCase.pattern, { timeout: 3000 });
        
        // Verify formula mentions F(n-1) + F(n-2)
        const formulaDisplay = page.locator('#formulaDisplay');
        if (await formulaDisplay.isVisible()) {
          const formulaText = await formulaDisplay.textContent();
          expect(formulaText).toContain('F(n-1) + F(n-2)');
        }
        
        await page.click('#resetButton');
      }
    });

    test('should detect prime number sequences accurately', async ({ page }) => {
      const primeTests = [
        { input: '2,3,5,7,11,13,17', pattern: 'Prime', description: 'First 7 primes' },
        { input: '5,7,11,13,17,19', pattern: 'Prime', description: 'Consecutive primes subset' },
        { input: '2,3,5,7', pattern: 'Prime', description: 'First 4 primes' }
      ];

      for (const testCase of primeTests) {
        console.log(`Testing: ${testCase.description}`);
        
        await page.fill('#sequenceInput', testCase.input);
        await page.click('#analyzeButton');
        
        await expect(page.locator('#patternType')).toContainText(testCase.pattern, { timeout: 3000 });
        
        await page.click('#resetButton');
      }
    });

    test('should detect square number sequences accurately', async ({ page }) => {
      const squareTests = [
        { input: '1,4,9,16,25,36', pattern: 'Square', description: 'Perfect squares 1²-6²' },
        { input: '4,9,16,25,36', pattern: 'Square', description: 'Perfect squares 2²-6²' },
        { input: '9,16,25,36,49', pattern: 'Square', description: 'Perfect squares 3²-7²' }
      ];

      for (const testCase of squareTests) {
        console.log(`Testing: ${testCase.description}`);
        
        await page.fill('#sequenceInput', testCase.input);
        await page.click('#analyzeButton');
        
        await expect(page.locator('#patternType')).toContainText(testCase.pattern, { timeout: 3000 });
        
        // Verify formula contains ²
        const formulaDisplay = page.locator('#formulaDisplay');
        if (await formulaDisplay.isVisible()) {
          const formulaText = await formulaDisplay.textContent();
          expect(formulaText).toContain('²');
        }
        
        await page.click('#resetButton');
      }
    });
  });

  test.describe('Generation Features Testing', () => {
    
    test('should generate arithmetic sequences correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'arithmetic');
      await page.fill('#startValue', '5');
      await page.fill('#secondValue', '8');
      await page.fill('#termCount', '10');
      
      await page.click('#generateButton');
      
      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      
      // Verify the sequence starts correctly
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers.length).toBe(10);
      expect(sequenceNumbers[0]).toBe('5');
      expect(sequenceNumbers[1]).toBe('8');
      expect(sequenceNumbers[2]).toBe('11'); // 5 + 2*3 = 11
    });

    test('should generate geometric sequences correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'geometric');
      await page.fill('#startValue', '2');
      await page.fill('#secondValue', '6');
      await page.fill('#termCount', '8');
      
      await page.click('#generateButton');
      
      await expect(page.locator('#patternType')).toContainText('Geometric');
      
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers.length).toBe(8);
      expect(sequenceNumbers[0]).toBe('2');
      expect(sequenceNumbers[1]).toBe('6');
      expect(sequenceNumbers[2]).toBe('18'); // 2 * 3² = 18
    });

    test('should generate Fibonacci sequences correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'fibonacci');
      await page.fill('#startValue', '1');
      await page.fill('#secondValue', '1');
      await page.fill('#termCount', '10');
      
      await page.click('#generateButton');
      
      await expect(page.locator('#patternType')).toContainText('Fibonacci');
      
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('1');
      expect(sequenceNumbers[1]).toBe('1');
      expect(sequenceNumbers[2]).toBe('2');
      expect(sequenceNumbers[3]).toBe('3');
      expect(sequenceNumbers[4]).toBe('5');
      expect(sequenceNumbers[5]).toBe('8');
    });

    test('should generate prime sequences correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'prime');
      await page.fill('#termCount', '8');
      
      await page.click('#generateButton');
      
      await expect(page.locator('#patternType')).toContainText('Prime');
      
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('2');
      expect(sequenceNumbers[1]).toBe('3');
      expect(sequenceNumbers[2]).toBe('5');
      expect(sequenceNumbers[3]).toBe('7');
      expect(sequenceNumbers[4]).toBe('11');
    });

    test('should generate square sequences correctly', async ({ page }) => {
      await page.selectOption('#sequenceType', 'square');
      await page.fill('#startValue', '1');
      await page.fill('#termCount', '6');
      
      await page.click('#generateButton');
      
      await expect(page.locator('#patternType')).toContainText('Square');
      
      const sequenceNumbers = await page.locator('.sequence-number').allTextContents();
      expect(sequenceNumbers[0]).toBe('1');  // 1²
      expect(sequenceNumbers[1]).toBe('4');  // 2²
      expect(sequenceNumbers[2]).toBe('9');  // 3²
      expect(sequenceNumbers[3]).toBe('16'); // 4²
      expect(sequenceNumbers[4]).toBe('25'); // 5²
      expect(sequenceNumbers[5]).toBe('36'); // 6²
    });
  });

  test.describe('Missing Terms Detection', () => {
    
    test('should find missing terms in arithmetic sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,_,8,10');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      await expect(page.locator('#missingTermsSection')).toBeVisible();
      
      const missingTermsText = await page.locator('#missingTermsDisplay').textContent();
      expect(missingTermsText).toContain('6');
    });

    test('should find missing terms in geometric sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,_,16,32');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#patternType')).toContainText('Geometric');
      await expect(page.locator('#missingTermsSection')).toBeVisible();
      
      const missingTermsText = await page.locator('#missingTermsDisplay').textContent();
      expect(missingTermsText).toContain('8');
    });

    test('should handle multiple missing terms', async ({ page }) => {
      await page.fill('#sequenceInput', '3,_,9,_,15');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      await expect(page.locator('#missingTermsSection')).toBeVisible();
      
      const missingTermsText = await page.locator('#missingTermsDisplay').textContent();
      expect(missingTermsText).toContain('6');
      expect(missingTermsText).toContain('12');
    });
  });

  test.describe('Next Terms Generation', () => {
    
    test('should generate next terms for arithmetic sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '5,10,15,20');
      await page.fill('#nextTerms', '4');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#patternType')).toContainText('Arithmetic');
      
      // Should show original sequence + next terms
      const allNumbers = await page.locator('.sequence-number').allTextContents();
      expect(allNumbers.length).toBeGreaterThan(4);
      
      // Next terms should be 25, 30, 35, 40
      const lastFour = allNumbers.slice(-4);
      expect(lastFour[0]).toBe('25');
      expect(lastFour[1]).toBe('30');
      expect(lastFour[2]).toBe('35');
      expect(lastFour[3]).toBe('40');
    });

    test('should generate next terms for Fibonacci sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '1,1,2,3,5');
      await page.fill('#nextTerms', '3');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#patternType')).toContainText('Fibonacci');
      
      const allNumbers = await page.locator('.sequence-number').allTextContents();
      // Original 5 + 3 next = 8 total
      expect(allNumbers.length).toBe(8);
      
      // Next Fibonacci numbers: 8, 13, 21
      expect(allNumbers[5]).toBe('8');  // 3+5=8
      expect(allNumbers[6]).toBe('13'); // 5+8=13
      expect(allNumbers[7]).toBe('21'); // 8+13=21
    });
  });

  test.describe('User Interface Functionality', () => {
    
    test('should toggle form sections based on sequence type selection', async ({ page }) => {
      const generationOptions = page.locator('#generationOptions');
      const analysisOptions = page.locator('#analysisOptions');
      
      // Initially generation options hidden
      await expect(generationOptions).toBeHidden();
      await expect(analysisOptions).toBeVisible();
      
      // Select arithmetic sequence
      await page.selectOption('#sequenceType', 'arithmetic');
      await expect(generationOptions).toBeVisible();
      await expect(analysisOptions).toBeHidden();
      
      // Clear selection
      await page.selectOption('#sequenceType', '');
      await expect(generationOptions).toBeHidden();
      await expect(analysisOptions).toBeVisible();
    });

    test('should display/hide sections based on checkboxes', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,6,8,10');
      
      // Uncheck formula and explanation
      await page.uncheck('#showFormula');
      await page.uncheck('#showExplanation');
      
      await page.click('#analyzeButton');
      
      await expect(page.locator('#formulaSection')).toBeHidden();
      await expect(page.locator('#explanationSection')).toBeHidden();
      
      // Check formula display
      await page.check('#showFormula');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#formulaSection')).toBeVisible();
    });

    test('should display sequence statistics correctly', async ({ page }) => {
      await page.fill('#sequenceInput', '2,4,6,8,10');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#statisticsSection')).toBeVisible();
      
      const stats = await page.locator('#statisticsDisplay').textContent();
      expect(stats).toContain('5');  // Count
      expect(stats).toContain('2');  // Min
      expect(stats).toContain('10'); // Max
      expect(stats).toContain('6');  // Average
      expect(stats).toContain('8');  // Range
      expect(stats).toContain('30'); // Sum
    });

    test('should copy sequence to clipboard', async ({ page }) => {
      await page.fill('#sequenceInput', '1,2,3,4,5');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#copySequenceButton')).toBeVisible();
      await page.click('#copySequenceButton');
      
      // Should show success message
      await expect(page.locator('#errorMessages')).toBeVisible();
      const messageText = await page.locator('#errorMessages').textContent();
      expect(messageText.toLowerCase()).toContain('copied');
    });

    test('should export sequence data', async ({ page }) => {
      await page.fill('#sequenceInput', '1,3,5,7,9');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#exportDataButton')).toBeVisible();
      
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#exportDataButton')
      ]);
      
      expect(download.suggestedFilename()).toBe('sequence-data.json');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    
    test('should handle empty input gracefully', async ({ page }) => {
      await page.click('#analyzeButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
      const errorText = await page.locator('#errorMessages').textContent();
      expect(errorText.toLowerCase()).toContain('sequence');
    });

    test('should handle insufficient data', async ({ page }) => {
      await page.fill('#sequenceInput', '5');
      await page.click('#analyzeButton');
      
      // Should show error or unknown pattern
      const hasError = await page.locator('#errorMessages').isVisible();
      const hasUnknown = await page.locator('#patternType').textContent().then(text => 
        text.toLowerCase().includes('unknown')
      );
      
      expect(hasError || hasUnknown).toBeTruthy();
    });

    test('should handle non-pattern sequences', async ({ page }) => {
      await page.fill('#sequenceInput', '1,3,7,15,31'); // No clear pattern
      await page.click('#analyzeButton');
      
      const patternType = await page.locator('#patternType').textContent();
      expect(patternType.toLowerCase()).toContain('unknown');
    });

    test('should handle invalid input gracefully', async ({ page }) => {
      await page.fill('#sequenceInput', '1,2,abc,4');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#errorMessages')).toBeVisible();
    });

    test('should reset calculator completely', async ({ page }) => {
      // Set up state
      await page.fill('#sequenceInput', '1,2,3,4');
      await page.selectOption('#sequenceType', 'arithmetic');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Reset
      await page.click('#resetButton');
      
      // Verify reset
      await expect(page.locator('#sequenceInput')).toHaveValue('');
      await expect(page.locator('#sequenceType')).toHaveValue('');
      await expect(page.locator('#resultsSection')).toBeHidden();
      await expect(page.locator('#errorMessages')).toBeHidden();
    });
  });

  test.describe('Performance and Responsiveness', () => {
    
    test('should analyze sequences quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.fill('#sequenceInput', '1,4,9,16,25,36,49,64,81,100');
      await page.click('#analyzeButton');
      
      await expect(page.locator('#patternType')).toBeVisible({ timeout: 2000 });
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete quickly
    });

    test('should be mobile responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.fill('#sequenceInput', '2,4,6,8');
      await page.click('#analyzeButton');
      
      await expect(page.locator('.results-grid')).toBeVisible();
      await expect(page.locator('.sequence-display')).toBeVisible();
    });

    test('should handle maximum term generation efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await page.selectOption('#sequenceType', 'arithmetic');
      await page.fill('#startValue', '1');
      await page.fill('#secondValue', '2');
      await page.fill('#termCount', '50');
      
      await page.click('#generateButton');
      
      await expect(page.locator('.sequence-number').first()).toBeVisible({ timeout: 3000 });
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  test.describe('Educational Content Accuracy', () => {
    
    test('should provide accurate formulas for different sequence types', async ({ page }) => {
      // Test arithmetic formula
      await page.fill('#sequenceInput', '5,8,11,14,17');
      await page.click('#analyzeButton');
      
      const formulaText = await page.locator('#formulaDisplay').textContent();
      expect(formulaText).toContain('5 + (n-1) × 3');
      
      await page.click('#resetButton');
      
      // Test geometric formula
      await page.fill('#sequenceInput', '3,6,12,24,48');
      await page.click('#analyzeButton');
      
      const geometricFormula = await page.locator('#formulaDisplay').textContent();
      expect(geometricFormula).toContain('3 × 2^(n-1)');
    });

    test('should provide helpful explanations', async ({ page }) => {
      await page.fill('#sequenceInput', '10,15,20,25');
      await page.click('#analyzeButton');
      
      const explanation = await page.locator('#explanationDisplay').textContent();
      expect(explanation.toLowerCase()).toContain('arithmetic');
      expect(explanation.toLowerCase()).toContain('difference');
    });
  });
});

// Quick smoke test for all major functionality
test.describe('Smoke Tests', () => {
  
  test('should load calculator page successfully', async ({ page }) => {
    await page.goto('/math/basic/number-sequence-calculator/');
    
    // Basic page elements
    await expect(page.locator('h1')).toContainText('Number Sequence Calculator');
    await expect(page.locator('#sequenceInput')).toBeVisible();
    await expect(page.locator('#analyzeButton')).toBeVisible();
    await expect(page.locator('#generateButton')).toBeVisible();
    await expect(page.locator('#resetButton')).toBeVisible();
  });

  test('should complete basic workflow successfully', async ({ page }) => {
    await page.goto('/math/basic/number-sequence-calculator/');
    
    // Input and analyze
    await page.fill('#sequenceInput', '2,4,6,8,10');
    await page.click('#analyzeButton');
    
    // Verify results
    await expect(page.locator('#patternType')).toContainText('Arithmetic');
    await expect(page.locator('#resultsSection')).toBeVisible();
    await expect(page.locator('.sequence-display')).toBeVisible();
    
    // Test generation
    await page.selectOption('#sequenceType', 'fibonacci');
    await page.fill('#termCount', '8');
    await page.click('#generateButton');
    
    await expect(page.locator('#patternType')).toContainText('Fibonacci');
    
    // Test reset
    await page.click('#resetButton');
    await expect(page.locator('#resultsSection')).toBeHidden();
  });
});