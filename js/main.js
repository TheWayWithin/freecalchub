document.addEventListener("DOMContentLoaded", function() {
  console.log("[Main.js] DOMContentLoaded event fired.");

  // Load other scripts (performance, tracking, etc.) - Keeping these as is
  const performanceScript = document.createElement("script");
  performanceScript.src = "/js/performance-optimization.js";
  document.body.appendChild(performanceScript);
  
  const trackingScript = document.createElement("script");
  trackingScript.src = "/js/calculator-tracking.js";
  document.body.appendChild(trackingScript);
  
  const faqSchemaScript = document.createElement("script");
  faqSchemaScript.src = "/js/faq-schema.js";
  document.body.appendChild(faqSchemaScript);
  
  const internalLinkingScript = document.createElement("script");
  internalLinkingScript.src = "/js/internal-linking.js";
  document.body.appendChild(internalLinkingScript);
  
  // Initialize mobile menu functionality
  console.log("[Main.js] Attempting to initialize mobile menu...");
  initMobileMenu();
  
  // Initialize search functionality
  console.log("[Main.js] Attempting to initialize search...");
  initSearch();

  // Check for dark mode toggle presence (as a basic check)
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  if (darkModeToggle) {
    console.log("[Main.js] Dark mode toggle button found.");
  } else {
    console.warn("[Main.js] Dark mode toggle button NOT found.");
  }
  
  // Helper functions
  function initMobileMenu() {
    console.log("[Main.js] Inside initMobileMenu function.");
    const mobileMenuButton = document.getElementById("mobile-menu-button");
    const mobileMenuClose = document.getElementById("mobile-menu-close"); // Corrected ID from previous logs
    const mobileMenu = document.getElementById("mobile-menu");
    
    // Log found elements
    console.log("[Main.js] Mobile Menu Button found:", mobileMenuButton ? "Yes" : "No");
    console.log("[Main.js] Mobile Menu Close Button found:", mobileMenuClose ? "Yes" : "No");
    console.log("[Main.js] Mobile Menu Container found:", mobileMenu ? "Yes" : "No");

    if (mobileMenuButton && mobileMenuClose && mobileMenu) {
      console.log("[Main.js] All mobile menu elements found. Preparing to add listeners.");
      
      // Add listener for open button
      mobileMenuButton.addEventListener("click", function(event) {
        console.log("[Main.js] Mobile menu OPEN button clicked.", event);
        mobileMenu.classList.add("active");
        console.log("[Main.js] 'active' class added to mobile menu.");
      });
      console.log("[Main.js] Event listener added to mobile menu OPEN button.");
      
      // Add listener for close button
      mobileMenuClose.addEventListener("click", function(event) {
        console.log("[Main.js] Mobile menu CLOSE button clicked.", event);
        mobileMenu.classList.remove("active");
        console.log("[Main.js] 'active' class removed from mobile menu.");
      });
      console.log("[Main.js] Event listener added to mobile menu CLOSE button.");

    } else {
      console.error("[Main.js] One or more mobile menu elements were NOT found! Cannot add listeners.");
    }
  }
  
  function initSearch() {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    
    console.log("[Main.js] Search Input found:", searchInput ? "Yes" : "No");
    console.log("[Main.js] Search Button found:", searchButton ? "Yes" : "No");

    if (searchInput && searchButton) {
      console.log("[Main.js] Adding search listeners.");
      searchButton.addEventListener("click", function() {
        console.log("[Main.js] Search button clicked.");
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = "/search?q=" + encodeURIComponent(query);
        }
      });
      
      searchInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          console.log("[Main.js] Search input Enter key pressed.");
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = "/search?q=" + encodeURIComponent(query);
          }
        }
      });
    } else {
       console.warn("[Main.js] Search elements not found, listeners not added.");
    }
  }
  
  console.log("[Main.js] Script fully processed within DOMContentLoaded.");
});

