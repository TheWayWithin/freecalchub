// Final Dark Mode Fix - Direct Event Listener Implementation
// This script fixes the dark mode toggle by directly attaching the event listener
// and ensuring it works regardless of when the DOM is loaded

// Immediately execute this function
(function() {
    // Function to initialize dark mode
    function initDarkMode() {
        console.log("Dark mode initialization started");
        
        // Get the dark mode toggle button
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        
        // Check if the toggle element exists
        if (!darkModeToggle) {
            console.error('Dark mode toggle button not found. Make sure you have an element with id="dark-mode-toggle"');
            // Try again in 500ms in case the DOM is still loading
            setTimeout(initDarkMode, 500);
            return;
        }
        
        console.log("Dark mode toggle button found");
        
        // Check for saved dark mode preference and apply it immediately
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            console.log("Dark mode enabled from localStorage");
        }
        
        // Remove any existing event listeners by cloning and replacing the element
        const newToggle = darkModeToggle.cloneNode(true);
        darkModeToggle.parentNode.replaceChild(newToggle, darkModeToggle);
        
        // Add the event listener to the new element
        newToggle.addEventListener('click', function() {
            console.log("Dark mode toggle clicked");
            
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'disabled');
                console.log("Dark mode disabled and saved to localStorage");
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'enabled');
                console.log("Dark mode enabled and saved to localStorage");
            }
            
            // Force a repaint to ensure styles are applied
            document.body.style.display = 'none';
            // This will be executed immediately after the previous line
            document.body.offsetHeight; 
            // And now we remove the "display: none" style
            document.body.style.display = '';
        });
        
        console.log("Dark mode event listener attached successfully");
    }
    
    // Try to initialize immediately
    initDarkMode();
    
    // Also initialize when DOM is fully loaded to be safe
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    } else {
        // DOM is already loaded, run the initialization
        initDarkMode();
    }
    
    // Final fallback - try one more time after a delay
    setTimeout(initDarkMode, 1000);
})();
