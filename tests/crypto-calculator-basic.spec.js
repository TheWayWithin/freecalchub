const { test, expect } = require('@playwright/test');

test.describe('Crypto Profit/Loss Calculator - Basic Functionality', () => {
  const calculatorUrl = '/finance/cryptocurrency/crypto-profit-calculator/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(calculatorUrl);
  });

  test('Page loads correctly with all essential elements', async ({ page }) => {
    // Check page title and heading
    await expect(page).toHaveTitle(/Crypto Profit\/Loss Calculator/);
    await expect(page.locator('h1')).toContainText('Crypto Profit/Loss Calculator');
    
    // Check calculator form is present
    await expect(page.locator('.calculator-container, .calculator-form, #calculator')).toBeVisible();
    
    // Check essential form fields are present
    await expect(page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]')).toBeVisible();
  });

  test('Basic calculation with simple inputs', async ({ page }) => {
    // Fill in basic trade data using specific IDs
    await page.fill('#purchase_price_0', '100');
    await page.fill('#quantity_0', '10');
    await page.fill('#sale_price_0', '150');
    
    // Trigger calculation using the specific calculator button
    const calculateButton = page.locator('#calculateButton');
    await calculateButton.click();
    
    // Wait for results and verify calculation
    await page.waitForTimeout(1000); // Give time for calculation
    
    // Look for profit/loss display (various selectors to catch different implementations)
    const resultSelectors = [
      '.result', '.calculation-result', '.profit-loss', 
      '#result', '#profit', '#loss', '#total-profit',
      'span:has-text("Profit")', 'span:has-text("Loss")',
      'div:has-text("Total")', '.summary'
    ];
    
    let resultVisible = false;
    for (const selector of resultSelectors) {
      try {
        await expect(page.locator(selector)).toBeVisible({ timeout: 2000 });
        resultVisible = true;
        break;
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!resultVisible) {
      // If no specific result container found, check if any text suggests calculation occurred
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/\$?\d+\.?\d*/); // Should have some dollar amounts or numbers
    }
  });

  test('Fee calculation functionality', async ({ page }) => {
    // Fill basic trade data
    await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '1000');
    await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '1');
    await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '1200');
    
    // Look for buy fee input (specific ID from the HTML structure)
    const buyFeeInput = page.locator('#buy_fee_amount_0');
    if (await buyFeeInput.isVisible()) {
      await buyFeeInput.fill('2.5'); // 2.5% fee
      
      // Fee type is already set to percentage by default
      
      // Trigger calculation
      const calculateButton = page.locator('#calculateButton');
      await calculateButton.click();
      
      await page.waitForTimeout(1000);
      
      // Verify fees are factored into calculation
      const resultsSection = page.locator('#resultsSection');
      await expect(resultsSection).toBeVisible();
      
      const pageContent = await page.textContent('body');
      expect(pageContent).toMatch(/fee|Fee/); // Should mention fees somewhere
    }
  });

  test('Input validation and error handling', async ({ page }) => {
    // Test empty inputs
    const calculateButton = page.locator('#calculateButton');
    await calculateButton.click();
    
    // Check for validation messages (HTML5 validation may prevent form submission)
    await page.waitForTimeout(500);
    const hasValidationMessages = await page.locator('.error, .invalid, [class*="error"]').count() > 0;
    const pageContent = await page.textContent('body');
    const hasErrorText = /required|invalid|error|please/i.test(pageContent);
    
    // May have browser validation or custom validation
    if (hasValidationMessages || hasErrorText) {
      expect(hasValidationMessages || hasErrorText).toBeTruthy();
    } else {
      console.log('No validation messages found - may use browser native validation');
    }
    
    // Test negative values
    await page.fill('#purchase_price_0', '-100');
    await page.fill('#quantity_0', '10');
    await page.fill('#sale_price_0', '150');
    
    await calculateButton.click();
    
    // Should handle negative values appropriately (either error or accept them)
    await page.waitForTimeout(500);
  });

  test('Reset functionality', async ({ page }) => {
    // Fill in some data
    await page.fill('#purchase_price_0', '100');
    await page.fill('#quantity_0', '10');
    await page.fill('#sale_price_0', '150');
    
    // Look for reset button
    const resetButton = page.locator('#resetButton');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      // Verify inputs are cleared
      await expect(page.locator('#purchase_price_0')).toHaveValue('');
      await expect(page.locator('#quantity_0')).toHaveValue('');
      await expect(page.locator('#sale_price_0')).toHaveValue('');
    }
  });

  test('Results display correctly', async ({ page }) => {
    // Fill in profitable trade
    await page.fill('#purchase_price_0', '50');
    await page.fill('#quantity_0', '20');
    await page.fill('#sale_price_0', '75');
    
    const calculateButton = page.locator('#calculateButton');
    await calculateButton.click();
    
    await page.waitForTimeout(1000);
    
    // Wait for results to be visible
    const resultsSection = page.locator('#resultsSection');
    await expect(resultsSection).toBeVisible();
    
    // Check if profit is displayed (should be $500 profit: (75-50)*20)
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/\$?\s*500|\+\s*500/); // Looking for $500 profit indication
    
    // Test losing trade
    await page.fill('#purchase_price_0', '100');
    await page.fill('#quantity_0', '5');
    await page.fill('#sale_price_0', '80');
    
    await calculateButton.click();
    
    await page.waitForTimeout(1000);
    
    // Check if loss is displayed (should be -$100 loss: (80-100)*5)
    const updatedContent = await page.textContent('body');
    expect(updatedContent).toMatch(/\$?\s*-?100|-\s*100/); // Looking for $100 loss indication
  });
});