/**
 * Small Gains Compounding Calculator
 * Shows how small, consistent gains compound over long time periods (1-30 years)
 * Supports daily (calendar/trading), weekly, and monthly compounding
 */

(function() {
    'use strict';

    // Chart instance
    let growthChart = null;

    // Currency formatter
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    // Large currency formatter (for millions/billions)
    const largeCurrencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
    });

    // Percentage formatter
    const percentFormatter = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Large percentage formatter
    const largePercentFormatter = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    // Frequency configuration
    const frequencyConfig = {
        'daily-calendar': { periodsPerYear: 365, label: 'Day', labelPlural: 'Days' },
        'daily-trading': { periodsPerYear: 252, label: 'Day', labelPlural: 'Trading Days' },
        'weekly': { periodsPerYear: 52, label: 'Week', labelPlural: 'Weeks' },
        'monthly': { periodsPerYear: 12, label: 'Month', labelPlural: 'Months' }
    };

    // Time horizons to calculate (in years)
    const timeHorizons = [1, 3, 5, 10, 20, 30];

    /**
     * Calculate compound growth for a given number of years
     * @param {number} principal - Starting balance
     * @param {number} ratePerPeriod - Rate per period (as decimal)
     * @param {number} periodsPerYear - Number of periods per year
     * @param {number} years - Number of years
     * @param {number} depositPerPeriod - Deposit per period
     * @returns {Object} Results including final balance, deposits, profit, return
     */
    function calculateForYears(principal, ratePerPeriod, periodsPerYear, years, depositPerPeriod) {
        const totalPeriods = periodsPerYear * years;

        // Calculate final balance from principal compounding
        // A_principal = P × (1 + r)^n
        const principalGrowth = principal * Math.pow(1 + ratePerPeriod, totalPeriods);

        // Calculate final balance from deposits (ordinary annuity - end of period)
        // A_deposits = C × ((1 + r)^n - 1) / r
        let depositGrowth = 0;
        if (depositPerPeriod > 0 && ratePerPeriod > 0) {
            depositGrowth = depositPerPeriod * ((Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod);
        } else if (depositPerPeriod > 0 && ratePerPeriod === 0) {
            depositGrowth = depositPerPeriod * totalPeriods;
        }

        const finalBalance = principalGrowth + depositGrowth;
        const totalDeposited = principal + (depositPerPeriod * totalPeriods);
        const totalProfit = finalBalance - totalDeposited;
        const totalReturn = totalDeposited > 0 ? (finalBalance - totalDeposited) / totalDeposited : 0;

        return {
            years: years,
            finalBalance: finalBalance,
            totalDeposited: totalDeposited,
            totalProfit: totalProfit,
            totalReturn: totalReturn,
            totalPeriods: totalPeriods
        };
    }

    /**
     * Calculate Effective Annual Return (EAR)
     * @param {number} ratePerPeriod - Rate per period (as decimal)
     * @param {number} periodsPerYear - Number of periods per year
     * @returns {number} EAR as decimal
     */
    function calculateEAR(ratePerPeriod, periodsPerYear) {
        return Math.pow(1 + ratePerPeriod, periodsPerYear) - 1;
    }

    /**
     * Format currency intelligently based on size
     * @param {number} value - Value to format
     * @returns {string} Formatted currency string
     */
    function formatCurrency(value) {
        if (Math.abs(value) >= 1e12) {
            return largeCurrencyFormatter.format(value);
        } else if (Math.abs(value) >= 1e9) {
            return largeCurrencyFormatter.format(value);
        } else if (Math.abs(value) >= 1e6) {
            return largeCurrencyFormatter.format(value);
        }
        return currencyFormatter.format(value);
    }

    /**
     * Format percentage intelligently based on size
     * @param {number} value - Value to format (as decimal)
     * @returns {string} Formatted percentage string
     */
    function formatPercent(value) {
        if (Math.abs(value) >= 10) {
            return largePercentFormatter.format(value);
        }
        return percentFormatter.format(value);
    }

    /**
     * Update period labels based on frequency selection
     * @param {string} frequency - Selected frequency
     */
    function updatePeriodLabels(frequency) {
        const config = frequencyConfig[frequency] || frequencyConfig['daily-calendar'];
        document.getElementById('periodLabel').textContent = config.label;
        document.getElementById('depositPeriodLabel').textContent = config.label;
    }

    /**
     * Populate the multi-year comparison table
     * @param {Array} results - Array of calculation results for each time horizon
     */
    function renderComparisonTable(results) {
        const tbody = document.getElementById('comparisonTableBody');
        tbody.innerHTML = '';

        results.forEach((result) => {
            const tr = document.createElement('tr');

            // Highlight 10-year and 30-year rows
            if (result.years === 10 || result.years === 30) {
                tr.className = 'highlight-row';
            }

            const yearLabel = result.years === 1 ? '1 Year' : `${result.years} Years`;

            tr.innerHTML = `
                <td>${yearLabel}</td>
                <td>${formatCurrency(result.finalBalance)}</td>
                <td>${formatCurrency(result.totalDeposited)}</td>
                <td class="profit-positive">${formatCurrency(result.totalProfit)}</td>
                <td class="return-value">${formatPercent(result.totalReturn)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Generate yearly data points for the chart (30 years)
     * @param {number} principal - Starting balance
     * @param {number} ratePerPeriod - Rate per period (as decimal)
     * @param {number} periodsPerYear - Number of periods per year
     * @param {number} depositPerPeriod - Deposit per period
     * @returns {Array} Array of {year, balance} objects
     */
    function generateChartData(principal, ratePerPeriod, periodsPerYear, depositPerPeriod) {
        const data = [];

        // Add starting point (year 0)
        data.push({ year: 0, balance: principal });

        // Generate data for years 1-30
        for (let year = 1; year <= 30; year++) {
            const result = calculateForYears(principal, ratePerPeriod, periodsPerYear, year, depositPerPeriod);
            data.push({ year: year, balance: result.finalBalance });
        }

        return data;
    }

    /**
     * Render the growth chart
     * @param {Array} chartData - Array of {year, balance} objects
     */
    function renderChart(chartData) {
        const ctx = document.getElementById('growthChart').getContext('2d');

        // Destroy existing chart
        if (growthChart) {
            growthChart.destroy();
        }

        const labels = chartData.map(d => d.year);
        const balances = chartData.map(d => d.balance);

        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Balance',
                    data: balances,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#4a6fa5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                const year = tooltipItems[0].label;
                                return year === '0' ? 'Start' : `Year ${year}`;
                            },
                            label: function(context) {
                                return 'Balance: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Balance'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1e12) {
                                    return '$' + (value / 1e12).toFixed(1) + 'T';
                                } else if (value >= 1e9) {
                                    return '$' + (value / 1e9).toFixed(1) + 'B';
                                } else if (value >= 1e6) {
                                    return '$' + (value / 1e6).toFixed(1) + 'M';
                                } else if (value >= 1e3) {
                                    return '$' + (value / 1e3).toFixed(1) + 'K';
                                }
                                return '$' + value.toFixed(0);
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
        });
    }

    /**
     * Generate insight text based on results
     * @param {Array} results - Calculation results
     * @param {number} ratePercent - Return rate as percentage
     * @param {string} frequency - Compounding frequency
     * @param {number} ear - Effective Annual Return
     * @returns {string} Insight text
     */
    function generateInsight(results, ratePercent, frequency, ear) {
        const oneYear = results.find(r => r.years === 1);
        const tenYear = results.find(r => r.years === 10);
        const thirtyYear = results.find(r => r.years === 30);

        const config = frequencyConfig[frequency];
        const periodLabel = config.label.toLowerCase();

        // Calculate how much more 30 years is vs 10 years
        const growthMultiplier = thirtyYear.finalBalance / tenYear.finalBalance;

        let insight = '';

        if (ear > 1) {
            // Very high returns
            insight = `At ${ratePercent}% per ${periodLabel}, your effective annual return is ${formatPercent(ear)}. `;
            insight += `While the math shows dramatic growth (your money grows ${growthMultiplier.toFixed(0)}x between year 10 and 30), `;
            insight += `sustaining such high returns for decades is extremely challenging in practice. `;
            insight += `Use this as a ceiling scenario, not a realistic expectation.`;
        } else if (ear > 0.2) {
            // High returns (20%+ annually)
            insight = `With a ${formatPercent(ear)} effective annual return, your initial investment `;
            insight += `could grow from ${formatCurrency(oneYear.totalDeposited)} to ${formatCurrency(tenYear.finalBalance)} in 10 years. `;
            insight += `By year 30, compounding accelerates dramatically: your balance grows ${growthMultiplier.toFixed(1)}x `;
            insight += `in the final 20 years compared to the first 10.`;
        } else {
            // Moderate returns
            insight = `Your ${ratePercent}% per ${periodLabel} return translates to ${formatPercent(ear)} annually. `;
            insight += `After 10 years, you'd have ${formatCurrency(tenYear.finalBalance)} `;
            insight += `(${formatPercent(tenYear.totalReturn)} total return). `;
            insight += `The power of compounding really shows after 20+ years, where growth accelerates exponentially.`;
        }

        return insight;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    function showError(message) {
        const errorDiv = document.getElementById('errorMessages');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    /**
     * Main calculation function
     */
    function calculate() {
        // Get input values
        const startingBalance = parseFloat(document.getElementById('startingBalance').value);
        const frequency = document.getElementById('frequency').value;
        const returnRatePercent = parseFloat(document.getElementById('returnRate').value);
        const deposit = parseFloat(document.getElementById('deposit').value) || 0;

        // Validate inputs
        if (isNaN(startingBalance) || startingBalance < 0) {
            showError('Please enter a valid starting balance (0 or greater).');
            return;
        }

        if (isNaN(returnRatePercent) || returnRatePercent < 0) {
            showError('Please enter a valid return rate (0 or greater).');
            return;
        }

        if (isNaN(deposit) || deposit < 0) {
            showError('Please enter a valid deposit amount (0 or greater).');
            return;
        }

        // Get frequency configuration
        const config = frequencyConfig[frequency] || frequencyConfig['daily-calendar'];
        const periodsPerYear = config.periodsPerYear;

        // Convert rate to decimal
        const rateDecimal = returnRatePercent / 100;

        // Calculate EAR
        const ear = calculateEAR(rateDecimal, periodsPerYear);

        // Calculate results for all time horizons
        const results = timeHorizons.map(years =>
            calculateForYears(startingBalance, rateDecimal, periodsPerYear, years, deposit)
        );

        // Display key stats
        document.getElementById('resultEAR').textContent = formatPercent(ear);
        document.getElementById('resultPeriodsPerYear').textContent = periodsPerYear.toString();

        // Render comparison table
        renderComparisonTable(results);

        // Generate and render chart data
        const chartData = generateChartData(startingBalance, rateDecimal, periodsPerYear, deposit);
        renderChart(chartData);

        // Generate and display insight
        const insight = generateInsight(results, returnRatePercent, frequency, ear);
        document.getElementById('insightText').textContent = insight;

        // Show results section
        document.getElementById('resultsSection').style.display = 'block';

        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    /**
     * Reset the calculator
     */
    function reset() {
        document.getElementById('calculatorForm').reset();
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('errorMessages').style.display = 'none';
        updatePeriodLabels('daily-calendar');

        if (growthChart) {
            growthChart.destroy();
            growthChart = null;
        }
    }

    /**
     * Initialize the calculator
     */
    function init() {
        // Calculate button
        document.getElementById('calculateButton').addEventListener('click', function(e) {
            e.preventDefault();
            calculate();
        });

        // Reset button
        document.getElementById('resetButton').addEventListener('click', function(e) {
            e.preventDefault();
            reset();
        });

        // Frequency change - update period labels
        document.getElementById('frequency').addEventListener('change', function() {
            updatePeriodLabels(this.value);
        });

        // Form submit (Enter key)
        document.getElementById('calculatorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            calculate();
        });

        // Initialize period labels
        updatePeriodLabels('daily-calendar');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
