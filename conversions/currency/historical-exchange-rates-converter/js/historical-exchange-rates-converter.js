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
    const rateDateDisplay = document.getElementById('rateDateDisplay');
    const historicalRateDisplay = document.getElementById('historicalRateDisplay');
    const dataSourceInfo = document.getElementById('dataSourceInfo');
    const errorMessagesDiv = document.getElementById('errorMessages');

    // --- Configuration ---
    const API_BASE_URL = 'https://api.exchangerate.host/';
    const API_KEY = '4fb36e198869acdef04e81ffd0445433';
    const API_SOURCE_NAME = "exchangerate.host (Frankfurter)";

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
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const url = `${API_BASE_URL}${formattedDate}?access_key=${API_KEY}&base=${baseCurrency}&symbols=${toCurrency}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                let errorResponseMessage = `Failed to fetch from API (HTTP ${response.status})`;
                try {
                    const errorData = await response.json();
                    let apiErrorDetails = `service status ${response.status}`;
                    if (errorData && errorData.error) {
                        if (typeof errorData.error === 'object') {
                            if (errorData.error.info) {
                                apiErrorDetails = errorData.error.info;
                            } else if (errorData.error.type) {
                                apiErrorDetails = errorData.error.type.replace(/_/g, ' ');
                            }
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

            if (data.success === false) {
                let apiErrorDetails = 'Unknown API issue reported by provider.';
                if (data.error) {
                    console.log("FCH DEBUG: Raw API data.error object:", JSON.stringify(data.error));
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
                throw new Error(`API request not successful for ${formattedDate}. Message: ${apiErrorDetails}`);
            }
            if (!data.rates) {
                throw new Error(`'rates' object not found in API response for ${formattedDate} with base ${baseCurrency}.`);
            }
            if (data.rates[toCurrency] === undefined) {
                 throw new Error(`Rate not found for ${toCurrency} in API response for ${formattedDate} with base ${baseCurrency}.`);
            }
            
            return { rate: data.rates[toCurrency], date: data.date, source: API_SOURCE_NAME };

        } catch (error) { 
            console.error("Failed to fetch historical rate (raw error details):", error); 
            throw error; 
        }
    }

    function clearErrors() {
        if (!errorMessagesDiv) return;
        errorMessagesDiv.innerHTML = ''; 
        errorMessagesDiv.style.display = 'none';
        errorMessagesDiv.style.color = ''; 
        errorMessagesDiv.style.padding = '';
        errorMessagesDiv.style.border = '';
        errorMessagesDiv.style.height = '';
        errorMessagesDiv.style.opacity = '';
        [amountInput, fromCurrencySelect, toCurrencySelect, historicalDateInput].forEach(el => {
            if (el) el.classList.remove('input-error');
        });
    }

    function displayError(message) {
        if (!errorMessagesDiv) return;
        console.log("FCH DEBUG (Historical): displayError called with message:", message);
        errorMessagesDiv.innerHTML = `<p>${message}</p>`; 
        errorMessagesDiv.style.display = 'block';
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
    function formatRateValue(value, decimals = 6) { 
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
            const selectedDate = new Date(dateValue + "T00:00:00Z"); 
            const today = new Date();
            const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            if (selectedDate >= todayUTC) {
                errors.push("Please select a date in the past (yesterday or earlier).");
                if (historicalDateInput) historicalDateInput.classList.add('input-error');
            }
        }

        if (errors.length > 0) {
            displayError(errors.join('<br>')); 
            hideResults();
            return;
        }

        try {
            const data = await fetchHistoricalRate(dateValue, fromCurrency, fromCurrency, toCurrency);
            
            const convertedAmount = amount * data.rate;
            const displayDateObj = new Date(data.date + "T00:00:00Z"); 
            const displayDateFormatted = displayDateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

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
        if(historicalDateInput) {
            historicalDateInput.value = ""; 
            setDateInputMax(); 
        }
        clearErrors();
        hideResults();
    }

    // --- Event Listeners ---
    if(calculateButton) calculateButton.addEventListener('click', handleCalculate);
    if(resetButton) resetButton.addEventListener('click', handleReset);

    // --- Initial Setup ---
    populateDropdowns(); 
    setDateInputMax(); 
    hideResults(); 
});
