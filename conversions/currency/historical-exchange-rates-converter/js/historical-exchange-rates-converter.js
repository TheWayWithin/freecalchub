/*
 * FreecalcHub.com - Historical Exchange Rates Converter
 * Version: 1.0
 * Date Created: June 4, 2025
 * Description: Fetches historical exchange rates for a specific date and converts currencies.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const amountInput = document.getElementById('amountInput');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const historicalDateInput = document.getElementById('historicalDate');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const calculatorForm = document.getElementById('calculatorForm');

    const resultsSection = document.getElementById('resultsSection');
    const fromAmountDisplay = document.getElementById('fromAmountDisplay');
    const fromCurrencyDisplay = document.getElementById('fromCurrencyDisplay');
    const toAmountDisplay = document.getElementById('toAmountDisplay');
    const toCurrencyDisplay = document.getElementById('toCurrencyDisplay');
    const rateDateDisplay = document.getElementById('rateDateDisplay'); // For "as of [date]"
    const historicalRateDisplay = document.getElementById('historicalRateDisplay');
    const dataSourceInfo = document.getElementById('dataSourceInfo'); // To display API source
    const errorMessagesDiv = document.getElementById('errorMessages');

    // --- Configuration ---
    // IMPORTANT: You'll need an API key for most reliable historical data providers.
    // This example uses exchangerate.host which is free and has a historical endpoint.
    // Replace with your chosen API details.
    const API_BASE_URL = 'https://api.exchangerate.host/'; // Example: https://api.exchangerate.host/2020-01-01?base=USD
    const API_SOURCE_NAME = "exchangerate.host (Frankfurter)"; // Update with actual source

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

    function populateDropdowns() {
        currencies.forEach(currency => {
            const optionFrom = new Option(`${currency.code} - ${currency.name}`, currency.code);
            const optionTo = new Option(`${currency.code} - ${currency.name}`, currency.code);
            fromCurrencySelect.add(optionFrom);
            toCurrencySelect.add(optionTo);
        });
        fromCurrencySelect.value = "USD";
        toCurrencySelect.value = "EUR";
    }

    function setDateInputMax() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        historicalDateInput.max = yesterday.toISOString().split('T')[0];
    }

    async function fetchHistoricalRate(date, baseCurrency, fromCurrency, toCurrency) {
        // Ensure date is in YYYY-MM-DD format
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const symbols = `${fromCurrency},${toCurrency}`; // Some APIs prefer symbols query param
        
        // Example for exchangerate.host: https://api.exchangerate.host/YYYY-MM-DD?base=FROM_CURRENCY&symbols=TO_CURRENCY
        // Or fetch all rates for the base and then calculate
        const url = `${API_BASE_URL}${formattedDate}?base=${baseCurrency}&symbols=${toCurrency}`;
        // For APIs that need from and to in the query:
        // const url = `${API_BASE_URL}${formattedDate}?from=${fromCurrency}&to=${toCurrency}&base=${baseCurrency}`; 

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error (${response.status}): ${errorData.error || response.statusText}`);
            }
            const data = await response.json();

            if (data.success === false || !data.rates || !data.rates[toCurrency]) {
                 // Check if fromCurrency is the same as baseCurrency for the API
                if (baseCurrency === fromCurrency) {
                    if (!data.rates[toCurrency]) {
                         throw new Error(`Rate not found for ${toCurrency} on ${formattedDate} with base ${baseCurrency}.`);
                    }
                     return { rate: data.rates[toCurrency], date: data.date, source: API_SOURCE_NAME };
                } else {
                    // If fromCurrency is not the base, need to fetch rates for fromCurrency first, then calculate cross-rate
                    // This requires two API calls or an API that supports direct pair conversion for historical data.
                    // For simplicity in this V1, we might assume the API allows fetching specific pairs or we always fetch against a common base like USD
                    // and then calculate.
                    // The provided URL structure for exchangerate.host fetches rates against a base.
                    // So, we need: (rate of ToCurrency against Base) / (rate of FromCurrency against Base)
                    // If baseCurrency IS fromCurrency, then rateFromBase is 1.
                    
                    // Let's refine: Fetch rates relative to fromCurrency if possible, or fetch all for USD and cross-calculate
                    const baseFetchUrl = `${API_BASE_URL}${formattedDate}?base=${fromCurrency}&symbols=${toCurrency}`;
                    const baseResponse = await fetch(baseFetchUrl);
                     if (!baseResponse.ok) {
                        const errorData = await baseResponse.json();
                        throw new Error(`API Error (${baseResponse.status}) fetching base rate: ${errorData.error || baseResponse.statusText}`);
                    }
                    const baseData = await baseResponse.json();
                     if (baseData.success === false || !baseData.rates || !baseData.rates[toCurrency]) {
                        throw new Error(`Rate not found for ${toCurrency} based on ${fromCurrency} for ${formattedDate}.`);
                    }
                    return { rate: baseData.rates[toCurrency], date: baseData.date, source: API_SOURCE_NAME };
                }
            }
            return { rate: data.rates[toCurrency], date: data.date, source: API_SOURCE_NAME };

        } catch (error) {
            console.error("Failed to fetch historical rate:", error);
            throw error; // Re-throw to be caught by handleCalculate
        }
    }

    function clearErrors() {
        errorMessagesDiv.innerHTML = '';
        errorMessagesDiv.style.display = 'none';
        [amountInput, fromCurrencySelect, toCurrencySelect, historicalDateInput].forEach(el => el.classList.remove('input-error'));
    }

    function displayError(message) {
        errorMessagesDiv.innerHTML = `<p>${message}</p>`;
        errorMessagesDiv.style.display = 'block';
        resultsSection.style.display = 'none';
    }

    function formatDisplayValue(value, decimals = 2) {
        if (isNaN(value) || value === null) return '--';
         return parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
    }
    function formatRateValue(value, decimals = 6) {
        if (isNaN(value) || value === null) return '--';
         return parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: decimals});
    }


    async function handleCalculate() {
        clearErrors();
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const dateValue = historicalDateInput.value; // YYYY-MM-DD

        let errors = [];
        if (isNaN(amount) || amount < 0) { errors.push("Amount must be a non-negative number."); amountInput.classList.add('input-error'); }
        if (!fromCurrency) { errors.push("Please select a 'From' currency."); fromCurrencySelect.classList.add('input-error'); }
        if (!toCurrency) { errors.push("Please select a 'To' currency."); toCurrencySelect.classList.add('input-error'); }
        if (!dateValue) { errors.push("Please select a valid date."); historicalDateInput.classList.add('input-error'); }
        else {
            const selectedDate = new Date(dateValue + "T00:00:00"); // Ensure it's parsed as local date, not UTC midnight
            const today = new Date();
            today.setHours(0,0,0,0); // Compare dates only
            if (selectedDate >= today) {
                errors.push("Please select a past date for historical rates.");
                historicalDateInput.classList.add('input-error');
            }
        }


        if (errors.length > 0) {
            showErrors(errors);
            hideResults();
            return;
        }

        try {
            // For exchangerate.host, it's better to specify the 'fromCurrency' as the base if possible for direct rate
            const data = await fetchHistoricalRate(dateValue, fromCurrency, fromCurrency, toCurrency);
            
            if (!data || data.rate === undefined) {
                throw new Error("Historical rate not found for the selected criteria.");
            }

            const convertedAmount = amount * data.rate;
            const displayDate = new Date(data.date + "T00:00:00").toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

            fromAmountDisplay.textContent = formatDisplayValue(amount);
            fromCurrencyDisplay.textContent = fromCurrency;
            toAmountDisplay.textContent = formatDisplayValue(convertedAmount);
            toCurrencyDisplay.textContent = toCurrency;
            rateDateDisplay.textContent = displayDate;

            historicalRateDisplay.textContent = `1 ${fromCurrency} = ${formatRateValue(data.rate)} ${toCurrency} on ${displayDate}`;
            dataSourceInfo.textContent = `Rate sourced from: ${data.source}`;
            
            resultsSection.style.display = 'block';

        } catch (error) {
            console.error("Calculation error:", error);
            displayError(`Error: ${error.message || "Could not retrieve historical rate."}`);
            hideResults();
        }
    }
    
    function hideResults() {
        resultsSection.style.display = 'none';
        fromAmountDisplay.textContent = '--';
        fromCurrencyDisplay.textContent = '---';
        toAmountDisplay.textContent = '--';
        toCurrencyDisplay.textContent = '---';
        rateDateDisplay.textContent = '--/--/----';
        historicalRateDisplay.textContent = '1 --- = -- --- on selected date';
        dataSourceInfo.textContent = 'Rate sourced from: --';
    }

    function handleReset() {
        calculatorForm.reset();
        fromCurrencySelect.value = "USD"; 
        toCurrencySelect.value = "EUR";
        historicalDateInput.value = "";
        clearErrors();
        hideResults();
    }

    // --- Event Listeners ---
    calculateButton.addEventListener('click', handleCalculate);
    resetButton.addEventListener('click', handleReset);

    // --- Initial Setup ---
    populateDropdowns();
    setDateInputMax(); // Restrict date picker to past dates
    hideResults();
});
