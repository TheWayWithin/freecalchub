/**
 * FreecalcHub - FAQ Accordion Script
 * Version: 2.1 (Uses .panel-open class)
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

document.addEventListener('DOMContentLoaded', function () {
    const accordions = document.querySelectorAll('button.accordion');

    accordions.forEach(button => {
        const panelId = button.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);

        if (!panel) {
            console.error('FAQ Panel not found for button:', button.id);
            return; 
        }

        // --- Set Initial State ---
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            button.classList.add('active');
            panel.classList.add('panel-open'); // Add class if starts open
            panel.style.maxHeight = panel.scrollHeight + "px";
        } else {
             panel.style.maxHeight = null; // Ensure it's null if closed
        }

        // --- Add Click Event Listener ---
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            panel.classList.add('panel-open'); // <-- TOGGLE THE CLASS HERE

            const currentExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !currentExpanded);

            // Set max-height based on whether the class is now present
            if (panel.classList.contains('panel-open')) {
                panel.style.maxHeight = panel.scrollHeight + "px";
            } else {
                panel.style.maxHeight = null;
            }
        });
    });
});
