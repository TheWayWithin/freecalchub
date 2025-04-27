// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get the mobile menu elements
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  
  // Ensure the mobile menu is hidden by default with CSS
  if (mobileMenu) {
    // Make sure the transform property is applied
    mobileMenu.style.transform = 'translateX(-100%)';
  }
  
  // Remove any existing event listeners by cloning the elements
  if (mobileMenuButton) {
    const newMobileMenuButton = mobileMenuButton.cloneNode(true);
    mobileMenuButton.parentNode.replaceChild(newMobileMenuButton, mobileMenuButton);
    
    // Open mobile menu
    if (newMobileMenuButton && mobileMenu) {
      newMobileMenuButton.addEventListener('click', function() {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
      });
    }
  }
  
  if (mobileMenuClose) {
    const newMobileMenuClose = mobileMenuClose.cloneNode(true);
    mobileMenuClose.parentNode.replaceChild(newMobileMenuClose, mobileMenuClose);
    
    // Close mobile menu
    if (newMobileMenuClose && mobileMenu) {
      newMobileMenuClose.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
      });
    }
  }
  
  // Close menu when clicking outside
  if (mobileMenu) {
    document.addEventListener('click', function(event) {
      const currentMobileMenuButton = document.getElementById('mobile-menu-button');
      if (mobileMenu.classList.contains('active') && 
          !mobileMenu.contains(event.target) && 
          event.target !== currentMobileMenuButton) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});
