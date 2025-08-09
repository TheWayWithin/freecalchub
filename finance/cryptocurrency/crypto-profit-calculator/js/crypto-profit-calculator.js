// Crypto Profit/Loss Calculator JavaScript
// Author: FreecalcHub Calculator Development Team
// Version: 1.0

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        MAX_TRADES: 10,
        MAX_PRICE: 1000000,
        MAX_QUANTITY: 1000000,
        MAX_FEE_PERCENTAGE: 20,
        MAX_FEE_FLAT: 10000,
        MIN_QUANTITY: 0.00001,
        DECIMAL_PLACES: 8
    };

    // State management
    let trades = [];
    let currentTradeCount = 1;

    // DOM elements
    let elements = {};

    // Initialize calculator when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeCalculator();
    });

    function initializeCalculator() {
        // Cache DOM elements
        elements = {
            calculatorForm: document.getElementById('calculatorForm'),
            calculateButton: document.getElementById('calculateButton'),
            addTradeButton: document.getElementById('addTradeButton'),
            resetButton: document.getElementById('resetButton'),
            tradesContainer: document.getElementById('tradesContainer'),
            resultsSection: document.getElementById('resultsSection'),
            errorMessages: document.getElementById('errorMessages'),
            singleTradeResults: document.getElementById('singleTradeResults'),
            multipleTradeResults: document.getElementById('multipleTradeResults'),
            tradeBreakdown: document.getElementById('tradeBreakdown')
        };

        // Bind event listeners
        bindEventListeners();
        
        // Initialize first trade
        updateTradeNumbers();
        
        console.log('Crypto Profit/Loss Calculator initialized');
    }

    function bindEventListeners() {
        // Main action buttons
        elements.calculateButton.addEventListener('click', calculateResults);
        elements.addTradeButton.addEventListener('click', addTrade);
        elements.resetButton.addEventListener('click', resetCalculator);

        // Real-time calculation on input
        elements.tradesContainer.addEventListener('input', function(e) {
            if (e.target.type === 'number' || e.target.type === 'radio') {
                debounce(calculateResults, 500)();
            }
        });

        // Prevent form submission
        elements.calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateResults();
        });

        // Handle remove trade buttons (event delegation)
        elements.tradesContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-trade')) {
                const tradeIndex = parseInt(e.target.dataset.tradeIndex);
                removeTrade(tradeIndex);
            }
        });

        // Fee type change handlers (event delegation)
        elements.tradesContainer.addEventListener('change', function(e) {
            if (e.target.type === 'radio' && e.target.name.includes('fee_type')) {
                const tradeIndex = e.target.name.match(/\d+/)[0];
                updateFeeValidation(tradeIndex, e.target.name.includes('buy') ? 'buy' : 'sell');
            }
        });
    }

    function addTrade() {
        if (currentTradeCount >= CONFIG.MAX_TRADES) {
            showError([`Maximum of ${CONFIG.MAX_TRADES} trades allowed per calculation.`]);
            return;
        }

        const newTradeIndex = currentTradeCount;
        const tradeHTML = createTradeHTML(newTradeIndex);
        
        elements.tradesContainer.insertAdjacentHTML('beforeend', tradeHTML);
        currentTradeCount++;
        updateTradeNumbers();
        
        // Show remove buttons when there are multiple trades
        updateRemoveButtons();
        
        // Scroll to new trade
        const newTradeSection = document.querySelector(`[data-trade-index="${newTradeIndex}"]`);
        newTradeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function removeTrade(tradeIndex) {
        const tradeSection = document.querySelector(`[data-trade-index="${tradeIndex}"]`);
        if (!tradeSection) return;

        // Add removing animation class
        tradeSection.classList.add('removing');
        
        // Remove after animation
        setTimeout(() => {
            tradeSection.remove();
            currentTradeCount--;
            updateTradeNumbers();
            updateRemoveButtons();
            calculateResults();
        }, 300);
    }

    function createTradeHTML(index) {
        return `
        <div class="trade-section" data-trade-index="${index}">
            <h3>Trade #<span class="trade-number">${index + 1}</span></h3>
            <fieldset>
                <legend>Trade Details</legend>
                <div class="form-group">
                    <label for="crypto_symbol_${index}">Cryptocurrency Symbol (Optional):</label>
                    <input id="crypto_symbol_${index}" type="text" placeholder="BTC, ETH, ADA, etc." maxlength="10"/>
                </div>
                <div class="form-group">
                    <label for="purchase_price_${index}">Purchase Price ($):</label>
                    <input id="purchase_price_${index}" type="number" step="0.00001" min="0" max="${CONFIG.MAX_PRICE}" required placeholder="Enter purchase price"/>
                </div>
                <div class="form-group">
                    <label for="quantity_${index}">Quantity:</label>
                    <input id="quantity_${index}" type="number" step="0.00001" min="${CONFIG.MIN_QUANTITY}" max="${CONFIG.MAX_QUANTITY}" required placeholder="Enter quantity"/>
                </div>
                <div class="form-group">
                    <label for="sale_price_${index}">Sale Price ($):</label>
                    <input id="sale_price_${index}" type="number" step="0.00001" min="0" max="${CONFIG.MAX_PRICE}" required placeholder="Enter sale price"/>
                </div>
            </fieldset>

            <fieldset>
                <legend>Buy Fees</legend>
                <div class="form-group fee-type-group">
                    <label>Buy Fee Type:</label>
                    <div class="radio-group">
                        <label><input type="radio" name="buy_fee_type_${index}" value="percentage" checked> Percentage (%)</label>
                        <label><input type="radio" name="buy_fee_type_${index}" value="flat"> Flat Amount ($)</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="buy_fee_amount_${index}">Buy Fee Amount:</label>
                    <input id="buy_fee_amount_${index}" type="number" step="0.001" min="0" placeholder="0.25 for 0.25% or 5.00 for $5"/>
                </div>
            </fieldset>

            <fieldset>
                <legend>Sell Fees</legend>
                <div class="form-group fee-type-group">
                    <label>Sell Fee Type:</label>
                    <div class="radio-group">
                        <label><input type="radio" name="sell_fee_type_${index}" value="percentage" checked> Percentage (%)</label>
                        <label><input type="radio" name="sell_fee_type_${index}" value="flat"> Flat Amount ($)</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="sell_fee_amount_${index}">Sell Fee Amount:</label>
                    <input id="sell_fee_amount_${index}" type="number" step="0.001" min="0" placeholder="0.25 for 0.25% or 5.00 for $5"/>
                </div>
            </fieldset>

            <div class="trade-actions">
                <button type="button" class="btn btn-danger remove-trade" data-trade-index="${index}">Remove Trade</button>
            </div>
        </div>
        `;
    }

    function updateTradeNumbers() {
        const tradeSections = document.querySelectorAll('.trade-section');
        tradeSections.forEach((section, index) => {
            const tradeNumber = section.querySelector('.trade-number');
            if (tradeNumber) {
                tradeNumber.textContent = index + 1;
            }
        });
    }

    function updateRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-trade');
        const tradeSections = document.querySelectorAll('.trade-section');
        
        removeButtons.forEach(button => {
            button.style.display = tradeSections.length > 1 ? 'inline-block' : 'none';
        });
    }

    function updateFeeValidation(tradeIndex, feeType) {
        const feeAmountInput = document.getElementById(`${feeType}_fee_amount_${tradeIndex}`);
        const feeTypeValue = document.querySelector(`input[name="${feeType}_fee_type_${tradeIndex}"]:checked`).value;
        
        if (feeTypeValue === 'percentage') {
            feeAmountInput.max = CONFIG.MAX_FEE_PERCENTAGE;
            feeAmountInput.placeholder = '0.25 for 0.25%';
        } else {
            feeAmountInput.max = CONFIG.MAX_FEE_FLAT;
            feeAmountInput.placeholder = '5.00 for $5';
        }
    }

    function collectTradeData() {
        const tradeSections = document.querySelectorAll('.trade-section');
        trades = [];

        tradeSections.forEach((section, index) => {
            const tradeIndex = section.dataset.tradeIndex;
            const trade = {
                index: parseInt(tradeIndex),
                symbol: document.getElementById(`crypto_symbol_${tradeIndex}`)?.value.trim() || '',
                purchasePrice: parseFloat(document.getElementById(`purchase_price_${tradeIndex}`).value) || 0,
                quantity: parseFloat(document.getElementById(`quantity_${tradeIndex}`).value) || 0,
                salePrice: parseFloat(document.getElementById(`sale_price_${tradeIndex}`).value) || 0,
                buyFeeType: document.querySelector(`input[name="buy_fee_type_${tradeIndex}"]:checked`)?.value || 'percentage',
                buyFeeAmount: parseFloat(document.getElementById(`buy_fee_amount_${tradeIndex}`).value) || 0,
                sellFeeType: document.querySelector(`input[name="sell_fee_type_${tradeIndex}"]:checked`)?.value || 'percentage',
                sellFeeAmount: parseFloat(document.getElementById(`sell_fee_amount_${tradeIndex}`).value) || 0
            };

            trades.push(trade);
        });

        return trades;
    }

    function validateTradeData(trades) {
        const errors = [];

        trades.forEach((trade, index) => {
            const tradeNum = index + 1;

            // Required field validation
            if (trade.purchasePrice <= 0) {
                errors.push(`Trade ${tradeNum}: Purchase price must be greater than 0`);
            }
            if (trade.quantity <= 0) {
                errors.push(`Trade ${tradeNum}: Quantity must be greater than 0`);
            }
            if (trade.salePrice <= 0) {
                errors.push(`Trade ${tradeNum}: Sale price must be greater than 0`);
            }

            // Range validation
            if (trade.purchasePrice > CONFIG.MAX_PRICE) {
                errors.push(`Trade ${tradeNum}: Purchase price cannot exceed $${CONFIG.MAX_PRICE.toLocaleString()}`);
            }
            if (trade.salePrice > CONFIG.MAX_PRICE) {
                errors.push(`Trade ${tradeNum}: Sale price cannot exceed $${CONFIG.MAX_PRICE.toLocaleString()}`);
            }
            if (trade.quantity < CONFIG.MIN_QUANTITY) {
                errors.push(`Trade ${tradeNum}: Minimum quantity is ${CONFIG.MIN_QUANTITY}`);
            }
            if (trade.quantity > CONFIG.MAX_QUANTITY) {
                errors.push(`Trade ${tradeNum}: Maximum quantity is ${CONFIG.MAX_QUANTITY.toLocaleString()}`);
            }

            // Fee validation
            if (trade.buyFeeType === 'percentage' && trade.buyFeeAmount > CONFIG.MAX_FEE_PERCENTAGE) {
                errors.push(`Trade ${tradeNum}: Buy fee percentage cannot exceed ${CONFIG.MAX_FEE_PERCENTAGE}%`);
            }
            if (trade.buyFeeType === 'flat' && trade.buyFeeAmount > CONFIG.MAX_FEE_FLAT) {
                errors.push(`Trade ${tradeNum}: Buy fee amount cannot exceed $${CONFIG.MAX_FEE_FLAT.toLocaleString()}`);
            }
            if (trade.sellFeeType === 'percentage' && trade.sellFeeAmount > CONFIG.MAX_FEE_PERCENTAGE) {
                errors.push(`Trade ${tradeNum}: Sell fee percentage cannot exceed ${CONFIG.MAX_FEE_PERCENTAGE}%`);
            }
            if (trade.sellFeeType === 'flat' && trade.sellFeeAmount > CONFIG.MAX_FEE_FLAT) {
                errors.push(`Trade ${tradeNum}: Sell fee amount cannot exceed $${CONFIG.MAX_FEE_FLAT.toLocaleString()}`);
            }

            // Fee sanity check - fees shouldn't exceed trade value
            const tradeValue = Math.max(trade.purchasePrice * trade.quantity, trade.salePrice * trade.quantity);
            const maxReasonableFeePercent = 50; // 50% of trade value

            let buyFee = calculateFee(trade.purchasePrice * trade.quantity, trade.buyFeeType, trade.buyFeeAmount);
            let sellFee = calculateFee(trade.salePrice * trade.quantity, trade.sellFeeType, trade.sellFeeAmount);
            let totalFees = buyFee + sellFee;

            if (totalFees > (tradeValue * maxReasonableFeePercent / 100)) {
                errors.push(`Trade ${tradeNum}: Total fees (${formatCurrency(totalFees)}) exceed ${maxReasonableFeePercent}% of trade value. Please verify fee amounts.`);
            }
        });

        return errors;
    }

    function calculateFee(tradeValue, feeType, feeAmount) {
        if (feeAmount <= 0) return 0;
        
        if (feeType === 'percentage') {
            return tradeValue * (feeAmount / 100);
        } else {
            return feeAmount;
        }
    }

    function calculateTradeResults(trade) {
        const purchaseValue = trade.purchasePrice * trade.quantity;
        const saleValue = trade.salePrice * trade.quantity;
        
        const buyFee = calculateFee(purchaseValue, trade.buyFeeType, trade.buyFeeAmount);
        const sellFee = calculateFee(saleValue, trade.sellFeeType, trade.sellFeeAmount);
        const totalFees = buyFee + sellFee;
        
        const grossProfit = saleValue - purchaseValue;
        const grossProfitPercent = purchaseValue > 0 ? (grossProfit / purchaseValue) * 100 : 0;
        
        const netProfit = grossProfit - totalFees;
        const totalInvestment = purchaseValue + buyFee;
        const netProfitPercent = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
        
        // Calculate break-even price (sale price needed to break even after fees)
        const breakEvenSaleValue = purchaseValue + buyFee + sellFee;
        const breakEvenPrice = trade.quantity > 0 ? breakEvenSaleValue / trade.quantity : 0;
        
        return {
            trade: trade,
            purchaseValue,
            saleValue,
            buyFee,
            sellFee,
            totalFees,
            grossProfit,
            grossProfitPercent,
            netProfit,
            netProfitPercent,
            totalInvestment,
            breakEvenPrice,
            roi: netProfitPercent
        };
    }

    function calculateResults() {
        // Clear previous errors
        hideErrors();

        // Collect and validate data
        const tradeData = collectTradeData();
        const validationErrors = validateTradeData(tradeData);

        if (validationErrors.length > 0) {
            showError(validationErrors);
            hideResults();
            return;
        }

        // Calculate results for each trade
        const tradeResults = tradeData.map(trade => calculateTradeResults(trade));
        
        // Display results
        if (tradeResults.length === 1) {
            displaySingleTradeResults(tradeResults[0]);
        } else {
            displayMultipleTradeResults(tradeResults);
        }

        showResults();
    }

    function displaySingleTradeResults(result) {
        // Hide multiple trade results
        elements.multipleTradeResults.style.display = 'none';
        elements.tradeBreakdown.style.display = 'none';
        
        // Show single trade results
        elements.singleTradeResults.style.display = 'grid';
        
        // Update profit/loss indicators
        updateProfitLossIndicator(elements.singleTradeResults.querySelector('.profit-indicator'), result.netProfit);
        
        // Populate results
        document.getElementById('grossProfit').textContent = formatCurrency(result.grossProfit);
        document.getElementById('grossProfitPercent').textContent = `(${formatPercentage(result.grossProfitPercent)})`;
        document.getElementById('totalFees').textContent = formatCurrency(result.totalFees);
        document.getElementById('netProfit').textContent = formatCurrency(result.netProfit);
        document.getElementById('netProfitPercent').textContent = `(${formatPercentage(result.netProfitPercent)})`;
        document.getElementById('roi').textContent = formatPercentage(result.roi);
        document.getElementById('breakEvenPrice').textContent = formatCurrency(result.breakEvenPrice);
        document.getElementById('totalInvestment').textContent = formatCurrency(result.totalInvestment);
    }

    function displayMultipleTradeResults(results) {
        // Hide single trade results
        elements.singleTradeResults.style.display = 'none';
        
        // Show multiple trade results
        elements.multipleTradeResults.style.display = 'grid';
        elements.tradeBreakdown.style.display = 'block';
        
        // Calculate aggregated results
        const totalTrades = results.length;
        const totalInvestment = results.reduce((sum, result) => sum + result.totalInvestment, 0);
        const totalReturn = results.reduce((sum, result) => sum + result.saleValue, 0);
        const overallProfitLoss = results.reduce((sum, result) => sum + result.netProfit, 0);
        const overallProfitPercent = totalInvestment > 0 ? (overallProfitLoss / totalInvestment) * 100 : 0;
        const totalFees = results.reduce((sum, result) => sum + result.totalFees, 0);
        
        // Calculate weighted average buy price
        const totalQuantity = results.reduce((sum, result) => sum + result.trade.quantity, 0);
        const weightedPurchaseValue = results.reduce((sum, result) => sum + (result.trade.purchasePrice * result.trade.quantity), 0);
        const averageBuyPrice = totalQuantity > 0 ? weightedPurchaseValue / totalQuantity : 0;
        
        // Update profit/loss indicator
        updateProfitLossIndicator(elements.multipleTradeResults.querySelector('.profit-indicator'), overallProfitLoss);
        
        // Populate aggregated results
        document.getElementById('totalTrades').textContent = totalTrades.toString();
        document.getElementById('totalInvestmentMulti').textContent = formatCurrency(totalInvestment);
        document.getElementById('totalReturn').textContent = formatCurrency(totalReturn);
        document.getElementById('overallProfitLoss').textContent = formatCurrency(overallProfitLoss);
        document.getElementById('overallProfitPercent').textContent = `(${formatPercentage(overallProfitPercent)})`;
        document.getElementById('averageBuyPrice').textContent = formatCurrency(averageBuyPrice);
        document.getElementById('totalFeesMulti').textContent = formatCurrency(totalFees);
        
        // Display individual trade breakdown
        displayTradeBreakdown(results);
    }

    function displayTradeBreakdown(results) {
        const container = document.querySelector('.trade-breakdown-container');
        container.innerHTML = '';
        
        results.forEach((result, index) => {
            const tradeDiv = document.createElement('div');
            tradeDiv.className = 'individual-trade-result';
            
            const profitClass = result.netProfit > 0 ? 'profit' : result.netProfit < 0 ? 'loss' : '';
            const symbol = result.trade.symbol ? ` (${result.trade.symbol})` : '';
            
            tradeDiv.innerHTML = `
                <h5>Trade ${index + 1}${symbol}</h5>
                <div class="trade-summary">
                    <div class="trade-stat">
                        <div class="label">Purchase</div>
                        <div class="value">${formatCurrency(result.trade.purchasePrice)}</div>
                    </div>
                    <div class="trade-stat">
                        <div class="label">Sale</div>
                        <div class="value">${formatCurrency(result.trade.salePrice)}</div>
                    </div>
                    <div class="trade-stat">
                        <div class="label">Quantity</div>
                        <div class="value">${formatNumber(result.trade.quantity)}</div>
                    </div>
                    <div class="trade-stat">
                        <div class="label">Fees</div>
                        <div class="value">${formatCurrency(result.totalFees)}</div>
                    </div>
                    <div class="trade-stat ${profitClass}">
                        <div class="label">Net P/L</div>
                        <div class="value">${formatCurrency(result.netProfit)}</div>
                    </div>
                    <div class="trade-stat ${profitClass}">
                        <div class="label">ROI</div>
                        <div class="value">${formatPercentage(result.roi)}</div>
                    </div>
                </div>
            `;
            
            container.appendChild(tradeDiv);
        });
    }

    function updateProfitLossIndicator(element, profitValue) {
        if (!element) return;
        
        // Remove existing classes
        element.classList.remove('positive', 'negative', 'neutral');
        
        // Add appropriate class
        if (profitValue > 0) {
            element.classList.add('positive');
        } else if (profitValue < 0) {
            element.classList.add('negative');
        } else {
            element.classList.add('neutral');
        }
    }

    function resetCalculator() {
        // Clear all form inputs
        elements.calculatorForm.reset();
        
        // Remove all trades except the first one
        const tradeSections = document.querySelectorAll('.trade-section');
        tradeSections.forEach((section, index) => {
            if (index > 0) {
                section.remove();
            }
        });
        
        // Reset counters and state
        currentTradeCount = 1;
        trades = [];
        
        // Hide results and errors
        hideResults();
        hideErrors();
        
        // Update UI
        updateTradeNumbers();
        updateRemoveButtons();
    }

    function showResults() {
        elements.resultsSection.style.display = 'block';
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function hideResults() {
        elements.resultsSection.style.display = 'none';
    }

    function showError(errors) {
        const errorList = errors.map(error => `<li>${error}</li>`).join('');
        elements.errorMessages.innerHTML = `<ul>${errorList}</ul>`;
        elements.errorMessages.style.display = 'block';
        elements.errorMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideErrors() {
        elements.errorMessages.style.display = 'none';
        elements.errorMessages.innerHTML = '';
    }

    // Utility Functions
    function formatCurrency(amount) {
        if (Math.abs(amount) < 0.01 && amount !== 0) {
            return `$${amount.toFixed(CONFIG.DECIMAL_PLACES)}`;
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatPercentage(percent) {
        return `${percent.toFixed(2)}%`;
    }

    function formatNumber(number) {
        if (Math.abs(number) < 1 && number !== 0) {
            return number.toFixed(CONFIG.DECIMAL_PLACES);
        }
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        }).format(number);
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Export for testing (if needed)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            calculateTradeResults,
            calculateFee,
            formatCurrency,
            formatPercentage,
            validateTradeData
        };
    }

})();