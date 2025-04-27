/**
 * CalcHub Comprehensive Fixes - JavaScript
 * Version: 4.1.0
 * Last Updated: April 24, 2025
 * 
 * This file contains all JavaScript fixes for layout, functionality, and styling issues
 * across the CalcHub website. It addresses dark mode functionality, mobile menu behavior,
 * dynamic ribbon creation, footer link correction, and other interactive elements.
 *
 * DO NOT MODIFY THIS FILE DIRECTLY - Create a new version with incremented version number
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('CalcHub Comprehensive Fixes v4.1.0 loaded');
    
    // Initialize all fixes in the correct order
    preventMobileMenuFlash(); // Do this first to prevent flash
    initHeaderStructure();
    initDarkMode();
    fixBreadcrumbsAlignment();
    fixSubcategoryRibbons();
    fixFooterStructure();
    fixFooterLinks();
    addAccessibilityFeatures();
    
    // Log completion
    console.log('All fixes initialized successfully');
});

/**
 * Ensures proper header structure for logo and dark mode toggle positioning
 */
function initHeaderStructure() {
    console.log('Initializing header structure');
    
    // Get header elements
    const header = document.querySelector('header') || document.querySelector('.header') || document.querySelector('nav') || document.querySelector('.navbar');
    
    if (!header) {
        console.warn('Header element not found');
        return;
    }
    
    // Check if container exists, create if not
    let container = header.querySelector('.container');
    if (!container) {
        console.log('Creating header container');
        container = document.createElement('div');
        container.className = 'container';
        
        // Move all direct children of header into container
        while (header.firstChild) {
            container.appendChild(header.firstChild);
        }
        
        header.appendChild(container);
    }
    
    // Ensure logo and dark mode toggle are properly positioned
    const logo = header.querySelector('a:first-of-type') || header.querySelector('.logo');
    const darkModeToggle = header.querySelector('#dark-mode-toggle') || header.querySelector('[aria-label="Toggle dark mode"]') || header.querySelector('.dark-mode-toggle');
    
    if (logo) {
        logo.style.marginRight = '20px';
        logo.style.paddingLeft = '0';
        logo.style.flexShrink = '0';
    }
    
    if (darkModeToggle) {
        darkModeToggle.style.marginLeft = '20px';
        darkModeToggle.style.paddingRight = '0';
        darkModeToggle.style.flexShrink = '0';
    }
    
    // Fix Date & Time navigation item to prevent wrapping
    const navItems = header.querySelectorAll('a');
    navItems.forEach(function(item) {
        if (item.textContent.includes('Date & Time') || item.href.includes('date')) {
            item.style.padding = '0 8px';
            item.style.fontSize = '0.95em';
        }
    });
}

/**
 * Ensures dark mode toggle works correctly
 */
function initDarkMode() {
    console.log('Initializing dark mode');
    
    // Find dark mode toggle button
    const darkModeToggle = document.querySelector('#dark-mode-toggle') || 
                          document.querySelector('[aria-label="Toggle dark mode"]') || 
                          document.querySelector('.dark-mode-toggle');
    
    if (!darkModeToggle) {
        console.warn('Dark mode toggle not found');
        return;
    }
    
    console.log('Dark mode toggle found:', darkModeToggle);
    
    // Ensure icons are visible
    const moonIcon = darkModeToggle.querySelector('.fa-moon') || darkModeToggle.querySelector('[class*="moon"]');
    const sunIcon = darkModeToggle.querySelector('.fa-sun') || darkModeToggle.querySelector('[class*="sun"]');
    
    if (moonIcon) {
        moonIcon.style.display = 'block';
        moonIcon.style.visibility = 'visible';
        moonIcon.style.opacity = '1';
        moonIcon.style.fontSize = '18px';
    }
    
    if (sunIcon) {
        sunIcon.style.display = 'block';
        sunIcon.style.visibility = 'visible';
        sunIcon.style.opacity = '1';
        sunIcon.style.fontSize = '18px';
    }
    
    // Remove any existing event listeners by cloning and replacing
    const newDarkModeToggle = darkModeToggle.cloneNode(true);
    darkModeToggle.parentNode.replaceChild(newDarkModeToggle, darkModeToggle);
    
    // Add event listener to toggle dark mode
    newDarkModeToggle.addEventListener('click', function() {
        console.log('Dark mode toggle clicked');
        
        const body = document.body;
        
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            console.log('Dark mode disabled and saved to localStorage');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            console.log('Dark mode enabled and saved to localStorage');
        }
        
        // Force repaint to ensure styles are applied
        void body.offsetHeight;
    });
    
    // Check if dark mode is enabled in localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        console.log('Dark mode enabled from localStorage');
    }
}

