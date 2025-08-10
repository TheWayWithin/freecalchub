/*
 * FreecalcHub.com - 50/30/20 Budget Calculator
 * Version: 1.0
 * Date: January 12, 2025
 * Description: Calculate budget allocation using the 50/30/20 rule
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Input Elements
    const monthlyIncomeEl = document.getElementById("monthlyIncome");
    const needsPercentEl = document.getElementById("needsPercent");
    const needsPercentTextEl = document.getElementById("needsPercentText");
    const wantsPercentEl = document.getElementById("wantsPercent");
    const wantsPercentTextEl = document.getElementById("wantsPercentText");
    const savingsPercentEl = document.getElementById("savingsPercent");
    const savingsPercentTextEl = document.getElementById("savingsPercentText");
    const totalPercentEl = document.getElementById("totalPercent");

    // Optional comparison inputs
    const currentNeedsEl = document.getElementById("currentNeeds");
    const currentWantsEl = document.getElementById("currentWants");
    const currentSavingsEl = document.getElementById("currentSavings");

    // Result Display Elements
    const needsAmountEl = document.getElementById("needsAmount");
    const wantsAmountEl = document.getElementById("wantsAmount");
    const savingsAmountEl = document.getElementById("savingsAmount");
    const needsPercentDisplayEl = document.getElementById("needsPercentDisplay");
    const wantsPercentDisplayEl = document.getElementById("wantsPercentDisplay");
    const savingsPercentDisplayEl = document.getElementById("savingsPercentDisplay");
    const comparisonResultsEl = document.getElementById("comparisonResults");

    // Comparison display elements
    const currentNeedsDisplayEl = document.getElementById("currentNeedsDisplay");
    const currentWantsDisplayEl = document.getElementById("currentWantsDisplay");
    const currentSavingsDisplayEl = document.getElementById("currentSavingsDisplay");
    const recommendedNeedsDisplayEl = document.getElementById("recommendedNeedsDisplay");
    const recommendedWantsDisplayEl = document.getElementById("recommendedWantsDisplay");
    const recommendedSavingsDisplayEl = document.getElementById("recommendedSavingsDisplay");
    const needsDifferenceEl = document.getElementById("needsDifference");
    const wantsDifferenceEl = document.getElementById("wantsDifference");
    const savingsDifferenceEl = document.getElementById("savingsDifference");

    // Chart variable
    let budgetChart = null;

    // Verify critical DOM elements exist
    if (!form || !calculateButton || !resetButton || !resultsSection) {
        console.error('Critical DOM elements not found. Calculator may not function properly.');
        return;
    }

    // Initialize Event Listeners
    initializeEventListeners();

    function initializeEventListeners() {
        // Calculate button
        calculateButton.addEventListener("click", handleCalculate);

        // Reset button
        resetButton.addEventListener("click", handleReset);

        // Percentage sliders sync with text inputs
        needsPercentEl.addEventListener("input", () => syncSliderWithText(needsPercentEl, needsPercentTextEl));
        wantsPercentEl.addEventListener("input", () => syncSliderWithText(wantsPercentEl, wantsPercentTextEl));
        savingsPercentEl.addEventListener("input", () => syncSliderWithText(savingsPercentEl, savingsPercentTextEl));

        needsPercentTextEl.addEventListener("input", () => syncTextWithSlider(needsPercentTextEl, needsPercentEl));
        wantsPercentTextEl.addEventListener("input", () => syncTextWithSlider(wantsPercentTextEl, wantsPercentEl));
        savingsPercentTextEl.addEventListener("input", () => syncTextWithSlider(savingsPercentTextEl, savingsPercentEl));

        // Update total percentage when any percentage changes
        [needsPercentEl, wantsPercentEl, savingsPercentEl, needsPercentTextEl, wantsPercentTextEl, savingsPercentTextEl].forEach(el => {
            el.addEventListener("input", updateTotalPercentage);
        });

        // Real-time calculation on input changes
        [monthlyIncomeEl, needsPercentEl, wantsPercentEl, savingsPercentEl].forEach(el => {
            el.addEventListener("input", debounce(handleCalculate, 300));
        });
    }

    function syncSliderWithText(slider, textInput) {
        textInput.value = slider.value;
        validatePercentages();
    }

    function syncTextWithSlider(textInput, slider) {
        const value = parseInt(textInput.value) || 0;
        if (value >= 0 && value <= 100) {
            slider.value = value;
        }
        validatePercentages();
    }

    function updateTotalPercentage() {
        const needsPercent = parseInt(needsPercentTextEl.value) || 0;
        const wantsPercent = parseInt(wantsPercentTextEl.value) || 0;
        const savingsPercent = parseInt(savingsPercentTextEl.value) || 0;
        const total = needsPercent + wantsPercent + savingsPercent;
        
        totalPercentEl.textContent = `${total}%`;
        totalPercentEl.style.color = total === 100 ? 'var(--success-color)' : 'var(--error-color)';
        
        return total;
    }

    function validatePercentages() {
        const total = updateTotalPercentage();
        const isValid = total === 100;
        
        // Visual feedback for percentage inputs
        [needsPercentTextEl, wantsPercentTextEl, savingsPercentTextEl].forEach(el => {
            if (total !== 100) {
                el.classList.add("error-highlight");
            } else {
                el.classList.remove("error-highlight");
            }
        });

        return isValid;
    }

    function validateInputs() {
        clearErrors();

        // Validate income
        const monthlyIncome = parseFloat(monthlyIncomeEl.value);
        if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
            showError("Please enter a valid monthly income greater than $0.");
            monthlyIncomeEl.focus();
            return false;
        }

        // Validate percentage total
        if (!validatePercentages()) {
            showError("Percentages must total exactly 100%. Please adjust your allocation.");
            return false;
        }

        // Validate individual percentages
        const needsPercent = parseInt(needsPercentTextEl.value);
        const wantsPercent = parseInt(wantsPercentTextEl.value);
        const savingsPercent = parseInt(savingsPercentTextEl.value);

        if (needsPercent < 0 || needsPercent > 100 || 
            wantsPercent < 0 || wantsPercent > 100 || 
            savingsPercent < 0 || savingsPercent > 100) {
            showError("Each percentage must be between 0% and 100%.");
            return false;
        }

        return true;
    }

    function handleCalculate() {
        try {
            if (!validateInputs()) {
                return;
            }

            const results = calculateBudget();
            displayResults(results);
            displayChart(results);
            
            if (hasComparisonData()) {
                displayComparison(results);
            }

            resultsSection.style.display = "block";
            resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (error) {
            console.error('Error in budget calculation:', error);
            showError('An error occurred during calculation. Please check your inputs and try again.');
        }
    }

    function calculateBudget() {
        const monthlyIncome = parseFloat(monthlyIncomeEl.value);
        const needsPercent = parseInt(needsPercentTextEl.value);
        const wantsPercent = parseInt(wantsPercentTextEl.value);
        const savingsPercent = parseInt(savingsPercentTextEl.value);

        return {
            income: monthlyIncome,
            needs: {
                amount: (monthlyIncome * needsPercent) / 100,
                percent: needsPercent
            },
            wants: {
                amount: (monthlyIncome * wantsPercent) / 100,
                percent: wantsPercent
            },
            savings: {
                amount: (monthlyIncome * savingsPercent) / 100,
                percent: savingsPercent
            }
        };
    }

    function displayResults(results) {
        // Display amounts
        needsAmountEl.textContent = formatCurrency(results.needs.amount);
        wantsAmountEl.textContent = formatCurrency(results.wants.amount);
        savingsAmountEl.textContent = formatCurrency(results.savings.amount);

        // Display percentages
        needsPercentDisplayEl.textContent = `${results.needs.percent}%`;
        wantsPercentDisplayEl.textContent = `${results.wants.percent}%`;
        savingsPercentDisplayEl.textContent = `${results.savings.percent}%`;
    }

    function displayChart(results) {
        // Ensure Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded. Skipping chart display.');
            return;
        }

        const chartElement = document.getElementById('budgetChart');
        if (!chartElement) {
            console.error('Chart canvas element not found.');
            return;
        }

        const ctx = chartElement.getContext('2d');
        
        // Destroy existing chart if it exists
        if (budgetChart) {
            budgetChart.destroy();
        }

        const data = {
            labels: ['Needs', 'Wants', 'Savings & Debt'],
            datasets: [{
                data: [results.needs.amount, results.wants.amount, results.savings.amount],
                backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = formatCurrency(context.parsed);
                            const percentage = results[label.toLowerCase().split(' ')[0]].percent;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        };

        budgetChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    function hasComparisonData() {
        return currentNeedsEl.value || currentWantsEl.value || currentSavingsEl.value;
    }

    function displayComparison(results) {
        if (!hasComparisonData()) {
            comparisonResultsEl.style.display = "none";
            return;
        }

        const currentNeeds = parseFloat(currentNeedsEl.value) || 0;
        const currentWants = parseFloat(currentWantsEl.value) || 0;
        const currentSavings = parseFloat(currentSavingsEl.value) || 0;

        // Display current and recommended amounts
        currentNeedsDisplayEl.textContent = formatCurrency(currentNeeds, false);
        currentWantsDisplayEl.textContent = formatCurrency(currentWants, false);
        currentSavingsDisplayEl.textContent = formatCurrency(currentSavings, false);
        
        recommendedNeedsDisplayEl.textContent = formatCurrency(results.needs.amount, false);
        recommendedWantsDisplayEl.textContent = formatCurrency(results.wants.amount, false);
        recommendedSavingsDisplayEl.textContent = formatCurrency(results.savings.amount, false);

        // Calculate and display differences
        const needsDiff = currentNeeds - results.needs.amount;
        const wantsDiff = currentWants - results.wants.amount;
        const savingsDiff = currentSavings - results.savings.amount;

        displayDifference(needsDifferenceEl, needsDiff, "needs");
        displayDifference(wantsDifferenceEl, wantsDiff, "wants");
        displayDifference(savingsDifferenceEl, savingsDiff, "savings");

        comparisonResultsEl.style.display = "block";
    }

    function displayDifference(element, difference, category) {
        const absAmount = Math.abs(difference);
        element.textContent = formatCurrency(absAmount, false);
        
        // Remove all difference classes
        element.classList.remove("positive", "negative", "neutral");
        
        if (Math.abs(difference) < 0.01) {
            element.textContent = "Perfect!";
            element.classList.add("neutral");
        } else if (category === "savings") {
            // For savings, positive difference (saving more) is good
            if (difference > 0) {
                element.textContent = "+" + formatCurrency(absAmount, false) + " above";
                element.classList.add("positive");
            } else {
                element.textContent = "-" + formatCurrency(absAmount, false) + " below";
                element.classList.add("negative");
            }
        } else {
            // For needs and wants, show over/under spending
            if (difference > 0) {
                element.textContent = "+" + formatCurrency(absAmount, false) + " over";
                element.classList.add(category === "needs" ? "negative" : "neutral");
            } else {
                element.textContent = "-" + formatCurrency(absAmount, false) + " under";
                element.classList.add(category === "needs" ? "positive" : "positive");
            }
        }
    }

    function handleReset() {
        // Reset form
        form.reset();
        
        // Reset percentage sliders and text inputs to defaults
        needsPercentEl.value = 50;
        needsPercentTextEl.value = 50;
        wantsPercentEl.value = 30;
        wantsPercentTextEl.value = 30;
        savingsPercentEl.value = 20;
        savingsPercentTextEl.value = 20;
        
        updateTotalPercentage();
        
        // Hide results
        resultsSection.style.display = "none";
        comparisonResultsEl.style.display = "none";
        
        // Clear errors
        clearErrors();
        
        // Destroy chart
        if (budgetChart) {
            budgetChart.destroy();
            budgetChart = null;
        }

        // Remove any error styling
        document.querySelectorAll('.error-highlight').forEach(el => {
            el.classList.remove('error-highlight');
        });
    }

    // Utility Functions
    function formatCurrency(amount, includeDollarSign = true) {
        const formatted = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
        
        return includeDollarSign ? `$${formatted}` : formatted;
    }

    function showError(message) {
        errorMessagesDiv.innerHTML = `<div class="error-message">${message}</div>`;
        errorMessagesDiv.style.display = "block";
        errorMessagesDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = "";
        errorMessagesDiv.style.display = "none";
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize total percentage display
    updateTotalPercentage();
});