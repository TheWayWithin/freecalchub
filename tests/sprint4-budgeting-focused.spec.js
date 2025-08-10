/*
 * Sprint 4 Budgeting Calculator - Focused Testing Suite
 * Testing individual calculator functionality with debugging
 */

const { test, expect } = require('@playwright/test');

test.describe('Sprint 4 Budgeting Calculator - Focused Testing', () => {
    
    test.describe('50/30/20 Budget Calculator - Basic Functionality', () => {
        
        test('should load and perform basic calculation', async ({ page }) => {
            await page.goto('file:///Users/jamiewatters/DevProjects/freecalchub/finance/budgeting/50-30-20-calculator/index.html');
            
            // Wait for page to load
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            
            // Check if page loaded correctly
            await expect(page.locator('h1')).toContainText('50/30/20');
            
            // Check if form elements exist
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            
            await expect(incomeInput).toBeVisible();
            await expect(calculateButton).toBeVisible();
            
            // Perform basic calculation
            await incomeInput.fill('5000');
            await calculateButton.click();
            
            // Wait a bit for calculation to complete
            await page.waitForTimeout(3000);
            
            // Check if results appear
            const resultsSection = page.locator('#resultsSection');
            console.log('Results section display style:', await resultsSection.getAttribute('style'));
            
            // Check for error messages
            const errorMessages = page.locator('#errorMessages');
            if (await errorMessages.isVisible()) {
                console.log('Error message:', await errorMessages.textContent());
            }
            
            // Take a screenshot for debugging
            await page.screenshot({ path: 'test-results/50-30-20-basic-test.png' });
        });
    });
    
    test.describe('Zero-Based Budget Calculator - Basic Functionality', () => {
        
        test('should load and show initial interface', async ({ page }) => {
            await page.goto('file:///Users/jamiewatters/DevProjects/freecalchub/finance/budgeting/zero-based-budget-calculator/index.html');
            
            // Wait for page to load
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            
            // Check if page loaded correctly
            await expect(page.locator('h1')).toContainText('Zero-Based');
            
            // Check key elements
            const incomeInput = page.locator('#monthlyIncome');
            const addCategoryButton = page.locator('#addCategoryButton');
            
            await expect(incomeInput).toBeVisible();
            await expect(addCategoryButton).toBeVisible();
            
            // Take a screenshot
            await page.screenshot({ path: 'test-results/zero-based-basic-test.png' });
        });
    });
    
    test.describe('Emergency Fund Calculator - Basic Functionality', () => {
        
        test('should load and perform calculation', async ({ page }) => {
            await page.goto('file:///Users/jamiewatters/DevProjects/freecalchub/finance/budgeting/emergency-fund-calculator/index.html');
            
            // Wait for page to load
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            
            // Check if page loaded correctly
            await expect(page.locator('h1')).toContainText('Emergency Fund');
            
            // Check key form elements
            const housingCost = page.locator('#housingCost');
            const calculateButton = page.locator('#calculateButton');
            
            await expect(housingCost).toBeVisible();
            await expect(calculateButton).toBeVisible();
            
            // Fill basic inputs and calculate
            await housingCost.fill('1200');
            await page.locator('#utilitiesCost').fill('200');
            await page.locator('#foodCost').fill('400');
            await page.locator('#transportationCost').fill('300');
            await page.locator('#insuranceCost').fill('150');
            await page.locator('#emergencyMonths').selectOption('6');
            
            await calculateButton.click();
            await page.waitForTimeout(3000);
            
            // Check if results appear
            const resultsSection = page.locator('#resultsSection');
            console.log('Emergency Fund Results section display:', await resultsSection.getAttribute('style'));
            
            // Take a screenshot
            await page.screenshot({ path: 'test-results/emergency-fund-basic-test.png' });
        });
    });
    
    test.describe('Budgeting Category Page Integration', () => {
        
        test('should load category page with calculator links', async ({ page }) => {
            await page.goto('file:///Users/jamiewatters/DevProjects/freecalchub/finance/budgeting/index.html');
            
            // Wait for page to load
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(2000);
            
            // Check if page loaded
            await expect(page.locator('h1')).toContainText('Budgeting');
            
            // Look for calculator cards/links
            const calculatorLinks = page.locator('a[href*="calculator"]');
            const linkCount = await calculatorLinks.count();
            console.log('Found calculator links:', linkCount);
            
            // Check for specific calculators
            await expect(page.locator('a[href*="50-30-20-calculator"]')).toBeVisible();
            await expect(page.locator('a[href*="zero-based-budget-calculator"]')).toBeVisible();
            await expect(page.locator('a[href*="emergency-fund-calculator"]')).toBeVisible();
            
            // Take a screenshot
            await page.screenshot({ path: 'test-results/budgeting-category-page.png' });
        });
    });
    
    test.describe('JavaScript Error Detection', () => {
        
        test('should detect JavaScript errors in calculators', async ({ page }) => {
            const consoleMessages = [];
            
            page.on('console', msg => {
                consoleMessages.push({
                    type: msg.type(),
                    text: msg.text(),
                    location: msg.location()
                });
            });
            
            // Test 50/30/20 calculator
            await page.goto('file:///Users/jamiewatters/DevProjects/freecalchub/finance/budgeting/50-30-20-calculator/index.html');
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(3000);
            
            await page.locator('#monthlyIncome').fill('5000');
            await page.locator('#calculateButton').click();
            await page.waitForTimeout(2000);
            
            // Log any JavaScript errors
            const errors = consoleMessages.filter(msg => msg.type === 'error');
            if (errors.length > 0) {
                console.log('JavaScript Errors Found:');
                errors.forEach(error => {
                    console.log(`- ${error.text} at ${error.location?.url}:${error.location?.lineNumber}`);
                });
            } else {
                console.log('No JavaScript errors found');
            }
            
            // Log warnings and other messages for debugging
            consoleMessages.forEach(msg => {
                if (msg.type !== 'error') {
                    console.log(`${msg.type}: ${msg.text}`);
                }
            });
        });
    });
});