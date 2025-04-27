/* CalcHub Targeted JavaScript Fixes v4.2.0 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('CalcHub Targeted Fixes v4.2.0 loaded');
  
  // Fix logo positioning and prevent overlap with navigation
  fixLogoPositioning();
  
  // Fix category ribbon alignment
  fixCategoryRibbonAlignment();
  
  // Ensure breadcrumbs are properly centered
  ensureBreadcrumbsCentered();
  
  // Fix footer structure if needed
  enhanceFooterStructure();
  
  console.log('All targeted fixes applied successfully');
});

/**
 * Fix logo positioning to prevent overlap with navigation items
 */
function fixLogoPositioning() {
  const logo = document.querySelector('.navbar-brand');
  const navItems = document.querySelectorAll('.navbar-nav .nav-item');
  
  if (logo && navItems.length > 0) {
    // Ensure logo has proper sizing and margin
    logo.style.maxWidth = '150px';
    logo.style.marginRight = '20px';
    
    // Add margin to first nav item to prevent overlap
    if (navItems[0]) {
      navItems[0].style.marginLeft = '20px';
    }
    
    console.log('Logo positioning fixed');
  }
}

/**
 * Fix category ribbon alignment to ensure it's centered
 */
function fixCategoryRibbonAlignment() {
  // The blue navigation ribbon below breadcrumbs
  const categoryRibbons = document.querySelectorAll('.category-navigation, .subcategory-navigation, .finance-navigation, .math-navigation, .health-navigation, .lifestyle-navigation');
  
  categoryRibbons.forEach(ribbon => {
    if (!ribbon.classList.contains('centered-ribbon')) {
      // Create a container for centering if it doesn't exist
      const container = document.createElement('div');
      container.className = 'container d-flex justify-content-center';
      
      // Move all children to the new container
      while (ribbon.firstChild) {
        container.appendChild(ribbon.firstChild);
      }
      
      // Add the container to the ribbon
      ribbon.appendChild(container);
      ribbon.classList.add('centered-ribbon');
      
      // Add proper styling
      ribbon.style.display = 'flex';
      ribbon.style.justifyContent = 'center';
      ribbon.style.width = '100%';
      
      console.log('Category ribbon centered:', ribbon);
    }
  });
}

/**
 * Ensure breadcrumbs are properly centered
 */
function ensureBreadcrumbsCentered() {
  const breadcrumbContainers = document.querySelectorAll('.breadcrumb-container, .breadcrumb-nav, nav[aria-label="breadcrumb"]');
  
  breadcrumbContainers.forEach(container => {
    if (!container.classList.contains('centered-breadcrumbs')) {
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.width = '100%';
      container.classList.add('centered-breadcrumbs');
      
      const breadcrumb = container.querySelector('.breadcrumb');
      if (breadcrumb) {
        breadcrumb.style.display = 'flex';
        breadcrumb.style.justifyContent = 'center';
        breadcrumb.style.width = 'auto';
        breadcrumb.style.margin = '0 auto';
      }
      
      console.log('Breadcrumbs centered:', container);
    }
  });
}

/**
 * Enhance footer structure for better organization
 */
function enhanceFooterStructure() {
  const footer = document.querySelector('footer');
  
  if (footer && !footer.classList.contains('enhanced-footer')) {
    // Add proper classes
    footer.classList.add('footer', 'enhanced-footer');
    
    // Organize footer columns if not already organized
    const footerColumns = footer.querySelector('.footer-columns');
    if (!footerColumns) {
      // Find existing column-like structures
      const columnContainers = footer.querySelectorAll('.row, .container > div');
      
      if (columnContainers.length > 0) {
        // They already have some structure, just add proper classes
        columnContainers.forEach(column => {
          column.classList.add('footer-column');
        });
      } else {
        // Create proper footer structure
        organizeFooterContent(footer);
      }
    }
    
    console.log('Footer structure enhanced');
  }
}

/**
 * Organize footer content into proper columns
 */
function organizeFooterContent(footer) {
  // Only reorganize if footer doesn't have proper structure
  if (footer.querySelector('.footer-columns')) return;
  
  // Create container for columns
  const container = document.createElement('div');
  container.className = 'container';
  
  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'footer-columns';
  
  // Create footer bottom for copyright and links
  const footerBottom = document.createElement('div');
  footerBottom.className = 'footer-bottom';
  
  // Move existing content to appropriate sections
  const existingContainer = footer.querySelector('.container');
  if (existingContainer) {
    // Use existing container instead of creating new one
    existingContainer.innerHTML = '';
    existingContainer.appendChild(columnsContainer);
    existingContainer.appendChild(footerBottom);
  } else {
    container.appendChild(columnsContainer);
    container.appendChild(footerBottom);
    footer.appendChild(container);
  }
  
  // Find copyright text
  const copyrightText = footer.innerText.match(/©\s*\d{4}\s*CalcHub/);
  if (copyrightText) {
    footerBottom.innerHTML = `<p>${copyrightText[0]}. All rights reserved.</p>`;
  }
  
  console.log('Footer content organized');
}

// Apply fixes immediately if DOM is already loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  console.log('DOM already loaded, applying fixes immediately');
  fixLogoPositioning();
  fixCategoryRibbonAlignment();
  ensureBreadcrumbsCentered();
  enhanceFooterStructure();
}
