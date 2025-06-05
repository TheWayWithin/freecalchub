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
    const API_BASE_URL = 'https://api.exchangerate.host/';
    const API_SOURCE_NAME = "exchangerate.host (Frankfurter)";

    // List of currencies for V1 (should match HTML select options)
    // Note: This list is also used by populateDropdowns. If HTML is source of truth, populateDropdowns might be redundant.
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
        // This function is called, but HTML also has options. This will cause duplicates.
        // We will address this in a subsequent step if desired.
        currencies.forEach(currency => {
            const optionFrom = new Option(`${currency.code} - ${currency.name}`, currency.code);
            const optionTo = new Option(`${currency.code} - ${currency.name}`, currency.code);
            if (fromCurrencySelect && !fromCurrencySelect.querySelector(`option[value="${currency.code}"]`)) {
                 fromCurrencySelect.add(optionFrom);
            }
            if (toCurrencySelect && !toCurrencySelect.querySelector(`option[value="${currency.code}"]`)) {
                toCurrencySelect.add(optionTo);
            }
        });
        if (fromCurrencySelect) fromCurrencySelect.value = "USD";
        if (toCurrencySelect) toCurrencySelect.value = "EUR";
    }

    function setDateInputMax() {
        if (!historicalDateInput) return;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        historicalDateInput.max = yesterday.toISOString().split('T')[0];
    }

    async function fetchHistoricalRate(date, baseCurrency, fromCurrencyArgument, toCurrency) {
        // In the current call from handleCalculate, baseCurrency is fromCurrencyArgument.
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        // API URL for exchangerate.host: YYYY-MM-DD?base=BASE_CURRENCY&symbols=TO_CURRENCY
        // Since handleCalculate calls this with baseCurrency = fromCurrencyArgument,
        // this URL structure is what we want.
        const url = `${API_BASE_URL}${formattedDate}?base=${baseCurrency}&symbols=${toCurrency}`;

        try {
            const response = await fetch(url);
            if (!response.ok) { // Handles HTTP errors (e.g., 404, 500)
                let errorResponseMessage = `Failed to fetch from API (HTTP ${response.status})`;
                try {
                    const errorData = await response.json();
                    errorResponseMessage = `API Error (${response.status}): ${errorData.error || response.statusText || 'Unknown API error'}`;
                } catch (e) {
                    // Could not parse JSON error response, use status text
                    errorResponseMessage = `API Error (${response.status}): ${response.statusText || 'Could not retrieve error details.'}`;
                }
                throw new Error(errorResponseMessage);
            }
            const data = await response.json();

            // Check the structure of the successful API response
            if (data.success === false) {
                throw new Error(`API request not successful for ${formattedDate}. Message: ${data.error || 'Unknown API issue reported by provider.'}`);
            }
            if (!data.rates) {
                throw new Error(`'rates' object not found in API response for ${formattedDate} with base ${baseCurrency}.`);
            }
            if (data.rates[toCurrency] === undefined) {
                 throw new Error(`Rate not found for ${toCurrency} in API response for ${formattedDate} with base ${baseCurrency}. (Available: ${Object.keys(data.rates).join(', ')})`);
            }
            
            // If all checks pass, we have the rate
            return { rate: data.rates[toCurrency], date: data.date, source: API_SOURCE_NAME };

        } catch (error) { // Catches errors from fetch() itself (network issues) or errors thrown above
            console.error("Failed to fetch historical rate (raw error):", error); 
            // Re-throw a new error with a potentially more user-friendly message, or just the original.
            // For now, re-throwing the caught error is fine as handleCalculate will format it.
            throw error; 
        }
    }

    function clearErrors() {
        if (!errorMessagesDiv) return;
        errorMessagesDiv.innerHTML = ''; // Using innerHTML because displayError might use <p>
        errorMessagesDiv.style.display = 'none';
        [amountInput, fromCurrencySelect, toCurrencySelect, historicalDateInput].forEach(el => {
            if (el) el.classList.remove('input-error');
        });
    }

    function displayError(message) {
        if (!errorMessagesDiv) return;
        console.log("FCH DEBUG (Historical): displayError called with message:", message);
        errorMessagesDiv.innerHTML = `<p>${message}</p>`; // Ensure message is wrapped in a paragraph
        errorMessagesDiv.style.display = 'block';
        // Make error very visible
        errorMessagesDiv.style.color = 'red'; 
        errorMessagesDiv.style.padding = '10px';
        errorMessagesDiv.style.border = '1px solid red';
        errorMessagesDiv.style.height = 'auto';
        errorMessagesDiv.style.opacity = '1';

        if (resultsSection) resultsSection.style.display = 'none';
    }

    function formatDisplayValue(value, decimals = 2) {
        if (isNaN(value) || value === null || value === undefined) return '--';
         return parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
    }
    function formatRateValue(value, decimals = 6) { // For displaying rates which might need more precision
        if (isNaN(value) || value === null || value === undefined) return '--';
         return parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: decimals});
    }


    async function handleCalculate() {
        clearErrors();
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const dateValue = historicalDateInput.value; 

        let errors = [];
        if (isNaN(amount) || amount < 0) { errors.push("Amount must be a non-negative number."); if (amountInput) amountInput.classList.add('input-error'); }
        if (!fromCurrency) { errors.push("Please select a 'From' currency."); if (fromCurrencySelect) fromCurrencySelect.classList.add('input-error'); }
        if (!toCurrency) { errors.push("Please select a 'To' currency."); if (toCurrencySelect) toCurrencySelect.classList.add('input-error'); }
        if (!dateValue) { errors.push("Please select a valid date."); if (historicalDateInput) historicalDateInput.classList.add('input-error'); }
        else {
            const selectedDate = new Date(dateValue + "T00:00:00"); 
            const today = new Date();
            today.setHours(0,0,0,0); 
            if (selectedDate >= today) {
                errors.push("Please select a past date for historical rates (yesterday or earlier).");
                if (historicalDateInput) historicalDateInput.classList.add('input-error');
            }
        }

        if (errors.length > 0) {
            displayError(errors.join('<br>')); // Display all validation errors
            hideResults();
            return;
        }

        try {
            // Call fetchHistoricalRate with fromCurrency as the baseCurrency, as per spec for exchangerate.host
            const data = await fetchHistoricalRate(dateValue, fromCurrency, fromCurrency, toCurrency);
            
            // No need to check !data here, as fetchHistoricalRate will throw if it can't get a good structure.
            // data.rate should be defined if no error was thrown by fetchHistoricalRate.

            const convertedAmount = amount * data.rate;
            // Ensure date from API (data.date) is used, parsed correctly for display
            const displayDateObj = new Date(data.date + "T00:00:00"); // Treat API date as local date
            const displayDateFormatted = displayDateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });


            if(fromAmountDisplay) fromAmountDisplay.textContent = formatDisplayValue(amount);
            if(fromCurrencyDisplay) fromCurrencyDisplay.textContent = fromCurrency;
            if(toAmountDisplay) toAmountDisplay.textContent = formatDisplayValue(convertedAmount);
            if(toCurrencyDisplay) toCurrencyDisplay.textContent = toCurrency;
            if(rateDateDisplay) rateDateDisplay.textContent = displayDateFormatted;

            if(historicalRateDisplay) historicalRateDisplay.textContent = `1 ${fromCurrency} = ${formatRateValue(data.rate)} ${toCurrency} on ${displayDateFormatted}`;
            if(dataSourceInfo) dataSourceInfo.textContent = `Rate sourced from: ${data.source}`;
            
            if(resultsSection) resultsSection.style.display = 'block';

        } catch (error) {
            console.error("Calculation or API error in handleCalculate:", error);
            displayError(`Error: ${error.message || "Could not retrieve historical rate."}`);
            hideResults();
        }
    }
    
    function hideResults() {
        if(!resultsSection) return;
        resultsSection.style.display = 'none';
        if(fromAmountDisplay) fromAmountDisplay.textContent = '--';
        if(fromCurrencyDisplay) fromCurrencyDisplay.textContent = '---';
        if(toAmountDisplay) toAmountDisplay.textContent = '--';
        if(toCurrencyDisplay) toCurrencyDisplay.textContent = '---';
        if(rateDateDisplay) rateDateDisplay.textContent = '--/--/----';
        if(historicalRateDisplay) historicalRateDisplay.textContent = '1 --- = -- --- on selected date';
        if(dataSourceInfo) dataSourceInfo.textContent = 'Rate sourced from: --';
    }

    function handleReset() {
        if(calculatorForm) calculatorForm.reset();
        if(fromCurrencySelect) fromCurrencySelect.value = "USD"; 
        if(toCurrencySelect) toCurrencySelect.value = "EUR";
        if(historicalDateInput) historicalDateInput.value = ""; // Clear date
        clearErrors();
        hideResults();
    }

    // --- Event Listeners ---
    if(calculateButton) calculateButton.addEventListener('click', handleCalculate);
    if(resetButton) resetButton.addEventListener('click', handleReset);

    // --- Initial Setup ---
    populateDropdowns(); // Note: This will create duplicate dropdown entries as HTML also has them.
    setDateInputMax(); 
    hideResults(); // Ensure results are hidden initially
});
