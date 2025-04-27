// Main JavaScript file to include all enhanced functionality
document.addEventListener('DOMContentLoaded', function() {
  // Load performance optimizations
  const performanceScript = document.createElement('script');
  performanceScript.src = '/js/performance-optimization.js';
  document.body.appendChild(performanceScript);
  
  // Load calculator tracking for analytics
  const trackingScript = document.createElement('script');
  trackingScript.src = '/js/calculator-tracking.js';
  document.body.appendChild(trackingScript);
  
  // Load FAQ schema generator
  const faqSchemaScript = document.createElement('script');
  faqSchemaScript.src = '/js/faq-schema.js';
  document.body.appendChild(faqSchemaScript);
  
  // Load internal linking enhancements
  const internalLinkingScript = document.createElement('script');
  internalLinkingScript.src = '/js/internal-linking.js';
  document.body.appendChild(internalLinkingScript);
  
  // Initialize mobile menu functionality
  initMobileMenu();
  
  // Initialize dark mode toggle
  initDarkModeToggle();
  
  // Initialize search functionality
  initSearch();
  
  // Helper functions
  function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenuClose && mobileMenu) {
      mobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.add('active');
      });
      
      mobileMenuClose.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
      });
    }
  }
  
  function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (darkModeToggle) {
      // Check for saved preference
      const darkMode = localStorage.getItem('darkMode') === 'enabled';
      
      // Set initial state
      if (darkMode) {
        document.body.classList.add('dark-mode');
      }
      
      // Toggle dark mode
      darkModeToggle.addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('darkMode', 'disabled');
        } else {
          document.body.classList.add('dark-mode');
          localStorage.setItem('darkMode', 'enabled');
        }
      });
    }
  }
  
  function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (searchInput && searchButton) {
      searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = '/search?q=' + encodeURIComponent(query);
        }
      });
      
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = '/search?q=' + encodeURIComponent(query);
          }
        }
      });
    }
  }
});
