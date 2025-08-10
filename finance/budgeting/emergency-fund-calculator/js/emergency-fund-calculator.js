/*
 * FreecalcHub.com - Emergency Fund Calculator
 * Version: 1.0
 * Date: January 12, 2025
 * Description: Calculate emergency fund target and savings timeline
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References - Input Elements
    const housingCostEl = document.getElementById("housingCost");
    const utilitiesCostEl = document.getElementById("utilitiesCost");
    const foodCostEl = document.getElementById("foodCost");
    const transportationCostEl = document.getElementById("transportationCost");
    const insuranceCostEl = document.getElementById("insuranceCost");
    const debtPaymentsEl = document.getElementById("debtPayments");
    const otherEssentialsEl = document.getElementById("otherEssentials");
    const totalEssentialsEl = document.getElementById("totalEssentials");
    const emergencyMonthsEl = document.getElementById("emergencyMonths");
    const currentSavingsEl = document.getElementById("currentSavings");
    const monthlySavingsEl = document.getElementById("monthlySavings");

    // Control Elements
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Result Display Elements
    const targetFundAmountEl = document.getElementById("targetFundAmount");
    const emergencyMonthsDisplayEl = document.getElementById("emergencyMonthsDisplay");
    const currentSavingsAmountEl = document.getElementById("currentSavingsAmount");
    const currentCoverageMonthsEl = document.getElementById("currentCoverageMonths");
    const savingsGapAmountEl = document.getElementById("savingsGapAmount");
    const gapStatusEl = document.getElementById("gapStatus");
    const monthlySavingsDisplayEl = document.getElementById("monthlySavingsDisplay");
    const timeToTargetEl = document.getElementById("timeToTarget");
    const targetDateEl = document.getElementById("targetDate");

    // Progress Elements
    const progressFillEl = document.getElementById("progressFill");
    const progressTextEl = document.getElementById("progressText");
    const progressEndEl = document.getElementById("progressEnd");

    // Scenario Elements
    const scenario50MoreEl = document.getElementById("scenario50More");
    const scenario50TimeEl = document.getElementById("scenario50Time");
    const scenario50LessEl = document.getElementById("scenario50Less");
    const scenario50LessTimeEl = document.getElementById("scenario50LessTime");
    const scenario3MonthEl = document.getElementById("scenario3Month");
    const scenario3MonthTimeEl = document.getElementById("scenario3MonthTime");

    // Expense input elements array for easy iteration
    const expenseInputs = [
        housingCostEl, utilitiesCostEl, foodCostEl, transportationCostEl,
        insuranceCostEl, debtPaymentsEl, otherEssentialsEl
    ];

    // Initialize Event Listeners
    initializeEventListeners();

    function initializeEventListeners() {
        // Calculate button
        calculateButton.addEventListener("click", handleCalculate);

        // Reset button
        resetButton.addEventListener("click", handleReset);

        // Real-time total calculation for expenses
        expenseInputs.forEach(input => {
            input.addEventListener("input", updateTotalEssentials);
        });

        // Real-time calculation trigger
        [emergencyMonthsEl, currentSavingsEl, monthlySavingsEl].forEach(input => {
            input.addEventListener("input", debounce(() => {
                if (resultsSection.style.display !== "none") {
                    handleCalculate();
                }
            }, 300));
        });

        // Initialize total on load
        updateTotalEssentials();
    }

    function updateTotalEssentials() {
        const total = expenseInputs.reduce((sum, input) => {
            const value = parseFloat(input.value) || 0;
            return sum + value;
        }, 0);

        totalEssentialsEl.textContent = formatCurrency(total);
        return total;
    }

    function validateInputs() {
        clearErrors();

        // Calculate total essential expenses
        const totalEssentials = updateTotalEssentials();
        
        if (totalEssentials <= 0) {
            showError("Please enter at least some essential monthly expenses.");
            expenseInputs[0].focus();
            return false;
        }

        // Validate emergency months selection
        const emergencyMonths = parseInt(emergencyMonthsEl.value);
        if (!emergencyMonths || emergencyMonths < 1) {
            showError("Please select a valid coverage period.");
            return false;
        }

        // Validate current savings (can be 0)
        const currentSavings = parseFloat(currentSavingsEl.value) || 0;
        if (currentSavings < 0) {
            showError("Current savings cannot be negative.");
            currentSavingsEl.focus();
            return false;
        }

        // Validate monthly savings capacity
        const monthlySavings = parseFloat(monthlySavingsEl.value) || 0;
        if (monthlySavings < 0) {
            showError("Monthly savings capacity cannot be negative.");
            monthlySavingsEl.focus();
            return false;
        }

        return true;
    }

    function handleCalculate() {
        if (!validateInputs()) {
            return;
        }

        const calculations = calculateEmergencyFund();
        displayResults(calculations);
        
        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function calculateEmergencyFund() {
        const totalEssentials = updateTotalEssentials();
        const emergencyMonths = parseInt(emergencyMonthsEl.value);
        const currentSavings = parseFloat(currentSavingsEl.value) || 0;
        const monthlySavings = parseFloat(monthlySavingsEl.value) || 0;

        // Calculate target fund amount
        const targetFund = totalEssentials * emergencyMonths;
        
        // Calculate current coverage
        const currentCoverageMonths = totalEssentials > 0 ? currentSavings / totalEssentials : 0;
        
        // Calculate savings gap
        const savingsGap = Math.max(0, targetFund - currentSavings);
        
        // Calculate timeline
        const monthsToTarget = monthlySavings > 0 && savingsGap > 0 
            ? Math.ceil(savingsGap / monthlySavings) 
            : 0;
        
        // Calculate target date
        const targetDate = monthsToTarget > 0 
            ? new Date(Date.now() + monthsToTarget * 30.44 * 24 * 60 * 60 * 1000)
            : null;

        // Calculate progress percentage
        const progressPercentage = targetFund > 0 ? Math.min(100, (currentSavings / targetFund) * 100) : 0;

        // Calculate scenarios
        const scenario50More = monthlySavings * 1.5;
        const scenario50MoreTime = scenario50More > 0 && savingsGap > 0 
            ? Math.ceil(savingsGap / scenario50More) 
            : 0;
        
        const scenario50Less = monthlySavings * 0.5;
        const scenario50LessTime = scenario50Less > 0 && savingsGap > 0 
            ? Math.ceil(savingsGap / scenario50Less) 
            : 0;

        const scenario3MonthTarget = totalEssentials * 3;
        const scenario3MonthGap = Math.max(0, scenario3MonthTarget - currentSavings);
        const scenario3MonthTime = monthlySavings > 0 && scenario3MonthGap > 0 
            ? Math.ceil(scenario3MonthGap / monthlySavings) 
            : 0;

        return {
            totalEssentials,
            emergencyMonths,
            targetFund,
            currentSavings,
            currentCoverageMonths,
            savingsGap,
            monthlySavings,
            monthsToTarget,
            targetDate,
            progressPercentage,
            scenarios: {
                fiftyMore: { amount: scenario50More, months: scenario50MoreTime },
                fiftyLess: { amount: scenario50Less, months: scenario50LessTime },
                threeMonth: { target: scenario3MonthTarget, months: scenario3MonthTime }
            }
        };
    }

    function displayResults(calc) {
        // Overview section
        targetFundAmountEl.textContent = formatCurrency(calc.targetFund);
        emergencyMonthsDisplayEl.textContent = calc.emergencyMonths;
        
        currentSavingsAmountEl.textContent = formatCurrency(calc.currentSavings);
        currentCoverageMonthsEl.textContent = calc.currentCoverageMonths.toFixed(1);
        
        savingsGapAmountEl.textContent = formatCurrency(calc.savingsGap);
        
        // Gap status
        if (calc.savingsGap === 0) {
            gapStatusEl.textContent = "Fully funded!";
            gapStatusEl.className = "detail gap-status-complete";
        } else if (calc.currentSavings > 0) {
            gapStatusEl.textContent = `${calc.progressPercentage.toFixed(1)}% complete`;
            gapStatusEl.className = "detail gap-status-partial";
        } else {
            gapStatusEl.textContent = "Ready to start";
            gapStatusEl.className = "detail gap-status-none";
        }

        // Timeline section
        monthlySavingsDisplayEl.textContent = formatCurrency(calc.monthlySavings);
        
        if (calc.savingsGap === 0) {
            timeToTargetEl.textContent = "Goal achieved!";
            timeToTargetEl.className = "timeline-value status-completed";
            targetDateEl.textContent = "Target reached";
            targetDateEl.className = "timeline-value status-completed";
        } else if (calc.monthsToTarget > 0) {
            timeToTargetEl.textContent = `${calc.monthsToTarget} months`;
            timeToTargetEl.className = "timeline-value status-in-progress";
            
            if (calc.targetDate) {
                targetDateEl.textContent = calc.targetDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                targetDateEl.className = "timeline-value status-in-progress";
            }
        } else {
            timeToTargetEl.textContent = "Set savings goal";
            timeToTargetEl.className = "timeline-value status-not-started";
            targetDateEl.textContent = "TBD";
            targetDateEl.className = "timeline-value status-not-started";
        }

        // Progress visualization
        updateProgressBar(calc.progressPercentage, calc.targetFund);

        // Scenario analysis
        displayScenarios(calc);

        // Add completion styling if fully funded
        const fundOverview = document.querySelector('.fund-overview');
        if (calc.savingsGap === 0) {
            fundOverview.classList.add('fund-complete');
        } else {
            fundOverview.classList.remove('fund-complete');
        }
    }

    function updateProgressBar(percentage, targetAmount) {
        progressFillEl.style.width = `${percentage}%`;
        progressTextEl.textContent = `${percentage.toFixed(1)}%`;
        progressEndEl.textContent = formatCurrency(targetAmount);
        
        // Add animation class
        progressFillEl.classList.add('animate');
        setTimeout(() => {
            progressFillEl.classList.remove('animate');
        }, 1000);
    }

    function displayScenarios(calc) {
        // 50% more savings scenario
        scenario50MoreEl.textContent = `${formatCurrency(calc.scenarios.fiftyMore)}/month`;
        if (calc.savingsGap === 0) {
            scenario50TimeEl.textContent = "Already complete!";
        } else if (calc.scenarios.fiftyMore.months > 0) {
            const timeSaved = calc.monthsToTarget - calc.scenarios.fiftyMore.months;
            scenario50TimeEl.textContent = `${timeSaved} months faster`;
        } else {
            scenario50TimeEl.textContent = "Set base savings first";
        }

        // 50% less savings scenario
        scenario50LessEl.textContent = `${formatCurrency(calc.scenarios.fiftyLess)}/month`;
        if (calc.savingsGap === 0) {
            scenario50LessTimeEl.textContent = "Already complete!";
        } else if (calc.scenarios.fiftyLess.months > 0 && calc.monthsToTarget > 0) {
            const extraTime = calc.scenarios.fiftyLess.months - calc.monthsToTarget;
            scenario50LessTimeEl.textContent = `${extraTime} months longer`;
        } else {
            scenario50LessTimeEl.textContent = "Very slow progress";
        }

        // 3-month alternative scenario
        scenario3MonthEl.textContent = formatCurrency(calc.scenarios.threeMonth.target);
        if (calc.currentSavings >= calc.scenarios.threeMonth.target) {
            scenario3MonthTimeEl.textContent = "Already achieved!";
        } else if (calc.scenarios.threeMonth.months > 0) {
            scenario3MonthTimeEl.textContent = `${calc.scenarios.threeMonth.months} months`;
        } else {
            scenario3MonthTimeEl.textContent = "Set savings goal";
        }
    }

    function handleReset() {
        // Reset all form inputs
        document.getElementById("calculatorForm").reset();
        
        // Reset total essentials display
        updateTotalEssentials();
        
        // Hide results
        resultsSection.style.display = "none";
        
        // Clear errors
        clearErrors();
        
        // Remove completion styling
        const fundOverview = document.querySelector('.fund-overview');
        if (fundOverview) {
            fundOverview.classList.remove('fund-complete');
        }
        
        // Reset progress bar
        progressFillEl.style.width = "0%";
        progressTextEl.textContent = "0%";
    }

    // Utility Functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.round(amount));
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
});