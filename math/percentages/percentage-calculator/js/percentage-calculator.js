document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- Tab Switching Logic ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Deactivate all tabs and content
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tabContents.forEach(c => {
                c.classList.remove('active');
            });

            // Activate the clicked tab and its content
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            const targetContent = document.querySelector(tab.dataset.tabTarget);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
        
        // Add keyboard navigation for tabs
        tab.addEventListener('keydown', (e) => {
            let index = Array.from(tabs).indexOf(e.target);
            let newIndex = index;
            if (e.key === 'ArrowRight') {
                newIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft') {
                newIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                newIndex = 0;
            } else if (e.key === 'End') {
                newIndex = tabs.length - 1;
            }

            if (newIndex !== index) {
                tabs[newIndex].focus();
                // Optionally trigger click to switch panel on arrow navigation
                // tabs[newIndex].click(); 
            }
        });
    });

    // --- Calculation Logic ---

    // Helper function to display results
    function displayResult(elementId, resultHTML) {
        const resultElement = document.getElementById(elementId);
        if (resultElement) {
            resultElement.innerHTML = resultHTML;
        }
    }

    // Helper function to display error
    function displayError(elementId, message) {
        displayResult(elementId, `<p class="error">Error: ${message}</p>`);
    }
    
    // Helper function to clear results
    function clearResult(elementId) {
        const resultElement = document.getElementById(elementId);
        if (resultElement) {
            resultElement.innerHTML = '';
        }
    }

    // 1. Basic Percentage Calculation (What is X% of Y?)
    const formBasic = document.getElementById('percentage-calculator-form-basic');
    if (formBasic) {
        formBasic.addEventListener('submit', (e) => {
            e.preventDefault();
            const percentage = parseFloat(document.getElementById('basic_perc_val1').value);
            const totalValue = parseFloat(document.getElementById('basic_perc_val2').value);
            const resultsId = 'basic_perc_results';

            if (isNaN(percentage) || isNaN(totalValue)) {
                displayError(resultsId, 'Please enter valid numbers for both fields.');
                return;
            }

            const result = (percentage / 100) * totalValue;
            displayResult(resultsId, `<p>${percentage}% of ${totalValue} is <strong>${result.toLocaleString()}</strong></p>`);
        });
        formBasic.addEventListener('reset', () => clearResult('basic_perc_results'));
    }

    // 2. X is what % of Y?
    const formXIsPercOfY = document.getElementById('percentage-calculator-form-x-is-perc-of-y');
    if (formXIsPercOfY) {
        formXIsPercOfY.addEventListener('submit', (e) => {
            e.preventDefault();
            const valueX = parseFloat(document.getElementById('x_is_perc_val1').value);
            const totalValueY = parseFloat(document.getElementById('x_is_perc_val2').value);
            const resultsId = 'x_is_perc_results';

            if (isNaN(valueX) || isNaN(totalValueY)) {
                displayError(resultsId, 'Please enter valid numbers for both fields.');
                return;
            }
            if (totalValueY === 0) {
                 displayError(resultsId, 'Cannot divide by zero (Total Value Y cannot be 0).');
                 return;
            }

            const result = (valueX / totalValueY) * 100;
            displayResult(resultsId, `<p>${valueX} is <strong>${result.toLocaleString()}%</strong> of ${totalValueY}</p>`);
        });
        formXIsPercOfY.addEventListener('reset', () => clearResult('x_is_perc_results'));
    }

    // 3. Percentage Change
    const formPercChange = document.getElementById('percentage-calculator-form-perc-change');
    if (formPercChange) {
        formPercChange.addEventListener('submit', (e) => {
            e.preventDefault();
            const originalValue = parseFloat(document.getElementById('perc_change_val1').value);
            const newValue = parseFloat(document.getElementById('perc_change_val2').value);
            const resultsId = 'perc_change_results';

            if (isNaN(originalValue) || isNaN(newValue)) {
                displayError(resultsId, 'Please enter valid numbers for both fields.');
                return;
            }
            if (originalValue === 0) {
                 displayError(resultsId, 'Cannot calculate percentage change from zero (Original Value cannot be 0).');
                 return;
            }

            const change = newValue - originalValue;
            const percentageChange = (change / originalValue) * 100;
            const changeType = percentageChange >= 0 ? 'increase' : 'decrease';
            
            displayResult(resultsId, 
                `<p>The change from ${originalValue} to ${newValue} is ${change.toLocaleString()}.</p>
                 <p>This is a <strong>${Math.abs(percentageChange).toLocaleString()}% ${changeType}</strong>.</p>`
            );
        });
        formPercChange.addEventListener('reset', () => clearResult('perc_change_results'));
    }
});

