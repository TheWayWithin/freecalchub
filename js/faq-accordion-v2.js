/**
 * FreecalcHub - FAQ Accordion Script
 * Version: 2.3 (Uses .panel-open class & large max-height)
 * * Toggles FAQ panels when their corresponding button is clicked.
 * Handles ARIA attributes for accessibility.
 * Uses max-height for smooth CSS transitions.
 * * Assumes HTML structure like:
 * <div class="faq-item">
 * <h3 class="faq-question">
 * <button class="accordion" aria-expanded="false" aria-controls="faq-panel-X" id="faq-button-X">
 * Question Text?
 * <span class="accordion-icon"></span> 
 * </button>
 * </h3>
 * <div class="panel" id="faq-panel-X" role="region" aria-labelledby="faq-button-X"> 
 * <p>Answer Text</p>
 * </div>
 * </div>
 */



document.addEventListener('DOMContentLoaded', () => {
    const accordions = document.querySelectorAll('.faq-item .accordion');
    // Select links within an element having class 'faq-index' that link to '#faq-item-'
    const faqIndexLinks = document.querySelectorAll('.faq-index a[href^="#faq-item-"]');
    // Define header height offset - adjust if your fixed header height changes
    const headerHeight = 140; // The desired space (in pixels) from the top
    // Define transition time to wait for accordion to open (should match CSS)
    const transitionTime = 350; // Milliseconds

    // Standard Accordion Functionality
    accordions.forEach(accordion => {
        accordion.addEventListener('click', function() {
            const panel = this.nextElementSibling;
            const isExpanded = this.getAttribute('aria-expanded') === 'true';

            // --- Enhanced: Close All Others ---
            // Find all accordions *within the same FAQ section*
            const parentSection = this.closest('.faq-section');
            const allAccordionsInSection = parentSection
                ? parentSection.querySelectorAll('.faq-item .accordion')
                : accordions;

            allAccordionsInSection.forEach(otherAccordion => {
                if (otherAccordion !== this && otherAccordion.classList.contains('active')) {
                    otherAccordion.classList.remove('active');
                    otherAccordion.nextElementSibling.style.maxHeight = null;
                    otherAccordion.setAttribute('aria-expanded', 'false');
                }
            });
            // --- End Enhanced ---

            // Toggle the clicked accordion
            this.classList.toggle('active');

            if (!isExpanded) {
                // Open: Set max-height to its scrollHeight
                panel.style.maxHeight = panel.scrollHeight + "px";
                this.setAttribute('aria-expanded', 'true');
            } else {
                // Close: Set max-height back to null
                panel.style.maxHeight = null;
                this.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- NEW: FAQ Index Link Click Handler ---
    faqIndexLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Stop the default anchor jump

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const accordionButton = targetElement.querySelector('.accordion');

                // 1. Ensure the target accordion is open (and close others)
                if (accordionButton && !accordionButton.classList.contains('active')) {
                    accordionButton.click(); // Trigger the click event to open it
                }

                // 2. Wait for the accordion animation to finish
                setTimeout(() => {
                    // 3. Calculate the position *after* layout changes
                    const targetOffsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const scrollToPosition = targetOffsetTop - headerHeight;

                    // 4. Scroll smoothly to the calculated position
                    window.scrollTo({
                        top: scrollToPosition,
                        behavior: 'smooth'
                    });

                    // 5. Optional: Set focus for accessibility (after scroll)
                    // Use another small delay if needed
                    setTimeout(() => {
                         accordionButton.focus();
                    }, 500); // Wait for smooth scroll to mostly finish

                }, transitionTime); // Wait for the accordion to open
            } else {
                console.warn("FAQ Index Link Target not found:", targetId);
            }
        });
    });
    // --- End NEW ---

});
