/*
    File: /conversions/currency/cryptocurrency-converter/js/cryptocurrency-converter.js
    Version: 1.1
    Author: Jamie Watters
    Date: 2025-06-06
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selectors ---
    const amountInput = document.getElementById('amountInput');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const swapButton = document.getElementById('swapButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');
    
    // Result display elements
    const fromAmountDisplay = document.getElementById('fromAmountDisplay');
    const fromCurrencyDisplay = document.getElementById('fromCurrencyDisplay');
    const toAmountDisplay = document.getElementById('toAmountDisplay');
    const toCurrencyDisplay = document.getElementById('toCurrencyDisplay');
    const rateDisplay = document.getElementById('rateDisplay');
    const rateTimestamp = document.getElementById('rateTimestamp');

    // --- API Configuration ---
    const API_KEY = 'CG-5hUmSSJvAWVYZ2EMTdNdY8jg';
    const API_ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price';

    // --- Currency Definitions ---
    // Mapping display symbols to CoinGecko API IDs
    const currencies = [
        { id: 'bitcoin', symbol: 'BTC', type: 'crypto', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'ETH', type: 'crypto', name: 'Ethereum' },
        { id: 'litecoin', symbol: 'LTC', type: 'crypto', name: 'Litecoin' },
        { id: 'ripple', symbol: 'XRP', type: 'crypto', name: 'XRP' },
        { id: 'cardano', symbol: 'ADA', type: 'crypto', name: 'Cardano' },
        { id: 'solana', symbol: 'SOL', type: 'crypto', name: 'Solana' },
        { id: 'dogecoin', symbol: 'DOGE', type: 'crypto', name: 'Dogecoin' },
        { id: 'usd', symbol: 'USD', type: 'fiat', name: 'United States Dollar' },
        { id: 'eur', symbol: 'EUR', type: 'fiat', name: 'Euro' },
        { id: 'gbp', symbol: 'GBP', type: 'fiat', name: 'British Pound' },
        { id: 'jpy', symbol: 'JPY', type: 'fiat', name: 'Japanese Yen' },
        { id: 'cad', symbol: 'CAD', type: 'fiat', name: 'Canadian Dollar' },
        { id: 'aud', symbol: 'AUD', type: 'fiat', name: 'Australian Dollar' },
    ];

    // --- Initialization ---
    function init() {
        populateCurrencies();
        setupEventListeners();
    }

    function populateCurrencies() {
        const cryptoCurrencies = currencies.filter(c => c.type === 'crypto');
        const fiatCurrencies = currencies.filter(c => c.type === 'fiat');

        const createOptionGroup = (label, currencyList) => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = label;
            currencyList.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency.id;
                option.textContent = `${currency.name} (${currency.symbol})`;
                optgroup.appendChild(option);
            });
            return optgroup;
        };
        
        const cryptoGroup = createOptionGroup('Cryptocurrencies', cryptoCurrencies);
        const fiatGroup = createOptionGroup('Fiat Currencies', fiatCurrencies);
        
        fromCurrencySelect.appendChild(cryptoGroup);
        fromCurrencySelect.appendChild(fiatGroup);

        // Clone for the 'to' select element
        toCurrencySelect.innerHTML = fromCurrencySelect.innerHTML;

        // Set default values
        fromCurrencySelect.value = 'bitcoin';
        toCurrencySelect.value = 'usd';
    }

    function setupEventListeners() {
        amountInput.addEventListener('input', performConversion);
        fromCurrencySelect.addEventListener('change', performConversion);
        toCurrencySelect.addEventListener('change', performConversion);
        swapButton.addEventListener('click', handleSwap);
        resetButton.addEventListener('click', handleReset);
    }

    // --- Event Handlers ---
    function handleSwap() {
        const fromValue = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = fromValue;
        performConversion();
    }

    function handleReset() {
        amountInput.value = '';
        fromCurrencySelect.value = 'bitcoin';
        toCurrencySelect.value = 'usd';
        resultsSection.style.display = 'none';
        clearError();
    }

    // --- Core Logic ---
    async function performConversion() {
        clearError();
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            resultsSection.style.display = 'none';
            if (amountInput.value !== '') { // Only show error if user typed something invalid
                 displayError('Please enter a valid, positive amount.');
            }
            return;
        }

        const fromCurrency = currencies.find(c => c.id === fromCurrencySelect.value);
        const toCurrency = currencies.find(c => c.id === toCurrencySelect.value);

        if (!fromCurrency || !toCurrency) {
            displayError('Invalid currency selection.');
            return;
        }

        try {
            const rates = await fetchRates(fromCurrency, toCurrency);
            const conversionRate = calculateRate(rates, fromCurrency, toCurrency);

            if (conversionRate === null) {
                displayError('Could not determine conversion rate. The API may not support this currency pair directly.');
                return;
            }

            const convertedAmount = amount * conversionRate;
            updateDOM(amount, convertedAmount, conversionRate, fromCurrency, toCurrency);

        } catch (error) {
            console.error('Conversion API Error:', error);
            displayError('Could not fetch exchange rates. Please try again later.');
        }
    }

    async function fetchRates(from, to) {
        const cryptoIds = new Set();
        const fiatIds = new Set();

        if (from.type === 'crypto') cryptoIds.add(from.id);
        if (to.type === 'crypto') cryptoIds.add(to.id);
        
        // Always fetch against USD as a bridge for crypto-crypto or fiat-fiat
        if(from.type !== to.type || (from.type === 'crypto' && to.type === 'crypto')){
            fiatIds.add('usd');
        }
        if (from.type === 'fiat') fiatIds.add(from.id);
        if (to.type === 'fiat') fiatIds.add(to.id);

        if (cryptoIds.size === 0) { // For fiat-to-fiat, use a major crypto as a bridge
            cryptoIds.add('bitcoin');
        }

       // ...
        const url = `${API_ENDPOINT}?ids=${[...cryptoIds].join(',')}&vs_currencies=${[...fiatIds].join(',')}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-cg-demo-api-key': API_KEY
            }
        });
        // ...
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    }

    function calculateRate(rates, from, to) {
        // Case 1: Crypto to Fiat
        if (from.type === 'crypto' && to.type === 'fiat') {
            return rates[from.id]?.[to.id] || null;
        }
        // Case 2: Fiat to Crypto
        if (from.type === 'fiat' && to.type === 'crypto') {
            const rate = rates[to.id]?.[from.id];
            return rate ? 1 / rate : null;
        }
        // Case 3: Crypto to Crypto
        if (from.type === 'crypto' && to.type === 'crypto') {
            const fromRateUSD = rates[from.id]?.usd;
            const toRateUSD = rates[to.id]?.usd;
            return (fromRateUSD && toRateUSD) ? fromRateUSD / toRateUSD : null;
        }
        // Case 4: Fiat to Fiat
        if (from.type === 'fiat' && to.type === 'fiat') {
            const bridgeCrypto = Object.keys(rates)[0]; // e.g., 'bitcoin'
            const fromRate = rates[bridgeCrypto]?.[from.id];
            const toRate = rates[bridgeCrypto]?.[to.id];
            return (fromRate && toRate) ? toRate / fromRate : null;
        }
        return null; // Should not be reached
    }

    // --- DOM Manipulation ---
    function updateDOM(amount, convertedAmount, rate, from, to) {
        fromAmountDisplay.textContent = new Intl.NumberFormat().format(amount);
        fromCurrencyDisplay.textContent = from.symbol;
        toAmountDisplay.textContent = new Intl.NumberFormat('en-US', { maximumFractionDigits: from.type === 'crypto' ? 8 : 2 }).format(convertedAmount);
        toCurrencyDisplay.textContent = to.symbol;

        const displayRate = new Intl.NumberFormat('en-US', { maximumFractionDigits: 8 }).format(rate);
        rateDisplay.textContent = `1 ${from.symbol} = ${displayRate} ${to.symbol}`;
        
        rateTimestamp.textContent = `Rates last updated: ${new Date().toLocaleString()}`;

        resultsSection.style.display = 'block';
    }

    function displayError(message) {
        resultsSection.style.display = 'none';
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = 'block';
    }

    function clearError() {
        errorMessagesDiv.textContent = '';
        errorMessagesDiv.style.display = 'none';
    }

    // --- Start the application ---
    init();
});
