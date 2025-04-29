/* Enhanced Dark Mode Toggle Functionality */

document.addEventListener('DOMContentLoaded', function() {
    // Get the dark mode toggle button
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    // Check if dark mode is enabled in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    
    // Function to enable dark mode
    function enableDarkMode() {
        // Add dark-mode class to body
        document.body.classList.add('dark-mode');
        // Update localStorage
        localStorage.setItem('darkMode', 'enabled');
        // Log for debugging
        console.log('Dark mode enabled');
    }
    
    // Function to disable dark mode
    function disableDarkMode() {
        // Remove dark-mode class from body
        document.body.classList.remove('dark-mode');
        // Update localStorage
        localStorage.setItem('darkMode', 'disabled');
        // Log for debugging
        console.log('Dark mode disabled');
    }
    
    // Initialize dark mode based on localStorage
    if (isDarkMode) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
    
    // Toggle dark mode when button is clicked
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            // Check if dark mode is currently enabled
            if (document.body.classList.contains('dark-mode')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    } else {
        console.error('Dark mode toggle button not found');
    }
    
    // Add a class to indicate JS has loaded (helps with CSS transitions)
    document.body.classList.add('js-loaded');
});
