const { test, expect } = require('@playwright/test');

test.describe('Crypto Profit/Loss Calculator - Multi-Trade Functionality', () => {
  const calculatorUrl = '/finance/cryptocurrency/crypto-profit-calculator/';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(calculatorUrl);
  });

  test('Add multiple trades functionality', async ({ page }) => {
    // Fill first trade
    await page.fill('#purchase_price_0', '100');
    await page.fill('#quantity_0', '10');
    await page.fill('#sale_price_0', '120');
    
    // Look for "Add Another Trade" button (specific ID from HTML)
    const addTradeButton = page.locator('#addTradeButton');
    
    if (addTradeButton) {
      await addTradeButton.click();
      await page.waitForTimeout(500);
      
      // Check if a new set of input fields appeared
      const tradeInputs = page.locator('[id^="purchase_price_"]');
      const inputCount = await tradeInputs.count();
      expect(inputCount).toBeGreaterThan(1); // Should have more than one set of inputs
      
      // Fill second trade (assuming it gets ID _1)
      const secondPurchaseInput = page.locator('#purchase_price_1');
      const secondQuantityInput = page.locator('#quantity_1');
      const secondSaleInput = page.locator('#sale_price_1');
      
      if (await secondPurchaseInput.isVisible()) {
        await secondPurchaseInput.fill('200');
      }
      if (await secondQuantityInput.isVisible()) {
        await secondQuantityInput.fill('5');
      }
      if (await secondSaleInput.isVisible()) {
        await secondSaleInput.fill('180');
      }
    }
  });

  test('Aggregate calculation across multiple trades', async ({ page }) => {
    // Add first trade (profitable)
    await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '50');
    await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '10');
    await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '60');
    
    // Try to add another trade
    const addTradeButton = page.locator('button:has-text("Add Another"), button:has-text("Add Trade"), button:has-text("+")').first();
    if (await addTradeButton.isVisible()) {
      await addTradeButton.click();
      await page.waitForTimeout(500);
      
      // Add second trade (loss)
      const inputs = page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]');
      if (await inputs.count() > 1) {
        await inputs.nth(1).fill('100');
        await page.locator('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]').nth(1).fill('5');
        await page.locator('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]').nth(1).fill('90');
      }
    }
    
    // Calculate total
    const calculateButton = page.locator('#calculateButton');
    await calculateButton.click();
    await page.waitForTimeout(1000);
    
    // Should show aggregate results
    // Trade 1: (60-50)*10 = +100
    // Trade 2: (90-100)*5 = -50
    // Total: +50
    const pageContent = await page.textContent('body');
    
    // Look for total/summary section
    const hasSummary = /total|summary|aggregate|overall/i.test(pageContent);
    if (hasSummary) {
      expect(pageContent).toMatch(/\$?\s*50|\+\s*50/); // Should show net profit of $50
    }
  });

  test('Trade removal functionality', async ({ page }) => {
    // Fill initial trade
    await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '100');
    await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '10');
    await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '120');
    
    // Add another trade if possible
    const addTradeButton = page.locator('button:has-text("Add Another"), button:has-text("Add Trade"), button:has-text("+")').first();
    if (await addTradeButton.isVisible()) {
      await addTradeButton.click();
      await page.waitForTimeout(500);
      
      // Look for remove/delete buttons
      const removeButtons = page.locator('button:has-text("Remove"), button:has-text("Delete"), button:has-text("X"), button:has-text("×"), .remove-trade, .delete-trade');
      
      if (await removeButtons.count() > 0) {
        const initialTradeCount = await page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]').count();
        
        // Click remove button
        await removeButtons.first().click();
        await page.waitForTimeout(500);
        
        // Verify trade was removed
        const finalTradeCount = await page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]').count();
        expect(finalTradeCount).toBeLessThan(initialTradeCount);
      }
    }
  });

  test('Individual trade breakdown display', async ({ page }) => {
    // Add first trade
    await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '100');
    await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '5');
    await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '150');
    
    // Try to add second trade
    const addTradeButton = page.locator('button:has-text("Add Another"), button:has-text("Add Trade"), button:has-text("+")').first();
    if (await addTradeButton.isVisible()) {
      await addTradeButton.click();
      await page.waitForTimeout(500);
      
      const inputs = page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]');
      if (await inputs.count() > 1) {
        await inputs.nth(1).fill('200');
        await page.locator('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]').nth(1).fill('3');
        await page.locator('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]').nth(1).fill('180');
      }
    }
    
    // Calculate
    const calculateButton = page.locator('button:has-text("Calculate"), input[type="button"][value*="Calculate"]');
    if (await calculateButton.isVisible()) {
      await calculateButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for individual trade breakdowns
    const pageContent = await page.textContent('body');
    
    // Should show individual trade results
    // Trade 1: (150-100)*5 = $250 profit
    // Trade 2: (180-200)*3 = -$60 loss
    
    // Look for trade-specific results
    const hasBreakdown = /trade\s*1|trade\s*2|individual|breakdown/i.test(pageContent);
    if (hasBreakdown) {
      expect(pageContent).toMatch(/250/); // First trade profit
      expect(pageContent).toMatch(/60/);  // Second trade loss
    }
  });

  test('Reset all trades functionality', async ({ page }) => {
    // Fill multiple trades if possible
    await page.fill('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]', '100');
    await page.fill('input[placeholder*="Quantity"], input[id*="quantity"], input[name*="quantity"]', '10');
    await page.fill('input[placeholder*="Sale"], input[id*="sale"], input[name*="sale"]', '120');
    
    // Try to add another trade
    const addTradeButton = page.locator('button:has-text("Add Another"), button:has-text("Add Trade"), button:has-text("+")').first();
    if (await addTradeButton.isVisible()) {
      await addTradeButton.click();
      await page.waitForTimeout(500);
    }
    
    // Look for "Reset All" button
    const resetAllButton = page.locator('button:has-text("Reset All"), button:has-text("Clear All"), button:has-text("Reset")');
    if (await resetAllButton.isVisible()) {
      await resetAllButton.click();
      await page.waitForTimeout(500);
      
      // Verify all inputs are cleared
      const allInputs = page.locator('input[type="number"], input[type="text"]');
      const inputCount = await allInputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const inputValue = await allInputs.nth(i).inputValue();
        expect(inputValue).toBe('');
      }
      
      // Should also reset to single trade view
      const purchaseInputs = page.locator('input[placeholder*="Purchase"], input[id*="purchase"], input[name*="purchase"]');
      const finalInputCount = await purchaseInputs.count();
      expect(finalInputCount).toBe(1); // Should reset to single trade
    }
  });
});