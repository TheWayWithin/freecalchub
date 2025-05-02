/* Enhanced Dark Mode Toggle Functionality */

// Function to apply dark mode preference immediately
function applyInitialDarkMode() {
    try {
        const isDarkMode = localStorage.getItem("darkMode") === "enabled";
        if (isDarkMode) {
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
        }
    } catch (e) {
        console.error("Could not access localStorage for dark mode:", e);
    }
}

// Apply immediately on script load
applyInitialDarkMode();

document.addEventListener("DOMContentLoaded", function() {
    // Get the dark mode toggle button
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const htmlElement = document.documentElement; // Target <html> element

    // Function to enable dark mode
    function enableDarkMode() {
        // Add dark-mode class to html element
        htmlElement.classList.add("dark-mode");
        // Update localStorage
        try {
            localStorage.setItem("darkMode", "enabled");
        } catch (e) {
            console.error("Could not save dark mode preference:", e);
        }
        // Log for debugging
        console.log("Dark mode enabled");
    }

    // Function to disable dark mode
    function disableDarkMode() {
        // Remove dark-mode class from html element
        htmlElement.classList.remove("dark-mode");
        // Update localStorage
        try {
            localStorage.setItem("darkMode", "disabled");
        } catch (e) {
            console.error("Could not save dark mode preference:", e);
        }
        // Log for debugging
        console.log("Dark mode disabled");
    }

    // Re-apply based on localStorage after DOM is ready (redundant but safe)
    // The initial script in <head> should handle the initial state.
    // This ensures consistency if the <head> script somehow fails.
    try {
        if (localStorage.getItem("darkMode") === "enabled") {
            if (!htmlElement.classList.contains("dark-mode")) {
                enableDarkMode(); // Apply if not already set
            }
        } else {
            if (htmlElement.classList.contains("dark-mode")) {
                disableDarkMode(); // Remove if incorrectly set
            }
        }
    } catch (e) {
        console.error("Could not access localStorage for dark mode check:", e);
    }


    // Toggle dark mode when button is clicked
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function() {
            // Check if dark mode is currently enabled on html element
            if (htmlElement.classList.contains("dark-mode")) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    } else {
        console.error("Dark mode toggle button not found");
    }

    // Add a class to indicate JS has loaded (helps with CSS transitions)
    // Apply to body as it's less critical than the dark mode class itself
    document.body.classList.add("js-loaded");
});

