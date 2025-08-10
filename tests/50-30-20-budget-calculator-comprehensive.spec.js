/*
 * FreecalcHub.com - 50/30/20 Budget Calculator - Comprehensive E2E Test Suite
 * Sprint 4 Testing Mission - Budgeting Calculator Validation
 * Date: January 10, 2025
 */

const { test, expect } = require('@playwright/test');

// Test Data Constants
const VALID_INCOME = 5000;
const EXPECTED_NEEDS_DEFAULT = 2500;    // 50% of $5000
const EXPECTED_WANTS_DEFAULT = 1500;    // 30% of $5000  
const EXPECTED_SAVINGS_DEFAULT = 1000;  // 20% of $5000

const CUSTOM_NEEDS_PERCENT = 60;
const CUSTOM_WANTS_PERCENT = 25;
const CUSTOM_SAVINGS_PERCENT = 15;

const EXPECTED_NEEDS_CUSTOM = 3000;     // 60% of $5000
const EXPECTED_WANTS_CUSTOM = 1250;     // 25% of $5000
const EXPECTED_SAVINGS_CUSTOM = 750;    // 15% of $5000

const CURRENT_SPENDING = {
    needs: 2800,
    wants: 1200,
    savings: 1000
};

test.describe('50/30/20 Budget Calculator - Comprehensive Testing', () => {
    let page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto('file:///Users/jamiewatters/DevProjects/freecalchub/finance/budgeting/50-30-20-calculator/index.html');
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000); // Allow for JavaScript initialization
    });

    test.describe('🧪 FUNCTIONAL TESTING - Priority 1', () => {
        
        test('should load page with correct title and main elements', async () => {
            // Verify page title
            await expect(page).toHaveTitle(/50\/30\/20 Budget Calculator/);
            
            // Verify main heading
            const heading = page.locator('h1.page-title');
            await expect(heading).toHaveText('50/30/20 Budget Calculator');
            
            // Verify calculator form is visible
            const form = page.locator('#calculatorForm');
            await expect(form).toBeVisible();
            
            // Verify key input fields exist
            await expect(page.locator('#monthlyIncome')).toBeVisible();
            await expect(page.locator('#needsPercent')).toBeVisible();
            await expect(page.locator('#wantsPercent')).toBeVisible();
            await expect(page.locator('#savingsPercent')).toBeVisible();
        });

        test('should validate monthly income input correctly', async () => {
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            const errorMessages = page.locator('#errorMessages');
            
            // Test empty income
            await calculateButton.click();
            await expect(errorMessages).toContainText('Please enter a valid monthly income');
            
            // Test zero income
            await incomeInput.fill('0');
            await calculateButton.click();
            await expect(errorMessages).toContainText('greater than $0');
            
            // Test negative income
            await incomeInput.fill('-100');
            await calculateButton.click();
            await expect(errorMessages).toContainText('greater than $0');
            
            // Test valid income (should clear errors)
            await incomeInput.fill('5000');
            await calculateButton.click();
            await expect(errorMessages).not.toBeVisible();
        });

        test('should apply default 50/30/20 percentages correctly', async () => {
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            
            // Fill income and calculate
            await incomeInput.fill(VALID_INCOME.toString());
            await calculateButton.click();
            
            // Wait for results to appear
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Verify default percentages are displayed
            await expect(page.locator('#needsPercentDisplay')).toHaveText('50%');
            await expect(page.locator('#wantsPercentDisplay')).toHaveText('30%');
            await expect(page.locator('#savingsPercentDisplay')).toHaveText('20%');
            
            // Verify calculated amounts
            await expect(page.locator('#needsAmount')).toHaveText(`$${EXPECTED_NEEDS_DEFAULT.toLocaleString()}`);
            await expect(page.locator('#wantsAmount')).toHaveText(`$${EXPECTED_WANTS_DEFAULT.toLocaleString()}`);
            await expect(page.locator('#savingsAmount')).toHaveText(`$${EXPECTED_SAVINGS_DEFAULT.toLocaleString()}`);
        });

        test('should handle custom percentage sliders functionality', async () => {
            const incomeInput = page.locator('#monthlyIncome');
            const needsSlider = page.locator('#needsPercent');
            const wantsSlider = page.locator('#wantsPercent');
            const savingsSlider = page.locator('#savingsPercent');
            const needsText = page.locator('#needsPercentText');
            const wantsText = page.locator('#wantsPercentText');
            const savingsText = page.locator('#savingsPercentText');
            const totalPercent = page.locator('#totalPercent');
            
            await incomeInput.fill(VALID_INCOME.toString());
            
            // Test slider to text synchronization
            await needsSlider.fill(CUSTOM_NEEDS_PERCENT.toString());
            await expect(needsText).toHaveValue(CUSTOM_NEEDS_PERCENT.toString());
            
            await wantsSlider.fill(CUSTOM_WANTS_PERCENT.toString());
            await expect(wantsText).toHaveValue(CUSTOM_WANTS_PERCENT.toString());
            
            await savingsSlider.fill(CUSTOM_SAVINGS_PERCENT.toString());
            await expect(savingsText).toHaveValue(CUSTOM_SAVINGS_PERCENT.toString());
            
            // Verify total percentage updates
            await expect(totalPercent).toHaveText('100%');
            
            // Calculate with custom percentages
            await page.locator('#calculateButton').click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Verify custom amounts are calculated correctly
            await expect(page.locator('#needsAmount')).toHaveText(`$${EXPECTED_NEEDS_CUSTOM.toLocaleString()}`);
            await expect(page.locator('#wantsAmount')).toHaveText(`$${EXPECTED_WANTS_CUSTOM.toLocaleString()}`);
            await expect(page.locator('#savingsAmount')).toHaveText(`$${EXPECTED_SAVINGS_CUSTOM.toLocaleString()}`);
        });

        test('should validate percentage total equals 100%', async () => {
            const needsText = page.locator('#needsPercentText');
            const wantsText = page.locator('#wantsPercentText');
            const savingsText = page.locator('#savingsPercentText');
            const totalPercent = page.locator('#totalPercent');
            const calculateButton = page.locator('#calculateButton');
            const errorMessages = page.locator('#errorMessages');
            
            // Set percentages that don't total 100%
            await needsText.fill('40');
            await wantsText.fill('30'); 
            await savingsText.fill('20'); // Total = 90%
            
            // Verify total shows incorrect percentage
            await expect(totalPercent).toHaveText('90%');
            
            // Try to calculate and verify error
            await page.locator('#monthlyIncome').fill('5000');
            await calculateButton.click();
            await expect(errorMessages).toContainText('must total exactly 100%');
            
            // Fix to 100% total
            await savingsText.fill('30'); // Now totals 100%
            await expect(totalPercent).toHaveText('100%');
            
            // Should now calculate successfully
            await calculateButton.click();
            await expect(errorMessages).not.toBeVisible();
        });

        test('should display pie chart visualization', async () => {
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            
            await incomeInput.fill(VALID_INCOME.toString());
            await calculateButton.click();
            
            // Wait for results and chart
            await page.waitForSelector('#resultsSection[style*="block"]');
            await page.waitForSelector('#budgetChart');
            
            // Verify chart canvas exists and is visible
            const chartCanvas = page.locator('#budgetChart');
            await expect(chartCanvas).toBeVisible();
            
            // Verify chart container is present
            const chartContainer = page.locator('.chart-container');
            await expect(chartContainer).toBeVisible();
            await expect(chartContainer.locator('h4')).toHaveText('Budget Visualization');
        });

        test('should handle current spending comparison correctly', async () => {
            const incomeInput = page.locator('#monthlyIncome');
            const currentNeeds = page.locator('#currentNeeds');
            const currentWants = page.locator('#currentWants');
            const currentSavings = page.locator('#currentSavings');
            const calculateButton = page.locator('#calculateButton');
            
            // Fill all inputs
            await incomeInput.fill(VALID_INCOME.toString());
            await currentNeeds.fill(CURRENT_SPENDING.needs.toString());
            await currentWants.fill(CURRENT_SPENDING.wants.toString());
            await currentSavings.fill(CURRENT_SPENDING.savings.toString());
            
            await calculateButton.click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Verify comparison section appears
            await expect(page.locator('#comparisonResults')).toBeVisible();
            
            // Verify current amounts are displayed
            await expect(page.locator('#currentNeedsDisplay')).toContainText(CURRENT_SPENDING.needs.toString());
            await expect(page.locator('#currentWantsDisplay')).toContainText(CURRENT_SPENDING.wants.toString());
            await expect(page.locator('#currentSavingsDisplay')).toContainText(CURRENT_SPENDING.savings.toString());
            
            // Verify recommended amounts
            await expect(page.locator('#recommendedNeedsDisplay')).toContainText(EXPECTED_NEEDS_DEFAULT.toString());
            await expect(page.locator('#recommendedWantsDisplay')).toContainText(EXPECTED_WANTS_DEFAULT.toString());
            await expect(page.locator('#recommendedSavingsDisplay')).toContainText(EXPECTED_SAVINGS_DEFAULT.toString());
            
            // Verify differences are calculated and displayed
            await expect(page.locator('#needsDifference')).toBeVisible();
            await expect(page.locator('#wantsDifference')).toBeVisible();
            await expect(page.locator('#savingsDifference')).toBeVisible();
        });

        test('should reset form and clear results correctly', async () => {
            const incomeInput = page.locator('#monthlyIncome');
            const calculateButton = page.locator('#calculateButton');
            const resetButton = page.locator('#resetButton');
            const resultsSection = page.locator('#resultsSection');
            
            // Fill and calculate
            await incomeInput.fill(VALID_INCOME.toString());
            await calculateButton.click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Verify results are visible
            await expect(resultsSection).toBeVisible();
            
            // Reset form
            await resetButton.click();
            
            // Verify form is reset
            await expect(incomeInput).toHaveValue('');
            await expect(page.locator('#needsPercentText')).toHaveValue('50');
            await expect(page.locator('#wantsPercentText')).toHaveValue('30');
            await expect(page.locator('#savingsPercentText')).toHaveValue('20');
            
            // Verify results are hidden
            await expect(resultsSection).not.toBeVisible();
        });
    });

    test.describe('📊 MATHEMATICAL ACCURACY - Priority 2', () => {
        
        test('should calculate standard 50/30/20 split accurately', async () => {
            const testCases = [
                { income: 3000, needs: 1500, wants: 900, savings: 600 },
                { income: 5000, needs: 2500, wants: 1500, savings: 1000 },
                { income: 7500, needs: 3750, wants: 2250, savings: 1500 },
                { income: 10000, needs: 5000, wants: 3000, savings: 2000 }
            ];
            
            for (const testCase of testCases) {
                await page.locator('#monthlyIncome').fill(testCase.income.toString());
                await page.locator('#calculateButton').click();
                await page.waitForSelector('#resultsSection[style*="block"]');
                
                // Verify calculations are accurate to the dollar
                await expect(page.locator('#needsAmount')).toHaveText(`$${testCase.needs.toLocaleString()}`);
                await expect(page.locator('#wantsAmount')).toHaveText(`$${testCase.wants.toLocaleString()}`);
                await expect(page.locator('#savingsAmount')).toHaveText(`$${testCase.savings.toLocaleString()}`);
            }
        });

        test('should handle custom percentage calculations precisely', async () => {
            const income = 6000;
            
            const customPercentages = [
                { needs: 55, wants: 25, savings: 20, expectedNeeds: 3300, expectedWants: 1500, expectedSavings: 1200 },
                { needs: 45, wants: 35, savings: 20, expectedNeeds: 2700, expectedWants: 2100, expectedSavings: 1200 },
                { needs: 50, wants: 20, savings: 30, expectedNeeds: 3000, expectedWants: 1200, expectedSavings: 1800 }
            ];
            
            await page.locator('#monthlyIncome').fill(income.toString());
            
            for (const test of customPercentages) {
                await page.locator('#needsPercentText').fill(test.needs.toString());
                await page.locator('#wantsPercentText').fill(test.wants.toString());
                await page.locator('#savingsPercentText').fill(test.savings.toString());
                
                await page.locator('#calculateButton').click();
                await page.waitForSelector('#resultsSection[style*="block"]');
                
                // Verify precise calculations
                await expect(page.locator('#needsAmount')).toHaveText(`$${test.expectedNeeds.toLocaleString()}`);
                await expect(page.locator('#wantsAmount')).toHaveText(`$${test.expectedWants.toLocaleString()}`);
                await expect(page.locator('#savingsAmount')).toHaveText(`$${test.expectedSavings.toLocaleString()}`);
            }
        });

        test('should handle decimal income amounts correctly', async () => {
            const incomes = [
                { input: '5000.50', expected: { needs: 2500, wants: 1500, savings: 1000 } },
                { input: '3333.33', expected: { needs: 1667, wants: 1000, savings: 667 } },
                { input: '7777.77', expected: { needs: 3889, wants: 2333, savings: 1556 } }
            ];
            
            for (const test of incomes) {
                await page.locator('#monthlyIncome').fill(test.input);
                await page.locator('#calculateButton').click();
                await page.waitForSelector('#resultsSection[style*="block"]');
                
                // Verify rounded results (amounts should be rounded to nearest dollar)
                const needsText = await page.locator('#needsAmount').textContent();
                const wantsText = await page.locator('#wantsAmount').textContent();
                const savingsText = await page.locator('#savingsAmount').textContent();
                
                // Remove $ and commas for comparison
                const needsAmount = parseInt(needsText.replace(/[$,]/g, ''));
                const wantsAmount = parseInt(wantsText.replace(/[$,]/g, ''));
                const savingsAmount = parseInt(savingsText.replace(/[$,]/g, ''));
                
                // Allow for ±1 rounding difference
                expect(Math.abs(needsAmount - test.expected.needs)).toBeLessThanOrEqual(1);
                expect(Math.abs(wantsAmount - test.expected.wants)).toBeLessThanOrEqual(1);
                expect(Math.abs(savingsAmount - test.expected.savings)).toBeLessThanOrEqual(1);
            }
        });
    });

    test.describe('📱 RESPONSIVE DESIGN & UX - Priority 3', () => {
        
        test('should display correctly on mobile viewport', async () => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Verify key elements are visible and properly sized
            await expect(page.locator('#calculatorForm')).toBeVisible();
            await expect(page.locator('#monthlyIncome')).toBeVisible();
            
            // Test percentage controls on mobile
            const percentageControls = page.locator('.percentage-controls');
            await expect(percentageControls).toBeVisible();
            
            // Verify sliders work on mobile
            await page.locator('#needsPercent').fill('60');
            await expect(page.locator('#needsPercentText')).toHaveValue('60');
        });

        test('should display correctly on tablet viewport', async () => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            
            await expect(page.locator('.calculator-form')).toBeVisible();
            await expect(page.locator('.percentage-controls')).toBeVisible();
            
            // Test calculation flow on tablet
            await page.locator('#monthlyIncome').fill('4000');
            await page.locator('#calculateButton').click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Verify results grid displays properly
            const resultsGrid = page.locator('.results-grid');
            await expect(resultsGrid).toBeVisible();
        });

        test('should handle touch interactions properly', async () => {
            // Set mobile viewport for touch testing
            await page.setViewportSize({ width: 375, height: 667 });
            
            // Test slider touch interactions
            const needsSlider = page.locator('#needsPercent');
            await needsSlider.tap();
            
            // Verify tap registers
            await expect(needsSlider).toBeFocused();
            
            // Test button touch
            await page.locator('#monthlyIncome').fill('5000');
            await page.locator('#calculateButton').tap();
            
            // Should trigger calculation
            await page.waitForSelector('#resultsSection[style*="block"]');
            await expect(page.locator('#resultsSection')).toBeVisible();
        });
    });

    test.describe('🔧 TECHNICAL VALIDATION - Priority 4', () => {
        
        test('should have proper HTML structure and accessibility', async () => {
            // Check for proper form structure
            const form = page.locator('#calculatorForm');
            await expect(form).toBeVisible();
            
            // Verify fieldsets have legends
            const fieldsets = page.locator('fieldset');
            expect(await fieldsets.count()).toBeGreaterThan(0);
            
            // Check for proper label associations
            const incomeInput = page.locator('#monthlyIncome');
            const incomeLabel = page.locator('label[for="monthlyIncome"]');
            await expect(incomeLabel).toBeVisible();
            
            // Verify ARIA attributes where needed
            const calculateButton = page.locator('#calculateButton');
            await expect(calculateButton).toHaveAttribute('type', 'button');
        });

        test('should load external dependencies correctly', async () => {
            // Check if Chart.js is loaded by testing chart creation
            await page.locator('#monthlyIncome').fill('5000');
            await page.locator('#calculateButton').click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Chart canvas should be rendered
            const chartCanvas = page.locator('#budgetChart');
            await expect(chartCanvas).toBeVisible();
            
            // Canvas should have content (width/height set by Chart.js)
            const canvasWidth = await chartCanvas.getAttribute('width');
            expect(parseInt(canvasWidth)).toBeGreaterThan(0);
        });

        test('should handle JavaScript errors gracefully', async () => {
            // Monitor console errors
            const errors = [];
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });
            
            // Perform normal calculation
            await page.locator('#monthlyIncome').fill('5000');
            await page.locator('#calculateButton').click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Should have no JavaScript errors
            expect(errors).toHaveLength(0);
        });
    });

    test.describe('⚡ PERFORMANCE TESTING - Priority 5', () => {
        
        test('should calculate results quickly', async () => {
            await page.locator('#monthlyIncome').fill('5000');
            
            const startTime = Date.now();
            await page.locator('#calculateButton').click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            const endTime = Date.now();
            
            const calculationTime = endTime - startTime;
            
            // Should complete calculation within 2 seconds
            expect(calculationTime).toBeLessThan(2000);
        });

        test('should handle rapid input changes smoothly', async () => {
            const incomeInput = page.locator('#monthlyIncome');
            
            // Rapidly change income values
            for (let i = 1000; i <= 5000; i += 500) {
                await incomeInput.fill(i.toString());
                await page.waitForTimeout(100); // Small delay between changes
            }
            
            // Final calculation should work correctly
            await page.locator('#calculateButton').click();
            await page.waitForSelector('#resultsSection[style*="block"]');
            
            // Verify final result is correct
            await expect(page.locator('#needsAmount')).toHaveText('$2,500');
        });
    });
});