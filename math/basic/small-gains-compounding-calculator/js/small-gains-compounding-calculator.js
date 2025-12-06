/**
 * Small Gains Compounding Calculator
 * Calculates compound growth with optional regular deposits
 * Supports daily, weekly, and monthly compounding frequencies
 */

(function() {
    'use strict';

    // Chart instance
    let growthChart = null;

    // Currency formatter
    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Percentage formatter
    const percentFormatter = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Period labels mapping
    const periodLabels = {
        daily: { singular: 'Day', plural: 'Days' },
        weekly: { singular: 'Week', plural: 'Weeks' },
        monthly: { singular: 'Month', plural: 'Months' }
    };

    // Periods per year for EAR calculation
    const periodsPerYear = {
        daily: 365,
        weekly: 52,
        monthly: 12
    };

    /**
     * Calculate compound growth with optional deposits
     * @param {number} principal - Starting balance
     * @param {number} rate - Rate per period (as decimal)
     * @param {number} periods - Number of periods
     * @param {number} deposit - Deposit amount per period
     * @param {string} timing - 'beginning' or 'end'
     * @returns {Object} Results including final balance, breakdown, etc.
     */
    function calculateCompounding(principal, rate, periods, deposit, timing) {
        const breakdown = [];
        let balance = principal;
        let totalDeposits = 0;

        for (let i = 1; i <= periods; i++) {
            const startBalance = balance;
            let periodDeposit = 0;
            let periodGrowth = 0;

            // Add deposit at beginning of period (annuity due)
            if (deposit > 0 && timing === 'beginning') {
                balance += deposit;
                periodDeposit = deposit;
                totalDeposits += deposit;
            }

            // Calculate growth on current balance
            periodGrowth = balance * rate;
            balance += periodGrowth;

            // Add deposit at end of period (ordinary annuity)
            if (deposit > 0 && timing === 'end') {
                balance += deposit;
                periodDeposit = deposit;
                totalDeposits += deposit;
            }

            breakdown.push({
                period: i,
                startBalance: startBalance,
                deposit: periodDeposit,
                growth: periodGrowth,
                endBalance: balance
            });
        }

        const totalContributed = principal + totalDeposits;
        const profit = balance - totalContributed;

        return {
            finalBalance: balance,
            totalContributed: totalContributed,
            totalDeposits: totalDeposits,
            profit: profit,
            breakdown: breakdown
        };
    }

    /**
     * Calculate Effective Annual Return (EAR)
     * @param {number} ratePerPeriod - Rate per period (as decimal)
     * @param {string} frequency - 'daily', 'weekly', or 'monthly'
     * @returns {number} EAR as decimal
     */
    function calculateEAR(ratePerPeriod, frequency) {
        const periods = periodsPerYear[frequency] || 12;
        return Math.pow(1 + ratePerPeriod, periods) - 1;
    }

    /**
     * Update the period label based on frequency
     * @param {string} frequency - Selected frequency
     */
    function updatePeriodLabel(frequency) {
        const label = periodLabels[frequency] || periodLabels.monthly;
        document.getElementById('periodLabel').textContent = label.plural;
    }

    /**
     * Render the breakdown table
     * @param {Array} breakdown - Period-by-period breakdown
     * @param {string} frequency - Selected frequency
     */
    function renderBreakdownTable(breakdown, frequency) {
        const tbody = document.getElementById('breakdownTableBody');
        tbody.innerHTML = '';

        const label = periodLabels[frequency] || periodLabels.monthly;
        const total = breakdown.length;

        // For large datasets, show first 12 + last 12 with ellipsis
        let rowsToShow = breakdown;
        let showEllipsis = false;

        if (total > 24) {
            rowsToShow = [...breakdown.slice(0, 12), ...breakdown.slice(-12)];
            showEllipsis = true;
        }

        let lastPeriod = 0;

        rowsToShow.forEach((row, index) => {
            // Add ellipsis row if needed
            if (showEllipsis && index === 12 && row.period !== lastPeriod + 1) {
                const ellipsisRow = document.createElement('tr');
                ellipsisRow.className = 'ellipsis-row';
                ellipsisRow.innerHTML = `<td colspan="5">... ${row.period - lastPeriod - 1} ${label.plural.toLowerCase()} omitted ...</td>`;
                tbody.appendChild(ellipsisRow);
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${label.singular} ${row.period}</td>
                <td>${currencyFormatter.format(row.startBalance)}</td>
                <td>${currencyFormatter.format(row.deposit)}</td>
                <td>${currencyFormatter.format(row.growth)}</td>
                <td>${currencyFormatter.format(row.endBalance)}</td>
            `;
            tbody.appendChild(tr);
            lastPeriod = row.period;
        });
    }

    /**
     * Render the growth chart
     * @param {Array} breakdown - Period-by-period breakdown
     * @param {string} frequency - Selected frequency
     */
    function renderChart(breakdown, frequency) {
        const ctx = document.getElementById('growthChart').getContext('2d');
        const label = periodLabels[frequency] || periodLabels.monthly;

        // Destroy existing chart
        if (growthChart) {
            growthChart.destroy();
        }

        // Sample data for large datasets (max 100 points)
        let chartData = breakdown;
        if (breakdown.length > 100) {
            const step = Math.ceil(breakdown.length / 100);
            chartData = breakdown.filter((_, i) => i % step === 0 || i === breakdown.length - 1);
        }

        const labels = chartData.map(row => row.period);
        const balances = chartData.map(row => row.endBalance);

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
                    pointRadius: chartData.length > 50 ? 0 : 3,
                    pointHoverRadius: 5
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
                                return label.singular + ' ' + tooltipItems[0].label;
                            },
                            label: function(context) {
                                return 'Balance: ' + currencyFormatter.format(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: label.plural
                        },
                        ticks: {
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Balance ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return '$' + (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return '$' + (value / 1000).toFixed(1) + 'K';
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
        const periods = parseInt(document.getElementById('periods').value);
        const deposit = parseFloat(document.getElementById('deposit').value) || 0;
        const depositTiming = document.getElementById('depositTiming').value;

        // Validate inputs
        if (isNaN(startingBalance) || startingBalance < 0) {
            showError('Please enter a valid starting balance (0 or greater).');
            return;
        }

        if (isNaN(returnRatePercent) || returnRatePercent < 0) {
            showError('Please enter a valid return rate (0 or greater).');
            return;
        }

        if (isNaN(periods) || periods < 1 || periods > 10000) {
            showError('Please enter a valid number of periods (1 to 10,000).');
            return;
        }

        if (isNaN(deposit) || deposit < 0) {
            showError('Please enter a valid deposit amount (0 or greater).');
            return;
        }

        // Convert rate to decimal
        const rateDecimal = returnRatePercent / 100;

        // Calculate results
        const results = calculateCompounding(
            startingBalance,
            rateDecimal,
            periods,
            deposit,
            depositTiming
        );

        // Calculate EAR
        const ear = calculateEAR(rateDecimal, frequency);

        // Display results
        document.getElementById('resultFinalBalance').textContent = currencyFormatter.format(results.finalBalance);
        document.getElementById('resultTotalContributed').textContent = currencyFormatter.format(results.totalContributed);
        document.getElementById('resultProfit').textContent = currencyFormatter.format(results.profit);
        document.getElementById('resultEAR').textContent = percentFormatter.format(ear);

        // Render table and chart
        renderBreakdownTable(results.breakdown, frequency);
        renderChart(results.breakdown, frequency);

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
        updatePeriodLabel('monthly');

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

        // Frequency change - update period label
        document.getElementById('frequency').addEventListener('change', function() {
            updatePeriodLabel(this.value);
        });

        // Form submit (Enter key)
        document.getElementById('calculatorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            calculate();
        });

        // Initialize period label
        updatePeriodLabel('monthly');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
