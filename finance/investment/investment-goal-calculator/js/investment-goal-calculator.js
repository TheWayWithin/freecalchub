/*
 * FreecalcHub.com - Investment Goal Calculator
 * Version: 1.0
 * Date: August 9, 2025
 * Description: Calculate required contributions to reach investment goals
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Input Elements
    const targetAmountEl = document.getElementById("targetAmount");
    const timeHorizonEl = document.getElementById("timeHorizon");
    const expectedReturnEl = document.getElementById("expectedReturn");
    const initialInvestmentEl = document.getElementById("initialInvestment");
    const contributionFrequencyEl = document.getElementById("contributionFrequency");
    const inflationRateEl = document.getElementById("inflationRate");
    const taxRateEl = document.getElementById("taxRate");

    // Result Display Elements
    const requiredContributionEl = document.getElementById("requiredContribution");
    const totalContributionsEl = document.getElementById("totalContributions");
    const investmentGrowthEl = document.getElementById("investmentGrowth");
    const finalAmountEl = document.getElementById("finalAmount");
    const inflationAdjustedContainerEl = document.getElementById("inflationAdjustedContainer");
    const inflationAdjustedTargetEl = document.getElementById("inflationAdjustedTarget");
    const afterTaxContainerEl = document.getElementById("afterTaxContainer");
    const afterTaxAmountEl = document.getElementById("afterTaxAmount");
    const chartContainerEl = document.getElementById("chartContainer");

    // Chart Instance
    let goalChartInstance = null;

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
        destroyChart();
        hideOptionalResults();
    });

    // --- Input Validation ---
    function validateInputs() {
        const inputsToValidate = [
            { el: targetAmountEl, name: "Target Goal Amount", required: true, min: 1 },
            { el: timeHorizonEl, name: "Time Horizon", required: true, min: 1, max: 50, isInt: true },
            { el: expectedReturnEl, name: "Expected Annual Return", required: true, min: 0, max: 50 },
            { el: initialInvestmentEl, name: "Initial Investment", required: false, min: 0 },
            { el: inflationRateEl, name: "Inflation Rate", required: false, min: 0, max: 20 },
            { el: taxRateEl, name: "Tax Rate", required: false, min: 0, max: 50 }
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
                    showError(`${input.name} cannot be more than ${input.max}%.`);
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

    // --- Main Calculation Function ---
    function calculateAndDisplay() {
        // Get input values
        const targetAmount = parseFloat(targetAmountEl.value);
        const timeHorizon = parseInt(timeHorizonEl.value);
        const expectedReturn = parseFloat(expectedReturnEl.value) / 100;
        const initialInvestment = parseFloat(initialInvestmentEl.value) || 0;
        const contributionFrequency = parseInt(contributionFrequencyEl.value);
        const inflationRate = parseFloat(inflationRateEl.value) / 100 || 0;
        const taxRate = parseFloat(taxRateEl.value) / 100 || 0;

        // Calculate future value of initial investment
        const futureValueInitial = initialInvestment * Math.pow(1 + expectedReturn, timeHorizon);
        
        // Calculate required additional amount through contributions
        const additionalNeeded = targetAmount - futureValueInitial;
        
        if (additionalNeeded <= 0) {
            // Initial investment is already sufficient
            displayResults({
                requiredContribution: 0,
                totalContributions: 0,
                investmentGrowth: targetAmount - initialInvestment,
                finalAmount: targetAmount,
                contributionFrequency: contributionFrequency,
                inflationRate: inflationRate,
                taxRate: taxRate,
                targetAmount: targetAmount,
                timeHorizon: timeHorizon,
                initialInvestment: initialInvestment
            });
        } else {
            // Calculate required periodic payment using PMT formula
            const periodicRate = expectedReturn / contributionFrequency;
            const totalPayments = timeHorizon * contributionFrequency;
            
            let requiredPayment;
            if (periodicRate === 0) {
                // Simple case when no return
                requiredPayment = additionalNeeded / totalPayments;
            } else {
                // Annuity formula for future value
                requiredPayment = additionalNeeded / (((Math.pow(1 + periodicRate, totalPayments) - 1) / periodicRate));
            }

            const totalContributions = requiredPayment * totalPayments;
            const investmentGrowth = targetAmount - initialInvestment - totalContributions;

            displayResults({
                requiredContribution: requiredPayment,
                totalContributions: totalContributions,
                investmentGrowth: investmentGrowth,
                finalAmount: targetAmount,
                contributionFrequency: contributionFrequency,
                inflationRate: inflationRate,
                taxRate: taxRate,
                targetAmount: targetAmount,
                timeHorizon: timeHorizon,
                initialInvestment: initialInvestment
            });
        }
    }

    // --- Display Results ---
    function displayResults(results) {
        // Determine contribution frequency text
        const frequencyText = {
            12: "Monthly",
            4: "Quarterly", 
            1: "Annual"
        };

        // Display main results
        requiredContributionEl.textContent = formatCurrency(results.requiredContribution);
        totalContributionsEl.textContent = formatCurrency(results.totalContributions + results.initialInvestment);
        investmentGrowthEl.textContent = formatCurrency(results.investmentGrowth);
        finalAmountEl.textContent = formatCurrency(results.finalAmount);

        // Update contribution label to show frequency
        const contributionLabel = document.querySelector('h4:has(+ #requiredContribution)') || 
                                document.querySelector('.result-item h4');
        if (contributionLabel && contributionLabel.textContent.includes('Required')) {
            contributionLabel.textContent = `Required ${frequencyText[results.contributionFrequency]} Contribution`;
        }

        // Handle optional results
        if (results.inflationRate > 0) {
            const inflationAdjustedTarget = results.targetAmount * Math.pow(1 + results.inflationRate, results.timeHorizon);
            inflationAdjustedTargetEl.textContent = formatCurrency(inflationAdjustedTarget);
            inflationAdjustedContainerEl.style.display = "block";
        }

        if (results.taxRate > 0) {
            const afterTaxAmount = results.finalAmount * (1 - results.taxRate);
            afterTaxAmountEl.textContent = formatCurrency(afterTaxAmount);
            afterTaxContainerEl.style.display = "block";
        }

        // Create visualization
        createGoalChart(results);

        // Show results section
        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // --- Chart Creation ---
    function createGoalChart(results) {
        const ctx = document.getElementById("goalChart");
        if (!ctx) return;

        destroyChart();

        // Calculate yearly breakdown
        const years = [];
        const contributionsData = [];
        const growthData = [];
        const totalData = [];

        let cumulativeContributions = results.initialInvestment;
        let cumulativeBalance = results.initialInvestment;

        for (let year = 0; year <= results.timeHorizon; year++) {
            years.push(year);
            
            if (year === 0) {
                contributionsData.push(results.initialInvestment);
                growthData.push(0);
                totalData.push(results.initialInvestment);
            } else {
                cumulativeContributions += results.requiredContribution * results.contributionFrequency;
                cumulativeBalance = cumulativeContributions + (cumulativeBalance * (parseFloat(expectedReturnEl.value) / 100));
                
                contributionsData.push(cumulativeContributions);
                growthData.push(cumulativeBalance - cumulativeContributions);
                totalData.push(cumulativeBalance);
            }
        }

        // Chart configuration
        const config = {
            type: 'line',
            data: {
                labels: years.map(y => `Year ${y}`),
                datasets: [
                    {
                        label: 'Your Contributions',
                        data: contributionsData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Investment Growth',
                        data: growthData,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Total Balance',
                        data: totalData,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 3,
                        fill: false,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Goal Achievement Progress Over Time'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                }
            }
        };

        // Check if Chart.js is available
        if (typeof Chart !== 'undefined') {
            goalChartInstance = new Chart(ctx, config);
            chartContainerEl.style.display = "block";
        } else {
            // Fallback if Chart.js is not available
            console.warn("Chart.js not available for visualization");
        }
    }

    // --- Utility Functions ---
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function showError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = "block";
        errorMessagesDiv.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function hideError() {
        errorMessagesDiv.style.display = "none";
        errorMessagesDiv.textContent = "";
    }

    function destroyChart() {
        if (goalChartInstance) {
            goalChartInstance.destroy();
            goalChartInstance = null;
        }
        chartContainerEl.style.display = "none";
    }

    function hideOptionalResults() {
        inflationAdjustedContainerEl.style.display = "none";
        afterTaxContainerEl.style.display = "none";
    }

    // --- Load Chart.js if not already loaded ---
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            console.log('Chart.js loaded successfully');
        };
        document.head.appendChild(script);
    }
});