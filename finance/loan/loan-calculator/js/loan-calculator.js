/*
 * FreecalcHub.com - Loan Calculator
 * Version: 2.0
 * Date Updated: May 26, 2025
 * Description: Remediated to align with V3.0 site-wide templates, V2 FAQ, Chart.js fixes, and commenting standards.
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References - Standardized IDs
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Input Elements
    const loanAmountEl = document.getElementById("loan_amount");
    const interestRateEl = document.getElementById("interest_rate");
    const loanTermYearsEl = document.getElementById("loan_term_years");
    const loanTermMonthsEl = document.getElementById("loan_term_months");
    // const loanTypeEl = document.getElementById("loan_type"); // Not used in current calculation logic directly
    const loanStartDateEl = document.getElementById("loan_start_date");
    const compoundingPeriodEl = document.getElementById("compounding_period");
    const paymentFrequencyEl = document.getElementById("payment_frequency");
    const extraPaymentEl = document.getElementById("extra_payment");

    // Result Display Elements (using specific IDs for clarity)
    const monthlyPaymentResultP = document.getElementById("monthly_payment_result");
    const totalPrincipalPaidResultP = document.getElementById("total_principal_paid_result");
    const totalInterestPaidResultP = document.getElementById("total_interest_paid_result");
    const totalCostOfLoanResultP = document.getElementById("total_cost_of_loan_result");
    const payoffDateResultP = document.getElementById("payoff_date_result");
    const interestSavingsResultP = document.getElementById("interest_savings_result");
    const interestSavingsContainer = document.getElementById("interest_savings_result_container"); // To show/hide
    const monthlyPaymentContainer = document.getElementById("monthly_payment_result_container"); // For multi-line content

    const amortizationTableBody = document.querySelector("#amortization-table tbody");
    const comparisonContainerEl = document.getElementById("comparison-container"); // For extra payment comparison

    // Chart.js Instances
    let paymentBreakdownChart = null;
    let loanBalanceChart = null;

    // --- Event Listeners ---
    calculateButton.addEventListener("click", () => {
        // No event.preventDefault() needed for type="button"
        hideError(); // Clear previous errors
        if (validateInputs()) {
            calculateLoan();
        }
    });

    resetButton.addEventListener("click", () => {
        // form.reset() is handled by type="reset"
        resultsSection.style.display = "none";
        comparisonContainerEl.style.display = "none";
        if(interestSavingsContainer) interestSavingsContainer.style.display = "none";
        hideError();
        if (amortizationTableBody) {
            amortizationTableBody.innerHTML = "";
        }
        if (comparisonContainerEl) {
            comparisonContainerEl.innerHTML = ""; // Clear comparison text
        }
        destroyCharts();
    });

    // --- Input Validation ---
    function validateInputs() {
        const inputsToValidate = [
            { el: loanAmountEl, name: "Loan Amount", required: true, min: 0.01 },
            { el: interestRateEl, name: "Interest Rate", required: true, min: 0, max: 100 }, // Allow 0% interest
            // Validate total term
            { el: loanTermYearsEl, name: "Loan Term (Years)", required: false, min: 0, isInt: true },
            { el: loanTermMonthsEl, name: "Loan Term (Months)", required: false, min: 0, max:11, isInt: true },
            { el: loanStartDateEl, name: "Loan Start Date", required: true },
            { el: extraPaymentEl, name: "Extra Payment", required: false, min: 0 }
        ];

        for (const input of inputsToValidate) {
            const value = input.el.value.trim();
            if (input.required && value === "") {
                showError(`Please enter a value for ${input.name}.`);
                input.el.focus();
                return false;
            }
            if (value !== "" && (input.el.type === "number" || input.name.includes("Amount") || input.name.includes("Rate") || input.name.includes("Payment"))) {
                 const number = parseFloat(value); // Use parseFloat directly for type="number"
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
                    showError(`${input.name} must be a whole number (no decimals).`);
                    input.el.focus();
                    return false;
                 }
            }
        }
        // Validate total loan term
        const years = parseFloat(loanTermYearsEl.value) || 0;
        const months = parseFloat(loanTermMonthsEl.value) || 0;
        if ((years * 12 + months) <= 0) {
            showError("Total loan term must be greater than 0 months.");
            loanTermYearsEl.focus();
            return false;
        }

        return true; // All checks passed
    }

    // --- Helper: Get Numeric Value ---
    function getNumericValue(element, defaultValue = 0) {
        const value = element.value.trim();
        if (value === "") return defaultValue;
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    // --- Main Calculation Logic ---
    function calculateLoan() {
        // Get input values using helper
        const loanAmount = getNumericValue(loanAmountEl, 0);
        const annualInterestRate = getNumericValue(interestRateEl, 0);
        const loanTermYears = getNumericValue(loanTermYearsEl, 0);
        const loanTermMonths = getNumericValue(loanTermMonthsEl, 0);
        const loanStartDateStr = loanStartDateEl.value;
        const compoundingPeriod = compoundingPeriodEl.value;
        const paymentFrequency = paymentFrequencyEl.value;
        const extraPayment = getNumericValue(extraPaymentEl, 0);

        const totalLoanTermInMonths = loanTermYears * 12 + loanTermMonths;
        const loanStartDate = new Date(loanStartDateStr + "-02T00:00:00"); // Add time to ensure local

        // Determine rates and periods per year
        let ratePerCompoundingPeriod, numCompoundingPeriodsPerYear, numPaymentsPerYear;

        numPaymentsPerYear = paymentFrequency === "weekly" ? 52 : paymentFrequency === "bi-weekly" ? 26 : 12;
        numCompoundingPeriodsPerYear = compoundingPeriod === "daily" ? 365 : 12; // Assuming monthly if not daily

        // Effective interest rate per payment period
        // Formula: Effective Rate per Payment Period = (1 + AnnualRate / NumCompoundingPeriodsPerYear)^(NumCompoundingPeriodsPerYear / NumPaymentsPerYear) - 1
        const annualRateDecimal = annualInterestRate / 100;
        let effectiveRatePerPaymentPeriod;
        if (annualRateDecimal === 0) {
            effectiveRatePerPaymentPeriod = 0;
        } else {
            effectiveRatePerPaymentPeriod = Math.pow(1 + annualRateDecimal / numCompoundingPeriodsPerYear, numCompoundingPeriodsPerYear / numPaymentsPerYear) - 1;
        }

        const totalNumberOfPaymentsScheduled = totalLoanTermInMonths * (numPaymentsPerYear / 12);

        // Standard loan payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
        // P = loanAmount, r = effectiveRatePerPaymentPeriod, n = totalNumberOfPaymentsScheduled
        let scheduledPaymentAmount;
        if (effectiveRatePerPaymentPeriod === 0) {
            scheduledPaymentAmount = loanAmount / totalNumberOfPaymentsScheduled;
        } else {
            scheduledPaymentAmount = loanAmount * (effectiveRatePerPaymentPeriod * Math.pow(1 + effectiveRatePerPaymentPeriod, totalNumberOfPaymentsScheduled)) / (Math.pow(1 + effectiveRatePerPaymentPeriod, totalNumberOfPaymentsScheduled) - 1);
        }

        if (!isFinite(scheduledPaymentAmount) || scheduledPaymentAmount < 0) { // Allow 0 payment if 0 loan
             if (loanAmount === 0) scheduledPaymentAmount = 0;
             else {
                showError("Could not calculate payment. Please check inputs, especially interest rate and term.");
                return;
             }
        }


        // Amortization calculation
        let currentBalance = loanAmount;
        let totalInterestPaid = 0;
        let actualPaymentNumber = 0;
        const amortizationSchedule = [];
        let actualPayoffDate = new Date(loanStartDate);

        // Loop until balance is paid off, respecting the original term as a max unless extra payments shorten it
        // Max iterations to prevent infinite loops in edge cases, slightly more than scheduled payments
        const maxIterations = totalNumberOfPaymentsScheduled + numPaymentsPerYear * 5;


        while (currentBalance > 0.005 && actualPaymentNumber < maxIterations) {
            actualPaymentNumber++;
            const interestForPeriod = currentBalance * effectiveRatePerPaymentPeriod;
            const totalPaymentThisPeriod = scheduledPaymentAmount + extraPayment;
            let principalPaidThisPeriod = totalPaymentThisPeriod - interestForPeriod;

            if (principalPaidThisPeriod < 0) principalPaidThisPeriod = 0; // Interest exceeds payment

            if (currentBalance - principalPaidThisPeriod < -0.005) { // Final payment adjustment
                principalPaidThisPeriod = currentBalance;
                // totalPaymentThisPeriod = currentBalance + interestForPeriod; // Actual final payment
            }
             // If payment makes balance negative, adjust payment to only cover remaining balance + interest
            if (currentBalance < totalPaymentThisPeriod - interestForPeriod) {
                principalPaidThisPeriod = currentBalance;
            }


            currentBalance -= principalPaidThisPeriod;
            totalInterestPaid += interestForPeriod;

            // Calculate payment date
            const paymentDate = new Date(loanStartDate);
            if (paymentFrequency === "monthly") {
                paymentDate.setMonth(loanStartDate.getMonth() + actualPaymentNumber -1);
            } else if (paymentFrequency === "bi-weekly") {
                paymentDate.setDate(loanStartDate.getDate() + (actualPaymentNumber - 1) * 14);
            } else if (paymentFrequency === "weekly") {
                paymentDate.setDate(loanStartDate.getDate() + (actualPaymentNumber - 1) * 7);
            }
            actualPayoffDate = paymentDate;

            amortizationSchedule.push({
                paymentNumber: actualPaymentNumber,
                paymentDate: paymentDate.toLocaleDateString(),
                paymentAmount: (principalPaidThisPeriod + interestForPeriod).toFixed(2), // Actual amount applied this period
                principalPaid: principalPaidThisPeriod.toFixed(2),
                interestPaid: interestForPeriod.toFixed(2),
                remainingBalance: currentBalance.toFixed(2)
            });

            if (currentBalance <= 0.005) {
                currentBalance = 0; // Ensure clean zero for display
                break;
            }
        }
        if (actualPaymentNumber >= maxIterations && currentBalance > 0.005) {
            showError("Calculation took too many iterations, loan might not be paying off. Check inputs (e.g. very low payment for high interest).");
            return;
        }


        const totalPrincipalActuallyPaid = loanAmount - currentBalance; // Should be loanAmount if fully paid
        const totalLoanCost = totalPrincipalActuallyPaid + totalInterestPaid;

        // --- Display results ---
        resultsSection.style.display = "flex"; // Use flex as per template.css for resultsSection
        let paymentFreqText = paymentFrequency.charAt(0).toUpperCase() + paymentFrequency.slice(1);
        let basePaymentDisplay = `Base: $${scheduledPaymentAmount.toFixed(2)} / ${paymentFreqText}`;
        if (extraPayment > 0) {
            basePaymentDisplay += `<br>With Extra: $${(scheduledPaymentAmount + extraPayment).toFixed(2)} / ${paymentFreqText}`;
        }
        monthlyPaymentResultP.innerHTML = basePaymentDisplay;
        monthlyPaymentContainer.style.display = "block";


        totalPrincipalPaidResultP.textContent = formatCurrency(totalPrincipalActuallyPaid);
        totalInterestPaidResultP.textContent = formatCurrency(totalInterestPaid);
        totalCostOfLoanResultP.textContent = formatCurrency(totalLoanCost);
        payoffDateResultP.textContent = actualPayoffDate.toLocaleDateString();

        // Calculate and display savings if extra payment is made
        if (extraPayment > 0) {
            let standardTotalInterest = 0;
            let standardBalance = loanAmount;
            let standardNumPayments = 0;
            const standardMaxIterations = totalNumberOfPaymentsScheduled + numPaymentsPerYear * 2;


            for (let i = 1; i <= standardMaxIterations; i++) {
                standardNumPayments++;
                const interest = standardBalance * effectiveRatePerPaymentPeriod;
                let principal = scheduledPaymentAmount - interest;
                if (principal < 0) principal = 0;

                if (standardBalance - principal < -0.005) { // Final payment
                    principal = standardBalance;
                }
                if (standardBalance < scheduledPaymentAmount - interest) {
                     principal = standardBalance;
                }

                standardBalance -= principal;
                standardTotalInterest += interest;
                if (standardBalance <= 0.005) {
                    standardBalance = 0;
                    break;
                }
            }
             if (standardNumPayments >= standardMaxIterations && standardBalance > 0.005) {
                interestSavingsResultP.textContent = "N/A (Standard loan does not pay off)";
             } else {
                const interestSavedVal = standardTotalInterest - totalInterestPaid;
                interestSavingsResultP.textContent = formatCurrency(interestSavedVal > 0 ? interestSavedVal : 0);
                comparisonContainerEl.innerHTML = `
                    <p><strong>Standard Loan:</strong> ${standardNumPayments} payments, Total Interest: ${formatCurrency(standardTotalInterest)}</p>
                    <p><strong>With Extra Payments:</strong> ${actualPaymentNumber} payments, Total Interest: ${formatCurrency(totalInterestPaid)}</p>
                    <p>You save ${formatCurrency(interestSavedVal > 0 ? interestSavedVal : 0)} in interest and pay off the loan ${standardNumPayments - actualPaymentNumber > 0 ? standardNumPayments - actualPaymentNumber : 0} payments sooner.</p>
                `;
                comparisonContainerEl.style.display = "block";
            }
            interestSavingsContainer.style.display = "block";

        } else {
            interestSavingsContainer.style.display = "none";
            comparisonContainerEl.style.display = "none";
            comparisonContainerEl.innerHTML = "";
        }


        // Populate amortization table
        amortizationTableBody.innerHTML = ""; // Clear previous results
        amortizationSchedule.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.paymentNumber}</td>
                <td>${row.paymentDate}</td>
                <td>${formatCurrency(parseFloat(row.paymentAmount))}</td>
                <td>${formatCurrency(parseFloat(row.principalPaid))}</td>
                <td>${formatCurrency(parseFloat(row.interestPaid))}</td>
                <td>${formatCurrency(parseFloat(row.remainingBalance))}</td>
            `;
            amortizationTableBody.appendChild(tr);
        });

        // --- Update or Create Charts ---
        updateOrCreateCharts(amortizationSchedule, loanAmount);

        resultsSection.scrollIntoView({ behavior: "smooth" });
    }

    // --- Charting Functions ---
    function updateOrCreateCharts(amortizationData, initialLoanAmount) {
        const paymentBreakdownCtx = document.getElementById('payment-breakdown-chart').getContext('2d');
        const loanBalanceCtx = document.getElementById('loan-balance-chart').getContext('2d');

        // Chart colors and base options
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || '#000';
        const borderColor = getComputedStyle(document.body).getPropertyValue('--border-color') || '#ccc';
        const primaryChartColor = getComputedStyle(document.body).getPropertyValue('--chart-color1') || 'rgb(54, 162, 235)'; // Example
        const secondaryChartColor = getComputedStyle(document.body).getPropertyValue('--chart-color2') || 'rgb(255, 99, 132)'; // Example
        const tertiaryChartColor = getComputedStyle(document.body).getPropertyValue('--chart-color3') || 'rgb(75, 192, 192)'; // Example
        const altBg = getComputedStyle(document.body).getPropertyValue('--background-alt') || '#f8f9fa';


        const baseChartOptions = {
            responsive: true,
            maintainAspectRatio: false, // Important for fixed height containers
            animation: { duration: 500 },
            plugins: {
                legend: { labels: { color: textColor } },
                tooltip: { callbacks: { label: context => `${context.label || ''}: ${formatCurrency(context.parsed.y || context.parsed)}` } }
            }
        };

        // Payment Breakdown Chart (Pie Chart for the first payment)
        const firstPaymentPrincipal = amortizationData.length > 0 ? parseFloat(amortizationData[0].principalPaid) : 0;
        const firstPaymentInterest = amortizationData.length > 0 ? parseFloat(amortizationData[0].interestPaid) : 0;

        if (paymentBreakdownChart) {
            paymentBreakdownChart.data.datasets[0].data = [firstPaymentPrincipal, firstPaymentInterest];
            paymentBreakdownChart.update();
        } else {
            paymentBreakdownChart = new Chart(paymentBreakdownCtx, {
                type: 'pie',
                data: {
                    labels: ['Principal', 'Interest'],
                    datasets: [{
                        label: 'First Payment Breakdown',
                        data: [firstPaymentPrincipal, firstPaymentInterest],
                        backgroundColor: [primaryChartColor, secondaryChartColor],
                        borderColor: altBg,
                        hoverOffset: 4
                    }]
                },
                options: { ...baseChartOptions, scales: {} } // No scales for pie
            });
        }

        // Loan Balance Over Time Chart (Line Chart)
        const balanceHistory = [initialLoanAmount, ...amortizationData.map(row => parseFloat(row.remainingBalance))];
        const chartLabels = ['Start', ...amortizationData.map(row => `Pmt ${row.paymentNumber}`)];

        if (loanBalanceChart) {
            loanBalanceChart.data.labels = chartLabels.slice(0, balanceHistory.length);
            loanBalanceChart.data.datasets[0].data = balanceHistory;
            loanBalanceChart.update();
        } else {
            loanBalanceChart = new Chart(loanBalanceCtx, {
                type: 'line',
                data: {
                    labels: chartLabels.slice(0, balanceHistory.length),
                    datasets: [{
                        label: 'Loan Balance',
                        data: balanceHistory,
                        borderColor: tertiaryChartColor,
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    ...baseChartOptions,
                    scales: {
                        y: { beginAtZero: true, ticks: { callback: value => formatCurrency(value), color: textColor }, grid: { color: borderColor } },
                        x: { ticks: { color: textColor }, grid: { display: false } }
                    }
                }
            });
        }
    }

    function destroyCharts() {
        if (paymentBreakdownChart) paymentBreakdownChart.destroy();
        if (loanBalanceChart) loanBalanceChart.destroy();
        paymentBreakdownChart = null;
        loanBalanceChart = null;
    }

    // --- Error Handling & Formatting ---
    function showError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = "block";
        errorMessagesDiv.setAttribute("aria-live", "assertive");
        resultsSection.style.display = "none"; // Hide results if error
    }

    function hideError() {
        errorMessagesDiv.textContent = "";
        errorMessagesDiv.style.display = "none";
        errorMessagesDiv.setAttribute("aria-live", "off");
    }

    function formatCurrency(value) {
        if (isNaN(parseFloat(value))) return "$0.00"; // Handle potential NaN
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
});
