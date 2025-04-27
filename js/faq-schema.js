// FAQ Schema Generator for CalcHub
document.addEventListener('DOMContentLoaded', function() {
  // Find all FAQ sections on the page
  const faqSections = document.querySelectorAll('.faq-section');
  
  if (faqSections.length > 0) {
    // Create schema object
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": []
    };
    
    // Process each FAQ section
    faqSections.forEach(section => {
      // Find all questions and answers
      const questions = section.querySelectorAll('.faq-question');
      const answers = section.querySelectorAll('.faq-answer');
      
      // Make sure we have matching questions and answers
      if (questions.length === answers.length) {
        for (let i = 0; i < questions.length; i++) {
          // Add each Q&A pair to the schema
          faqSchema.mainEntity.push({
            "@type": "Question",
            "name": questions[i].textContent.trim(),
            "acceptedAnswer": {
              "@type": "Answer",
              "text": answers[i].innerHTML.trim() // Use innerHTML to preserve formatting
            }
          });
        }
      }
    });
    
    // Only add schema if we have FAQ items
    if (faqSchema.mainEntity.length > 0) {
      // Create script element for schema
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(faqSchema);
      
      // Add to document head
      document.head.appendChild(script);
    }
  }
});
