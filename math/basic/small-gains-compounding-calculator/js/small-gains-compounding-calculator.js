/**
 * Small Gains Compounding Calculator
 * Shows how small, consistent gains compound over long time periods
 * Supports daily (calendar/trading), weekly, and monthly compounding
 * Supports flexible deposit frequencies and custom time horizons
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

    // Compounding frequency configuration
    const frequencyConfig = {
        'daily-calendar': { periodsPerYear: 365, label: 'Day', labelPlural: 'Days' },
        'daily-trading': { periodsPerYear: 252, label: 'Day', labelPlural: 'Trading Days' },
        'weekly': { periodsPerYear: 52, label: 'Week', labelPlural: 'Weeks' },
        'monthly': { periodsPerYear: 12, label: 'Month', labelPlural: 'Months' }
    };

    // Deposit frequency configuration (deposits per year)
    const depositFrequencyConfig = {
        'daily': { depositsPerYear: 365, label: 'Daily' },
        'weekly': { depositsPerYear: 52, label: 'Weekly' },
        'monthly': { depositsPerYear: 12, label: 'Monthly' },
        'quarterly': { depositsPerYear: 4, label: 'Quarterly' },
        'annually': { depositsPerYear: 1, label: 'Annually' }
    };

    /**
     * Calculate compound growth for a given time period (in months)
     * @param {number} principal - Starting balance
     * @param {number} ratePerPeriod - Rate per compounding period (as decimal)
     * @param {number} periodsPerYear - Compounding periods per year
     * @param {number} totalMonths - Total months to calculate
     * @param {number} depositAmount - Amount per deposit
     * @param {number} depositsPerYear - Number of deposits per year
     * @returns {Object} Results including final balance, deposits, profit, return
     */
    function calculateForMonths(principal, ratePerPeriod, periodsPerYear, totalMonths, depositAmount, depositsPerYear) {
        const years = totalMonths / 12;
        const totalPeriods = periodsPerYear * years;

        // Calculate final balance from principal compounding
        const principalGrowth = principal * Math.pow(1 + ratePerPeriod, totalPeriods);

        // Calculate deposit growth
        let depositGrowth = 0;
        const totalDeposits = depositsPerYear * years;

        if (depositAmount > 0 && depositsPerYear > 0 && totalDeposits > 0) {
            const periodsBetweenDeposits = periodsPerYear / depositsPerYear;

            if (ratePerPeriod > 0) {
                const ratePerDepositPeriod = Math.pow(1 + ratePerPeriod, periodsBetweenDeposits) - 1;
                depositGrowth = depositAmount * ((Math.pow(1 + ratePerDepositPeriod, totalDeposits) - 1) / ratePerDepositPeriod);
            } else {
                depositGrowth = depositAmount * totalDeposits;
            }
        }

        const finalBalance = principalGrowth + depositGrowth;
        const totalDeposited = principal + (depositAmount * totalDeposits);
        const totalProfit = finalBalance - totalDeposited;
        const totalReturn = totalDeposited > 0 ? (finalBalance - totalDeposited) / totalDeposited : 0;

        return {
            months: totalMonths,
            years: years,
            finalBalance: finalBalance,
            totalDeposited: totalDeposited,
            totalProfit: totalProfit,
            totalReturn: totalReturn,
            totalPeriods: totalPeriods,
            totalDepositCount: totalDeposits
        };
    }

    /**
     * Calculate Effective Annual Return (EAR)
     */
    function calculateEAR(ratePerPeriod, periodsPerYear) {
        return Math.pow(1 + ratePerPeriod, periodsPerYear) - 1;
    }

    /**
     * Format currency intelligently based on size
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
     */
    function formatPercent(value) {
        if (Math.abs(value) >= 10) {
            return largePercentFormatter.format(value);
        }
        return percentFormatter.format(value);
    }

    /**
     * Format time horizon label
     */
    function formatTimeLabel(months) {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years === 0) {
            return remainingMonths === 1 ? '1 Month' : `${remainingMonths} Months`;
        } else if (remainingMonths === 0) {
            return years === 1 ? '1 Year' : `${years} Years`;
        } else {
            const yearPart = years === 1 ? '1 Year' : `${years} Years`;
            const monthPart = remainingMonths === 1 ? '1 Month' : `${remainingMonths} Months`;
            return `${yearPart}, ${monthPart}`;
        }
    }

    /**
     * Update period labels based on frequency selection
     */
    function updatePeriodLabels(frequency) {
        const config = frequencyConfig[frequency] || frequencyConfig['daily-calendar'];
        document.getElementById('periodLabel').textContent = config.label;
    }

    /**
     * Generate milestone months based on user's time horizon
     */
    function generateMilestones(totalMonths) {
        const milestones = [];

        // Always include key milestones that are less than or equal to total
        const standardMilestones = [1, 3, 6, 12, 24, 36, 60, 120, 240, 360]; // 1m, 3m, 6m, 1y, 2y, 3y, 5y, 10y, 20y, 30y

        for (const m of standardMilestones) {
            if (m < totalMonths) {
                milestones.push(m);
            }
        }

        // Always include the user's target
        if (!milestones.includes(totalMonths)) {
            milestones.push(totalMonths);
        }

        return milestones.sort((a, b) => a - b);
    }

    /**
     * Populate the multi-year comparison table
     */
    function renderComparisonTable(results) {
        const tbody = document.getElementById('comparisonTableBody');
        tbody.innerHTML = '';

        results.forEach((result, index) => {
            const tr = document.createElement('tr');

            // Highlight the final row (user's target)
            if (index === results.length - 1) {
                tr.className = 'highlight-row';
            }

            tr.innerHTML = `
                <td>${formatTimeLabel(result.months)}</td>
                <td>${formatCurrency(result.finalBalance)}</td>
                <td>${formatCurrency(result.totalDeposited)}</td>
                <td class="profit-positive">${formatCurrency(result.totalProfit)}</td>
                <td class="return-value">${formatPercent(result.totalReturn)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    /**
     * Generate chart data points
     */
    function generateChartData(principal, ratePerPeriod, periodsPerYear, depositAmount, depositsPerYear, totalMonths) {
        const data = [];

        // Determine appropriate intervals based on time horizon
        let interval;
        if (totalMonths <= 12) {
            interval = 1; // Monthly for up to 1 year
        } else if (totalMonths <= 60) {
            interval = 3; // Quarterly for up to 5 years
        } else {
            interval = 12; // Yearly for longer periods
        }

        // Add starting point
        data.push({ month: 0, balance: principal, contributed: principal });

        // Generate data points
        for (let month = interval; month <= totalMonths; month += interval) {
            const result = calculateForMonths(principal, ratePerPeriod, periodsPerYear, month, depositAmount, depositsPerYear);
            data.push({
                month: month,
                balance: result.finalBalance,
                contributed: result.totalDeposited
            });
        }

        // Ensure final point is included
        if (data[data.length - 1].month !== totalMonths) {
            const result = calculateForMonths(principal, ratePerPeriod, periodsPerYear, totalMonths, depositAmount, depositsPerYear);
            data.push({
                month: totalMonths,
                balance: result.finalBalance,
                contributed: result.totalDeposited
            });
        }

        return data;
    }

    /**
     * Format chart label based on months
     */
    function formatChartLabel(months) {
        if (months === 0) return 'Start';
        if (months < 12) return `${months}m`;
        const years = months / 12;
        if (Number.isInteger(years)) return `${years}y`;
        return `${years.toFixed(1)}y`;
    }

    /**
     * Render the growth chart with two lines
     */
    function renderChart(chartData) {
        const ctx = document.getElementById('growthChart').getContext('2d');

        if (growthChart) {
            growthChart.destroy();
        }

        const labels = chartData.map(d => formatChartLabel(d.month));
        const balances = chartData.map(d => d.balance);
        const contributions = chartData.map(d => d.contributed);

        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Value',
                        data: balances,
                        borderColor: '#4a6fa5',
                        backgroundColor: 'rgba(74, 111, 165, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#4a6fa5',
                        order: 1
                    },
                    {
                        label: 'Total Contributed',
                        data: contributions,
                        borderColor: '#6c757d',
                        backgroundColor: 'rgba(108, 117, 125, 0.05)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: true,
                        tension: 0.4,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        pointBackgroundColor: '#6c757d',
                        order: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return tooltipItems[0].label;
                            },
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                            },
                            afterBody: function(tooltipItems) {
                                const balance = tooltipItems[0].parsed.y;
                                const contributed = tooltipItems[1].parsed.y;
                                const profit = balance - contributed;
                                return ['', 'Compounding Gain: ' + formatCurrency(profit)];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time'
                        },
                        ticks: {
                            maxTicksLimit: 12
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Balance'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1e12) return '$' + (value / 1e12).toFixed(1) + 'T';
                                if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
                                if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
                                if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
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
     */
    function generateInsight(results, ratePercent, frequency, ear, depositAmount, depositFrequency, totalMonths) {
        const finalResult = results[results.length - 1];
        const config = frequencyConfig[frequency];
        const periodLabel = config.label.toLowerCase();
        const depositConfig = depositFrequencyConfig[depositFrequency];

        const hasDeposits = depositAmount > 0;
        const compoundingGain = finalResult.totalProfit;
        const percentFromCompounding = finalResult.totalDeposited > 0
            ? (compoundingGain / finalResult.totalDeposited * 100).toFixed(0)
            : 0;

        let insight = '';

        // Time-based intro
        const timeLabel = formatTimeLabel(totalMonths);

        if (totalMonths <= 12) {
            // Short term
            insight = `Over ${timeLabel}, your ${ratePercent}% per ${periodLabel} return generates ${formatCurrency(compoundingGain)} in compounding gains. `;
            if (hasDeposits) {
                insight += `With ${depositConfig.label.toLowerCase()} deposits of ${formatCurrency(depositAmount)}, `;
                insight += `you'd have ${formatCurrency(finalResult.finalBalance)} total.`;
            } else {
                insight += `Your ${formatCurrency(finalResult.totalDeposited)} grows to ${formatCurrency(finalResult.finalBalance)}.`;
            }
        } else if (ear > 1) {
            // Very high returns
            insight = `At ${ratePercent}% per ${periodLabel} (${formatPercent(ear)} annually), over ${timeLabel} your investment grows to ${formatCurrency(finalResult.finalBalance)}. `;
            insight += `The gap between the lines shows ${formatCurrency(compoundingGain)} from compounding alone. `;
            insight += `Note: Sustaining such high returns long-term is extremely difficult in practice.`;
        } else {
            // Normal returns
            insight = `Over ${timeLabel}, compounding adds ${formatCurrency(compoundingGain)} to your investment (${percentFromCompounding}% of what you put in). `;
            if (hasDeposits) {
                insight += `The visual gap between "Total Value" and "Total Contributed" shows the power of consistent ${depositConfig.label.toLowerCase()} investing combined with compounding.`;
            } else {
                insight += `The visual gap between the lines represents pure compound growth on your initial ${formatCurrency(finalResult.totalDeposited)}.`;
            }
        }

        return insight;
    }

    /**
     * Show error message
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
        const depositFrequency = document.getElementById('depositFrequency').value;
        const years = parseInt(document.getElementById('years').value) || 0;
        const months = parseInt(document.getElementById('months').value) || 0;

        // Calculate total months
        const totalMonths = (years * 12) + months;

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

        if (totalMonths < 1) {
            showError('Please enter a time horizon of at least 1 month.');
            return;
        }

        if (totalMonths > 600) {
            showError('Maximum time horizon is 50 years (600 months).');
            return;
        }

        // Get frequency configurations
        const compoundConfig = frequencyConfig[frequency] || frequencyConfig['daily-calendar'];
        const periodsPerYear = compoundConfig.periodsPerYear;

        const depositConfig = depositFrequencyConfig[depositFrequency] || depositFrequencyConfig['monthly'];
        const depositsPerYear = depositConfig.depositsPerYear;

        // Convert rate to decimal
        const rateDecimal = returnRatePercent / 100;

        // Calculate EAR
        const ear = calculateEAR(rateDecimal, periodsPerYear);

        // Generate milestones and calculate results
        const milestones = generateMilestones(totalMonths);
        const results = milestones.map(m =>
            calculateForMonths(startingBalance, rateDecimal, periodsPerYear, m, deposit, depositsPerYear)
        );

        // Display key stats
        document.getElementById('resultEAR').textContent = formatPercent(ear);
        document.getElementById('resultPeriodsPerYear').textContent = periodsPerYear.toString();

        // Render comparison table
        renderComparisonTable(results);

        // Generate and render chart data
        const chartData = generateChartData(startingBalance, rateDecimal, periodsPerYear, deposit, depositsPerYear, totalMonths);
        renderChart(chartData);

        // Generate and display insight
        const insight = generateInsight(results, returnRatePercent, frequency, ear, deposit, depositFrequency, totalMonths);
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
        document.getElementById('calculateButton').addEventListener('click', function(e) {
            e.preventDefault();
            calculate();
        });

        document.getElementById('resetButton').addEventListener('click', function(e) {
            e.preventDefault();
            reset();
        });

        document.getElementById('frequency').addEventListener('change', function() {
            updatePeriodLabels(this.value);
        });

        document.getElementById('calculatorForm').addEventListener('submit', function(e) {
            e.preventDefault();
            calculate();
        });

        updatePeriodLabels('daily-calendar');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
