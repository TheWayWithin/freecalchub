/**
 * Sprint 1: Standard Calculator Comprehensive Testing
 * 
 * This test suite executes all test cases outlined in the project plan
 * for comprehensive testing of the Standard Calculator functionality.
 */

const { test, expect } = require('@playwright/test');

test.describe('Sprint 1: Standard Calculator Testing', () => {
  let page;
  
  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Navigate to the standard calculator
    await page.goto('/math/basic/standard-calculator/');
    
    // Wait for calculator to be fully loaded
    await page.waitForSelector('.calculator-container');
    await page.waitForFunction(() => window.StandardCalculator !== undefined || document.querySelector('#display'));
  });

  // CORE FUNCTIONALITY TESTS
  test.describe('Core Functionality Tests', () => {
    
    test('Basic Operations - Addition', async () => {
      // Test: 5 + 3 = 8
      await page.click('#five');
      await page.click('#add');
      await page.click('#three');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('8');
    });

    test('Basic Operations - Subtraction', async () => {
      // Test: 10 - 4 = 6
      await page.click('#one');
      await page.click('#zero');
      await page.click('#subtract');
      await page.click('#four');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('6');
    });

    test('Basic Operations - Multiplication', async () => {
      // Test: 7 × 8 = 56
      await page.click('#seven');
      await page.click('#multiply');
      await page.click('#eight');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('56');
    });

    test('Basic Operations - Division', async () => {
      // Test: 15 ÷ 3 = 5
      await page.click('#one');
      await page.click('#five');
      await page.click('#divide');
      await page.click('#three');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('5');
    });

    test('PEMDAS Compliance - Complex Expression 1', async () => {
      // Test: 2 + 3 × 4 = 14 (not 20)
      await page.click('#two');
      await page.click('#add');
      await page.click('#three');
      await page.click('#multiply');
      await page.click('#four');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('14');
    });

    test('PEMDAS Compliance - Complex Expression 2', async () => {
      // Test: 20 ÷ 4 + 3 × 2 = 11
      await page.click('#two');
      await page.click('#zero');
      await page.click('#divide');
      await page.click('#four');
      await page.click('#add');
      await page.click('#three');
      await page.click('#multiply');
      await page.click('#two');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('11');
    });

    test('Decimal Handling - Basic Decimal Addition', async () => {
      // Test: 1.5 + 2.3 = 3.8
      await page.click('#one');
      await page.click('#decimal');
      await page.click('#five');
      await page.click('#add');
      await page.click('#two');
      await page.click('#decimal');
      await page.click('#three');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('3.8');
    });

    test('Decimal Handling - Floating Point Precision', async () => {
      // Test: 0.1 + 0.2 (should handle floating point correctly)
      await page.click('#zero');
      await page.click('#decimal');
      await page.click('#one');
      await page.click('#add');
      await page.click('#zero');
      await page.click('#decimal');
      await page.click('#two');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(parseFloat(result)).toBeCloseTo(0.3, 10);
    });

    test('Memory Functions - Memory Store and Recall', async () => {
      // Test: Store 42, clear display, recall
      await page.click('#four');
      await page.click('#two');
      await page.click('#memoryStore');
      
      // Check memory indicator appears
      const memoryIndicator = await page.isVisible('#memoryIndicator');
      expect(memoryIndicator).toBe(true);
      
      await page.click('#clearAll');
      
      const displayAfterClear = await page.inputValue('#display');
      expect(displayAfterClear).toBe('0');
      
      await page.click('#memoryRecall');
      
      const recalledValue = await page.inputValue('#display');
      expect(recalledValue).toBe('42');
    });

    test('Memory Functions - Memory Add', async () => {
      // Test: Store 10, add 5, recall should show 15
      await page.click('#one');
      await page.click('#zero');
      await page.click('#memoryStore');
      
      await page.click('#five');
      await page.click('#memoryAdd');
      
      await page.click('#clearAll');
      await page.click('#memoryRecall');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('15');
    });

    test('Memory Functions - Memory Clear', async () => {
      // Test: Store value, clear memory, indicator should disappear
      await page.click('#nine');
      await page.click('#memoryStore');
      
      let memoryIndicator = await page.isVisible('#memoryIndicator');
      expect(memoryIndicator).toBe(true);
      
      await page.click('#memoryClear');
      
      memoryIndicator = await page.isVisible('#memoryIndicator');
      expect(memoryIndicator).toBe(false);
    });

    test('Clear Functions - C vs CE Behavior', async () => {
      // Test CE (Clear Entry) - should only clear current entry
      await page.click('#five');
      await page.click('#add');
      await page.click('#three');
      await page.click('#clearEntry');
      
      const displayAfterCE = await page.inputValue('#display');
      expect(displayAfterCE).toBe('0');
      
      // Adding new number should continue the operation
      await page.click('#seven');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('12'); // 5 + 7
      
      // Test C (Clear All) - should reset everything
      await page.click('#five');
      await page.click('#add');
      await page.click('#three');
      await page.click('#clearAll');
      
      const displayAfterC = await page.inputValue('#display');
      expect(displayAfterC).toBe('0');
      
      // Adding number should start fresh
      await page.click('#seven');
      await page.click('#equals');
      
      const freshResult = await page.inputValue('#display');
      expect(freshResult).toBe('7'); // Just 7, no operation remembered
    });

    test('Backspace Function - Single Character Deletion', async () => {
      // Test: Enter 123, backspace twice, should show 1
      await page.click('#one');
      await page.click('#two');
      await page.click('#three');
      
      let display = await page.inputValue('#display');
      expect(display).toBe('123');
      
      await page.click('#backspace');
      display = await page.inputValue('#display');
      expect(display).toBe('12');
      
      await page.click('#backspace');
      display = await page.inputValue('#display');
      expect(display).toBe('1');
      
      await page.click('#backspace');
      display = await page.inputValue('#display');
      expect(display).toBe('0');
    });

    test('Error Handling - Division by Zero', async () => {
      // Test: 5 ÷ 0 should show error
      await page.click('#five');
      await page.click('#divide');
      await page.click('#zero');
      await page.click('#equals');
      
      // Wait a moment for error handling
      await page.waitForTimeout(100);
      
      const result = await page.inputValue('#display');
      expect(result).toBe('Error');
      
      // Wait for error to clear and calculator to reset
      await page.waitForTimeout(2500);
      
      const resetDisplay = await page.inputValue('#display');
      expect(resetDisplay).toBe('0');
    });
  });

  // USER INTERFACE TESTS
  test.describe('User Interface Tests', () => {
    
    test('Button Responsiveness - Click Feedback', async () => {
      // Test that buttons provide visual feedback on click
      const numberButton = page.locator('#five');
      
      await numberButton.click();
      
      // Check that button has pressed class temporarily
      await expect(numberButton).toHaveClass(/pressed/, { timeout: 200 });
      
      // Verify the press effect disappears
      await page.waitForTimeout(150);
      await expect(numberButton).not.toHaveClass(/pressed/);
    });

    test('Display Testing - Number Formatting', async () => {
      // Test display shows numbers correctly
      await page.click('#one');
      await page.click('#two');
      await page.click('#three');
      await page.click('#decimal');
      await page.click('#four');
      await page.click('#five');
      
      const display = await page.inputValue('#display');
      expect(display).toBe('123.45');
    });

    test('Keyboard Support - Number Keys', async () => {
      // Test keyboard number input
      await page.keyboard.press('5');
      await page.keyboard.press('4');
      await page.keyboard.press('3');
      
      const display = await page.inputValue('#display');
      expect(display).toBe('543');
    });

    test('Keyboard Support - Operation Keys', async () => {
      // Test keyboard operation shortcuts
      await page.keyboard.press('8');
      await page.keyboard.press('+');
      await page.keyboard.press('4');
      await page.keyboard.press('Enter');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('12');
    });

    test('Keyboard Support - All Documented Shortcuts', async () => {
      // Test all documented keyboard shortcuts
      
      // Numbers
      for (let i = 0; i <= 9; i++) {
        await page.keyboard.press('Escape'); // Clear
        await page.keyboard.press(i.toString());
        const display = await page.inputValue('#display');
        expect(display).toBe(i.toString());
      }
      
      // Decimal point
      await page.keyboard.press('Escape');
      await page.keyboard.press('1');
      await page.keyboard.press('.');
      await page.keyboard.press('5');
      let display = await page.inputValue('#display');
      expect(display).toBe('1.5');
      
      // Operations
      await page.keyboard.press('Escape');
      await page.keyboard.press('6');
      await page.keyboard.press('*');
      await page.keyboard.press('7');
      await page.keyboard.press('=');
      display = await page.inputValue('#display');
      expect(display).toBe('42');
      
      // Clear functions
      await page.keyboard.press('5');
      await page.keyboard.press('Delete');
      display = await page.inputValue('#display');
      expect(display).toBe('0');
      
      await page.keyboard.press('8');
      await page.keyboard.press('Escape');
      display = await page.inputValue('#display');
      expect(display).toBe('0');
    });

    test('Visual Feedback - Active Operation Highlighting', async () => {
      // Test that active operations are highlighted
      await page.click('#five');
      await page.click('#add');
      
      const addButton = page.locator('#add');
      await expect(addButton).toHaveClass(/active/);
      
      await page.click('#three');
      await page.click('#equals');
      
      // After calculation, no operation should be active
      await expect(addButton).not.toHaveClass(/active/);
    });

    test('Memory Indicator - Shows/Hides Correctly', async () => {
      // Initially hidden
      const memoryIndicator = page.locator('#memoryIndicator');
      await expect(memoryIndicator).not.toBeVisible();
      
      // Store a value
      await page.click('#seven');
      await page.click('#memoryStore');
      await expect(memoryIndicator).toBeVisible();
      
      // Clear memory
      await page.click('#memoryClear');
      await expect(memoryIndicator).not.toBeVisible();
    });
  });

  // EDGE CASE TESTS
  test.describe('Edge Cases', () => {
    
    test('Large Numbers - Scientific Notation Handling', async () => {
      // Test very large number handling
      // Create a large number: 999999999999 (12 digits)
      const digits = '999999999999';
      for (let digit of digits) {
        await page.click(`#${['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][digit]}`);
      }
      
      // Multiply by 2 to exceed 1e12
      await page.click('#multiply');
      await page.click('#two');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toMatch(/^[0-9.]+e\+[0-9]+$/); // Should be in scientific notation
      
      // Check if scientific class is applied
      const display = page.locator('#display');
      await expect(display).toHaveClass(/scientific/);
    });

    test('Small Numbers - Scientific Notation for Small Decimals', async () => {
      // Test very small number handling
      // Start with 1, divide by large numbers to get very small result
      await page.click('#one');
      
      // Divide by 10 repeatedly to get a very small number
      for (let i = 0; i < 8; i++) {
        await page.click('#divide');
        await page.click('#one');
        await page.click('#zero');
        await page.click('#equals');
      }
      
      const result = await page.inputValue('#display');
      if (parseFloat(result) < 1e-6) {
        expect(result).toMatch(/^[0-9.]+e-[0-9]+$/);
      }
    });

    test('Rapid Input - Stress Testing with Fast Button Presses', async () => {
      // Test rapid button pressing doesn't break calculator
      const sequence = ['1', '2', '3', '+', '4', '5', '6', '='];
      
      // Rapid succession of clicks
      for (let i = 0; i < sequence.length; i++) {
        const buttonId = {
          '1': 'one', '2': 'two', '3': 'three', '4': 'four', 
          '5': 'five', '6': 'six', '+': 'add', '=': 'equals'
        }[sequence[i]];
        
        await page.click(`#${buttonId}`);
        // Very small delay to simulate rapid clicking
        await page.waitForTimeout(10);
      }
      
      const result = await page.inputValue('#display');
      expect(result).toBe('579'); // 123 + 456
    });

    test('Invalid Sequences - Handle Multiple Decimals', async () => {
      // Test multiple decimal points in same number
      await page.click('#one');
      await page.click('#decimal');
      await page.click('#two');
      await page.click('#decimal'); // Second decimal should be ignored
      await page.click('#three');
      
      const display = await page.inputValue('#display');
      expect(display).toBe('1.23'); // Only one decimal point
    });

    test('Invalid Sequences - Multiple Operations', async () => {
      // Test multiple operation buttons pressed in sequence
      await page.click('#five');
      await page.click('#add');
      await page.click('#multiply'); // Should replace the add operation
      await page.click('#three');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      expect(result).toBe('15'); // 5 × 3, not 5 + something
    });

    test('Overflow Protection - Maximum Value Limits', async () => {
      // Test that calculator handles maximum JavaScript number limits
      await page.click('#nine');
      
      // Create a large number by repeated multiplication
      let currentValue = 9;
      for (let i = 0; i < 10; i++) {
        await page.click('#multiply');
        await page.click('#nine');
        await page.click('#nine');
        await page.click('#equals');
        currentValue *= 99;
        
        // Check if we've hit scientific notation
        const display = await page.inputValue('#display');
        if (display.includes('e+')) {
          break;
        }
      }
      
      // Ensure calculator still functions after large numbers
      await page.click('#clearAll');
      await page.click('#five');
      await page.click('#add');
      await page.click('#three');
      await page.click('#equals');
      
      const finalResult = await page.inputValue('#display');
      expect(finalResult).toBe('8');
    });

    test('Decimal Precision - Long Decimal Results', async () => {
      // Test that long decimal results are handled properly
      await page.click('#one');
      await page.click('#divide');
      await page.click('#three');
      await page.click('#equals');
      
      const result = await page.inputValue('#display');
      const decimalPart = result.split('.')[1];
      
      // Should be limited to reasonable decimal places
      if (decimalPart) {
        expect(decimalPart.length).toBeLessThanOrEqual(10);
      }
    });
  });

  // BROWSER COMPATIBILITY TESTS
  test.describe('Browser Compatibility', () => {
    
    test('Console Errors Check', async () => {
      const consoleErrors = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Perform basic operations
      await page.click('#five');
      await page.click('#add');
      await page.click('#three');
      await page.click('#equals');
      
      // Check for JavaScript errors
      expect(consoleErrors).toHaveLength(0);
    });

    test('Network Request Failures', async () => {
      const failedRequests = [];
      
      page.on('requestfailed', request => {
        failedRequests.push(request.url());
      });
      
      // Reload page to catch any failed resource loads
      await page.reload();
      
      // Wait for page to fully load
      await page.waitForSelector('.calculator-container');
      
      // Check that critical resources loaded successfully
      expect(failedRequests.filter(url => 
        url.includes('standard-calculator.js') || 
        url.includes('standard-calculator.css')
      )).toHaveLength(0);
    });
  });

  // ACCESSIBILITY TESTS
  test.describe('Accessibility', () => {
    
    test('Tab Navigation', async () => {
      // Test that calculator buttons are keyboard accessible
      await page.keyboard.press('Tab');
      
      // Should be able to navigate through buttons
      const focusedElement = await page.evaluate(() => 
        document.activeElement ? document.activeElement.id : null
      );
      
      // Some button should receive focus
      expect(focusedElement).toBeTruthy();
    });

    test('Screen Reader Support', async () => {
      // Check for proper ARIA labels and roles
      const memoryButtons = await page.$$('[title]');
      expect(memoryButtons.length).toBeGreaterThan(0);
      
      const displayElement = await page.$('#display');
      const displayRole = await displayElement.getAttribute('readonly');
      expect(displayRole).toBe('');
    });
  });

  // PERFORMANCE TESTS
  test.describe('Performance Validation', () => {
    
    test('Calculator Initialization Speed', async () => {
      const startTime = Date.now();
      
      await page.goto('/math/basic/standard-calculator/');
      await page.waitForSelector('.calculator-container');
      await page.waitForFunction(() => document.querySelector('#display').value === '0');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('Button Response Time', async () => {
      // Test that button clicks respond quickly
      const startTime = Date.now();
      
      await page.click('#five');
      
      // Wait for display to update
      await page.waitForFunction(() => 
        document.querySelector('#display').value === '5'
      );
      
      const responseTime = Date.now() - startTime;
      
      // Should respond within 100ms
      expect(responseTime).toBeLessThan(100);
    });
  });
});