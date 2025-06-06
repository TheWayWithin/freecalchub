/*
 * FreecalcHub.com - Historical Exchange Rates Converter
 * Version: 1.2
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
    const rateDateDisplay = document.getElementById('rateDateDisplay');
    const historicalRateDisplay = document.getElementById('historicalRateDisplay');
    const dataSourceInfo = document.getElementById('dataSourceInfo');
    const errorMessagesDiv = document.getElementById('errorMessages');

    // --- Configuration ---
    const API_BASE_URL = 'https://api.exchangerate.host/';
    const API_KEY = '4fb36e198869acdef04e81ffd0445433';
    const API_SOURCE_NAME = "exchangerate.host";

    // --- Main Functions ---

    function setDateInputMax() {
        if (!historicalDateInput) return;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        historicalDateInput.max = yesterday.toISOString().split('T')[0];
    }

    async function fetchHistoricalRatesForDate(date) {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const url = `${API_BASE_URL}historical?access_key=${API_KEY}&date=${formattedDate}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // This block handles HTTP-level errors like 404, 500, etc.
                let errorResponseMessage = `Failed to fetch from API (HTTP ${response.status})`;
                try {
                    const errorData = await response.json();
                    let apiErrorDetails = `service status ${response.status}`;
                    if (errorData && errorData.error) {
                         if (typeof errorData.error === 'object' && errorData.error.info) {
                            apiErrorDetails = errorData.error.info;
                        } else if (typeof errorData.error === 'string') {
                            apiErrorDetails = errorData.error;
                        }
                    } else if (response.statusText) {
                        apiErrorDetails = response.statusText;
                    }
                    errorResponseMessage = `API Error (${response.status}): ${apiErrorDetails}`;
                } catch (e) {
                    if (response.statusText) {
                        errorResponseMessage = `API Error (${response.status}): ${response.statusText}`;
                    }
                }
                throw new Error(errorResponseMessage);
            }
            
            const data = await response.json();

            // This block handles cases where the HTTP request was OK (200), but the API payload indicates an error
            if (data.success === false) {
                let apiErrorDetails = 'Unknown API issue reported by provider.';
                if (data.error) {
                    if (typeof data.error === 'object') {
                        if (data.error.info) {
                            apiErrorDetails = data.error.info;
                        } else if (data.error.type) {
                            apiErrorDetails = data.error.type.replace(/_/g, ' ');
                        }
                    } else if (typeof data.error === 'string') {
                        apiErrorDetails = data.error;
                    }
                }
                throw new Error(`API request reported failure for ${formattedDate}. Message: ${apiErrorDetails}`);
            }

            if (!data.quotes) {
                throw new Error(`'quotes' object not found in API response for ${formattedDate}.`);
            }
            
            return data; // Return the full successful data object

        } catch (error) { 
            console.error("Failed to fetch historical rates (raw error details):", error); 
            throw error; // Re-throw the error to be caught by handleCalculate
        }
    }

    function clearErrors() {
        if (!errorMessagesDiv) return;
        errorMessagesDiv.innerHTML = ''; 
        errorMessagesDiv.style.display = 'none';
        // ... (resetting custom styles)
        [amountInput, fromCurrencySelect, toCurrencySelect, historicalDateInput].forEach(el => {
            if (el) el.classList.remove('input-error');
        });
    }

    function displayError(message) {
        if (!errorMessagesDiv) return;
        errorMessagesDiv.innerHTML = `<p>${message}</p>`; 
        errorMessagesDiv.style.display = 'block';
        errorMessagesDiv.style.border = '1px solid red'; // Make it obvious
        errorMessagesDiv.style.color = 'red';
        errorMessagesDiv.style.padding = '10px';
        if (resultsSection) resultsSection.style.display = 'none';
    }

    function formatValue(value, decimals = 2) {
        if (isNaN(value) || value === null || value === undefined) return '--';
         return parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
    }
    
    async function handleCalculate() {
        clearErrors();
        // --- 1. Get and Validate User Inputs ---
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        const dateValue = historicalDateInput.value; 

        let errors = [];
        if (isNaN(amount) || amount < 0) { errors.push("Amount must be a non-negative number."); }
        if (!dateValue) { errors.push("Please select a valid date."); }
        // ... (other validations remain the same)

        if (errors.length > 0) {
            displayError(errors.join('<br>')); 
            return;
        }

        try {
            // --- 2. Fetch All Rates for the Date (Base is USD by default from API) ---
            const data = await fetchHistoricalRatesForDate(dateValue);
            const quotes = data.quotes; // e.g., {"USDAUD": 1.29, "USDEUR": 0.9, ...}
            const sourceCurrency = data.source; // Should be 'USD' for the free plan

            // --- 3. Find the Specific Rates We Need ---
            let fromRate; // Rate of fromCurrency relative to sourceCurrency
            if (fromCurrency === sourceCurrency) {
                fromRate = 1;
            } else {
                fromRate = quotes[sourceCurrency + fromCurrency];
            }

            let toRate; // Rate of toCurrency relative to sourceCurrency
            if (toCurrency === sourceCurrency) {
                toRate = 1;
            } else {
                toRate = quotes[sourceCurrency + toCurrency];
            }

            if (fromRate === undefined || toRate === undefined) {
                let missing = fromRate === undefined ? fromCurrency : toCurrency;
                throw new Error(`The exchange rate for '${missing}' was not available in the data for the selected date.`);
            }

            // --- 4. Calculate the Conversion ---
            const amountInSource = amount / fromRate; // Convert original amount to the base currency (USD)
            const convertedAmount = amountInSource * toRate; // Convert from base currency to target currency
            const directRate = toRate / fromRate; // The direct conversion rate from 'from' to 'to'

            // --- 5. Display the Results ---
            const displayDateObj = new Date(data.date + "T00:00:00Z");
            const displayDateFormatted = displayDateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

            if(fromAmountDisplay) fromAmountDisplay.textContent = formatValue(amount);
            if(fromCurrencyDisplay) fromCurrencyDisplay.textContent = fromCurrency;
            if(toAmountDisplay) toAmountDisplay.textContent = formatValue(convertedAmount);
            if(toCurrencyDisplay) toCurrencyDisplay.textContent = toCurrency;
            if(rateDateDisplay) rateDateDisplay.textContent = displayDateFormatted;

            if(historicalRateDisplay) historicalRateDisplay.textContent = `1 ${fromCurrency} = ${formatValue(directRate, 6)} ${toCurrency} on ${displayDateFormatted}`;
            if(dataSourceInfo) dataSourceInfo.textContent = `Rate sourced from: ${API_SOURCE_NAME} (Base: ${sourceCurrency})`;
            
            if(resultsSection) resultsSection.style.display = 'block';

        } catch (error) {
            console.error("Calculation or API error in handleCalculate:", error);
            displayError(`Error: ${error.message || "Could not retrieve historical rate."}`);
        }
    }
    
    function hideResults() {
        // ... (function remains the same)
    }

    function handleReset() {
        // ... (function remains the same)
    }

    // --- Initial Setup ---
    // The populateDropdowns function is no longer needed as the HTML has the list.
    // We will address removing it fully in the next step.
    setDateInputMax(); 
    hideResults(); 

    // --- Event Listeners ---
    if(calculateButton) calculateButton.addEventListener('click', handleCalculate);
    if(resetButton) resetButton.addEventListener('click', handleReset);
});
