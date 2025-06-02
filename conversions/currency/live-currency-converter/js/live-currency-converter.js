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
    const calculatorForm = document.getElementById('calculatorForm'); // FCH DEBUG: Added for reset function

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

    const currencies = [ // FCH DEBUG: This list is fine, but populateDropdowns might be redundant if HTML is hardcoded
        { code: "USD", name: "US Dollar" }, { code: "EUR", name: "Euro" }, { code: "JPY", name: "Japanese Yen" },
        { code: "GBP", name: "British Pound" }, { code: "AUD", name: "Australian Dollar" }, { code: "CAD", name: "Canadian Dollar" },
        { code: "CHF", name: "Swiss Franc" }, { code: "CNY", name: "Chinese Yuan Renminbi" }, { code: "INR", name: "Indian Rupee" },
        { code: "BRL", name: "Brazilian Real" }, { code: "RUB", name: "Russian Ruble" }, { code: "ZAR", name: "South African Rand" },
        { code: "MXN", name: "Mexican Peso" }, { code: "SGD", name: "Singapore Dollar" }, { code: "NZD", name: "New Zealand Dollar" },
        { code: "HKD", name: "Hong Kong Dollar" }, { code: "NOK", name: "Norwegian Krone" }, { code: "SEK", name: "Swedish Krona" },
        { code: "KRW", name: "South Korean Won" }, { code: "TRY", name: "Turkish Lira" }
    ];

    function populateDropdowns() {
        // FCH DEBUG: As HTML is pre-populated, this function creates duplicates.
        // We will address this as a separate bug fix. For now, leaving it to observe.
        // A proper fix would be to remove this function call if HTML is the source of truth for options.
        currencies.forEach(currency => {
            const optionFrom = new Option(`${currency.code} - ${currency.name}`, currency.code);
            const optionTo = new Option(`${currency.code} - ${currency.name}`, currency.code);
            // Ensure not to add if already exists from HTML - this is a quick check, better to not call if HTML is static
            if (!fromCurrencySelect.querySelector(`option[value="${currency.code}"]`)) {
                 fromCurrencySelect.add(optionFrom);
            }
            if (!toCurrencySelect.querySelector(`option[value="${currency.code}"]`)) {
                toCurrencySelect.add(optionTo);
            }
        });
        fromCurrencySelect.value = "USD";
        toCurrencySelect.value = "EUR";
    }

    async function fetchExchangeRates(base = 'USD') {
        baseCurrencyForRates = base.toUpperCase();
        try {
            const response = await fetch(`${API_BASE_URL}${baseCurrencyForRates}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}. Could not fetch rates.`);
            }
            const data = await response.json();
            if (data.result === 'error' || !data.rates) {
                throw new Error(`API Error: ${data['error-type'] || 'Invalid data format from API.'}`);
            }
            exchangeRates = data.rates;
            ratesLastUpdateTimestamp = data.time_last_update_unix ? new Date(data.time_last_update_unix * 1000) : new Date();
            
            localStorage.setItem('exchangeRatesData', JSON.stringify({
                rates: exchangeRates,
                lastUpdate: ratesLastUpdateTimestamp.toISOString(),
                base: baseCurrencyForRates
            }));
            
            // FCH DEBUG: Ensure error is cleared if fetch is successful before calling convertAndDisplay
            clearErrors(); 
            convertAndDisplay(); 
            updateRateTimestamp();

        } catch (error) {
            console.error("Failed to fetch exchange rates:", error); // FCH DEBUG: Keep this console error.
            displayError(`Error fetching rates: ${error.message}. Please check your internet connection or try again later.`);
            loadRatesFromCache(); // Attempt to use cache if API fails
        }
    }

    function loadRatesFromCache() {
        const cachedData = localStorage.getItem('exchangeRatesData');
        if (cachedData) {
            try {
                const data = JSON.parse(cachedData);
                const cacheTimestamp = new Date(data.lastUpdate);
                // Cache for 1 hour example
                if ((new Date() - cacheTimestamp) < 3600000 && data.rates && Object.keys(data.rates).length > 0) { 
                    exchangeRates = data.rates;
                    ratesLastUpdateTimestamp = cacheTimestamp;
                    baseCurrencyForRates = data.base;
                    console.log("Loaded rates from cache."); // FCH DEBUG: This is helpful.
                    // FCH DEBUG: Ensure error is cleared if cache load is successful before calling convertAndDisplay
                    clearErrors();
                    convertAndDisplay();
                    updateRateTimestamp();
                    return true;
                } else {
                    console.log("Cache expired or invalid.");
                    localStorage.removeItem('exchangeRatesData'); // Remove expired/invalid cache
                }
            } catch (e) {
                console.error("Error parsing cached rates:", e);
                localStorage.removeItem('exchangeRatesData'); // Remove corrupted cache
            }
        }
        console.log("Cache not available or expired.");
        return false;
    }

    function clearErrors() {
        if (errorMessagesDiv) { // FCH DEBUG: Defensive check
            errorMessagesDiv.textContent = '';
            errorMessagesDiv.style.display = 'none';
            // FCH DEBUG: Explicitly set some styles to ensure visibility if it was hidden weirdly
            errorMessagesDiv.style.color = ''; // Reset to default stylesheet color (usually black or red via CSS)
            errorMessagesDiv.style.padding = ''; // Reset
            errorMessagesDiv.style.height = ''; // Reset
            errorMessagesDiv.style.opacity = ''; // Reset
        }
        if (amountInput) amountInput.classList.remove('input-error');
    }

    function displayError(message, isHardError = true) { // FCH DEBUG: isHardError flag (unused for now, but for future styling)
        console.log("FCH DEBUG: displayError called with message:", message); // FCH DEBUG: Log when this is called.
        if (errorMessagesDiv) { // FCH DEBUG: Defensive check
            errorMessagesDiv.textContent = message;
            errorMessagesDiv.style.display = 'block';
            // FCH DEBUG: Force some styles to make it more likely to be visible
            errorMessagesDiv.style.color = 'red'; // Example: Force red color
            errorMessagesDiv.style.padding = '10px';
            errorMessagesDiv.style.border = '1px solid red'; // Make it very obvious
            errorMessagesDiv.style.height = 'auto';
            errorMessagesDiv.style.opacity = '1';
        }
        if (resultsSection) resultsSection.style.display = 'none';
    }
    
    function formatValue(value, decimals = 4) {
        if (isNaN(value) || value === null || value === undefined) return '--'; // FCH DEBUG: added undefined check
        let formatted = parseFloat(value.toFixed(8)); 
        if (Math.abs(formatted) < 0.000001 && formatted !== 0) {
             return formatted.toExponential(4);
        }
        return parseFloat(formatted.toFixed(decimals)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: decimals});
    }

    function convertAndDisplay() {
        // FCH DEBUG: Do not call clearErrors() immediately here, let previous error persist if rates not ready.
        // clearErrors(); // FCH DEBUG: Moved this call to later.

        if (!exchangeRates || Object.keys(exchangeRates).length === 0) { // FCH DEBUG: Check if exchangeRates is empty object
            // FCH DEBUG: Rates are not available. Inform user and attempt to fetch.
            // The original commented-out displayError was here.
            // Let's provide feedback.
            displayError("Exchange rates are currently unavailable or loading. Please wait or try again shortly.", false);
            console.log("FCH DEBUG: exchangeRates not available in convertAndDisplay. Attempting fetch/cache.");
            if (!loadRatesFromCache()) { 
                fetchExchangeRates(fromCurrencySelect.value || 'USD');
            }
            return; 
        }
        
        // FCH DEBUG: Now that we know rates *should* be available (or we returned), clear previous non-critical errors.
        clearErrors(); 

        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount)) {
            if (amountInput.value.trim() !== "") {
                displayError("Please enter a valid amount.");
            } else {
                hideResults(); // FCH DEBUG: This is for when amount is empty
            }
            return;
        }
        if (amount < 0) {
            displayError("Amount cannot be negative.");
            return;
        }

        const rateFrom = exchangeRates[fromCurrency];
        const rateTo = exchangeRates[toCurrency];

        if (rateFrom === undefined || rateTo === undefined) { // FCH DEBUG: Stricter check for undefined
            displayError(`Rate for ${fromCurrency} or ${toCurrency} not available. Base: ${baseCurrencyForRates}. Rates might be updating.`);
            // FCH DEBUG: Avoid refetching loop if base is already what we tried.
            if (baseCurrencyForRates !== 'USD' && fromCurrencySelect.value !== baseCurrencyForRates) { // Example condition
                console.warn(`Rate for ${fromCurrency} or ${toCurrency} not found with base ${baseCurrencyForRates}. Refetching with USD.`);
                fetchExchangeRates('USD');
            } else if (baseCurrencyForRates === 'USD' && (fromCurrency === 'USD' || toCurrency === 'USD')) {
                 // If base is USD and one of the selected is USD, but rate is missing, the API data is problematic for that currency
                 console.warn(`Rate for ${fromCurrency} or ${toCurrency} is missing even with USD base. Data issue?`);
            }
            return;
        }
        
        let convertedAmount;
        if (baseCurrencyForRates === fromCurrency) {
            convertedAmount = amount * rateTo;
        } else if (baseCurrencyForRates === toCurrency) {
            convertedAmount = amount / rateFrom;
        } else {
            const amountInBase = amount / rateFrom; 
            convertedAmount = amountInBase * rateTo;
        }

        fromAmountDisplay.textContent = formatValue(amount, 2);
        fromCurrencyDisplay.textContent = fromCurrency;
        toAmountDisplay.textContent = formatValue(convertedAmount, 2);
        toCurrencyDisplay.textContent = toCurrency;

        const directRate = rateTo / rateFrom;
        const inverseRate = rateFrom / rateTo;

        rateDisplay.textContent = `1 ${fromCurrency} = ${formatValue(directRate, 6)} ${toCurrency}`;
        inverseRateDisplay.textContent = `1 ${toCurrency} = ${formatValue(inverseRate, 6)} ${fromCurrency}`;
        
        if (resultsSection) resultsSection.style.display = 'block'; // FCH DEBUG: Defensive check
        updateRateTimestamp();
    }
    
    function updateRateTimestamp() {
        if (rateTimestamp) { // FCH DEBUG: Defensive check
            if (ratesLastUpdateTimestamp) {
                rateTimestamp.textContent = `Rates last updated: ${ratesLastUpdateTimestamp.toLocaleString()}`;
            } else {
                rateTimestamp.textContent = "Rates last updated: Fetching...";
            }
        }
    }

    function hideResults() {
        if (resultsSection) resultsSection.style.display = 'none'; // FCH DEBUG: Defensive check
        if (fromAmountDisplay) fromAmountDisplay.textContent = '--';
        if (fromCurrencyDisplay) fromCurrencyDisplay.textContent = '---';
        if (toAmountDisplay) toAmountDisplay.textContent = '--';
        if (toCurrencyDisplay) toCurrencyDisplay.textContent = '---';
        if (rateDisplay) rateDisplay.textContent = '1 --- = -- ---';
        if (inverseRateDisplay) inverseRateDisplay.textContent = '1 --- = -- ---';
    }

    function swapCurrencies() {
        const tempCurrency = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempCurrency;
        convertAndDisplay();
    }

    function handleReset() {
        if (calculatorForm) calculatorForm.reset(); 
        if (fromCurrencySelect) fromCurrencySelect.value = "USD"; 
        if (toCurrencySelect) toCurrencySelect.value = "EUR";
        clearErrors();
        hideResults();
        updateRateTimestamp(); 
    }

    // --- Event Listeners ---
    if (amountInput) amountInput.addEventListener('input', convertAndDisplay);
    if (fromCurrencySelect) fromCurrencySelect.addEventListener('change', convertAndDisplay); // FCH DEBUG: Simpler call
    if (toCurrencySelect) toCurrencySelect.addEventListener('change', convertAndDisplay);
    if (swapButton) swapButton.addEventListener('click', swapCurrencies);
    if (resetButton) resetButton.addEventListener('click', handleReset);

    // --- Initial Setup ---
    // populateDropdowns(); // FCH DEBUG: Deferring fix for duplicate dropdowns to Part 2. For now, let it run.
    
    // FCH DEBUG: Initialize with hidden results until amount is entered or rates confirmed.
    hideResults(); 

    if (!loadRatesFromCache()) {
        fetchExchangeRates(fromCurrencySelect.value || 'USD');
    } else {
        // If loaded from cache, check if amount is pre-filled (e.g. by browser)
        if(amountInput && amountInput.value && exchangeRates && Object.keys(exchangeRates).length > 0) {
            convertAndDisplay();
        } else {
            updateRateTimestamp(); // Show cached timestamp even if no initial conversion
        }
    }
});
