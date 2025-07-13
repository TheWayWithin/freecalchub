// Helper function to load scripts asynchronously with error handling
function loadScript(src) {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.onerror = function() {
    // Silently fail if script can't be loaded (e.g., optional tracking scripts)
  };
  document.body.appendChild(script);
}

document.addEventListener("DOMContentLoaded", function() {
  // Load additional scripts with error handling
  loadScript("/js/performance-optimization.js");
  loadScript("/js/calculator-tracking.js");
  loadScript("/js/faq-schema.js");
  loadScript("/js/internal-linking.js");
  
  // Initialize mobile menu functionality
  initMobileMenu();
  
  // Initialize search functionality
  initSearch();

  // Helper functions
  function initMobileMenu() {
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenuClose = document.getElementById("mobile-menu-close");
    const mobileMenu = document.getElementById("mobile-menu");
    
    if (mobileMenuButton && mobileMenuClose && mobileMenu) {
      
      // Add listener for open button
      mobileMenuButton.addEventListener("click", function(event) {
        mobileMenu.classList.add("active");
      });
      
      // Add listener for close button
      mobileMenuClose.addEventListener("click", function(event) {
        mobileMenu.classList.remove("active");
      });

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
  
});

