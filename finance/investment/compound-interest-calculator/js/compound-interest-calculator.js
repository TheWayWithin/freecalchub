/*
 * FreecalcHub.com - Compound Interest Calculator
 * Version: 2.2
 * Date Updated: May 25, 2025
 * Description: Added setTimeout delay before chart creation & disabled animations to fix potential redraw loop.
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

    // Chart.js Instances
    let investmentGrowthChartInstance = null;
    let principalInterestChartInstance = null;

    // --- Event Listeners ---
    calculateButton.addEventListener("click", (event) => {
        event.preventDefault();
        hideError();
        if (validateInputs()) {
            calculateAndDisplay();
        }
    });

    resetButton.addEventListener("click", () => {
        form.reset();
        resultsSection.style.display = "none";
        hideError();
        if (yearlyGrowthTableBodyEl) {
             yearlyGrowthTableBodyEl.innerHTML = "";
        }
        destroyCharts();
    });

    // --- Input Validation ---
    function validateInputs() {
        const inputsToValidate = [
            { el: initialInvestmentEl, name: "Initial Investment", required: true, min: 0 },
            { el: annualContributionEl, name: "Annual Contribution", required: false, min: 0 },
            { el: annualInterestRateEl, name: "Annual Interest Rate", required: true, min: 0, max: 200 },
            { el: investmentPeriodYearsEl, name: "Investment Time", required: true, min: 1, isInt: true },
            { el: inflationRateEl, name: "Inflation Rate", required: false, min: 0, max: 100 },
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
        return true;
    }

    function getNumericValue(element) {
        const value = element.value.trim();
        return value === "" ? 0 : parseFloat(value);
    }

    // --- Calculation Logic ---
    function calculateAndDisplay() {
        try {
            const initialInvestment = getNumericValue(initialInvestmentEl);
            const annualContribution = getNumericValue(annualContributionEl);
            const compoundingFrequencyStr = compoundingFrequencyEl.value;
            const annualInterestRate = getNumericValue(annualInterestRateEl);
            const investmentPeriodYears = getNumericValue(investmentPeriodYearsEl);
            const inflationRate = getNumericValue(inflationRateEl);
            const taxRate = getNumericValue(taxRateEl);

            const compoundingFrequencyMap = { daily: 365, monthly: 12, quarterly: 4, annually: 1 };
            const n = compoundingFrequencyMap[compoundingFrequencyStr];
            const r = annualInterestRate / 100;
            const i = r / n;
            const annualContrib = annualContribution;

            let currentBalance = initialInvestment;
            let totalPrincipal = initialInvestment;
            const yearlyData = [];

            for (let year = 1; year <= investmentPeriodYears; year++) {
                let yearStartBalance = currentBalance;
                let yearInterest = 0;
                let yearContributions = 0;
                let balanceAtPeriodStart = currentBalance;

                for (let period = 1; period <= n; period++) {
                    let interestForPeriod = balanceAtPeriodStart * i;
                    currentBalance = balanceAtPeriodStart + interestForPeriod;
                    yearInterest += interestForPeriod;

                    if (annualContrib > 0) {
                        const contributionThisPeriod = annualContrib / n;
                        currentBalance += contributionThisPeriod;
                        yearContributions += contributionThisPeriod;
                    }
                    balanceAtPeriodStart = currentBalance;
                }

                yearlyData.push({
                    year: year,
                    startingBalance: yearStartBalance,
                    contributions: yearContributions,
                    interestEarned: yearInterest,
                    endingBalance: currentBalance
                });
                totalPrincipal += yearContributions;
            }

            const futureValueNominal = currentBalance;
            const totalInterest = futureValueNominal - totalPrincipal;
            const effectiveAnnualRate = (Math.pow(1 + r / n, n) - 1) * 100;

            futureValueNominalEl.textContent = formatCurrency(futureValueNominal);
            totalPrincipalInvestedEl.textContent = formatCurrency(totalPrincipal);
            totalInterestEarnedEl.textContent = formatCurrency(totalInterest);
            effectiveAnnualRateEl.textContent = effectiveAnnualRate.toFixed(2) + "%";

            if (inflationRate > 0) {
                const futureValueInflationAdjusted = futureValueNominal / Math.pow(1 + inflationRate / 100, investmentPeriodYears);
                futureValueInflationAdjustedEl.textContent = formatCurrency(futureValueInflationAdjusted);
                futureValueInflationAdjustedContainerEl.style.display = "block";
            } else {
                futureValueInflationAdjustedContainerEl.style.display = "none";
            }

            if (taxRate > 0) {
                const taxableGain = totalInterest;
                const taxAmount = taxableGain * (taxRate / 100);
                const afterTaxFutureValue = futureValueNominal - taxAmount;
                afterTaxFutureValueEl.textContent = formatCurrency(afterTaxFutureValue);
                afterTaxFutureValueContainerEl.style.display = "block";
            } else {
                afterTaxFutureValueContainerEl.style.display = "none";
            }

            resultsSection.style.display = "flex";
            populateYearlyTable(yearlyData);

            // *** FIX: Delay chart creation slightly and disable animations ***
            setTimeout(() => {
                createOrUpdateCharts(yearlyData, totalPrincipal, totalInterest, initialInvestment, false); // Pass 'false' for animation
                resultsSection.scrollIntoView({ behavior: "smooth" });
            }, 50); // 50ms delay

        } catch (error) {
            console.error("Calculation Error:", error);
            showError("An error occurred during calculation. Please check your inputs.");
            resultsSection.style.display = "none";
        }
    }

    // --- Display & Formatting ---
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    function populateYearlyTable(data) {
        yearlyGrowthTableBodyEl.innerHTML = "";
        data.forEach(item => {
            const row = yearlyGrowthTableBodyEl.insertRow();
            row.insertCell().textContent = item.year;
            row.insertCell().textContent = formatCurrency(item.startingBalance);
            row.insertCell().textContent = formatCurrency(item.contributions);
            row.insertCell().textContent = formatCurrency(item.interestEarned);
            row.insertCell().textContent = formatCurrency(item.endingBalance);
        });
    }

    function createOrUpdateCharts(yearlyData, totalPrincipal, totalInterest, initialInvestment, animate = true) { // Added animate flag
        destroyCharts();

        const growthChartCtx = document.getElementById("investmentGrowthChart").getContext("2d");
        const principalInterestCtx = document.getElementById("principalInterestChart").getContext("2d");

        const labels = ["Start", ...yearlyData.map(d => `Year ${d.year}`)];
        const balanceData = [initialInvestment, ...yearlyData.map(d => d.endingBalance)];

        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || '#000';
        const borderColor = getComputedStyle(document.body).getPropertyValue('--border-color') || '#ccc';
        const primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color') || '#007bff';
        const primaryTransparent = getComputedStyle(document.body).getPropertyValue('--primary-color-transparent') || 'rgba(0, 123, 255, 0.1)';
        const successColor = getComputedStyle(document.body).getPropertyValue('--success-color') || '#28a745';
        const warningColor = getComputedStyle(document.body).getPropertyValue('--warning-color') || '#ffc107';
        const altBg = getComputedStyle(document.body).getPropertyValue('--background-alt') || '#f8f9fa';

        const chartOptions = {
             responsive: true,
             maintainAspectRatio: false,
             animation: animate ? { duration: 500 } : false, // *** FIX: Control animation ***
             plugins: {
                legend: { labels: { color: textColor } },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${formatCurrency(context.parsed.y || context.parsed)}`
                    }
                }
             },
             scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: value => formatCurrency(value), color: textColor },
                    grid: { color: borderColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { display: false }
                }
             }
        };

        investmentGrowthChartInstance = new Chart(growthChartCtx, {
            type: "line",
            data: { labels: labels, datasets: [{ label: "Investment Value", data: balanceData, borderColor: primaryColor, backgroundColor: primaryTransparent, fill: true, tension: 0.1 }] },
            options: chartOptions
        });

        principalInterestChartInstance = new Chart(principalInterestCtx, {
            type: "pie",
            data: { labels: ["Total Principal", "Total Interest"], datasets: [{ data: [totalPrincipal, totalInterest], backgroundColor: [ successColor, warningColor ], hoverOffset: 4, borderColor: altBg }] },
            options: { ...chartOptions, scales: {} }
        });
    }

    function destroyCharts() {
        if (investmentGrowthChartInstance) investmentGrowthChartInstance.destroy();
        if (principalInterestChartInstance) principalInterestChartInstance.destroy();
        investmentGrowthChartInstance = null;
        principalInterestChartInstance = null;
    }

    // --- Error Handling ---
    function showError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = "block";
        errorMessagesDiv.setAttribute("aria-live", "assertive");
    }

    function hideError() {
        errorMessagesDiv.textContent = "";
        errorMessagesDiv.style.display = "none";
        errorMessagesDiv.setAttribute("aria-live", "off");
    }
});
