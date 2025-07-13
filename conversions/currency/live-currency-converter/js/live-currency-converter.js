/*
 * FreecalcHub.com - Live Currency Converter
 * Version: 1.0
 * Date Created: June 2, 2025 
 * Description: Fetches exchange rates and performs live currency conversions.
 */

document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amountInput');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const swapButton = document.getElementById('swapButton');
    const resetButton = document.getElementById('resetButton');
    const calculatorForm = document.getElementById('calculatorForm');

    const resultsSection = document.getElementById('resultsSection');
    const fromAmountDisplay = document.getElementById('fromAmountDisplay');
    const fromCurrencyDisplay = document.getElementById('fromCurrencyDisplay');
    const toAmountDisplay = document.getElementById('toAmountDisplay');
    const toCurrencyDisplay = document.getElementById('toCurrencyDisplay');
    const rateDisplay = document.getElementById('rateDisplay');
    const inverseRateDisplay = document.getElementById('inverseRateDisplay');
    const rateTimestamp = document.getElementById('rateTimestamp');
    const errorMessagesDiv = document.getElementById('errorMessages');

    const API_BASE_URL = 'https://open.er-api.com/v6/latest/';
    let exchangeRates = null;
    let ratesLastUpdateTimestamp = null;
    let baseCurrencyForRates = 'USD';

    const currencies = [
        { code: "USD", name: "US Dollar" }, { code: "EUR", name: "Euro" }, { code: "JPY", name: "Japanese Yen" },
        { code: "GBP", name: "British Pound" }, { code: "AUD", name: "Australian Dollar" }, { code: "CAD", name: "Canadian Dollar" },
        { code: "CHF", name: "Swiss Franc" }, { code: "CNY", name: "Chinese Yuan Renminbi" }, { code: "INR", name: "Indian Rupee" },
        { code: "BRL", name: "Brazilian Real" }, { code: "RUB", name: "Russian Ruble" }, { code: "ZAR", name: "South African Rand" },
        { code: "MXN", name: "Mexican Peso" }, { code: "SGD", name: "Singapore Dollar" }, { code: "NZD", name: "New Zealand Dollar" },
        { code: "HKD", name: "Hong Kong Dollar" }, { code: "NOK", name: "Norwegian Krone" }, { code: "SEK", name: "Swedish Krona" },
        { code: "KRW", name: "South Korean Won" }, { code: "TRY", name: "Turkish Lira" }
    ];

    function populateDropdowns() {
        currencies.forEach(currency => {
            const optionFrom = new Option(`${currency.code} - ${currency.name}`, currency.code);
            const optionTo = new Option(`${currency.code} - ${currency.name}`, currency.code);
            if (!fromCurrencySelect.querySelector(`option[value="${currency.code}"]`)) {
                 fromCurrencySelect.add(optionFrom);
            }
            if (!toCurrencySelect.querySelector(`option[value="${currency.code}"]`)) {
                toCurrencySelect.add(optionTo);
            }
        });
    }

    async function fetchExchangeRates(baseCurrency = 'USD') {
        try {
            const response = await fetch(`${API_BASE_URL}${baseCurrency}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            
            const data = await response.json();
            if (!data.rates) throw new Error('Invalid API response structure');
            
            exchangeRates = data.rates;
            baseCurrencyForRates = baseCurrency;
            ratesLastUpdateTimestamp = data.time_last_update_unix ? new Date(data.time_last_update_unix * 1000) : new Date();
            
            localStorage.setItem('exchangeRatesData', JSON.stringify({
                rates: exchangeRates,
                lastUpdate: ratesLastUpdateTimestamp.toISOString(),
                base: baseCurrencyForRates
            }));
            
            clearErrors(); 
            convertAndDisplay(); 
            updateRateTimestamp();

        } catch (error) {
            displayError(`Error fetching rates: ${error.message}. Please check your internet connection or try again later.`);
            loadRatesFromCache();
        }
    }

    function loadRatesFromCache() {
        const cachedData = localStorage.getItem('exchangeRatesData');
        if (cachedData) {
            try {
                const data = JSON.parse(cachedData);
                const cacheTimestamp = new Date(data.lastUpdate);
                if ((new Date() - cacheTimestamp) < 3600000 && data.rates && Object.keys(data.rates).length > 0) { 
                    exchangeRates = data.rates;
                    ratesLastUpdateTimestamp = cacheTimestamp;
                    baseCurrencyForRates = data.base;
                    clearErrors();
                    convertAndDisplay();
                    updateRateTimestamp();
                    return true;
                } else {
                    localStorage.removeItem('exchangeRatesData');
                }
            } catch (e) {
                localStorage.removeItem('exchangeRatesData');
            }
        }
        return false;
    }

    function clearErrors() {
        if (errorMessagesDiv) {
            errorMessagesDiv.textContent = '';
            errorMessagesDiv.style.display = 'none';
            errorMessagesDiv.style.color = '';
            errorMessagesDiv.style.padding = '';
            errorMessagesDiv.style.height = '';
            errorMessagesDiv.style.opacity = '';
        }
        if (amountInput) amountInput.classList.remove('input-error');
    }

    function displayError(message, isHardError = true) {
        if (errorMessagesDiv) {
            errorMessagesDiv.textContent = message;
            errorMessagesDiv.style.display = 'block';
            errorMessagesDiv.style.color = 'red';
            errorMessagesDiv.style.padding = '10px';
            errorMessagesDiv.style.border = '1px solid red';
            errorMessagesDiv.style.height = 'auto';
            errorMessagesDiv.style.opacity = '1';
        }
        if (resultsSection) resultsSection.style.display = 'none';
    }
    
    function formatValue(value, decimals = 4) {
        if (isNaN(value) || value === null || value === undefined) return '--';
        let formatted = parseFloat(value.toFixed(8)); 
        if (Math.abs(formatted) < 0.000001 && formatted !== 0) {
             return formatted.toExponential(4);
        }
        return parseFloat(formatted.toFixed(decimals)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: decimals});
    }

    function convertAndDisplay() {
        if (!exchangeRates || Object.keys(exchangeRates).length === 0) {
            displayError("Exchange rates are currently unavailable or loading. Please wait or try again shortly.", false);
            if (!loadRatesFromCache()) { 
                fetchExchangeRates(fromCurrencySelect.value || 'USD');
            }
            return; 
        }
        
        clearErrors(); 

        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount)) {
            if (amountInput.value.trim() !== "") {
                displayError("Please enter a valid amount.");
            } else {
                hideResults();
            }
            return;
        }
        if (amount < 0) {
            displayError("Amount cannot be negative.");
            return;
        }

        const rateFrom = exchangeRates[fromCurrency];
        const rateTo = exchangeRates[toCurrency];

        if (rateFrom === undefined || rateTo === undefined) {
            displayError(`Rate for ${fromCurrency} or ${toCurrency} not available. Base: ${baseCurrencyForRates}. Rates might be updating.`);
            if (baseCurrencyForRates !== 'USD' && fromCurrencySelect.value !== baseCurrencyForRates) {
                fetchExchangeRates('USD');
            }
            return;
        }
        
        let convertedAmount;
        if (baseCurrencyForRates === fromCurrency) {
            convertedAmount = amount * rateTo;
        } else if (baseCurrencyForRates === toCurrency) {
            convertedAmount = amount / rateFrom;
        } else {
            convertedAmount = (amount / rateFrom) * rateTo;
        }

        fromAmountDisplay.textContent = formatValue(amount, 2);
        fromCurrencyDisplay.textContent = fromCurrency;
        toAmountDisplay.textContent = formatValue(convertedAmount, 2);
        toCurrencyDisplay.textContent = toCurrency;

        const directRate = rateTo / rateFrom;
        const inverseRate = rateFrom / rateTo;

        rateDisplay.textContent = `1 ${fromCurrency} = ${formatValue(directRate, 6)} ${toCurrency}`;
        inverseRateDisplay.textContent = `1 ${toCurrency} = ${formatValue(inverseRate, 6)} ${fromCurrency}`;
        
        if (resultsSection) resultsSection.style.display = 'block';
        updateRateTimestamp();
    }
    
    function updateRateTimestamp() {
        if (rateTimestamp) {
            if (ratesLastUpdateTimestamp) {
                rateTimestamp.textContent = `Rates last updated: ${ratesLastUpdateTimestamp.toLocaleString()}`;
            } else {
                rateTimestamp.textContent = "Rates last updated: Fetching...";
            }
        }
    }

    function hideResults() {
        if (resultsSection) resultsSection.style.display = 'none';
        if (fromAmountDisplay) fromAmountDisplay.textContent = '--';
        if (fromCurrencyDisplay) fromCurrencyDisplay.textContent = '---';
        if (toAmountDisplay) toAmountDisplay.textContent = '--';
        if (toCurrencyDisplay) toCurrencyDisplay.textContent = '---';
        if (rateDisplay) rateDisplay.textContent = '1 --- = -- ---';
        if (inverseRateDisplay) inverseRateDisplay.textContent = '1 --- = -- ---';
    }

    function swapCurrencies() {
        const tempValue = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempValue;
        convertAndDisplay();
    }

    function handleReset() {
        if (calculatorForm) calculatorForm.reset();
        if (amountInput) amountInput.value = "";
        if (fromCurrencySelect) fromCurrencySelect.value = "USD";
        if (toCurrencySelect) toCurrencySelect.value = "EUR";
        clearErrors();
        hideResults();
        updateRateTimestamp(); 
    }

    // Event Listeners
    if (amountInput) amountInput.addEventListener('input', convertAndDisplay);
    if (fromCurrencySelect) fromCurrencySelect.addEventListener('change', convertAndDisplay);
    if (toCurrencySelect) toCurrencySelect.addEventListener('change', convertAndDisplay);
    if (swapButton) swapButton.addEventListener('click', swapCurrencies);
    if (resetButton) resetButton.addEventListener('click', handleReset);

    // Initial Setup
    hideResults(); 

    if (!loadRatesFromCache()) {
        fetchExchangeRates(fromCurrencySelect.value || 'USD');
    } else {
        if(amountInput && amountInput.value && exchangeRates && Object.keys(exchangeRates).length > 0) {
            convertAndDisplay();
        }
    }
});