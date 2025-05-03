document.addEventListener("DOMContentLoaded", function() {
  console.log("Main.js DOMContentLoaded event fired."); // Moved inside

  // Load performance optimizations
  const performanceScript = document.createElement("script");
  performanceScript.src = "/js/performance-optimization.js";
  document.body.appendChild(performanceScript);
  
  // Load calculator tracking for analytics
  const trackingScript = document.createElement("script");
  trackingScript.src = "/js/calculator-tracking.js";
  document.body.appendChild(trackingScript);
  
  // Load FAQ schema generator
  const faqSchemaScript = document.createElement("script");
  faqSchemaScript.src = "/js/faq-schema.js";
  document.body.appendChild(faqSchemaScript);
  
  // Load internal linking enhancements
  const internalLinkingScript = document.createElement("script");
  internalLinkingScript.src = "/js/internal-linking.js";
  document.body.appendChild(internalLinkingScript);
  
  // Initialize mobile menu functionality
  console.log("Attempting to initialize mobile menu..."); // Added log
  initMobileMenu();
  
  // Initialize search functionality
  initSearch();
  
  // Helper functions
  function initMobileMenu() {
    console.log("Inside initMobileMenu function."); // Added log
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenuClose = document.getElementById("mobile-menu-close");
    const mobileMenu = document.getElementById("mobile-menu");
    
    if (mobileMenuButton && mobileMenuClose && mobileMenu) {
      console.log("Mobile menu elements found. Adding listeners."); // Added log
      mobileMenuButton.addEventListener("click", function() {
        console.log("Mobile menu button clicked."); // Added log
        mobileMenu.classList.add("active");
      });
      
      mobileMenuClose.addEventListener("click", function() {
        console.log("Mobile menu close button clicked."); // Added log
        mobileMenu.classList.remove("active");
      });
    } else {
      console.error("Mobile menu elements not found! Button:", mobileMenuButton, "Close:", mobileMenuClose, "Menu:", mobileMenu); // Added error log
    }
  }
  
  function initSearch() {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    
    if (searchInput && searchButton) {
      searchButton.addEventListener("click", function() {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = "/search?q=" + encodeURIComponent(query);
        }
      });
      
      searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = "/search?q=" + encodeURIComponent(query);
          }
        }
      });
    }
  }
  
  console.log("Main.js script fully processed within DOMContentLoaded."); // Moved inside
});

