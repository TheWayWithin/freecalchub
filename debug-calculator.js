// Quick debug script to test calculator functionality
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));
  
  await page.goto('http://localhost:8080/finance/retirement/401k-contribution-calculator/');
  
  // Fill form
  await page.fill('#annualSalary', '75000');
  await page.fill('#currentAge', '30');
  await page.fill('#retirementAge', '65');
  await page.fill('#contributionPercentage', '10');
  await page.selectOption('#employerMatch', 'none');
  await page.selectOption('#taxBracket', '22');
  
  // Click calculate
  console.log('Clicking calculate button...');
  await page.click('#calculateButton');
  
  // Wait a bit
  await page.waitForTimeout(3000);
  
  // Check results section
  const resultsVisible = await page.isVisible('#resultsSection');
  console.log('Results section visible:', resultsVisible);
  
  const resultsDisplay = await page.getAttribute('#resultsSection', 'style');
  console.log('Results section style:', resultsDisplay);
  
  // Check for any JavaScript errors
  const annualContribution = await page.textContent('#annualContribution');
  console.log('Annual contribution value:', annualContribution);
  
  await browser.close();
})();