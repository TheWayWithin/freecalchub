/*
 * FreecalcHub.com - Length Unit Converter
 * Version: 1.0
 * Date Created: May 26, 2025
 * Description: Handles live conversions for various length units.
 */

document.addEventListener('DOMContentLoaded', () => {
    const inputValue = document.getElementById('inputValue');
    const fromUnitSelect = document.getElementById('fromUnit');
    const toUnitSelect = document.getElementById('toUnit');
    const swapButton = document.getElementById('swapButton');
    const mainResultString = document.getElementById('mainResultString');
    const quickConversionTableUl = document.querySelector('#quickConversionTable ul'); 
    const errorMessagesDiv = document.getElementById('errorMessages');
    const resultsSection = document.getElementById('resultsSection');
     const resetButton = document.getElementById('resetButton');


    // Conversion factors relative to 1 Meter
    const conversionFactorsToMeter = {
        'km': 1000,
        'm': 1,
        'cm': 0.01,
        'mm': 0.001,
        'mi': 1609.34,
        'yd': 0.9144,
        'ft': 0.3048,
        'in': 0.0254
    };

    const unitLabels = {
        'km': 'Kilometers', 'm': 'Meters', 'cm': 'Centimeters', 'mm': 'Millimeters',
        'mi': 'Miles', 'yd': 'Yards', 'ft': 'Feet', 'in': 'Inches'
    };
    
    const allUnits = Object.keys(unitLabels);


    function clearErrors() {
        errorMessagesDiv.textContent = '';
        errorMessagesDiv.style.display = 'none';
        inputValue.classList.remove('input-error');
    }

    function displayError(message) {
        errorMessagesDiv.textContent = message;
        errorMessagesDiv.style.display = 'block';
        inputValue.classList.add('input-error');
        resultsSection.style.display = 'none';
    }

    function formatValue(value) {
        let formatted = parseFloat(value.toFixed(8)); 
        if (Math.abs(formatted) < 0.000001 && formatted !== 0) { 
             return formatted.toExponential(4);
        }
        return parseFloat(formatted.toFixed(6)).toString();
    }


    function convertAndDisplay() {
        clearErrors();
        const value = parseFloat(inputValue.value);
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;

        if (isNaN(value)) {
            if(inputValue.value.trim() !== "") { 
                 displayError("Please enter a valid number for Value.");
            } else {
                hideResults(); 
            }
            return;
        }
        
        if (!fromUnit || !toUnit) {
            displayError("Please select both 'From' and 'To' units.");
            return;
        }
        
        resultsSection.style.display = 'block';

        const valueInMeters = value * conversionFactorsToMeter[fromUnit];
        const resultValue = valueInMeters / conversionFactorsToMeter[toUnit];
        mainResultString.textContent = `${formatValue(value)} ${unitLabels[fromUnit]} = ${formatValue(resultValue)} ${unitLabels[toUnit]}`;

        if (!quickConversionTableUl) return; 
        quickConversionTableUl.innerHTML = ''; 

        allUnits.forEach(unit => {
            const convertedTableValue = valueInMeters / conversionFactorsToMeter[unit];
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${unitLabels[unit]}:</strong> <span>${formatValue(convertedTableValue)}</span>`;
            quickConversionTableUl.appendChild(listItem);
        });
    }
    
    function hideResults() {
        resultsSection.style.display = 'none';
        mainResultString.textContent = '--';
        if (quickConversionTableUl) quickConversionTableUl.innerHTML = '';
    }


    function swapUnits() {
        const tempUnit = fromUnitSelect.value;
        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = tempUnit;
        convertAndDisplay();
    }
    
    function handleReset() {
        inputValue.value = '';
        clearErrors();
        hideResults();
    }


    inputValue.addEventListener('input', convertAndDisplay);
    fromUnitSelect.addEventListener('change', convertAndDisplay);
    toUnitSelect.addEventListener('change', convertAndDisplay);
    swapButton.addEventListener('click', swapUnits);
    resetButton.addEventListener('click', handleReset);

    if (inputValue.value) {
        convertAndDisplay();
    } else {
         hideResults(); 
    }
});
