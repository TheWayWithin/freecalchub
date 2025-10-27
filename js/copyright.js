// Dynamic copyright year display
// This script updates the copyright year in the footer
document.addEventListener('DOMContentLoaded', function() {
    const copyrightElements = document.querySelectorAll('.copyright-year');
    const currentYear = new Date().getFullYear();
    copyrightElements.forEach(function(element) {
        element.textContent = currentYear;
    });
});
