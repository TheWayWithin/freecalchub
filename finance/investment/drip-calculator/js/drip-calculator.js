/*
 * FreecalcHub.com - DRIP Calculator (Dividend Reinvestment Plan)
 * Version: 1.0
 * Date: August 9, 2025
 * Description: Model dividend reinvestment strategies and compare scenarios
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Input Elements
    const initialInvestmentEl = document.getElementById("initialInvestment");
    const sharePriceEl = document.getElementById("sharePrice");
    const annualDividendEl = document.getElementById("annualDividend");
    const dividendGrowthRateEl = document.getElementById("dividendGrowthRate");
    const stockPriceGrowthEl = document.getElementById("stockPriceGrowth");
    const timeHorizonEl = document.getElementById("timeHorizon");
    const dividendFrequencyEl = document.getElementById("dividendFrequency");
    const additionalContributionEl = document.getElementById("additionalContribution");

    // Tab Elements
    const tabButtons = document.querySelectorAll(".tab-button");
    const scenarioContents = document.querySelectorAll(".scenario-content");

    // Result Display Elements - DRIP Scenario
    const dripTotalValueEl = document.getElementById("dripTotalValue");
    const dripTotalSharesEl = document.getElementById("dripTotalShares");
    const dripAnnualDividendEl = document.getElementById("dripAnnualDividend");
    const dripTotalReturnEl = document.getElementById("dripTotalReturn");

    // Result Display Elements - Cash Scenario
    const cashStockValueEl = document.getElementById("cashStockValue");
    const cashDividendTotalEl = document.getElementById("cashDividendTotal");
    const cashTotalValueEl = document.getElementById("cashTotalValue");
    const cashTotalReturnEl = document.getElementById("cashTotalReturn");

    // Comparison Elements
    const comparisonAdvantageEl = document.getElementById("comparisonAdvantage");
    const additionalWealthEl = document.getElementById("additionalWealth");
    const dripCAGREl = document.getElementById("dripCAGR");
    const chartContainerEl = document.getElementById("chartContainer");

    // Chart Instance
    let dripChartInstance = null;

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
        setActiveTab("drip");
    });

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const scenario = button.getAttribute("data-scenario");
            setActiveTab(scenario);
        });
    });

    // Real-time yield calculation
    [sharePriceEl, annualDividendEl].forEach(el => {
        el.addEventListener("input", updateYieldDisplay);
    });

    // --- Input Validation ---
    function validateInputs() {
        const inputsToValidate = [
            { el: initialInvestmentEl, name: "Initial Investment", required: true, min: 1 },
            { el: sharePriceEl, name: "Share Price", required: true, min: 0.01 },
            { el: annualDividendEl, name: "Annual Dividend", required: true, min: 0 },
            { el: timeHorizonEl, name: "Time Horizon", required: true, min: 1, max: 50, isInt: true },
            { el: dividendGrowthRateEl, name: "Dividend Growth Rate", required: false, min: 0, max: 20 },
            { el: stockPriceGrowthEl, name: "Stock Price Growth", required: false, min: 0, max: 30 },
            { el: additionalContributionEl, name: "Additional Contribution", required: false, min: 0 }
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

        // Validate dividend yield is reasonable
        const sharePrice = parseFloat(sharePriceEl.value);
        const annualDividend = parseFloat(annualDividendEl.value);
        const dividendYield = (annualDividend / sharePrice) * 100;
        
        if (dividendYield > 15) {
            showError("Dividend yield appears unusually high (>15%). Please verify your inputs.");
            return false;
        }

        return true;
    }

    // --- Main Calculation Function ---
    function calculateAndDisplay() {
        // Get input values
        const initialInvestment = parseFloat(initialInvestmentEl.value);
        const sharePrice = parseFloat(sharePriceEl.value);
        const annualDividend = parseFloat(annualDividendEl.value);
        const dividendGrowthRate = parseFloat(dividendGrowthRateEl.value) / 100 || 0;
        const stockPriceGrowth = parseFloat(stockPriceGrowthEl.value) / 100 || 0;
        const timeHorizon = parseInt(timeHorizonEl.value);
        const dividendFrequency = parseInt(dividendFrequencyEl.value);
        const additionalContribution = parseFloat(additionalContributionEl.value) || 0;

        // Calculate initial shares
        const initialShares = initialInvestment / sharePrice;
        
        // Calculate both scenarios
        const dripResults = calculateDRIPScenario({
            initialShares,
            sharePrice,
            annualDividend,
            dividendGrowthRate,
            stockPriceGrowth,
            timeHorizon,
            dividendFrequency,
            additionalContribution
        });

        const cashResults = calculateCashScenario({
            initialShares,
            sharePrice,
            annualDividend,
            dividendGrowthRate,
            stockPriceGrowth,
            timeHorizon,
            dividendFrequency,
            additionalContribution
        });

        // Display results
        displayResults(dripResults, cashResults, timeHorizon);
    }

    // --- DRIP Scenario Calculation ---
    function calculateDRIPScenario(params) {
        let shares = params.initialShares;
        let currentDividend = params.annualDividend;
        let currentSharePrice = params.sharePrice;
        let totalDividendsReinvested = 0;
        
        const yearlyData = [];
        
        for (let year = 1; year <= params.timeHorizon; year++) {
            // Calculate dividends for the year
            const annualDividendIncome = shares * currentDividend;
            
            // Add additional contributions (monthly to annual)
            const yearlyContribution = params.additionalContribution * 12;
            const contributionShares = yearlyContribution / currentSharePrice;
            shares += contributionShares;
            
            // Reinvest dividends
            const dividendsPerPayment = annualDividendIncome / params.dividendFrequency;
            for (let payment = 1; payment <= params.dividendFrequency; payment++) {
                const newShares = dividendsPerPayment / currentSharePrice;
                shares += newShares;
                totalDividendsReinvested += dividendsPerPayment;
            }
            
            // Grow dividend and share price for next year
            currentDividend *= (1 + params.dividendGrowthRate);
            currentSharePrice *= (1 + params.stockPriceGrowth);
            
            // Store yearly data
            yearlyData.push({
                year,
                shares,
                sharePrice: currentSharePrice,
                portfolioValue: shares * currentSharePrice,
                annualDividend: shares * currentDividend
            });
        }

        const finalPortfolioValue = shares * currentSharePrice;
        const finalAnnualDividend = shares * currentDividend;
        const totalInvested = params.initialShares * params.sharePrice + (params.additionalContribution * 12 * params.timeHorizon);
        const totalReturn = ((finalPortfolioValue - totalInvested) / totalInvested) * 100;

        return {
            totalValue: finalPortfolioValue,
            totalShares: shares,
            annualDividend: finalAnnualDividend,
            totalReturn,
            totalInvested,
            dividendsReinvested: totalDividendsReinvested,
            yearlyData
        };
    }

    // --- Cash Scenario Calculation ---
    function calculateCashScenario(params) {
        let shares = params.initialShares;
        let currentDividend = params.annualDividend;
        let currentSharePrice = params.sharePrice;
        let totalCashDividends = 0;
        
        const yearlyData = [];
        
        for (let year = 1; year <= params.timeHorizon; year++) {
            // Calculate dividends for the year (taken as cash)
            const annualDividendIncome = shares * currentDividend;
            totalCashDividends += annualDividendIncome;
            
            // Add additional contributions (buy more shares)
            const yearlyContribution = params.additionalContribution * 12;
            const contributionShares = yearlyContribution / currentSharePrice;
            shares += contributionShares;
            
            // Grow dividend and share price for next year
            currentDividend *= (1 + params.dividendGrowthRate);
            currentSharePrice *= (1 + params.stockPriceGrowth);
            
            // Store yearly data
            yearlyData.push({
                year,
                shares,
                sharePrice: currentSharePrice,
                portfolioValue: shares * currentSharePrice,
                cashDividends: totalCashDividends
            });
        }

        const stockPortfolioValue = shares * currentSharePrice;
        const totalPortfolioValue = stockPortfolioValue + totalCashDividends;
        const totalInvested = params.initialShares * params.sharePrice + (params.additionalContribution * 12 * params.timeHorizon);
        const totalReturn = ((totalPortfolioValue - totalInvested) / totalInvested) * 100;

        return {
            stockValue: stockPortfolioValue,
            cashDividends: totalCashDividends,
            totalValue: totalPortfolioValue,
            totalReturn,
            totalInvested,
            shares,
            yearlyData
        };
    }

    // --- Display Results ---
    function displayResults(dripResults, cashResults, timeHorizon) {
        // DRIP Scenario Results
        dripTotalValueEl.textContent = formatCurrency(dripResults.totalValue);
        dripTotalSharesEl.textContent = dripResults.totalShares.toFixed(2);
        dripAnnualDividendEl.textContent = formatCurrency(dripResults.annualDividend);
        dripTotalReturnEl.textContent = formatPercentage(dripResults.totalReturn / 100);

        // Cash Scenario Results
        cashStockValueEl.textContent = formatCurrency(cashResults.stockValue);
        cashDividendTotalEl.textContent = formatCurrency(cashResults.cashDividends);
        cashTotalValueEl.textContent = formatCurrency(cashResults.totalValue);
        cashTotalReturnEl.textContent = formatPercentage(cashResults.totalReturn / 100);

        // Comparison Results
        const dripAdvantage = dripResults.totalValue - cashResults.totalValue;
        const dripAdvantagePercentage = (dripAdvantage / cashResults.totalValue) * 100;
        const dripCAGR = Math.pow(dripResults.totalValue / dripResults.totalInvested, 1/timeHorizon) - 1;

        comparisonAdvantageEl.textContent = formatPercentage(dripAdvantagePercentage / 100);
        additionalWealthEl.textContent = formatCurrency(dripAdvantage);
        dripCAGREl.textContent = formatPercentage(dripCAGR);

        // Create chart
        createDRIPChart(dripResults.yearlyData, cashResults.yearlyData);

        // Show results
        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // --- Tab Management ---
    function setActiveTab(scenario) {
        // Update tab buttons
        tabButtons.forEach(button => {
            if (button.getAttribute("data-scenario") === scenario) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });

        // Update scenario content
        scenarioContents.forEach(content => {
            if (content.id === scenario + "Scenario") {
                content.style.display = "block";
            } else {
                content.style.display = "none";
            }
        });
    }

    // --- Chart Creation ---
    function createDRIPChart(dripData, cashData) {
        const ctx = document.getElementById("dripChart");
        if (!ctx) return;

        destroyChart();

        const years = dripData.map(d => `Year ${d.year}`);
        const dripValues = dripData.map(d => d.portfolioValue);
        const cashTotalValues = cashData.map((d, i) => d.portfolioValue + d.cashDividends);

        const config = {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'DRIP Portfolio Value',
                        data: dripValues,
                        backgroundColor: 'rgba(0, 184, 148, 0.1)',
                        borderColor: '#00b894',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Cash Dividend Portfolio Value',
                        data: cashTotalValues,
                        backgroundColor: 'rgba(116, 185, 255, 0.1)',
                        borderColor: '#74b9ff',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
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
                        text: 'DRIP vs Cash Dividend Wealth Accumulation'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        if (typeof Chart !== 'undefined') {
            dripChartInstance = new Chart(ctx, config);
            chartContainerEl.style.display = "block";
        }
    }

    // --- Yield Display Update ---
    function updateYieldDisplay() {
        const sharePrice = parseFloat(sharePriceEl.value);
        const annualDividend = parseFloat(annualDividendEl.value);
        
        if (sharePrice && annualDividend && sharePrice > 0) {
            const dividendYield = (annualDividend / sharePrice) * 100;
            
            // Create or update yield display
            let yieldDisplay = document.querySelector(".yield-display");
            if (!yieldDisplay) {
                yieldDisplay = document.createElement("div");
                yieldDisplay.className = "yield-display";
                annualDividendEl.parentElement.appendChild(yieldDisplay);
            }
            
            yieldDisplay.innerHTML = `
                <div class="yield-value">${dividendYield.toFixed(2)}%</div>
                <div class="yield-label">Current Dividend Yield</div>
            `;
        }
    }

    // --- Utility Functions ---
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatPercentage(value) {
        return `${(value * 100).toFixed(2)}%`;
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
        if (dripChartInstance) {
            dripChartInstance.destroy();
            dripChartInstance = null;
        }
        chartContainerEl.style.display = "none";
    }

    // --- Initialize ---
    setActiveTab("drip");
    updateYieldDisplay();

    // Load Chart.js if not already loaded
    if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            console.log('Chart.js loaded successfully');
        };
        document.head.appendChild(script);
    }
});