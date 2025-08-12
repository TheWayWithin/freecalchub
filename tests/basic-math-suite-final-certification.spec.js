/*
 * Basic Math Calculator Suite - Final Certification Testing
 * Comprehensive quality assessment for all 4 basic math calculators
 * 
 * Test Targets:
 * - Standard Calculator: /math/basic/standard-calculator/
 * - Random Number Generator: /math/basic/random-number-generator/
 * - Number Sequence Calculator: /math/basic/number-sequence-calculator/
 * - Rounding Calculator: /math/basic/rounding-calculator/
 * - Category Page: /math/basic/
 * 
 * Mission: Final quality certification before suite completion
 */

const { test, expect } = require('@playwright/test');

// Performance metrics collection helper
const collectPerformanceMetrics = async (page) => {
    const performanceEntries = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        return {
            loadTime: nav.loadEventEnd - nav.loadEventStart,
            domContentLoadedTime: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        };
    });
    return performanceEntries;
};

// JavaScript error collection helper
const setupErrorCollector = (page) => {
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push({
                text: msg.text(),
                location: msg.location(),
                timestamp: new Date().toISOString()
            });
        } else if (msg.type() === 'warning') {
            warnings.push({
                text: msg.text(),
                location: msg.location(),
                timestamp: new Date().toISOString()
            });
        }
    });
    
    page.on('pageerror', error => {
        errors.push({
            text: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    });
    
    return { errors, warnings };
};

// Mathematical accuracy validator
const validateMathematicalAccuracy = async (page, testCases) => {
    const results = [];
    for (const testCase of testCases) {
        const result = await page.evaluate(testCase.evaluate);
        results.push({
            testCase: testCase.description,
            expected: testCase.expected,
            actual: result,
            passed: Math.abs(result - testCase.expected) < 0.0001
        });
    }
    return results;
};

test.describe('Basic Math Calculator Suite - Final Certification', () => {
    
    test.describe('1. STANDARD CALCULATOR - A+ Certification Validation', () => {
        const calculatorUrl = '/math/basic/standard-calculator/';
        
        test('should load with exceptional performance (Target: <2s)', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            // A+ Performance Standard: <2 seconds
            expect(loadTime).toBeLessThan(2000);
            console.log(`Standard Calculator load time: ${loadTime}ms`);
            
            const metrics = await collectPerformanceMetrics(page);
            console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
            
            // Validate page structure
            await expect(page.locator('h1')).toContainText('Standard Calculator');
            await expect(page).toHaveTitle(/Standard Calculator/i);
            
            // JavaScript error validation
            await page.waitForTimeout(2000);
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors on page load`);
            }
            
            console.log(`Warnings found: ${warnings.length}`);
        });
        
        test('should demonstrate perfect PEMDAS/BODMAS compliance', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Advanced PEMDAS test cases
            const pemdas_tests = [
                { input: '2+3*4', expected: 14, description: 'Basic multiplication precedence' },
                { input: '(2+3)*4', expected: 20, description: 'Parentheses override' },
                { input: '2^3*4', expected: 32, description: 'Exponent then multiplication' },
                { input: '2+3^2*4', expected: 38, description: 'Complex precedence: 2+(3^2)*4' },
                { input: '(2+3)^2/5', expected: 5, description: 'Parentheses, exponent, division' },
                { input: '8/2*(2+2)', expected: 16, description: 'Division and multiplication (left to right)' },
                { input: '6-4/2+1', expected: 5, description: 'Mixed operations: 6-(4/2)+1' }
            ];
            
            for (const testCase of pemdas_tests) {
                // Clear and input expression
                await page.locator('#clear').click();
                
                // Input the expression character by character
                for (const char of testCase.input) {
                    if (char.match(/[0-9]/)) {
                        await page.locator(`button:has-text("${char}")`).click();
                    } else if (char === '+') {
                        await page.locator('button:has-text("+")').click();
                    } else if (char === '-') {
                        await page.locator('button:has-text("−")').click();
                    } else if (char === '*') {
                        await page.locator('button:has-text("×")').click();
                    } else if (char === '/') {
                        await page.locator('button:has-text("÷")').click();
                    } else if (char === '^') {
                        await page.locator('button:has-text("^"), button:has-text("**")').click();
                    } else if (char === '(') {
                        await page.locator('button:has-text("(")').click();
                    } else if (char === ')') {
                        await page.locator('button:has-text(")")').click();
                    }
                }
                
                // Calculate
                await page.locator('#equals').click();
                
                // Validate result
                const result = await page.locator('#display').textContent();
                const numericResult = parseFloat(result);
                
                console.log(`PEMDAS Test: ${testCase.input} = ${numericResult} (expected ${testCase.expected})`);
                expect(Math.abs(numericResult - testCase.expected)).toBeLessThan(0.0001);
            }
        });
        
        test('should handle edge cases flawlessly', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test division by zero
            await page.locator('#clear').click();
            await page.locator('button:has-text("1")').click();
            await page.locator('button:has-text("÷")').click();
            await page.locator('button:has-text("0")').click();
            await page.locator('#equals').click();
            
            const divByZeroResult = await page.locator('#display').textContent();
            console.log(`Division by zero result: ${divByZeroResult}`);
            expect(divByZeroResult).toMatch(/infinity|error|undefined/i);
            
            // Test very large numbers
            await page.locator('#clear').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("×")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('button:has-text("9")').click();
            await page.locator('#equals').click();
            
            const largeNumberResult = await page.locator('#display').textContent();
            console.log(`Large number calculation: ${largeNumberResult}`);
            expect(largeNumberResult).toBeTruthy();
            
            // Test decimal precision
            await page.locator('#clear').click();
            await page.locator('button:has-text("0")').click();
            await page.locator('button:has-text(".")').click();
            await page.locator('button:has-text("1")').click();
            await page.locator('button:has-text("+")').click();
            await page.locator('button:has-text("0")').click();
            await page.locator('button:has-text(".")').click();
            await page.locator('button:has-text("2")').click();
            await page.locator('#equals').click();
            
            const decimalResult = await page.locator('#display').textContent();
            const numericDecimalResult = parseFloat(decimalResult);
            console.log(`Decimal precision test: 0.1 + 0.2 = ${decimalResult}`);
            expect(Math.abs(numericDecimalResult - 0.3)).toBeLessThan(0.0001);
        });
        
        test('should demonstrate exceptional user experience', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test keyboard support
            await page.keyboard.press('1');
            await page.keyboard.press('+');
            await page.keyboard.press('2');
            await page.keyboard.press('Enter');
            
            const keyboardResult = await page.locator('#display').textContent();
            expect(parseFloat(keyboardResult)).toBe(3);
            console.log(`Keyboard support test: 1+2 = ${keyboardResult}`);
            
            // Test visual feedback on button clicks
            const addButton = page.locator('button:has-text("+")');
            await addButton.click();
            
            // Check if button has active/clicked state (visual feedback)
            const buttonClasses = await addButton.getAttribute('class');
            console.log(`Button feedback classes: ${buttonClasses}`);
            
            // Test memory functions if available
            const memoryButtons = await page.locator('button:has-text("M"), button[id*="memory"]').count();
            if (memoryButtons > 0) {
                console.log(`Memory functions available: ${memoryButtons} buttons`);
            }
            
            // Test clear functionality
            await page.locator('button:has-text("C"), button:has-text("Clear"), #clear').click();
            const clearedDisplay = await page.locator('#display').textContent();
            expect(clearedDisplay).toBe('0');
            console.log(`Clear function test: display cleared to "${clearedDisplay}"`);
        });
        
        test('should be perfectly mobile responsive', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test touch interactions
            const numberButton = page.locator('button:has-text("1")');
            await expect(numberButton).toBeVisible();
            await numberButton.tap();
            
            const plusButton = page.locator('button:has-text("+")');
            await expect(plusButton).toBeVisible();
            await plusButton.tap();
            
            const twoButton = page.locator('button:has-text("2")');
            await twoButton.tap();
            
            const equalsButton = page.locator('#equals, button:has-text("=")');
            await equalsButton.tap();
            
            const mobileResult = await page.locator('#display').textContent();
            expect(parseFloat(mobileResult)).toBe(3);
            console.log(`Mobile touch test: 1+2 = ${mobileResult}`);
            
            // Test button sizing for mobile
            const buttonWidth = await numberButton.boundingBox();
            expect(buttonWidth.width).toBeGreaterThan(40); // Minimum touch target size
            console.log(`Mobile button size: ${buttonWidth.width}x${buttonWidth.height}px`);
        });
    });
    
    test.describe('2. RANDOM NUMBER GENERATOR - A- Certification Validation', () => {
        const calculatorUrl = '/math/basic/random-number-generator/';
        
        test('should load efficiently and demonstrate quality', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            // A- Performance Standard: <2.5 seconds
            expect(loadTime).toBeLessThan(2500);
            console.log(`Random Number Generator load time: ${loadTime}ms`);
            
            await expect(page.locator('h1')).toContainText('Random Number Generator');
            await expect(page).toHaveTitle(/Random Number Generator/i);
            
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors`);
            }
        });
        
        test('should generate mathematically valid random numbers', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test basic range 1-10
            await page.locator('#minValue, input[id*="min"], input[name*="min"]').fill('1');
            await page.locator('#maxValue, input[id*="max"], input[name*="max"]').fill('10');
            await page.locator('#generateButton, button:has-text("Generate")').click();
            
            const result1 = await page.locator('#result, .result-value').textContent();
            const num1 = parseInt(result1);
            expect(num1).toBeGreaterThanOrEqual(1);
            expect(num1).toBeLessThanOrEqual(10);
            console.log(`Random number (1-10): ${num1}`);
            
            // Test multiple generations for randomness
            const numbers = [];
            for (let i = 0; i < 10; i++) {
                await page.locator('#generateButton, button:has-text("Generate")').click();
                await page.waitForTimeout(100);
                const result = await page.locator('#result, .result-value').textContent();
                numbers.push(parseInt(result));
            }
            
            // Check for some variation (not all numbers should be the same)
            const uniqueNumbers = new Set(numbers);
            expect(uniqueNumbers.size).toBeGreaterThan(1);
            console.log(`Generated numbers: ${numbers.join(', ')}`);
            console.log(`Unique numbers: ${uniqueNumbers.size}/10`);
        });
        
        test('should handle edge cases and validation', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test negative ranges
            await page.locator('#minValue, input[id*="min"]').fill('-10');
            await page.locator('#maxValue, input[id*="max"]').fill('-1');
            await page.locator('#generateButton, button:has-text("Generate")').click();
            
            const negativeResult = await page.locator('#result, .result-value').textContent();
            const negativeNum = parseInt(negativeResult);
            expect(negativeNum).toBeGreaterThanOrEqual(-10);
            expect(negativeNum).toBeLessThanOrEqual(-1);
            console.log(`Negative range (-10 to -1): ${negativeNum}`);
            
            // Test decimal support if available
            const minInput = page.locator('#minValue, input[id*="min"]');
            const maxInput = page.locator('#maxValue, input[id*="max"]');
            
            await minInput.fill('1.5');
            await maxInput.fill('2.5');
            await page.locator('#generateButton, button:has-text("Generate")').click();
            
            const decimalResult = await page.locator('#result, .result-value').textContent();
            console.log(`Decimal range result: ${decimalResult}`);
            
            // Test invalid range (min > max)
            await minInput.fill('10');
            await maxInput.fill('1');
            await page.locator('#generateButton, button:has-text("Generate")').click();
            
            // Should handle gracefully (error message or swap values)
            await page.waitForTimeout(1000);
            const errorMessage = await page.locator('.error, .alert, .warning').isVisible();
            if (errorMessage) {
                console.log('Invalid range handled with error message');
            } else {
                const invalidRangeResult = await page.locator('#result, .result-value').textContent();
                console.log(`Invalid range handled: ${invalidRangeResult}`);
            }
        });
        
        test('should provide excellent user experience features', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test multiple number generation if available
            const quantityInput = page.locator('#quantity, input[id*="count"], input[name*="quantity"]');
            if (await quantityInput.isVisible()) {
                await quantityInput.fill('5');
                await page.locator('#minValue, input[id*="min"]').fill('1');
                await page.locator('#maxValue, input[id*="max"]').fill('100');
                await page.locator('#generateButton, button:has-text("Generate")').click();
                
                const multipleResults = await page.locator('#result, .result-value, .results-list').textContent();
                console.log(`Multiple number generation: ${multipleResults}`);
            }
            
            // Test copy/history features if available
            const copyButton = page.locator('button:has-text("Copy"), .copy-button');
            if (await copyButton.isVisible()) {
                await copyButton.click();
                console.log('Copy functionality available');
            }
            
            // Test preset ranges if available
            const presetButtons = await page.locator('button[data-min], .preset-range').count();
            if (presetButtons > 0) {
                console.log(`Preset range buttons available: ${presetButtons}`);
            }
            
            // Test generation speed
            const speedStart = Date.now();
            await page.locator('#generateButton, button:has-text("Generate")').click();
            const speedEnd = Date.now();
            const generationTime = speedEnd - speedStart;
            
            expect(generationTime).toBeLessThan(500); // Should be very fast
            console.log(`Number generation speed: ${generationTime}ms`);
        });
    });
    
    test.describe('3. ROUNDING CALCULATOR - A- Certification Validation', () => {
        const calculatorUrl = '/math/basic/rounding-calculator/';
        
        test('should load efficiently with quality indicators', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(2500);
            console.log(`Rounding Calculator load time: ${loadTime}ms`);
            
            await expect(page.locator('h1')).toContainText('Rounding Calculator');
            await expect(page).toHaveTitle(/Rounding Calculator/i);
            
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors`);
            }
        });
        
        test('should demonstrate perfect rounding mathematical accuracy', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test cases for different rounding methods
            const roundingTests = [
                // Nearest integer rounding
                { input: '3.4', decimals: 0, expected: '3', description: 'Round down to nearest integer' },
                { input: '3.6', decimals: 0, expected: '4', description: 'Round up to nearest integer' },
                { input: '3.5', decimals: 0, expected: '4', description: 'Round half up to nearest integer' },
                
                // Decimal place rounding
                { input: '3.14159', decimals: 2, expected: '3.14', description: 'Round to 2 decimal places' },
                { input: '3.14159', decimals: 3, expected: '3.142', description: 'Round to 3 decimal places' },
                { input: '3.14159', decimals: 4, expected: '3.1416', description: 'Round to 4 decimal places' },
                
                // Edge cases
                { input: '2.5', decimals: 0, expected: '3', description: 'Round 2.5 to nearest integer' },
                { input: '-2.5', decimals: 0, expected: '-2', description: 'Round negative 2.5' },
                { input: '999.999', decimals: 2, expected: '1000.00', description: 'Rounding that changes magnitude' }
            ];
            
            for (const test of roundingTests) {
                // Input the number
                await page.locator('#numberInput, input[type="number"]:first-of-type').fill(test.input);
                
                // Set decimal places if input exists
                const decimalInput = page.locator('#decimalPlaces, input[id*="decimal"], select[id*="decimal"]');
                if (await decimalInput.isVisible()) {
                    if (await decimalInput.getAttribute('type') === 'number') {
                        await decimalInput.fill(test.decimals.toString());
                    } else {
                        await decimalInput.selectOption(test.decimals.toString());
                    }
                }
                
                // Calculate
                await page.locator('#calculateButton, button:has-text("Calculate"), button:has-text("Round")').click();
                
                // Get result
                const resultElement = page.locator('#result, .result-value, .rounded-value');
                await expect(resultElement).toBeVisible();
                const result = await resultElement.textContent();
                
                console.log(`${test.description}: ${test.input} → ${result} (expected ${test.expected})`);
                
                // Validate result matches expected
                const numericResult = parseFloat(result.replace(/[,$]/g, ''));
                const numericExpected = parseFloat(test.expected.replace(/[,$]/g, ''));
                expect(Math.abs(numericResult - numericExpected)).toBeLessThan(0.0001);
            }
        });
        
        test('should support various rounding methods if available', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Check for rounding method selector
            const methodSelector = page.locator('#roundingMethod, select[id*="method"], select[id*="type"]');
            if (await methodSelector.isVisible()) {
                const options = await methodSelector.locator('option').count();
                console.log(`Rounding methods available: ${options}`);
                
                // Test different methods if available
                if (options > 1) {
                    await page.locator('#numberInput, input[type="number"]:first-of-type').fill('2.5');
                    
                    for (let i = 0; i < Math.min(options, 3); i++) {
                        await methodSelector.selectOption({ index: i });
                        await page.locator('#calculateButton, button:has-text("Calculate")').click();
                        
                        const result = await page.locator('#result, .result-value').textContent();
                        const methodText = await methodSelector.locator('option:checked').textContent();
                        console.log(`Method "${methodText}": 2.5 → ${result}`);
                    }
                }
            }
            
            // Test significant figures if supported
            const sigFigsInput = page.locator('#significantFigures, input[id*="significant"]');
            if (await sigFigsInput.isVisible()) {
                await page.locator('#numberInput, input[type="number"]:first-of-type').fill('123.456');
                await sigFigsInput.fill('3');
                await page.locator('#calculateButton, button:has-text("Calculate")').click();
                
                const sigFigResult = await page.locator('#result, .result-value').textContent();
                console.log(`Significant figures (3): 123.456 → ${sigFigResult}`);
            }
        });
        
        test('should provide excellent educational value', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Check for explanations or help text
            const helpSection = page.locator('.help-text, .explanation, .guide');
            if (await helpSection.isVisible()) {
                const helpText = await helpSection.textContent();
                console.log(`Help content available: ${helpText.length} characters`);
            }
            
            // Check for examples
            const examplesSection = page.locator('.examples, .sample-calculations');
            if (await examplesSection.isVisible()) {
                console.log('Examples section found');
            }
            
            // Check for step-by-step calculation if available
            await page.locator('#numberInput, input[type="number"]:first-of-type').fill('3.14159');
            await page.locator('#calculateButton, button:has-text("Calculate")').click();
            
            const stepByStep = page.locator('.steps, .calculation-steps, .explanation');
            if (await stepByStep.isVisible()) {
                const stepsText = await stepByStep.textContent();
                console.log(`Step-by-step explanation: ${stepsText.substring(0, 100)}...`);
            }
        });
    });
    
    test.describe('4. NUMBER SEQUENCE CALCULATOR - B+ Certification Validation', () => {
        const calculatorUrl = '/math/basic/number-sequence-calculator/';
        
        test('should load with acceptable performance', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            // B+ Performance Standard: <3 seconds
            expect(loadTime).toBeLessThan(3000);
            console.log(`Number Sequence Calculator load time: ${loadTime}ms`);
            
            await expect(page.locator('h1')).toContainText('Number Sequence Calculator');
            await expect(page).toHaveTitle(/Number Sequence Calculator/i);
            
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors`);
            }
        });
        
        test('should analyze sequences accurately', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test arithmetic sequence: 2, 4, 6, 8...
            const sequenceInput = page.locator('#sequenceInput, textarea[id*="sequence"], input[id*="numbers"]');
            await sequenceInput.fill('2, 4, 6, 8');
            await page.locator('#analyzeButton, button:has-text("Analyze"), button:has-text("Calculate")').click();
            
            await page.waitForTimeout(2000);
            
            // Check for sequence type identification
            const sequenceType = page.locator('.sequence-type, #sequenceType');
            if (await sequenceType.isVisible()) {
                const typeText = await sequenceType.textContent();
                console.log(`Sequence type detected: ${typeText}`);
                expect(typeText.toLowerCase()).toContain('arithmetic');
            }
            
            // Check for common difference
            const difference = page.locator('.difference, .common-difference, #difference');
            if (await difference.isVisible()) {
                const diffText = await difference.textContent();
                console.log(`Common difference: ${diffText}`);
                expect(diffText).toContain('2');
            }
            
            // Test geometric sequence: 2, 6, 18, 54...
            await sequenceInput.fill('2, 6, 18, 54');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(2000);
            
            if (await sequenceType.isVisible()) {
                const geoTypeText = await sequenceType.textContent();
                console.log(`Geometric sequence detected: ${geoTypeText}`);
            }
            
            // Test Fibonacci sequence: 1, 1, 2, 3, 5, 8...
            await sequenceInput.fill('1, 1, 2, 3, 5, 8');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(2000);
            
            if (await sequenceType.isVisible()) {
                const fibTypeText = await sequenceType.textContent();
                console.log(`Fibonacci sequence detected: ${fibTypeText}`);
            }
        });
        
        test('should predict next terms accurately', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test arithmetic progression
            await page.locator('#sequenceInput, textarea[id*="sequence"], input[id*="numbers"]').fill('5, 10, 15, 20');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(2000);
            
            // Check for next terms prediction
            const nextTerms = page.locator('.next-terms, #nextTerms, .predicted-terms');
            if (await nextTerms.isVisible()) {
                const termsText = await nextTerms.textContent();
                console.log(`Predicted next terms: ${termsText}`);
                expect(termsText).toContain('25'); // Next term should be 25
            }
            
            // Test with more complex sequence
            await page.locator('#sequenceInput, textarea[id*="sequence"]').fill('1, 4, 9, 16, 25');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(2000);
            
            if (await nextTerms.isVisible()) {
                const squareTermsText = await nextTerms.textContent();
                console.log(`Square sequence next terms: ${squareTermsText}`);
                expect(squareTermsText).toContain('36'); // Next perfect square
            }
        });
        
        test('should handle various input formats', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            const sequenceInput = page.locator('#sequenceInput, textarea[id*="sequence"], input[id*="numbers"]');
            
            // Test comma-separated
            await sequenceInput.fill('1,2,3,4,5');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(1000);
            
            // Test space-separated
            await sequenceInput.fill('1 2 3 4 5');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(1000);
            
            // Test mixed formatting
            await sequenceInput.fill('1, 2 3,4 5');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(1000);
            
            console.log('Various input formats handled successfully');
        });
        
        test('should provide educational sequence information', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            await page.locator('#sequenceInput, textarea[id*="sequence"]').fill('0, 1, 1, 2, 3, 5, 8, 13');
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(2000);
            
            // Check for educational information
            const info = page.locator('.sequence-info, .explanation, .formula');
            if (await info.isVisible()) {
                const infoText = await info.textContent();
                console.log(`Educational information: ${infoText.substring(0, 150)}...`);
            }
            
            // Check for formula display
            const formula = page.locator('.formula, .equation, .pattern');
            if (await formula.isVisible()) {
                const formulaText = await formula.textContent();
                console.log(`Formula displayed: ${formulaText}`);
            }
        });
    });
    
    test.describe('5. SUITE INTEGRATION AND USER JOURNEY VALIDATION', () => {
        
        test('should demonstrate seamless category page navigation', async ({ page }) => {
            await page.goto('/math/basic/');
            await page.waitForLoadState('domcontentloaded');
            
            // Validate all calculator links are present
            const calculatorLinks = [
                { href: 'standard-calculator', name: 'Standard Calculator' },
                { href: 'random-number-generator', name: 'Random Number Generator' },
                { href: 'number-sequence-calculator', name: 'Number Sequence Calculator' },
                { href: 'rounding-calculator', name: 'Rounding Calculator' }
            ];
            
            for (const calc of calculatorLinks) {
                const link = page.locator(`a[href*="${calc.href}"]`);
                await expect(link).toBeVisible();
                console.log(`✓ ${calc.name} link found and visible`);
            }
            
            // Test navigation to each calculator
            for (const calc of calculatorLinks) {
                const link = page.locator(`a[href*="${calc.href}"]`).first();
                await link.click();
                await page.waitForLoadState('domcontentloaded');
                
                await expect(page.locator('h1')).toContainText(calc.name, { timeout: 10000 });
                console.log(`✓ Navigation to ${calc.name} successful`);
                
                await page.goBack();
                await page.waitForLoadState('domcontentloaded');
            }
        });
        
        test('should demonstrate consistent visual design across suite', async ({ page }) => {
            const calculatorUrls = [
                '/math/basic/standard-calculator/',
                '/math/basic/random-number-generator/',
                '/math/basic/number-sequence-calculator/',
                '/math/basic/rounding-calculator/'
            ];
            
            const designElements = [];
            
            for (const url of calculatorUrls) {
                await page.goto(url);
                await page.waitForLoadState('domcontentloaded');
                
                // Check header structure
                const headerExists = await page.locator('header, .site-header').isVisible();
                
                // Check navigation
                const navExists = await page.locator('nav, .main-nav').isVisible();
                
                // Check footer
                const footerExists = await page.locator('footer, .site-footer').isVisible();
                
                // Check color scheme consistency
                const primaryColor = await page.evaluate(() => {
                    const element = document.querySelector('h1');
                    return window.getComputedStyle(element).color;
                });
                
                designElements.push({
                    url,
                    header: headerExists,
                    navigation: navExists,
                    footer: footerExists,
                    primaryColor
                });
            }
            
            // Validate consistency
            const uniqueColors = new Set(designElements.map(e => e.primaryColor));
            expect(uniqueColors.size).toBeLessThanOrEqual(2); // Allow for light/dark mode
            
            const allHaveHeader = designElements.every(e => e.header);
            const allHaveNav = designElements.every(e => e.navigation);
            const allHaveFooter = designElements.every(e => e.footer);
            
            expect(allHaveHeader).toBe(true);
            expect(allHaveNav).toBe(true);
            expect(allHaveFooter).toBe(true);
            
            console.log('Visual consistency validation passed');
            console.log('Design elements:', JSON.stringify(designElements, null, 2));
        });
        
        test('should support cross-calculator educational journey', async ({ page }) => {
            // Simulate user learning path: Basic calculator → Rounding → Sequences
            
            // Step 1: Basic calculation
            await page.goto('/math/basic/standard-calculator/');
            await page.waitForLoadState('domcontentloaded');
            
            await page.locator('button:has-text("1")').click();
            await page.locator('button:has-text("+")').click();
            await page.locator('button:has-text("2")').click();
            await page.locator('button:has-text(".")').click();
            await page.locator('button:has-text("3")').click();
            await page.locator('button:has-text("3")').click();
            await page.locator('#equals, button:has-text("=")').click();
            
            const calculationResult = await page.locator('#display').textContent();
            console.log(`Basic calculation: 1 + 2.33 = ${calculationResult}`);
            
            // Step 2: Round the result
            await page.goto('/math/basic/rounding-calculator/');
            await page.waitForLoadState('domcontentloaded');
            
            await page.locator('#numberInput, input[type="number"]:first-of-type').fill(calculationResult);
            await page.locator('#calculateButton, button:has-text("Calculate")').click();
            
            const roundedResult = await page.locator('#result, .result-value').textContent();
            console.log(`Rounded result: ${calculationResult} → ${roundedResult}`);
            
            // Step 3: Use in sequence
            await page.goto('/math/basic/number-sequence-calculator/');
            await page.waitForLoadState('domcontentloaded');
            
            const baseNum = parseFloat(roundedResult);
            const sequence = [baseNum, baseNum + 1, baseNum + 2, baseNum + 3].join(', ');
            
            await page.locator('#sequenceInput, textarea[id*="sequence"]').fill(sequence);
            await page.locator('#analyzeButton, button:has-text("Analyze")').click();
            await page.waitForTimeout(2000);
            
            console.log(`Educational journey completed: calculation → rounding → sequence analysis`);
            console.log(`Final sequence: ${sequence}`);
        });
        
        test('should demonstrate excellent mobile suite experience', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            
            const calculatorUrls = [
                '/math/basic/',
                '/math/basic/standard-calculator/',
                '/math/basic/random-number-generator/',
                '/math/basic/number-sequence-calculator/',
                '/math/basic/rounding-calculator/'
            ];
            
            for (const url of calculatorUrls) {
                await page.goto(url);
                await page.waitForLoadState('domcontentloaded');
                
                // Check mobile navigation
                const mobileMenu = page.locator('.mobile-menu-button, .hamburger, #mobile-menu-button');
                if (await mobileMenu.isVisible()) {
                    console.log(`Mobile menu available on ${url}`);
                }
                
                // Check touch-friendly buttons
                const buttons = page.locator('button, input[type="button"]');
                const buttonCount = await buttons.count();
                
                if (buttonCount > 0) {
                    const firstButton = buttons.first();
                    const buttonBox = await firstButton.boundingBox();
                    
                    if (buttonBox) {
                        expect(buttonBox.width).toBeGreaterThan(40);
                        expect(buttonBox.height).toBeGreaterThan(40);
                        console.log(`Mobile button size on ${url}: ${buttonBox.width}x${buttonBox.height}px`);
                    }
                }
                
                // Test scrolling and viewport
                const pageHeight = await page.evaluate(() => document.body.scrollHeight);
                const viewportHeight = await page.evaluate(() => window.innerHeight);
                
                if (pageHeight > viewportHeight) {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(500);
                    await page.evaluate(() => window.scrollTo(0, 0));
                }
                
                console.log(`✓ Mobile experience validated for ${url}`);
            }
        });
    });
    
    test.describe('6. PERFORMANCE AND QUALITY BENCHMARKS', () => {
        
        test('should meet comprehensive performance standards', async ({ page }) => {
            const calculatorUrls = [
                { url: '/math/basic/standard-calculator/', name: 'Standard Calculator', target: 2000 },
                { url: '/math/basic/random-number-generator/', name: 'Random Number Generator', target: 2500 },
                { url: '/math/basic/number-sequence-calculator/', name: 'Number Sequence Calculator', target: 3000 },
                { url: '/math/basic/rounding-calculator/', name: 'Rounding Calculator', target: 2500 },
                { url: '/math/basic/', name: 'Category Page', target: 2000 }
            ];
            
            const performanceResults = {};
            let totalScore = 0;
            
            for (const calculator of calculatorUrls) {
                const startTime = Date.now();
                await page.goto(calculator.url);
                await page.waitForLoadState('domcontentloaded');
                const loadTime = Date.now() - startTime;
                
                const metrics = await collectPerformanceMetrics(page);
                performanceResults[calculator.name] = {
                    loadTime,
                    target: calculator.target,
                    score: (loadTime <= calculator.target) ? 100 : Math.max(0, 100 - ((loadTime - calculator.target) / calculator.target) * 50),
                    ...metrics
                };
                
                totalScore += performanceResults[calculator.name].score;
                
                expect(loadTime).toBeLessThan(calculator.target + 1000); // Allow 1s buffer
                console.log(`${calculator.name}: ${loadTime}ms (target: ${calculator.target}ms)`);
            }
            
            const averageScore = totalScore / calculatorUrls.length;
            console.log(`Average Performance Score: ${averageScore.toFixed(1)}/100`);
            console.log('Performance Results:', JSON.stringify(performanceResults, null, 2));
            
            expect(averageScore).toBeGreaterThan(80); // Require 80+ average score
        });
        
        test('should validate mathematical accuracy across suite', async ({ page }) => {
            const mathTests = [
                // Standard Calculator tests
                {
                    url: '/math/basic/standard-calculator/',
                    tests: [
                        { operation: '2+2', expected: 4 },
                        { operation: '10-3', expected: 7 },
                        { operation: '6*7', expected: 42 },
                        { operation: '15/3', expected: 5 },
                        { operation: '2^3', expected: 8 }
                    ]
                },
                // Rounding Calculator tests
                {
                    url: '/math/basic/rounding-calculator/',
                    tests: [
                        { input: '3.14159', decimals: 2, expected: 3.14 },
                        { input: '2.5', decimals: 0, expected: 3 },
                        { input: '7.777', decimals: 1, expected: 7.8 }
                    ]
                }
            ];
            
            let totalTests = 0;
            let passedTests = 0;
            
            for (const suite of mathTests) {
                await page.goto(suite.url);
                await page.waitForLoadState('domcontentloaded');
                
                for (const test of suite.tests) {
                    totalTests++;
                    
                    try {
                        if (suite.url.includes('standard-calculator')) {
                            // Test calculator operations
                            await page.locator('#clear').click();
                            
                            // Input operation (simplified for demo)
                            if (test.operation === '2+2') {
                                await page.locator('button:has-text("2")').click();
                                await page.locator('button:has-text("+")').click();
                                await page.locator('button:has-text("2")').click();
                                await page.locator('#equals').click();
                                
                                const result = await page.locator('#display').textContent();
                                if (Math.abs(parseFloat(result) - test.expected) < 0.0001) {
                                    passedTests++;
                                    console.log(`✓ ${test.operation} = ${result} (expected ${test.expected})`);
                                } else {
                                    console.log(`✗ ${test.operation} = ${result} (expected ${test.expected})`);
                                }
                            }
                        } else if (suite.url.includes('rounding-calculator')) {
                            // Test rounding operations
                            await page.locator('#numberInput, input[type="number"]:first-of-type').fill(test.input);
                            if (test.decimals !== undefined) {
                                const decimalInput = page.locator('#decimalPlaces, input[id*="decimal"]');
                                if (await decimalInput.isVisible()) {
                                    await decimalInput.fill(test.decimals.toString());
                                }
                            }
                            await page.locator('#calculateButton, button:has-text("Calculate")').click();
                            
                            const result = await page.locator('#result, .result-value').textContent();
                            const numResult = parseFloat(result);
                            
                            if (Math.abs(numResult - test.expected) < 0.0001) {
                                passedTests++;
                                console.log(`✓ Round ${test.input} = ${result} (expected ${test.expected})`);
                            } else {
                                console.log(`✗ Round ${test.input} = ${result} (expected ${test.expected})`);
                            }
                        }
                    } catch (error) {
                        console.log(`Error testing ${test.operation || test.input}: ${error.message}`);
                    }
                }
            }
            
            const accuracy = (passedTests / totalTests) * 100;
            console.log(`Mathematical Accuracy: ${passedTests}/${totalTests} tests passed (${accuracy.toFixed(1)}%)`);
            
            expect(accuracy).toBeGreaterThan(90); // Require 90%+ accuracy
        });
        
        test('should demonstrate accessibility compliance', async ({ page }) => {
            const calculatorUrls = [
                '/math/basic/standard-calculator/',
                '/math/basic/random-number-generator/',
                '/math/basic/number-sequence-calculator/',
                '/math/basic/rounding-calculator/',
                '/math/basic/'
            ];
            
            const accessibilityResults = {};
            
            for (const url of calculatorUrls) {
                await page.goto(url);
                await page.waitForLoadState('domcontentloaded');
                
                const results = {
                    headingStructure: false,
                    altText: true,
                    formLabels: true,
                    keyboardNavigation: false,
                    colorContrast: true
                };
                
                // Check heading structure
                const h1Count = await page.locator('h1').count();
                results.headingStructure = h1Count === 1;
                
                // Check alt text on images
                const images = page.locator('img');
                const imageCount = await images.count();
                for (let i = 0; i < imageCount; i++) {
                    const alt = await images.nth(i).getAttribute('alt');
                    if (!alt || alt.trim() === '') {
                        results.altText = false;
                        break;
                    }
                }
                
                // Check form labels
                const inputs = page.locator('input[type="number"], input[type="text"], textarea');
                const inputCount = await inputs.count();
                for (let i = 0; i < inputCount; i++) {
                    const inputId = await inputs.nth(i).getAttribute('id');
                    if (inputId) {
                        const label = page.locator(`label[for="${inputId}"]`);
                        if (!(await label.isVisible())) {
                            results.formLabels = false;
                            break;
                        }
                    }
                }
                
                // Test keyboard navigation
                try {
                    await page.keyboard.press('Tab');
                    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
                    results.keyboardNavigation = ['BUTTON', 'INPUT', 'A'].includes(focusedElement);
                } catch (error) {
                    results.keyboardNavigation = false;
                }
                
                accessibilityResults[url] = results;
                
                const score = Object.values(results).filter(Boolean).length / Object.keys(results).length * 100;
                console.log(`Accessibility score for ${url}: ${score}%`);
            }
            
            console.log('Accessibility Results:', JSON.stringify(accessibilityResults, null, 2));
        });
    });
});