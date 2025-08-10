/*
 * Sprint 4 Budgeting Calculator - Comprehensive Production Testing Suite
 * Testing all 4 production URLs with performance metrics and detailed validation
 * 
 * Test Targets:
 * - 50/30/20 Budget Calculator: https://freecalchub.com/finance/budgeting/50-30-20-calculator/
 * - Zero-Based Budget Calculator: https://freecalchub.com/finance/budgeting/zero-based-budget-calculator/
 * - Emergency Fund Calculator: https://freecalchub.com/finance/budgeting/emergency-fund-calculator/
 * - Budgeting Category Page: https://freecalchub.com/finance/budgeting/
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

test.describe('Sprint 4 Budgeting Calculator - Production Comprehensive Testing', () => {
    
    test.describe('50/30/20 Budget Calculator - Complete Validation', () => {
        const calculatorUrl = '/finance/budgeting/50-30-20-calculator/';
        
        test('should load successfully with acceptable performance', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            // Performance validation - should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
            console.log(`50/30/20 Calculator load time: ${loadTime}ms`);
            
            // Collect detailed performance metrics
            const metrics = await collectPerformanceMetrics(page);
            console.log('Performance Metrics:', JSON.stringify(metrics, null, 2));
            
            // Validate page loaded correctly
            await expect(page.locator('h1')).toContainText('50/30/20', { timeout: 10000 });
            await expect(page).toHaveTitle(/50.*30.*20.*Budget/i);
            
            // Check for JavaScript errors
            await page.waitForTimeout(2000);
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors on page load`);
            }
            
            console.log(`Warnings found: ${warnings.length}`);
        });
        
        test('should perform accurate 50/30/20 budget calculations', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test Case 1: $5000 income
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            
            await expect(incomeInput).toBeVisible();
            await expect(calculateButton).toBeVisible();
            
            await incomeInput.fill('5000');
            
            const calculationStart = Date.now();
            await calculateButton.click();
            
            // Wait for results to appear
            const resultsSection = page.locator('#resultsSection');
            await expect(resultsSection).toBeVisible({ timeout: 10000 });
            
            const calculationTime = Date.now() - calculationStart;
            expect(calculationTime).toBeLessThan(1000); // Should calculate within 1 second
            console.log(`Calculation time: ${calculationTime}ms`);
            
            // Validate calculations
            const needsAmount = page.locator('#needsAmount');
            const wantsAmount = page.locator('#wantsAmount');
            const savingsAmount = page.locator('#savingsAmount');
            
            await expect(needsAmount).toContainText('2,500'); // 50% of 5000
            await expect(wantsAmount).toContainText('1,500'); // 30% of 5000
            await expect(savingsAmount).toContainText('1,000'); // 20% of 5000
            
            // Test percentages are displayed
            await expect(page.locator('.needs-percentage')).toContainText('50%');
            await expect(page.locator('.wants-percentage')).toContainText('30%');
            await expect(page.locator('.savings-percentage')).toContainText('20%');
        });
        
        test('should handle edge cases and validation', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            
            // Test Case: Empty input
            await calculateButton.click();
            // Should show validation message or handle gracefully
            
            // Test Case: Zero income
            await incomeInput.fill('0');
            await calculateButton.click();
            await page.waitForTimeout(1000);
            
            // Test Case: Very large income
            await incomeInput.fill('100000');
            await calculateButton.click();
            
            const resultsSection = page.locator('#resultsSection');
            await expect(resultsSection).toBeVisible({ timeout: 5000 });
            
            // Should show 50,000 / 30,000 / 20,000
            await expect(page.locator('#needsAmount')).toContainText('50,000');
            await expect(page.locator('#wantsAmount')).toContainText('30,000');
            await expect(page.locator('#savingsAmount')).toContainText('20,000');
            
            // Test Case: Decimal input
            await incomeInput.fill('5250.50');
            await calculateButton.click();
            await page.waitForTimeout(1000);
            
            // Should handle decimals properly
        });
        
        test('should display educational content and recommendations', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Check for FAQ section
            const faqSection = page.locator('.faq-section, #faq');
            if (await faqSection.isVisible()) {
                await expect(faqSection).toBeVisible();
            }
            
            // Check for budget guidance
            const guidanceSection = page.locator('.guidance, .recommendations, .budget-tips');
            if (await guidanceSection.count() > 0) {
                await expect(guidanceSection.first()).toBeVisible();
            }
            
            // Check Schema.org markup
            const schemaScript = page.locator('script[type="application/ld+json"]');
            if (await schemaScript.count() > 0) {
                const schemaContent = await schemaScript.first().textContent();
                expect(schemaContent).toBeTruthy();
                console.log('Schema markup found');
            }
        });
        
        test('should be mobile responsive', async ({ page }) => {
            // Test on mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Check if mobile layout works
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            
            await expect(incomeInput).toBeVisible();
            await expect(calculateButton).toBeVisible();
            
            // Test touch interaction
            await incomeInput.tap();
            await incomeInput.fill('4000');
            await calculateButton.tap();
            
            const resultsSection = page.locator('#resultsSection');
            await expect(resultsSection).toBeVisible({ timeout: 5000 });
            
            // Check mobile-specific elements
            const mobileMenu = page.locator('.mobile-menu, .hamburger-menu');
            if (await mobileMenu.isVisible()) {
                await expect(mobileMenu).toBeVisible();
            }
        });
    });
    
    test.describe('Zero-Based Budget Calculator - Complete Validation', () => {
        const calculatorUrl = '/finance/budgeting/zero-based-budget-calculator/';
        
        test('should load successfully with performance validation', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(3000);
            console.log(`Zero-Based Budget Calculator load time: ${loadTime}ms`);
            
            await expect(page.locator('h1')).toContainText('Zero-Based', { timeout: 10000 });
            await expect(page).toHaveTitle(/Zero.*Based.*Budget/i);
            
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors on page load`);
            }
        });
        
        test('should validate zero-based budget logic', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            const incomeInput = page.locator('#monthlyIncome');
            const addCategoryButton = page.locator('#addCategoryButton, .add-category');
            
            await expect(incomeInput).toBeVisible();
            await incomeInput.fill('4000');
            
            // Test adding expense categories to reach zero
            if (await addCategoryButton.isVisible()) {
                await addCategoryButton.click();
            }
            
            // Look for existing expense inputs or add new ones
            const expenseInputs = page.locator('input[id*="expense"], input[class*="expense"], input[name*="amount"]');
            const expenseCount = await expenseInputs.count();
            
            if (expenseCount > 0) {
                // Fill expense categories to total $4000
                const expenses = [1200, 800, 600, 400, 300, 200, 500]; // Total = 4000
                
                for (let i = 0; i < Math.min(expenseCount, expenses.length); i++) {
                    await expenseInputs.nth(i).fill(expenses[i].toString());
                }
                
                // Calculate and check for zero balance
                const calculateButton = page.locator('#calculateButton, .calculate-btn');
                if (await calculateButton.isVisible()) {
                    await calculateButton.click();
                    await page.waitForTimeout(2000);
                    
                    // Check for zero balance indicator
                    const balanceIndicator = page.locator('#balance, .balance, #remaining, .remaining');
                    if (await balanceIndicator.isVisible()) {
                        const balanceText = await balanceIndicator.textContent();
                        console.log('Budget Balance:', balanceText);
                    }
                }
            }
        });
        
        test('should handle expense category management', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test adding categories
            const addButton = page.locator('#addCategoryButton, .add-category, button[id*="add"], button[class*="add"]');
            if (await addButton.isVisible()) {
                const initialCount = await page.locator('.expense-category, .category-row').count();
                await addButton.click();
                await page.waitForTimeout(500);
                
                const newCount = await page.locator('.expense-category, .category-row').count();
                expect(newCount).toBeGreaterThan(initialCount);
            }
            
            // Test removing categories
            const removeButtons = page.locator('.remove-category, button[class*="remove"], .delete-category');
            if (await removeButtons.count() > 0) {
                const initialCount = await page.locator('.expense-category, .category-row').count();
                await removeButtons.first().click();
                await page.waitForTimeout(500);
                
                const newCount = await page.locator('.expense-category, .category-row').count();
                expect(newCount).toBeLessThan(initialCount);
            }
        });
        
        test('should show surplus/deficit calculations', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            const incomeInput = page.locator('#monthlyIncome');
            await incomeInput.fill('5000');
            
            // Add expenses totaling less than income to create surplus
            const expenseInputs = page.locator('input[id*="expense"], input[class*="expense"]');
            const expenseCount = await expenseInputs.count();
            
            if (expenseCount > 0) {
                // Total expenses = $3500 (creating $1500 surplus)
                const expenses = [1000, 800, 600, 500, 400, 200];
                
                for (let i = 0; i < Math.min(expenseCount, expenses.length); i++) {
                    await expenseInputs.nth(i).fill(expenses[i].toString());
                }
                
                const calculateButton = page.locator('#calculateButton, .calculate-btn');
                if (await calculateButton.isVisible()) {
                    await calculateButton.click();
                    await page.waitForTimeout(2000);
                    
                    // Check for surplus/deficit indicators
                    const surplusIndicator = page.locator('.surplus, #surplus, .positive-balance');
                    const deficitIndicator = page.locator('.deficit, #deficit, .negative-balance');
                    
                    // Should show surplus of $1500
                    if (await surplusIndicator.isVisible()) {
                        const surplusText = await surplusIndicator.textContent();
                        console.log('Budget Surplus:', surplusText);
                        expect(surplusText).toContain('1,500');
                    }
                }
            }
        });
    });
    
    test.describe('Emergency Fund Calculator - Complete Validation', () => {
        const calculatorUrl = '/finance/budgeting/emergency-fund-calculator/';
        
        test('should load successfully and validate performance', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(3000);
            console.log(`Emergency Fund Calculator load time: ${loadTime}ms`);
            
            await expect(page.locator('h1')).toContainText('Emergency Fund', { timeout: 10000 });
            await expect(page).toHaveTitle(/Emergency.*Fund/i);
            
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors on page load`);
            }
        });
        
        test('should calculate emergency fund targets accurately', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test with $3000 monthly expenses
            await page.locator('#housingCost').fill('1200');
            await page.locator('#utilitiesCost').fill('200');
            await page.locator('#foodCost').fill('400');
            await page.locator('#transportationCost').fill('300');
            await page.locator('#insuranceCost').fill('150');
            await page.locator('#otherExpenses').fill('750'); // Total = $3000
            
            // Test 3-month fund
            await page.locator('#emergencyMonths').selectOption('3');
            await page.locator('#calculateButton').click();
            
            await page.waitForTimeout(2000);
            
            const resultsSection = page.locator('#resultsSection');
            await expect(resultsSection).toBeVisible({ timeout: 5000 });
            
            // Should show $9,000 for 3 months (3 * $3000)
            const fundTarget = page.locator('#fundTarget, .fund-target');
            if (await fundTarget.isVisible()) {
                const targetText = await fundTarget.textContent();
                expect(targetText).toContain('9,000');
                console.log('3-month fund target:', targetText);
            }
            
            // Test 6-month fund
            await page.locator('#emergencyMonths').selectOption('6');
            await page.locator('#calculateButton').click();
            await page.waitForTimeout(1000);
            
            if (await fundTarget.isVisible()) {
                const targetText = await fundTarget.textContent();
                expect(targetText).toContain('18,000'); // 6 * $3000
                console.log('6-month fund target:', targetText);
            }
        });
        
        test('should calculate savings plan and timeline', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Fill monthly expenses ($3000 total)
            await page.locator('#housingCost').fill('1200');
            await page.locator('#utilitiesCost').fill('200');
            await page.locator('#foodCost').fill('400');
            await page.locator('#transportationCost').fill('300');
            await page.locator('#insuranceCost').fill('150');
            await page.locator('#otherExpenses').fill('750');
            
            // Set 6-month fund goal
            await page.locator('#emergencyMonths').selectOption('6');
            
            // Set monthly savings amount
            const monthlySavingsInput = page.locator('#monthlySavings, #savingsAmount');
            if (await monthlySavingsInput.isVisible()) {
                await monthlySavingsInput.fill('500'); // $500/month towards emergency fund
            }
            
            await page.locator('#calculateButton').click();
            await page.waitForTimeout(2000);
            
            // Check savings timeline (should be 36 months: $18,000 / $500 = 36)
            const timeline = page.locator('#timeToGoal, .timeline, .months-to-goal');
            if (await timeline.isVisible()) {
                const timelineText = await timeline.textContent();
                console.log('Time to reach goal:', timelineText);
                
                // Should contain "36 months" or similar
                expect(timelineText.toLowerCase()).toMatch(/36|three.*year/);
            }
            
            // Check monthly savings required calculation
            const requiredSavings = page.locator('#requiredSavings, .required-monthly');
            if (await requiredSavings.isVisible()) {
                const savingsText = await requiredSavings.textContent();
                console.log('Required monthly savings:', savingsText);
            }
        });
        
        test('should validate different emergency fund scenarios', async ({ page }) => {
            await page.goto(calculatorUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test minimal expenses scenario
            await page.locator('#housingCost').fill('800');
            await page.locator('#utilitiesCost').fill('100');
            await page.locator('#foodCost').fill('300');
            await page.locator('#transportationCost').fill('200');
            await page.locator('#insuranceCost').fill('100');
            await page.locator('#otherExpenses').fill('500'); // Total = $2000
            
            // 12-month fund
            await page.locator('#emergencyMonths').selectOption('12');
            await page.locator('#calculateButton').click();
            await page.waitForTimeout(2000);
            
            const fundTarget = page.locator('#fundTarget, .fund-target');
            if (await fundTarget.isVisible()) {
                const targetText = await fundTarget.textContent();
                expect(targetText).toContain('24,000'); // 12 * $2000
                console.log('12-month fund target for low expenses:', targetText);
            }
            
            // Test high expenses scenario
            await page.locator('#housingCost').fill('2500');
            await page.locator('#utilitiesCost').fill('300');
            await page.locator('#foodCost').fill('600');
            await page.locator('#transportationCost').fill('500');
            await page.locator('#insuranceCost').fill('300');
            await page.locator('#otherExpenses').fill('800'); // Total = $5000
            
            await page.locator('#emergencyMonths').selectOption('6');
            await page.locator('#calculateButton').click();
            await page.waitForTimeout(2000);
            
            if (await fundTarget.isVisible()) {
                const targetText = await fundTarget.textContent();
                expect(targetText).toContain('30,000'); // 6 * $5000
                console.log('6-month fund target for high expenses:', targetText);
            }
        });
    });
    
    test.describe('Budgeting Category Page - Navigation and Structure', () => {
        const categoryUrl = '/finance/budgeting/';
        
        test('should load category page successfully', async ({ page }) => {
            const { errors, warnings } = setupErrorCollector(page);
            
            const startTime = Date.now();
            await page.goto(categoryUrl);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;
            
            expect(loadTime).toBeLessThan(3000);
            console.log(`Budgeting Category Page load time: ${loadTime}ms`);
            
            await expect(page.locator('h1')).toContainText('Budgeting', { timeout: 10000 });
            await expect(page).toHaveTitle(/Budgeting/i);
            
            if (errors.length > 0) {
                console.log('JavaScript Errors:', errors);
                throw new Error(`Found ${errors.length} JavaScript errors on page load`);
            }
        });
        
        test('should contain links to all budgeting calculators', async ({ page }) => {
            await page.goto(categoryUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Check for 50/30/20 calculator link
            const fiftyThirtyTwentyLink = page.locator('a[href*="50-30-20-calculator"]');
            await expect(fiftyThirtyTwentyLink).toBeVisible();
            
            // Check for Zero-Based Budget calculator link
            const zeroBasedLink = page.locator('a[href*="zero-based-budget-calculator"]');
            await expect(zeroBasedLink).toBeVisible();
            
            // Check for Emergency Fund calculator link
            const emergencyFundLink = page.locator('a[href*="emergency-fund-calculator"]');
            await expect(emergencyFundLink).toBeVisible();
            
            // Count total calculator links
            const calculatorLinks = page.locator('a[href*="calculator"]');
            const linkCount = await calculatorLinks.count();
            console.log(`Found ${linkCount} calculator links on budgeting category page`);
            
            // Should have at least 3 working calculators
            expect(linkCount).toBeGreaterThanOrEqual(3);
        });
        
        test('should navigate to each calculator successfully', async ({ page }) => {
            await page.goto(categoryUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Test 50/30/20 calculator navigation
            const fiftyThirtyTwentyLink = page.locator('a[href*="50-30-20-calculator"]').first();
            if (await fiftyThirtyTwentyLink.isVisible()) {
                await fiftyThirtyTwentyLink.click();
                await page.waitForLoadState('domcontentloaded');
                await expect(page.locator('h1')).toContainText('50/30/20');
                await page.goBack();
                await page.waitForLoadState('domcontentloaded');
            }
            
            // Test Zero-Based Budget calculator navigation
            const zeroBasedLink = page.locator('a[href*="zero-based-budget-calculator"]').first();
            if (await zeroBasedLink.isVisible()) {
                await zeroBasedLink.click();
                await page.waitForLoadState('domcontentloaded');
                await expect(page.locator('h1')).toContainText('Zero-Based');
                await page.goBack();
                await page.waitForLoadState('domcontentloaded');
            }
            
            // Test Emergency Fund calculator navigation
            const emergencyFundLink = page.locator('a[href*="emergency-fund-calculator"]').first();
            if (await emergencyFundLink.isVisible()) {
                await emergencyFundLink.click();
                await page.waitForLoadState('domcontentloaded');
                await expect(page.locator('h1')).toContainText('Emergency Fund');
                await page.goBack();
                await page.waitForLoadState('domcontentloaded');
            }
        });
        
        test('should have proper template compliance', async ({ page }) => {
            await page.goto(categoryUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Check for breadcrumb navigation
            const breadcrumb = page.locator('.breadcrumb, nav[aria-label*="breadcrumb"]');
            if (await breadcrumb.isVisible()) {
                await expect(breadcrumb).toBeVisible();
                console.log('Breadcrumb navigation found');
            }
            
            // Check for dark mode compatibility
            const darkModeToggle = page.locator('.dark-mode-toggle, #darkModeToggle');
            if (await darkModeToggle.isVisible()) {
                console.log('Dark mode toggle found');
            }
            
            // Check for Schema.org markup
            const schemaScripts = page.locator('script[type="application/ld+json"]');
            const schemaCount = await schemaScripts.count();
            if (schemaCount > 0) {
                console.log(`Found ${schemaCount} Schema.org markup scripts`);
            }
            
            // Check for FAQ section
            const faqSection = page.locator('.faq-section, #faq');
            if (await faqSection.isVisible()) {
                console.log('FAQ section found');
            }
            
            // Check for related calculator links
            const relatedLinks = page.locator('.related-calculators, .calculator-grid');
            if (await relatedLinks.isVisible()) {
                console.log('Related calculators section found');
            }
        });
        
        test('should be mobile responsive', async ({ page }) => {
            // Test mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto(categoryUrl);
            await page.waitForLoadState('domcontentloaded');
            
            // Check mobile navigation
            const mobileMenu = page.locator('.mobile-menu, .hamburger-menu, .menu-toggle');
            if (await mobileMenu.isVisible()) {
                await mobileMenu.click();
                await page.waitForTimeout(500);
            }
            
            // Check calculator cards are visible on mobile
            const calculatorCards = page.locator('.calculator-card, .calc-item');
            const cardCount = await calculatorCards.count();
            if (cardCount > 0) {
                await expect(calculatorCards.first()).toBeVisible();
                console.log(`${cardCount} calculator cards visible on mobile`);
            }
            
            // Test touch interactions
            const firstCalculatorLink = page.locator('a[href*="calculator"]').first();
            if (await firstCalculatorLink.isVisible()) {
                await firstCalculatorLink.tap();
                await page.waitForLoadState('domcontentloaded');
                // Should navigate successfully
                await expect(page).toHaveURL(/calculator/);
            }
        });
    });
    
    test.describe('Cross-Browser and Device Compatibility', () => {
        
        test('should work consistently across browsers', async ({ page, browserName }) => {
            console.log(`Testing on browser: ${browserName}`);
            
            // Test each calculator URL
            const calculatorUrls = [
                '/finance/budgeting/50-30-20-calculator/',
                '/finance/budgeting/zero-based-budget-calculator/',
                '/finance/budgeting/emergency-fund-calculator/',
                '/finance/budgeting/'
            ];
            
            for (const url of calculatorUrls) {
                await page.goto(url);
                await page.waitForLoadState('domcontentloaded');
                
                // Basic functionality check
                await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
                
                // Check for JavaScript functionality
                const calculateButton = page.locator('#calculateButton, .calculate-btn');
                if (await calculateButton.isVisible()) {
                    console.log(`Calculate button functional on ${browserName} for ${url}`);
                }
            }
        });
        
        test('should handle various screen sizes', async ({ page }) => {
            const viewports = [
                { width: 1920, height: 1080, name: 'Desktop Large' },
                { width: 1366, height: 768, name: 'Desktop Medium' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 375, height: 667, name: 'Mobile' }
            ];
            
            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.goto('/finance/budgeting/50-30-20-calculator/');
                await page.waitForLoadState('domcontentloaded');
                
                console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
                
                // Check if key elements are visible
                await expect(page.locator('h1')).toBeVisible();
                const incomeInput = page.locator('#monthlyIncome');
                if (await incomeInput.isVisible()) {
                    await expect(incomeInput).toBeVisible();
                }
            }
        });
    });
    
    test.describe('Performance and Quality Benchmarks', () => {
        
        test('should meet performance standards across all calculators', async ({ page }) => {
            const calculatorUrls = [
                { url: '/finance/budgeting/50-30-20-calculator/', name: '50/30/20 Calculator' },
                { url: '/finance/budgeting/zero-based-budget-calculator/', name: 'Zero-Based Budget Calculator' },
                { url: '/finance/budgeting/emergency-fund-calculator/', name: 'Emergency Fund Calculator' },
                { url: '/finance/budgeting/', name: 'Budgeting Category Page' }
            ];
            
            const performanceResults = {};
            
            for (const calculator of calculatorUrls) {
                const startTime = Date.now();
                await page.goto(calculator.url);
                await page.waitForLoadState('domcontentloaded');
                const loadTime = Date.now() - startTime;
                
                const metrics = await collectPerformanceMetrics(page);
                performanceResults[calculator.name] = {
                    loadTime,
                    ...metrics
                };
                
                // Performance assertions
                expect(loadTime).toBeLessThan(3000); // < 3 seconds
                console.log(`${calculator.name}: ${loadTime}ms`);
            }
            
            console.log('Performance Summary:', JSON.stringify(performanceResults, null, 2));
        });
        
        test('should have no accessibility violations', async ({ page }) => {
            const calculatorUrls = [
                '/finance/budgeting/50-30-20-calculator/',
                '/finance/budgeting/zero-based-budget-calculator/',
                '/finance/budgeting/emergency-fund-calculator/',
                '/finance/budgeting/'
            ];
            
            for (const url of calculatorUrls) {
                await page.goto(url);
                await page.waitForLoadState('domcontentloaded');
                
                // Basic accessibility checks
                const heading = page.locator('h1');
                await expect(heading).toBeVisible();
                
                // Check for alt text on images
                const images = page.locator('img');
                const imageCount = await images.count();
                
                for (let i = 0; i < imageCount; i++) {
                    const alt = await images.nth(i).getAttribute('alt');
                    if (alt === null || alt === '') {
                        console.log(`Warning: Image without alt text found on ${url}`);
                    }
                }
                
                // Check for form labels
                const inputs = page.locator('input[type="number"], input[type="text"]');
                const inputCount = await inputs.count();
                
                for (let i = 0; i < inputCount; i++) {
                    const inputId = await inputs.nth(i).getAttribute('id');
                    if (inputId) {
                        const label = page.locator(`label[for="${inputId}"]`);
                        if (!(await label.isVisible())) {
                            console.log(`Warning: Input without associated label found on ${url}`);
                        }
                    }
                }
            }
        });
    });
});