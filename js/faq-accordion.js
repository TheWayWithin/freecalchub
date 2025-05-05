document.addEventListener("DOMContentLoaded", () => {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const questionButton = item.querySelector(".faq-question");
        const answerPanel = item.querySelector(".faq-answer");
        const icon = questionButton.querySelector(".faq-icon");

        if (!questionButton || !answerPanel) {
            console.warn("FAQ item missing question button or answer panel:", item);
            return;
        }

        // Ensure initial state is closed based on presence of 'active' class in HTML (if needed)
        const isInitiallyOpen = item.classList.contains("active"); 
        questionButton.setAttribute("aria-expanded", isInitiallyOpen);
        if (icon) icon.textContent = isInitiallyOpen ? "\t−" : "+";
        // CSS handles initial collapsed state via max-height: 0 when .active is absent
        // No need to set answerPanel.hidden = true here; CSS handles it.

        questionButton.addEventListener("click", () => {
            const isCurrentlyOpen = questionButton.getAttribute("aria-expanded") === "true";

            // Toggle ARIA attribute
            questionButton.setAttribute("aria-expanded", !isCurrentlyOpen);

            // Toggle active class for styling/transitions - CSS will handle visibility via max-height
            item.classList.toggle("active", !isCurrentlyOpen);

            // Toggle icon
            if (icon) {
                icon.textContent = isCurrentlyOpen ? "+" : "\t−";
            }

            // Optional: Close others when one opens (Uncomment if needed)
            /*
            if (!isCurrentlyOpen) { // Only close others if we are opening this one
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherButton = otherItem.querySelector(".faq-question");
                        const otherAnswer = otherItem.querySelector(".faq-answer");
                        const otherIcon = otherButton.querySelector(".faq-icon");

                        if (otherButton && otherAnswer) {
                            otherButton.setAttribute("aria-expanded", "false");
                            otherItem.classList.remove("active");
                            if (otherIcon) otherIcon.textContent = "+";
                        }
                    }
                });
            }
            */
        });
    });
});

