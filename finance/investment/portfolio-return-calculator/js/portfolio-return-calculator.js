/*
 * FreecalcHub.com - Portfolio Return Calculator
 * Version: 1.0
 * Date: August 9, 2025
 * Description: Analyze portfolio returns, risk, and asset allocation
 */

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element References
    const form = document.getElementById("calculatorForm");
    const calculateButton = document.getElementById("calculateButton");
    const resetButton = document.getElementById("resetButton");
    const addAssetButton = document.getElementById("addAssetButton");
    const resultsSection = document.getElementById("resultsSection");
    const errorMessagesDiv = document.getElementById("errorMessages");

    // Input Elements
    const portfolioValueEl = document.getElementById("portfolioValue");
    const rebalanceThresholdEl = document.getElementById("rebalanceThreshold");
    const assetInputsEl = document.getElementById("assetInputs");
    const totalAllocationEl = document.getElementById("totalAllocation");

    // Result Display Elements
    const expectedReturnEl = document.getElementById("expectedReturn");
    const portfolioRiskEl = document.getElementById("portfolioRisk");
    const expectedGainEl = document.getElementById("expectedGain");
    const sharpeRatioEl = document.getElementById("sharpeRatio");
    const assetBreakdownEl = document.getElementById("assetBreakdown");
    const rebalancingContainerEl = document.getElementById("rebalancingContainer");
    const rebalancingSuggestionsEl = document.getElementById("rebalancingSuggestions");
    const chartContainerEl = document.getElementById("chartContainer");

    // Chart Instance
    let portfolioChartInstance = null;
    
    // Asset counter for dynamic additions
    let assetCounter = 0;
    
    // Predefined asset classes for easy addition
    const assetClasses = {
        reits: { name: "REITs", return: 6.5, volatility: 15 },
        commodities: { name: "Commodities", return: 5, volatility: 22 },
        cash: { name: "Cash & Equivalents", return: 2, volatility: 1 },
        emergingMarkets: { name: "Emerging Markets", return: 8.5, volatility: 25 },
        smallCap: { name: "Small Cap Stocks", return: 9, volatility: 22 }
    };

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
        updateTotalAllocation();
    });

    addAssetButton.addEventListener("click", () => {
        addNewAssetClass();
    });

    // Live allocation tracking
    assetInputsEl.addEventListener("input", (event) => {
        if (event.target.classList.contains("allocation-input")) {
            updateTotalAllocation();
        }
    });

    // --- Input Validation ---
    function validateInputs() {
        // Portfolio value validation
        const portfolioValue = parseFloat(portfolioValueEl.value);
        if (isNaN(portfolioValue) || portfolioValue <= 0) {
            showError("Please enter a valid portfolio value.");
            portfolioValueEl.focus();
            return false;
        }

        // Get all asset groups
        const assetGroups = document.querySelectorAll(".asset-group");
        let totalAllocation = 0;
        let hasValidAssets = false;

        for (const group of assetGroups) {
            const allocationInput = group.querySelector(".allocation-input");
            const returnInput = group.querySelector("input[id*='_return']");
            const volatilityInput = group.querySelector("input[id*='_volatility']");

            const allocation = parseFloat(allocationInput.value) || 0;
            const expectedReturn = parseFloat(returnInput.value);
            const volatility = parseFloat(volatilityInput.value);

            if (allocation > 0) {
                hasValidAssets = true;
                totalAllocation += allocation;

                if (isNaN(expectedReturn) || expectedReturn < 0 || expectedReturn > 50) {
                    showError("Expected returns must be between 0% and 50%.");
                    returnInput.focus();
                    return false;
                }

                if (isNaN(volatility) || volatility < 0 || volatility > 100) {
                    showError("Volatility must be between 0% and 100%.");
                    volatilityInput.focus();
                    return false;
                }
            }
        }

        if (!hasValidAssets) {
            showError("Please enter allocations for at least one asset class.");
            return false;
        }

        if (Math.abs(totalAllocation - 100) > 0.1) {
            showError(`Total allocation must equal 100%. Current total: ${totalAllocation.toFixed(1)}%`);
            return false;
        }

        return true;
    }

    // --- Main Calculation Function ---
    function calculateAndDisplay() {
        const portfolioValue = parseFloat(portfolioValueEl.value);
        const rebalanceThreshold = parseFloat(rebalanceThresholdEl.value) || 5;
        
        // Collect asset data
        const assets = [];
        const assetGroups = document.querySelectorAll(".asset-group");
        
        for (const group of assetGroups) {
            const allocationInput = group.querySelector(".allocation-input");
            const returnInput = group.querySelector("input[id*='_return']");
            const volatilityInput = group.querySelector("input[id*='_volatility']");
            
            const allocation = parseFloat(allocationInput.value) || 0;
            
            if (allocation > 0) {
                const assetName = group.querySelector("h4").textContent;
                const expectedReturn = parseFloat(returnInput.value) / 100;
                const volatility = parseFloat(volatilityInput.value) / 100;
                
                assets.push({
                    name: assetName,
                    allocation: allocation / 100,
                    expectedReturn: expectedReturn,
                    volatility: volatility,
                    value: portfolioValue * (allocation / 100)
                });
            }
        }

        // Calculate portfolio metrics
        const portfolioMetrics = calculatePortfolioMetrics(assets);
        
        // Display results
        displayResults(portfolioMetrics, portfolioValue, rebalanceThreshold);
    }

    // --- Portfolio Calculations ---
    function calculatePortfolioMetrics(assets) {
        // Weighted average return
        const portfolioReturn = assets.reduce((sum, asset) => {
            return sum + (asset.allocation * asset.expectedReturn);
        }, 0);

        // Portfolio volatility (simplified - assumes zero correlation)
        const portfolioVolatility = Math.sqrt(
            assets.reduce((sum, asset) => {
                return sum + Math.pow(asset.allocation * asset.volatility, 2);
            }, 0)
        );

        // Sharpe ratio (assuming 2% risk-free rate)
        const riskFreeRate = 0.02;
        const sharpeRatio = (portfolioReturn - riskFreeRate) / portfolioVolatility;

        return {
            expectedReturn: portfolioReturn,
            volatility: portfolioVolatility,
            sharpeRatio: sharpeRatio,
            assets: assets
        };
    }

    // --- Display Results ---
    function displayResults(metrics, portfolioValue, rebalanceThreshold) {
        // Main metrics
        expectedReturnEl.textContent = formatPercentage(metrics.expectedReturn);
        portfolioRiskEl.textContent = formatPercentage(metrics.volatility);
        expectedGainEl.textContent = formatCurrency(portfolioValue * metrics.expectedReturn);
        sharpeRatioEl.textContent = metrics.sharpeRatio.toFixed(2);

        // Asset breakdown
        displayAssetBreakdown(metrics.assets);

        // Check for rebalancing needs
        checkRebalancingNeeds(metrics.assets, rebalanceThreshold);

        // Create portfolio visualization
        createPortfolioChart(metrics.assets);

        // Show results
        resultsSection.style.display = "block";
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // --- Asset Breakdown Display ---
    function displayAssetBreakdown(assets) {
        assetBreakdownEl.innerHTML = "";
        
        assets.forEach(asset => {
            const breakdownItem = document.createElement("div");
            breakdownItem.className = "asset-breakdown-item";
            
            const riskLevel = getRiskLevel(asset.volatility);
            
            breakdownItem.innerHTML = `
                <h5>${asset.name}</h5>
                <div class="asset-stats">
                    <span>Allocation:</span>
                    <span class="asset-value">${formatPercentage(asset.allocation)}</span>
                </div>
                <div class="asset-stats">
                    <span>Value:</span>
                    <span class="asset-value">${formatCurrency(asset.value)}</span>
                </div>
                <div class="asset-stats">
                    <span>Expected Return:</span>
                    <span class="asset-value">${formatPercentage(asset.expectedReturn)}</span>
                </div>
                <div class="asset-stats">
                    <span>Risk Level:</span>
                    <span class="risk-indicator ${riskLevel.toLowerCase()}">${riskLevel}</span>
                </div>
            `;
            
            assetBreakdownEl.appendChild(breakdownItem);
        });
    }

    // --- Rebalancing Analysis ---
    function checkRebalancingNeeds(assets, threshold) {
        // For demonstration, simulate some drift from target allocations
        // In a real application, this would compare current vs target allocations
        const driftSimulation = Math.random() > 0.7; // 30% chance of showing rebalancing needs
        
        if (driftSimulation) {
            const suggestions = [];
            
            // Simulate some rebalancing suggestions
            assets.forEach(asset => {
                if (Math.random() > 0.6) {
                    const action = Math.random() > 0.5 ? "buy" : "sell";
                    const amount = asset.value * (0.02 + Math.random() * 0.05);
                    suggestions.push({
                        asset: asset.name,
                        action: action,
                        amount: amount
                    });
                }
            });

            if (suggestions.length > 0) {
                displayRebalancingSuggestions(suggestions);
                rebalancingContainerEl.style.display = "block";
            }
        } else {
            rebalancingContainerEl.style.display = "none";
        }
    }

    // --- Rebalancing Suggestions Display ---
    function displayRebalancingSuggestions(suggestions) {
        rebalancingSuggestionsEl.innerHTML = "";
        
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement("div");
            suggestionItem.className = "rebalancing-item";
            
            suggestionItem.innerHTML = `
                <span>${suggestion.asset}</span>
                <span class="rebalancing-action ${suggestion.action}">
                    ${suggestion.action.toUpperCase()} ${formatCurrency(suggestion.amount)}
                </span>
            `;
            
            rebalancingSuggestionsEl.appendChild(suggestionItem);
        });
    }

    // --- Chart Creation ---
    function createPortfolioChart(assets) {
        const ctx = document.getElementById("portfolioChart");
        if (!ctx) return;

        destroyChart();

        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
            '#9b59b6', '#95a5a6', '#1abc9c', '#e67e22'
        ];

        const config = {
            type: 'doughnut',
            data: {
                labels: assets.map(asset => asset.name),
                datasets: [{
                    data: assets.map(asset => asset.allocation * 100),
                    backgroundColor: colors.slice(0, assets.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const asset = assets[context.dataIndex];
                                return `${context.label}: ${context.parsed}% (${formatCurrency(asset.value)})`;
                            }
                        }
                    }
                }
            }
        };

        if (typeof Chart !== 'undefined') {
            portfolioChartInstance = new Chart(ctx, config);
            chartContainerEl.style.display = "block";
        }
    }

    // --- Dynamic Asset Addition ---
    function addNewAssetClass() {
        const availableAssets = Object.keys(assetClasses).filter(key => 
            !document.querySelector(`[data-asset="${key}"]`)
        );

        if (availableAssets.length === 0) {
            showError("All predefined asset classes have been added. You can modify existing ones.");
            return;
        }

        const assetKey = availableAssets[0];
        const assetData = assetClasses[assetKey];
        
        const assetGroup = document.createElement("div");
        assetGroup.className = "asset-group new-asset";
        assetGroup.setAttribute("data-asset", assetKey);
        
        assetGroup.innerHTML = `
            <h4>${assetData.name} <button type="button" class="remove-asset">Remove</button></h4>
            <div class="asset-inputs">
                <div class="form-group">
                    <label for="${assetKey}_allocation">Allocation (%):</label>
                    <input id="${assetKey}_allocation" type="number" step="0.1" min="0" max="100" placeholder="0" class="allocation-input"/>
                </div>
                <div class="form-group">
                    <label for="${assetKey}_return">Expected Return (%):</label>
                    <input id="${assetKey}_return" type="number" step="0.1" min="0" max="50" value="${assetData.return}"/>
                </div>
                <div class="form-group">
                    <label for="${assetKey}_volatility">Volatility (%):</label>
                    <input id="${assetKey}_volatility" type="number" step="0.1" min="0" max="100" value="${assetData.volatility}"/>
                </div>
            </div>
        `;

        // Add remove functionality
        assetGroup.querySelector(".remove-asset").addEventListener("click", () => {
            assetGroup.remove();
            updateTotalAllocation();
        });

        // Add allocation tracking
        assetGroup.querySelector(".allocation-input").addEventListener("input", updateTotalAllocation);

        assetInputsEl.appendChild(assetGroup);
        updateTotalAllocation();
    }

    // --- Update Total Allocation ---
    function updateTotalAllocation() {
        const allocationInputs = document.querySelectorAll(".allocation-input");
        let total = 0;
        
        allocationInputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            total += value;
        });
        
        totalAllocationEl.textContent = `${total.toFixed(1)}%`;
        
        const summaryEl = document.getElementById("allocationSummary");
        summaryEl.className = "allocation-summary";
        
        if (Math.abs(total - 100) < 0.1) {
            summaryEl.classList.add("allocation-success");
        } else if (total > 100) {
            summaryEl.classList.add("allocation-error");
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

    function getRiskLevel(volatility) {
        if (volatility < 0.1) return "Low";
        if (volatility < 0.2) return "Medium";
        return "High";
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
        if (portfolioChartInstance) {
            portfolioChartInstance.destroy();
            portfolioChartInstance = null;
        }
        chartContainerEl.style.display = "none";
    }

    // --- Initialize ---
    updateTotalAllocation();

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