document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerPanel = item.querySelector('.faq-answer');
        const icon = questionButton.querySelector('.faq-icon'); // Assuming an icon element exists

        if (!questionButton || !answerPanel) {
            console.warn('FAQ item missing question button or answer panel:', item);
            return; // Skip this item if structure is incorrect
        }

        // Ensure initial state is consistent with HTML (aria-expanded="false", answer hidden)
        const isInitiallyOpen = questionButton.getAttribute('aria-expanded') === 'true';
        if (isInitiallyOpen) {
            answerPanel.hidden = false;
            item.classList.add('active'); // Add active class if initially open
            if (icon) icon.textContent = '	−'; // Update icon if initially open
        } else {
            answerPanel.hidden = true;
            questionButton.setAttribute('aria-expanded', 'false'); // Ensure it's false if not explicitly true
            item.classList.remove('active'); // Ensure no active class if initially closed
            if (icon) icon.textContent = '+'; // Ensure icon is '+' if initially closed
        }

        questionButton.addEventListener('click', () => {
            const isCurrentlyOpen = questionButton.getAttribute('aria-expanded') === 'true';

            // Toggle ARIA attribute
            questionButton.setAttribute('aria-expanded', !isCurrentlyOpen);

            // Toggle visibility using the 'hidden' attribute
            answerPanel.hidden = isCurrentlyOpen;

            // Toggle active class for styling/transitions
            item.classList.toggle('active', !isCurrentlyOpen);

            // Toggle icon (Example: using '+' and '−')
            if (icon) {
                icon.textContent = isCurrentlyOpen ? '+' : '	−';
            }

            // Optional: Close others when one opens (Uncomment if needed)
            /*
            if (!isCurrentlyOpen) { // Only close others if we are opening this one
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        const otherButton = otherItem.querySelector('.faq-question');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        const otherIcon = otherButton.querySelector('.faq-icon');

                        otherButton.setAttribute('aria-expanded', 'false');
                        otherAnswer.hidden = true;
                        otherItem.classList.remove('active');
                        if (otherIcon) otherIcon.textContent = '+';
                    }
                });
            }
            */
        });
    });
});

