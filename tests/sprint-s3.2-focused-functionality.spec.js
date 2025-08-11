const { test, expect } = require('@playwright/test');

test.describe('Sprint S3.2: Focused Functionality Analysis', () => {
  
  const calculators = [
    {
      name: 'Social Security Benefit Calculator',
      url: '/finance/retirement/social-security-benefit-calculator/',
      testInputs: [
        { selector: '#currentAge', value: '35' },
        { selector: '#averageAnnualEarnings', value: '75000' },
        { selector: '#claimingAge', value: '67' }
      ]
    },
    {
      name: '401(k) Contribution Calculator', 
      url: '/finance/retirement/401k-contribution-calculator/',
      testInputs: [
        { selector: '#currentAge', value: '30' },
        { selector: '#currentBalance', value: '25000' },
        { selector: '#contributionPercentage', value: '10' },
        { selector: '#annualSalary', value: '60000' }
      ]
    },
    {
      name: 'Roth vs Traditional IRA Calculator',
      url: '/finance/retirement/roth-traditional-ira-calculator/',
      testInputs: [
        { selector: '#currentAge', value: '28' },
        { selector: '#annualIncome', value: '65000' },
        { selector: '#currentTaxRate', value: '22' }
      ]
    },
    {
      name: 'Required Minimum Distribution Calculator',
      url: '/finance/retirement/rmd-calculator/',
      testInputs: [
        { selector: '#currentAge', value: '72' },
        { selector: '#accountBalance0', value: '500000' }
      ]
    },
    {
      name: 'Long-Term Care Cost Calculator',
      url: '/finance/retirement/long-term-care-cost-calculator/',
      testInputs: [
        { selector: '#currentAge', value: '55' },
        { selector: '#careDuration', value: '3' },
        { selector: '#state', value: 'national' }
      ]
    }
  ];

  calculators.forEach(calc => {
    test(`${calc.name} - Core functionality analysis`, async ({ page }) => {
      await page.goto(calc.url);
      
      console.log(`\n=== Testing ${calc.name} ===`);
      
      // 1. Verify page loads correctly
      const title = await page.title();
      console.log(`✓ Page title: ${title}`);
      expect(title).toContain(calc.name.split(' ')[0]);
      
      // 2. Find form and inputs
      const form = await page.locator('form, .calculator-form, .calc-form').first();
      const formExists = await form.isVisible();
      console.log(`✓ Form exists: ${formExists}`);
      expect(formExists).toBe(true);
      
      // 3. Test input fields
      let inputsFound = 0;
      for (const input of calc.testInputs) {
        const field = await page.locator(input.selector).first();
        const fieldExists = await field.count() > 0;
        
        if (fieldExists) {
          inputsFound++;
          const fieldType = await field.getAttribute('type') || await field.evaluate(el => el.tagName);
          console.log(`✓ Found input: ${input.selector} (${fieldType})`);
          
          // Try to fill the field
          try {
            if (fieldType === 'SELECT' || await field.getAttribute('type') === 'select-one') {
              const options = await field.locator('option').count();
              if (options > 1) {
                await field.selectOption({ index: 1 }); // Select second option
              }
            } else {
              await field.fill(input.value);
            }
            console.log(`  ✓ Successfully filled with: ${input.value}`);
          } catch (e) {
            console.log(`  ✗ Failed to fill: ${e.message}`);
          }
        } else {
          console.log(`✗ Input not found: ${input.selector}`);
        }
      }
      
      console.log(`Found ${inputsFound} of ${calc.testInputs.length} expected inputs`);
      
      // 4. Test calculate button
      const calculateBtns = await page.locator(
        'button:has-text("Calculate"), button:has-text("Compare"), button[type="submit"], .calculate-btn, #calculate, #calculateButton'
      );
      const calcBtnCount = await calculateBtns.count();
      console.log(`Found ${calcBtnCount} calculate buttons`);
      
      if (calcBtnCount > 0) {
        const calcBtn = calculateBtns.first();
        const isEnabled = await calcBtn.isEnabled();
        console.log(`✓ Calculate button enabled: ${isEnabled}`);
        
        if (isEnabled) {
          // Trigger calculation  
          await calcBtn.click();
          await page.waitForTimeout(4000); // Wait longer for calculation
          
          // Check for results
          const resultsSelectors = [
            '#resultsSection', '.results-section', '.results', '#results', 
            '.calculation-results', '.result-section', '.output', '#output', 
            '.calculator-results'
          ];
          
          let resultsFound = false;
          for (const selector of resultsSelectors) {
            const results = await page.locator(selector);
            if (await results.count() > 0 && await results.first().isVisible()) {
              console.log(`✓ Results found: ${selector}`);
              resultsFound = true;
              break;
            }
          }
          
          if (!resultsFound) {
            console.log(`✗ No results section found after calculation`);
          }
        }
      }
      
      // 5. Check for Chart.js integration
      const chartExists = await page.evaluate(() => {
        return typeof window.Chart !== 'undefined';
      });
      console.log(`Chart.js loaded: ${chartExists}`);
      
      if (chartExists) {
        const canvas = await page.locator('canvas').count();
        console.log(`Canvas elements found: ${canvas}`);
      }
      
      // 6. Check FAQ section
      const faqExists = await page.locator('.faq-section, #faq, .faq').count() > 0;
      console.log(`FAQ section exists: ${faqExists}`);
      
      // 7. Mobile responsiveness check
      await page.setViewportSize({ width: 375, height: 667 });
      const formStillVisible = await form.isVisible();
      console.log(`Mobile responsive - Form visible: ${formStillVisible}`);
      
      console.log(`=== ${calc.name} Analysis Complete ===\n`);
    });
  });

  test('Retirement category page integration test', async ({ page }) => {
    await page.goto('/finance/retirement/');
    
    console.log('\n=== Testing Retirement Category Page ===');
    
    // Check title
    const title = await page.title();
    console.log(`✓ Category page title: ${title}`);
    
    // Check calculator cards
    const calcCards = await page.locator('.calculator-card');
    const cardCount = await calcCards.count();
    console.log(`Calculator cards found: ${cardCount}`);
    
    // Verify no "Coming Soon" tags
    const comingSoonTags = await page.locator('.coming-soon-tag, .coming-soon').count();
    console.log(`Coming Soon tags found: ${comingSoonTags}`);
    
    // Test each calculator link
    for (const calc of calculators) {
      const link = await page.locator(`a[href="${calc.url}"]`);
      const linkExists = await link.count() > 0;
      console.log(`${calc.name} link exists: ${linkExists}`);
      
      if (linkExists) {
        // Test clicking the link
        await link.click();
        const newTitle = await page.title();
        const correctPage = newTitle.includes(calc.name.split(' ')[0]);
        console.log(`  ✓ Link works, correct page: ${correctPage}`);
        await page.goBack();
      }
    }
    
    // Test FAQ accordion
    const faqButtons = await page.locator('.accordion');
    const faqCount = await faqButtons.count();
    console.log(`FAQ accordion items: ${faqCount}`);
    
    if (faqCount > 0) {
      const firstFAQ = faqButtons.first();
      const initialState = await firstFAQ.getAttribute('aria-expanded');
      await firstFAQ.click();
      await page.waitForTimeout(1000); // Wait for animation
      const expandedState = await firstFAQ.getAttribute('aria-expanded');
      const accordionWorks = initialState === 'false' && expandedState === 'true';
      console.log(`FAQ accordion works: ${accordionWorks}`);
    }
    
    console.log('=== Category Page Analysis Complete ===\n');
  });
});