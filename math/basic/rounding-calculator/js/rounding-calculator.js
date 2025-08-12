/**
 * Rounding Calculator
 * Comprehensive calculator for rounding numbers using various methods
 */

class RoundingCalculator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.updatePrecisionFields();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('calculatorForm');
        this.numbersInput = document.getElementById('numbersInput');
        this.roundingMethodInputs = document.querySelectorAll('input[name="roundingMethod"]');
        this.decimalPlaces = document.getElementById('decimalPlaces');
        this.significantFigures = document.getElementById('significantFigures');
        this.nearestValue = document.getElementById('nearestValue');
        
        // Button elements
        this.calculateButton = document.getElementById('calculateButton');
        this.resetButton = document.getElementById('resetButton');
        this.copyButton = document.getElementById('copyButton');
        
        // Result elements
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.errorMessages = document.getElementById('errorMessages');
        
        // Precision fieldset groups
        this.decimalPlacesGroup = document.getElementById('decimalPlacesGroup');
        this.significantFiguresGroup = document.getElementById('significantFiguresGroup');
        this.nearestValueGroup = document.getElementById('nearestValueGroup');
        this.precisionFieldset = document.getElementById('precisionFieldset');
    }

    attachEventListeners() {
        // Calculate button
        this.calculateButton.addEventListener('click', () => this.calculate());
        
        // Reset button
        this.resetButton.addEventListener('click', () => this.reset());
        
        // Copy button
        this.copyButton.addEventListener('click', () => this.copyResults());
        
        // Rounding method change
        this.roundingMethodInputs.forEach(input => {
            input.addEventListener('change', () => this.updatePrecisionFields());
        });
        
        // Real-time validation
        this.numbersInput.addEventListener('input', () => this.validateInput());
        
        // Enter key support
        this.numbersInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculate();
            }
        });
    }

    updatePrecisionFields() {
        const selectedMethod = document.querySelector('input[name="roundingMethod"]:checked').value;
        
        // Hide all precision groups
        this.decimalPlacesGroup.style.display = 'none';
        this.significantFiguresGroup.style.display = 'none';
        this.nearestValueGroup.style.display = 'none';
        
        // Show relevant precision group and fieldset
        switch (selectedMethod) {
            case 'decimal':
                this.decimalPlacesGroup.style.display = 'block';
                this.precisionFieldset.style.display = 'block';
                break;
            case 'significant':
                this.significantFiguresGroup.style.display = 'block';
                this.precisionFieldset.style.display = 'block';
                break;
            case 'nearest':
                this.nearestValueGroup.style.display = 'block';
                this.precisionFieldset.style.display = 'block';
                break;
            case 'ceiling':
            case 'floor':
                this.precisionFieldset.style.display = 'none';
                break;
        }
    }

    validateInput() {
        this.clearErrors();
        const input = this.numbersInput.value.trim();
        
        if (!input) {
            return true; // Empty input is valid (will show error on calculate)
        }
        
        // Split by comma and validate each number
        const numbers = input.split(',');
        const invalidNumbers = [];
        
        for (let i = 0; i < numbers.length; i++) {
            const num = numbers[i].trim();
            if (num && !this.isValidNumber(num)) {
                invalidNumbers.push(num);
            }
        }
        
        if (invalidNumbers.length > 0) {
            this.showError(`Invalid number(s): ${invalidNumbers.join(', ')}`);
            return false;
        }
        
        return true;
    }

    isValidNumber(str) {
        // Check for valid number including scientific notation
        const num = parseFloat(str);
        return !isNaN(num) && isFinite(num);
    }

    calculate() {
        this.clearErrors();
        
        // Get input numbers
        const input = this.numbersInput.value.trim();
        if (!input) {
            this.showError('Please enter at least one number.');
            return;
        }
        
        // Parse numbers
        const numberStrings = input.split(',').map(s => s.trim()).filter(s => s);
        const numbers = [];
        
        for (const numStr of numberStrings) {
            if (!this.isValidNumber(numStr)) {
                this.showError(`"${numStr}" is not a valid number.`);
                return;
            }
            numbers.push(parseFloat(numStr));
        }
        
        if (numbers.length === 0) {
            this.showError('Please enter at least one valid number.');
            return;
        }
        
        // Get rounding method and precision
        const method = document.querySelector('input[name="roundingMethod"]:checked').value;
        let precision = null;
        
        switch (method) {
            case 'decimal':
                precision = parseInt(this.decimalPlaces.value);
                if (precision < 0 || precision > 10) {
                    this.showError('Decimal places must be between 0 and 10.');
                    return;
                }
                break;
            case 'significant':
                precision = parseInt(this.significantFigures.value);
                if (precision < 1 || precision > 15) {
                    this.showError('Significant figures must be between 1 and 15.');
                    return;
                }
                break;
            case 'nearest':
                precision = parseFloat(this.nearestValue.value);
                break;
        }
        
        // Perform rounding
        const results = numbers.map(num => this.roundNumber(num, method, precision));
        
        // Display results
        this.displayResults(numbers, results, method, precision);
    }

    roundNumber(number, method, precision) {
        switch (method) {
            case 'decimal':
                return this.roundToDecimals(number, precision);
            case 'significant':
                return this.roundToSignificantFigures(number, precision);
            case 'nearest':
                return this.roundToNearest(number, precision);
            case 'ceiling':
                return Math.ceil(number);
            case 'floor':
                return Math.floor(number);
            default:
                return number;
        }
    }

    roundToDecimals(number, places) {
        const factor = Math.pow(10, places);
        return Math.round((number + Number.EPSILON) * factor) / factor;
    }

    roundToSignificantFigures(number, figures) {
        if (number === 0) return 0;
        
        const sign = number < 0 ? -1 : 1;
        const abs = Math.abs(number);
        const power = Math.floor(Math.log10(abs));
        const magnitude = Math.pow(10, power);
        const shifted = abs / magnitude;
        const rounded = Math.round((shifted + Number.EPSILON) * Math.pow(10, figures - 1)) / Math.pow(10, figures - 1);
        
        return sign * rounded * magnitude;
    }

    roundToNearest(number, nearest) {
        const result = Math.round(number / nearest) * nearest;
        // Handle floating point precision issues
        const decimals = nearest.toString().split('.')[1]?.length || 0;
        return decimals > 0 ? Math.round(result * Math.pow(10, decimals)) / Math.pow(10, decimals) : result;
    }

    displayResults(originalNumbers, roundedNumbers, method, precision) {
        const resultsHtml = originalNumbers.map((original, index) => {
            const rounded = roundedNumbers[index];
            const explanation = this.getExplanation(original, rounded, method, precision);
            
            return `
                <div class="result-item card">
                    <h4>Result ${originalNumbers.length > 1 ? index + 1 : ''}</h4>
                    <div class="result-original">Original: <span class="number">${this.formatNumber(original)}</span></div>
                    <div class="result-rounded">Rounded: <span class="number highlight">${this.formatNumber(rounded)}</span></div>
                    <div class="result-explanation">${explanation}</div>
                </div>
            `;
        }).join('');
        
        this.resultsGrid.innerHTML = resultsHtml;
        this.resultsSection.style.display = 'block';
        this.copyButton.style.display = 'inline-block';
        
        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    getExplanation(original, rounded, method, precision) {
        switch (method) {
            case 'decimal':
                return `Rounded to ${precision} decimal place${precision !== 1 ? 's' : ''}`;
            case 'significant':
                return `Rounded to ${precision} significant figure${precision !== 1 ? 's' : ''}`;
            case 'nearest':
                return `Rounded to nearest ${precision}`;
            case 'ceiling':
                return 'Rounded up to next whole number';
            case 'floor':
                return 'Rounded down to current whole number';
            default:
                return 'Rounded using standard method';
        }
    }

    formatNumber(number) {
        // Handle very large or small numbers with scientific notation
        if (Math.abs(number) >= 1e15 || (Math.abs(number) < 1e-4 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // For regular numbers, format nicely
        if (Number.isInteger(number)) {
            return number.toLocaleString();
        } else {
            // Remove trailing zeros
            return parseFloat(number.toPrecision(12)).toString();
        }
    }

    copyResults() {
        const resultNumbers = Array.from(this.resultsGrid.querySelectorAll('.result-rounded .number.highlight'))
            .map(el => el.textContent.replace(/,/g, '')) // Remove thousand separators
            .join(', ');
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(resultNumbers).then(() => {
                this.showSuccess('Results copied to clipboard!');
                this.copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    this.copyButton.textContent = 'Copy Results';
                }, 2000);
            }).catch(() => {
                this.fallbackCopyToClipboard(resultNumbers);
            });
        } else {
            this.fallbackCopyToClipboard(resultNumbers);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showSuccess('Results copied to clipboard!');
            this.copyButton.textContent = 'Copied!';
            setTimeout(() => {
                this.copyButton.textContent = 'Copy Results';
            }, 2000);
        } catch (err) {
            this.showError('Unable to copy to clipboard. Please select and copy manually.');
        } finally {
            document.body.removeChild(textArea);
        }
    }

    reset() {
        this.form.reset();
        this.resultsSection.style.display = 'none';
        this.copyButton.style.display = 'none';
        this.clearErrors();
        this.updatePrecisionFields();
        this.numbersInput.focus();
    }

    showError(message) {
        this.errorMessages.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
        this.errorMessages.style.display = 'block';
        this.errorMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showSuccess(message) {
        this.errorMessages.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ${message}</div>`;
        this.errorMessages.style.display = 'block';
        setTimeout(() => {
            this.clearErrors();
        }, 3000);
    }

    clearErrors() {
        this.errorMessages.style.display = 'none';
        this.errorMessages.innerHTML = '';
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RoundingCalculator();
});

// Example usage and educational functions
class RoundingExamples {
    static getExample(method, precision) {
        const examples = {
            decimal: {
                0: { input: 123.456789, output: 123, explanation: "Rounded to whole number" },
                1: { input: 123.456789, output: 123.5, explanation: "Rounded to 1 decimal place" },
                2: { input: 123.456789, output: 123.46, explanation: "Rounded to 2 decimal places" },
                3: { input: 123.456789, output: 123.457, explanation: "Rounded to 3 decimal places" }
            },
            significant: {
                1: { input: 123456, output: 100000, explanation: "1 significant figure" },
                2: { input: 123456, output: 120000, explanation: "2 significant figures" },
                3: { input: 123456, output: 123000, explanation: "3 significant figures" },
                4: { input: 123456, output: 123500, explanation: "4 significant figures" }
            },
            nearest: {
                10: { input: 123, output: 120, explanation: "Rounded to nearest 10" },
                100: { input: 1234, output: 1200, explanation: "Rounded to nearest 100" },
                0.1: { input: 1.23, output: 1.2, explanation: "Rounded to nearest 0.1" },
                5: { input: 23, output: 25, explanation: "Rounded to nearest 5" }
            },
            ceiling: { input: 3.1, output: 4, explanation: "Always rounds up" },
            floor: { input: 3.9, output: 3, explanation: "Always rounds down" }
        };

        if (method === 'ceiling' || method === 'floor') {
            return examples[method];
        }

        return examples[method]?.[precision] || examples[method][Object.keys(examples[method])[0]];
    }
}