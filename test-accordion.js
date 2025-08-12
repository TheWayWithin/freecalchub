// Quick test for FAQ accordion functionality
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:8080/finance/retirement/');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Find first accordion button
  const firstAccordion = await page.locator('.faq-item h3 button.accordion').first();
  
  // Check initial state
  const initialState = await firstAccordion.getAttribute('aria-expanded');
  console.log('Initial accordion state:', initialState);
  
  // Click accordion
  await firstAccordion.click();
  
  // Wait for animation
  await page.waitForTimeout(1000);
  
  // Check new state
  const newState = await firstAccordion.getAttribute('aria-expanded');
  console.log('After click state:', newState);
  
  // Check if panel is visible
  const panelVisible = await page.isVisible('.faq-item .panel');
  console.log('Panel visible:', panelVisible);
  
  await browser.close();
})();