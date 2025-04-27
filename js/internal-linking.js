// Internal linking enhancement for CalcHub
document.addEventListener('DOMContentLoaded', function() {
  // Find all calculator pages content sections
  const contentSections = document.querySelectorAll('.detailed-explanation, .calculator-explanation');
  
  if (contentSections.length > 0) {
    // Process each content section to enhance internal linking
    contentSections.forEach(section => {
      enhanceInternalLinks(section);
    });
  }
  
  // Find "Related Calculators" sections and ensure they have proper links
  const relatedSections = document.querySelectorAll('.related-calculators');
  if (relatedSections.length > 0) {
    // Make sure related calculator sections have proper heading structure
    relatedSections.forEach(section => {
      if (!section.querySelector('h2, h3')) {
        const heading = document.createElement('h2');
        heading.textContent = 'Related Calculators';
        section.prepend(heading);
      }
    });
  }
  
  // Function to enhance internal linking in content
  function enhanceInternalLinks(element) {
    // List of keywords to link to specific calculators
    // Format: [keyword, URL, title]
    const keywordLinks = [
      ['mortgage calculator', '/finance/mortgage/mortgage-calculator/', 'Mortgage Calculator'],
      ['compound interest', '/finance/investment/compound-interest/', 'Compound Interest Calculator'],
      ['BMI calculator', '/health/bmi/bmi-calculator/', 'BMI Calculator'],
      ['percentage calculator', '/math/percentages/percentage-calculator/', 'Percentage Calculator'],
      ['currency converter', '/conversions/currency/currency-converter/', 'Currency Converter'],
      ['age calculator', '/date-time/age/age-calculator/', 'Age Calculator'],
      ['ROI calculator', '/business/roi/roi-calculator/', 'ROI Calculator'],
      ['loan calculator', '/finance/loan/loan-calculator/', 'Loan Calculator']
    ];
    
    // Get the HTML content
    let content = element.innerHTML;
    
    // Track which keywords we've already linked to avoid duplicate links
    const linkedKeywords = [];
    
    // Process each keyword
    keywordLinks.forEach(([keyword, url, title]) => {
      // Skip if we've already linked this keyword in this content block
      if (linkedKeywords.includes(keyword)) return;
      
      // Create a regex that matches the keyword but not if it's already in a link
      const regex = new RegExp(`(?<!<a[^>]*>)(?<!<a[^>]*>[^<]*)\\b(${keyword})\\b(?![^<]*<\\/a>)`, 'i');
      
      // Check if the keyword exists and is not already linked
      if (regex.test(content)) {
        // Replace only the first occurrence
        content = content.replace(regex, `<a href="${url}" title="${title}">$1</a>`);
        linkedKeywords.push(keyword);
      }
    });
    
    // Update the content
    element.innerHTML = content;
  }
});
