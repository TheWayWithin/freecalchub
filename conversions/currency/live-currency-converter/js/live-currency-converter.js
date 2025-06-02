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

    const resultsSection = document.getElementById('resultsSection');
    const fromAmountDisplay = document.getElementById('fromAmountDisplay');
    const fromCurrencyDisplay = document.getElementById('fromCurrencyDisplay');
    const toAmountDisplay = document.getElementById('toAmountDisplay');
    const toCurrencyDisplay = document.getElementById('toCurrencyDisplay');
    const rateDisplay = document.getElementById('rateDisplay');
    const inverseRateDisplay = document.getElementById('inverseRateDisplay');
    const rateTimestamp = document.getElementById('rateTimestamp');
    const errorMessagesDiv = document.getElementById('errorMessages');

    // --- Configuration for API ---
    // IMPORTANT: Replace 'YOUR_API_KEY' with an actual API key if required by the provider.
    // For ExchangeRate-API.com (example, v6 has 'latest' endpoint without specific base)
    // For V1, we might fetch rates against a base like USD and then calculate cross rates if needed.
    // Or, if the API supports pair conversion directly, that's simpler.
    // Let's assume an API structure like: https://api.exchangerate-api.com/v4/latest/USD
    // For this example, I'll use a free tier of ExchangeRate-API.
    // Real API key management should be handled securely, not hardcoded in client-side JS for production.
    // For this example, we'll simulate fetching for a few currencies based on USD.
    
    const API_BASE_URL = 'https://open.er-api.com/v6/latest/'; // Example free API
    let exchangeRates = null;
    let ratesLastUpdateTimestamp = null;
    let baseCurrencyForRates = 'USD'; // The currency our fetched rates are relative to

    // List of currencies for V1 (should match HTML select options)
    const currencies = [
        { code: "USD", name: "US Dollar" }, { code: "EUR", name: "Euro" }, { code: "JPY", name: "Japanese Yen" },
        { code: "GBP", name: "British Pound" }, { code: "AUD", name: "Australian Dollar" }, { code: "CAD", name: "Canadian Dollar" },
        { code: "CHF", name: "Swiss Franc" }, { code: "CNY", name: "Chinese Yuan Renminbi" }, { code: "INR", name: "Indian Rupee" },
        { code: "BRL", name: "Brazilian Real" }, { code: "RUB", name: "Russian Ruble" }, { code: "ZAR", name: "South African Rand" },
        { code: "MXN", name: "Mexican Peso" }, { code: "SGD", name: "Singapore Dollar" }, { code: "NZD", name: "New Zealand Dollar" },
        { code: "HKD", name: "Hong Kong Dollar" }, { code: "NOK", name: "Norwegian Krone" }, { code: "SEK", name: "Swedish Krona" },
        { code: "KRW", name: "South Korean Won" }, { code: "TRY", name: "Turkish Lira" }
    ];

    // Populate dropdowns (can also be hardcoded in HTML for V1)
    function populateDropdowns() {
        currencies.forEach(currency => {
            const optionFrom = new Option(`${currency.code} - ${currency.name}`, currency.code);
            const optionTo = new Option(`${currency.code} - ${currency.name}`, currency.code);
            fromCurrencySelect.add(optionFrom);
            toCurrencySelect.add(optionTo);
        });
        // Set default selections if needed (already done in HTML)
        fromCurrencySelect.value = "USD";
        toCurrencySelect.value = "EUR";
    }


    async function fetchExchangeRates(base = 'USD') {
        baseCurrencyForRates = base.toUpperCase();
        try {
            const response = await fetch(`${API_BASE_URL}${baseCurrencyForRates}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.result === 'error' || !data.rates) {
                throw new Error(`API Error: ${data['error-type'] || 'Invalid data format'}`);
            }
            exchangeRates = data.rates;
            ratesLastUpdateTimestamp = data.time_last_update_unix ? new Date(data.time_last_update_unix * 1000) : new Date(); // Use current time if API doesn't provide
            
            // Store rates in localStorage with a timestamp to avoid excessive API calls
            localStorage.setItem('exchangeRatesData', JSON.stringify({
                rates: exchangeRates,
                lastUpdate: ratesLastUpdateTimestamp.toISOString(),
                base: baseCurrencyForRates
            }));

            convertAndDisplay(); // Perform initial conversion after fetching rates
            updateRateTimestamp();

        } catch (error) {
            console.error("Failed to fetch exchange rates:", error);
            displayError(`Error fetching rates: ${error.message}. Please try again later.`);
            // Attempt to load from localStorage if API fails
            loadRatesFromCache();
        }
    }

    function loadRatesFromCache() {
        const cachedData = localStorage.getItem('exchangeRatesData');
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const cacheTimestamp = new Date(data.lastUpdate);
            // Cache for 1 hour example
            if ((new Date() - cacheTimestamp) < 3600000) { 
                exchangeRates = data.rates;
                ratesLastUpdateTimestamp = cacheTimestamp;
                baseCurrencyForRates = data.base;
                console.log("Loaded rates from cache.");
                convertAndDisplay();
                updateRateTimestamp();
                return true;
            }
        }
        console.log("Cache expired or not available.");
        return false;
    }


    function clearErrors() {
        errorMessagesDiv.textContent = '';
        errorMessagesDiv.style.display = 'none';
        amountInput.classList.remove('input-error');
    }

    function displayError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = 'block';
        resultsSection.style.display = 'none';
    }
    
    function formatValue(value, decimals = 4) {
        if (isNaN(value) || value === null) return '--';
        let formatted = parseFloat(value.toFixed(8)); // Intermediate high precision
        if (Math.abs(formatted) < 0.000001 && formatted !== 0) {
             return formatted.toExponential(4);
        }
        return parseFloat(formatted.toFixed(decimals)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: decimals});
    }

    function convertAndDisplay() {
        clearErrors();
        if (!exchangeRates) {
            // displayError("Exchange rates not available. Please try again shortly.");
            // Attempt to fetch if not available (e.g., on first load or if cache failed)
            if (!loadRatesFromCache()) {
                fetchExchangeRates(fromCurrencySelect.value || 'USD'); // Fetch based on current "from" or USD
            }
            return; 
        }

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

        // Conversion Logic:
        // All rates in 'exchangeRates' are relative to 'baseCurrencyForRates'.
        // So, AmountInBase = AmountInFromCurrency / RateOfFromCurrency (relative to base)
        // Result = AmountInBase * RateOfToCurrency (relative to base)
        // Simplified: Result = (AmountInFromCurrency / RateFrom) * RateTo
        // OR: AmountInFromCurrency * (RateTo / RateFrom)

        const rateFrom = exchangeRates[fromCurrency]; // Rate of FromCurrency relative to baseCurrencyForRates
        const rateTo = exchangeRates[toCurrency];     // Rate of ToCurrency relative to baseCurrencyForRates

        if (!rateFrom || !rateTo) {
            displayError("Selected currency rate not available. Rates might be updating. Try base USD or EUR.");
            // Attempt to refetch with USD as base if a currency is missing, could indicate stale base
            if (baseCurrencyForRates !== 'USD') {
                console.warn(`Rate for ${fromCurrency} or ${toCurrency} not found with base ${baseCurrencyForRates}. Refetching with USD.`);
                fetchExchangeRates('USD');
            }
            return;
        }
        
        let convertedAmount;
        // If the base currency of our stored rates is the 'fromCurrency', calculation is direct
        if (baseCurrencyForRates === fromCurrency) {
            convertedAmount = amount * rateTo;
        } 
        // If the base currency is the 'toCurrency', calculation is inverse
        else if (baseCurrencyForRates === toCurrency) {
            convertedAmount = amount / rateFrom;
        }
        // Else, convert 'from' to base, then base to 'to'
        else {
            const amountInBase = amount / rateFrom; 
            convertedAmount = amountInBase * rateTo;
        }


        fromAmountDisplay.textContent = formatValue(amount, 2);
        fromCurrencyDisplay.textContent = fromCurrency;
        toAmountDisplay.textContent = formatValue(convertedAmount, 2); // Typically display currency with 2 decimals
        toCurrencyDisplay.textContent = toCurrency;

        // Calculate and display direct and inverse rates
        const directRate = rateTo / rateFrom; // 1 unit of FromCurrency = X units of ToCurrency
        const inverseRate = rateFrom / rateTo; // 1 unit of ToCurrency = Y units of FromCurrency

        rateDisplay.textContent = `1 ${fromCurrency} = ${formatValue(directRate, 6)} ${toCurrency}`;
        inverseRateDisplay.textContent = `1 ${toCurrency} = ${formatValue(inverseRate, 6)} ${fromCurrency}`;
        
        resultsSection.style.display = 'block';
        updateRateTimestamp();
    }
    
    function updateRateTimestamp() {
        if (ratesLastUpdateTimestamp) {
            rateTimestamp.textContent = `Rates last updated: ${ratesLastUpdateTimestamp.toLocaleString()}`;
        } else {
            rateTimestamp.textContent = "Rates last updated: Fetching...";
        }
    }

    function hideResults() {
        resultsSection.style.display = 'none';
        // Clear result fields
        fromAmountDisplay.textContent = '--';
        fromCurrencyDisplay.textContent = '---';
        toAmountDisplay.textContent = '--';
        toCurrencyDisplay.textContent = '---';
        rateDisplay.textContent = '1 --- = -- ---';
        inverseRateDisplay.textContent = '1 --- = -- ---';
    }

    function swapCurrencies() {
        const tempCurrency = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = tempCurrency;
        convertAndDisplay();
    }

    function handleReset() {
        calculatorForm.reset(); // Resets form elements to their initial HTML state
        fromCurrencySelect.value = "USD"; // Re-assert defaults if needed
        toCurrencySelect.value = "EUR";
        clearErrors();
        hideResults();
        updateRateTimestamp(); // Reflects that we might need to fetch again or show placeholder
    }

    // --- Event Listeners ---
    amountInput.addEventListener('input', convertAndDisplay);
    fromCurrencySelect.addEventListener('change', () => {
        // Option: Fetch new rates if base currency changes, or always convert through USD/EUR
        // For simplicity, if fromCurrency is a major one, we could refetch with it as base.
        // For now, we assume the initial fetch (e.g. USD based) is sufficient for cross-conversion.
        // If base currency changes: fetchExchangeRates(fromCurrencySelect.value);
        convertAndDisplay();
    });
    toCurrencySelect.addEventListener('change', convertAndDisplay);
    swapButton.addEventListener('click', swapCurrencies);
    resetButton.addEventListener('click', handleReset);

    // --- Initial Setup ---
    populateDropdowns(); // Populate if not hardcoded
    if (!loadRatesFromCache()) {
        // If cache is not loaded or expired, fetch new rates.
        // Fetch rates based on default "From" currency or a standard base like USD.
        fetchExchangeRates(fromCurrencySelect.value || 'USD');
    } else {
        // If loaded from cache, ensure timestamp is updated
        updateRateTimestamp();
    }
    // If amount is pre-filled, convert
    if(amountInput.value && exchangeRates){
        convertAndDisplay();
    } else {
        hideResults();
    }
});
