// Percentage Change Calculator JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('calculatorForm');
    const clearBtn = document.getElementById('clearBtn');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessages = document.getElementById('errorMessages');
    
    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculatePercentageChange();
    });
    
    // Clear button handler
    clearBtn.addEventListener('click', function() {
        clearCalculator();
    });
    
    // Input validation on change
    const inputs = form.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearErrors();
        });
    });
    
    function calculatePercentageChange() {
        clearErrors();
        
        // Get input values
        const originalValue = parseFloat(document.getElementById('originalValue').value);
        const newValue = parseFloat(document.getElementById('newValue').value);
        
        // Validate inputs
        if (isNaN(originalValue) || isNaN(newValue)) {
            showError('Please enter valid numbers for both values.');
            return;
        }
        
        // Check for division by zero
        if (originalValue === 0) {
            if (newValue === 0) {
                // No change from 0 to 0
                displayResults(0, 0, 1, 'no-change');
            } else {
                // Change from 0 to non-zero is undefined
                showError('Percentage change from zero is undefined. The absolute change is ' + 
                         formatNumber(newValue) + '.');
            }
            return;
        }
        
        // Calculate percentage change
        const absoluteChange = newValue - originalValue;
        const percentageChange = (absoluteChange / Math.abs(originalValue)) * 100;
        const changeFactor = newValue / originalValue;
        
        // Determine change type
        let changeType;
        if (percentageChange > 0) {
            changeType = 'increase';
        } else if (percentageChange < 0) {
            changeType = 'decrease';
        } else {
            changeType = 'no-change';
        }
        
        // Display results
        displayResults(percentageChange, absoluteChange, changeFactor, changeType);
        
        // Show calculation breakdown
        showCalculationBreakdown(originalValue, newValue, absoluteChange, percentageChange);
    }
    
    function displayResults(percentageChange, absoluteChange, changeFactor, changeType) {
        // Update percentage change
        const percentageElement = document.getElementById('percentageChange');
        percentageElement.textContent = formatPercentage(percentageChange);
        percentageElement.className = 'result-value';
        
        // Add color coding
        if (changeType === 'increase') {
            percentageElement.classList.add('positive-change');
        } else if (changeType === 'decrease') {
            percentageElement.classList.add('negative-change');
        } else {
            percentageElement.classList.add('no-change');
        }
        
        // Update change type label
        const changeTypeElement = document.getElementById('changeType');
        if (changeType === 'increase') {
            changeTypeElement.textContent = 'Increase';
            changeTypeElement.className = 'result-label positive-change';
        } else if (changeType === 'decrease') {
            changeTypeElement.textContent = 'Decrease';
            changeTypeElement.className = 'result-label negative-change';
        } else {
            changeTypeElement.textContent = 'No Change';
            changeTypeElement.className = 'result-label no-change';
        }
        
        // Update absolute change
        document.getElementById('absoluteChange').textContent = formatNumber(absoluteChange);
        
        // Update change factor
        document.getElementById('changeFactor').textContent = changeFactor.toFixed(4);
        
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    function showCalculationBreakdown(originalValue, newValue, absoluteChange, percentageChange) {
        const stepsContainer = document.getElementById('calculationSteps');
        
        const steps = [
            {
                label: 'Step 1: Calculate the absolute change',
                formula: `${formatNumber(newValue)} - ${formatNumber(originalValue)} = ${formatNumber(absoluteChange)}`
            },
            {
                label: 'Step 2: Divide by the absolute value of the original',
                formula: `${formatNumber(absoluteChange)} ÷ |${formatNumber(originalValue)}| = ${(absoluteChange / Math.abs(originalValue)).toFixed(6)}`
            },
            {
                label: 'Step 3: Convert to percentage',
                formula: `${(absoluteChange / Math.abs(originalValue)).toFixed(6)} × 100 = ${formatPercentage(percentageChange)}`
            }
        ];
        
        let html = '';
        steps.forEach(step => {
            html += `
                <div class="calculation-step">
                    <div class="step-label">${step.label}</div>
                    <div class="step-formula">${step.formula}</div>
                </div>
            `;
        });
        
        // Add interpretation
        let interpretation = '<div class="calculation-step"><div class="step-label">Interpretation:</div><p>';
        if (percentageChange > 0) {
            interpretation += `The value increased by ${formatPercentage(Math.abs(percentageChange))} from ${formatNumber(originalValue)} to ${formatNumber(newValue)}.`;
            if (percentageChange > 100) {
                interpretation += ` This represents more than a doubling of the original value.`;
            }
        } else if (percentageChange < 0) {
            interpretation += `The value decreased by ${formatPercentage(Math.abs(percentageChange))} from ${formatNumber(originalValue)} to ${formatNumber(newValue)}.`;
        } else {
            interpretation += `The value remained unchanged at ${formatNumber(originalValue)}.`;
        }
        interpretation += '</p></div>';
        
        html += interpretation;
        stepsContainer.innerHTML = html;
    }
    
    function clearCalculator() {
        // Clear form inputs
        form.reset();
        
        // Hide results section
        resultsSection.style.display = 'none';
        
        // Clear error messages
        clearErrors();
    }
    
    function showError(message) {
        errorMessages.innerHTML = `<p><i class="fas fa-exclamation-circle"></i> ${message}</p>`;
        errorMessages.style.display = 'block';
    }
    
    function clearErrors() {
        errorMessages.innerHTML = '';
        errorMessages.style.display = 'none';
    }
    
    function formatNumber(num) {
        if (Math.abs(num) >= 1000000) {
            return num.toExponential(2);
        } else if (Math.abs(num) >= 1000) {
            return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
        } else if (Math.abs(num) < 0.01 && num !== 0) {
            return num.toExponential(2);
        } else {
            return num.toLocaleString('en-US', { maximumFractionDigits: 4 });
        }
    }
    
    function formatPercentage(percentage) {
        if (Math.abs(percentage) >= 1000) {
            return percentage.toLocaleString('en-US', { maximumFractionDigits: 0 }) + '%';
        } else if (Math.abs(percentage) >= 10) {
            return percentage.toLocaleString('en-US', { maximumFractionDigits: 1 }) + '%';
        } else {
            return percentage.toLocaleString('en-US', { maximumFractionDigits: 2 }) + '%';
        }
    }
    
    // Add keyboard support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            clearCalculator();
        }
    });
    
    // Example calculations on load (optional)
    function loadExample() {
        document.getElementById('originalValue').value = '100';
        document.getElementById('newValue').value = '125';
    }
    
    // Uncomment to load example on page load
    // loadExample();
});