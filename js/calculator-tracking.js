// Calculator usage tracking for Google Analytics
document.addEventListener('DOMContentLoaded', function() {
  // Find all calculator forms on the page
  const calculatorForms = document.querySelectorAll('form[data-calculator]');
  
  // Add event listeners to each calculator form
  calculatorForms.forEach(form => {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get calculator name from data attribute or page title
      const calculatorName = form.dataset.calculator || document.title.split('|')[0].trim();
      
      // Track the event in Google Analytics
      if (typeof gtag === 'function') {
        gtag('event', 'calculator_use', {
          'calculator_name': calculatorName,
          'event_category': 'engagement',
          'event_label': 'Calculator Used'
        });
      }
      
      // Continue with normal form processing
      // This will be handled by the calculator's specific JavaScript
    });
  });
  
  // Track calculator result views
  const resultElements = document.querySelectorAll('[data-result-view]');
  resultElements.forEach(element => {
    // Use Intersection Observer to detect when results become visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const calculatorName = element.dataset.resultView || document.title.split('|')[0].trim();
          
          if (typeof gtag === 'function') {
            gtag('event', 'result_view', {
              'calculator_name': calculatorName,
              'event_category': 'engagement',
              'event_label': 'Results Viewed'
            });
          }
          
          // Disconnect observer after tracking once
          observer.disconnect();
        }
      });
    });
    
    observer.observe(element);
  });
});