/**
 * Prevents mobile menu from flashing on page load
 * This must be called first to prevent the flash
 */
function preventMobileMenuFlash() {
    console.log('Preventing mobile menu flash');
    
    // Add inline style to head to hide mobile menu immediately
    const style = document.createElement('style');
    style.textContent = `
        .mobile-menu, #mobile-menu, .mobile-nav, #mobile-nav {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
    
    // Find mobile menu elements
    const mobileMenu = document.querySelector('.mobile-menu') || 
                      document.querySelector('#mobile-menu') || 
                      document.querySelector('.mobile-nav') || 
                      document.querySelector('#mobile-nav');
    
    if (mobileMenu) {
        // Hide mobile menu immediately with inline style
        mobileMenu.style.display = 'none';
        console.log('Mobile menu hidden with inline style');
    }
    
    // Find mobile menu container
    const mobileMenuContainer = document.querySelector('.mobile-menu-container') || 
                               document.querySelector('#mobile-menu-container');
    
    if (mobileMenuContainer) {
        // Initialize mobile menu container
        mobileMenuContainer.classList.add('initialized');
        console.log('Mobile menu container initialized');
    }
    
    // Add event listener to hide mobile menu when navigating
    window.addEventListener('beforeunload', function() {
        if (mobileMenu) {
            mobileMenu.style.display = 'none';
        }
    });
}

/**
 * Fixes breadcrumbs alignment and styling
 */
function fixBreadcrumbsAlignment() {
    console.log('Fixing breadcrumbs alignment');
    
    // Find breadcrumbs
    const breadcrumbs = document.querySelector('.breadcrumbs') || document.querySelector('.breadcrumb');
    
    if (!breadcrumbs) {
        console.warn('Breadcrumbs element not found');
        return;
    }
    
    // Remove any borders or box-shadows
    breadcrumbs.style.border = 'none';
    breadcrumbs.style.boxShadow = 'none';
    breadcrumbs.style.overflow = 'visible';
    
    // Check if container exists, create if not
    let container = breadcrumbs.querySelector('.container');
    if (!container) {
        console.log('Creating breadcrumbs container');
        container = document.createElement('div');
        container.className = 'container';
        
        // Move all direct children of breadcrumbs into container
        while (breadcrumbs.firstChild) {
            container.appendChild(breadcrumbs.firstChild);
        }
        
        breadcrumbs.appendChild(container);
    }
    
    // Center the breadcrumbs
    breadcrumbs.style.display = 'flex';
    breadcrumbs.style.justifyContent = 'center';
    breadcrumbs.style.width = '100%';
    breadcrumbs.style.maxWidth = '100%';
    
    // Center the container
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.width = '100%';
    container.style.maxWidth = '1140px';
    container.style.margin = '0 auto';
    container.style.padding = '0 15px';
    
    // Style breadcrumb links and separators
    const links = breadcrumbs.querySelectorAll('a');
    links.forEach(function(link) {
        link.style.color = '#4a76a8';
        link.style.textDecoration = 'none';
        link.style.padding = '0 5px';
    });
    
    const separators = breadcrumbs.querySelectorAll('span');
    separators.forEach(function(separator) {
        separator.style.color = '#6c757d';
        separator.style.padding = '0 5px';
    });
}

/**
 * Fixes subcategory ribbon alignment
 */
function fixSubcategoryRibbons() {
    console.log('Fixing subcategory ribbons');
    
    // Find subcategory ribbons
    const ribbons = document.querySelectorAll('.subcategory-nav, .category-nav, .sub-nav, .finance-nav, .math-nav, .health-nav, nav.blue-bg, .blue-bg, .subcategory-ribbon, .category-ribbon');
    
    ribbons.forEach(function(ribbon) {
        // Remove any borders or box-shadows
        ribbon.style.border = 'none';
        ribbon.style.boxShadow = 'none';
        ribbon.style.overflow = 'visible';
        
        // Check if container exists, create if not
        let container = ribbon.querySelector('.container');
        if (!container) {
            console.log('Creating ribbon container');
            container = document.createElement('div');
            container.className = 'container';
            
            // Move all direct children of ribbon into container
            while (ribbon.firstChild) {
                container.appendChild(ribbon.firstChild);
            }
            
            ribbon.appendChild(container);
        }
        
        // Center the ribbon
        ribbon.style.display = 'flex';
        ribbon.style.justifyContent = 'center';
        ribbon.style.width = '100%';
        ribbon.style.maxWidth = '100%';
        ribbon.style.margin = '0 auto';
        ribbon.style.padding = '0';
        ribbon.style.backgroundColor = '#4a76a8';
        
        // Center the container
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.width = '100%';
        container.style.maxWidth = '1140px';
        container.style.margin = '0 auto';
        container.style.padding = '0 15px';
        
        // Style the links
        const links = ribbon.querySelectorAll('a');
        links.forEach(function(link) {
            link.style.color = 'white';
            link.style.padding = '10px 15px';
            link.style.textDecoration = 'none';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
        });
    });
    
    // Add ribbons to pages that need them
    addMissingRibbons();
}

/**
 * Adds missing ribbons to informational pages
 */
function addMissingRibbons() {
    console.log('Adding missing ribbons');
    
    // Check if this is an informational page that needs a ribbon
    const path = window.location.pathname;
    const isAboutPage = path.includes('/about/');
    const isPrivacyPage = path.includes('/privacy/');
    const isTermsPage = path.includes('/terms/');
    const isGdprPage = path.includes('/gdpr/');
    const isContactPage = path.includes('/contact/');
    const isBlogPage = path.includes('/blog/');
    
    if (isAboutPage || isPrivacyPage || isTermsPage || isGdprPage || isContactPage || isBlogPage) {
        console.log('This is an informational page that needs a ribbon');
        
        // Find breadcrumbs
        const breadcrumbs = document.querySelector('.breadcrumbs') || document.querySelector('.breadcrumb');
        
        if (breadcrumbs) {
            // Check if ribbon already exists
            const nextElement = breadcrumbs.nextElementSibling;
            const hasRibbon = nextElement && (
                nextElement.classList.contains('subcategory-nav') || 
                nextElement.classList.contains('category-nav') || 
                nextElement.classList.contains('sub-nav') || 
                nextElement.classList.contains('blue-bg') || 
                nextElement.classList.contains('subcategory-ribbon') || 
                nextElement.classList.contains('category-ribbon')
            );
            
            if (!hasRibbon) {
                console.log('Creating ribbon for informational page');
                
                // Create ribbon
                const ribbon = document.createElement('nav');
                ribbon.className = 'subcategory-nav blue-bg';
                ribbon.style.backgroundColor = '#4a76a8';
                ribbon.style.border = 'none';
                ribbon.style.boxShadow = 'none';
                ribbon.style.overflow = 'visible';
                
                // Create container
                const container = document.createElement('div');
                container.className = 'container';
                
                // Add appropriate links based on page type
                if (isAboutPage) {
                    addRibbonLink(container, 'About Us', '/about/index.html');
                    addRibbonLink(container, 'Our Mission', '/about/index.html#mission');
                    addRibbonLink(container, 'Our Team', '/about/index.html#team');
                    addRibbonLink(container, 'Contact', '/contact/index.html');
                } else if (isPrivacyPage) {
                    addRibbonLink(container, 'Privacy Policy', '/privacy/index.html');
                    addRibbonLink(container, 'GDPR', '/gdpr/index.html');
                    addRibbonLink(container, 'Terms of Use', '/terms/index.html');
                    addRibbonLink(container, 'Cookies', '/privacy/index.html#cookies');
                } else if (isTermsPage) {
                    addRibbonLink(container, 'Terms of Use', '/terms/index.html');
                    addRibbonLink(container, 'Privacy Policy', '/privacy/index.html');
                    addRibbonLink(container, 'GDPR', '/gdpr/index.html');
                    addRibbonLink(container, 'Cookies', '/privacy/index.html#cookies');
                } else if (isGdprPage) {
                    addRibbonLink(container, 'GDPR', '/gdpr/index.html');
                    addRibbonLink(container, 'Privacy Policy', '/privacy/index.html');
                    addRibbonLink(container, 'Terms of Use', '/terms/index.html');
                    addRibbonLink(container, 'Cookies', '/privacy/index.html#cookies');
                } else if (isContactPage) {
                    addRibbonLink(container, 'Contact', '/contact/index.html');
                    addRibbonLink(container, 'About Us', '/about/index.html');
                    addRibbonLink(container, 'FAQ', '/faq/index.html');
                } else if (isBlogPage) {
                    addRibbonLink(container, 'All Articles', '/blog/index.html');
                    addRibbonLink(container, 'Finance', '/blog/finance/index.html');
                    addRibbonLink(container, 'Health', '/blog/health/index.html');
                    addRibbonLink(container, 'Lifestyle', '/blog/lifestyle/index.html');
                }
                
                // Add container to ribbon
                ribbon.appendChild(container);
                
                // Insert ribbon after breadcrumbs
                breadcrumbs.parentNode.insertBefore(ribbon, breadcrumbs.nextSibling);
                
                console.log('Ribbon added successfully');
            }
        }
    }
}

/**
 * Helper function to add links to ribbons
 */
function addRibbonLink(container, text, href) {
    const link = document.createElement('a');
    link.textContent = text;
    link.href = href;
    link.style.color = 'white';
    link.style.padding = '10px 15px';
    link.style.textDecoration = 'none';
    link.style.display = 'flex';
    link.style.alignItems = 'center';
    container.appendChild(link);
}

/**
 * Fixes footer structure and organization
 */
function fixFooterStructure() {
    console.log('Fixing footer structure');
    
    // Find footer
    const footer = document.querySelector('footer') || document.querySelector('.footer');
    
    if (!footer) {
        console.warn('Footer element not found');
        return;
    }
    
    // Center the footer
    footer.style.display = 'flex';
    footer.style.flexDirection = 'column';
    footer.style.justifyContent = 'center';
    footer.style.alignItems = 'center';
    footer.style.width = '100%';
    footer.style.maxWidth = '100%';
    footer.style.margin = '0 auto';
    footer.style.padding = '20px 0';
    footer.style.backgroundColor = '#f8f9fa';
    footer.style.borderTop = '1px solid #e9ecef';
    
    // Organize footer content
    organizeFooterContent(footer);
    
    // Find or create footer container
    let container = footer.querySelector('.container') || 
                   footer.querySelector('.row') || 
                   footer.querySelector('.footer-content');
    
    if (!container) {
        console.log('Creating footer container');
        container = document.createElement('div');
        container.className = 'container';
        
        // Move all direct children of footer into container
        while (footer.firstChild) {
            container.appendChild(footer.firstChild);
        }
        
        footer.appendChild(container);
    }
    
    // Center the container
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'space-between';
    container.style.width = '100%';
    container.style.maxWidth = '1140px';
    container.style.margin = '0 auto';
    container.style.padding = '0 15px';
    
    // Find footer columns
    const columns = container.querySelectorAll('.col, .column, .footer-column');
    
    columns.forEach(function(column) {
        column.style.flex = '1 1 200px';
        column.style.margin = '10px';
        column.style.padding = '0';
        column.style.minWidth = '200px';
    });
    
    // Find copyright section
    const copyright = footer.querySelector('.copyright') || 
                     footer.querySelector('.footer-bottom');
    
    if (copyright) {
        copyright.style.width = '100%';
        copyright.style.maxWidth = '1140px';
        copyright.style.margin = '20px auto 0';
        copyright.style.padding = '15px';
        copyright.style.textAlign = 'center';
        copyright.style.borderTop = '1px solid #e9ecef';
        copyright.style.color = '#6c757d';
    }
}

/**
 * Organizes footer content into proper sections
 */
function organizeFooterContent(footer) {
    console.log('Organizing footer content');
    
    // Check if footer already has a structured layout
    const hasStructuredLayout = footer.querySelector('.container') && 
                               (footer.querySelectorAll('.col, .column, .footer-column').length >= 3);
    
    if (hasStructuredLayout) {
        console.log('Footer already has a structured layout');
        return;
    }
    
    // Create a new container
    const container = document.createElement('div');
    container.className = 'container';
    
    // Create columns for different sections
    const categoriesColumn = document.createElement('div');
    categoriesColumn.className = 'footer-column';
    const categoriesHeading = document.createElement('h4');
    categoriesHeading.textContent = 'Categories';
    categoriesColumn.appendChild(categoriesHeading);
    
    const popularColumn = document.createElement('div');
    popularColumn.className = 'footer-column';
    const popularHeading = document.createElement('h4');
    popularHeading.textContent = 'Popular Calculators';
    popularColumn.appendChild(popularHeading);
    
    const aboutColumn = document.createElement('div');
    aboutColumn.className = 'footer-column';
    const aboutHeading = document.createElement('h4');
    aboutHeading.textContent = 'About';
    aboutColumn.appendChild(aboutHeading);
    
    const connectColumn = document.createElement('div');
    connectColumn.className = 'footer-column';
    const connectHeading = document.createElement('h4');
    connectHeading.textContent = 'Connect';
    connectColumn.appendChild(connectHeading);
    
    // Find existing category links
    const categoryLinks = Array.from(footer.querySelectorAll('a')).filter(link => 
        link.href.includes('/finance/') || 
        link.href.includes('/math/') || 
        link.href.includes('/health/') || 
        link.href.includes('/conversions/') || 
        link.href.includes('/date/') || 
        link.href.includes('/business/') || 
        link.href.includes('/lifestyle/')
    );
    
    // Find existing calculator links
    const calculatorLinks = Array.from(footer.querySelectorAll('a')).filter(link => 
        link.textContent.includes('Calculator') || 
        link.textContent.includes('Converter')
    );
    
    // Find existing about links
    const aboutLinks = Array.from(footer.querySelectorAll('a')).filter(link => 
        link.href.includes('/about/') || 
        link.href.includes('/contact/') || 
        link.href.includes('/privacy/') || 
        link.href.includes('/terms/') || 
        link.href.includes('/gdpr/')
    );
    
    // Find existing social links
    const socialLinks = Array.from(footer.querySelectorAll('a')).filter(link => 
        link.classList.contains('social') || 
        link.parentElement.classList.contains('social') || 
        link.classList.contains('fa') || 
        link.querySelector('.fa')
    );
    
    // If we don't have enough links, create default ones
    if (categoryLinks.length < 5) {
        addFooterLink(categoriesColumn, 'Finance', '/finance/index.html');
        addFooterLink(categoriesColumn, 'Math', '/math/index.html');
        addFooterLink(categoriesColumn, 'Health', '/health/index.html');
        addFooterLink(categoriesColumn, 'Conversions', '/conversions/index.html');
        addFooterLink(categoriesColumn, 'Date & Time', '/date/index.html');
        addFooterLink(categoriesColumn, 'Business', '/business/index.html');
        addFooterLink(categoriesColumn, 'Lifestyle', '/lifestyle/index.html');
    } else {
        // Use existing category links
        categoryLinks.forEach(link => {
            const newLink = link.cloneNode(true);
            categoriesColumn.appendChild(newLink);
        });
    }
    
    if (calculatorLinks.length < 5) {
        addFooterLink(popularColumn, 'Mortgage Calculator', '/finance/mortgage-calculator.html');
        addFooterLink(popularColumn, 'Compound Interest', '/finance/compound-interest.html');
        addFooterLink(popularColumn, 'BMI Calculator', '/health/bmi-calculator.html');
        addFooterLink(popularColumn, 'Currency Converter', '/conversions/currency-converter.html');
        addFooterLink(popularColumn, 'Percentage Calculator', '/math/percentage-calculator.html');
        addFooterLink(popularColumn, 'Age Calculator', '/date/age-calculator.html');
        addFooterLink(popularColumn, 'ROI Calculator', '/business/roi-calculator.html');
    } else {
        // Use existing calculator links
        calculatorLinks.forEach(link => {
            const newLink = link.cloneNode(true);
            popularColumn.appendChild(newLink);
        });
    }
    
    if (aboutLinks.length < 4) {
        addFooterLink(aboutColumn, 'About Us', '/about/index.html');
        addFooterLink(aboutColumn, 'Contact', '/contact/index.html');
        addFooterLink(aboutColumn, 'Privacy Policy', '/privacy/index.html');
        addFooterLink(aboutColumn, 'Terms of Use', '/terms/index.html');
        addFooterLink(aboutColumn, 'GDPR Compliance', '/gdpr/index.html');
        addFooterLink(aboutColumn, 'Sitemap', '/sitemap.html');
    } else {
        // Use existing about links
        aboutLinks.forEach(link => {
            const newLink = link.cloneNode(true);
            aboutColumn.appendChild(newLink);
        });
    }
    
    // Create social icons
    const socialDiv = document.createElement('div');
    socialDiv.className = 'social-icons';
    
    if (socialLinks.length < 2) {
        addSocialLink(socialDiv, 'Facebook', '#');
        addSocialLink(socialDiv, 'Twitter', '#');
        addSocialLink(socialDiv, 'Instagram', '#');
        addSocialLink(socialDiv, 'LinkedIn', '#');
    } else {
        // Use existing social links
        socialLinks.forEach(link => {
            const newLink = link.cloneNode(true);
            socialDiv.appendChild(newLink);
        });
    }
    
    connectColumn.appendChild(socialDiv);
    
    // Create newsletter form
    const newsletterDiv = document.createElement('div');
    newsletterDiv.className = 'newsletter';
    newsletterDiv.style.marginTop = '15px';
    
    const newsletterHeading = document.createElement('h5');
    newsletterHeading.textContent = 'Stay Updated';
    newsletterHeading.style.marginBottom = '10px';
    newsletterDiv.appendChild(newsletterHeading);
    
    const newsletterText = document.createElement('p');
    newsletterText.textContent = 'Subscribe to our newsletter for new calculators and articles';
    newsletterText.style.fontSize = '0.9em';
    newsletterText.style.marginBottom = '10px';
    newsletterDiv.appendChild(newsletterText);
    
    const newsletterForm = document.createElement('div');
    newsletterForm.className = 'subscribe';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Your email address';
    emailInput.style.padding = '8px 12px';
    emailInput.style.border = '1px solid #ced4da';
    emailInput.style.borderRadius = '4px';
    emailInput.style.marginRight = '5px';
    emailInput.style.width = '200px';
    newsletterForm.appendChild(emailInput);
    
    const subscribeButton = document.createElement('button');
    subscribeButton.textContent = 'Subscribe';
    subscribeButton.style.padding = '8px 15px';
    subscribeButton.style.backgroundColor = '#4a76a8';
    subscribeButton.style.color = 'white';
    subscribeButton.style.border = 'none';
    subscribeButton.style.borderRadius = '4px';
    subscribeButton.style.cursor = 'pointer';
    newsletterForm.appendChild(subscribeButton);
    
    newsletterDiv.appendChild(newsletterForm);
    connectColumn.appendChild(newsletterDiv);
    
    // Add columns to container
    container.appendChild(categoriesColumn);
    container.appendChild(popularColumn);
    container.appendChild(aboutColumn);
    container.appendChild(connectColumn);
    
    // Create copyright section
    const copyright = document.createElement('div');
    copyright.className = 'copyright';
    copyright.style.width = '100%';
    copyright.style.maxWidth = '1140px';
    copyright.style.margin = '20px auto 0';
    copyright.style.padding = '15px';
    copyright.style.textAlign = 'center';
    copyright.style.borderTop = '1px solid #e9ecef';
    copyright.style.color = '#6c757d';
    
    const copyrightText = document.createElement('p');
    copyrightText.textContent = '© ' + new Date().getFullYear() + ' CalcHub. All rights reserved.';
    copyright.appendChild(copyrightText);
    
    const copyrightLinks = document.createElement('div');
    addFooterLink(copyrightLinks, 'About Us', '/about/index.html');
    addFooterLink(copyrightLinks, 'Privacy', '/privacy/index.html');
    addFooterLink(copyrightLinks, 'Terms', '/terms/index.html');
    addFooterLink(copyrightLinks, 'GDPR', '/gdpr/index.html');
    addFooterLink(copyrightLinks, 'Cookies', '/privacy/index.html#cookies');
    
    // Style the copyright links
    Array.from(copyrightLinks.querySelectorAll('a')).forEach(link => {
        link.style.display = 'inline-block';
        link.style.margin = '0 10px';
    });
    
    copyright.appendChild(copyrightLinks);
    
    // Clear the footer and add the new content
    const existingContent = Array.from(footer.children);
    existingContent.forEach(child => {
        // Keep any scripts or styles
        if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
            child.remove();
        }
    });
    
    footer.appendChild(container);
    footer.appendChild(copyright);
    
    console.log('Footer content organized successfully');
}

/**
 * Helper function to add links to footer
 */
function addFooterLink(container, text, href) {
    const link = document.createElement('a');
    link.textContent = text;
    link.href = href;
    link.style.display = 'block';
    link.style.marginBottom = '8px';
    link.style.color = '#4a76a8';
    link.style.textDecoration = 'none';
    container.appendChild(link);
    return link;
}

/**
 * Helper function to add social links to footer
 */
function addSocialLink(container, platform, href) {
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('aria-label', platform);
    link.style.marginRight = '15px';
    link.style.fontSize = '20px';
    link.style.color = '#4a76a8';
    
    // Add icon based on platform
    const icon = document.createElement('i');
    switch (platform) {
        case 'Facebook':
            icon.className = 'fa fa-facebook';
            break;
        case 'Twitter':
            icon.className = 'fa fa-twitter';
            break;
        case 'Instagram':
            icon.className = 'fa fa-instagram';
            break;
        case 'LinkedIn':
            icon.className = 'fa fa-linkedin';
            break;
        default:
            icon.className = 'fa fa-link';
    }
    
    link.appendChild(icon);
    container.appendChild(link);
    return link;
}

/**
 * Fixes incorrect footer links
 */
function fixFooterLinks() {
    console.log('Fixing footer links');
    
    // Find all links in the footer
    const footer = document.querySelector('footer') || document.querySelector('.footer');
    
    if (!footer) {
        console.warn('Footer element not found');
        return;
    }
    
    const links = footer.querySelectorAll('a');
    
    links.forEach(function(link) {
        const href = link.getAttribute('href');
        
        if (href) {
            // Fix incorrect /about/ prefix in links
            if (href.includes('/about/terms/')) {
                link.setAttribute('href', href.replace('/about/terms/', '/terms/'));
                console.log('Fixed link:', href, '->', link.getAttribute('href'));
            }
            
            if (href.includes('/about/privacy/')) {
                link.setAttribute('href', href.replace('/about/privacy/', '/privacy/'));
                console.log('Fixed link:', href, '->', link.getAttribute('href'));
            }
            
            if (href.includes('/about/gdpr/')) {
                link.setAttribute('href', href.replace('/about/gdpr/', '/gdpr/'));
                console.log('Fixed link:', href, '->', link.getAttribute('href'));
            }
            
            if (href.includes('/about/contact/')) {
                link.setAttribute('href', href.replace('/about/contact/', '/contact/'));
                console.log('Fixed link:', href, '->', link.getAttribute('href'));
            }
        }
    });
}

/**
 * Adds accessibility features
 */
function addAccessibilityFeatures() {
    console.log('Adding accessibility features');
    
    // Add skip to content link if not present
    if (!document.querySelector('a[href="#content"]')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#content';
        skipLink.textContent = 'Skip to content';
        skipLink.style.position = 'absolute';
        skipLink.style.top = '-40px';
        skipLink.style.left = '0';
        skipLink.style.backgroundColor = '#4a76a8';
        skipLink.style.color = 'white';
        skipLink.style.padding = '8px 15px';
        skipLink.style.zIndex = '100';
        skipLink.style.transition = 'top 0.3s';
        skipLink.style.textDecoration = 'none';
        
        // Show skip link on focus
        skipLink.addEventListener('focus', function() {
            this.style.top = '0';
        });
        
        skipLink.addEventListener('blur', function() {
            this.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        console.log('Skip to content link added');
    }
    
    // Add ARIA labels to elements that need them
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput && !searchInput.getAttribute('aria-label')) {
        searchInput.setAttribute('aria-label', 'Search for calculators');
        console.log('Added ARIA label to search input');
    }
    
    const searchButton = document.querySelector('button[aria-label="Search"]');
    if (searchButton && !searchButton.getAttribute('aria-label')) {
        searchButton.setAttribute('aria-label', 'Search');
        console.log('Added ARIA label to search button');
    }
    
    // Add focus styles to interactive elements
    const style = document.createElement('style');
    style.textContent = `
        a:focus, button:focus, input:focus, select:focus, textarea:focus {
            outline: 2px solid #4a76a8 !important;
            outline-offset: 2px !important;
        }
    `;
    document.head.appendChild(style);
    console.log('Added focus styles for interactive elements');
}
