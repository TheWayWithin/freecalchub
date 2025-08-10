/*
 * FreecalcHub.com - Business ROI Calculator
 * Version: 1.0
 * Date: August 9, 2025
 * Description: Calculate business ROI with multiple methods including NPV, payback period, and investment assessment
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");
    const cashFlowSection = document.getElementById("cashFlowSection");
    const scenarioCards = document.getElementById("scenarioCards");

    // Input Elements
    const initialInvestmentEl = document.getElementById("initialInvestment");
    const finalValueEl = document.getElementById("finalValue");
    const investmentPeriodEl = document.getElementById("investmentPeriod");
    const annualCashFlowEl = document.getElementById("annualCashFlow");
    const discountRateEl = document.getElementById("discountRate");

    // Result Display Elements
    const simpleROIEl = document.getElementById("simpleROI");
    const annualizedROIEl = document.getElementById("annualizedROI");
    const totalProfitEl = document.getElementById("totalProfit");
    const paybackPeriodEl = document.getElementById("paybackPeriod");
    const netPresentValueEl = document.getElementById("netPresentValue");
    const profitabilityIndexEl = document.getElementById("profitabilityIndex");
    const assessmentIconEl = document.getElementById("assessmentIcon");
    const assessmentTitleEl = document.getElementById("assessmentTitle");
    const assessmentDescriptionEl = document.getElementById("assessmentDescription");
    const considerationsListEl = document.getElementById("considerationsList");

    // Chart Instance
    let roiChartInstance = null;

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
        const initialInvestment = parseFloat(initialInvestmentEl.value);
        const finalValue = parseFloat(finalValueEl.value);
        const investmentPeriod = parseFloat(investmentPeriodEl.value);
        const annualCashFlow = parseFloat(annualCashFlowEl.value) || 0;
        const discountRate = parseFloat(discountRateEl.value) || 0;

        // Check for required fields
        if (isNaN(initialInvestment) || initialInvestment <= 0) {
            showError("Please enter valid initial investment (must be greater than 0).");
            return false;
        }

        if (isNaN(finalValue) || finalValue <= 0) {
            showError("Please enter valid final value (must be greater than 0).");
            return false;
        }

        if (isNaN(investmentPeriod) || investmentPeriod <= 0) {
            showError("Please enter valid investment period (must be greater than 0).");
            return false;
        }

        // Validate optional fields
        if (annualCashFlow < 0) {
            showError("Annual cash flow must be 0 or greater if provided.");
            return false;
        }

        if (discountRate < 0 || discountRate > 100) {
            showError("Discount rate must be between 0 and 100 if provided.");
            return false;
        }

        return true;
    }

    // Main calculation function
    function calculateAndDisplay() {
        try {
            const initialInvestment = parseFloat(initialInvestmentEl.value);
            const finalValue = parseFloat(finalValueEl.value);
            const investmentPeriod = parseFloat(investmentPeriodEl.value);
            const annualCashFlow = parseFloat(annualCashFlowEl.value) || 0;
            const discountRate = parseFloat(discountRateEl.value) || 0;

            // Calculate basic ROI metrics
            const totalProfit = finalValue - initialInvestment;
            const simpleROI = (totalProfit / initialInvestment) * 100;
            const annualizedROI = (Math.pow(finalValue / initialInvestment, 1 / investmentPeriod) - 1) * 100;

            // Update basic results
            simpleROIEl.textContent = formatPercentage(simpleROI);
            simpleROIEl.className = getROIClass(simpleROI);
            
            annualizedROIEl.textContent = formatPercentage(annualizedROI);
            annualizedROIEl.className = getROIClass(annualizedROI);
            
            totalProfitEl.textContent = formatCurrency(totalProfit);
            totalProfitEl.className = totalProfit >= 0 ? "roi-excellent" : "roi-poor";

            // Calculate advanced metrics if cash flow is provided
            if (annualCashFlow > 0) {
                const paybackPeriod = initialInvestment / annualCashFlow;
                const npv = calculateNPV(initialInvestment, annualCashFlow, investmentPeriod, discountRate);
                const profitabilityIndex = (npv + initialInvestment) / initialInvestment;

                paybackPeriodEl.textContent = formatNumber(paybackPeriod, 1) + " years";
                
                netPresentValueEl.textContent = formatCurrency(npv);
                netPresentValueEl.className = npv >= 0 ? "npv-positive" : "npv-negative";
                
                profitabilityIndexEl.textContent = formatNumber(profitabilityIndex, 2);
                profitabilityIndexEl.className = profitabilityIndex >= 1 ? "roi-excellent" : "roi-poor";

                cashFlowSection.style.display = "block";
            } else {
                cashFlowSection.style.display = "none";
            }

            // Generate investment assessment
            generateInvestmentAssessment(simpleROI, annualizedROI, annualCashFlow > 0, {
                initialInvestment,
                finalValue,
                investmentPeriod,
                annualCashFlow,
                discountRate,
                totalProfit
            });

            // Create visualization chart
            createROIChart(initialInvestment, finalValue, investmentPeriod, annualCashFlow);

            // Generate scenario comparison
            generateScenarioComparison(initialInvestment, investmentPeriod);

            // Show results
            resultsSection.style.display = "block";

        } catch (error) {
            showError("Error calculating ROI: " + error.message);
        }
    }

    // Calculate Net Present Value
    function calculateNPV(initialInvestment, annualCashFlow, period, discountRate) {
        if (discountRate === 0) {
            return (annualCashFlow * period) - initialInvestment;
        }

        const discountFactor = discountRate / 100;
        let npv = -initialInvestment;
        
        for (let year = 1; year <= period; year++) {
            npv += annualCashFlow / Math.pow(1 + discountFactor, year);
        }
        
        return npv;
    }

    // Get ROI performance class
    function getROIClass(roi) {
        if (roi >= 20) return "roi-excellent";
        if (roi >= 15) return "roi-good";
        if (roi >= 10) return "roi-fair";
        return "roi-poor";
    }

    // Generate investment assessment
    function generateInvestmentAssessment(simpleROI, annualizedROI, hasCashFlow, data) {
        let assessment, icon, description, considerations = [];

        // Determine overall assessment
        if (annualizedROI >= 20) {
            assessment = "Excellent Investment";
            icon = "🎯";
            description = "This investment shows exceptional returns well above market averages. The annualized ROI suggests strong value creation potential.";
            considerations = [
                "Verify assumptions and projections are realistic",
                "Consider risk factors that could impact returns",
                "Evaluate alignment with business strategy",
                "Compare against alternative investment opportunities"
            ];
        } else if (annualizedROI >= 15) {
            assessment = "Good Investment";
            icon = "✅";
            description = "This investment demonstrates solid returns above typical market benchmarks. The ROI justifies the capital allocation.";
            considerations = [
                "Review risk-return profile carefully",
                "Ensure sufficient liquidity for investment period",
                "Monitor key performance indicators closely",
                "Consider diversification across investment types"
            ];
        } else if (annualizedROI >= 10) {
            assessment = "Fair Investment";
            icon = "⚖️";
            description = "This investment provides moderate returns that meet basic profitability thresholds but may not significantly outperform alternatives.";
            considerations = [
                "Evaluate if returns justify the opportunity cost",
                "Look for ways to improve ROI through optimization",
                "Consider shorter time horizons or different strategies",
                "Assess competitive landscape and market conditions"
            ];
        } else if (annualizedROI >= 0) {
            assessment = "Marginal Investment";
            icon = "⚠️";
            description = "This investment generates positive but low returns that may not adequately compensate for risk and opportunity cost.";
            considerations = [
                "Consider alternative investments with better returns",
                "Evaluate non-financial benefits and strategic value",
                "Look for ways to reduce costs or increase returns",
                "Assess exit strategies if performance doesn't improve"
            ];
        } else {
            assessment = "Poor Investment";
            icon = "❌";
            description = "This investment shows negative returns, indicating a loss of capital. Serious consideration should be given to alternatives.";
            considerations = [
                "Re-evaluate assumptions and projections",
                "Consider abandoning or restructuring the investment",
                "Seek professional advice on loss mitigation",
                "Focus on preserving remaining capital"
            ];
        }

        // Add cash flow specific considerations
        if (hasCashFlow) {
            considerations.push("Monitor actual vs. projected cash flows regularly");
            if (data.discountRate > 0) {
                considerations.push("NPV analysis accounts for time value of money");
            }
        }

        // Update assessment display
        assessmentIconEl.textContent = icon;
        assessmentTitleEl.textContent = assessment;
        assessmentDescriptionEl.textContent = description;
        
        considerationsListEl.innerHTML = considerations.map(consideration => 
            `<li>${consideration}</li>`
        ).join('');
    }

    // Create ROI visualization chart
    function createROIChart(initialInvestment, finalValue, investmentPeriod, annualCashFlow) {
        const ctx = document.getElementById('roiChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (roiChartInstance) {
            roiChartInstance.destroy();
        }

        // Generate yearly growth data
        const yearlyData = [];
        const annualGrowthRate = Math.pow(finalValue / initialInvestment, 1 / investmentPeriod) - 1;
        
        for (let year = 0; year <= investmentPeriod; year++) {
            const value = initialInvestment * Math.pow(1 + annualGrowthRate, year);
            yearlyData.push({
                x: year,
                y: value
            });
        }

        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#e5e7eb' : '#374151';
        const gridColor = isDarkMode ? '#374151' : '#e5e7eb';

        const datasets = [
            {
                label: 'Investment Value',
                data: yearlyData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }
        ];

        // Add cash flow line if provided
        if (annualCashFlow > 0) {
            const cashFlowData = [];
            let cumulativeCashFlow = -initialInvestment;
            
            for (let year = 0; year <= investmentPeriod; year++) {
                if (year > 0) {
                    cumulativeCashFlow += annualCashFlow;
                }
                cashFlowData.push({
                    x: year,
                    y: Math.max(0, cumulativeCashFlow)
                });
            }
            
            datasets.push({
                label: 'Cumulative Cash Flow',
                data: cashFlowData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: false,
                borderDash: [5, 5],
                tension: 0.4
            });
        }

        roiChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
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
                        text: 'Investment Growth Over Time',
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
                            text: 'Years',
                            color: textColor
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        },
                        grid: {
                            color: gridColor
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value ($)',
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
                        radius: 4,
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    // Generate scenario comparison
    function generateScenarioComparison(initialInvestment, investmentPeriod) {
        const scenarios = [
            { name: "Conservative", growth: 0.08, description: "8% annual return" },
            { name: "Moderate", growth: 0.12, description: "12% annual return" },
            { name: "Aggressive", growth: 0.18, description: "18% annual return" }
        ];

        const scenarioHtml = scenarios.map(scenario => {
            const finalValue = initialInvestment * Math.pow(1 + scenario.growth, investmentPeriod);
            const totalReturn = finalValue - initialInvestment;
            const roi = ((finalValue - initialInvestment) / initialInvestment) * 100;
            
            return `
                <div class="scenario-card">
                    <h6>${scenario.name} Scenario</h6>
                    <div class="scenario-metric">
                        <span class="scenario-label">Annual Return:</span>
                        <span class="scenario-value">${formatPercentage(scenario.growth * 100)}</span>
                    </div>
                    <div class="scenario-metric">
                        <span class="scenario-label">Final Value:</span>
                        <span class="scenario-value">${formatCurrency(finalValue)}</span>
                    </div>
                    <div class="scenario-metric">
                        <span class="scenario-label">Total Profit:</span>
                        <span class="scenario-value">${formatCurrency(totalReturn)}</span>
                    </div>
                    <div class="scenario-metric">
                        <span class="scenario-label">Total ROI:</span>
                        <span class="scenario-value ${getROIClass(roi)}">${formatPercentage(roi)}</span>
                    </div>
                </div>
            `;
        }).join('');

        scenarioCards.innerHTML = scenarioHtml;
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

    function formatNumber(number, decimals = 0) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
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
        cashFlowSection.style.display = "none";
        hideError();
        
        // Destroy chart
        if (roiChartInstance) {
            roiChartInstance.destroy();
            roiChartInstance = null;
        }
        
        // Reset result displays
        simpleROIEl.textContent = "--";
        annualizedROIEl.textContent = "--";
        totalProfitEl.textContent = "--";
        paybackPeriodEl.textContent = "--";
        netPresentValueEl.textContent = "--";
        profitabilityIndexEl.textContent = "--";
        assessmentIconEl.textContent = "--";
        assessmentTitleEl.textContent = "--";
        assessmentDescriptionEl.textContent = "--";
        considerationsListEl.innerHTML = "";
        scenarioCards.innerHTML = "";
        
        // Reset classes
        [simpleROIEl, annualizedROIEl, totalProfitEl, netPresentValueEl, profitabilityIndexEl].forEach(el => {
            el.className = "";
        });
    }

    // Handle dark mode changes for chart
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                if (roiChartInstance) {
                    // Recreate chart with new theme colors
                    const initialInvestment = parseFloat(initialInvestmentEl.value);
                    const finalValue = parseFloat(finalValueEl.value);
                    const investmentPeriod = parseFloat(investmentPeriodEl.value);
                    const annualCashFlow = parseFloat(annualCashFlowEl.value) || 0;
                    
                    if (!isNaN(initialInvestment) && !isNaN(finalValue) && !isNaN(investmentPeriod)) {
                        createROIChart(initialInvestment, finalValue, investmentPeriod, annualCashFlow);
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