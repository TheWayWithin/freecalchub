const { test, expect } = require('@playwright/test');

test.describe('Sprint S3.2: Diagnostic - Check Calculator Accessibility', () => {
  
  const calculators = [
    {
      name: 'Social Security Benefit Calculator',
      url: '/finance/retirement/social-security-benefit-calculator/'
    },
    {
      name: '401(k) Contribution Calculator', 
      url: '/finance/retirement/401k-contribution-calculator/'
    },
    {
      name: 'Roth vs Traditional IRA Calculator',
      url: '/finance/retirement/roth-traditional-ira-calculator/' 
    },
    {
      name: 'Required Minimum Distribution Calculator',
      url: '/finance/retirement/rmd-calculator/'
    },
    {
      name: 'Long-Term Care Cost Calculator',
      url: '/finance/retirement/long-term-care-cost-calculator/'
    }
  ];

  calculators.forEach(calc => {
    test(`${calc.name} should be accessible`, async ({ page }) => {
      console.log(`Testing: ${calc.url}`);
      
      await page.goto(calc.url);
      
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      if (title.includes('Page Not Found')) {
        console.log(`❌ ${calc.name} returns 404`);
        expect(false).toBe(true); // Force failure to identify issue
      } else {
        console.log(`✅ ${calc.name} loads successfully`);
        expect(title).toContain(calc.name.split(' ')[0]); // Check for partial match
      }
    });
  });
});