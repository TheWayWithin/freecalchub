/**
 * FreecalcHub - FAQ Accordion Script
 * Version: 2.0 (Updated for H3/Button Structure)
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

// Wait until the whole HTML document is loaded and ready
document.addEventListener('DOMContentLoaded', function () {

    // Find all the buttons that control the accordions
    const accordions = document.querySelectorAll('button.accordion');

    // Go through each button one by one
    accordions.forEach(button => {

        // Get the ID of the panel this button controls (from aria-controls)
        const panelId = button.getAttribute('aria-controls');
        // Find the actual panel element using its ID
        const panel = document.getElementById(panelId);

        // If a button exists but its panel doesn't, show an error in the console and stop processing this button.
        if (!panel) {
            console.error('FAQ Panel not found for button:', button.id);
            return; 
        }

        // --- Set Initial State When Page Loads ---
        // Check if the button should start as expanded (open)
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        // If it should be open, set its height; otherwise, set it to null (closed)
        panel.style.maxHeight = isExpanded ? panel.scrollHeight + "px" : null;
        // If it starts open, add the 'active' class (for styling)
        if (isExpanded) {
            button.classList.add('active');
        }

        // --- Add Click Event Listener ---
        // When a button is clicked, run this function:
        button.addEventListener('click', function() {

            // Add or remove the 'active' class on the button
            this.classList.toggle('active');

            // Check if it's currently expanded
            const currentExpanded = this.getAttribute('aria-expanded') === 'true';
            // Set aria-expanded to the opposite (true becomes false, false becomes true)
            this.setAttribute('aria-expanded', !currentExpanded);

            // Open or close the panel using max-height
            if (panel.style.maxHeight) {
                // If it has max-height (is open), set it to null (closes it)
                panel.style.maxHeight = null;
            } else {
                // If it's closed, set its max-height to its full content height (opens it)
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    });
});
