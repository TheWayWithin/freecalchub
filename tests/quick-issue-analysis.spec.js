/**
 * Quick Issue Analysis - Sprint 1 Critical Findings
 */

const { test, expect } = require('@playwright/test');

test.describe('Critical Issue Analysis', () => {
  let page;
  
  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/math/basic/standard-calculator/');
    await page.waitForSelector('.calculator-container');
  });

  test('CRITICAL: PEMDAS Issue Analysis', async () => {
    // Test the documented issue: 2 + 3 × 4 should equal 14
    // But calculator appears to be evaluating left-to-right instead
    
    console.log('Testing PEMDAS compliance...');
    
    await page.click('#two');
    console.log('Display after 2:', await page.inputValue('#display'));
    
    await page.click('#add');
    console.log('Display after +:', await page.inputValue('#display'));
    
    await page.click('#three');
    console.log('Display after 3:', await page.inputValue('#display'));
    
    await page.click('#multiply');
    console.log('Display after ×:', await page.inputValue('#display'));
    
    await page.click('#four');
    console.log('Display after 4:', await page.inputValue('#display'));
    
    await page.click('#equals');
    const result = await page.inputValue('#display');
    console.log('Final result:', result);
    
    // Expected: 14 (PEMDAS: 2 + (3 × 4) = 2 + 12 = 14)
    // If getting 20, calculator is doing: (2 + 3) × 4 = 5 × 4 = 20
    expect(result).toBe('14');
  });

  test('Division by Zero Behavior Analysis', async () => {
    console.log('Testing division by zero handling...');
    
    await page.click('#five');
    await page.click('#divide');
    await page.click('#zero');
    await page.click('#equals');
    
    // Check immediate result
    let result = await page.inputValue('#display');
    console.log('Immediate result after 5÷0:', result);
    
    // Wait shorter time to see if Error appears
    await page.waitForTimeout(500);
    result = await page.inputValue('#display');
    console.log('Result after 500ms:', result);
    
    // The test expects 'Error' but may be getting '0'
  });

  test('Memory Add Function Analysis', async () => {
    console.log('Testing memory add function...');
    
    // Store 10
    await page.click('#one');
    await page.click('#zero');
    await page.click('#memoryStore');
    
    let memVisible = await page.isVisible('#memoryIndicator');
    console.log('Memory indicator visible after MS:', memVisible);
    
    // Add 5 to memory
    await page.click('#clearAll'); // Clear display
    await page.click('#five');
    await page.click('#memoryAdd');
    
    // Recall memory
    await page.click('#clearAll');
    await page.click('#memoryRecall');
    
    const result = await page.inputValue('#display');
    console.log('Memory recall result (should be 15):', result);
    
    // Expected: 15, but may be getting different value
  });

  test('Multiple Operations Behavior Analysis', async () => {
    console.log('Testing multiple operations...');
    
    await page.click('#five');
    console.log('After 5:', await page.inputValue('#display'));
    
    await page.click('#add');
    console.log('After +:', await page.inputValue('#display'));
    
    await page.click('#multiply'); // Should replace add
    console.log('After × (should replace +):', await page.inputValue('#display'));
    
    await page.click('#three');
    console.log('After 3:', await page.inputValue('#display'));
    
    await page.click('#equals');
    const result = await page.inputValue('#display');
    console.log('Final result (should be 15):', result);
    
    // Expected: 15 (5 × 3), but getting 30 suggests 5 + 5 × 3
  });
});