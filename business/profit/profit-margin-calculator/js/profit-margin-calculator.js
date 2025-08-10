/*
 * FreecalcHub.com - Profit Margin Calculator
 * Version: 1.0
 * Date: August 9, 2025
 * Description: Calculate gross, operating, and net profit margins with analysis and suggestions
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");
    const suggestionsList = document.getElementById("suggestionsList");

    // Input Elements
    const totalRevenueEl = document.getElementById("totalRevenue");
    const costOfGoodsSoldEl = document.getElementById("costOfGoodsSold");
    const operatingExpensesEl = document.getElementById("operatingExpenses");
    const otherExpensesEl = document.getElementById("otherExpenses");

    // Result Display Elements
    const grossProfitEl = document.getElementById("grossProfit");
    const operatingProfitEl = document.getElementById("operatingProfit");
    const netProfitEl = document.getElementById("netProfit");
    const grossMarginEl = document.getElementById("grossMargin");
    const operatingMarginEl = document.getElementById("operatingMargin");
    const netMarginEl = document.getElementById("netMargin");
    const grossMarginIndicatorEl = document.getElementById("grossMarginIndicator");
    const operatingMarginIndicatorEl = document.getElementById("operatingMarginIndicator");
    const netMarginIndicatorEl = document.getElementById("netMarginIndicator");

    // Chart Instance
    let profitMarginChartInstance = null;

    // Event Listeners
    calculateButton.addEventListener("click", (event) => {
        event.preventDefault();
        hideError();
        if (validateInputs()) {
            calculateAndDisplay();
        }
    });

    resetButton.addEventListener("click", () => {
        resetCalculator();
    });

    // Input validation
    function validateInputs() {
        const totalRevenue = parseFloat(totalRevenueEl.value);
        const costOfGoodsSold = parseFloat(costOfGoodsSoldEl.value);
        const operatingExpenses = parseFloat(operatingExpensesEl.value);
        const otherExpenses = parseFloat(otherExpensesEl.value) || 0;

        // Check for required fields
        if (isNaN(totalRevenue) || totalRevenue <= 0) {
            showError("Please enter valid total revenue (must be greater than 0).");
            return false;
        }

        if (isNaN(costOfGoodsSold) || costOfGoodsSold < 0) {
            showError("Please enter valid cost of goods sold (must be 0 or greater).");
            return false;
        }

        if (isNaN(operatingExpenses) || operatingExpenses < 0) {
            showError("Please enter valid operating expenses (must be 0 or greater).");
            return false;
        }

        if (otherExpenses < 0) {
            showError("Other expenses must be 0 or greater if provided.");
            return false;
        }

        // Check if COGS exceeds revenue
        if (costOfGoodsSold > totalRevenue) {
            showError("Cost of goods sold cannot exceed total revenue.");
            return false;
        }

        // Check if total expenses exceed revenue (warning, not error)
        const totalExpenses = costOfGoodsSold + operatingExpenses + otherExpenses;
        if (totalExpenses > totalRevenue) {
            // This is allowed but will result in negative margins
            console.log("Warning: Total expenses exceed revenue, resulting in negative profit margins.");
        }

        return true;
    }

    // Main calculation function
    function calculateAndDisplay() {
        try {
            const totalRevenue = parseFloat(totalRevenueEl.value);
            const costOfGoodsSold = parseFloat(costOfGoodsSoldEl.value);
            const operatingExpenses = parseFloat(operatingExpensesEl.value);
            const otherExpenses = parseFloat(otherExpensesEl.value) || 0;

            // Calculate profits
            const grossProfit = totalRevenue - costOfGoodsSold;
            const operatingProfit = grossProfit - operatingExpenses;
            const netProfit = operatingProfit - otherExpenses;

            // Calculate margins
            const grossMargin = (grossProfit / totalRevenue) * 100;
            const operatingMargin = (operatingProfit / totalRevenue) * 100;
            const netMargin = (netProfit / totalRevenue) * 100;

            // Update profit displays
            grossProfitEl.textContent = formatCurrency(grossProfit);
            grossProfitEl.className = grossProfit >= 0 ? "positive-value" : "negative-value";
            
            operatingProfitEl.textContent = formatCurrency(operatingProfit);
            operatingProfitEl.className = operatingProfit >= 0 ? "positive-value" : "negative-value";
            
            netProfitEl.textContent = formatCurrency(netProfit);
            netProfitEl.className = netProfit >= 0 ? "positive-value" : "negative-value";

            // Update margin displays with performance indicators
            updateMarginDisplay(grossMarginEl, grossMarginIndicatorEl, grossMargin, 'gross');
            updateMarginDisplay(operatingMarginEl, operatingMarginIndicatorEl, operatingMargin, 'operating');
            updateMarginDisplay(netMarginEl, netMarginIndicatorEl, netMargin, 'net');

            // Create visualization chart
            createProfitMarginChart(totalRevenue, costOfGoodsSold, operatingExpenses, otherExpenses);

            // Generate improvement suggestions
            generateImprovementSuggestions(grossMargin, operatingMargin, netMargin, {
                totalRevenue,
                costOfGoodsSold,
                operatingExpenses,
                otherExpenses,
                grossProfit,
                operatingProfit,
                netProfit
            });

            // Show results
            resultsSection.style.display = "block";

        } catch (error) {
            showError("Error calculating profit margins: " + error.message);
        }
    }

    // Update margin display with performance indicators
    function updateMarginDisplay(marginEl, indicatorEl, marginValue, marginType) {
        marginEl.textContent = formatPercentage(marginValue);
        
        const performance = getMarginPerformance(marginValue, marginType);
        marginEl.className = `margin-${performance.level}`;
        indicatorEl.className = `margin-indicator ${performance.level}`;
    }

    // Get margin performance level and benchmarks
    function getMarginPerformance(marginValue, marginType) {
        let thresholds;
        
        switch (marginType) {
            case 'gross':
                thresholds = { excellent: 40, good: 25, fair: 15 };
                break;
            case 'operating':
                thresholds = { excellent: 20, good: 10, fair: 5 };
                break;
            case 'net':
                thresholds = { excellent: 15, good: 8, fair: 3 };
                break;
            default:
                thresholds = { excellent: 20, good: 10, fair: 5 };
        }

        if (marginValue >= thresholds.excellent) {
            return { level: 'excellent', description: 'Excellent performance' };
        } else if (marginValue >= thresholds.good) {
            return { level: 'good', description: 'Good performance' };
        } else if (marginValue >= thresholds.fair) {
            return { level: 'fair', description: 'Fair performance' };
        } else {
            return { level: 'poor', description: 'Needs improvement' };
        }
    }

    // Create profit margin visualization chart
    function createProfitMarginChart(revenue, cogs, opex, otherExp) {
        const ctx = document.getElementById('profitMarginChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (profitMarginChartInstance) {
            profitMarginChartInstance.destroy();
        }

        const grossProfit = revenue - cogs;
        const operatingProfit = grossProfit - opex;
        const netProfit = operatingProfit - otherExp;

        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#e5e7eb' : '#374151';
        const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

        profitMarginChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Revenue', 'Gross Profit', 'Operating Profit', 'Net Profit'],
                datasets: [
                    {
                        label: 'Amount ($)',
                        data: [revenue, grossProfit, operatingProfit, netProfit],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)',   // Revenue - Blue
                            'rgba(16, 185, 129, 0.8)',   // Gross Profit - Green
                            'rgba(245, 158, 11, 0.8)',   // Operating Profit - Orange
                            'rgba(139, 92, 246, 0.8)'    // Net Profit - Purple
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(139, 92, 246, 1)'
                        ],
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Profit Waterfall Analysis',
                        color: textColor,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? '#1f2937' : 'white',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                const percentage = ((value / revenue) * 100).toFixed(1);
                                return `${formatCurrency(value)} (${percentage}% of revenue)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Amount ($)',
                            color: textColor
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    }
                }
            }
        });
    }

    // Generate improvement suggestions based on margin performance
    function generateImprovementSuggestions(grossMargin, operatingMargin, netMargin, data) {
        const suggestions = [];

        // Gross margin suggestions
        if (grossMargin < 25) {
            suggestions.push({
                icon: 'fas fa-arrow-up',
                title: 'Improve Gross Margin',
                description: 'Consider increasing prices, negotiating better supplier terms, or finding ways to reduce direct production costs.'
            });
        }

        // Operating margin suggestions
        if (operatingMargin < 10) {
            suggestions.push({
                icon: 'fas fa-cogs',
                title: 'Optimize Operations',
                description: 'Review operating expenses for potential savings. Focus on automation, process improvements, or renegotiating overhead costs.'
            });
        }

        // High COGS relative to revenue
        const cogsRatio = (data.costOfGoodsSold / data.totalRevenue) * 100;
        if (cogsRatio > 70) {
            suggestions.push({
                icon: 'fas fa-shopping-cart',
                title: 'Reduce Cost of Goods Sold',
                description: 'Your COGS is high relative to revenue. Consider bulk purchasing, alternative suppliers, or product redesign to reduce direct costs.'
            });
        }

        // High operating expenses
        const opexRatio = (data.operatingExpenses / data.totalRevenue) * 100;
        if (opexRatio > 30) {
            suggestions.push({
                icon: 'fas fa-chart-line',
                title: 'Control Operating Expenses',
                description: 'Operating expenses are consuming a large portion of revenue. Review rent, salaries, and administrative costs for optimization opportunities.'
            });
        }

        // Pricing strategy
        if (grossMargin > 40 && operatingMargin < 15) {
            suggestions.push({
                icon: 'fas fa-tags',
                title: 'Scale Operations',
                description: 'Good gross margins suggest room to invest in growth. Consider strategic spending on marketing or infrastructure to increase volume.'
            });
        }

        // General profitability
        if (netMargin < 5) {
            suggestions.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'Focus on Profitability',
                description: 'Net margin is below industry averages. Prioritize both revenue growth and cost control to improve bottom-line profitability.'
            });
        }

        // Positive performance
        if (netMargin > 15) {
            suggestions.push({
                icon: 'fas fa-trophy',
                title: 'Excellent Performance',
                description: 'Strong profit margins! Consider reinvesting profits into growth initiatives or expanding into new markets.'
            });
        }

        // Render suggestions
        suggestionsList.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-icon">
                    <i class="${suggestion.icon}"></i>
                </div>
                <div class="suggestion-content">
                    <h6>${suggestion.title}</h6>
                    <p>${suggestion.description}</p>
                </div>
            </div>
        `).join('');
    }

    // Utility functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatPercentage(percentage) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(percentage / 100);
    }

    function showError(message) {
        errorMessagesDiv.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
        errorMessagesDiv.style.display = "block";
    }

    function hideError() {
        errorMessagesDiv.style.display = "none";
        errorMessagesDiv.innerHTML = "";
    }

    function resetCalculator() {
        // Reset form
        form.reset();
        
        // Hide results and errors
        resultsSection.style.display = "none";
        hideError();
        
        // Destroy chart
        if (profitMarginChartInstance) {
            profitMarginChartInstance.destroy();
            profitMarginChartInstance = null;
        }
        
        // Reset result displays
        grossProfitEl.textContent = "--";
        operatingProfitEl.textContent = "--";
        netProfitEl.textContent = "--";
        grossMarginEl.textContent = "--";
        operatingMarginEl.textContent = "--";
        netMarginEl.textContent = "--";
        
        // Reset indicators
        grossMarginIndicatorEl.className = "margin-indicator";
        operatingMarginIndicatorEl.className = "margin-indicator";
        netMarginIndicatorEl.className = "margin-indicator";
        
        // Reset classes
        grossProfitEl.className = "";
        operatingProfitEl.className = "";
        netProfitEl.className = "";
        grossMarginEl.className = "";
        operatingMarginEl.className = "";
        netMarginEl.className = "";
        
        // Clear suggestions
        suggestionsList.innerHTML = "";
    }

    // Handle dark mode changes for chart
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                if (profitMarginChartInstance) {
                    // Recreate chart with new theme colors
                    const revenue = parseFloat(totalRevenueEl.value);
                    const cogs = parseFloat(costOfGoodsSoldEl.value);
                    const opex = parseFloat(operatingExpensesEl.value);
                    const otherExp = parseFloat(otherExpensesEl.value) || 0;
                    
                    if (!isNaN(revenue) && !isNaN(cogs) && !isNaN(opex)) {
                        createProfitMarginChart(revenue, cogs, opex, otherExp);
                    }
                }
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
});