const { test, expect } = require('@playwright/test');

test.describe('FreecalcHub Logo Sizing Tests', () => {
  test('should display logo at proper size and capture current appearance', async ({ page }) => {
    // Navigate to the standard calculator page
    await page.goto('https://freecalchub.com/math/basic/standard-calculator/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Find the logo element
    const logo = page.locator('.main-logo');
    
    // Wait for logo to be visible
    await expect(logo).toBeVisible();
    
    // Get logo dimensions
    const logoBox = await logo.boundingBox();
    console.log('Current logo dimensions:', logoBox);
    
    // Take a screenshot of the header area to see current logo size
    await page.screenshot({ 
      path: 'test-results/current-logo-appearance.png',
      clip: { x: 0, y: 0, width: 1200, height: 200 }
    });
    
    // Check if logo meets minimum size requirements
    if (logoBox) {
      console.log(`Logo width: ${logoBox.width}px, height: ${logoBox.height}px`);
      
      // Logo should be at least 100px wide and 30px tall to be clearly visible
      expect(logoBox.width).toBeGreaterThan(100);
      expect(logoBox.height).toBeGreaterThan(30);
      
      // But not too large (max reasonable size for header)
      expect(logoBox.width).toBeLessThan(300);
      expect(logoBox.height).toBeLessThanOrEqual(80);
    }
    
    // Check that the correct logo image is loaded
    const logoSrc = await logo.getAttribute('src');
    console.log('Logo src:', logoSrc);
    expect(logoSrc).toBe('/images/logos/primary-horizontal.png');
    
    // Test responsive behavior
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet size
    await page.waitForTimeout(1000); // Wait for responsive styles
    
    const mobileLogoBox = await logo.boundingBox();
    console.log('Mobile logo dimensions:', mobileLogoBox);
    
    // Take screenshot of mobile logo
    await page.screenshot({ 
      path: 'test-results/mobile-logo-appearance.png',
      clip: { x: 0, y: 0, width: 768, height: 200 }
    });
    
    // Mobile logo should still be reasonably sized
    if (mobileLogoBox) {
      expect(mobileLogoBox.width).toBeGreaterThan(80);
      expect(mobileLogoBox.height).toBeGreaterThan(25);
    }
  });
  
  test('should verify logo visibility compared to navigation elements', async ({ page }) => {
    await page.goto('https://freecalchub.com/math/basic/standard-calculator/');
    await page.waitForLoadState('networkidle');
    
    // Get dimensions of logo and a navigation link for comparison
    const logo = page.locator('.main-logo');
    const navLink = page.locator('.main-nav a').first();
    
    const logoBox = await logo.boundingBox();
    const navBox = await navLink.boundingBox();
    
    console.log('Logo box:', logoBox);
    console.log('Nav link box:', navBox);
    
    // Logo should be at least as tall as navigation links
    if (logoBox && navBox) {
      expect(logoBox.height).toBeGreaterThanOrEqual(navBox.height * 0.8);
    }
    
    // Take a screenshot of the full header for visual comparison
    const header = page.locator('.site-header');
    await header.screenshot({ path: 'test-results/full-header-with-logo.png' });
  });
});