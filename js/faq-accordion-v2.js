/* /js/faq-accordion-v2.js */
/* --- FreecalcHub: Enhanced FAQ Accordion Script --- */
/* --- Version: 2.2 --- */
/* --- Last Updated: 2025-06-11 --- */
/* --- Changelog:
     - Version 2.2: Updated faqIndexLinks selector to include '#faq-cat-item-' for category page FAQ compatibility.
                    This ensures FAQ index links on category pages correctly trigger accordion functionality.
--- */
/* --- Handles H3 > Button, Index Links, and Smooth Scroll --- */

document.addEventListener('DOMContentLoaded', () => {
    // Selects accordion buttons within faq-item elements
    const accordions = document.querySelectorAll('.faq-item h3 button.accordion');
    // Selects FAQ index links that point to either standard or category-specific FAQ items
    const faqIndexLinks = document.querySelectorAll('.faq-index a[href^="#faq-item-"], .faq-index a[href^="#faq-cat-item-"]'); 
    
    const headerHeight = 140; // Pixels: Match CSS scroll-margin-top & actual header height
    const transitionTime = 350; // Milliseconds: Match CSS transition duration

    // Standard Accordion Functionality
    accordions.forEach(button => {
        button.addEventListener('click', function() {
            // Find the panel: It's the next sibling of the H3 (button's parent)
            const h3Element = this.parentElement;
            const panel = h3Element.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            // Find all accordions *within the same FAQ section*
            const parentSection = this.closest('.faq-section');
            const allAccordionButtons = parentSection
                ? parentSection.querySelectorAll('.faq-item h3 button.accordion')
                : accordions; // Fallback if no parentSection found (unlikely but safe)

            // Close all others *before* toggling the current one
            allAccordionButtons.forEach(otherButton => {
                if (otherButton !== this && otherButton.classList.contains('active')) {
                    otherButton.classList.remove('active');
                    const otherH3 = otherButton.parentElement;
                    otherH3.nextElementSibling.style.maxHeight = null;
                    otherButton.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle the clicked accordion's state
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                // Open: Set max-height to its scrollHeight for proper size
                panel.style.maxHeight = panel.scrollHeight + "px";
                this.setAttribute('aria-expanded', 'true');
            } else {
                // Close: Set max-height back to null
                this.setAttribute('aria-expanded', 'false');
                // Ensure panel doesn't jump if content is large
                panel.style.maxHeight = null; 
            }
        });
    });

    // FAQ Index Link Click Handler
    faqIndexLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Stop default jump

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Find the button within the target H3
                const accordionButton = targetElement.querySelector('h3 button.accordion');

                // 1. Ensure the target accordion is open (and close others)
                if (accordionButton && !accordionButton.classList.contains('active')) {
                    accordionButton.click(); // Trigger click to open & handle others
                }

                // 2. Wait for accordion animation to finish
                setTimeout(() => {
                    // 3. Calculate position *after* layout changes
                    const targetOffsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const scrollToPosition = targetOffsetTop - headerHeight;

                    // 4. Scroll smoothly
                    window.scrollTo({
                        top: scrollToPosition,
                        behavior: 'smooth'
                    });

                    // 5. Set focus for accessibility (after scroll)
                    setTimeout(() => {
                         accordionButton.focus({ preventScroll: true }); // preventScroll avoids potential jump
                    }, 500); // Wait for smooth scroll

                }, transitionTime);
            } else {
                console.warn("FAQ Index Link Target not found:", targetId);
            }
        });
    });

    // Optional: Adjust panel height on window resize (for robustness)
    window.addEventListener('resize', () => {
        document.querySelectorAll('.faq-item h3 button.accordion.active').forEach(button => {
            const panel = button.parentElement.nextElementSibling;
            panel.style.maxHeight = panel.scrollHeight + "px";
        });
    }, 250); // Debounced slightly
});
