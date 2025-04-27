// CalcHub Consolidated JavaScript Fixes
// Version: 5.0.0
// Last Updated: April 24, 2025

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('CalcHub Consolidated Fixes v5.0.0 loaded');
  
  // Fix mobile menu flash issue
  fixMobileMenuFlash();
  
  // Ensure dark mode toggle works properly
  setupDarkModeToggle();
  
  // Fix navigation ribbon on blog pages
  fixBlogNavigationRibbon();
  
  // Fix breadcrumb alignment
  fixBreadcrumbsAlignment();
  
  // Fix footer links
  fixFooterLinks();
});

/**
 * Prevents mobile menu from flashing on page load
 */
function fixMobileMenuFlash() {
  // Find all mobile menu containers
  const mobileMenuContainers = document.querySelectorAll('.mobile-menu-container, #mobile-menu-container, .mobile-menu, #mobile-menu, .mobile-nav, #mobile-nav');
  
  // Hide them immediately
  mobileMenuContainers.forEach(container => {
    if (container) {
      container.style.display = 'none';
      container.style.visibility = 'hidden';
      container.style.opacity = '0';
      container.style.height = '0';
      container.style.overflow = 'hidden';
    }
  });
  
  // Initialize them after a short delay
  setTimeout(() => {
    mobileMenuContainers.forEach(container => {
      if (container) {
        container.classList.add('initialized');
      }
    });
  }, 300);
}

/**
 * Sets up dark mode toggle functionality
 */
function setupDarkModeToggle() {
  const darkModeToggle = document.querySelector('#dark-mode-toggle, [aria-label="Toggle dark mode"], .dark-mode-toggle');
  
  if (darkModeToggle) {
    // Ensure the toggle is visible
    darkModeToggle.style.display = 'flex';
    darkModeToggle.style.visibility = 'visible';
    darkModeToggle.style.opacity = '1';
    
    // Check if we need to initialize dark mode based on localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
    
    // Add click event listener if not already present
    if (!darkModeToggle.hasAttribute('data-initialized')) {
      darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
      });
      
      // Mark as initialized
      darkModeToggle.setAttribute('data-initialized', 'true');
    }
  }
}

/**
 * Fixes navigation ribbon on blog pages
 */
function fixBlogNavigationRibbon() {
  // Check if we're on a blog page
  const isBlogPage = window.location.href.includes('/blog/') || document.title.toLowerCase().includes('blog');
  
  if (isBlogPage) {
    // Check if ribbon already exists
    const existingRibbon = document.querySelector('.blog-navigation, .subcategory-ribbon, .category-ribbon, .navigation-ribbon');
    
    // If no ribbon exists, create one
    if (!existingRibbon) {
      const breadcrumbs = document.querySelector('.breadcrumbs, .breadcrumb, .breadcrumb-container, nav[aria-label="breadcrumb"]');
      
      if (breadcrumbs) {
        // Create ribbon element
        const ribbon = document.createElement('nav');
        ribbon.className = 'blog-navigation';
        
        // Create container
        const container = document.createElement('div');
        container.className = 'container';
        
        // Add links
        container.innerHTML = `
          <a href="/blog/index.html">All Articles</a>
          <a href="/blog/finance/index.html">Finance</a>
          <a href="/blog/health/index.html">Health</a>
          <a href="/blog/lifestyle/index.html">Lifestyle</a>
        `;
        
        // Append container to ribbon
        ribbon.appendChild(container);
        
        // Insert after breadcrumbs
        breadcrumbs.parentNode.insertBefore(ribbon, breadcrumbs.nextSibling);
      }
    }
  }
}

/**
 * Ensures breadcrumbs are properly aligned
 */
function fixBreadcrumbsAlignment() {
  const breadcrumbs = document.querySelector('.breadcrumbs, .breadcrumb, .breadcrumb-container, nav[aria-label="breadcrumb"]');
  
  if (breadcrumbs) {
    // Ensure breadcrumbs are centered
    breadcrumbs.style.display = 'flex';
    breadcrumbs.style.justifyContent = 'center';
    breadcrumbs.style.width = '100%';
    breadcrumbs.style.textAlign = 'center';
    
    // Find container inside breadcrumbs
    const container = breadcrumbs.querySelector('.container');
    if (container) {
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
    }
  }
}

/**
 * Fixes footer links to ensure they point to the correct paths
 */
function fixFooterLinks() {
  // Find all footer links that might have incorrect paths
  const footerLinks = document.querySelectorAll('footer a, .footer a');
  
  footerLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Fix links that incorrectly include /about/ in the path
    if (href && href.includes('/about/terms')) {
      link.setAttribute('href', href.replace('/about/terms', '/terms'));
    }
    
    if (href && href.includes('/about/privacy')) {
      link.setAttribute('href', href.replace('/about/privacy', '/privacy'));
    }
    
    if (href && href.includes('/about/gdpr')) {
      link.setAttribute('href', href.replace('/about/gdpr', '/gdpr'));
    }
    
    if (href && href.includes('/about/cookies')) {
      link.setAttribute('href', href.replace('/about/cookies', '/cookies'));
    }
  });
}
