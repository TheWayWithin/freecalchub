/*
 * FreecalcHub.com - Break-Even Analysis Calculator
 * Version: 1.0
 * Date: August 9, 2025
 * Description: Calculate break-even point, contribution margin, and margin of safety with visual chart
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");
    const marginSafetySection = document.getElementById("marginSafetySection");

    // Input Elements
    const fixedCostsEl = document.getElementById("fixedCosts");
    const variableCostPerUnitEl = document.getElementById("variableCostPerUnit");
    const pricePerUnitEl = document.getElementById("pricePerUnit");
    const currentSalesUnitsEl = document.getElementById("currentSalesUnits");

    // Result Display Elements
    const breakEvenUnitsEl = document.getElementById("breakEvenUnits");
    const breakEvenRevenueEl = document.getElementById("breakEvenRevenue");
    const contributionMarginEl = document.getElementById("contributionMargin");
    const contributionMarginRatioEl = document.getElementById("contributionMarginRatio");
    const salesAboveBreakEvenEl = document.getElementById("salesAboveBreakEven");
    const marginSafetyPercentEl = document.getElementById("marginSafetyPercent");

    // Chart Instance
    let breakEvenChartInstance = null;

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
        const fixedCosts = parseFloat(fixedCostsEl.value);
        const variableCostPerUnit = parseFloat(variableCostPerUnitEl.value);
        const pricePerUnit = parseFloat(pricePerUnitEl.value);

        // Check for required fields
        if (isNaN(fixedCosts) || fixedCosts < 0) {
            showError("Please enter valid fixed costs (must be 0 or greater).");
            return false;
        }

        if (isNaN(variableCostPerUnit) || variableCostPerUnit < 0) {
            showError("Please enter valid variable cost per unit (must be 0 or greater).");
            return false;
        }

        if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
            showError("Please enter valid selling price per unit (must be greater than 0).");
            return false;
        }

        // Check that price per unit is greater than variable cost per unit
        if (pricePerUnit <= variableCostPerUnit) {
            showError("Selling price per unit must be greater than variable cost per unit to generate profit.");
            return false;
        }

        // Validate current sales if provided
        const currentSalesUnits = parseFloat(currentSalesUnitsEl.value);
        if (currentSalesUnitsEl.value && (isNaN(currentSalesUnits) || currentSalesUnits < 0)) {
            showError("Current sales volume must be 0 or greater if provided.");
            return false;
        }

        return true;
    }

    // Main calculation function
    function calculateAndDisplay() {
        try {
            const fixedCosts = parseFloat(fixedCostsEl.value);
            const variableCostPerUnit = parseFloat(variableCostPerUnitEl.value);
            const pricePerUnit = parseFloat(pricePerUnitEl.value);
            const currentSalesUnits = parseFloat(currentSalesUnitsEl.value) || 0;

            // Calculate break-even analysis
            const contributionMarginPerUnit = pricePerUnit - variableCostPerUnit;
            const contributionMarginRatio = (contributionMarginPerUnit / pricePerUnit) * 100;
            const breakEvenUnits = fixedCosts / contributionMarginPerUnit;
            const breakEvenRevenue = breakEvenUnits * pricePerUnit;

            // Update basic results
            breakEvenUnitsEl.textContent = formatNumber(Math.ceil(breakEvenUnits)) + " units";
            breakEvenRevenueEl.textContent = formatCurrency(breakEvenRevenue);
            contributionMarginEl.textContent = formatCurrency(contributionMarginPerUnit);
            contributionMarginRatioEl.textContent = formatPercentage(contributionMarginRatio);

            // Calculate margin of safety if current sales provided
            if (currentSalesUnits > 0) {
                const salesAboveBreakEven = currentSalesUnits - breakEvenUnits;
                const marginSafetyPercent = (salesAboveBreakEven / currentSalesUnits) * 100;

                salesAboveBreakEvenEl.textContent = formatNumber(Math.round(salesAboveBreakEven)) + " units";
                salesAboveBreakEvenEl.className = salesAboveBreakEven >= 0 ? "positive-margin" : "negative-margin";
                
                marginSafetyPercentEl.textContent = formatPercentage(marginSafetyPercent);
                marginSafetyPercentEl.className = marginSafetyPercent >= 0 ? "positive-margin" : "negative-margin";
                
                marginSafetySection.style.display = "block";
            } else {
                marginSafetySection.style.display = "none";
            }

            // Create break-even chart
            createBreakEvenChart(fixedCosts, variableCostPerUnit, pricePerUnit, breakEvenUnits, currentSalesUnits);

            // Show results
            resultsSection.style.display = "block";

        } catch (error) {
            showError("Error calculating break-even analysis: " + error.message);
        }
    }

    // Create break-even chart
    function createBreakEvenChart(fixedCosts, variableCostPerUnit, pricePerUnit, breakEvenUnits, currentSalesUnits) {
        const ctx = document.getElementById('breakEvenChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (breakEvenChartInstance) {
            breakEvenChartInstance.destroy();
        }

        // Generate data points for the chart
        const maxUnits = Math.max(breakEvenUnits * 1.5, currentSalesUnits * 1.2, 100);
        const dataPoints = [];
        const step = maxUnits / 50;

        for (let units = 0; units <= maxUnits; units += step) {
            const revenue = units * pricePerUnit;
            const totalCosts = fixedCosts + (units * variableCostPerUnit);
            
            dataPoints.push({
                x: units,
                revenue: revenue,
                totalCosts: totalCosts,
                fixedCosts: fixedCosts
            });
        }

        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#e5e7eb' : '#374151';
        const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

        breakEvenChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Revenue',
                        data: dataPoints.map(point => ({x: point.x, y: point.revenue})),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Total Costs',
                        data: dataPoints.map(point => ({x: point.x, y: point.totalCosts})),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Fixed Costs',
                        data: dataPoints.map(point => ({x: point.x, y: point.fixedCosts})),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: false,
                        borderDash: [5, 5],
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Break-Even Analysis Chart',
                        color: textColor,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        labels: {
                            color: textColor,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: isDarkMode ? '#1f2937' : 'white',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                            },
                            afterBody: function(tooltipItems) {
                                const units = tooltipItems[0].parsed.x;
                                if (Math.abs(units - breakEvenUnits) < step * 2) {
                                    return ['', '🎯 Break-Even Point: ' + formatNumber(Math.ceil(breakEvenUnits)) + ' units'];
                                }
                                return [];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Units Sold',
                            color: textColor
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return formatNumber(value);
                            }
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
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 6
                    }
                }
            }
        });

        // Add break-even point annotation
        if (currentSalesUnits > 0) {
            // Add current sales point if provided
            breakEvenChartInstance.data.datasets.push({
                label: 'Current Sales',
                data: [{x: currentSalesUnits, y: currentSalesUnits * pricePerUnit}],
                borderColor: '#10b981',
                backgroundColor: '#10b981',
                pointRadius: 8,
                pointHoverRadius: 10,
                showLine: false,
                pointStyle: 'circle'
            });
            breakEvenChartInstance.update();
        }
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

    function formatNumber(number) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
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
        marginSafetySection.style.display = "none";
        hideError();
        
        // Destroy chart
        if (breakEvenChartInstance) {
            breakEvenChartInstance.destroy();
            breakEvenChartInstance = null;
        }
        
        // Reset result displays
        breakEvenUnitsEl.textContent = "--";
        breakEvenRevenueEl.textContent = "--";
        contributionMarginEl.textContent = "--";
        contributionMarginRatioEl.textContent = "--";
        salesAboveBreakEvenEl.textContent = "--";
        marginSafetyPercentEl.textContent = "--";
        
        // Remove any applied classes
        salesAboveBreakEvenEl.className = "";
        marginSafetyPercentEl.className = "";
    }

    // Handle dark mode changes for chart
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                if (breakEvenChartInstance) {
                    // Recreate chart with new theme colors
                    const fixedCosts = parseFloat(fixedCostsEl.value);
                    const variableCostPerUnit = parseFloat(variableCostPerUnitEl.value);
                    const pricePerUnit = parseFloat(pricePerUnitEl.value);
                    const currentSalesUnits = parseFloat(currentSalesUnitsEl.value) || 0;
                    
                    if (!isNaN(fixedCosts) && !isNaN(variableCostPerUnit) && !isNaN(pricePerUnit)) {
                        const breakEvenUnits = fixedCosts / (pricePerUnit - variableCostPerUnit);
                        createBreakEvenChart(fixedCosts, variableCostPerUnit, pricePerUnit, breakEvenUnits, currentSalesUnits);
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