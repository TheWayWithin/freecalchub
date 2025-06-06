/*
    File: /conversions/currency/inflation-calculator/js/inflation-calculator.js
    Version: 1.0
    Author: Gemini AI
    Date: 2025-06-06
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- Data Source: Annual Average CPI-U ---
    // Source: U.S. Bureau of Labor Statistics (BLS)
    // https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator/consumer-price-index-1913-
    const cpiData = {
        "1913": 9.9, "1914": 10.0, "1915": 10.1, "1916": 10.9, "1917": 12.8, "1918": 15.0, "1919": 17.3,
        "1920": 20.0, "1921": 17.9, "1922": 16.8, "1923": 17.1, "1924": 17.1, "1925": 17.5, "1926": 17.7,
        "1927": 17.4, "1928": 17.2, "1929": 17.2, "1930": 16.7, "1931": 15.2, "1932": 13.6, "1933": 12.9,
        "1934": 13.4, "1935": 13.7, "1936": 13.9, "1937": 14.4, "1938": 14.1, "1939": 13.9, "1940": 14.0,
        "1941": 14.7, "1942": 16.3, "1943": 17.3, "1944": 17.6, "1945": 18.0, "1946": 19.5, "1947": 22.3,
        "1948": 24.0, "1949": 23.8, "1950": 24.1, "1951": 26.0, "1952": 26.6, "1953": 26.8, "1954": 26.9,
        "1955": 26.8, "1956": 27.2, "1957": 28.1, "1958": 28.9, "1959": 29.2, "1960": 29.6, "1961": 29.9,
        "1962": 30.3, "1963": 30.6, "1964": 31.0, "1965": 31.5, "1966": 32.5, "1967": 33.4, "1968": 34.8,
        "1969": 36.7, "1970": 38.8, "1971": 40.5, "1972": 41.8, "1973": 44.4, "1974": 49.3, "1975": 53.8,
        "1976": 56.9, "1977": 60.6, "1978": 65.2, "1979": 72.6, "1980": 82.4, "1981": 90.9, "1982": 96.5,
        "1983": 99.6, "1984": 103.9, "1985": 107.6, "1986": 109.6, "1987": 113.6, "1988": 118.3, "1989": 124.0,
        "1990": 130.7, "1991": 136.2, "1992": 140.3, "1993": 144.5, "1994": 148.2, "1995": 152.4, "1996": 156.9,
        "1997": 160.5, "1998": 163.0, "1999": 166.6, "2000": 172.2, "2001": 177.1, "2002": 179.9, "2003": 184.0,
        "2004": 188.9, "2005": 195.3, "2006": 201.6, "2007": 207.3, "2008": 215.3, "2009": 214.5, "2010": 218.1,
        "2011": 224.9, "2012": 229.6, "2013": 233.0, "2014": 236.7, "2015": 237.0, "2016": 240.0, "2017": 245.1,
        "2018": 251.1, "2019": 255.7, "2020": 258.8, "2021": 271.0, "2022": 292.7, "2023": 304.7
    };

    // --- DOM Element Selectors ---
    const initialAmountInput = document.getElementById('initialAmount');
    const startYearSelect = document.getElementById('startYear');
    const endYearSelect = document.getElementById('endYear');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsSection = document.getElementById('resultsSection');
    const errorMessagesDiv = document.getElementById('errorMessages');

    // Result display elements
    const initialAmountDisplay = document.getElementById('initialAmountDisplay');
    const startYearDisplay = document.getElementById('startYearDisplay');
    const adjustedAmountDisplay = document.getElementById('adjustedAmountDisplay');
    const endYearDisplay = document.getElementById('endYearDisplay');
    const totalInflationRate = document.getElementById('totalInflationRate');
    const avgAnnualInflationRate = document.getElementById('avgAnnualInflationRate');

    // --- Initialization ---
    function init() {
        populateYears();
        setupEventListeners();
    }

    function populateYears() {
        const years = Object.keys(cpiData).sort((a, b) => b - a); // Sort descending
        years.forEach(year => {
            const startOption = new Option(year, year);
            const endOption = new Option(year, year);
            startYearSelect.add(startOption);
            endYearSelect.add(endOption);
        });

        // Set default values
        endYearSelect.value = years[0]; // Most recent year
        startYearSelect.value = "1980"; // A common historical year
    }

    function setupEventListeners() {
        calculateButton.addEventListener('click', handleCalculation);
        resetButton.addEventListener('click', handleReset);
    }

    // --- Event Handlers ---
    function handleCalculation() {
        clearError();

        const initialAmount = parseFloat(initialAmountInput.value);
        const startYear = startYearSelect.value;
        const endYear = endYearSelect.value;

        // Input validation
        if (isNaN(initialAmount) || initialAmount <= 0) {
            displayError('Please enter a valid, positive initial amount.');
            return;
        }

        const startCPI = cpiData[startYear];
        const endCPI = cpiData[endYear];

        // Perform calculations based on formulas in the spec
        const adjustedAmount = initialAmount * (endCPI / startCPI);
        const totalInflation = ((endCPI / startCPI) - 1) * 100;
        
        let avgAnnualInflation;
        if (startYear === endYear) {
            avgAnnualInflation = 0;
        } else {
            const yearsDiff = endYear - startYear;
            avgAnnualInflation = (Math.pow(endCPI / startCPI, 1 / yearsDiff) - 1) * 100;
        }
        
        updateResults({
            initialAmount,
            startYear,
            endYear,
            adjustedAmount,
            totalInflation,
            avgAnnualInflation
        });
    }

    function handleReset() {
        clearError();
        resultsSection.style.display = 'none';
        initialAmountInput.value = '';
        const years = Object.keys(cpiData).sort((a, b) => b - a);
        endYearSelect.value = years[0];
        startYearSelect.value = "1980";
    }

    // --- DOM Manipulation ---
    function updateResults(data) {
        initialAmountDisplay.textContent = data.initialAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '');
        startYearDisplay.textContent = data.startYear;
        adjustedAmountDisplay.textContent = data.adjustedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        endYearDisplay.textContent = data.endYear;
        totalInflationRate.textContent = `${data.totalInflation.toFixed(2)}%`;
        avgAnnualInflationRate.textContent = `${data.avgAnnualInflation.toFixed(2)}%`;

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
