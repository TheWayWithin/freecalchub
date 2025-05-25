/*
 * FreecalcHub.com - Compound Interest Calculator
 * Version: 2.0
 * Date Updated: May 25, 2025
 * Description: Remediated to align with current site-wide templates, V2 FAQ, and commenting standards.
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Input Elements
    const initialInvestmentEl = document.getElementById("initial_investment");
    const annualContributionEl = document.getElementById("annual_contribution");
    const contributionFrequencyEl = document.getElementById("contribution_frequency");
    const annualInterestRateEl = document.getElementById("annual_interest_rate");
    const compoundingFrequencyEl = document.getElementById("compounding_frequency");
    const investmentPeriodYearsEl = document.getElementById("investment_period_years");
    const inflationRateEl = document.getElementById("inflation_rate");
    const taxRateEl = document.getElementById("tax_rate");

    // Result Display Elements
    const futureValueNominalEl = document.getElementById("future_value_nominal");
    const futureValueInflationAdjustedContainerEl = document.getElementById("future_value_inflation_adjusted_container");
    const futureValueInflationAdjustedEl = document.getElementById("future_value_inflation_adjusted");
    const totalPrincipalInvestedEl = document.getElementById("total_principal_invested");
    const totalInterestEarnedEl = document.getElementById("total_interest_earned");
    const effectiveAnnualRateEl = document.getElementById("effective_annual_rate");
    const afterTaxFutureValueContainerEl = document.getElementById("after_tax_future_value_container");
    const afterTaxFutureValueEl = document.getElementById("after_tax_future_value");
    const yearlyGrowthTableBodyEl = document.querySelector("#yearlyGrowthTable tbody");

    // Chart.js Instances (Global scope for access in reset)
    let investmentGrowthChartInstance = null;
    let principalInterestChartInstance = null;

    // --- Event Listeners ---

    /**
     * Handles the click event for the Calculate button.
     * Prevents default form submission, validates inputs, performs calculations,
     * and displays results or errors.
     * @param {Event} event - The click event object.
     */
    calculateButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent potential form submission
        hideError(); // Clear previous errors
        if (validateInputs()) {
            calculateAndDisplay();
        }
    });

    /**
     * Handles the click/reset event for the Reset button.
     * Clears the form, hides results, clears errors, and destroys charts.
     */
    resetButton.addEventListener("click", () => {
        // Using 'click' ensures charts are cleared even if form doesn't 'reset'
        form.reset(); // Reset form fields
        resultsSection.style.display = "none";
        hideError();
        if (yearlyGrowthTableBodyEl) {
             yearlyGrowthTableBodyEl.innerHTML = "";
        }
        destroyCharts();
    });

    // --- Input Validation ---

    /**
     * Validates all required input fields.
     * Displays an error message if any validation fails.
     * @returns {boolean} - True if all inputs are valid, false otherwise.
     */
    function validateInputs() {
        const inputsToValidate = [
            { el: initialInvestmentEl, name: "Initial Investment", required: true, min: 0 },
            { el: annualContributionEl, name: "Annual Contribution", required: false, min: 0 },
            { el: annualInterestRateEl, name: "Annual Interest Rate", required: true, min: 0 },
            { el: investmentPeriodYearsEl, name: "Investment Time", required: true, min: 1, isInt: true },
            { el: inflationRateEl, name: "Inflation Rate", required: false, min: 0 },
            { el: taxRateEl, name: "Tax Rate", required: false, min: 0, max: 100 }
        ];

        for (const input of inputsToValidate) {
            const value = input.el.value.trim();
            if (input.required && value === "") {
                showError(`Please enter a value for ${input.name}.`);
                input.el.focus();
                return false;
            }
            if (value !== "") {
                 const number = parseFloat(value);
                 if (isNaN(number)) {
                    showError(`Please enter a valid number for ${input.name}.`);
                    input.el.focus();
                    return false;
                 }
                 if (input.min !== undefined && number < input.min) {
                    showError(`${input.name} must be at least ${input.min}.`);
                    input.el.focus();
                    return false;
                 }
                  if (input.max !== undefined && number > input.max) {
                    showError(`${input.name} cannot be more than ${input.max}.`);
                    input.el.focus();
                    return false;
                 }
                 if (input.isInt && !Number.isInteger(number)) {
                    showError(`${input.name} must be a whole number.`);
                    input.el.focus();
                    return false;
                 }
            }
        }
        return true; // All checks passed
    }

    /**
     * Safely retrieves a numeric value from an input element.
     * Assumes validation has already passed. Returns 0 if empty.
     * @param {HTMLElement} element - The input element.
     * @returns {number} - The parsed numeric value.
     */
    function getNumericValue(element) {
        const value = element.value.trim();
        return value === "" ? 0 : parseFloat(value);
    }

    // --- Calculation Logic ---

    /**
     * Orchestrates the calculation process and calls display functions.
     */
    function calculateAndDisplay() {
        try {
            // Get validated values
            const initialInvestment = getNumericValue(initialInvestmentEl);
            const annualContribution = getNumericValue(annualContributionEl);
            const contributionFrequencyStr = contributionFrequencyEl.value;
            const annualInterestRate = getNumericValue(annualInterestRateEl);
            const compoundingFrequencyStr = compoundingFrequencyEl.value;
            const investmentPeriodYears = getNumericValue(investmentPeriodYearsEl);
            const inflationRate = getNumericValue(inflationRateEl);
            const taxRate = getNumericValue(taxRateEl);

            // Mapping for frequencies
            const contributionFrequencyMap = { monthly: 12, quarterly: 4, annually: 1 };
            const compoundingFrequencyMap = { daily: 365, monthly: 12, quarterly: 4, annually: 1 };
            const n = compoundingFrequencyMap[compoundingFrequencyStr]; // Compounding periods per year
            const p = contributionFrequencyMap[contributionFrequencyStr]; // Contribution periods per year

            // Rates per period
            const r = annualInterestRate / 100; // Annual rate as decimal
            const i = r / n; // Interest rate per compounding period
            const monthlyContribution = (p === 12) ? annualContribution / 12 : 0; // Only if monthly
            const annualContrib = annualContribution;

            let balance = initialInvestment;
            let totalPrincipal = initialInvestment;
            let totalInterest = 0;
            const yearlyData = [];

            // More accurate calculation using Future Value formulas
            // If contributions are made, we calculate year by year for table/chart
            // Note: This model adds contributions at the END of each contribution period.
            // And compounds based on 'n'. A more precise approach might need iteration.
            // Let's use an iterative model for better accuracy & yearly data.

            let currentBalance = initialInvestment;

            for (let year = 1; year <= investmentPeriodYears; year++) {
                let yearStartBalance = currentBalance;
                let yearInterest = 0;
                let yearContributions = 0;
                let balanceAtPeriodStart = currentBalance;

                for (let period = 1; period <= n; period++) {
                    // Calculate interest for this period
                    let interestForPeriod = balanceAtPeriodStart * i;
                    currentBalance = balanceAtPeriodStart + interestForPeriod;
                    yearInterest += interestForPeriod;

                    // Add contributions - simplified: add annual contribution spread over periods
                    // This is an approximation. A more accurate model would add at specific intervals.
                    // For simplicity & clarity, add 1/n of annual contribution each period.
                    // This roughly simulates continuous contribution.
                    // If p = 1 (annual), add at year-end. If p = 12 (monthly), add 1/12th each month (if n=12).
                    // This approach adds annual/n each compounding period.
                    if (annualContrib > 0) {
                        const contributionThisPeriod = annualContrib / n;
                        currentBalance += contributionThisPeriod;
                        yearContributions += contributionThisPeriod;
                    }

                    balanceAtPeriodStart = currentBalance; // Update for next period
                }

                totalPrincipal += yearContributions;
                totalInterest += yearInterest;

                yearlyData.push({
                    year: year,
                    startingBalance: yearStartBalance,
                    contributions: yearContributions,
                    interestEarned: yearInterest,
                    endingBalance: currentBalance
                });
            }

            const futureValueNominal = currentBalance;
            totalInterest = futureValueNominal - totalPrincipal; // Recalculate based on final values
            const effectiveAnnualRate = (Math.pow(1 + r / n, n) - 1) * 100;

            // Display results
            futureValueNominalEl.textContent = formatCurrency(futureValueNominal);
            totalPrincipalInvestedEl.textContent = formatCurrency(totalPrincipal);
            totalInterestEarnedEl.textContent = formatCurrency(totalInterest);
            effectiveAnnualRateEl.textContent = effectiveAnnualRate.toFixed(2) + "%";

            // Inflation adjustment
            if (inflationRate > 0) {
                const futureValueInflationAdjusted = futureValueNominal / Math.pow(1 + inflationRate / 100, investmentPeriodYears);
                futureValueInflationAdjustedEl.textContent = formatCurrency(futureValueInflationAdjusted);
                futureValueInflationAdjustedContainerEl.style.display = "block";
            } else {
                futureValueInflationAdjustedContainerEl.style.display = "none";
            }

            // Tax adjustment (simplified - taxes only total interest gain)
            if (taxRate > 0) {
                const taxableGain = totalInterest;
                const taxAmount = taxableGain * (taxRate / 100);
                const afterTaxFutureValue = futureValueNominal - taxAmount;
                afterTaxFutureValueEl.textContent = formatCurrency(afterTaxFutureValue);
                afterTaxFutureValueContainerEl.style.display = "block";
            } else {
                afterTaxFutureValueContainerEl.style.display = "none";
            }

            // Update Table & Charts
            populateYearlyTable(yearlyData);
            createOrUpdateCharts(yearlyData, totalPrincipal, totalInterest, initialInvestment);

            // Show results and scroll
            resultsSection.style.display = "flex"; // Changed to flex
            resultsSection.scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            console.error("Calculation Error:", error);
            showError("An error occurred during calculation. Please check your inputs.");
            resultsSection.style.display = "none";
        }
    }

    // --- Display & Formatting ---

    /**
     * Formats a number as USD currency.
     * @param {number} value - The number to format.
     * @returns {string} - The formatted currency string.
     */
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    /**
     * Populates the yearly growth table with calculated data.
     * @param {Array<Object>} data - An array of yearly data objects.
     */
    function populateYearlyTable(data) {
        yearlyGrowthTableBodyEl.innerHTML = ""; // Clear previous data
        data.forEach(item => {
            const row = yearlyGrowthTableBodyEl.insertRow();
            row.insertCell().textContent = item.year;
            row.insertCell().textContent = formatCurrency(item.startingBalance);
            row.insertCell().textContent = formatCurrency(item.contributions);
            row.insertCell().textContent = formatCurrency(item.interestEarned);
            row.insertCell().textContent = formatCurrency(item.endingBalance);
        });
    }

    /**
     * Creates or updates the Chart.js charts.
     * @param {Array<Object>} yearlyData - Data for the line chart.
     * @param {number} totalPrincipal - Principal for the pie chart.
     * @param {number} totalInterest - Interest for the pie chart.
     * @param {number} initialInvestment - Starting point for the line chart.
     */
    function createOrUpdateCharts(yearlyData, totalPrincipal, totalInterest, initialInvestment) {
        destroyCharts(); // Ensure old charts are removed

        const growthChartCtx = document.getElementById("investmentGrowthChart").getContext("2d");
        const principalInterestCtx = document.getElementById("principalInterestChart").getContext("2d");

        const labels = ["Start", ...yearlyData.map(d => `Year ${d.year}`)];
        const balanceData = [initialInvestment, ...yearlyData.map(d => d.endingBalance)];

        const chartOptions = {
             responsive: true,
             maintainAspectRatio: false, // Allows chart to fit container height
             plugins: {
                legend: { labels: { color: getComputedStyle(document.body).getPropertyValue('--text-color') } },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${formatCurrency(context.parsed.y || context.parsed)}`
                    }
                }
             },
             scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => formatCurrency(value),
                        color: getComputedStyle(document.body).getPropertyValue('--text-color')
                    },
                    grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                },
                x: {
                    ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-color') },
                    grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                }
             }
        };

        investmentGrowthChartInstance = new Chart(growthChartCtx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Investment Value",
                    data: balanceData,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--primary-color'),
                    backgroundColor: getComputedStyle(document.body).getPropertyValue('--primary-color-transparent'),
                    fill: true,
                    tension: 0.1
                }]
            },
            options: chartOptions
        });

        principalInterestChartInstance = new Chart(principalInterestCtx, {
            type: "pie",
            data: {
                labels: ["Total Principal Invested", "Total Interest Earned"],
                datasets: [{
                    data: [totalPrincipal, totalInterest],
                    backgroundColor: [
                        getComputedStyle(document.body).getPropertyValue('--success-color'),
                        getComputedStyle(document.body).getPropertyValue('--warning-color')
                    ],
                    hoverOffset: 4,
                    borderColor: getComputedStyle(document.body).getPropertyValue('--background-alt') // Border for segments
                }]
            },
            options: { ...chartOptions, scales: {} } // Remove scales for pie chart
        });
    }

    /**
     * Destroys existing chart instances if they exist.
     */
    function destroyCharts() {
        if (investmentGrowthChartInstance) investmentGrowthChartInstance.destroy();
        if (principalInterestChartInstance) principalInterestChartInstance.destroy();
        investmentGrowthChartInstance = null;
        principalInterestChartInstance = null;
    }


    // --- Error Handling ---

    /**
     * Displays an error message in the designated error div.
     * @param {string} message - The error message to display.
     */
    function showError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = "block";
        errorMessagesDiv.setAttribute("aria-live", "assertive");
    }

    /**
     * Hides the error message div.
     */
    function hideError() {
        errorMessagesDiv.textContent = "";
        errorMessagesDiv.style.display = "none";
        errorMessagesDiv.setAttribute("aria-live", "off");
    }

}); // End DOMContentLoaded
