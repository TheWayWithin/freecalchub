/**
 * Test utilities for FreecalcHub calculator testing
 * Provides reusable helper functions for consistent test behavior
 */

/**
 * Dismisses the CookieYes consent banner to prevent test interference
 * @param {Page} page - Playwright page object
 * @param {Object} options - Configuration options
 * @param {string} options.action - 'accept', 'reject', or 'dismiss' (default: 'accept')
 * @param {number} options.timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<boolean>} - Returns true if banner was found and dismissed, false if not present
 */
async function dismissCookieBanner(page, options = {}) {
  const { action = 'accept', timeout = 5000 } = options;
  
  try {
    // Wait briefly for the cookie banner to appear
    await page.waitForTimeout(1000);
    
    // Check if the CookieYes banner is present
    const cookieBanner = page.locator('[data-cky-tag="notice"]');
    const bannerVisible = await cookieBanner.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!bannerVisible) {
      console.log('Cookie banner not present, continuing with test');
      return false;
    }
    
    console.log(`Cookie banner detected, attempting to ${action}...`);
    
    let buttonSelector;
    switch (action) {
      case 'accept':
        // Try multiple possible selectors for accept button
        buttonSelector = '[data-cky-tag="accept-button"], .cky-btn-accept, button:has-text("Accept"), button:has-text("Accept All")';
        break;
      case 'reject':
        buttonSelector = '[data-cky-tag="reject-button"], .cky-btn-reject, button:has-text("Reject"), button:has-text("Reject All")';
        break;
      case 'dismiss':
        buttonSelector = '[data-cky-tag="close-button"], .cky-btn-close, .cky-close, button:has-text("Close")';
        break;
      default:
        throw new Error(`Invalid action: ${action}. Use 'accept', 'reject', or 'dismiss'`);
    }
    
    // Wait for the button and click it
    const button = page.locator(buttonSelector).first();
    await button.waitFor({ state: 'visible', timeout });
    await button.click();
    
    // Wait for banner to disappear
    await cookieBanner.waitFor({ state: 'hidden', timeout });
    
    console.log(`Cookie banner ${action}ed successfully`);
    return true;
    
  } catch (error) {
    console.log(`Cookie banner handling failed: ${error.message}`);
    // Don't fail the test if cookie dismissal fails - banner might not be present
    return false;
  }
}

/**
 * Navigates to a page and handles cookie consent automatically
 * @param {Page} page - Playwright page object
 * @param {string} url - URL to navigate to
 * @param {Object} options - Options for navigation and cookie handling
 * @returns {Promise<void>}
 */
async function navigateWithCookieHandling(page, url, options = {}) {
  const { cookieAction = 'accept', waitForLoad = 'networkidle', timeout = 30000 } = options;
  
  try {
    await page.goto(url, { timeout, waitUntil: 'domcontentloaded' });
    await page.waitForLoadState(waitForLoad, { timeout });
  } catch (error) {
    console.log(`Navigation timeout for ${url}, trying with domcontentloaded only`);
    await page.goto(url, { timeout, waitUntil: 'domcontentloaded' });
  }
  
  // Dismiss cookie banner if present
  await dismissCookieBanner(page, { action: cookieAction });
  
  // Additional wait to ensure page is fully interactive
  await page.waitForTimeout(500);
}

/**
 * Fills form inputs with proper error handling and cookie banner management
 * @param {Page} page - Playwright page object
 * @param {Object} inputs - Object mapping field selectors to values
 * @returns {Promise<void>}
 */
async function fillFormInputs(page, inputs) {
  for (const [selector, value] of Object.entries(inputs)) {
    try {
      const input = page.locator(selector);
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await input.clear();
      await input.fill(value.toString());
      console.log(`Filled ${selector} with value: ${value}`);
    } catch (error) {
      console.error(`Failed to fill ${selector} with ${value}: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Clicks a button with retry logic and cookie banner handling
 * @param {Page} page - Playwright page object
 * @param {string} buttonSelector - CSS selector for the button
 * @param {Object} options - Options for clicking
 * @returns {Promise<void>}
 */
async function clickButtonWithRetry(page, buttonSelector, options = {}) {
  const { timeout = 10000, retries = 3 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Check for cookie banner before clicking
      await dismissCookieBanner(page, { timeout: 2000 });
      
      const button = page.locator(buttonSelector);
      await button.waitFor({ state: 'visible', timeout: 5000 });
      
      // Ensure button is not obscured
      await button.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      
      await button.click({ timeout });
      console.log(`Successfully clicked button: ${buttonSelector}`);
      return;
      
    } catch (error) {
      console.log(`Click attempt ${attempt} failed for ${buttonSelector}: ${error.message}`);
      
      if (attempt === retries) {
        throw new Error(`Failed to click ${buttonSelector} after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Waits for results section to appear with cookie banner handling
 * @param {Page} page - Playwright page object
 * @param {string} resultsSelector - CSS selector for results section
 * @param {Object} options - Options for waiting
 * @returns {Promise<void>}
 */
async function waitForResults(page, resultsSelector = '#resultsSection', options = {}) {
  const { timeout = 10000 } = options;
  
  try {
    // Dismiss any lingering cookie banners
    await dismissCookieBanner(page, { timeout: 2000 });
    
    const results = page.locator(resultsSelector);
    await results.waitFor({ state: 'visible', timeout });
    
    console.log(`Results section ${resultsSelector} is now visible`);
    
  } catch (error) {
    console.error(`Results section ${resultsSelector} failed to appear: ${error.message}`);
    throw error;
  }
}

module.exports = {
  dismissCookieBanner,
  navigateWithCookieHandling,
  fillFormInputs,
  clickButtonWithRetry,
  waitForResults
};