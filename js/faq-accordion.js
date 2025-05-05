document.addEventListener("DOMContentLoaded", () => {
    const accordions = document.querySelectorAll(".faq-accordion .accordion");

    accordions.forEach(accordion => {
        const panel = accordion.nextElementSibling;
        const icon = accordion.querySelector(".faq-icon"); // Assuming the icon span is still inside the button

        if (!panel || !panel.classList.contains("panel")) {
            console.warn("Accordion button is not immediately followed by a .panel element:", accordion);
            return;
        }

        // Ensure initial state is closed based on presence of 'active' class in HTML (if needed)
        const isInitiallyOpen = accordion.classList.contains("active"); 
        accordion.setAttribute("aria-expanded", isInitiallyOpen);
        if (icon) icon.textContent = isInitiallyOpen ? "−" : "+"; // Update icon based on initial state
        // CSS handles initial collapsed state via max-height: 0 when .active is absent

        accordion.addEventListener("click", () => {
            const isCurrentlyOpen = accordion.classList.contains("active");

            // Toggle ARIA attribute
            accordion.setAttribute("aria-expanded", !isCurrentlyOpen);

            // Toggle active class on the button itself
            accordion.classList.toggle("active", !isCurrentlyOpen);

            // Toggle icon
            if (icon) {
                icon.textContent = isCurrentlyOpen ? "+" : "−"; // Update icon based on new state
            }

            // CSS handles the panel visibility based on the button's active class and the adjacent sibling selector (+)
            
            // Optional: Close others when one opens (Uncomment if needed)
            /*
            if (!isCurrentlyOpen) { // Only close others if we are opening this one
                accordions.forEach(otherAccordion => {
                    if (otherAccordion !== accordion) {
                        const otherIcon = otherAccordion.querySelector(".faq-icon");
                        otherAccordion.classList.remove("active");
                        otherAccordion.setAttribute("aria-expanded", "false");
                        if (otherIcon) otherIcon.textContent = "+";
                    }
                });
            }
            */
        });
    });
});

