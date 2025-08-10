const { test, expect } = require('@playwright/test');

// Financial accuracy validation tests for Sprint 2 Investment Calculators
test.describe('Sprint 2 Investment Calculators - Financial Accuracy Validation', () => {
  
  // === INVESTMENT GOAL CALCULATOR FINANCIAL ACCURACY ===
  test.describe('Investment Goal Calculator - Mathematical Accuracy', () => {
    
    test('Future value calculation with compound interest', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Test case: $100,000 goal, 10 years, 7% return, $10,000 initial
      await page.fill('#targetAmount', '100000');
      await page.fill('#timeHorizon', '10');
      await page.fill('#expectedReturn', '7');
      await page.fill('#initialInvestment', '10000');
      await page.selectOption('#contributionFrequency', '12'); // Monthly
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Get calculated monthly payment
      const contributionText = await page.textContent('#requiredContribution');
      const monthlyPayment = parseFloat(contributionText.replace(/[$,]/g, ''));
      
      // Manual calculation verification:
      // FV = Initial * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
      // Where r = annual rate / 12, n = years * 12
      const r = 0.07 / 12; // Monthly rate
      const n = 10 * 12; // Number of payments
      const initialFV = 10000 * Math.pow(1 + 0.07, 10); // Initial grows at annual rate
      const neededFromContributions = 100000 - initialFV;
      const annuityFactor = (Math.pow(1 + r, n) - 1) / r;
      const calculatedPayment = neededFromContributions / annuityFactor;
      
      console.log(`Calculated monthly payment: $${monthlyPayment.toFixed(2)}`);
      console.log(`Expected monthly payment: $${calculatedPayment.toFixed(2)}`);
      
      // Should be within 1% of calculated value
      const percentError = Math.abs(monthlyPayment - calculatedPayment) / calculatedPayment;
      expect(percentError).toBeLessThan(0.01);
    });

    test('Zero initial investment scenario', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Simple case: $24,000 goal, 2 years, 0% return, no initial investment
      await page.fill('#targetAmount', '24000');
      await page.fill('#timeHorizon', '2');
      await page.fill('#expectedReturn', '0');
      await page.fill('#initialInvestment', '0');
      await page.selectOption('#contributionFrequency', '12');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const contributionText = await page.textContent('#requiredContribution');
      const monthlyPayment = parseFloat(contributionText.replace(/[$,]/g, ''));
      
      // With 0% return, monthly payment should be $24,000 / 24 months = $1,000
      expect(monthlyPayment).toBeCloseTo(1000, 1);
    });

    test('High return rate edge case', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Test with high return rate
      await page.fill('#targetAmount', '100000');
      await page.fill('#timeHorizon', '20');
      await page.fill('#expectedReturn', '15'); // 15% annual return
      await page.fill('#initialInvestment', '5000');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const contributionText = await page.textContent('#requiredContribution');
      const monthlyPayment = parseFloat(contributionText.replace(/[$,]/g, ''));
      
      // With high returns and long time horizon, payment should be relatively small
      expect(monthlyPayment).toBeLessThan(200); // Should be well under $200/month
      expect(monthlyPayment).toBeGreaterThan(0);
    });

    test('Inflation adjustment accuracy', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Test case with inflation
      await page.fill('#targetAmount', '100000');
      await page.fill('#timeHorizon', '10');
      await page.fill('#expectedReturn', '7');
      await page.fill('#initialInvestment', '0');
      await page.fill('#inflationRate', '3'); // 3% inflation
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Check if inflation-adjusted results are shown
      const inflationContainer = page.locator('#inflationAdjustedContainer');
      if (await inflationContainer.isVisible()) {
        const adjustedTargetText = await page.textContent('#inflationAdjustedTarget');
        const adjustedTarget = parseFloat(adjustedTargetText.replace(/[$,]/g, ''));
        
        // Inflation-adjusted target should be $100,000 * (1.03)^10 ≈ $134,392
        const expectedAdjusted = 100000 * Math.pow(1.03, 10);
        expect(adjustedTarget).toBeCloseTo(expectedAdjusted, -2); // Within $100
      }
    });
  });

  // === PORTFOLIO RETURN CALCULATOR FINANCIAL ACCURACY ===
  test.describe('Portfolio Return Calculator - Mathematical Accuracy', () => {
    
    test('Weighted average return calculation', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test simple 50/50 portfolio
      await page.fill('#portfolioValue', '100000');
      await page.fill('#stocks_allocation', '50');
      await page.fill('#bonds_allocation', '50');
      await page.fill('#international_allocation', '0');
      
      // Ensure expected returns are set
      await expect(page.locator('#stocks_return')).toHaveValue('8');
      await expect(page.locator('#bonds_return')).toHaveValue('4');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Get calculated expected return
      const expectedReturnText = await page.textContent('#expectedReturn');
      const expectedReturn = parseFloat(expectedReturnText.replace(/[%]/g, ''));
      
      // Manual calculation: 50% * 8% + 50% * 4% = 6%
      const calculatedReturn = 0.5 * 8 + 0.5 * 4;
      
      expect(expectedReturn).toBeCloseTo(calculatedReturn, 1);
    });

    test('Portfolio volatility calculation', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test portfolio with known volatilities
      await page.fill('#portfolioValue', '100000');
      await page.fill('#stocks_allocation', '100'); // 100% stocks
      await page.fill('#bonds_allocation', '0');
      await page.fill('#international_allocation', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const portfolioRiskText = await page.textContent('#portfolioRisk');
      const portfolioRisk = parseFloat(portfolioRiskText.replace(/[%]/g, ''));
      
      // 100% stocks should have risk equal to stock volatility (18% default)
      expect(portfolioRisk).toBeCloseTo(18, 1);
      
      // Test diversified portfolio
      await page.fill('#stocks_allocation', '60');
      await page.fill('#bonds_allocation', '40');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const diversifiedRiskText = await page.textContent('#portfolioRisk');
      const diversifiedRisk = parseFloat(diversifiedRiskText.replace(/[%]/g, ''));
      
      // Diversified portfolio should have lower risk than 100% stocks
      expect(diversifiedRisk).toBeLessThan(portfolioRisk);
    });

    test('Expected annual gain calculation', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test with known values
      await page.fill('#portfolioValue', '200000'); // $200K portfolio
      await page.fill('#stocks_allocation', '75'); // 75% stocks at 8%
      await page.fill('#bonds_allocation', '25'); // 25% bonds at 4%
      await page.fill('#international_allocation', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const expectedGainText = await page.textContent('#expectedGain');
      const expectedGain = parseFloat(expectedGainText.replace(/[$,]/g, ''));
      
      // Manual calculation: $200,000 * (75% * 8% + 25% * 4%) = $200,000 * 7% = $14,000
      const calculatedGain = 200000 * (0.75 * 0.08 + 0.25 * 0.04);
      
      expect(expectedGain).toBeCloseTo(calculatedGain, -1); // Within $10
    });

    test('Asset allocation validation', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test allocation tracking
      await expect(page.locator('#totalAllocation')).toHaveText('0%');
      
      await page.fill('#stocks_allocation', '40');
      await page.waitForTimeout(100);
      await expect(page.locator('#totalAllocation')).toHaveText('40%');
      
      await page.fill('#bonds_allocation', '35');
      await page.waitForTimeout(100);
      await expect(page.locator('#totalAllocation')).toHaveText('75%');
      
      await page.fill('#international_allocation', '25');
      await page.waitForTimeout(100);
      await expect(page.locator('#totalAllocation')).toHaveText('100%');
      
      // Test over-allocation
      await page.fill('#international_allocation', '35'); // Total would be 110%
      await page.waitForTimeout(100);
      await expect(page.locator('#totalAllocation')).toHaveText('110%');
    });

    test('Sharpe ratio calculation', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test known portfolio for Sharpe ratio
      await page.fill('#portfolioValue', '100000');
      await page.fill('#stocks_allocation', '60');
      await page.fill('#bonds_allocation', '40');
      await page.fill('#international_allocation', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const sharpeRatioText = await page.textContent('#sharpeRatio');
      const sharpeRatio = parseFloat(sharpeRatioText);
      
      // Sharpe ratio should be positive and reasonable (typically 0.1 to 2.0)
      expect(sharpeRatio).toBeGreaterThan(0.1);
      expect(sharpeRatio).toBeLessThan(3.0);
      
      // Higher return portfolios should generally have higher Sharpe ratios
      // (though this depends on risk-free rate assumptions)
      expect(sharpeRatio).toBeGreaterThan(0);
    });
  });

  // === DRIP CALCULATOR FINANCIAL ACCURACY ===
  test.describe('DRIP Calculator - Mathematical Accuracy', () => {
    
    test('Basic dividend reinvestment calculation', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Simple test case: $10,000 initial, $50 share price, $2.50 dividend, 1 year
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2.50');
      await page.fill('#timeHorizon', '1');
      await page.fill('#dividendGrowthRate', '0'); // No growth
      await page.fill('#stockPriceGrowth', '0'); // No price growth
      await page.selectOption('#dividendFrequency', '1'); // Annual
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const totalSharesText = await page.textContent('#dripTotalShares');
      const totalShares = parseFloat(totalSharesText.replace(/[,]/g, ''));
      
      // Manual calculation:
      // Initial shares: $10,000 / $50 = 200 shares
      // Annual dividend: 200 * $2.50 = $500
      // Additional shares from DRIP: $500 / $50 = 10 shares
      // Total shares: 200 + 10 = 210 shares
      
      expect(totalShares).toBeCloseTo(210, 1);
    });

    test('Compound dividend growth calculation', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test with dividend growth: $10,000 initial, 5% dividend growth
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '100');
      await page.fill('#annualDividend', '4'); // 4% yield
      await page.fill('#timeHorizon', '3'); // 3 years
      await page.fill('#dividendGrowthRate', '5'); // 5% annual growth
      await page.fill('#stockPriceGrowth', '0'); // No price growth for simplicity
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const annualDividendText = await page.textContent('#dripAnnualDividend');
      const finalAnnualDividend = parseFloat(annualDividendText.replace(/[$,]/g, ''));
      
      // Final dividend per original share should be $4 * (1.05)^3 = $4.63
      // But with reinvestment, total dividend income will be higher
      expect(finalAnnualDividend).toBeGreaterThan(463); // More than base case due to reinvestment
    });

    test('DRIP vs Cash dividend comparison', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test comparison scenario
      await page.fill('#initialInvestment', '50000');
      await page.fill('#sharePrice', '100');
      await page.fill('#annualDividend', '5'); // $5 dividend
      await page.fill('#timeHorizon', '10');
      await page.fill('#dividendGrowthRate', '3');
      await page.fill('#stockPriceGrowth', '6');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      // Get DRIP total value
      const dripValueText = await page.textContent('#dripTotalValue');
      const dripValue = parseFloat(dripValueText.replace(/[$,]/g, ''));
      
      // Switch to cash scenario
      await page.click('.tab-button[data-scenario="cash"]');
      const cashValueText = await page.textContent('#cashTotalValue');
      const cashValue = parseFloat(cashValueText.replace(/[$,]/g, ''));
      
      // DRIP should have higher total value due to compounding
      expect(dripValue).toBeGreaterThan(cashValue);
      
      // Get comparison metrics
      await page.click('.tab-button[data-scenario="comparison"]');
      const advantageText = await page.textContent('#comparisonAdvantage');
      
      // Should show DRIP advantage
      expect(advantageText).toMatch(/\$|%/); // Should contain dollar amount or percentage
    });

    test('Fractional share reinvestment', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test case that results in fractional shares
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '73.33'); // Price that creates fractional shares
      await page.fill('#annualDividend', '2.44');
      await page.fill('#timeHorizon', '5');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const totalSharesText = await page.textContent('#dripTotalShares');
      const totalShares = parseFloat(totalSharesText.replace(/[,]/g, ''));
      
      // Should handle fractional shares (likely a decimal number)
      expect(totalShares).toBeGreaterThan(136); // Initial shares: 10000/73.33 ≈ 136.36
      
      // Total value should be consistent with share count and price
      const totalValueText = await page.textContent('#dripTotalValue');
      const totalValue = parseFloat(totalValueText.replace(/[$,]/g, ''));
      
      // Rough validation: total value should be reasonable
      expect(totalValue).toBeGreaterThan(10000); // Should grow over 5 years
    });

    test('Quarterly vs Annual dividend frequency', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test quarterly dividends
      await page.fill('#initialInvestment', '20000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2'); // $2 annual dividend
      await page.fill('#timeHorizon', '5');
      await page.selectOption('#dividendFrequency', '4'); // Quarterly
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const quarterlyValueText = await page.textContent('#dripTotalValue');
      const quarterlyValue = parseFloat(quarterlyValueText.replace(/[$,]/g, ''));
      
      // Reset and test annual
      await page.click('#resetButton');
      await page.fill('#initialInvestment', '20000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2');
      await page.fill('#timeHorizon', '5');
      await page.selectOption('#dividendFrequency', '1'); // Annual
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const annualValueText = await page.textContent('#dripTotalValue');
      const annualValue = parseFloat(annualValueText.replace(/[$,]/g, ''));
      
      // Quarterly should be slightly higher due to more frequent compounding
      expect(quarterlyValue).toBeGreaterThanOrEqual(annualValue);
    });

    test('Additional monthly contributions', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test without additional contributions
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2.50');
      await page.fill('#timeHorizon', '10');
      await page.fill('#additionalContribution', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const baseValueText = await page.textContent('#dripTotalValue');
      const baseValue = parseFloat(baseValueText.replace(/[$,]/g, ''));
      
      // Test with additional contributions
      await page.click('#resetButton');
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2.50');
      await page.fill('#timeHorizon', '10');
      await page.fill('#additionalContribution', '500'); // $500/month
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const contributionValueText = await page.textContent('#dripTotalValue');
      const contributionValue = parseFloat(contributionValueText.replace(/[$,]/g, ''));
      
      // With additional contributions should be significantly higher
      // $500/month * 12 months * 10 years = $60,000 additional
      expect(contributionValue).toBeGreaterThan(baseValue + 60000);
    });
  });

  // === CROSS-CALCULATOR CONSISTENCY TESTS ===
  test.describe('Cross-Calculator Consistency', () => {
    
    test('Compound interest consistency across calculators', async ({ page }) => {
      // Test if compound interest calculations are consistent between calculators
      
      // Investment Goal Calculator: What monthly payment is needed for $100K in 10 years at 7%?
      await page.goto('/finance/investment/investment-goal-calculator/');
      await page.fill('#targetAmount', '100000');
      await page.fill('#timeHorizon', '10');
      await page.fill('#expectedReturn', '7');
      await page.fill('#initialInvestment', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const monthlyPaymentText = await page.textContent('#requiredContribution');
      const monthlyPayment = parseFloat(monthlyPaymentText.replace(/[$,]/g, ''));
      
      console.log(`Monthly payment needed: $${monthlyPayment.toFixed(2)}`);
      
      // The result should be mathematically consistent with compound interest formula
      // PMT = FV * r / ((1 + r)^n - 1) where r = 0.07/12, n = 120
      const r = 0.07 / 12;
      const n = 120;
      const calculatedPayment = 100000 * r / (Math.pow(1 + r, n) - 1);
      
      expect(monthlyPayment).toBeCloseTo(calculatedPayment, 1);
    });

    test('Risk-return relationship consistency', async ({ page }) => {
      // Test that higher expected returns correlate with higher risk in portfolio calculator
      
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Conservative portfolio
      await page.fill('#portfolioValue', '100000');
      await page.fill('#stocks_allocation', '20');
      await page.fill('#bonds_allocation', '80');
      await page.fill('#international_allocation', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const conservativeReturnText = await page.textContent('#expectedReturn');
      const conservativeReturn = parseFloat(conservativeReturnText.replace(/[%]/g, ''));
      const conservativeRiskText = await page.textContent('#portfolioRisk');
      const conservativeRisk = parseFloat(conservativeRiskText.replace(/[%]/g, ''));
      
      // Aggressive portfolio
      await page.fill('#stocks_allocation', '90');
      await page.fill('#bonds_allocation', '10');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const aggressiveReturnText = await page.textContent('#expectedReturn');
      const aggressiveReturn = parseFloat(aggressiveReturnText.replace(/[%]/g, ''));
      const aggressiveRiskText = await page.textContent('#portfolioRisk');
      const aggressiveRisk = parseFloat(aggressiveRiskText.replace(/[%]/g, ''));
      
      // Higher stock allocation should have higher return and higher risk
      expect(aggressiveReturn).toBeGreaterThan(conservativeReturn);
      expect(aggressiveRisk).toBeGreaterThan(conservativeRisk);
      
      console.log(`Conservative: ${conservativeReturn}% return, ${conservativeRisk}% risk`);
      console.log(`Aggressive: ${aggressiveReturn}% return, ${aggressiveRisk}% risk`);
    });
  });

  // === EDGE CASE VALIDATION ===
  test.describe('Financial Edge Cases', () => {
    
    test('Zero and negative rate handling', async ({ page }) => {
      await page.goto('/finance/investment/investment-goal-calculator/');
      
      // Test with 0% return
      await page.fill('#targetAmount', '12000');
      await page.fill('#timeHorizon', '1');
      await page.fill('#expectedReturn', '0');
      await page.fill('#initialInvestment', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const monthlyPaymentText = await page.textContent('#requiredContribution');
      const monthlyPayment = parseFloat(monthlyPaymentText.replace(/[$,]/g, ''));
      
      // With 0% return, monthly payment should be $12,000 / 12 = $1,000
      expect(monthlyPayment).toBeCloseTo(1000, 1);
    });

    test('Very long time horizons', async ({ page }) => {
      await page.goto('/finance/investment/drip-calculator/');
      
      // Test 50-year investment
      await page.fill('#initialInvestment', '10000');
      await page.fill('#sharePrice', '50');
      await page.fill('#annualDividend', '2.50');
      await page.fill('#timeHorizon', '50');
      await page.fill('#dividendGrowthRate', '3');
      await page.fill('#stockPriceGrowth', '7');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const totalValueText = await page.textContent('#dripTotalValue');
      const totalValue = parseFloat(totalValueText.replace(/[$,]/g, ''));
      
      // 50 years of compound growth should result in substantial value
      expect(totalValue).toBeGreaterThan(100000); // Should be well over $100K
      
      // Value should be formatted properly for large numbers
      expect(totalValueText).toMatch(/million|,000,000/i);
    });

    test('Extreme portfolio allocations', async ({ page }) => {
      await page.goto('/finance/investment/portfolio-return-calculator/');
      
      // Test 100% allocation to single asset
      await page.fill('#portfolioValue', '100000');
      await page.fill('#stocks_allocation', '100');
      await page.fill('#bonds_allocation', '0');
      await page.fill('#international_allocation', '0');
      
      await page.click('#calculateButton');
      await expect(page.locator('#resultsSection')).toBeVisible();
      
      const expectedReturnText = await page.textContent('#expectedReturn');
      const portfolioRiskText = await page.textContent('#portfolioRisk');
      
      const expectedReturn = parseFloat(expectedReturnText.replace(/[%]/g, ''));
      const portfolioRisk = parseFloat(portfolioRiskText.replace(/[%]/g, ''));
      
      // 100% stocks should equal stock return and risk
      expect(expectedReturn).toBeCloseTo(8, 0.1); // Default stock return
      expect(portfolioRisk).toBeCloseTo(18, 1); // Default stock volatility
    });
  });
});